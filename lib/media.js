// Embedded pictures — an orchestration module (sibling to scene.js), NOT a
// primitive. An SVG shown as <img> cannot fetch an image, but it can carry one
// as a data URI. Two patterns cover almost every need: a film strip stepped
// frame by frame, and stills that cross-fade. Both schedule themselves on a
// timeline (lib/timeline.js). See docs/product-cards.md for byte budgets.

const fs = require('fs');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

/** A data URI for a file on disk or a Buffer. */
function dataUri(source, mime) {
  const buf = Buffer.isBuffer(source) ? source : fs.readFileSync(source);
  const type = mime || MIME[String(source).slice(String(source).lastIndexOf('.')).toLowerCase()];
  if (!type) throw new Error('media: pass a mime type for a Buffer or an unknown extension');
  return `data:${type};base64,${buf.toString('base64')}`;
}

/**
 * Frames stacked in a column and stepped through. `frames` are hrefs (data
 * URIs). Plays from `start` for `seconds`, rests on the LAST frame, and that
 * frame is the still frame.
 * @returns {{ defs: string, body: string }}
 */
function filmStrip({ id, frames, x, y, width, height, rx = 0, start = 0, seconds, timeline }) {
  if (!frames || frames.length < 2) throw new Error('media.filmStrip: pass at least two frames');
  const travel = (frames.length - 1) * height;
  const cls = timeline.keyframes(
    (p) => `0%,${p(start)}{transform:translateY(0);animation-timing-function:steps(${frames.length - 1},end)}${p(start + seconds)},100%{transform:translateY(-${travel}px)}`,
    { name: `${id}-film`, base: `transform:translateY(-${travel}px);` },
  );
  const images = frames.map((href, i) => `<image y="${i * height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" href="${href}"/>`).join('');
  return {
    defs: `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}"/></clipPath>`,
    body: `<g clip-path="url(#${id})"><g transform="translate(${x} ${y})"><g class="${cls}">${images}</g></g></g>`,
  };
}

/**
 * Stills in one frame, each fading in over the last at its time. `at[i]` is
 * when still i+1 arrives (still 0 is there from the start). The last still is
 * the still frame.
 * @returns {{ defs: string, body: string }}
 */
function crossfade({ id, stills, at, x, y, width, height, rx = 0, fade = 0.45, timeline }) {
  if (!stills || stills.length < 2) throw new Error('media.crossfade: pass at least two stills');
  if (!at || at.length !== stills.length - 1) throw new Error('media.crossfade: `at` needs one time per still after the first');
  const img = (href, extra = '') => `<image${extra} x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" href="${href}"/>`;
  const layers = stills.map((href, i) => (i === 0 ? img(href) : img(href, ` ${timeline.on(at[i - 1], { fade, name: `${id}-s${i}` }).attrs}`))).join('');
  return {
    defs: `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}"/></clipPath>`,
    body: `<g clip-path="url(#${id})">${layers}</g>`,
  };
}

module.exports = { dataUri, filmStrip, crossfade };

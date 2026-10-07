// film-strip — the smallest demonstration of moving pictures inside an SVG:
// frames stacked in a column and stepped through with steps(), then two stills
// that cross-fade. Real use passes JPEG data URIs cut from a film (see
// scripts/film-stills.mjs); here the frames are tiny generated SVG images, so
// the preset stays deterministic and a few kilobytes.

const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const { composeSVG } = require('../composer');
const { composeScene, layer } = require('../scene');
const { getPalette } = require('../palettes');
const { createTimeline } = require('../timeline');
const { dataUri, filmStrip, crossfade } = require('../media');

const W = 360;
const H = 200;
const FRAMES = 12;

function frame(pal, i, total, accent) {
  const x = 8 + (i / (total - 1)) * 96;
  return dataUri(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><rect width="120" height="150" fill="${pal.bgAlt}"/>` +
    `<rect x="${x.toFixed(1)}" y="${(96 - Math.abs(Math.sin((i / (total - 1)) * Math.PI * 2)) * 60).toFixed(1)}" width="16" height="16" fill="${accent}"/>` +
    `<rect x="8" y="128" width="104" height="4" fill="${pal.line}" fill-opacity=".15"/><rect x="8" y="128" width="${(((i + 1) / total) * 104).toFixed(1)}" height="4" fill="${accent}"/></svg>`,
  ), 'image/svg+xml');
}

module.exports = {
  name: 'film-strip',
  category: 'media',
  viewBox: `0 0 ${W} ${H}`,
  width: W,
  height: H,
  compose(opts = {}) {
    motion.resetIdCounter();
    const pal = getPalette(opts.palette || 'caldera');
    const tl = createTimeline({ duration: 6 });

    const strip = filmStrip({
      id: 'fs-strip', x: 30, y: 25, width: 120, height: 150, rx: 10,
      frames: Array.from({ length: FRAMES }, (_, i) => frame(pal, i, FRAMES, pal.accents[0])),
      start: 0.4, seconds: 3, timeline: tl,
    });
    const stills = crossfade({
      id: 'fs-still', x: 210, y: 25, width: 120, height: 150, rx: 10,
      stills: [frame(pal, 0, FRAMES, pal.accents[1]), frame(pal, FRAMES - 1, FRAMES, pal.accents[1])],
      at: [3.6], timeline: tl,
    });
    const border = (x) => shapes.createPanel({ x, y: 25, w: 120, h: 150, rx: 10, stroke: pal.line, strokeWidth: 1 }).replace('/>', ' stroke-opacity=".25"/>');

    const scene = composeScene({
      layers: [
        layer(`<rect width="${W}" height="${H}" fill="${pal.bg}"/>`),
        layer(strip.body), layer(border(30)),
        layer(stills.body), layer(border(210)),
      ],
      defs: `${strip.defs}\n${stills.defs}`,
      style: tl.css(),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Film strip and cross-fade',
      desc: 'Two framed pictures. The left one steps through twelve embedded frames like a film strip; the right one cross-fades from its first still to its last.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

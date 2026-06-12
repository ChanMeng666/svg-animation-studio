// Decor primitives — composite background / decoration recipes promoted from the
// chan-cover preset. UNLIKE shapes.*, each returns { defs, body }: a <defs> fragment
// (pattern / gradient / clipPath) plus the body element that references it. Pair with
// composeScene via layer(body, { defs }).

/** Low-opacity dotted <pattern> filled over a rect — chan-cover's dot-grid backdrop. Returns { defs, body }. */
function createDotGridBackground(opts = {}) {
  const { id = 'dotgrid', x = 0, y = 0, width, height, gap = 26, dotR = 1.6, color = '#000', opacity = 0.06 } = opts;
  const defs = `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse">
  <circle cx="2" cy="2" r="${dotR}" fill="${color}" fill-opacity="${opacity}"/>
</pattern>`;
  const body = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="url(#${id})"/>`;
  return { defs, body };
}

/** Full-canvas gradient fill. Returns { defs, body }. kind 'linear'|'radial'. Optional
 *  `animate` (true or { dur }) adds a SMIL gradient sweep — runs in <img> mode, but SMIL
 *  ignores prefers-reduced-motion, so use only where subtle continuous motion is acceptable. */
function createGradientWash(opts = {}) {
  const {
    id = 'wash', kind = 'linear', stops, from = '#000', to = '#fff', angle = 0,
    x = 0, y = 0, width, height, applyClass, animate = false
  } = opts;
  const stopList = stops || [{ offset: 0, color: from }, { offset: 1, color: to }];
  const stopEls = stopList.map(s =>
    `<stop offset="${s.offset}" stop-color="${s.color}"${s.opacity != null ? ` stop-opacity="${s.opacity}"` : ''}/>`).join('');
  let grad;
  if (kind === 'radial') {
    grad = `<radialGradient id="${id}">${stopEls}</radialGradient>`;
  } else {
    const rad = (angle % 360) * Math.PI / 180;
    const x1 = (0.5 - Math.cos(rad) / 2).toFixed(4);
    const y1 = (0.5 - Math.sin(rad) / 2).toFixed(4);
    const x2 = (0.5 + Math.cos(rad) / 2).toFixed(4);
    const y2 = (0.5 + Math.sin(rad) / 2).toFixed(4);
    let anim = '';
    if (animate) {
      const dur = (animate && animate.dur) ? animate.dur : '6s';
      anim = `
  <animate attributeName="x1" values="-0.5;0.5;1;0.5;-0.5" dur="${dur}" repeatCount="indefinite"/>
  <animate attributeName="x2" values="0.5;1.5;2;1.5;0.5" dur="${dur}" repeatCount="indefinite"/>`;
    }
    grad = `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopEls}${anim}</linearGradient>`;
  }
  const clsAttr = applyClass ? ` class="${applyClass}"` : '';
  const body = `<rect${clsAttr} x="${x}" y="${y}" width="${width}" height="${height}" fill="url(#${id})"/>`;
  return { defs: grad, body };
}

/** Clip-path of an outlined-text/shape path + a soft swept gradient rect, together —
 *  chan-cover's text "gleam". Returns { defs, body }. Pass `pathD` for an outlined-text/
 *  shape clip, OR `clipContent` to clip to arbitrary markup (e.g. a duplicate <text> for
 *  system-font gleams). Pair the inner rect with a sweep motion class (sweepClassName) to
 *  make the gleam travel across the letters. */
function createTextGleamClip(opts = {}) {
  const {
    id = 'gleam', pathD, clipContent, transform = '',
    gleamColor = '#FFFFFF', gleamOpacity = 0.5,
    rectX = -170, rectY = 150, rectW = 64, rectH = 210, angle = 16, rotateCenter,
    sweepClassName
  } = opts;
  const clipId = `${id}-clip`;
  const gradId = `${id}-grad`;
  const transformAttr = transform ? ` transform="${transform}"` : '';
  const clipInner = clipContent != null ? clipContent : `<path d="${pathD}"${transformAttr}/>`;
  const defs = `<linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${gleamColor}" stop-opacity="0"/>
  <stop offset="0.5" stop-color="${gleamColor}" stop-opacity="${gleamOpacity}"/>
  <stop offset="1" stop-color="${gleamColor}" stop-opacity="0"/>
</linearGradient>
<clipPath id="${clipId}">${clipInner}</clipPath>`;
  const rc = rotateCenter || `${rectX + rectW / 2} ${rectY + rectH / 2}`;
  const clsAttr = sweepClassName ? ` class="${sweepClassName}"` : '';
  const body = `<g clip-path="url(#${clipId})"><g${clsAttr}><rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" fill="url(#${gradId})" transform="rotate(${angle} ${rc})"/></g></g>`;
  return { defs, body };
}

module.exports = { createDotGridBackground, createGradientWash, createTextGleamClip };

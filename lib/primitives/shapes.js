// Shape primitives — return raw SVG element strings.
// Most accept an `applyClass` or `applyClasses` opt so callers can bind motion classes.

function _cls(c) { return c ? ` class="${c}"` : ''; }

function createGroundShadow(opts = {}) {
  const { cx, cy, rx, ry, color = '#000', applyClass } = opts;
  return `<ellipse${_cls(applyClass)} cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}"/>`;
}

function createPixelCharacter(opts = {}) {
  const {
    color = '#E07C4C',
    eyeColor = '#000000',
    earWidth = 8, earHeight = 14,
    armY = 36, armHeight = 8,
    mouth,
    applyClasses = {}
  } = opts;

  const ac = applyClasses;
  const mouthEl = mouth
    ? `\n    <rect${_cls(ac.mouth)} x="${mouth.x}" y="${mouth.y}" width="${mouth.w}" height="${mouth.h}" fill="${eyeColor}"/>`
    : '';

  return `<g${_cls(ac.body)}>
    <rect${_cls(ac.leftEar)} x="22" y="10" width="${earWidth}" height="${earHeight}" fill="${color}"/>
    <rect${_cls(ac.rightEar)} x="70" y="10" width="${earWidth}" height="${earHeight}" fill="${color}"/>
    <rect x="18" y="24" width="64" height="4" fill="${color}"/>
    <rect x="14" y="28" width="72" height="32" fill="${color}"/>
    <rect x="30" y="34" width="8" height="10" fill="${eyeColor}"/>
    <rect x="62" y="34" width="8" height="10" fill="${eyeColor}"/>${mouthEl}
    <rect${_cls(ac.leftArm)} x="2" y="${armY}" width="12" height="${armHeight}" fill="${color}"/>
    <rect${_cls(ac.rightArm)} x="86" y="${armY}" width="12" height="${armHeight}" fill="${color}"/>
    <rect x="24" y="60" width="12" height="14" fill="${color}"/>
    <rect x="64" y="60" width="12" height="14" fill="${color}"/>
  </g>`;
}

function createCloudClipPath(opts = {}) {
  const {
    id,
    circles = [
      { cx: 128, cy:  68, r: 56 },
      { cx: 192, cy: 100, r: 54 },
      { cx: 188, cy: 168, r: 54 },
      { cx: 128, cy: 192, r: 54 },
      { cx:  68, cy: 168, r: 54 },
      { cx:  64, cy: 100, r: 54 },
      { cx: 128, cy: 130, r: 60 }
    ]
  } = opts;
  const items = circles.map(c => `      <circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"/>`).join('\n');
  return `<clipPath id="${id}">
${items}
    </clipPath>`;
}

function createGradientStops(opts = {}) {
  const { stops } = opts;
  return stops.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"${s.opacity != null ? ` stop-opacity="${s.opacity}"` : ''}/>`).join('');
}

function createLinearGradient(opts = {}) {
  const { id, x1='0', y1='0', x2='1', y2='0', stops } = opts;
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      ${createGradientStops({ stops })}
    </linearGradient>`;
}

function createRadialGradient(opts = {}) {
  const { id, cx='50%', cy='50%', r='50%', stops } = opts;
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">
      ${createGradientStops({ stops })}
    </radialGradient>`;
}

function createMusicalNote(opts = {}) {
  const {
    kind = 'eighth',
    x = 0, y = 0,
    color = '#E07C4C',
    applyClass
  } = opts;

  if (kind === 'eighth') {
    return `<g${_cls(applyClass)}>
    <ellipse cx="${x+8}" cy="${y+18}" rx="4" ry="3" fill="${color}" transform="rotate(-20, ${x+8}, ${y+18})"/>
    <rect x="${x+11}" y="${y+2}" width="2" height="16" fill="${color}"/>
    <path d="M ${x+13} ${y+2} Q ${x+18} ${y+4}, ${x+18} ${y+8} Q ${x+18} ${y+12}, ${x+13} ${y+10}" fill="${color}"/>
  </g>`;
  }
  if (kind === 'quarter') {
    return `<g${_cls(applyClass)}>
    <ellipse cx="${x+8}" cy="${y+16}" rx="4" ry="3" fill="${color}" transform="rotate(-20, ${x+8}, ${y+16})"/>
    <rect x="${x+11}" y="${y}" width="2" height="16" fill="${color}"/>
  </g>`;
  }
  if (kind === 'double') {
    return `<g${_cls(applyClass)}>
    <ellipse cx="${x+5}" cy="${y+16}" rx="3" ry="2.5" fill="${color}" transform="rotate(-20, ${x+5}, ${y+16})"/>
    <ellipse cx="${x+15}" cy="${y+14}" rx="3" ry="2.5" fill="${color}" transform="rotate(-20, ${x+15}, ${y+14})"/>
    <rect x="${x+7}" y="${y}" width="2" height="16" fill="${color}"/>
    <rect x="${x+17}" y="${y-2}" width="2" height="16" fill="${color}"/>
    <rect x="${x+7}" y="${y}" width="12" height="2" fill="${color}"/>
  </g>`;
  }
  throw new Error(`Unknown note kind: ${kind}`);
}

function createSoundWaveArc(opts = {}) {
  const {
    startX, startY, endY, controlX, controlY,
    color = '#E07C4C', strokeWidth = 3,
    applyClass
  } = opts;
  return `<g${_cls(applyClass)}>
    <path d="M ${startX} ${startY} Q ${controlX} ${controlY}, ${controlX} ${(startY+endY)/2} Q ${controlX} ${endY}, ${startX} ${endY}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  </g>`;
}

function createSoundWaveArcRaw(opts = {}) {
  // For when caller wants to provide an exact path d. Used for parity with the seed SVGs.
  const { d, color = '#E07C4C', strokeWidth = 3, applyClass, filter } = opts;
  const filterAttr = filter ? ` filter="${filter}"` : '';
  return `<path${_cls(applyClass)} d="${d}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"${filterAttr}/>`;
}

function createCharacterMouth(opts = {}) {
  const { x, y, w, h, color = '#000', applyClass } = opts;
  return `<rect${_cls(applyClass)} x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
}

function createCodexCharacter(opts = {}) {
  const {
    bodyGradId, cloudClipId, innerDepthId,
    armLGradId, armRGradId, limbGradId, eyeGradId,
    pose = 'jumping',
    mouth,
    applyClasses = {}
  } = opts;

  const ac = applyClasses;
  // Coordinates per source files; pose just shifts the cloud transform/eye position
  const cloudTranslate = pose === 'speaking' ? '12, 20' : '14, 16';
  const highlightY = pose === 'speaking' ? '30' : '26';
  const highlightInnerY = pose === 'speaking' ? '33' : '29';
  const chevronY1 = pose === 'speaking' ? 92 : 88;
  const chevronY2 = pose === 'speaking' ? 102 : 98;
  const chevronY3 = pose === 'speaking' ? 112 : 108;
  const underscoreY = chevronY3;
  const eyeY = pose === 'speaking' ? 62 : 58;
  const eyeLX = pose === 'speaking' ? 36 : 38;
  const eyeRX = pose === 'speaking' ? 70 : 72;
  const armY = pose === 'speaking' ? 76 : 72;
  const legY = pose === 'speaking' ? 132 : 128;

  const mouthEl = mouth
    ? `\n    <ellipse${_cls(ac.mouth)} cx="${mouth.cx}" cy="${mouth.cy}" rx="${mouth.rx}" ry="${mouth.ry}" fill="${mouth.fill || '#3B0764'}" opacity="${mouth.opacity || 0.8}"/>
    <ellipse cx="${mouth.cx}" cy="${mouth.cy - 1.5}" rx="${(mouth.rx ?? 5) - 3}" ry="1.5" fill="#6D28D9" opacity="0.3"/>`
    : '';

  return `<g${_cls(ac.body)}>
    <g transform="translate(${cloudTranslate}) scale(0.44)" filter="url(#${innerDepthId})">
      <rect x="0" y="0" width="256" height="256" fill="url(#${bodyGradId})" clip-path="url(#${cloudClipId})"/>
    </g>
    <rect x="${pose==='speaking'?22:24}" y="${highlightY}" width="22" height="12" fill="#C4B5FD" opacity="0.2" rx="3"/>
    <rect x="${pose==='speaking'?25:27}" y="${highlightInnerY}" width="12" height="6" fill="#DDD6FE" opacity="0.15" rx="2"/>
    <line x1="${pose==='speaking'?46:48}" y1="${chevronY1}" x2="${pose==='speaking'?55:57}" y2="${chevronY2}" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <line x1="${pose==='speaking'?55:57}" y1="${chevronY2}" x2="${pose==='speaking'?46:48}" y2="${chevronY3}" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <line x1="${pose==='speaking'?62:64}" y1="${underscoreY}" x2="${pose==='speaking'?80:82}" y2="${underscoreY}" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <rect x="${eyeLX}" y="${eyeY}" width="14" height="20" rx="4" fill="url(#${eyeGradId})" stroke="#4C1D95" stroke-width="2"/>
    <rect x="${eyeLX+2}" y="${eyeY+2}" width="4" height="4" fill="#fff" opacity="0.8" rx="1"/>
    <rect x="${eyeLX+8}" y="${eyeY+12}" width="2" height="2" fill="#fff" opacity="0.35" rx="0.5"/>
    <circle cx="${eyeLX+7}" cy="${eyeY+12}" r="3.5" fill="#4C1D95" opacity="0.7"/>
    <rect x="${eyeRX}" y="${eyeY}" width="14" height="20" rx="4" fill="url(#${eyeGradId})" stroke="#4C1D95" stroke-width="2"/>
    <rect x="${eyeRX+2}" y="${eyeY+2}" width="4" height="4" fill="#fff" opacity="0.8" rx="1"/>
    <rect x="${eyeRX+8}" y="${eyeY+12}" width="2" height="2" fill="#fff" opacity="0.35" rx="0.5"/>
    <circle cx="${eyeRX+7}" cy="${eyeY+12}" r="3.5" fill="#4C1D95" opacity="0.7"/>${mouthEl}
    <g${_cls(ac.leftArm)}>
      <rect x="${pose==='speaking'?4:6}" y="${armY}" width="20" height="10" rx="4" fill="url(#${armLGradId})"/>
      <rect x="${pose==='speaking'?6:8}" y="${armY+2}" width="7" height="3.5" fill="#A78BFA" opacity="0.25" rx="1"/>
    </g>
    <g${_cls(ac.rightArm)}>
      <rect x="${pose==='speaking'?110:112}" y="${armY}" width="20" height="10" rx="4" fill="url(#${armRGradId})"/>
      <rect x="${pose==='speaking'?112:114}" y="${armY+2}" width="7" height="3.5" fill="#A78BFA" opacity="0.25" rx="1"/>
    </g>
    <rect x="${pose==='speaking'?40:42}" y="${legY}" width="14" height="24" rx="4" fill="url(#${limbGradId})"/>
    <rect x="${pose==='speaking'?42:44}" y="${legY+2}" width="5" height="12" fill="#A78BFA" opacity="0.25" rx="1"/>
    <rect x="${pose==='speaking'?82:84}" y="${legY}" width="14" height="24" rx="4" fill="url(#${limbGradId})"/>
    <rect x="${pose==='speaking'?84:86}" y="${legY+2}" width="5" height="12" fill="#A78BFA" opacity="0.25" rx="1"/>
  </g>`;
}

/** A single brand pixel-square accent (the chan-cover drifting squares). */
function createAccentSquare(opts = {}) {
  const { x = 0, y = 0, size = 12, fill = '#000', applyClass } = opts;
  return `<rect${_cls(applyClass)} x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}"/>`;
}

/** Rounded-rect / pill badge container. */
function createBadgeShape(opts = {}) {
  const { x = 0, y = 0, w = 120, h = 40, rx = 8, fill = '#000', stroke, strokeWidth = 2, applyClass } = opts;
  const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : '';
  return `<rect${_cls(applyClass)} x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${strokeAttr}/>`;
}

/** N-point star / sparkle. `points` = number of star points; outerR/innerR set the spikiness. */
function createStar(opts = {}) {
  const { cx = 0, cy = 0, points = 5, outerR = 12, innerR = 5, fill = '#000', applyClass } = opts;
  const coords = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = -Math.PI / 2 + i * step;
    coords.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon${_cls(applyClass)} points="${coords.join(' ')}" fill="${fill}"/>`;
}

/** A 4-point sparkle "burst" (thin diamond-spike sparkle); `thickness` 0..1 sets waist width. */
function createBurst(opts = {}) {
  const { cx = 0, cy = 0, size = 12, thickness = 0.28, fill = '#fff', applyClass } = opts;
  const o = size, i = size * thickness;
  const pts = [
    `${cx},${cy - o}`, `${cx + i},${cy - i}`, `${cx + o},${cy}`, `${cx + i},${cy + i}`,
    `${cx},${cy + o}`, `${cx - i},${cy + i}`, `${cx - o},${cy}`, `${cx - i},${cy - i}`
  ];
  return `<polygon${_cls(applyClass)} points="${pts.join(' ')}" fill="${fill}"/>`;
}

/** Decorative card/panel — rounded rect with optional dashed stroke (the chan-cover card). */
function createPanel(opts = {}) {
  const {
    x = 0, y = 0, w = 100, h = 100, rx = 16, fill = 'none',
    stroke, strokeWidth = 2, dashed = false, dashArray = '2 7', applyClass
  } = opts;
  const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : '';
  const dashAttr = (stroke && dashed) ? ` stroke-dasharray="${dashArray}" stroke-linecap="round"` : '';
  return `<rect${_cls(applyClass)} x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${strokeAttr}${dashAttr}/>`;
}

module.exports = {
  createGroundShadow, createPixelCharacter,
  createCloudClipPath, createGradientStops,
  createLinearGradient, createRadialGradient,
  createMusicalNote, createSoundWaveArc, createSoundWaveArcRaw,
  createCharacterMouth, createCodexCharacter,
  createAccentSquare, createBadgeShape, createStar, createBurst, createPanel
};

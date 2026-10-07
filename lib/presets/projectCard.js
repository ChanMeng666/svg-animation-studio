// project-card — a 1300×360 README card: an identity panel on the left, and a
// stage on the right where the product does its job. This one is about the
// studio itself: five lines of a real preset are typed, the character they
// describe arrives and jumps, then a closing frame says what ships.
//
// It is the reference for the product-card recipe in docs/product-cards.md:
//   - text is shared glyph outlines (lib/text.js), so it survives <img>;
//   - everything is scheduled on one loop (lib/timeline.js);
//   - the closing frame is authored as the base state, so reduced motion
//     rests on a complete picture.
// Fork it, then replace the copy, the palette and the stage. Draw a real
// product in that product's own fonts and colours, not in these.

const path = require('path');
const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const { composeSVG } = require('../composer');
const { composeScene, layer } = require('../scene');
const { getPalette } = require('../palettes');
const { createGlyphSet } = require('../text');
const { createTimeline } = require('../timeline');

const FONT_DIR = path.join(__dirname, '..', '..', 'assets', 'fonts');
const FONTS = {
  display: path.join(FONT_DIR, 'Anton-Regular.ttf'),
  sans: path.join(FONT_DIR, 'DMSans-Medium.ttf'),
  mono: path.join(FONT_DIR, 'JetBrainsMono-Regular.ttf'),
};

const W = 1300;
const H = 360;
const PANEL = 500;

const CODE = [
  'const jump = motion.createJump()',
  'const shadow = motion.createShadowScale()',
  'const hero = shapes.createPixelCharacter({',
  '  applyClasses: { body: jump.className } })',
  'composeSVG({ viewBox, style, body })',
];
const SHIPS = [
  'CSS keyframes only. No script.',
  'Text is outlined glyphs. No font to load.',
  'Reduced motion rests on this frame.',
];

module.exports = {
  name: 'project-card',
  category: 'card',
  viewBox: `0 0 ${W} ${H}`,
  width: W,
  height: H,
  compose(opts = {}) {
    motion.resetIdCounter();
    const pal = getPalette(opts.palette || 'caldera');
    const copy = {
      eyebrow: 'OPEN SOURCE · SVG TOOLKIT',
      name: 'Animation Studio',
      headline: 'Describe it. Get a looping SVG.',
      sub: 'One file that plays inside a README.',
      chips: ['MIT', 'NO SCRIPT'],
      ...opts.copy,
    };
    const glyphs = createGlyphSet(FONTS);
    const SCENE_A = 7.4;
    const tl = createTimeline({ duration: 13 });

    // ── identity panel ───────────────────────────────────────────────────────
    const onPanel = pal.dark ? pal.bg : pal.bgAlt;
    const identity = [
      `<rect width="${PANEL}" height="${H}" fill="${pal.ink}"/>`,
      glyphs.text(copy.eyebrow, { font: 'mono', size: 12.5, x: 40, y: 52, fill: onPanel, tracking: 0.16, attrs: 'opacity=".62"' }),
      shapes.createAccentSquare({ x: 40, y: 92, size: 44, fill: pal.accents[0] }),
      glyphs.text(copy.name, { font: 'display', size: 52, x: 100, y: 134, fill: onPanel }),
      glyphs.text(copy.headline, { font: 'sans', size: 24, x: 40, y: 192, fill: onPanel }),
      glyphs.text(copy.sub, { font: 'sans', size: 16.5, x: 40, y: 224, fill: onPanel, attrs: 'opacity=".72"' }),
    ];
    let chipX = 40;
    for (const chip of copy.chips) {
      const w = glyphs.measure(chip, { font: 'mono', size: 12, tracking: 0.1 }) + 26;
      identity.push(shapes.createPanel({ x: chipX, y: 295.5, w, h: 30, rx: 15, stroke: onPanel, strokeWidth: 1.2 }).replace('/>', ' stroke-opacity=".4"/>'));
      identity.push(glyphs.text(chip, { font: 'mono', size: 12, x: chipX + 13, y: 315, fill: onPanel, tracking: 0.1 }));
      chipX += w + 10;
    }

    // ── scene A: the code is typed, the character it describes arrives ──────
    const E = { x: PANEL + 24, y: 28, w: 420, h: 304, head: 30 };
    const SIZE = 11;
    const adv = glyphs.measure('0', { font: 'mono', size: SIZE });
    const codeX = E.x + 20;
    const rows = CODE.map((line, i) => {
      const y = E.y + E.head + 34 + i * 26;
      const start = 0.5 + i * 0.75;
      const call = line.match(/[A-Za-z.]+(?=\()/);
      const text = call
        ? glyphs.text(line.slice(0, call.index), { font: 'mono', size: SIZE, x: codeX, y, fill: pal.ink }) +
          glyphs.text(call[0], { font: 'mono', size: SIZE, x: codeX + call.index * adv, y, fill: pal.accents[1] }) +
          glyphs.text(line.slice(call.index + call[0].length), { font: 'mono', size: SIZE, x: codeX + (call.index + call[0].length) * adv, y, fill: pal.ink })
        : glyphs.text(line, { font: 'mono', size: SIZE, x: codeX, y, fill: pal.ink });
      const cover = tl.cover({ start, chars: line.length, width: E.w, cps: 44 });
      return `${text}<rect class="${cover}" x="${codeX - 1}" y="${y - 14}" width="${E.w}" height="20" fill="${pal.bgAlt}"/>`;
    });

    const jump = motion.createJump({ duration: '0.62s' });
    const shadow = motion.createShadowScale({ duration: '0.62s' });
    const hero = `${shapes.createGroundShadow({ cx: 50, cy: 82, rx: 22, ry: 5, applyClass: shadow.className })}${shapes.createPixelCharacter({ color: pal.accents[0], applyClasses: { body: jump.className } })}`;
    const sceneA = [
      shapes.createPanel({ x: E.x, y: E.y, w: E.w, h: E.h, rx: 12, fill: pal.bgAlt, stroke: pal.line, strokeWidth: 1 }).replace('/>', ' stroke-opacity=".18"/>'),
      shapes.createAccentSquare({ x: E.x + 14, y: E.y + 11, size: 8, fill: pal.accents[1] }),
      glyphs.text('preset.js', { font: 'mono', size: 11, x: E.x + 30, y: E.y + 19.5, fill: pal.muted }),
      `<g clip-path="url(#pc-editor)">${rows.join('')}</g>`,
      // the character lands once the line that builds it has been typed
      `<g ${tl.on(0.5 + 3.4 * 0.75, { fade: 0.35 }).attrs}><g transform="translate(${PANEL + 536} 92) scale(2.3)">${hero}</g></g>`,
    ];

    // ── scene B: what ships. This is the still frame. ────────────────────────
    const B = { x: PANEL + 40 };
    const sceneB = [
      glyphs.text('WHAT SHIPS', { font: 'mono', size: 11, x: B.x, y: 62, fill: pal.muted, tracking: 0.16 }),
      glyphs.text('One file. It just plays.', { font: 'display', size: 44, x: B.x, y: 122, fill: pal.ink }),
    ];
    SHIPS.forEach((line, i) => {
      const y = 182 + i * 44;
      const row =
        `<circle cx="${B.x + 12}" cy="${y - 6}" r="12" fill="${pal.accents[0]}"/>` +
        `<path d="M${B.x + 6.5} ${y - 6}l4 4 7-8" fill="none" stroke="${pal.bgAlt}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` +
        glyphs.text(line, { font: 'sans', size: 19, x: B.x + 38, y, fill: pal.ink });
      sceneB.push(`<g ${tl.on(SCENE_A + 0.7 + i * 0.4, { fade: 0.3 }).attrs}>${row}</g>`);
    });
    // visible through the second half of the loop, and when animations are off
    const showB = tl.keyframes((p) => `0%,${p(SCENE_A)}{opacity:0}${p(SCENE_A + 0.4)},${p(tl.duration - 0.4)}{opacity:1}100%{opacity:0}`);

    const scene = composeScene({
      layers: [
        layer(`<rect x="${PANEL}" width="${W - PANEL}" height="${H}" fill="${pal.bg}"/>`),
        layer(`<g ${tl.until(SCENE_A - 0.4, { fade: 0.4 }).attrs}>${sceneA.join('')}</g>`),
        layer(`<g class="${showB}">${sceneB.join('')}</g>`),
        layer(identity.join('')),
      ],
      defs: `${glyphs.defs()}\n<clipPath id="pc-editor"><rect x="${E.x + 1}" y="${E.y + E.head}" width="${E.w - 2}" height="${E.h - E.head - 1}"/></clipPath>\n<clipPath id="pc-card"><rect width="${W}" height="${H}" rx="20"/></clipPath>`,
      style: [jump.css, shadow.css, tl.css()].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: `${copy.name}: ${copy.headline} ${copy.sub}`,
      desc: 'A README project card. Left: an identity panel. Right: five lines of a preset are typed and the pixel character they describe arrives and jumps; then a closing frame lists what ships: CSS keyframes only, outlined glyph text, and a reduced-motion still.',
      style: scene.style, defs: scene.defs,
      body: `<g clip-path="url(#pc-card)">\n${scene.body}\n</g>`,
    });
  },
};

// brand-cover — a palette-driven, REUSABLE successor to chan-cover (1280×640).
// It systematizes chan-cover's bespoke recipe into composed primitives so any
// future "make me a cover for X" request reaches the same quality bar:
//
//   • dot-grid backdrop                      → decor.createDotGridBackground
//   • drifting brand pixel-squares           → motion.createParticleStagger + shapes.createAccentSquare
//   • staggered one-shot reveal of the copy  → motion.createRevealUp
//   • a glare sweep across the headline       → decor.createTextGleamClip (clipped to the live <text>) + motion.createSweep
//   • a shimmering accent rule               → motion.createShimmer
//   • a dashed card holding a floating mark   → shapes.createPanel + createStar + createOrbit + motion.createDrift/createPulse
//
// Unlike chan-cover (Anton/DM Sans baked to OUTLINES for exact brand type), this
// template uses SYSTEM fonts so it is fully parametric — pass opts.name / tagline /
// positioning / palette. For exact brand type, outline the text (see chan-cover).
// Self-contained CSS @keyframes; every base state is the finished frame so
// prefers-reduced-motion reads as "done", not "frozen".

const decor = require('../primitives/decor');
const shapes = require('../primitives/shapes');
const motion = require('../primitives/motion');
const { composeScene, layer } = require('../scene');
const { composeSVG, escapeXml } = require('../composer');
const { getPalette } = require('../palettes');

// Brand squares in the negative space, clear of the left copy block and right card
// (same proven scatter as chan-cover's layout, which shares this geometry).
const SQUARES = [
  { x: 300, y: 96 }, { x: 980, y: 92 }, { x: 170, y: 545 }, { x: 705, y: 560 },
  { x: 1085, y: 548 }, { x: 832, y: 250 }, { x: 1232, y: 360 },
];

const NAME_FONT = 'ui-sans-serif, system-ui, Segoe UI, Roboto, sans-serif';

module.exports = {
  name: 'brand-cover',
  category: 'cover',
  viewBox: '0 0 1280 640',
  width: 1280,
  height: 640,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pal = getPalette(opts.palette || 'caldera');
    const name = opts.name || opts.title || 'Your Name';
    const tagline = opts.tagline || 'Subtraction for life, addition for thought.';
    const positioning = opts.positioning || 'Designer · Engineer · Maker';

    // Backdrop
    const dots = decor.createDotGridBackground({
      id: 'bc-dots', width: 1280, height: 640, color: pal.ink, opacity: 0.06,
    });

    // Drifting brand squares
    const field = motion.createParticleStagger({ count: SQUARES.length, seed: 11, amplitude: 9, rotateMax: 8 });
    const squares = SQUARES.map((sq, i) =>
      shapes.createAccentSquare({
        x: sq.x, y: sq.y, size: 12, fill: pal.accents[i % 3],
        applyClass: field.items[i].className,
      })
    ).join('\n');

    // Left column copy — staggered reveal
    const nameReveal = motion.createRevealUp({ distance: 16 });
    const ruleReveal = motion.createRevealUp({ delay: '0.12s' });
    const tagReveal = motion.createRevealUp({ delay: '0.24s' });
    const posReveal = motion.createRevealUp({ delay: '0.36s' });
    const ruleShimmer = motion.createShimmer({ duration: '7s', minOpacity: 0.72 });

    const nameAttrs = `x="96" y="300" font-family="${NAME_FONT}" font-size="120" font-weight="800"`;
    const nameText = `<text ${nameAttrs} fill="${pal.ink}">${escapeXml(name)}</text>`;
    const nameClip = `<text ${nameAttrs}>${escapeXml(name)}</text>`;
    const rule = shapes.createPanel({ x: 100, y: 322, w: 260, h: 12, rx: 2, fill: pal.accents[0], applyClass: ruleShimmer.className });
    const taglineText = `<text x="100" y="392" font-family="ui-sans-serif, system-ui, sans-serif" font-size="34" fill="${pal.ink}">${escapeXml(tagline)}</text>`;
    const posText = `<text x="100" y="438" font-family="ui-sans-serif, system-ui, sans-serif" font-size="24" fill="${pal.muted}">${escapeXml(positioning)}</text>`;

    // Glare sweep across the headline (clipped to the live <text> via clipContent).
    const sweep = motion.createSweep({ duration: '5.5s', distance: 1000, holdPct: 58, delay: '1.2s' });
    const gleam = decor.createTextGleamClip({
      id: 'bc-gleam', clipContent: nameClip, gleamColor: '#FFFFFF', gleamOpacity: 0.55,
      rectX: -40, rectY: 188, rectW: 70, rectH: 130, angle: 16, sweepClassName: sweep.className,
    });

    // Right column — dashed card holding a floating star mark + orbiting accent dot.
    const card = shapes.createPanel({
      x: 872, y: 150, w: 320, h: 340, rx: 40, fill: pal.bgAlt,
      stroke: pal.ink, strokeWidth: 2, dashed: true, dashArray: '2 7',
    });
    const markDrift = motion.createDrift({ duration: '4s', amplitude: 7, rotate: 1.5 });
    const markPulse = motion.createPulse({ duration: '3.4s', minScale: 0.95, maxScale: 1.05 });
    const orbit = motion.createOrbit({ duration: '6s', radius: 92 });
    const sparkleShimmer = motion.createShimmer({ duration: '5s', minOpacity: 0.35 });

    const markStar = shapes.createStar({
      cx: 1032, cy: 320, points: 6, outerR: 70, innerR: 32, fill: pal.accents[1],
      applyClass: markPulse.className,
    });
    const orbitDot = `<circle cx="1032" cy="320" r="11" fill="${pal.accents[0]}"/>`;
    const sparkle = shapes.createBurst({
      cx: 1150, cy: 196, size: 12, fill: pal.accents[2], applyClass: sparkleShimmer.className,
    });

    const scene = composeScene({
      layers: [
        layer(`<rect width="1280" height="640" fill="${pal.bg}"/>`),
        layer(dots.body, { defs: dots.defs }),
        layer(squares),
        // Left copy
        layer(nameText, { className: nameReveal.className }),
        layer(gleam.body, { defs: gleam.defs }),
        layer(rule, { className: ruleReveal.className }), // reveal wraps the rule; shimmer is on the rule element itself
        layer(taglineText, { className: tagReveal.className }),
        layer(posText, { className: posReveal.className }),
        // Right card + mark
        layer(card),
        layer(markStar, { className: markDrift.className }),
        layer(orbitDot, { className: orbit.className }),
        layer(sparkle),
      ],
      style: [
        nameReveal.css, ruleReveal.css, tagReveal.css, posReveal.css, ruleShimmer.css,
        sweep.css, markDrift.css, markPulse.css, orbit.css, sparkleShimmer.css, field.css,
      ].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: `${name} — animated brand cover`,
      desc: `Animated brand cover for ${name}: « ${tagline} » A dot-grid canvas with `
        + 'drifting brand squares, a staggered headline reveal, a glare sweep across the '
        + 'name, a shimmering accent rule, and a dashed card holding a floating star mark '
        + 'with an orbiting accent dot.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

// gradient-cover — a 1280×640 personal/brand hero cover built on an ANIMATED
// gradient wash (the gradient-svg-generator signature look), muted by a palette
// scrim so the headline stays legible on any palette. The name + tagline reveal
// once (staggered); a six-point star mark floats and breathes; brand accent
// squares drift in the margins; the accent rule shimmers.
//
// Palette-driven (opts.palette, default 'sunset'); text uses system fonts (this
// is a parametric cover, not an outlined brand lockup — pass opts.title/tagline).
// The wash animates via SMIL (runs as an <img>); all other motion is CSS
// @keyframes. Base states are the final/visible frame for prefers-reduced-motion.

const decor = require('../primitives/decor');
const shapes = require('../primitives/shapes');
const motion = require('../primitives/motion');
const { composeScene, layer } = require('../scene');
const { composeSVG, escapeXml } = require('../composer');
const { getPalette } = require('../palettes');

const SQUARES = [
  { x: 250, y: 110 }, { x: 980, y: 96 }, { x: 150, y: 520 },
  { x: 700, y: 560 }, { x: 1120, y: 540 }, { x: 1180, y: 300 },
  { x: 60, y: 300 }, { x: 860, y: 250 },
];

module.exports = {
  name: 'gradient-cover',
  category: 'cover',
  viewBox: '0 0 1280 640',
  width: 1280,
  height: 640,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pal = getPalette(opts.palette || 'sunset');
    const title = opts.title || 'Your Name';
    const tagline = opts.tagline || 'designer · builder · maker';

    const wash = decor.createGradientWash({
      id: 'gc-wash', width: 1280, height: 640, angle: 25, animate: { dur: '9s' },
      stops: [
        { offset: 0, color: pal.accents[1] },
        { offset: 0.55, color: pal.accents[0] },
        { offset: 1, color: pal.accents[2] },
      ],
    });
    // Scrim mutes the vivid wash so the ink headline reads on light AND dark palettes.
    const scrim = `<rect width="1280" height="640" fill="${pal.bg}" opacity="0.58"/>`;
    const dots = decor.createDotGridBackground({
      id: 'gc-dots', width: 1280, height: 640, color: pal.ink, opacity: 0.05,
    });

    const titleReveal = motion.createRevealUp({ distance: 18 });
    const tagReveal = motion.createRevealUp({ delay: '0.14s' });
    const ruleShimmer = motion.createShimmer();
    const markDrift = motion.createDrift({ duration: '5s', amplitude: 10, rotate: 3 });
    const markPulse = motion.createPulse({ duration: '3s', minScale: 0.94, maxScale: 1.06 });

    const field = motion.createParticleStagger({ count: 8, seed: 24, amplitude: 12, rotateMax: 12 });
    const squares = SQUARES.map((sq, i) =>
      shapes.createAccentSquare({
        x: sq.x, y: sq.y, size: 12, fill: pal.accents[i % 3],
        applyClass: field.items[i].className,
      })
    ).join('\n');

    // Floating six-point star mark (top-right); pulses on itself, drifts via the wrapper.
    const star = shapes.createStar({
      cx: 0, cy: 0, points: 6, outerR: 34, innerR: 15, fill: pal.bgAlt,
      applyClass: markPulse.className,
    });

    const titleText = `<text x="96" y="356" font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif" font-size="116" font-weight="800" fill="${pal.ink}">${escapeXml(title)}</text>`;
    const taglineText = `<text x="100" y="424" font-family="ui-sans-serif, system-ui, sans-serif" font-size="34" fill="${pal.muted}">${escapeXml(tagline)}</text>`;
    const rule = shapes.createPanel({ x: 100, y: 384, w: 260, h: 12, rx: 3, fill: pal.accents[0] });

    const scene = composeScene({
      layers: [
        layer(wash.body, { defs: wash.defs }),
        layer(scrim),
        layer(dots.body, { defs: dots.defs }),
        layer(squares),
        layer(star, { transform: 'translate(1066,168)', className: markDrift.className }),
        layer(titleText, { className: titleReveal.className }),
        layer(rule, { className: ruleShimmer.className }),
        layer(taglineText, { className: tagReveal.className }),
      ],
      style: [
        titleReveal.css, tagReveal.css, ruleShimmer.css, markDrift.css, markPulse.css, field.css,
      ].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: `${title} — gradient cover`,
      desc: 'A hero cover on an animated gradient wash, muted by a palette scrim, with '
        + 'a revealing name + tagline, a floating star mark, a shimmering accent rule, '
        + 'and brand accent squares drifting in the margins.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

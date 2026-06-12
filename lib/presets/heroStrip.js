// hero-strip — a wide repo/project hero banner (1200×300). A palette-driven
// gradient wash, a parallax-drifting dot grid, the project title + tagline that
// reveal once (staggered), a shimmering accent underline, and a field of brand
// accent squares drifting in the right margin.
//
// Promotes chan-cover's backdrop recipes into decor.* primitives:
//   decor.createGradientWash  → the diagonal canvas wash
//   decor.createDotGridBackground → the parallax dot grid (rect over-wide so the
//                                   drift never exposes an edge)
// Title/tagline use SYSTEM fonts intentionally (this preset renders in-page, not
// as an outlined <img> cover). Self-contained CSS @keyframes; every base state is
// the final/visible state → prefers-reduced-motion shows the finished frame.

const decor = require('../primitives/decor');
const shapes = require('../primitives/shapes');
const motion = require('../primitives/motion');
const { composeScene, layer } = require('../scene');
const { composeSVG, escapeXml } = require('../composer');
const { getPalette } = require('../palettes');

// Fixed scatter of accent squares in the right margin / negative space
// (clear of the left-aligned title block). Canvas is 1200×300.
const SQUARES = [
  { x: 720, y: 60 },
  { x: 812, y: 220 },
  { x: 880, y: 120 },
  { x: 956, y: 250 },
  { x: 1010, y: 48 },
  { x: 1066, y: 188 },
  { x: 1108, y: 92 },
  { x: 1150, y: 240 },
  { x: 760, y: 150 },
  { x: 1160, y: 40 },
];

module.exports = {
  name: 'hero-strip',
  category: 'banner',
  viewBox: '0 0 1200 300',
  width: 1200,
  height: 300,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pal = getPalette(opts.palette || 'midnight');
    const title = opts.title || 'your-project';
    const tagline = opts.tagline || 'ship beautiful things';

    const wash = decor.createGradientWash({
      id: 'hs-wash', width: 1200, height: 300, from: pal.bg, to: pal.bgAlt, angle: 20,
    });

    const dots = decor.createDotGridBackground({
      id: 'hs-dots', width: 1240, x: -20, height: 300, color: pal.ink, opacity: 0.05,
    });
    const par = motion.createParallaxDrift({ distance: 14 });

    const titleReveal = motion.createRevealUp({ distance: 16 });
    const tagReveal = motion.createRevealUp({ delay: '0.12s' });
    const ruleShimmer = motion.createShimmer();

    const underline = shapes.createPanel({ x: 66, y: 168, w: 200, h: 10, rx: 3, fill: pal.accents[0] });

    const field = motion.createParticleStagger({ count: 10, seed: 12, amplitude: 10, rotateMax: 10 });
    const squares = SQUARES.map((sq, i) =>
      shapes.createAccentSquare({
        x: sq.x, y: sq.y, size: 11,
        fill: pal.accents[i % 3],
        applyClass: field.items[i].className,
      })
    ).join('\n');

    const titleText = `<text x="64" y="150" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="68" font-weight="700" fill="${pal.ink}">${escapeXml(title)}</text>`;
    const taglineText = `<text x="66" y="196" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" fill="${pal.muted}">${escapeXml(tagline)}</text>`;

    const scene = composeScene({
      layers: [
        layer(wash.body, { defs: wash.defs }),
        layer(dots.body, { defs: dots.defs, className: par.className }),
        layer(titleText, { className: titleReveal.className }),
        layer(taglineText, { className: tagReveal.className }),
        layer(underline, { className: ruleShimmer.className }),
        layer(squares),
      ],
      style: [
        par.css, titleReveal.css, tagReveal.css, ruleShimmer.css, field.css,
      ].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: `${title} — hero banner`,
      desc: 'A wide project hero banner: a diagonal gradient wash, a parallax-drifting '
        + 'dot grid, the project title and tagline revealing in, a shimmering accent '
        + 'underline, and brand accent squares drifting in the right margin.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

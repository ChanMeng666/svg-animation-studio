// drift-field — a dark canvas with a slowly parallax-drifting backdrop and a
// scatter of small accent squares each floating on its own seeded rhythm.
//
// The back layer is an over-wide rect (x=-10, width 260) so its createParallaxDrift
// never exposes an edge. The seven foreground squares are driven by a single
// createParticleStagger field (seed 7) → deterministic, snapshot-stable variation.
// Self-contained CSS @keyframes → animates as an <img> on GitHub.
// prefers-reduced-motion → everything rests at base.

const motion = require('../primitives/motion');
const { composeSVG } = require('../composer');
const { composeScene, layer } = require('../scene');

const CANVAS = '#0E1116';
const FILLS = ['#58A6FF', '#BC8CFF', '#3FB950'];

// Fixed scatter of accent squares across the 240×120 canvas (size 8 each).
const SQUARES = [
  { x: 28, y: 24 },
  { x: 92, y: 76 },
  { x: 150, y: 30 },
  { x: 200, y: 84 },
  { x: 64, y: 52 },
  { x: 176, y: 58 },
  { x: 116, y: 18 },
];

module.exports = {
  name: 'drift-field',
  category: 'background',
  viewBox: '0 0 240 120',
  width: 240,
  height: 120,
  compose(opts = {}) {
    motion.resetIdCounter();

    const parallax = motion.createParallaxDrift({ distance: 10 });
    const field = motion.createParticleStagger({ count: 7, seed: 7 });

    const squares = SQUARES.map((sq, i) =>
      `<rect class="${field.items[i].className}" x="${sq.x}" y="${sq.y}" width="8" height="8" fill="${FILLS[i % FILLS.length]}"/>`
    ).join('\n');

    const scene = composeScene({
      layers: [
        layer(`<rect x="-10" y="0" width="260" height="120" fill="${CANVAS}"/>`, {
          className: parallax.className,
        }),
        layer(squares),
      ],
      style: [parallax.css, field.css].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Drifting accent field',
      desc: 'A dark canvas with a slowly parallax-drifting backdrop and seven small accent squares each floating on its own rhythm.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

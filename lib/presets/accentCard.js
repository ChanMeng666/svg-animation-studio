// accent-card — a cream canvas with a dashed-outline card and six small brand
// accent squares scattered in the margins, each drifting on a seeded rhythm.
//
// The card is a dashed createPanel; the six squares sit OUTSIDE/around the card
// edges and float via one createParticleStagger field (seed 6) → deterministic,
// snapshot-stable. Self-contained CSS @keyframes → animates as an <img> on GitHub.
// prefers-reduced-motion → everything rests at base.

const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const { composeSVG } = require('../composer');
const { composeScene, layer } = require('../scene');

const CREAM = '#F7F6F2';
const INK = '#070607';
const FILLS = ['#FC5000', '#524AE9', '#F5F28E'];

// Six accent squares (size 10) scattered in the margins around the card
// (card spans x[16..184], y[16..104] on the 200×120 canvas).
const SQUARES = [
  { x: 4, y: 6 },
  { x: 96, y: 2 },
  { x: 186, y: 6 },
  { x: 4, y: 102 },
  { x: 100, y: 106 },
  { x: 186, y: 100 },
];

module.exports = {
  name: 'accent-card',
  category: 'background',
  viewBox: '0 0 200 120',
  width: 200,
  height: 120,
  compose(opts = {}) {
    motion.resetIdCounter();

    const field = motion.createParticleStagger({ count: 6, seed: 6 });

    const card = shapes.createPanel({
      x: 16, y: 16, w: 168, h: 88, rx: 18,
      fill: 'none', stroke: INK, strokeWidth: 2, dashed: true
    });

    const squares = SQUARES.map((sq, i) =>
      shapes.createAccentSquare({
        x: sq.x, y: sq.y, size: 10,
        fill: FILLS[i % FILLS.length],
        applyClass: field.items[i].className
      })
    ).join('\n');

    const scene = composeScene({
      layers: [
        layer(`<rect width="200" height="120" fill="${CREAM}"/>`),
        layer(card),
        layer(squares),
      ],
      style: field.css,
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Accent card',
      desc: 'A cream canvas with a dashed-outline card and six small brand accent squares scattered in the margins, each drifting on its own rhythm.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

// star-loader — five small stars evenly spaced on a ring, each twinkling on a
// staggered rhythm so the sparkle appears to travel around the circle.
//
// Each star scales via its own createPulse with a 0.2s-stepped delay. Positions
// are computed on a radius-32 circle around the center (50,50). Self-contained
// CSS @keyframes → animates as an <img> on GitHub. prefers-reduced-motion → all rest.

const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const { composeSVG } = require('../composer');

const ORANGE = '#FF9F1C';
const CENTER = 50;
const RADIUS = 32;
const COUNT = 5;
const DELAYS = ['0s', '0.2s', '0.4s', '0.6s', '0.8s'];

module.exports = {
  name: 'star-loader',
  category: 'loader',
  viewBox: '0 0 100 100',
  width: 100,
  height: 100,
  compose(opts = {}) {
    motion.resetIdCounter();

    const stars = [];
    const cssParts = [];
    for (let i = 0; i < COUNT; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / COUNT;
      const cx = +(CENTER + RADIUS * Math.cos(a)).toFixed(2);
      const cy = +(CENTER + RADIUS * Math.sin(a)).toFixed(2);
      const pulse = motion.createPulse({ duration: '1.4s', delay: DELAYS[i], minScale: 0.5, maxScale: 1 });
      cssParts.push(pulse.css);
      stars.push(shapes.createStar({
        cx, cy, points: 5, outerR: 9, innerR: 4,
        fill: ORANGE, applyClass: pulse.className
      }));
    }

    const style = cssParts.join('\n');
    const body = stars.join('\n  ');

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Loading — star ring',
      desc: 'Five orange stars evenly spaced on a ring, each twinkling on a staggered rhythm so the sparkle travels around the circle.',
      style, body,
    });
  },
};

// ripple-loader — a solid core with three sonar-style rings rippling outward.
//
// Each ring expands and fades via createRipple on a staggered delay, so the
// three read as a continuous outward pulse. Self-contained CSS @keyframes →
// animates as an <img> on GitHub. prefers-reduced-motion → rings rest at base.

const motion = require('../primitives/motion');
const { composeSVG } = require('../composer');

const BLUE = '#0077B6';

const RINGS = [
  { delay: '0s' },
  { delay: '0.6s' },
  { delay: '1.2s' },
];

module.exports = {
  name: 'ripple-loader',
  category: 'loader',
  viewBox: '0 0 80 80',
  width: 80,
  height: 80,
  compose(opts = {}) {
    motion.resetIdCounter();

    const ripples = RINGS.map((r) => motion.createRipple({ delay: r.delay }));

    const style = ripples.map((r) => r.css).join('\n');

    const rings = RINGS.map((r, i) =>
      `<circle class="${ripples[i].className}" cx="40" cy="40" r="20" fill="none" stroke="${BLUE}" stroke-width="3"/>`
    ).join('\n  ');

    const body = `${rings}
  <circle cx="40" cy="40" r="8" fill="${BLUE}"/>`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Loading — ripple',
      desc: 'A solid blue core with three rings rippling outward in a sonar pulse.',
      style, body,
    });
  },
};

// dot-loader — three pulsing dots, a classic "loading" indicator.
//
// Each dot breathes via its own createPulse with a staggered delay, so the
// three read as a left-to-right wave. Self-contained CSS @keyframes → animates
// as an <img> on GitHub. prefers-reduced-motion → dots rest at their base scale.

const motion = require('../primitives/motion');
const { composeSVG } = require('../composer');

const VIOLET = '#524AE9';

const DOTS = [
  { cx: 24, delay: '0s' },
  { cx: 60, delay: '0.2s' },
  { cx: 96, delay: '0.4s' },
];

module.exports = {
  name: 'dot-loader',
  category: 'loader',
  viewBox: '0 0 120 40',
  width: 120,
  height: 40,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pulses = DOTS.map((d) =>
      motion.createPulse({ delay: d.delay, minScale: 0.6, maxScale: 1 }));

    const style = pulses.map((p) => p.css).join('\n');

    const body = DOTS.map((d, i) =>
      `<circle class="${pulses[i].className}" cx="${d.cx}" cy="20" r="10" fill="${VIOLET}"/>`
    ).join('\n  ');

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Loading — pulsing dots',
      desc: 'Three violet dots pulsing in a staggered left-to-right wave.',
      style, body,
    });
  },
};

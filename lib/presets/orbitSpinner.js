// orbit-spinner — a dashed ring spinning while an accent dot orbits the center.
//
// The ring is dashed so its continuous createSpin reads as motion; an accent
// dot rides a createOrbit at the ring radius, staying upright as it circles.
// Self-contained CSS @keyframes → animates as an <img> on GitHub.
// prefers-reduced-motion → ring and dot rest in place.

const motion = require('../primitives/motion');
const { composeSVG } = require('../composer');

const INK = '#070607';
const BASALT = '#E2E2DF';
const ORANGE = '#FC5000';

module.exports = {
  name: 'orbit-spinner',
  category: 'loader',
  viewBox: '0 0 80 80',
  width: 80,
  height: 80,
  compose(opts = {}) {
    motion.resetIdCounter();

    const spin = motion.createSpin();
    const orbit = motion.createOrbit({ radius: 26 });

    const style = [spin.css, orbit.css].join('\n');

    const body = `<circle cx="40" cy="40" r="6" fill="${INK}"/>
  <circle class="${spin.className}" cx="40" cy="40" r="26" fill="none" stroke="${BASALT}" stroke-width="4" stroke-dasharray="8 12"/>
  <circle class="${orbit.className}" cx="40" cy="40" r="5" fill="${ORANGE}"/>`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Loading — orbit spinner',
      desc: 'A dashed ring spins while an orange accent dot orbits the center.',
      style, body,
    });
  },
};

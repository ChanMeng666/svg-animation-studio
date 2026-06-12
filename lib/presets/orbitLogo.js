// orbit-logo — a small looping logo mark (200×200): a slowly spinning dashed
// ring, a breathing star at the center, and an accent dot orbiting the ring.
// Palette-driven (opts.palette, default 'caldera'). All CSS @keyframes → embeds
// as an <img>. Reduced-motion shows the assembled mark at rest.

const shapes = require('../primitives/shapes');
const motion = require('../primitives/motion');
const { composeScene, layer } = require('../scene');
const { composeSVG } = require('../composer');
const { getPalette } = require('../palettes');

module.exports = {
  name: 'orbit-logo',
  category: 'logo',
  viewBox: '0 0 200 200',
  width: 200,
  height: 200,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pal = getPalette(opts.palette || 'caldera');

    const spin = motion.createSpin({ duration: '9s' });
    const starPulse = motion.createPulse({ duration: '3s', minScale: 0.92, maxScale: 1.08 });
    const orbit = motion.createOrbit({ duration: '4.5s', radius: 70 });

    const ring = `<circle cx="100" cy="100" r="70" fill="none" stroke="${pal.muted}" stroke-width="3" stroke-dasharray="6 12" stroke-linecap="round"/>`;
    const star = shapes.createStar({ cx: 100, cy: 100, points: 5, outerR: 30, innerR: 13, fill: pal.accents[1], applyClass: starPulse.className });
    const orbitDot = `<circle cx="100" cy="100" r="9" fill="${pal.accents[0]}"/>`;

    const scene = composeScene({
      layers: [
        layer(ring, { className: spin.className }),
        layer(star),
        layer(orbitDot, { className: orbit.className }),
      ],
      style: [spin.css, starPulse.css, orbit.css].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Orbit logo mark',
      desc: 'A spinning dashed ring, a breathing star at the center, and an accent dot orbiting the ring.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

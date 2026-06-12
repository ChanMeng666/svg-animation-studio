// spin-badge — an award-seal badge: a slowly spinning star inside a gently
// pulsing rounded-square seal, with a small twinkling sparkle in the corner.
//
// The badge breathes via createPulse; the center star turns via createSpin; a
// corner burst sparkles via a faster createPulse. Self-contained CSS @keyframes
// → animates as an <img> on GitHub. prefers-reduced-motion → everything rests.

const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const { composeSVG } = require('../composer');

const PURPLE = '#524AE9';
const INK = '#070607';
const CREAM = '#F7F6F2';
const GOLD = '#F5F28E';

module.exports = {
  name: 'spin-badge',
  category: 'badge',
  viewBox: '0 0 80 80',
  width: 80,
  height: 80,
  compose(opts = {}) {
    motion.resetIdCounter();

    const badgePulse = motion.createPulse({ minScale: 0.98, maxScale: 1.02 });
    const spin = motion.createSpin({ duration: '6s' });
    const burstPulse = motion.createPulse({ duration: '1.6s', minScale: 0.5, maxScale: 1 });

    const style = [badgePulse.css, spin.css, burstPulse.css].join('\n');

    const body = `${shapes.createBadgeShape({
      x: 4, y: 4, w: 72, h: 72, rx: 20,
      fill: PURPLE, stroke: INK, strokeWidth: 2,
      applyClass: badgePulse.className
    })}
  ${shapes.createStar({
      cx: 40, cy: 40, points: 5, outerR: 20, innerR: 9,
      fill: CREAM, applyClass: spin.className
    })}
  ${shapes.createBurst({
      cx: 62, cy: 18, size: 6, fill: GOLD,
      applyClass: burstPulse.className
    })}`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Spinning award badge',
      desc: 'A gently pulsing rounded-square seal with a slowly spinning cream star and a twinkling gold sparkle in the corner.',
      style, body,
    });
  },
};

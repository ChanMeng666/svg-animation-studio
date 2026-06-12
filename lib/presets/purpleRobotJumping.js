const motion  = require('../primitives/motion');
const shapes  = require('../primitives/shapes');
const filters = require('../primitives/filters');
const { composeSVG } = require('../composer');

module.exports = {
  name: 'purple-robot-jumping',
  category: 'character',
  viewBox: '0 0 100 90',
  width: 140,
  height: 126,
  compose(opts = {}) {
    motion.resetIdCounter();
    const color    = opts.color    || '#8B5CF6';
    const eyeColor = opts.eyeColor || '#1E1B4B';

    const jump   = motion.createJump();
    const shadow = motion.createShadowScale();
    const armL   = motion.createWaveArm({ side: 'left' });
    const armR   = motion.createWaveArm({ side: 'right' });
    const earL   = motion.createEarBounce();
    const earR   = motion.createEarBounce({ delay: '0.1s' });

    const style = [jump.css, shadow.css, armL.css, armR.css, earL.css, earR.css].join('\n');
    const defs = filters.createDropShadow({ id: 'pr-depth', dx: 1.5, dy: 2, stdDeviation: 1.8, floodColor: '#3B0764', floodOpacity: 0.45 });

    const body = `  ${shapes.createGroundShadow({
      cx: 50, cy: 82, rx: 22, ry: 5,
      applyClass: shadow.className
    })}

  <g filter="url(#pr-depth)">
  ${shapes.createPixelCharacter({
    color,
    eyeColor,
    mouth: { x: 42, y: 50, w: 16, h: 3 },
    applyClasses: {
      body: jump.className,
      leftEar: earL.className,
      rightEar: earR.className,
      leftArm: armL.className,
      rightArm: armR.className
    }
  })}
  </g>`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Purple robot jumping',
      desc: 'Pixel-art purple robot with squash-and-stretch jump, waving arms, antenna bounce, synced ground shadow, a thin display-bar mouth, and a soft drop-shadow for depth.',
      style, defs, body
    });
  }
};

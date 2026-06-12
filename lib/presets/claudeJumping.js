// Sprint 1 task A — reverse-engineered from D:\github_repository\svg-animation\claude-jumping.svg

const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const { composeSVG } = require('../composer');

module.exports = {
  name: 'claude-jumping',
  category: 'character',
  viewBox: '0 0 100 90',
  width: 140,
  height: 126,
  compose(opts = {}) {
    motion.resetIdCounter();
    const color = opts.color || '#E07C4C';

    const jump   = motion.createJump();
    const shadow = motion.createShadowScale();
    const armL   = motion.createWaveArm({ side: 'left' });
    const armR   = motion.createWaveArm({ side: 'right' });
    const earL   = motion.createEarBounce();
    const earR   = motion.createEarBounce({ delay: '0.1s' });

    const style = [jump.css, shadow.css, armL.css, armR.css, earL.css, earR.css].join('\n');

    const body = `  ${shapes.createGroundShadow({
      cx: 50, cy: 82, rx: 22, ry: 5,
      applyClass: shadow.className
    })}

  ${shapes.createPixelCharacter({
    color,
    applyClasses: {
      body: jump.className,
      leftEar: earL.className,
      rightEar: earR.className,
      leftArm: armL.className,
      rightArm: armR.className
    }
  })}`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Claude character jumping',
      desc: 'Pixel-art Claude mascot with squash-and-stretch jump, waving arms, ear bounce, and synced ground shadow.',
      style, body
    });
  }
};

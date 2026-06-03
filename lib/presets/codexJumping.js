// Sprint 1 task C — reverse-engineered from D:\github_repository\svg-animation\codex-jumping.svg

const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const filters = require('../primitives/filters');
const { composeSVG } = require('../composer');

module.exports = {
  name: 'codex-jumping',
  viewBox: '0 0 140 170',
  width: 140,
  height: 170,
  compose(opts = {}) {
    motion.resetIdCounter();

    const jump   = motion.createJump();
    const shadow = motion.createShadowScale();
    const armL   = motion.createWaveArm({ side: 'left' });
    const armR   = motion.createWaveArm({ side: 'right' });

    const style = [jump.css, shadow.css, armL.css, armR.css].join('\n');

    const bodyGradId = 'cx-body-grad';
    const armLGradId = 'cx-arm-l';
    const armRGradId = 'cx-arm-r';
    const limbGradId = 'cx-limb-grad';
    const eyeGradId  = 'cx-eye-grad';
    const shadowGradId = 'cx-shadow-grad';
    const dropShadowId = 'cx-drop-shadow';
    const innerDepthId = 'cx-inner-depth';
    const cloudClipId  = 'cx-cloud-clip';

    const defs = `${shapes.createLinearGradient({
      id: bodyGradId, x1: '0.5', y1: '0', x2: '0.5', y2: '1',
      stops: [
        { offset: '0%',  color: '#9333EA' },
        { offset: '30%', color: '#7C3AED' },
        { offset: '55%', color: '#5B6CF0' },
        { offset: '80%', color: '#3B9AEE' },
        { offset: '100%', color: '#22D3EE' }
      ]
    })}
    ${shapes.createLinearGradient({
      id: armLGradId, x1: '0', y1: '0', x2: '1', y2: '0.5',
      stops: [
        { offset: '0%',  color: '#6D28D9' },
        { offset: '50%', color: '#7C3AED' },
        { offset: '100%', color: '#5B21B6' }
      ]
    })}
    ${shapes.createLinearGradient({
      id: armRGradId, x1: '0', y1: '0', x2: '1', y2: '0.5',
      stops: [
        { offset: '0%',  color: '#7C3AED' },
        { offset: '50%', color: '#6D28D9' },
        { offset: '100%', color: '#5B21B6' }
      ]
    })}
    ${shapes.createLinearGradient({
      id: limbGradId, x1: '0', y1: '0', x2: '0', y2: '1',
      stops: [
        { offset: '0%',  color: '#7C3AED' },
        { offset: '50%', color: '#6D28D9' },
        { offset: '100%', color: '#5B21B6' }
      ]
    })}
    ${shapes.createRadialGradient({
      id: eyeGradId, cx: '35%', cy: '30%', r: '65%',
      stops: [
        { offset: '0%',   color: '#FFFFFF' },
        { offset: '60%',  color: '#F0F0F0' },
        { offset: '100%', color: '#D8D8D8' }
      ]
    })}
    ${shapes.createRadialGradient({
      id: shadowGradId, cx: '50%', cy: '50%', r: '50%',
      stops: [
        { offset: '0%',   color: '#4C1D95', opacity: '0.35' },
        { offset: '60%',  color: '#4C1D95', opacity: '0.15' },
        { offset: '100%', color: '#4C1D95', opacity: '0' }
      ]
    })}
    ${filters.createDropShadow({ id: dropShadowId })}
    ${filters.createInnerDepth({ id: innerDepthId })}
    ${shapes.createCloudClipPath({ id: cloudClipId })}`;

    const body = `  ${shapes.createGroundShadow({
      cx: 70, cy: 158, rx: 28, ry: 6,
      color: `url(#${shadowGradId})`,
      applyClass: shadow.className
    })}

  <g class="${jump.className}">
    <g filter="url(#${dropShadowId})">
      ${shapes.createCodexCharacter({
        bodyGradId, cloudClipId, innerDepthId,
        armLGradId, armRGradId, limbGradId, eyeGradId,
        pose: 'jumping',
        applyClasses: {
          leftArm: armL.className,
          rightArm: armR.className
        }
      })}
    </g>
  </g>`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Codex character jumping',
      desc: 'Cloud-shaped Codex mascot with purple-cyan gradient body, squash-stretch jump, waving arms.',
      style, defs, body
    });
  }
};

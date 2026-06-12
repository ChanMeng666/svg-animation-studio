// Sprint 1 task B — reverse-engineered from D:\github_repository\svg-animation\claude-speaking.svg

const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const { composeSVG } = require('../composer');

module.exports = {
  name: 'claude-speaking',
  category: 'character',
  viewBox: '0 0 140 90',
  width: 196,
  height: 126,
  compose(opts = {}) {
    motion.resetIdCounter();
    const color = opts.color || '#E07C4C';

    const bob    = motion.createBob();
    const shadow = motion.createShadowPulse();
    const talk   = motion.createTalk();
    const earL   = motion.createEarBounce({ duration: '0.8s', peakScale: 1.0, dipScale: 1.0 });
    const earR   = motion.createEarBounce({ duration: '0.8s', peakScale: 1.0, dipScale: 1.0 });
    // ears tilt rather than bounce in speaking; use waveArm at tiny angle to emulate the original tilt
    const earTiltL = motion.createWaveArm({ side: 'left',  duration: '0.8s', angle: 5 });
    const earTiltR = motion.createWaveArm({ side: 'right', duration: '0.8s', angle: 5 });

    const wave1 = motion.createSoundWaveExpand();
    const wave2 = motion.createSoundWaveExpand({ delay: '0.2s' });
    const wave3 = motion.createSoundWaveExpand({ delay: '0.4s' });

    const note1 = motion.createFloatingNote({ dx: 15, dy: -25, rotate: 15 });
    const note2 = motion.createFloatingNote({ delay: '0.3s', dx: 20, dy: -30, rotate: -10 });
    const note3 = motion.createFloatingNote({ delay: '0.6s', dx: 10, dy: -35, rotate: 20 });

    const style = [
      bob.css, shadow.css, talk.css,
      earTiltL.css, earTiltR.css,
      wave1.css, wave2.css, wave3.css,
      note1.css, note2.css, note3.css
    ].join('\n');

    const soundWaves = `<g class="${wave1.className}">
    <path d="M 92 44 Q 100 44, 100 52 Q 100 60, 92 60" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="${wave2.className}">
    <path d="M 96 38 Q 108 38, 108 52 Q 108 66, 96 66" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="${wave3.className}">
    <path d="M 100 32 Q 116 32, 116 52 Q 116 72, 100 72" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  </g>`;

    const musicalNotes = `${shapes.createMusicalNote({ kind: 'eighth',  x: 100, y: 10, color, applyClass: note1.className })}
  ${shapes.createMusicalNote({ kind: 'quarter', x: 114, y:  4, color, applyClass: note2.className })}
  ${shapes.createMusicalNote({ kind: 'double',  x: 110, y: 24, color, applyClass: note3.className })}`;

    const body = `  ${shapes.createGroundShadow({
      cx: 50, cy: 82, rx: 22, ry: 5,
      applyClass: shadow.className
    })}

  ${soundWaves}

  ${musicalNotes}

  ${shapes.createPixelCharacter({
    color,
    armY: 40,
    mouth: { x: 44, y: 50, w: 12, h: 6, applyClass: talk.className },
    applyClasses: {
      body: bob.className,
      leftEar: earTiltL.className,
      rightEar: earTiltR.className
    }
  })}`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Claude character speaking',
      desc: 'Pixel-art Claude mascot with idle bob, mouth talk loop, expanding sound waves, and floating music notes.',
      style, body
    });
  }
};

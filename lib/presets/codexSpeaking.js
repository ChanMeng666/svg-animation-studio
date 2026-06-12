// Sprint 1 task D — reverse-engineered from D:\github_repository\svg-animation\codex-speaking.svg

const motion = require('../primitives/motion');
const shapes = require('../primitives/shapes');
const filters = require('../primitives/filters');
const { composeSVG } = require('../composer');

module.exports = {
  name: 'codex-speaking',
  category: 'character',
  viewBox: '0 0 200 180',
  width: 360,
  height: 324,
  compose(opts = {}) {
    motion.resetIdCounter();

    const bob    = motion.createBob();
    const shadow = motion.createShadowPulse();
    const talk   = motion.createTalk();
    const wave1  = motion.createSoundWaveExpand();
    const wave2  = motion.createSoundWaveExpand({ delay: '0.2s' });
    const wave3  = motion.createSoundWaveExpand({ delay: '0.4s' });
    const note1  = motion.createFloatingNote({ dx: 15, dy: -25, rotate: 15 });
    const note2  = motion.createFloatingNote({ delay: '0.3s', dx: 20, dy: -30, rotate: -10 });
    const note3  = motion.createFloatingNote({ delay: '0.6s', dx: 10, dy: -35, rotate: 20 });
    const ring1  = motion.createVoiceRing();
    const ring2  = motion.createVoiceRing({ delay: '0.2s' });

    const style = [
      bob.css, shadow.css, talk.css,
      wave1.css, wave2.css, wave3.css,
      note1.css, note2.css, note3.css,
      ring1.css, ring2.css
    ].join('\n');

    const bodyGradId = 'cx-body-grad';
    const armLGradId = 'cx-arm-l';
    const armRGradId = 'cx-arm-r';
    const limbGradId = 'cx-limb-grad';
    const eyeGradId  = 'cx-eye-grad';
    const shadowGradId = 'cx-shadow-grad';
    const dropShadowId = 'cx-drop-shadow';
    const innerDepthId = 'cx-inner-depth';
    const cloudClipId  = 'cx-cloud-clip';
    const soundGlowId  = 'cx-sound-glow';
    const noteGlowId   = 'cx-note-glow';

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
        { offset: '0%', color: '#6D28D9' },
        { offset: '50%', color: '#7C3AED' },
        { offset: '100%', color: '#5B21B6' }
      ]
    })}
    ${shapes.createLinearGradient({
      id: armRGradId, x1: '0', y1: '0', x2: '1', y2: '0.5',
      stops: [
        { offset: '0%', color: '#7C3AED' },
        { offset: '50%', color: '#6D28D9' },
        { offset: '100%', color: '#5B21B6' }
      ]
    })}
    ${shapes.createLinearGradient({
      id: limbGradId, x1: '0', y1: '0', x2: '0', y2: '1',
      stops: [
        { offset: '0%', color: '#7C3AED' },
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
    ${shapes.createCloudClipPath({ id: cloudClipId })}
    ${filters.createSoftGlow({ id: soundGlowId })}
    ${filters.createNoteGlow({ id: noteGlowId })}`;

    const body = `  ${shapes.createGroundShadow({
      cx: 68, cy: 162, rx: 28, ry: 6,
      color: `url(#${shadowGradId})`,
      applyClass: shadow.className
    })}

  <g class="${bob.className}" filter="url(#${dropShadowId})">
    ${shapes.createCodexCharacter({
      bodyGradId, cloudClipId, innerDepthId,
      armLGradId, armRGradId, limbGradId, eyeGradId,
      pose: 'speaking',
      mouth: { cx: 68, cy: 95, rx: 8, ry: 5, applyClass: talk.className },
      applyClasses: {}
    })}
  </g>

  <circle class="${ring1.className}" cx="100" cy="80" r="32" fill="none" stroke="#A78BFA" stroke-width="1.2" opacity="0.12"/>
  <circle class="${ring2.className}" cx="100" cy="80" r="40" fill="none" stroke="#8B5CF6" stroke-width="0.8" opacity="0.08"/>

  <g filter="url(#${soundGlowId})">
    <path class="${wave1.className}" d="M84,88 Q96,80 84,72" fill="none" stroke="#C4B5FD" stroke-width="2.5" stroke-linecap="round"/>
    <path class="${wave2.className}" d="M88,92 Q104,80 88,68" fill="none" stroke="#A78BFA" stroke-width="2.2" stroke-linecap="round"/>
    <path class="${wave3.className}" d="M92,96 Q112,80 92,64" fill="none" stroke="#8B5CF6" stroke-width="1.8" stroke-linecap="round"/>
  </g>

  <g class="${note1.className}" filter="url(#${noteGlowId})">
    <circle cx="96" cy="84" r="3" fill="#C4B5FD"/>
    <line x1="99" y1="84" x2="99" y2="74" stroke="#C4B5FD" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M99,74 Q103,72.5 101.5,76" fill="#C4B5FD" stroke="none"/>
  </g>
  <g class="${note2.className}" filter="url(#${noteGlowId})">
    <circle cx="93" cy="88" r="2.5" fill="#A78BFA"/>
    <line x1="95.5" y1="88" x2="95.5" y2="80" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M95.5,80 Q99,78.5 97.5,82" fill="#A78BFA" stroke="none"/>
  </g>
  <g class="${note3.className}" filter="url(#${noteGlowId})">
    <circle cx="98" cy="90" r="2.5" fill="#8B5CF6"/>
    <circle cx="105" cy="88" r="2.5" fill="#8B5CF6"/>
    <line x1="100.5" y1="90" x2="100.5" y2="81" stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="107.5" y1="88" x2="107.5" y2="79" stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="100.5" y1="81" x2="107.5" y2="79" stroke="#8B5CF6" stroke-width="1.8" stroke-linecap="round"/>
  </g>`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Codex character speaking',
      desc: 'Cloud-shaped Codex mascot with bob, mouth talk, voice rings, glowing sound waves, and floating music notes.',
      style, defs, body
    });
  }
};

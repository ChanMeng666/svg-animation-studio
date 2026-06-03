// Motion primitives — CSS @keyframes factory functions.
// Each returns { css, className }. Composer collects css into <style>; presets
// attach className to the target element.

const { cssEasing } = require('../easing');

let _idCounter = 0;
function uniqueId(prefix) { return `${prefix}-${++_idCounter}`; }
function resetIdCounter() { _idCounter = 0; }

function createJump(opts = {}) {
  const {
    duration = '0.5s',
    easing = 'easeInOut',
    peakY = 18,
    midY = 16,
    landDip = 5,
    squashApexX = 0.98, squashApexY = 1.05,
    squashRiseX = 0.95, squashRiseY = 1.1,
    squashLandX = 1.05, squashLandY = 0.95,
    transformOrigin = 'center bottom'
  } = opts;
  const cls = uniqueId('cv-jump');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
  transform-origin: ${transformOrigin};
}
@keyframes ${kf} {
  0%, 100% { transform: translateY(0) scaleY(1) scaleX(1); }
  30% { transform: translateY(-${midY}px) scaleY(${squashRiseY}) scaleX(${squashRiseX}); }
  50% { transform: translateY(-${peakY}px) scaleY(${squashApexY}) scaleX(${squashApexX}); }
  80% { transform: translateY(-${landDip}px) scaleY(${squashLandY}) scaleX(${squashLandX}); }
}`;
  return { css, className: cls };
}

function createBob(opts = {}) {
  const { duration = '0.8s', easing = 'easeInOut', amplitude = 3 } = opts;
  const cls = uniqueId('cv-bob');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
  transform-origin: center bottom;
}
@keyframes ${kf} {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-${amplitude}px); }
}`;
  return { css, className: cls };
}

function createTalk(opts = {}) {
  const { duration = '0.3s', easing = 'easeInOut', closedScale = 0.5 } = opts;
  const cls = uniqueId('cv-talk');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
  transform-origin: center center;
}
@keyframes ${kf} {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(${closedScale}); }
}`;
  return { css, className: cls };
}

function createWaveArm(opts = {}) {
  const { side = 'left', duration = '0.5s', easing = 'easeInOut', angle = 25 } = opts;
  const sign = side === 'left' ? -1 : 1;
  const cls = uniqueId(`cv-wave-${side}`);
  const kf = `kf-${cls}`;
  const origin = side === 'left' ? 'right center' : 'left center';
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
  transform-origin: ${origin};
}
@keyframes ${kf} {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(${sign * angle}deg); }
}`;
  return { css, className: cls };
}

function createEarBounce(opts = {}) {
  const {
    duration = '0.5s', easing = 'easeInOut', delay = '0s',
    peakScale = 1.2, dipScale = 0.85
  } = opts;
  const cls = uniqueId('cv-ear');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
  transform-origin: center bottom;
}
@keyframes ${kf} {
  0%, 100% { transform: scaleY(1); }
  40% { transform: scaleY(${peakScale}); }
  60% { transform: scaleY(${dipScale}); }
}`;
  return { css, className: cls };
}

function createShadowScale(opts = {}) {
  const {
    duration = '0.5s', easing = 'easeInOut',
    minScale = 0.4, maxOpacity = 0.25, minOpacity = 0.08
  } = opts;
  const cls = uniqueId('cv-shadow');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
}
@keyframes ${kf} {
  0%, 100% { transform: scaleX(1); opacity: ${maxOpacity}; }
  50% { transform: scaleX(${minScale}); opacity: ${minOpacity}; }
}`;
  return { css, className: cls };
}

function createShadowPulse(opts = {}) {
  const {
    duration = '0.8s', easing = 'easeInOut',
    minScale = 0.9, maxOpacity = 0.25, minOpacity = 0.2
  } = opts;
  const cls = uniqueId('cv-shadow-p');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
}
@keyframes ${kf} {
  0%, 100% { transform: scaleX(1); opacity: ${maxOpacity}; }
  50% { transform: scaleX(${minScale}); opacity: ${minOpacity}; }
}`;
  return { css, className: cls };
}

function createSoundWaveExpand(opts = {}) {
  const {
    duration = '0.8s', easing = 'easeOut', delay = '0s',
    startScaleX = 0.3, startScaleY = 0.8,
    endScaleX = 1.2, endScaleY = 1
  } = opts;
  const cls = uniqueId('cv-wave-exp');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
  transform-origin: left center;
}
@keyframes ${kf} {
  0% { opacity: 0.8; transform: scaleX(${startScaleX}) scaleY(${startScaleY}); }
  100% { opacity: 0; transform: scaleX(${endScaleX}) scaleY(${endScaleY}); }
}`;
  return { css, className: cls };
}

function createFloatingNote(opts = {}) {
  const {
    duration = '1.5s', easing = 'easeOut', delay = '0s',
    dx = 15, dy = -25, rotate = 15
  } = opts;
  const cls = uniqueId('cv-note');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
}
@keyframes ${kf} {
  0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate(${dx}px, ${dy}px) rotate(${rotate}deg); }
}`;
  return { css, className: cls };
}

function createVoiceRing(opts = {}) {
  const {
    duration = '0.8s', easing = 'easeInOut', delay = '0s',
    centerX = 100, centerY = 80,
    minOpacity = 0.1, maxOpacity = 0.25,
    peakScale = 1.05
  } = opts;
  const cls = uniqueId('cv-ring');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
  transform-origin: ${centerX}px ${centerY}px;
}
@keyframes ${kf} {
  0%, 100% { opacity: ${minOpacity}; transform: scale(1); }
  50% { opacity: ${maxOpacity}; transform: scale(${peakScale}); }
}`;
  return { css, className: cls };
}

module.exports = {
  uniqueId, resetIdCounter,
  createJump, createBob, createTalk, createWaveArm, createEarBounce,
  createShadowScale, createShadowPulse,
  createSoundWaveExpand, createFloatingNote, createVoiceRing
};

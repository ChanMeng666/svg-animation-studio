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

/** One-shot reveal: an element fades in while sliding up from `distance` px; holds visible. */
function createRevealUp(opts = {}) {
  const {
    duration = '0.7s', easing = 'easeOutBack', delay = '0s', distance = 12
  } = opts;
  const cls = uniqueId('cv-reveal');
  const kf = `kf-${cls}`;
  // `both 1` → fill-mode both + a single iteration: holds the `from` state during
  // the delay (stagger) then settles on `to`. The element's own base style must be
  // the final/visible state so prefers-reduced-motion users see the finished frame.
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} ${delay} 1 both;
}
@keyframes ${kf} {
  from { opacity: 0; transform: translateY(${distance}px); }
  to   { opacity: 1; transform: translateY(0); }
}`;
  return { css, className: cls };
}

/** Occasional blink: target scales to a thin slit briefly, otherwise open. `duration` sets the gap between blinks. */
function createBlink(opts = {}) {
  const { duration = '6s', easing = 'easeInOut', closedScale = 0.1 } = opts;
  const cls = uniqueId('cv-blink');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes ${kf} {
  0%, 92%, 100% { transform: scaleY(1); }
  96% { transform: scaleY(${closedScale}); }
}`;
  return { css, className: cls };
}

/** Slow opacity shimmer: a quiet pulse between maxOpacity and minOpacity, for a single accent element. */
function createShimmer(opts = {}) {
  const {
    duration = '7s', easing = 'easeInOut', minOpacity = 0.78, maxOpacity = 1
  } = opts;
  const cls = uniqueId('cv-shimmer');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
}
@keyframes ${kf} {
  0%, 100% { opacity: ${maxOpacity}; }
  50% { opacity: ${minOpacity}; }
}`;
  return { css, className: cls };
}

/** Continuous in-place float: gentle vertical drift plus an optional rotate wobble, looping forever. */
function createDrift(opts = {}) {
  const {
    duration = '4s', easing = 'easeInOut', delay = '0s',
    amplitude = 8, rotate = 0
  } = opts;
  const cls = uniqueId('cv-drift');
  const kf = `kf-${cls}`;
  const r1 = rotate ? ` rotate(${rotate}deg)` : '';
  const r2 = rotate ? ` rotate(${-rotate}deg)` : '';
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes ${kf} {
  0%, 100% { transform: translateY(0)${r1}; }
  50% { transform: translateY(-${amplitude}px)${r2}; }
}`;
  return { css, className: cls };
}

/** Continuous horizontal sweep (for a gleam clipped to text): holds off-screen, then slides `distance` px across, looping. */
function createSweep(opts = {}) {
  const {
    duration = '5s', easing = 'linear', delay = '0s',
    distance = 1000, holdPct = 55
  } = opts;
  const cls = uniqueId('cv-sweep');
  const kf = `kf-${cls}`;
  // The swept element is authored off-screen-left; it holds there for holdPct of
  // the cycle, then sweeps fully across (and past) before looping — a periodic gleam.
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
}
@keyframes ${kf} {
  0%, ${holdPct}% { transform: translateX(0); }
  100% { transform: translateX(${distance}px); }
}`;
  return { css, className: cls };
}

function _mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Continuous rotation around the element's own center (loaders, badges, gears). */
function createSpin(opts = {}) {
  const { duration = '3s', easing = 'linear', direction = 'cw', from = 0, to = 360 } = opts;
  const cls = uniqueId('cv-spin');
  const kf = `kf-${cls}`;
  const sign = direction === 'ccw' ? -1 : 1;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes ${kf} {
  from { transform: rotate(${sign * from}deg); }
  to   { transform: rotate(${sign * to}deg); }
}`;
  return { css, className: cls };
}

/** Gentle scale "breathing" loop around the element's center (logos, idle marks). */
function createPulse(opts = {}) {
  const { duration = '2.4s', easing = 'easeInOut', delay = '0s', minScale = 0.96, maxScale = 1.04 } = opts;
  const cls = uniqueId('cv-pulse');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes ${kf} {
  0%, 100% { transform: scale(${minScale}); }
  50% { transform: scale(${maxScale}); }
}`;
  return { css, className: cls };
}

/** Expanding ring: scales outward from center while fading — a "ripple"/sonar pulse. */
function createRipple(opts = {}) {
  const {
    duration = '1.8s', easing = 'easeOut', delay = '0s',
    startScale = 0.4, endScale = 1.4, startOpacity = 0.5, endOpacity = 0
  } = opts;
  const cls = uniqueId('cv-ripple');
  const kf = `kf-${cls}`;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes ${kf} {
  0% { opacity: ${startOpacity}; transform: scale(${startScale}); }
  100% { opacity: ${endOpacity}; transform: scale(${endScale}); }
}`;
  return { css, className: cls };
}

/** Orbital sweep: an element traces a circle of `radius` around its own center, staying upright. */
function createOrbit(opts = {}) {
  const { duration = '4s', easing = 'linear', radius = 20, direction = 'cw' } = opts;
  const cls = uniqueId('cv-orbit');
  const kf = `kf-${cls}`;
  const sign = direction === 'ccw' ? -1 : 1;
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes ${kf} {
  from { transform: rotate(0deg) translateX(${radius}px) rotate(0deg); }
  to   { transform: rotate(${sign * 360}deg) translateX(${radius}px) rotate(${-sign * 360}deg); }
}`;
  return { css, className: cls };
}

/** Slow layer drift for scene depth — a back layer eases a few px on one axis and returns. */
function createParallaxDrift(opts = {}) {
  const { duration = '12s', easing = 'easeInOut', delay = '0s', distance = 24, axis = 'x' } = opts;
  const cls = uniqueId('cv-parallax');
  const kf = `kf-${cls}`;
  const fn = axis === 'y' ? 'translateY' : 'translateX';
  const css = `.${cls} {
  animation: ${kf} ${duration} ${cssEasing[easing]} infinite ${delay};
}
@keyframes ${kf} {
  0%, 100% { transform: ${fn}(0); }
  50% { transform: ${fn}(${distance}px); }
}`;
  return { css, className: cls };
}

/**
 * A field of N drifting accents with SEEDED-deterministic per-item variation.
 * Promotes chan-cover's hand-tuned drifting-square array into a reusable generator.
 * Determinism: uses a seeded PRNG (never Math.random/Date.now) so snapshots are stable.
 * Returns { items: [{ css, className }], css } — css is all item rules joined.
 * Each item is a createDrift with varied duration/amplitude/rotate/delay.
 */
function createParticleStagger(opts = {}) {
  const {
    count = 6, seed = 1,
    baseDuration = 4, durationJitter = 1.2,
    amplitude = 8, amplitudeJitter = 3,
    rotateMax = 8, maxDelay = 1, easing = 'easeInOut'
  } = opts;
  const rand = _mulberry32(seed);
  const items = [];
  const cssParts = [];
  for (let i = 0; i < count; i++) {
    const dur = (baseDuration + (rand() * 2 - 1) * durationJitter).toFixed(2) + 's';
    const amp = Math.max(1, Math.round(amplitude + (rand() * 2 - 1) * amplitudeJitter));
    const rot = Math.round((rand() * 2 - 1) * rotateMax);
    const delay = (rand() * maxDelay).toFixed(2) + 's';
    const d = createDrift({ duration: dur, amplitude: amp, rotate: rot, delay, easing });
    items.push(d);
    cssParts.push(d.css);
  }
  return { items, css: cssParts.join('\n') };
}

module.exports = {
  uniqueId, resetIdCounter,
  createJump, createBob, createTalk, createWaveArm, createEarBounce,
  createShadowScale, createShadowPulse,
  createSoundWaveExpand, createFloatingNote, createVoiceRing,
  createRevealUp, createBlink, createShimmer,
  createDrift, createSweep,
  createSpin, createPulse, createRipple, createOrbit,
  createParallaxDrift, createParticleStagger
};

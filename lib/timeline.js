// Timeline — an orchestration module (sibling to scene.js), NOT a primitive.
// Motion primitives loop on their own clocks. A product demo needs a schedule:
// this appears at 3 s, that is gone by 8 s, ten scenes share one choreography.
// A timeline writes every rule on ONE loop duration, so the whole piece seams
// once, and it writes the FINISHED frame as the base state so reduced motion
// leaves a complete picture. See docs/product-cards.md.

/**
 * @param {{ duration: number, prefix?: string }} opts  loop length in seconds
 */
function createTimeline({ duration, prefix = 'tl' }) {
  if (!(duration > 0)) throw new Error('timeline: duration must be a positive number of seconds');
  const T = duration;
  const rules = [];
  const names = new Set();
  let auto = 0;

  /** Seconds → keyframe percentage on this loop. */
  const pct = (t) => `${Math.max(0, Math.min(100, (t / T) * 100)).toFixed(3)}%`;

  function rule(name, frames, { timing = 'linear', base = '' } = {}) {
    if (!names.has(name)) {
      rules.push(`@keyframes ${name}{${frames}}\n.${name}{${base}animation:${name} ${T}s ${timing} infinite}`);
      names.add(name);
    }
    return name;
  }
  const next = (kind) => `${prefix}-${kind}${++auto}`;

  /** Shown from `t` to the end of the loop. Part of the still frame. */
  function on(t, { fade = 0.3, name } = {}) {
    const n = rule(name || next('on'), `0%,${pct(t)}{opacity:0}${pct(t + fade)},100%{opacity:1}`);
    return { className: n, attrs: `class="${n}"` };
  }

  /** Shown only between `a` and `b`. Absent from the still frame. */
  function span(a, b, { fade = 0.25, name } = {}) {
    const frames = a <= 0
      ? `0%,${pct(b)}{opacity:1}${pct(b + fade)},100%{opacity:0}`
      : `0%,${pct(a)}{opacity:0}${pct(a + fade)},${pct(b)}{opacity:1}${pct(b + fade)},100%{opacity:0}`;
    const n = rule(name || next('sp'), frames);
    // the attribute hides it when animations are off; the animation overrides it while running
    return { className: n, attrs: `class="${n}" opacity="0"` };
  }

  /** Shown from the start of the loop until `t`. Absent from the still frame. */
  function until(t, opts = {}) {
    return span(0, t, opts);
  }

  /**
   * A rule written by hand on this loop. `frames` may be a string or a function
   * of `pct`. Returns the class name.
   */
  function keyframes(frames, { name, timing, base } = {}) {
    return rule(name || next('kf'), typeof frames === 'function' ? frames(pct) : frames, { timing, base });
  }

  /**
   * Run a rule that was written relative to t = 0 as if it started at `start`.
   * An animation of duration T with delay d shows phase (t - d) mod T, and a
   * negative delay never waits, so ten scenes can share one set of keyframes.
   * Returns the inline style to put on the element.
   */
  function shift(start) {
    return `animation-delay:${(start - T).toFixed(2)}s`;
  }

  /**
   * A cover that slides off a row of text one character at a time. Put the
   * returned class on a rect the colour of the page, drawn over the text and
   * clipped to its container. Written relative to `start`; use shift() to reuse.
   */
  function cover({ start = 0, chars, width, cps = 30, name }) {
    const end = start + chars / cps;
    return rule(
      name || next('cv'),
      `0%,${pct(start)}{transform:translateX(0);animation-timing-function:steps(${chars},end)}${pct(end)},100%{transform:translateX(${width}px)}`,
      { base: `transform:translateX(${width}px);` },
    );
  }

  /** Start times of consecutive scenes. `durations` in seconds. */
  function sequence(durations) {
    const starts = [];
    let t = 0;
    for (const d of durations) {
      starts.push(t);
      t += d;
    }
    if (t > T + 1e-6) throw new Error(`timeline: scenes total ${t}s but the loop is ${T}s`);
    return starts;
  }

  return { duration: T, pct, on, span, until, keyframes, shift, cover, sequence, css: () => rules.join('\n') };
}

module.exports = { createTimeline };

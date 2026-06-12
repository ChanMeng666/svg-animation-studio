import { describe, it, expect } from 'vitest';
import presets from '../../lib/presets/index.js';

// Guards the invariant from CLAUDE.md Critical Rule 3 / docs/extension-protocol.md
// rule 3 / issue #1: every preset's compose() MUST call motion.resetIdCounter()
// as its first line, so generated class names are deterministic across renders.
// Without it, the byte-stable snapshot contract silently breaks on the SECOND
// render (the module-global id counter has advanced).

const entries = Object.entries(presets);

describe('preset determinism — the motion.resetIdCounter() invariant', () => {
  // The REAL symptom of a missing reset is that compose() drifts across calls.
  // Testing that directly catches it regardless of how the preset is written.
  for (const [name, preset] of entries) {
    it(`${name}: compose() is byte-identical across repeated calls`, () => {
      const first = preset.compose();
      const second = preset.compose();
      expect(
        second,
        `${name}: compose() is non-deterministic — its first line must be motion.resetIdCounter()`,
      ).toBe(first);
    });
  }

  it('no preset leaks the id counter into another (render-order independence)', () => {
    // Mirrors the issue's failure mode: "second npm test run, after touching
    // anything else". Snapshot a cold render of each preset, churn the shared
    // counter by rendering the whole catalog, then confirm each still matches.
    const cold = Object.fromEntries(entries.map(([n, p]) => [n, p.compose()]));
    for (const [, p] of entries) p.compose(); // advance the global counter
    for (const [n, p] of entries) {
      expect(
        p.compose(),
        `${n} changed after other presets rendered — missing motion.resetIdCounter()?`,
      ).toBe(cold[n]);
    }
  });
});

describe('preset source guard — resetIdCounter() is called before any primitive', () => {
  for (const [name, preset] of entries) {
    const src = preset.compose.toString();
    if (!/motion\.create/.test(src)) continue; // no motion primitives → no counter to reset
    it(`${name}: compose() calls motion.resetIdCounter() first`, () => {
      const resetIdx = src.indexOf('resetIdCounter');
      expect(
        resetIdx,
        `${name}: compose() must call motion.resetIdCounter() (determinism invariant)`,
      ).toBeGreaterThan(-1);
      const firstCreate = src.search(/\.create[A-Z]/);
      if (firstCreate > -1) {
        expect(
          resetIdx,
          `${name}: motion.resetIdCounter() must come BEFORE the first .createX() call`,
        ).toBeLessThan(firstCreate);
      }
    });
  }
});

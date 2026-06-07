# lib API Reference

> Every public function in `lib/`. CLAUDE.md indexes names; this file is the
> contract. Updated whenever a primitive is added (via `/svg-add-primitive`).
>
> 25 primitives shipped in Sprint 1 (10 motion / 11 shapes / 4 filters).

## Return-value convention

| Category | Returns |
|---|---|
| `motion.*` | `{ css: string, className: string }` — composer merges css into `<style>`; preset attaches className to target |
| `shapes.*` | `string` — raw SVG element (rect / g / ellipse / clipPath / linearGradient / ...) |
| `filters.*` | `string` — raw `<filter>` element; placed in `<defs>` |

Counters: `motion.resetIdCounter()` is called at the start of each preset's
`compose()`, so generated class names are deterministic per render. Without
this, snapshots drift between calls.

---

## motion.*

All motion primitives accept an `opts` object with sensible defaults; they
return `{ css, className }`.

### `createJump(opts)`

Squash-and-stretch jump loop with synced apex/landing keyframes.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.5s'` |
| `easing` | key of cssEasing | `'easeInOut'` |
| `peakY` | number (px) | `18` |
| `midY` | number (px) | `16` |
| `landDip` | number (px) | `5` |
| `squashRiseX` / `squashRiseY` | number | `0.95` / `1.1` |
| `squashApexX` / `squashApexY` | number | `0.98` / `1.05` |
| `squashLandX` / `squashLandY` | number | `1.05` / `0.95` |
| `transformOrigin` | CSS string | `'center bottom'` |

Used by: `claude-jumping`, `codex-jumping`. Source: `claude-jumping.svg:26-31`.

### `createBob(opts)`

Gentle vertical idle loop. Use when a character should "breathe" while
speaking or waiting.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.8s'` |
| `easing` | key of cssEasing | `'easeInOut'` |
| `amplitude` | number (px) | `3` |

Used by: `claude-speaking`, `codex-speaking`. Source: `claude-speaking.svg:43-46`.

### `createTalk(opts)`

Mouth opens and closes via Y-scale.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.3s'` |
| `closedScale` | number | `0.5` |

Used by: `claude-speaking`, `codex-speaking`. Source: `claude-speaking.svg:51-54`.

### `createWaveArm(opts)`

Symmetric arm wave. Side decides rotation direction and transform origin.

| opt | type | default |
|---|---|---|
| `side` | `'left' \| 'right'` | `'left'` |
| `duration` | string | `'0.5s'` |
| `angle` | number (deg) | `25` |

Used by: `claude-jumping` (both arms), `codex-jumping` (both arms),
`claude-speaking` (ear tilt at angle 5). Source: `claude-jumping.svg:36-43`.

### `createEarBounce(opts)`

Vertical scale bounce for paired stagger.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.5s'` |
| `delay` | string | `'0s'` |
| `peakScale` | number | `1.2` |
| `dipScale` | number | `0.85` |

Used by: `claude-jumping` (paired with 0.1s stagger). Source: `claude-jumping.svg:44-48`.

### `createShadowScale(opts)`

Ground shadow shrinks when a character jumps. Inverse of `createJump`.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.5s'` |
| `minScale` | number | `0.4` |
| `maxOpacity` | number | `0.25` |
| `minOpacity` | number | `0.08` |

Used by: `claude-jumping`, `codex-jumping`. Source: `claude-jumping.svg:32-35`.

### `createShadowPulse(opts)`

Gentler shadow scale for `createBob` companion. Slower, less extreme than
`createShadowScale`.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.8s'` |
| `minScale` | number | `0.9` |
| `maxOpacity` | number | `0.25` |
| `minOpacity` | number | `0.2` |

Used by: `claude-speaking`, `codex-speaking`. Source: `claude-speaking.svg:47-50`.

### `createSoundWaveExpand(opts)`

Outward-expanding scale with fadeout. Apply to an arc path; stagger multiple
instances to make a sound wave fan.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.8s'` |
| `easing` | string | `'easeOut'` |
| `delay` | string | `'0s'` |
| `startScaleX` / `startScaleY` | number | `0.3` / `0.8` |
| `endScaleX` / `endScaleY` | number | `1.2` / `1` |

Used by: `claude-speaking` × 3 staggered, `codex-speaking` × 3 staggered.
Source: `claude-speaking.svg:63-66`.

### `createFloatingNote(opts)`

Drift + rotate + fade. Apply to a music-note `<g>`.

| opt | type | default |
|---|---|---|
| `duration` | string | `'1.5s'` |
| `delay` | string | `'0s'` |
| `dx` / `dy` | number (px) | `15` / `-25` |
| `rotate` | number (deg) | `15` |

Used by: `claude-speaking` × 3 with different drifts, `codex-speaking` × 3.
Source: `claude-speaking.svg:67-78`.

### `createVoiceRing(opts)`

Subtle scale-and-opacity pulse for ambient rings around a voice source.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.8s'` |
| `delay` | string | `'0s'` |
| `centerX` / `centerY` | number (px) | `100` / `80` |
| `peakScale` | number | `1.05` |
| `minOpacity` / `maxOpacity` | number | `0.1` / `0.25` |

Used by: `codex-speaking` × 2 staggered. Source: `codex-speaking.svg:166-177`.

---

### `createRevealUp(opts)`

One-shot entrance: the target fades in while sliding up from `distance` px, then
holds. Runs a single iteration with `fill-mode: both`, so it stays at the `from`
state during `delay` (stagger) and settles on `to`. The element's own base style
must be the final/visible state, so `prefers-reduced-motion` shows the finished frame.

| opt | type | default |
|---|---|---|
| `duration` | string | `'0.7s'` |
| `easing` | string | `'easeOutBack'` |
| `delay` | string | `'0s'` |
| `distance` | number (px) | `12` |

Used by: `chan-cover` (name / rule / tagline / positioning, staggered).

### `createBlink(opts)`

Occasional blink: the target scales vertically to a thin slit at 96% of the cycle,
open the rest of the time. Uses `transform-box: fill-box; transform-origin: center`
so wrapping a pair of eyes closes them toward their shared centre line. `duration`
sets the gap between blinks.

| opt | type | default |
|---|---|---|
| `duration` | string | `'6s'` |
| `easing` | string | `'easeInOut'` |
| `closedScale` | number | `0.1` |

Used by: `chan-cover` (the monkey's two eye circles).

### `createShimmer(opts)`

Slow opacity shimmer: a quiet pulse between `maxOpacity` and `minOpacity`. For a
single restrained accent (not a whole composition).

| opt | type | default |
|---|---|---|
| `duration` | string | `'7s'` |
| `easing` | string | `'easeInOut'` |
| `minOpacity` / `maxOpacity` | number | `0.78` / `1` |

Used by: `chan-cover` (the orange rule).

### `createDrift(opts)`

Continuous in-place float: a gentle vertical bob plus an optional rotate wobble,
looping forever. Uses `transform-box: fill-box; transform-origin: center` so it
sways around the element's own centre — good for floating accents and idle motion.

| opt | type | default |
|---|---|---|
| `duration` | string | `'4s'` |
| `easing` | string | `'easeInOut'` |
| `delay` | string | `'0s'` |
| `amplitude` | number (px) | `8` |
| `rotate` | number (deg) | `0` |

Used by: `chan-cover` (the monkey lockup + 7 drifting pixel-squares, each staggered).

### `createSweep(opts)`

Continuous horizontal sweep for a gleam clipped to text/shape: the element holds
off-screen for `holdPct` of the cycle, then slides `distance` px across (and past)
before looping — a periodic shine. The swept element must be authored off-screen
(e.g. negative `x`) so the reduced-motion base state is invisible.

| opt | type | default |
|---|---|---|
| `duration` | string | `'5s'` |
| `easing` | string | `'linear'` |
| `delay` | string | `'0s'` |
| `distance` | number (px) | `1000` |
| `holdPct` | number (0–100) | `55` |

Used by: `chan-cover` (a glare gleam clipped to the "Chan Meng" wordmark).

---

## shapes.*

### `createGroundShadow({ cx, cy, rx, ry, color?, applyClass? })`

Returns `<ellipse>`. Bind to `createShadowScale` / `createShadowPulse`.

### `createPixelCharacter({ color?, eyeColor?, armY?, mouth?, applyClasses? })`

Returns Claude-style pixel-art `<g>` body. `mouth` is `{x, y, w, h, applyClass}` or omit. `applyClasses` keys: `body`, `leftEar`, `rightEar`, `leftArm`, `rightArm`, `mouth`.

Used by: `claude-jumping`, `claude-speaking`.

### `createCodexCharacter({ bodyGradId, cloudClipId, innerDepthId, armLGradId, armRGradId, limbGradId, eyeGradId, pose?, mouth?, applyClasses? })`

Returns Codex-style cloud `<g>` body. `pose: 'jumping' | 'speaking'` adjusts
coordinates. `mouth` is `{ cx, cy, rx, ry, fill?, opacity?, applyClass? }`.

Used by: `codex-jumping` (pose: `'jumping'`), `codex-speaking` (pose: `'speaking'`).

### `createCloudClipPath({ id, circles? })`

Returns `<clipPath>` containing N `<circle>` elements (default: 7-circle cloud silhouette).

### `createGradientStops({ stops })`

Returns `<stop>` elements as a string. `stops` is array of `{ offset, color, opacity? }`.

### `createLinearGradient({ id, x1, y1, x2, y2, stops })` / `createRadialGradient({ id, cx, cy, r, stops })`

Convenience wrappers that emit a full `<linearGradient>` / `<radialGradient>` with stops.

### `createMusicalNote({ kind, x, y, color?, applyClass? })`

`kind` is `'eighth' | 'quarter' | 'double'`. Returns a `<g>` musical note.

### `createSoundWaveArc(opts)` / `createSoundWaveArcRaw(opts)`

Arc paths for sound waves. Use `*Raw` when caller wants to pass exact `d`
(used by `claude-speaking` for parity with the original).

### `createCharacterMouth({ x, y, w, h, color?, applyClass? })`

Standalone mouth `<rect>`. Used when a character template doesn't include
its own mouth.

---

## filters.*

All return a `<filter>` element with the given `id`. Drop into `<defs>`.

### `createDropShadow({ id, dx?, dy?, stdDeviation?, floodColor?, floodOpacity?, ... })`

`feDropShadow`-based outer shadow.

### `createInnerDepth({ id, stdDeviation?, dy?, floodColor?, floodOpacity?, ... })`

Inner-shadow via blur + offset + flood + composite + merge.

### `createSoftGlow({ id, stdDeviation? })`

Outer glow for sound waves (`stdDeviation` default 1.5).

### `createNoteGlow({ id, stdDeviation? })`

Softer glow for music notes (`stdDeviation` default 2, wider filter region).

---

## composer.*

### `composeSVG({ viewBox, width?, height?, style?, defs?, body?, title?, desc? })`

Assemble a complete SVG document. Inserts XML decl + namespaced root +
optional `<title>` `<desc>` `<style>` `<defs>` blocks, then the `body`
verbatim.

### `escapeXml(text)`

Replace `& < > " '` with entities.

### `indent(text, spaces)`

Indent each non-empty line by `spaces` spaces (used internally by composer).

---

## easing.*

### `cssEasing`

| key | value |
|---|---|
| `linear`        | `linear` |
| `easeInOut`     | `ease-in-out` |
| `easeIn`        | `ease-in` |
| `easeOut`       | `ease-out` |
| `easeOutBack`   | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `easeInBounce`  | `cubic-bezier(0.215, 0.61, 0.355, 1)` |
| `bouncy`        | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` |
| `smooth`        | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `snappy`        | `cubic-bezier(0.4, 0, 0, 1)` |

### `smilSplines`

Same names where defined. SMIL `keySplines` format, e.g. `'0.42 0 0.58 1'`.

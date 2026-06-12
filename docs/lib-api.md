# lib API Reference

> Every public function in `lib/`. CLAUDE.md indexes names; this file is the
> contract. Primitives are added via `/svg-add-primitive`; the data/orchestration
> modules (`palettes`, `scene`, `easing`, `composer`) are edited directly.
>
> 39 primitives (16 motion / 16 shapes / 4 filters / 3 decor), plus the
> `palettes` (theme system), `scene` (layer composer), `easing`, and `composer`
> modules. The motion/shapes/decor additions + palettes + scene composer are
> what make chan-cover-level covers, banners, logos and loaders repeatable.

## Return-value convention

| Category | Returns |
|---|---|
| `motion.*` | `{ css: string, className: string }` — composer merges css into `<style>`; preset attaches className to target |
| `shapes.*` | `string` — raw SVG element (rect / g / ellipse / clipPath / linearGradient / ...) |
| `filters.*` | `string` — raw `<filter>` element; placed in `<defs>` |
| `decor.*` | `{ defs: string, body: string }` — a `<defs>` fragment (pattern/gradient/clipPath) + the body element that references it; pair with `scene.layer(body, { defs })` |

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

### `createSpin(opts)`

Continuous rotation around the element's own centre (`transform-box: fill-box`).
For loaders, badges, gears. Make the target visually asymmetric (e.g. a dashed
ring) or the spin won't read.

| opt | type | default |
|---|---|---|
| `duration` | string | `'3s'` |
| `easing` | string | `'linear'` |
| `direction` | `'cw' \| 'ccw'` | `'cw'` |
| `from` / `to` | number (deg) | `0` / `360` |

Used by: `orbit-spinner`, `orbit-logo`, `spin-badge`.

### `createPulse(opts)`

Gentle scale "breathing" loop around the element's centre. For logos and idle
marks. Base (un-animated) state is natural size → reduced-motion shows it at rest.

| opt | type | default |
|---|---|---|
| `duration` | string | `'2.4s'` |
| `easing` | string | `'easeInOut'` |
| `delay` | string | `'0s'` |
| `minScale` / `maxScale` | number | `0.96` / `1.04` |

Used by: `dot-loader`, `star-loader`, `spin-badge`, `pulse-mono-logo`, `orbit-logo`, `gradient-cover`, `brand-cover`, `bounce-char`.

### `createRipple(opts)`

Expanding ring: scales outward from centre while fading — a sonar/ripple pulse.
Generalises `createSoundWaveExpand`. Stagger several for concentric waves.

| opt | type | default |
|---|---|---|
| `duration` | string | `'1.8s'` |
| `easing` | string | `'easeOut'` |
| `delay` | string | `'0s'` |
| `startScale` / `endScale` | number | `0.4` / `1.4` |
| `startOpacity` / `endOpacity` | number | `0.5` / `0` |

Used by: `ripple-loader` (× 3 staggered).

### `createOrbit(opts)`

Orbital sweep: the element traces a circle of `radius` around its own centre while
staying upright (double counter-rotation). Place the element AT the orbit centre.

| opt | type | default |
|---|---|---|
| `duration` | string | `'4s'` |
| `easing` | string | `'linear'` |
| `radius` | number (px) | `20` |
| `direction` | `'cw' \| 'ccw'` | `'cw'` |

Used by: `orbit-spinner`, `orbit-logo`, `repo-hero`, `brand-cover`.

### `createParallaxDrift(opts)`

Slow one-axis layer drift for scene depth — a back layer eases a few px and
returns. Wrap an over-wide element so the drift never exposes an edge.

| opt | type | default |
|---|---|---|
| `duration` | string | `'12s'` |
| `easing` | string | `'easeInOut'` |
| `delay` | string | `'0s'` |
| `distance` | number (px) | `24` |
| `axis` | `'x' \| 'y'` | `'x'` |

Used by: `drift-field`, `hero-strip`.

### `createParticleStagger(opts)`

A field of N drifting accents with **seeded-deterministic** per-item variation —
promotes chan-cover's hand-tuned drifting-square array into a generator. Returns
`{ items: [{ css, className }], css }`; map `items[i].className` onto element i.
Uses a seeded PRNG (never `Math.random`/`Date.now`) so snapshots stay stable.

| opt | type | default |
|---|---|---|
| `count` | number | `6` |
| `seed` | number | `1` |
| `baseDuration` / `durationJitter` | number (s) | `4` / `1.2` |
| `amplitude` / `amplitudeJitter` | number (px) | `8` / `3` |
| `rotateMax` | number (deg) | `8` |
| `maxDelay` | number (s) | `1` |
| `easing` | string | `'easeInOut'` |

Used by: `drift-field`, `accent-card`, `hero-strip`, `gradient-cover`, `brand-cover`.

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

### `createAccentSquare({ x, y, size?, fill?, applyClass? })`

A single brand pixel-square accent (`<rect>`). Bind to a `createDrift` /
`createParticleStagger` item. Used by: `accent-card`, `hero-strip`, `gradient-cover`, `brand-cover`.

### `createBadgeShape({ x, y, w?, h?, rx?, fill?, stroke?, strokeWidth?, applyClass? })`

Rounded-rect / pill badge container (`<rect rx>`). Used by: `spin-badge`, `pulse-mono-logo`.

### `createStar({ cx, cy, points?, outerR?, innerR?, fill?, applyClass? })`

N-point star / sparkle (`<polygon>`). `points` = number of star points;
`outerR`/`innerR` set spikiness. Used by: `star-loader`, `spin-badge`, `orbit-logo`, `gradient-cover`, `brand-cover`.

### `createBurst({ cx, cy, size?, thickness?, fill?, applyClass? })`

A 4-point diamond-spike sparkle (`<polygon>`); `thickness` (0–1) sets waist width.
Used by: `spin-badge`, `repo-hero`, `pulse-mono-logo`, `brand-cover`.

### `createPanel({ x, y, w?, h?, rx?, fill?, stroke?, strokeWidth?, dashed?, dashArray?, applyClass? })`

Decorative card / panel — rounded `<rect>` with optional dashed stroke (the
chan-cover card). Used by: `accent-card`, `hero-strip`, `repo-hero`, `gleam-banner`, `pulse-mono-logo`, `gradient-cover`, `brand-cover`.

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

## decor.*

Composite background / decoration recipes promoted from the chan-cover preset.
Each returns `{ defs, body }` (a `<defs>` fragment + the body element that
references it) — pair with `scene.layer(body, { defs })`.

### `createDotGridBackground({ id, x?, y?, width, height, gap?, dotR?, color?, opacity? })`

Low-opacity dotted `<pattern>` filled over a `<rect>` — chan-cover's dot-grid
backdrop. Used by: `drift-field`(inline), `hero-strip`, `gradient-cover`, `repo-hero`, `brand-cover`.

### `createGradientWash({ id, kind?, stops?, from?, to?, angle?, x?, y?, width, height, applyClass?, animate? })`

Full-canvas gradient fill. `kind: 'linear' | 'radial'`; `angle` (deg) sets the
linear direction; pass `stops` for a multi-stop ramp or `from`/`to` for two.
`animate` (`true` or `{ dur }`) adds a SMIL gradient sweep — **runs as an `<img>`
but ignores `prefers-reduced-motion`**, so use only where subtle motion is fine.
Used by: `hero-strip` (static), `gradient-cover` / `repo-hero` (animated).

### `createTextGleamClip({ id, pathD?, clipContent?, transform?, gleamColor?, gleamOpacity?, rectX?, rectY?, rectW?, rectH?, angle?, rotateCenter?, sweepClassName? })`

A `<clipPath>` (of an outlined-text/shape path, OR arbitrary `clipContent` — e.g.
a duplicate `<text>` for system-font gleams) + a soft swept gradient rect — the
chan-cover headline gleam. Pair the inner rect with a `createSweep` class
(`sweepClassName`) to make the sheen travel across the letters.
Used by: `gleam-banner` (pathD), `brand-cover` (clipContent = the live `<text>`).

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
| `elastic`       | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` |
| `anticipate`    | `cubic-bezier(0.36, 0, 0.66, -0.56)` |
| `bouncyCubic`   | `cubic-bezier(0.5, 2, 0.5, 1)` |

### `smilSplines`

Same names where defined. SMIL `keySplines` format, e.g. `'0.42 0 0.58 1'`.
Note: overshoot curves (`elastic` / `anticipate` / `bouncyCubic`) are CSS-only —
their control points fall outside `[0,1]`, which is invalid for SMIL `keySplines`.

---

## palettes.* (theme system)

Curated named palettes — a data module (sibling to `easing`). A palette token
object is `{ name, category, label, dark, bg, bgAlt, ink, muted, accents:[…], line }`.
Reference an accent by **index** (`pal.accents[0]`), never by colour name, so a
preset stays portable across palettes. 8 sets: `caldera` (the exact chan-cover
Caldera tokens), `mono`, `midnight`, `sunset`, `nature`, `neon`, `pastel`, `ocean`.

### `getPalette(name?)`

Returns the frozen palette object (default `'caldera'`); throws on an unknown name.

### `listPalettes()`

Returns `[{ name, category, label, dark }]` — used by the playground palette switcher.

---

## scene.* (layer composer)

An orchestration helper that sits BELOW `composeSVG`: a preset builds ordered
layers, `composeScene` returns `{ body, defs, style }`, then the preset still
calls `composeSVG` to wrap the document.

### `composeScene({ layers, defs?, style? })`

Assembles `layers` (back-to-front) into a `body` string and collects each layer's
`defs`. The key job: when a layer has BOTH a static `transform` and an animated
`className`, it emits the two-level nested `<g>` automatically (outer = static
transform; inner = animated class, no transform attr) — the Gotcha-2 split in
`docs/embedding-animated-svg.md`, handled for you. Returns `{ body, defs, style }`
ready to spread into `composeSVG`.

### `layer(content, opts?)`

Builds a layer descriptor: `content` is an SVG markup string; `opts` may include
`{ transform, className, clip, filter, opacity, defs }`.

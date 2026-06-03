# Preset Cookbook — What to Reach For

> A request-to-primitive mapping. When in doubt, search here first before
> re-reading `lib-api.md`. Updated as presets multiply.

## Motion intent → first primitive to try

| User says | Reach for | Companion primitives |
|---|---|---|
| "jumping", "hopping", "bouncing up" | `motion.createJump` | `motion.createShadowScale` (always pair!) |
| "idle", "breathing", "gentle bob", "alive" | `motion.createBob` | `motion.createShadowPulse` |
| "talking", "speaking", "lip sync" | `motion.createTalk` | `motion.createBob` for body, `motion.createSoundWaveExpand` × 3 for waves |
| "waving", "saluting", "high-five" | `motion.createWaveArm({side})` | use `left` + `right` symmetric |
| "ear flick", "antenna twitch", "wiggle" | `motion.createEarBounce` | stagger second instance by `0.1s` |
| "soundwave", "audio pulse" | `motion.createSoundWaveExpand` × 3 staggered | wrap a path in a `<g class="...">` |
| "music notes floating up" | `motion.createFloatingNote` × 3 staggered | `shapes.createMusicalNote({kind: eighth/quarter/double})` |
| "voice rings", "aura" | `motion.createVoiceRing` × 2 | use light strokes, low opacity |

## Style cue → shapes / filters

| User says | Reach for |
|---|---|
| "pixel art", "8-bit", "blocky", "retro" | `shapes.createPixelCharacter` — no filters, sharp rectangles |
| "cute cloud", "soft", "gradient body" | `shapes.createCodexCharacter` + `shapes.createCloudClipPath` |
| "purple-to-blue body", "iridescent" | `shapes.createLinearGradient` with 5 stops |
| "drop shadow", "lifted" | `filters.createDropShadow` |
| "inner depth", "concave" | `filters.createInnerDepth` |
| "glowing", "neon", "shimmer" | `filters.createSoftGlow` (for accents) or `filters.createNoteGlow` (wider, softer) |

## Composition recipes (proven patterns from existing presets)

### Recipe: Pixel mascot, in-place idle
- `motion.createBob` on body
- `motion.createShadowPulse` on shadow
- Optional: small `motion.createWaveArm` with low angle for ears
- See `lib/presets/claudeSpeaking.js` for the talking variant

### Recipe: Pixel mascot, jumping
- `motion.createJump` on body
- `motion.createShadowScale` on shadow (synced timing)
- `motion.createWaveArm` × 2 (opposing sides) for arms
- `motion.createEarBounce` × 2 with `0.1s` stagger for ears
- See `lib/presets/claudeJumping.js`

### Recipe: Gradient cloud, in-place idle with voice
- Defs: 5 gradients + 2 filters + 1 clipPath
- `motion.createBob` wraps the body group
- `motion.createTalk` on the mouth ellipse
- `motion.createSoundWaveExpand` × 3 staggered on sound-wave paths
- `motion.createFloatingNote` × 3 on music note groups
- `motion.createVoiceRing` × 2 staggered for ambient rings
- See `lib/presets/codexSpeaking.js`

### Recipe: Gradient cloud, jumping
- Same defs as speaking variant minus glow filters
- `motion.createJump` wraps body
- `motion.createShadowScale` on shadow
- `motion.createWaveArm` × 2 for arms
- See `lib/presets/codexJumping.js`

## When no recipe fits

Three signs you need to stop and request a primitive (`/svg-add-primitive`):

1. The motion has a verb not in the table above (e.g., "drift", "shimmer",
   "ripple", "spin orbital", "flicker").
2. The geometry isn't pixel-rectangle and isn't gradient-cloud and isn't a
   simple shape (musical note, sound wave) — e.g., a star, a polygon, a heart.
3. The filter quality requires something beyond drop-shadow / inner-depth /
   glow (e.g., displacement, turbulence, color matrix).

In all three cases, the cleanest path is to ask the user to add the primitive,
then come back. Inline primitives violate the protocol and produce a system
that doesn't compound.

## Color / theming notes

- Claude orange: `#E07C4C` — used by `claude-*` presets
- Codex gradient: `#9333EA → #7C3AED → #5B6CF0 → #3B9AEE → #22D3EE` (5 stops)
- Eye black: `#000000` for pixel, `url(#cx-eye-grad)` (white-to-grey radial) for codex
- Shadow purple: `#4C1D95` with opacity stops for codex ambient shadow
- Sound wave palette: `#C4B5FD` / `#A78BFA` / `#8B5CF6` (lavender progression)

## Quick sanity checks before declaring "done"

1. The preset's `compose()` first line is `motion.resetIdCounter()`.
2. Every motion primitive's returned `className` is attached to exactly one
   element.
3. Every `applyClass` you set is referenced somewhere in the style block.
4. `viewBox` matches `width`/`height` aspect ratio.
5. The snapshot diff (if any) looks sensible.

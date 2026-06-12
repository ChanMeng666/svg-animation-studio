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
| "spinning", "rotating", "loading wheel", "gear" | `motion.createSpin` | give the target an asymmetric shape (dashed ring) or the spin won't read |
| "pulsing", "breathing", "heartbeat", "throb" | `motion.createPulse` | stagger several for a dot-loader |
| "ripple", "sonar", "radar ping", "expanding rings" | `motion.createRipple` × 3 staggered | concentric `<circle>` rings |
| "orbiting", "satellite", "dot circling" | `motion.createOrbit` | place the element AT the orbit centre |
| "parallax", "depth", "slow background drift" | `motion.createParallaxDrift` | wrap an over-wide layer so no edge shows |
| "drifting particles", "floating squares/confetti", "scattered accents" | `motion.createParticleStagger` | map `items[i].className` onto `shapes.createAccentSquare` i |
| "gleam", "sheen", "shine sweeping across text" | `decor.createTextGleamClip` + `motion.createSweep` | clip to a `<path>` (pathD) or a `<text>` (clipContent) |
| "reveal in", "fade up", "staggered entrance" | `motion.createRevealUp` (staggered delays) | author base state = final/visible frame |

## Style cue → shapes / filters

| User says | Reach for |
|---|---|
| "pixel art", "8-bit", "blocky", "retro" | `shapes.createPixelCharacter` — no filters, sharp rectangles |
| "cute cloud", "soft", "gradient body" | `shapes.createCodexCharacter` + `shapes.createCloudClipPath` |
| "purple-to-blue body", "iridescent" | `shapes.createLinearGradient` with 5 stops |
| "drop shadow", "lifted" | `filters.createDropShadow` |
| "inner depth", "concave" | `filters.createInnerDepth` |
| "glowing", "neon", "shimmer" | `filters.createSoftGlow` (for accents) or `filters.createNoteGlow` (wider, softer) |
| "star", "sparkle", "seal", "award" | `shapes.createStar` (n-point) or `shapes.createBurst` (4-point sparkle) |
| "badge", "pill", "chip", "shield" | `shapes.createBadgeShape` |
| "card", "panel", "framed", "dashed border" | `shapes.createPanel({ dashed: true })` |
| "brand square", "pixel accent", "confetti dot" | `shapes.createAccentSquare` (pair with `createParticleStagger`) |
| "dot-grid background", "subtle texture" | `decor.createDotGridBackground` |
| "gradient wash", "animated gradient banner" | `decor.createGradientWash({ animate: true })` (SMIL — runs as `<img>`) |

## Palette / theme workflow (use this for any branded asset)

Don't hardcode hex. Pull a named palette and reference accents by index:

```js
const { getPalette } = require('../palettes');
const pal = getPalette(opts.palette || 'caldera');   // bg, bgAlt, ink, muted, accents[], line, dark
// pal.bg (canvas) · pal.ink (text/marks) · pal.muted (secondary) · pal.accents[0..2] (ramp)
```

8 palettes: `caldera` (the chan-cover brand), `mono`, `midnight`, `sunset`,
`nature`, `neon`, `pastel`, `ocean`. A palette-driven preset retargets to any
brand/mood via `opts.palette` — and the playground palette switcher previews it.

## Scene / layer workflow (use this for any multi-layer composition)

`composeScene` orders layers back-to-front AND solves the static-vs-animated
transform split (Gotcha 2) for you — never hand-nest `<g>` for that again:

```js
const { composeScene, layer } = require('../scene');
const bg = decor.createDotGridBackground({ id, width, height, color: pal.ink });
const scene = composeScene({
  layers: [
    layer(`<rect width=".." height=".." fill="${pal.bg}"/>`),
    layer(bg.body, { defs: bg.defs }),                       // a {defs,body} decor primitive
    layer(titleText, { className: reveal.className }),       // animated class only
    layer(logo, { transform: 'translate(x,y)', className: float.className }), // auto-nests!
  ],
  style: [reveal.css, float.css].join('\n'),
});
return composeSVG({ viewBox, width, height, style: scene.style, defs: scene.defs, body: scene.body, title, desc });
```

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

### Recipe: Brand / personal cover (the chan-cover quality bar, made repeatable)
- Palette-driven via `getPalette`, composed via `composeScene`.
- Backdrop: `decor.createDotGridBackground` + drifting `shapes.createAccentSquare` × N driven by `motion.createParticleStagger`.
- Left copy: name/tagline/positioning each on a `motion.createRevealUp` (staggered delays); accent rule on `motion.createShimmer`.
- Headline gleam: `decor.createTextGleamClip({ clipContent: <duplicate of the name text> })` + `motion.createSweep`.
- Right card: `shapes.createPanel({ dashed: true })` holding a `shapes.createStar` on `motion.createDrift` + `createPulse`, with an orbiting dot (`motion.createOrbit`).
- **Start by forking `lib/presets/brandCover.js`** — it is the template. (`chan-cover` is the frozen reference; don't edit it.)

### Recipe: Repo / project hero banner
- Wide short viewBox (~1200×300/360). `decor.createGradientWash` (optionally `animate: true`) + `decor.createDotGridBackground`.
- Title + tagline in SYSTEM fonts on `motion.createRevealUp`; accent underline on `motion.createShimmer`.
- Fork `lib/presets/heroStrip.js` (left-aligned) or `repoHero.js` (centered) or `gradientCover.js` (full cover).

### Recipe: Animated logo / badge
- `shapes.createBadgeShape` / `createStar` / `createPanel` + `motion.createSpin` / `createPulse` / `createOrbit`.
- Fork `lib/presets/orbitLogo.js`, `pulseMonoLogo.js`, or `spinBadge.js`.

### Recipe: Loader / spinner
- `motion.createPulse` × 3 staggered (dots), `motion.createRipple` × 3 (sonar), or `createSpin` + `createOrbit`.
- Fork `lib/presets/dotLoader.js`, `rippleLoader.js`, or `orbitSpinner.js`.

## When no recipe fits

Three signs you need to stop and request a primitive (`/svg-add-primitive`):

1. The motion has a verb not in the (now much larger) table above — e.g.,
   "flicker", "morph", "type out", "follow a path", "wobble jelly".
2. The geometry isn't covered by the shapes lib — e.g., a heart, a hexagon
   grid, a custom logo silhouette (those need an outlined `<path>`).
3. The filter quality requires something beyond drop-shadow / inner-depth /
   glow (e.g., displacement, turbulence, color matrix).

(Note: "drift", "shimmer", "ripple", "spin", "orbit", "pulse", "parallax",
"star", "badge", "panel", "gleam", "gradient wash" and "dot-grid" all EXIST
now — check the tables above before requesting a primitive.)

In all three cases, the cleanest path is to ask the user to add the primitive,
then come back. Inline primitives violate the protocol and produce a system
that doesn't compound.

## Color / theming notes

- **New presets: don't hardcode hex — use `getPalette` (see the palette workflow
  above).** Reference accents by index so the asset retargets across palettes.
  The legacy `claude-*`/`codex-*` presets predate the palette system and keep
  their literal colors below; that's fine, leave them.
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

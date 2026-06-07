# Embedding animated SVGs (READMEs, GitHub, `<img>`)

Most SVGs this studio produces end up embedded as `<img src="…svg">` — in a
GitHub README, a social card, a docs page. That context is a **restricted image
document**, not an inline `<svg>`. It behaves differently from the `/api/svg`
preview, and the differences cause "it worked in the preview, it's broken on
GitHub" surprises. This page is the checklist of what actually works there and
the gotchas that bit us building the `chan-cover` preset.

## What runs in `<img>` mode

| Feature | Inline `<svg>` (preview) | `<img src>` (GitHub) |
|---|---|---|
| CSS `@keyframes` in `<style>` | ✅ | ✅ **yes — use this** |
| SMIL `<animate>` | ✅ | ✅ (also fine) |
| JavaScript (`<script>`) | ✅ | ❌ stripped |
| External fonts (`font-family`, `@import`, `<link>`) | ✅ | ❌ **not loaded** |
| External images / refs | ✅ | ❌ blocked |
| `transform-box`, `clip-path`, gradients, patterns | ✅ | ✅ |
| `@media (prefers-reduced-motion)` | ✅ | ✅ |

**Takeaway:** animate with CSS `@keyframes` (the studio's default) and keep the
file self-contained. Never depend on JS or external resources.

## Gotcha 1 — Text needs to be OUTLINED to paths

`<img>` mode does not fetch web fonts, so `<text font-family="Anton">` falls back
to a system face — your careful brand type silently becomes Arial/Impact. The fix
is to convert text to vector outlines at **build time** and inline the resulting
`<path>`:

- Use `scripts/outline-text.mjs` (opentype.js): `node scripts/outline-text.mjs --font=assets/fonts/Anton-Regular.ttf --text="Chan Meng" --size=150` → prints the path `d` + advance width. Bake the result into a data module the preset requires (see `lib/presets/chanCoverText.js`).
- Vendored fonts live in `assets/fonts/`.
- Cost: outlined text isn't selectable. Carry the real string in the SVG `<title>`/`<desc>` and the host `<img alt>` for accessibility/SEO.

## Gotcha 2 — A CSS `transform` animation REPLACES the element's `transform` attribute

If an element has `transform="translate(…) scale(…)"` (static positioning) AND a
CSS animation that animates `transform`, the animation **wins** — the element
jumps to the animated transform and loses its positioning. Symptom we hit: the
blink's eyes scaled correctly but flew to the top-left corner.

**Pattern — isolate static vs animated transforms by nesting:**

```html
<g transform="translate(919,175) scale(0.81)">  <!-- STATIC position -->
  <g class="float">                              <!-- ANIMATED transform -->
    …content…
    <g class="blink">…eyes…</g>                  <!-- another animated transform -->
  </g>
</g>
```

Each animated transform gets its own wrapper that carries no `transform`
attribute. For scale-around-self (blink, drift wobble), the motion primitives set
`transform-box: fill-box; transform-origin: center` so they pivot on the
element's own box.

## Gotcha 3 — `prefers-reduced-motion` should fall back to the FINISHED frame

`composeSVG({ reducedMotion: true })` (the default) appends:

```css
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
```

For that to read as "finished" rather than "frozen mid-motion", author each
animated element's **base (un-animated) state as its final/visible state**, and
animate *from* the hidden/offset state:

- Reveal: base `opacity:1`; `@keyframes { from { opacity:0; translateY(12px) } to { … } }` with `fill-mode: both` (see `createRevealUp`).
- One-shot gleam sweep: author the swept rect **off-screen** (negative `x`) so its at-rest position is invisible (see `createSweep`).

## Gotcha 4 — Stock SVGO breaks animations

SVGO's `preset-default` is tuned for static icons. On an animated SVG it collapses
the group nesting from Gotcha 2, relocates `transform-box` origins, minifies
`<style>` (dropping `@keyframes`), and converts animated `<circle>`/`<rect>` to
`<path>`. The repo's root `svgo.config.mjs` disables exactly those plugins and is
picked up automatically by `npx svgo` / `npm run optimize`. **Never** hand-pass
`--enable=preset-default` (also: those `--enable/--disable` flags are SVGO v2; we
run v3, config-only). Always re-verify motion after optimizing.

## Gotcha 5 — Verify in `<img>` mode, not just the inline preview

The `/api/svg` preview renders inline and is too permissive — it will happily show
the right font and run anything. Verify the real target by opening a `file://`
HTML page that embeds the SVG as `<img src="<slug>.svg">` (relative path,
same-origin — `setContent` with a `file://` src is blocked and shows a false
broken-image). Check `img.naturalWidth > 0`, then screenshot. See the `<img>`-mode
step in `svg-verify`.

## Reusable composition recipes (from `chan-cover`)

- **Dot-grid background:** a `<pattern>` of one small low-opacity `<circle>`, filled over the canvas rect.
- **Floating accents:** scatter small `<rect>` squares in the margins, each on its own `createDrift({ amplitude, rotate, delay })` with staggered durations/delays.
- **Text gleam:** a `<clipPath>` of the (outlined) text + a soft-gradient rect swept across it with `createSweep`, clipped so the shine only shows on the letters.

# CLAUDE.md — Repository Map & API Index

> Always-loaded context for any Claude Code session entering this repo.
> Keep this file under 200 lines. Detail belongs in `docs/`.

## 1. What this repo is

`svg-animation-studio` is a composable SVG animation system. A natural-language
request from the user becomes a call into `lib/`, which produces a `.svg` file
that is verified visually via the chrome-devtools MCP, then dropped into
`output/`. The system grows over time: every new preset can reuse all
primitives that came before.

**Entry points** for users:
- `/svg-animate "..."` — main skill: natural language → SVG file
- `/svg-verify <slug>` — visual verification (chrome-devtools MCP, subagent)
- `/svg-add-primitive <category>.<name>` — extend lib safely
- `/svg-export <slug> [--out=path]` — SVGO + accessibility + ship
- `npm run render <preset>` — render an existing preset to `output/`
- `npm run dev` — preview grid at http://localhost:3030

## 2. Directory map

| Path | Purpose |
|---|---|
| `lib/` | Deterministic code. Single source of truth. Skills call this; never duplicate. |
| `lib/primitives/{shapes,motion,filters}.js` | Reusable building blocks. Add via `/svg-add-primitive`, never by hand. |
| `lib/presets/*.js` | Named animation templates (e.g. `claude-jumping`). Each composes primitives. |
| `lib/composer.js` | The only allowed way to assemble a final `<svg>` string. |
| `lib/easing.js` | Named easing curves for both CSS and SMIL. |
| `docs/` | Permanent design memory. Open on demand. |
| `playground/` | Next.js preview server. `/api/svg?preset=NAME` returns SVG. |
| `output/` | Final `.svg` artifacts (gitignored). |
| `ref/` | User-provided reference material (sketches, videos, sample SVGs). |
| `tests/snapshot/` | Vitest snapshots of every preset's output. Guards against regressions. |
| `tests/visual/` | (optional) Playwright pixel diffs. |
| `.claude/skills/` | Project-level skills: `svg-animate`, `svg-verify`, `svg-add-primitive`, `svg-export`. |
| `.claude/agents/` | Project-level subagents: `svg-verifier`, `lib-extender`, `svg-explorer`. |
| `agent-sdk-wrapper/` | Sprint 4 scaffolding for productizing as an Agent SDK package. Inactive by default; see its README. |

## 3. lib API index

> Names only. Full signatures live in `docs/lib-api.md`. Open that file when
> composing a preset or extending a primitive.

**`lib/primitives/motion.js`** — animation kinematics (15)
- `createJump` — squash-and-stretch jump with synced shadow hook
- `createBob` — gentle vertical idle loop
- `createTalk` — mouth open/close via Y-scale
- `createWaveArm` — symmetric arm wave (left/right)
- `createEarBounce` — vertical scale bounce, supports stagger delay
- `createShadowScale` — ground shadow synced to `createJump` (extreme)
- `createShadowPulse` — gentler shadow scale synced to `createBob`
- `createSoundWaveExpand` — outward scale with fadeout for arcs
- `createFloatingNote` — drift + rotate + fade for music notes
- `createVoiceRing` — gentle scale-and-opacity pulse around voice source
- `createRevealUp` — one-shot fade + slide-up entrance (staggerable, holds)
- `createBlink` — occasional eye-blink via brief Y-scale slit
- `createShimmer` — slow opacity shimmer for a single restrained accent
- `createDrift` — continuous in-place float (bob + optional rotate wobble)
- `createSweep` — periodic horizontal gleam sweep (holds off-screen, then crosses)

**`lib/primitives/shapes.js`** — reusable geometry (11)
- `createGroundShadow` — `<ellipse>` shadow with class hook
- `createPixelCharacter` — Claude-style pixel-art body group
- `createCodexCharacter` — Codex-style cloud body group (pose: jumping/speaking)
- `createCloudClipPath` — 7-circle cloud silhouette as `<clipPath>`
- `createGradientStops` — `<stop>` list helper
- `createLinearGradient` — full `<linearGradient>` factory
- `createRadialGradient` — full `<radialGradient>` factory
- `createMusicalNote` — eighth / quarter / double-eighth note
- `createSoundWaveArc` — quadratic-bezier arc for sound waves
- `createSoundWaveArcRaw` — arc with caller-provided `d` (for parity)
- `createCharacterMouth` — mouth rect with class hook

**`lib/primitives/filters.js`** — SVG filter factories (4)
- `createDropShadow` — `feDropShadow` outer shadow
- `createInnerDepth` — inner shadow via blur+offset+flood+composite
- `createSoftGlow` — outer glow for sound waves
- `createNoteGlow` — softer wider glow for music notes

**`lib/easing.js`**
- `cssEasing` — named CSS cubic-bezier strings
- `smilSplines` — named SMIL keySplines strings

**`lib/composer.js`**
- `composeSVG({viewBox, width, height, style, defs, body, reducedMotion=true})` — assemble final SVG; `reducedMotion` (default on) auto-appends the `prefers-reduced-motion` fallback when there's a `<style>`
- `escapeXml(text)` — XML entity escape

**`scripts/`** (build-time helpers)
- `outline-text.mjs --font --text --size [--out --key]` — text → SVG `<path>` (fonts don't load in `<img>` mode; outline them)

## 4. Workflow (the natural-language loop)

```
User: "做一个会跳的橙色机器人"
  │
  ├─► /svg-animate skill loads
  ├─► reads ref/ for any user-provided reference
  ├─► picks the closest existing preset OR composes from primitives
  ├─► writes output/<slug>.svg via lib/composer.js
  ├─► /svg-verify (fork subagent) opens the SVG in chrome-devtools MCP,
  │    captures 5 keyframes, scores against the 5-point checklist
  ├─► if not OK: tweaks params, re-renders (up to 3 iterations)
  └─► returns final path + a 1-line summary
```

For multi-asset jobs ("a full brand animation kit"), the user runs
`/ultracode` to invoke Dynamic Workflows (see `docs/sprint-4-workflows.md`).

The four skills + three subagents compose as a pipeline:
```
/svg-animate  ──renders──►  output/<slug>.svg
     │
     ├─when user wants N variants──►  svg-explorer (subagent)
     │                                  └─returns──►  comparison block
     │
     └─calls──►  /svg-verify  ──uses agent──►  svg-verifier (subagent)
                                                └─returns──►  ≤100-word verdict
     │                                                    │
     └◄──── iterates (up to 3 rounds) ───────────────────┘

/svg-add-primitive  ──uses agent──►  lib-extender (subagent)
                                       └─adds primitive + uses it + tests + docs

/svg-export <slug> [--out=path]  ──final SVGO + accessibility + ship
```

For complex multi-asset jobs ("brand kit"), see
`docs/sprint-4-workflows.md` trigger phrase cheat sheet.

## 5. Critical rules

1. **SVG generation goes through `lib/composer.js`.** Never `template literal` a
   `<svg>` string in a skill or subagent — duplication erodes the snapshot
   guarantee.

2. **New primitives go through `/svg-add-primitive`.** Never hand-edit
   `lib/primitives/*.js` directly. The skill enforces JSDoc + at least one
   preset using the new primitive + snapshot test pass.

3. **Snapshot tests gate every `lib/` change.** Run `npm test` after edits.
   If a snapshot legitimately needs to change, run `npm run snapshot:update`
   and visually re-verify the affected preset.

4. **Adding a preset must reuse ≥ 1 existing primitive.** If nothing fits, add
   the primitive first via rule 2. Reuse is what makes the system compound.

5. **CLAUDE.md (this file) lists names, not details.** Detailed API signatures
   live in `docs/lib-api.md`. Detailed design rationale lives in
   `docs/ARCHITECTURE.md`. Keep this file under 200 lines.

6. **Don't add comments to lib code.** Code uses descriptive names already.
   Only annotate when the reason is non-obvious (a hidden invariant, a
   workaround, a perf trick).

## 6. When you're stuck

- Architecture / design question → `docs/ARCHITECTURE.md`
- Why a design choice was made → `docs/research-findings.md`
- How to use a specific primitive → `docs/lib-api.md`
- What an existing preset does → read its `lib/presets/*.js` (~30 lines each)
- How to design a new skill → `docs/sprint-2-skills.md`
- How to design a new subagent → `docs/sprint-3-subagents.md`
- How to add a primitive safely → `docs/extension-protocol.md`
- Animation feels off → `docs/animation-principles.md`
- SVG broken once embedded on GitHub / in a README (`<img>`) → `docs/embedding-animated-svg.md` (fonts→outline, transform-attr vs CSS-transform, reduced-motion, SVGO hazards)
- What shipped, when, and why → `CHANGELOG.md`

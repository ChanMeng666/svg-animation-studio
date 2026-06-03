# Research Findings — The Substrate This Repo Is Built On

> This document captures the full investigation behind this repo's design.
> If you ever ask "why did we go with X?", the answer is here. Last updated:
> 2026-06-03.

## Source projects analyzed

### A. `D:\github_repository\svg-animation\` — five seed SVG files

Two implementation paradigms appear side-by-side:

**Paradigm 1: hand-written CSS @keyframes** (`claude-jumping.svg`,
`claude-speaking.svg`, `codex-jumping.svg`, `codex-speaking.svg`)

- Inline `<style>` block with `@keyframes` + `.class { animation: ... }`
- Pixel-art structure: grouped `<rect>` / `<ellipse>` elements per body part
- Specific techniques observed:
  - `claude-jumping.svg:26-31` — squash-and-stretch jump:
    `scaleY(1.1) scaleX(0.95)` at apex, `scaleY(0.95) scaleX(1.05)` on landing
  - `claude-jumping.svg:23` — `infinite 0.1s` delay on right ear creates
    stagger life
  - `claude-jumping.svg:32-35` — shadow inverse-scales when body jumps,
    creating depth illusion
  - `claude-speaking.svg` — three independent loops in parallel: 0.3 s
    talk, 0.8 s body bob, 1.5 s music notes
  - `codex-*.svg` — added quality via `<defs>` gradients, `feDropShadow` /
    `feGaussianBlur+feMerge` self-rolled glow, 7-circle `clipPath` cloud body

**Paradigm 2: SMIL `<animate>` elements** (`logo.json.svg`, 2.4 MB)

- 1,477 `<animate>` + 100 `<animateTransform>` elements
- Single timeline: `dur="7.416667s"` (= 178 frames @ 24 fps — telltale of
  After Effects export)
- Filename `logo.json.svg` reveals the pipeline: AE → Bodymovin JSON → SMIL
- `attributeName` covers `d`, `display`, `opacity`, `stroke-dasharray`,
  `stroke-dashoffset`, `transform`
- `calcMode="spline"` (90×) and `calcMode="discrete"` (62×)

**Conclusions for this repo:**
- The CSS approach is small, hand-authorable, animates `transform` + `opacity`
  only. Perfect for mascots / iconography.
- SMIL can animate any attribute (including path `d`) but is impractical to
  hand-write. Generate it from tools when needed.
- We start with the CSS approach (Sprints 0-1). SMIL is layered in later
  via Bodymovin import (deferred; see Future Work below).

### B. `D:\github_repository\css-tower-defense\` — 240 keyframes, no SVG

A complete 3D-looking tower defense built **purely with CSS 3D transforms and
DOM elements** — no SVG, no Canvas, no WebGL.

What we steal:
- **A 240-name semantic keyframe vocabulary** (`aurora-wave-1`, `burn-flicker`,
  `giant-stomp`, `comic-idle`, `flame-particle-rise`, etc.). Names describe
  *what the motion is*, not how. This is what our `lib/primitives/motion.js`
  imitates: every primitive has a name that maps to user intent.
- **Strict per-domain LESS files** (`tower.less`, `enemy.less`,
  `effects-fire.less`, ...). The translation: our `lib/primitives` is split
  by concern (`shapes` / `motion` / `filters`), and presets stay one file
  each.
- **Mixin vocabulary** (`.pop-shadow()`, `.text-outline()`, `.gpu-accelerate()`).
  Equivalent in our world: composable factory functions in `lib/primitives/`.
- **CSS variables driving runtime themes** (season / weather / day-night flip
  via `--color-grass` etc.). Equivalent here: every primitive accepts an
  `opts` object so a preset can re-theme without forking.

### C. `D:\github_repository\gradient-svg-generator\` — 90% of what we need, already exists

A Next.js server-side SVG generator with **340 templates / 180 gradient types
/ 22 effect generators**, exposed via `/api/svg?text=...&template=...`.

Its five-layer pipeline is the *direct* model for `lib/`:

```
TemplateRegistry → EffectRegistry → effect generator → AnimationLibrary
                                                    + FilterLibrary
                                                    + svgPrimitives
                                  → SVGComposer → SVG string
```

Files studied carefully:
- `src/core/AnimationLibrary.js` — preset dictionary (`pulse`, `breathe`,
  `flicker`, `bounce` …) + factory functions
  (`createOpacityAnimation`, `createPulsingCircle`, `createStaggeredBegins`,
  `createKeyframeValues`). Direct ancestor of our
  `lib/primitives/motion.js`.
- `src/core/SVGComposer.js` — final assembly. Direct ancestor of
  `lib/composer.js`.
- `src/features/_shared/svgPrimitives.js` — `animatedLinearGradient` /
  `animatedRadialGradient` factories. Pattern reused for our linear/radial
  gradient stops helper.
- `src/utils/gradientGenerators/basicGradients.js` — example of how a
  generator file builds on the primitives. Pattern reused for our presets.

**Crucial decision derived from this:** we did NOT extend gradient-svg-generator
in-place. It's gradient-focused; injecting character animation would muddle
its API contract. Instead we mirror its architecture in a fresh repo and
mature it independently.

## Claude Code capability map (2026-06)

### Dynamic Workflows (Opus 4.8, released May 2026)

- Released as a research preview in Claude Code CLI / Desktop / VS Code
  extension for Max / Team / Enterprise plans
- Claude writes orchestration scripts on the fly that spawn tens-to-hundreds
  of parallel subagents, validate their work, and synthesize a final answer
- Triggered explicitly ("create a workflow") or via `/ultracode` effort level
- Token cost can be 10× a normal session — Anthropic explicitly recommends
  starting small
- Our use: triggered only for multi-asset jobs ("a full brand animation
  kit"). Day-to-day single animations stay in skills.

### Skills — official spec (code.claude.com/docs/en/skills)

- YAML frontmatter + markdown body in `<skill-name>/SKILL.md`
- Locations: enterprise / personal (`~/.claude/skills/`) / project
  (`.claude/skills/`) / plugin. Enterprise > personal > project.
- `description` is the auto-invocation trigger (capped at 1,536 chars
  combined with `when_to_use`); be specific and include trigger phrases
- `allowed-tools`, `disallowed-tools`, `paths` (glob filter for auto-load),
  `context: fork` (run in subagent), `effort`, `disable-model-invocation`
- Supporting files: `references/` and `scripts/` load on demand; SKILL.md
  itself stays in context for the rest of the session once invoked
- "One skill, one job" — mega-skills score lower on accuracy and composability
- `description` content is in context whenever the skill is available; full
  body loads only when invoked

### Subagents — three trigger conditions

Use a subagent when ANY of:
- **long-running** — verbose output that floods main context
- **dirty context** — would leave behind logs / file contents not needed later
- **restricted tools** — different tool whitelist than the main thread

Our subagents (Sprint 3):
- `svg-explorer` — long-running (N parallel variant outputs)
- `svg-verifier` — dirty context (screenshots, console messages)
- `lib-extender` — restricted tools (only write to `lib/`, run tests)

### Agent SDK (vs Managed Agents)

- Agent SDK = library; runs in your process; works on your filesystem
- Managed Agents = hosted REST API; runs in Anthropic sandbox
- Common path: prototype with Agent SDK locally → move to Managed Agents for
  production
- For us: Agent SDK is **Layer 6**, only when we want to expose the system
  as a service (Figma plugin / VS Code extension / Web UI)

## Existing SVG animation skill ecosystem (precedents)

- **SVG Animation Expert** (mcpmarket) — Framer Motion + CSS + GSAP focused
- **Lottie Animator** (mcpmarket) — static SVG → Lottie JSON
- **Wiggle** (talknerdytome-labs/wiggle-claude-skill) — six presets
  (Fade+Scale, Bounce, Pulse, Rotation, Wiggle/Jello, Waveform); structure:
  `SKILL.md` + `assets/` + `references/` (animation_theory.md, preset_library.md,
  troubleshooting.md, real-world-examples/) + `scripts/`
- **Asset Creator** (mcpmarket) — generic SVG icon/logo/character creation
- **Animify** (adityakotha03/LogoAnimation) — three-stage pipeline:
  Analysis → Generation → Preview; uses anime.js / Animate.css; React + Next.js

Our `/svg-animate` skill design borrows from all of these, especially Wiggle's
preset+references structure.

## Future work (deferred)

- **Lottie → SMIL import.** The 2.4 MB `logo.json.svg` is preserved as
  `ref/lottie-import-example.svg` to inform a future skill. Candidate tools:
  - `eeropic.github.io/bodymovin-to-smil-gui/` (browser GUI)
  - `lottieto.com` (web converter)
  - `vizgpt.ai/tools/lottie-to-svg` (in-browser)
- **GSAP runtime path** for in-page (non-file) animation. Stays out of the
  file generator; would be a sister project if needed.
- **Rive integration** for stateful interactive animations.

## URLs cited

- https://claude.com/blog/introducing-dynamic-workflows-in-claude-code
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/agent-sdk/overview
- https://code.claude.com/docs/en/sub-agents
- https://claude.com/blog/how-to-create-skills-key-steps-limitations-and-examples
- https://www.mindstudio.ai/blog/four-pattern-framework-claude-code-skills
- https://dev.to/nunc/claude-code-skills-vs-subagents-when-to-use-what-4d12
- https://github.com/anthropics/skills
- https://github.com/talknerdytome-labs/wiggle-claude-skill
- https://github.com/adityakotha03/LogoAnimation
- https://github.com/travisvn/awesome-claude-skills
- https://eeropic.github.io/bodymovin-to-smil-gui/

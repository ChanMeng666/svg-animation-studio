# SVG Animation Studio

> A composable SVG animation system driven by Claude Code. Describe an
> animation in natural language. Get a production-ready `.svg` file.

[![Tests](https://img.shields.io/badge/tests-10%2F10-brightgreen)](./tests)
[![Primitives](https://img.shields.io/badge/primitives-25-blue)](./docs/lib-api.md)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-orange)](https://claude.com/claude-code)

---

## The 30-second demo

You open this repo in Claude Code and type:

```
做一个会跳的紫色机器人      # "Make me a jumping purple robot"
```

Claude Code's `/svg-animate` skill auto-triggers, finds the closest existing
preset (`claude-jumping`), forks it with a purple palette, reuses 4 motion
primitives + 2 shape primitives, writes `output/purple-robot-jumping.svg`,
dispatches a subagent to visually verify the result against a 5-point
rubric, iterates once on its feedback, and offers to optimize+ship.

No SVG was hand-written. No keyframe was manually computed. The system
just used vocabulary it already had.

**That's the whole point.** Every new animation expands the vocabulary that
the next animation can reuse. Build once, use many times.

---

## Preview

Five animations ship in the box. Each is a working preset that demonstrates
the primitive library. Click any to see source.

| Preset | Source | What it shows |
|---|---|---|
| [`claude-jumping`](./docs/preview/claude-jumping.svg) | [`lib/presets/claudeJumping.js`](./lib/presets/claudeJumping.js) | Squash-stretch jump + arm wave + ear bounce stagger + synced shadow |
| [`claude-speaking`](./docs/preview/claude-speaking.svg) | [`lib/presets/claudeSpeaking.js`](./lib/presets/claudeSpeaking.js) | Idle bob + mouth talk + 3-stagger sound waves + floating music notes |
| [`codex-jumping`](./docs/preview/codex-jumping.svg) | [`lib/presets/codexJumping.js`](./lib/presets/codexJumping.js) | 5-stop gradient cloud body + filter depth + same kinematics, different style |
| [`codex-speaking`](./docs/preview/codex-speaking.svg) | [`lib/presets/codexSpeaking.js`](./lib/presets/codexSpeaking.js) | Adds ambient voice rings + glow filters + ellipse mouth |
| [`purple-robot-jumping`](./docs/preview/purple-robot-jumping.svg) | [`lib/presets/purpleRobotJumping.js`](./lib/presets/purpleRobotJumping.js) | First **field-test** preset, grown entirely from natural language |

Run `npm run dev` to see them animated in the browser preview grid.

---

## Why this exists

LLMs that template-literal SVG strings end up with subtly broken markup,
inconsistent IDs, no way to evolve. Asking Claude Code to "just make me an
animation" works once, then drifts each time. After the third request you
realize you've shipped three different versions of the same character.

This repo is the discipline. It funnels every animation through a small
library of named primitives (`motion.createJump`, `shapes.createPixelCharacter`,
`filters.createDropShadow`, ...), so the system compounds. Sprint 1 shipped
4 reverse-engineered presets and 25 primitives. The 5th preset
(`purple-robot-jumping`) was generated entirely from a single sentence in a
Claude Code session, reusing 6 existing primitives.

The architecture takes Anthropic's official **Skills + Subagents + Dynamic
Workflows + Agent SDK** building blocks and slots each into the layer it's
best at — see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## Quick start

```bash
git clone https://github.com/ChanMeng666/svg-animation-studio.git
cd svg-animation-studio
npm install

# Render the live preview grid at http://localhost:3030
npm run dev

# Render a preset to output/ as a standalone .svg file
node lib/render-cli.js claude-jumping

# Run the snapshot test suite
npm test
```

Requirements: Node ≥ 18, npm. Tested on Windows 11 + macOS.

---

## Repository tour

```
svg-animation-studio/
├─ CLAUDE.md                Always-loaded context for Claude Code sessions
├─ CHANGELOG.md             Version history (Keep a Changelog format)
├─ lib/                     Deterministic code — the single source of truth
│  ├─ composer.js              composeSVG() — only allowed way to assemble <svg>
│  ├─ easing.js                Named CSS / SMIL easing curves
│  ├─ primitives/
│  │  ├─ motion.js             10 motion primitives (jump, bob, talk, wave, ...)
│  │  ├─ shapes.js             11 shape primitives (character, cloud, note, ...)
│  │  └─ filters.js            4 filter primitives (dropShadow, glow, ...)
│  ├─ presets/                 Named animation templates (5 shipped)
│  ├─ render-cli.js            `node lib/render-cli.js <preset>`
│  └─ index.js                 Barrel export
├─ playground/              Next.js preview server (port 3030)
├─ output/                  Final .svg artifacts (gitignored)
├─ ref/                     User-provided reference material
├─ tests/snapshot/          Vitest byte-stable snapshots per preset
├─ docs/                    8 permanent design reference files
│  ├─ ARCHITECTURE.md          Six-layer onion + tool roles
│  ├─ animation-principles.md  7 of Disney's 12 principles, applied to SVG
│  ├─ lib-api.md               Full opts tables for all 25 primitives
│  ├─ research-findings.md     Source projects + Claude Code capability map
│  ├─ extension-protocol.md    6 non-negotiable rules for growing the system
│  └─ sprint-2/3/4-*.md        Layer designs (skills / subagents / workflows)
├─ .claude/
│  ├─ skills/                  4 project-level Claude Code skills
│  │  ├─ svg-animate/          /svg-animate — main entry point
│  │  ├─ svg-verify/           /svg-verify — chrome-devtools visual grader
│  │  ├─ svg-add-primitive/    /svg-add-primitive — safe lib extension
│  │  └─ svg-export/           /svg-export — SVGO + accessibility + ship
│  └─ agents/                  3 specialized subagents
│     ├─ svg-verifier.md       Dirty-context visual grading
│     ├─ lib-extender.md       Restricted-tool primitive addition
│     └─ svg-explorer.md       Parallel N-variant generation
└─ agent-sdk-wrapper/       Productization scaffolding (inactive)
```

---

## How to use it from Claude Code

Open a Claude Code session inside this repo (or after `cd` into it). The
four skills auto-load. Then just describe what you want:

| You say | What happens |
|---|---|
| "make me a bouncing orange mascot" | `/svg-animate` picks `claude-jumping`, forks with new palette |
| "give me 3 variants of a loader" | `svg-explorer` subagent generates 3 variants in parallel |
| "is this animation any good?" | `/svg-verify <slug>` returns a ≤100-word verdict |
| "I need a wobble effect that doesn't exist" | `/svg-animate` flags the gap; you run `/svg-add-primitive motion.createWobble` |
| "ship this for production" | `/svg-export <slug>` runs SVGO + accessibility, writes to `--out=` |
| "build me a brand animation kit" | `/ultracode` invokes Dynamic Workflows; orchestrates parallel `/svg-animate` calls |

See [`docs/sprint-2-skills.md`](./docs/sprint-2-skills.md) for the full
skill contracts, [`docs/sprint-3-subagents.md`](./docs/sprint-3-subagents.md)
for the subagents, and [`docs/sprint-4-workflows.md`](./docs/sprint-4-workflows.md)
for the workflow trigger phrase cheat sheet.

---

## Skills and subagents

### Project-level Claude Code skills (`.claude/skills/`)

| Slash command | Purpose | Invocation |
|---|---|---|
| `/svg-animate <description>` | Natural language → SVG file | Auto-triggers on any "make / build / animate" request |
| `/svg-verify <slug>` | Visual verification, ≤100-word verdict | Auto-invoked by `/svg-animate`; can be called directly |
| `/svg-add-primitive <category>.<name>` | Safe library extension | User-only (`disable-model-invocation: true`) |
| `/svg-export <slug> [--out=path]` | SVGO + accessibility + ship | Auto-suggested after a passing verdict |

### Specialized subagents (`.claude/agents/`)

| Agent | Trigger condition | Used by |
|---|---|---|
| `svg-verifier` | Dirty context (screenshots, console logs) | `/svg-verify` |
| `lib-extender` | Restricted tools (only `lib/` + tests) | `/svg-add-primitive` |
| `svg-explorer` | Long-running (N parallel variant outputs) | `/svg-animate` when user wants variants |

---

## Library API

25 primitives across three categories. Each returns either a CSS+className
pair (motion) or a raw SVG element string (shapes / filters). Full opts
tables in [`docs/lib-api.md`](./docs/lib-api.md).

```js
const motion = require('./lib/primitives/motion');
const shapes = require('./lib/primitives/shapes');
const { composeSVG } = require('./lib/composer');

motion.resetIdCounter();
const jump   = motion.createJump({ peakY: 22, easing: 'bouncy' });
const shadow = motion.createShadowScale();

const svg = composeSVG({
  viewBox: '0 0 100 90', width: 140, height: 126,
  style: [jump.css, shadow.css].join('\n'),
  body: shapes.createGroundShadow({ cx: 50, cy: 82, rx: 22, ry: 5, applyClass: shadow.className })
      + shapes.createPixelCharacter({ color: '#E07C4C', applyClasses: { body: jump.className } })
});
```

---

## How to extend (without breaking the system)

Six engineering disciplines, enforced by skill design and documented in
[`docs/extension-protocol.md`](./docs/extension-protocol.md):

1. **New primitives go through `/svg-add-primitive`** — never hand-edit `lib/primitives/`
2. **New presets must reuse ≥ 1 existing primitive** — this is what makes the system compound
3. **Changing a primitive signature requires snapshot resync** — `npm test` is non-negotiable
4. **Deleting a primitive requires zero callers** — grep first, delete second
5. **New skills go through the `skill-creator` skill** — hand-written descriptions undertrigger
6. **CLAUDE.md indexes; `docs/` explains** — keep CLAUDE.md under 200 lines forever

---

## Tech stack

- **Runtime**: Node.js ≥ 18, vanilla JavaScript (no TS in `lib/`; TypeScript optional in scaffolding)
- **Preview**: Next.js 15 + React 19 (preview server only — `lib/` is framework-free)
- **Testing**: Vitest with file snapshots (byte-stable per preset)
- **Optimization**: SVGO with custom preset (keeps `viewBox`, `title`, `desc`)
- **Agent runtime**: Claude Code skills + subagents (project-level, ship with the repo)

The `lib/` is intentionally framework-free Node.js — you can call it from
any JavaScript runtime without dragging in React, Next, or Vitest.

---

## Provenance

This repo synthesizes patterns from three studied source projects:

- **gradient-svg-generator** (Chromaflow) — the SVG composer pipeline,
  AnimationLibrary, FilterLibrary, registry pattern. 340 templates / 22
  generators / 180 gradient types in production. MIT licensed.
- **css-tower-defense** — the 240-name semantic keyframe vocabulary and
  per-domain LESS organization that proved naming discipline scales to
  complex animation systems.
- A set of 5 hand-written seed SVGs (preserved unmodified at
  `D:\github_repository\svg-animation\` on the author's machine, copied
  into `ref/lottie-import-example.svg` for the Lottie pipeline reference)
  that supplied the reverse-engineered motion vocabulary.

See [`docs/research-findings.md`](./docs/research-findings.md) for the full
analysis and Claude Code 2026-06 capability map.

---

## Roadmap

Tracked in [`CHANGELOG.md`](./CHANGELOG.md). Deferred work:

- **Lottie → SMIL import.** Sample preserved at
  `ref/lottie-import-example.svg`. Candidate toolchains documented.
- **Agent SDK wrapper activation.** Scaffolding in
  [`agent-sdk-wrapper/`](./agent-sdk-wrapper/); activate when productizing.
- **GSAP runtime path.** Sister project if needed for in-page (vs. file)
  animation.
- **Rive integration.** For stateful interactive animations.

---

## License

[MIT](./LICENSE) — Chan Meng, 2026.

---

## Acknowledgments

Built with [Claude Code](https://claude.com/claude-code), Anthropic's
official CLI for Claude. Sprint 2 skills were created via the
`skill-creator` skill following the official **one skill, one job** /
**four-pattern framework** guidance.

---

<!-- CHAN MENG PERSONAL BRAND -->
<div align="center">
  <a href="https://github.com/ChanMeng666" target="_blank">
    <img src="./.github/brand/chan-meng-logo.svg" alt="Chan Meng" width="160" />
  </a>

  <p><strong>Chan Meng</strong><br/>Need a custom app like this one? I build them — let's talk.</p>

  <a href="mailto:chanmeng.dev@gmail.com"><img src="https://img.shields.io/badge/Email-chanmeng.dev@gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email Chan Meng"/></a>
  <a href="https://github.com/ChanMeng666"><img src="https://img.shields.io/badge/GitHub-ChanMeng666-181717?style=flat-square&logo=github&logoColor=white" alt="Chan Meng on GitHub"/></a>
</div>
<!-- /CHAN MENG PERSONAL BRAND -->

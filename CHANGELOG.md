# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [SemVer](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Nothing yet._

---

## [0.1.0] — 2026-06-03

First working release. End-to-end natural-language → animated SVG pipeline.

### Headline

A user types `做一个会跳的紫色机器人` in a Claude Code session inside this
repo. `/svg-animate` auto-triggers, forks a base preset, reuses 6 primitives,
writes `output/purple-robot-jumping.svg`, dispatches `/svg-verify` to score
it visually, iterates once on the verdict, and ships. All without the user
writing a line of SVG. **Validated in field test** — see _Validated_ below.

### Added

#### Layer 1 — `lib/` (deterministic code)

- `lib/composer.js` — `composeSVG()` + `escapeXml()` + `indent()`. Single
  source of truth for SVG assembly.
- `lib/easing.js` — `cssEasing` (9 named curves) + `smilSplines` (5 mappings).
- `lib/primitives/motion.js` — **10 primitives**: `createJump`, `createBob`,
  `createTalk`, `createWaveArm`, `createEarBounce`, `createShadowScale`,
  `createShadowPulse`, `createSoundWaveExpand`, `createFloatingNote`,
  `createVoiceRing`. Each returns `{ css, className }`.
- `lib/primitives/shapes.js` — **11 primitives**: `createGroundShadow`,
  `createPixelCharacter`, `createCodexCharacter`, `createCloudClipPath`,
  `createGradientStops`, `createLinearGradient`, `createRadialGradient`,
  `createMusicalNote`, `createSoundWaveArc`, `createSoundWaveArcRaw`,
  `createCharacterMouth`.
- `lib/primitives/filters.js` — **4 primitives**: `createDropShadow`,
  `createInnerDepth`, `createSoftGlow`, `createNoteGlow`.
- `lib/render-cli.js` — `node lib/render-cli.js <preset> [--out] [--opts]`.
- `lib/presets/{claudeJumping,claudeSpeaking,codexJumping,codexSpeaking}.js`
  — reverse-engineered from the 4 seed SVGs in
  `D:\github_repository\svg-animation\`.

#### Layer 2 — `CLAUDE.md` (always-loaded context)

157 lines. Five fixed sections: entry points, directory map, lib API name
index, workflow flow chart, critical rules.

#### Layer 3 — `.claude/skills/` (4 skills)

- `svg-animate` — main entry (177 lines + `references/preset-cookbook.md`).
- `svg-verify` — visual self-verification via chrome-devtools MCP
  (146 lines). `context: fork`, agent: `svg-verifier`.
- `svg-add-primitive` — gatekept lib extension (163 lines).
  `context: fork`, agent: `lib-extender`, `disable-model-invocation: true`.
- `svg-export` — SVGO + accessibility + ship (106 lines).

#### Layer 4 — `.claude/agents/` (3 subagents)

- `svg-verifier` — specialized chrome-devtools MCP visual grader. Returns
  ≤100-word verdict.
- `lib-extender` — restricted-tool extension of `lib/primitives/`. Refuses
  to add a primitive with no consuming preset.
- `svg-explorer` — parallel N-variant generation along one axis (timing /
  palette / style / energy).

#### Layer 5 — `docs/` (8 permanent reference files)

- `ARCHITECTURE.md` — six-layer onion + tool roles + engineering disciplines.
- `research-findings.md` — analysis of 3 source projects + Claude Code
  capability map (2026-06).
- `animation-principles.md` — 7 Disney principles applied to SVG, with the
  5-point verification rubric.
- `lib-api.md` — full opts tables for all 25 primitives.
- `sprint-2-skills.md` / `sprint-3-subagents.md` / `sprint-4-workflows.md`
  — design contracts for each layer.
- `extension-protocol.md` — 6 non-negotiable rules for safely growing the
  system.

#### Layer 6 — `agent-sdk-wrapper/` (productization scaffolding)

`README.md` + `src/index.ts.template`. Inactive by default. Activate only
when exposing this system as a programmatic API to non-Claude-Code callers
(Web UI, Figma plugin, VS Code extension, CI).

#### Infrastructure

- `package.json` — npm scripts: `dev`, `build`, `render`, `test`,
  `test:snapshot`, `snapshot:update`, `optimize`.
- `vitest.config.js` — node-env snapshot testing.
- `next.config.js` + `playground/` — Next.js preview server on port 3030,
  exposes `/api/svg?preset=<name>` and a grid preview at `/`.
- `tests/snapshot/presets.test.js` — auto-discovers all presets, asserts
  non-empty `<svg>` shell + byte-stable snapshot per preset.
- `.gitignore` — excludes `output/*.svg`, `node_modules/`, `.next/`.

#### Reference assets

- `ref/lottie-import-example.svg` — 2.4 MB Lottie/Bodymovin export sample
  preserved for future Lottie-import work.

### Validated

In a fresh Claude Code session at `D:\github_repository\svg-animation-studio\`:

```
> 做一个会跳的紫色机器人
```

Result observed end-to-end:

1. `/svg-animate` auto-triggered (description match worked).
2. Forked `claudeJumping` preset → wrote `purpleRobotJumping.js` (49 lines).
3. Reused 4 motion + 2 shape primitives + later added 1 filter.
4. Rendered `output/purple-robot-jumping.svg` (2939 → 3219 bytes).
5. `npm run test:snapshot` → 10/10 pass, 1 new snapshot written.
6. `/svg-verify` dispatched as `Agent` (initial flow), returned
   `tweak` verdict with 2 issues + 2 strengths in 1m50s / 45.9k tokens.
7. Iterated once: added `filters.createDropShadow` to address "flat purple"
   feedback.
8. Offered `/svg-export` as next step. ✓

### Decisions

Changes from the original plan worth recording for future archaeologists:

- **`svg-verify` skill: removed `disable-model-invocation: true`**
  Originally specified in `docs/sprint-2-skills.md`. Field test showed
  dmi blocked `/svg-animate → /svg-verify` programmatic dispatch. The
  description is specific enough to prevent inappropriate auto-triggering,
  and `context: fork` still isolates the screenshot context. Patch
  documented at the bottom of `docs/sprint-2-skills.md`.

- **More primitives than planned (25 vs. 15)**
  Sprint 1 originally targeted ~15 primitives. Reverse-engineering the
  4 seed SVGs surfaced legitimate extras: `createShadowPulse` (gentler
  companion to `createShadowScale`), `createLinearGradient` /
  `createRadialGradient` factories, `createSoundWaveArcRaw` (for exact-`d`
  parity). All used by at least one preset.

- **`agent-sdk-wrapper/` ships inactive**
  Sprint 4 originally implied a working SDK wrapper. Decided that wrapping
  unstable skills is premature. Ships as scaffolding with a clear activation
  checklist in its README.

### Known issues

- **Chrome MCP can disconnect mid-session.** Field test hit this during
  the verification re-loop. `svg-verifier` handles it gracefully: returns
  partial verdict + flags the disconnect rather than pretending to score.

- **Snapshot byte-stability depends on `motion.resetIdCounter()`**
  Every preset's `compose()` MUST call this as its first line. Currently
  enforced only by convention; no lint check. Adding one would catch
  drift from new contributors.

- **The Vitest deprecation warning** about CJS Vite Node API is cosmetic;
  no impact on test results.

### Deferred

Explicitly out of scope for this release:

- **Lottie / SMIL import.** Reference sample saved at
  `ref/lottie-import-example.svg`. Candidate toolchains documented in
  `docs/research-findings.md`.
- **Agent SDK wrapper activation.** Scaffolding only; see
  `agent-sdk-wrapper/README.md`.
- **GSAP runtime path.** Sister project if needed; doesn't belong here.
- **Rive integration.** Same reasoning.
- **Vercel / Cloudflare deployment.** Local Next.js dev is sufficient
  for the verification loop.

### Provenance

- Approved plan: `~/.claude/plans/svg-svg-svg-svg-reactive-thompson.md`
- Source projects studied (preserved as-is, NOT modified):
  - `D:\github_repository\svg-animation\` — 5 seed SVG files
  - `D:\github_repository\css-tower-defense\` — keyframe vocabulary pattern
  - `D:\github_repository\gradient-svg-generator\` — SVG composer pattern

### Stats

- **5 presets** (4 seeds + 1 field-test-grown)
- **25 primitives** (10 motion + 11 shapes + 4 filters)
- **4 skills**, **3 subagents**, **8 doc files**
- **10/10 snapshot tests pass**
- **30 plan tasks** completed

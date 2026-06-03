# Sprint 2 — Skills Design

> Four project-level skills in `.claude/skills/`. Each follows "one skill,
> one job." Not yet implemented; this document is the contract.

## Why four, not one?

Anthropic's official guidance: mega-skills score lower on accuracy and
composability. Four small skills with sharp `description` fields trigger
correctly and stay maintainable.

The boundaries are:
- `/svg-animate` — the **action** ("make me a thing")
- `/svg-verify` — the **judgment** ("did it come out right")
- `/svg-add-primitive` — the **extension** ("teach the system a new word")
- `/svg-export` — the **finalization** ("ship it")

## 1. `/svg-animate` — main entry

**File**: `.claude/skills/svg-animate/SKILL.md`

**Frontmatter**:
```yaml
---
name: svg-animate
description: |
  Create or edit an animated SVG from a natural-language description. Use
  when the user asks to make/build/create/animate an SVG: mascots, logos,
  loaders, badges, icons, characters. Trigger phrases: "make me an animated
  X", "create a bouncing/spinning/pulsing X", "做一个X动画", "给我画个会动的Y".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node lib/*), Bash(npm run dev*), Bash(npm test*)
paths:
  - lib/**/*.js
  - lib/presets/**
  - output/**/*.svg
  - ref/**
---
```

**References (load on demand)**:
- `references/animation-principles.md` → symlink/copy from
  `docs/animation-principles.md`
- `references/lib-api.md` → symlink/copy from `docs/lib-api.md`
- `references/preset-cookbook.md` → curated map "what kind of request maps to
  which existing preset + which primitives"

**Body** (under 200 lines, see official guidance):

```markdown
You are the entry point for SVG animation requests.

## Step 1 — Understand
- Read `ref/` for any user-provided reference files
- Read `lib/presets/index.js` to see existing presets

## Step 2 — Decide: reuse, fork, or compose
- Closest existing preset matches user intent → fork it
- No close match → compose from `lib/primitives/`
- Missing a primitive you'd need → STOP and instruct user to run
  `/svg-add-primitive <name>`. Do not add primitives inline.

## Step 3 — Write the preset
- New presets go in `lib/presets/<slug>.js`
- Existing preset edits go in their own file
- ALWAYS use `composer.composeSVG`; never template-literal a `<svg>`
- Add entry to `lib/presets/index.js`

## Step 4 — Render and snapshot
- Run `node lib/render-cli.js <slug>`
- Run `npm run test:snapshot` (will create or update snapshot)

## Step 5 — Verify
- Invoke `/svg-verify <slug>` (runs as subagent, will return ≤100-word verdict)
- If the verdict flags issues, tweak preset params and loop. Maximum 3
  iterations before asking the user.

## Step 6 — Report
- Return: path to `output/<slug>.svg`, the verdict summary, primitives used.

## Critical constraints
- Never edit `lib/primitives/` directly. Use `/svg-add-primitive`.
- Never delete output without user confirmation.
- Match the user's character / style cues (pixel art vs gradient vs flat).
```

## 2. `/svg-verify <slug>` — visual self-verification

**File**: `.claude/skills/svg-verify/SKILL.md`

**Frontmatter**:
```yaml
---
name: svg-verify
description: |
  Visually verify a rendered SVG by opening it in a browser, capturing 5
  keyframes, and scoring against the 5-point checklist. Use after generating
  or editing an SVG to catch motion / timing / quality issues.
context: fork
agent: svg-verifier
allowed-tools: Bash(npm run dev*), mcp__chrome-devtools__*
---
```

> Note (2026-06-03 patch): `disable-model-invocation: true` was originally
> specified here but removed after field testing. With dmi set, the
> `/svg-animate` skill's programmatic call into `/svg-verify` was rejected by
> the Skill tool, forcing Claude to fall back to a manual `Agent` dispatch.
> The skill's `description` is specific enough ("Visually verify a rendered
> SVG …") that auto-invocation in inappropriate contexts is unlikely. Keep
> dmi off so the natural chain `/svg-animate` → `/svg-verify` works without
> friction. The `context: fork` still guarantees the screenshots and console
> messages stay in an isolated subagent context, which was the real
> protection we wanted.

**Body**: (instructs the verifier subagent — see Sprint 3 doc)

The verifier:
1. Starts `npm run dev` if not running (port 3030)
2. Navigates to `/api/svg?preset=<slug>` via chrome-devtools MCP
3. Captures 5 keyframe screenshots at animation timeline 0/25/50/75/100 %
4. Scores against `docs/animation-principles.md`'s 5-point rubric
5. Returns ≤100-word verdict

## 3. `/svg-add-primitive <name>` — extend the library

**File**: `.claude/skills/svg-add-primitive/SKILL.md`

**Frontmatter**:
```yaml
---
name: svg-add-primitive
description: |
  Add a new reusable motion / shape / filter primitive to lib/primitives/.
  Use only when /svg-animate has flagged a missing capability.
disable-model-invocation: true
context: fork
agent: lib-extender
allowed-tools: Read, Write, Edit, Bash(npm test*)
---
```

**Body** (the extender follows):

```markdown
## Step 1 — Place
- Decide category: motion / shapes / filters
- Add function to `lib/primitives/<category>.js` with JSDoc

## Step 2 — Convention
- Return shape: motion → {css, className}; shapes/filters → SVG string
- Accept an `opts` object with sensible defaults
- Reuse `easing` and `composer.escapeXml` where appropriate

## Step 3 — Use it
- Add at least one preset that uses the new primitive (existing or new)
- Failing to use it = no primitive

## Step 4 — Document
- Add an entry to `docs/lib-api.md` (signature + 1-line example)
- Add the name to CLAUDE.md `lib API index` section

## Step 5 — Test
- Run `npm test` — must pass
- If a snapshot legitimately changes, run `npm run snapshot:update`
```

## 4. `/svg-export <slug>` — optimize and ship

**File**: `.claude/skills/svg-export/SKILL.md`

**Frontmatter**:
```yaml
---
name: svg-export
description: |
  Finalize a rendered SVG: optimize via SVGO, add accessibility metadata,
  verify viewBox, write to the user-specified location.
allowed-tools: Bash(npx svgo*), Read, Write
---
```

**Body**:

```markdown
1. Run `npx svgo output/<slug>.svg -o output/<slug>.min.svg --multipass`
2. Insert `<title>` and `<desc>` from `lib/presets/<slug>.js` metadata
3. Verify viewBox matches preset declaration
4. Copy to user-specified destination if provided
5. Report final byte size + path
```

## Skill quality check before shipping

Each skill must satisfy:
- `description` includes ≥3 concrete trigger phrases (English + Chinese)
- `description` + `when_to_use` total ≤ 1,536 characters
- SKILL.md body ≤ 200 lines (per official guidance)
- All commands referenced in body are in `allowed-tools`
- `references/` files are linked from the body so Claude knows when to open
  them

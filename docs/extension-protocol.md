# Extension Protocol — How to Safely Grow This System

> These six rules are non-negotiable. They are what turn this repo from a
> pile of one-off animations into a compounding system.

## Rule 1 — New primitives go through `/svg-add-primitive`

**Why**: Hand-edits to `lib/primitives/*.js` skip the safety net (no JSDoc
check, no caller verification, no doc update, no test run). Over time these
accumulate as inconsistent APIs that nobody can compose.

**How to apply**: If you're an LLM in this repo and you find yourself wanting
to add a function to `lib/primitives/`, **stop** and emit:

> "I need a new primitive. Please run `/svg-add-primitive <name>` to add it
> with the safety checks."

## Rule 2 — New presets must reuse ≥ 1 existing primitive

**Why**: Presets that don't reuse drift into one-off implementations. The
whole point of the system is that asset N benefits from primitives extracted
for asset 1..N-1.

**How to apply**: When composing a preset, audit `lib/primitives/index.js`
first. If you can't find anything that fits, you need a primitive *first*
(rule 1).

## Rule 3 — Changing a primitive signature requires snapshot resync

**Why**: A signature change can silently change every dependent preset's
output. Snapshot tests are how we catch this.

**How to apply**:
1. Grep all callers: `grep -r "primitiveName" lib/presets/`
2. Update each caller
3. Run `npm test` — if snapshots changed legitimately, run
   `npm run snapshot:update` and **visually re-verify** each affected preset
4. Commit primitive + presets + snapshots in one atomic change

## Rule 4 — Deleting a primitive requires zero callers

**Why**: Silent breakage hides forever in unused-but-not-deleted code.

**How to apply**:
1. `grep -r "primitiveName" lib/` → must return zero matches outside the
   primitive's own file
2. Remove from `lib/primitives/<category>.js`
3. Remove from `docs/lib-api.md` and CLAUDE.md `lib API index`
4. Commit as a single change

## Rule 5 — New skills go through `skill-creator`

**Why**: Hand-written skills usually fail the trigger test (`description`
not specific enough, missing trigger phrases). The `skill-creator` skill
walks through this conversationally.

**How to apply**: When you find yourself wanting to create
`.claude/skills/<new-name>/SKILL.md`, run `/skill-creator` first.

## Rule 6 — CLAUDE.md indexes; detail goes in docs/

**Why**: CLAUDE.md is in context for every session, every turn. Every line
recurs as a token cost. Detail belongs where it loads on demand.

**How to apply**:
- New primitive name → CLAUDE.md `lib API index` (one line)
- New primitive signature, params, example → `docs/lib-api.md`
- New design rationale → `docs/ARCHITECTURE.md` or `docs/research-findings.md`
- New skill design → `docs/sprint-2-skills.md`
- CLAUDE.md should stay under 200 lines forever.

## How to know if the protocol is working

Audit, monthly or before any significant release:

- `lib/primitives/` line count grows roughly with preset count (good
  reuse rate)
- CLAUDE.md `lib API index` matches `docs/lib-api.md` entry list (no drift)
- `npm test` passes on a clean clone (no committed broken snapshots)
- Every primitive has at least one preset using it (`grep`)
- No `.claude/skills/<name>/` lacks a `description` with trigger phrases

If any of these breaks, the protocol is decaying. Triage immediately.

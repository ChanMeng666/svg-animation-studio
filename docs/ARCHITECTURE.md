# Architecture — The Six-Layer Onion

> Why this repo is structured the way it is. The plan is in
> `~/.claude/plans/svg-svg-svg-svg-reactive-thompson.md`; this document is the
> stable design rationale.

## TL;DR

Don't pick "the one right architecture." Use each Claude Code tool for what it
does best, and let the layers compose:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 6 ▸ (optional) Agent SDK wrapper → public HTTP/CLI    │
├─────────────────────────────────────────────────────────────┤
│  Layer 5 ▸ Dynamic Workflows ← complex multi-asset jobs      │
├─────────────────────────────────────────────────────────────┤
│  Layer 4 ▸ Subagents (svg-explorer / svg-verifier / ...)     │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 ▸ Skills (/svg-animate, /svg-add-primitive, ...)    │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 ▸ CLAUDE.md ← repo map + lib API index              │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 ▸ lib/ ← deterministic code, single source of truth │
└─────────────────────────────────────────────────────────────┘
```

A simple natural-language request enters from the top, descends to the layer
that knows how to handle it, and ascends with a finished `.svg`.

## Tool roles

| Tool | What it is | Best at | Bad at |
|---|---|---|---|
| **CLAUDE.md** | Always-loaded facts | Repo map, lib name index, critical rules | Long procedures, decision trees |
| **Skill** | On-demand "recipe" knowledge pack | Single-task procedures, domain knowledge, template index | Long pipelines, parallel scheduling |
| **Subagent** | Isolated-context worker | Verbose output, restricted tools, parallelizable variants | Main-conversation knowledge |
| **Dynamic Workflows** (Opus 4.8+) | Orchestration scripts; auto-decomposes into 100+ parallel subagents | Complex multi-asset jobs, automatic validation | Single small animations (cost!) |
| **Agent SDK** | Library to embed Claude Code in other processes | Wrapping the system as a product/API | Personal local workflows |
| **MCP (chrome-devtools / claude-in-chrome)** | Browser visual loop | Screenshots, GIFs, console reads, self-verification | Complex logic |
| **lib/ (code)** | Deterministic, testable, versioned | Animation primitives, easing dicts, filter factories, SVG assembly | Aesthetic judgment |

## Why this split works

- **Deterministic things → code.** Easing curves, SVG string concatenation,
  filter element shapes. Code is testable, versionable, deterministic.
- **Domain knowledge & flow → skills.** "What scenario calls for which
  primitive," "the 12 animation principles." Knowledge lives in markdown that
  loads on demand.
- **Context-polluting subtasks → subagents.** Visual verification (screenshots,
  GIFs, console logs are heavy). Parallel exploration of 3 variants (each
  emits a full SVG). Both belong out of the main thread.
- **Stable facts → CLAUDE.md.** "These are the files. These are the rules."
  Tiny, always loaded.

This split is what enables **"build once, use many times"**: each layer can
evolve independently. Adding a primitive to `lib/` doesn't require touching
skills. Tightening a skill prompt doesn't require touching `lib/`. Each new
preset gets to stand on the shoulders of every primitive that came before.

## The five engineering disciplines

These are non-negotiable. They are what turn this repo from "a pile of
animations" into a compounding system.

### 1. Snapshot tests are sacred

Every preset's output is captured byte-for-byte under
`tests/snapshot/__snapshots__/`. Any change to `lib/` reruns the full suite,
catching regressions before they ship. Modeled on gradient-svg-generator's
`/api/svg` contract testing.

### 2. `lib/` is the single source of truth

Skills, subagents, and (someday) Agent SDK callers all reach the SVG world
*only* through `lib/`. They never template-literal their own SVG. This is what
makes `lib/` upgradeable without coordinated rewrites elsewhere.

### 3. CLAUDE.md indexes; `docs/` explains

CLAUDE.md says *what* exists. Every function name appears in its index. But
`docs/lib-api.md` is where each function's signature, params, and example
live. This keeps the always-loaded context cheap while the detail stays
available on demand.

### 4. `description` is the skill trigger engine

Claude Code decides when to auto-invoke a skill based on its `description`
frontmatter (capped at 1,536 characters combined with `when_to_use`). Write
skills with *trigger phrases* in both English and Chinese, with concrete
example utterances. A vague "animates SVGs" will not fire reliably.

### 5. Every preset is a versioned product

Each preset eventually grows a directory with `preset.json`, `snapshot.svg`,
`snapshot.png`, `CHANGELOG.md`, and `README.md`. This is the contract with
future you (and other agents). In Sprint 1 we ship a flat `.js` file; the
upgrade path to a folder-per-preset is straightforward.

## How the layers interact

### A simple request: "make me a bouncing logo"

```
user prompt
  → CLAUDE.md (always loaded) tells Claude there's a /svg-animate skill
  → /svg-animate loads its references (animation-principles.md, lib-api.md)
  → composes from lib/primitives + lib/composer
  → writes output/bouncing-logo.svg
  → /svg-verify (subagent, isolated context)
       → npm run dev, chrome-devtools MCP screenshot loop
       → returns ≤100-word verdict to main thread
  → main thread reports path + summary to user
```

### A complex request: "build me a full brand animation kit"

```
user prompt → /ultracode trigger or explicit "create a workflow"
  → Dynamic Workflows: parse intent → spawn N parallel subagents
       each running /svg-animate for one asset (logo, loader, success, error)
       each calling /svg-verify
  → workflow waits for all, validates against brand spec
  → calls /svg-export for each
  → composes a kit/index.html + README
  → returns to user
```

### Productizing: wrapping the system in a UI

```
HTTP request to your product
  → Agent SDK query() with cwd=this-repo
  → Same skills, same lib, same verification loop
  → SSE-stream progress events back to caller
```

## Sources

- `docs/research-findings.md` — full survey of source projects and Claude Code
  capability map (2026-06)
- Approved plan: `~/.claude/plans/svg-svg-svg-svg-reactive-thompson.md`

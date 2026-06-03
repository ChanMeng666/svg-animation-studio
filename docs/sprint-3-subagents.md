# Sprint 3 — Subagents Design

> Three subagents in `.claude/agents/`. Each one matches one of the official
> trigger conditions: long-running, dirty context, or restricted tools.
> Not yet implemented; this document is the contract.

## Why three?

Anthropic guidance: promote work to a subagent only when it hits one of
three triggers. We have exactly three jobs that hit each one:

| Subagent | Trigger | Why |
|---|---|---|
| `svg-explorer` | long-running | Emits N full SVGs (each ~5 KB text) |
| `svg-verifier` | dirty context | Screenshots, console logs, GIF binary |
| `lib-extender` | restricted tools | Should only touch `lib/` + tests |

Anything not matching one of these triggers stays in the main thread.

## 1. `svg-explorer`

**File**: `.claude/agents/svg-explorer.md`

**Purpose**: Generate N stylistic variants of one request in parallel
("show me 3 options for a bouncing logo").

**Frontmatter**:
```yaml
---
description: Generates N stylistic variants of an SVG animation in parallel and returns a comparison summary.
tools: Read, Write, Glob, Bash(node lib/*)
---
```

**Input contract** (what the main thread passes in):
- Base description ("a bouncing orange mascot")
- Number of variants (default 3)
- Variant axis: timing / palette / character style / energy level

**Output contract** (what it returns):
- List of `output/<slug>-v1.svg`, `-v2.svg`, ... paths
- One-line summary of what makes each variant distinctive
- Recommendation of the strongest variant

**Body** outline:
1. Spawn N concurrent generations using `Promise.all` over `node lib/render-cli.js`
2. Each variant tweaks one axis (timing 0.4 s / 0.5 s / 0.8 s; palettes warm/cool/mono; etc.)
3. Return the list + comparison

## 2. `svg-verifier`

**File**: `.claude/agents/svg-verifier.md`

**Purpose**: Visual verification via chrome-devtools MCP. Returns a tiny
verdict — never the screenshots themselves.

**Frontmatter**:
```yaml
---
description: Opens a generated SVG in chrome-devtools MCP, captures keyframes, scores quality, and returns a concise verdict.
tools: Bash(npm run dev*), mcp__chrome-devtools__*
---
```

**Input contract**:
- Preset slug
- (optional) baseline SVG path for visual comparison

**Output contract** (≤ 100 words):
```
VERDICT: pass | tweak | fail
Issues:
- <one line per issue, max 3>
Strengths:
- <one line per strength, max 2>
```

**Body** outline:
1. Ensure `npm run dev` is running on port 3030 (check, start if not)
2. Open `http://localhost:3030/api/svg?preset=<slug>` via MCP
3. Take 5 screenshots at CSS animation timeline 0/25/50/75/100 % using
   `evaluate_script` to pause at each frame
4. (If baseline) take matching screenshots of the baseline SVG
5. Score against the 5-point checklist in `docs/animation-principles.md`
6. Emit verdict and exit

## 3. `lib-extender`

**File**: `.claude/agents/lib-extender.md`

**Purpose**: Add new primitives to `lib/` with safety: JSDoc + at least one
preset using it + tests passing + docs updated.

**Frontmatter**:
```yaml
---
description: Adds a new primitive to lib/primitives/, verifies it's used by at least one preset, runs the snapshot suite, and updates docs.
tools: Read, Write, Edit, Glob, Grep, Bash(npm test*)
---
```

**Input contract**:
- Primitive name + category (motion / shapes / filters)
- Concrete need (which preset will use it)

**Output contract**:
```
EXTENDED: <category>.<name>
Used by: <preset slug>
Tests: <pass | fail with summary>
Docs: <updated paths>
```

**Body** outline:
1. Read the category file to learn conventions
2. Implement the new function (JSDoc, sensible defaults, opts object)
3. Update the consuming preset to use it
4. Run `npm test`
5. If snapshot changed, prompt the main thread for approval before
   `npm run snapshot:update`
6. Append entry to `docs/lib-api.md` and the CLAUDE.md `lib API index`

## How subagents talk to skills

```
Main thread
  │
  ├─ /svg-animate skill loaded
  │   ├─ composes preset
  │   ├─ calls /svg-verify (skill with context:fork)
  │   │   └─ runs `svg-verifier` agent
  │   │       └─ returns ≤100-word verdict to skill
  │   └─ skill returns to user
  │
  └─ /svg-add-primitive skill (manually invoked)
      └─ runs `lib-extender` agent
          └─ returns one-block report
```

The skill is the "front door"; the subagent is what does the heavy work
inside.

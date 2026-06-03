# Sprint 4 — Dynamic Workflows + Agent SDK Wrapper

> Reserved for complex multi-asset jobs and (optionally) productizing this
> system. Not yet implemented; this document is the design.

## 4A. Dynamic Workflows — when one skill isn't enough

### When to trigger

Dynamic Workflows (Opus 4.8+) are appropriate for **multi-asset** or
**multi-stage** requests:

- "Build me a full brand animation kit"
- "Generate the complete mascot motion set: idle, jump, wave, sleep"
- "I need loader + success + error animations that all share style"
- "Audit every preset in this repo for the new brand palette"

For single-asset requests, `/svg-animate` alone is enough. Dynamic Workflows
cost ~10× more tokens.

### How a user triggers it

Two ways (per Anthropic docs):

1. Explicitly: `Create a workflow that generates loader + success + error animations sharing palette {orange, white, dark}`
2. Set effort to `ultracode` via `/effort ultracode` (lets Claude decide when
   to escalate)

### The orchestration script template

When Claude writes the workflow, it should look roughly like:

```
1. Parse brand spec
   - Identify shared inputs: palette, character archetype, brand tone
   - Identify the asset list to produce

2. Spawn N parallel /svg-animate subagents
   - Each gets: asset name + shared brand spec
   - Each writes output/<asset>.svg

3. After all complete, spawn /svg-verify for each in parallel
   - Aggregate verdicts

4. If any fail, spawn one retry round
   - Each /svg-animate gets the verdict text to inform tweaks

5. Run /svg-export on all passing assets

6. Compose a kit:
   - kit/index.html (preview grid)
   - kit/README.md (asset list + usage notes)
   - kit/manifest.json (machine-readable index)

7. Return: path to kit/, summary of N assets, any escalations
```

### Token-cost discipline

- Cap parallelism: 4 simultaneous `/svg-animate` is usually enough; more
  exhausts the per-session budget.
- Cap retries: each asset gets one retry round. Beyond that, escalate.
- Each subagent must return ≤200-word summary; the workflow assembles a
  ≤500-word report for the user.

## 4B. Agent SDK Wrapper — when you want to ship this as a product

### When to do this

Only when you want callers other than your own Claude Code session to drive
this system. Examples:

- A web UI where users describe animations and download SVGs
- A Figma plugin that generates animations from selected layers
- A VS Code extension command
- A CI step that auto-generates marketing assets from a YAML brief

### Package shape

```
agent-sdk-svg-animator/
├─ src/
│  ├─ index.ts           // public API: animateSVG(description, opts)
│  ├─ session.ts         // session lifecycle wrappers
│  └─ stream.ts          // progress event types
├─ package.json          // depends on @anthropic-ai/claude-agent-sdk
└─ README.md
```

### Public API sketch

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

export interface AnimateOptions {
  description: string;
  studioPath?: string;        // default: bundled
  outputDir?: string;
  variants?: number;          // delegate to svg-explorer
  onProgress?: (event: ProgressEvent) => void;
}

export async function animateSVG(opts: AnimateOptions): Promise<AnimateResult> {
  // Compose a /svg-animate invocation, run via the SDK with
  // cwd: opts.studioPath and chrome-devtools MCP enabled.
  // Wire PostToolUse(Write) hook to emit file-written events.
  for await (const msg of query({
    prompt: `/svg-animate ${opts.description}`,
    options: {
      cwd: opts.studioPath ?? bundledStudioPath,
      allowedTools: ['Read', 'Write', 'Bash', 'Agent'],
      mcpServers: {
        'chrome-devtools': { command: 'npx', args: ['@chrome-devtools/mcp'] }
      },
      hooks: {
        PostToolUse: [{
          matcher: 'Write',
          hooks: [emitFileWritten(opts.onProgress)]
        }]
      }
    }
  })) {
    // forward typed events
  }
  return result;
}
```

### Productization tradeoffs

- **Agent SDK** runs in YOUR process, on YOUR filesystem — best for power
  users who want to inspect intermediate output.
- **Managed Agents** (Anthropic's REST API) is the alternative — runs in a
  sandbox; lower ops burden; can't directly write to caller's filesystem.
- Common pattern: prototype with Agent SDK; migrate to Managed Agents when
  you want zero-ops production hosting.

## Trigger phrase cheat sheet

When the user types one of these (or an obvious variant), reach for the
workflow approach rather than `/svg-animate`. The phrases share three
markers: **plural assets**, **shared constraints**, or **multi-stage
production**.

| User says (or variant) | What to do |
|---|---|
| "build me a full brand animation kit" | `/ultracode` workflow: orchestrate logo + loader + success + error + hover, all sharing a single brand spec |
| "I need a mascot's complete motion set: idle, jump, wave, sleep" | `/ultracode` workflow: 4 parallel `/svg-animate` calls sharing character template |
| "generate loader, success, and error animations that all share style" | `/ultracode` workflow: 3 parallel `/svg-animate` calls + style consistency pass |
| "audit every preset in this repo for the new brand palette" | `/ultracode` workflow: read all presets, generate variants in parallel, compare against new palette |
| "create a workflow that ..." | Direct workflow request — Claude writes the orchestration script per the user's spec |
| "process this batch of 20 logo briefs" | `/ultracode` workflow: split into batches, run `/svg-animate` per brief, aggregate |
| "make me one X" | NOT a workflow. Use `/svg-animate` alone. |
| "give me 3 variants of X" | NOT a workflow. Use `svg-explorer` subagent (Sprint 3) via `/svg-animate`. |

Disambiguation rules:

- If the user names **a single asset** (even if it's complex), prefer
  `/svg-animate`. Workflows add ~10× token cost.
- If the user names **a known list of similar assets**, prefer workflow.
- If the user names **a brief that needs interpretation** (e.g., "make
  our product feel alive"), ask one clarifying question first — what
  scope they have in mind. Then choose.

## Cross-references

- Layer 5/6 of `docs/ARCHITECTURE.md`
- Sprint 2 skill designs (`docs/sprint-2-skills.md`)
- Sprint 3 subagent designs (`docs/sprint-3-subagents.md`)
- Anthropic Dynamic Workflows blog (URL in `docs/research-findings.md`)

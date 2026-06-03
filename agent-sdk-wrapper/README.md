# agent-sdk-wrapper

> **Status**: scaffolding only. Sprint 4 placeholder. **Activate this package
> only when you need to expose svg-animation-studio as a programmatic API
> to callers outside Claude Code itself** (Web UI, Figma plugin, VS Code
> extension, CI step, etc.). For everyday use inside Claude Code, the four
> skills + three subagents are enough.

## What this wraps

`@anthropic-ai/claude-agent-sdk` lets you run Claude Code-style agent loops
inside your own Node process. This package's job: expose a single typed
function `animateSVG(opts)` that runs the `/svg-animate` skill in this
repository's context, streaming progress events back to the caller.

## Public API (planned)

```typescript
import { animateSVG } from 'agent-sdk-wrapper';

const result = await animateSVG({
  description: 'a bouncing orange mascot',
  outputDir: './my-app/public/svgs/',
  variants: 1,                    // > 1 routes through svg-explorer
  onProgress: (ev) => console.log(ev.type, ev.detail)
});

console.log(result.outputPath);   // './my-app/public/svgs/bouncing-orange-mascot.svg'
console.log(result.verdict);      // 'pass'
console.log(result.primitivesUsed);
```

## Why it's scaffolding only

1. **The skill ecosystem must be stable first.** Sprint 2 (skills) and
   Sprint 3 (subagents) are still maturing. Wrapping them now means
   re-wrapping every time a skill's invocation contract drifts.
2. **Token cost is non-trivial.** Each `animateSVG()` call runs a full
   skill loop, including subagents for verification and (optionally)
   exploration. Production callers need rate limiting and caching.
3. **Authentication.** The wrapper needs `ANTHROPIC_API_KEY` and a quota
   model. That's product engineering, not lib engineering.

When you decide to activate this, see [`docs/sprint-4-workflows.md`](../docs/sprint-4-workflows.md#4b-agent-sdk-wrapper--when-you-want-to-ship-this-as-a-product)
for the design rationale and the productization tradeoffs (Agent SDK vs
Managed Agents).

## To activate

1. `npm install --save @anthropic-ai/claude-agent-sdk`
2. Fill in `src/index.ts` per the sketch in `docs/sprint-4-workflows.md`
3. Wire the `PostToolUse(Write)` hook to emit `outputWritten` events
4. Add a thin `mcpServers` config so the chrome-devtools MCP is available
   for `/svg-verify`
5. Add a `package.json` here, pin types, and decide on the public name

## Currently in this directory

- `README.md` — this file
- `src/` — empty, awaiting activation

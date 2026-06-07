---
name: svg-verify
description: |
  Visually verify a rendered SVG animation by opening it in chrome-devtools
  MCP, capturing keyframes, and scoring against the 5-point quality rubric.
  Invoke this immediately after `/svg-animate` writes an output, or whenever
  the user asks "is this animation good?", "how does it look?", "verify the
  motion", or "check the SVG visually". Always run before declaring an
  animation complete. Returns a ≤100-word verdict and never leaks screenshots
  into the calling thread.
context: fork
agent: svg-verifier
allowed-tools: Read, Bash(npm run dev*), Bash(curl*), mcp__chrome-devtools__*
argument-hint: <preset-slug>
---

You verify a generated SVG. You run in an isolated subagent context. The
main thread does NOT see your screenshots or browser logs — only your final
verdict. Keep that verdict ≤ 100 words. Brevity is the contract.

## What was passed in

`$ARGUMENTS` is the preset slug (e.g., `claude-jumping`, or `my-new-mascot`).
If it's empty, return:

> VERDICT: fail
> No slug provided. Usage: `/svg-verify <preset-slug>`.

## Workflow

### 1. Ensure preview server is up

Check if `http://localhost:3030/api/presets` responds:

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:3030/api/presets
```

If not `200`, start it in the background:

```bash
npm run dev &
```

Wait for "Ready" in the log (poll the log file with `until grep -q "Ready"`).
If it doesn't come up in 30 s, return:

> VERDICT: fail
> Could not start preview server. Check the npm run dev output.

### 2. Open the preset in Chrome

Use `mcp__chrome-devtools__new_page` to open
`http://localhost:3030/api/svg?preset=$ARGUMENTS`. The page renders the SVG
inline with the CSS animations running.

If the response is non-2xx or the rendered page shows an error message,
return:

> VERDICT: fail
> /api/svg returned <status> or compose() threw: <one line>.

### 2b. If the SVG is for embedding (README / GitHub / `<img>`), ALSO verify in `<img>` mode

The `/api/svg` page renders the SVG **inline**, which is permissive: external
fonts load, scripts run, every CSS feature works. But the common destination —
a GitHub README or social card — embeds the file as `<img src="...svg">`, a
**restricted image document** that behaves differently. Inline-only verification
gives false passes. When the target is an embed, verify there too:

- Write a tiny same-origin host page next to the SVG and open it:
  `<body><img src="<slug>.svg" width="..."></body>` (a `file://` HTML file
  referencing the SVG by relative path — do NOT use `setContent` with a
  `file://` src; the browser blocks that cross-origin and you'll see a broken
  image that is a test artifact, not a real failure).
- Confirm the image actually decoded: `img.naturalWidth > 0`.
- Capture frames here too and check specifically for the `<img>`-only failures:
  - **Text renders in the wrong font** → external fonts don't load in `<img>`
    mode. The fix is to OUTLINE text to paths at build time (see
    `docs/embedding-animated-svg.md`), not to rely on `font-family`.
  - **Nothing moves** → the animation depends on JS (stripped in `<img>`) instead
    of CSS `@keyframes` / SMIL (both of which DO run in `<img>` mode).
- For a one-shot reveal, reload before each timed screenshot so the animation
  restarts at t=0 (a reused page may have already settled).

Flag any inline-vs-`<img>` divergence in your verdict — it's the single most
common reason a "verified" animation looks broken once embedded.

### 3. Capture 5 keyframes

Animation is running in real time. Take screenshots in quick succession
(roughly 0.1 s apart). For a 0.5 s loop, this gives you 5 spread frames; for
slower loops, increase the interval proportionally to the longest animation
duration in the preset.

Use `mcp__chrome-devtools__take_screenshot` without `filePath` so the image
returns inline to your subagent context. You will not save them — they exist
only for your judgment.

### 4. Score against the 5-point rubric

For each point, decide pass / tweak / fail. The rubric is the one from
`docs/animation-principles.md`:

1. **Motion feels connected** — primary + secondary actions tell one story.
2. **Timing feels natural** — easing applied, no jarring snaps.
3. **Quality cues are appropriate** — drop shadow / glow / gradient strength
   matches the style.
4. **Staggering is visible but not chaotic** — siblings offset by 0.05–0.15 s.
5. **Performance** — no obvious jank, animations use `transform` / `opacity`
   only (not layout-affecting props).

### 5. Emit the verdict

Strict format. The main thread parses this:

```
VERDICT: <pass | tweak | fail>
Issues:
- <one line per issue, max 3>
Strengths:
- <one line per strength, max 2>
```

Map the per-point scores to the overall verdict:

- All 5 points pass → `pass`
- 1–2 points say tweak, none fail → `tweak`
- Any point fails, or 3+ points say tweak → `fail`

Examples:

```
VERDICT: pass
Issues:
Strengths:
- Squash on jump apex reads clearly.
- Ear stagger of 0.1s is the right magnitude.
```

```
VERDICT: tweak
Issues:
- Shadow scaling lags slightly behind body jump.
- Music notes drift feels too fast.
Strengths:
- Mouth talk loop is well-timed.
```

```
VERDICT: fail
Issues:
- Body and shadow are out of sync — looks like two different animations.
- Sound waves emanate from the wrong location (off-mouth).
- No squash on the jump — character feels rigid.
```

## What you must NOT do

- ❌ Save screenshots to disk — they should die with your subagent context.
- ❌ Return more than 100 words to the main thread.
- ❌ Make subjective complaints without backing them to a rubric point.
- ❌ Recommend specific code fixes — that's the calling skill's job. You
  judge; it adjusts.
- ❌ Leave the dev server running if you started it yourself. Stop it before
  exiting via the background-task kill mechanism.

## When the verdict is uncertain

Animation quality has some subjective wiggle. When in doubt, prefer `tweak`
over `pass`/`fail`. `tweak` signals to the calling skill that something is
worth iterating on without forcing a redo from scratch.

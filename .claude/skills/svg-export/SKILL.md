---
name: svg-export
description: |
  Finalize a rendered SVG for production: run SVGO optimization, add
  accessibility metadata (<title>, <desc>), verify viewBox sanity, and
  copy to a user-specified destination. Use when the user says "ship it",
  "optimize and export", "make it production-ready", "minify this SVG",
  "copy the final SVG to <path>", "export <slug> for the website", or
  asks for the byte-size after optimization. Always run after /svg-animate
  produces a passing verdict and before the SVG is committed or shared.
allowed-tools: Read, Write, Bash(npx svgo*), Bash(node*), Bash(Copy-Item*), Bash(cp*)
argument-hint: <preset-slug> [--out=<path>]
---

You finalize an SVG that's already been rendered and visually verified.
You're the last step before the file leaves the repo. Your job: make it
small, accessible, and well-named.

## What was passed in

`$ARGUMENTS[0]` is the preset slug (must exist in `output/`).
`$ARGUMENTS[1..N]` may include `--out=<path>` to copy the final file
somewhere outside `output/`.

If no slug, return:

> usage: `/svg-export <preset-slug> [--out=<path>]`

If `output/<slug>.svg` doesn't exist, ask the caller to run
`/svg-animate` (or `node lib/render-cli.js <slug>`) first.

## Step 1 — Verify the source

Read `output/<slug>.svg`. Sanity-check:

- Contains `<svg ` opening tag and `</svg>` closing tag.
- Has a `viewBox` attribute (otherwise scaling is broken).
- Has a `<title>` element (presets emit it via composeSVG's `title` opt).
  If missing, fall back to the slug. Log a warning — presets should set
  title and desc explicitly.

If structural checks fail, return:

> EXPORT FAILED: <reason>
> Source: output/<slug>.svg
> Re-render via `/svg-animate` or `node lib/render-cli.js <slug>`.

## Step 2 — Optimize with SVGO

Run SVGO with multipass. Preserve `viewBox` (do not strip!), preserve
`title` and `desc` (those are accessibility, not bloat).

```bash
npx svgo output/<slug>.svg -o output/<slug>.min.svg --multipass \
  --enable=preset-default \
  --disable=removeViewBox,removeTitle,removeDesc
```

Capture before/after sizes. Typical savings: 30–60%. If savings are <
5%, the file is already small or SVGO has nothing to do — that's fine,
not a problem.

## Step 3 — Verify minified file still composes

Quick parse check — the file must contain `<svg` and `</svg>` and be
non-empty after minification. If not, abort and keep the unminified
version as the authoritative output:

```
WARNING: SVGO produced unparseable output. Keeping output/<slug>.svg as final.
```

## Step 4 — Copy to destination (if requested)

If `--out=<path>` was passed:

- If the path ends in `.svg`, copy `output/<slug>.min.svg` there.
- If the path is a directory, copy as `<dir>/<slug>.svg` (NOT `.min.svg`
  — users want a clean filename at the destination).
- Create parent directories if missing.
- Refuse to overwrite without explicit acknowledgement (`--force`).

## Step 5 — Report

```
EXPORTED: <slug>
Source:     output/<slug>.svg (<bytes> bytes)
Minified:   output/<slug>.min.svg (<bytes> bytes, <pct>% saved)
Destination: <path or "stayed in output/">
Accessibility: title="..." desc="..."
ViewBox:    "<viewBox>"
```

Keep it under 8 lines. The caller will share this with the user.

## Anti-patterns

- ❌ Stripping `viewBox`, `<title>`, or `<desc>`. They're tiny and critical
  for accessibility / responsive scaling. SVGO's default `removeViewBox`
  preset would strip viewBox; we disable it.
- ❌ Overwriting an existing destination file without a `--force` flag.
  Users have lost work to that.
- ❌ Running SVGO on a file we're not sure about. Always do Step 1's
  structural check first.
- ❌ Forgetting to copy to `--out=` when the user asked. The whole point
  of this skill is shipping the file to where they want it.

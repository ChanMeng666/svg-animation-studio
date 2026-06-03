# Animation Principles — Cheat Sheet for SVG Micro-Animations

> The 7 of Disney's 12 principles that translate directly to SVG. Each maps to
> a primitive or compositional habit in this repo. Loaded on demand by the
> `/svg-animate` skill.

## 1. Squash & stretch

Objects deform along their motion axis. A jumping body lengthens at apex,
flattens on landing. This conveys mass and elasticity.

- **Implementation**: `motion.createJump` — `scaleY(1.1) scaleX(0.95)` at
  apex, `scaleY(0.95) scaleX(1.05)` on impact.
- **Magnitude guide**: stiff (glass / robot) = 1–3 %; default (organism) =
  5–10 %; squishy (slime / mascot) = 15–25 %.
- **Preset evidence**: `claudeJumping.compose()` (see source SVG
  `claude-jumping.svg:26-31`).

## 2. Anticipation

A small reverse move before a main move. Prepares the eye, makes the motion
feel intentional.

- **Implementation hint**: in a CSS jump, the `0%` → `~10%` segment dips
  slightly *down* before the upward `30%–50%` segment.
- **When to add**: any explicit action (button press, attack swing). Skip
  for idle loops.

## 3. Ease in / ease out

Motion accelerates and decelerates, never abrupt. Linear motion looks
mechanical.

- **Implementation**: `lib/easing.js` provides named cubic-beziers.
  Default for organic motion: `cssEasing.easeInOut`. For overshoot:
  `cssEasing.easeOutBack` or `cssEasing.bouncy`. For UI snap:
  `cssEasing.snappy`.
- **Anti-pattern**: only use `linear` for genuine continuous motion (sparks
  drifting up, spinner rotation).

## 4. Staggering

Multiple similar elements move with offset timing. Creates life and rhythm.

- **Implementation**:
  - In CSS: `animation: ear-bounce 0.5s infinite 0.1s` (the trailing `0.1s`
    is the delay).
  - In SMIL: `begin="0.1s"` or `createStaggeredBegins(count, base, step)`
    helper from gradient-svg-generator's pattern.
- **Magnitude guide**: 0.05–0.15 s between siblings. Less = unison; more =
  cascade.
- **Preset evidence**: `claudeJumping` ears stagger by 0.1 s
  (`claude-jumping.svg:23`).

## 5. Secondary action

Subtle motions that respond to the primary motion. The body jumps (primary);
ears bounce, arms wave, shadow scales (secondary). Each multiplies
liveliness.

- **Implementation**: a preset composes a primary primitive
  (`createJump`) plus 2–4 secondary primitives (`createEarBounce`,
  `createWaveArm`, `createShadowScale`).
- **Pitfall**: secondary actions should be *slower* and *smaller* than the
  primary, or they will fight for attention.

## 6. Follow-through & overlapping action

When a body stops moving, attached parts continue briefly. Cape, tail, hair.

- **Implementation**: in CSS keyframes, the secondary's `0% → 100%` is
  slightly *delayed* relative to the primary's. The `100%` of an ear flick
  might be at `60%` of the body's keyframe timeline.
- **Equivalent in our presets**: `createEarBounce` uses asymmetric `40%` /
  `60%` keyframes that lag the body jump.

## 7. Appeal

Read at a glance. Silhouette matters. Generous size of expressive features
(eyes, mouth). Personality over realism.

- **Implementation in `shapes`**: pixel-art characters use 8×10 eyes on a
  72×32 body — proportionally huge. This is why the Claude/Codex mascots
  read instantly.
- **Color**: stick to 2–3 distinct hues per character. The Codex cloud body
  uses a 5-stop gradient but on a single hue arc (purple → cyan).

## Checklist when verifying a generated SVG

Used by the `/svg-verify` skill's scoring rubric:

1. **Motion feels connected**: does primary + secondary actions tell one
   story?
2. **Timing feels natural**: easing applied? no jarring snaps?
3. **Quality cues are appropriate**: drop shadow / glow / gradient
   strength matches the style (pixel-art = none; polished = present).
4. **Staggering is visible but not chaotic**: siblings offset by 0.05–0.15 s.
5. **Performance**: no more than ~15 animated properties; GPU-friendly
   (transform + opacity over `top` / `left` / `width`).

## When to break the rules

Realistic physics simulation, infographics, data viz — these often *want*
linear motion and no anticipation. Use this cheat sheet for character /
brand / loader animation, not for everything.

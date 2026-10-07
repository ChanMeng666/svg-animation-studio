# Animating a mark: CSS-only character animation on a frozen logo

How to take a finished, single-colour brand mark and make it cycle through
expressions, props and seasons on a long loop, **without editing a byte of the
logo's geometry**. One file, no JavaScript, plays inside `<img>`.

This is the engineering playbook behind
[`chan-monkey-live.svg`](https://github.com/ChanMeng666/chan-meng-logo/blob/main/assets/anime/chan-monkey-live.svg) in
[chan-meng-logo](https://github.com/ChanMeng666/chan-meng-logo): a 39 KB file that
runs eight emoji-style expressions across four seasons on a 100-second loop. It was
written there, for that mark, and is kept here as well because the method is general
and this studio is where animated SVGs get made. The measured atlas in section 5 and
the inventory in section 15 are that mark's own; the patterns, the failures and the
verification harness apply to any mark.

It records not only what worked but the six failures that produced the rules. Every
one of them looked correct in the source and only showed when rendered.

**The governing principle:** *the brand mark is frozen; the animation is a layer on
top of it.*

How it relates to the rest of this studio:

- Its master clock (section 3) and gate keyframes (section 4) are the same idea as
  `lib/timeline.js`: every rule on one loop, the neutral frame as the base state.
  `createTimeline` writes those rules for you.
- Its verification harness (section 11) is what `scripts/capture-frames.mjs`
  automates for the `<img>` and reduced-motion steps.
- For a card that shows a product at work rather than a mark, read
  [`product-cards.md`](product-cards.md).

---

## Table of contents

1. [The layer model and the three invariants](#1-the-layer-model-and-the-three-invariants)
2. [Controlling frozen markup from CSS alone](#2-controlling-frozen-markup-from-css-alone)
3. [The master clock](#3-the-master-clock)
4. [The gate keyframe pattern](#4-the-gate-keyframe-pattern)
5. [Measure, never assume](#5-measure-never-assume)
6. [The ink-on-ink problem](#6-the-ink-on-ink-problem)
7. [Particle systems](#7-particle-systems)
8. [Legibility at logo scale](#8-legibility-at-logo-scale)
9. [Portability rules](#9-portability-rules)
10. [The accessibility contract](#10-the-accessibility-contract)
11. [The verification harness](#11-the-verification-harness)
12. [Failure gallery](#12-failure-gallery)
13. [Recipes](#13-recipes)
14. [Pacing](#14-pacing)
15. [Naming conventions](#15-naming-conventions)

---

## 1. The layer model and the three invariants

SVG has **no `z-index`**. Document order *is* paint order. The whole design rests on this,
so the layer stack is the first thing to get right:

```
<title> <desc> <style> <defs>
1. base head path                    ← frozen, byte-identical
2. base eyes <g class="cv-blink-1">  ← frozen, byte-identical
3. base nostrils + mouth path        ← frozen, byte-identical
4. <g class="cv-fx" fill="#070607">  ← ink expression layer (over the head)
5. <g class="cv-props-winter">       ← colored props sitting on the head
6. <g class="cv-season cv-spring">   ┐
   … cv-summer, cv-autumn, cv-winter ┘ ← colored particles, painted LAST, drift in front
```

Reordering these silently breaks the piece — petals behind the head, expressions under the
silhouette. If you add a layer, decide its paint position *first*.

### The three invariants

Write them as a comment at the top of any animated variant. Every future edit must preserve
all three.

**Invariant 1 — the base nodes are byte-identical** to the generated static asset
(`assets/monkey/chan-meng-monkey-black-transparent.svg`): the even-odd head path, the eye
group, the nostrils+mouth path, in that order. New content is always a *sibling*, never a
modification. This is what lets `src/build_logo.py` remain the single source of truth for
the geometry.

Verify it mechanically, not by eye:

```python
import re
src = open('assets/anime/chan-monkey-blink.svg', encoding='utf-8').read()
new = open('assets/anime/chan-monkey-live.svg', encoding='utf-8').read()
pats = {
    'head':     r'<path fill="#070607" fill-rule="evenodd" d="M58\.26.*?"/>',
    'eyes':     r'<g class="cv-blink-1">.*?</g>',
    'features': r'<path fill="#070607" d="M124\.53.*?"/>',
}
for name, p in pats.items():
    a, b = re.search(p, src, re.S), re.search(p, new, re.S)
    print(name, 'IDENTICAL' if a and b and a.group(0) == b.group(0) else 'PROBLEM')
```

**Invariant 2 — no new bare `<path>` / `<circle>` / `<ellipse>` may be a direct child of
`<svg>`.** Everything new goes inside a `<g>` or `<defs>`. The stylesheet gates the base
mouth with the structural selector `svg > path:nth-of-type(2)`; add a bare sibling path and
that selector silently retargets to the wrong element. Nothing errors — the animation just
starts fading the wrong thing.

**Invariant 3 — every overlay group's static, un-animated state is `opacity: 0`.** See
[§10](#10-the-accessibility-contract).

---

## 2. Controlling frozen markup from CSS alone

Invariant 1 says you cannot touch the base elements. But you still need to hide the plain
eyes when heart-eyes are showing. The resolution: **CSS lives in `<style>`, not in the
elements.** The markup stays frozen while the stylesheet drives it.

```css
.cv-blink-1 {
  animation: kf-cv-blink-1 5s   ease-in-out infinite,   /* original — animates transform */
             kf-cv-eyes-off 100s linear     infinite;   /* added    — animates opacity   */
  transform-box: fill-box;
  transform-origin: center;
}
svg > path:nth-of-type(2) { animation: kf-cv-mouth-off 100s linear infinite; }
```

### Two animations on one element

This is legal **only because they touch different properties.** `kf-cv-blink-1` writes
`transform`; `kf-cv-eyes-off` writes `opacity`. They compose cleanly and the original blink
survives untouched.

Put two `transform` animations on the same element and the later one wins outright — the
earlier is silently discarded. This is exactly why the 😮 *wow* expression uses **new,
larger circles** rather than a `scale()` on the existing eye group: the eye group's
`transform` slot is already spent on the blink.

> **Rule:** before adding an animation to an element that already has one, list the
> properties each one writes. Overlap on any property = one of them is dead.

### When frozen markup bundles two features

The base `path:nth-of-type(2)` contains the nostrils **and** the mouth in one `d` string.
Fading it to draw a new mouth also deletes the nostrils.

The fix is a **stand-in**: redraw the bundled-but-still-wanted feature in the overlay,
matched to the original within half a pixel, and switch it on *just outside* the fade of the
element it replaces so the two never dim together:

```svg
<g class="cv-nose">
  <ellipse cx="124.25" cy="182.10" rx="9.4" ry="8.4"/>
  <ellipse cx="150.62" cy="182.00" rx="9.2" ry="8.5"/>
</g>
```

```css
/* base path fades out over 2.5%→3.1%; the stand-in hard-switches at 2.41% */
@keyframes kf-cv-nose-on {
  0%,2.4%{opacity:0}      2.41%,11.1%{opacity:1}
  11.11%,27.4%{opacity:0} 27.41%,36.1%{opacity:1}
  /* … one pair per window where the base mouth is hidden … */
}
```

The 0.01 % ramp is a deliberate hard switch. A gradual crossfade here would show both
nostril sets at partial opacity simultaneously, which reads as a flicker.

This unlocks everything downstream: with the base mouth gone, mouth expressions are
free-standing shapes. Without the stand-in you would be forced to design every mouth as a
*superset* that fully covers the original crescent — a severe constraint that makes small
mouths (the 🤔 `w`-mouth, the 😴 sleeping mouth) impossible.

---

## 3. The master clock

Every gated element shares one duration, one timing function, and one iteration count:

```css
.cv-nose, .cv-eyes-arc, /* … every overlay group … */ .cv-season {
  opacity: 0;                          /* Invariant 3 */
  animation-duration: 100s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
```

Individual `animation-name` assignments then select which window each group occupies. One
shared clock means every group is phase-locked by construction — there is no drift to debug.

### Choose the period so 1 s = 1 %

`chan-monkey-live.svg` runs **D = 100 s**. That number is not aesthetic; it is a debugging
decision. At D = 100 s, `1s = 1%`, so **every percentage in the stylesheet is literally the
second at which it fires.** Fifteen interlocking keyframe blocks become readable and
hand-checkable.

The earlier draft ran at D = 40 s, where `1s = 2.5%` and every boundary was a multiplication
(`38.75%`, `46.75%`, `63.75%`…). Retiming it required re-deriving all fifteen blocks. At
D = 100 s a retime is arithmetic you can do in your head.

> **Rule:** pick the master period so that your natural time unit lands on a round
> percentage. 100 s for second-granularity; 50 s if 1 s = 2 % suits the piece better.

### The act structure

Four 25 s seasonal acts, each holding two expressions with neutral gaps between:

| Offset in act | 0–2.5 s | 2.5–11 s | 11–14 s | 14–22.5 s | 22.5–25 s |
|---|---|---|---|---|---|
| | neutral | expression A | neutral | expression B | neutral |

Acts start at 0 / 25 / 50 / 75 %. Neutral gaps matter: they let the mark return to its
canonical resting state regularly, which is what keeps a heavily animated logo still
reading as *that logo*.

---

## 4. The gate keyframe pattern

Every window is a four-stop opacity envelope: hidden, fade in, hold, fade out, hidden.

```css
@keyframes kf-cv-w1 { 0%,2.5%{opacity:0} 3.1%,10.4%{opacity:1} 11%,100%{opacity:0} }
@keyframes kf-cv-w4 { 0%,39%{opacity:0}  39.6%,46.9%{opacity:1} 47.5%,100%{opacity:0} }
```

The doubled stops (`0%,2.5%`) are what create the *hold* — without them the browser
interpolates linearly across the whole period and everything is permanently half-visible.

Elements sharing a window share a keyframe name:

```css
.cv-eyes-arc, .cv-mouth-open            { animation-name: kf-cv-w1; }
.cv-brows, .cv-mouth-w, .cv-bulb        { animation-name: kf-cv-w5; }
```

Elements spanning several windows get a bespoke envelope — blush appears in three:

```css
@keyframes kf-cv-blush {
  0%,2.5%{opacity:0}     3.1%,10.4%{opacity:1}  11%,14%{opacity:0}
  14.6%,21.9%{opacity:1} 22.5%,77.5%{opacity:0}
  78.1%,85.4%{opacity:1} 86%,100%{opacity:0}
}
```

### Combining a gate with an entrance

A gate keyframe can carry `transform` too, giving an element a physical entrance. The
sunglasses drop in from above with a 2 px overshoot:

```css
@keyframes kf-cv-shades {
  0%,27.5% { opacity:0; transform: translateY(-26px); }
  28.6%    { opacity:1; transform: translateY(2px);  }  /* overshoot */
  29.4%    { opacity:1; transform: translateY(0);    }  /* settle    */
  35.4%    { opacity:1; transform: translateY(0);    }
  36%      { opacity:0; transform: translateY(-8px); }
  100%     { opacity:0; transform: translateY(-26px); }
}
```

### Secondary motion rides underneath

Gates control *when*. Inside a gated group, children run their own short, unsynchronised
loops for *life* — a heartbeat, a bob, a spin. They only ever write `transform`, so they
never collide with the parent's opacity gate:

```css
.cv-heart   { animation: kf-cv-heartbeat 1.7s ease-in-out infinite;
              transform-box: fill-box; transform-origin: center; }
.cv-heart-r { animation-delay: .22s; }        /* stagger — never animate in lockstep */
```

Because the parent group is `opacity: 0` outside its window, the child's animation is
invisible there; it does not need to know about the master clock at all. This two-tier
split — **slow deterministic gates, fast independent motion** — is what keeps the stylesheet
tractable.

### Seasonal crossfades and the loop seam

```css
@keyframes kf-cv-season-1 { 0%,24%{opacity:1} 25%,99%{opacity:0} 100%{opacity:1} }
@keyframes kf-cv-season-4 { 0%,74%{opacity:0} 75%,99%{opacity:1} 100%{opacity:0} }
```

Season 1 must *return* to `opacity: 1` at 100 %, because 100 % and 0 % are the same instant.
Season 4 must reach 0 there. Get this wrong and the loop visibly flashes once per cycle —
easy to miss when you only ever scrub the middle of the timeline. **Always test the seam
explicitly** (see [§11](#11-the-verification-harness)).

---

## 5. Measure, never assume

This is the single highest-leverage practice in the whole document.

The mark is ~724 fitted cubic Bézier segments. Its bounding boxes are *not* its shape, and
placing elements from a bounding box produces work that looks right in the source and wrong
on screen. Every failure in [§12](#12-failure-gallery) traces to an assumption that a
two-line probe would have caught.

### The probing technique

`SVGGeometryElement.isPointInFill()` answers "is this coordinate inside this path's fill?"
respecting `fill-rule`. Load the SVG in a browser and interrogate the real geometry:

```js
// ASCII map of a region — the fastest way to see what a path actually covers
const p = document.querySelector('.cv-shades path');
const t = (x, y) => p.isPointInFill({ x, y });
let rows = [];
for (let y = 133; y <= 172; y += 3) {
  let s = '';
  for (let x = 78; x <= 198; x += 3) s += t(x, y) ? '#' : '.';
  rows.push(String(y).padStart(3) + ' ' + s);
}
console.log(rows.join('\n'));
```

```
136 ....##########.............##########....
142 ..######..#####..........######..######..     ← lens with knocked-out glint
145 ..#####..##.##################..##.####..     ← bridge row: lenses joined
154 ..####..#.######.........####..##.#####..     ← gap below the bridge
169 ....##########.............##########....
```

```js
// Edge-finding — where does the face hole actually end at each height?
const head = document.querySelector('svg > path');   // even-odd; true = black ink
const inInk = (x, y) => head.isPointInFill({ x, y });
for (let y = 143; y <= 172; y += 2) {
  let edge = null;
  for (let x = 170; x < 230; x++) if (inInk(x, y)) { edge = x; break; }
  console.log(`y=${y}: holeRightEdge=${edge}`);
}
```

Run this *before* choosing coordinates, not after something looks wrong.

### Measured atlas of this mark

Reference values, all verified by flattening the real Béziers. Reuse them; do not re-derive.

| Contour | Bounding box |
|---|---|
| Head silhouette (outer) | x 0.21–275.81, y 0.40–262.78 |
| Face hole | x 73.96–201.63, y 120.99–239.05 |
| Left / right inner-ear hole | x 21.65–43.19 / 232.26–254.33, y ≈ 128.6–165.6 |
| Left / right nostril | x 115.28–133.21 / 141.88–159.36, y ≈ 174.0–190.1 |
| Mouth crescent | x 107.34–168.11, y 205.03–223.25 |
| Left eye | centre (104.6, 152.59), r 16.55 |
| Right eye | centre (170.76, 152.56), r 16.56 |

**Three facts the bounding boxes hide:**

1. **The face hole is not an oval.** A black forehead wedge splits it into two lobes above
   y ≈ 137.5. At y = 122 the lobes span x ∈ [99.0, 115.6] and [160.4, 177.1]; they merge at
   y = 138. **Nothing may occupy x ∈ [133, 142] above y = 138.** This is why the heart eyes
   are exactly 31 units tall — any taller and their inner top corners cross into the wedge.

2. **The hole has a cheek waist at y ≈ 183**, where its left edge reaches x = 91.6. Measured
   left edge: y=170→79.5, 176→84.8, 180→89.7, **184→91.6**, 190→87.7, 200→83.2. Blush placed
   using the hole's overall bounding box (x from 74) half-disappears into the head.

3. **The free space is in the corners, and it is large.** The top-left block
   x ∈ [0, 70], y ∈ [15, 80] and the top-right block x ∈ [205, 276], y ∈ [20, 85] are
   entirely outside the silhouette. These are the stages for 💤, 💡, 🎵 and the summer sun —
   the "thought space" of the composition.

Right-hand edges, by height, for anything placed on that side:

| y | 143 | 155 | 165 | 175 | 185 | 78 | 94 | 102 | 110 |
|---|---|---|---|---|---|---|---|---|---|
| face-hole right edge | 201 | 202 | 199 | 192 | 185 | — | — | — | — |
| head outer right edge | — | — | — | — | — | 201 | 216 | 222 | 251 |

---

## 6. The ink-on-ink problem

A single-color knockout mark is a **solid silhouette**. Anything you draw on it in the same
ink is invisible. This constrains where facial features and props can go far more than the
geometry does, and it has exactly three escape routes.

### Route A — sit inside the transparent hole

The face and inner ears are genuine knockouts, so ink drawn there is silhouetted against
whatever is behind the page.

This is how the 😎 sunglasses work, and the decision was made by measurement: at eye level
the face hole spans x ∈ [74.0, 201.6], while the lenses need only x ∈ [82, 193.5]. They fit
**entirely inside the hole** with ~7 px of see-through margin on each side, so they never
touch the black head and nothing merges.

Two further devices sell them as glasses rather than a black bar:

- a transparent gap between the lenses, above and below a thin bridge;
- **knocked-out glints** — diagonal slashes cut with `fill-rule="evenodd"`, reusing the same
  knockout language as the face and ears, so it stays on-brand.

The frame is drawn as **one continuous closed contour** (lens → bridge → lens) so even-odd
produces no coincident-edge hairlines:

```svg
<g class="cv-shades">
  <path fill-rule="evenodd" d="M82 146A11 11 0 0 1 93 135H112.5A11 11 0 0 1 123.5 146V145H152
    V146A11 11 0 0 1 163 135H182.5A11 11 0 0 1 193.5 146V159A11 11 0 0 1 182.5 170H163
    A11 11 0 0 1 152 159V153H123.5V159A11 11 0 0 1 112.5 170H93A11 11 0 0 1 82 159Z
    M89 162L100 141H106L95 162ZM99.5 164L110.5 143H113.5L102.5 164Z
    M159 162L170 141H176L165 162ZM169.5 164L180.5 143H183.5L172.5 164Z"/>
</g>
```

### Route B — use color

Winter earmuffs are a band across the crown and two cups over the ears. In ink they would be
invisible; an outline would be too, since the outline color is the same ink. There is no
knockout available, because knocking out of the head would mean modifying the base node
(Invariant 1).

So the props are **colored**. Same for the oversized 😅 sweat drop: at 54 × 86 units it is
the largest single overlay in the file and reads instantly precisely *because* it is blue.

Color is a legitimate tool here, but it is a brand decision, not a technical one. In this
mark, color is confined to seasonal particles, the winter props and the sweat drop; the face
itself stays strictly monochrome.

### Route C — go outside the silhouette

💤, 💡, 🎵 and the sweat drop all live in the free corner blocks, off the head entirely. This
is also the comic-book convention, so it reads as intentional rather than as a workaround.

### The failure mode nobody predicts: visual bridging

Two shapes that are both correctly *inside* a transparent region can still merge visually if
they nearly touch each other and its edge.

The sweat drop originally sat on the right temple. The geometry checked out: max x 197.5,
hole edge 200–202 — inside. But the right eye reaches x 187.3, leaving a 1.2 px gap, and the
drop's other side left ~3 px to the hole edge. The eye, the drop and the black head fused
into one wedge-shaped blob.

> **Rule:** clearance from *one* boundary is not enough. When placing a shape in a narrow
> channel, check its clearance from **every** neighbour — and treat anything under ~4 units
> at logo scale as touching.

The eventual fix was Route C: the channel was genuinely too narrow (13 units total), so the
drop moved off the face entirely — which turned out to look far better anyway.

---

## 7. Particle systems

### Three-level nesting is mandatory

**A CSS `transform` overrides the `transform` presentation attribute on the same element.**
Set `transform="translate(54,0)"` on a node and then animate `transform` in CSS, and the
attribute is discarded — every particle collapses to x = 0.

So each particle needs three nodes, one per concern:

```svg
<g transform="translate(60,0)">            <!-- static x — CSS never touches this node -->
  <g class="cv-fall cv-fall-b cv-p2">      <!-- CSS animates translate: fall + sway     -->
    <use class="cv-flutter cv-r3 cv-c-petal2"
         href="#cv-petal" xlink:href="#cv-petal"/>   <!-- CSS animates rotate            -->
  </g>
</g>
```

Per-particle variation lives in tiny classes, not inline `style` attributes — smaller, and
immune to any sanitizer that strips `style`:

```css
.cv-p2 { animation-duration: 12.6s; animation-delay: -5.4s; }
.cv-r3 { animation-duration: 5s; }
```

**Negative `animation-delay` is the key to a natural field.** It starts each particle
mid-cycle, so the system looks already-running at t = 0 instead of every particle dropping
from the top in unison. Give every particle a distinct duration *and* a distinct negative
delay.

### Center every `<defs>` shape on (0,0)

```svg
<defs>
  <path id="cv-petal" d="M0-9C4.2-9 7.5-5.3 7.5-1C7.5 3.4 5.8 7 3.2 9C2.1 5.6 1.2 3.4 0 2.5
    C-1.2 3.4-2.1 5.6-3.2 9C-5.8 7-7.5 3.4-7.5-1C-7.5-5.3-4.2-9 0-9Z"/>
</defs>
```

A shape centered on its own origin rotates in place under
`transform-box: fill-box; transform-origin: center`, and degrades gracefully on engines that
do not support `fill-box`.

For a second size, define a **second scaled path** rather than putting `scale()` on an
animated node — that `transform` slot is already taken.

### Motion keyframes

Two mirrored fall paths give a field variety with only two keyframe blocks; reverse spin is
free via `animation-direction`.

```css
@keyframes kf-cv-fall-a {
  0%   { transform: translate(0px,  -40px); }
  25%  { transform: translate(12px,  45px); }
  50%  { transform: translate(-7px, 130px); }
  75%  { transform: translate(10px, 215px); }
  100% { transform: translate(-2px, 300px); }
}
@keyframes kf-cv-spin    { to { transform: rotate(360deg); } }
@keyframes kf-cv-flutter { 0% { transform: rotate(-32deg); } 100% { transform: rotate(30deg); } }
```

Particles enter above the canvas (`translateY(-40px)`) and exit below it (`300px` for a
263-tall viewBox). Keep `max |sway| + max shape half-width` inside the viewBox width or
particles clip at the edges.

Give each season a distinct motion signature — it does as much work as the shape does:
petals *flutter* (alternating partial rotation), leaves *tumble* (full spin), snow *drifts*
(slow, linear, halved sway).

### Known cost

Particles keep animating while their season group sits at `opacity: 0`. There is no
JS-free way to schedule `animation-play-state` per window. At ~29 particles the cost is
negligible, but it is a real compositor cost for as long as the page is open. If it ever
matters, cut particle counts rather than reaching for JavaScript.

---

## 8. Legibility at logo scale

A logo is viewed at 48–256 px. A 20-unit shape inside a 276-unit viewBox is **3–18 screen
pixels**. Detail below that threshold does not simplify — it turns to mush.

Two rules earned the hard way:

**Spiky polygons read as blobs.** The first autumn leaf was an accurate ten-point maple
silhouette. At size it rendered as an orange asterisk. Replaced with a smooth lanceolate
leaf — pointed tip, rounded body, visible stem — which reads instantly *and* matches the
mark's all-Bézier visual language. Faithful detail lost to legibility; the right trade.

**Distinguishing features must be exaggerated.** The first cherry petal had a notch 2.8
units deep on a 15-unit shape. It read as a pink egg. Deepening the notch to 6.5 units — over
a third of the shape's height — made it read as a petal. What identifies a shape has to be a
*large fraction* of that shape, not a proportionally accurate one.

Corollary: two shapes in the same piece need to differ on **more than one axis**. The petal
and the leaf differ in silhouette (notched vs pointed), proportion (15×18 vs 15×27), color
(pink vs orange) *and* motion (flutter vs tumble). Any one of those alone would be too
subtle at 96 px.

---

## 9. Portability rules

These are the non-obvious constraints that bite when a file leaves your browser.

**`var()` in presentation attributes is not portable.** Declare custom properties on the
`svg` selector, then apply them through **CSS classes** — never `fill="var(--cv-petal)"`.

```css
svg { --cv-petal:#F49AC1; --cv-snow:#8FC7E8; --cv-sweat:#3FA3E0; /* … */ }
.cv-c-petal { fill: var(--cv-petal); }
.cv-c-snow  { fill:none; stroke: var(--cv-snow); stroke-width:1.4; stroke-linecap:round; }
```

This also makes the palette a single editable block at the top of the file.

**Emit both `href` and `xlink:href` on every `<use>`**, and declare
`xmlns:xlink="http://www.w3.org/1999/xlink"`. Modern browsers accept bare `href`; older
rasterizers (librsvg < 2.46, Inkscape 0.92, various CI SVG→PNG pipelines) still require
`xlink:href`. A few hundred bytes buys full toolchain safety.

**`transform-box: fill-box` needs Safari 15.4+.** Below that it falls back to `view-box` and
in-place rotations become orbits around the canvas center. Mitigate by authoring `<defs>`
shapes centered on (0,0). For face-anchored elements prefer explicit numeric origins
(`transform-origin: 104.6px 152.59px`), which resolve identically under either value.

**Always set `transform-box` and `transform-origin` when you animate `scale` or `rotate`.**
The CSS initial `transform-origin` is `50% 50%`, which for an SVG element with the default
`transform-box: view-box` means *the center of the viewBox* — not the center of your shape.
Omit it and elements scale about a point far from themselves.

**GitHub rendering.** A `.svg` file referenced from a README is served through camo as an
`<img>`. Declarative animation (CSS and SMIL) runs; scripts are blocked. Camo caches
aggressively, so overwriting a published file may need a cache-buster or a new filename.
Pick mid-tone colors that survive both light and dark themes — pure white snow vanishes on
light mode, pastels vanish on dark.

That advice covers the *accent* colors. It cannot save the **ink**, which is a single
near-black knockout by design: on a dark README the whole mark is a black shape on a
near-black page. The static grid solves this by shipping a white-ink variant and letting
the consumer pick — but on a README you cannot pick reliably, for a reason worth stating
precisely, because an earlier revision of this section got it wrong.

**Correction (2026-08-12).** This section used to claim there is no `prefers-color-scheme`
hook available to an `<img>`-loaded SVG. That is false, at least in Chromium: an SVG
carrying `@media (prefers-color-scheme: dark)` internally, loaded through `<img>`, does
switch — measured by sampling the rendered pixel under both emulated schemes
(`rgb(0,170,0)` light, `rgb(255,0,0)` dark). Do not repeat the old claim.

The hook exists; it is simply **the wrong hook** here, for two independent reasons:

1. It follows the **operating system** preference, while GitHub's theme is a **site
   setting**. A reader on a light OS with GitHub set to dark gets the light branch on a
   dark page — the original bug, now affecting only some readers and so harder to notice.
2. Confirmed in Chromium only. Treat other engines as unknown until tested.

So the conclusion is unchanged, and the two real answers are:

- **You control the host markup** (a README, a docs page): use `<picture>` with a
  `prefers-color-scheme: dark` source. GitHub honours it in Markdown and wraps it in a
  `<themed-picture>` element, which is what binds the swap to GitHub's own theme setting
  rather than to the OS media query. Keep the transparent original for light.
- **You control only a URL** (a profile field, a chat embed, a badge slot, someone else's
  README): stop being transparent — bring your own background, which is what
  `assets/anime/chan-monkey-live-on-white.svg` does (generated by
  `src/build-on-white.js`).

Three things to get right if you derive another background variant:

- **Pad the viewBox, do not wrap the artwork.** A wrapper `<g>` stops the base paths being
  direct `<svg>` children and silently retargets the `svg > path:nth-of-type(2)` mouth gate
  (Invariant 2). Widening the root viewBox leaves every artwork coordinate untouched.
- **Clip to the card.** Particles are authored to overflow the art box and be cut off by
  the viewBox edge (section 7). Pad the viewBox and that clip moves outward with it, so
  petals drift off the card and float loose on the host page. Put the `clip-path` on the
  root element — same reason as above.
- **Padding is not optional.** The head fills its box edge to edge; measure it (section 5)
  rather than assuming the author left a margin.

Note that such a variant changes what the reduced-motion contract in section 10 resolves
to: the fallback is the neutral mark **on its background**, i.e. the counterpart of
`chan-meng-monkey-black-on-white.svg` rather than of the transparent one. The card is
static and unconditionally visible, so Invariant 3 does not apply to it.

---

## 10. The accessibility contract

Inherited from the base file and deliberately wildcarded:

```css
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
```

`animation: none` reverts every element to its **static CSS state**. That gives a precise,
testable contract:

- every overlay group's static state must be `opacity: 0`;
- the base nodes' static state must be `opacity: 1` with no transform;
- therefore reduced motion renders **exactly the neutral mark**, pixel-identical to
  `chan-meng-monkey-black-transparent.svg`.

Secondary-motion classes only ever write `transform`, and they live inside groups that are
statically `opacity: 0`, so their resting state is irrelevant.

The wildcard means any animation you add is covered for free — but only if you also give the
new element a static `opacity: 0`. That is the whole of Invariant 3, and it is the easiest
thing in the file to forget.

---

## 11. The verification harness

**Reading the source is not verification.** Every bug in [§12](#12-failure-gallery) was
invisible in the markup. Build the harness first; it pays for itself immediately.

### Step 1 — a scrubable page

Inline the SVG into a page (several copies, on different backgrounds) and expose a seek
function. Inlining rather than `<img>` is what makes the timeline addressable.

```python
import re
svg = open('assets/anime/chan-monkey-live.svg', encoding='utf-8').read().strip()
html = '''<!doctype html><meta charset=utf-8><title>harness</title>
<style>
 body{margin:0;font:12px monospace;background:#888}
 .row{display:flex} .panel{display:flex;align-items:center;justify-content:center}
 .light{background:#fff} .dark{background:#0d1117}
 .big{width:560px;height:560px} .big svg{width:520px}
 .panel svg{width:280px;height:auto}
 #t{position:fixed;bottom:0;left:0;background:#000;color:#0f0;padding:2px 6px}
</style>
<div class=row>
  <div class="panel big light">SVGHERE</div>
  <div><div class="panel light" style="width:300px;height:300px">SVGHERE</div>
       <div class="panel dark"  style="width:300px;height:300px">SVGHERE</div></div>
</div>
<div id=t>t=?</div>
<script>
window.seek = function (ms) {
  document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; });
  document.getElementById("t").textContent = "t=" + ms + "ms";
  return document.getAnimations().length;
};
</script>'''
open('scratch/harness.html', 'w', encoding='utf-8').write(html.replace('SVGHERE', svg))
```

`document.getAnimations()` returns every running CSS animation in the document; pausing them
and setting `currentTime` makes the whole 100 s timeline randomly addressable. This is the
core trick — **without it you are waiting in real time to inspect frame 93**.

Re-inject after each edit rather than regenerating the page:

```python
h = re.sub(r'<svg .*?</svg>', lambda m: svg, open(path).read(), flags=re.S)
```

### Step 2 — assert the whole timeline programmatically

Screenshots catch appearance; this catches logic. Run it after **every** timing change:

```js
const svg = document.querySelector('.big svg');
const names = ['cv-nose','cv-eyes-arc','cv-eyes-heart','cv-eyes-wide','cv-eyes-squint',
  'cv-eyes-line','cv-brows','cv-mouth-open','cv-mouth-smirk','cv-mouth-gasp','cv-mouth-o',
  'cv-mouth-w','cv-mouth-sleep','cv-blush','cv-sweat','cv-zzz','cv-bulb','cv-notes',
  'cv-shades','cv-props-winter','cv-spring','cv-summer','cv-autumn','cv-winter'];
const eyes  = svg.querySelector('.cv-blink-1');
const mouth = svg.querySelector(':scope > path:nth-of-type(2)');
const times = { W1:6750, g1:12500, W2:18250, g2:24999, W3:31750, g3:37500, W4:43250,
                g4:49999, W5:56750, g5:62500, W6:68250, g6:74999, W7:81750, g7:87500,
                W8:93250, g8:98750 };
Object.entries(times).map(([l, t]) => {
  window.seek(t);
  const on = names.filter(n => +getComputedStyle(svg.querySelector('.' + n)).opacity > 0.5);
  return `${l} eyes=${getComputedStyle(eyes).opacity} mouth=${getComputedStyle(mouth).opacity} ${on}`;
}).join('\n');
```

Check three things in the output: the intended groups are on, **nothing else is**, and
exactly one season group is active at a time.

### Step 3 — the checks that are easy to skip

```js
// (a) the loop seam — 100% and 0% are the same instant
[99500, 99900, 0, 200].forEach(t => { window.seek(t); /* season 1 → 1, season 4 → 0 */ });

// (b) blink survival — proves the second animation did not clobber the first
window.seek(4800);
getComputedStyle(document.querySelector('.cv-blink-1')).transform;
// expect matrix(1, 0, 0, 0.1, 0, 0) — scaleY(0.1) — AND opacity still 1

// (c) reduced motion, simulated by cancelling every animation
document.getAnimations().forEach(a => a.cancel());
// expect: zero overlays with opacity > 0; base eyes and mouth at opacity 1, transform none

// (d) entrance profiles
[27400, 28100, 28600, 29400, 35400, 36000].forEach(t => { window.seek(t); /* shades */ });
```

### Step 4 — screenshot every window on every background

Seek to the middle of each window and capture. Look specifically for: shapes clipping the
face-hole edge, elements merging with the silhouette, nostrils flickering, and the wrong
season's particles.

### Step 5 — test through `<img>`

The final check. `<img>`-loaded SVG is a different rendering mode (no external resources,
no scripts) and it is how GitHub serves the file. Render at the sizes people will actually
see — 240 / 96 / 48 px — on both light and dark:

```html
<img src="…/chan-monkey-live.svg" width="240">
<img src="…/chan-monkey-live.svg" width="48">
```

---

## 12. Failure gallery

Six real bugs from this build. All were invisible in the source; all were caught by
rendering. Each one generalises.

### 12.1 The invisible knockout

**Symptom.** The sunglass lens glints — knocked out with `fill-rule="evenodd"` — did not
appear. An `isPointInFill` map proved the path geometry was *correct*.

**Cause.** The base eye circles were still visible under the lenses, so the knockouts
revealed black eyes rather than the page.

**Fix.** Gate the base eyes off during that window too. The lenses cover y 135–170 against
eyes at y 136.0–169.1, so hiding them costs nothing.

**Generalises to:** a knockout only reads if you know what is *behind* it. Audit the whole
layer stack under any transparent cut, not just the element you cut it from.

### 12.2 Visual bridging

**Symptom.** The sweat drop fused the right eye and the head into one blob.

**Cause.** Correct clearance from the hole edge, 1.2 px clearance from the eye.

**Fix.** Moved off the face entirely. See [§6](#6-the-ink-on-ink-problem).

**Generalises to:** check clearance from every neighbour, not just the one you were worried
about.

### 12.3 Animation consumed the safety margin

**Symptom.** The 🤔 raised brow clipped through the top of the face hole.

**Cause.** The static brow had 2.1 px of clearance — enough. Then
`kf-cv-brow-raise` translated it `-2.5px`.

**Fix.** Lowered the brow 4 units and reduced the raise to 2 px.

**Generalises to:** **validate geometry at the animation's extremes, not at rest.** Compute
clearance against the maximum displacement of every transform that touches the element.

### 12.4 Detail below the legibility threshold

**Symptom.** Maple leaves rendered as orange asterisks; cherry petals as pink eggs.

**Fix.** Smooth silhouettes; exaggerated distinguishing features. See
[§8](#8-legibility-at-logo-scale).

**Generalises to:** design shapes at their *display* size, not in an editor zoomed to 800 %.

### 12.5 The detached prop

**Symptom.** The winter scarf tail rendered as a dark red flag floating near the scarf.

**Cause.** A filled polygon authored independently of the scarf's stroked path; its start
point did not lie inside the scarf's round end-cap.

**Fix.** Redrew the tail as a *stroked path* starting inside the cap, same
`stroke-linecap: round`, so the join is seamless.

**Generalises to:** when extending a stroked shape, extend it with a stroke and start inside
the existing cap. Mixing fill-based and stroke-based construction at a joint rarely lines up.

### 12.6 Overlay swallowing the silhouette

**Symptom.** With earmuffs on, the hair curl looked like detached antlers.

**Cause.** The band sat at y ≈ 68 while the head's crown is at y ≈ 59 — leaving 4 px of black
between band and curl, which read as a gap.

**Fix.** Lowered the band 12 units, leaving ~17 px of head above it so the curl stays
visually attached.

**Generalises to:** a prop crossing a silhouette must leave enough of the original shape on
*both* sides to keep it legible. The mark's most distinctive feature — here the off-center
curl — needs the most room.

---

## 13. Recipes

### Add a new expression

1. **Pick the window.** Find a free slot in the act structure, or extend the loop. Note its
   start/end in seconds — which, at D = 100 s, are its percentages.
2. **Measure the space.** Probe the face hole at the heights your shapes will occupy
   ([§5](#5-measure-never-assume)). Check the forehead wedge if anything sits above y = 138,
   and the cheek waist if anything sits near y = 183.
3. **Draw it in a `<g>`** inside `.cv-fx`, ink-colored, respecting Invariant 2.
4. **Decide the base-node gates.** Does this expression replace the eyes? the mouth? If it
   hides the mouth, it must also turn on `.cv-nose` — add a pair to `kf-cv-nose-on`.
5. **Write the gate keyframe** `kf-cv-wN` with the four-stop envelope, and add the class to
   the shared overlay rule so it inherits `opacity: 0` and the master clock.
6. **Add secondary motion** if it needs life — `transform` only, with `transform-box` and
   `transform-origin` set explicitly.
7. **Validate at the extremes** (§12.3), then run the full harness sweep.

### Add a new season

1. Add colors to the `svg` custom-property block and matching `.cv-c-*` classes.
2. Add the particle shape to `<defs>`, **centered on (0,0)**, plus a smaller variant if you
   want depth.
3. Emit 6–8 particles using the three-level nesting, each with a distinct duration and a
   distinct **negative** delay.
4. Give the season a motion signature distinct from the others.
5. Add `kf-cv-season-N`, and update the neighbouring seasons' gates so the crossfades still
   hand off cleanly — **including at the loop seam**.
6. Append the group as the **last** child of `<svg>`.

### Retime the whole piece

1. Change `animation-duration` on the shared overlay rule and on the two base-node rules.
2. Rewrite the gate keyframes. If you kept 1 s = 1 %, these are just the new second values.
3. **Scale the secondary motions too** — the master clock alone will not calm the piece.
   Falls, spins, heartbeats and bobs all need stretching, typically by a similar factor.
4. Re-run the full harness sweep, the seam check, and the blink-survival check.

> When this piece went 40 s → 100 s, the eight window keyframes, six gate keyframes, four
> season gates, fifteen secondary-motion durations and twenty particle timings all moved.
> The programmatic sweep caught every one in a single pass. Do not retime by eye.

---

## 14. Pacing

The first build ran at 40 s — four 10 s seasons, 3.5 s per expression. It read as *busy*.
The loop was short enough that a visitor saw the repeat, and the particles moved fast enough
to feel like noise rather than atmosphere.

The current build runs at **100 s: 25 s per season, 8.5 s per expression**, with particles
taking 10–21 s to cross the frame. Guidelines that came out of that change:

- **An expression needs 6–10 s** to be noticed, read and enjoyed. Under ~4 s it registers as
  a flicker.
- **Neutral gaps of 2.5–3 s** between expressions let the mark reassert its identity. Do not
  cut these to fit more content.
- **A full cycle of 1.5–2 minutes** is long enough that a casual visitor will not see it
  repeat.
- **Particles should cross the frame in 10–20 s.** Faster reads as rain.
- **Secondary motion in the 1.5–5 s range** feels alive; under ~1 s feels jittery.
- **Stagger everything.** Identical durations across sibling elements is the single clearest
  tell that something is machine-generated.

---

## 15. Naming conventions

| Kind | Pattern | Example |
|---|---|---|
| Effect class | `cv-<effect>` | `cv-eyes-heart`, `cv-mouth-w` |
| Keyframes | `kf-cv-<effect>` | `kf-cv-heartbeat` |
| Window gate | `kf-cv-w<N>` | `kf-cv-w4` |
| Season gate | `kf-cv-season-<N>` | `kf-cv-season-3` |
| Color class | `cv-c-<name>` | `cv-c-petal`, `cv-c-snow2` |
| Custom property | `--cv-<name>` | `--cv-leaf-2`, `--cv-sweat` |
| Timing class | `cv-p<N>` fall, `cv-q<N>` slow fall, `cv-r<N>` rotation, `cv-k<N>` rise, `cv-t<N>` twinkle | `.cv-p2{animation-duration:12.6s;animation-delay:-5.4s}` |
| Animated file | `chan-monkey-<behavior>.svg` in `assets/anime/` | `chan-monkey-live.svg` |
| Background variant of one | `chan-monkey-<behavior>-on-<bg>.svg` | `chan-monkey-live-on-white.svg` |

Background variants borrow the `-on-<bg>` token from the static grid
(`chan-meng-monkey-black-on-white.svg`) and drop its ink token, which the animated files
have never carried — they are all one ink. They are derived, not authored: generated from
the behavior file by `src/build-on-white.js`, never hand-edited.

The `cv-` prefix comes from the vectorizing toolchain that produced the original blink and
is kept for continuity.

### Current inventory

| # | Season | Expression | Window | Base eyes | Base mouth |
|---|---|---|---|---|---|
| W1 | Spring | 😊 arc eyes, open smile, blush | 2.5–11 s | off | off |
| W2 | Spring | 🥰 heart eyes, blush, 🎵 | 14–22.5 s | off | on |
| W3 | Summer | 😎 sunglasses, smirk | 27.5–36 s | off | off |
| W4 | Summer | 😅 blue sweat drop, gasp mouth | 39–47.5 s | on | off |
| W5 | Autumn | 🤔 raised brow, w-mouth, 💡 | 52.5–61 s | on | off |
| W6 | Autumn | 😮 wide eyes, O mouth | 64–72.5 s | off | off |
| W7 | Winter | 🧣 earmuffs, scarf, cozy squint | 77.5–86 s | off | on |
| W8 | Winter | 😴 line eyes, 💤 | 89–97.5 s | off | off |

Winter props span both winter windows (76–98.5 s). Seasons occupy 0–25 / 25–50 / 50–75 /
75–100 s with 1 s crossfades.

---

## See also

- [`product-cards.md`](product-cards.md) — the other long-form guide: a product at
  work in one SVG.
- [`embedding-animated-svg.md`](embedding-animated-svg.md) — what `<img>` allows.
- [`logo-math.md`](https://github.com/ChanMeng666/chan-meng-logo/blob/main/docs/logo-math.md) in chan-meng-logo — how that mark's
  Bézier geometry is derived.
- [`chan-monkey-live.svg`](https://github.com/ChanMeng666/chan-meng-logo/blob/main/assets/anime/chan-monkey-live.svg) — the reference
  implementation; its header comment restates the invariants.
- [`chan-monkey-blink.svg`](https://github.com/ChanMeng666/chan-meng-logo/blob/main/assets/anime/chan-monkey-blink.svg) — the minimal
  case: one element, one keyframe, same contract.

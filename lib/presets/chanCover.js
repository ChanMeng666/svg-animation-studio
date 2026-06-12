// chan-cover — Chan Meng's animated GitHub profile README hero (1280×640).
//
// Brand: Caldera (data/brand.yaml v2.1.1 in the ChanMeng666 repo). Basalt
// canvas, ink text, ash card, brand pixel-square accents (orange/violet/glare).
// Display = Anton, body = DM Sans — both baked to OUTLINES (chanCoverText.js)
// so the cover renders identically as an <img> on GitHub (no external font
// fetch). Logo = the monkey+CHAN lockup (chanCoverLogo.js).
//
// Motion: the copy reveals once (staggered), then everything LOOPS forever —
// a glare gleam sweeps across "Chan Meng", brand pixel-squares drift in the
// margins, the monkey floats + sways + blinks, and the orange rule shimmers.
// prefers-reduced-motion → the finished still frame (every base state is final).
//
// Build:  node scripts/gen-cover-text.mjs   (only if text/logo changed)
//         node lib/render-cli.js chan-cover --out=<repo>/public/github-cover.svg
//         npx svgo -i <...>/github-cover.svg -o <...>/github-cover.svg
//                  (picks up the animation-safe svgo.config.mjs automatically)

const motion = require('../primitives/motion');
const { composeSVG } = require('../composer');
const text = require('./chanCoverText');
const logo = require('./chanCoverLogo');

// Caldera tokens
const BASALT = '#E2E2DF';
const ASH = '#F7F6F2';
const INK = '#070607';
const ORANGE = '#FC5000';
const VIOLET = '#524AE9';
const GLARE = '#F5F28E';
const MUTED = '#5B5B59';

// Drifting brand pixel-squares in the negative space (clear of text + card).
const SQUARES = [
  { x: 300, y: 96, s: 13, fill: GLARE, d: '3.6s', a: 7, r: 8, delay: '0s' },
  { x: 980, y: 92, s: 10, fill: ORANGE, d: '4.2s', a: 9, r: -6, delay: '0.5s' },
  { x: 170, y: 545, s: 14, fill: VIOLET, d: '4.6s', a: 8, r: 6, delay: '0.2s' },
  { x: 705, y: 560, s: 10, fill: GLARE, d: '3.9s', a: 10, r: -8, delay: '0.8s' },
  { x: 1085, y: 548, s: 12, fill: ORANGE, d: '4.3s', a: 7, r: 7, delay: '0.3s' },
  { x: 832, y: 250, s: 11, fill: VIOLET, d: '3.7s', a: 9, r: -7, delay: '0.6s' },
  { x: 1232, y: 360, s: 9, fill: GLARE, d: '4.1s', a: 8, r: 8, delay: '0.1s' },
];

module.exports = {
  name: 'chan-cover',
  category: 'cover',
  viewBox: '0 0 1280 640',
  width: 1280,
  height: 640,
  compose(opts = {}) {
    motion.resetIdCounter();

    // One-shot staggered reveal of the copy.
    const nameReveal = motion.createRevealUp({ delay: '0s', distance: 14 });
    const ruleReveal = motion.createRevealUp({ delay: '0.12s' });
    const tagReveal = motion.createRevealUp({ delay: '0.24s' });
    const posReveal = motion.createRevealUp({ delay: '0.36s' });
    // Forever loops.
    const shimmer = motion.createShimmer({ duration: '7s', minOpacity: 0.72 });
    const gleam = motion.createSweep({ duration: '5.5s', distance: 1040, holdPct: 58, delay: '1.2s' });
    const floatLogo = motion.createDrift({ duration: '4s', amplitude: 7, rotate: 1.5 });
    const blink = motion.createBlink({ duration: '6s' });
    const squareAnims = SQUARES.map((sq) =>
      motion.createDrift({ duration: sq.d, amplitude: sq.a, rotate: sq.r, delay: sq.delay }));

    // composeSVG appends the prefers-reduced-motion fallback automatically. Every
    // base state here is the final/visible one (the gleam rect sits off-screen-
    // left), so the reduced-motion frame reads as finished, not frozen.
    const style = [
      nameReveal.css, ruleReveal.css, tagReveal.css, posReveal.css,
      shimmer.css, gleam.css, floatLogo.css, blink.css,
      ...squareAnims.map((a) => a.css),
    ].join('\n');

    const defs = `<pattern id="cv-dotgrid" width="26" height="26" patternUnits="userSpaceOnUse">
  <circle cx="2" cy="2" r="1.6" fill="${INK}" fill-opacity="0.06"/>
</pattern>
<linearGradient id="cv-gleam" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
  <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.5"/>
  <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
</linearGradient>
<clipPath id="cv-nameclip"><path d="${text.name.d}" transform="translate(96,285)"/></clipPath>`;

    const squares = SQUARES.map((sq, i) =>
      `<rect class="${squareAnims[i].className}" x="${sq.x}" y="${sq.y}" width="${sq.s}" height="${sq.s}" fill="${sq.fill}"/>`
    ).join('\n  ');

    // Logo: full lockup (0 0 276 356) scaled to ~290px tall, centred in the ash
    // card. The static positioning transform is on an OUTER <g> so the float/blink
    // CSS transforms don't clobber it.
    const logoScale = 0.8146; // 290 / 356
    const logoX = 919.6;
    const logoY = 175;
    const eyes = logo.eyes
      .map((e) => `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${INK}"/>`)
      .join('\n        ');

    const body = `<rect width="1280" height="640" fill="${BASALT}"/>
  <rect width="1280" height="640" fill="url(#cv-dotgrid)"/>

  <!-- Drifting brand pixel-squares in the margins -->
  ${squares}

  <!-- Left column: name (with looping gleam) · orange rule · tagline · positioning -->
  <g transform="translate(96,285)"><g class="${nameReveal.className}"><path d="${text.name.d}" fill="${INK}"/></g></g>
  <g clip-path="url(#cv-nameclip)"><g class="${gleam.className}"><rect x="-170" y="150" width="64" height="210" fill="url(#cv-gleam)" transform="rotate(16 -138 255)"/></g></g>
  <g class="${ruleReveal.className}"><rect class="${shimmer.className}" x="100" y="305" width="230" height="12" rx="2" fill="${ORANGE}"/></g>
  <g transform="translate(100,384)"><g class="${tagReveal.className}"><path d="${text.tagline.d}" fill="${INK}"/></g></g>
  <g transform="translate(100,440)"><g class="${posReveal.className}"><path d="${text.positioning.d}" fill="${MUTED}"/></g></g>

  <!-- Right column: ash card + floating monkey/CHAN lockup (sway + blink) -->
  <rect x="872" y="150" width="320" height="340" rx="40" fill="${ASH}" stroke="${INK}" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
  <g transform="translate(${logoX},${logoY}) scale(${logoScale})">
    <g class="${floatLogo.className}">
      <path d="${logo.head}" fill="${INK}" fill-rule="evenodd"/>
      <g class="${blink.className}">
        ${eyes}
      </g>
      <path d="${logo.mouth}" fill="${INK}"/>
      <path d="${logo.wordmark}" fill="${INK}" fill-rule="evenodd"/>
    </g>
  </g>`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Chan Meng — AI Agent Architect · Full-stack Engineer · AI-Tooling Expert',
      desc: 'Animated brand cover: « Subtraction for life, addition for thought. » '
        + 'The monkey + CHAN wordmark logo on a basalt canvas with a single orange accent.',
      style, defs, body,
    });
  },
};

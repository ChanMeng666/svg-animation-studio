// chan-monkey — Chan Meng's blinking monkey-head avatar.
//
// Just the monkey head lifted out of the `chan-cover` lockup (drops the CHAN
// wordmark): a bare ink mark on a TRANSPARENT background — no card, no border,
// no float — that simply blinks every few seconds. Self-contained CSS
// @keyframes → animates as an <img> on GitHub. prefers-reduced-motion → eyes open.
//
// Build:  node lib/render-cli.js chan-monkey --out=<repo>/public/brands/chan-monkey-blink.svg
//         npx svgo -i <...>/chan-monkey-blink.svg -o <...>/chan-monkey-blink.svg

const motion = require('../primitives/motion');
const { composeSVG } = require('../composer');
const logo = require('./chanCoverLogo');

const INK = '#070607';

module.exports = {
  name: 'chan-monkey',
  category: 'logo',
  // The head occupies the top 0 0 276 263 region of the 276×356 lockup, so this
  // viewBox crops to the head — paths render at their native coordinates.
  viewBox: '0 0 276 263',
  width: 276,
  height: 263,
  compose(opts = {}) {
    motion.resetIdCounter();

    const blink = motion.createBlink({ duration: '5s' });

    const eyes = logo.eyes
      .map((e) => `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${INK}"/>`)
      .join('\n    ');

    const body = `<path d="${logo.head}" fill="${INK}" fill-rule="evenodd"/>
  <g class="${blink.className}">
    ${eyes}
  </g>
  <path d="${logo.mouth}" fill="${INK}"/>`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Chan Meng — blinking monkey avatar',
      desc: "Chan Meng's monkey logo mark, blinking occasionally.",
      style: blink.css, body,
    });
  },
};

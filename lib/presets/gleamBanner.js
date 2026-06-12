// gleam-banner — a compact banner (360×120): three bold bars with a soft gleam
// sweeping across them on a loop. Demonstrates decor.createTextGleamClip (the
// gleam is clipped to the bars' path) and shapes.createPanel (the background).
//
// The gleam holds off-screen-left, then sweeps across the bars and loops — a
// periodic shine. Self-contained CSS @keyframes; the gleam's base state is its
// off-screen rest position → prefers-reduced-motion shows the plain bars.

const decor = require('../primitives/decor');
const shapes = require('../primitives/shapes');
const motion = require('../primitives/motion');
const { composeSVG } = require('../composer');
const { getPalette } = require('../palettes');

// Three bold bars as one path (each 50 wide × 60 tall).
const BARS_D = 'M40 30 h50 v60 h-50 Z M155 30 h50 v60 h-50 Z M270 30 h50 v60 h-50 Z';

module.exports = {
  name: 'gleam-banner',
  category: 'banner',
  viewBox: '0 0 360 120',
  width: 360,
  height: 120,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pal = getPalette(opts.palette || 'caldera');

    // Bars use a saturated accent (not ink) so the white sheen reads clearly when
    // embedded small as an <img>; a white gleam over near-black bars is invisible.
    const bg = shapes.createPanel({ x: 0, y: 0, w: 360, h: 120, rx: 0, fill: pal.bg });
    const bars = `<path d="${BARS_D}" fill="${pal.accents[1]}"/>`;

    const sweep = motion.createSweep({ duration: '4s', distance: 460, holdPct: 55, delay: '0.5s' });
    const gleam = decor.createTextGleamClip({
      id: 'gb', pathD: BARS_D, gleamColor: '#FFFFFF', gleamOpacity: 0.8,
      rectX: -90, rectY: -10, rectW: 84, rectH: 140, angle: 16,
      sweepClassName: sweep.className,
    });

    const body = `${bg}\n  ${bars}\n  ${gleam.body}`;

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Gleam banner',
      desc: 'Three bold bars with a soft white gleam sweeping across them on a loop.',
      style: sweep.css, defs: gleam.defs, body,
    });
  },
};

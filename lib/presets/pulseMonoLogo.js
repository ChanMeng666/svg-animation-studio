// pulse-mono-logo — a restrained monochrome logo mark (200×200) that breathes:
// a rounded-square outline and a filled inner square pulse at slightly different
// rates around a shared center, with a single sparkle shimmering in. Palette-driven
// (opts.palette, default 'mono'). All CSS @keyframes; reduced-motion → mark at rest.

const shapes = require('../primitives/shapes');
const motion = require('../primitives/motion');
const { composeScene, layer } = require('../scene');
const { composeSVG } = require('../composer');
const { getPalette } = require('../palettes');

module.exports = {
  name: 'pulse-mono-logo',
  category: 'logo',
  viewBox: '0 0 200 200',
  width: 200,
  height: 200,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pal = getPalette(opts.palette || 'mono');

    const outerPulse = motion.createPulse({ duration: '3.2s', minScale: 0.96, maxScale: 1.04 });
    const innerPulse = motion.createPulse({ duration: '2.4s', minScale: 0.86, maxScale: 1.1 });
    const sparkleShimmer = motion.createShimmer({ duration: '4s', minOpacity: 0.3 });

    const outer = shapes.createPanel({
      x: 46, y: 46, w: 108, h: 108, rx: 26, fill: 'none',
      stroke: pal.ink, strokeWidth: 5, applyClass: outerPulse.className,
    });
    const inner = shapes.createBadgeShape({
      x: 78, y: 78, w: 44, h: 44, rx: 12, fill: pal.ink, applyClass: innerPulse.className,
    });
    const sparkle = shapes.createBurst({
      cx: 150, cy: 50, size: 10, fill: pal.muted, applyClass: sparkleShimmer.className,
    });

    const scene = composeScene({
      layers: [layer(outer), layer(inner), layer(sparkle)],
      style: [outerPulse.css, innerPulse.css, sparkleShimmer.css].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Monochrome pulsing logo mark',
      desc: 'A rounded-square outline and a filled inner square breathing at offset rates, with a shimmering sparkle.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

// bounce-char — the pixel character (existing createPixelCharacter) with a springy
// vertical bounce (createBob on the new `bouncyCubic` easing) while the body gently
// breathes (createPulse), ears bounce, and a soft ground shadow pulses in sync.
// Two animated transforms are kept on SEPARATE nested groups (bob translates the
// outer group; pulse scales the inner character) so neither clobbers the other.
// Palette-driven (opts.palette, default 'caldera'). Reduced-motion → still frame.

const shapes = require('../primitives/shapes');
const motion = require('../primitives/motion');
const { composeScene, layer } = require('../scene');
const { composeSVG } = require('../composer');
const { getPalette } = require('../palettes');

module.exports = {
  name: 'bounce-char',
  category: 'character',
  viewBox: '0 0 100 90',
  width: 140,
  height: 126,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pal = getPalette(opts.palette || 'caldera');
    const color = opts.color || pal.accents[0];
    const eyeColor = opts.eyeColor || pal.ink;

    const bob = motion.createBob({ duration: '0.7s', easing: 'bouncyCubic', amplitude: 12 });
    const bodyPulse = motion.createPulse({ duration: '2.5s', minScale: 0.98, maxScale: 1.03 });
    const earL = motion.createEarBounce();
    const earR = motion.createEarBounce({ delay: '0.1s' });
    const shadow = motion.createShadowPulse();

    const groundShadow = shapes.createGroundShadow({
      cx: 50, cy: 82, rx: 22, ry: 5, applyClass: shadow.className,
    });
    const character = shapes.createPixelCharacter({
      color, eyeColor,
      mouth: { x: 42, y: 50, w: 16, h: 3 },
      applyClasses: {
        body: bodyPulse.className,
        leftEar: earL.className,
        rightEar: earR.className,
      },
    });

    const scene = composeScene({
      layers: [
        layer(groundShadow),
        // bob (outer translate) wraps the character whose body scales (inner pulse).
        layer(character, { className: bob.className }),
      ],
      style: [bob.css, bodyPulse.css, earL.css, earR.css, shadow.css].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: 'Bouncing pixel character',
      desc: 'A pixel-art character springing up and down on a bouncy ease while it gently '
        + 'breathes, with bouncing ears and a soft ground shadow pulsing in sync.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

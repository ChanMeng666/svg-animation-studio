// repo-hero — a compact, CENTERED repo/project banner (1200×360). Distinct from
// hero-strip's left-aligned layout: an animated gradient wash (subtle, muted by a
// scrim), a centered mono title + one-line subtitle that reveal in, two accent
// dots orbiting at the title's flanks, a shimmering centered underline, and a
// pulsing sparkle. Palette-driven (opts.palette, default 'ocean').

const decor = require('../primitives/decor');
const shapes = require('../primitives/shapes');
const motion = require('../primitives/motion');
const { composeScene, layer } = require('../scene');
const { composeSVG, escapeXml } = require('../composer');
const { getPalette } = require('../palettes');

module.exports = {
  name: 'repo-hero',
  category: 'banner',
  viewBox: '0 0 1200 360',
  width: 1200,
  height: 360,
  compose(opts = {}) {
    motion.resetIdCounter();

    const pal = getPalette(opts.palette || 'ocean');
    const title = opts.title || 'project-name';
    const subtitle = opts.subtitle || 'A short one-line description of the project';

    const wash = decor.createGradientWash({
      id: 'rh-wash', width: 1200, height: 360, angle: 0, animate: { dur: '11s' },
      stops: [
        { offset: 0, color: pal.bg },
        { offset: 0.5, color: pal.bgAlt },
        { offset: 1, color: pal.bg },
      ],
    });
    const dots = decor.createDotGridBackground({
      id: 'rh-dots', width: 1200, height: 360, color: pal.ink, opacity: 0.05,
    });

    const titleReveal = motion.createRevealUp({ distance: 14 });
    const subReveal = motion.createRevealUp({ delay: '0.12s' });
    const ruleShimmer = motion.createShimmer();
    const orbitL = motion.createOrbit({ duration: '5s', radius: 14, direction: 'ccw' });
    const orbitR = motion.createOrbit({ duration: '5s', radius: 14 });
    const sparklePulse = motion.createPulse({ duration: '2s', minScale: 0.5, maxScale: 1 });

    const titleText = `<text x="600" y="168" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="72" font-weight="700" fill="${pal.ink}">${escapeXml(title)}</text>`;
    const subText = `<text x="600" y="214" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" fill="${pal.muted}">${escapeXml(subtitle)}</text>`;
    const rule = shapes.createPanel({ x: 520, y: 236, w: 160, h: 8, rx: 3, fill: pal.accents[0] });

    // Flanking orbit dots (each orbits around its own placed center).
    const dotL = `<circle cx="0" cy="0" r="8" fill="${pal.accents[1]}"/>`;
    const dotR = `<circle cx="0" cy="0" r="8" fill="${pal.accents[2]}"/>`;
    const sparkle = shapes.createBurst({ cx: 0, cy: 0, size: 9, fill: pal.accents[0], applyClass: sparklePulse.className });

    const scene = composeScene({
      layers: [
        layer(wash.body, { defs: wash.defs }),
        layer(dots.body, { defs: dots.defs }),
        layer(dotL, { transform: 'translate(300,150)', className: orbitL.className }),
        layer(dotR, { transform: 'translate(900,150)', className: orbitR.className }),
        layer(sparkle, { transform: 'translate(940,96)' }),
        layer(titleText, { className: titleReveal.className }),
        layer(subText, { className: subReveal.className }),
        layer(rule, { className: ruleShimmer.className }),
      ],
      style: [
        titleReveal.css, subReveal.css, ruleShimmer.css, orbitL.css, orbitR.css, sparklePulse.css,
      ].join('\n'),
    });

    return composeSVG({
      viewBox: this.viewBox, width: this.width, height: this.height,
      title: `${title} — repo banner`,
      desc: 'A centered project banner on a slow animated gradient wash, with the title '
        + 'and one-line description revealing in, two accent dots orbiting at the flanks, '
        + 'a shimmering underline, and a pulsing sparkle.',
      style: scene.style, defs: scene.defs, body: scene.body,
    });
  },
};

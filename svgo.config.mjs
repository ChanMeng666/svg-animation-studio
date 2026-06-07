// Canonical SVGO config for this repo — ANIMATION-SAFE.
//
// Picked up automatically by `npx svgo` and `npm run optimize`. The reason it
// exists: SVGO's stock preset-default is built for STATIC icons and will quietly
// break animated SVGs —
//   • collapseGroups / moveGroup/ElemsAttrs flatten the group nesting that
//     carries animation transforms, and relocate `transform-box: fill-box`
//     origins (e.g. a blink's eyes detach to the corner);
//   • inlineStyles / minifyStyles push <style> rules onto elements and can
//     drop or rename @keyframes;
//   • convertShapeToPath turns <circle>/<rect> animation targets into <path>;
//   • convertTransform rewrites the static positioning transforms.
//
// This config keeps the animation geometry + <style> intact while still
// compressing path/number data (~35–40% on a typical animated preset).
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          inlineStyles: false,
          minifyStyles: false,
          cleanupIds: false,          // keep gradient/clip/pattern ids stable
          removeViewBox: false,       // keep responsive scaling
          convertShapeToPath: false,  // keep <circle>/<rect> animation targets
          collapseGroups: false,      // group nesting carries the animation transforms
          moveGroupAttrsToElems: false,
          moveElemsAttrsToGroup: false,
          mergePaths: false,
          convertTransform: false,    // keep static translate/scale on animated groups
          removeHiddenElems: false,
          // removeTitle / removeDesc are NOT in preset-default — accessibility stays.
        },
      },
    },
  ],
};

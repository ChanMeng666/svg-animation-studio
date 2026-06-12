// Scene / layer composer — an orchestration helper (sibling to composer.js),
// NOT a primitive. It sits BELOW composeSVG: a preset builds an ordered list of
// layers, composeScene assembles the `body` string (and collects any per-layer
// `defs`), then the preset still calls composeSVG to wrap the final document.
//
// The job it does for you: the static-vs-animated transform split (Gotcha 2 in
// docs/embedding-animated-svg.md). When a layer has BOTH a static `transform`
// (positioning) AND an animated `className` (a CSS transform), a single element
// can't carry both — the animation clobbers the position. composeScene emits the
// two-level nested <g> automatically: outer carries the static presentation,
// inner carries only the animated class.
//
//   layer order = back-to-front (first layer drawn first / underneath).

const { indent } = require('./composer');

/** Build a layer descriptor. `content` is an SVG markup string; opts add wrappers. */
function layer(content, opts = {}) {
  return { content, ...opts };
}

function _group(attrs, content) {
  if (content.includes('\n')) {
    return `<g ${attrs}>\n${indent(content, 2)}\n</g>`;
  }
  return `<g ${attrs}>${content}</g>`;
}

function renderLayer(l) {
  if (!l) return '';
  if (typeof l === 'string') return l;

  const content = l.content;
  if (content == null || content === '') return '';

  const { transform, className, clip, filter, opacity } = l;

  // Static presentation attributes (everything that is NOT an animated transform).
  const staticParts = [];
  if (transform) staticParts.push(`transform="${transform}"`);
  if (clip) staticParts.push(`clip-path="${clip}"`);
  if (filter) staticParts.push(`filter="${filter}"`);
  if (opacity != null) staticParts.push(`opacity="${opacity}"`);
  const hasStatic = staticParts.length > 0;
  const staticAttrs = staticParts.join(' ');

  // Animated className lives on its OWN <g> with no transform attribute, so the
  // CSS transform animation can't overwrite the static positioning transform.
  if (className && hasStatic) {
    return _group(staticAttrs, _group(`class="${className}"`, content));
  }
  if (className) {
    return _group(`class="${className}"`, content);
  }
  if (hasStatic) {
    return _group(staticAttrs, content);
  }
  return content;
}

/**
 * Assemble layers into a `body` string and collect per-layer `defs`.
 * @returns {{ body: string, defs: string, style: string }} ready to spread into composeSVG.
 */
function composeScene({ layers = [], defs = '', style = '' } = {}) {
  const collectedDefs = [];
  if (defs && defs.trim()) collectedDefs.push(defs.trim());
  const parts = [];
  for (const l of layers) {
    if (l && typeof l === 'object' && l.defs && l.defs.trim()) collectedDefs.push(l.defs.trim());
    const rendered = renderLayer(l);
    if (rendered) parts.push(rendered);
  }
  return {
    body: parts.join('\n  '),
    defs: collectedDefs.join('\n'),
    style,
  };
}

module.exports = { composeScene, layer, renderLayer };

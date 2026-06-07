function escapeXml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function composeSVG({
  viewBox,
  width,
  height,
  style = '',
  defs = '',
  body = '',
  title = '',
  desc = '',
  reducedMotion = true
}) {
  const widthAttr = width != null ? ` width="${width}"` : '';
  const heightAttr = height != null ? ` height="${height}"` : '';
  // Accessibility default: when the SVG animates, fall back to the static frame
  // for users who prefer reduced motion. For this to read as "finished" rather
  // than "frozen mid-motion", presets should author each animated element's BASE
  // state as its final/visible state (animate FROM the hidden/offset state).
  let styleText = style.trim();
  if (reducedMotion && styleText) {
    styleText += '\n@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; }\n}';
  }
  const styleBlock = styleText ? `  <style>\n${indent(styleText, 4)}\n  </style>\n` : '';
  const defsBlock = defs.trim() ? `  <defs>\n${indent(defs.trim(), 4)}\n  </defs>\n` : '';
  const titleBlock = title ? `  <title>${escapeXml(title)}</title>\n` : '';
  const descBlock = desc ? `  <desc>${escapeXml(desc)}</desc>\n` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${widthAttr}${heightAttr}>
${titleBlock}${descBlock}${styleBlock}${defsBlock}${body.trim()}
</svg>
`;
}

function indent(text, spaces) {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(l => l.length ? pad + l : l).join('\n');
}

module.exports = { composeSVG, escapeXml, indent };

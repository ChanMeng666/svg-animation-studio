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
  desc = ''
}) {
  const widthAttr = width != null ? ` width="${width}"` : '';
  const heightAttr = height != null ? ` height="${height}"` : '';
  const styleBlock = style.trim() ? `  <style>\n${indent(style.trim(), 4)}\n  </style>\n` : '';
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

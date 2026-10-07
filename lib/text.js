// Shared-glyph text — an orchestration module (sibling to scene.js), NOT a
// primitive. No font loads inside <img>, so text must be outlines. Outlining a
// whole string as one path reuses nothing; a glyph set stores each glyph ONCE
// (font units, y up) and places it with <use x="advance">. Thousands of
// characters cost a few dozen paths per font. See docs/product-cards.md.

const fs = require('fs');
const opentype = require('opentype.js');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const num = (v, d = 2) => Number(v.toFixed(d)).toString();

/**
 * Build a glyph set over named font files.
 * @param {Record<string,string>} fonts  key → path to a STATIC .ttf/.otf instance
 * @param {{ prefix?: string }} [opts]   id prefix, when two sets share one SVG
 */
function createGlyphSet(fonts, opts = {}) {
  const prefix = opts.prefix || 'g';
  const keys = Object.keys(fonts);
  const loaded = {};
  for (const key of keys) {
    const buf = fs.readFileSync(fonts[key]);
    loaded[key] = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  const used = new Map();

  function font(key) {
    const f = loaded[key];
    if (!f) throw new Error(`text: unknown font "${key}" (known: ${keys.join(', ')})`);
    return f;
  }

  function glyphId(key, glyph) {
    // short ids: every <use> repeats one
    const id = `${prefix}${keys.indexOf(key).toString(36)}${glyph.index.toString(36).padStart(3, '0')}`;
    if (!used.has(id)) {
      const r = Math.round;
      let d = '';
      for (const c of glyph.path.commands) {
        if (c.type === 'M') d += `M${r(c.x)} ${r(c.y)}`;
        else if (c.type === 'L') d += `L${r(c.x)} ${r(c.y)}`;
        else if (c.type === 'Q') d += `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`;
        else if (c.type === 'C') d += `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}`;
        else if (c.type === 'Z') d += 'Z';
      }
      used.set(id, d);
    }
    return id;
  }

  // Lay a string out in font units. A character the font lacks is taken from
  // `fallback`, which must share the font's units-per-em.
  function layout(str, key, tracking, fallback) {
    const f = font(key);
    const glyphs = f.stringToGlyphs(str);
    const items = [];
    let x = 0;
    glyphs.forEach((g, i) => {
      let from = key;
      if (g.index === 0 && str[i] !== ' ') {
        const alt = fallback && font(fallback);
        if (!alt || alt.unitsPerEm !== f.unitsPerEm || alt.charToGlyph(str[i]).index === 0) {
          throw new Error(`text: font "${key}" has no glyph for "${str[i]}"`);
        }
        g = alt.charToGlyph(str[i]);
        glyphs[i] = g;
        from = fallback;
      }
      if (g.path.commands.length) items.push({ g, x, from });
      x += g.advanceWidth + tracking * f.unitsPerEm;
      if (glyphs[i + 1] && from === key) x += f.getKerningValue(g, glyphs[i + 1]);
    });
    return { items, width: x - (glyphs.length ? tracking * f.unitsPerEm : 0), upm: f.unitsPerEm };
  }

  /** Width in px of `str` set in `font` at `size`. `tracking` is in em. */
  function measure(str, { font: key, size, tracking = 0, fallback }) {
    const { width, upm } = layout(str, key, tracking, fallback);
    return (width * size) / upm;
  }

  /** One run with its baseline at (x, y). `anchor`: start | middle | end. */
  function text(str, { font: key, size, x = 0, y = 0, fill, anchor = 'start', tracking = 0, fallback, attrs = '' }) {
    const { items, width, upm } = layout(str, key, tracking, fallback);
    const k = size / upm;
    const w = width * k;
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    const uses = items.map(({ g, x: gx, from }) => `<use href="#${glyphId(from, g)}"${gx ? ` x="${Math.round(gx)}"` : ''}/>`).join('');
    return `<g${fill ? ` fill="${esc(fill)}"` : ''}${attrs ? ` ${attrs}` : ''} transform="translate(${num(x0)} ${num(y)}) scale(${num(k, 5)} ${num(-k, 5)})">${uses}</g>`;
  }

  /** Greedy word wrap against measured widths. */
  function wrap(str, style, maxWidth) {
    const lines = [];
    let line = '';
    for (const word of str.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(next, style) > maxWidth) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

  /**
   * Replace the <text> elements of a foreign SVG fragment (a chart, a compiler's
   * drawing) with outlined runs. Honours x, y, font-size, fill, text-anchor,
   * font-weight, dominant-baseline="central" and transform.
   */
  function outlineTextElements(svg, { regular, bold = regular, fallback }) {
    return svg.replace(/<text\b([^>]*)>([^<]*)<\/text>/g, (_, raw, content) => {
      const a = Object.fromEntries([...raw.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
      const size = Number(a['font-size']);
      const key = Number(a['font-weight'] || 400) >= 600 ? bold : regular;
      const f = font(key);
      const cap = f.tables.os2 && f.tables.os2.sCapHeight ? f.tables.os2.sCapHeight : f.ascender * 0.7;
      const dy = a['dominant-baseline'] === 'central' ? ((cap / f.unitsPerEm) * size) / 2 : 0;
      const str = content.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      const run = text(str, { font: key, size, x: Number(a.x || 0), y: Number(a.y || 0) + dy, fill: a.fill, anchor: a['text-anchor'] || 'start', fallback });
      return a.transform ? `<g transform="${a.transform}">${run}</g>` : run;
    });
  }

  /** The <defs> payload. Call after every text() has run. */
  function defs() {
    return [...used].sort(([a], [b]) => (a < b ? -1 : 1)).map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('\n');
  }

  return { font, measure, text, wrap, outlineTextElements, defs, glyphCount: () => used.size };
}

module.exports = { createGlyphSet };

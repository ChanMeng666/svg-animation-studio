import { useEffect, useState } from 'react';

// Display order for category sections (anything unlisted falls to the end).
const CATEGORY_ORDER = ['cover', 'banner', 'logo', 'badge', 'loader', 'background', 'character', 'misc'];
const CATEGORY_LABEL = {
  cover: 'Covers', banner: 'Banners', logo: 'Logos', badge: 'Badges',
  loader: 'Loaders', background: 'Backgrounds', character: 'Characters', misc: 'Misc',
};

function svgUrl(name, palette) {
  const base = `/api/svg?preset=${encodeURIComponent(name)}`;
  if (!palette) return base;
  return `${base}&opts=${encodeURIComponent(JSON.stringify({ palette }))}`;
}

function Card({ preset, palette, dark }) {
  const [copied, setCopied] = useState(false);
  const snippet = `![${preset.name}](${preset.name}.svg)`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* clipboard blocked — ignore */ }
  };

  return (
    <div style={{
      background: dark ? '#1b1b1f' : '#ffffff',
      border: `1px solid ${dark ? '#33333a' : '#e5e5e5'}`,
      borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: dark ? '#eee' : '#111' }}>{preset.name}</span>
        <button onClick={copy} title="Copy README embed snippet" style={{
          fontSize: 11, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
          border: `1px solid ${dark ? '#44444c' : '#ddd'}`,
          background: copied ? '#2e7d32' : (dark ? '#26262c' : '#f3f3f3'),
          color: copied ? '#fff' : (dark ? '#ccc' : '#333'),
        }}>{copied ? 'Copied!' : 'Copy embed'}</button>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: dark ? '#0e0e12' : '#f4f4f5', borderRadius: 6, padding: 8, minHeight: 80,
      }}>
        <img src={svgUrl(preset.name, palette)} alt={preset.name} style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [presets, setPresets] = useState([]);
  const [palettes, setPalettes] = useState([]);
  const [palette, setPalette] = useState('');     // '' = each preset's own default
  const [dark, setDark] = useState(false);

  useEffect(() => {
    fetch('/api/presets').then(r => r.json()).then(d => setPresets(d.presets || [])).catch(() => {});
    fetch('/api/palettes').then(r => r.json()).then(d => setPalettes(d.palettes || [])).catch(() => {});
  }, []);

  // Group by category, in display order.
  const byCategory = {};
  for (const p of presets) (byCategory[p.category] ||= []).push(p);
  const cats = Object.keys(byCategory).sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, background: '#f7f7f8', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 16, justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: '0 0 4px' }}>SVG Animation Studio</h1>
          <p style={{ color: '#666', margin: 0, fontSize: 14 }}>
            {presets.length} presets · grouped by type. Previews render inline (more permissive
            than GitHub <code>&lt;img&gt;</code> mode — always <code>/svg-verify</code> before shipping).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, color: '#444' }}>
            Palette:{' '}
            <select value={palette} onChange={e => setPalette(e.target.value)} style={{ fontSize: 13, padding: '3px 6px' }}>
              <option value="">(preset default)</option>
              {palettes.map(p => <option key={p.name} value={p.name}>{p.label}</option>)}
            </select>
          </label>
          <button onClick={() => setDark(d => !d)} style={{
            fontSize: 13, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
            border: '1px solid #ccc', background: dark ? '#1b1b1f' : '#fff', color: dark ? '#eee' : '#333',
          }}>{dark ? '◐ Dark preview' : '◑ Light preview'}</button>
        </div>
      </div>

      {presets.length === 0 && <em style={{ color: '#999' }}>Loading presets…</em>}

      {cats.map(cat => (
        <section key={cat} style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 15, color: '#333', borderBottom: '1px solid #e2e2e2', paddingBottom: 6 }}>
            {CATEGORY_LABEL[cat] || cat} <span style={{ color: '#aaa', fontWeight: 400 }}>({byCategory[cat].length})</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 12 }}>
            {byCategory[cat].map(p => <Card key={p.name} preset={p} palette={palette} dark={dark} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';

export default function Home() {
  const [names, setNames] = useState([]);

  useEffect(() => {
    fetch('/api/presets')
      .then(r => r.json())
      .then(d => setNames(d.presets || []))
      .catch(() => setNames([]));
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      padding: '24px',
      background: '#f7f7f8',
      minHeight: '100vh'
    }}>
      <h1 style={{ margin: '0 0 8px' }}>SVG Animation Studio</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Preview grid. Each card calls <code>/api/svg?preset=&lt;name&gt;</code>.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginTop: '20px'
      }}>
        {names.length === 0 && <em style={{color:'#999'}}>Loading presets…</em>}
        {names.map(name => (
          <div key={name} style={{
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ fontFamily:'monospace', fontSize:'14px', marginBottom:'8px' }}>{name}</div>
            <img
              src={`/api/svg?preset=${name}`}
              alt={name}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

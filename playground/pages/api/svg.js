const presets = require('../../../lib/presets');

export default function handler(req, res) {
  const { preset, opts } = req.query;
  const p = presets[preset];
  if (!p) {
    res.status(404).send('Unknown preset: ' + preset);
    return;
  }
  let parsed = {};
  if (opts) {
    try { parsed = JSON.parse(opts); }
    catch (e) { res.status(400).send('Invalid opts JSON: ' + e.message); return; }
  }
  try {
    const svg = p.compose(parsed);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(svg);
  } catch (e) {
    res.status(500).send('compose failed: ' + e.message);
  }
}

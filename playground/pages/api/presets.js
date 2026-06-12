const presets = require('../../../lib/presets');

export default function handler(req, res) {
  const list = Object.entries(presets).map(([name, p]) => ({
    name,
    category: p.category || 'misc',
    width: p.width,
    height: p.height,
    viewBox: p.viewBox,
  }));
  res.status(200).json({ presets: list });
}

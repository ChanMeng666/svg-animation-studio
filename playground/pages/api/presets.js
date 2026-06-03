const presets = require('../../../lib/presets');

export default function handler(req, res) {
  res.status(200).json({ presets: Object.keys(presets) });
}

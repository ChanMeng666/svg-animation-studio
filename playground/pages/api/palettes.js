const { listPalettes } = require('../../../lib/palettes');

export default function handler(req, res) {
  res.status(200).json({ palettes: listPalettes() });
}

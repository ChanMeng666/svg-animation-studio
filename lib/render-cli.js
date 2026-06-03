#!/usr/bin/env node
// Usage: node lib/render-cli.js <preset-name> [--out=path] [--opts='{"color":"#E07C4C"}']

const fs = require('fs');
const path = require('path');
const presets = require('./presets');

const args = process.argv.slice(2);
const name = args[0];

if (!name || name === '--help' || name === '-h') {
  console.log('Usage: node lib/render-cli.js <preset-name> [--out=path] [--opts=json]');
  console.log('Available presets:');
  for (const k of Object.keys(presets)) console.log('  ' + k);
  process.exit(name ? 0 : 1);
}

const preset = presets[name];
if (!preset) {
  console.error(`Unknown preset: ${name}`);
  console.error('Available: ' + Object.keys(presets).join(', '));
  process.exit(1);
}

const outArg = args.find(a => a.startsWith('--out='));
const optsArg = args.find(a => a.startsWith('--opts='));
const out = outArg ? outArg.slice(6) : `output/${name}.svg`;
const opts = optsArg ? JSON.parse(optsArg.slice(7)) : {};

try {
  const svg = preset.compose(opts);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, svg);
  console.log(`OK wrote ${out} (${svg.length} bytes)`);
} catch (e) {
  console.error(`Failed to render ${name}: ${e.message}`);
  process.exit(1);
}

import { describe, it, expect } from 'vitest';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import presets from '../../lib/presets/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotDir = join(__dirname, '__snapshots__');
if (!existsSync(snapshotDir)) mkdirSync(snapshotDir, { recursive: true });

for (const name of Object.keys(presets)) {
  describe(`preset ${name}`, () => {
    it('compose() returns a non-empty SVG', () => {
      const output = presets[name].compose();
      expect(output).toMatch(/<svg/);
      expect(output).toMatch(/<\/svg>/);
      expect(output.length).toBeGreaterThan(100);
    });

    it('matches snapshot', async () => {
      const output = presets[name].compose();
      await expect(output).toMatchFileSnapshot(join(snapshotDir, `${name}.svg`));
    });
  });
}

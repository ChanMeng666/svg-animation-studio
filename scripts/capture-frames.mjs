#!/usr/bin/env node
// Verify an animated SVG the way a README shows it: through <img>, at chosen
// seconds, on a light and a dark canvas, and with motion turned off.
//
//   node scripts/capture-frames.mjs output/project-card.svg --at=2,5.5,10 [--out=output/frames] [--width=1300]
//
// Writes <name>-<canvas>-<seconds>s.png for each time and canvas, then checks
// the reduced-motion still: the SVG is loaded as a top-level DOCUMENT with
// reduced motion emulated, captured twice three seconds apart, and the two
// captures must be identical. (Emulation does not reach an SVG inside <img>,
// so that route would report a moving picture as compliant.)
//
// Needs playwright-core and a local Chrome:  npm i -D playwright-core
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const file = process.argv[2];
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
if (!file || !fs.existsSync(file)) {
  console.error("Usage: node scripts/capture-frames.mjs <file.svg> --at=1,3,5 [--out=dir] [--width=px]");
  process.exit(1);
}
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error("capture-frames needs playwright-core:  npm i -D playwright-core");
  process.exit(1);
}

const svg = fs.readFileSync(file, "utf8");
const [, , vbW, vbH] = (svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 800 400").split(/\s+/).map(Number);
const width = Number(arg("width", vbW));
const height = Math.round((width * vbH) / vbW);
const times = arg("at", "1,3,5").split(",").map(Number).sort((a, b) => a - b);
const outDir = arg("out", "output/frames");
const name = path.basename(file, ".svg");
fs.mkdirSync(outDir, { recursive: true });
const url = pathToFileURL(path.resolve(file)).href;

const browser = await chromium.launch({ channel: "chrome" });
let failed = false;
for (const [canvas, colour] of [["light", "#ffffff"], ["dark", "#0d1117"]]) {
  const host = path.join(outDir, `_${name}-${canvas}.html`);
  fs.writeFileSync(host, `<body style="margin:0;background:${colour}"><img id="i" src="${url}" style="width:${width}px;display:block"></body>`);
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(pathToFileURL(path.resolve(host)).href);
  const decoded = await page.evaluate(() => {
    const i = document.getElementById("i");
    return i.complete && i.naturalWidth > 0;
  });
  if (!decoded) {
    console.error(`✗ ${canvas}: the image did not decode`);
    failed = true;
  }
  let waited = 0;
  for (const t of times) {
    await page.waitForTimeout(t * 1000 - waited);
    waited = t * 1000;
    await page.screenshot({ path: path.join(outDir, `${name}-${canvas}-${t}s.png`) });
  }
  await page.close();
  fs.rmSync(host);
}

const still = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
await still.goto(url);
await still.waitForTimeout(500);
const a = await still.screenshot({ path: path.join(outDir, `${name}-reduced-motion.png`) });
await still.waitForTimeout(3000);
const b = await still.screenshot();
await browser.close();
if (Buffer.compare(a, b) !== 0) {
  console.error("✗ reduced motion: the picture is still moving");
  failed = true;
}

console.log(`${failed ? "✗" : "✓"} ${name}: ${times.length * 2} frames + reduced-motion still → ${outDir}`);
process.exit(failed ? 1 : 0);

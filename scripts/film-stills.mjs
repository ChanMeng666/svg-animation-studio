#!/usr/bin/env node
// Cut stills or a frame strip out of a video with ffmpeg and print them as JSON
// data URIs, ready for lib/media.js (filmStrip / crossfade).
//
//   node scripts/film-stills.mjs --in=film.mp4 --at=5.5,7.6 --crop=1070:910:776:84 --size=560x476
//   node scripts/film-stills.mjs --in=film.mp4 --from=12 --seconds=9 --fps=4 --crop=380:800:138:160 --size=150x316 --q=9
//
// --crop is ffmpeg's w:h:x:y in the film's own pixels. --q is JPEG quality,
// 2 (best) to 31; 6 suits an interface still, 9 a small frame strip.
// Needs ffmpeg on PATH. Budget: base64 adds a third to every byte.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const input = arg("in");
if (!input) {
  console.error("Usage: node scripts/film-stills.mjs --in=<video> (--at=t1,t2 | --from=t --seconds=n --fps=n) [--crop=w:h:x:y] [--size=WxH] [--q=6] [--out=frames.json]");
  process.exit(1);
}
const size = arg("size");
const crop = arg("crop");
const q = arg("q", "6");
const filters = [crop && `crop=${crop}`, size && `scale=${size.replace("x", ":")}`].filter(Boolean);
const dir = mkdtempSync(path.join(tmpdir(), "film-stills-"));
const uri = (file) => `data:image/jpeg;base64,${readFileSync(file).toString("base64")}`;

try {
  let frames;
  if (arg("at")) {
    frames = arg("at").split(",").map((t, i) => {
      const out = path.join(dir, `s${String(i).padStart(3, "0")}.jpg`);
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", t, "-i", input, "-frames:v", "1", ...(filters.length ? ["-vf", filters.join(",")] : []), "-q:v", q, out]);
      return uri(out);
    });
  } else {
    const vf = [`fps=${arg("fps", "4")}`, ...filters].join(",");
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", arg("from", "0"), "-t", arg("seconds", "5"), "-i", input, "-vf", vf, "-q:v", q, path.join(dir, "f%03d.jpg")]);
    frames = readdirSync(dir).sort().map((f) => uri(path.join(dir, f)));
  }
  const json = JSON.stringify(frames);
  const bytes = frames.reduce((n, f) => n + f.length, 0);
  if (arg("out")) writeFileSync(arg("out"), json);
  else process.stdout.write(json);
  console.error(`${frames.length} frame(s), ${(bytes / 1024).toFixed(0)} KB inlined`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

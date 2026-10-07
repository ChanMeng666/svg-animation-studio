import { describe, it, expect } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import textLib from '../../lib/text.js';
import timelineLib from '../../lib/timeline.js';
import mediaLib from '../../lib/media.js';

const fonts = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'fonts');
const set = () => textLib.createGlyphSet({ display: join(fonts, 'Anton-Regular.ttf'), mono: join(fonts, 'JetBrainsMono-Regular.ttf') });

describe('text — shared glyph outlines', () => {
  it('stores each glyph once however often it is used', () => {
    const g = set();
    g.text('aaaa', { font: 'mono', size: 10 });
    g.text('aaaa', { font: 'mono', size: 20, x: 50 });
    expect(g.glyphCount()).toBe(1);
    expect(g.defs().match(/<path /g)).toHaveLength(1);
  });

  it('places glyphs with <use> and never emits <text>', () => {
    const run = set().text('ab', { font: 'mono', size: 10, x: 4, y: 9, fill: '#111' });
    expect(run).toMatch(/^<g fill="#111" transform="translate\(4 9\) scale\(0\.01 -0\.01\)">/);
    expect(run.match(/<use /g)).toHaveLength(2);
    expect(run).not.toMatch(/<text/);
  });

  it('measures a monospace run as characters × advance', () => {
    const g = set();
    expect(g.measure('abcd', { font: 'mono', size: 10 })).toBeCloseTo(4 * g.measure('a', { font: 'mono', size: 10 }), 5);
  });

  it('anchors a run at its middle and its end', () => {
    const g = set();
    const w = g.measure('abcd', { font: 'mono', size: 10 });
    expect(g.text('abcd', { font: 'mono', size: 10, x: 100, anchor: 'end' })).toContain(`translate(${Number((100 - w).toFixed(2))} 0)`);
    expect(g.text('abcd', { font: 'mono', size: 10, x: 100, anchor: 'middle' })).toContain(`translate(${Number((100 - w / 2).toFixed(2))} 0)`);
  });

  it('refuses a character the font lacks', () => {
    expect(() => set().text('中', { font: 'display', size: 10 })).toThrow(/no glyph/);
  });

  it('rewrites foreign <text> elements into glyph runs', () => {
    const out = set().outlineTextElements('<text x="10" y="20" font-size="12" fill="#222" text-anchor="middle">ab</text>', { regular: 'mono' });
    expect(out).not.toMatch(/<text/);
    expect(out).toMatch(/<use /);
  });

  it('wraps on measured width', () => {
    const g = set();
    const style = { font: 'mono', size: 10 };
    expect(g.wrap('one two three four', style, g.measure('one two', style) + 1)).toEqual(['one two', 'three', 'four']);
  });
});

describe('timeline — one loop, finished frame as the base state', () => {
  const tl = () => timelineLib.createTimeline({ duration: 10 });

  it('turns seconds into percentages of the loop', () => {
    expect(tl().pct(2.5)).toBe('25.000%');
    expect(tl().pct(99)).toBe('100.000%');
  });

  it('on(): hidden until t, and visible when animations are off', () => {
    const t = tl();
    const a = t.on(3);
    expect(a.attrs).toBe(`class="${a.className}"`);
    expect(t.css()).toContain('0%,30.000%{opacity:0}33.000%,100%{opacity:1}');
  });

  it('span() and until(): absent from the still frame', () => {
    const t = tl();
    expect(t.span(2, 5).attrs).toMatch(/opacity="0"$/);
    expect(t.until(4).attrs).toMatch(/opacity="0"$/);
    expect(t.css()).toContain('0%,40.000%{opacity:1}');
  });

  it('shift(): a negative delay that never waits', () => {
    expect(tl().shift(4)).toBe('animation-delay:-6.00s');
    expect(tl().shift(0)).toBe('animation-delay:-10.00s');
  });

  it('cover(): steps once per character and rests uncovered', () => {
    const t = tl();
    const cls = t.cover({ start: 1, chars: 20, width: 200, cps: 20 });
    expect(t.css()).toContain('steps(20,end)');
    expect(t.css()).toContain(`.${cls}{transform:translateX(200px);`);
  });

  it('sequence(): scene starts, and a guard against overrunning the loop', () => {
    expect(tl().sequence([3, 3, 4])).toEqual([0, 3, 6]);
    expect(() => tl().sequence([6, 6])).toThrow(/loop is 10s/);
  });

  it('writes a named rule only once', () => {
    const t = tl();
    t.on(1, { name: 'beat' });
    t.on(1, { name: 'beat' });
    expect(t.css().match(/@keyframes beat/g)).toHaveLength(1);
  });
});

describe('media — pictures carried inside the file', () => {
  const tl = () => timelineLib.createTimeline({ duration: 6 });
  const frames = ['data:image/png;base64,AA', 'data:image/png;base64,AB', 'data:image/png;base64,AC'];

  it('dataUri() needs a type it can know', () => {
    expect(mediaLib.dataUri(Buffer.from('x'), 'image/png')).toBe('data:image/png;base64,eA==');
    expect(() => mediaLib.dataUri(Buffer.from('x'))).toThrow(/mime/);
  });

  it('filmStrip(): steps to the LAST frame and rests there', () => {
    const t = tl();
    const strip = mediaLib.filmStrip({ id: 'f', frames, x: 0, y: 0, width: 100, height: 50, start: 1, seconds: 2, timeline: t });
    expect(strip.body.match(/<image /g)).toHaveLength(3);
    expect(t.css()).toContain('steps(2,end)');
    expect(t.css()).toContain('.f-film{transform:translateY(-100px);');
  });

  it('crossfade(): one arrival time per still after the first', () => {
    const t = tl();
    const fade = mediaLib.crossfade({ id: 's', stills: frames, at: [2, 4], x: 0, y: 0, width: 100, height: 50, timeline: t });
    expect(fade.body.match(/<image /g)).toHaveLength(3);
    expect(() => mediaLib.crossfade({ id: 's', stills: frames, at: [2], x: 0, y: 0, width: 1, height: 1, timeline: tl() })).toThrow(/one time per still/);
  });
});

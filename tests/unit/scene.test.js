import { describe, it, expect } from 'vitest';
import scene from '../../lib/scene.js';

const { composeScene, layer, renderLayer } = scene;

describe('scene.renderLayer — static vs animated transform split (Gotcha 2)', () => {
  it('nests when a layer has BOTH a static transform and an animated className', () => {
    const out = renderLayer(layer('<rect/>', { transform: 'translate(10,20)', className: 'cv-float' }));
    // Outer <g> carries the static transform; inner <g> carries only the class.
    expect(out).toBe('<g transform="translate(10,20)"><g class="cv-float"><rect/></g></g>');
    // Critical: the animated (class) element must NOT also carry a transform attribute.
    expect(out).not.toMatch(/class="cv-float"[^>]*transform=/);
  });

  it('emits a single <g class> when only a className is present (no transform attr)', () => {
    const out = renderLayer(layer('<rect/>', { className: 'cv-spin' }));
    expect(out).toBe('<g class="cv-spin"><rect/></g>');
    expect(out).not.toMatch(/transform=/);
  });

  it('emits a single <g transform> when only a static transform is present', () => {
    const out = renderLayer(layer('<rect/>', { transform: 'scale(2)' }));
    expect(out).toBe('<g transform="scale(2)"><rect/></g>');
    expect(out).not.toMatch(/class=/);
  });

  it('returns raw content when the layer has no wrappers', () => {
    expect(renderLayer(layer('<rect/>'))).toBe('<rect/>');
    expect(renderLayer('<circle/>')).toBe('<circle/>');
  });

  it('puts clip-path / filter / opacity on the OUTER (static) group, class on the inner', () => {
    const out = renderLayer(layer('<rect/>', { clip: 'url(#c)', className: 'cv-gleam' }));
    expect(out).toBe('<g clip-path="url(#c)"><g class="cv-gleam"><rect/></g></g>');
  });
});

describe('scene.composeScene', () => {
  it('joins layers back-to-front into a body string', () => {
    const { body } = composeScene({
      layers: [layer('<rect id="bg"/>'), layer('<rect id="fg"/>', { className: 'cv-x' })],
    });
    expect(body.indexOf('id="bg"')).toBeLessThan(body.indexOf('id="fg"'));
    expect(body).toContain('<g class="cv-x"><rect id="fg"/></g>');
  });

  it('collects per-layer defs alongside the top-level defs', () => {
    const { defs } = composeScene({
      defs: '<pattern id="top"/>',
      layers: [layer('<rect/>', { defs: '<linearGradient id="lg"/>' })],
    });
    expect(defs).toContain('<pattern id="top"/>');
    expect(defs).toContain('<linearGradient id="lg"/>');
  });

  it('skips null/empty layers (e.g. filtered-out optional layers)', () => {
    const { body } = composeScene({ layers: [null, layer(''), layer('<rect/>')] });
    expect(body).toBe('<rect/>');
  });
});

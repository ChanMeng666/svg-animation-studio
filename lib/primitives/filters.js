// Filter primitives — return <filter> element strings to drop into <defs>.

function createDropShadow(opts = {}) {
  const {
    id,
    dx = 2, dy = 3.5, stdDeviation = 2.5,
    floodColor = '#4C1D95', floodOpacity = 0.3,
    width = '130%', height = '140%', x = '-15%', y = '-15%'
  } = opts;
  return `<filter id="${id}" x="${x}" y="${y}" width="${width}" height="${height}">
      <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${stdDeviation}" flood-color="${floodColor}" flood-opacity="${floodOpacity}"/>
    </filter>`;
}

function createInnerDepth(opts = {}) {
  const {
    id,
    stdDeviation = 2, dy = 2,
    floodColor = '#3B0764', floodOpacity = 0.25,
    width = '110%', height = '110%', x = '-5%', y = '-5%'
  } = opts;
  return `<filter id="${id}" x="${x}" y="${y}" width="${width}" height="${height}">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${stdDeviation}" result="blur"/>
      <feOffset dx="0" dy="${dy}" result="off"/>
      <feFlood flood-color="${floodColor}" flood-opacity="${floodOpacity}" result="color"/>
      <feComposite in="color" in2="off" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
}

function createSoftGlow(opts = {}) {
  const {
    id,
    stdDeviation = 1.5,
    width = '200%', height = '200%', x = '-50%', y = '-50%'
  } = opts;
  return `<filter id="${id}" x="${x}" y="${y}" width="${width}" height="${height}">
      <feGaussianBlur stdDeviation="${stdDeviation}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
}

function createNoteGlow(opts = {}) {
  const {
    id,
    stdDeviation = 2,
    width = '300%', height = '300%', x = '-100%', y = '-100%'
  } = opts;
  return `<filter id="${id}" x="${x}" y="${y}" width="${width}" height="${height}">
      <feGaussianBlur stdDeviation="${stdDeviation}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
}

module.exports = { createDropShadow, createInnerDepth, createSoftGlow, createNoteGlow };

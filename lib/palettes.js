// Curated color palettes — a data module (sibling to easing.js), NOT a primitive.
// Presets pull tokens from a named palette instead of hardcoding hex, so one
// preset can be retargeted to any brand or mood. Token shape mirrors exactly
// what the chan-cover preset hardcodes:
//   bg      canvas background          (BASALT)
//   bgAlt   raised surface / card      (ASH)
//   ink     primary text / marks       (INK)
//   muted   secondary text             (MUTED)
//   accents ordered ramp [0,1,2]       (ORANGE, VIOLET, GLARE)
//   line    hairlines / strokes
//   dark    true when bg is dark (ink is light) — lets presets pick gleam/shadow tone
//
// Reference an accent by INDEX (`pal.accents[0]`), never by colour name, so a
// preset stays portable across every palette.

function freeze(p) {
  Object.freeze(p.accents);
  return Object.freeze(p);
}

const PALETTES = {
  // The exact chan-cover (Caldera brand) tokens — drop-in for the quality bar.
  caldera: freeze({
    name: 'caldera', category: 'brand', label: 'Caldera', dark: false,
    bg: '#E2E2DF', bgAlt: '#F7F6F2', ink: '#070607', muted: '#5B5B59',
    accents: ['#FC5000', '#524AE9', '#F5F28E'], line: '#070607',
  }),
  mono: freeze({
    name: 'mono', category: 'neutral', label: 'Mono', dark: false,
    bg: '#ECECEC', bgAlt: '#FAFAFA', ink: '#111111', muted: '#6B6B6B',
    accents: ['#3A3A3A', '#7C7C7C', '#B8B8B8'], line: '#111111',
  }),
  midnight: freeze({
    name: 'midnight', category: 'dark', label: 'Midnight', dark: true,
    bg: '#0E1116', bgAlt: '#161B22', ink: '#E6EDF3', muted: '#8B949E',
    accents: ['#58A6FF', '#BC8CFF', '#3FB950'], line: '#30363D',
  }),
  sunset: freeze({
    name: 'sunset', category: 'warm', label: 'Sunset', dark: false,
    bg: '#FFF1E6', bgAlt: '#FFE3CC', ink: '#3A1F1A', muted: '#9C6B57',
    accents: ['#FF5E5B', '#FF9F1C', '#FFD23F'], line: '#3A1F1A',
  }),
  nature: freeze({
    name: 'nature', category: 'nature', label: 'Nature', dark: false,
    bg: '#EAF3E7', bgAlt: '#F5FAF2', ink: '#14241A', muted: '#5C7A66',
    accents: ['#2E7D32', '#8BC34A', '#CDDC39'], line: '#14241A',
  }),
  neon: freeze({
    name: 'neon', category: 'vibrant', label: 'Neon', dark: true,
    bg: '#0A0A0F', bgAlt: '#14141F', ink: '#F0F0FF', muted: '#7A7A99',
    accents: ['#00F5D4', '#FF006E', '#FFBE0B'], line: '#2A2A3A',
  }),
  pastel: freeze({
    name: 'pastel', category: 'soft', label: 'Pastel', dark: false,
    bg: '#FDF2F8', bgAlt: '#FFFFFF', ink: '#3D2C3A', muted: '#9B8AA0',
    accents: ['#FFADAD', '#A0C4FF', '#BDB2FF'], line: '#3D2C3A',
  }),
  ocean: freeze({
    name: 'ocean', category: 'cool', label: 'Ocean', dark: false,
    bg: '#E3F2FD', bgAlt: '#F5FBFF', ink: '#0A2540', muted: '#5B7C99',
    accents: ['#0077B6', '#00B4D8', '#90E0EF'], line: '#0A2540',
  }),
};

function getPalette(name = 'caldera') {
  const p = PALETTES[name];
  if (!p) throw new Error(`Unknown palette: ${name}. Known: ${Object.keys(PALETTES).join(', ')}`);
  return p;
}

function listPalettes() {
  return Object.values(PALETTES).map(({ name, category, label, dark }) => ({ name, category, label, dark }));
}

module.exports = { PALETTES, getPalette, listPalettes };

const cssEasing = {
  linear: 'linear',
  easeInOut: 'ease-in-out',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeInBounce: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snappy: 'cubic-bezier(0.4, 0, 0, 1)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  anticipate: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  bouncyCubic: 'cubic-bezier(0.5, 2, 0.5, 1)'
};

const smilSplines = {
  linear: '0 0 1 1',
  easeInOut: '0.42 0 0.58 1',
  easeOutBack: '0.34 1.56 0.64 1',
  smooth: '0.4 0 0.2 1',
  snappy: '0.4 0 0 1'
};

module.exports = { cssEasing, smilSplines };

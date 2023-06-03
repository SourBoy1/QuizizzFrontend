const colors = {
  lilac: {
    DEFAULT: '#8854C0',
  },
  light: {
    DEFAULT: '#fff',
  },
  dark: {
    '10%': 'rgba(9, 9, 9, 0.1)',
  },
  brandColors: {
    a: { DEFAULT: '#2D70AE', dark: '#1B3D5B' },
    b: { DEFAULT: '#2D9DA6', dark: '#1B5357' },
    c: { DEFAULT: '#EFA929', dark: '#7C5919' },
    d: { DEFAULT: '#D5546D', dark: '#6F2F3B' },
    e: { DEFAULT: '#9A4292', dark: '#9A4292' },
    f: { DEFAULT: '#00A06A', dark: '#00A06A' },
    g: { DEFAULT: '#6FB24D', dark: '#6FB24D' },
    h: { DEFAULT: '#A52A2A', dark: '#A52A2A' },
    i: { DEFAULT: '#FF69B4', dark: '#FF69B4' },
    j: { DEFAULT: '#5D2057' },
  },
  tableThemeColors: {
    defaultTheme: { HEADER: '#f1f3f5a1', CELL: '#fff' },
  },
};

const deviceDimensionRanges = {
  MIN_DESKTOP_WIDTH: 1025,
  MIN_DESKTOP_HEIGHT: 768,
  MAX_TABLET_WIDTH: 1024,
  MIN_TABLET_WIDTH: 576,
  MIN_SMARTPHONE_WIDTH: 360,
};

export { colors, deviceDimensionRanges };

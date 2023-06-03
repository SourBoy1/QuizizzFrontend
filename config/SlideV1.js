import Constants from './Constants.js';

export const SlideThemeConstants = {
  [Constants.DeviceTypes.DESKTOP]: {
    fontSize: {
      title: {
        xs: 18,
        s: 24,
        m: 32,
        l: 36,
        xl: 48,
      },
      text: {
        xs: 18,
        s: 24,
        m: 32,
        l: 36,
        xl: 48,
      },
    },
  },
  [Constants.DeviceTypes.PHONE]: {
    fontSize: {
      title: {
        xs: 12,
        s: 14,
        m: 16,
        l: 20,
        xl: 24,
      },
      text: {
        xs: 12,
        s: 14,
        m: 16,
        l: 20,
        xl: 24,
      },
    },
  },
  [Constants.DeviceTypes.TABLET]: {
    fontSize: {
      title: {
        xs: 18,
        s: 24,
        m: 32,
        l: 36,
        xl: 48,
      },
      text: {
        xs: 18,
        s: 24,
        m: 32,
        l: 36,
        xl: 48,
      },
    },
  },
  fontFamily: {
    Quicksand: {
      name: 'Quicksand',
      url: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700',
      fontWeight: {
        title: 700,
        text: 500,
      },
    },
    'Open Sans': {
      name: 'Open Sans',
      url: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,800;1,400;1,800',
      fontWeight: {
        title: 800,
        text: 400,
      },
    },
    Roboto: {
      name: 'Roboto',
      url: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,900;1,400;1,900',
      fontWeight: {
        title: 900,
        text: 400,
      },
    },
    'Space Grotesk': {
      name: 'Space Grotesk',
      url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@0,400;0,700;1,400;1,700',
      fontWeight: {
        title: 700,
        text: 400,
      },
    },
    'Eb Garamond': {
      name: 'Eb Garamond',
      url: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700',
      fontWeight: {
        title: 800,
        text: 500,
      },
    },
    Merriweather: {
      name: 'Merriweather',
      url: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,900;1,400;1,900&display=swap',
      fontWeight: {
        title: 900,
        text: 400,
      },
    },
    'Libre Baskerville': {
      name: 'Libre Baskerville',
      url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap',
      fontWeight: {
        title: 700,
        text: 400,
      },
    },
    'Patrick Hand': {
      name: 'Patrick Hand',
      url: 'https://fonts.googleapis.com/css2?family=Patrick+Hand',
      fontWeight: {
        title: 400,
        text: 400,
      },
    },
    Cookie: {
      name: 'Cookie',
      url: 'https://fonts.googleapis.com/css2?family=Cookie&display=swap',
      fontWeight: {
        title: 400,
        text: 400,
      },
    },
    'Permanent Marker': {
      name: 'Permanent Marker',
      url: 'https://fonts.googleapis.com/css2?family=Permanent+Marker',
      fontWeight: {
        title: 400,
        text: 400,
      },
    },
    Lobster: {
      name: 'Lobster',
      url: 'https://fonts.googleapis.com/css2?family=Lobster',
      fontWeight: {
        title: 400,
        text: 400,
      },
    },
    'Bebas Neue': {
      name: 'Bebas Neue',
      url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue',
      fontWeight: {
        title: 400,
        text: 400,
      },
    },
    'Playfair Display': {
      name: 'Playfair Display',
      url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      fontWeight: {
        title: 700,
        text: 400,
      },
    },
    'Open Sans Condensed': {
      name: 'Open Sans Condensed',
      url: 'https://fonts.googleapis.com/css?family=Open Sans Condensed:300',
      fontWeight: {
        title: 600,
        text: 300,
      },
    },
  },
};

export const SlideDefaultImageData = {
  'https://cf.quizizz.com/img/presentation/default-img/presentation_title_img-1_default.jpg': {
    width: 896,
    height: 952,
  },
  'https://cf.quizizz.com/img/presentation/default-img/presentation_title_img-1_idea.jpg': {
    width: 896,
    height: 952,
  },
  'https://cf.quizizz.com/img/presentation/default-img/presentation_title_img-2_networking.jpg': {
    width: 896,
    height: 952,
  },
  'https://cf.quizizz.com/img/presentation/default-img/presentation_title_img-3_people.jpg': {
    width: 896,
    height: 952,
  },
  'https://cf.quizizz.com/img/presentation/default-img/presentation_title_img-5_technology.jpg': {
    width: 896,
    height: 952,
  },
  'https://cf.quizizz.com/img/presentation/default-img/presentation_title_img-6_training.jpg': {
    width: 896,
    height: 952,
  },
  'https://cf.quizizz.com/img/presentation/default-img/presentation_title_img-7_event.jpg': {
    width: 896,
    height: 952,
  },
};

export const CharacterWidthSizeMultiplier = {
  xs: 0.375,
  s: 0.5,
  m: 0.667,
  l: 0.75,
  xl: 1,
};

export const CharacterWidthsForXLSize = {
  A: 25.67,
  B: 31.43,
  C: 30.11,
  D: 34.31,
  E: 27.46,
  F: 26.97,
  G: 33.39,
  H: 34.50,
  I: 13.20,
  J: 26.50,
  K: 31.42,
  L: 26.97,
  M: 39.32,
  N: 35.29,
  O: 36.40,
  P: 28.95,
  Q: 36.25,
  R: 33.00,
  S: 28.66,
  T: 31.42,
  U: 33.82,
  V: 32.53,
  W: 45.25,
  X: 31.43,
  Y: 28.61,
  Z: 31.11,
  a: 30.61,
  b: 30.16,
  c: 24.97,
  d: 30.16,
  e: 28.31,
  f: 20.98,
  g: 30.61,
  h: 28.15,
  i: 11.33,
  j: 13.44,
  k: 27.07,
  l: 12.96,
  m: 44.24,
  n: 28.62,
  o: 29.94,
  p: 30.16,
  q: 30.16,
  r: 20.81,
  s: 23.12,
  t: 19.65,
  u: 28.20,
  v: 29.31,
  w: 36.86,
  x: 23.37,
  y: 28.20,
  z: 23.25,
  1: 18.67,
  2: 27.32,
  3: 25.77,
  4: 28.21,
  5: 27.65,
  6: 26.52,
  7: 26.33,
  8: 26.28,
  9: 27.29,
  0: 29.47,
  '.': 11.95,
  '*': 17.43,
  ',': 13.2,
  '!': 12.82,
  '(': 17.13,
  ')': 17.13,
  ';': 14.10,
  ':': 13.09,
  '"': 20.62,
  '^': 29.68,
  '/': 22.94,
  '#': 33.27,
  $: 28.67,
  '%': 39.14,
  '&': 34.06,
  '@': 46.25,
  ' ': 18,
  others: 15,
};

export const MapFontSizesToNames = {
  18: 'xs',
  24: 's',
  32: 'm',
  36: 'l',
  48: 'xl',
};

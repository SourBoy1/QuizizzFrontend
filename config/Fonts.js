export default {
  Quicksand: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700',
  Poppins: 'https://fonts.googleapis.com/css?family=Poppins:ital,wght@0,400;0,500;0,600;0,700',
  Roboto: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,900;1,400;1,900',
  'Space Grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap',
  'Space mono': 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  Inconsolata: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap',
  'Courier New': 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap',
  'EB Garamond': 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700',
  Merriweather: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,900;1,400;1,900&display=swap',
  'Libre Baskerville': 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap',
  'Patrick Hand': 'https://fonts.googleapis.com/css2?family=Patrick+Hand',
  Cookie: 'https://fonts.googleapis.com/css2?family=Cookie&display=swap',
  'Permanent Marker': 'https://fonts.googleapis.com/css2?family=Permanent+Marker',
  Lobster: 'https://fonts.googleapis.com/css2?family=Lobster',
  'Bebas Neue': 'https://fonts.googleapis.com/css2?family=Bebas+Neue',
  'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  'Open Sans Condensed': 'https://fonts.googleapis.com/css?family=Open Sans Condensed:300',
};

const FontsWithFontFaces = {
  OpenSans: {
    googleCDN: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400;1,800&display=swap',
    fontfaces: () => [
      new FontFace('Open Sans', 'url("https://cf.quizizz.com/fonts/OpenSans/OpenSans-Regular.ttf")', { weight: 400 }),
      new FontFace('Open Sans', 'url("https://cf.quizizz.com/fonts/OpenSans/OpenSans-Italic.ttf")', { style: 'italic' }),
      new FontFace('Open Sans', 'url("https://cf.quizizz.com/fonts/OpenSans/OpenSans-SemiBold.ttf")', { weight: 600 }),
      new FontFace('Open Sans', 'url("https://cf.quizizz.com/fonts/OpenSans/OpenSans-Bold.ttf")', { weight: 'bold' }),
      new FontFace('Open Sans', 'url("https://cf.quizizz.com/fonts/OpenSans/OpenSans-ExtraBold.ttf")', { weight: 800 }),
      new FontFace('Open Sans', 'url("https://cf.quizizz.com/fonts/OpenSans/OpenSans-SemiBoldItalic.ttf")', { weight: 700, style: 'italic' }),
      new FontFace('Open Sans', 'url("https://cf.quizizz.com/fonts/OpenSans/OpenSans-ExtraBoldItalic.ttf")', { weight: 800, style: 'italic' }),
      new FontFace('Open Sans', 'url("https://cf.quizizz.com/fonts/OpenSans/OpenSans-Light.ttf")', { weight: 100 }),
    ],
  },
};
export { FontsWithFontFaces };

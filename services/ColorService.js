import isString from 'lodash/isString';
import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';

export function rgbValuesToHSLValues(red, green, blue) {
  let r = red;
  let g = green;
  let b = blue;
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  // Calculate hue
  // No difference
  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else { h = (r - g) / delta + 4; }

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) { h += 360; }
  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

export function hslValuesToHSL(h, s, l) {
  return `hsl(${h},${s}%,${l}%)`;
}

/**
 * To convert a hex color code into rgb values
 * @param {String} hex - excepts input in string ex - '#0E00FF'
 * @returns
 */
export function hexToRGBValues(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

export function hexToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) { return; }
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Extracts the r,g,b colors and opacity from an rgba string
 * @param {string} colorString - in the format of `rgba(10,20,30,0.4)`
 * @returns {Object}
 */
export function extractRGBAComponents(colorString) {
  const [red,
    green,
    blue,
    opac] = colorString.substring(colorString.indexOf('(') + 1, colorString.lastIndexOf(')')).split(/,\s*/);
  const opacity = isString(opac) ? parseFloat(opac) : 1;

  return {
    r: parseInt(red, 10),
    g: parseInt(green, 10),
    b: parseInt(blue, 10),
    opacity: !isNaN(opacity) ? opacity : 1,
  };
}

export function componentToHex(c) {
  const color = isNumber(c) ? c : Number(c);
  const hex = color.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

export function rgbStringToHex(rgbString) {
  if (!rgbString) { return rgbString; }
  if (rgbString.includes('#')) { return rgbString; }
  const [r,
    g,
    b] = rgbString.substring(rgbString.indexOf('(') + 1, rgbString.lastIndexOf(')')).split(/,\s*/);
  return (`#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`).toUpperCase();
}

export function isHexValid(hexString) {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i;

  return hexRegex.test(hexString);
}

export function getRandomColorClass() {
  const colors = [
    'bg-brand-a',
    'bg-brand-b',
    'bg-brand-c',
    'bg-brand-d',
    'bg-brand-e',
  ];

  return colors[Math.floor(Math.random() * 5)];
}

export function isValidHex(hex) {
  if (!hex) {
    return false;
  }

  return hex.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
}

export function isColorDark(hex) {
  if (!isValidHex(hex)) {
    return false;
  }
  let r; let g; let b; let
    l;
  // eslint-disable-next-line prefer-const
  ({ r, g, b } = hexToRGBValues(hex));
  // eslint-disable-next-line prefer-const
  ({ l } = rgbValuesToHSLValues(r, g, b));
  return l < 51;
}

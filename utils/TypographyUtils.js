import reverse from 'lodash/reverse';

const ALL_USABLE_FONT_SIZES = [48, 40, 32, 28, 24, 20, 18, 16, 14, 12, 11, 10];

export function getFontSizeRange(max, min = 11, { attachUnit = false, isOrderDesc = true } = {}) {
  const allUsabelFontSizes = [...ALL_USABLE_FONT_SIZES];
  let range = [];

  allUsabelFontSizes.forEach((size, index) => {
    if (size <= max && size >= min) {
      range.push(size);
    }
  });

  if (!isOrderDesc) {
    range = reverse(range);
  }

  if (attachUnit) {
    return range.map((size) => `${size}px`);
  }
  return range;
}

export function canFontSizeBeUsed(fontSize) {
  try {
    const checkFontSize = typeof fontSize === 'number' ? fontSize : (Number(fontSize.split('px')[0]));
    return ALL_USABLE_FONT_SIZES.findIndex((size) => size === checkFontSize) !== -1;
  } catch (error) {
    return false;
  }
}

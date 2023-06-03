import isFunction from 'lodash/isFunction';
import get from 'lodash/get';
import isBoolean from 'lodash/isBoolean';

import Constants from '~/config/Constants';
import $store from '~/services/StoreService';

const ShapeConfigs = {
  LINE_2D: {
    dimensionType: '2D',
    defaultWidth: 180,
    defaultHeight: 4,
    minWidth: 32,
    minHeight: 4,
    maxHeight: 14,
    defaultFillColor: (currentThemeColor) => {
      if (currentThemeColor === '#FFFFFF') {
        return '#070A0E';
      }

      return '#FFFFFF';
    },
    hasText: false,
    allowBorder: false,
  },
  ARROW_2D: {
    dimensionType: '2D',
    defaultWidth: 180,
    defaultHeight: 50,
    minWidth: 32,
    minHeight: 50,
    defaultBorderWidth: 4,
    defaultFillColor: (currentThemeColor) => {
      if (currentThemeColor === '#FFFFFF') {
        return '#070A0E';
      }

      return '#FFFFFF';
    },
    hasText: false,
    allowBorder: true,
    fillColorShouldUpdateBorder: true,
    hasCustomPath: true,
  },
  RECTANGLE: {
    dimensionType: '2D',
  },
  ROUNDED_RECTANGLE: {
    dimensionType: '2D',
  },
  ELLIPSE: {
    dimensionType: '2D',
  },
  TRIANGLE: {
    dimensionType: '2D',
  },
  STAR: {
    dimensionType: '2D',
  },
};

class SVGPathBuilder {
  constructor(id) {
    this.id = id;
    this.path = '';
  }

  moveTo(x, y) {
    this.path += `M ${x} ${y}`;
    return this;
  }

  lineTo(x, y) {
    this.path += `L ${x} ${y}`;
    return this;
  }

  horizontalLineTo(x) {
    this.path += `H ${x}`;
    return this;
  }

  getPath() {
    return this.path;
  }
}

export class SlideShape {
  /**
   *
   * @param {'LINE_2D' | 'ARROW_2D' | 'RECTANGLE' | 'ROUNDED_RECTANGLE' | 'ELLIPSE' | 'TRIANGLE' | 'STAR'} shapeType
   */
  constructor(shapeType) {
    this.shapeType = shapeType;

    if (!ShapeConfigs[shapeType]) {
      throw new Error('Invalid shape type');
    }

    this.shape = ShapeConfigs[shapeType];
  }

  static fromSVGHTMLContent(svgContent) {
    const DOM = new DOMParser().parseFromString(svgContent, 'text/html');
    const internalSVGFigure = DOM.querySelector('use');

    if (!internalSVGFigure) {
      const internalPaths = DOM.querySelectorAll('path');
      if (!internalPaths) {
        throw new Error('Could not find an SVG element in the given HTML content');
      }

      const shapeType = SlideShape.computeShapeTypeFromPaths(internalPaths);
      return shapeType;
    }

    const href = internalSVGFigure.getAttribute('href');
    const shapeType = href.split('#')[1];

    return new SlideShape(shapeType.toUpperCase());
  }

  /**
   *
   * @param {NodeListOf<SVGPathElement>} paths
   */
  static computeShapeTypeFromPaths(paths) {
    for (let i = 0; i < paths.length; i++) {
      const pathId = paths[i].id;
      if (ShapeConfigs[pathId.toUpperCase()]) {
        return new SlideShape(pathId.toUpperCase());
      }
    }

    throw new Error('Could not find a valid shape path in the given HTML content');
  }

  get dimensionType() {
    return this.shape.dimensionType;
  }

  getDefaultFillColor() {
    if (isFunction(this.shape.defaultFillColor)) {
      const currentTheme = $store().getters['slideEditor/currentTheme'];
      const themeBGColor = get(currentTheme, 'background.color');

      const color = this.shape.defaultFillColor(themeBGColor);
      return color || Constants.DefaultShapeProperties.FILL_COLOR;
    }

    return this.shape.defaultFillColor || Constants.DefaultShapeProperties.FILL_COLOR;
  }

  get defaultTextColor() {
    return this.shape.defaultTextColor || Constants.DefaultShapeProperties.TEXT_COLOR;
  }

  getDefaultBorderColor() {
    if (this.shouldUpdateBorderColorOnFillColorChange()) {
      return this.getDefaultFillColor();
    }

    if (isFunction(this.shape.defaultBorderColor)) {
      const currentTheme = $store().getters['slideEditor/currentTheme'];
      const themeBGColor = get(currentTheme, 'background.color');

      const color = this.shape.defaultBorderColor(themeBGColor);
      return color || Constants.DefaultShapeProperties.FILL_COLOR;
    }

    return this.shape.defaultBorderColor || Constants.DefaultShapeProperties.BORDER_COLOR;
  }

  get defaultBorderWidth() {
    const borderAllowed = isBoolean(this.shape.allowBorder) ? this.shape.allowBorder : true;
    if (borderAllowed) {
      return this.shape.defaultBorderWidth || Constants.DefaultShapeProperties.BORDER_WIDTH;
    }

    return 0;
  }

  get hasCustomPath() {
    return this.shape.hasCustomPath || false;
  }

  shouldShowBorderEditingOptions() {
    if (isBoolean(this.shape.allowBorder)) {
      return this.shape.allowBorder;
    }

    return true;
  }

  shouldUpdateBorderColorOnFillColorChange() {
    // this is for 1-D shapes, that don't have a fill color. Their primary color is the 'stroke' color
    if (isBoolean(this.shape.fillColorShouldUpdateBorder)) {
      return this.shape.fillColorShouldUpdateBorder;
    }

    return false;
  }

  shouldHaveTextField() {
    if (isBoolean(this.shape.hasText)) {
      return this.shape.hasText;
    }

    return true;
  }

  getDefaultDimensions() {
    const width = this.shape.defaultWidth || Constants.DefaultShapeProperties.WIDTH;
    const height = this.shape.defaultHeight || Constants.DefaultShapeProperties.HEIGHT;

    return {
      height,
      width,
    };
  }

  getMinimumDimensions() {
    const width = this.shape.minWidth || Constants.DefaultShapeProperties.MIN_WIDTH;
    const height = this.shape.minHeight || Constants.DefaultShapeProperties.MIN_HEIGHT;

    return {
      height,
      width,
    };
  }

  getMinDimensionsToDisplayText() {
    const width = this.shape.minWidthForText || Constants.DefaultShapeProperties.MIN_WIDTH_FOR_TEXT;
    const height = this.shape.minHeightForText || Constants.DefaultShapeProperties.MIN_HEIGHT_FOR_TEXT;

    return {
      height,
      width,
    };
  }

  shouldAllowSizeToIncreaseBeyond(height, width) {
    const maxHeight = this.shape.maxHeight || Number.MAX_VALUE;
    const maxWidth = this.shape.maxWidth || Number.MAX_VALUE;

    if (height > maxHeight) {
      return false;
    }

    if (width > maxWidth) {
      return false;
    }

    return true;
  }

  getMaximumDimensions() {
    const maxHeight = this.shape.maxHeight || Number.MAX_VALUE;
    const maxWidth = this.shape.maxWidth || Number.MAX_VALUE;

    return {
      height: maxHeight,
      width: maxWidth,
    };
  }

  shouldAllowTextContentAtDimensions(height, width) {
    const allowedDimensions = this.getMinDimensionsToDisplayText();

    if (height < allowedDimensions.height || width < allowedDimensions.width) {
      return false;
    }

    return true;
  }

  getDefaultHTMLContent() {
    const internalSVGContent = this.getInternalSVGContent();
    let htmlContent = `<svg>${internalSVGContent}</svg>`;

    if (this.shouldHaveTextField()) {
      htmlContent += `<p style="text-align: center;">
        <span style="font-size: 18px;">&ZeroWidthSpace;</span>
      </p>`;
    }

    return htmlContent;
  }

  computePath(args) {
    if (this.shapeType === 'ARROW_2D') {
      return SlideShape.computePathForArrow(args);
    }

    return '';
  }

  // making just one function for arrows for now
  // if we need to do this for many shapes, we can generalize these into a class for each shape and
  // have a common function here which returns the path for the particular shape
  static computePathForArrow({ currentHeight, currentWidth }) {
    const heightHalfPoint = currentHeight / 2;

    const pathBuilder = new SVGPathBuilder('arrow_2d');

    const arrowDegree = 45 * (Math.PI / 180);
    const arrowLength = 40;

    const topArrowX = currentWidth - (arrowLength * Math.cos(arrowDegree));
    const topArrowY = heightHalfPoint - (arrowLength * Math.sin(arrowDegree));
    const bottomArrowX = currentWidth - (arrowLength * Math.cos(arrowDegree));
    const bottomArrowY = heightHalfPoint + (arrowLength * Math.sin(arrowDegree));

    pathBuilder
      .moveTo(0, heightHalfPoint)
      .horizontalLineTo(currentWidth)
      .moveTo(currentWidth, heightHalfPoint)
      .lineTo(topArrowX, topArrowY)
      .moveTo(currentWidth, heightHalfPoint)
      .lineTo(bottomArrowX, bottomArrowY);

    const d = pathBuilder.getPath();

    return `<path id="arrow_2d" d="${d}" style="vector-effect: non-scaling-stroke;" fill="none" stroke-linejoin="round" stroke-linecap="round" />`;
  }

  getInternalSVGContent() {
    if (!this.shape.hasCustomPath) {
      const shapeSVGID = this.shapeType.toLowerCase();

      return `<use href="#${shapeSVGID}"></use>`;
    }

    const path = this.computePath({
      currentHeight: this.shape.defaultHeight,
      currentWidth: this.shape.defaultWidth,
    });

    return path;
  }
}

export const isShapeLarge = (width, height) => {
  const area = width * height;
  return area > 244 * 244;
};

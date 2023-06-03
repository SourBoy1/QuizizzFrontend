import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import isNaN from 'lodash/isNaN';
import map from 'lodash/map';
import ObjectId from 'bson-objectid';

import Constants from '~/config/Constants';
import themes from '~/config/ThemesForSlidesWithShapes.js';
import {
  MapFontSizesToNames, CharacterWidthsForXLSize, CharacterWidthSizeMultiplier, SlideDefaultImageData, SlideThemeConstants,
} from '~/config/SlideV1';
import Theme from '../models/Theme';

import { isSlideForQuestion } from './SlideUtils';
import { getFontSizeAndUnit } from './Utilities';

const FontSizes = Constants.SlideFontSizes;

export const SlideElementConstants = {
  MAX_TEXT_WIDTH: 1128,
  MAX_MEDIA_TEXT_WIDTH: 544,
  MAX_BULLET_WIDTH: 1101,
  MAX_BULLET_MEDIA_WIDTH: 503,
  MAX_TEXT_ELEMENT_WIDTH: 1152,
  MAX_MEDIA_TEXT_ELEMENT_WIDTH: 568,
  MAX_MEDIA_TEXT_ELEMENT_HEIGTH: 496,
  SLIDE_DEFAULT_START_X: 64,
  SLIDE_DEFAULT_START_Y: 64,
  MEDIA_SUBTITLE_DEFULT_START_Y: 640,
  TITLE_PARA_GAP: 16,
  SLIDE_HEIGHT: 720,
  SLIDE_WIDTH: 1280,
};

const getWordWidth = (word, fontSize) => {
  let wordWidth = 0;
  for (const character of word) {
    wordWidth += character in CharacterWidthsForXLSize ? CharacterWidthsForXLSize[character] : CharacterWidthsForXLSize.others;
  }
  return wordWidth * CharacterWidthSizeMultiplier[fontSize];
};

export const getLines = (text, fontSize, maxTextContainerWidth) => {
  if (isEmpty(text)) {
    return 1;
  }

  let words = text.split(' ');
  words = isEmpty(words[words.length - 1]) ? words.slice(0, words.length - 1) : words;

  const wordWidthList = words.map((word) => getWordWidth(word, MapFontSizesToNames[fontSize]));

  let linesOfText = 1;
  let currentPosition = 0;
  const spaceWidth = CharacterWidthsForXLSize[' '] * CharacterWidthSizeMultiplier[MapFontSizesToNames[fontSize]];

  for (const wordWidth of wordWidthList) {
    currentPosition += wordWidth;
    if (currentPosition > maxTextContainerWidth) {
      currentPosition = wordWidth % maxTextContainerWidth;
      linesOfText += Math.ceil(wordWidth / maxTextContainerWidth);
    }
    currentPosition += spaceWidth;
  }

  return linesOfText;
};

export const convertMathToKatex = (html, latex) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const mathSpans = document.getElementsByClassName('katex-container');

  if (mathSpans.length > 0) {
    // math specific processing
    const katexes = latex.map((text) => {
      const katex = document.createElement('Katex');
      katex.setAttribute('latex', text);
      return katex;
    });

    for (let i = mathSpans.length - 1; i >= 0; i--) {
      mathSpans[i].replaceWith(katexes[parseInt(mathSpans[i].getAttribute('data-idx'), 10)]);
    }
  }

  return document.getElementsByTagName('body')[0].innerHTML;
};

const getTextStyles = (type, theme, defaults) => {
  const styles = {};
  const oldBackgroundColor = ['#000000', '#090909', '', null];

  const fontColor = get(theme, `fontColor.${type}`, null);
  const fontSize = get(theme, `fontSize.${type}`, null);
  const { fontFamily } = theme;

  styles.fontSize = !isEmpty(fontSize) ? `${SlideThemeConstants[Constants.DeviceTypes.DESKTOP].fontSize[type][fontSize]}px` : defaults.fontSize;

  styles.color = isEmpty(fontColor) || oldBackgroundColor.includes(get(theme, 'background.color', ''))
    ? defaults.fontColor
    : fontColor;

  if (!isEmpty(fontFamily)) {
    styles.fontFamily = fontFamily;
  }

  return styles;
};

const convertMathInQuestions = (qd) => {
  /**
   * Convert math in question title
   */
  if (get(qd, 'structure.query.hasMath', false)) {
    const newMathHtml = convertMathToKatex(qd.structure.query.text, get(qd, 'structure.query.math.latex', []));
    qd.structure.query.text = newMathHtml;
  }

  /**
   * Convert math and media in options
   */
  const options = get(qd, 'structure.options', []);

  if (!options.length) {
    return;
  }

  for (let i = 0; i < options.length; i++) {
    if (get(options[i], 'hasMath', false)) {
      const newMathHtml = convertMathToKatex(options[i].text, get(options[i], 'math.latex', []));
      options[i].text = newMathHtml;
    }
  }
};

const convertQuestions = (qd) => {
  convertMathInQuestions(qd);

  const mediaObj = get(qd, 'structure.query.media', []);
  const media = Array.isArray(mediaObj) && mediaObj.length > 0 ? mediaObj[0] : mediaObj;

  if (isVideoTypeMedia(media)) {
    qd.structure.query.media.meta = qd.structure.query.media.meta || {};
    qd.structure.query.media.meta = { ...qd.structure.query.media.meta, ...getVideoTimes(media) };
  }
};

const generateHTML = (element, styles, nodeTypes = null) => {
  if (!element.text) {
    return element.text;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(element.text, 'text/html');

  const mathSpans = document.getElementsByClassName('katex-container');
  if (mathSpans.length > 0) {
    // math specific processing
    const katexes = element.math.latex.map((text) => {
      const katex = document.createElement('Katex');
      katex.setAttribute('latex', text);
      return katex;
    });

    for (let i = mathSpans.length - 1; i >= 0; i--) {
      mathSpans[i].replaceWith(katexes[parseInt(mathSpans[i].getAttribute('data-idx'), 10)]);
    }
  }

  const nodes = document.getElementsByTagName('p');
  for (const node of nodes) {
    if (node.textContent) {
      const span = document.createElement('span');

      for (const childNode of node.childNodes) {
        const childSpan = document.createElement('span');
        const isMathSpan = childNode.tagName ? childNode.tagName.toLowerCase().includes('katex') : false;

        // extracting the style:color from the child node and providing the default color if it is a math span
        childSpan.style.color = childNode.style && childNode.style.color && !isMathSpan ? childNode.style.color : '';

        if (isMathSpan) {
          childSpan.innerHTML = childNode.outerHTML;
        } else if (childNode.tagName) {
          // copying the innerHTML for spans and the outerHTML for any other tags.
          childSpan.innerHTML = childNode.tagName === 'SPAN' ? childNode.innerHTML : childNode.outerHTML;
        } else { childSpan.innerHTML = childNode.textContent; }

        childSpan.style.fontFamily = styles.fontFamily ? styles.fontFamily : '';
        childSpan.style.fontSize = styles.fontSize ? styles.fontSize : '';

        span.appendChild(childSpan);
      }

      if (Array.isArray(nodeTypes)) {
        let [innerNode, outerNode] = [null, null];

        map(nodeTypes, (nodeType) => {
          if (!innerNode) {
            innerNode = document.createElement(nodeType);
            outerNode = innerNode;
          } else {
            innerNode.appendChild(document.createElement(nodeType));
            innerNode = innerNode.childNodes[0];
          }
        });

        innerNode.innerHTML = span.innerHTML;

        if (styles.textAlign === 'center') {
          outerNode.style.textAlign = styles.textAlign;
        }

        node.parentElement.replaceChild(outerNode, node);
      } else if (nodeTypes) {
        const newNode = document.createElement(nodeTypes);
        newNode.innerHTML = span.innerHTML;

        if (styles.textAlign === 'center') {
          newNode.style.textAlign = styles.textAlign;
        }

        node.parentElement.replaceChild(newNode, node);
      } else {
        node.innerHTML = span.innerHTML;
        if (styles.textAlign === 'center') {
          node.style.textAlign = styles.textAlign;
        }
      }
    }
  }

  return document.getElementsByTagName('body')[0].innerHTML;
};

export const getTextFromHTML = (text) => {
  const parser = new DOMParser();
  const { textContent } = parser.parseFromString(text, 'text/html').body;
  return textContent;
};

const element = (position, size, rotation, zIndex, placeholder, placeholderSize) => ({
  _id: ObjectId().toHexString(),
  placeholder,
  placeholderSize,
  transform: {
    position,
    size,
    rotation,
  },
  zIndex,
});

const textElement = (position, size, rotation, zIndex, text, placeholder, placeholderSize) => ({
  ...element(position, size, rotation, zIndex, placeholder, placeholderSize),
  type: 'TEXT',
  data: {
    html: text,
  },
});

const mediaElement = (position, size, rotation, zIndex, media) => {
  const mediaObj = Array.isArray(media) && media.length > 0 ? media[0] : media;

  if (isVideoTypeMedia(mediaObj)) {
    mediaObj.meta = mediaObj.meta || {};
    mediaObj.meta = { ...mediaObj.meta, ...getVideoTimes(mediaObj) };
  }

  return {
    ...element(position, size, rotation, zIndex),
    type: 'MEDIA',
    data: {
      media: mediaObj,
    },
  };
};

const getTitleHeight = (titleLines) => {
  const adjustedHeight = 24;
  return titleLines * 72 + adjustedHeight;
};

const getParaHeight = (paraLines, paraStyles) => {
  const paraFontValue = getFontSizeAndUnit(paraStyles.fontSize).size;
  const totalPaddingHeight = (paraLines - 1) * 8;
  const totalTextHeight = paraLines * 60;

  // Scale the height according to the font size
  return (paraFontValue / 32) * (totalPaddingHeight + totalTextHeight);
};

const generateTitleSubtitle = (title, subtitle, theme) => {
  let yStart = 280;
  const titleStyles = getTextStyles('title', theme, { fontSize: '48px', fontColor: '#222222' });
  const titleFont = getFontSizeAndUnit(titleStyles.fontSize).size;
  const titleLines = getLines(getTextFromHTML(title.text), `${titleFont}`, SlideElementConstants.MAX_TEXT_WIDTH);
  const titleHeight = getTitleHeight(titleLines);
  const paraStyles = getTextStyles('text', theme, { fontSize: '32px', fontColor: '#222222' });
  const paraFont = getFontSizeAndUnit(paraStyles.fontSize).size;
  const paraLines = getLines(getTextFromHTML(subtitle.text), `${paraFont}`, SlideElementConstants.MAX_TEXT_WIDTH);
  const paraHeight = getParaHeight(paraLines, paraStyles);

  // Calculate height from the fixed vertical position: 280(from the top) and center the start position vertically
  if (yStart + titleHeight + SlideElementConstants.TITLE_PARA_GAP + paraHeight >= SlideElementConstants.SLIDE_HEIGHT) {
    yStart = Math.floor((SlideElementConstants.SLIDE_HEIGHT - (titleHeight + SlideElementConstants.TITLE_PARA_GAP + paraHeight)) / 2);

    // If yStart is negative, moving the yStart to 64 (from the top)
    yStart = yStart < 0 ? SlideElementConstants.SLIDE_DEFAULT_START_Y : yStart;
  }

  // If this still continues to overflow, reduce the font size by 1
  if (yStart + titleHeight + SlideElementConstants.TITLE_PARA_GAP + paraHeight >= SlideElementConstants.SLIDE_HEIGHT) {
    paraStyles.fontSize = FontSizes[FontSizes.indexOf(paraFont) - 1];
  }

  return [
    textElement(
      { x: SlideElementConstants.SLIDE_DEFAULT_START_X, y: yStart },
      { width: SlideElementConstants.MAX_TEXT_ELEMENT_WIDTH, height: titleHeight },
      0,
      0,
      generateHTML(title, { ...titleStyles, textAlign: 'center' }, ['h1', 'strong']),
      'Enter title here...',
      48,
    ),
    textElement(
      { x: SlideElementConstants.SLIDE_DEFAULT_START_X, y: yStart + titleHeight + SlideElementConstants.TITLE_PARA_GAP },
      { width: SlideElementConstants.MAX_TEXT_ELEMENT_WIDTH, height: SlideElementConstants.SLIDE_DEFAULT_START_Y },
      0,
      1,
      generateHTML(subtitle, { textAlign: 'center', ...paraStyles }),
      'Enter text here...',
      32,
    ),
  ];
};

const generateTitleParaBullets = (title, para, bullets, theme) => {
  let html;
  const titleStyles = getTextStyles('title', theme, { fontSize: '48px', fontColor: '#222222' });
  const titleFont = getFontSizeAndUnit(titleStyles.fontSize).size;
  const titleLines = getLines(getTextFromHTML(title.text), `${titleFont}`, SlideElementConstants.MAX_TEXT_WIDTH);
  const titleHeight = getTitleHeight(titleLines);
  if (para) {
    const paraStyles = getTextStyles('text', theme, { fontSize: '32px', fontColor: '#222222' });
    const paraFont = getFontSizeAndUnit(paraStyles.fontSize).size;
    const paraLines = getLines(getTextFromHTML(para.text), `${paraFont}`, SlideElementConstants.MAX_TEXT_WIDTH);
    const paraHeightBeyondEditor = getParaHeight(paraLines, paraStyles);
    if (SlideElementConstants.SLIDE_DEFAULT_START_Y + titleHeight + SlideElementConstants.TITLE_PARA_GAP + paraHeightBeyondEditor >= SlideElementConstants.SLIDE_HEIGHT) {
      paraStyles.fontSize = FontSizes[FontSizes.indexOf(paraFont) - 1];
    }
    html = generateHTML(para, { ...paraStyles });
  } else {
    let bulletsHeight = 0;
    const bulletStyles = getTextStyles('text', theme, { fontSize: '32px', fontColor: '#222222' });
    const bulletFont = getFontSizeAndUnit(bulletStyles.fontSize).size;
    for (const bullet of bullets) {
      const bulletLines = getLines(getTextFromHTML(bullet.text), `${bulletFont}`, SlideElementConstants.MAX_BULLET_WIDTH);
      bulletsHeight += (bulletLines * 48) * (bulletFont / 32);
      if (SlideElementConstants.SLIDE_DEFAULT_START_Y + titleHeight + SlideElementConstants.TITLE_PARA_GAP + bulletsHeight >= SlideElementConstants.SLIDE_HEIGHT) {
        bulletStyles.fontSize = FontSizes[FontSizes.indexOf(bulletFont) - 1];
        break;
      }
    }
    html = '<ul>';
    bullets.forEach((bullet) => {
      html += `<li>${generateHTML(bullet, { ...bulletStyles })}</li>`;
    });
    html += '</ul>';
  }

  return [
    textElement(
      { x: SlideElementConstants.SLIDE_DEFAULT_START_X, y: SlideElementConstants.SLIDE_DEFAULT_START_Y },
      { width: SlideElementConstants.MAX_TEXT_ELEMENT_WIDTH, height: titleHeight },
      0,
      0,
      generateHTML(title, { ...titleStyles }, ['h1', 'strong']),
      'Enter title here...',
      48,
    ),
    textElement(
      { x: SlideElementConstants.SLIDE_DEFAULT_START_X, y: SlideElementConstants.SLIDE_DEFAULT_START_Y + titleHeight + SlideElementConstants.TITLE_PARA_GAP },
      { width: SlideElementConstants.MAX_TEXT_ELEMENT_WIDTH, height: SlideElementConstants.SLIDE_DEFAULT_START_Y },
      0,
      1,
      html,
      'Enter text here...',
      32,
    ),
  ];
};

const generateTitleParaBulletsMedia = (title, para, bullets, media, theme) => {
  let html;
  const titleStyles = getTextStyles('title', theme, { fontSize: '48px', fontColor: '#222222' });
  const titleFont = getFontSizeAndUnit(titleStyles.fontSize).size;
  const titleLines = getLines(getTextFromHTML(title.text), `${titleFont}`, SlideElementConstants.MAX_MEDIA_TEXT_WIDTH);
  const titleHeight = getTitleHeight(titleLines);
  if (para) {
    const paraStyles = getTextStyles('text', theme, { fontSize: '32px', fontColor: '#222222' });
    const paraFont = getFontSizeAndUnit(paraStyles.fontSize).size;
    const paraLines = getLines(getTextFromHTML(para.text), `${paraFont}`, SlideElementConstants.MAX_MEDIA_TEXT_WIDTH);
    const paraHeightBeyondEditor = getParaHeight(paraLines, paraStyles);
    if (SlideElementConstants.SLIDE_DEFAULT_START_Y + titleHeight + SlideElementConstants.TITLE_PARA_GAP + paraHeightBeyondEditor >= SlideElementConstants.SLIDE_HEIGHT) {
      paraStyles.fontSize = FontSizes[FontSizes.indexOf(paraFont) - 1];
    }
    html = generateHTML(para, { ...paraStyles });
  } else {
    let bulletsHeight = 0;
    const bulletStyles = getTextStyles('text', theme, { fontSize: '32px', fontColor: '#222222' });
    const bulletFont = getFontSizeAndUnit(bulletStyles.fontSize).size;
    for (const bullet of bullets) {
      const bulletLines = getLines(getTextFromHTML(bullet.text), `${bulletFont}`, SlideElementConstants.MAX_BULLET_MEDIA_WIDTH);
      bulletsHeight += (bulletLines * 48) * (bulletFont / 32);
      if (SlideElementConstants.SLIDE_DEFAULT_START_Y + titleHeight + SlideElementConstants.TITLE_PARA_GAP + bulletsHeight >= SlideElementConstants.SLIDE_HEIGHT) {
        bulletStyles.fontSize = FontSizes[FontSizes.indexOf(bulletFont) - 1];
        break;
      }
    }
    html = '<ul>';
    bullets.forEach((bullet) => {
      html += `<li>${generateHTML(bullet, { ...bulletStyles })}</li>`;
    });
    html += '</ul>';
  }

  const data = [
    textElement(
      { x: SlideElementConstants.SLIDE_DEFAULT_START_X, y: SlideElementConstants.SLIDE_DEFAULT_START_Y },
      { width: SlideElementConstants.MAX_MEDIA_TEXT_ELEMENT_WIDTH, height: titleHeight },
      0,
      0,
      generateHTML(title, { ...titleStyles }, ['h1', 'strong']),
    ),
    textElement(
      { x: SlideElementConstants.SLIDE_DEFAULT_START_X, y: SlideElementConstants.SLIDE_DEFAULT_START_Y + titleHeight + SlideElementConstants.TITLE_PARA_GAP },
      { width: SlideElementConstants.MAX_MEDIA_TEXT_ELEMENT_WIDTH, height: SlideElementConstants.MAX_MEDIA_TEXT_ELEMENT_HEIGTH },
      0,
      1,
      html,
    ),
  ];
  const mediaObj = media.length ? media[0] : media;

  if (hasMedia(mediaObj, mediaObj.type)) {
    let width = SlideElementConstants.MAX_MEDIA_TEXT_ELEMENT_WIDTH;
    let height = 592;
    let y = SlideElementConstants.SLIDE_DEFAULT_START_Y;
    let x = 648;

    if (mediaObj.type === 'image') {
      const dimensions = getDimensions(media, {
        x, y, width, height,
      });

      width = dimensions.width;
      height = dimensions.height;
      y = dimensions.y;
      x = dimensions.x;
    }

    data.push(mediaElement({ x, y }, { width, height }, 0, 2, media));
  }

  return data;
};

const generateMediaSubtitle = (media, subtitle, theme) => {
  const mediaObj = media.length ? media[0] : media;
  const subtitleStyles = getTextStyles('text', theme, { fontSize: '32px', fontColor: '#222222' });
  const subtitleFont = getFontSizeAndUnit(subtitleStyles.fontSize).size;
  const subtitleLines = getLines(getTextFromHTML(subtitle.text), `${subtitleFont}`, SlideElementConstants.MAX_TEXT_WIDTH);
  const subtitleHeight = subtitleLines * 48 - 8;
  const data = [
    textElement(
      { x: SlideElementConstants.SLIDE_DEFAULT_START_X, y: SlideElementConstants.MEDIA_SUBTITLE_DEFULT_START_Y - subtitleHeight },
      { width: SlideElementConstants.MAX_TEXT_ELEMENT_WIDTH, height: SlideElementConstants.SLIDE_DEFAULT_START_Y },
      0,
      1,
      generateHTML(subtitle, { ...subtitleStyles, textAlign: 'center' }),
    ),
  ];

  if (hasMedia(mediaObj, mediaObj.type)) {
    let width = SlideElementConstants.SLIDE_WIDTH; let height = SlideElementConstants.SLIDE_HEIGHT; let y = 0; let x = 0;

    if (mediaObj.type === 'image') {
      const dimensions = getDimensions(media, {
        x, y, width, height,
      });

      width = dimensions.width;
      height = dimensions.height;
      y = dimensions.y;
      x = dimensions.x;
    }

    data.push(mediaElement({ x, y }, { width, height }, 0, 0, media));
  }

  return data;
};

const generateEmbedWebpage = (media) => {
  const embedWebpage = mediaElement({ x: 0, y: 0 }, { width: SlideElementConstants.SLIDE_WIDTH, height: SlideElementConstants.SLIDE_HEIGHT }, 0, 0, media);
  embedWebpage.type = 'WEBPAGE';
  return [embedWebpage];
};

const getThemeObject = (theme) => {
  // Checking for old background colors and fontcolors and converting them to a new theme manually.
  const isBackgroundOld = ['#090909', '#000000', '', null].includes(get(theme, 'background.color', ''));
  if (isEmpty(theme) || isBackgroundOld) {
    // const newBackground = Theme
    return Theme({
      background: {
        color: get(theme, 'background.color', ''),
        image: get(theme, 'background.image', ''),
        video: get(theme, 'background.video', ''),
      },
      fontColor: {
        text: get(theme, 'fontColor.text', ''),
      },
    });
  }

  return Theme(theme);
};

/**
 * Ensures SLIDEV2 conversion from SLIDE in questions drafts
 * @param {object} qd the question draft
 */
export function ensureSlideV2(qd) {
  if (!qd) {
    return;
  }

  if (qd.type === Constants.SlideTypes.CONTENT_SLIDE_V1) {
    const { structure } = qd;
    let elements = null;
    const theme = get(structure, 'theme', {});

    switch (structure.kind) {
      case Constants.SlideTypesV1.TITLE_SUBTITLE:
        elements = generateTitleSubtitle(structure.title, structure.subtitle, theme);
        break;
      case Constants.SlideTypesV1.TITLE_PARA:
      case Constants.SlideTypesV1.TITLE_BULLETS:
        elements = generateTitleParaBullets(structure.title, structure.para, structure.bullets, theme);
        break;
      case Constants.SlideTypesV1.TITLE_PARA_MEDIA:
      case Constants.SlideTypesV1.TITLE_BULLETS_MEDIA:
        elements = generateTitleParaBulletsMedia(structure.title, structure.para, structure.bullets, structure.media, theme);
        break;
      case Constants.SlideTypesV1.MEDIA_SUBTITLE:
        elements = generateMediaSubtitle(structure.media, structure.subtitle, theme);
        break;
      case Constants.SlideTypesV1.EMBED_WEBPAGE:
        elements = generateEmbedWebpage(structure.media);
        break;
      default:
        break;
    }
    qd.structure = {
      elements,
      kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
      theme: getThemeObject(structure.theme),
      settings: structure.settings,
    };
    qd.type = Constants.SlideTypes.CONTENT_SLIDE_V2;
    qd.edited = true;
  }

  if ((qd.type !== Constants.SlideTypes.CONTENT_SLIDE_V1) && (qd.type !== Constants.SlideTypes.CONTENT_SLIDE_V2)) {
    convertQuestions(qd);
  }
}

export function ensureQuestionIsEditorConsumable(questionDraft) {
  if (isSlideForQuestion(questionDraft)) {
    convertQuestions(questionDraft);
  }

  return questionDraft;
}

export function getCookedSlideTheme(slideTheme) {
  const isBackgroundOld = ['#090909', '#000000', '', null].includes(get(slideTheme, 'background.color', ''));
  if (isEmpty(slideTheme) || isBackgroundOld) {
    // const newBackground = Theme
    const defaultTheme = themes.basicThemes[0];
    const initialTheme = {
      id: defaultTheme.id,
      fontFamily: defaultTheme.fontFamily,
      titleFontFamily: defaultTheme.titleFontFamily,
      fontColor: {
        text: defaultTheme.textColor,
      },
      background: {
        color: defaultTheme.bgColor,
        image: '',
        video: '',
      },

      shape: {
        largeShapeColor: defaultTheme.largeShapeColor,
        smallShapeColor: defaultTheme.smallShapeColor,
      },
    };
    return Theme(initialTheme);
  }

  return Theme(slideTheme);
}

function getDimensions(media, templateDefaults) {
  const mediaObj = media.length ? media[0] : media;
  const img = mediaObj.url;
  let width = 0;
  let height = 0;
  let imgWidth = 0;
  let imgHeight = 0;

  if (!isEmpty(SlideDefaultImageData[img])) {
    imgWidth = SlideDefaultImageData[img].width;
    imgHeight = SlideDefaultImageData[img].height;
  } else {
    imgWidth = mediaObj.meta.width;
    imgHeight = mediaObj.meta.height;
  }

  const containerX = templateDefaults.x;
  const containerY = templateDefaults.y;
  const containerWidth = templateDefaults.width;
  const containerHeight = templateDefaults.height;

  if (imgWidth > imgHeight) {
    width = imgWidth > containerWidth ? containerWidth : imgWidth;
    height = (imgHeight / imgWidth) * width;
  } else {
    height = imgHeight > containerHeight ? containerHeight : imgHeight;
    width = (imgWidth / imgHeight) * height;
  }

  const x = (containerX + containerWidth / 2) - width / 2;
  const y = (containerY + containerHeight / 2) - height / 2;

  return {
    width, height, x, y,
  };
}

function hasMedia(mediaObject, type) {
  return !isEmpty(getMediaUrl(mediaObject, type));
}

function getMediaUrl(mediaObject, type) {
  if (isEmpty(mediaObject)) {
    return '';
  }

  if (type === 'video') {
    const videoId = get(mediaObject, 'meta.videoId', '');

    if (isEmpty(videoId)) {
      return '';
    }

    return `https://www.youtube.com/embed/${videoId}`;
  }

  return mediaObject.url;
}

function isVideoTypeMedia(media) {
  return hasMedia(media, 'video');
}

function getVideoTimes(media) {
  const meta = media.meta || {};
  const start = parseInt(meta.start, 10);
  const end = parseInt(meta.end, 10);
  const startTime = parseInt(meta.startTime, 10);
  const endTime = parseInt(meta.endTime, 10);
  let startTimeToUse = -1;
  let endTimeToUse = -1;

  if (!isNaN(start)) {
    startTimeToUse = start;
  } else if (!isNaN(startTime)) {
    startTimeToUse = startTime;
  }

  if (!isNaN(end)) {
    endTimeToUse = end;
  } else if (!isNaN(endTime)) {
    endTimeToUse = endTime;
  }

  return {
    startTime: Math.floor(startTimeToUse),
    endTime: Math.floor(endTimeToUse),
  };
}

export function createSpanInsidePTag(html) {
  return `<p><span style="font-size: 32px;">${getTextFromHTML(html)}</span></p>`;
}

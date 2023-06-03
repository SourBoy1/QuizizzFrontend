/**
 * A Place for general purpose miscellaneous uitility methods
 */

import { nextTick } from 'vue';

import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import has from 'lodash/has';
import get from 'lodash/get';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isNil from 'lodash/isNil';
import replace from 'lodash/replace';
import values from 'lodash/values';

import windowInnerHeight from 'ios-inner-height';
import { detect } from 'detect-browser';

import SessionStorage from '~/services/SessionStorage';
import CookieService from '~/services/CookieService';
import { countryFromCode } from '~/config/Countries';
import featureFlags from '~/services/FeatureFlagsService';
import Constants from '../config/Constants';
import Search from '../config/SearchConfig.js';
import QLogger from '../services/QLogger';
import StringUtils from './StringUtils.js';
import UrlUtils from './UrlUtils.js';
import LocalStorage from '../services/LocalStorage.js';

import { isClient } from './EnvUtils';

/**
 * Simple validation method to check if a given value corresponds with the model
 * Validation does NOT happen for nested keys
 * @param {Object} valueToCheck - The value you want to validate with a model
 * @param {Object} model - the model whcih will be compared
 */
export function validateWithModel(valueToCheck, model) {
  // TODO(sarthak): Also add validation for nested objects

  const modelToUse = isFunction(model) ? model() : model;

  QLogger.invariant(isPlainObject(valueToCheck) && !isEmpty(valueToCheck), 'validateWithModel: `valueToCheck` needs to be an object that is not empty');

  QLogger.invariant(isPlainObject(modelToUse) && !isEmpty(modelToUse), 'validateWithModel: `model` needs to be an object that is not empty');

  const allKeys = keys(modelToUse);

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    const doesKeyExist = has(valueToCheck, key);

    QLogger.invariant(doesKeyExist, `validateWithModel: The key(${key}) should exist in the given value.`);

    // const areTheTypeOfValuesSame = typeof valueToCheck[key] === typeof modelToUse[key];

    // if (!areTheTypeOfValuesSame) {
    //   QLogger.warn(`validateWithModel: The type of value against key(${key}) does not match in the valueToCheck and the model. valueToCheck - `, valueToCheck);
    // }
  }

  return true;
}

/**
 * The factory version of the validateWithModel - returns a callback function that takes in valueToCheck
 * @param {Object} model - The model with which the value received in the callback be compared to
 * @returns {Function}
 */
export function validateWithModelFactory(model) {
  return (valueToCheck) => validateWithModel(valueToCheck, model);
}

/**
 * --------------------CAVEAT------------------------------------------------
 * The type returned here matches the way tailwind is configured for responsiveness i.e.
 * it it based on width. The orientation would not matter to decide if a device is a phone or a tablet or a desktop.
 */
export function getCurrentDeviceProperties(oldInfoObj = {}, isFirstTouch = false) {
  const width = window.innerWidth;
  const height = windowInnerHeight();
  const visibleViewportHeight = window.innerHeight;
  const isTouchSupported = get(oldInfoObj, 'isTouchSupported') || isFirstTouch; // So that even if the old object has 'isTouchSupported' false, it would be overwritten by isFirstTouch when it is 'true'

  // const longerDimension = Math.max(width, height);
  // const shorterDimension = Math.min(width, height);

  let type = get(oldInfoObj, 'type', Constants.DeviceTypes.DESKTOP);
  let orientation = get(oldInfoObj, 'orientation', Constants.DeviceOrientations.PORTRAIT);

  if (width < Constants.DeviceDimensionRanges.MIN_TABLET_WIDTH) {
    type = Constants.DeviceTypes.PHONE;
  } else if (width < Constants.DeviceDimensionRanges.MIN_DESKTOP_WIDTH) {
    type = Constants.DeviceTypes.TABLET;
  } else {
    type = Constants.DeviceTypes.DESKTOP;
  }

  if (width / height > 1) {
    orientation = Constants.DeviceOrientations.LANDSCAPE;
  } else {
    orientation = Constants.DeviceOrientations.PORTRAIT;
  }

  return {
    width, height, orientation, type, isTouchSupported, visibleViewportHeight,
  };
}

/**
 * Get the scale difference between 2 sets of aspect ratios
 * @param {Array} [originalDimensions=[]]
 * @param {Array} [scaledDimensions=[]]
 * @returns {Object}
 */
export function getScaleFromAspectRatios(originalDimensions = [], scaledDimensions = []) {
  const isValidDimensions = (dims) => Array.isArray(originalDimensions) && isNumber(originalDimensions[0]) && isNumber(originalDimensions[1]);
  const isOriginalDimValid = isValidDimensions(originalDimensions);
  const isScaledDimValid = isValidDimensions(scaledDimensions);

  QLogger.invariant(isOriginalDimValid, `getScaleFromAspectRatios: originalDimensions sent are not valid. They need to be an array with x,y postions as 0,1 indices. Recieved - ${JSON.stringify(originalDimensions)}`);

  QLogger.invariant(isScaledDimValid, `getScaleFromAspectRatios: originalDimensions sent are not valid. They need to be an array with x,y postions as 0,1 indices. Recieved - ${JSON.stringify(originalDimensions)}`);
  const scaleX = scaledDimensions[0] / originalDimensions[0];
  const scaleY = scaledDimensions[1] / originalDimensions[1];
  const scale = Math.min(scaleX, scaleY);

  return { scaleX, scaleY, scale };
}

export function getWebsiteLogo(url) {
  let protocol;
  let hostname;
  try {
    const urlObj = new URL(url);
    protocol = urlObj.protocol;
    hostname = urlObj.hostname;
  } catch (err) {
    return '';
  }
  const logo = `${protocol}//${hostname}/favicon.ico`;
  return logo;
}

export function gradeLevelText(grades) {
  let gradeLevel = '';

  if (!grades || grades.length === 0) {
    return '';
  }

  gradeLevel = grades[0] === grades[1]
    ? StringUtils.numberToLabel(grades[0])
    : `${StringUtils.numberToLabel(grades[0])}, ${StringUtils.numberToLabel(grades[1])}`;

  return gradeLevel;
}

/**
 * Utility to detect the name of the operating system the browser is running on.
 * @returns {Object}
 */
export function browserOS() {
  const browser = detect();
  return {
    isMac: browser.os === 'Mac OS',
  };
}

export function deselectAllText() {
  if (window.getSelection) {
    if (window.getSelection().empty) { // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) { // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) { // IE?
    document.selection.empty();
  }
}

/* -------- ACCESSIBILITY utils Start -------- */
/**
 * Sets focus on the first element in container.
 * If the firstElement to focus on is not sent, it looks for the first focusable element in the container
 */
export function setFocusOnFirstElement(containerElement, firstElementToFocus = null) {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  if (isEmpty(containerElement)) {
    return;
  }

  const focusableElementsArray = [...containerElement.querySelectorAll(focusableElements)];

  let firstFocusableElement = null;

  if (focusableElementsArray.length <= 1) {
    firstFocusableElement = focusableElementsArray[0];
  } else {
    firstFocusableElement = focusableElementsArray.filter((el) => !el.classList.contains('close-btn'))[0];
  }

  if (!isEmpty(firstElementToFocus)) {
    firstFocusableElement = firstElementToFocus;
  }

  if (isEmpty(firstFocusableElement)) {
    return;
  }

  firstFocusableElement.focus();
}

export function trapFocusWithinContainer(ev, containerElement) {
  const focusableElements = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  if (isEmpty(containerElement)) {
    return;
  }

  const firstFocusableElement = containerElement.querySelectorAll(focusableElements)[0];

  const focusableContent = containerElement.querySelectorAll(focusableElements);
  const lastFocusableElement = focusableContent[focusableContent.length - 1];
  const isTabPressed = ev.key === 'Tab' || ev.keyCode === 9;

  if (!isTabPressed) {
    return;
  }

  if (ev.shiftKey) {
    if (document.activeElement === firstFocusableElement) {
      lastFocusableElement.focus();
      ev.preventDefault();
    }
  } else if (document.activeElement === lastFocusableElement) {
    firstFocusableElement.focus();
    ev.preventDefault();
  }
}

/* -------- ACCESSIBILITY utils End -------- */

/**
 * Prepends a dollar sign to a string
 * @param {string} string
 * @returns {string} $someString
 */

export function prependDollar(val) {
  return `$${val}`;
}

/**
 * Parses the string and returns all the elements and their enclosing content
 * as an array. Example - string 'This is a <foo x="y">bar</foo> element' will return
 * the result - ['<foo x="y">bar</foo>'];
 * @param {string} string
 * @param {string} element
 * @returns {Array}
 */
export function parseForHTMLElements(string, element) {
  const regex = new RegExp(`<${element}(.*?)>(.*?)</${element}>`, 'gi');
  const result = string.match(regex);

  return isEmpty(result) ? [] : result;
}

export function getLayoutForScreenSize({ small, large, devicePropsArgs }) {
  let deviceProps = devicePropsArgs;
  if (!deviceProps) {
    deviceProps = getCurrentDeviceProperties(null, true);
  }
  if (deviceProps.type !== Constants.DeviceTypes.DESKTOP) {
    return small;
  }

  return large;
}

const getType = (errorData) => {
  if (isString(errorData.error)) {
    return errorData.error;
  }

  if (errorData.error && errorData.error.type) {
    return errorData.error.type;
  }

  if (errorData.response) {
    const { response } = errorData;
    const responseErrorType = get(response, 'error.type');

    if (responseErrorType) {
      return responseErrorType;
    }

    if (response.success === false && isString(response.type)) {
      return response.type;
    }

    if (response.success === false && isString(response.error)) {
      return response.error;
    }

    if (!isBoolean(response.success) && (response.error instanceof Error)) {
      return response.error;
    }
  }
};

const getCause = (errorData) => {
  if (isString(errorData.cause)) {
    return errorData.cause;
  }

  if (errorData.error && errorData.error.cause) {
    return errorData.error.cause;
  }

  if (errorData.data && errorData.data.cause) {
    return errorData.data.cause;
  }
};

/**
 * A catch-all that returns the backend error type from any api response
 * @return {string}
 */
export function getNetworkErrorType(data, fallback = '') {
  const pathsToTryAndGetErrorFrom = ['response.data.data', 'response.data', 'response', 'response.error', ''];

  for (let i = 0; i < pathsToTryAndGetErrorFrom.length; i++) {
    const path = pathsToTryAndGetErrorFrom[i];
    const val = path ? get(data, path) : data;

    if (!isNil(val)) {
      const errorType = getType(val);

      if (!isNil(errorType)) {
        return errorType;
      }
    }
  }

  return fallback;
}

/**
 * A catch-all that returns the backend error cause from any api response
 * @return {string}
 */
export function getNetworkErrorCause(data, fallback = '') {
  const pathsToTryAndGetErrorFrom = ['response.data.data', 'response.data', 'response', 'response.error', ''];

  for (let i = 0; i < pathsToTryAndGetErrorFrom.length; i++) {
    const path = pathsToTryAndGetErrorFrom[i];
    const val = path ? get(data, path) : data;

    if (!isNil(val)) {
      const errorCause = getCause(val);
      if (!isNil(errorCause)) {
        return errorCause;
      }
      // If cause does not exists return error type
      const errorType = getType(val);

      if (!isNil(errorType)) {
        return errorType;
      }
    }
  }

  return fallback;
}

export function getFontSizeAndUnit(string) {
  const stringValue = parseInt(replace(string, /[a-zA-Z\s]/g, ''), 10);
  const stringUnit = string.replace(stringValue, '').trim();
  return {
    size: stringValue,
    unit: stringUnit,
  };
}

export function setSearchQueryIdFromUserObject($user) {
  const queryId = `${$user.id || (Math.random() * Number.MAX_SAFE_INTEGER)}-${Date.now()}`;

  SessionStorage.setItem('queryId', queryId);

  return queryId;
}

export function getSearchFiltersApplied(query) {
  const excludeValues = Search.EXCLUDED_FILTER_VALUES;
  const filterKeys = Search.FILTER_KEYS;
  const appliedFilters = [];

  for (const key of filterKeys) {
    if (query[key]) {
      const queryValue = query[key].split(',');
      /**
       * We are calculating the number of filters that are applied on the search page.
       * However this excludes some filter values which are set as default.
       *
       * */

      if (key === 'numQuestions') {
        const minMax = query[key].split(',');
        const numQuestionsFilters = StringUtils.getNumQuestionsFromValue({ min: minMax[0], max: minMax[1] });

        numQuestionsFilters.forEach((text) => {
          appliedFilters.push({
            key,
            text,
          });
        });
      } else {
        queryValue.forEach((val) => {
          if (!excludeValues.includes(val)) {
            const filterConfig = values(Search.ALL_FILTERS).find((f) => hasKeyInArray(key, f));

            appliedFilters.push({
              key,
              text: filterConfig?.find((f) => f.val === val && f.key === key).text,
            });
          }
        });
      }
    }
  }

  return appliedFilters;
}

function hasKeyInArray(key, array) {
  return array.findIndex((el) => el.key === key) > -1;
}

/**
 * make any aside(sidebar) scrollable and sticky for both up or down scroll.
 * an element is required and an optional top offset can be provided
 * @param {DOMElement} el
 * @param {number} topOffset @default 0
 * @param {function} removeResizeListenerCallback
 * @param {function} removeScrollListenerCallback
 * @returns {function} removeListeners
 */

export function makeAsideStickyAndScrollable(el, topOffset = 0, removeResizeListenerCallback = () => {}, removeScrollListenerCallback = () => {}) {
  const aside = el;
  const startScroll = topOffset;
  let endScroll = window.innerHeight - aside.offsetHeight - 500;
  let currPos = window.scrollY;
  let screenHeight = window.innerHeight;
  let asideHeight = aside.offsetHeight;

  aside.style.top = `${startScroll}px`;

  window.addEventListener('resize', () => {
    screenHeight = window.innerHeight;
    asideHeight = aside.offsetHeight;
  });

  const handleScrollUp = (asideTop) => {
    if (asideTop < startScroll) {
      aside.style.top = `${asideTop + currPos - window.scrollY}px`;
    } else if (asideTop >= startScroll && asideTop !== startScroll) {
      aside.style.top = `${startScroll}px`;
    }
  };

  const handleScrollDown = (asideTop) => {
    if (asideTop > endScroll) {
      aside.style.top = `${asideTop + currPos - window.scrollY}px`;
    } else if (asideTop < (endScroll) && asideTop !== endScroll) {
      aside.style.top = `${endScroll}px`;
    }
  };

  window.addEventListener('scroll', () => {
    endScroll = window.innerHeight - aside.offsetHeight;
    const asideTop = parseInt(aside.style.top.replace('px;', ''), 10);
    // if aside's height is smaller than the current screenHeight,
    // no need to do change the scroll behaviour
    if (asideHeight <= screenHeight) {
      aside.style.top = `${startScroll}px`;
      currPos = window.scrollY;
      return;
    }
    // if side height is longer that the current screenHeight,
    // we need to change handle the scroll behaviour
    if (window.scrollY < currPos) {
      handleScrollUp(asideTop);
    } else {
      handleScrollDown(asideTop);
    }
    currPos = window.scrollY;
  }, {
    capture: true,
    passive: true,
  });
  return () => {
    window.removeEventListener('resize', removeResizeListenerCallback);
    window.removeEventListener('scroll', removeScrollListenerCallback);
  };
}

export function setStorageParamForHT($route) {
  if ($route.query.htq) {
    LocalStorage.setItem('htq', true);
  }
}

export function where(list, obj) {
  return list.filter((item) => {
    for (const key in obj) {
      if (item[key] !== obj[key]) {
        return false;
      }
    }
    return true;
  });
}

export function setQueryIdInUrl({
  $route, additionalQueryParams = {}, shouldReload = true, updateQuery = true,
}) {
  const queryId = SessionStorage.getItem('queryId');
  const urlData = UrlUtils.parse(window.location);
  const query = { ...(updateQuery && $route.query), ...additionalQueryParams, queryId };
  const newUrl = UrlUtils.toString({ urlData, query });

  if (shouldReload) {
    $route.replace(newUrl).catch((err) => {
      window.console.error(err);
    });
  } else {
    window.history.replaceState({}, null, newUrl);
  }
}

export function addQueryParam(route, additionalQueryParams = {}, shouldReload = true) {
  const urlData = UrlUtils.parse(window.location);
  const query = { ...route.query, ...additionalQueryParams };
  const newUrl = UrlUtils.toString({ urlData, query });

  if (shouldReload) {
    route.replace(newUrl).catch((err) => {
      window.console.error(err);
    });
  } else {
    window.history.replaceState({}, null, newUrl);
  }
}

export function removeQueryParams(route, params, shouldReload = false) {
  const query = { ...route.query };
  params.forEach((param) => {
    delete query[param];
  });

  const urlData = UrlUtils.parse(window.location);
  const newUrl = UrlUtils.toString({ urlData, query });

  if (shouldReload) {
    route.replace(newUrl).catch((err) => {
      window.console.error(err);
    });
  } else {
    window.history.replaceState({}, null, newUrl);
  }
}

export function addQueryParamToURL(path, query = {}) {
  return UrlUtils.toString({ urlData: { path }, query });
}

export function isContentByContactQuizizz(id) {
  const allowedId = ['54bfb753e4c9406112267056', '63e4afb8e12426001da14f02', '62f6580ddf189c001f3d40a6', '63ea022a626f0f001d3cbd5d'];
  return allowedId.includes(id);
}

export function removeInitialLoader() {
  const spinner = document.querySelector('#initial-loader-container');

  if (spinner) {
    spinner.style.display = 'none';
    spinner.remove();
  }
}

/**
 * returns the correct fullscreen handlers based on the vendor (browsers)
 * @returns {object} fullscreenProps
 */
export function getFullScreenProps() {
  if (document.fullscreenElement === null) {
    return {
      fullscreenchange: 'fullscreenchange',
      fullscreenElement: 'fullscreenElement',
      requestFullscreen: 'requestFullscreen',
      exitFullscreen: 'exitFullscreen',
    };
  } if (document.webkitFullscreenElement === null) {
    return {
      fullscreenchange: 'webkitfullscreenchange',
      fullscreenElement: 'webkitFullscreenElement',
      requestFullscreen: 'webkitRequestFullscreen',
      exitFullscreen: 'webkitExitFullscreen',
    };
  } if (document.mozFullscreenElement === null) {
    return {
      fullscreenchange: 'mozfullscreenchange',
      fullscreenElement: 'mozFullscreenElement',
      requestFullscreen: 'mozRequestFullscreen',
      exitFullscreen: 'mozExitFullscreen',
    };
  } if (document.msFullscreenElement === null) {
    return {
      fullscreenchange: 'msfullscreenchange',
      fullscreenElement: 'msFullscreenElement',
      requestFullscreen: 'msRequestFullscreen',
      exitFullscreen: 'msExitFullscreen',
    };
  } if (document.oFullscreenElement === null) {
    return {
      fullscreenchange: 'ofullscreenchange',
      fullscreenElement: 'oFullscreenElement',
      requestFullscreen: 'oRequestFullscreen',
      exitFullscreen: 'oExitFullscreen',
    };
  }
  return {
    fullscreenchange: 'fullscreenchange',
    fullscreenElement: 'fullscreenElement',
    requestFullscreen: 'requestFullscreen',
    exitFullscreen: 'exitFullscreen',
  };
}

export function getCountryFromCookie() {
  const country = CookieService.get('QUIZIZZ_DEBUG_COUNTRY');
  if (countryFromCode(country).length > 0) {
    return country;
  }
  return null;
}

export function getCurrentLanguageToUse(userPreferenceLanguage) {
  const urlParams = new URLSearchParams(window.location.search);
  const overrideLanguageFromParams = urlParams.get('lang');

  if (overrideLanguageFromParams) {
    const supportedTranslationLanguage = Constants.TranslatedLanguages.find((lang) => lang.code === overrideLanguageFromParams)?.code;
    if (supportedTranslationLanguage) {
      return supportedTranslationLanguage;
    }
  }

  if (userPreferenceLanguage) {
    const userPreferenedLangFromList = Constants.TranslatedLanguages.find((lang) => lang.code === userPreferenceLanguage)?.code;
    if (userPreferenedLangFromList) {
      return userPreferenedLangFromList;
    }
    return 'en';
  }

  const browserLanguage = navigator.language || navigator.userLanguage;

  const doubleLangCodes = ['zh-TW', 'zh-CN'];

  if (browserLanguage.includes('pt')) {
    return 'pt-br';
  }

  if (doubleLangCodes.includes(browserLanguage)) {
    return browserLanguage;
  }
  const langCode = Constants.TranslatedLanguages.find((lang) => lang.code === browserLanguage.substr(0, 2))?.code;
  if (langCode) {
    return langCode;
  }

  const locale = CookieService.get('locale');
  return locale || 'en';
}

export function PromiseWithTimeout(millis, promise) {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => reject('Timed out'), millis);
  });

  return Promise.race([
    promise,
    timeout,
  ]);
}

export function loadExternalScriptDynamically(url) {
  // Should only be called on the client
  return new Promise((resolve, reject) => {
    if (!isClient()) {
      reject({ success: false, msg: 'Should only run on the client!' });
      return;
    }
    const existingScript = document.getElementById(url);
    if (existingScript) {
      resolve({ success: true });
    } else {
      const script = document.createElement('script');
      script.src = url; // URL for the third-party library being loaded.
      script.id = url; // e.g., googleMaps or stripe
      document.body.appendChild(script);

      script.onload = () => {
        resolve({ success: true });
      };

      script.onerror = (err) => {
        reject(err);
      };
    }
  });
}

export function isBot(navigator, routeInstance) {
  // NOTE: use only on client side
  if (navigator) {
    const botPattern = '(googlebot/|bot|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)';
    const re = new RegExp(botPattern, 'i');
    const { userAgent } = navigator;
    if (re.test(userAgent) || routeInstance.query?.bot === 'true') {
      return true;
    }
  }
  return false;
}

export function isSafari(userAgent) {
  return userAgent.toLowerCase().includes('safari') && !userAgent.toLowerCase().includes('chrome');
}

export function objectIdToHexColor(objectId) {
  let hash = 0;
  for (let i = 0; i < objectId.substring(0, 8).length; i++) {
    hash = objectId.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += (`00${value.toString(16)}`).substr(-2);
  }
  return color;
}

export function getCouponFromUrlParam() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('coupon');
}

export function getQuantityFromUrlParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const quantity = urlParams.get('quantity');
  return quantity ? parseInt(quantity, 10) : 1;
}

export function isAllowedCountryForOrgPicker(country) {
  if (!country) {
    return false;
  }
  const allowedCountries = ['GB', 'AU', 'CA', 'SG', 'HK', 'AE'].includes(country);
  return allowedCountries;
}

export function SignUpOptionsHierarchy(country) {
  const featureFlagHelper = featureFlags();
  const shouldShowClasslinkSSO = featureFlagHelper.isEnabled(Constants.FeatureFlagsTypes.CLASSLINK_SSO);

  switch (country) {
    case 'US':
      return shouldShowClasslinkSSO
        ? ['google', 'email', 'classlink', 'microsoft', 'facebook', 'phone', 'apple']
        : ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'ID':
      return ['google', 'phone', 'email', 'facebook', 'microsoft', 'apple'];
    case 'TH':
      return ['google', 'phone', 'facebook', 'email', 'microsoft', 'apple'];
    case 'PH':
      return ['google', 'phone', 'facebook', 'email', 'microsoft', 'apple'];
    case 'IN':
      return ['google', 'phone', 'email', 'facebook', 'microsoft', 'apple'];
    case 'BR':
      return ['google', 'email', 'facebook', 'microsoft', 'phone', 'apple'];
    case 'VN':
      return ['google', 'email', 'facebook', 'microsoft', 'phone', 'apple'];
    case 'MY':
      return ['google', 'phone', 'email', 'facebook', 'microsoft', 'apple'];
    case 'MX':
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'PL':
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'ES':
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'KZ':
      return ['google', 'email', 'facebook', 'microsoft', 'phone', 'apple'];
    case 'CO':
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'PE':
      return ['google', 'email', 'facebook', 'microsoft', 'phone', 'apple'];
    case 'GB':
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'RU':
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'CA':
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'TR':
      return ['google', 'email', 'facebook', 'microsoft', 'phone', 'apple'];
    case 'AE':
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
    case 'UA':
      return ['google', 'email', 'facebook', 'microsoft', 'phone', 'apple'];
    default:
      return ['google', 'email', 'microsoft', 'facebook', 'phone', 'apple'];
  }
}

// DO NOT USE THIS FUNCTION. If its use is required, its a sign of code smell.
// This fucntion help delay a call, multiple dom updates.
// This would be needed when one emits call onther emit or a a call on event bus, which might or might not get copleted before the dom update, by delaying it more than 1 dom update, its a call that is better than saying 'setTimeout' for 100ms, which will still not give a good expectation. Here with 2 ticks, you can expect one emit and next resultant event bus emits are resolved by the time callback is called.
export function nextTickCallback(cb = () => {}, ticks = 1) {
  if (ticks === 0) {
    cb();
    return;
  }
  nextTick(() => {
    nextTickCallback(cb, ticks - 1);
  });
}

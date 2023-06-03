import isNumber from 'lodash/isNumber';

import pseudolocalize from '~/utils/pseudolocalize';
import { isPseudolocalizationEnabled } from '~/utils/EnvUtils';
import $store from './StoreService';
import ENGLISH_STRING_MAP from '../../translations/en.json';
import QLogger from './QLogger';

// TODO: UPDATE DB AND REMOVE THIS CONSTANT
const paramReplacementNumber = 192809182;

class Translator {
  static currentLanguageTranslations = {};

  constructor() {
    this.currentLanguage = 'en';
  }

  /**
   * Receives a string with placeholder params ( like {$1} ) and replaces them with the provided actual params
   * @returns {String} result -> Final string with replaced params
   */
  static substituteParameters(string, params) {
    if (!params) {
      return string;
    }

    let result = string;

    let i = 0;
    // regex to extract parameters (like {$1}, {$2}) from the string and replace them with the params
    const paramRegex = /(\{\$.*?\})/;

    // remove the constant from string and replace it with param placeholders
    const reverseParamRegex = new RegExp(paramReplacementNumber);
    let paramNumber = 0;
    while (reverseParamRegex.exec(result)) {
      result = result.replace(reverseParamRegex, `{$${paramNumber}}`);
      paramNumber += 1;
    }
    let matches = paramRegex.exec(result);
    while (matches) {
      if (params[i] === undefined) {
        result = result.replace(paramRegex, '');
      } else if (import.meta.env.VITE_NODE_ENV === 'dev') {
        result = result.replace(paramRegex, `[{${params[i]}}]`);
      } else {
        result = result.replace(paramRegex, params[i]);
      }

      i += 1;
      matches = paramRegex.exec(result);
    }
    // if (import.meta.env.VITE_ENV_API_EXP === 'dev') {
    //   const str = result.split('').join('\u0301');
    //   return `[${str} one]`;
    // }
    return result;
  }

  static translate(string, locale = 'en', values = [], maxLength) {
    // this is the maximum number of characters the particular string-UI element combination can take
    // before the design breaks

    let maximumStringLength = maxLength;
    if (maximumStringLength === undefined || maximumStringLength === 0) {
      maximumStringLength = -1;
    }

    if (isPseudolocalizationEnabled() && locale === 'en') {
      const str = pseudolocalize(string);
      return Translator.substituteParameters(str, values);
    }

    if (locale === 'en') {
      return Translator.substituteParameters(string, values);
    }

    let translations = {};
    let englishStringMap = {};

    try {
      translations = $store() ? $store().getters['root/translations'] : null;
      if (!translations) {
        return Translator.substituteParameters(string, values);
      }
      englishStringMap = ENGLISH_STRING_MAP;
    } catch (err) {
      QLogger.warn('Translation JSON files were not found ');

      return string;
    }

    // translate params if available
    const params = values.map((p) => {
      if (`${p}` in englishStringMap) {
        return translations[englishStringMap[p]];
      }
      return p;
    });

    let stringId = '';

    if (`${string}` in englishStringMap) {
      stringId = englishStringMap[`${string}`];
    } else {
      return Translator.substituteParameters(string, params);
    }

    if (stringId in translations) {
      return Translator.substituteParameters(translations[stringId], params);
    }

    return string;
  }

  // eslint-disable-next-line class-methods-use-this
  setCurrentLanguageTransalations(translations) {
    Translator.currentLanguageTranslations = translations;
  }

  // eslint-disable-next-line class-methods-use-this
  getTranslation(key, values, maxLength) {
    const stringifiedKey = String(key); // force conversion to string in case of numbers or .includes won't work
    const currentLocale = this.currentLanguage;
    let valuesToUse = values;
    let maxLengthToUse = maxLength;

    if (!isNumber(maxLength) && isNumber(values)) {
      maxLengthToUse = values;
      valuesToUse = [];
    }

    return Translator.translate(
      stringifiedKey,
      currentLocale,
      valuesToUse,
      maxLengthToUse,
    );
  }

  setCurrentLanguage(lang) {
    QLogger.invariant(
      !!lang,
      `Translator: invalid language '${lang}' provided to setCurrentLanguage`,
    );
    try {
      this.currentLanguage = lang;
    } catch (error) {
      // eslint-disable-next-line no-console
      QLogger.error(error);
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

export const translator = new Translator();
const i18n = translator.getTranslation.bind(translator);

export default i18n;

import isFunction from 'lodash/isFunction';

import { FontsWithFontFaces } from '~/config/Fonts.js';
import $store from './StoreService.js';

export default class FontService {
  static loadFont(url) {
    try {
      const linkElement = window.document.createElement('link');
      linkElement.href = url;
      linkElement.rel = 'preload';
      linkElement.as = 'style';
      linkElement.onload = "this.onload=null;this.rel='stylesheet'";

      linkElement.rel = 'stylesheet';
      const headElement = window.document.head;
      headElement.appendChild(linkElement);
      if (!$store().getters.isFontLoaded(url)) {
        $store().dispatch('root/pushFont', url);
      }
    } catch (error) {

    }
  }

  static loadOpenSansManually() {
    const fontStyleEl = document.createElement('style');
    document.head.appendChild(fontStyleEl);

    const stylesheet = fontStyleEl.sheet;
    stylesheet.insertRule('@font-face { font-family: "Open Sans"; font-display: swap; src: url(https://cf.quizizz.com/fonts/OpenSans/OpenSans-Regular.ttf); font-weight: 400; } ', 0);
    stylesheet.insertRule('@font-face { font-family: "Open Sans"; font-display: swap; src: url(https://cf.quizizz.com/fonts/OpenSans/OpenSans-SemiBold.ttf); font-weight: 600; } ', 1);
    stylesheet.insertRule('@font-face { font-family: "Open Sans"; font-display: swap; src: url(https://cf.quizizz.com/fonts/OpenSans/OpenSans-Bold.ttf); font-weight: bold; } ', 2);
    stylesheet.insertRule('@font-face { font-family: "Open Sans"; font-display: swap; src: url(https://cf.quizizz.com/fonts/OpenSans/OpenSans-ExtraBold.ttf); font-weight: 800; } ', 3);
    stylesheet.insertRule('@font-face { font-family: "Open Sans"; font-display: swap; src: url(https://cf.quizizz.com/fonts/OpenSans/OpenSans-Italic.ttf); font-style: italic; } ', 4);
    stylesheet.insertRule('@font-face { font-family: "Open Sans"; font-display: swap; src: url(https://cf.quizizz.com/fonts/OpenSans/OpenSans-SemiBoldItalic.ttf); font-style: italic; font-weight: 600; } ', 5);
    stylesheet.insertRule('@font-face { font-family: "Open Sans"; font-display: swap; src: url(https://cf.quizizz.com/fonts/OpenSans/OpenSans-ExtraBoldItalic.ttf); font-style: italic; font-weight: 800; } ', 6);
    stylesheet.insertRule('@font-face { font-family: "Open Sans"; font-display: swap; src: url(https://cf.quizizz.com/fonts/OpenSans/OpenSans-Light.ttf); font-weight: 100; } ', 7);
  }

  static checkIfCanAccessGoogleCDN() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onerror = (err) => reject(err);
      xhr.ontimeout = () => reject('Request timed out');
      xhr.onload = (ev) => {
        if (ev.target.status !== 200) {
          reject('Request failed');
        } else {
          resolve();
        }
      };

      xhr.open('GET', FontsWithFontFaces.OpenSans.googleCDN);
      xhr.send();
    });
  }

  static async loadOpenSans() {
    try {
      await FontService.checkIfCanAccessGoogleCDN();
      FontService.loadFont(FontsWithFontFaces.OpenSans.googleCDN);
    } catch (error) {
      if (isFunction(window.FontFace)) {
        const fonts = FontsWithFontFaces.OpenSans.fontfaces();
        const fontsPromises = fonts.map((font) => font.load());

        Promise.all(fontsPromises).then(() => {
          fonts.forEach((font) => {
            document.fonts.add(font);
          });
        }).catch(() => {
          FontService.loadOpenSansManually();
        });
      }
    }
  }
}

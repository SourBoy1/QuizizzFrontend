import compact from 'lodash/compact';
import keys from 'lodash/keys';
import sluggify from 'slug';

import Constants from '~/config/Constants';

export default class UrlUtils {
  static isValidURL(value) {
    const isValidUrl = /^(?:(?:(?:https?|ftp):)\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00A1-\uFFFF0-9]-*)*[a-z\u00A1-\uFFFF0-9]+)(?:\.(?:[a-z\u00A1-\uFFFF0-9]-*)*[a-z\u00A1-\uFFFF0-9]+)*(?:\.(?:[a-z\u00A1-\uFFFF]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return isValidUrl.test(value);
  }

  static isRelativeUrl(value) {
    return value.indexOf('/') === 0 && value.indexOf('//') !== 0;
  }

  static isQuizizzUrl(value) {
    const url = /^(https?:\/\/(.+?\.)?(quizizz\.com|(localhost(:\d{1,5})?))((\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?)$)/i;
    return url.test(value);
  }

  static isValidPathForGoogleClientTranslation(path) {
    return Constants.allowedPathsForGoogleClientTranslation.find((pathRegex) => pathRegex.test(path));
  }

  static parse(url) {
    const data = { query: {}, hash: [] };
    const a = document.createElement('a');
    a.href = url;
    data.protocol = a.protocol;
    data.host = a.host;
    data.path = a.pathname;
    const pathEls = data.path.split('/');
    data.baseName = pathEls[pathEls.length - 1];
    data.extension = /(\.[a-zA-Z]+)/g.exec(data.baseName);
    data.extension = Array.isArray(data.extension)
      ? data.extension[0].replace('.', '')
      : '';

    const query = a.search.replace('?', '');
    const hash = a.hash.replace('#', '');
    const keys = compact(query.split('&'));

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i].split('=')[0];
      const value = keys[i].split('=')[1];

      data.query[key] = value;
    }

    const hashes = compact(hash.split(','));

    for (let i = 0; i < hashes.length; i++) {
      data.hash.push(hashes[i]);
    }

    return data;
  }

  static toSlug(value) {
    // eslint-disable-next-line no-control-regex
    if (/[^\u0000-\u00FF]/.test(value)) {
      return this.slugify(value);
    }
    return sluggify(value);
  }

  static slugify(value) {
    const text = value.toString().toLowerCase().trim();
    return text
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '-') // remove special characters
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  static toString({ query, urlData, hash = [] }) {
    let queryString = '';
    const queryKeys = keys(query);

    for (let i = 0; i < queryKeys.length; i++) {
      queryString += `${(i > 0 ? '&' : '') + queryKeys[i]}=${query[queryKeys[i]]}`;
    }

    return urlData.path + (queryKeys.length > 0 ? '?' : '') + queryString + (hash.length > 0 ? '#' : '') + hash.join(',');
  }

  // append without reloading or resetting page scroll
  static appendQueryParamToPath(path, params = {}) {
    history.replaceState(
      {},
      null,
      path
      + (Object.keys(params).length !== 0 ? '?' : '')
      + Object.keys(params)
        .map((key) => (
          `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        ))
        .join('&'),
    );
  }
}

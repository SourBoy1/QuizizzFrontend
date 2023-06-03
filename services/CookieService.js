import { isClient } from '~/utils/EnvUtils';

export default class CookieService {
  static get(name) {
    if (!isClient()) {
      return;
    }
    const cookies = [];
    document.cookie.split(';').forEach((el) => {
      const [k, v] = el.split('=');
      cookies[k.trim()] = v;
    });
    return cookies[name];
  }

  static getFromRequest(name, req) {
    if (!req.headers?.cookie) {
      return null;
    }
    // added support for getting cookies from request for ssr usecase
    const cookies = [];
    req.headers.cookie.split(';').forEach((el) => {
      const [k, v] = el.split('=');
      cookies[k.trim()] = v;
    });
    return cookies[name];
  }

  static set(expiresInSeconds, name, value) {
    if (!isClient()) {
      return;
    }
    let d = new Date();
    d = new Date(d.getTime() + 1000 * expiresInSeconds);
    const str = `${name} = ${value}; expires=' + ${d.toGMTString()}; path=/;`;
    document.cookie = str;
  }
}

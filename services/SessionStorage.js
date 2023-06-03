/* eslint-disable no-console */
import isFunction from 'lodash/isFunction';
import defaults from 'lodash/defaults';
import { isServer } from '~/utils/EnvUtils';

import Constants from '../config/Constants';
import { isThisIsBrowserEnvironment } from '../utils/EnvironmentHelpers';

class SessionStorage {
  constructor() {
    this.windowStorage = {};

    if (isThisIsBrowserEnvironment()) {
      this.windowStorage = window.sessionStorage;
    }
  }

  isPresent() {
    if (isServer()) {
      return;
    }
    return !!(this.windowStorage && isFunction(this.windowStorage.getItem) && isFunction(this.windowStorage.setItem));
  }

  key(index) {
    return this.windowStorage.key(index);
  }

  /**
   * Gets the item from local storage
   * @param {*} key
   * @param {Object} [options={}]
   * @param {boolean} [options.parseFromJSON=true] - Whether to parse the value from sessionstorage as JSON
   * @param { boolean } [ options.removeItemOnError = true ] - If there is an error then whether to remove the item
   * @returns {*} value from local storage
   * @memberof SessionStorage
   */
  getItem(key, options = {}) {
    if (isServer()) {
      return;
    }
    const defaultedOptions = defaults(options, {
      parseFromJSON: true,
      removeItemOnError: false,
    });

    try {
      const val = this.windowStorage.getItem(key);
      if (!defaultedOptions.parseFromJSON) {
        return val;
      }

      return JSON.parse(val);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV !== Constants.NodeEnvs.PROD) {
        console.error(`Error at SessionStorage "getItem": for key(${key})`, error);
      }

      if (defaultedOptions.removeItemOnError) {
        this.removeItem(key);
      }
    }
  }

  /**
   * Sets the item in sessionstorage
   * @param {string} key
   * @param {*} value
   * @param {Object} [options={}]
   * @param {Object} [options.storeAsJSON=true] - When storing the value will be stringfied
   * @returns
   * @memberof SessionStorage
   */
  setItem(key, value, options = {}) {
    if (isServer()) {
      return;
    }
    const defaultedOptions = defaults(options, {
      storeAsJSON: true,
    });

    try {
      const valToStore = defaultedOptions.storeAsJSON ? JSON.stringify(value) : value;
      return this.windowStorage.setItem(key, valToStore);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV !== Constants.NodeEnvs.PROD) {
        console.error(`Error at SessionStorage "setItem": for key(${key}) and value - `, error);
      }
    }
  }

  removeItem(key) {
    return this.windowStorage.removeItem(key);
  }

  clear() {
    return this.windowStorage.clear();
  }
}

export default new SessionStorage();

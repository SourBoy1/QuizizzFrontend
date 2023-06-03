/* eslint-disable no-param-reassign */
import { App } from 'vue';

import axios, { AxiosStatic } from 'axios';

import CookieService from '~/services/CookieService';
import LocalStorage from '~/services/LocalStorage';
import BaseURLS from '~/config/BaseURLs';
import { getEnvironmentEnv, isProd } from '~/utils/EnvUtils';
import store from '~/store';
import qs from 'qs';
import QLogger from '~/services/QLogger';

// utils

function generateHexString(size: number) {
  return [...Array(size * 2)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

// interceptors
function addAuthInterceptors(axios: AxiosStatic) {
  axios.interceptors.request.use(
    (config) => {
      const hostName = new URL(config.url || '', BaseURLS.API_SERVER[getEnvironmentEnv()]).hostname;
      if (BaseURLS.SPECIAL_HOSTNAME[getEnvironmentEnv()].findIndex((h) => hostName.includes(h)) >= 0) {
        config.withCredentials = false;
        return config;
      }
      config.withCredentials = true;
      const authCookie = CookieService.get('dev_sid');
      if (authCookie) {
        config.headers['x-auth-sessionid'] = authCookie;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
}

function addRequestContextTokenInterceptors(axios: AxiosStatic) {
  axios.interceptors.response.use(
    (response) => {
      const xRequestContextToken = response.headers['x-q-request-context-token'];
      if (xRequestContextToken) {
        LocalStorage.setItem(
          'x-q-request-context-token',
          xRequestContextToken,
          { storeAsJSON: false },
        );
      }
      return response;
    },
    (error) => Promise.reject(error),
  );

  axios.interceptors.request.use(
    (config) => {
      const hostName = new URL(config.url || '', BaseURLS.API_SERVER[getEnvironmentEnv()]).hostname;
      if (BaseURLS.SPECIAL_HOSTNAME[getEnvironmentEnv()].findIndex((h) => hostName.includes(h)) >= 0) {
        config.withCredentials = false;
        return config;
      }
      config.withCredentials = true;
      const xRequestContextToken = LocalStorage.getItem(
        'x-q-request-context-token',
        { parseFromJSON: false, removeItemOnError: false },
      );
      if (xRequestContextToken) {
        config.headers['x-q-request-context-token'] = xRequestContextToken;
      }
      config.headers['x-q-traceid'] = generateHexString(16);
      return config;
    },
    (error) => Promise.reject(error),
  );
}

// call this to add common headers for prod and dev. if not needed, we will delete this
function addRequestInterceptors(axios: AxiosStatic) {
  axios.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
  );
}

// call this to add common headers for prod and dev
function addResponseInterceptors(axios: AxiosStatic) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      QLogger.log('log error in response', error);
      // add sentry logger here
      return Promise.reject(error);
    },
  );
}

export function updateURLs() {
  if (store.getters['root/serverData'].bypassRateLimiterKey) {
    axios.defaults.params = {
      bypassRateLimiterKey: store.getters['root/serverData'].bypassRateLimiterKey,
    };
  }
  axios.defaults.baseURL = store.getters['root/serverData'].fullAPIPrefix || BaseURLS.API_SERVER[getEnvironmentEnv()];
  axios.defaults.mediaServiceURL = BaseURLS.MEDIA_SERVICE[getEnvironmentEnv()];
}

// plugin

export default {
  install: (app: App<Element>) => {
    // TODO: write a util to add baseURL
    axios.defaults.baseURL = isProd()
      ? 'https://quizizz.com'
      : 'https://dev.quizizz.com/';
    axios.defaults.paramsSerializer = (params) => {
      if (typeof params === 'object') {
        if (params.disabledSerialization) {
          return qs.stringify(params, { encode: false });
        }
        const keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = params[key];
          if (typeof value === 'object') {
            params[key] = JSON.stringify(value);
          }
        }
      }
      return qs.stringify(params, { encode: true });
    };

    addRequestContextTokenInterceptors(axios);

    if (!isProd()) {
      axios.defaults.baseURL = BaseURLS.API_SERVER[getEnvironmentEnv()];
      axios.defaults.mediaServiceURL = BaseURLS.MEDIA_SERVICE[getEnvironmentEnv()];
      addAuthInterceptors(axios);
      return;
    }

    addResponseInterceptors(axios);
    app.config.globalProperties.$axios = axios;
  },
};

export { axios };

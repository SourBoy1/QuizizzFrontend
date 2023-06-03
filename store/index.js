import { createStore } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';

import EventBus from '~/services/EventBus';
import $store from '~/services/StoreService.js';
import { getEnvironmentEnv } from '~/utils/EnvUtils';
import Constants from '~/config/Constants';
import BootService from '~/services/apis/BootService';
import { computeUserAccessLevel } from '~/utils/UserUtils';
import contentLogger from '~/utils/contentLogger';
import MutationTypes from '../config/MutationTypes';
import AllPlugins from '../utils/StorePlugins';
import {
  getCountryFromCookie, getCurrentDeviceProperties, getCurrentLanguageToUse, removeInitialLoader,
} from '../utils/Utilities';
import EventLoggerService from '../services/EventLoggerService.js';
import { getLoggerInitDetails, getEventsInBuffer, putEventsInBuffer } from '../utils/EventLoggerUtils.js';
import CookieService from '../services/CookieService';

import constants from '../config/Constants';

// store modules
import analyticsManagerStore from './analyticsManager';
import authStore from './Auth';
import classesStore from './classes';
import clipboardStore from './clipboard';
import contentEditorStore from './contentEditor';
import currentQuizStore from './currentQuiz';
import currentUserStore from './currentUser';
import orgDashboard from './orgDashboard';
import paperModeRoster from './paperModeRoster';
import productStore from './products';
import referralsStore from './referrals';
import salesStore from './sales';
import searchState from './searchState';
import searchSuggestions from './searchSuggestions';
import sharedLibrary from './sharedLibrary';
import slideEditor from './slideEditor';
import teamStore from './teams';
import uiManagerStore from './uiManager';
import onboardingTooltipStore from './onboardingTooltip';

export const plugins = AllPlugins;

export const state = () => ({
  user: {},
  userAccessLevel: Constants.AccountTypes.ANONYMOUS,
  serverData: {},
  toasts: [],
  snackbars: [],
  loadedFonts: [],
  deviceProps: {},
  deviceInfo: {},
  isInitiatedOnClient: false,
  unreadNotificationCount: 0,
  translations: {},
  isGoogleWidgetTranslated: false,
  googleWebsiteTranslatedLanguage: null,
  ui: {
    hasTopBanner: false,
  },
  gameStartSource: '',
  lifecycleData: {},
  helpButton: {
    theme: 'light',
    show: true,
    zIndex: 9,
    offset: {
      x: 0,
      y: 0,
    },
  },
  grapher: null,
  features: {},
});

export const getters = {
  serverData(state) {
    return state.serverData;
  },

  gameStartSource(state) {
    return state.gameStartSource;
  },

  toasts(state) {
    return state.toasts;
  },
  snackbars(state) {
    return state.snackbars;
  },
  isFontLoaded: (state) => (font) => state.loadedFonts.includes(font),
  deviceProps(state) {
    return state.deviceProps;
  },
  unreadNotificationCount(state) {
    return state.unreadNotificationCount;
  },
  isMobile(state) {
    return state.deviceProps.type === Constants.DeviceTypes.PHONE;
  },
  isTablet(state) {
    return state.deviceProps.type === Constants.DeviceTypes.TABLET;
  },
  isDesktop(state) {
    return state.deviceProps.type === Constants.DeviceTypes.DESKTOP;
  },
  deviceInfo(state) {
    return state.deviceInfo;
  },
  user(state) {
    return state.user;
  },
  userAccessLevel: (state) => state.userAccessLevel,
  currentLanguage(state) {
    return state.deviceInfo.locale;
  },
  isNewMobileAuthFlow(state) {
    return Constants.MobileNumberAuthEnabledCountries.includes(state.serverData?.requestCountry);
  },

  translations(state) {
    return state.translations;
  },

  isGoogleWidgetTranslated(state) {
    return state.isGoogleWidgetTranslated;
  },

  googleWebsiteTranslatedLanguage(state) {
    return state.googleWebsiteTranslatedLanguage;
  },

  hasTopBanner(state) {
    return state.ui.hasTopBanner;
  },

  lifecycleData(state) {
    return state.lifecycleData;
  },

  helpButtonOffset(state) {
    return state.helpButton.offset;
  },

  shouldShowHelpButton(state) {
    return state.helpButton.show;
  },

  helpButtonTheme(state) {
    return state.helpButton.theme;
  },

  helpButtonZIndex(state) {
    return state.helpButton.zIndex;
  },

  getGrapher(state) {
    return state.grapher;
  },
};

export const mutations = {
  user(state, user) {
    if (user && state.user && user.occupation !== state.user.occupation) {
      EventBus.$emit('userSet', { user, store: $store() });
    }
    state.user = user;
  },
  serverData(state, serverData) {
    state.serverData = { ...state.serverData, ...serverData };
  },
  pushToast(state, options) {
    state.toasts.push(options);
  },
  pushSnackbar(state, options) {
    state.snackbars.push(options);
  },
  shiftToast(state) {
    state.toasts.shift();
  },
  removeSnackbar(state, _id) {
    const filteredState = state.snackbars.filter((s) => s._id !== _id);
    state.snackbars = filteredState;
  },
  updateSnackbar(state, options) {
    state.snackbars.map((i) => {
      if (i.id === options.id) {
        return options;
      }
      return i;
    });
  },
  pushFont(state, font) {
    state.loadedFonts.push(font);
  },
  setUnreadNotificationCount(state, value) {
    state.unreadNotificationCount = value;
  },
  setUserAccessLevel(state, value) {
    state.userAccessLevel = value;
  },

  setTranslations(state, value) {
    state.translations = value;
  },

  handleToggleUITopBanner(state, value) {
    state.ui.hasTopBanner = value;
  },

  [MutationTypes.game.SET_GAME_SOURCE](state, value) {
    state.gameStartSource = value || '';
  },
  setUserSubjects(state, value) {
    state.user.subject_tags = value;
  },
  setUserGrades(state, value) {
    state.user.grades = value;
  },
  setUserQuizRecentSubject(state, value) {
    state.user.contentPreferences.subjects.mostRecent = value;
  },
  setUserQuizRecentGrade(state, value) {
    state.user.contentPreferences.grades.mostRecent = value;
  },

  [MutationTypes.DO_CLIENT_INITIATION](state, payload) {
    state.isInitiatedOnClient = true;
  },
  [MutationTypes.SET_DEVICE_PROPERTIES](state, payload) {
    if (!isEmpty(payload.deviceProps)) {
      state.deviceProps = payload.deviceProps;
    }
  },
  [MutationTypes.SET_DEVICE_INFO](state, payload) {
    if (!isEmpty(payload.deviceInfo)) {
      state.deviceInfo = payload.deviceInfo;
    }
  },
  [MutationTypes.SET_USER](state, user) {
    if (!isEmpty(user)) {
      state.user = user;
    }
  },

  [MutationTypes.SET_GOOGLE_WIDGET_TRANSLATION_STATE](state, isTranslated) {
    state.isGoogleWidgetTranslated = isTranslated;
  },

  [MutationTypes.SET_GOOGLE_WIDGET_LANGUAGE](state, langCode) {
    state.googleWebsiteTranslatedLanguage = langCode;
  },

  [MutationTypes.SET_USER_REGION](state, region = null) {
    state.serverData.region = region;
  },

  setLifecycleData(state, value) {
    state.lifecycleData = value;
  },

  [MutationTypes.SET_HELP_BUTTON_OFFSET](state, value) {
    Object.assign(state.helpButton.offset, value);
  },

  [MutationTypes.SET_HELP_BUTTON_SHOW](state, value) {
    state.helpButton.show = value;
  },

  [MutationTypes.SET_HELP_BUTTON_THEME](state, value) {
    state.helpButton.theme = value;
  },

  [MutationTypes.SET_HELP_BUTTON_ZINDEX](state, value) {
    state.helpButton.zIndex = value;
  },

  [MutationTypes.SET_GRAPHER](state, val) {
    state.grapher = val;
  },

  [MutationTypes.SET_FEATURES](state, val) {
    state.features = val;
  },
};

export const actions = {
  nuxtServerInit({ commit, dispatch }, { req }) {
    if (req.serverData) { commit('serverData', req.serverData); }

    dispatch('setDeviceInfoFromServer', { req });

    if (req.serverData?.user) {
      commit('user', req.serverData.user);
    } else if (req.user) {
      commit('user', req.user);
    }
  },
  localClientInit({ dispatch, commit }) {
    removeInitialLoader();
    // eslint-disable-next-line no-prototype-builtins
    if (!Array.prototype.hasOwnProperty('flat')) {
      // eslint-disable-next-line no-extend-native
      Object.defineProperty(Array.prototype, 'flat', {
        value(depth = 1) {
          return this.reduce((flat, toFlatten) => flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten), []);
        },
      });
    }
    // load user info before haulting the store initialization else user=object plugin breaks

    if (window.serverData) {
      commit('serverData', window.serverData);
    } else if (getEnvironmentEnv() !== Constants.NodeEnvs.PROD) {
      dispatch('getRenderMetaData');
    }

    commit(MutationTypes.DO_CLIENT_INITIATION);
    dispatch('setDeviceProperties');
    dispatch('setDeviceInfoFromClient');
    const loggerInitDetails = getLoggerInitDetails();
    EventLoggerService.init(loggerInitDetails.modelDetails, getEventsInBuffer, putEventsInBuffer);
    /**
     * Following code is used to attach window events. Since there is no single nuxt component
     * which can be the root of all pages being rendered we need to handle all these events inside
     * the store itself. So following things are handled here
     * 1. Attach window resize event and then update deviceProps
     * 2. Determine if the current device being used is a touch device or not
     */
    const onWindowResizeDebounced = debounce(() => {
      dispatch('setDeviceProperties');
    }, 100, { maxWait: 500 });
    const onFirstTouchWrapperInstance = () => {
      dispatch('setDeviceProperties', { isFirstTouch: true });
      window.removeEventListener('touchstart', onFirstTouchWrapperInstance, { passive: false });
    };
    window.addEventListener('resize', onWindowResizeDebounced);
    window.addEventListener('touchstart', onFirstTouchWrapperInstance, { passive: false });
    // Adding serverData and user if rendered from CDN

    dispatch('createGlobalFunctions');
  },
  async getRenderMetaData({ commit }) {
    const data = await BootService.getMetadata();
    const country = getCountryFromCookie();
    if (country) {
      data.requestCountry = country;
    }
    if (data) {
      commit('serverData', data);
    }
  },

  createGlobalFunctions() {
    BootService.createGlobalFunctions();
  },

  setUser({ commit }, user) {
    commit('user', user);
  },
  setUserSubjects({ commit }, value) {
    commit('setUserSubjects', value);
  },
  setUserGrades({ commit }, value) {
    commit('setUserGrades', value);
  },
  setUserQuizRecentSubject({ commit }, value) {
    commit('setUserQuizRecentSubject', value);
  },
  setUserQuizRecentGrade({ commit }, value) {
    commit('setUserQuizRecentGrade', value);
  },
  updateUserAccessLevel({ commit }, user) {
    const userAccessLevel = computeUserAccessLevel(user);
    commit('setUserAccessLevel', userAccessLevel);
  },
  pushToast({ commit }, options) {
    commit('pushToast', options);
  },
  pushSnackbar({ commit }, options) {
    commit('pushSnackbar', options);
  },
  shiftToast({ commit }) {
    commit('shiftToast');
  },
  removeSnackbar({ commit }, id) {
    commit('removeSnackbar', id);
  },
  updateSnackbar({ commit }, options) {
    commit('updateSnackbar', options);
  },
  pushFont({ commit }, font) {
    commit('pushFont', font);
  },
  setUnreadNotificationCount({ commit }, value) {
    commit('setUnreadNotificationCount', value);
  },
  setDeviceProperties({ commit, state }, { isFirstTouch = false } = {}) {
    const prevDeviceProperties = state.deviceProps;
    const currentDevicePropertes = getCurrentDeviceProperties(prevDeviceProperties, isFirstTouch);
    commit(MutationTypes.SET_DEVICE_PROPERTIES, { deviceProps: currentDevicePropertes });
  },
  setDeviceInfoFromServer({ commit }, { req }) {
    commit(MutationTypes.SET_DEVICE_INFO, {
      deviceInfo: {
        userAgent: req.headers['user-agent'] || '',
        // TODO #migration check host
        host: req.headers?.host || '',
        quizizzUID: CookieService.getFromRequest('quizizz_uid', req) || '',
        experimentSlot: CookieService.getFromRequest('QUIZIZZ_EXP_SLOT', req) || '',
        experimentName: CookieService.getFromRequest('QUIZIZZ_EXP_NAME ', req) || '',
        locale: CookieService.getFromRequest('locale ', req) || '',
      },
    });
  },
  setDeviceInfoFromClient({ commit }) {
    const locale = getCurrentLanguageToUse(window.serverData?.user?.preferences?.lang);

    commit(MutationTypes.SET_DEVICE_INFO, {
      deviceInfo: {
        userAgent: window.navigator.userAgent || '',
        quizizzUID: CookieService.get('quizizz_uid'),
        experimentSlot: CookieService.get('QUIZIZZ_EXP_SLOT'),
        experimentName: CookieService.get('QUIZIZZ_EXP_NAME'),
        locale,
        host: window.location.host || '',
      },
    });
  },
  setGoogleWidgetTranslationState({ commit }, { status, langCode }) {
    commit(MutationTypes.SET_GOOGLE_WIDGET_TRANSLATION_STATE, status);
    // Retain language code in case user wants to toggle translation state
    if (langCode) {
      commit(MutationTypes.SET_GOOGLE_WIDGET_LANGUAGE, langCode);
    }
  },

  toggleUITopBanner({ commit }, value) {
    commit('handleToggleUITopBanner', value);
  },

  setGameSource({ commit }, value) {
    commit(MutationTypes.game.SET_GAME_SOURCE, value);
  },

  setUserRegion({ commit }, region) {
    commit(MutationTypes.SET_USER_REGION, region);
  },

  setLifecycleData({ commit }, value) {
    commit('setLifecycleData', value);
  },

  setHelpButtonOffset({ commit }, value) {
    commit(MutationTypes.SET_HELP_BUTTON_OFFSET, value);
  },

  showHelpButton({ commit }) {
    commit(MutationTypes.SET_HELP_BUTTON_SHOW, true);
  },

  hideHelpButton({ commit }) {
    commit(MutationTypes.SET_HELP_BUTTON_SHOW, false);
  },

  setHelpButtonTheme({ commit }, value) {
    commit(MutationTypes.SET_HELP_BUTTON_THEME, value);
  },

  setHelpButtonZIndex({ commit }, value) {
    commit(MutationTypes.SET_HELP_BUTTON_ZINDEX, value);
  },

  setGrapher({ commit }, val) {
    commit(MutationTypes.SET_GRAPHER, val);
  },

  setFeature({ commit }, val) {
    commit(MutationTypes.SET_FEATURES, val);
  },
};

export const strict = getEnvironmentEnv() === Constants.NodeEnvs.DEV || getEnvironmentEnv() === Constants.NodeEnvs.LOCAL;

let storeReady = false;

const store = createStore({
  modules: {
    root: {
      namespaced: true, state, getters, mutations, actions,
    },
    analyticsManager: { namespaced: true, ...analyticsManagerStore },
    Auth: { namespaced: true, ...authStore },
    classes: { namespaced: true, ...classesStore },
    clipboard: { namespaced: true, ...clipboardStore },
    contentEditor: { namespaced: true, ...contentEditorStore },
    currentQuiz: { namespaced: true, ...currentQuizStore },
    currentUser: { namespaced: true, ...currentUserStore },
    orgDashboard: { namespaced: true, ...orgDashboard },
    paperModeRoster: { namespaced: true, ...paperModeRoster },
    products: { namespaced: true, ...productStore },
    referrals: { namespaced: true, ...referralsStore },
    sales: { namespaced: true, ...salesStore },
    searchState: { namespaced: true, ...searchState },
    searchSuggestions: { namespaced: true, ...searchSuggestions },
    sharedLibrary: { namespaced: true, ...sharedLibrary },
    slideEditor: { namespaced: true, ...slideEditor },
    teams: { namespaced: true, ...teamStore },
    uiManager: { namespaced: true, ...uiManagerStore },
    onboardingTooltip: { namespaced: true, ...onboardingTooltipStore },
  },
  plugins: AllPlugins,
  strict,
});

store.$constants = constants;

storeReady = true;

export default store;
export { storeReady };

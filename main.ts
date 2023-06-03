import { createApp } from 'vue';
import { createHead, VueHeadMixin } from '@unhead/vue';
import * as Sentry from '@sentry/vue';
import VueGtag from 'vue-gtag';
import VueScrollTo from 'vue-scrollto';
import FloatingVue from 'floating-vue';
import VueLazyLoad from 'vue3-lazyload';
import PortalVue from 'portal-vue';
import dayjs from 'dayjs';
import VueConfetti from 'vue-confetti';
import App from './App.vue';

import './style.css';
import './assets/css/tailwind.css';
import './assets/css/katex.css';
import './assets/css/global.css';
import './assets/scss/tooltip-themes.scss';
import './assets/css/fontawesome.all.min.css';
import 'floating-vue/dist/style.css';

import store from './store/index';
import UserPlugin from './plugins/UserPlugin';
import EventBusPlugin from './plugins/EventBusPlugin';
import AxiosPlugin, { updateURLs } from './plugins/AxiosPlugin';
import UtilitiesPlugin from './plugins/UtilitiesPlugin';
import BrazePlugin from './plugins/BrazePlugin';
import clickOutsidePlugin from './plugins/v-click-outside';
import vOnboardTooltip from './plugins/v-onboard-tip';
import vAutoPositionPlugin from './plugins/AutoPosition';

// services
import getRouter from './services/router';
import $axios from './services/AxiosService';
import AuthService from './services/apis/AuthService';
import EventBus from './services/EventBus';
import { isSentryEnabled } from './utils/EnvUtils';
import Constants from './config/Constants';
import { getCurrentLanguageToUse } from './utils/Utilities';
import { translator } from './services/i18n';
import coreWebVitalService from './services/coreWebVitalService';

const app = createApp(App);
const router = getRouter(app);

if (isSentryEnabled()) {
  Sentry.init({
    app,
    dsn: 'https://f4055af1be6347b5a3b645683a6b50ff@o984659.ingest.sentry.io/4505148554412032',
    // integrations: [
    //   new Sentry.BrowserTracing({
    //     routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    //   }),
    // ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.01,
    sampleRate: 1,
    ignoreErrors: ['Network request failed', 'Failed to fetch', 'NetworkError'],
    beforeBreadcrumb: (breadcrumb) => {
      const ignoreCrumbs = ['console', 'dom', 'xhr', 'fetch', 'beacon', 'history', 'navigation'];
      return ignoreCrumbs.includes(breadcrumb.category || '') ? null : breadcrumb;
    },
    autoSessionTracking: false,
    maxBreadcrumbs: 30,
  });
}

// seo enablement
const head = createHead();
app.mixin(VueHeadMixin);
app.use(head);
app.use(store);
app.use(EventBusPlugin);
app.use(AxiosPlugin);
app.use(UtilitiesPlugin);
app.use(VueGtag, {
  includes: [
    { id: 'UA-118650281-1' },
  ],
  config: {
    id: 'G-NYFWYHHSPY',
  },
});

// directives
app.use(VueLazyLoad, {
  loading: 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png',
  error: 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png',
});
app.use(FloatingVue, {
  themes: {
    'error-tooltip': {
      triggers: ['hover'],
    },
    'info-tooltip': {
      triggers: ['hover'],
    },
    'mystic-peak-tooltip': {
      triggers: ['hover'],
    },
    'info-popper': {
      triggers: ['hover'],
    },
    'warn-popper': {
      triggers: ['hover'],
    },
    'danger-popper': {
      triggers: ['hover'],
    },
  },
});
app.use(PortalVue);
app.use(VueScrollTo, {
  duration: 500,
});
app.directive('click-outside', clickOutsidePlugin);
app.directive('onboard-tip', vOnboardTooltip);
app.directive('auto-position', vAutoPositionPlugin);

function loadDayJSLocale(language: string) {
  // @ts-ignore
  if (Constants.SupportedLocaleForDayJS[language]) {
    // @ts-ignore
    Constants.SupportedLocaleForDayJS[language]().then(() => dayjs.locale(language));
  } else {
    dayjs.locale('en');
  }
}

async function initialLoad() {
  store.dispatch('root/localClientInit');
  // TODO: @goodwillsandy fix the usage and make this file TS, define typings
  // coreWebVitalService.init()
  updateURLs();
  let user;
  if (window.serverData?.user) {
    user = window.serverData.user;
  } else {
    user = await AuthService.getCurrentUser($axios);
  }
  if (user) {
    store.dispatch('root/setUser', user);
    EventBus.$emit('userSet', { user });
  }

  const locale: string = getCurrentLanguageToUse(user?.preferences?.lang);
  translator.setCurrentLanguage(locale);
  loadDayJSLocale(locale);
  let translationMap = await import(`../translations/${locale}.json`);
  if (!translationMap) {
    translationMap = await import('../translations/en.json');
  }
  store.commit('root/setTranslations', translationMap.default);

  app.use(UserPlugin, { user, Sentry });
  // Braze plugin needs User to be set
  app.use(BrazePlugin, { user, store });
  // has to move it here because route guards are dependent on user plugin
  app.use(router);
  // Confetti library
  app.use(VueConfetti);
}

(async () => {
  await initialLoad();
  const appDOM = document.querySelector('#app') as HTMLDivElement;
  app.mount(appDOM);
})();

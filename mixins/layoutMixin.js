import dayjs from 'dayjs';

import FontService from '~/services/FontService.js';
import IdleQueueService from '~/services/IdleQueueService.js';

import { handleFocusRings, stopHandlingFocusRings } from '~/services/FocusRingsService.js';
import { generateSurvey, setVisitorTraits } from '~/services/Survicate.js';
import PageTitles from '~/config/PageTitles';
import translator from '~/services/i18n.js';
import LifecycleEventService from '~/services/LifecycleEventService.js';
import $axios from '../services/AxiosService.js';
import $store from '../services/StoreService.js';

export default {
  head() {
    return {
      title: PageTitles[this.$route.name] ? PageTitles[this.$route.name] : 'Quizizz',
      meta: [{
        hid: 'description',
        name: 'description',
        content: this.$i18n('Choose from millions of quizzes covering math, science, English, history and more.'),
      }],
    };
  },
  data() {
    return {
      idleQueue: null,
    };
  },
  created() {
    $store(this.$store);
    $axios(this.$axios);

    /**
     * Use IdleQueueService service to make sure these resources are loaded during idle time or at the earliest when they are needed
     */
    this.idleQueue = new IdleQueueService();
    this.idleQueue.addTask(FontService.loadOpenSans);
  },

  mounted() {
    /**
     * Use IdleQueueService service to make sure these resources are loaded during idle time or at the earliest when they are needed
     */
    this.idleQueue = new IdleQueueService();
    this.idleQueue.addTask(FontService.loadOpenSans);
    this.idleQueue.addTask(
      LifecycleEventService.loadService.bind(
        LifecycleEventService,
        this.$constants.LifecycleEventServices.BRAZE,
        this.$user,
        this.$store.getters['root/serverData']?.nonce,
      ),
    );

    handleFocusRings(window);

    setVisitorTraits(window._sva = window._sva || {});

    this.idleQueue.addTask(generateSurvey.bind(null, window));

    // log page view event on browser load
    this.handlePageViewEvent(this.$route, null, true);
  },

  beforeUnmount() {
    stopHandlingFocusRings();
  },
  watch: {
    $route(to, from) {
      // eslint-disable-next-line quote-props
      this.$gtag.customMap({ 'dimension2': 'plan', 'dimension3': 'occupation' });
      this.$gtag.query('set', 'user_properties', { plan_dimension: this.$user.plan || 'null', occupation_dimension: this.$user.occupation || 'null' });

      // in house pageview events
      this.handlePageViewEvent(to, from);
    },
  },

  methods: {
    loadLocale(language) {
      this.$constants.SupportedLocaleForDayJS[language]().then(() => dayjs.locale(language));
    },
    handlePageViewEvent(to, from, isBrowserLoaded = false) {
      if (to && from && to.path === from.path) {
        return;
      }
      this.$analytics.processPageViewEvents(to, from, this.$gtag, this.$router, isBrowserLoaded);
    },
  },
};

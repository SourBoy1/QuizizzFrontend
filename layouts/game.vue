<template>
  <div class="flex flex-col h-screen overflow-hidden font-sans game-layout">
    <ToastManager />
    <!-- TODO(shradhan) check if these components are needed on game side -->
    <!-- TODO(shradhan) remove this and use portals for viewing images and videos<Overlay /> -->
    <SuperUpsell />
    <SchoolAndDistrictModal />
    <ReferralRefereeRewardModal />
    <ReferralSuperUpsellModal />
    <LoadSVG
      name="shapes"
      class="absolute invisible hidden svg-shapes-import"
    />
    <portal-target name="media-preview" />
    <div class="flex flex-grow h-screen">
      <RouterView v-slot="{ Component }">
        <Transition
          name="fade"
          mode="out-in"
          appear
        >
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script>

import { generateSurvey, setVisitorTraits } from '~/services/Survicate.js';

import { handleFocusRings, stopHandlingFocusRings } from '~/services/FocusRingsService.js';

import FontService from '~/services/FontService.js';
import IdleQueueService from '~/services/IdleQueueService.js';
import Fonts from '~/config/Fonts.js';
import $axios from '../services/AxiosService.js';
import $store from '../services/StoreService.js';

export default {
  data() {
    return {
      showFeedbackPeekaboo: false,
      idleQueue: null,
    };
  },

  head() {
    return {
      link: [
        {
          rel: 'stylesheet',
          media: 'print',
          href:
            'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400;1,800&display=swap',
        },
      ],

      script: [
        {
          src: 'https://www.youtube.com/player_api',
          defer: true,
        },
        {
          src: 'https://www.youtube.com/iframe_api',
          defer: true,
        },
      ],
    };
  },

  watch: {
    $route(to, from) {
      // eslint-disable-next-line quote-props
      this.$gtag.customMap({ 'dimension2': 'plan', 'dimension3': 'occupation' });
      this.$gtag.query('set', 'user_properties', { plan_dimension: this.$user.plan || 'null', occupation_dimension: this.$user.occupation || 'null' });

      // in house pageview events
      this.handlePageViewEvent(to, from);

      // scroll to top on every route change
      const appContainer = this.$refs.appBodyContainer;
      if (appContainer) {
        appContainer.scrollTo(0, 0);
      }
    },

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
    // Todo(shradhan) - check with vimal if this can be removed
    handleFocusRings(window);

    setVisitorTraits(window._sva = window._sva || {});

    this.idleQueue.addTask(generateSurvey.bind(null, window));

    this.$nextTick(() => {
      for (const fontKey in Fonts) {
        const font = Fonts[fontKey];

        this.idleQueue.addTask(FontService.loadFont.bind(null, font));
      }
    });

    // log page view event on browser load
    this.handlePageViewEvent(this.$route, null, true);

    // Peekaboo Events
    this.$eventBus.$on('openFeedbackPeekaboo', this.onOpenFeedbackPeekaboo);
    this.$eventBus.$on('closeFeedbackPeekaboo', this.onCloseFeedbackPeekaboo);
  },

  beforeUnmount() {
    stopHandlingFocusRings();
    this.$eventBus.$off('openFeedbackPeekaboo', this.onOpenFeedbackPeekaboo);
    this.$eventBus.$off('closeFeedbackPeekaboo', this.onCloseFeedbackPeekaboo);
  },

  methods: {
    handlePageViewEvent(to, from, isBrowserLoaded = false) {
      if (to && from && to.path === from.path) {
        return;
      }
      this.$analytics.processPageViewEvents(to, from, this.$gtag, this.$router, isBrowserLoaded);
    },

    onOpenFeedbackPeekaboo() {
      this.showFeedbackPeekaboo = true;
    },

    onCloseFeedbackPeekaboo() {
      this.showFeedbackPeekaboo = false;
    },
  },

};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/mixins.scss';
@import '~/assets/scss/extends.scss';

html {
  @extend %keyboard-only-focus-rings;
}
</style>

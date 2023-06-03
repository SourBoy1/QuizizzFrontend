<template>
  <div :class="['sales-dashboard-layout', isOnboardingFlow && 'bg-dark-6']">
    <ToastManager />
    <Overlay ref="overlay" />
    <div :class="[isOnboardingFlow && 'max-w-260 mx-auto']">
      <SalesHeader v-if="shouldShowHeader" />
      <main>
        <div :class="['content', !isOnboardingFlow && 'mx-4 mt-4 md:mx-16 md:mt-16']">
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
      </main>
      <SalesOrganizationFooter
        v-if="shouldShowFooter"
        @exit="toggleExitConfirmModal"
      />
    </div>
    <ExitConfirmModal
      v-if="shouldShowExitModal"
      @confirm="handleExitClick"
      @close="toggleExitConfirmModal"
    />
  </div>
</template>
<script>

import { mapGetters } from 'vuex';

import $axios from '~/services/AxiosService.js';
import $store from '~/services/StoreService.js';

import IdleQueueService from '~/services/IdleQueueService.js';
import FontService from '~/services/FontService.js';
import Fonts from '~/config/Fonts.js';

export default {

  data() {
    return {
      shouldShowExitModal: false,
    };
  },

  head() {
    return {
      title: this.$i18n('Org Dashboard'),
    };
  },

  computed: {
    ...mapGetters('orgDashboard', ['hasPrevState', 'prevState']),

    shouldShowHeader() {
      const { path } = this.$route;
      if (path.match(/onboarding\/organization\/*?$/)) {
        return true;
      }
      return false;
    },

    shouldShowFooter() {
      const { path } = this.$route;
      if (path.match(/onboarding\/organization\/*?$/)) {
        return false;
      }
      return true;
    },

    isOnboardingFlow() {
      const { path } = this.$route;
      return path.match(/onboarding\/organization\/*?$/);
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

    this.$eventBus.$on('orgDashboard:previousClick', this.handlePrevClick);
  },

  beforeUnmount() {
    this.$eventBus.$off('orgDashboard:previousClick', this.handlePrevClick);
  },

  mounted() {
    this.$nextTick(() => {
      for (const fontKey in Fonts) {
        const font = Fonts[fontKey];

        this.idleQueue.addTask(FontService.loadFont.bind(null, font));
      }
    });
  },

  methods: {
    toggleExitConfirmModal() {
      this.shouldShowExitModal = !this.shouldShowExitModal;
    },

    handleExitClick() {
      this.shouldShowExitModal = false;
      this.$router.push('/sales/onboarding/organization');
    },

    handlePrevClick() {
      if (this.hasPrevState) {
        this.$router.push(this.prevState);
      }
    },
  },

};
</script>

<style lang="scss"></style>

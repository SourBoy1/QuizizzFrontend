<template>
  <Modal
    v-if="open"
    :button2="null"
    :button1="null"
    subtitle=""
    title=""
    dismissOnOverlayClick
    containerClasses="super-upsell bg-super-faded z-10"
    @close="onClose"
  >
    <div v-click-outside="onClickOutside">
      <div class="flex">
        <div class="relative flex items-center justify-center w-10 h-10 mr-3">
          <div class="w-10 h-10 bg-super-20% rounded-full opacity-50 flex items-center justify-center">
            <div class="w-5 h-5 bg-super-20% rounded-full opacity-75 flex items-center justify-center">
              <div class="w-2.5 h-2.5 bg-super-20% rounded-full" />
            </div>
          </div>
          <img
            src="https://cf.quizizz.com/img/mkt/schools-and-dists/school_super_logo.png"
            class="absolute w-10 h-10"
            :alt="$i18n('School Super Logo')"
            aria-hidden="true"
          >
        </div>

        <div class="mb-6">
          <div class="mb-0.5 flex flex-row items-center">
            <Lozenge
              class="bg-super text-light-3"
              size="sm"
              :title="$i18n('School & District')"
            />
          </div>

          <div class="mt-2 text-sm font-semibold text-dark-4">
            <i18n>Go schoolwide and we’ll reimburse 100% out-of-pocket teacher upgrades for the same year. </i18n>
          </div>
        </div>
      </div>

      <div class="mb-4 text-2xl font-bold text-dark-2">
        {{ title }}
      </div>

      <div v-if="!!imgSrc">
        <img
          :src="imgSrc"
          alt="upsell-image"
        />
      </div>
      <div
        v-else
        class="mb-2"
      >
        <div
          v-for="(item, index) in featureList"
          :key="index"
          class="flex mb-2"
        >
          <div class="flex items-center justify-center w-6 h-6 mr-1 text-super">
            <FA
              :icon="item.icon"
              :size="12"
            />
          </div>
          <div class="text-sm font-semibold text-dark-2">
            {{ item.text }}
          </div>
        </div>
      </div>

      <Button
        class="w-full my-7"
        :title="$i18n('Learn more')"
        size="xl"
        type="super"
        @click="onCTAClick"
      />
      <div
        class="mt-4 text-sm font-semibold text-center cursor-pointer text-dark-3"
        @click="onClose"
      >
        <i18n>Not now</i18n>
      </div>
    </div>
  </Modal>
</template>

<script>
import get from 'lodash/get';

import MoengageService from '~/services/MoengageService';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import LifecycleEventService from '~/services/LifecycleEventService';
import { OpenSnDPlansPage } from '~/utils/Redirection';

const DefaultConfigs = {
  heading: 'Support every teacher in your school or district.',
};

export default {
  data() {
    return {
      config: DefaultConfigs,
      featureList: [
        {
          icon: 'fas fa-bolt-lightning',
          text: this.$i18n('Unrestricted access to every quiz, lesson and tool on Quizizz'),
        },
        {
          icon: 'fas fa-screen-users',
          text: this.$i18n('Automatic grade syncing with LMS integrations'),
        },
        {
          icon: 'fas fa-building-columns',
          text: this.$i18n('Enhanced sharing and collaboration within your school'),
        },
      ],

      open: false,
      options: {},
    };
  },

  computed: {
    title() {
      switch (this.options.feat) {
        case this.$constants.FeatureTypes.TOPIC_TAGS:
          return this.$i18n('Unlock standards-based reporting and our library of standards');
        case this.$constants.FeatureTypes.DISTRICT_LIBRARY:
          return this.$i18n('Unlock District Library');
        case this.$constants.FeatureTypes.FOCUS_MODE:
          return this.$i18n('Advanced anti-cheating');
        case this.$constants.FeatureTypes.REVIEW_AND_SUBMIT:
          return this.$i18n('Simulate test taking experience');
        default:
          return this.$i18n('Support every teacher in your school or district.');
      }
    },

    imgSrc() {
      return this.options?.media?.img || null;
    },
  },

  mounted() {
    this.$eventBus.$on('sndUpsell:open', this.onShow);
  },

  beforeUnmount() {
    this.$eventBus.$off('sndUpsell:open', this.onShow);
  },

  methods: {
    onClickOutside() {
      this.onClose();
    },

    onCTAClick() {
      MoengageService.triggerEvent(this.$user, 'event', 'SD Interest');
      LifecycleEventService.triggerEvent(this.$constants.LifecycleEventServices.BRAZE, this.$user, 'event', 'SD Interest');
      OpenSnDPlansPage(get(this.options, 'feat', 'nav-prompt'), 'cta-click');
    },

    onShow(options = {}, config = DefaultConfigs) {
      this.options = options;
      this.config = config;
      this.open = true;
      HotjarService.triggerEvent(HotjarEvents.HOTJAR_SND_UPSELL_SHOW);
      this.triggerAnalyticsEvent();

      this.$analytics.logEvent(this.$webEvents.SUPER_FEAT_UPSELL_SHOWN, {
        ...options,
      });
    },

    triggerAnalyticsEvent() {
      if (this.options?.webEvent) {
        this.$analytics.logEvent(this.options.webEvent);
      }
    },

    onClose() {
      this.open = false;
      if (this.options?.closeWebEvent) {
        this.$analytics.logEvent(this.options.onCloseWebEvent);
      }
    },
  },
};
</script>

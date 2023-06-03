<template>
  <Modal
    v-if="shouldShow"
    title=""
    subtitle=""
    :button2="null"
    :button1="null"
    modalDataCy="super-upsell-modal"
    :shouldCloseOnMaskClick="true"
    containerClasses="super-upsell bg-super-faded z-10"
    :style="{ zIndex: 100007 }"
    @close="() => close(true)"
  >
    <div>
      <div class="flex">
        <span
          v-if="showIndividualPlan"
          class="p-3 w-12 h-12 flex justify-center items-center text-yellow-light bg-yellow-20% rounded-full mr-3"
        >
          <FA
            icon="fas fa-stairs"
            :size="16"
          />
        </span>
        <img
          v-else
          :src="options.topSectionIcon"
          alt=""
          class="w-10 h-10 mr-3"
        >

        <div class="mb-6">
          <div class="mb-0.5 flex flex-row items-center">
            <span class="mr-2 text-base font-semibold text-dark-2">{{ options.topSectionTitle }}</span>
            <Lozenge
              v-if="!showIndividualPlan"
              class="bg-super text-light-3"
              size="sm"
              :title="options.topSectionLabel"
            />
          </div>

          <div class="text-xs font-semibold text-dark-4">
            {{ options.topSectionSubtitle }}
          </div>
        </div>
      </div>

      <h2 class="mb-4 text-2xl font-bold text-dark-2">
        {{ options.middleSectionTitle }}
      </h2>

      <div
        v-if="options.middleSectionListTitle"
        class="text-dark-2 font-sm font-semibold mb-4"
      >
        {{ options.middleSectionListTitle }}
      </div>

      <div
        v-if="options.featureInfo?.length"
        class="mb-2"
      >
        <div
          v-for="(item, index) in options.featureInfo"
          :key="index"
          class="flex mb-2"
        >
          <div
            v-if="!item.subTitle"
            class="flex"
          >
            <div class="w-6 h-6 flex items-center justify-center text-super mr-1">
              <FA
                :icon="item.icon"
                :size="12"
              />
            </div>
            <div class="text-dark-2 font-semibold text-sm">
              {{ item.text }}
            </div>
          </div>
          <div
            v-else
            class="flex items-center mb-2"
          >
            <div class="w-10 h-10 flex items-center justify-center text-super mr-4 bg-super-20% rounded-full">
              <FA
                :icon="item.icon"
                :size="18"
              />
            </div>
            <div class="flex flex-col text-dark-2 font-semibold text-sm">
              <span>
                {{ item.text }}
              </span>
              <span class="text-dark-4 font-normal">
                {{ item.subTitle }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="hasVideoPreview"
        class="mb-6 overflow-hidden rounded-lg border boder-solid border-yellow-20%"
      >
        <video
          class="w-full h-full"
          :src="options.video"
          loop="true"
          aria-hidden="true"
          autoplay="true"
          muted
        />
      </div>

      <div
        v-if="!isEmpty(options.middleSectionSubtitle)"
        class="flex mb-6"
      >
        <div class="flex items-center justify-center w-6 h-6 mr-1 text-dark-4">
          <FA
            icon="far fa-plus"
            :size="12"
          />
        </div>
        <div class="text-sm font-semibold text-dark-4">
          {{ options.middleSectionSubtitle }}
        </div>
      </div>

      <Button
        v-if="canShowGoSuperBtn"
        class="w-full mb-7 mt-4"
        :title="superUpgradeText"
        size="xl"
        type="super"
        role="link"
        @click="onGoSuperClicked"
      />

      <div v-if="feat === $constants.FeatureTypes.SUPER_QUESTION_SAVE_MODAL" />
      <div
        v-else
        class="w-full h-px bg-dark-5% rounded mb-6 mt-7"
      />

      <div
        v-if="shouldShowSndBtn"
        class=""
      >
        <div>
          <div class="mb-1 text-sm font-semibold text-center text-dark-2">
            <span>🏫&nbsp;</span>
            <span><i18n>Interested in a School or District Plan instead?</i18n></span>
          </div>

          <Button
            class="m-auto"
            :title="$i18n('Get a quote')"
            size="xs"
            type="super-secondary"
            role="link"
            @click="onRequestQuoteClicked"
          />
        </div>

        <div
          v-if="!canShowGoSuperBtn"
          class="text-dark-4 font-semibold text-sm text-center"
        >
          <i18n :injections="[upgradePlanText]">
            Unfortunately, you can’t upgrade to Quizizz {$1} from this app.
          </i18n>
        </div>
      </div>

      <div
        v-if="options.showContinueButton"
        class="text-center"
        @click="continueWithoutSuperQuestions"
      >
        <h1 class="text-[#73747E] font-bold cursor-pointer text-sm">
          <i18n>
            Publish without these Super questions
          </i18n>
        </h1>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import { OpenSnDPlansPage } from '~/utils/Redirection';

import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import SuperUpsell from '../utils/SuperUpsellUtils';

export default {
  emits: ['continueWithoutSuperQuestions'],
  data() {
    return {
      feat: '',
      options: {},
      shouldShow: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),
    ...mapGetters('products', ['isEligibleForTrial', 'planPrice']),

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    upgradeText() {
      return this.showIndividualPlan ? 'Paid plan' : 'Super';
    },

    upgradePlanText() {
      return this.showIndividualPlan ? 'Individual plan' : 'Super';
    },

    canShowGoSuperBtn() {
      return !this.isMSTeamsAppView || (this.isMSTeamsAppView && this.isDesktop);
    },

    canShowSNDBtn() {
      return !this.showIndividualPlan && (!this.isMSTeamsAppView || (this.isMSTeamsAppView && this.isDesktop));
    },

    isDesktop() {
      return this.deviceProps.type === this.$constants.DeviceTypes.DESKTOP;
    },

    isMSTeamsAppView() {
      return this.$msTeams?.isTeamApp();
    },

    hasVideoPreview() {
      return !isEmpty(this.options.video);
    },

    superUpgradeText() {
      if (this.showIndividualPlan) {
        return this.$i18n('Upgrade now');
      } if (this.isEligibleForTrial) {
        return this.$i18n('Get free Super trial');
      }
      return this.$i18n('Upgrade your Plan');
    },

    shouldShowSndBtn() {
      return this.canShowSNDBtn && !this.options.hideSndButton;
    },
  },

  mounted() {
    this.$eventBus.$on('superUpsell:show', this.show);
  },

  beforeUnmount() {
    this.$eventBus.$off('superUpsell:show', this.show);
  },

  methods: {
    isEmpty,
    onOutsideClicked(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this.close();
    },

    show({ type, options = {} }) {
      this.feat = options.feat;
      this.options = SuperUpsell.getOptions(type, options);
      this.shouldShow = true;

      HotjarService.triggerEvent(HotjarEvents.HOTJAR_SUPER_UPSELL_SHOW);
      this.$analytics.logEvent(this.$webEvents.SUPER_FEAT_UPSELL_SHOWN, {
        ...options,
        trial_shown: this.isEligibleForTrial,
        price: this.planPrice,
        isQuizPremium: options.isQuizPremium,
      });
    },

    close(shouldLogAnalyticsEvent = false) {
      if (shouldLogAnalyticsEvent && this.feat === this.$constants.FeatureTypes.SUPER_QUESTION_SAVE_MODAL) {
        const eventName = this.$webEvents.SUPER_UPSELL_MODAL_TO_USE_SUPER_Q;
        this.$analytics.logEvent(eventName, {
          userId: this.$user.id,
          quizId: this.$route.params.id,
          action: 'close',
        });
      }
      this.feat = '';
      this.options = {};
      this.shouldShow = false;
      this.$eventBus.$emit('superUpsell:dismiss');
    },

    onGoSuperClicked() {
      if (this.feat === this.$constants.FeatureTypes.SUPER_QUESTION_SAVE_MODAL) {
        const eventName = this.$webEvents.SUPER_UPSELL_MODAL_TO_USE_SUPER_Q;
        this.$analytics.logEvent(eventName, {
          userId: this.$user.id,
          quizId: this.$route.params.id,
          action: 'getTrial',
        });
      }

      if (this.options.openInNewTab || this.isMSTeamsAppView) {
        if (this.options.feat) {
          const variantText = this.options.variant ? (`&variant=${this.options.variant}`) : '';

          this.$analytics.logEvent(this.$webEvents.SuperTrialEvents.SUPER_TRIAL_CTA, {
            page: window.location.href,
            component: 'super_upsell',
            feat: this.options.feat,
            variant: variantText,
            trial_shown: this.isEligibleForTrial,
            price: this.planPrice,
          });

          window.open('/super-pricing' + `?feat=${this.options.feat}${variantText}`, '_blank');
        } else {
          this.$analytics.logEvent(this.$webEvents.SuperTrialEvents.SUPER_TRIAL_CTA, {
            page: window.location.href,
            component: 'super_upsell',
            trial_shown: this.isEligibleForTrial,
            price: this.planPrice,
          });

          window.open('/super-pricing', '_blank');
        }

        this.close();

        return;
      }

      if (this.options.feat) {
        const variantText = this.options.variant ? (`&variant=${this.options.variant}`) : '';
        location = (`/super-pricing?backto=${encodeURIComponent(window.location.pathname)}&feat=${this.options.feat}${variantText}`);
      } else {
        location = (`/super-pricing?backto=${encodeURIComponent(window.location.pathname)}`);
      }
    },

    onRequestQuoteClicked() {
      const variantText = this.options.variant ? (`-${this.options.variant}`) : '';
      const currentFeat = this.options.feat + variantText;

      OpenSnDPlansPage(`super-upsell-${currentFeat}`, 'request-quote');
    },

    continueWithoutSuperQuestions() {
      this.$eventBus.$emit('continueWithoutSuperQuestions');
      this.close();
    },
  },
};
</script>

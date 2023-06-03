<template>
  <div
    class="for-super"
    @click="onClick"
    @mousedown="onMouseDown"
  >
    <slot />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import referralMixin from '~/mixins/referralMixin';
import { hasFeatureAccess } from '../services/SubscriptionService';

export default {
  mixins: [referralMixin],

  props: {
    feat: {
      type: String,
      default: '',
    },

    shouldNotApplyForSuper: {
      type: Boolean,
      default: false,
    },

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },

    shouldSettingShowSNDUpsell: {
      type: Boolean,
      default: false,
    },

    variant: {
      type: String,
      default: '',
    },

    type: {
      type: String,
      default: '',
    },

    gameType: {
      type: String,
      default: '',
    },

    shouldRedirectToPricing: {
      type: Boolean,
      default: false,
    },

    disableOnclick: {
      type: Boolean,
      default: false,
    },

    disableOnMouseDown: {
      type: Boolean,
      default: true,
    },

    additionalCondition: {
      type: Boolean,
      default: true,
    },

    state: {
      type: Boolean,
      default: false,
    },

    shouldHideSuperContent: {
      type: Boolean,
      default: false,
    },

    hidePaywall: {
      type: Boolean,
      default: false,
    },

    isLoginRequired: {
      type: Boolean,
      default: false,
    },
    whitelistedResourceId: {
      type: String,
      default: '',
    },
  },

  emits: ['noLogin', 'upsellShown', 'click', 'click:cancel', 'mousedown', 'sndUpsell:open'],

  computed: {
    ...mapGetters('products', ['isEligibleForTrial', 'planPrice']),
    isSuperUser() {
      return this.$user.isSuper;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },
  },

  methods: {
    checkAndHandleSuperActions(ev) {
      if (this.shouldAllowUsingSuperQuestionTypes) {
        return true;
      }

      if (this.shouldNotApplyForSuper) {
        return true;
      }

      if (this.shouldSettingShowSNDUpsell && !hasFeatureAccess(this.feat) && !this.isCorporateUser) {
        this.$eventBus.$emit('sndUpsell:open', {
          feat: this.feat,
          webEvent: this.feat === this.$constants.GameOptions.REVIEW_AND_SUBMIT ? this.$webEvents.SND_REVIEWANDSUBMIT_UPSELL_SHOW : this.$webEvents.SND_FOCUSMODE_UPSELL_SHOW,
          onCloseWebEvent: this.feat === this.$constants.GameOptions.REVIEW_AND_SUBMIT ? this.$webEvents.SND_REVIEWANDSUBMIT_UPSELL_CLOSED : this.$webEvents.SND_FOCUSMODE_UPSELL_CLOSED,
        });
        return false;
      }
      if (this.$constants.WhitelistedSuperResources.includes(this.whitelistedResourceId)) {
        return true;
      }

      if (this.isLoginRequired && !this.$user.id) {
        this.$emit('noLogin');
        return false;
      }

      if (!hasFeatureAccess(this.feat) && this.additionalCondition && !this.isCorporateUser) {
        const options = {};

        if (!isEmpty(this.feat)) {
          options.feat = this.feat;
        }

        if (!isEmpty(this.variant)) {
          options.variant = this.variant;
        }

        if (this.hidePaywall) {
          return false;
        }

        const isIntentGoToPricing = ev.target?.hasAttribute('goToPricing');
        if (this.shouldRedirectToPricing || isIntentGoToPricing) {
          this.$analytics.logEvent(this.$webEvents.SuperTrialEvents.SUPER_TRIAL_CTA, {
            page: window.location.href,
            component: 'for_super',
            feat: this.feat,
            variant: this.variant,
            trial_shown: this.isEligibleForTrial,
            price: this.planPrice,
          });

          window.open(`/super-pricing?feat=${this.feat}&variant=${this.variant}`);
        } else {
          if (this.canPromoteReferral) {
            this.$eventBus.$emit('superUpsellReferral:show', { type: this.type, options });
          } else {
            const { type } = this;
            this.$eventBus.$emit('superUpsell:show', { type, options });
          }
          this.$emit('upsellShown');
          ev.stopPropagation();
        }

        return false;
      }

      return true;
    },

    onClick(ev) {
      if (this.disableOnclick) {
        return;
      }
      if (this.type === this.$constants.GameOptions.SCHEDULE_LATER) {
        const planName = this.accountType();
        this.$analytics.logEvent(this.$webEvents.SCHEDULE_LATER, {
          user_type: planName,
          game_type: this.gameType,
          toggle: this.state,
        });
      }

      const isActionAllowed = this.checkAndHandleSuperActions(ev);

      if (isActionAllowed) {
        this.$emit('click');
        return;
      }

      this.$emit('click:cancel');
    },

    accountType() {
      const user = this.$user;
      const planName = this.$user.plan;
      if (!user.id) {
        return this.$constants.AccountTypes.ANONYMOUS;
      }

      if (user.isPartOfAnOrganization && planName !== '') {
        return this.$constants.AccountTypes.SCHOOL_AND_DISTRICT;
      }

      if (!planName) {
        if (user.isCorporate) {
          return this.$constants.AccountTypes.CORPORATE_INTRO;
        }

        return this.$constants.AccountTypes.BASIC;
      }

      if (user.isSuper) {
        return this.$constants.AccountTypes.SUPER;
      }
    },

    onMouseDown(ev) {
      if (this.disableOnMouseDown) {
        return;
      }

      const isMouseDownActionAllowed = this.checkAndHandleSuperActions(ev);

      if (isMouseDownActionAllowed) {
        this.$emit('mousedown');
      }
    },
  },
};
</script>

<style lang="scss">
.for-super{
  height: fit-content;
}
</style>

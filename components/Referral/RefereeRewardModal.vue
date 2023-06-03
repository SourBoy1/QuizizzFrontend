<template>
  <Modal
    v-if="shouldShowRefereeModal"
    title=""
    subtitle=""
    :button2="null"
    :button1="null"
    :shouldCloseOnMaskClick="true"
    :zeroPadding="true"
    :hideHeader="true"
    containerClasses="max-w-qmd z-10 bg-super-faded border-1 border-super p-0"
    closeBtnClasses="text-dark-4"
    :stickToBottom="isMobile"
    backgroundColor="bg-super-faded"
    :showFooter="false"
    :fixedHeight="false"
    @close="close"
  >
    <div
      v-click-outside="() => onOutsideClicked()"
      class="px-6 py-4"
    >
      <div class="rounded-xl bg-super-10% mt-2 mb-4 h-8 w-max pr-3">
        <img
          class="mr-1 w-8 h-8 inline-block"
          src="https://cf.quizizz.com/img/super/super_image_with_glow.png"
          :alt="$i18n('Super logo')"
        />
        <span class="text-super-light text-sm font-semibold h-8 leading-8">{{ getRewardText }}</span>
      </div>
      <div class="leading-3 mb-2 text-dark-4">
        <i class="far fa-circle text-xtn mr-2 relative -top-0.5" /><i18n class="text-sm">
          Select or create any activity
        </i18n>
      </div>
      <img
        class="w-full mb-1"
        src="https://cf.quizizz.com/referral/referee-landing-1.png"
        :alt="$i18n('Referee landing page')"
      />
      <div class="leading-3 mb-2 text-dark-4">
        <i class="far fa-circle text-xtn mr-2 relative -top-0.5" /><i18n class="text-sm">
          Host a live quiz or assign it as a homework
        </i18n>
      </div>
      <img
        class="w-full"
        src="https://cf.quizizz.com/referral/referee-landing-2.png"
        :alt="$i18n('Referee landing page')"
      />
    </div>
  </Modal>
</template>

<script>

import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

export default {

  mixins: [referralMixin],
  data() {
    return {
      benefits: [
        {
          iconClass: 'fal fa-books',
          text: this.$i18n('Get unlimited access to {$1} resources', [this.upgradeText]),
        },
        {
          iconClass: 'fal fa-lock',
          text: this.$i18n('Make your quiz private with {$1}', [this.upgradePlanText]),
        },
        {
          iconClass: 'fal fa-redo',
          text: this.$i18n('Re-open expired assignments at any time'),
        },
        {
          iconClass: 'fal fa-infinity',
          text: this.$i18n('Keep assignments open for as long as you like'),
        },
        {
          iconClass: 'fal fa-ad',
          text: this.$i18n('Remove ads for you and your students'),
        },
      ],

      benefitCarouselSettings: {
        accessibility: true,
        autoplay: true,
        arrows: false,
        dots: false,
        slidesToShow: 1,
        infinite: true,
        edgeFriction: 1,
        variableWidth: true,
      },

      shouldShowRefereeModal: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'isMobile', 'serverData']),

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    getRewardText() {
      if (this.isCountryUSA) {
        return this.$i18n('Here\'s how to claim your free Individual plan');
      }
      return this.$i18n('Here\'s how to claim your free Super');
    },

    isCountryUSA() {
      return this.serverData.requestCountry === 'US';
    },

    upgradeText() {
      return this.showIndividualPlan ? 'Premium' : 'Super';
    },

    upgradePlanText() {
      return this.showIndividualPlan ? 'Individual plan' : 'Super';
    },
  },

  mounted() {
    this.$eventBus.$on('refereeRewardModal:show', this.show);
  },

  beforeUnmount() {
    this.$eventBus.$off('refereeRewardModal:show', this.show);
  },

  methods: {
    onOutsideClicked(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this.onClose();
    },

    close() {
      this.shouldShowRefereeModal = false;
    },

    show() {
      this.shouldShowRefereeModal = true;
      this.$analytics.logEvent(this.$webEvents.REFEREE_REWARD_MODAL_SHOWN, {
        country: this.serverData.requestCountry,
      });
    },
  },
};
</script>

<style scoped lang="scss">
:deep() {
  .max-width-container {
    max-width: 480px;
  }
  .footer {
    display: none;
  }
}

</style>

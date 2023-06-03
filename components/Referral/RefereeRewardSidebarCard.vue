<template>
  <div
    v-if="showRefereeRewardCard"
    class="my-2 bg-super-10% border border-super-faded cursor-pointer rounded-lg sidebar-card overflow-hidden"
    @click.stop="onReferBtnClicked"
  >
    <div class="px-4 pt-4 mb-4 flex">
      <div class="w-4/5">
        <i18n
          class="text-xs text-super-dark font-bold z-1"
          :injections="[upgradePlanText]"
        >
          Your free {$1} expires soon, claim it now!
        </i18n>
      </div>
      <div class="flex items-center justify-center relative left-1">
        <Button
          size="sm"
          class="rounded-xl z-1"
          ticon="far fa-arrow-right"
          ticonClasses="font-semibold"
          type="super-secondary"
          @click.stop="onReferBtnClicked"
        />
        <div class="h-2 w-2 bg-green-light rounded-lg relative -top-3 -left-2" />
      </div>
    </div>
    <div class="h-20 overflow-hidden">
      <div class="h-42 w-42 bg-super-20% rounded-50% z-0 flex items-center justify-center mt-10">
        <img
          :src="animateGift ? 'https://cf.quizizz.com/img/super/share-super-anim.gif' : 'https://cf.quizizz.com/img/super/share-super-static.png'"
          :width="animateGift && isAnimLoaded ? '60' : '48'"
          class="z-1"
          :class="{ '-mt-32': !animateGift || !isAnimLoaded, '-mt-40': animateGift && isAnimLoaded }"
          @load="onImgLoad"
        >
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

export default {

  mixins: [referralMixin],
  props: {
    isMiniVariant: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      animateGift: false,
      isAnimLoaded: false,
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    upgradePlanText() {
      return this.showIndividualPlan ? 'Individual plan' : 'Super';
    },
  },

  methods: {
    onReferBtnClicked() {
      this.$analytics.logEvent(this.$webEvents.REFEREE_SIDEBAR_BTN_CLICKED, {
        country: this.serverData.requestCountry,
      });
      this.openRefereeRewardModal();
    },

    onImgLoad() {
      this.animateGift ? this.onAnimLoaded() : this.onStaticLoaded();
    },

    onAnimLoaded() {
      this.isAnimLoaded = true;
      setTimeout(() => {
        this.animateGift = false;
      }, 2050);
    },

    onStaticLoaded() {
      if (!this.isAnimLoaded) {
        this.animateGift = true;
      }
    },
  },
};
</script>

<style scoped>
  .sidebar-card {
    border: 1px solid rgba(255, 164, 2, 0.2);
    border-top: 3px solid #FFA402;
  }
</style>

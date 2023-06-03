<template>
  <div
    v-if="showRefereeRewardCardIndividual"
    class="my-2 bg-super-10% border border-super-20% rounded-lg  overflow-hidden cursor-pointer h-30"
    @click.stop="onReferBtnClicked"
  >
    <div class="px-4 pt-2">
      <span>
        <span><i18n class="text-xs text-super-dark mb-4 z-1">You have been gifted a</i18n></span><span><i18n class="text-xs text-super-dark mb-4 z-1 font-bold ml-1"> free upgrade</i18n></span>
      </span>
    </div>
    <div class="flex items-center relative left-4 mt-5">
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
    <div class="h-20 overflow-hidden relative bottom-12">
      <div class="h-42 w-42 bg-super-20% rounded-50% z-0 flex items-center justify-center mt-4 ml-8">
        <img
          src="https://cf.quizizz.com/image/image%209.png"
          class="z-1 -mt-30 ml-6 w-15 h-12"
        >
      </div>
    </div>
  </div>
</template>

<script>

import referralMixin from '~/mixins/referralMixin';
import LocalStorage from '~/services/LocalStorage';

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

  mounted() {
    if (this.showRefereeRewardCardIndividual) {
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFEREE_SIDEBAR_BTN, {
        campaignId: LocalStorage.getItem('campaignId') || this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
      });
    }
  },

  methods: {
    onReferBtnClicked() {
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFEREE_SIDEBAR_BTN_CLICKED, {
        campaignId: LocalStorage.getItem('campaignId') || this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
      });
      this.openRefereeSuperRewardModal();
    },
  },
};
</script>

<style scoped>
</style>

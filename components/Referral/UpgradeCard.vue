<template>
  <div
    v-if="showSidebardCard"
    class="my-2 bg-super-10% border border-super-20% rounded-lg  overflow-hidden cursor-pointer h-32"
    :class="{
      'mx-2': isMiniVariant,
    }"
    @click.stop="onReferBtnClicked"
  >
    <div v-if="!isLoading">
      <div
        :class="{
          'p-1 text-center': isMiniVariant,
          'px-4 pt-4': !isMiniVariant,
        }"
      >
        <ReferralReferralExpiryLozenge />
        <span>
          <i18n class="text-xs text-super-dark mb-4 z-1">You are eligible for a</i18n> <span
            class="text-xs text-super-dark mb-4 font-bold z-1"
          ><i18n>free upgrade</i18n></span>
        </span>
      </div>
      <div
        v-if="!isMiniVariant"
        class="px-4 pt-2"
      >
        <Button
          size="sm"
          class="rounded-xl z-1"
          ticon="far fa-arrow-right"
          ticonClasses="font-semibold"
          type="super-secondary"
          @click.stop="onReferBtnClicked"
        />
      </div>
      <div class="h-20 overflow-hidden relative bottom-12">
        <div class="h-32 w-32 bg-super-20% rounded-50% z-0 flex items-center justify-center mt-10 ml-10">
          <img
            src="https://cf.quizizz.com/img/super/share-super-static.png"
            class="z-1 -mt-28 ml-12 w-15"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

  props: {
    isMiniVariant: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],

  data() {
    return {
      animateGift: false,
      isLoading: false,
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),
    ...mapGetters('currentUser', ['referralCampaigns']),
    showSidebardCard() {
      return this.$user.isLoggedIn && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V3) && !this.$user.isSuper;
    },

    isCountryUSA() {
      return this.serverData.requestCountry === 'US';
    },

    showSidebardCard() {
      return this.$user.isLoggedIn && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V3) && !this.$user.isSuper && this.isCountryUSA;
    },

  },

  mounted() {
    if (this.showSidebardCard) {
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFERRAL_SIDEBAR, {
        campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
      });
    }
  },

  methods: {
    onReferBtnClicked() {
      this.$eventBus.$emit('superReferralForBasicModal:show');
    },
  },
};
</script>

<style scoped></style>

<template>
  <div
    v-if="showSidebardCard"
    class="my-2 bg-super-10% border border-super-20% rounded-lg  overflow-hidden cursor-pointer h-30"
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
          <i18n class="text-xs text-super-dark mb-4 z-1">You have </i18n> <span
            class="text-xs text-super-dark mb-4 font-bold z-1"
          > {{ getCount }} free upgrades</span>
          <i18n class="text-xs text-super-dark mb-4 z-1 ml-1"> to give away</i18n>
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
    <div
      v-else
      class="flex justify-center items-center w-full h-full"
    >
      <Loader :size="16" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

import ReferralApiService from '~/services/apis/ReferralApiService';

export default {

  mixins: [referralMixin],
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
      emailIds: [],
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),
    ...mapGetters('currentUser', ['referralCampaigns']),
    showSidebardCard() {
      return this.$user.isLoggedIn && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V3) && this.$user.isSuper && !this.$user.hasActiveSnDPlan && this.$user.trialDaysLeft !== 0 && this.getCount > 0;
    },

    isCountryUSA() {
      return this.serverData.requestCountry === 'US';
    },

    getCount() {
      return this.$constants.MAX_INDI_PLAN_REFER - this.emailIds.length;
    },
  },

  mounted() {
    this.isLoading = true;
    this.getCampaignList();
    if (this.showSidebardCard) {
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFERRAL_SIDEBAR, {
        campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
      });
    }
  },

  methods: {
    onReferBtnClicked() {
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFERRAL_SIDEBAR_BTN_CLICK, {
        campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
      });
      this.openSuperReferralModalForBasic();
    },

    async getCampaignList() {
      const campaigns = await ReferralApiService.getCampaigns();
      let referredEmail = [];
      const currentCampaign = campaigns?.filter((cmp) => cmp.id === this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER);
      if (currentCampaign?.length) {
        if (currentCampaign[0]?.meta?.status === 'pending') {
          this.$eventBus.$emit('refereeSuperRewardModal:show', currentCampaign);
        } else if (currentCampaign[0]?.meta?.refereeDetails?.length === 0 && currentCampaign[0]?.meta?.referredEmails?.length !== 0) {
          this.emailIds = currentCampaign[0]?.meta?.referredEmails || [];
        } else if (currentCampaign[0]?.meta?.refereeDetails?.length !== 0 && currentCampaign[0]?.meta?.referredEmails?.length === 0) {
          this.emailIds = currentCampaign[0]?.meta?.refereeDetails || [];
          this.emailIds = this.emailIds.map((data) => data.email);
        } else {
          this.emailIds = currentCampaign[0]?.meta?.refereeDetails || [];
          referredEmail = this.emailIds.map((data) => data.referralEmail);
          this.emailIds = this.emailIds.map((data) => data.email);
          if (this.getCount > 0) {
            currentCampaign[0]?.meta?.referredEmails.forEach((email) => {
              if (!referredEmail.includes(email)) {
                this.emailIds.push(email);
              }
            });
          }
        }
      }
      this.isLoading = false;
    },
  },
};
</script>

<style scoped></style>

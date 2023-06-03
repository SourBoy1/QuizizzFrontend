<template>
  <Modal
    :button2="null"
    :button1="null"
    :hideHeader="true"
    :shouldCloseOnMaskClick="true"
    :zeroPadding="true"
    containerClasses="max-w-qmd super-upsell z-10 bg-super-faded border-1 border-super pl-0 pr-0 pt-0 pb-0 rounded-2xl"
    closeBtnClasses="text-dark-4"
    backgroundColor="bg-super-faded"
    :showFooter="false"
    :fixedHeight="false"
    @close="close"
  >
    <div class="px-6 py-7">
      <div
        v-if="hasNotUpgraded"
        class="flex flex-col rounded-lg"
      >
        <div>
          <span class="font-bold text-xl md:text-3xl mt-3">
            <i18n>Claim your free upgrade to </i18n>
          </span><span>
            <i18n class="font-bold text-xl md:text-3xl mt-3 text-super mx-2 italic">{{ $i18n('QUIZIZZ PREMIUM') }}</i18n>
          </span>
        </div>
        <div class="w-11/12 mt-4 mb-6">
          <span>
            <i18n
              class="text-dark-4 text-xs md:text-sm mt-2"
              :injections="[getOrgName]"
            >As a thank you for being one of the most active teachers at {$1}, you are eligible for a</i18n>
          </span><span class="font-bold text-sm ml-1 text-dark-3">
            <i18n> free 1-month upgrade </i18n>
          </span> <span class="text-dark-4 text-xs md:text-sm mt-2">
            <i18n>to Quizizz Premium</i18n>
          </span>
        </div>
        <div class="flex items-center">
          <Button
            :title="$i18n('Activate Upgrade')"
            class="w-8"
            size="md"
            :loading="upgradeButtonLoading"
            type="super"
            @click="handleUpgrade"
          />
          <ReferralExpiryTimer addLeftMargin />
        </div>
      </div>
      <div
        v-else
        class="flex flex-col items-center"
      >
        <div>
          <img
            height="196"
            width="204"
            src="https://cf.quizizz.com/image/Celebration.png"
            class="w-51 h-49"
          />
        </div>
        <div class="text-2xl font-bold mt-4">
          <i18n>Your account has been upgraded</i18n>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>

import ReferralApiService from '~/services/apis/ReferralApiService';
import referralMixin from '~/mixins/referralMixin';
import ReferralExpiryTimer from '~/components/Referral/ReferralExpiryTimer.vue';

export default {
  components: { ReferralExpiryTimer },
  mixins: [referralMixin],
  emits: ['close'],
  data() {
    return {
      shouldShow: false,
      referrerName: '',
      upgradeButtonLoading: false,
      inProductActivation: false,
      hasNotUpgraded: true,
    };
  },

  computed: {
    getOrgName() {
      return this.$user.organizationName;
    },
  },

  mounted() {
    this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFERRAL_STATS_MODAL_SHOWN, {
      campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
    });
  },

  methods: {

    async handleUpgrade() {
      this.upgradeButtonLoading = true;
      const response = await ReferralApiService.activateTrial();
      this.upgradeButtonLoading = false;
      if (response.success) {
        this.hasNotUpgraded = false;
        setTimeout(() => {
          this.$emit('close');
          this.openSuperReferralModalForBasic(true);
        }, 2000);
        this.$analytics.logEvent(this.$webEvents.USER_TRIAL_ACTIVATED, {
          campaignId: this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER,
        });
      }
    },

    close() {
      if (!this.hasNotUpgraded) {
        window.location.reload();
      } else {
        this.$emit('close');
      }
    },

  },
};
</script>

<style scoped lang="scss"></style>

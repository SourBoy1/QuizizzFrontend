<template>
  <div
    v-if="showSidebardCard && isCountryUSA"
    class="rounded bg-lilac-faded p-2.5 mt-3 cursor-pointer"
    @click="handleCTAClick"
  >
    <div class="mb-3">
      <p class="font-bold text-violet text-sm">
        <i18n :injections="[getTrialDays]">
          Expiring in {$1} days
        </i18n>
      </p>
    </div>
    <p class="text-dark-50% text-[10px] flex">
      <span class="basis-8/12"><i18n>Explore options to keep your access</i18n></span>
      <span class="basis-4/12 flex justify-center items-center">
        <Button
          size="sm"
          class="rounded-full z-1 bg-lilac-20% text-lilac-dark cursor-pointer"
          ticon="far fa-arrow-right"
          ticonClasses="font-semibold"
          type="primary"
          @click="handleCTAClick"
        />
      </span>
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'TrialExpiryCard',

  computed: {
    ...mapGetters('root', ['serverData']),
    getTrialDays() {
      return this.$user.trialDaysLeft;
    },

    isCountryUSA() {
      return this.serverData.requestCountry === 'US';
    },

    showSidebardCard() {
      return this.$user.trialDaysLeft > 0 && this.$user.trialDaysLeft <= 15 && !this.$user.isCorporate;
    },
  },

  methods: {
    handleCTAClick() {
      const eventName = this.$webEvents.HOME_PAGE_TO_SCHOOL_PRICING_PAGE_INDIVIDUAL_PLAN_REFER;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        campaignId: this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
      });
      this.$router.push('/super-pricing?source=nav');
    },
  },
};
</script>

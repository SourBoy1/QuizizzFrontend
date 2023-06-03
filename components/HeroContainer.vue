<template>
  <div>
    <Hero :type="accountType" />
  </div>
</template>

<script>
import HotjarService from '~/services/HotjarService';

export default {

  computed: {
    accountType() {
      const user = this.$user;
      const planName = this.$user.plan;
      HotjarService.setUserAttributes(user);
      if (!user.id) {
        return this.$constants.AccountTypes.ANONYMOUS;
      }

      if (user.isPartOfAnOrganization && planName !== '') {
        if (!user.hasActiveSnDPlan && user.isSuper) {
          return this.$constants.AccountTypes.SUPER;
        }
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

      // If none of the above, it must be a corporate account
      switch (planName) {
        case 'Intro':
          return this.$constants.AccountTypes.CORPORATE_INTRO;
        case 'Standard':
          return this.$constants.AccountTypes.CORPORATE_STANDARD;
        case 'Standard (Non Profit)':
          return this.$constants.AccountTypes.CORPORATE_STANDARD_NONPROFIT;
        case 'Premier':
          return this.$constants.AccountTypes.CORPORATE_PREMIER;
        case 'Starter':
          return this.$constants.AccountTypes.CORPORATE_STARTER;
        default:
          return this.$constants.AccountTypes.SUPER;
      }
    },
  },
};
</script>

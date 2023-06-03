<template>
  <Lozenge
    v-if="referralDaysLeftText && isUserFromUSA"
    size="sm"
    containerClasses="bg-yellow text-light-3"
    :title="referralDaysLeftText"
    :inline="false"
  />
</template>

<script>

import { getReferralDaysLeftText } from '~/utils/ReferralUtils';
import CountryMixin from '~/mixins/CountryMixin';

export default {
  mixins: [CountryMixin],
  props: {
    referralDaysLeftText: {
      type: String,
      default: getReferralDaysLeftText(),
    },
  },
};
</script>

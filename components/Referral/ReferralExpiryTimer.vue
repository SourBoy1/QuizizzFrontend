<template>
  <Timer
    v-if="isUserFromUSA"
    :endDate="$constants.REFERRAL.SUPER_GIFTING_EXPIRY_DATE"
    :showTimerAfterEndDate="false"
    v-bind="$attrs"
  />
</template>

<script>
import CountryMixin from '~/mixins/CountryMixin';
import Timer from '~/components/Referral/Timer.vue';

export default {
  components: { Timer },
  mixins: [CountryMixin],
};
</script>

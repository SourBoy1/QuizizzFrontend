<template>
  <div class="mt-6 mx-4 p-4 bg-lilac-10% border border-lilac-faded rounded-lg">
    <p class="text-sm text-dark-2 font-bold text-center">
      <span class="text-6xl">{{ $user.trialDaysLeft }}</span> DAYS
    </p>
    <p class="text-dark-2 text-xs mb-4">
      <i18n>remaining in your trial</i18n>
    </p>
    <Button
      size="sm"
      type="link"
      :title="$i18n('Upgrade Now')"
      class="w-full bg-light-3 shadow-soft-low !min-w-full !max-w-[100px] h-auto"
      :loading="redirectStarted"
      @click.stop="redirectToCorporatePricing"
    />
  </div>
</template>

<script>
export default {
  emits: [],
  data() {
    return {
      redirectStarted: false,
    };
  },

  methods: {
    redirectToCorporatePricing() {
      const eventName = this.$webEvents.QFW_UPGRADE_BUTTON_CLICKED;
      this.$analytics.logEvent(eventName, {
        button_source: 'left_panel',
      });
      this.redirectStarted = true;
      setTimeout(() => {
        // this.$router.push('/forwork/plans?source=upgrade-from-trial&feat=left-nav');
        this.$eventBus.$emit('qfwPricingModal:show', { source: 'upgrade-from-trial', feat: 'left-nav' });
        this.redirectStarted = false;
      }, 500);
    },
  },
};
</script>

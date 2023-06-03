<template>
  <div class="mt-6 mx-4 p-4 bg-lilac-10% border border-lilac-faded rounded-lg">
    <p class="text-dark-2 text-xs mb-4 text-center font-semibold">
      <i18n>Want to host more than 20 participants?</i18n>
    </p>
    <Button
      size="sm"
      type="link"
      :title="$i18n('Upgrade Now')"
      class="w-full bg-light-3 shadow-soft-low"
      :loading="redirectStarted"
      @click.stop="openPricingModal"
    />
  </div>
</template>

<script>
export default {

  data() {
    return {
      redirectStarted: false,
    };
  },

  methods: {
    openPricingModal() {
      const eventName = this.$webEvents.QFW_UPGRADE_FROM_STARTER_PLAN_BUTTON_CLICKED;
      this.$analytics.logEvent(eventName, {
        button_source: 'left_panel',
      });
      this.$store.dispatch('uiManager/toggleQfwModal');
    },
  },
};
</script>

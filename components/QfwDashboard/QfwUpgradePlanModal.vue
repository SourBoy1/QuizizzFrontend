<template>
  <Modal
    v-if="shouldShow"
    size="md"
    titleCustomClasses="text-xl"
    :style="{ zIndex: 1000008 }"
    @close="close()"
  >
    <div class="text-xs pb-5 flex flex-col items-center">
      <img
        class="w-45 h-18"
        src="https://cf.quizizz.com/image/Interacting_Devices 1.png"
      />
      <div class="pt-4 text-sm font-bold text-center w-4/5">
        <i18n>
          Upgrade to invite teammates and collaborate with them on hosting and editing quizzes
        </i18n>
      </div>
    </div>
    <div class="flex gap-3 mt-4 justify-center">
      <Button
        type="primary"
        :title="$i18n('Upgrade')"
        :aria-label="$i18n('Upgrade')"
        size="sm"
        :loading="isLoading"
        :disabled="isLoading"
        @click="upgradePlan"
      />
    </div>
  </Modal>
</template>
<script>

export default {
  props: {
    closeUpgradeModal: {
      type: Function,
      default: () => this.$router.back(),
    },
    source: {
      type: String,
      default: '',
    },
  },
  emits: [],

  data() {
    return {
      isLoading: false,
      shouldShow: false,
      buttonSource: '',
    };
  },

  computed: {

  },

  watch: {

  },
  mounted() {
    this.$eventBus.$on('qfwUpsellModal:open', this.show);
  },

  beforeUnmount() {
    this.$eventBus.$off('qfwUpsellModal:open', this.show);
  },

  methods: {
    upgradePlan() {
      const eventName = this.$webEvents.QFW_UPGRADE_BUTTON_CLICKED;
      this.$analytics.logEvent(eventName, {
        button_source: this.buttonSource,
        role_description: this.$user.userStore?.roleDescription,
        plan_id: this.$user.subscription.id,
        plan_interval: this.$user.subscription.interval,
      });
      this.close();
      this.$eventBus.$emit('qfwPricingModal:show', { source: 'upgrade-plan-modal' });
    },

    show(source) {
      this.shouldShow = true;
      this.buttonSource = source;
    },

    close() {
      this.shouldShow = false;
    },
  },

};
</script>

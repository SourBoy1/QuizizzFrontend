<template>
  <Modal
    :title="$i18n('Confirm Visibility Change to Public')"
    :shouldCloseOnMaskClick="true"
    dismissOnOverlayClick
    :button1="{
      type: 'other',
      title: $i18n('Cancel'),
    }"
    :button2="{
      dataCy: 'public-visibility-modal-confirm-button',
      type: 'primary',
      title: $i18n('Confirm'),
    }"
    :stickToBottom="isStuckToBottom"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="$emit('confirm')"
  >
    <div class="text-dark-4 text-s">
      <p class="public-visibility-modal-p">
        <i18n :injections="[contentType, upgradePlanText]">
          Since August 2022, the ability to make your {$1} private will only be available on a {$2} plan.
        </i18n>
      </p>
      <p>
        <i18n :injections="[contentType]">
          If you choose to make this {$1} public, it cannot be made private again unless you upgrade.
        </i18n>
      </p>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    media: {
      type: Object,
      default() {
        return {
          url: '',
          meta: {
            width: 0,
            height: 0,
            layout: '',
          },
        };
      },
    },

    showMobileLayout: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      default: 'quiz',
    },
  },
  emits: ['close', 'confirm'],

  data() {
    return {
      settingFocusElementTimeout: null,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    isStuckToBottom() {
      return this.showMobileLayout && !this.isDesktop;
    },
    contentType() {
      if (this.type === 'presentation') {
        return this.$i18n('lesson');
      }
      return this.$i18n('quiz');
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },
    upgradePlanText() {
      return this.showIndividualPlan ? 'Individual' : 'Super';
    },
  },

  beforeUnmount() {
    this.settingFocusElementTimeout && clearTimeout(this.settingFocusElementTimeout);
  },
};
</script>

<style lang="scss" scoped>
.public-visibility-modal-p {
  margin-bottom: 20px;
}</style>

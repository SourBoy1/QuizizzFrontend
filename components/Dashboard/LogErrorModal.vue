<template>
  <Modal
    v-if="showErrorLogModal"
    icon="fas fa-info"
    :title="title"
    :button1="{
      title: $i18n('Close'),
      type: 'other',
      size: 'sm',
    }"
    @button1-click="close"
    @close="close"
  >
    <template #subtitle-text>
      <div class="text-red-dark text-xs">
        {{ subtitle }}
      </div>
    </template>
    <div
      v-for="(log, logIndex) in errors"
      :key="log.title"
      class="flex justify-between items-center px-4 py-2"
      :class="{
        'border-b border-dark-6': logIndex < errors.length - 1,
      }"
    >
      <div class="text-dark-2 text-sm font-semibold">
        {{ log.title }}
      </div>
      <FA
        v-tooltip.right="log.description"
        :icon="log.hasFailed ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'"
        :class="{
          'text-red-dark': log.hasFailed,
          'text-green-dark': !log.hasFailed,
        }"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('uiManager', ['showErrorLogModal', 'errorModalConfig']),

    errors() {
      return this.errorModalConfig.errors;
    },

    title() {
      return this.errorModalConfig.title;
    },

    subtitle() {
      return this.errorModalConfig.subtitle;
    },
  },

  methods: {
    close() {
      this.$store.dispatch('uiManager/toggleLogErrorModal');
    },
  },
};
</script>

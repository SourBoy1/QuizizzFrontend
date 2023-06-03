<template>
  <div
    class="fixed bottom-0 rounded-t-lg shadow-lg z-overlay right-8"
    :class="{
      'bg-light': isInProgress,
      'bg-green-faded border-t border-x border-green-dark': isSuccessfull,
      'bg-red-faded border-t border-x border-red-dark': hasError,
    }"
  >
    <section
      class="flex justify-between"
      :class="{
        'p-4': isInProgress,
        'pt-4 px-4': !isInProgress,
      }"
    >
      <div class="flex flex-col">
        <h2 class="text-sm font-semibold text-dark-2 mr-17">
          <FA
            v-if="!!titleIcon"
            :icon="titleIcon"
            :size="16"
            class="mr-2"
            :class="hasError ? 'text-red-dark' : 'text-green-dark'"
          />
          {{ bottomProgressTitle }}
        </h2>
        <h3
          class="text-xs text-dark-80% mt-1 max-w-52"
          :class="{
            'ml-7': !!titleIcon,
          }"
        >
          {{ bottomProgressSubtitle }}
        </h3>
      </div>
      <div class="flex">
        <Button
          v-if="isInProgress"
          type="link"
          size="sm"
          licon="fas fa-chevron-down"
          class="mr-4 transition-transform duration-200 transform"
          :class="{
            'rotate-180': isCollapsed,
          }"
          @click="toggleCollapsed"
        />
        <Button
          type="custom"
          customClasses="text-dark-2 font-semibold"
          size="sm"
          licon="fas fa-times"
          @click="close(false)"
        />
      </div>
    </section>

    <hr
      v-if="isInProgress"
      class="w-full border-t border-dark-6"
    />

    <section
      v-if="!isCollapsed"
      class="p-4"
    >
      <div
        v-if="isInProgress"
        class="flex items-center"
      >
        <ProgressBar
          emulateProgress
          :currentValue="current"
          :maxValue="leftToDo"
        />
        <PopoverConfirmer
          :open="shouldShowConfirmer"
          type="info"
          placement="top"
          :content="{
            title: $i18n('Are you sure you want to cancel?'),
            subTitle: $i18n('You will not lose files that have already been uploaded from this batch.'),
          }"
          :button1="{
            title: $i18n('Don\'t cancel'),
          }"
          :button2="{
            title: $i18n('Yes, cancel'),
            type: 'primary',
            loading: isBulkImportBeingCancelled,
          }"
          @button1Clicked="shouldShowConfirmer = false"
          @button2Clicked="handleCancel"
        >
          <Button
            class="ml-2"
            type="link"
            size="sm"
            :title="$i18n('Cancel')"
          />
        </PopoverConfirmer>
      </div>

      <div
        v-else-if="isSuccessfull"
        class="pl-6"
      >
        <Button
          v-if="!isEmpty(bottomProgressState.successBtnConfig)"
          v-bind="bottomProgressState.successBtnConfig"
          type="cta"
          size="sm"
          @click="handleCtaClick"
        />
      </div>

      <div
        v-else-if="hasError"
        class="pl-6"
      >
        <Button
          v-if="!isEmpty(bottomProgressState.errorBtnConfig)"
          v-bind="bottomProgressState.errorBtnConfig"
          type="danger-dark"
          size="sm"
          @click="handleCtaClick"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

export default {
  data() {
    return {
      isCollapsed: false,
      pollInterval: null,
      shouldShowConfirmer: false,
      isBulkImportBeingCancelled: false,
    };
  },

  computed: {
    ...mapGetters('uiManager', ['bottomProgressState']),

    titleIcon() {
      if (this.hasError) {
        return 'fas fa-times-circle';
      }

      if (this.isSuccessfull) {
        return 'fas fa-check-circle';
      }

      return '';
    },

    bottomProgressTitle() {
      return this.bottomProgressState.title;
    },

    bottomProgressSubtitle() {
      return this.bottomProgressState.subtitle;
    },

    current() {
      return this.bottomProgressState.current;
    },

    leftToDo() {
      return this.bottomProgressState.maxValue;
    },

    isInProgress() {
      return this.bottomProgressState.isInProgress;
    },

    hasError() {
      return !this.bottomProgressState.isInProgress && this.bottomProgressState.hasErrored;
    },

    isSuccessfull() {
      return !this.bottomProgressState.isInProgress && !this.bottomProgressState.hasErrored;
    },

    cancelPolling() {
      return this.bottomProgressState.cancelPolling;
    },

    blacklistRoutes() {
      return this.bottomProgressState.blacklistRoutes;
    },
  },

  watch: {
    $route(to) {
      if (this.blacklistRoutes.includes(to.fullPath)) {
        this.close(true);
      }
    },

    cancelPolling(shouldCancel) {
      if (shouldCancel) {
        this.stopPolling();
      }
    },
  },

  created() {
    this.$store.dispatch('root/hideHelpButton');
  },

  mounted() {
    if (this.bottomProgressState.pollOn) {
      this.bottomProgressState.pollOn();

      this.pollInterval = setInterval(this.bottomProgressState.pollOn, this.bottomProgressState.pollTime);
    }
  },

  beforeUnmount() {
    this.$store.dispatch('root/showHelpButton');

    this.stopPolling();
  },

  methods: {
    isEmpty,
    close(isInternalClose = false) {
      if (!isInternalClose && this.bottomProgressState.onClose) {
        this.bottomProgressState.onClose();
      }

      this.$store.dispatch('uiManager/toggleBottomProgressPopUp');
    },

    async handleCancel() {
      this.isBulkImportBeingCancelled = true;
      await this.bottomProgressState.onCancel(this);
      this.isBulkImportBeingCancelled = false;
    },

    toggleCollapsed() {
      this.isCollapsed = !this.isCollapsed;
    },

    handleCtaClick() {
      if (this.isSuccessfull) {
        this.bottomProgressState.successBtnConfig.click(this);
        return;
      }
      this.bottomProgressState.errorBtnConfig.click(this);
    },

    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
    },
  },
};
</script>

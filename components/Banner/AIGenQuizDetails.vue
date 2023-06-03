<template>
  <div class="w-full">
    <div class="flex items-center">
      <div class="w-12 h-12 flex justify-center items-center bg-dark-5% text-dark-3 rounded-full">
        <FA
          icon="fal fa-wand-magic-sparkles"
          :size="18"
        />
      </div>
      <div class="description ml-4">
        <div class="title font-semibold text-dark-2 text-lg">
          <i18n :injections="[questionsGenerated]">
            {$1} Questions generated
          </i18n>
        </div>
        <div class="subtitle mt-1 text-xs text-dark-3">
          <i18n>To ensure accuracy, we recommend reviewing and editing questions before saving the quiz</i18n>
        </div>
      </div>
    </div>

    <p
      v-if="showDocScannedBanner"
      class="doc-scan mt-4 p-2 flex items-center bg-dark-2% text-dark-3 text-xxs rounded"
    >
      <FA
        icon="fas fa-sparkles"
        :size="11"
        class="mr-2"
      />
      <i18n>We could scan</i18n>
      <span class="font-semibold">&nbsp;{{ documentScannedPercent }}%&nbsp;</span>
      {{ scanInfo }}
    </p>
  </div>
</template>

<script>
import Constants from '~/config/Constants';

export default {
  props: {
    questionsGenerated: {
      type: Number,
      default: 0,
    },
    documentScannedPercent: {
      type: Number,
      default: 0,
    },
    aiGenerationType: {
      type: String,
      default: null,
    },
  },

  computed: {
    showDocScannedBanner() {
      return this.documentScannedPercent < 90;
    },
    scanInfo() {
      let contentType = '';
      switch (this.aiGenerationType) {
        case Constants.AiQuizGenModes.USING_OPEN_TEXT:
          contentType = 'text';
          break;
        case Constants.AiQuizGenModes.USING_FILE_UPLOAD:
          contentType = 'file';
          break;
        default:
          contentType = 'file';
          break;
      }

      return this.$i18n('of your {$1}. Please try smaller {$2} for better results.', [contentType, contentType]);
    },
  },
};
</script>

<style></style>

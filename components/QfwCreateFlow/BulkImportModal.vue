<template>
  <Modal
    :zeroPadding="true"
    :zeroMargin="true"
    :showCloseModalBtn="true"
    closeBtnClasses="text-xl"
    :dismissOnOverlayClick="dismissOnOverlayClick"
    size="md"
    containerClasses="p-6"
    @close="closeBulkImportModal"
  >
    <div class=" flex flex-col gap-[18px]">
      <span class="text-lg font-bold">
        <i18n>Import your existing content</i18n>...
      </span>

      <div
        v-if="canShowAiQuizGenerator"
        class="xs:min-w-90 border-1 border-dark-6 rounded-lg p-2 xs:p-4 flex justify-between items-center import-cards"
        @click="handleOpenAiQuizGeneratorModal"
      >
        <div class="flex gap-3">
          <div class="rounded-50% flex justify-center items-center bg-dark-2% p-2 xs:p-5">
            <FA
              icon="fa-regular fa-wand-magic-sparkles"
              class="text-lilac"
              size="30"
            />
          </div>
          <div class="flex flex-col gap-0.5 justify-center xs:max-w-34">
            <i18n class="text-sm xs:text-base font-semibold text-dark-2">
              Import from
              any doc using AI
            </i18n>
          </div>
        </div>

        <div class="rounded-50% bg-dark-2% hover:bg-dark-6 w-8 h-8 flex items-center justify-center cursor-pointer">
          <FA
            icon="fa-regular fa-arrow-right"
            class="text-dark-5"
            size="14"
          />
        </div>
      </div>

      <div
        class="xs:min-w-90 border-1 border-dark-6 rounded-lg p-2 xs:p-4 flex justify-between items-center import-cards"
        @click="handleOpenBulkImportModal"
      >
        <div class="flex gap-3">
          <div class="rounded-50% flex justify-center items-center bg-dark-2% p-2 xs:p-5">
            <img
              src="https://cf.quizizz.com/image/google-forms-import.png"
              alt="import using google forms"
              class="w-8 h-8"
            />
          </div>
          <div class="flex flex-col gap-0.5 justify-center xs:max-w-33">
            <i18n class="text-sm xs:text-base font-semibold text-dark-2">
              Import from
              Google Forms
            </i18n>
          </div>
        </div>

        <div class="rounded-50% bg-dark-2% hover:bg-dark-6 w-8 h-8 flex items-center justify-center cursor-pointer">
          <FA
            icon="fa-regular fa-arrow-right"
            class="text-dark-5"
            size="14"
          />
        </div>
      </div>

      <div
        class="xs:min-w-90 border-1 border-dark-6 rounded-lg p-2 xs:p-4 flex justify-between items-center import-cards"
        @click="handleOpenGoogleForms"
      >
        <div class="flex gap-3">
          <div class="rounded-50% flex justify-center items-center bg-dark-2% p-2 xs:p-5">
            <img
              src="https://cf.quizizz.com/image/google-slides-import.png"
              alt="import using google forms"
              class="w-8 h-8"
            />
          </div>
          <div class="flex flex-col gap-0.5 justify-center xs:max-w-33">
            <i18n class="text-sm xs:text-base font-semibold text-dark-2">
              Import from
              Google Slides
            </i18n>
          </div>
        </div>

        <div class="rounded-50% bg-dark-2% hover:bg-dark-6 w-8 h-8 flex items-center justify-center cursor-pointer">
          <FA
            icon="fa-regular fa-arrow-right"
            class="text-dark-5"
            size="14"
          />
        </div>
      </div>

      <div
        class="xs:min-w-90 border-1 border-dark-6 rounded-lg p-2 xs:p-4 flex justify-between items-center import-cards"
        @click="importFromSpreadSheet"
      >
        <div class="flex gap-3">
          <div class="rounded-50% flex justify-center items-center bg-dark-2% p-2 xs:p-5">
            <img
              src="https://cf.quizizz.com/image/google-spreadsheet-import.png"
              alt="import using google forms"
              class="w-8 h-8"
            />
          </div>
          <div class="flex flex-col gap-0.5 justify-center xs:max-w-33">
            <i18n class="text-sm xs:text-base font-semibold text-dark-2">
              Import from
              Spreadsheet
            </i18n>
          </div>
        </div>

        <div class="rounded-50% bg-dark-2% hover:bg-dark-6 w-8 h-8 flex items-center justify-center cursor-pointer">
          <FA
            icon="fa-regular fa-arrow-right"
            class="text-dark-5"
            size="14"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    closeBulkImportModal: {
      type: Function,
      default: () => false,
    },
    dismissOnOverlayClick: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      default: '',
    },
  },
  emits: ['importSpreadsheetNoQuestionsClick', 'handleImportGoogleForms', 'toggleBulkImport'],

  computed: {
    ...mapGetters('root', ['isMobile']),

    canShowAiQuizGenerator() {
      if (this.isMobile) {
        return false;
      }
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.AI_QUIZ_GENERATOR);
    },
  },

  mounted() {
    this.$analytics.logEvent(this.$webEvents.QFW_CREATE_IMPORT_MODAL_OPEN, { source: this.source });
  },

  methods: {
    handleOpenAiQuizGeneratorModal() {
      this.$emit('openQuizGeneratorModal');
    },

    importFromSpreadSheet() {
      this.closeBulkImportModal();
      this.$analytics.logEvent(this.$webEvents.QFW_CREATE_IMPORT_MODAL_GOOGLE_SHEET, { source: this.source });
      this.$emit('importSpreadsheetNoQuestionsClick');
    },

    handleOpenBulkImportModal() {
      this.$analytics.logEvent(this.$webEvents.QFW_CREATE_IMPORT_MODAL_GOOGLE_FORMS, { source: this.source });
      this.$emit('handleImportGoogleForms');
    },

    handleOpenGoogleForms() {
      this.$analytics.logEvent(this.$webEvents.QFW_CREATE_IMPORT_MODAL_GOOGLE_SLIDES, { source: this.source });
      this.$emit('toggleBulkImport');
    },
  },
};
</script>

<style lang="scss" scoped>
.import-cards {
  transition: 0.3s;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
  }
}
</style>

<template>
  <Modal
    :zeroPadding="true"
    :zeroMargin="true"
    :hideHeader="true"
    :fixedHeight="false"
    :showCloseModalBtn="false"
    :disableOverflow="true"
    backgroundColor=""
    containerClasses="w-full h-full qfw-create-modal"
    :class="[useQuizGenerator ? 'qfw-quiz-gen-modal' : 'qfw-create-modal']"
    size="custom"
    @close="handleBackBtn"
  >
    <div class="relative flex justify-center min-h-screen qfw-create-modal">
      <div class="flex flex-col gap-8 mt-18 xs:mt-14 md:mt-29 h-max qfw-create-container">
        <transition
          v-if="!useQuizGenerator"
          appear
          enter-active-class="animate__animated animate__fadeInUp animation-duration-300"
          leave-active-class="animate__animated animate__fadeOutDown animation-duration-200"
        >
          <span
            class="rounded-50% w-10 flex justify-center items-center bg-dark-2% p-2 cursor-pointer hove:text-dark-5"
            @click="handleBackBtn"
          >
            <FA
              icon="fa-regular fa-arrow-left text-dark-4"
              class="text-dark-4"
              size="24"
            />
          </span>
        </transition>
        <transition
          v-if="!useQuizGenerator"
          appear
          enter-active-class="animate__animated animate__fadeInUp animation-duration-300"
          leave-active-class="animate__animated animate__fadeOutDown animation-duration-200"
        >
          <div class="flex gap-2 items-end">
            <img
              src="https://cf.quizizz.com/image/create-flow-bulb.png"
              class="w-9 h-11 mb-1"
            />
            <i18n class="text-3xl font-bold">
              Create new activity
            </i18n>
          </div>
        </transition>
        <!-- Cards -->
        <transition
          v-if="!useQuizGenerator"
          appear
          enter-active-class="animate__animated animate__fadeInUp animation-duration-300"
          leave-active-class="animate__animated animate__fadeOutDown animation-duration-200"
        >
          <div :class="`grid grid-cols-${gridConfig.MAX_COL} gap-[18px]`">
            <div
              v-for="card, ind in cards"
              :key="`card-${ind}`"
              :class="['create-card flex gap-3 bg-light duration-300 cursor-pointer xs:min-w-90 rounded-lg p-2 xs:p-4',
                       card.colSpan ? `col-span-${card.colSpan}` : '',
              ]"
              @click="card.onClick"
            >
              <div
                class="flex justify-center items-center min-w-11 min-h-11 xs:min-w-16 xs:min-h-16 bg-lilac-faded rounded-full"
              >
                <FA
                  :icon="`${card.icon} text-dark-4`"
                  class="text-lilac-dark"
                  size="24"
                />
              </div>
              <div class="flex flex-col gap-1 justify-center">
                <div class="flex items-center">
                  <span class="text-sm xs:text-base font-semibold text-dark-3">{{ card.title }}</span>
                  <Lozenge
                    v-if="card.isBeta"
                    :title="$i18n('BETA')"
                    size="xs"
                    class="ml-2 bg-dark-10% h-min px-2 py-0.5 text-dark-3"
                  />
                  <Lozenge
                    v-if="card.tag"
                    :title="card.tag"
                    size="xs"
                    class="ml-2 bg-yellow-faded h-min px-2 py-0.5 text-dark-3"
                  />
                </div>
                <span class="text-xs xs:text-sm font-normal text-dark-4">{{ card.subtitle }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <AiQuizGenModal
        v-if="useQuizGenerator && canShowAiQuizGenerator"
        :source="sourceForQuizGenModal || 'create-flow-modal'"
        @close="handleCloseGenerateQuizClick"
      />

      <QfwCreateFlowBulkImportModal
        v-if="showBulkImportModal"
        :closeBulkImportModal="closeBulkImportModal"
        source="content_creation_modal"
        @handleImportGoogleForms="$emit('handleImportGoogleForms')"
        @importSpreadsheetNoQuestionsClick="importSpreadsheetNoQuestionsClick"
        @toggleBulkImport="$emit('toggleBulkImport')"
        @openQuizGeneratorModal="openQuizGeneratorModal('bulk-import-create-flow')"
      />

      <QfwCreateFlowImportQfwTemplates
        v-if="showImportQfwTemplatesModal"
        :closeImportQfwTemplatesModal="closeImportQfwTemplatesModal"
      />

      <ImportSpreadsheetModal
        v-if="showImportSpreadsheetModal"
        :questionImportLimit="$constants.MaxQuestionsLimit"
        @close="closeSpreadsheetImportMoadal"
        @saveSpreadSheetQuestions="onSaveSpreadSheetQuestions"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import HotjarService, { HotjarEvents } from '~/services/HotjarService';

const CARDS = {
  QUIZ: 'quiz',
  PRESENTATION: 'presentation',
  IMPORT: 'import',
  TEMPLATE: 'template',
  AI_QUIZ_GENERATE: 'ai_quiz_generate',
};

export default {
  props: {
    toggleModal: {
      type: Function,
      default: () => false,
    },
    handleCreateContent: {
      type: Function,
      default: () => false,
    },
  },
  emits: ['handleImportGoogleForms', 'toggleBulkImport'],

  data() {
    return {
      showBulkImportModal: false,
      showImportQfwTemplatesModal: false,
      showImportSpreadsheetModal: false,
      useQuizGenerator: false,
      sourceForQuizGenModal: null,
    };
  },

  computed: {
    ...mapGetters('root', ['isMobile']),

    gridConfig() {
      return {
        MAX_COL: this.isMobile ? 1 : 2,
      };
    },

    cards() {
      const cards = [
        {
          name: CARDS.QUIZ,
          title: this.$i18n('Create a Quiz'),
          subtitle: this.$i18n('Add from 10+ question types'),
          icon: 'fal fa-octagon-plus',
          onClick: () => this.handleCreateContent(CARDS.QUIZ),
        },
        {
          name: CARDS.PRESENTATION,
          title: this.$i18n('Create a Lesson'),
          subtitle: this.$i18n('Combine slides and questions for the best training'),
          icon: 'fal fa-presentation-screen',
          onClick: () => this.handleCreateContent(CARDS.PRESENTATION),
        },
        {
          name: CARDS.IMPORT,
          title: this.$i18n('Import'),
          subtitle: this.$i18n('Google Forms, Slides or Spreadsheets'),
          icon: 'fal fa-file-import',
          onClick: this.handleBulkImportClick,
        },
        {
          name: CARDS.TEMPLATE,
          title: this.$i18n('Use Templates'),
          subtitle: this.$i18n('Choose pre-designed templates'),
          icon: 'fal fa-retweet',
          onClick: this.handleImportQfwTemplatesClick,
        },
      ];

      if (this.canShowAiQuizGenerator) {
        cards.push({
          name: CARDS.AI_QUIZ_GENERATE,
          title: this.$i18n('Create quiz from your content with AI'),
          subtitle: this.$i18n('Upload any PDF, PPT or DOC file and get an auto generated quiz in minutes!'),
          icon: 'fal fa-wand-magic-sparkles',
          colSpan: this.gridConfig.MAX_COL,
          isBeta: true,
          onClick: this.handleGenerateQuizClick,
        });
      }

      return cards;
    },

    canShowAiQuizGenerator() {
      if (this.isMobile) {
        return false;
      }
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.AI_QUIZ_GENERATOR);
    },
  },

  mounted() {
    this.$analytics.logEvent(this.$webEvents.QFW_CREATE_MODAL_OPEN, { source: this.$route.path });
    HotjarService.triggerEvent(HotjarEvents.HOTJAR_QFW_NEW_CREATE_FLOW);
  },

  methods: {
    handleBackBtn() {
      if (this.useQuizGenerator) {
        this.useQuizGenerator = false;
        return;
      }
      this.$analytics.logEvent(this.$webEvents.QFW_CREATE_MODAL_CLOSE, { source: this.$route.path });
      this.toggleModal();
    },

    openQuizGeneratorModal(source) {
      this.sourceForQuizGenModal = source;
      this.handleGenerateQuizClick();
      this.showBulkImportModal = false;
    },

    handleBulkImportClick() {
      this.showBulkImportModal = true;
    },
    closeBulkImportModal() {
      this.$analytics.logEvent(this.$webEvents.QFW_CREATE_IMPORT_MODAL_CLOSE);
      this.showBulkImportModal = false;
    },

    handleImportQfwTemplatesClick() {
      this.showImportQfwTemplatesModal = true;
    },
    closeImportQfwTemplatesModal() {
      this.$analytics.logEvent(this.$webEvents.QFW_CREATE_USE_TEMPLATE_MODAL_CLOSE);
      this.showImportQfwTemplatesModal = false;
    },

    importSpreadsheetNoQuestionsClick() {
      this.handleCreateContent('quiz', true);
    },

    closeSpreadsheetImportMoadal() {
      this.showImportSpreadsheetModal = false;
    },

    handleGenerateQuizClick() {
      this.useQuizGenerator = true;
    },

    handleCloseGenerateQuizClick() {
      this.useQuizGenerator = false;
      this.sourceForQuizGenModal = null;
    },

    close() {
      this.toggleModal();
    },
  },
};
</script>

<style lang="scss" scoped>
.qfw-create-modal {
  background: rgba(250, 245, 255, 0.55) !important;
  backdrop-filter: blur(16px) !important;
}

.qfw-quiz-gen-modal {
  background: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(6px) !important;
}

.create-card {
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06),
    0px 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.02);
  }
}
</style>

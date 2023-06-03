<template>
  <div class="relative">
    <button
      class="h-8 bg-purple flex gap-1.5 items-center rounded p-2 mr-3"
      @click="isExamplesOpen = !isExamplesOpen"
    >
      <FA
        icon="fas fa-desktop"
        class="text-light-3"
        :size="10"
      />
      <span class="text-light-3 text-sm font-bold"><i18n>Explore examples</i18n></span>
    </button>
    <div
      v-if="isExamplesOpen"
      class="absolute mt-1 z-10 top-1 w-[232px] max-h-[278px] overflow-y-auto bg-light-3 shadow right-3 top-8 px-4 rounded"
    >
      <p class="text-dark-2 text-base font-bold my-2">
        <i18n>Select to see examples</i18n>
      </p>
      <hr class="mb-2 text-dark-6" />
      <div
        v-click-outside="() => { isExamplesOpen = false }"
        class="flex flex-col gap-3 pb-3"
      >
        <button
          v-for="(question, index) in arrangedQuestions"
          :key="question.type"
          class="flex gap-2 p-1 rounded-lg hover:bg-dark-5%"
          @click.stop="handleQuestionTypeClickForPreview(index, question.type)"
        >
          <QuestionTypeIcon
            class="w-6 h-6"
            :type="question.type"
            :size="12"
          />
          <p class="text-sm font-semibold text-dark-2">
            {{ question.title }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import Constants from '~/config/Constants';

export default {

  props: {
    allQuestionTypesList: {
      type: Object,
      default: () => {},
    },
    questionTypesFromTemplate: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['questionTypeClickForPreview'],

  data() {
    return {
      isExamplesOpen: false,
      questionsList: [],
    };
  },

  computed: {
    arrangedQuestions() {
      const orderedQuestions = {};

      for (const questionType of this.questionTypesFromTemplate) {
        orderedQuestions[questionType] = this.allQuestionTypesList[questionType];
      }
      delete orderedQuestions[Constants.QuestionTypes.MSQ];

      return Object.values(orderedQuestions);
    },
  },

  methods: {
    handleQuestionTypeClickForPreview(index, type) {
      this.$analytics.logEvent(this.$webEvents.QTYPE_VISIBILITY_EXPLORE_EXAMPLES_BTN_CLICKED, {
        questionType: type,
      });
      this.$emit('questionTypeClickForPreview', index);
    },
  },

};
</script>

<style lang="scss" scoped>
</style>

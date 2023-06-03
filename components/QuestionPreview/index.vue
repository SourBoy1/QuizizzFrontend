<template>
  <transition
    appear
    enter-active-class="animate__animated animate__fadeInUp animation-duration-300"
    leave-active-class="animate__animated animate__fadeOutDown animation-duration-200"
  >
    <div
      data-cy="question-preview"
      class="w-full h-full overflow-auto select-none bg-dark-50%"
      :class="{ 'p-6': !fullScreen }"
    >
      <div
        class="quiz-question-preview-wrapper w-full h-full min-h-120 overflow-auto bg-dark flex flex-col justify-between"
        :class="{ 'rounded-lg': !fullScreen }"
      >
        <TopBar
          :quizId="quizId"
          :questionType="questionType"
          :currentQuestionIndex="bottomBar.currentQuestionIndex"
          :maxQuestions="maxQuestions"
          :isSingleQuestionPreview="isSingleQuestionPreview"
          @close="$emit('close')"
        />

        <QuestionPreviewCard
          class="preview-section relative w-full flex flex-1 justify-center items-center overflow-hidden"
          v-bind="propsForQuestionPreviewCardChildren"
        />

        <BottomBar
          v-model="bottomBar"
          :currentQuestion="currentQuestion"
          :maxQuestions="maxQuestions"
          :isPreviewForQuestionTypesVisibility="isPreviewForQuestionTypesVisibility"
          :isQuiz="isQuiz"
          :isQuestionSupported="!offlineMode ? true : isQuestionSupported"
          :isSingleQuestionPreview="isSingleQuestionPreview"
          @useTemplateClick="$emit('useTemplateClick', $event)"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { mapGetters } from 'vuex';

import TopBar from '~/components/QuestionPreview/TopBar.vue';
import BottomBar from '~/components/QuestionPreview/BottomBar.vue';

import { isQuestionForPoll, isWordCloudQuestion } from '~/utils/QuizUtils';

export default {
  emits: ['close', 'useTemplateClick'],

  components: {
    TopBar,
    BottomBar,
    QuestionPreviewCard: defineAsyncComponent(() => import('~/components/QuestionPreview/QuestionPreviewCard.vue')),
  },

  props: {
    initialQuestionIndex: {
      type: Number,
      default: 0,
    },

    isQuiz: {
      type: Boolean,
      required: true,
    },

    isQuizDraft: {
      type: Boolean,
      default: false,
    },

    questionsToShow: {
      type: Array,
      default: () => [],
    },

    fullScreen: {
      type: Boolean,
      default: false,
    },

    offlineMode: {
      type: Boolean,
      default: false,
    },

    isPreviewForQuestionTypesVisibility: {
      type: Boolean,
      default: false,
    },

    isSingleQuestionPreview: {
      type: Boolean,
      default: false,
    },

    quizId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      bottomBar: {
        showAnswers: false,
        currentQuestionIndex: this.initialQuestionIndex,
        showQuestionExplanation: false,
      },
    };
  },

  computed: {
    ...mapGetters('currentQuiz', ['draftQuestions', 'publishedQuestions']),
    ...mapGetters('contentEditor', ['getQuestionIndexById', 'selectedSlide']),
    ...mapGetters('root', ['deviceProps']),

    questionExplanation() {
      return this.currentQuestion.structure.explain;
    },

    questionType() {
      if (isQuestionForPoll(this.currentQuestion)) {
        return this.$constants.QuestionTypes.POLL;
      }

      if (isWordCloudQuestion(this.currentQuestion)) {
        return this.$constants.QuestionTypes.WORDCLOUD;
      }

      return this.currentQuestion.type;
    },

    currentSlideIndex() {
      return this.getQuestionIndexById(this.selectedSlide);
    },

    questionsList() {
      if (!this.questionsToShow.length) {
        if (this.isQuizDraft) {
          return this.draftQuestions;
        }

        return this.publishedQuestions;
      }

      return this.questionsToShow;
    },

    currentQuestion() {
      return this.questionsList[this.bottomBar.currentQuestionIndex];
    },

    maxQuestions() {
      return this.questionsList.length;
    },

    propsForQuestionPreviewCardChildren() {
      return {
        currentQuestion: this.currentQuestion,
        showAnswers: this.bottomBar.showAnswers,
        questionType: this.questionType,
        currentQuestionIndex: this.bottomBar.currentQuestionIndex,
        questionsList: this.questionsList,
        showQuestionExplanation: this.bottomBar.showQuestionExplanation,
        offlineMode: this.offlineMode,
      };
    },

    isQuestionSupported() {
      if (this.currentQuestion && this.currentQuestion?.type) {
        return this.currentQuestion.type === this.$constants.QuestionTypes.MCQ && Array.isArray(this.currentQuestion.structure.options) && this.currentQuestion.structure.options.length <= 4;
      }
      return true;
    },

  },

  mounted() {
    this.$store.dispatch('root/hideHelpButton');

    if (!this.isQuiz && this.currentSlideIndex >= 0) {
      this.bottomBar.currentQuestionIndex = this.currentSlideIndex;
    }
  },

  beforeUnmount() {
    this.$store.dispatch('root/showHelpButton');
  },

  methods: {
    handleReportQuestion() {
      this.$emit('close');
      this.$eventBus.$emit('reportQuiz:question', this.currentQuestion);
    },
  },
};
</script>

<style lang="scss" scoped>
  .quiz-question-preview-wrapper {
    font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont;

    .preview-section {
      height: calc(100% - 148px);
    }
  }
</style>

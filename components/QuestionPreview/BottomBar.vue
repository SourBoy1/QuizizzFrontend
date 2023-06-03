<template>
  <div class="relative flex items-center justify-between p-4 rounded-lg bg-dark-1">
    <div class="flex items-center gap-4">
      <Button
        v-tooltip.top="showAnswersButtonText + $i18n(' (Space bar)')"
        class="ml-3 answer-button button-shadow"
        :class="{
          'bg-lilac-dark': enableShowAnswersButton && modelValue.showAnswers, // Hide answers text case
          'disabled disabled-shadow': !enableShowAnswersButton,
          'hide-shadow': modelValue.showAnswers,
        }"
        size="xl"
        type="special"
        :licon="modelValue.showAnswers ? 'far fa-eye-slash' : 'far fa-eye'"
        :title="showAnswersButtonText"
        :aria-label="modelValue.showAnswers ? $i18n('Hide answers Keyboard Shortcut(Space)') : $i18n('Show answers Keyboard Shortcut(Space)')"
        :disabled="!enableShowAnswersButton"
        @click="toggleShowAnswers()"
      />
      <Button
        v-if="isPreviewForQuestionTypesVisibility"
        buttonClasses="h-13"
        :title="$i18n('Use this as template')"
        size="xl"
        type="special"
        @click="$emit('useTemplateClick', currentQuestion)"
      />
    </div>

    <div class="flex items-center h-full">
      <!-- Explanation Btn -->
      <div
        v-if="isQuiz"
        class="flex flex-col items-center w-14"
      >
        <Button
          v-tooltip.top="explanationButtonText + ' (E)'"
          class="h-10 w-14"
          customDisabledClasses="opacity-25 bg-light-20% text-light-3"
          liconClasses="disabled-icon-class"
          :licon="`fas ${explanationIcon}`"
          size="xl"
          type="transparent"
          :customIconSize="18"
          :disabled="!doesQuestionHaveAnswerExplanation"
          :aria-label="explanationButtonText"
          @click="toggleQuestionExplanation()"
        />
        <div
          class="text-light-50% text-xxs"
          :class="{ 'opacity-25': !doesQuestionHaveAnswerExplanation }"
        >
          {{ explanationButtonText }}
        </div>
      </div>

      <div
        v-if="isQuiz && !isSingleQuestionPreview"
        class="vertical-divider hidden md:block border border-light-10% rounded-2 ml-3 h-full"
      />

      <!-- Prev and Next Btns -->
      <template v-if="!isSingleQuestionPreview">
        <div class="flex flex-col items-center ml-3">
          <Button
            v-tooltip.top="$i18n('Previous ( \u2190 )')"
            class="h-10 w-14"
            licon="fas fa-play fa-rotate-180"
            customDisabledClasses="opacity-25 bg-light-20% text-light-3"
            :disabled="modelValue.currentQuestionIndex === 0 || isPreviewForQuestionTypesVisibility"
            size="xl"
            type="transparent"
            :aria-label="($i18n('Previous Keyboard Shortcut(Left Arrow)'))"
            @click="handleChangeQuestion(-1)"
          />
          <div
            class="text-light-50% text-xxs"
            :class="{ 'opacity-25': modelValue.currentQuestionIndex === 0 }"
          >
            <i18n>Previous</i18n>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center mb-0 ml-3">
          <Button
            v-tooltip.top="$i18n('Next ( \u2192 )')"
            class="h-10 w-14"
            licon="fas fa-play"
            customDisabledClasses="opacity-25 bg-light-20% text-light-3"
            :disabled="onLastQuestion || isPreviewForQuestionTypesVisibility"
            size="xl"
            type="transparent"
            :aria-label="($i18n('Next Keyboard Shortcut(Right Arrow)'))"
            @click="handleChangeQuestion(1)"
          />
          <div
            class="text-light-50% text-xxs"
            :class="{ 'opacity-25': onLastQuestion }"
          >
            <i18n>Next</i18n>
          </div>
        </div>
      </template>
    </div>
    <div
      v-if="!isQuestionSupported"
      class="banner-transition absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-light-3 flex items-center py-2 pl-2 pr-4 rounded-lg"
    >
      <FA
        icon="fa-solid fa-circle-info"
        class="text-brand-d w-8 h-8 justify-center"
        :size="20"
      />
      <h3 class="text-dark-1 text-lg font-semibold leading-6 text-center ml-1">
        “{{ questionTypeTitle }}” <i18n>is not supported in offline mode</i18n>
      </h3>
    </div>
  </div>
</template>

<script>
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';
import { mapGetters } from 'vuex';

import {
  doesQuestionHaveAnswerExplanations, doesQuestionRequireAnswer, isSlideForContent, getAssessmentTypeQuestions, getHigherOrderThinkingTypeQuestions, getOtherTypeQuestions,
} from '~/utils/QuizUtils';

export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
      validator: (val) => isNumber(val.currentQuestionIndex) && isBoolean(val.showAnswers) && isBoolean(val.showQuestionExplanation),
    },

    currentQuestion: {
      type: Object,
      required: true,
    },

    maxQuestions: {
      type: Number,
      required: true,
    },

    isQuiz: {
      type: Boolean,
      required: true,
    },
    isQuestionSupported: {
      type: Boolean,
      default: true,
    },

    isPreviewForQuestionTypesVisibility: {
      type: Boolean,
      default: false,
    },

    isSingleQuestionPreview: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['useTemplateClick', 'close', 'update:modelValue'],

  computed: {
    ...mapGetters('root', ['serverData']),
    doesQuestionHaveAnswerExplanation() {
      return doesQuestionHaveAnswerExplanations(this.currentQuestion);
    },

    explanationIcon() {
      return `fa-${!this.modelValue.showQuestionExplanation ? 'lightbulb-on' : 'question'}`;
    },

    showAnswersButtonText() {
      return this.modelValue.showAnswers ? this.$i18n('Hide answers') : this.$i18n('Show answers');
    },

    enableShowAnswersButton() {
      return doesQuestionRequireAnswer(this.currentQuestion) && !isSlideForContent(this.currentQuestion);
    },

    explanationButtonText() {
      return !this.modelValue.showQuestionExplanation ? this.$i18n('Explanation') : this.$i18n('Question');
    },

    onLastQuestion() {
      return this.modelValue.currentQuestionIndex === this.maxQuestions - 1;
    },

    isLoggedIn() {
      return this.$user.isLoggedIn;
    },

    questionTypes() {
      return {
        ...getAssessmentTypeQuestions(),
        ...getHigherOrderThinkingTypeQuestions(),
        ...getOtherTypeQuestions(),
        SLIDE: {
          type: this.$constants.SlideTypes.CONTENT_SLIDE_V2,
          title: this.$i18n('Slide'),
        },
      };
    },

    questionTypeTitle() {
      if (this.currentQuestion.type === this.$constants.QuestionTypes.MSQ) {
        return this.$i18n('Multiple-selection');
      } if (this.currentQuestion.type === this.$constants.QuestionTypes.MCQ && Array.isArray(this.currentQuestion.structure.options) && this.currentQuestion.structure.options.length > 4) {
        return this.$i18n('Multiple-choice with more than 4 options');
      }
      return this.questionTypes[this.currentQuestion.type].title;
    },
  },

  mounted() {
    window.addEventListener('keydown', this.onKeyDownEvent);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDownEvent);
  },

  methods: {
    onKeyDownEvent(ev) {
      if (ev.key === 'ArrowLeft') {
        if (this.modelValue.currentQuestionIndex !== 0) {
          this.handleChangeQuestion(-1);
        }
      }

      if (ev.key === 'ArrowRight') {
        if ((this.maxQuestions - 1) !== this.modelValue.currentQuestionIndex) {
          this.handleChangeQuestion(1);
        }
      }

      if (ev.code === 'KeyE') {
        this.toggleQuestionExplanation();
      }

      if (ev.code === 'Space') {
        ev.preventDefault();
        this.toggleShowAnswers();
      }
    },

    updateValue(updatedValue = {}) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        ...updatedValue,
      });
    },

    toggleShowAnswers() {
      if (this.enableShowAnswersButton) {
        this.$analytics.logEvent(this.$webEvents.PREVIEW_TOGGLE_SHOW_ANSWERS);

        if (!this.isLoggedIn) {
          this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW, { title: this.$i18n('See answers with a free account') });

          this.$router.push({
            path: this.$route.path,
            query: {
              ...this.$route.query,
              ctaSource: 'show-btmbar-answers',
              fromPage: this.$route.name,
            },
          });

          this.$emit('close');
          return;
        }

        this.updateValue({
          showAnswers: !this.modelValue.showAnswers,
        });
      }
    },

    handleChangeQuestion(index) {
      if (index > 0) {
        this.$analytics.logEvent(this.$webEvents.PREVIEW_NEXT);
      } else {
        this.$analytics.logEvent(this.$webEvents.PREVIEW_PREVIOUS);
      }

      this.updateValue({
        currentQuestionIndex: this.modelValue.currentQuestionIndex + index,
        showQuestionExplanation: false,
      });
    },

    toggleQuestionExplanation() {
      this.$analytics.logEvent(this.$webEvents.PREVIEW_TOGGLE_EXPLANATION);

      if (this.doesQuestionHaveAnswerExplanation) {
        this.updateValue({
          showQuestionExplanation: !this.modelValue.showQuestionExplanation,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .answer-button {
    width: 185px;
    height: 52px;

    &.disabled-shadow {
      box-shadow: 0 4px 0 #B6B6B6;
    }

    &.hide-shadow {
      box-shadow: none !important;
      transform: translateY(4px);
    }
  }

  .button-shadow {
    transition: all .2s;

    &:not(.disabled) {
      &:active {
        box-shadow: none !important;
        transform: translateY(4px);
      }
    }
  }
  .banner-transition {
    @keyframes enter {
      0%, 60%{
        opacity: 0;
        transform: translate(-50%, -20%);
      }
      100%{
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
    animation: enter 600ms ease-in;
  }
</style>

<template>
  <div class="bg-dark-20% flex justify-center relative">
    <div
      v-if="isFillInTheBlankBasedQuestion"
      class="flex flex-col mt-6 fib-container items-center"
    >
      <template v-if="isCurrentQuestionWithBlocks">
        <p class="text-lg font-semibold text-light-66%">
          <i18n>Type your answer in the boxes</i18n>
        </p>
        <div class="flex gap-2 mt-4 flex-wrap justify-center">
          <div
            v-for="(char, index) in answerArray"
            :key="index"
            class="h-16 border-light-10% flex items-center justify-center rounded"
            :class="[isCurrentIndexSpecialChar(index) ? 'w-10 bg-transparent' : 'w-16 bg-dark-80% border-1', { 'bg-green-dark': showAnswers && !isCurrentIndexSpecialChar(index) }]"
          >
            <span
              v-if="isCurrentIndexSpecialChar(index)"
              class="text-light-3 font-bold text-3xl"
            >{{ char }}</span>
            <span
              v-if="showAnswers && !isCurrentIndexSpecialChar(index)"
              :class="isCurrentIndexSpecialChar(index) ? 'text-3xl' : 'text-2xl'"
              class="text-light-3 font-bold"
            >{{ char }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="rounded-t w-160 h-16 text-2xl p-4 mt-10 bg-light-5% text-light-50% border-b-4 border-light-50% font-medium">
          <i18n>Type your answer</i18n>...
        </div>
        <div
          v-if="showAnswers"
          class="self-start flex flex-col max-w-160 flex-wrap"
        >
          <div class="mt-2 ml-2">
            <span class="font-bold">
              <FA
                icon="far fa-check"
                :size="12"
              />
              {{ exactAnswer.text }}
            </span>
          </div>
          <template v-if="!isAlternativeAnswersEmpty">
            <div class="text-light-50% mt-4 font-bold text-xs">
              Alternatives
            </div>
            <div class="mt-2 ml-2">
              <span
                v-for="(altAnswer, index) in alternativeAnswers"
                :key="index"
                class="mr-3 font-bold"
              >
                <FA
                  icon="far fa-check"
                  :size="12"
                />
                {{ altAnswer.text }}
              </span>
            </div>
          </template>
        </div>
      </template>
    </div>
    <div
      v-if="getQuestionHint"
      class="w-full absolute bottom-0 left-0 h-11 flex items-center justify-center bg-dark-50%"
    >
      {{ getQuestionHint }}
    </div>
    <div
      v-if="isOpenEndedBasedQuestion"
      class="flex flex-col items-end"
    >
      <div class="oeq-container rounded-t w-160 h-40 text-2xl p-4 mt-10 bg-light-5% text-light-50% border-b-4 border-light-50% font-medium">
        <i18n>Write your response</i18n>...
      </div>
      <span class="text-light-50% mt-4">
        <i18n>0/1000</i18n>
      </span>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants';

import { isOpenEndedBasedQuestion, isFillInTheBlankBasedQuestion } from '~/utils/QuizUtils';

export default {
  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },
    showAnswers: {
      type: Boolean,
      required: true,
    },
  },

  computed: {
    doesQuestionContainSpaces() {
      return this.currentQuestion.structure?.spaceCharIndices?.length > 0;
    },

    isCurrentQuestionWithBlocks() {
      return this.currentQuestion.structure?.settings?.questionDisplayVariant === Constants.DisplayVariantNames[Constants.QuestionTypes.BLANK].BOX;
    },

    getAnswerLengthForFIB() {
      return this.currentQuestion.structure?.settings?.questionMetadata?.answerLength ?? 0;
    },

    getQuestionHint() {
      if (!this.currentQuestion.structure?.hints?.[0]?.text) { return false; }
      const hint = this.currentQuestion.structure?.hints?.length > 0 ? this.currentQuestion.structure?.hints?.[0]?.text : '';
      if (!hint) {
        return false;
      }
      return `Hint: ${hint}`;
    },

    exactAnswer() {
      if (this.questionOptions.length) {
        return this.questionOptions[0];
      }

      return '';
    },

    answerArray() {
      if (this.exactAnswer) {
        return this.exactAnswer.text.split('');
      }

      return [];
    },

    questionOptions() {
      if (isEmpty(this.currentQuestion.structure.options)) {
        return Array(4).fill('');
      }

      return this.currentQuestion.structure.options;
    },

    alternativeAnswers() {
      if (this.questionOptions.length) {
        const alternate = [...this.questionOptions];
        alternate.shift();
        return alternate;
      }

      return [];
    },

    isAlternativeAnswersEmpty() {
      if (this.alternativeAnswers.length === 0) {
        return true;
      }

      const concatenatedStr = this.alternativeAnswers.reduce((acc, val) => acc + val, '');

      if (isEmpty(concatenatedStr)) {
        return true;
      }

      return false;
    },

    isFillInTheBlankBasedQuestion() {
      return isFillInTheBlankBasedQuestion(this.currentQuestion);
    },

    isOpenEndedBasedQuestion() {
      return isOpenEndedBasedQuestion(this.currentQuestion);
    },
  },

  methods: {
    isSpecialChar(char) {
      return this.$stringUtils.isSpecialChar(char);
    },

    isCurrentIndexSpecialChar(index) {
      return this.isSpecialChar(this.answerArray[index]);
    },
  },
};
</script>

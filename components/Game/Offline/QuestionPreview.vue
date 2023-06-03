<template>
  <section class="flex-1 bg-dark-50% h-full rounded-lg p-4">
    <div class="question-container bg-dark-50% rounded-lg overflow-hidden">
      <div class="question-container-header flex items-center justify-between pl-6 pr-4 py-2 border-b-1 border-light-20%">
        <p class="text-light-3 text-base">
          <i18n :injections="[questionNum + 1]">
            Question {$1}
          </i18n>
        </p>
        <div
          v-if="shouldShowResult && !isPollQuestion"
          class="flex items-center space-x-4 text-light-3 text-base"
        >
          <p>
            <FA
              icon="fa-solid fa-check"
              class="text-green mr-1"
              :size="16"
            /> {{ totalCorrect }}
          </p>
          <p>
            <FA
              icon="fa-solid fa-mark"
              class="text-red-light mr-1"
              :size="16"
            /> {{ totalIncorrect }}
          </p>
        </div>
      </div>

      <div class="question-wrapper flex flex-col items-start px-6 pt-4 pb-6">
        <div class="question-text-container flex items-center space-x-2 text-base text-light-3">
          <p>{{ questionNum + 1 }}.</p>
          <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-start md:items-center">
            <div
              v-if="doesOptionHaveAnyMedia(currentQuestionQuery)"
            >
              <MediaImage
                v-if="isQuestionMediaPresent(currentQuestionQuery, 'image')"
                class="w-16 h-16 rounded-md"
                :src="queryMediaObjects(currentQuestionQuery).image.url"
                objectFit="contain"
              />

              <MediaAudio
                v-if="isQuestionMediaPresent(currentQuestionQuery, 'audio')"
                :size="80"
                :src="queryMediaObjects(currentQuestionQuery).audio.url"
              />

              <MediaYoutube
                v-if="isQuestionMediaPresent(currentQuestionQuery, 'video')"
                class="flex items-center justify-center"
                :url="queryMediaObjects(currentQuestionQuery).video.url"
                :videoId="queryMediaObjects(currentQuestionQuery).video.meta.videoId"
              />
            </div>
            <div v-html="getHtmlToRender(currentQuestionQuery.text, currentQuestionQuery.hasMath)" />
          </div>
        </div>
        <div class="question-options-container w-full mt-8 flex flex-col space-y-4">
          <div
            v-for="(option, index) in currentQuestionOptions"
            :key="index"
            class="w-full flex flex-col items-start space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-6"
          >
            <div class="flex items-center space-x-4 w-full md:w-80">
              <span
                :class="['block w-6 h-6 rounded-full', isPollQuestion ? 'bg-brand-a' : correctAnswer === index ? 'bg-green' : 'bg-dark-4']"
              />
              <div class="flex-1 flex items-center space-x-4">
                <div
                  v-if="doesOptionHaveAnyMedia(option)"
                >
                  <MediaImage
                    v-if="isQuestionMediaPresent(option, 'image')"
                    class="w-16 h-16 rounded-md"
                    :src="queryMediaObjects(option).image.url"
                    objectFit="contain"
                  />
                </div>
                <div
                  class="text-light-3 text-base"
                  v-html="doesOptionHaveAnyMedia(option)
                    ? getHtmlToRender(queryMediaObjects(option).image.meta.text, false)
                    : getHtmlToRender(option.text, option.hasMath)"
                />
              </div>
            </div>
            <div
              v-if="shouldShowResult"
              class="flex-1 w-11/12 max-w-140 flex items-center space-x-3 md:space-x-6 ml-10 md:ml-0"
            >
              <div
                :class="['min-w-2 h-2 rounded-3xl', isPollQuestion ? 'bg-brand-a' : correctAnswer === index ? 'bg-green' : 'bg-red-light']"
                :style="{ width: `${relativeWidth[index]}` }"
              />
              <p class="text-light-3 font-bold text-base">
                {{ responses[index] }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import katex from 'katex';

import { replaceKatexElementsWithHTML } from '~/utils/QuizUtils';

const initialQueryMediaObjects = () => ({
  image: {},
  audio: {},
  video: {},
});

export default {

  props: {
    question: {
      type: Object,
      default: null,
    },
    responses: {
      type: Array,
      default: null,
    },
    questionNum: {
      type: Number || String,
      default: 1,
    },
  },

  data() {
    return {
      katex: null,
    };
  },

  computed: {
    currentQuestionQuery() {
      return this.question.structure.query;
    },

    currentQuestionOptions() {
      return this.question.structure.options;
    },

    shouldShowResult() {
      return Boolean(this.responses);
    },

    isPollQuestion() {
      return this.question.type === this.$constants.QuestionTypes.MCQ && !get(this.question, 'structure.settings.hasCorrectAnswer', true);
    },

    correctAnswer() {
      return this.question.structure.answer;
    },

    relativeWidth() {
      const maxCount = Math.max(this.responses.reduce((a, b) => Math.max(a, b), -Infinity), 1);
      const result = [];
      this.responses.forEach((item) => {
        result.push(`${100 * (item / maxCount).toFixed(2)}%`);
      });
      return result;
    },

    totalCorrect() {
      return this.responses[this.correctAnswer];
    },
    totalIncorrect() {
      let count = 0;
      this.responses.filter((data, index) => index !== this.correctAnswer).forEach((item) => { count += item; });
      return count;
    },
  },

  async created() {
    this.katex = katex;
  },

  methods: {
    getHtmlToRender(text, hasMath) {
      if (hasMath) {
        return this.katex ? replaceKatexElementsWithHTML(text, this.katex) : '';
      }

      return text;
    },

    doesOptionHaveAnyMedia(data) {
      return data.type !== 'text';
    },

    isQuestionMediaPresent(data, Qtype) {
      return !isEmpty(data.media) && data.media.find(({ type }) => type === Qtype);
    },

    queryMediaObjects(data) {
      const queryMediaObjects = initialQueryMediaObjects();
      const doesQuestionHaveMedia = (Array.isArray(data.media) && !isEmpty(data.media));

      if (doesQuestionHaveMedia) {
        data.media.forEach((media) => {
          queryMediaObjects[media.type] = media;
        });
      }

      return queryMediaObjects;
    },
  },
};

</script>

<style lang="scss" scoped>
  .question-container{
    @apply relative;
    &::before{
      content: '';
      @apply absolute top-0 bottom-0 left-0 w-2 bg-red-light;
    }
  }
</style>

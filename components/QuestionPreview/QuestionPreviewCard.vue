<template>
  <div>
    <Transitioner
      class="w-full h-full transitioner-component"
      :class="{ 'px-2': (!offlineMode || !showReports) }"
      :maxItems="totalScreens != -1 ? totalScreens : questionsList.length"
      :visibleItemNumber="currentQuestionIndex + 1"
      :areAllItemsSameComponent="true"
      :forwardTransition="forwardTransition"
      :backwardTransition="backwardTransition"
    >
      <template #transitionerCommonItem>
        <div class="flex flex-col w-full h-full">
          <div
            class="flex h-full w-full text-light rounded-lg"
            :class="[
              { 'bg-purple': !isSlideQuestion && !showReports },
              isGraphingBasedQuestion || isEquationQuestion ? 'flex-row' : 'flex-col',
            ]"
          >
            <section
              v-if="!isSlideQuestion & !showReports"
              class="transition-all flex items-center"
              :class="[currentQuestion.type, `showing-answer-${showAnswers}`, isEquationQuestion ? 'query-container-equation' : 'query-container']"
            >
              <QuestionSection
                class="question-section w-full rounded-lg"
                :currentQuestion="currentQuestion"
                :showAnswers="showAnswers"
              />
            </section>
            <GameOfflineReports v-if="showReports" />
            <McqMsqPoll
              v-else-if="isMcqMsqQuestion"
              class="m-1 answer-section"
              :questionAnswers="questionAnswers"
              :showAnswers="showAnswers"
              :currentQuestion="currentQuestion"
              :offlineMode="offlineMode"
            />
            <FibOeq
              v-else-if="isTypingBasedQuestion"
              class="m-2 rounded-lg answer-section"
              :currentQuestion="currentQuestion"
              :showAnswers="showAnswers"
            />
            <AudioVideo
              v-else-if="isAudioVideoBasedQuestion"
              class="m-2 rounded-lg answer-section"
              :currentQuestion="currentQuestion"
              :questionType="questionType"
            />
            <Draw
              v-else-if="isDrawQuestion"
              class="m-2 rounded-lg draw-answer-section"
              :currentQuestion="currentQuestion"
            />
            <ReorderMatch
              v-else-if="isReorderTypeQuestion || isMatchTypeQuestion"
              :currentQuestion="currentQuestion"
              :showAnswers="showAnswers"
            />
            <Equation
              v-else-if="isEquationQuestion"
              class="equation-answer-section bg-dark-20% m-2 rounded-lg"
              :currentQuestion="currentQuestion"
              :showAnswers="showAnswers"
            />
            <DragBasedBlank
              v-if="isDragNDropBasedBlankType && !showAnswers"
              :currentQuestion="currentQuestion"
            />
            <div
              v-if="isSlideQuestion"
              class="flex items-center justify-center w-full h-full px-4"
            >
              <Slide
                :question="currentQuestion"
                :previewIndex="currentQuestionIndex"
              />
            </div>
            <GraphShowcase
              v-if="isGraphingBasedQuestion"
              class="p-2 rounded-lg"
              :currentQuestion="currentQuestion"
              :showAnswers="showAnswers"
            />
          </div>
          <div
            v-if="offlineMode && !showReports && !questionSupported"
            class="relative flex items-center justify-between h-18 p-4 rounded-lg bg-dark-1"
          >
            <div
              class="banner-transition absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-light-3 flex items-center py-2 pl-2 pr-4 rounded-lg"
            >
              <FA
                icon="fa-solid fa-circle-info"
                class="text-brand-d w-8 h-8 justify-center"
                :size="20"
              />
              <h3 class="text-dark-1 text-lg font-semibold leading-6 text-center ml-1">
                <i18n :injections="[questionTypeTitle]">
                  "{$1}" is not supported in Paper-mode
                </i18n>
              </h3>
            </div>
          </div>
        </div>
      </template>
    </Transitioner>
    <transition
      appear
      tag="div"
      class="relative w-full h-full"
      enter-active-class="animate__animated animate__slideInRight animation-duration-300"
      leave-active-class="animate__animated animate__slideOutRight animation-duration-300"
    >
      <AnswerExplanation
        v-if="doesQuestionHaveAnswerExplanation && showQuestionExplanation"
        class="absolute w-full h-full ml-auto mr-auto bg-dark-1"
        :currentQuestion="currentQuestion"
        :answerExplanationText="answerExplanationText"
        :answerExplanationMedia="answerExplanationMedia"
      />
    </transition>
  </div>
</template>

<script>
import get from 'lodash/get';

import Transitioner, { TransitionsList } from '~/components/Transitioner.vue';

import GraphShowcase from '~/components/QuestionPreview/ResponseSection/GraphShowcase.vue';
import {
  isOptionsBasedQuestion,
  isTypingBasedQuestion,
  doesQuestionHaveAnswerExplanations,
  isQuestionForPoll,
  isAudioVideoBasedQuestion,
  isDrawBasedQuestion,
  isSlideForContent,
  isInteractiveBlankBasedQuestion,
  isEquationBasedQuestion,
  isGraphingBasedQuestion,
} from '~/utils/QuizUtils';
import QuestionSection from './QuestionSection.vue';
import McqMsqPoll from './ResponseSection/McqMsqPoll.vue';
import FibOeq from './ResponseSection/FibOeq.vue';
import AudioVideo from './ResponseSection/AudioVideo.vue';
import Draw from './ResponseSection/Draw.vue';
import ReorderMatch from './ResponseSection/ReorderMatch.vue';
import DragBasedBlank from './ResponseSection/DragBasedBlank.vue';

import Slide from './Slide.vue';
import AnswerExplanation from './AnswerExplanation.vue';
import Equation from './ResponseSection/Equation.vue';

export default {
  components: {
    Transitioner,
    QuestionSection,
    McqMsqPoll,
    FibOeq,
    AudioVideo,
    Draw,
    Slide,
    ReorderMatch,
    DragBasedBlank,
    AnswerExplanation,
    Equation,
    GraphShowcase,
  },

  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },
    showAnswers: {
      type: Boolean,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
    currentQuestionIndex: {
      type: Number,
      required: true,
    },
    questionsList: {
      type: Array,
      required: true,
    },
    showQuestionExplanation: {
      type: Boolean,
      required: true,
    },
    totalScreens: {
      type: Number,
      default: -1,
    },
    showReports: {
      type: Boolean,
      default: false,
    },
    questionSupported: {
      type: Boolean,
      default: true,
    },
    offlineMode: {
      type: Boolean,
      default: false,
    },
    questionTypeTitle: {
      type: String,
      default: '',
    },
  },

  computed: {
    isMcqMsqQuestion() {
      return isOptionsBasedQuestion(this.currentQuestion) || isQuestionForPoll(this.currentQuestion);
    },

    isReorderTypeQuestion() {
      return this.currentQuestion.type === this.$constants.QuestionTypes.REORDER;
    },

    isMatchTypeQuestion() {
      return this.currentQuestion.type === this.$constants.QuestionTypes.MATCH;
    },

    isDragNDropBasedBlankType() {
      return this.currentQuestion.type === this.$constants.QuestionTypes.DRAGNDROP;
    },

    isInteractiveBlankBasedQuestion() {
      return isInteractiveBlankBasedQuestion(this.currentQuestion);
    },

    isTypingBasedQuestion() {
      return isTypingBasedQuestion(this.currentQuestion);
    },

    isAudioVideoBasedQuestion() {
      return isAudioVideoBasedQuestion(this.currentQuestion);
    },

    isDrawQuestion() {
      return isDrawBasedQuestion(this.currentQuestion);
    },

    isEquationQuestion() {
      return isEquationBasedQuestion(this.currentQuestion);
    },

    isSlideQuestion() {
      return isSlideForContent(this.currentQuestion);
    },

    isGraphingBasedQuestion() {
      return isGraphingBasedQuestion(this.currentQuestion);
    },

    questionAnswers() {
      return this.currentQuestion.structure.answer;
    },

    answerExplanationText() {
      return get(this.currentQuestion, 'structure.explain.text', '');
    },

    answerExplanationMedia() {
      return get(this.currentQuestion, 'structure.explain.media', []);
    },

    forwardTransition() {
      return TransitionsList.Q_FADE_SCALE_LEFT;
    },

    backwardTransition() {
      return TransitionsList.Q_FADE_SCALE_RIGHT;
    },

    doesQuestionHaveAnswerExplanation() {
      return doesQuestionHaveAnswerExplanations(this.currentQuestion);
    },
  },
};
</script>

<style lang="scss" scoped>
$queryContainerDeafaultHeight: 45%;

.query-container-equation {
  width: 50%;
  height: 100%;
}

.query-container {
  height: $queryContainerDeafaultHeight;

  &.DRAW {
    height: auto;
  }

  &.DROPDOWN{
    height: theme('height.full');
  }

  &.GRAPHING{
    @apply h-full flex-1;
  }

  &.DND_IMAGE {
    height: theme('height.full');
  }

  &.HOTSPOT {
    height: theme('height.full');
  }

  &.showing-answer-true {
    &.DRAGNDROP{
      transition-delay: 500ms;
      height: theme('height.full');

      .question-query-section {
        transition: all;
        transition-delay: 500ms;
        height: $queryContainerDeafaultHeight;
      }
    }
  }
}

.answer-section {
  height: 100% - $queryContainerDeafaultHeight;
}

.equation-answer-section {
  height: 100%;
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

}

.draw-answer-section {
  height: calc(100% - 56px);
}
</style>

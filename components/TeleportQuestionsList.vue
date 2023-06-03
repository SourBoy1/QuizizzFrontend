<template>
  <div
    ref="teleportQuestionsList"
    class="flex flex-col h-full overflow-y-auto"
  >
    <div
      v-for="(question, index) in list"
      :key="index"
    >
      <QuestionDetailsCard
        v-if="isSlideForQuestion(question)"
        :isSuperContent="isSuperContent"
        :question="question"
        class="mb-3 rounded bg-light border-1 border-solid border-dark-5% md:border-0"
        :isLoading="isLoadingState"
        :noShadow="!isDesktop"
        :shouldToggleAnswerOptions="shouldToggleAnswerOptions"
        :isAddingTeleportInProgress="isAddingTeleportInProgress"
        @addQuestion="addNewQuestion"
      />

      <SlideDetailsCard
        v-else
        class="mb-3 rounded bg-light slide-details-card border-1 border-solid border-dark-5% md:border-0"
        :isSuperContent="isSuperContent"
        :isLoading="isLoadingState"
        :question="question"
        :noShadow="!isDesktop"
        :slideContainerMaxHeight="270"
        :isAddingTeleportInProgress="isAddingTeleportInProgress"
        @addQuestion="addNewQuestion"
      />
    </div>
  </div>
</template>

<script>
import ObjectId from 'bson-objectid';
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import isBoolean from 'lodash/isBoolean';
import cloneDeep from 'lodash/cloneDeep';

import Structure from '~/models/Structure';

import { shouldQuestionTypeHaveCorrectAnswer, isTypingBasedQuestion } from '~/utils/QuizUtils.js';
import { isSlideForQuestion } from '~/utils/SlideUtils.js';

export default {
  props: {
    content: {
      type: Object,
      default: () => {},
    },
    questionsList: {
      type: Array,
      default: () => [],
    },
    isLoadingState: {
      type: Boolean,
      default: false,
    },
    isAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },
    shouldToggleAnswerOptions: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['addQuestion'],

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'quizType', 'isTeleportContentSuper', 'isTeleportContentPremium']),
    ...mapGetters('root', ['isDesktop']),

    list() {
      return this.questionsList;
    },

    isContentQuizType() {
      return this.content.type === 'quiz';
    },

    /**
     * We are blocking all lessons for non super users, however if a super user tries to teleport,
     * we set the isSuperParent flag only if the quiz from which the question/slide is teleported is a
     * premiumContent.
     *
     * Premium content is content that has any of the premium features like audio or video etc.
     */

    isSuperContent() {
      return this.isTeleportContentSuper(this.content);
    },

    isPremiumContent() {
      return this.isTeleportContentPremium(this.content);
    },
  },

  watch: {
    content(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (!isEmpty(this.$refs.teleportQuestionsList)) {
          this.$refs.teleportQuestionsList.scrollTop = 0;
        }
      }
    },
  },

  methods: {
    isSlideForQuestion(question) {
      return isSlideForQuestion(question);
    },

    addNewQuestion(data) {
      /**
         * The new Question data needs to get data about the parent quiz and question for super validation
        */
      const questionCopy = cloneDeep(data.question);
      questionCopy.isSuperParent = this.isPremiumContent;
      questionCopy.parent = data.question._id;
      questionCopy.cloneFrom = data.question._id;
      questionCopy.teleportFrom = this.content._id;
      questionCopy._id = ObjectId().toHexString();
      const hasCorrectAnswer = isBoolean(questionCopy.structure?.settings?.hasCorrectAnswer) ? questionCopy.structure?.settings?.hasCorrectAnswer : shouldQuestionTypeHaveCorrectAnswer(questionCopy);
      const canSubmitCustomResponse = isBoolean(questionCopy.structure?.settings?.canSubmitCustomResponse) ? questionCopy.structure?.settings?.canSubmitCustomResponse : isTypingBasedQuestion(questionCopy);
      questionCopy.structure = Structure({
        ...questionCopy.structure,
        settings: {
          ...questionCopy.structure.settings,
          hasCorrectAnswer,
          canSubmitCustomResponse,
        },
      });

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_TELEPORT_ADD);
      this.$analytics.logEvent(eventName, {
        teleportedQuestionId: data.question._id,
        teleportedQuizId: this.content._id,
        quizId: this.quizId,
        newQuestionId: questionCopy._id,
      });

      this.$emit('addQuestion', { question: questionCopy, addButtonRef: data.addButtonRef });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

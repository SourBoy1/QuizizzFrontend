<template>
  <div>
    <div
      v-for="displayContent in displayContentList"
      :key="displayContent._id"
    >
      <div class="flex flex-row border-1 border-solid border-dark-5% justify-between p-1 mb-2">
        <div class="flex mx-3">
          <FA
            icon="fas fa-list self-center mx-1"
            class="flex"
            :size="12"
          />
          <div class="flex self-center mr-1 text-xs font-semibold text-dark-2">
            {{ questionsList(displayContent).length }}&nbsp;{{ isDisplayContentQuizType ? $i18n('questions') : $i18n('slides') }}
          </div>
        </div>
        <div class="flex">
          <Button
            ref="addAllQuestions"
            class=""
            :title="addAllQuestionsTitle"
            size="sm"
            :type="canAddAllQuestions ? addAllQuestionButtonType : 'super-secondary'"
            licon="far fa-plus-circle"
            :loading="isBulkAddingTeleportInProgress"
            @click="addAllQuestions"
          />
        </div>
      </div>
      <TeleportQuestionsList
        :isAddingTeleportInProgress="isAddingTeleportInProgress"
        :isLoadingState="searchSubmitCallInProgress"
        :shouldToggleAnswerOptions="true"
        :content="displayContent"
        :questionsList="questionsList(displayContent)"
        @addQuestion="onAddSingleQuestion"
      />
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

import { getOnlyQuestions } from '../utils/QuizUtils.js';

export default {

  props: {
    displayContentList: {
      type: Array,
      default: () => [],
    },
    isAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },
    isBulkAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },
    searchSubmitCallInProgress: {
      type: Boolean,
      default: false,
    },
    addAllQuestionsTitle: {
      type: String,
      default: '',
    },
    canAddAllQuestions: {
      type: Boolean,
      default: false,
    },
    addAllQuestionButtonType: {
      type: String,
      default: 'secondary',
    },
    isDisplayContentQuizType: {
      type: Boolean,
      default: true,
    },
    isForQuizEditor: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['addAllQuestions', 'addQuestion'],

  methods: {
    questionsList(displayContent) {
      if (isEmpty(displayContent.info) || isEmpty(displayContent.info.questions)) {
        return [];
      }

      if (this.isForQuizEditor) {
        return getOnlyQuestions(displayContent.info.questions);
      }

      return displayContent.info.questions;
    },

    addAllQuestions(el) {
      this.$emit('addAllQuestions', el);
    },
    onAddSingleQuestion(question) {
      this.$emit('addQuestion', question);
    },
  },
};
</script>

<style scoped>

</style>

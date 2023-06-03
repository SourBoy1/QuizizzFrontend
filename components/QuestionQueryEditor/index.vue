<template>
  <PageSelector
    :forceShowDesktop="isEditorForPresentationContent"
    class="h-full"
  >
    <template #mobile>
      <QuestionQueryEditorMobile
        ref="questionQueryEditorMobile"
        :forDevice="forDevice"
        :questionType="questionType"
        :questionSettings="questionSettings"
        :questionQuery="questionQuery"
        :isMediaContainerHidden="isMediaContainerHidden"
        :isTextContainerHidden="isTextContainerHidden"
        :isMediaEditorVisible="isMediaEditorVisible"
        :doesQuestionHaveAnyMedia="doesQuestionHaveAnyMedia"
        :queryMediaObjects="queryMediaObjects"
        :canVideoBeDisplayed="canVideoBeDisplayed"
        :queryEditorId="queryEditorId"
        :queryResizeFontJumps="queryResizeFontJumps"
        :isTipTapEditorInFocus="isTipTapEditorInFocus"
        :getTiptapValue="getTiptapValue"
        :isQuestionMediaPresent="isQuestionMediaPresent"
        :selectedSlideType="selectedSlideType"
        :questionMediaImageLayout="questionMediaImageLayout"
        :videoStartTime="videoStartTime"
        :videoEndTime="videoEndTime"
        :questionAnswer="questionAnswer"
        :graphingSetup="graphingSetup"
        @onAddMediaClick="onAddMediaClick"
        @updateValue="updateQuery"
        @deleteCurrentMedia="deleteCurrentMedia"
        @onMediaReEdit="onMediaReEdit"
        @setSelectedQuestionElement="setSelectedQuestionElement"
        @onHideMediaClick="onHideMediaClick"
        @onAddTextClick="onAddTextClick"
        @focusTipTap="focusTipTap"
        @evaluateQueryContentVisibility="evaluateQueryContentVisibility"
        @openMathEditor="openMathEditor"
        @onTiptapUpdate="onTiptapUpdate"
        @action="handleActions"
      />
    </template>
    <template #desktop>
      <QuestionQueryEditorDesktop
        ref="questionQueryEditorDesktop"
        :forDevice="forDevice"
        :questionType="questionType"
        :questionSettings="questionSettings"
        :isMediaContainerHidden="isMediaContainerHidden"
        :isTextContainerHidden="isTextContainerHidden"
        :questionQuery="questionQuery"
        :isMediaEditorVisible="isMediaEditorVisible"
        :doesQuestionHaveAnyMedia="doesQuestionHaveAnyMedia"
        :queryMediaObjects="queryMediaObjects"
        :canVideoBeDisplayed="canVideoBeDisplayed"
        :queryEditorId="queryEditorId"
        :queryResizeFontJumps="queryResizeFontJumps"
        :isTipTapEditorInFocus="isTipTapEditorInFocus"
        :getTiptapValue="getTiptapValue"
        :isQuestionMediaPresent="isQuestionMediaPresent"
        :videoStartTime="videoStartTime"
        :videoEndTime="videoEndTime"
        :questionMediaImageLayout="questionMediaImageLayout"
        :questionAnswer="questionAnswer"
        :graphingSetup="graphingSetup"
        @onAddMediaClick="onAddMediaClick"
        @updateValue="updateQuery"
        @deleteCurrentMedia="deleteCurrentMedia"
        @onMediaReEdit="onMediaReEdit"
        @setSelectedQuestionElement="setSelectedQuestionElement"
        @onHideMediaClick="onHideMediaClick"
        @onAddTextClick="onAddTextClick"
        @focusTipTap="focusTipTap"
        @evaluateQueryContentVisibility="evaluateQueryContentVisibility"
        @openMathEditor="openMathEditor"
        @onTiptapUpdate="onTiptapUpdate"
        @blur="handleTiptapBlur"
        @undo="handleTiptapUndo"
        @action="handleActions"
      />
    </template>
  </PageSelector>
</template>

<script>
import { mapGetters } from 'vuex';
import debounce from 'lodash/debounce';

import QueryEditorMixin from '~/mixins/QueryEditorMixin';
import { isInteractiveBlankBasedQuestion } from '~/utils/QuizUtils';

export default {

  mixins: [QueryEditorMixin],

  props: {

    graphingSetup: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('contentEditor', ['quizId', 'isEditorForPresentationContent']),
    ...mapGetters('slideEditor', ['currentlyFocusedTiptapEditor', 'lastFocusedTiptapEditor', 'currentSlide', 'sourcePage']),
    ...mapGetters('uiManager', ['currentBlankValues', 'finalOptionsForBlankQuestion', 'numberOfBlanks']),

    // this overridden here for the correct reference
    getActiveTiptapRef() {
      if (!this.isDesktop) {
        return this.$refs.questionQueryEditorMobile.$refs.editorContainer.$refs.tiptap_slim_editor.tiptap;
      }

      return this.$refs.questionQueryEditorDesktop.$refs.editorContainer.$refs.tiptap;
    },
  },

  watch: {
    numberOfBlanks(curr, prev) {
      // delete option from options editor if deleted in query
      // not waiting for blur
      if (curr < prev) {
        this.syncOptionsWithQueryForBlanks();
      }
    },

    isTipTapEditorInFocus(newVal) {
      if (newVal === true) {
        this.setSelectedQuestionElementDebounced(this.queryEditorId);
      } else {
        // this.setSelectedQuestionElementDebounced('');
      }
    },
  },

  mounted() {
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 100);

    this.$eventBus.$on('queryEditor:syncBlanksToOptions', this.syncOptionsWithQueryForBlanks);
    this.evaluateQueryContentVisibility();

    if (isInteractiveBlankBasedQuestion({ type: this.questionType })) {
      this.initialiseParsedQuestionQuery();
    }
  },

  beforeUnmount() {
    this.$eventBus.$off('queryEditor:syncBlanksToOptions', this.syncOptionsWithQueryForBlanks);
  },

  methods: {
    handleActions(actionType) {
      switch (actionType) {
        case 'add-blank':
          this.getActiveTiptapRef.insertBlank();
          break;
        default:
          break;
      }
    },

    onAddTextClick() {
      if (!this.isTextContainerHidden) {
        return;
      }

      this.$store.dispatch('contentEditor/setHideTextContainer', false);

      setTimeout(this.focusTipTap.bind(this), 100);
    },

    focusTipTap() {
      if (this.getActiveTiptapRef) {
        this.getActiveTiptapRef.focus();
      }
    },
  },
};
</script>

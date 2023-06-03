<template>
  <PageSelector
    :forceShowDesktop="isEditorForPresentationContent"
    class="h-full"
  >
    <template #mobile>
      <QuestionEditorMobile
        ref="questionEditorWrapper"
        v-bind="propsForChildren"
        v-on="eventsOfChildren"
      />
    </template>
    <template #desktop>
      <QuestionEditorDesktop
        ref="questionEditorWrapper"
        v-bind="propsForChildren"
        v-on="eventsOfChildren"
      />
    </template>
  </PageSelector>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import get from 'lodash/get';
import noop from 'lodash/noop';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';

import { nextTickCallback } from '~/utils/Utilities.js';

import {
  isQuestionForPoll, isWordCloudQuestion, getQuestionTypes, isInteractiveBlankBasedQuestion,
} from '~/utils/QuizUtils';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import { getUUID } from '../../services/UIDService.js';
import { asyncDelay } from '../../services/PausableTimers';

export default {
  props: {

    editorDimensions: {
      type: Object,
      required: true,
      validator: (val) => has(val, 'width') && has(val, 'height') && has(val, 'scale'),
    },

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['deleteAnswerExplanation'],

  data() {
    return {
      isMultipleAnswerWarningTooltipVisible: false,
      numTimesMSQTogglerWasHighlighted: 0,
      lastFillAnswerNudgeDoneAt: 0,
      questionMountedOn: Date.now(),
      numTimesQueryContentVisibilityWasEvaluated: 0,

      questionTypes: getQuestionTypes(),
      isSaveBtnInErrorState: false,
      isEditActionInProgress: {
        cancel: false,
        save: false,
        disable: false,
      },

      isCancelConfirmerVisible: false,
    };
  },

  computed: {
    ...mapGetters({
      deviceProps: 'root/deviceProps',
      currentSlideId: 'slideEditor/currentSlideId',
      currentSlide: 'slideEditor/currentSlide',
      isCurrentSlideForQuestion: 'slideEditor/isCurrentSlideForQuestion',
      checkIfUserEditedSlide: 'slideEditor/checkIfUserEditedSlide',
      sourcePage: 'slideEditor/sourcePage',
      quizId: 'contentEditor/quizId',
      quizType: 'contentEditor/quizType',
      quiz: 'contentEditor/quiz',
      isEditorForQuizContent: 'contentEditor/isEditorForQuizContent',
      isEditorForPresentationContent: 'contentEditor/isEditorForPresentationContent',
      getQuestionById: 'contentEditor/getQuestionById',
      getSlideValidationErrors: 'contentEditor/getSlideValidationErrors',
      isSlideValidated: 'contentEditor/isSlideValidated',
      isAnswerExplanationsInViewStore: 'contentEditor/isAnswerExplanationsInViewStore',
    }),

    propsForChildren() {
      return {
        editorDimensions: this.editorDimensions,
        containerStyles: this.containerStyles,
        isCancelConfirmerVisible: this.isCancelConfirmerVisible,
        isSaveBtnInErrorState: this.isSaveBtnInErrorState,
        isEditActionInProgress: this.isEditActionInProgress,
        isCurrentQuestionValidated: this.isCurrentQuestionValidated,
        questionOptionOrder: this.questionOptionOrder,
        shouldAllowUsingSuperQuestionTypes: this.shouldAllowUsingSuperQuestionTypes,
        currentQuestionValidationErrors: this.getSlideValidationErrors(this.currentSlide),
      };
    },

    eventsOfChildren() {
      return {
        deleteAnswerExplanation: this.deleteAnswerExplanation,
        onQuestionEditAction: this.onQuestionEditAction,
      };
    },

    questionOptionOrder() {
      return get(this.currentSlide, 'structure.order', 'asc');
    },

    questionOptions() {
      return this.currentSlide.structure.options;
    },

    questionMatches() {
      return this.currentSlide.structure.matches;
    },

    questionAnswer() {
      const { answer } = this.currentSlide.structure;

      return Array.isArray(answer) ? answer : [answer];
    },

    questionType() {
      return this.currentSlide.type;
    },

    questionSettings() {
      return this.currentSlide.structure.settings;
    },

    selectedSlideType() {
      let displayType = this.currentSlide.type;

      if (isQuestionForPoll(this.currentSlide)) {
        displayType = this.$constants.SlideTypes.POLL;
      }

      if (isWordCloudQuestion(this.currentSlide)) {
        displayType = this.$constants.SlideTypes.WORDCLOUD;
      }

      return displayType;
    },

    containerXTranslate() {
      let xTranslate = 0;

      if (this.isAnswerExplanationsInViewStore) {
        const QUESTION_PEEK_AMOUT = 40;
        const editorActualWidth = this.editorDimensions.width * this.editorDimensions.scale;
        const distanceBetweenScreenLeftAndQuestionEditorRight = editorActualWidth + ((this.deviceProps.width - editorActualWidth) / 2);
        const peekAmount = this.editorDimensions.scale * QUESTION_PEEK_AMOUT;

        xTranslate = -1 * ((distanceBetweenScreenLeftAndQuestionEditorRight - peekAmount) / this.editorDimensions.scale);
      }

      return xTranslate;
    },

    containerStyles() {
      return {
        width: `${this.editorDimensions.width}px`,
        height: `${this.editorDimensions.height}px`,
        transform: `scale(${this.editorDimensions.scale}) translateX(${this.containerXTranslate}px)`,
      };
    },

    editorToolbarPositioning() {
      const MIN_TOOLBAR_WIDTH_WHERE_ITS_ONLY_1_ROW = 650;
      const editorActualWidth = this.editorDimensions.width * this.editorDimensions.scale;
      const toolbarWidth = this.isEditorForPresentationContent ? editorActualWidth : Math.max(editorActualWidth, MIN_TOOLBAR_WIDTH_WHERE_ITS_ONLY_1_ROW);
      const horizontalSpaceAvailableAfterEditorScale = (this.editorDimensions.width - toolbarWidth) / 2;
      const verticalSpaceAvailableAfterEditorScale = this.editorDimensions.height * (1 - this.editorDimensions.scale);
      const translationDueToContainer = (this.containerXTranslate * this.editorDimensions.scale);

      return {
        width: toolbarWidth,
        xTranslate: horizontalSpaceAvailableAfterEditorScale + translationDueToContainer,
        yTranslate: verticalSpaceAvailableAfterEditorScale / 2,
        questionEditorWidth: this.editorDimensions.width * this.editorDimensions.scale,
        questionEditorXTranslate: ((this.editorDimensions.width * (1 - this.editorDimensions.scale)) / 2) + translationDueToContainer,
      };
    },

    isInteractiveBlankBasedQuestion() {
      return isInteractiveBlankBasedQuestion(this.currentSlide);
    },

    isCurrentQuestionMatchBased() {
      return this.questionType === this.$constants.QuestionTypes.MATCH;
    },

    areMultipleAnswersAllowed() {
      return this.questionType === this.$constants.QuestionTypes.MSQ;
    },

    isCurrentQuestionValidated() {
      return isEmpty(this.getSlideValidationErrors(this.currentSlide));
    },

    isDrawQuestion() {
      return this.currentSlide.type === this.$constants.QuestionTypes.DRAW;
    },
  },

  mounted() {
    this.timers = {};

    this.$eventBus.$on('editor:validateQuestion', this.validateQuestion);
    this.$eventBus.$on('questionEditor:highlightMSQToggler', this.highlighMSQToggler);
    this.$eventBus.$on('questionEditor:addQuestionTopics', this.addQuestionTopics);
    this.resetIsAnswerExplanationsInView();
    this.questionMountedOn = Date.now();

    if (this.questionType === this.$constants.QuestionTypes.DND_IMAGE) {
      HotjarService.triggerEvent(HotjarEvents.HOTJAR_CREATE_LABELING_QUESTION);
    }

    if (this.questionType === this.$constants.QuestionTypes.HOTSPOT) {
      HotjarService.triggerEvent(HotjarEvents.HOTJAR_CREATE_HOTSPOT_QUESTION);
    }

    if (this.questionType === this.$constants.QuestionTypes.GRAPHING) {
      HotjarService.triggerEvent(HotjarEvents.HOTJAR_CREATE_GRAPHING_QUESTION);
    }

    this.validateQuestion();
  },

  beforeUnmount() {
    this.fillAnswerNudgeTimeout && clearTimeout(this.fillAnswerNudgeTimeout);
    this.$eventBus.$off('questionEditor:highlightMSQToggler', this.highlighMSQToggler);
    this.$eventBus.$off('questionEditor:addQuestionTopics', this.addQuestionTopics);
    this.$eventBus.$off('editor:validateQuestion', this.validateQuestion);
    this.onEditActionCompletion && (this.onEditActionCompletion = noop);
  },

  methods: {
    ...mapActions({
      resetIsAnswerExplanationsInView: 'contentEditor/resetIsAnswerExplanationsInView',
    }),

    addQuestionTopics({ questionId, topics }) {
      if (this.currentSlide._id === questionId) {
        this.$store.dispatch('slideEditor/updateQuestionTopics', { topics });
      }
    },

    async onQuestionEditAction(action, source) {
      if (action === 'save' && !this.isCurrentQuestionValidated) {
        this.isSaveBtnInErrorState = true;

        await asyncDelay(700);

        this.isSaveBtnInErrorState = false;

        return;
      }

      if (this.checkIfUserEditedSlide() && action === 'cancel' && source === 'btn') {
        this.isCancelConfirmerVisible = false;
        this.$nextTick(() => {
          this.isCancelConfirmerVisible = true;
        });

        return;
      }

      this.isEditActionInProgress[action] = true;

      /**
       * Added a delay to handle the case of user clicking save between the leading and trailing
       * calls of the debounced tipTap handler.
       * Ultimately this would make sure that save only happens after the last value that was added
       */
      await asyncDelay(400);

      this.onEditActionCompletion = (didActionSucceed) => {
        if (didActionSucceed) {
          this.isEditActionInProgress.disable = true;
        }
        this.isEditActionInProgress[action] = false;
      };

      if (action === 'save') {
        this.$eventBus.$emit('questionEditor:triggerPreSaveActions');
        nextTickCallback(() => {
          this.$eventBus.$emit('questionToolbar:editAction', { action, completionCallback: this.onEditActionCompletion });
        }, 2);
      } else {
        this.$eventBus.$emit('questionToolbar:editAction', { action, completionCallback: this.onEditActionCompletion });
      }
    },

    getUUID() {
      return getUUID();
    },

    deleteAnswerExplanation() {
      this.$emit('deleteAnswerExplanation');
    },

    highlighMSQToggler() {
      if (this.numTimesMSQTogglerWasHighlighted >= 3 || this.isMultipleAnswerWarningTooltipVisible) {
        return;
      }

      this.numTimesMSQTogglerWasHighlighted += 1;
      this.isMultipleAnswerWarningTooltipVisible = true;

      this.msqTogglerHighlightTimeout = setTimeout(() => {
        this.isMultipleAnswerWarningTooltipVisible = false;
      }, 5000);
    },

    validateQuestion: debounce(function validate() {
      if (!this.isEditorForPresentationContent) {
        this.$store.dispatch('contentEditor/validateQuestions');
      }
    }, 1000, { leading: true }),
  },
};
</script>

<template>
  <div class="relative w-full h-full max-h-full overflow-hidden">
    <Header />
    <div
      ref="questionEditorWrapper"
      class="w-full h-full mt-12 overflow-y-auto question-editor-wrapper"
    >
      <div
        ref="questionEditorModal"
        class="w-full overflow-hidden rounded-lg  question-editor-modal md:p-2"
        :class="[deviceProps.type, {
          'justify-between flex flex-col h-auto': true,
          'is-options-question-type': isOptionBasedQuestion,
          'is-classification-question-type': isClassificationQuestion,
        }]"
      >
        <div
          ref="queryOptionsContainer"
          class="flex flex-col justify-between query-options-container"
          :style="queryOptionsContainerStyles"
        >
          <div
            :key="`${questionDiscriminator}_query`"
            class="relative query-editor-wrapper"
          >
            <QuestionQueryEditor
              ref="questionQueryEditor"
              class="relative z-10 bg-purple shrink-0"
              :questionType="questionType"
              :selectedSlideType="selectedSlideType"
              :forDevice="$constants.DeviceTypes.PHONE"
            />
          </div>

          <MultipleAnswerSelector
            v-if="isCurrentQuestionOptionsBased"
            :isMultipleAnswerWarningTooltipVisible="isMultipleAnswerWarningTooltipVisible"
            :canToggleMultipleAnswers="isCurrentQuestionOptionsBased"
            :value="areMultipleAnswersAllowed"
            :currentQuestion="currentSlide"
            class="mt-1"
            @input="toggleMultipleAnswers"
          />

          <SwitchOrderDropdown
            v-if="isReorderQuestionType"
            :forDevice="$constants.DeviceTypes.PHONE"
            direction="bottom"
            @onOrderSwitch="onOrderSwitch"
          />

          <div
            v-if="!isDrawQuestionType"
            :key="`${questionDiscriminator}_options`"
            ref="options-editor-wrapper"
            class="options-editor-wrapper"
            :class="[deviceProps.type]"
          >
            <QuestionOptionsEditor
              v-if="isCurrentQuestionOptionsBased"
              ref="optionEditor"
              :style="questionOptionsEditorStyles"
              :forDevice="deviceProps.type"
              :questionType="questionType"
              :currentQuestion="currentSlide"
              :questionSettings="questionSettings"
              class="px-2"
            >
              <Button
                v-if="!isDesktop"
                :title="$i18n('Add an answer explanation')"
                :fullWidth="true"
                size="md"
                class="mt-2 mr-1"
                licon="fas fa-lightbulb-on"
                type="transparent"
                @click="onToggleAnswerExplanationMobileEditor"
              />
            </QuestionOptionsEditor>

            <QuestionTypingInputEditor
              v-if="isCurrentQuestionTypingBased"
              ref="optionEditor"
              class="bg-purple"
              :forDevice="$constants.DeviceTypes.PHONE"
              :questionType="questionType"
              :questionSettings="questionSettings"
            >
              <Button
                v-if="!isDesktop"
                :title="$i18n('Add an answer explanation')"
                :fullWidth="true"
                size="md"
                class="mr-1 text-xs"
                licon="fas fa-lightbulb-on"
                type="transparent"
                @click="onToggleAnswerExplanationMobileEditor"
              />
            </QuestionTypingInputEditor>

            <QuestionAudioVideoEditor
              v-if="isCurrentQuestionAudioVideoBased"
              ref="optionEditor"
              :questionType="questionType"
              :forDevice="$constants.DeviceTypes.PHONE"
            />

            <QuestionDragAndDropEditor
              v-if="isCurrentQuestionOrderMatchBased"
              ref="optionEditor"
              :forDevice="$constants.DeviceTypes.PHONE"
              :questionType="questionType"
            />

            <OptionsEditorInteractiveBlank
              v-if="isInteractiveBlankBasedQuestion"
              :forDevice="$constants.DeviceTypes.PHONE"
              :questionType="questionType"
            />
          </div>

          <div
            v-if="isDrawQuestionType"
            class="h-full"
          >
            <DrawQuestionEditor />
          </div>

          <div
            v-if="isDnDImageQuestionType"
            class="bg-purple p-2"
          >
            <OptionsEditorDndImageEditorCanvas isForMobile />
          </div>

          <div
            v-if="isHotspotQuestionType"
            class="bg-purple p-2"
          >
            <OptionsEditorHotspotEditorCanvas isForMobile />
          </div>

          <div
            v-if="isEquationType"
            class="flex bg-purple"
          >
            <EquationInputEditorContainer />
          </div>

          <div
            v-if="isClassificationQuestion"
            class="h-full bg-purple"
          >
            <ClassificationOptionsGroupContainer
              :questionType="questionType"
              isForMobile
            />
          </div>
        </div>
      </div>

      <transition
        enter-active-class="animate__animated animate__fadeIn"
        leave-active-class="animate__animated animate__fadeOut"
      >
        <div
          v-if="isDnDImageQuestionType && !!questionMediaTypes.image"
          class="p-2"
        >
          <Button
            class="w-full"
            ticon="fas fa-arrow-right"
            :title="$i18n('Add answer options')"
            :ariaLabel="$i18n('Add answer options')"
            type="white"
            size="sm"
            @click="onAddAnswerOption"
          />
        </div>
      </transition>

      <transition
        enter-active-class="animate__animated animate__fadeIn"
        leave-active-class="animate__animated animate__fadeOut"
      >
        <div v-if="isHotspotQuestionType && !!questionMediaTypes.image">
          <OptionsEditorHotspotEditorVariantMenu
            ref="optionEditor"
            isForMobile
          />
        </div>
      </transition>

      <div
        v-if="showConditionallyAnswerExplanationButton"
        class="flex mt-2"
        :class="{
          'flex mx-1': isInteractiveBlankBasedQuestion,
          'mx-2': !isInteractiveBlankBasedQuestion,
        }"
      >
        <Button
          :title="$i18n('Add an answer explanation')"
          :fullWidth="true"
          :size="isInteractiveBlankBasedQuestion ? 'xs' : 'md'"
          licon="fas fa-lightbulb-on"
          type="transparent"
          @click="onToggleAnswerExplanationMobileEditor"
        />
        <Button
          v-if="isInteractiveBlankBasedQuestion"
          :title="$i18n('Add option')"
          :fullWidth="true"
          :size="isInteractiveBlankBasedQuestion ? 'xs' : 'md'"
          class="ml-2"
          licon="fas fa-plus"
          type="transparent"
          @click="$eventBus.$emit('interactiveBlankOptionEditor:addOption')"
        />
      </div>
      <transition name="fade">
        <div
          v-if="shouldShowAnswerExplanationMobileEditor"
          ref="answer-explanation-editor"
          class="mt-2 answer-explanation-wrapper"
        >
          <QuestionAnswerExplanationEditor
            ref="question-answer-explanation-editor"
            :editorDimensions="editorDimensions"
            @deleteAnswerExplanation="onToggleAnswerExplanationMobileEditor"
          />
        </div>
      </transition>

      <QuestionEditorContentButtons
        v-if="isEditorForQuizContent"
        class="px-2 py-4 mb-6"
        :showOnlySaveButton="true"
        :isCancelConfirmerVisible="isCancelConfirmerVisible"
        :isSaveBtnInErrorState="isSaveBtnInErrorState"
        :isCurrentQuestionValidated="isCurrentQuestionValidated"
        :isEditActionInProgress="isEditActionInProgress"
        :currentQuestionErrors="currentQuestionValidationErrors"
        @onQuestionEditAction="onQuestionEditAction"
      />
    </div>

    <transition
      enter-active-class="animate__animated animate__slideInUp"
      leave-active-class="animate__animated animate__slideOutDown"
    >
      <div
        v-if="showOptionsEditor"
        class="full-screen-container bg-purple z-50 fixed top-0 left-0 h-screen w-screen"
      >
        <OptionsEditorDndImageEditor
          isForMobile
          @close="showOptionsEditor = false"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import { doesQuestionHaveAnswerExplanations, doesExplanationHaveAnyMedia } from '~/utils/QuizUtils';

import QueryEditorMixin from '~/mixins/QueryEditorMixin';

import Header from '~/components/QuestionEditor/Layouts/Mobile/Widgets/Header.vue';
import ClassificationOptionsGroupContainer from '~/components/OptionsEditor/ClassificationEditor/index.vue';

export default {

  components: {
    Header,
    ClassificationOptionsGroupContainer,
  },

  mixins: [QueryEditorMixin],

  props: {
    isCancelConfirmerVisible: {
      type: Boolean,
      default: true,
    },

    isSaveBtnInErrorState: {
      type: Boolean,
      default: true,
    },

    isEditActionInProgress: {
      type: Object,
      default: () => { },
    },

    editorDimensions: {
      type: Object,
      default: () => { },
    },

    containerStyles: {
      type: Object,
      default: () => { },
    },

    isCurrentQuestionValidated: {
      type: Boolean,
      default: false,
    },

    currentQuestionValidationErrors: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['onQuestionEditAction'],

  data() {
    return {
      isMultipleAnswerWarningTooltipVisible: false,
      numTimesMSQTogglerWasHighlighted: 0,
      lastFillAnswerNudgeDoneAt: 0,
      questionMountedOn: Date.now(),
      numTimesQueryContentVisibilityWasEvaluated: 0,
      selectedFont: 'Quicksand',
      selectedSize: 48,
      selectedFormatButtons: [],
      showingContentButtonsTimeout: null,
      shouldShowAnswerExplanationMobileEditor: false,
      questionOptionsEditorStyles: {},
      showOptionsEditor: false,
    };
  },

  computed: {
    ...mapGetters({
      deviceProps: 'root/deviceProps',
      currentSlide: 'slideEditor/currentSlide',
      isEditorForQuizContent: 'contentEditor/isEditorForQuizContent',
    }),

    ...mapGetters('root', ['isMobile', 'isTablet', 'isDesktop']),
    ...mapGetters('slideEditor', ['isCurrentSlideForQuestion', 'isCurrentSlideForContent', 'currentSlideId', 'isCurrentSlideForQuestion', 'checkIfUserEditedSlide', 'lastFocusedTiptapEditor', 'isFocusedTiptapEditorForQuestion', 'currentlyFocusedTiptapEditor', 'isTipTapEditorInFocus']),
    ...mapGetters('contentEditor', ['getQuestionById', 'getSlideValidationErrors', 'isSlideValidated']),

    isQuestionFIB() {
      return this.questionType === this.$constants.QuestionTypes.BLANK;
    },

    doesExplanationHaveAnyMedia() {
      return doesExplanationHaveAnyMedia(this.currentSlide);
    },

    viewPortDiff() {
      if (!window) {
        return {};
      }
      const bodyHeight = window.document.body.clientHeight;
      const { visibleViewportHeight } = this.deviceProps;

      return bodyHeight - visibleViewportHeight;
    },

    isContentSlideBeingEdited() {
      return this.isCurrentSlideForContent;
    },

    isQuestionSlideBeingEdited() {
      return this.isCurrentSlideForQuestion;
    },

    questionMediaTypes() {
      const media = {};

      this.currentSlide.structure.query.media.forEach((item) => {
        media[item.type] = item;
      });

      return media;
    },

    queryOptionsContainerStyles() {
      if (this.isCurrentQuestionTypingBased || this.isDrawQuestionType || this.isCurrentQuestionAudioVideoBased) {
        return {};
      }

      return {
        minHeight: 'calc(100% - 48px)',
      };
    },

    isDrawQuestionType() {
      return this.questionType === this.$constants.QuestionTypes.DRAW;
    },

    isEquationType() {
      return this.questionType === this.$constants.QuestionTypes.EQUATION;
    },

    isReorderQuestionType() {
      return this.questionType === this.$constants.QuestionTypes.REORDER;
    },

    isDnDImageQuestionType() {
      return this.questionType === this.$constants.QuestionTypes.DND_IMAGE;
    },

    isHotspotQuestionType() {
      return this.questionType === this.$constants.QuestionTypes.HOTSPOT;
    },

    deviceHeight() {
      return this.deviceProps.height;
    },

    deviceWidth() {
      return this.deviceProps.width;
    },

    showConditionallyAnswerExplanationButton() {
      return !this.isDesktop && !this.isCurrentQuestionOptionsBased && !this.isQuestionFIB;
    },

    isOptionBasedQuestion() {
      return !(this.isCurrentQuestionTypingBased || this.isDrawQuestionType || this.isCurrentQuestionAudioVideoBased || this.isCurrentQuestionOrderMatchBased);
    },
  },

  mounted() {
    // eslint-disable-next-line nuxt/no-globals-in-created
    window.document.body && window.document.body.classList.add('disable-scroll');

    this.$store.dispatch('contentEditor/resetIsAnswerExplanationsInView');
    this.$store.dispatch('contentEditor/toggleIsAnswerExplanationsInView');

    this.$nextTick(() => {
      this.setQuestionOptionsEditorStyles();
    });
    this.questionMountedOn = Date.now();

    this.shouldShowAnswerExplanationMobileEditor = doesQuestionHaveAnswerExplanations(this.currentSlide);

    /**
       * Need to set body scroll to 0 to make sure the top bar of broser is not sitting on the component
       */
    if (!this.isDesktop) {
      const body = document.querySelector('body');
      this.$scrollTo(body, 0);
    }

    this.$eventBus.$on('questionEditor:currentQuestionTypeChange', this.onCurrentQuestionTypeChange);
  },

  beforeUnmount() {
    this.fillAnswerNudgeTimeout && clearTimeout(this.fillAnswerNudgeTimeout);
    window.document.body && window.document.body.classList.remove('disable-scroll');
    this.$eventBus.$off('questionEditor:currentQuestionTypeChange', this.onCurrentQuestionTypeChange);
  },

  methods: {
    ...mapActions({
      flipOrderOfOptions: 'slideEditor/flipOrderOfOptions',
    }),

    setQuestionOptionsEditorStyles() {
      const optionsEditorWrapper = this.$refs['options-editor-wrapper'];

      if (isEmpty(optionsEditorWrapper) || !this.isTablet) {
        return;
      }

      const { height } = optionsEditorWrapper.getBoundingClientRect();

      this.questionOptionsEditorStyles = {
        height: `${height - this.viewPortDiff}px`,
      };
    },

    onQuestionEditAction(data) {
      this.$emit('onQuestionEditAction', data);
    },

    onQuestionEquationClick() {
      if (!this.isFocusedTiptapEditorForQuestion(this.currentlyFocusedTiptapEditor) && !this.isFocusedTiptapEditorForQuestion(this.lastFocusedTiptapEditor)) {
        return;
      }

      const elementToAddTo = this.currentlyFocusedTiptapEditor.id || this.lastFocusedTiptapEditor.id || '';

      if (isEmpty(elementToAddTo)) {
        return;
      }

      this.$eventBus.$emit('presentationEditor:showMathEditor', {
        callback: (latex) => {
          this.$eventBus.$emit('questionEditor:insertMath', {
            elementId: elementToAddTo,
            latex,
          });
        },
        closeCallback: () => {
          this.$eventBus.$emit('questionEditor:closeMathEditor', {
            elementId: elementToAddTo,
          });
        },
      });
    },

    onToggleAnswerExplanationMobileEditor() {
      this.shouldShowAnswerExplanationMobileEditor = !this.shouldShowAnswerExplanationMobileEditor;

      this.$nextTick(() => {
        const answerExplanationRef = this.$refs['question-answer-explanation-editor'];
        if (answerExplanationRef) {
          this.$scrollTo(answerExplanationRef.$el, 500, { container: '.question-editor-wrapper', easing: 'ease' });
        }
      });
    },

    onCurrentQuestionTypeChange(type) {
      if (this.$refs.questionEditorWrapper) {
        this.$refs.questionEditorWrapper.scroll({
          top: 0,
          behavior: 'smooth',
        });
      }

      // this.$eventBus.$emit('questionEditor:currentQuestionTypeChange', { type });

      this.$nextTick(() => {
        this.setQuestionOptionsEditorStyles();
      });
    },

    toggleMultipleAnswers() {
      const shouldChangeTypeToMCQ = this.areMultipleAnswersAllowed;
      const { hasCorrectAnswer } = this.questionSettings;

      if (shouldChangeTypeToMCQ) {
        this.$eventBus.$emit('questionEditor:currentQuestionTypeChange', { type: this.$constants.QuestionTypes.MCQ, settings: { hasCorrectAnswer } });
      } else {
        this.$eventBus.$emit('questionEditor:currentQuestionTypeChange', { type: this.$constants.QuestionTypes.MSQ, settings: { hasCorrectAnswer } });
      }
    },

    onAddAnswerOption() {
      this.showOptionsEditor = true;
    },

    onOrderSwitch(order) {
      this.flipOrderOfOptions({ order });
    },
  },
};
</script>

<style lang="scss" scoped>
$queryEditorHeight: 45%;
$optionEditorHeight: 100% - $queryEditorHeight;
$queryToolbarHeight: 100px;
$editorMobileTopbarHeight: 48px;

.question-editor-container {
  box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.8);
}

.question-editor-wrapper {
  height: calc(100vh - #{$editorMobileTopbarHeight});
}

.strobing-encouragement {
  background-color: rgba(#FFF, 0.2);
  z-index: 1;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  top: -4px;
  left: -4px;
}

.question-view-toggler-bg {
  height: calc(100% + 104px);
  width: calc(100% + 58px);
  top: -50px;
}

.options-editor-wrapper {
  .answer-explanation-button-in-options-editor {
    width: calc(100% - 32px);
  }

  &.tablet {
    flex: 1;
    max-height: 50%
  }
}

.media-btn {

  &:hover,
  &:active {
    transition: 0.2s ease all;
    background-color: rgba(#FFF, 0.1);
  }
}

.answer-explanation-wrapper {
  height: 50%;

  &.has-media {
    height: 100%
  }
}

.question-editor-modal {
  height: auto;

  &.is-options-question-type {
    &.tablet {
      min-height: calc(100% + 48px);
      height: 100%;
    }
  }

  &.is-classification-question-type {
    height: calc(100% - 48px);
    &.tablet {
      min-height: calc(100% + 48px);
      height: 100%;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active below version 2.1.8 */
  {
  opacity: 0;
}
</style>

<template>
  <transition
    appear
    enter-active-class="animate__animated animate__fadeInUp animation-duration-300"
    leave-active-class="animate__animated animate__fadeOutDown animation-duration-200"
    @after-enter="onAfterEditorWrapperEnter"
  >
    <div
      ref="quizQuestionWrapper"
      :class="['quiz-question-wrapper fixed h-full w-full  flex flex-col overflow-hidden select-none', wrapperClasses]"
      :style="wrapperStyles"
    >
      <SlideEditorToolbar
        v-if="isDesktop"
        ref="quizQuestionEditorToolbar"
        class="shrink-0"
        :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
        @onFormatButtonClicked="onFormatButtonClicked"
        @onFontColorChange="onFontColorChange"
      />
      <QuestionEditorContainer
        v-if="canSlideEditorBeRendered"
        ref="editorContainer"
        class="flex justify-center"
        :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
        :class="{ 'pb-12 overflow-y-auto overflow-x-hidden': isDesktop }"
        :style="editorContainerStyles"
        :canSlideEditorBeRendered="canSlideEditorBeRendered"
        :containerWidth="dimensionsAvailableForEditor.width"
        :containerHeight="dimensionsAvailableForEditor.height"
      />
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import cloneDeep from 'lodash/cloneDeep';
import isNumber from 'lodash/isNumber';

import { isWordCloudQuestion } from '~/utils/QuizUtils';
import CommunicateWithApp from '~/services/MobileAppCommunication';
import { nextTickCallback } from '~/utils/Utilities';

export default {

  props: {
    availableDimensions: {
      type: Object,
      default: () => ({}),
    },

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },

    displayType: {
      type: String,
      default: 'full',
    },
    sourcePage: {
      type: String,
      default: 'quizEditor',
    },
  },
  emits: ['questionEditActionCompleted'],

  data() {
    return {
      dimensionsAvailableForEditor: {},
      initialQuestionData: {},
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'isMobile']),
    ...mapGetters('slideEditor', ['currentlyFocusedTiptapEditor', 'currentSlide', 'lastFocusedTiptapEditor', 'isFocusedTiptapEditorForQuestion', 'checkIfUserEditedSlide', 'initialQuestionCopy']),
    ...mapGetters('contentEditor', ['isSlideValidated', 'quizId', 'quizType', 'versionId', 'quiz', 'draftId']),

    wrapperStyles() {
      if (this.isDesktop) {
        return {};
      }

      return {
        maxHeight: `${this.deviceProps.visibleViewportHeight}px`,
      };
    },

    wrapperClasses() {
      if (this.displayType === 'modal') {
        return 'bg-dark-80%';
      }

      return 'bg-dark-1 md:bg-dark-3';
    },

    canSlideEditorBeRendered() {
      return !isEmpty(this.dimensionsAvailableForEditor);
    },

    editorContainerPadding() {
      if (this.deviceProps.type === this.$constants.DeviceTypes.DESKTOP) {
        return [80, 200];
      }

      if (this.deviceProps.type === this.$constants.DeviceTypes.TABLET) {
        return [44, 140];
      }

      return [36, 108];
    },

    editorContainerStyles() {
      const editorToolbar = this.$refs.quizQuestionEditorToolbar;
      let height = '100%';

      if (editorToolbar) {
        height = `calc(100% - ${editorToolbar.$el.clientHeight}px)`;
      }

      return {
        height,
      };
    },

    deviceDiscriminator() {
      return values(this.deviceProps).join('');
    },
  },

  watch: {
    deviceDiscriminator() {
      this.calculateDimensionsAvailableForEditor();
    },

    currentlyFocusedTiptapEditor(value, oldValue) {
      if (!this.isFocusedTiptapEditorForQuestion(value)) {
        return;
      }

      if (isEmpty(value.id)) {
        // TODO(sarthak)
        this.$refs.quizQuestionEditorToolbar?.setCurrentMode(this.$constants.EditModes.DEFAULT);
        return;
      }

      this.$refs.quizQuestionEditorToolbar?.setCurrentMode(this.$constants.EditModes.TEXT);
    },
  },

  created() {
    this.$eventBus.$on('questionToolbar:editAction', this.onQuestionEditAction);
    this.initialQuestionData = cloneDeep(this.currentSlide);
    this.$store.dispatch('slideEditor/setSourcePage', this.sourcePage);
  },

  mounted() {
    // When the editor is shown, we want overflow hidden body to avoid double scroll
    document.body.style.overflow = 'hidden';
    this.setQuizEditorDisplayType({ quizEditorDisplayType: this.displayType });
    this.afterEditorEnterFailsafeTimer = setTimeout(this.onAfterEditorWrapperEnter.bind(this), 500);
    if (this.isMobile) {
      this.$store.dispatch('root/hideHelpButton');
    }

    this.$nextTick(() => {
      this.$eventBus.$on('slideElement:selectionUpdate', (state) => {
        if (this.$refs.quizQuestionEditorToolbar) {
          this.$refs.quizQuestionEditorToolbar.setSelectedFormatButtons(state);
        }
      });
    });
  },

  beforeUnmount() {
    // When the editor is hidden, we want body to be scrollable again
    document.body.style.overflow = '';
    this.$eventBus.$off('slideElement:selectionUpdate');

    this.afterEditorEnterFailsafeTimer && clearTimeout(this.afterEditorEnterFailsafeTimer);
    this.$eventBus.$off('questionToolbar:editAction', this.onQuestionEditAction);

    if (this.isMobile) {
      this.$store.dispatch('root/showHelpButton');
    }
    this.$store.dispatch('analyticsManager/removeQuestionInstanceEnrichmentData');
  },

  methods: {
    ...mapActions('uiManager', ['setQuizEditorDisplayType']),

    calculateDimensionsAvailableForEditor() {
      const editorContainer = this.$refs.quizQuestionWrapper;

      if (isEmpty(editorContainer)) { return; }

      const paddingX = this.editorContainerPadding[1];

      const availableWidth = isNumber(this.availableDimensions.width) ? this.availableDimensions.width : editorContainer.clientWidth;
      const width = availableWidth - (2 * paddingX);

      const availableHeight = editorContainer.clientHeight - this.$constants.TOOLBAR_HEIGHT - this.$constants.QUESTION_EDITOR_MENUS_HEIGHT;

      this.dimensionsAvailableForEditor = { width, height: availableHeight };

      // Scroll the editorContainer initially to center
    },

    onFormatButtonClicked(button) {
      switch (button) {
        case 'bold':
          this.$eventBus.$emit('slideElement:toggle', 'bold');
          break;
        case 'italic':
          this.$eventBus.$emit('slideElement:toggle', 'italic');
          break;
        case 'underline':
          this.$eventBus.$emit('slideElement:toggle', 'underline');
          break;
        case 'strikethrough':
          this.$eventBus.$emit('slideElement:toggle', 'strike');
          break;
        case 'subscript':
          this.$eventBus.$emit('slideElement:toggle', 'subscript');
          break;
        case 'superscript':
          this.$eventBus.$emit('slideElement:toggle', 'superscript');
          break;
        default:
      }
    },

    onFontColorChange(color) {
      const elementId = this.currentlyFocusedTiptapEditor.id || this.lastFocusedTiptapEditor.id;

      if (isEmpty(elementId)) {
        return;
      }

      this.$eventBus.$emit('questionElement:setFontColor', { elementId, color });
    },

    onAfterEditorWrapperEnter() {
      this.afterEditorEnterFailsafeTimer && clearTimeout(this.afterEditorEnterFailsafeTimer);

      setTimeout(this.calculateDimensionsAvailableForEditor.bind(this));
    },

    async onQuestionEditAction({ action, completionCallback = () => {} }) {
      const previousQuestionId = this.currentSlide._id;
      const handleSuccessfulEditActionCompletion = ({ previousQuestionId = this.currentSlide._id, updatedQuestionId = this.currentSlide._id, oldQuestionId } = {}) => {
        this.$emit('questionEditActionCompleted', {
          action, oldQuestionId, updatedQuestion: this.currentSlide, success: true, previousQuestionId, updatedQuestionId,
        });

        // if the editor is opened in the ReactNative Webview then we ask it to close the webview post save
        const appCommunication = new CommunicateWithApp();
        if (appCommunication.isRunningInWebView) {
          appCommunication.dispatchAction(appCommunication.actionTypes.POST_QUESTION_EDIT, {
            isSuccess: true,
            questionId: this.currentSlide._id,
          });
          return;
        }

        nextTickCallback(() => {
          completionCallback(true);
          setTimeout(() => {
            this.$store.dispatch('contentEditor/selectSlideById', '');
          });
        }, 2);
      };

      /**
       * If there is no change to the question then we can directly close the editor
       */
      if (!this.checkIfUserEditedSlide()) {
        handleSuccessfulEditActionCompletion({ oldQuestionId: previousQuestionId });

        return;
      }

      let questionType = this.currentlyFocusedTiptapEditor.slideType;
      if (isWordCloudQuestion(this.currentSlide)) {
        questionType = this.$constants.QuestionTypes.WORDCLOUD;
      }

      if (action === 'cancel') {
        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_QUESTION_CANCEL);
        this.$analytics.logEvent(eventName, {
          quizId: this.quizId,
          questionType,
          isQuestionEdited: this.checkIfUserEditedSlide(),
          sourcePage: this.sourcePage,
        });
      }

      if (action === 'cancel' && this.checkIfUserEditedSlide()) {
        /**
         * Since slideEditor has reference of question from contentEditor draft questions
         * So even if the user made some changes but decided to cancel, the contentEditor
         * question gets updated via the slideEditor reference and those changes persist after
         * cancel though just on the frontend.
         *
         * We manually reset the question to its initial state on cancel to fix this.
         */
        this.$store.dispatch('slideEditor/updateQuestion', { question: this.initialQuestionCopy });

        handleSuccessfulEditActionCompletion({ oldQuestionId: previousQuestionId });
        return;
      }

      if (!this.isSlideValidated(this.currentSlide)) {
        completionCallback(false);

        return;
      }

      const result = await this.$store.dispatch('contentEditor/saveQuizQuestion', { id: previousQuestionId });

      if (!result.success) {
        completionCallback(false);

        return;
      }

      this.$toasts.add({
        type: this.$constants.ToastTypes.SUCCESS,
        icon: 'fas fa-check-circle',
        title: this.$i18n('Question saved'),
      });

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_SAVE_QUESTION_BUTTON);
      this.$analytics.logEvent(eventName, {
        draftId: this.draftId,
        quizId: this.quizId,
        editorType: 'new',
        questionId: result.question._id,
        versionId: this.versionId,
        sourcePage: this.sourcePage,
      });

      this.$analytics.logEvent(this.$webEvents.SAVE_UNSAVE_QUESTION, {
        userId: this.$user.id,
        quizId: this.quizId,
        questionId: result.question._id,
        questionType,
        action,
      });

      handleSuccessfulEditActionCompletion({ updatedQuestionId: result.question._id, oldQuestionId: previousQuestionId });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

</style>

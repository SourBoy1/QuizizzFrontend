<template>
  <div class="flex flex-1 h-full w-full">
    <Header />
    <div
      ref="questionEditorWrapper"
      class="w-full mt-12 overflow-y-auto question-editor-wrapper"
    >
      <div
        ref="questionEditorModal"
        class="w-full overflow-hidden rounded-lg  question-editor-modal md:p-2 justify-between flex flex-col"
        :class="isSolutionSelected ? 'h-auto' : 'h-full'"
      >
        <div
          ref="queryOptionsContainer"
          class="flex flex-col h-full justify-between query-options-container"
        >
          <div
            :key="`${questionDiscriminator}_query`"
            class="relative flex flex-1 query-editor-wrapper"
          >
            <MobileGraphing
              ref="questionQueryEditor"
              class="relative w-full z-10 bg-purple shrink-0 p-2"
              :questionType="questionType"
              :selectedSlideType="selectedSlideType"
            />
          </div>
        </div>
      </div>

      <GraphingPlotEditor
        v-if="isSolutionSelected"
        class="flex aspect-square relative w-full px-2 bg-purple"
      />

      <div
        v-if="isSolutionSelected"
        class="flex mt-2 mx-2"
      >
        <Button
          :title="$i18n('Add an answer explanation')"
          fullWidth
          :size="'md'"
          licon="fas fa-lightbulb-on"
          type="transparent"
          @click="onToggleAnswerExplanationMobileEditor"
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
        v-if="isEditorForQuizContent && isSolutionSelected"
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
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';

import Header from '~/components/QuestionEditor/Layouts/Mobile/Widgets/Header.vue';
import QueryEditorMixin from '~/mixins/QueryEditorMixin';
import MobileGraphing from '~/components/QuestionQueryEditor/MobileGraphing.vue';
import QuestionEditorGraphMixin from '~/mixins/questionEditorGraphMixin';
import GraphingPlotEditor from '~/components/GraphingPlot/EditorContainer.vue';

export default {
  components: {
    Header,
    MobileGraphing,
    GraphingPlotEditor,
  },

  mixins: [QueryEditorMixin, QuestionEditorGraphMixin],

  props: {
    editorDimensions: {
      type: Object,
      default: () => {},
    },

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
      default: () => {},
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
      shouldShowAnswerExplanationMobileEditor: false,
    };
  },

  computed: {
    ...mapGetters({
      isEditorForQuizContent: 'contentEditor/isEditorForQuizContent',
    }),
  },

  created() {
    this.setGraphComponentReady(false);
    this.updateGraphDataFromQuestion();
  },

  methods: {
    ...mapActions({
      setGraphComponentReady: 'slideEditor/setGraphComponentReady',
      updateGraphDataFromQuestion: 'slideEditor/updateGraphDataFromQuestion',
    }),

    onToggleAnswerExplanationMobileEditor() {
      this.shouldShowAnswerExplanationMobileEditor = !this.shouldShowAnswerExplanationMobileEditor;

      this.$nextTick(() => {
        const answerExplanationRef = this.$refs['question-answer-explanation-editor'];
        if (answerExplanationRef) {
          this.$scrollTo(answerExplanationRef.$el, 500, { container: '.question-editor-wrapper', easing: 'ease' });
        }
      });
    },

    onQuestionEditAction(data) {
      this.$emit('onQuestionEditAction', data);
    },
  },
};
</script>

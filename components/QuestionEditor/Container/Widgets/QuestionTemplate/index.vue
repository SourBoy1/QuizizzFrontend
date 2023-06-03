<template>
  <div
    v-if="isTemplateEnabled && templateData"
    class="h-full flex my-2"
    :style="editorStyles"
  >
    <div
      v-if="isCollapsed"
      class="h-full w-12 flex justify-center rounded-lg p-2 bg-dark-50%"
    >
      <TemplateHeaderPencil
        v-tooltip.bottom="$i18n('Pick a template')"
        @click="toggleTemplates"
      />
    </div>
    <div
      v-else
      class="flex flex-col flex-1 h-full p-2 rounded-lg bg-dark-50%"
    >
      <QuestionTemplateHeader
        @template-toggled="toggleTemplates"
      />
      <div class="overflow-scroll scrollbar-hide">
        <TemplateList
          v-for="(template) in templateData"
          :key="template.name"
          :templateData="template"
          @template-selected="handleTemplateSelected"
          @template-hovered="handleTemplateHovered"
          @template-hover-canceled="handleTemplateHoverCancel"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { QuestionTypes } from '@/config/Constants/EditorConstants';
import NewSlideService from '@/services/NewSlideService';
import TemplateList from './TemplateList.vue';
import QuestionTemplateHeader from './QuestionTemplateHeader.vue';

import TemplateHeaderPencil from './TemplateHeaderPencil.vue';

// If the templates needed to apply to additional question types, then they must be added here.
const templateURLToQTypeMap = {
  [QuestionTypes.GRAPHING]: 'https://cf.quizizz.com/question-template/template-data.json',
};

export default {

  components: {
    TemplateList,
    QuestionTemplateHeader,
    TemplateHeaderPencil,
  },

  props: {
    questionType: {
      type: String,
      required: true,
      validator: (value) => Object.values(QuestionTypes).includes(value),
    },
  },

  data() {
    return {
      isCollapsed: true,
      templateData: null,
      isHoverEffectActive: false,
    };
  },

  computed: {
    ...mapGetters({
      deviceProps: 'root/deviceProps',
      editorDimensions: 'contentEditor/questionEditorDimensions',
      isQuizWithoutDrafts: 'contentEditor/isQuizWithoutDrafts',
      isEditorForPresentationContent: 'contentEditor/isEditorForPresentationContent',
      quizId: 'contentEditor/quizId',
    }),

    isTemplateEnabled() {
      const isFeatureEnabled = this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_EDITOR_QUESTION_TEMPLATES);
      const enabledQuestionTypes = Object.keys(templateURLToQTypeMap);
      return (
        !this.isEditorForPresentationContent
        && !this.isQuizWithoutDrafts
        && isFeatureEnabled
        && enabledQuestionTypes.includes(this.questionType)
      );
    },

    editorStyles() {
      const CONTAINER_SIZE_WIDTH = 200;
      let xTranslate = 0;
      const containerScaledSize = CONTAINER_SIZE_WIDTH * this.editorDimensions.scale;
      const distanceBetweenScreenRightAndQuestionEditorLeft = containerScaledSize + ((this.deviceProps.width - containerScaledSize) / 2);
      const peekAmount = this.editorDimensions.scale * CONTAINER_SIZE_WIDTH;
      xTranslate = (-distanceBetweenScreenRightAndQuestionEditorLeft + peekAmount + 8) / this.editorDimensions.scale;
      return {
        position: 'absolute',
        width: `${CONTAINER_SIZE_WIDTH}px`,
        transform: `scale(${this.editorDimensions.scale}) translateX(${xTranslate}px)`,
      };
    },
  },

  async mounted() {
    if (this.isTemplateEnabled) {
      const dataUrl = templateURLToQTypeMap[this.questionType];
      const dataRes = await fetch(dataUrl);
      const data = await dataRes.json();
      this.templateData = data;
      this.expandTimer = setTimeout(() => {
        this.isCollapsed = false;
        this.trackTemplateShown(true);
      }, 3000);
    }
  },

  beforeUnmount() {
    if (this.expandTimer) {
      clearTimeout(this.expandTimer);
    }
  },

  methods: {
    ...mapActions({
      setPreviewQuestion: 'slideEditor/setPreviewQuestion',
      disablePreviewQuestion: 'slideEditor/disablePreviewQuestion',
      updateGraphDataFromQuestion: 'slideEditor/updateGraphDataFromQuestion',
      setPreviewGraph: 'slideEditor/setPreviewGraph',
      setQuestionFromTemplate: 'slideEditor/setQuestionFromTemplate',
    }),

    trackTemplateShown(isAutoExpanded) {
      this.$analytics.logEvent(this.$webEvents.QUESTION_EDITOR_TEMPLATE_SHOWN, {
        quizId: this.quizId,
        questionType: this.questionType,
        isAutoExpanded,
      });
    },

    toggleTemplates() {
      if (this.expandTimer && this.isCollapsed) {
        this.trackTemplateShown(false);
      }
      if (this.expandTimer) {
        clearTimeout(this.expandTimer);
        this.expandTimer = null;
      }
      if (!this.isCollapsed) {
        // when user clicks on collapse
        this.$analytics.logEvent(this.$webEvents.QUESTION_EDITOR_TEMPLATE_COLLAPSED, {
          quizId: this.quizId,
          questionType: this.questionType,
        });
      }
      this.isCollapsed = !this.isCollapsed;
    },

    getGraphingTemplateQuestion(data) {
      const question = NewSlideService.createQuestion(this.questionType);
      question.structure.answer = data.answer;
      question.structure.query = data.questionQuery;
      question.structure.graphs = data.graphs;
      const { answerPlot, nonInteractivePlots } = data.graphs.reduce((acc, graph) => {
        if (graph.plotId === data.answer[0]) {
          acc.answerPlot = graph;
        } else {
          acc.nonInteractivePlots.push(graph);
        }
        return acc;
      }, { answerPlot: {}, nonInteractivePlots: [] });

      const graphTemplateData = {
        graphEditorState: 1,
        answerPlotType: data.plotType,
        answerPlot,
        nonInteractivePlots,
      };
      this.setPreviewGraph(graphTemplateData);
      return question;
    },

    handleTemplateHovered(data) {
      if (this.isHoverEffectActive) {
        return;
      }
      this.isHoverEffectActive = true;
      // avoiding lengthy if-else and switch statements
      const templateQuestionExecMap = {
        [QuestionTypes.GRAPHING]: this.getGraphingTemplateQuestion,
      };
      const templateQuestionGetter = templateQuestionExecMap[this.questionType];

      if (templateQuestionGetter) {
        const question = templateQuestionGetter(data);
        this.setPreviewQuestion(question);
      }
    },

    handleTemplateSelected(templateData, segmentName) {
      this.isHoverEffectActive = false;
      this.setQuestionFromTemplate({ templateData, segmentName });
      this.$analytics.logEvent(this.$webEvents.QUESTION_EDITOR_TEMPLATE_SELECTED, {
        segmentName,
        description: templateData?.description,
        questionType: this.questionType,
      });
    },

    handleTemplateHoverCancel() {
      this.isHoverEffectActive = false;
      this.disablePreviewQuestion();
    },
  },
};
</script>

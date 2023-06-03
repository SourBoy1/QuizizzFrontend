<!-- eslint-disable vue/no-deprecated-v-on-native-modifier -->
<template>
  <div
    :class="isDesktop ? 'flex-row' : 'flex-col'"
  >
    <div
      class="flex"
      :class="prepping ? 'visible flex-1' : 'invisible h-0 w-0'"
    >
      <span class="text-xl text-light"> Loading </span>
    </div>
    <div
      class="flex"
      :class="prepping ? 'invisible h-0 w-0' : 'visible'"
    >
      <canvas
        ref="canvas"
        class="flex aspect-square bg-light-1 w-full h-full rounded"
        @click="handleCanvasClick"
      />
    </div>
    <Button
      v-if="isSolutionSelected && isDesktop"
      v-tooltip="{
        content: $i18n('Add non interactive plots'),
        placement: 'bottom',
      }"
      class="z-5 top-3 right-3"
      :absolutePositioning="true"
      rounded="sm"
      size="xl"
      type="dark"
      licon="fas fa-chart-line"
      :title="$i18n('Edit Chart')"
      :aria-label="$i18n('Edit Chart')"
      @click.native="() => { setEditGraphModalOpen(true); }"
    />
    <div
      v-if="isSolutionSelected && isDesktop && isNotAnswerPlotPoints"
      class="absolute bottom-2 right-2 z-5 flex"
    >
      <FAwoSize
        v-if="equationCollapsed"
        class="
          fas
          fa-chevrons-up
          w-8
          h-8
          rounded-tl-lg
          bg-dark bg-opacity-60
          hover:bg-opacity-100
          justify-center
          text-xl text-light
          cursor-pointer
        "
        @click.native="toggleCollapse"
      />
      <div
        v-else
        class="flex w-80 rounded-tl-lg bg-dark bg-opacity-80"
      >
        <div class="flex flex-col w-full h-full">
          <div class="flex flex-row w-full">
            <i18n class="text-sm text-light pl-2 flex flex-1 items-center font-bold">
              Equation (Only visible to you)
            </i18n>
            <FAwoSize
              v-if="!equationCollapsed"
              class="
                fas
                fa-chevrons-down
                w-8
                h-8
                bg-dark bg-opacity-0
                hover:bg-opacity-100
                justify-center
                text-xl text-light
                cursor-pointer
              "
              @click.native="toggleCollapse"
            />
          </div>
          <div
            v-if="!prepping"
            class="flex"
          >
            <div
              class="text-light pl-2 items-center inline-block resizeDiv w-full text-3xl"
              v-html="katexHTML"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="shouldShowGraphSelectorEducation"
      class="bg-dark-90% pt-4 pb-4 pr-2 pl-2 text-light text-2xl flex absolute w-105 rounded-lg text-center left-[55.5%] top-[43.1%]"
    >
      ⬅️<i18n>Select the appropriate type of solution for this question</i18n>
    </div>
    <div
      v-if="(isSolutionSelected && !valueChanged) || shouldShowNumOfPointsHelper"
      :class="isDesktop ? 'bg-dark-90% pt-4 pb-4 pr-2 pl-2 text-light text-2xl flex absolute w-105 rounded-lg text-center left-[55.5%] top-[70%]' : 'bg-dark-90% mx-auto p-2 text-light text-xs flex absolute rounded-lg text-center w-80 left-0 right-0 top-[70%]'"
    >
      {{ helperTextForPlot() }}
    </div>
    <div
      v-if="!isDesktop"
      class="w-full flex py-2 h-10"
    >
      <div class="flex bg-dark-50% rounded-l-md">
        <span class="text-light text-xxs pl-2 flex items-center font-semibold">Equation : </span>
      </div>
      <div class="flex flex-1 bg-dark-50% mr-2 rounded-r-md">
        <div
          v-if="!prepping"
          class="flex"
        >
          <div
            class="text-light items-center inline-block resizeDiv w-full"
            v-html="katexHTML"
          />
        </div>
      </div>
      <Button
        class="flex"
        rounded="sm"
        size="xs"
        type="dark"
        licon="fas fa-chart-line"
        :title="$i18n('Edit Chart')"
        :aria-label="$i18n('Edit Chart')"
        @click.native="() => { setEditGraphModalOpen(true); }"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import katex from 'katex';

import QuestionEditorGraphMixin from '~/mixins/questionEditorGraphMixin';
import QLogger from '~/services/QLogger';
import FAwoSize from '~/components/FAwoSize.vue';

export default {

  components: {
    FAwoSize,
  },

  mixins: [QuestionEditorGraphMixin],

  data() {
    return {
      prepping: true,
      canvas: null,
      graphId: '',
      graphData: {},
      answerPlot: '',
      answerEquation: 'Waiting...',
      lastHoverGraph: 0,
      equationCollapsed: false,
      katex: null,
      valueChanged: false,
      originalAnswerPlot: {},
      hasNumOfPointsHelperBeenShown: false,
      isCanvasClicked: false,
    };
  },

  computed: {
    ...mapGetters({
      getHoverGraphType: 'slideEditor/getHoverGraphType',
      getAnswerPlotType: 'slideEditor/getAnswerPlotType',
      getGraphEditorState: 'slideEditor/getGraphEditorState',
      getGraphComponentReady: 'slideEditor/getGraphComponentReady',
      getGrapher: 'root/getGrapher',
      getNonInteractivePlots: 'slideEditor/getNonInteractivePlots',
      getAnswerPlot: 'slideEditor/getAnswerPlot',
      getGraphScale: 'slideEditor/getGraphScale',
      isEditorForPresentationContent: 'contentEditor/isEditorForPresentationContent',
      isDesktop: 'root/isDesktop',
      deviceProps: 'root/deviceProps',
      isQuestionPreviewActive: 'slideEditor/getIsPreviewActive',
      usedQuestionTemplate: 'slideEditor/usedQuestionTemplate',
      getIsPreviewActive: 'slideEditor/getIsPreviewActive',
    }),

    shouldShowNumOfPointsHelper() {
      return !this.hasNumOfPointsHelperBeenShown
      && this.getAnswerPlot?.data?.points?.length === 1
      && !this.isQuestionPreviewActive
      && !this.usedQuestionTemplate.isUsed;
    },

    shouldShowGraphSelectorEducation() {
      return this.isWaitingForSolutionSelection && this.getHoverGraphType === this.getNonePlotType() && this.isCanvasClicked;
    },

    isTouchSupported() {
      return this.deviceProps?.isTouchSupported || false; // false, not falsy
    },

    katexHTML() {
      let katexEle = '';
      try {
        katexEle = this.katex
          ? this.katex.renderToString(this.answerEquation, {
            displayMode: true,
          })
          : '';
      } catch (err) {
        QLogger.error(`Failed in setting katexEle :: ${err}`);
      }
      // eslint-disable-next-line vue/no-async-in-computed-properties
      this.$nextTick(() => {
        // need the katex to expand and take the required space before setting size
        this.setFontSizeOfResizeDiv(this.isDesktop);
      });
      return katexEle;
    },

    isNotAnswerPlotPoints() {
      return this.getAnswerPlotType !== this.getPointsPlotType();
    },

    shouldTrackInteraction() {
      return this.isSolutionSelected && this.valueChanged && !this.getIsPreviewActive;
    },
  },

  watch: {
    shouldShowNumOfPointsHelper(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.hasNumOfPointsHelperBeenShown = true;
        }, 1000);
      }
    },

    getHoverGraphType(newVal) {
      if (!this.getGraphComponentReady) {
        this.lastHoverGraph = newVal;
        return;
      }
      this.removeAllPlots();
      this.addPlotInternal(this.graphId, newVal, false, this.getHoverPlotData(newVal), '', 0.5);
    },

    getAnswerPlotType(newVal) {
      if (this.answerPlot === '') {
        this.removeAllPlots();
      } else {
        this.getGrapher.Creator.removePlot(this.graphId, this.answerPlot);
      }

      this.createAnswerPlotFromType(newVal);
    },

    getNonInteractivePlots() {
      this.setupWithData();
    },

    getGraphScale() {
      this.changeGraphScale();
    },

    shouldTrackInteraction(newValue, oldValue) {
      if (newValue && !oldValue) {
        this.$analytics.logEvent(this.$webEvents.CREATOR_INTERACTED_WITH_GRAPH, {
          quizId: this.quizId,
          graphId: this.graphData.graphId,
          plotId: this.getAnswerPlot.plotId,
          plotType: this.getAnswerPlot.type,
          newEquation: this.getAnswerPlot.equation,
        });
      }
    },
  },

  async mounted() {
    if (this.getGrapher === null) {
      const grapher = await import(/* webpackPrefetch: true */ '~/lib/grapher');
      this.setGrapher(grapher);
    }
    this.canvas = this.$refs.canvas;
    const newSetup = this.getGraphScale === 1 ? this.getGrapher.Default10Graph : this.getGrapher.Default20Graph;
    this.debouncedUpdateGraphIntoQuestionForSlide = debounce(() => {
      this.updateGraphDataIntoQuestion(true);
      this.validateQuestions();
    }, 500);
    this.graphId = this.getGrapher.Creator.setupNewCanvas(this, this.canvas, {
      ...newSetup,
      onBroadcastUpdate: this.onBroadcastUpdate.bind(this),
      isMobile: this.isTouchSupported,
    });
    this.setGraphComponentReady(true);
    this.setInitialValues();
    this.katex = katex;
    this.prepping = false;
    this.$eventBus.$on('questionEditor:triggerPreSaveActions', this.triggerPreSaveActions);
  },

  beforeUnmount() {
    if (this.getGrapher === null) {
      return;
    }
    this.getGrapher.Creator.removeCanvas(this.graphId);
    this.$eventBus.$off('questionEditor:triggerPreSaveActions', this.triggerPreSaveActions);
  },

  methods: {
    ...mapActions({
      setGraphComponentReady: 'slideEditor/setGraphComponentReady',
      setEditGraphModalOpen: 'slideEditor/setEditGraphModalOpen',
      setGrapher: 'root/setGrapher',
      setAnswerPlot: 'slideEditor/setAnswerPlot',
      updateQuestionAnswer: 'slideEditor/updateQuestionAnswer',
      updateGraphDataIntoQuestion: 'slideEditor/updateGraphDataIntoQuestion',
      validateQuestions: 'contentEditor/validateQuestions',
    }),

    handleCanvasClick() {
      this.isCanvasClicked = true;
    },

    onBroadcastUpdate(data) {
      this.graphData = data;
      this.graphData.plots.forEach((plot) => {
        if (plot.plotId === this.answerPlot) {
          this.answerEquation = plot.latex;
          this.updateAnswerPlot(plot);
          if (!this.valueChanged && !isEqual(this.originalAnswerPlot, plot)) {
            this.valueChanged = true;
          }
        }
      });
      if (this.isEditorForPresentationContent) {
        this.debouncedUpdateGraphIntoQuestionForSlide();
      }
    },

    removeAllPlots() {
      this.graphData.plots.forEach((plot) => {
        this.getGrapher.Creator.removePlot(this.graphId, plot.plotId);
      });
      this.setupNonInteractivePlots();
    },

    removeAllPlotsButAnswerPlot() {
      this.graphData.plots.forEach((plot) => {
        if (plot.plotId === this.answerPlot) { return; }
        this.getGrapher.Creator.removePlot(this.graphId, plot.plotId);
      });
    },

    setupNonInteractivePlots() {
      this.getNonInteractivePlots.forEach((plot) => {
        this.addPlotInternal(this.graphId, plot.type, false, plot.data, plot.plotId, 1, '#424242');
      });
    },

    addPlot(graphType, alpha = 1, data = null) {
      return this.addPlotInternal(this.graphId, graphType, true, data, '', alpha);
    },

    toggleCollapse() {
      this.equationCollapsed = !this.equationCollapsed;
    },

    setFontSizeOfResizeDiv(byWidth) {
      const fontSet = [28, 24, 20, 18, 16, 14, 12, 11, 7];
      const itemList = this.$el.getElementsByClassName('resizeDiv');
      if (itemList.length === 0) {
        return;
      }
      let currentIndex = 0;
      const parent = itemList[0];
      parent.style.fontSize = `${fontSet[currentIndex]}px`;
      while (byWidth ? (parent.scrollWidth > parent.clientWidth) : (parent.scrollHeight > parent.clientHeight)) {
        if (currentIndex + 1 >= fontSet.length) {
          break;
        }
        currentIndex += 1;
        parent.style.fontSize = `${fontSet[currentIndex]}px`;
      }
    },

    triggerPreSaveActions() {
      this.updateGraphDataIntoQuestion();
    },

    setInitialValues() {
      if (this.getAnswerPlotType !== 0) {
        if (isEmpty(this.getAnswerPlot)) {
          this.createAnswerPlotFromType(this.getAnswerPlotType);
        }
        this.answerPlot = this.getAnswerPlot.plotId;
        this.lastHoverGraph = this.answerPlot;
        this.updateQuestionAnswer({ answer: [this.answerPlot] });
        this.setupWithData();
      } else {
        this.addPlot(this.lastHoverGraph, 1);
      }
    },

    setupWithData() {
      this.removeAllPlots();
      this.setupNonInteractivePlots();
      this.addPlotInternal(this.graphId, this.getAnswerPlot.type, true, this.getAnswerPlot.data, this.getAnswerPlot.plotId);
    },

    helperTextForPlot() {
      if (this.shouldShowNumOfPointsHelper) {
        return this.$i18n('You can add up to 10 points as the correct answer');
      }
      switch (this.getAnswerPlotType) {
        case this.getLinearPlotType():
          return this.$i18n('Drag the two points to mark the correct answer');
        case this.getQuadraticPlotType():
          return this.$i18n('Drag the two points to mark the correct answer');
        case this.getExponentialPlotType():
          return this.$i18n('Drag the two points and asymptote line to mark the correct answer');
        case this.getPointsPlotType():
          return this.$i18n('Add or delete the correct answers with a click and drag to move them.');
        default:
          return this.$i18n('Drag the two points to mark the correct answer');
      }
    },

    changeGraphScale() {
      // change graph style
      const newSetup = this.getGraphScale === 1 ? this.getGrapher.Default10Graph : this.getGrapher.Default20Graph;
      this.getGrapher.Creator.removeCanvas(this.graphId);
      this.graphId = this.getGrapher.Creator.setupNewCanvas(this, this.canvas, {
        ...newSetup,
        onBroadcastUpdate: this.onBroadcastUpdate.bind(this),
        isMobile: !this.isDesktop,
      });
      this.setupWithData();
    },

    updateAnswerPlot(plot) {
      if (!isEqual(this.getAnswerPlot, plot)) {
        this.setAnswerPlot(plot);
      }
    },

    createAnswerPlotFromType(graphType) {
      this.answerPlot = this.addPlot(graphType, 1);
      this.updateQuestionAnswer({ answer: [this.answerPlot] });

      if (this.answerPlot === '') {
        QLogger.error(`Answer Plot is not yet supported :${graphType}`);
      } else {
        this.graphData = this.getGrapher.Creator.getGraphData(this.graphId);
        this.graphData.plots.forEach((plot) => {
          if (plot.plotId === this.answerPlot) {
            this.originalAnswerPlot = plot;
            this.valueChanged = false;
            this.hasNumOfPointsHelperBeenShown = false;
            this.answerEquation = plot.latex;
            this.updateAnswerPlot(plot);
          }
        });
      }
    },

    getHoverPlotData(graphTypePassed) {
      const graphType = this.graphTypePassedToGraphType(graphTypePassed);
      switch (graphType) {
        case this.getPointsPlotType():
          return {
            points: [
              {
                loc: {
                  x: 0,
                  y: 0,
                },
              },
              {
                loc: {
                  x: -4,
                  y: 4,
                },
              },
              {
                loc: {
                  x: 6,
                  y: 4,
                },
              },
              {
                loc: {
                  x: 8,
                  y: -4,
                },
              },
            ],
          };
        default:
          return null;
      }
    },
  },
};
</script>

import { mapGetters, mapActions } from 'vuex';

import QLogger from '~/services/QLogger';
import Constants from '~/config/Constants';
import i18n from '~/services/i18n';

export const WAITING_FOR_SOLUTION_SELECTION = 0;
export const SOLUTION_SELECTED = 1;

const GRAPH_TYPES = {
  0: 'None',
  1: 'Points',
  2: 'Linear',
  3: 'Quadratic',
  4: 'Exponential',
};

export const GraphingButtonData = {
  Points: {
    bgColor: 'bg-brand-a',
    icon: 'fa-circle-small',
    title: i18n('Points'),
  },
  Quadratic: {
    bgColor: 'bg-brand-c',
    icon: 'fa-wave-sine',
    title: i18n('Quadratic'),
  },
  Linear: {
    bgColor: 'bg-brand-b',
    icon: 'fa-horizontal-rule',
    title: i18n('Linear'),
  },
  Exponential: {
    bgColor: 'bg-brand-e',
    icon: 'fa-superscript',
    title: i18n('Exponential'),
  },
  Disabled: {
    bgColor: 'bg-light-10% text-light-20%',
    icon: 'fa-chart-line',
    title: i18n('Disabled'),
  },
};

export default {
  computed: {
    ...mapGetters({
      getGraphEditorState: 'slideEditor/getGraphEditorState',
      getGrapher: 'root/getGrapher',
      isDesktop: 'root/isDesktop',
      quizId: 'contentEditor/quizId',
    }),

    isWaitingForSolutionSelection() {
      return this.getGraphEditorState === WAITING_FOR_SOLUTION_SELECTION;
    },

    isSolutionSelected() {
      return this.getGraphEditorState === SOLUTION_SELECTED;
    },

    graphingButtonData() {
      return GraphingButtonData;
    },
  },

  methods: {
    ...mapActions({
      setAnswerPlotType: 'slideEditor/setAnswerPlotType',
      setGraphEditorState: 'slideEditor/setGraphEditorState',
    }),

    getValForWaitingForSolutionSelection() {
      return WAITING_FOR_SOLUTION_SELECTION;
    },
    getValForSolutionSelected() {
      return SOLUTION_SELECTED;
    },
    getNonePlotType() {
      return Constants.PlotType.None;
    },
    getPointsPlotType() {
      return Constants.PlotType.Points;
    },
    getLinearPlotType() {
      return Constants.PlotType.Linear;
    },
    getQuadraticPlotType() {
      return Constants.PlotType.Quadratic;
    },
    getExponentialPlotType() {
      return Constants.PlotType.Exponential;
    },

    convertToPlotString(graphTypeNumber) {
      switch (graphTypeNumber) {
        case Constants.PlotType.None:
          return 'None';
        case Constants.PlotType.Points:
          return 'Points';
        case Constants.PlotType.Linear:
          return 'Linear';
        case Constants.PlotType.Quadratic:
          return 'Quadratic';
        case Constants.PlotType.Exponential:
          return 'Exponential';
        default:
          QLogger.error('Did not match any type of graph value got :', graphTypeNumber);
          break;
      }
    },

    graphTypePassedToGraphType(graphTypePassed) {
      return isNaN(graphTypePassed) ? (Constants.PlotType[graphTypePassed] ?? Constants.PlotType.None) : graphTypePassed;
    },

    addPlotInternal(graphId, graphTypePassed, interactive, plotData = null, overridePlotId = '', alpha = 1, overrideColor = '') {
      let plotId = '';
      const graphType = this.graphTypePassedToGraphType(graphTypePassed);
      const colorConversion = (data) => {
        let newData = data;
        if (overrideColor !== '') {
          newData = overrideColor;
        }
        if (alpha !== 1) {
          newData = this.getGrapher.changeColorAlpha(newData, alpha);
        }
        return newData;
      };
      switch (graphType) {
        case Constants.PlotType.None:
          break;
        case Constants.PlotType.Points:
          plotId = this.getGrapher.Creator.addPlot(
            graphId,
            interactive,
            'Points',
            plotData === null ? this.getGrapher.DefaultPointData : plotData,
            colorConversion(this.getGrapher.DefaultPointsColor),
            overridePlotId,
          );
          break;
        case Constants.PlotType.Linear:
          plotId = this.getGrapher.Creator.addPlot(
            graphId,
            interactive,
            'Linear',
            plotData === null ? this.getGrapher.DefaultLinearData : plotData,
            colorConversion(this.getGrapher.DefaultLinearColor),
            overridePlotId,
          );
          break;
        case Constants.PlotType.Quadratic:
          plotId = this.getGrapher.Creator.addPlot(
            graphId,
            interactive,
            'Quadratic',
            plotData === null ? this.getGrapher.DefaultQuadraticData : plotData,
            colorConversion(this.getGrapher.DefaultQuadraticColor),
            overridePlotId,
          );
          break;
        case Constants.PlotType.Exponential:
          plotId = this.getGrapher.Creator.addPlot(
            graphId,
            interactive,
            'Exponential',
            plotData === null ? this.getGrapher.DefaultExponentialData : plotData,
            colorConversion(this.getGrapher.DefaultExponentialColor),
            overridePlotId,
          );
          break;
        default:
          QLogger.error('Did not match any type of graph');
          break;
      }
      return plotId;
    },

    onPlotSelection(graphType) {
      const eventName = this.currentGraph ? this.$webEvents.GRAPH_CHANGE_ON_EDITOR : this.$webEvents.INITIAL_GRAPH_SELECTION_ON_EDITOR;
      this.$analytics.logEvent(eventName, {
        graph: GRAPH_TYPES[graphType],
        quizId: this.quizId,
      });
      this.setAnswerPlotType(graphType);
      this.setGraphEditorState(this.getValForSolutionSelected());
    },
  },
};

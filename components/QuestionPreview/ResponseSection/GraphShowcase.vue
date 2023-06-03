<template>
  <div class="flex aspect-square min-w-0">
    <NonInteractiveGraphWidget
      :plots="getPlotsFromQuestion"
      :scale="getScale"
    />
  </div>
</template>

<script>
import NonInteractiveGraphWidget from '~/components/GraphingPlot/NonInteractiveGraphWidget.vue';

export default {

  components: {
    NonInteractiveGraphWidget,
  },

  props: {
    currentQuestion: {
      type: Object,
      require: true,
      default: () => ({}),
    },

    showAnswers: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    getPlotsFromQuestion() {
      const answerPlotId = this.currentQuestion.structure.answer[0];
      let answerPlot = {};
      const plots = [];
      for (let index = 0; index < this.currentQuestion.structure.graphs.length; index++) {
        const plot = this.currentQuestion.structure.graphs[index];
        if (plot.plotId === answerPlotId) {
          answerPlot = plot;
        } else {
          plots.push({
            plotData: plot,
            color: '#424242',
          });
        }
      }
      if (this.showAnswers) {
        plots.push({
          plotData: answerPlot,
          color: '#00C985',
        });
      } else if (this.currentQuestion?.structure?.settings?.graphData?.type !== 'Points') {
        const answerType = this.currentQuestion.structure?.settings?.graphData?.type || 'Linear';
        plots.push({
          plotType: answerType,
        });
      }
      return plots;
    },

    getScale() {
      return this.currentQuestion.structure?.settings?.graphData?.sizer || 1;
    },
  },

};
</script>

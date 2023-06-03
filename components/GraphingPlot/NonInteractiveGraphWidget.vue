<template>
  <div class="flex aspect-square min-w-0 w-full h-full min-h-0">
    <canvas
      ref="canvas"
      class="flex aspect-square rounded border-dark-6 border"
    />
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex';

export default {

  props: {
    /*
    // the Order of the plots are back to front from index 0
    {
      plotData: plot,
      color : '#ffffff'
      plotType: 'Linear'
    }
    */
    plots: {
      type: Array,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      canvas: null,
      graphId: '',
      graphData: {},
    };
  },

  computed: {
    ...mapGetters({
      getGrapher: 'root/getGrapher',
      isDesktop: 'root/isDesktop',
    }),
  },

  watch: {
    plots() {
      if (this.graphId === '') { return; }
      this.graphData.plots.forEach((plot) => {
        this.getGrapher.Creator.removePlot(this.graphId, plot.plotId);
      });
      this.setupInitialState();
    },

    scale() {
      const newSetup = this.scale === 1 ? this.getGrapher.Default10Graph : this.getGrapher.Default20Graph;
      this.getGrapher.Creator.removeCanvas(this.graphId);
      this.graphId = this.getGrapher.Creator.setupNewCanvas(this, this.canvas, {
        ...newSetup,
        onBroadcastUpdate: this.onBroadcastUpdate.bind(this),
        isMobile: !this.isDesktop,
      });
      this.setupInitialState();
    },
  },

  async mounted() {
    if (this.getGrapher === null) {
      const grapher = await import(/* webpackPrefetch: true */ '~/lib/grapher');
      this.setGrapher(grapher);
    }
    this.canvas = this.$refs.canvas;
    const newSetup = this.scale === 1 ? this.getGrapher.Default10Graph : this.getGrapher.Default20Graph;
    this.graphId = this.getGrapher.Creator.setupNewCanvas(this, this.canvas, {
      ...newSetup,
      onBroadcastUpdate: this.onBroadcastUpdate.bind(this),
      isMobile: !this.isDesktop,
    });
    this.setupInitialState();
  },

  beforeUnmount() {
    if (this.getGrapher === null) {
      return;
    }
    this.getGrapher.Creator.removeCanvas(this.graphId);
  },

  methods: {
    ...mapActions({
      setGrapher: 'root/setGrapher',
    }),

    onBroadcastUpdate(data) {
      this.graphData = data;
    },

    setupInitialState() {
      for (let index = 0; index < this.plots.length; index++) {
        const plot = this.plots[index];
        const plotType = plot.plotData?.type || plot.plotType;
        const plotData = plot.plotData?.data || this.defaultData(plotType);
        const plotColor = plot.color || this.colorConversion(plotType);
        this.getGrapher.Creator.addPlot(
          this.graphId,
          false,
          plotType,
          plotData,
          plotColor,
          '',
        );
      }
    },

    colorConversion(typeOfGraph) {
      switch (typeOfGraph) {
        case 'Points':
          return this.getGrapher.DefaultPointsColor;
        case 'Linear':
          return this.getGrapher.DefaultLinearColor;
        case 'Quadratic':
          return this.getGrapher.DefaultQuadraticColor;
        case 'Exponential':
          return this.getGrapher.DefaultExponentialColor;
        default:
          return '#424242';
      }
    },

    defaultData(typeOfGraph) {
      switch (typeOfGraph) {
        case 'Points': {
          const data = this.getGrapher.DefaultPointData;
          data.points = [
            {
              loc: {
                x: 0,
                y: 0,
              },
            },
          ];
          return data;
        }
        case 'Linear':
          return this.getGrapher.DefaultLinearData;
        case 'Quadratic':
          return this.getGrapher.DefaultQuadraticData;
        case 'Exponential':
          return this.getGrapher.DefaultExponentialData;
        default:
          return this.getGrapher.DefaultLinearData;
      }
    },
  },
};
</script>

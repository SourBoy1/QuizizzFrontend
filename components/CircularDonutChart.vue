<template>
  <div
    class="progress-container"
    :data-val="label"
    :style="containerStyle"
  >
    <svg
      class="progress-svg"
      :width="wrapperDimension"
      :height="wrapperDimension"
      viewPort="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        :r="radius"
        :cx="wrapperDimension / 2"
        :cy="wrapperDimension / 2"
        fill="transparent"
        :stroke-dasharray="strokeDasharray"
        stroke-dashoffset="0"
        :stroke="fadeStrokeColor || normalizedStroke.fadedColor"
        :stroke-width="normalizedStroke.width"
      />
      <circle
        :r="radius"
        :cx="wrapperDimension / 2"
        :cy="wrapperDimension / 2"
        fill="transparent"
        :stroke-dasharray="strokeDasharray"
        :stroke-dashoffset="dynamic ? calculatedStrokeDashoffset : strokeDashoffset"
        :stroke-linecap="strokeEdge"
        :stroke-width="normalizedStroke.width"
        :stroke="progressStrokeColor || normalizedStroke.progressColor"
      />
    </svg>
  </div>
</template>

<script>
import tailwindConfig from '../../tailwind.config';

export default {
  props: {
    percent: {
      type: Number,
      default: 60,
    },
    padding: {
      type: Number,
      default: 16,
    },
    radius: {
      type: Number,
      default: 90,
    },
    label: {
      type: String,
      default: null,
    },
    strokeWidth: {
      type: Number,
      default: 16,
    },
    labelFontColor: {
      type: String,
      default: '#000',
    },
    labelFontSize: {
      type: Number,
      default: 32,
    },
    labelFontWeight: {
      type: Number,
      default: 500,
    },
    stroke: {
      type: Object,
      default: null,
    },
    progressStrokeColor: {
      type: String,
      default: null,
    },
    fadeStrokeColor: {
      type: String,
      default: null,
    },
    dynamic: {
      type: Boolean,
      default: false,
    },
    strokeEdge: {
      type: String,
      default: 'round',
    },
  },

  data() {
    return {
      strokeDashoffset: this.getCircumference(), // For animation, setting the offset later
    };
  },

  computed: {
    wrapperDimension() {
      return (this.radius + this.padding) * 2;
    },

    strokeDasharray() {
      return this.getCircumference();
    },

    innerCircleDimension() {
      return (this.radius * 2) - this.padding - this.normalizedStroke.width;
    },

    containerStyle() {
      return {
        display: 'block',
        height: `${this.wrapperDimension}px`,
        width: `${this.wrapperDimension}px`,
        'border-radius': '100%',
        position: 'relative',
        '--labelColor': this.labelFontColor,
        '--labelFontSize': `${this.labelFontSize}px`,
        '--labelFontWeight': this.labelFontWeight,
        '--dimension': `${this.innerCircleDimension}px`,
        '--margin': `-${this.innerCircleDimension / 2}px`,
      };
    },

    calculatedStrokeDashoffset() {
      let val = this.percent;

      if (val < 0) { val = 0; }
      if (val > 100) { val = 100; }

      const strokeDashoffset = ((100 - val) / 100) * this.getCircumference();
      return strokeDashoffset;
    },

    normalizedStroke() {
      return {
        progressColor: tailwindConfig.theme.colors.lilac.light,
        fadedColor: tailwindConfig.theme.colors.lilac['20%'],
        width: this.strokeWidth,
        ...this.stroke,
      };
    },
  },

  mounted() {
    setTimeout(() => {
      this.strokeDashoffset = this.calculatedStrokeDashoffset;
    }, 1000);
  },

  methods: {
    getCircumference() {
      return 2 * Math.PI * this.radius;
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-container {
  &:after {
    position: absolute;
    display: block;
    height: var(--dimension);
    width: var(--dimension);
    left: 50%;
    top: 50%;
    content: attr(data-val);
    margin-top: var(--margin);
    margin-left: var(--margin);
    border-radius: 100%;
    line-height: var(--dimension);
    font-size: var(--labelFontSize);
    font-weight: var(--labelFontWeight);
    color: var(--labelColor);
    text-align: center;
  }

  .progress-svg {
    transform: rotate(-90deg);

    circle {
      transition: stroke-dashoffset 1.5s linear;
    }
  }
}
</style>

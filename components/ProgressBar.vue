<template>
  <div
    ref="progress-bar"
    class="progress-bar-wrapper w-full h-4 overflow-hidden bg-dark-6 rounded-3xl"
    role="progressbar"
    aria-valuemin="0"
    :aria-valuenow="currentValue"
    :aria-valuemax="maxValue"
    :aria-valuetext="`Completed - ${finishedPercentage}%`"
    tabindex="-1"
  >
    <div class="sr-only">
      <i18n> Completed </i18n>
      {{ finishedPercentage }}
    </div>
    <div
      class="progress-bar bg-lilac w-full h-full"
      :style="barStyles"
    />
  </div>
</template>

<script>
export default {

  props: {
    maxValue: {
      type: Number,
      default: 100,
    },

    currentValue: {
      type: Number,
      default: 0,
    },

    shouldFocusOnMount: {
      type: Boolean,
      default: true,
    },

    // shows 4% progress in the beginning
    emulateProgress: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    currentProgress() {
      if (this.emulateProgress && (this.currentValue / this.maxValue) < 0.1) {
        return 1;
      }

      return this.currentValue;
    },

    totalToProcess() {
      if (this.emulateProgress && (this.currentValue / this.maxValue) < 0.1) {
        return 25;
      }

      return this.maxValue;
    },

    wrapperStyles() {
      const styles = {};
      return styles;
    },

    barStyles() {
      const styles = {};
      const maxValue = this.totalToProcess || 100;

      if (maxValue > 0) {
        const currentPerc = Math.round((this.currentProgress / maxValue) * 100);
        const translateValue = (-100 + currentPerc);
        styles.transform = `translateX(${translateValue}%)`;
      }

      return styles;
    },

    finishedPercentage() {
      const maxValue = this.totalToProcess || 100;

      if (maxValue > 0) {
        const currentPerc = Math.round((this.currentProgress / maxValue) * 100);
        return currentPerc;
      }

      return 0;
    },
  },

  mounted() {
    if (this.$refs['progress-bar'] && this.shouldFocusOnMount) {
      this.$refs['progress-bar'].focus();
    }
  },
};
</script>

<style lang="scss" scoped>
  @keyframes slide {
    from {
      background-position-x: 0;
    }
    to {
      background-position-x: 2000px;
    }
  }
  .progress-bar {
      background-image: repeating-linear-gradient(
        135deg,
        transparent,
        transparent 6px,
        theme('colors.lilac.light') 6px,
        theme('colors.lilac.light') 15px
      );
      animation: slide 50s linear infinite;
      transition: transform .2s;
      transform: translateX(-100%);
  }
</style>

<template>
  <div
    ref="tooltipPanelContainer"
    class="tooltip-panel absolute"
    :class="[classes, arrowDirection === 'left' ? 'left-14' : 'right-14']"
    @click.stop
  >
    <slot />
    <div
      :class="[arrowDirection === 'left' ? 'tooltip-arrow-left' : 'tooltip-arrow-right']"
      :style="{
        top: arrowPos,
      }"
    />
  </div>
</template>

<script>
export default {

  props: {
    classes: {
      type: Array,
      default: () => [],
    },
    arrowPos: {
      type: String,
      default: '35%',
    },
    arrowDirection: {
      type: String,
      default: 'right',
    },
  },
};
</script>

<style lang="scss" scoped>
  $arrow-color: rgba(255, 255, 255, 0.66);
  .tooltip-panel {
    z-index: 10001;
  }

  .tooltip-arrow {
    content: " ";
    position: absolute;
    top: 50%;
    border-width: 8px;
    border-style: solid;
  }

  .tooltip-arrow-right {
    @extend .tooltip-arrow;
    left: 100%;
    border-color: transparent transparent transparent $arrow-color;
  }

  .tooltip-arrow-left {
    @extend .tooltip-arrow;
    right: 100%;
    border-color: transparent $arrow-color transparent transparent;
  }
</style>

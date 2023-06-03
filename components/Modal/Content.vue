<template>
  <div
    :class="[`px-${contentPadding}`, {
      'mb-4': stickToBottom && !zeroMargin,
      'modal-content': fixedHeight,
      'overflow-y-auto': !disableOverflow,
      'overflow-y-visible': disableOverflow,
    }]"
  >
    <slot />
  </div>
</template>

<script>
export default {

  props: {
    stickToBottom: {
      type: Boolean,
      default: false,
    },

    disableOverflow: {
      type: Boolean,
      default: false,
    },

    fixedHeight: {
      type: Boolean,
      default: true,
    },

    zeroPadding: {
      type: Boolean,
      default: false,
    },

    zeroMargin: {
      type: Boolean,
      default: false,
    },

    size: {
      type: String,
      default: 'md',
    },
  },

  computed: {
    contentPadding() {
      if (this.zeroPadding) {
        return 0;
      }
      switch (this.size) {
        case 'sm':
        case 'md':
          return 4;

        case 'lg':
        case 'xl':
          return 6;

        default:
          return 4;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$headerHeight: 100px;
$footerHeight: 100px;
$YAxisGap: 62px;

.modal-content {
  max-height: calc(100vh - $headerHeight - $footerHeight - $YAxisGap);
}
</style>

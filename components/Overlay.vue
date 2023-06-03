<template>
  <div
    v-if="shouldShowOverlay"
    class="fixed top-0 bottom-0 w-screen h-screen bg-dark-50%"
    :style="overlayStyles"
    @click="onDivClick"
  />
</template>

<script>
/**
 * Component that can be used universally to show an overlay by using the show and hide methods.
 * @param {Object} overlayStyles - Object containing styles for the overlay
 * Example: this.$eventBus.$emit('overlay:hide', { zIndex: 50, backgroundColor: #000 });
 */
import isEmpty from 'lodash/isEmpty';

export default {
  emits: ['click'],

  data() {
    return {
      shouldShowOverlay: false,
      dismissOnClick: true,
      overlayStyles: {
        zIndex: 10,
      },
    };
  },

  mounted() {
    this.$eventBus.$on('overlay:show', this.onShow);
    this.$eventBus.$on('overlay:hide', this.onHide);
  },

  beforeUnmount() {
    this.$eventBus.$off('overlay:show', this.onShow);
    this.$eventBus.$off('overlay:hide', this.onHide);
  },

  methods: {
    onShow({ background, zIndex, dismissOnClick = true }) {
      this.shouldShowOverlay = true;
      this.dismissOnClick = dismissOnClick;
      const overlayStyles = {};
      if (background) {
        overlayStyles.backgroundColor = background;
      }
      if (zIndex) {
        overlayStyles.zIndex = zIndex;
      }
      if (!isEmpty(overlayStyles)) {
        this.overlayStyles = overlayStyles;
      }
      document.querySelector('body').classList.add('overflow-hidden');
    },

    onHide() {
      this.shouldShowOverlay = false;
      document.querySelector('body').classList.remove('overflow-hidden');
    },
    onDivClick(event) {
      // Note: this is to by pass the issue https://github.com/ndelvalle/v-click-outside/issues/383
      // Reason: because of the passive event preventDefault method throwing the error
      // instaed of relying on touchstart event hide the overlay on div click.
      event.preventDefault();
      this.$emit('click');
      if (this.dismissOnClick) {
        this.shouldShowOverlay = false;
        document.querySelector('body').classList.remove('overflow-hidden');
      }
    },
  },
};
</script>

<template>
  <div
    :class="[
      'shine-div',
      classes,
      { 'w-full': fullWidth },
    ]"
    :style="styles"
  />
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 64,
    },
    height: {
      type: Number,
      default: 16,
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'default',
      validator: (val) => ['default', 'dark', 'lilac'].includes(val),
    },

    rounded: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    classes() {
      let cls = '';

      switch (this.type) {
        case 'default':
          cls += ' bg-dark-10%';
          break;
        case 'dark':
          cls += ' bg-dark-20%';
          break;
        case 'lilac':
          cls += ' bg-lilac-faded';
          break;
        default:
      }

      return cls + (this.rounded ? ' rounded-full' : ' rounded');
    },

    styles() {
      const styles = {
        height: `${this.height}px`,
      };

      if (!this.fullWidth) {
        styles.width = `${this.width}px`;
      }
      return styles;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/mixins.scss';

  .shine-div {
    position: relative;
    overflow: hidden;
    @include shine(1.5s);
  }
</style>

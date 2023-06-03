<template>
  <div
    class="z-on-overlay modal-anim"
    :class="[classes, backgroundColor, {
      'modal-container': fixedHeight,
      'modal-container-full-screen': fullScreenOnMobile,
      relative: hasSidePanel,
      'relative rounded-lg': !stickToBottom && !stickToTop,
      'fixed bottom-0 rounded-t-lg': stickToBottom,
      'absolute top-0 rounded-b-lg': stickToTop,
    }]"
    :style="getBackground"
    @click.stop
  >
    <slot />
  </div>
</template>

<script>
export default {

  props: {
    size: {
      type: String,
      default: 'md',
      validator(size) {
        return ['sm', 'md', 'lg', 'xl', 'custom'].includes(size);
      },
    },

    backgroundColor: {
      type: String,
      default: 'bg-light-3',
    },

    stickToBottom: {
      type: Boolean,
      default: false,
    },

    stickToTop: {
      type: Boolean,
      default: false,
    },

    theme: {
      type: String,
      default: 'default',
      validator: (val) => (['default', 'error', 'yellow', 'brand-c', 'dark']).includes(val),
    },

    containerClasses: {
      type: String,
      default: '',
    },

    hasSidePanel: {
      type: Boolean,
      default: false,
    },

    fullWidth: {
      type: Boolean,
      default: true,
    },

    fixedHeight: {
      type: Boolean,
      default: true,
    },

    fullScreenOnMobile: {
      type: Boolean,
      default: false,
    },

    bgImage: {
      type: String,
      default: '',
    },
  },

  computed: {
    classes() {
      let cls = '';

      if (this.fullWidth && this.size !== 'custom') {
        cls += 'w-full ';
      }

      if (this.stickToBottom) {
        cls += 'max-w-full ';
      } else {
        switch (this.size) {
          case 'sm':
            cls += 'max-w-qxs ';
            break;
          case 'md':
            cls += 'max-w-qmd ';
            break;
          case 'lg':
            cls += 'max-w-q2xl ';
            break;
          case 'xl':
            cls += 'max-w-q4xl ';
            break;
          case 'custom':
          default:
        }
      }

      switch (this.theme) {
        case 'dark':
          cls += 'bg-dark-2';
          break;
        default:
      }

      cls += ` ${this.containerClasses}`;

      return cls;
    },

    getBackground() {
      if (this.bgImage === '') {
        return '';
      }
      const val = `background-image: url('${this.bgImage}'); background-size: cover;`;
      return val;
    },
  },
};
</script>

<style lang="scss" scoped>
$YAxisGap: 62px;

.modal-container {
  height: fit-content;
  max-height: calc(100vh - $YAxisGap);
}

.modal-container-full-screen {
  height: 100%;
}
</style>

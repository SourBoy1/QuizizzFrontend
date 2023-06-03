<template>
  <div
    class="katex-container inline-block rounded-lg"
    :class="[classes, isReadOnly ? '' : 'cursor-text']"
    @mousedown="handleMathEditIntent"
    v-html="katexHTML"
  />
</template>

<script>
import QLogger from '~/services/QLogger';
import katex from 'katex';

export default {
  props: {
    latex: {
      type: [Array, String],
      default: '',
      require: true,
    },

    isReadOnly: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      default: 'white',
      validate: (value) => ['white', 'transparent'].includes(value),
    },
  },
  emits: ['click', 'change', 'close'],

  data() {
    return {
      katex: null,
      content: this.latex,
    };
  },

  computed: {
    katexHTML() {
      let katexEle = '';
      try {
        katexEle = this.katex
          ? this.katex.renderToString(this.content, {
            displayMode: true,
          })
          : '';
      } catch (err) {
        QLogger.error(`Failed in setting katexEle :: ${err}`);
      }
      return katexEle;
    },

    classes() {
      switch (this.type) {
        case 'white':
          return 'text-dark-2 bg-light-2';
        case 'transparent':
          return 'bg-transparent text-light-2';
        default:
          return '';
      }
    },
  },

  watch: {
    latex(curr) {
      if (curr !== this.content) {
        this.content = curr;
      }
    },
  },

  async created() {
    this.katex = katex;
  },

  methods: {
    handleMathEditIntent() {
      if (this.isReadOnly) {
        return;
      }

      this.$emit('click');

      this.$eventBus.$emit('mathRenderEle:clicked', {
        latex: this.content,
        callback: (latex) => {
          this.content = latex;

          this.$emit('change', latex);
        },
        closeCallback: () => {
          this.$emit('close');
        },
      });
    },
  },
};
</script>

<style lang="scss">
.katex-container {
  padding: 3px;

  .katex-html {
    padding: 0 !important;
  }
}
</style>

<template>
  <transition name="fade">
    <section class="drag-on-image-based-blank-response-section m-2 flex flex-col items-center justify-center rounded-lg p-8 sm:p-2 md:p-4">
      <div class="options-info-label text-light-2 opacity-60 mb-4 font-bold">
        <i18n>Drag labels to their correct position on the image</i18n>
      </div>
      <div class="option-grid-container h-fit flex justify-center flex-wrap gap-4">
        <div
          v-for="option in options"
          :key="option._id"
          class="flex items-center bg-light-3 border-2 border-light-20% rounded-lg py-2 w-fit outline outline-2 outline-light-20%"
          :class="{
            'h-10': !option.hasMath,
          }"
        >
          <FA
            icon="fas fa-grip-dots-vertical"
            class="text-dark-4 p-2"
            :size="12"
          />
          <span
            class="text-dark-2 whitespace-nowrap text-xl sm:text-sm md:text-lg font-bold mr-4"
            v-html="getHTMLToRender(option)"
          />
        </div>
      </div>
    </section>
  </transition>
</template>

<script>
import QuestionOption from '~/models/QuestionOption';
import katex from 'katex';

export default {
  props: {
    currentQuestion: {
      type: Object,
      require: true,
      default: () => ({}),
    },
  },

  data() {
    return {
      katex: null,
    };
  },

  computed: {
    options() {
      const options = this.currentQuestion?.structure?.options;
      if (options.length === 0) {
        return [...Array(this.$constants.QuestionOptionLimits[this.currentQuestion.type].min)].map(() => QuestionOption());
      }

      return [...options].sort(() => 0.5 - Math.random());
    },
  },

  async created() {
    this.katex = katex;
  },

  methods: {
    getHTMLToRender(option = {}) {
      const { hasMath = false } = option;

      if (hasMath) {
        return this.katexHTML(option.math.latex[0]);
      }

      return option.text;
    },

    katexHTML(content) {
      let latex = content;
      if (typeof latex !== 'string') {
        latex = `${latex}`;
      }
      let katexEle = '';
      try {
        katexEle = this.katex
          ? this.katex.renderToString(latex, {
            displayMode: true,
          })
          : '';
      } catch (err) {
        window.console.error(err);
      }
      return katexEle;
    },
  },
};
</script>

<style lang="scss" scoped>
.option-grid-container {
  max-width: 93%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}

.fade-enter, .fade-leave-to {
opacity: 0;
}
</style>

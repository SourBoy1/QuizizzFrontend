<template>
  <transition name="fade">
    <section class="drag-based-blank-response-section m-4 flex justify-center bg-dark-20% h-1/2 rounded-lg p-12">
      <div class="option-grid-container h-fit flex justify-center flex-wrap gap-4">
        <div
          v-for="option in options"
          :key="option._id"
          :class="[option.hasMath ? 'h-fit' : 'h-10']"
          class="flex items-center bg-light-3 border-2 border-light-20% rounded-lg py-2 w-fit"
        >
          <FA
            icon="fas fa-grip-vertical"
            class="text-dark-4 p-2"
            :size="12"
          />
          <span
            class="text-dark-2 whitespace-nowrap text-xl font-bold mr-4"
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

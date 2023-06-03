<template>
  <div>
    <EquationInputEditor
      :latexValue="latexValue"
      :showPreview="showAnswers"
      :forPreview="true"
    />
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

export default {
  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },
    showAnswers: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      latexValue: '',
    };
  },

  computed: {
    exactAnswer() {
      if (this.questionOptions.length) {
        return this.questionOptions[0];
      }

      return '';
    },

    questionOptions() {
      if (isEmpty(this.currentQuestion.structure.options)) {
        return Array(4).fill('');
      }

      return this.currentQuestion.structure.options;
    },
  },

  mounted() {
    if (this.showAnswers) {
      this.latexValue = this.exactAnswer.math?.latex[0];
    } else {
      this.latexValue = '';
    }
  },
};
</script>

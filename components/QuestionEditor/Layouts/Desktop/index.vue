<template>
  <div class="flex flex-1">
    <GraphingLayout
      v-if="isGraphingBasedQuestion"
      :containerStyles="containerStyles"
      v-bind="$attrs"
    />
    <DrawingLayout
      v-else-if="isDrawQuestion"
      :containerStyles="containerStyles"
      v-bind="$attrs"
    />
    <DefaultLayout
      v-else
      v-bind="$attrs"
      :containerStyles="containerStyles"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

import { isGraphingBasedQuestion } from '~/utils/QuizUtils';

import DefaultLayout from '~/components/QuestionEditor/Layouts/Desktop/Default.vue';
import DrawingLayout from '~/components/QuestionEditor/Layouts/Desktop/Drawing.vue';
import GraphingLayout from '~/components/QuestionEditor/Layouts/Desktop/Graphing.vue';

export default {
  components: {
    DefaultLayout,
    DrawingLayout,
    GraphingLayout,
  },

  props: {
    containerStyles: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      currentSlide: 'slideEditor/currentSlide',
    }),

    questionType() {
      return this.currentSlide.type;
    },

    isDrawQuestion() {
      return this.questionType === this.$constants.QuestionTypes.DRAW;
    },

    isGraphingBasedQuestion() {
      return isGraphingBasedQuestion(this.currentSlide);
    },
  },
};
</script>

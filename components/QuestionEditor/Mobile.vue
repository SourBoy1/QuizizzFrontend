<template>
  <div class="flex flex-1 h-full w-full">
    <GraphingLayout
      v-if="isGraphingBasedQuestion"
      v-bind="$attrs"
    />
    <DefaultLayout
      v-else
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { isGraphingBasedQuestion } from '~/utils/QuizUtils';

import DefaultLayout from '~/components/QuestionEditor/Layouts/Mobile/Default.vue';
import GraphingLayout from '~/components/QuestionEditor/Layouts/Mobile/Graphing.vue';

export default {
  components: {
    DefaultLayout,
    GraphingLayout,
  },

  computed: {
    ...mapGetters({
      currentSlide: 'slideEditor/currentSlide',
    }),

    isGraphingBasedQuestion() {
      return isGraphingBasedQuestion(this.currentSlide);
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

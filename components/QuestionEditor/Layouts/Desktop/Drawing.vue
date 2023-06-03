<template>
  <div class="desktop flex flex-col items-center">
    <div
      class="question-editor-container bg-purple p-2 relative grow-0 shrink-0 rounded-lg flex flex-col transition-transform duration-500"
      :style="{ ...containerStyles, ...questionEditorConfig }"
    >
      <SchoolUpgradeBanner />
      <SuperUpgradeBanner />
      <SlideMetaControl />
      <AnswerExplanation />

      <DrawQuestionEditor />
    </div>
  </div>
</template>

<script>

import SchoolUpgradeBanner from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SchoolUpgradeBanner.vue';
import SuperUpgradeBanner from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SuperUpgradeBanner.vue';
import SlideMetaControl from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SlideMetaControl.vue';
import AnswerExplanation from '~/components/QuestionEditor/Layouts/Desktop/Widgets/AnswerExplanation.vue';

export default {

  components: {
    SchoolUpgradeBanner,
    SuperUpgradeBanner,
    SlideMetaControl,
    AnswerExplanation,
  },

  props: {

    containerStyles: {
      type: Object,
      default: () => {},
    },
  },

  computed: {
    questionEditorConfig() {
      return {
        '--queryEditorHeight': '45%',
      };
    },

  },
};
</script>

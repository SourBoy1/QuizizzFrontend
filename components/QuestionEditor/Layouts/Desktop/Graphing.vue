<template>
  <div class="desktop flex flex-col items-center">
    <div
      class="question-editor-container bg-purple p-2 relative grow-0 shrink-0 rounded-lg flex flex-col transition-transform duration-500"
      :style="{ ...containerStyles }"
    >
      <SchoolUpgradeBanner />
      <SuperUpgradeBanner />
      <SlideMetaControl />
      <AnswerExplanation />

      <div
        :key="`${questionDiscriminator}_query`"
        class="relative flex gap-2 columns-2 p-2 flex-1 min-w-0 min-h-0"
      >
        <GraphingQueryEditor
          ref="questionQueryEditor"
          class="bg-purple relative z-10 rounded-2xl flex-shrink min-w-0"
          :forDevice="$constants.DeviceTypes.DESKTOP"
        />
        <GraphingPlotEditor
          class="flex aspect-square h-full"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import GraphingPlotEditor from '~/components/GraphingPlot/EditorContainer.vue';
import SchoolUpgradeBanner from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SchoolUpgradeBanner.vue';
import SuperUpgradeBanner from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SuperUpgradeBanner.vue';
import SlideMetaControl from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SlideMetaControl.vue';
import AnswerExplanation from '~/components/QuestionEditor/Layouts/Desktop/Widgets/AnswerExplanation.vue';

import GraphingQueryEditor from '~/components/QuestionQueryEditor/DesktopGraphing.vue';

import QueryEditorMixin from '~/mixins/QueryEditorMixin';

export default {

  components: {
    GraphingPlotEditor,
    SchoolUpgradeBanner,
    SuperUpgradeBanner,
    SlideMetaControl,
    AnswerExplanation,
    GraphingQueryEditor,
  },

  mixins: [QueryEditorMixin],

  props: {

    containerStyles: {
      type: Object,
      default: () => {},
    },
  },

  computed: {
    ...mapGetters({
      currentSlide: 'slideEditor/currentSlide',
    }),

    questionType() {
      return this.currentSlide.type;
    },
  },

  created() {
    this.setGraphComponentReady(false);
    this.updateGraphDataFromQuestion();
  },

  methods: {
    ...mapActions({
      setGraphComponentReady: 'slideEditor/setGraphComponentReady',
      updateGraphDataFromQuestion: 'slideEditor/updateGraphDataFromQuestion',
    }),
  },
};
</script>

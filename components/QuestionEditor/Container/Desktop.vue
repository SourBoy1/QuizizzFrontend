<template>
  <transition
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
  >
    <div class="flex items-center justify-between slide-question-editor-container">
      <QuestionEditor
        :editorDimensions="editorDimensions"
        :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
        @deleteAnswerExplanation="deleteAnswerExplanation"
      />

      <QuestionAnswerExplanationEditor
        ref="questionAnswerExplanationEditor"
        :editorDimensions="editorDimensions"
      />

      <EditGraphModal
        v-if="getEditGraphModalOpen"
      />
    </div>
  </transition>
</template>

<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';

import EditGraphModal from '~/components/GraphingPlot/EditGraphModal.vue';

export default {
  components: {
    EditGraphModal,
  },

  props: {
    editorDimensions: {
      type: Object,
      default: () => {},
    },

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      deviceTypeSelected: this.$constants.DeviceTypes.DESKTOP,
    };
  },

  computed: {
    ...mapGetters({
      getEditGraphModalOpen: 'slideEditor/getEditGraphModalOpen',
    }),
  },

  methods: {
    deleteAnswerExplanation() {
      const deleteAnswerExplanation = get(this.$refs, 'questionAnswerExplanationEditor.deleteAnswerExplanation', () => {});
      deleteAnswerExplanation();
    },
  },
};
</script>

<style lang="scss" scoped>
.slide-question-editor-container {
  animation-duration: 0.2s;
  font-family: Quicksand, OpenSans, Arial, Helvetica, sans-serif;
}
</style>

<template>
  <transition
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
  >
    <div class="slide-question-editor-container h-full w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row justify-between items-center">
      <QuestionEditor
        :editorDimensions="editorDimensions"
        :isExplanationMediaGoogleDriveVideo="isExplanationMediaGoogleDriveVideo"
        :explanationMediaGoogleVideoId="explanationMediaGoogleVideoId"
      />
      <EditGraphModal
        v-if="getEditGraphModalOpen"
      />
    </div>
  </transition>
</template>

<script>
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

    isExplanationMediaGoogleDriveVideo: {
      type: Boolean,
      default: false,
    },

    explanationMediaGoogleVideoId: {
      type: String,
      default: null,
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
};
</script>

<style lang="scss" scoped>
.slide-question-editor-container {
  animation-duration: 0.2s;
  font-family: Quicksand, OpenSans, Arial, Helvetica, sans-serif;
}
</style>

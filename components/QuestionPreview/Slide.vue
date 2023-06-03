<template>
  <SlidePreview
    isInteractable
    :question="question"
    :hasParent="true"
    :parentDimensions="{ width: slideContainerStyles.width, height: slideContainerStyles.height }"
    class="flex justify-center items-center bg-dark-1"
    :supersedingTheme="question.structure.theme"
  />
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

export default {
  props: {
    question: {
      type: Object,
      required: true,
    },
    previewIndex: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      slideContainerStyles: {},
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),

    slidePreviewStyles() {
      return {
        width: this.slideContainerStyles.width,
        height: this.slideContainerStyles.height,
      };
    },
  },

  watch: {
    deviceProps(newVal, oldVal) {
      if (newVal.height !== oldVal.height || newVal.width !== oldVal.width) {
        this.setSlideContainerStyles();
      }
    },
  },

  mounted() {
    this.setSlideContainerStyles();
  },

  methods: {
    setSlideContainerStyles() {
      const slideDetailsCardElem = this.$refs.slideDetailsCard;

      if (isEmpty(slideDetailsCardElem)) {
        return;
      }
      const dimensions = slideDetailsCardElem.getBoundingClientRect();

      const containerDimensions = { width: 'auto', height: 'auto' };

      if (dimensions.width / dimensions.height < 16 / 9) {
        containerDimensions.width = `${dimensions.width}px`;
        containerDimensions.height = `${(dimensions.width) * (9 / 16)}px`;
      } else {
        containerDimensions.width = `${dimensions.height * (16 / 9)}px`;
        containerDimensions.height = `${dimensions.height}px`;
      }

      this.slideContainerStyles = { ...containerDimensions };
    },
  },
};
</script>

<style scoped lang="scss">
</style>

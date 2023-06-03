<template>
  <div
    ref="drawWidgetContainer"
    class="flex items-center justify-center h-full"
  >
    <div class="flex justify-center w-full h-full">
      <div class="w-10 mr-2">
        <Button
          v-for="icon in leftIcons"
          :key="icon"
          class="w-10 h-10 mb-2"
          :licon="`fas fa-${icon}`"
          size="lg"
          type="transparent"
        />
      </div>
      <div
        v-if="isImagePresent"
        class="rounded-lg bg-light"
      >
        <div :style="`height: ${drawWidgetDimension}px; width: ${drawWidgetDimension}px`">
          <MediaImage
            class="w-full h-full"
            imgClass="rounded-lg"
            :src="getImageUrl"
            objectFit="contain"
          />
        </div>
      </div>
      <div
        v-else
        :style="`height: ${drawWidgetDimension}px; width: ${drawWidgetDimension}px`"
        class="rounded-lg bg-light"
      />
      <div class="flex flex-col w-10 ml-2 flex-nowrap">
        <Button
          v-for="(icon, index) in rightIcons"
          :key="icon"
          :class="`w-10 h-10 mb-2 order-${index + 1}`"
          :licon="`fas fa-${icon}`"
          size="lg"
          type="transparent"
        />
        <div class="order-3 color-picker-btn-container">
          <button
            class="relative w-10 h-10 mb-2 rounded-lg bg-light-20% hover:bg-light-33%"
          >
            <img
              class="absolute w-6 h-6 top-2 left-2"
              :src="colorPickerImage"
              alt=""
            />
            <div class="picked-color" />
          </button>
        </div>
      </div>
    </div>
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
  },

  data() {
    return {
      drawWidgetDimension: 0,
      colorPickerImage: 'https://cf.quizizz.com/img/presentation/v2/color.png',
    };
  },

  computed: {
    leftIcons() {
      return ['undo', 'redo', 'expand'];
    },

    rightIcons() {
      return ['pen', 'highlighter', 'eraser', 'trash'];
    },

    questionQuery() {
      return this.currentQuestion.structure.query;
    },

    isImagePresent() {
      return !isEmpty(this.questionQuery.media) && this.questionQuery.media.find(({ type }) => type === 'image');
    },

    getImageUrl() {
      return this.questionQuery.media.find(({ type }) => type === 'image').url;
    },
  },

  mounted() {
    this.handleDrawWidgetDimensionChange();
    window.addEventListener('resize', this.handleDrawWidgetDimensionChange);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleDrawWidgetDimensionChange);
  },

  methods: {
    handleDrawWidgetDimensionChange() {
      const { clientHeight, clientWidth } = this.$refs.drawWidgetContainer;
      this.drawWidgetDimension = Math.min(clientHeight, clientWidth);
    },
  },
};
</script>

<style lang="scss" scoped>

.picked-color {
  position: absolute;
  top: 12px;
  left: 12px;
  border: 1px solid #FFF;
  background-color: #222;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.square {
  width: 50%;
}

.square:after {
  content: "";
  display: block;
  padding-bottom: 100%;
  border-radius: 0.5rem;
}
</style>

<template>
  <div
    ref="drawCanvasContainer"
    tabindex="0"
    class="draw-canvas-editor bg-dark-80% fixed inset-0 z-101 flex justify-center items-center"
    @mousedown="handleOutsideMouseDown"
    @mouseup="handleOutsideMouseUp"
    @keydown.esc="closeCanvas"
  >
    <div
      class="relative flex items-center justify-start draw-canvas-inner"
      :style="`height: ${canvasSize}px`"
      @mousedown.stop=""
    >
      <div class="flex flex-col justify-start h-full gap-2 mr-2 left-controls">
        <button
          class="text-light-3 w-10 h-10 bg-light-20% rounded-lg"
          :aria-label="$i18n('Undo')"
          @click="handleUndo"
        >
          <FA
            icon="far fa-undo"
            :size="14"
          />
        </button>
        <button
          class="text-light-3 w-10 h-10 bg-light-20% rounded-lg"
          :aria-label="$i18n('Redo')"
          @click="handleRedo"
        >
          <FA
            icon="far fa-redo"
            :size="14"
          />
        </button>
      </div>
      <DrawCanvas
        ref="drawCanvas"
        :width="canvasSize"
        :height="canvasSize"
        :currentTool="currentTool"
        :lineWidth="lineWidth"
        :opacity="opacity"
        :initialColor="'#D92635'"
        :color="pickedColor"
        :bgImage="bgImage"
      />
      <div class="flex flex-col justify-start h-full gap-2 ml-2 right-controls">
        <button
          :aria-label="$i18n('Pen')"
          :class="['w-10 h-10 rounded-lg', canvasTool === $constants.DrawQuestionTool.PEN ? 'bg-light-3 text-dark-2' : 'bg-light-20% text-light-3']"
          @click="selectTool($constants.DrawQuestionTool.PEN)"
        >
          <FA
            icon="fas fa-pen"
            :size="14"
          />
        </button>
        <button
          :aria-label="$i18n('Highlighter')"
          :class="['w-10 h-10 rounded-lg', canvasTool === $constants.DrawQuestionTool.HIGHLIGHTER ? 'bg-light-3 text-dark-2' : 'bg-light-20% text-light-3']"
          @click="selectTool($constants.DrawQuestionTool.HIGHLIGHTER)"
        >
          <FA
            icon="fas fa-highlighter"
            :size="14"
          />
        </button>
        <div class="relative">
          <button
            :aria-label="$i18n('Color Picker')"
            class="text-light-3 w-10 h-10 bg-light-20% rounded-lg relative flex justify-center items-center"
            @click="shouldShowColorPicker = !shouldShowColorPicker"
          >
            <img
              class="w-6 h-6"
              src="https://cf.quizizz.com/img/presentation/v2/color.png"
              alt=""
            />
            <div
              class="absolute inset-0 w-4 h-4 m-auto border rounded-full border-light-3 bg-dark-2"
              :style="`background: ${pickedColor};`"
            />
          </button>
          <ColorPicker
            v-if="shouldShowColorPicker"
            class="top-11"
            colorGridSpacingClass="gap-1"
            :colorBoxSize="[30, 30]"
            :numColumns="7"
            :areColorsSpaced="true"
            :colors="$constants.DrawQuestionLineColors"
            :pickedColorReceived="pickedColor"
            :showColorValueInput="true"
            @pickColor="onColorChange"
          />
        </div>
        <button
          :aria-label="$i18n('Eraser')"
          :class="['w-10 h-10 rounded-lg', canvasTool === $constants.DrawQuestionTool.ERASER ? 'bg-light-3 text-dark-2' : 'bg-light-20% text-light-3']"
          @click="selectTool($constants.DrawQuestionTool.ERASER)"
        >
          <FA
            icon="fas fa-eraser"
            :size="14"
          />
        </button>
        <button
          :aria-label="$i18n('Delete')"
          class="text-light-3 w-10 h-10 bg-light-20% rounded-lg"
          @click="handleClear"
        >
          <FA
            icon="fas fa-trash"
            :size="14"
          />
        </button>
      </div>
      <div
        v-show="canvasTool === $constants.DrawQuestionTool.PEN || canvasTool === $constants.DrawQuestionTool.HIGHLIGHTER"
        class="absolute h-full ml-2 pen-size-slider-container -right-13"
      >
        <div
          tabIndex="0"
          class="relative flex flex-col items-center bg-light-3 text-dark-2 w-10 h-37 py-3.5 rounded-lg"
        >
          <div :class="['absolute w-2 h-4 overflow-hidden inline-block -left-2', canvasTool === $constants.DrawQuestionTool.PEN ? 'top-3' : 'top-15']">
            <div class="w-4 h-4 mt-2 origin-top-left transform -rotate-45 bg-light-2" />
          </div>
          <FA
            icon="far fa-wave-sine"
            :size="12"
          />
          <Slider
            ref="slider"
            class="flex h-20 my-2"
            :start="sliderStart"
            :end="sliderEnd"
            :initialValue="sliderInitialValue"
            :orientation="$constants.SliderOrientation.VERTICAL"
            trackClasses="bg-dark-10%"
            thumbClasses="bg-lilac"
            @change="setLineWidth"
          />
          <FA
            icon="fas fa-wave-sine"
            :size="12"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import values from 'lodash/values';
import min from 'lodash/min';

export default {
  props: {
    bgImage: {
      type: String,
      default: '',
    },
  },
  emits: ['close'],

  data() {
    return {
      canvasTool: this.$constants.DrawQuestionTool.PEN,
      lineWidth: 8,
      pickedColor: '#D92635',
      shouldShowColorPicker: false,
      prepareToClose: false,
      penCachedLineWidth: 0,
      highlighterCachedLineWidth: 0,

      canvasSize: 640,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),

    deviceDiscriminator() {
      return values(this.deviceProps).join('');
    },

    currentTool() {
      if (this.canvasTool === this.$constants.DrawQuestionTool.PEN
        || this.canvasTool === this.$constants.DrawQuestionTool.HIGHLIGHTER) {
        return 'pen';
      }

      return 'eraser';
    },

    opacity() {
      if (this.canvasTool === this.$constants.DrawQuestionTool.PEN) {
        return 1;
      }
      return 0.5;
    },

    sliderStart() {
      if (this.canvasTool === this.$constants.DrawQuestionTool.PEN) {
        return 1;
      }
      return 15;
    },

    sliderEnd() {
      if (this.canvasTool === this.$constants.DrawQuestionTool.PEN) {
        return 30;
      }
      return 60;
    },

    sliderInitialValue() {
      if (this.canvasTool === this.$constants.DrawQuestionTool.PEN) {
        return 8;
      }
      return 15;
    },

    slideCachedValue() {
      if (this.canvasTool === this.$constants.DrawQuestionTool.PEN) {
        return this.penCachedLineWidth <= 0 ? this.sliderInitialValue : this.penCachedLineWidth;
      }
      return this.highlighterCachedLineWidth <= 0 ? this.sliderInitialValue : this.highlighterCachedLineWidth;
    },
  },

  watch: {
    deviceDiscriminator() {
      this.canvasSize = this.canvasDims();
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.$refs.drawCanvasContainer.focus();
    });
    setTimeout(() => {
      this.canvasSize = this.canvasDims();
    }, 500);
  },

  methods: {
    selectTool(tool) {
      this.canvasTool = tool;
      this.$refs.slider.setValue(this.slideCachedValue);
      this.lineWidth = this.slideCachedValue;
    },

    setLineWidth(lineWidth) {
      this.lineWidth = lineWidth;
      if (this.canvasTool === this.$constants.DrawQuestionTool.PEN) {
        this.penCachedLineWidth = lineWidth;
      } else if (this.canvasTool === this.$constants.DrawQuestionTool.HIGHLIGHTER) {
        this.highlighterCachedLineWidth = lineWidth;
      }
    },

    handleClear() {
      this.$refs.drawCanvas.clear();
    },

    handleUndo() {
      this.$refs.drawCanvas.undo();
    },

    handleRedo() {
      this.$refs.drawCanvas.redo();
    },

    onColorChange(color) {
      this.pickedColor = color;
      this.shouldShowColorPicker = false;
    },

    handleOutsideMouseDown() {
      this.prepareToClose = true;
    },

    handleOutsideMouseUp() {
      if (this.prepareToClose) {
        this.prepareToClose = false;
        this.closeCanvas();
      } else {
        this.$refs.drawCanvas.handleMouseUp();
      }
    },

    closeCanvas() {
      this.$emit('close');
    },

    canvasDims() {
      if (this.$refs.drawCanvasContainer) {
        const rect = this.$refs.drawCanvasContainer.getBoundingClientRect();
        let width = rect.width * 0.8;
        let height = rect.height * 0.8;

        width = width > 640 ? 640 : width;
        height = height > 640 ? 640 : height;

        return min([width, height]);
      }

      return 640;
    },
  },
};
</script>

<style>
.draw-canvas-editor {
  z-index: 1005;
}
</style>

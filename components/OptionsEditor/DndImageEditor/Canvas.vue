<template>
  <div
    class="dnd-canvas h-full flex items-center overflow-hidden"
    :class="{
      'w-full': isPreviewMode,
      'rounded-lg': !isReadOnlyCanvas,
    }"
  >
    <div
      class="relative w-full h-full flex items-center justify-center rounded-lg"
      :class="{
        'bg-light-5%': !isImageAdded,
      }"
      :style="dndCanvasConfig"
    >
      <button
        v-if="!isImageAdded"
        class="add-image-overlay flex flex-col items-center justify-center w-full text-light-50% font-semibold gap-3 text-2xl"
        :class="{
          'h-full': !isForMobile,
          'h-82': isForMobile,
        }"
        @click="() => {
          showAddImageValidation = false;
          $analytics.logEvent($webEvents.getQuizEditorEvent(quizType, $webEvents.LABELLING_ADD_IMAGE_CLICKED));
          onAddMediaClick('image', true);
        }"
      >
        <div
          v-if="isForMobile"
          class="flex flex-col items-center gap-y-2"
        >
          <FA
            icon="fas fa-image"
            :size="28"
          />
          <Button
            type="transparent"
            :tabIndex="tabIndexOfLastOption + 1"
            :title="$i18n('Add background image')"
            :aria-label="$i18n('Add background image')"
            size="xs"
          />
        </div>
        <div
          v-else
          class="flex flex-col items-center gap-y-4"
        >
          <i18n>Start by adding an image, then place options on it</i18n>
          <button
            v-tooltip.bottom="{
              trigger: 'manual',
              show: showAddImageValidation,
              content: $i18n('Please add an image first'),
              classes: 'error-tooltip large-tooltip',
            }"
            :tabIndex="tabIndexOfLastOption + 1"
            class="flex flex-col items-center w-fit p-4 bg-light-20% hover:bg-light-10% rounded-lg text-light-3 font-semibold"
            :aria-label="$i18n('Add image')"
            @mouseover="showAddImageValidation = false"
          >
            <FA
              icon="fas fa-image"
              :size="20"
            />
            <i18n>Image</i18n>
          </button>
        </div>
      </button>
      <div
        v-else-if="isPrintMode"
        ref="canvasContainer"
        class="canvas-container"
        :style="`background-image:url(${questionImage});`"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      >
        <div
          v-for="target, index in questionTargets"
          :key="target._id"
        >
          <div
            :ref="`target-${index}`"
            class="absolute text-center border-2 outline-2"
            :class="{
              'bg-light-3 py-2 px-4 rounded-xl text-xl font-semibold border-dark-20% outline-dashed outline-lilac m-1': !isReadOnlyCanvas,
              'read-only border-light-2 rounded outline-dashed outline-dark-50% bg-dark-50% text-light w-13': isReadOnlyCanvas,
              'cursor-move': !isReadOnlyCanvas,
            }"
            :style="{
              left: `${target.position.x * scalingFactor}px`,
              top: `${target.position.y * scalingFactor}px`,
            }"
            @mousedown="handleMouseDown(index, $event)"
          >
            <div
              v-if="!target.hasMath"
              class="option-text"
            >
              {{ `(${String.fromCharCode(97 + index)})` }}
            </div>
          </div>
        </div>
      </div>
      <!-- ! Canvas container for interactivity -->
      <div
        v-else
        ref="canvasContainer"
        class="canvas-container"
        :class="{
          'z-20': !isReadOnlyCanvas || isPreviewMode,
        }"
        :style="[isPreviewMode ? {
          transform: `scale(${canvasScale})`,
          backgroundImage: `url(${questionImage})`,
        } : { backgroundImage: `url(${questionImage})` }]"
        @mousemove="handleMouseMove"
        @touchmove="handleMouseMove"
        @mouseup="handleMouseUp"
        @touchend="handleMouseUp"
        @mousedown="disabledEducation"
      >
        <div
          v-for="option, index in options"
          :key="option._id"
        >
          <div
            :ref="`option-${index}`"
            class="option-tile absolute text-center border-3 outline-3"
            :class="{
              'bg-lilac text-light-3': highlightTile === option._id,
              'bg-light-3': highlightTile !== option._id && !isReadOnlyCanvas,
              'py-2 px-4 rounded-xl font-semibold border-dark-20% outline-dashed outline-lilac m-1 z-20': !isReadOnlyCanvas,
              'text-xl': !isForMobile,
              'opacity-70': !highlightTile && dragging === index,
              'text-xs': isForMobile,
              'read-only border-light-2 rounded bg-dark-50% text-light w-13': isReadOnlyCanvas || (isPreviewMode && !displayAnswers),
              'outline-dashed !outline-lilac w-20 bg-dark-20%': isPreviewMode && !displayAnswers,
              'cursor-grabbing': !isReadOnlyCanvas,
              'correct-option rounded px-2 font-bold w-max': (isPreviewMode && displayAnswers) || (shouldShowResponses && option.isCorrectChoice),
              'incorrect-option rounded px-2 font-bold w-max': shouldShowResponses && !option.isCorrectChoice,
              'outline-dashed outline-dark-50%': !displayAnswers && isReadOnlyCanvas && !shouldShowResponses,
            }"
            :style="{
              left: `${scaleDownCoordinate(option.x)}px`,
              top: `${scaleDownCoordinate(option.y)}px`,
              transform: `scale(${forDisplay.scaleOptions ? scalingFactor : 1}) translateX(-50%) translateY(-50%)`,
            }"
            @mousedown="handleMouseDown(index, $event)"
            @touchstart="handleMouseDown(index, $event)"
          >
            <div class="relative">
              <div
                v-if="!isReadOnlyCanvas"
                class="option-grab-handle absolute flex items-center w-full justify-center -top-6 left-0"
                role="button"
              >
                <div class="flex items-center justify-center bg-lilac text-light-2 min-w-8 h-6 rounded-lg font-black cursor-grabbing">
                  <FA
                    icon="fas fa-grip-dots-vertical"
                    :size="14"
                    class="transform rotate-90"
                  />
                </div>
              </div>
              <div
                v-if="isPreviewMode"
                class="option-text-preview"
              >
                <template v-if="displayAnswers">
                  <i class="fas fa-sharp fa-check text-xs" />
                  <template v-if="option.hasMath">
                    <KatexRenderer
                      :ref="`katex-${index}`"
                      isReadOnly
                      :latex="option.math.latex[0]"
                    />
                  </template>
                  <template v-else>
                    {{ option.text }}
                  </template>
                </template>
              </div>
              <div v-else>
                <i
                  v-if="shouldShowResponses"
                  class="fas text-xs"
                  :class="{
                    'fa-check': option.isCorrectChoice,
                    'fa-close': !option.isCorrectChoice,
                  }"
                />
                <span
                  v-if="!option.hasMath || isReadOnlyCanvas"
                  class="option-text whitespace-nowrap relative"
                >
                  {{ optionTextToShow(option) }}
                </span>
                <KatexRenderer
                  v-else
                  :ref="`katex-${index}`"
                  :type="highlightTile === option._id ? 'transparent' : 'white'"
                  isReadOnly
                  :latex="option.math.latex[0]"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="shouldShowEducationInDndImage && !isReadOnlyCanvas && options.length > 0"
          class="overlay-education absolute top-0 left-0 h-full w-full bg-dark-50%"
        >
          <img
            class="absolute z-30"
            :style="{
              left: `${scaleDownCoordinate(options[0].x)}px`,
              top: `${scaleDownCoordinate(options[0].y) + 40}px`,
              transform: `scale(${forDisplay.scaleOptions ? scalingFactor : 1}) translateX(-50%) translateY(-50%)`,
            }"
            height="56"
            width="56"
            src="https://cf.quizizz.com/image/Hand Pointer 1@3x.png"
            alt="hand-pointer"
          />

          <div class="absolute bottom-6 text-center mx-6 rounded-lg bg-dark-90% py-4 px-2 text-2xl font-semibold text-light-3">
            <i18n>
              Drag the options to their correct place on the image
            </i18n>
          </div>
        </div>
      </div>

      <div
        v-if="(!isReadOnlyCanvas || isPreviewMode) && isImageAdded"
        class="h-full w-full flex justify-center items-center bg-light-3 absolute top-0 left-0"
      >
        <div
          class="z-10 w-full aspect-square flex flex-wrap overflow-hidden gap-3 bg-light-2 p-2.5"
          :class="{
            rounded: isPreviewMode,
          }"
          style="background-image: url(https://cf.quizizz.com/image/imgbgpattern.png)"
        />
      </div>

      <div
        v-if="isDesktop && !isImageAdded"
        class="absolute bottom-0 p-2 text-xl w-full flex justify-center text-light-50%"
      >
        <i18n :injections="[shortcutMetaKey]">
          Use {$1} + V to paste an image
        </i18n>
      </div>

      <div
        v-if="globalClipboardState.loading"
        class="clipboard-paste-blocker gap-y-4 h-full w-full flex flex-col items-center justify-center mx-10 p-2 absolute z-30 bottom-3 bg-dark-80% text-2xl text-center font-semibold text-light-3"
      >
        <FA
          :size="40"
          icon="fas fa-sync"
          class="animate-spin"
        />
        <i18n>
          Pasting image...
        </i18n>
      </div>

      <Button
        v-if="!isReadOnlyCanvas && isImageAdded"
        class="edit-image-btn"
        :class="{
          mobile: isForMobile,
        }"
        type="dark"
        :size="isForMobile ? 'xs' : 'lg'"
        :title="$i18n('Edit image')"
        :tabIndex="tabIndexOfLastOption + 1"
        licon="fas fa-image"
        :ariaLabel="$i18n('Edit image')"
        @click="() => {
          $analytics.logEvent($webEvents.getQuizEditorEvent(quizType, $webEvents.LABELLING_EDIT_IMAGE_CLICKED));
          onAddMediaClick('image', true, true);
        }"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isNumber from 'lodash/isNumber';
import Constants from '~/config/Constants';
import QueryEditorMixin from '~/mixins/QueryEditorMixin';
import Media from '~/models/Media';
import { browserOS } from '~/utils/Utilities';

const { WIDTH: CANVAS_MAX_WIDTH } = Constants.EditorDimensions.DND_IMAGE_CANVAS;
export default {
  mixins: [QueryEditorMixin],

  props: {
    forDisplay: {
      type: Object,
      default: () => ({
        image: '',
        options: [],
        targets: [],
        answer: [],
        attempts: [],
        printMode: false,
        previewMode: false,
        showAnswers: false,
        showResponses: false,
        scaleOptions: false,
      }),
    },

    isForMobile: {
      type: Boolean,
      default: false,
    },

    canvasScaleFactor: {
      type: Number,
      default: 1,
    },
  },
  emits: [],

  data() {
    return {
      options: [],
      dragging: -1,
      startX: 0,
      startY: 0,
      previousOptionPosX: 0,
      previousOptionPosY: 0,

      scalingFactor: 1,
      showAddImageValidation: false,
      highlightTile: null,
      optionInteractedCalled: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('contentEditor', ['globalClipboardState', 'quizType']),
    ...mapGetters('uiManager', ['shouldShowEducationInDndImage']),

    isOSMac() {
      return browserOS().isMac;
    },

    shortcutMetaKey() {
      return this.isOSMac ? '\u2318' : 'ctrl';
    },

    isReadOnlyCanvas() {
      return !!this.forDisplay.image;
    },

    isImageAdded() {
      return !!this.questionImage;
    },

    dndCanvasConfig() {
      return {
        '--canvas-max-width': `${CANVAS_MAX_WIDTH}px`,
      };
    },

    isPrintMode() {
      return !!this.forDisplay.printMode;
    },

    isPreviewMode() {
      return !!this.forDisplay.previewMode;
    },

    displayAnswers() {
      return !!this.forDisplay.showAnswers;
    },

    shouldShowResponses() {
      return !!this.forDisplay.showResponses;
    },

    questionImage() {
      if (this.isReadOnlyCanvas) {
        return this.forDisplay.image;
      }

      return this.currentSlide.structure.query.media.find((media) => media.type === 'image')?.url;
    },

    questionAnswer() {
      if (this.isReadOnlyCanvas) {
        return this.forDisplay.answer;
      }

      return isNumber(this.currentSlide.structure.answer) ? [] : this.currentSlide.structure.answer;
    },

    questionOptions() {
      if (this.isReadOnlyCanvas) {
        return this.forDisplay.options;
      }

      return this.currentSlide.structure.options;
    },

    tabIndexOfLastOption() {
      return this.questionOptions.length * 3 + 100;
    },

    questionTargets() {
      if (this.isReadOnlyCanvas) {
        return this.forDisplay.targets;
      }

      return this.currentSlide.structure.targets;
    },

    editorScale() {
      if (this.isReadOnlyCanvas || this.isForMobile || !this.questionEditorDimensions.scale) {
        return 1;
      }

      const { scale } = this.questionEditorDimensions;
      return scale;
    },

    optionsMappedById() {
      const optionMap = {};

      this.questionOptions.forEach((option, index) => {
        optionMap[option._id] = { ...option, optionIndex: index };
      });

      return optionMap;
    },

    targetsMappedById() {
      const targetData = {};

      this.questionTargets.forEach((target) => {
        targetData[target.id] = target;
      });

      return targetData;
    },

    getCorrectOptionIdForTargetId() {
      return (targetId) => {
        const mapTargetIdToOptionId = {};

        this.questionAnswer.forEach((answer) => {
          mapTargetIdToOptionId[answer.targetId] = answer.optionId[0];
        });

        return mapTargetIdToOptionId[targetId];
      };
    },

    correctOptions() {
      const options = [];

      this.questionAnswer.forEach((answer) => {
        const option = this.optionsMappedById[answer.optionId[0]];
        const target = this.targetsMappedById[answer.targetId];

        if (!target) {
          return;
        }

        options.push({
          ...option,
          x: target.position.x * this.scalingFactor,
          y: target.position.y * this.scalingFactor,
        });
      });

      return options;
    },

    userAttemptedOptions() {
      const options = [];

      this.forDisplay.attempts.forEach((answer) => {
        const option = this.optionsMappedById[answer.optionId[0]];
        const target = this.targetsMappedById[answer.targetId];

        if (!target) {
          return;
        }

        options.push({
          ...option,
          x: target.position.x * this.scalingFactor,
          y: target.position.y * this.scalingFactor,
          isCorrectChoice: answer.optionId[0] === this.getCorrectOptionIdForTargetId(answer.targetId),
        });
      });

      return options;
    },

    canvasScale() {
      return this.canvasScaleFactor;
    },
  },

  watch: {
    questionOptions: {
      deep: true,
      handler() {
        this.options = [...this.correctOptions];
      },
    },

    questionAnswer: {
      deep: true,
      handler() {
        this.options = [...this.correctOptions];
      },
    },

    isImageAdded(isAdded) {
      if (isAdded) {
        this.$nextTick(() => {
          this.calculateScalingFactor();
        });
      }
    },

    globalClipboardState(current) {
      if (current.url) {
        this.handlePastedImage(current.url);
      }
    },
  },

  mounted() {
    this.calculateScalingFactor();

    this.$eventBus.$on('dndImageEditorCanvas:showImageValidation', this.triggerImageValidation);
    window.addEventListener('resize', this.calculateScalingFactor);
    window.addEventListener('mouseup', this.handleMouseUp);

    if (this.shouldShowResponses) {
      this.options = [...this.userAttemptedOptions];
      return;
    }
    this.options = [...this.correctOptions];
  },

  beforeUnmount() {
    this.$eventBus.$off('dndImageEditorCanvas:showImageValidation', this.triggerImageValidation);
    window.removeEventListener('resize', this.calculateScalingFactor);
    window.removeEventListener('mouseup', this.handleMouseUp);
  },

  methods: {
    handleMouseUp() {
      this.highlightTile = null;
      if (this.dragging < 0) {
        return;
      }
      const optionIndex = this.dragging;
      this.dragging = -1;

      // save option position to store
      const option = this.options[optionIndex];
      if (!option) {
        return;
      }
      const targetIdForOption = this.questionAnswer.find((answer) => answer.optionId[0] === option._id)?.targetId;
      this.$store.dispatch('uiManager/setDndImageOptionFocus', null);
      this.updateSingleTargetById({
        id: targetIdForOption,
        position: {
          x: (option.x / this.scalingFactor).toFixed(2),
          y: (option.y / this.scalingFactor).toFixed(2),
        },
      }, targetIdForOption);
    },

    handleMouseDown(optionIndex, event) {
      if (this.isReadOnlyCanvas) {
        return;
      }

      const option = this.options[optionIndex];
      if (!option) {
        return;
      }
      this.highlightTile = option._id;
      this.dragging = optionIndex;

      this.startX = event.clientX ?? event.changedTouches?.[0]?.clientX;
      this.startY = event.clientY ?? event.changedTouches?.[0]?.clientY;

      this.previousOptionPosX = option.x;
      this.previousOptionPosY = option.y;

      this.$store.dispatch('uiManager/setDndImageOptionFocus', option._id);
    },

    handleMouseMove(event) {
      if (this.dragging > -1) {
        this.highlightTile = null;
        const option = this.options[this.dragging];
        if (!option) {
          return;
        }
        const posX = event.clientX ?? event.changedTouches?.[0]?.clientX;
        const posY = event.clientY ?? event.changedTouches?.[0]?.clientY;

        if (isNaN(posX) || isNaN(posY)) {
          return;
        }

        option.x = this.previousOptionPosX + parseInt(posX, 10) - this.startX;
        option.y = this.previousOptionPosY + parseInt(posY, 10) - this.startY;
        this.optionInteracted();
      }
    },

    handlePastedImage(image) {
      const media = Media({
        url: image,
        type: this.$constants.SlideMediaTypes.IMAGE,
      });

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMAGE_SAVE);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          source: 'clipboard',
        },
      );

      this.updateQuery({
        media: [media],
      });
    },

    triggerImageValidation(shouldShow = true) {
      if (shouldShow) {
        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.LABELLING_ADD_IMAGE_ERROR_TRIGGERED);
        this.$analytics.logEvent(eventName);
      }
      this.showAddImageValidation = shouldShow;
    },

    disabledEducation() {
      this.$store.dispatch('uiManager/toggleEducationForDndImage', false);
    },

    calculateScalingFactor() {
      const { canvasContainer } = this.$refs;

      if (!canvasContainer) {
        return;
      }

      let { width: canvasContainerWidth = -1 } = canvasContainer.getBoundingClientRect();

      if (canvasContainerWidth === -1) {
        return;
      }

      if (this.canvasScale !== 1) {
        canvasContainerWidth /= this.canvasScale;
      }

      this.scalingFactor = canvasContainerWidth / CANVAS_MAX_WIDTH;
    },

    scaleDownCoordinate(coordinate) {
      if (this.isReadOnlyCanvas || this.isPreviewMode) {
        return coordinate;
      }

      return coordinate / this.editorScale;
    },

    optionTextToShow(option) {
      if (this.isReadOnlyCanvas && !this.shouldShowResponses) {
        return String.fromCharCode(97 + option.optionIndex);
      }

      return option.text;
    },

    // ! store actions
    updateSingleQuestionOption(option, index) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', { option, index });

      this.validateQuestion();
    },

    updateSingleTargetById(target, id) {
      this.$store.dispatch('slideEditor/updateSingleTargetById', { target, id });

      this.validateQuestion();
    },

    validateQuestion() {
      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    optionInteracted() {
      if (this.optionInteractedCalled) {
        return;
      }
      this.optionInteractedCalled = true;
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.LABELLING_OPTION_INTERACTED);
      this.$analytics.logEvent(eventName);
    },
  },
};
</script>

<style lang="scss" scoped>
$game-correct-color: #62c370;
$incorrect-color: #ff4d4f;
.canvas-container {
  position: relative;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  overflow: hidden;
  aspect-ratio: 1/1;
  width: 100%;
  max-width: var(--canvas-max-width);

  .read-only {
    outline-offset: -1.5px;
  }
}

.option-tile {
  white-space: nowrap;
  .option-grab-handle {
    opacity: 0;
    transition: opacity .4s ease-in-out;
  }
  &:hover{
    .option-grab-handle{
      opacity: 1;
    }
  }
}

.edit-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 30;

  &.mobile {
    top: 4px;
    right: 4px;
  }
}

.option-text-preview {
  min-height: 2rem;
  line-height: 2rem;
}

.correct-option {
  background: $game-correct-color;
  border-color: $game-correct-color;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
}
.incorrect-option {
  @extend .correct-option;
  background: $incorrect-color;
  border-color: $incorrect-color;
}

.overlay-education {
  img {
    animation: prompt-drag 2s ease-in-out infinite;
  }
}

@keyframes prompt-drag {
  0% {
    content: url('https://cf.quizizz.com/image/Hand Pointer 2@3x.png');
  }
  50% {
    content: url('https://cf.quizizz.com/image/Hand Pointer 1@3x.png');
  }
  100% {
    content: url('https://cf.quizizz.com/image/Hand Pointer 2@3x.png');
  }
}
</style>

<template>
  <div
    class="relative h-full overflow-hidden w-full flex items-center justify-center"
    :class="{
      'bg-light-5%': !isImageAdded,
      'rounded-lg': !isReadOnlyCanvas,
    }"
  >
    <button
      v-if="!isImageAdded"
      class="add-image-overlay w-full cursor-pointer text-light-50% gap-3 flex flex-col items-center justify-center"
      :class="{
        'h-82 text-sm': isForMobile,
        'h-full text-xl': !isForMobile,
      }"
      @click="() => {
        const eventName = $webEvents.getQuizEditorEvent(quizType, $webEvents.HOTSPOT_ADD_IMAGE_CLICKED);
        $analytics.logEvent(eventName);
        onAddMediaClick('image', true);
      }"
    >
      <i18n>
        Start by adding an image, then place hotspots on it
      </i18n>
      <button
        :tabIndex="tabIndexOfLastOption + 1"
        class="flex flex-col items-center w-fit bg-light-5% hover:bg-light-20% rounded-lg p-3 text-light-50% font-semibold"
        :aria-label="$i18n('Add image')"
      >
        <FA
          icon="fas fa-image"
          :size="20"
        />
        <i18n>Image</i18n>
      </button>
    </button>
    <!-- ! Canvas container for interactivity -->
    <div
      v-else
      ref="canvasContainer"
      class="canvas-container"
      :class="[`${hotspotType}-pointer`, {
        'z-20': !isReadOnlyCanvas || isPreviewMode,
      }]"
      :style="`background-image: url(${questionImage});`"
    >
      <canvas
        :id="isReadOnlyCanvas ? 'readOnly' : 'interactive'"
        ref="canvas"
        :height="canvasHeight"
        :width="canvasWidth"
      />

      <div
        v-if="focussedOption && !hotspotShowMarkAsDoneCta && canvasServiceMode !== 'moveObject'"
        class="hotspot-tooltip gap-x-0.5 absolute flex items-center"
        :style="focussedOptionTooltipStyle"
      >
        <button
          :class="['bg-dark-2 border-1 border-light-3 whitespace-nowrap text-sm md:text-lg p-1 rounded-lg', {
            'text-green': questionAnswer.includes(focussedOption),
            'text-light-3': !questionAnswer.includes(focussedOption),
          }]"
          @click="toggleCorrect"
        >
          <div
            class="flex items-center gap-x-2 rounded-lg p-1"
            :class="{
              'bg-green-20%': questionAnswer.includes(focussedOption),
              'bg-light-10%': !questionAnswer.includes(focussedOption),
            }"
          >
            <div
              class="border-2 h-4 w-4 flex justify-center items-center border-light-2 rounded-full"
              :class="{
                'bg-green text-light-3': questionAnswer.includes(focussedOption),
              }"
            >
              <FA
                icon="fas fa-check"
                :size="isForMobile ? 8 : 10"
              />
            </div>
            <i18n>Correct</i18n>
          </div>
        </button>
        <button
          class="flex items-center text-light-3 rounded-lg bg-dark-2 p-1 border-1 border-light-3"
          @click="deleteOption(focussedOption)"
        >
          <div class="bg-red-20% text-red-dark rounded-lg px-2 py-1">
            <FA
              icon="fas fa-trash"
              :size="14"
            />
          </div>
        </button>
      </div>
    </div>

    <div
      v-if="(!isReadOnlyCanvas || isPreviewMode) && isImageAdded"
      class="h-full w-full flex justify-center items-center bg-light-3 absolute top-0 left-0"
    >
      <div
        class="z-10 w-full aspect-square flex flex-wrap overflow-hidden gap-3 bg-light-2 my-1"
        :class="{
          rounded: isPreviewMode,
        }"
        style="background-image: url(https://cf.quizizz.com/image/imgbgpattern.png)"
      />
    </div>

    <Button
      v-if="!isReadOnlyCanvas && isImageAdded"
      v-show="!canvasServiceMode.includes('plac')"
      class="edit-image-btn"
      type="dark"
      :size="isForMobile ? 'xs' : 'lg'"
      :title="$i18n('Edit image')"
      :tabIndex="tabIndexOfLastOption + 1"
      licon="fas fa-image"
      :ariaLabel="$i18n('Edit image')"
      @click="() => {
        const eventName = $webEvents.getQuizEditorEvent(quizType, $webEvents.HOTSPOT_EDIT_IMAGE_CLICKED);
        $analytics.logEvent(eventName);
        onAddMediaClick('image', true, true);
      }"
    />

    <div
      v-if="shouldShowPlayerEducation"
      class="user-education mx-10 p-2 absolute z-30 bottom-3 bg-dark-80% text-sm text-center font-semibold text-light-3"
    >
      <i18n :injections="[hotspotTitle, hotspotType === $constants.HotspotTypes.FREEFORM ? $i18n('anchor') : '']">
        Tap anywhere on the image area to add a {$1} hotspot {$2}
      </i18n>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import QueryEditorMixin from '~/mixins/QueryEditorMixin';
import Media from '~/models/Media';
import QuestionOption from '~/models/QuestionOption';
import HotspotCanvasService from '~/services/HotspotCanvasService';
import QLogger from '~/services/QLogger';
import { browserOS } from '~/utils/Utilities';

export default {
  mixins: [QueryEditorMixin],

  props: {
    forDisplay: {
      type: Object,
      default: () => ({
        image: '',
        options: [],
        answer: [],
        printMode: false,
        previewMode: false,
        showAnswers: true,
        response: {},
        showResponses: false,
      }),
    },

    isForMobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],

  data() {
    return {
      canvasHeight: 0,
      canvasWidth: 0,
      canvasServiceMode: '',

      focussedOption: null,

      undoStack: [],
      redoStack: [],
      hotspotAddedCalled: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('contentEditor', ['quizType']),
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('contentEditor', ['globalClipboardState']),
    ...mapGetters('uiManager', ['hotspotType', 'hotspotShowMarkAsDoneCta']),

    isOSMac() {
      return browserOS().isMac;
    },

    shortcutMetaKey() {
      return this.isOSMac ? '\u2318' : 'ctrl';
    },

    editorScale() {
      if (this.isForMobile || this.isReadOnlyCanvas) {
        return 1;
      }

      const scale = this.questionEditorDimensions.scale || 1;
      return scale;
    },

    editorHeight() {
      return this.questionEditorDimensions.height;
    },

    editorWidth() {
      return this.questionEditorDimensions.width;
    },

    isReadOnlyCanvas() {
      return !!this.forDisplay.image || !!this.forDisplay.printMode || !!this.forDisplay.previewMode;
    },

    isImageAdded() {
      return !!this.questionImage;
    },

    shouldShowPlayerEducation() {
      if (!this.isForMobile) {
        return false;
      }

      return this.hotspotType && this.questionOptions.length === 0;
    },

    hotspotTitle() {
      switch (this.hotspotType) {
        case this.$constants.HotspotTypes.CIRCLE:
          return this.$i18n('circle');
        case this.$constants.HotspotTypes.RECTANGLE:
          return this.$i18n('rectangle');
        case this.$constants.HotspotTypes.FREEFORM:
          return this.$i18n('freeform');
        default:
          return '';
      }
    },

    focussedOptionTooltipStyle() {
      const option = this.getOptionById[this.focussedOption];
      if (!option) {
        return {};
      }

      const { width: canvasContainerWidth } = this.$refs.canvasContainer.getBoundingClientRect() ?? {};

      let top = option.geometry.points[0].y;
      let left = option.geometry.points[0].x;
      let translateX = 0;
      let translateY = 0;

      if (option.geometry.shape === this.$constants.HotspotTypes.RECTANGLE) {
        left += option.geometry.width / 2;
        translateY = '-120%';
        translateX = '-50%';
      }

      if (option.geometry.shape === this.$constants.HotspotTypes.CIRCLE) {
        top -= 2 * this.hotspotCanvasService.circleHotspot.radius + 15;
        translateY = '-50%';
        translateX = '-50%';
      }

      if (option.geometry.shape === this.$constants.HotspotTypes.FREEFORM) {
        translateY = '-120%';
        translateX = '-50%';
      }

      // left edge collision detection
      if (left < 80) {
        translateX = '0%';
        left = 10;
      }

      // right edge collision detection
      if (canvasContainerWidth - left < 40) {
        left = canvasContainerWidth;
        translateX = '0%';
      }

      // top edge collision detection
      if (top < 100) {
        top = option.geometry.points[0].y + 2 * this.hotspotCanvasService.circleHotspot.radius + 15;

        if (option.geometry.shape === this.$constants.HotspotTypes.RECTANGLE) {
          top += option.geometry.height + 15;
        }

        if (option.geometry.shape === this.$constants.HotspotTypes.FREEFORM) {
          top = 15;
          translateY = '100%';
        }
      }

      return {
        top: `${top}px`,
        left: `${left}px`,
        transform: `translateX(${translateX}) translateY(${translateY})`,
      };
    },

    questionImage() {
      if (this.isReadOnlyCanvas) {
        return this.forDisplay.image;
      }

      return this.currentSlide.structure.query.media.find((media) => media.type === 'image')?.url;
    },

    questionOptions() {
      if (this.isReadOnlyCanvas) {
        return this.forDisplay.options;
      }

      return this.currentSlide.structure.options;
    },

    activeHotspot() {
      return this.questionOptions[0]?.geometry?.shape;
    },

    containerBasedScale() {
      if (this.isReadOnlyCanvas || this.isForMobile) {
        return Math.min(this.canvasWidth / 600, this.canvasHeight / 600);
      }

      return 1;
    },

    getOptionById() {
      const option = {};

      this.questionOptions.forEach((opt) => {
        option[opt._id] = opt;
      });

      return option;
    },

    questionAnswer() {
      if (this.isReadOnlyCanvas) {
        return this.forDisplay.answer;
      }

      return this.currentSlide.structure.answer;
    },

    tabIndexOfLastOption() {
      return this.questionOptions.length * 3 + 100;
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
  },

  watch: {
    hotspotType(type) {
      if (this.hotspotCanvasService) {
        if (!type) {
          this.hotspotCanvasService.setMode(this.hotspotCanvasService.modes.POINTER);
        }

        this.hotspotCanvasService.setShapeMode(type);
      }
    },

    isImageAdded(isAdded) {
      if (isAdded) {
        this.$nextTick(() => {
          this.initiateCanvasService();
        });
      }
    },

    forDisplay() {
      this.$nextTick(() => {
        this.initiateCanvasService();
      });
    },

    hotspotShowMarkAsDoneCta(isShowing) {
      if (!isShowing) {
        const latestOption = this.questionOptions[this.questionOptions.length - 1];
        if (latestOption.geometry.shape === 'polygon' && latestOption.geometry.points.length < 3) {
          this.deleteOption(latestOption._id);
        }
      }
    },

    globalClipboardState(current) {
      if (current.url) {
        this.handlePastedImage(current.url);
      }
    },
  },

  mounted() {
    this.initiateCanvasService();
    window.addEventListener('resize', this.initiateCanvasService);

    this.$eventBus.$on('hotspotCanvas:action', this.handleHotspotCanvasAction);
  },

  beforeUnmount() {
    this.$store.dispatch('uiManager/setHotspotType', null);
    window.removeEventListener('resize', this.initiateCanvasService);

    this.$eventBus.$off('hotspotCanvas:action', this.handleHotspotCanvasAction);
  },

  methods: {
    initiateCanvasService() {
      if (!this.$refs.canvasContainer || !this.$refs.canvas) {
        return;
      }

      setTimeout(() => {
        const { width } = this.$refs.canvasContainer.getBoundingClientRect();
        this.canvasHeight = width / this.editorScale;
        this.canvasWidth = width / this.editorScale;
      });

      setTimeout(() => {
        this.canvas = this.$refs.canvas;
        if (!this.canvas) {
          QLogger.error('Canvas not ready');
          return;
        }
        this.hotspotCanvasService = new HotspotCanvasService(this.canvas, {
          isForMobile: this.isForMobile,
          scalingFactor: this.containerBasedScale,
        });
        if (this.questionOptions.length) {
          this.hotspotCanvasService.setObjects(this.questionOptions.map(this.injestOptionAsHotspot));
        }

        if (this.isReadOnlyCanvas) {
          this.hotspotCanvasService.setReadOnly();
          return;
        }

        this.hotspotCanvasService.subscribe('update', this.updateHotspots);
        this.hotspotCanvasService.subscribe('delete', this.deleteOption);
        this.hotspotCanvasService.subscribe('selectionChange', this.selectHotspot);
        this.hotspotCanvasService.subscribe('updateMode', (mode) => {
          this.canvasServiceMode = mode;
        });

        if (this.hotspotType) {
          this.hotspotCanvasService.setShapeMode(this.hotspotType);
        }
      }, 200);
    },

    injestOptionAsHotspot(option, optionIndex) {
      let checked = false;

      if (this.displayAnswers && this.questionAnswer.includes(option._id)) {
        checked = true;
      }

      if (this.forDisplay.showResponses) {
        const userAnswer = (this.forDisplay.response?.answer?.find((ans) => ans.descriptor === 'Answer') ?? { value: [] });
        checked = userAnswer.value.includes(option._id);
      }

      const hotspot = {
        id: this.hotspotCanvasService.getIdFromNumber(optionIndex),
        optionId: option._id,
        type: `${option.geometry.shape}Hotspot`,
        checked,
      };

      switch (option.geometry.shape) {
        case this.$constants.HotspotTypes.CIRCLE:
          Object.assign(hotspot, {
            x: option.geometry.points[0].x * this.containerBasedScale,
            y: option.geometry.points[0].y * this.containerBasedScale,
            radius: Math.max(10, 14 * this.containerBasedScale),
          });
          break;
        case this.$constants.HotspotTypes.RECTANGLE:
          Object.assign(hotspot, {
            x: option.geometry.points[0].x * this.containerBasedScale,
            y: option.geometry.points[0].y * this.containerBasedScale,
            height: option.geometry.height * this.containerBasedScale,
            width: option.geometry.width * this.containerBasedScale,
          });
          break;
        case this.$constants.HotspotTypes.FREEFORM:
          Object.assign(hotspot, {
            points: option.geometry.points.map((point) => ({
              x: point.x * this.containerBasedScale,
              y: point.y * this.containerBasedScale,
            })),
          });
          break;
        default:
          break;
      }

      return hotspot;
    },

    injestHotspot(hotspot) {
      const option = QuestionOption();

      if (hotspot.optionId) {
        option._id = hotspot.optionId;
      }

      switch (hotspot.type) {
        case 'circleHotspot':
          option.geometry = {
            shape: this.$constants.HotspotTypes.CIRCLE,
            points: [{
              x: hotspot.x / this.containerBasedScale,
              y: hotspot.y / this.containerBasedScale,
            }],
          };
          break;
        case 'rectangleHotspot':
          option.geometry = {
            shape: this.$constants.HotspotTypes.RECTANGLE,
            height: hotspot.height,
            width: hotspot.width,
            points: [{
              x: hotspot.x / this.containerBasedScale,
              y: hotspot.y / this.containerBasedScale,
            }],
          };
          break;
        case 'polygonHotspot':
          option.geometry = {
            shape: this.$constants.HotspotTypes.FREEFORM,
            points: hotspot.points.map((point) => ({
              x: point.x / this.containerBasedScale,
              y: point.y / this.containerBasedScale,
            })),
          };
          break;
        default:
          break;
      }

      return option;
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

    handleHotspotCanvasAction(action) {
      switch (action) {
        case 'undo':
          this.executeHistoryAction('undo');
          break;
        case 'redo':
          this.executeHistoryAction('redo');
          break;
        case 'clearAll':
          this.clearAllHotspots();
          break;
        default:
          break;
      }
    },

    executeHistoryAction(action) {
      const lastAction = this[`${action}Stack`].shift();
      const oppositeAction = action === 'undo' ? 'redo' : 'undo';

      if (!lastAction) {
        return;
      }

      switch (lastAction.action) {
        case 'added':
          this.deleteOption(lastAction.option._id, false);
          this[`${oppositeAction}Stack`].unshift({
            action: 'deleted',
            option: lastAction.option,
          });
          break;
        case 'deleted':
          this.hotspotCanvasService.objects.push(this.injestOptionAsHotspot(lastAction.option, this.questionOptions.length + 1));
          this.updateQuestionOptions([...this.questionOptions, lastAction.option]);
          this[`${oppositeAction}Stack`].unshift({
            action: 'added',
            option: lastAction.option,
          });
          break;
        default:
          break;
      }
    },

    updateHotspots(hotspots) {
      const finalOptions = [];
      let shouldResetHotspotType = true;

      hotspots.forEach((hotspot) => {
        if (hotspot.type === 'polygonHotspot') {
          this.$store.dispatch('uiManager/setHotspotMarkAsDoneCta', this.hotspotCanvasService.mode.includes('placing'));
          shouldResetHotspotType = !this.hotspotCanvasService.mode.includes('placing');
        }

        const option = this.injestHotspot(hotspot);

        if (!this.getOptionById[option._id]) {
          this.hotspotAdded();
          this.undoStack.unshift({
            action: 'added',
            option,
          });
        }

        finalOptions.push(option);
      });

      this.updateQuestionOptions(finalOptions);

      if (shouldResetHotspotType) {
        this.$store.dispatch('uiManager/setHotspotType', null);
      }
    },

    selectHotspot(hotspotId) {
      if (hotspotId) {
        this.focussedOption = hotspotId;
        return;
      }

      this.focussedOption = null;
    },

    toggleCorrect() {
      let answer = [...this.questionAnswer];

      if (answer.includes(this.focussedOption)) {
        answer = answer.filter((optionId) => optionId !== this.focussedOption);
        this.hotspotCanvasService.setOptionById(this.focussedOption, { checked: false });
      } else {
        answer.push(this.focussedOption);
        this.hotspotCanvasService.setOptionById(this.focussedOption, { checked: true });
      }

      this.updateAnswerValue(answer);
    },

    deleteOption(optionId = this.focussedOption, shouldPreserveHistory = true) {
      this.hotspotCanvasService.deleteObject(optionId);
      const finalOptions = [];
      let optionToBeDeleted = {};

      this.questionOptions.forEach((option) => {
        if (option._id !== optionId) {
          finalOptions.push(option);
          return;
        }

        optionToBeDeleted = option;
      });

      const answer = [...this.questionAnswer].filter((op) => op !== optionId);

      if (shouldPreserveHistory) {
        this.undoStack.unshift({
          action: 'deleted',
          option: optionToBeDeleted,
        });
      }

      if (!finalOptions.length) {
        this.clearHistory();
        this.focussedOption = null;
      }

      this.updateQuestionOptionsAndAnswer(finalOptions, answer);

      if (finalOptions.length === 0) {
        return this.$store.dispatch('uiManager/setHotspotType', null);
      }

      this.focussedOption = null;
    },

    clearAllHotspots() {
      this.hotspotCanvasService.setObjects([]);
      this.clearHistory();
      this.updateQuestionOptionsAndAnswer([], []);
      this.validateQuestion();
      this.hotspotCanvasService.selectedObject = null;
      this.focussedOption = null;
    },

    clearHistory() {
      this.undoStack = [];
      this.redoStack = [];
    },

    // ! store actions
    updateQuestionOptions(options) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options });

      this.validateQuestion();
    },

    updateAnswerValue(answer) {
      this.$store.dispatch('slideEditor/updateQuestionAnswer', { answer });

      this.validateQuestion();
    },

    updateQuestionOptionsAndAnswer(options, answer) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options, answer });

      this.validateQuestion();
    },

    validateQuestion() {
      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    hotspotAdded() {
      if (this.hotspotAddedCalled) {
        return;
      }
      this.hotspotAddedCalled = true;
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.HOTSPOT_ADDED);
      this.$analytics.logEvent(eventName);
    },
  },
};
</script>

<style lang="scss" scoped>
$max-canvas-width: 600px;
.canvas-container {
  position: relative;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  overflow: hidden;
  aspect-ratio: 1/1;
  width: 100%;
  max-width: $max-canvas-width;

  &.circle-pointer {
    cursor: url('https://cf.quizizz.com/image/circle_hotspot_pointer.png') 16 16, auto !important;
  }

  &.rectangle-pointer {
    cursor: url('https://cf.quizizz.com/image/rectangle_hotspot_32_32.png') 16 16, auto;
  }

  &.polygon-pointer {
    cursor: url('https://cf.quizizz.com/image/freeform_hotspot_pointer.png') 16 16, auto;
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
</style>

<!-- eslint-disable vuejs-accessibility/media-has-caption -->
<template>
  <div
    class="question-query-section flex items-center h-full"
    :class="getQuestionQuerySectionClasses"
  >
    <div
      v-if="isDndOnImageQuestion || isHotspotQuestion"
      class="flex w-full h-full p-2"
    >
      <div class="flex flex-col align-center items-center justify-center basis-1/2">
        <div class="flex flex-col align-center items-center h-2/5">
          <MediaAudio
            v-if="doesQuestionHaveAnyMedia && isQuestionMediaPresent('audio')"
            class="static flex justify-center w-10 h-10 mx-2 mb-4 flex-0"
            :size="40"
            :src="queryMediaObjects.audio.url"
          />
          <MediaYoutube
            v-if="isQuestionMediaPresent('video')"
            class="flex items-center justify-center video-wrapper"
            :url="queryMediaObjects.video.url"
            :videoId="queryMediaObjects.video.meta.videoId"
          />
          <div
            v-if="!doesQuestionHaveAnyMedia || doesQuestionHaveAnyMedia && getQuestionText"
            class="pl-4 h-3/4"
          >
            <ResizableText
              v-if="getQuestionText"
              class="text-center"
              :canScrollIfOverflowAfterMinSize="true"
              :text="getQuestionText"
              :fontSizeJumpsList="optionResizeFontJumps"
              dirToResizeAgainst="both"
              :options="options"
              :answer="answer"
              :showAnswers="showAnswers"
            />
            <div
              v-else
              class="text-light-20% h-full w-full flex justify-center items-center text-2xl"
            >
              <i18n>Question Text</i18n>
            </div>
          </div>
        </div>
        <DndOnImageOptions
          v-if="!showAnswers && isDndOnImageQuestion"
          :currentQuestion="currentQuestion"
        />
      </div>
      <div
        v-if="isDndOnImageQuestion"
        id="canvasContainer"
        class="w-full h-full object-contain bg-light-2 rounded-md preview-canvas-container flex basis-1/2 grow-1 shrink-0"
      >
        <OptionsEditorDndImageEditorCanvas
          :forDisplay="{
            image: queryMediaObjects.image.url,
            answer: answer,
            options: options,
            targets: currentQuestion.structure.targets,
            previewMode: true,
            showAnswers: showAnswers,
          }"
          :canvasScaleFactor="canvasScale"
        />
      </div>
      <div
        v-else-if="isHotspotQuestion"
        id="canvasContainer"
        class="w-full h-full object-contain bg-light-2 rounded-md preview-canvas-container flex basis-1/2 grow-1 shrink-0"
      >
        <OptionsEditorHotspotEditorCanvas
          :forDisplay="{
            image: queryMediaObjects.image.url,
            answer: answer,
            options: options,
            targets: currentQuestion.structure.targets,
            previewMode: true,
            showAnswers: showAnswers,
          }"
        />
      </div>
    </div>
    <template v-else>
      <div
        v-if="doesQuestionHaveAnyMedia && !isDrawBasedQuestion"
        class="relative flex items-center justify-center min-h-0"
        :class="[
          isQuestionMediaPresent('audio') ? 'media-wrapper-audio' : 'media-wrapper',
          isGraphingBasedQuestion || isEquationBasedQuestion ? 'h-auto' : 'h-full',
        ]"
      >
        <MediaImage
          v-if="isQuestionMediaPresent('image')"
          class="w-full h-full rounded-md"
          :src="queryMediaObjects.image.url"
          objectFit="contain"
        />

        <MediaAudio
          v-if="isQuestionMediaPresent('audio')"
          :size="isDesktop ? 160 : 90"
          :src="queryMediaObjects.audio.url"
        />

        <video
          v-if="isQuestionMediaPresent('video') && isGoogleDriveSrcForVideo"
          ref="video-container"
          controls
          playsinline
          class="flex items-center justify-center h-auto max-h-full"
        >
          <source
            :src="`https://drive.google.com/uc?export=download&id=${googleDriveVideoId}`"
            type="video/mp4"
          >
        </video>
        <MediaYoutube
          v-if="isQuestionMediaPresent('video') && !isGoogleDriveSrcForVideo"
          ref="video_container"
          :url="queryMediaObjects.video.url"
          :videoId="youtubeVideoId"
          :start="videoStartTime"
          :end="videoEndTime"
          class="flex items-center justify-center video-wrapper"
        />
      </div>

      <MediaAudio
        v-if="doesQuestionHaveAnyMedia && isDrawBasedQuestion && isQuestionMediaPresent('audio')"
        class="static flex justify-center w-10 h-10 mx-2 flex-0"
        :size="40"
        :src="queryMediaObjects.audio.url"
      />

      <div
        v-if="!doesQuestionHaveAnyMedia || doesQuestionHaveAnyMedia && getQuestionText"
        :class="[
          { 'pl-4': !isDrawBasedQuestion },
          { 'draw-question-text': isDrawBasedQuestion && doesQuestionHaveAnyMedia && isQuestionMediaPresent('audio') },
          isGraphingBasedQuestion ? 'h-auto' : (isEquationBasedQuestion ? 'h-1/2' : 'h-full flex-1'),
        ]"
      >
        <ResizableText
          v-if="getQuestionText"
          :class="isEquationBasedQuestion ? 'text-left' : 'text-center'"
          :canScrollIfOverflowAfterMinSize="true"
          :text="getQuestionText"
          :fontSizeJumpsList="optionResizeFontJumps"
          dirToResizeAgainst="both"
          :options="options"
          :answer="answer"
          :showAnswers="showAnswers"
        />
        <div
          v-else
          class="text-light-20% h-full w-full flex justify-center items-center text-2xl"
        >
          <i18n>Question Text</i18n>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import forEach from 'lodash/forEach';
import { mapGetters } from 'vuex';

import {
  isDrawBasedQuestion,
  isEquationBasedQuestion,
  replaceBlankWithStyledSpan,
  isInteractiveBlankBasedQuestion,
  isDndImageBasedQuestion,
  isHotspotBasedQuestion,
  isGraphingBasedQuestion,
  getQuestionVideoTimes,
} from '~/utils/QuizUtils';
import Constants from '~/config/Constants';
import katex from 'katex';
import { getFontSizeRange } from '../../utils/TypographyUtils';
import ResizableText from '../ResizableText.vue';

import DndOnImageOptions from './ResponseSection/DndOnImageOptions.vue';

const { HEIGHT: CANVAS_MAX_HEIGHT, WIDTH: CANVAS_MAX_WIDTH } = Constants.EditorDimensions.DND_IMAGE_CANVAS;

const initialQueryMediaObjects = () => ({
  image: {},
  audio: {},
  video: {},
});

export default {
  components: {
    ResizableText,
    DndOnImageOptions,
  },
  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },

    showAnswers: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      canvasScale: 1,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    getQuestionQuerySectionClasses() {
      if (this.isDrawBasedQuestion) {
        return 'h-16 px-2 justify-center';
      }
      if (this.isEquationBasedQuestion) {
        return 'h-full w-full flex-col justify-evenly';
      }
      if (this.isGraphingBasedQuestion) {
        return 'h-full p-4 flex-col justify-evenly';
      }
      if (this.isDndOnImageQuestion) {
        return 'h-full';
      }

      return 'h-full p-4';
    },

    questionQuery() {
      return this.currentQuestion.structure.query;
    },

    queryMediaObjects() {
      const queryMediaObjects = initialQueryMediaObjects();
      const doesQuestionHaveMedia = (Array.isArray(this.questionQuery.media) && !isEmpty(this.questionQuery.media));

      if (doesQuestionHaveMedia) {
        forEach(this.questionQuery.media, (media) => {
          queryMediaObjects[media.type] = media;
        });
      }

      return queryMediaObjects;
    },

    options() {
      return this.currentQuestion?.structure?.options;
    },

    answer() {
      return this.currentQuestion?.structure?.answer;
    },

    isDrawBasedQuestion() {
      return isDrawBasedQuestion(this.currentQuestion);
    },

    isEquationBasedQuestion() {
      return isEquationBasedQuestion(this.currentQuestion);
    },

    isInteractiveBlankBasedQuestion() {
      return isInteractiveBlankBasedQuestion(this.currentQuestion);
    },

    isDropdownBasedBlankQuestion() {
      return this.currentQuestion.type === this.$constants.QuestionTypes.DROPDOWN;
    },

    isDndOnImageQuestion() {
      return isDndImageBasedQuestion(this.currentQuestion);
    },

    isHotspotQuestion() {
      return isHotspotBasedQuestion(this.currentQuestion);
    },

    isGraphingBasedQuestion() {
      return isGraphingBasedQuestion(this.currentQuestion);
    },

    getQuestionText() {
      if (this.isInteractiveBlankBasedQuestion) {
        let blankClass = 'inline-flex border border-dashed border-light-50% bg-dark-20% rounded-lg h-10 w-50 mt-4 first:mr-2 first:mx-0 mx-2 shadow-inner';

        if (this.isDropdownBasedBlankQuestion) {
          blankClass = 'inline-flex cursor-pointer text-light-50% w-50 h-10 rounded-lg border-2 border-dark-1 shadow-inner bg-dark-50% text-xl font-bold first:mr-2 first:mx-0 mx-2 justify-center';
        }

        const blankStylingConfig = {
          withRomans: false,
          withStyles: false,
          blankClass,
          singleBlankClass: [],
        };

        if (this.isDropdownBasedBlankQuestion) {
          blankStylingConfig.placeholder = `${this.$i18n('Select answer')}<i class="fas fa-caret-down ml-2 text-xl text-light-3 p-2"></i>`;
        }

        if (this.showAnswers) {
          const blankIdsMapToOptionText = {};

          this.answer.forEach((answer, index) => {
            const option = this.options.find((o) => o._id === answer.optionId[0]);
            const textToDisplay = option.hasMath ? this.katexHTML(option.math.latex[0]) : option.text;
            blankIdsMapToOptionText[answer.targetId] = `<i class="fas fa-check p-2 text-xs"></i>${textToDisplay}`;
            if (option.hasMath) {
              blankStylingConfig.singleBlankClass[index] = 'inline-flex h-fit';
            }
          });

          blankStylingConfig.blankClass = 'whitespace-nowrap w-fit bg-green text-xl font-bold text-light-3 rounded-lg py-2 pr-4 first:mr-2 first:mx-0 mx-2 leading-16';
          blankStylingConfig.content = blankIdsMapToOptionText;
        }

        return replaceBlankWithStyledSpan(this.questionQuery.text, blankStylingConfig);
      }

      return this.questionQuery.text;
    },

    doesQuestionHaveAnyMedia() {
      let check = false;

      forEach(this.queryMediaObjects, (media, type) => {
        if (this.isQuestionMediaPresent(type)) {
          check = true;
        }
      });

      return check;
    },

    optionResizeFontJumps() {
      return getFontSizeRange(24, 16);
    },

    isGoogleDriveSrcForVideo() {
      return get(this.queryMediaObjects, 'video.meta.src', null) === 'google-drive';
    },

    googleDriveVideoId() {
      return get(this.queryMediaObjects, 'video.video', '');
    },

    youtubeVideoId() {
      return get(this.queryMediaObjects, 'video.meta.videoId', null);
    },

    videoStartTime() {
      return getQuestionVideoTimes(this.queryMediaObjects).startTime;
    },

    videoEndTime() {
      return getQuestionVideoTimes(this.queryMediaObjects).endTime;
    },
  },

  watch: {
    showAnswers(isShowing) {
      if (!isShowing) {
        this.$nextTick(() => {
          this.handleDropdownDisplay();
        });
      }
    },
  },

  async created() {
    this.katex = katex;
  },

  mounted() {
    this.handleDropdownDisplay();
    this.calculateCanvasScalingFactor();
    window.addEventListener('resize', this.calculateCanvasScalingFactor);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.calculateCanvasScalingFactor);
  },

  methods: {
    isQuestionMediaPresent(Qtype) {
      return !isEmpty(this.questionQuery.media) && this.questionQuery.media.find(({ type }) => type === Qtype);
    },

    katexHTML(content) {
      let latex = content;
      if (typeof latex !== 'string') {
        latex = `${latex}`;
      }
      let katexEle = '';
      try {
        katexEle = this.katex
          ? this.katex.renderToString(latex, {
            displayMode: true,
          })
          : '';
      } catch (err) {
        window.console.error(err);
      }
      return katexEle;
    },

    handleDropdownDisplay() {
      if (!this.isDropdownBasedBlankQuestion) {
        return;
      }

      const allBlanks = document.querySelectorAll('.question-query-blank');

      const ul = document.createElement('ul');

      ul.addEventListener('blur', (event) => {
        event.target.parentNode.removeChild(event.target);
      });

      this.options.forEach((option) => {
        let { text } = option;
        if (option.hasMath) {
          text = option.math.latex[0];
        }

        const li = document.createElement('li');
        li.innerText = text;

        li.classList.add('bg-light-3', 'text-dark-2', 'font-bold', 'text-xl', 'text-left', 'p-2', 'border-b', 'border-dark-6');
        ul.classList.add('dropdown-option-list', 'shadow-md', 'max-h-56', 'overflow-y-auto');
        ul.append(li);
      });

      allBlanks.forEach((blank) => {
        blank.addEventListener('click', (event) => {
          event.stopPropagation();

          if (!['I', 'SPAN'].includes(event.target.tagName)) {
            return;
          }

          const target = event.target.tagName === 'I' ? event.target.parentNode : event.target;
          const placement = target.getBoundingClientRect();

          ul.style.position = 'fixed';
          ul.style.top = placement.top + placement.height;
          ul.style.left = placement.left;
          ul.style.width = `${placement.width}px`;

          ul.classList.add('list-none', 'rounded-lg', 'overflow-hidden');

          target.appendChild(ul);
        });
      });
    },

    calculateCanvasScalingFactor() {
      if (this.isDndOnImageQuestion) {
        const canvasContainer = document.getElementById('canvasContainer');

        if (!canvasContainer) {
          return;
        }

        const { height: canvasContainerHeight, width: canvasContainerWidth } = canvasContainer.getBoundingClientRect();
        const widthScalingFactor = canvasContainerWidth / CANVAS_MAX_WIDTH;
        const heightScalingFactor = canvasContainerHeight / CANVAS_MAX_HEIGHT;
        this.canvasScale = Math.min(widthScalingFactor, heightScalingFactor);
      }
    },
  },
};
</script>

<style lang="scss" scoped>

  .media-wrapper {
    width: 40%;
  }

  .media-wrapper-audio {
    width: 30%;
  }

  .draw-question-text {
    max-width: calc(100% - 56px);
  }

  .preview-canvas-container {
    z-index: 0;
    position: relative;
  }

:deep() .video-wrapper {
    float: none;
    clear: both;
    width: 100%;
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 25px;
    height: 0;

    & iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
}
</style>

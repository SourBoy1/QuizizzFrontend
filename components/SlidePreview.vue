<template>
  <div
    ref="parent"
    class="slide-preview-container relative w-full h-full"
    @dragstart="$emit('dragstart', $event)"
    @dragend="$emit('dragend', $event)"
  >
    <div
      class="slide-background absolute w-320 h-180"
      :style="questionBgStyle"
    >
      <div
        class="absolute w-full h-full overflow-hidden slide-preview text-light-3"
        :class="[
          !isInteractable ? 'pointer-events-none' : '',
        ]"
        :style="previewStyles"
      >
        <div v-if="isSlideForContentV2">
          <SlideElementDisplay
            v-for="element in question.structure.elements"
            :key="element && element._id"
            :isBackground="element && element.isBackground ? true : undefined"
            :element="element"
            :questionId="question && question._id"
            :theme="theme"
          />
        </div>

        <template v-if="isSlideForContentV1">
          <SlideElementDisplayV1
            :rawQuestion="question"
          />
        </template>

        <div
          v-if="isSlideForQuestion"
          class="relative z-10 flex flex-col items-start justify-between w-full h-full p-20 question-preview"
        >
          <QuestionTypeIcon
            :size="120"
            :type="questionTypeIcon"
            class="w-6 h-6 mr-2"
            :shouldPaintBackground="false"
          />

          <div
            class="question-query-container"
            v-html="questionQueryText"
          />
        </div>
      </div>
    </div>
    <div
      v-if="readOnly"
      class="read-only h-full w-full absolute top-0 left-0"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { isSlideForQuestion } from '~/utils/SlideUtils';

import { colors } from '~/config/TailwindConstants';
import Question from '~/models/Question';

import {
  isSlideForContent, isSlideForContentV1, isQuestionForPoll, isWordCloudQuestion, replaceBlankWithStyledSpan,
} from '../utils/QuizUtils';

import { hexToRGBValues, hexToRGB } from '../services/ColorService';

export default {
  props: {
    isThemeModalPreview: {
      type: Boolean,
      default: false,
    },

    isTemplate: {
      type: Boolean,
      default: false,
    },

    question: {
      type: Object,
      default() {
        return Question();
      },
    },

    parentDimensions: {
      type: Object,
      default: () => {},
    },

    readOnly: {
      type: Boolean,
      default: false,
    },

    isInteractable: {
      type: Boolean,
      default: false,
    },

    hasParent: {
      type: Boolean,
      default: false,
    },

    supersedingTheme: {
      type: Object,
      default: null,
    },

    bgGif: {
      type: String,
      default: '',
    },
  },
  emits: ['dragstart', 'dragend'],

  data() {
    return {
      scaleX: 1,
      scaleY: 1,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),
    ...mapGetters('contentEditor', ['getTheme']),

    isSlideForContent() {
      return isSlideForContent(this.question);
    },

    isSlideForContentV1() {
      return isSlideForContentV1(this.question);
    },

    isSlideForContentV2() {
      return !this.isSlideForContentV1;
    },

    isSlideForQuestion() {
      return isSlideForQuestion(this.question);
    },

    isSlideQuestionPOLL() {
      return this.isSlideForQuestion && isQuestionForPoll(this.question);
    },
    isSlideQuestionWordCloud() {
      return isWordCloudQuestion(this.question);
    },
    isSlideQuestionMCQ() {
      return this.isSlideForQuestion && !this.isSlideQuestionPOLL && this.question.type === this.$constants.SlideTypes.MCQ;
    },
    isSlideQuestionMSQ() {
      return this.isSlideForQuestion && !this.isSlideQuestionPOLL && this.question.type === this.$constants.SlideTypes.MSQ;
    },
    isSlideQuestionFIB() {
      return this.isSlideForQuestion && this.question.type === this.$constants.SlideTypes.BLANK;
    },
    isSlideQuestionOEQ() {
      return this.isSlideForQuestion && this.question.type === this.$constants.SlideTypes.OPEN;
    },
    isSlideQuestionDRAW() {
      return this.isSlideForQuestion && this.question.type === this.$constants.SlideTypes.DRAW;
    },
    isSlideQuestionAudVid() {
      return this.isSlideForQuestion && (this.question.type === this.$constants.SlideTypes.AUDIO || this.question.type === this.$constants.SlideTypes.VIDEO);
    },
    isSlideQuestionMatch() {
      return this.isSlideForQuestion && (this.question.type === this.$constants.SlideTypes.MATCH);
    },
    isSlideQuestionReorder() {
      return this.isSlideForQuestion && (this.question.type === this.$constants.SlideTypes.REORDER);
    },
    isSlideDragNDropBased() {
      return this.isSlideForQuestion && (this.question.type === this.$constants.SlideTypes.DRAGNDROP);
    },
    isSlideDropdownBased() {
      return this.isSlideForQuestion && (this.question.type === this.$constants.SlideTypes.DROPDOWN);
    },
    isSlideEquationBased() {
      return this.isSlideForQuestion && (this.question.type === this.$constants.SlideTypes.EQUATION);
    },
    isSlideDragOnDropImageBased() {
      return this.isSlideForQuestion && (this.question.type === this.$constants.SlideTypes.DND_IMAGE);
    },
    isSlideHotspotBased() {
      return this.isSlideForQuestion && (this.question.type === this.$constants.SlideTypes.HOTSPOT);
    },

    questionQueryText() {
      if (!this.isSlideForQuestion) {
        return '';
      }

      const queryText = get(this.question, 'structure.query.text', '');

      if (this.isSlideDragNDropBased || this.isSlideDropdownBased) {
        return replaceBlankWithStyledSpan(queryText, {
          style: {
            'border-bottom': '4px solid #fff',
            width: '240px',
          },
        });
      }

      return queryText;
    },

    hasQuestionMedia() {
      return !isEmpty(this.questionMedia);
    },

    questionMedia() {
      if ([this.$constants.QuestionTypes.DRAW, this.$constants.QuestionTypes.DND_IMAGE, this.$constants.QuestionTypes.HOTSPOT].includes(this.question.type)) {
        return this.question.structure.query.media.find((item) => item.type === 'image');
      }
      return get(this.question, 'structure.query.media[0]');
    },

    questionTypeIcon() {
      if (this.isSlideQuestionPOLL) {
        return this.$constants.SlideTypes.POLL;
      }

      if (this.isSlideQuestionWordCloud) {
        return this.$constants.SlideTypes.WORDCLOUD;
      }

      return this.question.type;
    },

    backgroundImage() {
      return this.bgGif || get(this.question, 'structure.theme.background.image', '');
    },

    backgroundColor() {
      return get(this.question, 'structure.theme.background.color', '');
    },

    textFontColor() {
      return get(this.question, 'structure.theme.fontColor.text', '');
    },

    themeFontFamily() {
      return get(this.question, 'structure.theme.fontColor.text', '');
    },

    questionBgStyle() {
      const style = {
        transform: `translate(-50%, -50%) scale(${this.scaleX}, ${this.scaleY}) translate(50%, 50%)`,
      };
      if (this.isSlideForQuestion && this.questionMedia) {
        let backgroundImage;
        let backgroundSize = 'cover';
        let backgroundPosition = 'center';
        const mediaType = this.questionMedia.type;
        if (mediaType === 'image') {
          backgroundImage = this.questionMedia.url;
        } else if (mediaType === 'video') {
          if (get(this.questionMedia, 'meta.src', null) === 'google-drive') {
            backgroundImage = 'https://cf.quizizz.com/img/presentation/video.png';
            backgroundSize = 'contain';
            backgroundPosition = '725px -175px';
            style.backgroundRepeat = 'no-repeat';
          } else {
            const videoId = get(this.questionMedia, 'meta.videoId');
            backgroundImage = `https://img.youtube.com/vi/${videoId}/0.jpg`;
          }
        } else if (mediaType === 'audio') {
          backgroundImage = 'https://cf.quizizz.com/img/presentation/audio_preview_thumbnail.png';
          backgroundSize = 'contain';
          backgroundPosition = '725px -175px';
          style.backgroundRepeat = 'no-repeat';
        }
        const opacity = 0.5;
        const dark = `rgba(0, 0, 0, ${opacity})`;
        if (backgroundImage) {
          if (mediaType === 'audio' || (mediaType === 'video' && get(this.questionMedia, 'meta.src', null) === 'google-drive')) {
            style.backgroundImage = `url(${backgroundImage})`;
            style.backgroundColor = this.getQuestionBgColor(true);
          } else {
            style.backgroundImage = `linear-gradient(${dark}, ${dark}), url(${backgroundImage})`;
            style.backgroundColor = this.getQuestionBgColor();
          }
          style.backgroundSize = backgroundSize;
          style.backgroundPosition = backgroundPosition;
        }
      }
      return style;
    },

    questionBgGradient() {
      const color = this.getQuestionBgColor();
      const rgb = hexToRGBValues(color);
      return `radial-gradient(65.05% 148.42% at 2.08% 6.17%, ${hexToRGB(color)} 0%, ${this.getRGBA(rgb, 0.4)} 26.32%, ${this.getRGBA(rgb, 0)} 72.13%)`;
    },

    previewStyles() {
      const { backgroundImage } = this;
      const backgroundColor = this.backgroundColor || colors.dark['10%'];
      const color = this.textFontColor || colors.light.DEFAULT;

      const previewStyles = {};

      if (this.isSlideForContent) {
        previewStyles.backgroundColor = backgroundColor;
        previewStyles.color = `${color}`;

        if (backgroundImage) {
          previewStyles.backgroundImage = `url(${backgroundImage})`;
          previewStyles.backgroundSize = 'cover';
        }
      } else {
        const mediaType = this.questionMedia && this.questionMedia.type;
        if (mediaType !== 'audio') {
          previewStyles.backgroundImage = this.questionBgGradient;
        }
        if (!this.hasQuestionMedia) {
          previewStyles.backgroundColor = this.getQuestionBgColor();
        }
      }

      return previewStyles;
    },

    theme() {
      return this.supersedingTheme || this.getTheme(this.question?._id);
    },
  },

  watch: {
    /**
     * The width and height of the parent is sometimes dynamically set. We need to re calculate the scale values
     * When the parent's dimensions change. This is because when mounted is called, it the parent width and height
     * may not have been calculated yet
     * */
    parentDimensions(newVal, oldVal) {
      if (newVal.height !== oldVal.height || newVal.width !== oldVal.width) {
        this.setScaleStyles();
      }
    },

    deviceProps(newVal, oldVal) {
      if (newVal.height !== oldVal.height || newVal.width !== oldVal.width) {
        this.setScaleStyles();
      }
    },
  },

  mounted() {
    this.$eventBus.$on('slidePreview:resize', this.setScaleStyles);
    this.$nextTick(() => {
      this.setScaleStyles();
    });
  },

  beforeUnmount() {
    this.$eventBus.$off('slidePreview:resize', this.setScaleStyles);
  },

  methods: {
    setScaleStyles() {
      let rect = this.$refs.parent.getBoundingClientRect();
      if (this.hasParent) {
        /**
       * Using immediate ancestor's dimensions to calculate scaling factor
       * The immediate ancestor is the limiting factor for the slide preview if any
       */
        rect = this.parentDimensions;
      }

      this.scaleX = parseInt(rect.width, 10) / 1280;
      this.scaleY = parseInt(rect.height, 10) / 720;
    },

    getRGBA(rgb, a) {
      return `rgba( ${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    },

    getQuestionBgColor(isDark) {
      if (!this.isSlideForQuestion || !this.question) {
        return '';
      }

      // order of checks is important, we need to ensure its not a poll before falling to switch case
      if (isQuestionForPoll(this.question)) {
        return isDark ? colors.brandColors.a.dark : colors.brandColors.a.DEFAULT;
      }

      switch (this.question.type) {
        case this.$constants.SlideTypes.MCQ:
        case this.$constants.SlideTypes.MSQ:
          return isDark ? colors.brandColors.b.dark : colors.brandColors.b.DEFAULT;
        case this.$constants.SlideTypes.BLANK:
          return isDark ? colors.brandColors.c.dark : colors.brandColors.c.DEFAULT;
        case this.$constants.SlideTypes.OPEN:
          return isDark ? colors.brandColors.e.dark : colors.brandColors.e.DEFAULT;
        case this.$constants.SlideTypes.DRAW:
          return isDark ? colors.brandColors.d.dark : colors.brandColors.d.DEFAULT;
        case this.$constants.SlideTypes.AUDIO:
        case this.$constants.SlideTypes.VIDEO:
          return isDark ? colors.brandColors.g.dark : colors.brandColors.g.DEFAULT;
        default:
          // rest of the question use the same colors, if new color are needed please add the case as needed
          return isDark ? colors.brandColors.g.dark : colors.brandColors.b.DEFAULT;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.question-query-container {
  font-size: 104px;
  max-height: 55%;
  width: 100%;
  overflow: hidden;
  text-align: left;
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

</style>

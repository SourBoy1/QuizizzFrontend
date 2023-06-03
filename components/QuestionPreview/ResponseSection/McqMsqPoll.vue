<template>
  <div class="flex flex-nowrap">
    <div
      v-for="(option, index) in questionOptions"
      :key="index"
      class="relative flex justify-center flex-1 h-full p-1 option-container"
      :style="{ 'max-width': `${100 / questionOptions.length}%` }"
      :class="{ 'opacity-10 transition-all duration-200 ease-out': !isOptionCorrectAnswer(index) && showAnswers && !isQuestionForPoll }"
    >
      <div
        v-if="!isOptionForImage(index)"
        ref="option"
        class="w-full p-4 text-center rounded-lg cursor-pointer option"
        :class="[`opt-num-${index + 1} transition-all duration-200 ease-in-out`, {
          'when-poll-question': isQuestionForPoll,
          'text-light-20%': !option.text,
          'correct-opt border-8 border-light transition-all duration-200 ease-in-out': isOptionCorrectAnswer(index) && showAnswers,
          'no-shadow': showAnswers,
        }]"
        tabIndex="0"
      >
        <ResizableText
          class="text-center resizable-text-height"
          :class="{ 'text-light-20%': !option.text }"
          :canScrollIfOverflowAfterMinSize="true"
          :isContainerHeightHundredPercent="true"
          :text="option.text ? option.text : $i18n(`Answer option ${index + 1}`)"
          :fontSizeJumpsList="optionResizeFontJumps"
          dirToResizeAgainst="both"
        />
      </div>
      <div
        v-else
        ref="option"
        class="flex items-center justify-center w-full h-full p-2 rounded-lg image-option option"
        :class="{ 'no-shadow': showAnswers }"
      >
        <MediaImage
          class="w-full h-full"
          :src="option.media[0].url"
          objectFit="contain"
        />

        <ResizableText
          v-if="doesOptionHaveMediaImageCaption(option)"
          class="absolute h-auto text-center option-image-caption bg-light max-h-19 text-dark bottom-3"
          textType="optionText"
          :text="optionMediaImageCaption(option)"
          :canScrollIfOverflowAfterMinSize="false"
          :fontSizeJumpsList="getFontSizeJumpsForImageCaption"
          :dirToResizeAgainst="'both'"
        />
      </div>
      <span
        v-if="shouldShowOptionCount"
        class="flex items-center justify-center absolute top-1 left-1 w-16 h-16 rounded-tl-lg rounded-br-lg bg-dark-50% text-2xl font-bold pointer-events-none"
      >
        {{ String.fromCharCode(65 + index) }}
      </span>
      <div
        v-if="showMsqCheckbox(index)"
        class="absolute top-3 right-2 border-2 w-6 h-6 rounded bg-dark-50%"
        :class="[!isOptionCorrectAnswer(index) && showAnswers ? 'border-dark-20%' : 'border-light', {
          'border-dark-20%': isOptionForImage(index),
        }]"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import includes from 'lodash/includes';
import get from 'lodash/get';

import { isQuestionForPoll, isMsqBasedQuestion } from '~/utils/QuizUtils';
import { getFontSizeRange } from '../../../utils/TypographyUtils';
import ResizableText from '../../ResizableText.vue';

export default {
  components: {
    ResizableText,
  },

  props: {
    questionAnswers: {
      type: [Array, Number],
      required: true,
    },

    currentQuestion: {
      type: Object,
      required: true,
    },

    showAnswers: {
      type: Boolean,
      required: true,
    },
    offlineMode: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),

    getFontSizeJumpsForImageCaption() {
      switch (this.deviceType) {
        case this.$constants.DeviceTypes.DESKTOP:
          return getFontSizeRange(20, 14);

        case this.$constants.DeviceTypes.TABLET:
          return getFontSizeRange(18, 14);

        case this.$constants.DeviceTypes.PHONE:
        default:
          return getFontSizeRange(14, 10);
      }
    },

    isQuestionForPoll() {
      return isQuestionForPoll(this.currentQuestion);
    },

    isQuestionTypeMSQ() {
      return isMsqBasedQuestion(this.currentQuestion);
    },

    questionOptions() {
      if (isEmpty(this.currentQuestion.structure.options)) {
        return Array(4).fill('');
      }

      return this.currentQuestion.structure.options;
    },

    optionResizeFontJumps() {
      if (this.questionOptions.length >= 5) {
        return getFontSizeRange(24, 16);
      }

      return getFontSizeRange(28, 16);
    },

    shouldShowOptionCount() {
      return this.offlineMode && !this.isQuestionTypeMSQ && this.questionOptions.length <= 4;
    },
  },

  methods: {
    isOptionForImage(index) {
      return this.questionOptions[index].type === 'image';
    },

    showMsqCheckbox(index) {
      return this.isQuestionTypeMSQ && (!this.showAnswers || (this.showAnswers && !this.isOptionCorrectAnswer(index)));
    },

    isOptionCorrectAnswer(index) {
      if (typeof (this.questionAnswers) === 'number') {
        return this.questionAnswers === index;
      }

      return includes(this.questionAnswers, index);
    },

    getOptionMedia(option) {
      return get(option, 'media[0]', {});
    },

    doesOptionHaveMediaImageCaption(option) {
      const media = this.getOptionMedia(option);

      if (isEmpty(media)) { return; }

      return media.type === 'image' && !isEmpty(this.optionMediaImageCaption(option));
    },

    optionMediaImageCaption(option) {
      const media = this.getOptionMedia(option);
      const caption = get(media, 'meta.text', '');

      return caption;
    },
  },
};
</script>

<style lang="scss" scoped>
$option1BgColor: theme('colors.brand.a.DEFAULT');
$option2BgColor: theme('colors.brand.b.DEFAULT');
$option3BgColor: theme('colors.brand.c.DEFAULT');
$option4BgColor: theme('colors.brand.d.DEFAULT');
$option5BgColor: theme('colors.brand.e.DEFAULT');
$pollOptionBGColor: theme('colors.blue.DEFAULT');
$imageOptionBGColor: #FFFFFF;
$game-correct-color: #62c370;
$optionColorDarkenPercentage: 12.5%;
$optionShadowHeightUnPressed: 8px;
$optionShadowMobileHeightUnPressed: 4px;
$optionShadowHeightPressed: 4px;

$optionColors: (
    "1": $option1BgColor,
    "2": $option2BgColor,
    "3": $option3BgColor,
    "4": $option4BgColor,
    "5": $option5BgColor,
);

  @each $optionNumber, $i in $optionColors {
    .opt-num-#{$optionNumber} {
      background: $i;
      box-shadow: 0px 6px 0px rgba(0, 0, 0, 0.2), 0px 6px 0px $i;
      height: calc(100% - 6px);

      &:not(.no-shadow):hover {
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), $i;
      }
    }
  }

  .when-poll-question {
    background-color: $pollOptionBGColor;
    box-shadow: 0px 6px 0px rgba(0, 0, 0, 0.2), 0px 6px 0px $pollOptionBGColor;
      &:not(.no-shadow):hover {
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), $pollOptionBGColor;
      }
  }

  .image-option {
    background: $imageOptionBGColor;
    box-shadow: 0px 6px 0px #B6B6B6;
    height: calc(100% - 6px);

    &:not(.no-shadow):hover {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), $imageOptionBGColor;
    }
  }

  .no-shadow {
    box-shadow: none !important;
    height: 100% !important;
    transition: all .2s;
  }

  .resizable-text-height {
    height: 100%;
  }

  .correct-opt {
    background: $game-correct-color;
    padding: 0.5rem !important;
  }

  .option-image-caption {
    width: calc(100% - 24px);
    height: auto !important;
  }
</style>

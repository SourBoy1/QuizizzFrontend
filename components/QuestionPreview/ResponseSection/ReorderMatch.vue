<template>
  <div class="h-full p-2 reorder-match">
    <div
      class="reorder-match-container"
    >
      <div
        v-for="(option, index) in options"
        :key="option.optionIndex"
        :ref="`option-${option.optionIndex}`"
        class="bg-dark-20% rounded-lg h-full w-full"
      >
        <div
          class="h-full transition-all duration-300 ease-in-out option-content"
          :style="translateToCorrectPosition(option.optionIndex)"
        >
          <div
            :class="{
              'correct-option': showAnswers,
              'image-option': getMediaForOption(option) && !showAnswers,
              [`opt-num-${index + 1}`]: !getMediaForOption(option) && !showAnswers,
            }"
            class="flex items-center justify-center h-full p-2 rounded-lg"
          >
            <div
              v-if="showAnswers"
              class="absolute flex items-center justify-center w-6 h-6 check-mark z-999 rounded-bl-md top-1 right-1 text-light-3"
            >
              <FA
                icon="fas fa-check"
                :size="12"
              />
            </div>
            <div
              v-if="isOptionsForText(option)"
              class="w-full h-full"
            >
              <ResizableText
                class="text-center resizable-text-height"
                :class="{ 'text-light-20%': !option.text }"
                :canScrollIfOverflowAfterMinSize="true"
                :isContainerHeightHundredPercent="true"
                :text="option.text ? option.text : $i18n('Answer option {$1}', [index + 1])"
                :fontSizeJumpsList="optionResizeFontJumps"
                dirToResizeAgainst="both"
              />
            </div>
            <div
              v-else
              ref="option"
              class="relative z-10 flex items-center justify-center w-full h-full p-2 rounded-lg image-option option"
              :class="{ 'no-shadow': showAnswers }"
            >
              <MediaImage
                class="w-full h-full"
                :src="option.media[0].url"
                objectFit="contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="min-h-8 md:min-h-12 w-full" />

    <div class="answers-container">
      <div
        v-for="(option, optionIndex) in options"
        :key="optionIndex"
        :ref="`option-match-${optionIndex}`"
        class="flex items-center justify-center answer-section"
      >
        <div class="border flex justify-center items-center h-full w-full border-dark-20% bg-dark-20% rounded-lg text-light-3 text-2xl">
          <div
            v-if="isReorderType"
            class="transition-all duration-150 "
            :style="styleForTextToMatchWith"
          >
            {{ isDescendingOrder ? options.length - optionIndex : optionIndex + 1 }}
          </div>
          <div
            v-else
            class="transition-all duration-150 "
            :style="styleForTextToMatchWith"
          >
            <ResizableText
              class="text-center resizable-text-height"
              :class="{ 'text-light-20%': !matches[optionIndex].text }"
              :text="matches[optionIndex].text ? matches[optionIndex].text : $i18n('Match option {$1}', [optionIndex + 1])"
              :canScrollIfOverflowAfterMinSize="false"
              :isContainerHeightHundredPercent="false"
              :fontSizeJumpsList="optionResizeFontJumps"
              dirToResizeAgainst="both"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { mapGetters } from 'vuex';

import QuestionOption from '~/models/QuestionOption';
import { getFontSizeRange } from '../../../utils/TypographyUtils';

export default {

  props: {
    currentQuestion: {
      type: Object,
      require: true,
      default: () => ({}),
    },

    showAnswers: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      areRefsLoaded: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    options() {
      let options = get(this.currentQuestion, 'structure.options', []);
      const areThereNoOptions = options.length === 0;
      if (areThereNoOptions) {
        options = [...Array(this.$constants.QuestionOptionLimits[this.currentQuestion.type].min).fill(QuestionOption({ text: '' }))];
      }
      options = options.map((option, index) => ({ ...option, optionIndex: index }));
      if (areThereNoOptions) {
        return options;
      }
      options = [...options];
      options.sort(() => Math.random() - Math.random());
      return options;
    },

    matches() {
      const matches = get(this.currentQuestion, 'structure.matches', []);
      if (matches.length === 0) {
        return [...Array(this.$constants.QuestionOptionLimits[this.currentQuestion.type].min).fill(QuestionOption({ text: '' }))];
      }
      return [...matches].map((match) => QuestionOption({ ...match, text: this.showAnswers ? `${match.text.slice(0, 17)}...` : match.text }));
    },

    isDescendingOrder() {
      return get(this.currentQuestion, 'structure.order', 'asc') === 'desc';
    },

    answer() {
      const answers = get(this.currentQuestion, 'structure.answer', []);
      if (answers.length === 0) {
        return [...Array(this.options.length).keys()];
      }

      return answers;
    },

    isMatchType() {
      return this.currentQuestion.type === this.$constants.QuestionTypes.MATCH;
    },

    isReorderType() {
      return this.currentQuestion.type === this.$constants.QuestionTypes.REORDER;
    },

    optionResizeFontJumps() {
      if (this.options.length >= 5) {
        return getFontSizeRange(24, 16);
      }

      return getFontSizeRange(28, 16);
    },

    styleForTextToMatchWith() {
      if (this.showAnswers && this.areRefsLoaded) {
        const [targetDiv] = this.$refs['option-match-0'];
        const textSpacing = this.isDesktop ? 24 : 18;
        return { transform: `translateY(-${((targetDiv?.getBoundingClientRect()?.height || 0) / 2) + textSpacing}px)` };
      }

      return { transform: 'translateY(0%)' };
    },
  },

  mounted() {
    this.areRefsLoaded = true;
  },

  methods: {
    isOptionsForText(option) {
      return isEmpty(option.media);
    },

    getMediaForOption(option) {
      return option.media && option.media[0];
    },

    translateToCorrectPosition(optionIndex) {
      if (!this.showAnswers || !this.areRefsLoaded) {
        return { transform: 'translate(0)' };
      }

      const answerIndex = this.answer.indexOf(optionIndex);

      const [optionDiv] = this.$refs[`option-${optionIndex}`];
      const [targetDiv] = this.$refs[`option-match-${answerIndex}`];

      const xCoordinateOfOption = optionDiv?.getBoundingClientRect().x;
      const xCoordinateOfMatch = targetDiv?.getBoundingClientRect().x;

      const translateX = xCoordinateOfMatch - xCoordinateOfOption;

      return { transform: `translate( ${translateX}px, calc(100% + 48px) )` };
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

      &:not(.no-shadow):hover {
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), $i;
      }
    }
}

.image-option {
  background: $imageOptionBGColor;
}

.reorder-match-container, .answers-container {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  grid-template-rows: 100%;
  gap: 8px;
  height: calc(50% - 24px);
}

.reorder-match {
  height: calc(100% - 12px);
}

.correct-option {
  position: relative;
  background: $game-correct-color;
}

.check-mark {
  background: $game-correct-color;
}
</style>

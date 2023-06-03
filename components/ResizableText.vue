<template>
  <div
    :id="textType"
    ref="resizableText"
    class="resizable-text"
    :class="[{
      'should-scroll': shouldScroll,
      'should-hide-scroll': overflowingAfterMinSize,
      'height-auto': makeContainerHeightAuto,
    }, containerClassesToApply]"
    :style="p_fontSizeOverride"
  >
    <div
      :class="getClasses()"
      :style="textStyles"
      v-html="getHtmlToRender"
    />
  </div>
</template>

<script>
import countBy from 'lodash/countBy';
import isNumber from 'lodash/isNumber';

import { canFontSizeBeUsed } from '~/utils/TypographyUtils';
import { replaceKatexElementsWithHTML } from '~/utils/QuizUtils';
import katex from 'katex';

const unitsAllowed = ['px', 'rem'];

export default {

  props: {
    text: {
      type: String,
      required: true,
    },

    fontSizeJumpsList: {
      type: Array,
      required: true,
      validator: (val) => countBy(val, isNumber).true === val.length,
    },

    fontSizeUnit: {
      type: String,
      default: 'px',
      validator: (val) => (unitsAllowed).includes(val),
    },

    classesToApply: {
      type: String,
      default: '',
    },

    containerClassesToApply: {
      type: String,
      default: '',
    },

    textType: {
      type: String,
      default: '',
    },

    dirToResizeAgainst: {
      type: String,
      default: 'vertical',
      validator: (val) => (['none', 'vertical', 'horizontal', 'both']).includes(val),
    },

    canScrollIfOverflowAfterMinSize: {
      type: Boolean,
      default: false,
    },

    fontSizeOverride: {
      type: String,
      default: '',
    },

    shouldHighlightReadAloud: {
      type: Boolean,
      default: false,
    },

    isContainerHeightHundredPercent: {
      type: Boolean,
      default: true,
    },

    textStyles: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['onFinalSizeJump'],

  data() {
    return {
      // keeping katex instance here
      katex: null,
      shouldScroll: false,
      overflowingAfterMinSize: false,
      makeContainerHeightAuto: false,
      fontSizeJumps: [],
    };
  },

  computed: {
    hasMath() {
      return (this.text.toLowerCase().includes('<katex'));
    },

    getHtmlToRender() {
      if (this.hasMath) {
        return this.katex ? replaceKatexElementsWithHTML(this.text, this.katex) : '';
      }

      return this.text;
    },

    p_fontSizeOverride() {
      if (this.fontSizeOverride && canFontSizeBeUsed(this.fontSizeOverride)) {
        return `font-size: ${this.fontSizeOverride}`;
      }

      return '';
    },
  },

  watch: {
    canScrollIfOverflowAfterMinSize(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.resetScrollBehavior();
        setTimeout(() => {
          this.initializeFontSizeCalc();
        }, 100);
      }
    },
  },

  async created() {
    this.katex = katex;
  },

  mounted() {
    this.fontSizeJumps = this.fontSizeJumpsList.map((val) => `${val}${this.fontSizeUnit}`);
    this.initializeFontSizeCalc();
  },

  methods: {
    resetScrollBehavior() {
      this.shouldScroll = false;
      this.overflowingAfterMinSize = false;
      this.makeContainerHeightAuto = false;
    },

    initializeFontSizeCalc() {
      const fontSizeJumps = [...this.fontSizeJumps];
      const minFontSize = fontSizeJumps[fontSizeJumps.length - 1];
      let jumpCount = 0;
      let finalFontSize = fontSizeJumps[jumpCount];

      this.$refs.resizableText.style.fontSize = fontSizeJumps[jumpCount];

      while (this.isTextOverflowing()) {
        const fontSize = parseInt(window.getComputedStyle(this.$refs.resizableText, null).getPropertyValue('font-size'), 10);
        if (fontSize > parseInt(minFontSize, 10)) {
          this.$refs.resizableText.style.fontSize = fontSizeJumps[jumpCount];
          finalFontSize = fontSizeJumps[jumpCount];
          jumpCount += 1;
        } else {
          break;
        }

        if (jumpCount === fontSizeJumps.length && this.isTextOverflowing()) {
          if (this.canScrollIfOverflowAfterMinSize) {
            this.shouldScroll = true;
          } else {
            this.overflowingAfterMinSize = true;
          }
        }
      }

      this.makeContainerHeightAuto = !this.isContainerHeightHundredPercent;

      this.emitResults(finalFontSize);
    },

    isTextOverflowing() {
      if (this.dirToResizeAgainst === 'none') {
        return false;
      }

      if (this.dirToResizeAgainst === 'vertical') {
        return (this.$refs.resizableText.scrollHeight > this.$refs.resizableText.clientHeight);
      } if (this.dirToResizeAgainst === 'horizontal') {
        return (this.$refs.resizableText.scrollWidth > this.$refs.resizableText.clientWidth);
      }
      return (
        this.$refs.resizableText.scrollHeight > this.$refs.resizableText.clientHeight
          || this.$refs.resizableText.scrollWidth > this.$refs.resizableText.clientWidth
      );
    },

    emitResults(finalFontSize) {
      this.$emit('onFinalSizeJump', finalFontSize);
    },

    getClasses() {
      const classList = ['resizable'];
      if (this.classesToApply) {
        classList.push(this.classesToApply);
      }

      if (this.shouldHighlightReadAloud) {
        classList.push('highlight-read-aloud');
      }

      return classList.join(' ');
    },
  },
};
</script>

<style lang="scss" scoped>
  .resizable-text {
    width: 100%;
    height: 100%;
    font-size: 24px;
    overflow: auto;
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;

    -webkit-user-select: text; /* Safari */
    -moz-user-select: text; /* Firefox */
    -ms-user-select: text; /* IE10+/Edge */
    user-select: text; /* Standard */

    .resizable {
      width: 100%;
      max-height: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;

      *[style] {
        text-shadow: 0 0px 4px #000;
      }
    }

    &.height-auto {
      height: auto;
      min-height: 100%;
    }

    &.should-scroll {
      overflow: auto;
      align-items: flex-start;
    }

    &.should-hide-scroll {
      overflow: hidden;
      align-items: flex-start;
    }
  }

  .highlight-read-aloud {
    background-color: rgba(255, 236, 0, 0.5);
  }
</style>

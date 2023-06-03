<template>
  <div
    ref="tooltipContainer"
    :class="['show-tt-container text', actionClass, themeClass]"
    :style="tooltipStyle"
    :tabindex="hasTextSlot ? '0' : '-1'"
  >
    <slot />

    <div
      v-if="withToolTipContentAsSlot"
      ref="tooltipContent"
      :class="['tt-content z-100', currentPositionClass, themeClass, shadowClass, sizeClass]"
      :style="tooltipContentStyle"
      @click="onTooltipContainerClick($event)"
    >
      <slot name="tool-tip-content" />
    </div>
    <div
      v-else
      ref="tooltipContent"
      :class="['tt-content z-100', currentPositionClass, themeClass, shadowClass, sizeClass]"
      :style="tooltipContentStyle"
      @click="onTooltipContainerClick($event)"
      v-html="text"
    />
  </div>
</template>

<script>

import isString from 'lodash/isString';
import { mapGetters } from 'vuex';

import { enumProps } from '~/config/Atoms';

export default {

  props: {
    showOnFocus: {
      type: Boolean,
      default: false,
    },
    showOnHover: {
      type: Boolean,
      default: false,
    },
    forceShowTooltip: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '',
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    showTool: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    tooltipSize: {
      type: String,
      default: 'md',
      validator: (val) => enumProps.Tooltip.tooltipSize.includes(val),
    },

    tooltipStyle: {
      type: Object,
      default: () => ({}),
    },

    tooltipContentStyle: {
      type: Object,
      default: () => ({}),
    },

    position: {
      type: String,
      default: 'bottom',
      validator: (value) => enumProps.Tooltip.position.includes(value),
    },

    fallbackPosition: {
      type: String,
      default: '',
      validator: (value) => enumProps.Tooltip.fallbackPosition.includes(value),
    },

    theme: {
      type: String,
      default: 'white',
      validator: (value) => enumProps.Tooltip.theme.includes(value),
    },

    applyShadow: {
      type: Boolean,
      default: false,
    },
    hasTextSlot: {
      type: Boolean,
      default: false,
    },

    withToolTipContentAsSlot: {
      type: Boolean,
      default: false,
    },

    forceShowOnMobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['tooltipClicked'],

  data() {
    return {
      showManually: true,
      currentPosition: '',
      transitionEndTimeout: null,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    actionClass() {
      if (this.shouldDisableTooltip && !this.forceShowTooltip) {
        return '';
      }

      if (this.isVisible) {
        return 'tt-default-action';
      }

      if (this.showOnFocus && this.showOnHover) {
        return 'tt-focus tt-hover';
      }

      if (this.showOnFocus) {
        return 'tt-focus';
      }

      if (this.showOnHover) {
        return 'tt-hover';
      }

      return '';
    },

    shouldDisableTooltip() {
      return this.disabled || (!this.isDesktop && !this.isThemeError && !this.forceShowOnMobile);
    },

    isThemeError() {
      return this.theme === 'error';
    },

    themeClass() {
      return `tt-theme-${this.theme}`;
    },
    shadowClass() {
      if (this.applyShadow) {
        return 'tt-apply-shadow';
      }

      return '';
    },

    currentPositionClass() {
      return `tt-pos-${this.currentPosition}`;
    },

    sizeClass() {
      return `tt-size-${this.tooltipSize}`;
    },
  },

  mounted() {
    this.currentPosition = this.position;
    this.transitionEndTimeout = setTimeout(() => {
      this.onTooltipTransitionEnd();
    }, 20000);
    this.$refs.tooltipContainer.addEventListener('transitionend', this.onTooltipTransitionEnd);
  },

  beforeUnmount() {
    this.transitionEndTimeout && clearTimeout(this.transitionEndTimeout);
    this.$refs.tooltipContainer.removeEventListener('transitionend', this.onTooltipTransitionEnd);
  },

  methods: {
    onTooltipTransitionEnd() {
      switch (this.currentPosition) {
        case 'top':
          this.setFallbackPosition(this.calculateIfNoSpaceFromTop());
          break;

        case 'right':
          this.setFallbackPosition(this.calculateIfNoSpaceFromRight());
          break;

        case 'left':
          this.setFallbackPosition(this.calculateIfNoSpaceFromLeft());
          break;

        case 'top-right':
          this.setFallbackPosition(this.calculateIfNoSpaceFromTop() || this.calculateIfNoSpaceFromRight());
          break;

        case 'top-left':
          this.setFallbackPosition(this.calculateIfNoSpaceFromTop() || this.calculateIfNoSpaceFromLeft());
          break;

        case 'bottom-right':
          this.setFallbackPosition(this.calculateIfNoSpaceFromBottom() || this.calculateIfNoSpaceFromRight());
          break;

        case 'bottom-left':
          this.setFallbackPosition(this.calculateIfNoSpaceFromBottom() || this.calculateIfNoSpaceFromLeft());
          break;

        case 'bottom':
        default:
          this.setFallbackPosition(this.calculateIfNoSpaceFromBottom());
          break;
      }
    },

    calculateIfNoSpaceFromTop() {
      const distanceFromTop = this.$refs.tooltipContainer.getBoundingClientRect().top;
      const tooltipContentHeight = this.$refs.tooltipContent.offsetHeight;

      if (distanceFromTop < tooltipContentHeight) {
        return true;
      }

      return false;
    },

    calculateIfNoSpaceFromRight() {
      const distanceToRightHTMLElement = document.documentElement.getBoundingClientRect().right;
      const distanceToRight = this.$refs.tooltipContainer.getBoundingClientRect().right;
      const distanceFromRight = distanceToRightHTMLElement - distanceToRight;
      const tooltipContentWidth = this.$refs.tooltipContent.offsetWidth;

      if (distanceFromRight < tooltipContentWidth) {
        return true;
      }

      return false;
    },

    calculateIfNoSpaceFromBottom() {
      const distanceToBottomHTMLElement = document.documentElement.getBoundingClientRect().bottom;
      const distanceToBottom = this.$refs.tooltipContainer.getBoundingClientRect().bottom;
      const distanceFromBottom = distanceToBottomHTMLElement - distanceToBottom;
      const tooltipContentHeight = this.$refs.tooltipContent.offsetHeight;

      if (distanceFromBottom < tooltipContentHeight) {
        return true;
      }

      return false;
    },

    calculateIfNoSpaceFromLeft() {
      const distanceFromLeft = this.$refs.tooltipContainer.getBoundingClientRect().left;
      const tooltipContentWidth = this.$refs.tooltipContent.offsetWidth;

      if (distanceFromLeft < tooltipContentWidth) {
        return true;
      }

      return false;
    },

    setFallbackPosition(shouldSet = false) {
      if (shouldSet && isString(this.fallbackPosition) && this.fallbackPosition !== '') {
        this.currentPosition = this.fallbackPosition;
      }
    },

    onTooltipContainerClick(event) {
      this.$emit('tooltipClicked', event);
    },

  },
};

</script>

<style lang="scss">

.show-tt-container {
  position: relative;
  display: inline-block;

  &.tt-default-action {
    .tt-content {
      visibility: visible;
      opacity: 1;
      transition-delay: 0s;
      line-height: 1.4;

      &.tt-pos-bottom {
        transform: translate(-50%, 0.5em);
      }

      &.tt-pos-left {
        transform: translate(-0.5em, -50%);
      }

      &.tt-pos-top {
        transform: translate(-50%, -0.5em);
      }

      &.tt-pos-right {
        transform: translate(0.5em, -50%);
      }

      &.tt-pos-bottom-left {
        transform: translate(-90%, 0.5em);
      }

      &.tt-pos-bottom-right {
        transform: translate(90%, 0.5em);
      }

      &.tt-pos-top-right {
        transform: translate(90%, -0.5em);
      }

      &.tt-pos-top-left {
        transform: translate(-90%, -0.5em);
      }
    }
  }

  &.tt-hover {
    &:hover {
      .tt-content {
        visibility: visible;
        opacity: 1;
        transition-delay: 0s;

        &.tt-pos-bottom {
          transform: translate(-50%, 0.5em);
        }
        &.tt-pos-left {
          transform: translate(-0.5em, -50%);
        }
        &.tt-pos-top {
          transform: translate(-50%, -0.5em);
        }
        &.tt-pos-right {
          transform: translate(0.5em, -50%);
        }

        &.tt-pos-bottom-left {
          transform: translate(-90%, 0.5em);
        }
      }
    }
  }

  &.tt-focus {
    &:focus {
      .tt-content {
        visibility: visible;
        opacity: 1;
        transition-delay: 0s;

        &.tt-pos-bottom {
          transform: translate(-50%, 0.5em);
        }
        &.tt-pos-left {
          transform: translate(-0.5em, -50%);
        }
        &.tt-pos-top {
          transform: translate(-50%, -0.5em);
        }
        &.tt-pos-right {
          transform: translate(0.5em, -50%);
        }

        &.tt-pos-bottom-left {
          transform: translate(-90%, 0.5em);
        }
      }
    }
  }

  .tt-content {
    position: absolute;
    text-align: center;
    font-weight: 500;
    border-radius: 8px;
    visibility: hidden;
    opacity: 0;
    transition: 0.2s;
    transition-delay: 0.1s;

    &.tt-apply-shadow {
      box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 10px;
    }

    &.tt-theme-error {
      background: theme('backgroundColor.red.dark');
      color: theme('textColor.light.DEFAULT');

      &.tt-pos-left::before {
        border-left-color: theme('backgroundColor.red.dark');
      }
      &.tt-pos-right::before {
        border-right-color: theme('backgroundColor.red.dark');
      }
      &.tt-pos-top::before,
      &.tt-pos-top-right::before,
      &.tt-pos-top-left::before {
        border-top-color: theme('backgroundColor.red.dark');
      }
      &.tt-pos-bottom::before,
      &.tt-pos-bottom-right::before,
      &.tt-pos-bottom-left::before {
        border-bottom-color: theme('backgroundColor.red.dark');
      }
    }

    &.tt-theme-error-light {
      background: theme('backgroundColor.brand.d.DEFAULT');
      color: theme('textColor.light.DEFAULT');

      &.tt-pos-left::before {
        border-left-color: theme('backgroundColor.brand.d.DEFAULT');
      }
      &.tt-pos-right::before {
        border-right-color: theme('backgroundColor.brand.d.DEFAULT');
      }
      &.tt-pos-top::before,
      &.tt-pos-top-right::before,
      &.tt-pos-top-left::before {
        border-top-color: theme('backgroundColor.brand.d.DEFAULT');
      }
      &.tt-pos-bottom::before,
      &.tt-pos-bottom-right::before,
      &.tt-pos-bottom-left::before {
        border-bottom-color: theme('backgroundColor.brand.d.DEFAULT');
      }
    }

    &.tt-theme-lilac {
      background: theme('backgroundColor.lilac.DEFAULT');
      color: theme('textColor.light.DEFAULT');

      &.tt-pos-left::before {
        border-left-color: theme('backgroundColor.lilac.DEFAULT');
      }
      &.tt-pos-right::before {
        border-right-color: theme('backgroundColor.lilac.DEFAULT');
      }
      &.tt-pos-top::before,
      &.tt-pos-top-right::before,
      &.tt-pos-top-left::before {
        border-top-color: theme('backgroundColor.lilac.DEFAULT');
      }
      &.tt-pos-bottom::before,
      &.tt-pos-bottom-right::before,
      &.tt-pos-bottom-left::before {
        border-bottom-color: theme('backgroundColor.lilac.DEFAULT');
      }
    }

    &.tt-theme-lilac-dark {
      background: theme('backgroundColor.lilac.faded');
      color: theme('textColor.dark.3');
      border-width:1px;
      border-style:solid;
      border-color: theme('backgroundColor.lilac.dark');

      &.tt-pos-left::before {
        border-left-color: theme('backgroundColor.lilac.faded');
      }
      &.tt-pos-right::before {
        border-right-color: theme('backgroundColor.lilac.faded');
      }
      &.tt-pos-top::before,
      &.tt-pos-top-right::before,
      &.tt-pos-top-left::before {
        border-top-color: theme('backgroundColor.lilac.faded');
      }
      &.tt-pos-bottom::before,
      &.tt-pos-bottom-right::before,
      &.tt-pos-bottom-left::before {
        border-bottom-color: theme('backgroundColor.lilac.faded');
      }
    }

    &.tt-theme-dark {
      background: theme('backgroundColor.dark.2');
      color: theme('textColor.light.3');

      &.tt-pos-left::before {
        border-left-color: theme('backgroundColor.dark.2');
      }
      &.tt-pos-right::before {
        border-right-color: theme('backgroundColor.dark.2');
      }
      &.tt-pos-top::before,
      &.tt-pos-top-right::before,
      &.tt-pos-top-left::before {
        border-top-color: theme('backgroundColor.dark.2');
      }
      &.tt-pos-bottom::before,
      &.tt-pos-bottom-right::before,
      &.tt-pos-bottom-left::before {
        border-bottom-color: theme('backgroundColor.dark.2');
      }
    }

    &.tt-theme-violet {
      background: theme('backgroundColor.violet.light');
      color: theme('textColor.light.3');

      &.tt-pos-left::before {
        border-left-color: theme('backgroundColor.violet.light');
      }
      &.tt-pos-right::before {
        border-right-color: theme('backgroundColor.violet.light');
      }
      &.tt-pos-top::before,
      &.tt-pos-top-right::before,
      &.tt-pos-top-left::before {
        border-top-color: theme('backgroundColor.violet.light');
      }
      &.tt-pos-bottom::before,
      &.tt-pos-bottom-right::before,
      &.tt-pos-bottom-left::before {
        border-bottom-color: theme('backgroundColor.violet.light');
      }
    }

    &.tt-theme-white {
      background: theme('backgroundColor.light.DEFAULT');
      color: theme('textColor.purple.dark');

      &.tt-pos-left::before {
        border-left-color: theme('backgroundColor.light.DEFAULT');
      }
      &.tt-pos-right::before {
        border-right-color: theme('backgroundColor.light.DEFAULT');
      }
      &.tt-pos-top::before,
      &.tt-pos-top-right::before,
      &.tt-pos-top-left::before {
        border-top-color: theme('backgroundColor.light.DEFAULT');
      }
      &.tt-pos-bottom::before,
      &.tt-pos-bottom-right::before,
      &.tt-pos-bottom-left::before {
        border-bottom-color: theme('backgroundColor.light.DEFAULT');
      }
    }

    &.tt-theme-green {
      background: theme('backgroundColor.green.dark');
      color: theme('textColor.light.DEFAULT');

      &.tt-pos-left::before {
        border-left-color: theme('backgroundColor.green.dark');
      }
      &.tt-pos-right::before {
        border-right-color: theme('backgroundColor.green.dark');
      }
      &.tt-pos-top::before,
      &.tt-pos-top-right::before,
      &.tt-pos-top-left::before {
        border-top-color: theme('backgroundColor.green.dark');
      }
      &.tt-pos-bottom::before,
      &.tt-pos-bottom-right::before,
      &.tt-pos-bottom-left::before {
        border-bottom-color: theme('backgroundColor.green.dark');
      }
    }

    &::before {
      content: "";
      position: absolute;
      border: 12px solid transparent;
      z-index: 99;
    }

    &.tt-pos-left {
      top: 50%;
      right: calc(100% + 8px);
      transform: translate(-0.8em, -50%);

      &::before {
        top: 50%;
        right: calc(0em - 16px);
        border-right-width: 0;
        transform: translate(-0.5em, -50%);
      }
    }

    &.tt-pos-right {
      top: 50%;
      left: calc(100% + 8px);
      transform: translate(0.8em, -50%);

      &::before {
        top: 50%;
        left: calc(0em - 16px);
        border-left-width: 0;
        transform: translate(0.5em, -50%);
      }
    }

    &.tt-pos-top {
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translate(-50%, -0.8em);

      &::before {
        bottom: calc(0em - 16px);
        left: 50%;
        border-bottom-width: 0;
        transform: translate(-50%, -0.5em);
      }
    }

    &.tt-pos-bottom {
      top: calc(100% + 8px);
      left: 50%;
      transform: translate(-50%, 0.8em);

      &::before {
        top: calc(0em - 16px);
        left: 50%;
        border-top-width: 0;
        transform: translate(-50%, 0.5em);
      }
    }

    &.tt-pos-top-right {
      bottom: calc(100% + 8px);
      right: 50%;
      transform: translate(90%, -0.8em);

      &::before {
        bottom: calc(0em - 16px);
        right: 90%;
        border-bottom-width: 0;
        transform: translate(50%, -0.5em);
      }
    }

    &.tt-pos-top-left {
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translate(-90%, -0.8em);

      &::before {
        bottom: calc(0em - 16px);
        left: 90%;
        border-bottom-width: 0;
        transform: translate(-50%, -0.5em);
      }
    }

    &.tt-pos-bottom-left {
      top: calc(100% + 8px);
      left: 50%;
      transform: translate(-90%, 0.8em);

      &::before {
        top: calc(0em - 16px);
        left: 90%;
        border-top-width: 0;
        transform: translate(-50%, 0.5em);
      }
    }

    &.tt-pos-bottom-right {
      top: calc(100% + 8px);
      right: 50%;
      transform: translate(90%, 0.8em);

      &::before {
        top: calc(0em - 16px);
        right: 90%;
        border-top-width: 0;
        transform: translate(50%, 0.5em);
      }
    }

    &.tt-size-sm {
      font-size: 14px;
      padding: 12px;
      min-width: 210px;
      max-width: 240px;
    }

    &.tt-size-md {
      font-size: 16px;
      padding: 12px;
      min-width: 232px;
      max-width: 272px;
    }

    &.tt-size-lg {
      font-size: 18px;
      padding: 14px;
      min-width: 260px;
      max-width: 308px;
    }

    &.tt-size-2xl {
      font-size: 24px;
      padding: 16px;
      min-width: 320px;
      max-width: 360px;
    }
  }
}

@supports (filter: drop-shadow(rgba(0, 0, 0, 0.16) 0 2px 6px)) {
  .tt-content {
    /*
          Apply drop-shadow if its available
        */
    &.tt-apply-shadow {
      box-shadow: none;
      filter: drop-shadow(rgba(0, 0, 0, 0.16) 0 2px 6px);
    }
  }
}

@keyframes tooltip-horizontal {
  to {
    transform: translate(0, -50%);
  }
}

@keyframes tooltip-vertical {
  to {
    transform: translate(-50%, 0);
  }
}
</style>

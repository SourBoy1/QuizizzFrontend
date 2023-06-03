<template>
  <div
    ref="tooltip"
    class="onboard-tooltip-wrapper fixed flex"
    :class="tooltipStyleClasses"
  >
    <div
      class="w-80 min-h-40 p-6 bg-light border border-dark-6 shadow-xl rounded-2xl flex flex-col"
      :class="containerClasses"
    >
      <template v-if="useCustomElements">
        <div
          v-for="(element, idx) in customElements"
          :key="idx"
          :class="element?.classes || ''"
        >
          <template v-if="element.type === 'text'">
            <span
              v-if="element?.html"
              v-html="element.content"
            />
            <span v-else>{{ element.content }}</span>
          </template>
          <template v-if="element.type === 'img'">
            {{ element.content }}
            <img
              aria-hidden="true"
              loading="lazy"
              :src="element.src"
              :alt="element?.alt || ''"
              :class="element?.imageClasses || ''"
            />
          </template>
        </div>
      </template>
      <template v-else>
        <div
          class="text-base text-dark-2 font-semibold"
          v-html="title"
        />
        <div
          class="text-xs text-dark-2 mt-2"
          v-html="description"
        />
      </template>

      <div class="flex justify-between items-center mt-auto">
        <div
          v-if="totalTooltipCount > 1"
          class="text-sm text-dark-4 font-bold"
        >
          {{ activeTooltipNumber }}/{{ totalTooltipCount }}
        </div>

        <Button
          type="primary"
          class="ml-auto"
          :title="btnLabel"
          size="md"
          @click.stop="handleCtaClick"
        />
      </div>
    </div>

    <div class="m-2.5">
      <div class="border border-light-50% w-10 h-10 rounded-full p-2 flex justify-center items-center">
        <span class="w-6 h-6 rounded-full bg-light" />
      </div>
    </div>
  </div>
</template>

<script>

import isEmpty from 'lodash/isEmpty';
import { isServer } from '~/utils/EnvUtils';

import i18n from '~/services/i18n';
import $store from '~/services/StoreService';

export default {

  props: {
    title: {
      type: String,
      default: 'Undefined title',
    },
    description: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: 'right',
    },
    customElements: {
      type: Array,
      default: null,
    },
    tooltipOffset: {
      type: Object,
      default: () => {},
    },
    containerClasses: {
      type: String,
      default: '',
    },
    targetElement: {
      type: isServer() ? Object : HTMLElement,
      default: null,
    },
  },

  emits: ['next'],

  data() {
    return {
      tooltipPosition: this.position,
    };
  },

  computed: {
    tooltip() {
      return this.$refs.tooltip;
    },

    activeTooltipNumber() {
      return $store().state.onboardingTooltip.counter;
    },

    totalTooltipCount() {
      return $store().state.onboardingTooltip.total;
    },

    isLastTooltipInFlow() {
      return this.activeTooltipNumber === this.totalTooltipCount;
    },

    btnLabel() {
      return this.isLastTooltipInFlow ? i18n('Got it') : i18n('Next');
    },

    tooltipStyleClasses() {
      const classList = [];

      if (this.tooltipPosition === 'left') {
        classList.push(['items-end']);
      }

      if (this.tooltipPosition === 'left-center') {
        classList.push('items-center');
      }

      if (this.tooltipPosition === 'right') {
        classList.push('flex-row-reverse items-end');
      }

      if (this.tooltipPosition === 'right-top') {
        classList.push('flex-row-reverse items-start');
      }

      if (this.tooltipPosition === 'right-center') {
        classList.push('flex-row-reverse items-center');
      }

      if (this.tooltipPosition === 'top-center') {
        classList.push('flex-col items-end');
      }

      if (this.tooltipPosition === 'bottom') {
        classList.push('flex-col-reverse items-end');
      }

      if (this.tooltipPosition === 'bottom-center') {
        classList.push('flex-col-reverse items-center');
      }

      return classList;
    },

    useCustomElements() {
      return !isEmpty(this.customElements);
    },
  },

  methods: {
    show() {
      if (!this.targetElement) {
        return;
      }

      this.highlightTargetElement();
      this.positionTooltip();
      this.stopScrolling();
    },

    hide() {
      this.unhighlightTargetElement();
      this.enableScrolling();
    },

    highlightTargetElement() {
      const rect = this.targetElement.getBoundingClientRect();

      const currentStyles = window.getComputedStyle(this.targetElement);
      this.originalElementStyles = {
        boxShadow: currentStyles.boxShadow,
        zIndex: currentStyles.zIndex,
        position: currentStyles.position,
        top: currentStyles.top,
        left: currentStyles.left,
        width: currentStyles.width,
        height: currentStyles.height,
      };

      const styles = {
        boxShadow: '0px 0px 0px 100000px rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${Math.ceil(rect.width)}px`,
        height: `${Math.ceil(rect.height)}px`,
      };

      Object.assign(this.targetElement.style, styles);
    },

    positionTooltip(fallbackTry = false) {
      const { tooltip } = this;
      if (!tooltip) {
        return;
      }

      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      const {
        width: targetWidth,
        height: targetHeight,
        top: targetTop,
        left: targetLeft,
        right: targetRight,
      } = this.targetElement.getBoundingClientRect();

      if (this.tooltipPosition === 'left') {
        if (targetLeft - tooltipWidth <= 0 && !fallbackTry) {
          this.tooltipPosition = 'right';
          this.positionTooltip(true);
        } else {
          tooltip.style.top = `${targetTop}px`;
          tooltip.style.left = `${targetLeft - tooltipWidth}px`;
        }
      } else if (this.tooltipPosition === 'right') {
        if (targetTop + tooltipHeight > windowHeight) {
          tooltip.style.bottom = '0.5rem';
        } else {
          tooltip.style.top = `${targetTop}px`;
        }

        if (targetLeft + targetWidth + tooltipWidth > windowWidth && !fallbackTry) {
          this.tooltipPosition = 'left';
          this.positionTooltip(true);
        } else {
          tooltip.style.left = `${targetLeft + targetWidth}px`;
        }
      } else if (this.tooltipPosition === 'bottom-center') {
        if (targetTop + targetHeight + tooltipHeight > windowHeight && !fallbackTry) {
          this.tooltipPosition = 'top-center';
          this.positionTooltip(true);
        } else {
          tooltip.style.top = `${targetTop + targetHeight}px`;
          tooltip.style.left = `${targetLeft + (targetWidth - tooltipWidth) / 2}px`;
        }
      } else if (this.tooltipPosition === 'top-center') {
        if (targetTop - tooltipHeight < 0 && !fallbackTry) {
          this.tooltipPosition = 'bottom-center';
          this.positionTooltip(true);
        } else {
          tooltip.style.top = `${targetTop - tooltipHeight}px`;
          tooltip.style.left = `${targetLeft + (targetWidth - tooltipWidth) / 2}px`;
        }
      } else if (this.tooltipPosition === 'left-top') {
        if (targetTop + tooltipHeight > windowHeight) {
          tooltip.style.bottom = '0.5rem';
        } else {
          tooltip.style.top = `${targetTop}px`;
        }

        if (targetLeft - tooltipWidth <= 0 && !fallbackTry) {
          this.tooltipPosition = 'right';
          this.positionTooltip(true);
        } else {
          tooltip.style.left = `${targetLeft - tooltipWidth}px`;
        }
      } else if (this.tooltipPosition === 'left-center') {
        if (targetTop + (tooltipHeight / 2) <= 0) {
          tooltip.style.top = '0.5em';
        } else if (targetTop + (tooltipHeight / 2) > windowHeight) {
          tooltip.style.bottom = '0.5em';
        } else {
          tooltip.style.top = `${targetTop - (tooltipHeight / 2) + (targetHeight / 2)}px`;
        }

        if (targetLeft - tooltipWidth <= 0 && !fallbackTry) {
          this.tooltipPosition = 'right-center';
          this.positionTooltip(true);
        } else {
          tooltip.style.left = `${targetLeft - tooltipWidth}px`;
        }
      } else if (this.tooltipPosition === 'right-top') {
        if (targetTop + tooltipHeight > windowHeight) {
          tooltip.style.bottom = '0.5rem';
        } else {
          tooltip.style.top = `${targetTop}px`;
        }
        if (targetRight + tooltipWidth > windowWidth && !fallbackTry) {
          this.tooltipPosition = 'left-top';
          this.positionTooltip(true);
        } else {
          tooltip.style.left = `${targetRight}px`;
        }
      } else if (this.tooltipPosition === 'right-center') {
        if (targetTop + (tooltipHeight / 2) <= 0) {
          tooltip.style.top = '0.5em';
        } else if (targetTop + (tooltipHeight / 2) > windowHeight) {
          tooltip.style.bottom = '0.5em';
        } else {
          tooltip.style.top = `${targetTop - (tooltipHeight / 2) + (targetHeight / 2)}px`;
        }

        if (targetRight + tooltipWidth > windowWidth && !fallbackTry) {
          this.tooltipPosition = 'left-center';
          this.positionTooltip(true);
        } else {
          tooltip.style.left = `${targetRight}px`;
        }
      }

      if (this.tooltipOffset) {
        if (this.tooltipOffset?.x) {
          tooltip.style.marginLeft = `${this.tooltipOffset.x}px`;
        }
        if (this.tooltipOffset?.y) {
          tooltip.style.marginTop = `${this.tooltipOffset.y}px`;
        }
      }
    },

    unhighlightTargetElement() {
      if (!this.targetElement) {
        return;
      }

      Object.assign(this.targetElement.style, this.originalElementStyles);
    },

    stopScrolling() {
      // .app-body-container is usually the scrollable container, preventing scroll there
      // should be sufficient. For more general handling this method can be modified to walk
      // the parent chain to find the scrollable parent
      this.scrollableParent = document.body.querySelector('#app-body-container');

      if (this.scrollableParent) {
        this.scrollableParent.classList.add('!overflow-hidden');
      }
    },

    enableScrolling() {
      if (this.scrollableParent) {
        this.scrollableParent.classList.remove('!overflow-hidden');
      }
    },

    handleCtaClick() {
      this.hide();

      if (this.isLastTooltipInFlow) {
        $store().dispatch('onboardingTooltip/clearActive');
      }

      this.$emit('next');
    },
  },
};

</script>

<style scoped>
.onboard-tooltip-wrapper {
  z-index: 9999;
}
</style>

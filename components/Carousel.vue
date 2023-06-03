<template>
  <div class="relative w-full flex items-center">
    <div
      v-if="showArrowButtons"
      class="flex items-center h-full z-10"
    >
      <slot
        name="left-button"
        :disabled="isAtLeftMostElement"
        :click="handleTranslation"
      >
        <button
          class="rounded-full bg-dark-80% w-8 h-8 flex items-center justify-center transition hover:bg-dark-60%"
          :class="[arrowStyles]"
          type="button"
          :aria-label="$i18n('left scroll')"
          :disabled="isAtLeftMostElement"
          @click="handleTranslation('left')"
        >
          <FA
            icon="far fa-chevron-left"
            class="text-light"
            :size="iconSize"
          />
        </button>
      </slot>
    </div>

    <div
      ref="carouselScroller"
      :class="['carousel-container flex overflow-auto relative transition-all', maxWidth, customClasses, defaultSlotContainerMargin]"
      @scroll="handleScroll"
    >
      <slot />
    </div>

    <div
      v-if="showArrowButtons"
      class="flex items-center h-full z-10"
    >
      <slot
        name="right-button"
        :disabled="isAtRightMostElement"
        :click="handleTranslation"
      >
        <button
          class="rounded-full bg-dark-80% w-8 h-8 flex items-center justify-center transition hover:bg-dark-60%"
          :class="[arrowStyles]"
          type="button"
          :aria-label="$i18n('right scroll')"
          @click="handleTranslation('right')"
        >
          <FA
            icon="far fa-chevron-right"
            class="text-light"
            :size="iconSize"
          />
        </button>
      </slot>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';

export default {
  props: {
    maxWidth: {
      type: String,
      default: 'max-w-full',
    },

    numberOfSlides: {
      type: Number,
      default: 0,
      require: true,
    },

    slideRef: {
      type: String,
      default: '',
    },

    autoScroll: {
      type: Boolean,
      default: false,
    },

    // in milli seconds
    autoScrollIntervalTime: {
      type: Number,
      default: 3000,
    },

    customClasses: {
      type: String,
      default: '',
    },

    arrowStyles: {
      type: String,
      default: '',
    },

    iconSize: {
      type: Number,
      default: 12,
    },

    hideIfLessElements: {
      type: Boolean,
      default: false,
    },
    defaultSlotContainerMargin: {
      type: String,
      default: 'm-2',
    },
  },
  emits: ['swipe'],

  data() {
    return {
      isAtLeftMostElement: true,
      isAtRightMostElement: false,

      autoScrollInterval: null,
      activeSlide: 1,
    };
  },

  computed: {
    showArrowButtons() {
      if (this.hideIfLessElements && this.numberOfSlides < 3) {
        return false;
      }
      return true;
    },
  },

  mounted() {
    if (this.autoScroll) {
      this.autoScrollInterval = setInterval(() => {
        if (this.isAtRightMostElement) {
          this.$refs.carouselScroller.scrollLeft = 0;
          this.activeSlide = 0;
          return;
        }
        this.handleTranslation('right');
      }, this.autoScrollIntervalTime);
    }
  },

  beforeUnmount() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  },

  methods: {
    handleTranslation(direction) {
      if (this.slideRef !== '') {
        const ref = `.${this.slideRef}:nth-child(${direction === 'left' ? this.activeSlide - 1 : this.activeSlide + 1})`;
        const slide = document.querySelector(ref);
        switch (direction) {
          case 'left':
            slide?.scrollIntoView({ inline: 'center' });
            if (this.activeSlide > 1) {
              this.activeSlide -= 1;
            }
            break;
          case 'right':
            slide?.scrollIntoView({ inline: 'center' });
            if (this.activeSlide < this.numberOfSlides) {
              this.activeSlide += 1;
            }
            break;
          default:
            break;
        }
        this.triggerSwipe();
        return;
      }

      if (direction === 'left') {
        this.$refs.carouselScroller.scrollLeft -= this.$refs.carouselScroller.clientWidth;
      } else {
        this.$refs.carouselScroller.scrollLeft += this.$refs.carouselScroller.clientWidth;
      }
    },

    scrollToSlide(index) {
      this.activeSlide = index;
      const slides = document.querySelectorAll(`.${this.slideRef}`);

      slides[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      this.triggerSwipe();
    },

    triggerSwipe() {
      this.$emit('swipe', this.activeSlide - 1);
    },

    handleScroll: debounce(function handleScroll(ev) {
      this.isAtLeftMostElement = ev.target.scrollLeft < 10;
      this.isAtRightMostElement = ev.target.scrollLeft + ev.target.clientWidth >= ev.target.scrollWidth - 50;
    }, 250),
    transitionToSlide(index) {
      this.$refs.carouselScroller.scrollLeft = index * this.$refs.carouselScroller.clientWidth;
    },
  },

};
</script>

<style lang="scss">
.carousel-container {
  scroll-behavior: smooth;
}
</style>

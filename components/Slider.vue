<template>
  <div class="slider">
    <div
      ref="track"
      :class="['slide-inner relative rounded-sm', trackClasses, trackPropClasses]"
    >
      <div
        :class="['slide-thumb bg-light-3 rounded-full w-3 h-3 absolute select-none -left-0.5 -mt-1.5', thumbClasses]"
        :style="thumbStyle"
        @mousedown="handleThumbMouseDown"
      />
    </div>
  </div>
</template>

<script>
import clamp from 'lodash/clamp';

import Constants from '~/config/Constants.js';

export default {
  props: {
    start: {
      type: Number,
      default: 0,
    },
    end: {
      type: Number,
      default: 100,
    },
    initialValue: {
      type: Number,
      default: 0,
    },
    orientation: {
      type: String,
      default: Constants.SliderOrientation.HORIZONTAL,
    },
    trackClasses: {
      type: String,
      default: 'bg-dark-50%',
    },
    thumbClasses: {
      type: String,
      default: 'bg-light-3',
    },
  },
  emits: ['change'],

  data() {
    return {
      pageX: 0,
      pageY: 0,
      dragging: false,
      trackRect: {},
      prevValue: this.initialValue,
      value: this.initialValue,
    };
  },

  computed: {
    trackPropClasses() {
      if (this.orientation === this.$constants.SliderOrientation.HORIZONTAL) {
        return 'h-2 w-full';
      }
      return 'w-2 h-full';
    },

    thumbStyle() {
      if (this.orientation === this.$constants.SliderOrientation.HORIZONTAL) {
        return '';
      }
      return `top: ${((this.value - this.start) / (this.end - this.start)) * 100}%`;
    },
  },

  mounted() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('keydown', this.handleKeyDown);
    this.trackRect = this.$refs.track.getBoundingClientRect();
  },

  unmounted() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('keydown', this.handleKeyDown);
  },

  methods: {
    handleThumbMouseDown(ev) {
      this.pageX = ev.pageX;
      this.pageY = ev.pageY;
      this.dragging = true;
    },

    handleMouseMove(ev) {
      if (!this.dragging) { return; }
      if (this.orientation === this.$constants.SliderOrientation.HORIZONTAL) {
        // TODO: Ameen
      } else {
        const diffY = ev.pageY - this.pageY;
        const trackHeight = this.trackRect.height;
        const unit = trackHeight / (this.end - this.start + 1);
        this.value = Math.round(this.prevValue + diffY / unit);
        this.value = clamp(this.value, this.start, this.end);
      }
    },

    handleMouseUp() {
      this.dragging = false;
      this.prevValue = this.value;
      this.$emit('change', this.value);
    },

    setValue(value) {
      this.prevValue = value;
      this.value = value;
    },

    handleKeyDown(ev) {
      if (ev.key) {
        if (ev.key === 'ArrowDown' && this.value < 30) {
          this.prevValue = this.value;
          this.value += 1;
          return;
        }
        if (ev.key === 'ArrowUp' && this.value > 1) {
          this.prevValue = this.value;
          this.value -= 1;
        }
      }
    },
  },
};
</script>

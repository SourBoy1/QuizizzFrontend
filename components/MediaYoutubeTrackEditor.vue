<template>
  <div
    class="readjust w-full overflow-auto"
    :class="[trackZoomed ? 'readjust-width' : '']"
  >
    <div
      ref="container"
      :class="trackZoomed ? '' : 'w-full'"
      :style="trackZoomed ? `width: ${videoDuration}px` : ''"
    >
      <div class="bg-dark-10% w-full h-8 rounded relative">
        <div
          :class="[
            'h-8 rounded border-2 absolute',
            hasVideoLoaded
              ? 'border-lilac bg-lilac-faded'
              : 'border-dark-5 bg-light-2',
          ]"
          :style="`left: ${leftPercent}%; right: ${rightPercent}%`"
        >
          <div
            :class="[
              'handle left',
              hasVideoLoaded ? 'bg-lilac' : 'bg-dark-5',
            ]"
            @mousedown="handleDragLeft"
          >
            <div
              v-if="draggingLeft"
              class="text-tn px-1 py-0.5 bg-dark-1 text-light-3 absolute left-1/2 transform -translate-x-1/2 rounded-sm -translate-y-4 select-none"
            >
              {{ leftPercentLabel }}
            </div>
          </div>
          <div
            :class="[
              'handle right',
              hasVideoLoaded ? 'bg-lilac' : 'bg-dark-5',
            ]"
            @mousedown="handleDragRight"
          >
            <div
              v-if="draggingRight"
              class="text-tn px-1 py-0.5 bg-dark-1 text-light-3 absolute left-1/2 transform -translate-x-1/2 rounded-sm -translate-y-4 select-none"
            >
              {{ rightPercentLabel }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="hasVideoLoaded"
        class="mt-2"
      >
        <div
          v-if="trackZoomed"
          class="flex w-full relative h-4"
        >
          <div
            v-for="i in numLabelsAfterZoom"
            :key="i"
            class="text-xs text-dark-4 font-semibold absolute"
            :style="`left: ${(i - 1) * 120}px`"
          >
            {{ zoomedLabel((i - 1) * 120) }}
          </div>
        </div>
        <div
          v-else
          class="flex w-full relative justify-between"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="text-xs text-dark-4 font-semibold"
          >
            {{ labelFor((i - 1) * 0.333) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import QLogger from '~/services/QLogger';
export default {
  props: {
    zoomed: {
      type: Boolean,
      default: false,
    },

    videoStartTime: {
      type: Number,
      default: 0,
    },

    videoEndTime: {
      type: Number,
      default: 0,
    },

    videoDuration: {
      type: Number,
      default: 0,
    },

    hasVideoLoaded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onChange'],

  data() {
    return {
      leftPercent: 0,
      rightPercent: 0,
      draggingLeft: false,
      draggingRight: false,
      startPageX: 0,
      trackZoomed: false,
    };
  },

  computed: {
    numLabelsAfterZoom() {
      if (!this.videoDuration) {
        return 0;
      }

      return Math.floor(this.videoDuration / 120) + 1;
    },

    leftPercentLabel() {
      if (!this.leftPercent) {
        return 0;
      }

      return this.$stringUtils.humanizeSeconds(this.leftPercent * this.videoDuration / 100);
    },

    rightPercentLabel() {
      if (!this.rightPercent) {
        return 0;
      }

      return this.$stringUtils.humanizeSeconds((1 - this.rightPercent / 100) * this.videoDuration);
    },
  },

  watch: {
    hasVideoLoaded(newVal) {
      if (newVal) {
        this.update();
      }
    },

    videoDuration() {
      this.update();
    },

    videoStartTime() {
      this.update();
    },

    videoEndTime() {
      this.update();
    },

    zoomed(val) {
      if (val) {
        if (this.$refs.container && this.$refs.container.clientWidth > this.videoDuration) {
          this.trackZoomed = false;
        } else {
          this.trackZoomed = true;
        }
      } else {
        this.trackZoomed = false;
      }
    },
  },

  mounted() {
    this.update();

    if (this.$refs.container && this.$refs.container.clientWidth > this.videoDuration) {
      this.trackZoomed = false;
    }
  },

  methods: {
    update() {
      this.leftPercent = this.videoStartTime / this.videoDuration * 100;
      this.rightPercent = 100 - this.videoEndTime / this.videoDuration * 100;
    },

    handleDragLeft(ev) {
      if (!this.hasVideoLoaded || this.dragginRight) {
        return;
      }
      this.draggingLeft = true;
      this.startPageX = ev.pageX;
      this.handleDrag();
    },

    handleDragRight(ev) {
      if (!this.hasVideoLoaded || this.draggingLeft) {
        return;
      }
      this.draggingRight = true;
      this.startPageX = ev.pageX;
      this.handleDrag();
    },

    handleMouseMove(ev) {
      const diffX = ev.pageX - this.startPageX;
      const trackWidth = this.trackZoomed ? this.videoDuration : this.$refs.container.clientWidth;
      const percentDiff = (diffX / trackWidth) * 100;
      const cutoffPercent = this.getCutOffPercent(trackWidth);

      if (this.draggingLeft) {
        if (diffX > 0) {
          if (this.leftPercent + cutoffPercent >= 100 - this.rightPercent) {
            this.leftPercent = 100 - this.rightPercent - cutoffPercent;
            ev.preventDefault();
            return false;
          }
        }

        this.leftPercent += percentDiff;

        if (this.leftPercent < 0) {
          this.leftPercent = 0;
        }
        if (this.leftPercent > 100) {
          this.leftPercent = 100;
        }
      } else if (this.draggingRight) {
        if (diffX < 0) {
          if (this.leftPercent + cutoffPercent >= 100 - this.rightPercent) {
            this.rightPercent = 100 - this.leftPercent - cutoffPercent;
            ev.preventDefault();
            return false;
          }
        }

        this.rightPercent -= percentDiff;
        if (this.rightPercent < 0) {
          this.rightPercent = 0;
        }
        if (this.rightPercent > 100) {
          this.rightPercent = 100;
        }
      }
      this.startPageX = ev.pageX;
    },

    handleMouseUp() {
      window.document.documentElement.removeEventListener(
        'mousemove',
        this.handleMouseMove,
      );
      window.document.documentElement.removeEventListener(
        'mouseup',
        this.handleMouseUp,
      );

      this.draggingLeft = false;
      this.draggingRight = false;
      this.startPageX = 0;

      const startTime = (this.leftPercent / 100) * this.videoDuration;
      const endTime = ((100 - this.rightPercent) / 100) * this.videoDuration;

      this.$emit('onChange', {
        startTime,
        endTime,
      });
    },

    handleDrag() {
      window.document.documentElement.addEventListener(
        'mousemove',
        this.handleMouseMove,
      );
      window.document.documentElement.addEventListener(
        'mouseup',
        this.handleMouseUp,
      );
    },

    zoomedLabel(secs) {
      return this.$stringUtils.humanizeSeconds(secs);
    },

    labelFor(percentSeconds) {
      const secs = percentSeconds * this.videoDuration;
      return this.$stringUtils.humanizeSeconds(secs);
    },

    getCutOffPercent(total) {
      if (total < 60 * 10) { return 6; }
      if (total < 60 * 20) { return 3; }
      if (total < 60 * 40) { return 2; }
      return 1;
    },
  },
};
</script>

<style scoped lang="scss">
.readjust {
  padding: 12px 24px;
  margin: -12px -24px;
  width: calc(100% + 48px);
}

.readjust-width {
  max-width: 108%;

}

.handle {
  width: 10px;
  height: 100%;
  position: absolute;
  top: 0px;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &.left {
    left: -2px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &.right {
    right: -2px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &:before {
    position: absolute;
    content: ' ';
    width: 1px;
    height: 16px;
    background: theme('backgroundColor.light.3');
    border-radius: 4px;
    top: 50%;
    transform: translateY(-50%);
    left: 3px;
  }

  &:after {
    position: absolute;
    content: ' ';
    width: 1px;
    height: 16px;
    background: theme('backgroundColor.light.3');
    border-radius: 4px;
    top: 50%;
    transform: translateY(-50%);
    right: 3px;
  }
}
</style>

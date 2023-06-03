<template>
  <div
    ref="animationElement"
    class="pointer-events-none w-full h-full"
  />
</template>

<script>
import $lottie from '~/services/LottieService';

export default {
  props: {
    loop: {
      type: Boolean,
      default: false,
    },
    /**
     * true -> plays the full animation automatically
     * false -> plays the animation according to the `percent` value
     */
    autoplay: {
      type: Boolean,
      default: true,
    },
    src: {
      type: String,
      default: 'https://cf.quizizz.com/animations/lottie/charging_robot.json',
    },
    percent: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      isFrame: true,
      totalFrames: 0,
    };
  },

  computed: {
    completionFrame() {
      return this.percent * this.totalFrames / 100;
    },

    segmentToPlay() {
      return [this.segmentStartFrame, this.completionFrame];
    },
  },

  watch: {
    percent() {
      if (!this.autoplay) {
        this.playSegment();
      }
    },
  },

  async created() {
    this.lottie = await $lottie();
    this.loadAnimation();
    this.segmentStartFrame = 0;
  },

  beforeUnmount() {
    this.animation.removeEventListener('DOMLoaded', this.initAnimation);
  },

  methods: {
    loadAnimation() {
      const config = {
        container: this.$refs.animationElement, // the dom element that will contain the animation
        renderer: 'svg',
        loop: this.loop,
        autoplay: this.autoplay,
        path: this.src, // the path to the animation json
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
        },
      };

      this.animation = this.lottie.loadAnimation(config);

      this.animation.addEventListener('DOMLoaded', this.initAnimation);
    },

    initAnimation() {
      this.totalFrames = this.animation.totalFrames;

      if (!this.autoplay) {
        this.playSegment();
      }
    },

    playSegment() {
      const { segmentToPlay } = this;

      if (segmentToPlay[0] !== segmentToPlay[1]) {
        this.animation.playSegments(this.segmentToPlay, this.isFrame);
        this.segmentStartFrame = segmentToPlay[1];
      }
    },
  },
};
</script>

<style></style>

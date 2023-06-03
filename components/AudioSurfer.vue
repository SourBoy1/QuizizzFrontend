<template>
  <div class="w-full h-full">
    <div
      ref="wavesurferRoot"
      class="w-full h-full"
    />
    <div
      class="text-xs text-dark-4 absolute w-16 h-4 bottom-4 left-0 right-0 m-auto"
    >
      {{ secDisplay }}/{{ duration }}
    </div>
  </div>
</template>

<script>
import { isServer } from '~/utils/EnvUtils';

export default {
  props: {
    blob: {
      type: (isServer() ? Object : Blob),
      default: null,
    },
  },

  data() {
    return {
      wavesurfer: null,
      secs: 0,
      isPlaying: false,
      timer: null,
    };
  },

  computed: {
    secDisplay() {
      return this.$stringUtils.humanizeSeconds(this.secs);
    },
    duration() {
      const duration = this.wavesurfer
        ? Math.round(this.wavesurfer.getDuration())
        : 0;
      return this.$stringUtils.humanizeSeconds(duration);
    },
  },

  async mounted() {
    // added wavesurferpackage as plugin, with mode as client. Checkout plugins/clientSideplugins.js
    const waveSurferPackage = (await import('wavesurfer.js')).default;
    this.wavesurfer = waveSurferPackage.create({
      container: this.$refs.wavesurferRoot,
      barWidth: 4,
      barGap: 2,
      waveColor: '#b9b9be',
      progressColor: '#8854c0',
      cursorColor: '#8854c0',
      height: 200,
    });

    this.wavesurfer.loadBlob(this.blob);

    this.wavesurfer.on('finish', () => {
      this.isPlaying = false;
    });
  },

  methods: {
    togglePlayPause() {
      if (this.isPlaying) {
        this.pause();
        this.isPlaying = false;
      } else {
        this.play();
        this.isPlaying = true;
      }
    },

    play() {
      this.wavesurfer.play();
      this.startTimer();
    },
    pause() {
      this.wavesurfer.pause();
      this.stopTimer();
    },
    stop() {
      this.wavesurfer.stop();
      this.stopTimer();
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.secs = Math.round(this.wavesurfer.getCurrentTime());
      }, 100);
    },

    stopTimer() {
      clearInterval(this.timer);
      this.timer = null;
    },
  },
};
</script>

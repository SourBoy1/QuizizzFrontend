<template>
  <div
    class="relative rounded-full flex justify-center items-center shadow-xl border border-dark-20%"
    :style="containerStyles"
    @focusout="pauseAudio"
  >
    <audio
      ref="audio"
      :src="src"
      @timeupdate="updateTime"
      @ended="handleEnded"
    />
    <canvas
      ref="canvas"
      class="absolute transform -rotate-90"
      :width="audioCanvasSize"
      :height="audioCanvasSize"
    />
    <button
      class="absolute bg-light-3 text-dark-2 rounded-full focus:outline-none focus:ring-1 focus:ring-lilac"
      :style="buttonStyles"
      @click="toggle"
    >
      <FA
        :icon="`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`"
        :size="iconSize"
        :style="iconStyles"
      />
    </button>

    <div
      v-if="canDelete"
      class="absolute top-0 right-0"
    >
      <Button
        licon="fas fa-close"
        size="xs"
        type="white"
        rounded="full"
        :aria-label="$i18n('Delete audio')"
        @click="$emit('delete')"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 200,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['delete'],

  data() {
    return {
      isPlaying: false,
    };
  },

  computed: {
    audioCanvasSize() {
      if (this.size > 200) {
        return 200;
      }

      if (this.size < 40) {
        return 40;
      }

      return this.size;
    },

    containerStyles() {
      const styles = {};

      styles.width = `${this.audioCanvasSize}px`;
      styles.height = `${this.audioCanvasSize}px`;

      return styles;
    },

    buttonStyles() {
      const ratio = 0.8;
      const size = this.audioCanvasSize * ratio;

      const styles = {};

      styles.width = `${size}px`;
      styles.height = `${size}px`;

      return styles;
    },

    iconSize() {
      const ratio = 0.34;
      const size = this.audioCanvasSize * ratio;

      return Math.floor(size);
    },

    iconStyles() {
      const ratio = 0.06;
      const margin = this.audioCanvasSize * ratio;
      const styles = {};

      if (!this.isPlaying) {
        styles.marginLeft = `${margin}px`;
      }

      return styles;
    },
  },

  watch: {
    audioCanvasSize() {
      this.$nextTick(() => {
        this.draw(0);
      });
    },
  },

  mounted() {
    this.draw(0);
  },

  methods: {
    draw(percent) {
      const { canvas } = this.$refs;
      const ctx = canvas.getContext('2d');
      const radius = this.audioCanvasSize / 2;

      ctx.clearRect(0, 0, this.audioCanvasSize, this.audioCanvasSize);

      // Back
      ctx.fillStyle = '#6D6D6D';
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, 2 * Math.PI, false);
      ctx.fill();

      // Fill
      ctx.fillStyle = '#00a06a';
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, 360 * percent * 0.0174533, false);
      ctx.lineTo(radius, radius);
      ctx.fill();
    },

    toggle(ev) {
      ev.stopPropagation();

      if (this.isPlaying) {
        this.$refs.audio.pause();
        this.isPlaying = false;
      } else {
        this.$refs.audio.play();
        this.isPlaying = true;
      }
    },

    updateTime() {
      const { audio } = this.$refs;
      if (!audio) {
        return;
      }
      const percent = audio.currentTime / audio.duration;
      this.draw(percent);
    },

    handleEnded() {
      this.draw(0);
      this.isPlaying = false;
    },
    pauseAudio(ev) {
      if (this.$refs.audio) {
        this.$refs.audio.pause();
        this.isPlaying = false;
      }
    },
  },
};
</script>

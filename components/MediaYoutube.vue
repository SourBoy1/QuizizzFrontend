<template>
  <div
    ref="videoContainer"
    v-click-outside="() => pauseVideo()"
    class="media-youtube w-full h-full overflow-hidden"
  >
    <div
      :id="`yt-id-${videoId}`"
      ref="iframeContainer"
    />
    <div
      v-if="isLoading"
      class="loading absolute w-full h-full inset-0 flex justify-center items-center animate-spin"
    >
      <div>
        <FA
          icon="far fa-sync"
          :size="60"
        />
      </div>
    </div>
  </div>
</template>

<script>
import QLogger from '~/services/QLogger';

export default {
  props: {
    url: {
      type: String,
      default: '',
    },
    videoId: {
      type: String,
      default: '',
    },
    start: {
      type: Number,
      default: 0,
    },
    end: {
      type: Number,
      default: 0,
    },
  },
  emits: ['ready', 'ended', 'playing', 'paused'],

  data() {
    return {
      isLoading: true,
      ytPlayer: null,
      duration: 0,
      startTime: this.start || 0,
      endTime: this.end || 0,
    };
  },

  watch: {
    videoId() {
      this.loadVideo();
    },
    start() {
      this.startTime = this.start;
      this.loadVideo();
    },

    end() {
      this.endTime = this.end;
      this.loadVideo();
    },
  },

  mounted() {
    this.loadVideo();
  },
  methods: {
    loadVideo() {
      if (!window.YT || !window.YT.Player) { return; }

      if (this.ytPlayer && this.ytPlayer.stopVideo) {
        this.ytPlayer.stopVideo();
      }

      if (this.ytPlayer && this.ytPlayer.destroy) {
        this.ytPlayer.destroy();
        this.ytPlayer = null;
      }

      // nocookie is required for gdpr countries, its important that students are not tracked.
      // You can override the feature flag for any particular
      const hostName = this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.ENABLE_NORMAL_YOUTUBE) ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com';

      this.ytPlayer = new window.YT.Player(this.$refs.iframeContainer, {
        videoId: this.videoId,
        host: hostName,
        width: this.$refs.videoContainer.clientWidth,
        height: this.$refs.videoContainer.clientHeight,
        playerVars: {
          autoplay: 0,
          controls: 1,
          iv_load_policy: 3,
          loop: 0,
          modestbranding: 1,
          enablejsapi: 1,
          rel: 0,
          start: Math.floor(this.startTime),
          end: Math.floor(this.endTime),
          origin: 'https://quizizz.com',
          widget_referrer: 'https://quizizz.com',
        },

        events: {
          onReady: () => {
            this.isLoading = false;
            this.duration = this.ytPlayer.getDuration();
            this.endTime = this.endTime || this.duration;
            this.$emit('ready');
          },

          onStateChange: (ev) => {
            if (ev.data === window.YT.PlayerState.ENDED) {
              this.loadVideo();
              this.$emit('ended');
            } else if (ev.data === window.YT.PlayerState.PLAYING) {
              this.$emit('playing');
            } else if (ev.data === window.YT.PlayerState.PAUSED) {
              this.$emit('paused');
            }
          },

          onError: (ev) => {
            // logging this for deubgging
            QLogger.error('Youtube player error', ev);
          },
        },
      });
    },

    resize(w, h) {
      if (this.ytPlayer) { // TODO: throwing error when print shuffle is disable
        this.ytPlayer.setSize(w, h);
      }
    },

    updateSize() {
      if (this.ytPlayer) {
        this.ytPlayer.setSize(this.$refs.videoContainer.clientWidth, this.$refs.videoContainer.scrollHeight);
      }
    },

    setStartAndEndTime(startTime, endTime) {
      this.startTime = startTime;
      this.endTime = endTime;

      this.loadVideo();
    },

    pauseVideo() {
      if (this.ytPlayer?.pauseVideo) {
        this.ytPlayer.pauseVideo();
      }
    },
  },
};
</script>

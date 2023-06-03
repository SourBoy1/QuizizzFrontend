<template>
  <div
    ref="mediaTileContainer"
    :class="[containerClasses, 'bg-light-1 flex items-center justify-center shrink-0']"
  >
    <div
      v-if="isImageType && !isLoading && !shouldShowMediaPreview"
      class="flex items-center w-full h-full image-preview"
      :class="{
        'cursor-zoom-in': shouldShowImagePreviewOnClick,
      }"
      @click.stop="showPreview"
    >
      <VImage
        v-if="shouldAllowImagePreview"
        :options="{ fitClass: 'object-contain' }"
        :imgObj="{ src: getImageUrl(src), error: 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png' }"
        containerClasses="w-full h-full"
      />
      <QuizImageEmptyState
        v-else
        :type="emptyStateType"
      />
      <div
        v-if="shouldShowImagePreviewOnClick"
        class="image-preview__border"
      />
    </div>
    <portal
      v-if="previewImage"
      to="media-preview"
    >
      <div
        class="media-preview-container cursor-zoom-out h-screen w-screen flex justify-center bg-dark-80% items-center fixed z-9999 px-10 top-0 left-0"
        @click.stop="closePreview"
      >
        <button
          type="button"
          class="close-btn absolute p-1 leading-none w-8 h-8 inline-flex justify-center items-center cursor-pointer text-light-1 hover:bg-dark-5% rounded-full"
          :class="[size === 'sm' ? 'top-1 right-1' : 'top-5 right-5']"
          :aria-label="$i18n('Close')"
          @click.stop="closePreview"
        >
          <FA
            icon="far fa-times"
            :size="14"
          />
        </button>

        <MediaImage
          v-if="shouldAllowImagePreview"
          :src="src"
        />
      </div>
    </portal>
    <div
      v-if="isAudioType && !isLoading"
      class="flex items-center justify-center w-full h-full bg-dark-2"
    >
      <MediaAudio
        :size="audioComponentSize"
        :src="src"
        class="bg-light-20%"
      />
    </div>
    <div
      v-if="isVideoType && !isLoading && !shouldShowMediaPreview"
      :class="['w-full h-full bg-dark-2 relative', shouldViewVideoOnClick ? 'cursor-pointer' : '']"
      @click="previewVideo"
    >
      <div class="absolute transform -translate-x-1/2 -translate-y-1/2 top-2/4 left-2/4">
        <div
          :class="['absolute transform -translate-y-1/2 -translate-x-1/2 top-2/4 left-2/4 bg-light', whiteBgSize]"
        />
        <FA
          icon="fab fa-youtube"
          class="relative text-red"
          :size="videoIconFontSize"
        />
      </div>

      <div
        v-if="shouldViewVideoOnClick"
        class="absolute text-sm transform -translate-x-1/2 -translate-y-1/2 text-light bottom-px left-2/4"
      >
        <i18n>view</i18n>
      </div>
    </div>
    <div v-else-if="(isGoogleDriveVideo || isRecordedVideo) && shouldShowMediaPreview">
      <video
        ref="video"
        :key="googleDriveFileId"
        class="max-h-80"
        controls
        playsinline
        @blur="pauseVideo"
      >
        <source
          :src="videoSrc"
          :type="googleDriveFileType"
        >
      </video>
    </div>
    <MediaYoutube
      v-else-if="isVideoType && shouldShowMediaPreview"
      class="w-full h-full video-wrapper"
      :url="constructVideoUrl"
      :videoId="videoId"
      :start="videoStartTime"
      :end="videoEndTime"
    />
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { mapGetters } from 'vuex';

import { attachParamForImage } from '~/utils/ImageParamUtils.js';
import { enumProps } from '~/config/Atoms';

export default {
  props: {
    type: {
      type: String,
      default: 'image', // image, audio, video
      validator: (val) => enumProps.MediaTile.type.includes(val),
    },

    size: {
      type: String,
      default: 'sm',
      validator: (val) => enumProps.MediaTile.size.includes(val),
    },

    emptyStateType: {
      type: String,
      default: '',
    },
    customContainerClasses: {
      type: String,
      default: '',
    },
    src: {
      type: String,
      default: '',
    },
    noZoom: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: String,
      default: 'default',
      validator: (val) => enumProps.MediaTile.rounded.includes(val),
    },

    isLoading: {
      type: Boolean,
      default: false,
    },
    shouldViewVideoOnClick: {
      type: Boolean,
      default: true,
    },
    media: {
      type: Object,
      default: () => {},
    },
    shouldShowMediaPreview: {
      type: Boolean,
      default: false,
    },
    disableImagePreview: {
      type: Boolean,
      default: false,
    },
    isRecordedVideo: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      previewImage: false,
      showFallbackImage: false,
      mediaTileContainerRef: null,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),
    videoSrc() {
      if (!this.isRecordedVideo) {
        return `https://drive.google.com/uc?export=download&id=${this.googleDriveFileId}`;
      }
      return this.src;
    },

    isImageType() {
      return this.type === 'image';
    },

    isAudioType() {
      return this.type === 'audio';
    },

    isVideoType() {
      return this.type === 'video';
    },

    containerClasses() {
      let cls = '';
      if (!isEmpty(this.customContainerClasses)) {
        cls += this.customContainerClasses;
        return cls;
      }

      if (!this.shouldShowMediaPreview) {
        switch (this.size) {
          case 'md':
            cls += 'w-26 h-26 ';
            break;
          case 'sm':
            cls += 'w-18 h-18 ';
            break;
          case 'tn':
            cls += 'w-12 h-12';
            break;
          default:
            cls += '';
        }
      } else {
        switch (this.size) {
          case 'md':
            cls += 'w-full h-full ';
            break;
          case 'sm':
            cls += 'w-full h-full ';
            break;
          default:
            cls += '';
        }
      }
      if (this.rounded === 'semi') {
        cls += 'rounded-lg overflow-hidden';
      } else {
        cls += 'rounded overflow-hidden';
      }

      return cls;
    },

    audioComponentSize() {
      switch (this.size) {
        case 'md':
          return 72;
        case 'sm':
          return 48;
        default:
          return 72;
      }
    },

    startTime() {
      let start = get(this.media, 'meta.start', null);

      if (start === null) {
        start = get(this.media, 'meta.startTime', 0);
      }

      return start;
    },

    endTime() {
      let end = get(this.media, 'meta.end', null);

      if (end === null) {
        end = get(this.media, 'meta.endTime', 0);
      }

      return end;
    },

    videoId() {
      return get(this.media, 'meta.videoId', '');
    },

    videoStartTime() {
      return get(this.media, 'meta.startTime', 0);
    },

    videoEndTime() {
      return get(this.media, 'meta.endTime', 0);
    },

    isGoogleDriveVideo() {
      return get(this.media, 'meta.src', '') === 'google-drive';
    },

    googleDriveFileId() {
      return get(this.media, 'video', '');
    },

    googleDriveFileType() {
      return get(this.media, 'meta.type', 'video/mp4');
    },

    videoIconFontSize() {
      switch (this.size) {
        case 'md':
          return 40;
        case 'sm':
          return 24;
        default:
          return 24;
      }
    },

    whiteBgSize() {
      switch (this.size) {
        case 'md':
          return 'w-4 h-4';
        case 'sm':
          return 'w-3 h-3';
        default:
          return 'w-3 h-3';
      }
    },

    constructVideoUrl() {
      if (isEmpty(this.videoId)) {
        return this.src;
      }
      return `https://www.youtube.com/embed/${this.videoId}?start=${this.startTime}&end=${this.endTime}&autoplay=1`;
    },

    shouldAllowImagePreview() {
      return !!this.src;
    },

    shouldShowImagePreviewOnClick() {
      return this.shouldAllowImagePreview && !this.disableImagePreview && !this.noZoom;
    },
  },

  mounted() {
    this.mediaTileContainerRef = this.$refs.mediaTileContainer;
  },

  methods: {
    previewVideo(ev) {
      ev.stopPropagation();
      window.open(this.constructVideoUrl);
    },

    isImageDimensionFlagEnabled() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.IMAGE_DIMENSIONS);
    },

    getImageUrl(url) {
      if (this.isImageDimensionFlagEnabled()) {
        const options = {
          deviceType: this.deviceProps.type,
        };

        if (this.mediaTileContainerRef) {
          options.dimToCheckAgainst = this.mediaTileContainerRef.getBoundingClientRect()?.width;
          return attachParamForImage(url, options);
        }
        return 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png';
      }
      const options = {
        deviceType: this.deviceProps.type,
      };
      if (this.mediaTileContainerRef) {
        options.dimToCheckAgainst = this.mediaTileContainerRef.getBoundingClientRect().width;
      }
      return attachParamForImage(url, options);
    },

    showPreview() {
      if (this.shouldAllowImagePreview && !this.disableImagePreview && !this.noZoom) {
        this.previewImage = true;
      }
    },

    closePreview() {
      this.previewImage = false;
    },

    pauseVideo() {
      if (this.$refs.video) {
        this.$refs.video.pause();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/colors.scss';

.image-preview {
  border-radius: inherit;
}

.image-preview:hover {
  position: relative;
  .image-preview__border {
    position: absolute;
    content: " ";
    width: 100%;
    height: 100%;
    border: 3px solid theme('colors.lilac.DEFAULT');
    border-radius: inherit;
  }
}

:deep() .video-wrapper {
    float: none;
    clear: both;
    width: 100%;
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 25px;
    height: 0;

    & iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
}
</style>

<template>
  <div>
    <YoutubeVideoSearch
      ref="ytVideoSearch"
      @onSearchStart="handleOnYoutubeSearchStart"
      @onSearchHide="hideYtVideoSearchResultsContainer"
      @youtubeLinkPasted="handleURLInput"
      @onSave="saveVideo"
      @close="$emit('close')"
      @handleFileUpload="$emit('handleFileUpload', $event)"
      @back="resetSearch"
    />

    <template v-if="!showYtVideoSearchView && videoId">
      <div
        class="bg-light-2 border border-dashed border-dark-10% relative h-50 flex justify-center items-center"
      >
        <div
          v-if="videoId"
          class="w-full h-full"
        >
          <MediaYoutube
            ref="youtube"
            :videoId="videoId"
            :start="startTime"
            :end="endTime"
            @ready="handleReady"
          />
        </div>
      </div>
      <div
        v-if="!!error"
        class="m-1 text-xs font-semibold text-red-light"
      >
        <FA
          class="mr-1"
          icon="far fa-exclamation-circle"
          :size="11"
        />
        {{ error }}
      </div>
      <div
        v-if="videoId"
        class="mt-4"
      >
        <div class="flex mb-2 text-xs font-semibold text-dark-5">
          <i18n>Start and end time</i18n>
          <div
            v-if="showZoomButtons"
            class="ml-auto"
          >
            <button
              v-tooltip.bottom="$i18n('Zoom in')"
              class="w-4 h-4 mr-1 hover:text-dark-2"
              @click="handleZoom"
            >
              <FA
                icon="far fa-search-plus"
                :size="12"
              />
            </button>
            <button
              v-tooltip.bottom="$i18n('Zoom out')"
              class="w-4 h-4 hover:text-dark-2"
              @click="handleUnzoom"
            >
              <FA
                icon="far fa-search-minus"
                :size="12"
              />
            </button>
          </div>
        </div>

        <MediaYoutubeTrackEditor
          v-if="hasVideoLoaded"
          ref="video-track-editor"
          :zoomed="isTrackZoomed"
          :videoStartTime="startTime"
          :videoEndTime="endTime"
          :videoDuration="duration"
          :hasVideoLoaded="hasVideoLoaded"
          @onChange="handleVideoTimeChange"
          @hook:mounted="handlePreviewTrackMounted"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

export default {
  props: {
    media: {
      type: Object,
      default() {
        return {
          type: 'video',
          url: '',
          meta: {
            startTime: 0,
            endTime: 0,
            videoId: '',
            duration: 0,
          },
        };
      },
    },
  },
  emits: ['close', 'handleFileUpload', 'youtubeLinkPasted', 'cleared', 'mobileMediaPick', 'uploaded', 'updatedStartEndTime', 'onYtVideoSearchAppear', 'back', 'onYtVideoSearchHide'],

  data() {
    return {
      isUploading: false,
      url: this.media.url || '',
      videoId: this.media.meta.videoId || '',
      hasVideoLoaded: false,
      isTrackZoomed: false,
      startTime: this.media.meta.startTime || 0,
      endTime: this.media.meta.endTime || 0,
      duration: this.media.meta.duration || 0,
      error: '',
      showYtVideoSearchView: false,
      showZoomButtons: true,

      editMedia: {},
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    mediaToEdit() {
      if (isEmpty(this.media?.url)) {
        return this.media;
      }

      return this.editMedia.url ? this.editMedia : this.media;
    },

  },

  watch: {
    editMedia(media) {
      if (media?.url) {
        this.url = media.url || '';
        this.videoId = media.meta.videoId || '';
        this.startTime = media.meta.startTime || 0;
        this.endTime = media.meta.endTime || 0;
        this.duration = media.meta.duration || 0;

        this.showYtVideoSearchView = false;
        this.hasVideoLoaded = true;

        const { ytVideoSearch } = this.$refs;
        if (ytVideoSearch) {
          ytVideoSearch.showResultsContainer = false;
        }
      }
    },
  },

  methods: {
    handlePreviewTrackMounted() {
      const previewTrackWidth = get(this.$refs['video-track-editor'], '$refs.container.clientWidth');
      this.showZoomButtons = previewTrackWidth < this.duration;
    },

    handleURLInput(url) {
      this.$emit('youtubeLinkPasted');
      const { query, host, baseName } = this.$urlUtils.parse(url);

      if (host === 'youtu.be') {
        this.videoId = baseName;
      } else if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
        this.videoId = query.v;
      }

      this.url = url;
      this.hasVideoLoaded = false;

      if (!this.videoId) {
        this.hasVideoLoaded = false;
        this.$emit('cleared');
        if (this.url) {
          this.error = 'Invalid youtube URL';
        } else {
          this.error = '';
        }
      }
    },

    handleReady() {
      this.duration = this.$refs.youtube.duration;
      this.startTime = this.startTime || 0;
      this.endTime = this.endTime || this.duration;
      this.hasVideoLoaded = true;

      const mediaElement = {
        url: this.url,
        meta: {
          startTime: this.startTime,
          endTime: this.endTime,
          videoId: this.videoId,
          duration: this.duration,
        },
      };

      this.saveVideo(mediaElement);
    },

    saveVideo(params) {
      const mediaElement = {
        type: 'video',
        ...params,
      };

      if (!this.isDesktop) {
        this.editMedia = mediaElement;
        this.$emit('mobileMediaPick', mediaElement);
        return;
      }

      this.$emit('uploaded', mediaElement);
    },

    handleVideoTimeChange({ startTime, endTime }) {
      this.startTime = startTime;
      this.endTime = endTime;
      this.$emit('updatedStartEndTime', { startTime, endTime });
    },

    handleZoom() {
      this.isTrackZoomed = true;
    },

    handleUnzoom() {
      this.isTrackZoomed = false;
    },

    handleOnYoutubeSearchStart() {
      this.$emit('onYtVideoSearchAppear');
      this.showYtVideoSearchView = true;
    },

    resetSearch() {
      this.hideYtVideoSearchResultsContainer();
      this.$emit('back');
    },

    hideYtVideoSearchResultsContainer() {
      this.showYtVideoSearchView = false;
      this.$emit('onYtVideoSearchHide');
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

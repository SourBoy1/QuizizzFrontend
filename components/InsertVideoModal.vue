<template>
  <Modal
    :icon="isYTVideoSearchMode ? 'fab fa-youtube' : 'far fa-video-plus'"
    :title="title"
    :subtitle="$i18n('Pick a .mp4, .ogg, .webm video from your Google Drive or search all of YouTube')"
    :button1="button1"
    :button2="button2"
    :size="isYTVideoSearchMode ? 'xl' : 'lg'"
    :shouldCloseOnMaskClick="true"
    :stickToBottom="isStuckToBottom"
    dismissOnOverlayClick
    @close="$emit('close')"
    @button1-click="handleCancel"
    @button2-click="handleSaveBtn"
  >
    <div :class="!isDesktop ? 'mb-4' : ''">
      <YoutubeUpload
        v-if="showYoutubeUploadModal"
        :media="media"
        @uploaded="handleUploaded"
        @mobileMediaPick="handleMobileMediaFlow"
        @cleared="handleCleared"
        @updatedStartEndTime="handleUpdateStartEndTime"
        @close="$emit('close')"
        @onYtVideoSearchAppear="handleYtVideoSearchMode(true)"
        @onYtVideoSearchHide="handleYtVideoSearchMode()"
        @youtubeLinkPasted="toggleYoutubeLinkSearch(true)"
        @handleFileUpload="handleVideoUpload($event)"
        @back="resetViewToDefault"
      />
      <div
        v-if="!isYoutubeLinkBasedVideo && !isYTVideoSearchMode && !uploadedWithDrive && !isEditForGoogleDrive && !isGoogleDriveUploadInProgress && !isEditForYouTube"
        class="pb-2 text-xs text-center"
      >
        <i18n>or</i18n>
      </div>
      <transition name="fade">
        <GoogleDriveVideoManager
          v-show="showGoogleDriveVideoManager"
          ref="driveVideoManager"
          :media="media"
          :quizId="quizId"
          @visibility="setVideoVisbility"
          @progress="handleGoogleDriveProgress"
          @input="handleGoogleDriveSelection"
          @delete="handleDriveVideoDeletion"
          @back="resetViewToDefault"
        />
      </transition>
    </div>
    <template
      v-if="shouldShowBackBtn"
      #footer-text
    >
      <Button
        class="mr-auto"
        :title="$i18n('Back')"
        size="md"
        type="other"
        @click="resetViewToDefault"
      />
    </template>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
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

    showMobileLayout: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'save'],

  data() {
    return {
      uploaded: false,
      uploadedWithDrive: false,
      isGoogleDriveUploadInProgress: false,
      visibility: null,
      isYoutubeLinkBasedVideo: false,
      mediaObj: {
        type: 'video',
        url: '',
        meta: {
          startTime: 0,
          endTime: 0,
          videoId: '',
          duration: 0,
        },
      },

      isYTVideoSearchMode: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('contentEditor', ['quizId']),

    showYoutubeUploadModal() {
      if (this.isGoogleDriveUploadInProgress) {
        return false;
      }

      return !this.uploadedWithDrive && !this.isEditForGoogleDrive;
    },

    showGoogleDriveVideoManager() {
      return (!this.isYTVideoSearchMode || this.isEditForGoogleDrive) && !this.isEditForYouTube && !this.isYoutubeLinkBasedVideo;
    },

    shouldShowBackBtn() {
      if (this.isGoogleDriveUploadInProgress) {
        return true;
      }

      return this.isOwnedBySomeoneElse || this.isPrivateVideo;
    },

    isEditForGoogleDrive() {
      return this.media?.meta?.src === 'google-drive' && this.mediaObj?.meta?.src === 'google-drive';
    },

    isEditForYouTube() {
      const media = this.media?.url ? this.media : this.mediaObj;

      return media?.meta?.src !== 'google-drive' && (media?.url || media?.meta?.videoId);
    },

    title() {
      if (this.isYTVideoSearchMode) {
        return this.$i18n('Insert a video from YouTube');
      }

      return this.$i18n('Insert a video');
    },

    button1() {
      if (this.isYTVideoSearchMode) {
        return {};
      }

      if (!this.isDesktop && this.uploadedWithDrive) {
        return {
          type: 'other',
          licon: 'fas fa-arrow-left',
          title: this.$i18n('Back'),
        };
      }

      return {
        type: 'other',
        title: this.$i18n('Cancel'),
      };
    },

    button2() {
      if (this.isYTVideoSearchMode) {
        return {};
      }
      return {
        type: 'primary',
        title: this.$i18n('Insert'),
        disabled: this.isEditForYouTube ? false : (!this.uploadedWithDrive || this.isPrivateVideo || this.isOwnedBySomeoneElse) && !this.isYoutubeLinkBasedVideo,
      };
    },

    isStuckToBottom() {
      return this.showMobileLayout && !this.isDesktop;
    },

    isOwnedBySomeoneElse() {
      return this.visibility === 'error';
    },

    isPrivateVideo() {
      return this.visibility === 'private';
    },
  },

  mounted() {
    this.mediaObj = {
      type: this.media.type || 'video',
      url: this.media.url || '',
      meta: this.media.meta || {
        startTime: get(this.media, 'meta.startTime', 0),
        endTime: get(this.media, 'meta.endTime', 0),
        videoId: get(this.media, 'meta.videoId', ''),
        duration: get(this.media, 'meta.duration', 0),
      },
    };
  },

  methods: {
    handleMobileMediaFlow(media) {
      this.uploaded = true;
      this.mediaObj = media;

      if (this.isYTVideoSearchMode) {
        this.mediaObj.isYTVideoSearchMode = true;
      }

      this.isYTVideoSearchMode = false;
    },

    handleVideoUpload(event) {
      this.$refs.driveVideoManager?.handleFileUpload(event);
    },

    handleUploaded(media) {
      this.uploaded = true;
      this.mediaObj = media;

      if (this.isYTVideoSearchMode) {
        this.mediaObj.isYTVideoSearchMode = true;
        this.$emit('save', this.mediaObj);
      }
    },

    handleCleared() {
      this.uploaded = false;
      this.mediaObj = {
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

    handleSaveBtn() {
      this.$emit('save', this.mediaObj);
    },

    toggleYoutubeLinkSearch(isPasted = false) {
      this.isYoutubeLinkBasedVideo = isPasted;
    },

    handleUpdateStartEndTime({ startTime, endTime }) {
      this.mediaObj.startTime = startTime;
      this.mediaObj.endTime = endTime;
    },

    handleYtVideoSearchMode(searchActive) {
      this.isYTVideoSearchMode = searchActive;
    },

    handleGoogleDriveSelection(mediaObj) {
      this.uploadedWithDrive = true;
      this.mediaObj = mediaObj;
    },

    handleGoogleDriveProgress(isInProgress) {
      this.isGoogleDriveUploadInProgress = isInProgress;
    },

    setVideoVisbility(visiblity) {
      this.visibility = visiblity;
    },

    handleDriveVideoDeletion() {
      this.setVideoVisbility(null);
      this.uploadedWithDrive = false;
      this.isGoogleDriveUploadInProgress = false;
      this.handleCleared();
    },

    resetViewToDefault() {
      this.isYTVideoSearchMode = false;
      this.$refs.driveVideoManager?.deleteCurrentVideo();
    },

    handleCancel() {
      const deleteVideoRef = this.$refs.driveVideoManager;
      if (!this.isDesktop && this.uploadedWithDrive) {
        deleteVideoRef?.deleteCurrentVideo();
        return;
      }

      this.$emit('close');
    },
  },

};
</script>

<style style="scss" scoped>
  .fade-enter-active, .fade-leave-active {
      transition: opacity .5s;
    }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>

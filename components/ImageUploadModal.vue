<template>
  <Modal
    :icon="isDestinationMemes ? '' : 'fas fa-image'"
    :img="isDestinationMemes ? 'https://cf.quizizz.com/image/meme.png' : ''"
    :title="title"
    :subtitle="getSubtitle"
    :button1="button1"
    :button2="button2"
    dismissOnOverlayClick
    :size="isXLSizeModal ? 'xl' : 'md'"
    :shouldCloseOnMaskClick="true"
    :stickToBottom="isStuckToBottom"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="handleButton2Click"
  >
    <ImageUpload
      ref="imageUpload"
      :media="media"
      :showGoogleImageSearch="showGoogleImageSearch"
      :isPasteUrlEnabled="isPasteUrlEnabled"
      :searchTerm="searchTerm"
      :destination="destination"
      :inCropMode="inCropMode"
      :size="isDesktop ? 'lg' : 'md'"
      @onCropImageInMobile="onCropImageInMobile"
      @loadInProgress="updateLoadInProgress"
      @toggleCropMode="(val) => isInCropMode = val"
      @uploaded="handleUploaded"
      @imageDeleted="handleImageDeletion"
      @handleFileUpload="handleFileUpload($event)"
      @uploadFailed="handleFailedUpload"
      @close="$emit('close')"
      @onGoogleImageSearchAppear="handleGoogleImageSearchMode(true)"
      @onGoogleImageSearchHide="handleGoogleImageSearchMode()"
      @mediaSelectedOnMobile="handleMobileMediaFlow"
    >
      <template #dropzone-placeholder>
        <slot name="dropzone-placeholder" />
      </template>
    </ImageUpload>

    <template
      v-if="googleImageSearchMode"
      #footer-text
    >
      <div class="w-full p-2" />
    </template>

    <template
      v-else
      #footer-text
    >
      <div class="w-full">
        <Button
          :title="pasteUrlButtonText"
          :licon="`far fa-${pasteUrlButtonIcon}`"
          :disabled="isLoadInProgress"
          :size="isDesktop ? 'md' : 'sm'"
          class="mr-auto"
          type="other"
          @click="pasteUrlButtonClick"
        />
      </div>
    </template>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants';
import i18n from '../services/i18n';

export default {
  emits: ['close', 'save', 'paste'],
  props: {
    media: {
      type: Object,
      default() {
        return {
          url: '',
          meta: {
            width: 0,
            height: 0,
            layout: '',
          },
        };
      },
    },

    title: {
      type: String,
      default: i18n('Insert an image or a GIF'),
    },

    subtitle: {
      type: String,
      default: '',
    },

    button2Title: {
      type: String,
      default: i18n('Save'),
    },

    showGoogleImageSearch: {
      type: Boolean,
      default: true,
    },

    searchTerm: {
      type: String,
      default: '',
    },

    showMobileLayout: {
      type: Boolean,
      default: false,
    },
    destination: {
      type: String,
      default: Constants.ImageUploadTypes.QUIZZES,
    },
    inCropMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      hasUploaded: !!this.media.url,
      mediaObj: this.media,
      isDropping: false,
      googleImageSearchMode: false,
      isPasteUrlEnabled: false,
      isLoadInProgress: false,
      isInCropMode: false,
      isInCropModeInMobile: false,
      hasUploadFailed: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'isMobile']),

    ...mapGetters('contentEditor', ['quizId']),

    getSubtitle() {
      if (this.isDesktop) {
        if (this.isPasteUrlEnabled) {
          return this.$i18n('You can paste links to GIFs too');
        }

        if (this.subtitle) {
          return this.subtitle;
        }

        return this.$i18n('You can search or upload an image.');
      }

      return null;
    },

    button1() {
      if (this.googleImageSearchMode) {
        return {};
      }

      return {
        type: 'other',
        title: this.$i18n('Cancel'),
        size: this.isDesktop ? 'md' : 'sm',
        disabled: this.isLoadInProgress,
      };
    },

    button2() {
      if (this.googleImageSearchMode) {
        return {};
      }

      return {
        type: 'primary',
        title: this.isInCropMode ? `${this.$i18n('Crop and ')}${this.button2Title}` : this.button2Title,
        disabled: (!this.hasUploaded && !this.isInCropModeInMobile) || this.isLoadInProgress || this.hasUploadFailed,
        size: this.isDesktop ? 'md' : 'sm',
        loading: this.isLoadInProgress,
      };
    },

    pasteUrlButtonText() {
      if (this.isPasteUrlEnabled) {
        return this.$i18n('Back');
      }

      return !this.isDesktop ? this.$i18n('Paste') : this.$i18n('Paste Link');
    },

    pasteUrlButtonIcon() {
      if (this.isPasteUrlEnabled) {
        return 'arrow-left';
      }

      return 'link';
    },

    isXLSizeModal() {
      return this.googleImageSearchMode || !isEmpty(this.media.url);
    },

    isStuckToBottom() {
      return this.showMobileLayout && !this.isDesktop;
    },

    isDestinationMemes() {
      return this.destination === this.$constants.ImageUploadTypes.MEMES;
    },
  },

  methods: {
    onCropImageInMobile(value) {
      this.isInCropModeInMobile = value;
    },

    handleFileUpload(event) {
      this.$refs.imageUpload?.handleInput(event);
    },

    handleUploaded(media) {
      this.hasUploaded = true;
      this.mediaObj = media;

      if (this.googleImageSearchMode) {
        this.mediaObj.isGoogleSearchMode = true;
        this.$emit('save', this.mediaObj);
        return;
      }

      /** If is in crop mode, then we upload the cropped image on clicking save and insert image here */
      if (this.isInCropMode || this.isInCropModeInMobile) {
        this.$emit('save', this.mediaObj);
      }
    },

    handleImageDeletion() {
      this.mediaObj = {};
    },

    handleFailedUpload() {
      this.hasUploadFailed = false;
    },

    updateLoadInProgress(isLoadInProgress) {
      this.isLoadInProgress = isLoadInProgress;
    },

    async handleButton2Click() {
      /** If is in crop mode, then we upload the cropped image and save on  handleUploaded */
      if (this.isInCropMode) {
        if (isEmpty(this.$refs.imageUpload)) { return; }
        await this.$refs.imageUpload.handleCropImage();

        return;
      }

      if (this.googleImageSearchMode || this.isInCropModeInMobile) {
        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.IMPORT_SPREADSHEET_BTN);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
            buttonType: 'info and settings section button',
          },
        );
      }

      /** If is in crop mode on mobile, then we upload the image selected during google search and save on handleUploaded */
      if (this.isInCropModeInMobile) {
        const imageUploadRef = this.$refs.imageUpload;

        if (isEmpty(this.$refs.imageUpload)) { return; }

        imageUploadRef.uploadGoogleSearchImageToServer(imageUploadRef.url);

        return;
      }

      this.$emit('save', this.mediaObj);
    },

    pasteUrlButtonClick() {
      this.isPasteUrlEnabled = !this.isPasteUrlEnabled;
      if (this.isPasteUrlEnabled) {
        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.PASTE_BUTTON_CLICKED);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
          },
        );
      }
      this.$emit('paste', this.isPasteUrlEnabled);
    },

    handleGoogleImageSearchMode(searchActive) {
      this.googleImageSearchMode = searchActive;
    },

    handleMobileMediaFlow(media) {
      if (this.googleImageSearchMode) {
        media.isGoogleSearchMode = true;
      }
      this.handleGoogleImageSearchMode(false);
      this.mediaObj = media;
      this.hasUploaded = true;
    },
  },
};
</script>

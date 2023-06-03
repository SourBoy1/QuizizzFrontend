<template>
  <div class="pb-4">
    <GoogleImageSearch
      v-if="showGoogleImageSearch && !isPasteUrlEnabled"
      ref="googleImageSearch"
      :searchTerm="searchTerm"
      :imageType="isDestinationMemes ? $constants.EntityTypes.MEME : $constants.EntityTypes.IMAGE"
      imagePreviewWidth="524px"
      @onSearchStart="handleOnGoogleSearchStart"
      @onImageUploaded="handleGoogleImageUpload"
      @onImageSearchHide="hideGoogleImageSearchResultsContainer"
      @handleFileUpload="$emit('handleFileUpload', $event)"
      @onCropImageInMobile="onCropImageInMobile"
      @onImagePick="setMeditToEdit"
      @close="$emit('close')"
    />

    <template v-if="isPasteUrlEnabled">
      <Input
        ref="urlInput"
        inputClasses="h-8"
        class="my-2 ml-1 paste-url-input"
        :placeholder="$i18n('Enter or paste a link')"
        :value="enteredImageUrl"
        autocomplete="off"
        :button="{
          type: 'transparent',
          size: 'lg',
          licon: `fas fa-${inputIcon}`,
          liconClasses: `text-${inputIconColor} absolute top-2 right-0`,
          iconSize: 'lg',
          ariaLabel: $i18n('URL status indicatior'),
          buttonClasses: 'rounded-full h-full relative',
        }"
        @buttonClicked="onInputBtnClick"
        @input="onInputChange($event)"
      />

      <div
        v-if="urlErrorMessage"
        class="flex my-2 text-xs font-semibold text-red"
        aria-live="assertive"
      >
        <span class="w-4 h-4 flex items-center justify-center mr-0.5">
          <FA
            :size="11"
            icon="fas fa-exclamation-circle"
          />
        </span>
        <span id="name-empty-error-message">
          {{ urlErrorMessage }}
        </span>
      </div>
    </template>

    <template v-if="canShowFileUploadArea">
      <div
        class="bg-light-2 border border-dashed rounded border-dark-10% relative cursor-pointer"
        :class="sizeOfPreview"
        :style="isDropping ? 'box-shadow: 0 0 0 1000px rgba(9,9,9,0.2); z-index: 1;' : ''"
      >
        <div
          v-show="!shouldShowPreviewImage"
          class="flex flex-col items-center justify-center w-full h-full"
        >
          <input
            ref="fileInput"
            class="absolute inset-0 z-20 w-full h-full opacity-0 cursor-pointer"
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/gif"
            @input="handleInput"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
            @click="inputClicked"
          />
          <div
            class="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-b text-light-3"
          >
            <slot name="dropzone-placeholder">
              <FA
                :icon="isDropping ? 'fas fa-paperclip' : 'fas fa-image'"
                :size="28"
              />
            </slot>
          </div>
          <div
            class="flex flex-col items-center justify-center mt-4 text-xs text-center text-dark-4 w-50"
          >
            <div v-if="!isDesktop">
              <i18n>Tap here to upload an image</i18n>
            </div>
            <div v-else>
              <template v-if="isDropping">
                <i18n>Drop the file here</i18n>
                <i18n>to attach it</i18n>
              </template>
              <template v-else>
                <i18n>Drag and drop</i18n>
                <span>{{ ' ' }}<i18n>or click here to upload</i18n></span>
              </template>
            </div>
          </div>
        </div>
        <div
          v-show="shouldShowPreviewImage"
          class="relative flex flex-col items-center justify-center w-full h-full overflow-hidden"
        >
          <button
            v-if="!isInCropMode"
            type="button"
            :aria-label="$i18n('Delete')"
            class="absolute w-8 h-8 rounded-sm bg-red-faded right-1 top-1 z-1"
            @click="handleDelete"
          >
            <FA
              class="text-red-dark"
              icon="fas fa-trash-alt"
              :size="14"
            />
          </button>

          <div
            class="relative"
            :class="[shouldAddImageAutoHeight ? 'h-auto' : 'h-97']"
          >
            <img
              v-if="!hasImageLoadError"
              ref="uploadedImage"
              crossorigin="anonymous"
              :src="imageUrl"
              alt=""
              class="object-contain w-auto h-full max-h-full select-none"
              @load="onImageLoad"
              @error="onImageLoadError"
            />

            <ImageCropper
              v-if="isInCropMode"
              ref="imageCropper"
              :img="$refs.uploadedImage"
              :hasImageLoaded="hasImageLoaded"
            />

            <ImagePreviewLoadAndError
              v-if="hasImageLoadError && (isInCropModeInMobile)"
              :isError="hasImageLoadError"
              :title="$i18n('Couldn\'t load this image')"
              :shouldShowExitButton="false"
            />
          </div>

          <div class="absolute top-1 left-1">
            <Button
              v-if="!isInCropMode && isDesktop"
              v-tooltip.bottom="isCroppingAllowed ? '' : $i18n('Cropping is allowed for images')"
              size="md"
              :title="$i18n('Crop')"
              :aria-label="$i18n('Crop')"
              type="dark"
              :applyDisabled="false"
              :disabled="!isCroppingAllowed"
              licon="far fa-crop"
              @click="isInCropMode = true"
            />
          </div>

          <div class="absolute top-1 left-1">
            <Button
              v-if="isInCropMode && isDesktop"
              size="md"
              :aria-label="$i18n('Exit crop')"
              type="dark"
              ticon="far fa-arrow-left"
              @click="onExitCropMode"
            />
          </div>

          <div class="absolute top-1 right-1">
            <Button
              v-if="isInCropMode && showSaveCropButton"
              size="md"
              :title="$i18n('Save')"
              :aria-label="$i18n('Save crop')"
              type="dark"
              :loading="isUploading"
              @click="cropAndSave"
            />
          </div>

          <div
            v-if="isUploading || isUpdating"
            class="absolute inset-0 bg-dark-50% flex justify-center items-center"
          >
            <FA
              icon="far fa-sync"
              :size="40"
              class="text-light-3 animate-spin"
            />
          </div>
        </div>
      </div>

      <div
        v-if="!!uploadError"
        class="m-1 text-xs font-semibold text-red-light"
      >
        <FA
          class="mr-1"
          icon="far fa-exclamation-circle"
          :size="11"
        />
        {{ uploadError }}
      </div>
      <div
        v-if="isDestinationMemes"
        class="flex items-center justify-between h-10 gap-1 my-3 text-xs text-dark-4"
      >
        <div class="flex">
          <FA
            class="mr-1"
            icon="far fa-info-circle"
            :size="12"
          />
          <i18n>We have partnered with </i18n>
          &nbsp;
          <img
            width="40"
            src="https://cf.quizizz.com/image/canva_img.png"
          />
          &nbsp;
          <i18n> to create memes.</i18n>
        </div>
        <Button
          size="xs"
          :title="$i18n('Try it')"
          licon="far fa-external-link"
          type="secondary"
          @click="handleTryIt"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import Constants from '~/config/Constants';
import LocalStorage from '~/services/LocalStorage';
import QLogger from '~/services/QLogger';

export default {
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

    showGoogleImageSearch: {
      type: Boolean,
      default: false,
    },

    showSaveCropButton: {
      type: Boolean,
      default: false,
    },

    isPasteUrlEnabled: {
      type: Boolean,
      default: false,
    },

    searchTerm: {
      type: String,
      default: '',
    },

    validateUpload: {
      type: Boolean,
      default: false,
    },

    destination: {
      type: String,
      default: Constants.ImageUploadTypes.QUIZZES,
    },

    size: {
      type: String,
      default: 'sm',
      validate: (size) => ['md', 'lg'].includes(size),
    },

    inCropMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['handleFileUpload', 'close', 'toggleCropMode', 'mediaSelectedOnMobile', 'loadInProgress', 'onCropImageInMobile', 'startedUpload', 'uploaded', 'uploadFailed', 'imageDeleted', 'isDropping', 'onGoogleImageSearchAppear', 'onGoogleImageSearchHide'],

  data() {
    return {
      uploadError: '',
      url: this.media.url,
      isUploading: false,
      isUpdating: false,
      hasUploaded: !!this.media.url,
      isDropping: false,
      showGoogleImageSearchView: false,
      hasImageLoaded: false,
      isInCropMode: false,
      urlErrorMessage: '',
      enteredImageUrl: '',
      hasImageLoadError: false,
      isInCropModeInMobile: false,
      shouldAddImageAutoHeight: false,
      imageExtension: '',

      editMedia: {},
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('contentEditor', ['quizType', 'quizId']),

    mediaToEdit() {
      if (!isEmpty(this.media?.url)) {
        return this.media;
      }

      return this.editMedia.url ? this.editMedia : this.media;
    },

    mediaText() {
      return get(this.mediaToEdit, 'meta.text', '');
    },

    sizeOfPreview() {
      if (this.isDestinationMemes) {
        return 'h-60';
      }
      switch (this.size) {
        case 'md':
          return 'h-60';
        case 'lg':
          return 'h-97';
        default:
          return 'h-60';
      }
    },

    googleSearchLimit() {
      return this.getSearchLimit() || { limit: this.$constants.GoogleSearchLimit };
    },

    shouldShowPreviewImage() {
      return this.isUploading || this.hasUploaded || this.isPasteUrlEnabled || (this.isInCropModeInMobile && !!this.url);
    },

    canShowFileUploadArea() {
      if (this.showGoogleImageSearch && !this.isPasteUrlEnabled) {
        return !this.showGoogleImageSearchView;
      }

      if (this.isPasteUrlEnabled) {
        return this.enteredImageUrl.length > 0 && !this.isUpdating && !this.urlErrorMessage;
      }

      return true;
    },

    inputIcon() {
      if (this.isUpdating) {
        return 'sync';
      }

      if (this.enteredImageUrl.length === 0) {
        return;
      }

      if (!this.urlErrorMessage) {
        return 'check-circle';
      }

      return 'times-circle';
    },

    inputIconColor() {
      if (this.isUpdating) {
        return 'dark animate-spin';
      }

      if (!this.urlErrorMessage) {
        return 'green';
      }

      return 'red';
    },

    imageUrl() {
      if (this.isPasteUrlEnabled) {
        return this.enteredImageUrl;
      }

      return this.url;
    },

    isDestinationMemes() {
      return this.destination === this.$constants.ImageUploadTypes.MEMES;
    },

    isCroppingAllowed() {
      if (this.imageExtension === '') {
        return true;
      }

      return this.$constants.CroppingAllowedForExtensions.includes(this.imageExtension);
    },
  },

  watch: {
    isInCropMode(newVal) {
      this.$emit('toggleCropMode', newVal);
    },

    url(newVal) {
      this.resetValues();
    },

    editMedia(media) {
      if (!isEmpty(media?.url)) {
        this.url = media.url;
        this.hasUploaded = !!media.url;
        this.showGoogleImageSearchView = false;
        const { googleImageSearch } = this.$refs;
        if (googleImageSearch) {
          googleImageSearch.showResultsContainer = false;
        }
        this.$emit('mediaSelectedOnMobile', media);
      }
    },

    media(val) {
      if (val && val.url) {
        this.hasUploaded = true;
        this.url = val.url;

        if (val.isGoogleSearchMode) {
          this.isUpdating = true;
          this.$emit('loadInProgress', this.isUpdating);
        }
      }
    },

    isPasteUrlEnabled(val) {
      if (val) {
        this.$nextTick(() => {
          const input = get(this.$refs, 'urlInput.$refs.input', null);
          if (input) {
            input.focus();
          }
        });
      } else {
        this.enteredImageUrl = '';
        this.urlErrorMessage = '';
      }
    },
  },

  mounted() {
    this.isInCropMode = this.inCropMode;
  },

  methods: {
    handleTryIt() {
      const openWindow = window.open();
      openWindow.opener = null;
      openWindow.target = '_blank';
      openWindow.location = 'https://www.canva.com/templates/?query=quizizz';
    },

    resetValues() {
      this.hasImageLoaded = false;
      this.hasImageLoadError = false;
      this.shouldAddImageAutoHeight = false;
    },

    checkImageOrientation() {
      if (!this.$refs.uploadedImage) { return; }
      const MAX_HEIGHT_OF_IMAGE_CONTAINER = 200;

      const { naturalHeight } = this.$refs.uploadedImage;
      const { naturalWidth } = this.$refs.uploadedImage;

      if (naturalHeight < naturalWidth && naturalHeight < MAX_HEIGHT_OF_IMAGE_CONTAINER) {
        this.shouldAddImageAutoHeight = true;
      }
    },

    onExitCropMode() {
      this.isInCropMode = false;

      if (!this.hasImageLoaded && this.isInCropModeInMobile) {
        this.onExitCropModeInMobile();
      }
    },

    onCropImageInMobile(url) {
      this.url = url;
      this.hideGoogleImageSearchResultsContainer();
      this.isInCropMode = true;

      /** We need this extra field as the mobile flow is different from desktop and would
       * need to handle showing the image selected in google search */
      this.isInCropModeInMobile = true;
      this.$emit('onCropImageInMobile', true);
    },

    onExitCropModeInMobile() {
      this.isInCropModeInMobile = false;
      this.$emit('onCropImageInMobile', false);

      if (this.hasImageLoaded) {
        this.url = this.mediaToEdit.url;
      }
    },

    async cropAndSave() {
      await this.handleCropImage();

      this.onExitCropMode();
    },

    async handleCropImage() {
      if (isEmpty(this.$refs.imageCropper)) {
        return;
      }

      this.isUploading = true;
      this.$emit('loadInProgress', this.isUploading);
      this.$emit('startedUpload');

      const url = await this.$refs.imageCropper.handleCropImage();

      this.url = url;
      this.setImage();
    },

    setImage(cb = null) {
      const img = new Image();

      img.onload = () => {
        this.isUploading = false;
        this.hasUploaded = true;
        this.$emit('loadInProgress', this.isUploading);
        this.$emit('uploaded', {
          type: 'image',
          url: this.url,
          meta: {
            width: img.naturalWidth,
            height: img.naturalHeight,
            layout: 'contain',
            text: this.mediaText,
          },
        });

        if (cb) {
          cb();
        }
      };

      img.onerror = () => {
        this.isUploading = false;
        this.hasImageLoaded = false;
        this.hasImageLoadError = true;
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while uploading the image!'),
        });
        this.$emit('uploadFailed');
      };

      img.src = this.url;
    },

    onImageLoad() {
      this.checkImageOrientation();

      this.isUpdating = false;

      this.hasImageLoaded = true;
      this.hasImageLoadError = false;

      this.$emit('loadInProgress', this.isUpdating);
    },

    onImageLoadError(ev) {
      this.isUpdating = false;

      this.hasImageLoaded = false;
      this.hasImageLoadError = true;
    },

    inputClicked() {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.UPLOAD_BUTTON_CLICKED);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
        },
      );
    },

    async handleInput(ev) {
      const file = ev.target.files[0];
      if (ev.target.files.length === 0) { return; }

      this.isDropping = false;

      if (!file.type.includes('image')) {
        this.uploadError = 'This is not a valid image!';
        return;
      }

      this.uploadError = '';

      if (ev.target.value !== undefined && ev.target.value !== '') {
        if (this.$fileUpload.doesFileExceed5MB(file)) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('File size should not exceed 5MB'),
          });
          this.uploadError = 'File size should not exceed 5MB!';
          this.$refs.fileInput.value = '';
          return;
        }
      }

      this.$emit('startedUpload');
      this.$emit('loadInProgress', this.isUploading);
      this.isUploading = true;

      try {
        const response = await this.$fileUpload.uploadFileToS3(file, {
          destination: this.destination,
          validateUpload: this.validateUpload,
        });

        this.url = response;
        this.$refs.fileInput.value = '';
        this.imageExtension = file.type?.split('/')?.[1];
      } catch (err) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while uploading the image!'),
        });
        this.$emit('uploadFailed');
        this.isUploading = false;
      }

      this.setImage();
    },

    uploadGoogleSearchImageToServer(url) {
      this.isUploading = true;
      this.$emit('startedUpload');
      this.$emit('loadInProgress', this.isUploading);

      const img = new Image();
      img.onload = async () => {
        const { result, error } = await this.$fileUpload.uploadURLToS3(url, { destination: this.$constants.ImageUploadTypes.QUIZZES });

        if (error) {
          this.showUploadError(this.$i18n('This image could not be uploaded. Please try a different image.'));
          return;
        }

        this.setImage(() => {
          this.updateGoogleSearchLimit();
        });

        this.url = result;
        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMAGE_SAVE);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
            type: 'device upload image',
          },
        );
      };

      img.onerror = () => {
        this.showUploadError(this.$i18n('Image type not supported, try another one'));
      };

      img.ontimeout = () => {
        this.showUploadError(this.$i18n('Request timed out!'));
      };

      img.src = url;
    },

    showUploadError(title) {
      this.$toasts.add({
        type: this.$constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title,
      });
    },

    getSearchLimit() {
      return LocalStorage.getItem(this.$constants.LocalStorageItems.GOOGLE_SEARCH_LIMIT, {
        parseFromJSON: true,
      });
    },

    setSearchLimit(query, data) {
      LocalStorage.setItem(`${query}`, data, {
        storeAsJSON: true,
      });
    },

    updateGoogleSearchLimit() {
      try {
        // If the search limit is exhausted, then the user needs to be a premium user.
        if (this.googleSearchLimit.limit <= 0) {
          this.isSuperContent = true;
        }
        this.googleSearchLimit.limit = this.googleSearchLimit.limit - 1 < 0 ? 0 : this.googleSearchLimit.limit - 1;
        // updating the local storgae with the new limit.
        const googleLimit = this.getSearchLimit();

        googleLimit.limit = this.googleSearchLimit.limit < 0 ? 0 : this.googleSearchLimit.limit;
        this.setSearchLimit(this.$constants.LocalStorageItems.GOOGLE_SEARCH_LIMIT, googleLimit);
      } catch (error) {
        QLogger.error('Error at GoogleImageSearch.updateSearchLimit', error);
      }
    },

    setMeditToEdit(media) {
      this.editMedia = media;
    },

    onInputChange(enteredImageUrl) {
      this.enteredImageUrl = enteredImageUrl;
      this.isUpdating = true;
      this.$emit('loadInProgress', this.isUpdating);

      const img = new Image();
      img.onload = async () => {
        this.isUpdating = false;
        this.$emit('loadInProgress', this.isUpdating);
        this.urlErrorMessage = '';

        // Upload to s3
        this.isUploading = true;
        this.$emit('loadInProgress', this.isUploading);
        const { result, error } = await this.$fileUpload.uploadURLToS3(this.enteredImageUrl, { destination: this.$constants.ImageUploadTypes.QUIZZES });
        if (error) {
          this.urlErrorMessage = this.$i18n('This image could not be uploaded. Please try a different image.');
          this.isUploading = false;
          this.$emit('loadInProgress', this.isUploading);
        }

        const finalImage = new Image();

        finalImage.onload = () => {
          this.isUploading = false;
          this.$emit('loadInProgress', this.isUploading);
          this.hasImageLoadError = false;
          this.enteredImageUrl = result;

          this.$emit('uploaded', {
            type: 'image',
            url: finalImage.src,
            meta: {
              width: finalImage.naturalWidth,
              height: finalImage.naturalHeight,
              layout: 'contain',
            },
          });

          const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMAGE_SAVE);
          this.$analytics.logEvent(
            eventName,
            {
              quizId: this.quizId,
              type: 'url image',
            },
          );
        };

        finalImage.src = result;
      };

      img.onerror = () => {
        this.isUpdating = false;
        this.$emit('loadInProgress', this.isUpdating);
        if (this.enteredImageUrl.length > 0) {
          this.urlErrorMessage = this.$i18n('Unable to insert this image');
        }
      };

      img.timeout = () => {
        this.urlErrorMessage = this.$i18n('Image load timed out. Please try again.');
      };

      img.src = enteredImageUrl;
    },

    onInputBtnClick() {
      if (this.urlErrorMessage) {
        this.enteredImageUrl = '';
      }
    },

    handleDelete() {
      this.onExitCropModeInMobile();
      this.hasUploaded = false;
      this.$refs.fileInput.value = '';
      this.url = '';

      if (this.enteredImageUrl.length) {
        this.enteredImageUrl = '';
      }

      this.$emit('imageDeleted');
    },

    handleDragEnter() {
      this.isDropping = true;
      this.$emit('isDropping', true);
    },

    handleDragLeave() {
      this.isDropping = false;
      this.$emit('isDropping', false);
    },

    handleOnGoogleSearchStart() {
      this.onExitCropModeInMobile();

      this.hasImageLoaded = false;

      this.$emit('onGoogleImageSearchAppear');
      this.showGoogleImageSearchView = true;
    },

    handleGoogleImageUpload(data) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMAGE_SAVE);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          type: 'google image',
        },
      );

      this.$emit('uploaded', data);
    },

    hideGoogleImageSearchResultsContainer() {
      this.showGoogleImageSearchView = false;
      this.$emit('onGoogleImageSearchHide');
    },
  },
};
</script>

<style lang="scss" scoped>
.paste-url-input {
  width: calc(100% - 8px);
}
</style>

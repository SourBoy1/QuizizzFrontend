<template>
  <div>
    <div
      ref="g-image-search"
      class="mb-4 searchbox-elem"
    />

    <div
      v-show="showResultsContainer"
      class="search-results-elem bg-light-2 border border-dark-6 rounded-lg relative"
      :class="[(!isDesktop && fullScreenImgContainer ? 'images-container' : isDesktop ? 'h-90' : 'h-60')]"
    >
      <!-- Results list container -->
      <div
        v-show="canShowSearchResults"
        ref="g-image-search-results"
        class="h-full overflow-y-scroll rounded-lg select-none"
        draggable="false"
        @click="handleResultsClick"
      />

      <!-- Results loading -->
      <div
        v-if="isSearchInProgress"
        class="h-full overflow-y-scroll rounded-lg results-loading"
      >
        <div class="flex justify-evenly items-center flex-wrap p-2.5">
          <div
            v-for="n in 12"
            :key="n"
            class="flex items-center justify-center w-40 my-2 border rounded h-31 border-dark-6 bg-light-3"
          >
            <FA
              icon="fas fa-image"
              :size="90"
              class="text-dark-6"
            />
          </div>
        </div>
      </div>

      <!-- No Images Found -->
      <div
        v-if="displayTerm && noResultsFound"
        class="flex flex-col items-center justify-center h-full"
      >
        <img
          src="https://cf.quizizz.com/image/emptystate-notfound.png"
          class="h-50"
          alt="No Images Found"
        />
        <div class="text-center text-dark-4">
          <p class="font-semibold break-normal">
            <i18n>There seems to be no Images on Google for</i18n>
          </p>
          <p class="font-normal truncate max-w-80">
            {{ displayTerm }}
          </p>
        </div>
      </div>

      <!-- Rate limit error -->
      <GoogleRateLimitError
        :showRateLimitError="showRateLimitError"
        @handleFileUpload="handleInput($event)"
      />

      <!-- Image Preview pane -->
      <div
        v-if="(previewImageUrl || isPreviewError || isPreviewImageLoading) && !isMobile"
        class="g-image-preview absolute top-0 right-0 z-10 w-full h-full max-h-full p-3 overflow-hidden rounded-r bg-dark-2"
        :style="{ width: imagePreviewWidth }"
      >
        <ImagePreviewLoadAndError
          v-if="isPreviewError || isPreviewImageLoading"
          :isLoading="isPreviewImageLoading"
          :isError="isPreviewError"
          :title="$i18n('Couldn\'t load this image, please select another one')"
          @exit="hideImagePreview"
        />

        <div
          v-show="!isPreviewError && !isPreviewImageLoading"
          class="relative flex items-center justify-center w-full h-full"
        >
          <div class="relative max-h-75">
            <img
              ref="previewImage"
              class="object-contain object-center w-auto h-auto max-w-full max-h-full select-none g-search-preview-image"
              oncontextmenu="return false;"
              draggable="false"
              :src="previewImageUrl"
              :width="previewImageWidth"
              :height="previewImageHeight"
              :alt="previewImageTitle"
              @load="handlePreviewImageLoad"
              @error="handlePreviewImageError"
            />

            <ImageCropper
              v-if="isInCropMode"
              ref="imageCropper"
              :img="$refs.previewImage"
              forPage="google-image"
              :hasImageLoaded="!isPreviewImageLoading"
            />
          </div>

          <div class="absolute top-1 left-1">
            <Button
              v-if="!isInCropMode"
              v-tooltip.left="isCroppingAllowed ? '' : $i18n('Cropping is allowed only for images')"
              size="md"
              :title="$i18n('Crop')"
              :aria-label="$i18n('Crop')"
              :applyDisabled="false"
              :disabled="!isCroppingAllowed"
              type="dark"
              licon="far fa-crop"
              @click="isInCropMode = true"
            />
          </div>

          <div class="absolute top-1 left-1">
            <Button
              v-if="isInCropMode"
              size="md"
              :aria-label="$i18n('Exit crop')"
              type="deep-transluscent-light"
              ticon="far fa-arrow-left"
              @click="isInCropMode = false"
            />
          </div>

          <span
            v-if="!isInCropMode"
            class="absolute top-0 right-0 z-10 w-8 h-8 inline-flex justify-center items-center rounded-sm bg-light-50% hover:bg-light-66% cursor-pointer"
            @click="hideImagePreview"
          >
            <FA
              icon="far fa-times"
              :size="18"
            />
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="!$user.isCorporate && !$user.isSuper && showResultsContainer && isMobile"
      class="mt-2 text-xs italic text-dark-4"
    >
      <i18n :injections="[googleSearchLimit.limit, googleSearchLimit.limit !== 1 ? 's' : '']">
        {$1} free image {$2} remaining today
      </i18n>
    </div>

    <div
      v-if="isPreviewError && isMobile"
      class="flex items-center mt-1 text-sm text-red"
    >
      <span class="w-4 h-4 flex items-center justify-center mr-0.5">
        <FA
          :size="11"
          icon="far fa-exclamation-circle"
        />
      </span>
      <span
        v-if="errorText"
        class="flex items-center h-4"
      >
        {{ errorText }}
      </span>
      <span
        v-else
        class="flex items-center h-4"
      >
        <i18n>Please select another image</i18n>
      </span>
    </div>

    <div
      v-if="showResultsContainer"
      class="actions-bar flex items-center -mb-4 z-10 px-6 left-0 w-full"
      :class="[((!$user.isCorporate && !$user.isSuper) || isPreviewError) && isMobile ? 'mt-4' : 'mt-6', {
        'left-0 w-full bg-light-3 p-2': isMobile,
      }, actionsBarStickToBottom && isMobile ? 'fixed bottom-4' : 'absolute bottom-8']"
    >
      <div class="flex mr-auto">
        <Button
          size="md"
          :title="$i18n('Back')"
          type="other"
          :aria-label="$i18n('Back')"
          class="mr-auto"
          @click="changeToFileUpload"
        />
      </div>

      <div
        v-if="!$user.isCorporate && !$user.isSuper && !isMobile"
        class="flex flex-row items-center mr-2 text-xs italic text-dark-4"
      >
        <span>
          <i18n :injections="[googleSearchLimit.limit, googleSearchLimit.limit !== 1 ? 's' : '']"> {$1} free image {$2} remaining today</i18n>
        </span>
        <FA
          v-if="!$user.isCorporate"
          v-tooltip.top="{ content: $i18n('Add unlimited images via search when you upgrade to Super.'), classes: 'info-tooltip' }"
          icon="fas fa-info-circle"
          class="ml-2"
        />
      </div>
      <Button
        v-if="showCancelBtn"
        size="md"
        :title="$i18n('Cancel')"
        type="other"
        :aria-label="$i18n('Cancel')"
        class="mr-2"
        @click="$emit('close')"
      />

      <ButtonWithTooltip
        size="md"
        :title="isInCropMode ? $i18n('Crop and insert') : $i18n('Insert')"
        type="primary"
        :aria-label="isInCropMode ? $i18n('Crop and insert') : $i18n('Insert')"
        :disabled="isInsertDisabled"
        :loading="isUploading"
        :tooltip="{
          isVisible: errorText !== '' && !isMobile,
          text: $i18n(errorText),
          tooltipContentStyle: {
            padding: '0.75rem 0.25rem',
            fontSize: '0.75rem',
            fontWeight: '400',
          },
          theme: 'error-light',
          position: 'top-left',
        }"
        @click="startImageUpload"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants';
import QLogger from '~/services/QLogger';

import GoogleCustomSearch from '~/services/GoogleSearchService';
import LocalStorage from '~/services/LocalStorage';
import referralMixin from '~/mixins/referralMixin';

export default {
  mixins: [referralMixin],
  props: {
    searchTerm: {
      type: String,
      default: '',
    },
    imageType: {
      type: String,
      default: Constants.EntityTypes.IMAGE,
    },
    imagePreviewWidth: {
      type: String,
      default: '360px',
    },
    closeOnBackClick: {
      type: Boolean,
      default: false,
    },
    actionsBarStickToBottom: {
      type: Boolean,
      default: false,
    },
    showCancelBtn: {
      type: Boolean,
      default: true,
    },
    fullScreenImgContainer: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'onSearchStart', 'handleFileUpload', 'onImageSearchHide', 'onImagePick', 'onImageUploaded', 'onCropImageInMobile'],

  data() {
    return {
      showResultsContainer: false,
      previewImageUrl: '',
      previewImageWidth: '',
      previewImageHeight: '',
      previewImageTitle: '',
      isUploading: false,
      isSearchInProgress: false,
      isPreviewImageLoading: false,
      isPreviewError: false,
      errorText: '',
      isSuperContent: false,
      noResultsFound: false,
      resultFetchError: false,
      displayTerm: '',
      isInCropMode: false,
      // searchId: '',
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizType', 'quizId']),
    ...mapGetters('root', ['isMobile', 'isDesktop']),

    googleSearchLimit() {
      return this.getSearchLimit() || { limit: this.$constants.GoogleSearchLimit };
    },

    isInsertDisabled() {
      return (this.$user.isSuper || this.$user.isCorporate) ? (!this.previewImageUrl) : (!this.isSuperContent && !this.previewImageUrl);
    },

    canShowSearchResults() {
      return !this.isSearchInProgress && !this.noResultsFound && !this.resultFetchError;
    },

    showRateLimitError() {
      return this.resultFetchError && !this.noResultsFound;
    },

    isCroppingAllowed() {
      const extension = this.previewImageUrl?.split('.')?.slice(-1)?.[0] ?? '';

      return this.$constants.CroppingAllowedForExtensions.includes(extension);
    },
  },

  mounted() {
    this.$eventBus.$on('googleImageSearch:searchInit', () => {
      // Begin rendering google's search
      const limit = this.getSearchLimit();
      const currDate = new Date();
      const finalDate = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());

      if (!limit || limit.updatedOn < finalDate.getTime()) {
        this.setSearchLimit(this.$constants.LocalStorageItems.GOOGLE_SEARCH_LIMIT, {
          limit: this.$constants.GoogleSearchLimit,
          updatedOn: new Date().getTime(),
        });
      }
      if (this.searchTerm) {
        this.googleImageSearch.doSearch(this.searchTerm);
      }
    });

    this.$eventBus.$on('googleImageSearch:searchStarted', ({ query }) => {
      this.displayTerm = query;
      this.$emit('onSearchStart');
      this.showResultsContainer = true;
      this.isSearchInProgress = true;
      this.resultFetchError = false;
      this.hideImagePreview();

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_GOOGLE_IMAGE_SEARCH);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          action: 'searchStart',
          term: this.searchTerm || query,
        },
      );
    });

    this.$eventBus.$on('googleImageSearch:searchFailed', () => {
      this.resultFetchError = true;
      this.noResultsFound = false;
      this.isSearchInProgress = false;
    });

    this.$eventBus.$on('googleImageSearch:resultsFetched', this.onSearchResultsFetched);
    this.$eventBus.$on('googleImageSearch:resultsRendered', this.onSearchResultsRendered);
    this.googleImageSearch = new GoogleCustomSearch(this.$constants.EntityTypes.IMAGE, this.imageType, () => {
      this.$toasts.add({
        type: this.$constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: this.$i18n('Unable to load google search, please reload!'),
      });
    });
    this.googleImageSearch.render(
      this.$refs['g-image-search'],
      this.$refs['g-image-search-results'],
    );
  },

  beforeUnmount() {
    if (this.googleImageSearch) {
      this.googleImageSearch.destroy();
    }

    this.$eventBus.$off('googleImageSearch:searchInit');
    this.$eventBus.$off('googleImageSearch:searchStarted');
    this.$eventBus.$off('googleImageSearch:resultsFetched');
    this.$eventBus.$off('googleImageSearch:searchFailed');
    this.$eventBus.$off('googleImageSearch:resultsRendered');
  },

  methods: {
    onSearchResultsFetched({ results, container, query }) {
      this.noResultsFound = false;
      if (this.googleSearchLimit.limit <= 0) {
        this.isSuperContent = true;
      }
      if (results.length <= 1) {
        this.noResultsFound = true;
        this.isSearchInProgress = false;
        return;
      }
      this.resultFetchError = false;
      const wrapperDiv = document.createElement('div');
      wrapperDiv.className = 'g-results-wrapper';
      results.forEach((result) => this.appendResultInContainer(result, wrapperDiv));
      this.isSearchInProgress = false;
      container.append(wrapperDiv);
    },

    onSearchResultsRendered({ pageNumber, query }) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_GOOGLE_IMAGE_SEARCH);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          action: 'searchDone',
          term: this.searchTerm || query,
          pageNumber,
        },
      );
    },

    showSuperUpsell() {
      const upsellParams = { feat: this.$constants.SuperUpsellTypes.IMAGE_SEARCH, options: { feat: 'imageSearch', variant: '' } };
      if (this.canPromoteReferral) {
        this.$eventBus.$emit('superUpsellReferral:show', upsellParams);
      } else {
        this.$eventBus.$emit('superUpsell:show', upsellParams);
      }
    },

    handleInput(event) {
      this.changeToFileUpload();
      this.$emit('handleFileUpload', event);
    },

    appendResultInContainer(result, container) {
      const button = document.createElement('button');

      this.attachDataOnDomNode(button, result);

      button.classList.add('g-result-image-item');
      button.tabIndex = 0;
      button.appendChild(this.getItemThumbImage(result));
      container.append(button);
    },

    getItemThumbImage(item) {
      const thumb = item.thumbnailImage;
      const img = document.createElement('img');
      img.src = thumb.url;
      img.width = thumb.width;
      img.height = thumb.height;
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      return img;
    },

    attachDataOnDomNode(node, data) {
      node.setAttribute('data-title', data.titleNoFormatting);
      node.setAttribute('data-format', data.fileFormat);
      node.setAttribute('data-image-url', data.image.url);
      node.setAttribute('data-image-width', data.image.width);
      node.setAttribute('data-image-height', data.image.height);
    },

    handleResultsClick(event) {
      // Find the target result item which was clicked
      let { target } = event;

      if (!target.classList.contains('g-result-image-item')) {
        target = target.closest('.g-result-image-item');
      }

      if (!target) {
        return false;
      }

      if (target.classList.contains('selected')) { return; }

      if (!this.isMobile) {
        this.showImagePreview(target);
      } else {
        this.previewImageUrl = target.getAttribute('data-image-url');
      }
      this.selectImage(target);
    },

    showImagePreview(node) {
      this.isPreviewError = false;
      this.errorText = '';
      this.previewImageUrl = node.getAttribute('data-image-url');
      this.previewImageWidth = node.getAttribute('data-image-width');
      this.previewImageHeight = node.getAttribute('data-image-height');
      this.previewImageTitle = node.getAttribute('data-title');
      this.isPreviewImageLoading = true;

      this.googleImageSearch.setResultsContainerStyles({
        width: `calc(100% - ${this.imagePreviewWidth})`,
      });
    },

    hideImagePreview() {
      if (this.googleImageSearch) {
        this.googleImageSearch.setResultsContainerStyles({
          width: '100%',
        });
      }
      this.previewImageUrl = '';
      this.isPreviewError = false;
      this.errorText = '';
      this.isPreviewImageLoading = false;
    },

    selectImage(node) {
      if (!node || node.classList.contains('selected')) {
        return;
      }

      this.isInCropMode = false;

      const children = node.parentNode.querySelectorAll('.g-result-image-item');
      children.forEach((child) => {
        child.classList.remove('selected');
      });

      node.classList.add('selected');
      this.scrollContainerTo(node);
    },

    startImageUpload() {
      if (this.isSuperContent && !this.$user.isSuper && !this.$user.isCorporate) {
        this.showSuperUpsell();
      } else if (this.isInCropMode) {
        this.handleCropImage();
      } else {
        this.uploadImageToServer(this.previewImageUrl);
      }
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

    updateSearchLimit() {
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

    changeToFileUpload() {
      if (this.closeOnBackClick) {
        this.$emit('close');
      }
      this.showResultsContainer = false;

      if (this.googleImageSearch) {
        this.googleImageSearch.clearResults();
      }

      this.$emit('onImageSearchHide');
    },

    handlePreviewImageLoad(e) {
      this.isPreviewImageLoading = false;
    },

    handlePreviewImageError(e) {
      this.isPreviewImageLoading = false;
      this.previewImageUrl = '';
      this.isPreviewError = true;
    },

    scrollContainerTo(node) {
      const container = this.$refs['g-image-search-results'];

      if (container) {
        const nodeOffsetTop = node.offsetTop;
        const nodeHeight = node.offsetHeight;
        const containerHeight = container.clientHeight;

        // Element is buried down out of view
        if (container.scrollTop + containerHeight < nodeOffsetTop + nodeHeight) {
          container.scrollTop = nodeOffsetTop + nodeHeight - containerHeight;
        }

        // Element is hidden up out of view
        if (container.scrollTop > nodeOffsetTop) {
          container.scrollTop = nodeOffsetTop;
        }
      }
    },

    uploadImageToServer(url) {
      this.isUploading = true;
      const img = new Image();
      img.onload = async () => {
        const { result, error } = await this.$fileUpload.uploadURLToS3(url, { destination: this.$constants.ImageUploadTypes.QUIZZES });

        if (error) {
          this.showUploadError(this.$i18n('This image could not be uploaded. Please try a different image.'));
          return;
        }

        const finalImage = new Image();

        finalImage.onload = () => {
          this.isUploading = false;

          const mediaElement = {
            type: this.$constants.EntityTypes.IMAGE,
            url: finalImage.src,
            meta: {
              width: finalImage.naturalWidth,
              height: finalImage.naturalHeight,
              layout: 'contain',
            },
          };

          if (this.isMobile) {
            this.$emit('onImagePick', mediaElement);
          } else {
            this.$emit('onImageUploaded', mediaElement);
          }

          this.updateSearchLimit();
        };

        finalImage.src = result;
      };

      img.onerror = () => {
        this.showUploadError(this.$i18n('Image type not supported, try another one'));
      };

      img.ontimeout = () => {
        this.showUploadError(this.$i18n('Request timed out!'));
      };

      img.src = url;
    },

    showUploadError(msg) {
      this.isUploading = false;
      this.errorText = msg;
    },

    onCropImageInMobile() {
      this.showResultsContainer = false;
      this.$emit('onCropImageInMobile', this.previewImageUrl);
    },

    async handleCropImage() {
      this.isUploading = true;

      if (isEmpty(this.$refs.imageCropper)) {
        return;
      }

      const url = await this.$refs.imageCropper.handleCropImage();

      if (isEmpty(url)) {
        this.isUploading = false;
        return;
      }

      this.previewImageUrl = url;
      const img = new Image();

      img.onload = () => {
        this.isUploading = false;
        this.hasUploaded = true;
        this.isInCropMode = false;
        this.$emit('onImageUploaded', {
          type: this.$constants.EntityTypes.IMAGE,
          url: img.src,
          meta: {
            width: img.naturalWidth,
            height: img.naturalHeight,
            layout: 'contain',
          },
        });
      };

      img.src = this.previewImageUrl;
    },
  },
};
</script>

<style lang="scss">
  .images-container{
    max-height: calc(100vh - 210px);
    overflow-y: auto;
  }
  .g-results-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;
  }

  .g-result-image-item {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 8px 0;
    width: theme('spacing.40');
    height: theme('spacing.31');
    background-color: #fff;
    border: 2px solid theme('colors.dark.6');
    border-radius: 4px;

    &:hover {
      cursor: pointer;
      box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    &.selected {
      border: 6px solid theme('colors.lilac.DEFAULT');
    }
  }

  .info-tooltip {
    max-width: 200px;
    text-align: center;
  }

  .g-search-preview-image {
    max-height: inherit;
  }
</style>

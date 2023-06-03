<template>
  <div>
    <div
      ref="yt-video-search"
      class="searchbox-elem mb-2"
    />

    <div
      v-show="showResultsContainer"
      class="search-results-elem bg-light-2 border border-dark-6 rounded-lg relative"
      :class="[isDesktop ? 'h-90' : 'h-70']"
    >
      <!-- Results list container -->
      <div
        v-show="!isSearchInProgress && !resultFetchError"
        ref="yt-video-search-results"
        class="overflow-y-scroll h-full rounded-lg"
        @click="handleResultsClick"
      />

      <!-- Results loading -->
      <div
        v-if="isSearchInProgress"
        class="results-loading overflow-y-scroll h-full rounded-lg"
      >
        <div class="flex justify-evenly items-center flex-wrap p-2.5">
          <div
            v-for="n in 12"
            :key="n"
            class="w-40 h-31 my-2 flex flex-col"
          >
            <div class="w-full h-22 flex justify-center items-center border border-dark-6 bg-light-3 rounded-lg">
              <FA
                icon="fab fa-youtube"
                :size="60"
                class="text-dark-6"
              />
            </div>

            <div class="w-full h-3 mt-2 rounded bg-dark-6" />
            <div class="w-3/4 h-3 mt-1 rounded bg-dark-6" />
          </div>
        </div>
      </div>

      <!-- No results found -->
      <div
        v-if="resultFetchError && noResultsFlag"
        class="h-full flex flex-col justify-center items-center"
      >
        <img
          src="https://cf.quizizz.com/image/emptystate-notfound.png"
          class="h-30"
          alt="No Images Found"
        />
        <div class="text-center text-dark-4">
          <p class="font-semibold break-normal">
            <i18n>No results found</i18n>
          </p>
        </div>
      </div>

      <!-- Rate limit error -->
      <YoutubeRateLimitError
        :showRateLimitError="showRateLimitError"
        @handleFileUpload="handleFileUpload($event)"
      />
      <!-- Image Preview pane -->
      <div
        v-if="previewVideoId && !isMobile"
        class="h-full w-90 absolute top-0 right-0 z-10 p-1.5 rounded-r"
      >
        <div class="w-full flex flex-col relative">
          <div
            v-if="previewVideoId"
            class="yt-video-preview w-full h-50 flex justify-center items-center relative rounded-lg overflow-hidden"
          >
            <MediaYoutube
              ref="yt-preview-video"
              :videoId="previewVideoId"
              :start="previewVideoStartTime"
              :end="previewVideoEndTime"
              @ready="onPreviewLoaded"
            />
          </div>

          <div
            v-if="previewVideoLoaded"
            class="mt-4 mx-3"
          >
            <div class="text-xs text-dark-1 font-semibold mb-2 flex">
              <i18n>Start and end time</i18n>
              <div
                v-if="showZoomButtons"
                class="ml-auto"
              >
                <button
                  v-tooltip.bottom="$i18n('Zoom in')"
                  class="mr-1 w-4 h-4 hover:text-dark-4"
                  @click="handleZoom"
                >
                  <FA
                    icon="far fa-search-plus"
                    :size="12"
                  />
                </button>
                <button
                  v-tooltip.bottom="$i18n('Zoom out')"
                  class="w-4 h-4 hover:text-dark-4"
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
              ref="preview-video-track"
              :zoomed="isPreviewTrackZoomed"
              :videoStartTime="previewVideoStartTime"
              :videoEndTime="previewVideoEndTime"
              :videoDuration="previewVideoDuration"
              :hasVideoLoaded="previewVideoLoaded"
              @onChange="handleVideoTimeChange"
              @hook:mounted="handlePreviewTrackMounted"
            />
          </div>

          <span
            class="absolute top-0 right-0 z-10 w-8 h-8 inline-flex justify-center items-center rounded-sm bg-light-50% hover:bg-light-66% cursor-pointer"
            @click="hideVideoPreview"
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
      v-if="showResultsContainer"
      class="actions-bar flex items-center mt-6 relative z-10"
    >
      <Button
        size="md"
        :title="$i18n('Back')"
        type="other"
        :aria-label="$i18n('Go back')"
        class="mr-auto"
        @click="changeToLinkUpload"
      />

      <Button
        size="md"
        :title="$i18n('Cancel')"
        type="other"
        :aria-label="$i18n('Cancel')"
        class="mr-2"
        @click="$emit('close')"
      />

      <ButtonWithTooltip
        size="md"
        :title="$i18n('Insert')"
        type="primary"
        data-cy="youtube-search-modal-insert-button"
        :aria-label="$i18n('Insert')"
        :disabled="!previewVideoId"
        :tooltip="{
          isVisible: errorText !== '',
          text: $i18n(errorText),
          tooltipContentStyle: {
            padding: '0.75rem 0.25rem',
            fontSize: '0.75rem',
            fontWeight: '400',
          },
          theme: 'error-light',
          position: 'top-left',
        }"
        @click="saveSelectedVideo"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import GoogleCustomSearch from '~/services/GoogleSearchService';

export default {
  props: {},
  emits: ['close', 'youtubeLinkPasted', 'onSearchStart', 'handleFileUpload', 'onSearchHide', 'onSave'],
  data() {
    return {
      showResultsContainer: false,
      previewVideoUrl: '',
      previewVideoId: '',
      previewVideoStartTime: 0,
      previewVideoEndTime: 0,
      previewVideoDuration: 0,
      previewVideoLoaded: false,
      isPreviewTrackZoomed: false,
      isSearchInProgress: false,
      errorText: '',
      showZoomButtons: true,
      resultFetchError: false,
      noResultsFlag: false,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'quizType']),
    ...mapGetters('root', ['isMobile', 'isDesktop']),

    showRateLimitError() {
      return this.resultFetchError && !this.noResultsFlag;
    },
  },

  created() {
    this.$eventBus.$on('youtubeSearch:searchStarted', ({ query }) => {
      if (this.$urlUtils.isValidURL(query)) {
        this.$emit('youtubeLinkPasted', query);
        return;
      }
      this.$emit('onSearchStart');
      this.resultFetchError = false;
      this.showResultsContainer = true;
      this.isSearchInProgress = true;
      this.hideVideoPreview();
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_GOOGLE_VIDEO_SEARCH);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        action: 'searchStart',
        term: this.searchTerm || query,
        // searchId: this.searchId,
      });
    });
    this.$eventBus.$on('youtubeSearch:resultsFetched', this.onSearchResultsFetched);
    this.$eventBus.$on('youtubeSearch:searchFailed', () => {
      this.resultFetchError = true;
      this.noResultsFlag = false;
      this.isSearchInProgress = false;
    });
    this.$eventBus.$on('youtubeSearch:noResults', () => {
      this.resultFetchError = true;
      this.noResultsFlag = true;
      this.isSearchInProgress = false;
    });
  },

  mounted() {
    this.ytVideoSearch = new GoogleCustomSearch('youtube');
    this.ytVideoSearch.render(this.$refs['yt-video-search'], this.$refs['yt-video-search-results']);
  },
  beforeUnmount() {
    if (this.ytVideoSearch) {
      this.ytVideoSearch.destroy();
    }
    this.$eventBus.$off('youtubeSearch:searchStarted');
    this.$eventBus.$off('youtubeSearch:resultsFetched');
    this.$eventBus.$off('youtubeSearch:searchFailed');
    this.$eventBus.$off('youtubeSearch:noResults');
  },

  methods: {
    onSearchResultsFetched({ results, container, query }) {
      const clearResultsBtn = document.querySelector("a[title='Clear search box']");
      if (clearResultsBtn) {
        clearResultsBtn.addEventListener('click', () => {
          this.hideVideoPreview();
        });
      }
      this.resultFetchError = false;
      this.noResultsFlag = false;
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_GOOGLE_VIDEO_SEARCH);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        action: 'searchDone',
        term: this.searchTerm || query,
        // searchId: this.searchId,
      });
      const wrapperDiv = document.createElement('div');
      wrapperDiv.className = 'yt-results-wrapper';
      results.forEach((result) => this.appendResultInContainer(result, wrapperDiv));
      this.isSearchInProgress = false;
      container.append(wrapperDiv);
    },

    handleFileUpload(event) {
      this.changeToLinkUpload();
      this.$emit('handleFileUpload', event);
    },
    appendResultInContainer(result, container) {
      const div = document.createElement('div');
      div.classList.add('yt-result-video-item');
      this.attachDataOnDomNode(div, result);
      div.appendChild(this.getItemThumbImage(result));
      div.appendChild(this.getItemTitle(result));
      container.append(div);
    },

    getItemThumbImage(item) {
      const thumb = item.thumbnailImage;
      const img = document.createElement('img');
      img.classList.add('yt-result-video-item-thumb');
      img.src = thumb.url;
      img.width = thumb.width;
      img.height = thumb.height;
      img.alt = item.titleNoFormatting;
      return img;
    },

    getItemTitle(item) {
      const title = item.titleNoFormatting;
      const div = document.createElement('div');
      div.classList.add('yt-result-video-item-title');
      div.classList.add('line-clamp-2');
      div.innerText = title;
      return div;
    },

    attachDataOnDomNode(node, data) {
      node.setAttribute('data-url', data.url);
      node.setAttribute('data-video-id', data.videoId);
    },
    handleResultsClick(event) {
      // Find the target result item which was clicked
      let { target } = event;
      if (!target.classList.contains('yt-result-video-item')) {
        target = target.closest('.yt-result-video-item');
      }
      if (!target) {
        return false;
      }
      if (!this.isMobile) {
        this.showVideoPreview(target);
      } else {
        this.previewVideoId = target.getAttribute('data-video-id');
        this.previewVideoUrl = target.getAttribute('data-url');
      }
      this.selectVideo(target);
    },

    showVideoPreview(node) {
      this.previewVideoLoaded = false;
      this.hideVideoPreview();
      this.$nextTick(() => {
        this.previewVideoId = node.getAttribute('data-video-id');
        this.previewVideoUrl = node.getAttribute('data-url');
        this.ytVideoSearch.setResultsContainerStyles({
          width: 'calc(100% - 356px)',
        });
      });
    },

    hideVideoPreview() {
      if (this.ytVideoSearch) {
        this.ytVideoSearch.setResultsContainerStyles({
          width: '100%',
        });
      }
      this.previewVideoUrl = '';
      this.previewVideoId = '';
      this.previewVideoStartTime = 0;
      this.previewVideoEndTime = 0;
      this.previewVideoDuration = 0;
      this.isPreviewTrackZoomed = false;
      this.isPreviewError = false;
      this.errorText = '';
    },

    selectVideo(node) {
      if (!node) {
        return;
      }
      const children = node.parentNode.querySelectorAll('.yt-result-video-item');
      children.forEach((child) => {
        child.classList.remove('selected');
      });
      node.classList.add('selected');
      this.scrollContainerTo(node);
    },

    changeToLinkUpload() {
      this.showResultsContainer = false;
      if (this.ytVideoSearch) {
        this.ytVideoSearch.clearResults();
      }
      this.$emit('onSearchHide');
    },

    onPreviewLoaded(e) {
      const yt = this.$refs['yt-preview-video'];
      this.previewVideoStartTime = this.previewVideoStartTime || yt.startTime;
      this.previewVideoEndTime = this.previewVideoEndTime || yt.endTime;
      this.previewVideoDuration = this.previewVideoDuration || yt.duration;
      this.previewVideoLoaded = true;
    },

    scrollContainerTo(node) {
      const container = this.$refs['yt-video-search-results'];
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

    handleVideoTimeChange({ startTime, endTime }) {
      this.previewVideoStartTime = startTime;
      this.previewVideoEndTime = endTime;
    },
    handleZoom() {
      this.isPreviewTrackZoomed = true;
    },
    handleUnzoom() {
      this.isPreviewTrackZoomed = false;
    },
    saveSelectedVideo() {
      const media = {
        url: this.previewVideoUrl,
        meta: {
          startTime: this.previewVideoStartTime,
          endTime: this.previewVideoEndTime,
          videoId: this.previewVideoId,
          duration: this.previewVideoDuration,
        },
      };
      this.$emit('onSave', media);
    },

    handlePreviewTrackMounted() {
      this.showZoomButtons = this.$refs['preview-video-track'].$refs.container.clientWidth < this.previewVideoDuration;
    },
  },

};
</script>

<style lang="scss">
  .yt-results-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .yt-result-video-item {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin: theme('spacing.2');
    width: theme('spacing.40');
    height: theme('spacing.34');
    background-color: #fff;
    border-radius: theme('borderRadius.lg');

    &:hover {
      cursor: pointer;
      background-color: theme('backgroundColor.dark.6');
    }

    .yt-result-video-item-thumb {
      border-radius: theme('borderRadius.lg');
      width: 160px;
      height: 90px;
      max-width: 100%;
      max-height: 90px;
      object-fit: cover;
      object-position: center center;
    }

    .yt-result-video-item-title {
      margin: theme('spacing.1') theme('spacing.[2.5]');
      text-align: left;
      color: theme('colors.dark.3');
      font-size: theme('fontSize.xs');
      font-weight: theme('fontWeight.semibold');
    }

    &.selected {
      border: 6px solid theme('colors.lilac.DEFAULT');
    }
  }

</style>

<template>
  <div
    ref="slideContainer"
    class="slide-container"
    :style="slideContainerStyles"
  >
    <div
      v-if="isTitleSubtitleType"
      ref="slideTypeContainer"
      class="flex flex-col title-subtitle-container slide-type-container"
      :style="slideTypeContainerStyles"
    >
      <SlideBackground
        :mediaType="backgroundMediaType"
        :mediaSrc="backgroundMediaSrc"
      />

      <div
        class="title"
        :style="titleStyles"
      >
        <span v-html="titleText" />
      </div>
      <div
        class="subtitle"
        :style="bodyStyles"
      >
        <span v-html="subtitleText" />
      </div>
    </div>

    <div
      v-if="isTitleParaType"
      ref="slideTypeContainer"
      class="flex flex-col title-para-container slide-type-container"
      :style="slideTypeContainerStyles"
    >
      <SlideBackground
        :mediaType="backgroundMediaType"
        :mediaSrc="backgroundMediaSrc"
      />

      <div
        class="title"
        :style="titleStyles"
      >
        <span v-html="titleText" />
      </div>
      <div
        class="para"
        :style="bodyStyles"
      >
        <span v-html="paraText" />
      </div>
    </div>

    <div
      v-if="isTitleBulletType"
      ref="slideTypeContainer"
      class="flex flex-col title-bullet-container slide-type-container"
      :style="slideTypeContainerStyles"
    >
      <SlideBackground
        :mediaType="backgroundMediaType"
        :mediaSrc="backgroundMediaSrc"
      />

      <div
        class="title"
        :style="titleStyles"
      >
        <span v-html="titleText" />
      </div>

      <ul
        class="bullets-container"
        :style="bulletContainerStyles"
      >
        <li
          v-for="(bullet, index) in bullets"
          :key="index"
          :ref="`bullet_${index}`"
          class="bullet"
          :style="getBulletStyle(index)"
        >
          <p
            class="bullet-text"
            :style="getBulletTextStyles(index)"
            v-html="getBulletText(bullet, index)"
          />
        </li>
      </ul>
    </div>

    <div
      v-if="isTitleParaMediaType"
      ref="slideTypeContainer"
      class="flex title-para-media-container slide-type-container"
      :style="slideTypeContainerStyles"
    >
      <SlideBackground
        :mediaType="backgroundMediaType"
        :mediaSrc="backgroundMediaSrc"
      />

      <div class="title-para-wrapper">
        <div
          class="title"
          :style="titleStyles"
        >
          <span v-html="titleText" />
        </div>
        <div
          class="para"
          :style="bodyStyles"
        >
          <span v-html="paraText" />
        </div>
      </div>

      <div class="media-wrapper">
        <MediaYoutube
          v-if="hasYoutubeMedia"
          class="w-full h-full"
          :url="getMediaUrl('video')"
          :videoId="videoId"
          :start="startVideoTime"
          :end="endVideoTime"
        />

        <MediaAudio
          v-if="hasAudioMedia"
          :src="getMediaUrl('audio')"
          class="audio"
          :size="audioComponentSize"
        />
        <img
          v-show="isImageLoaded"
          v-if="hasImageMedia"
          ref="image"
          :src="getMediaUrl('image')"
          :class="['image', imageLayoutClass]"
          @load="onImageLoaded"
        />
        <Loader
          v-if="hasImageMedia"
          v-show="!isImageLoaded"
          theme="white"
          :size="qLoaderSize"
        />
      </div>
    </div>

    <div
      v-if="isTitleBulletsMediaType"
      ref="slideTypeContainer"
      class="flex title-bullets-media-container slide-type-container"
      :style="slideTypeContainerStyles"
    >
      <SlideBackground
        :mediaType="backgroundMediaType"
        :mediaSrc="backgroundMediaSrc"
      />

      <div class="title-bullet-container">
        <div
          class="title"
          :style="titleStyles"
        >
          <span v-html="titleText" />
        </div>

        <ul
          class="bullets-container"
          :style="bulletsContainerStylesWithMedia"
        >
          <li
            v-for="(bullet, index) in bullets"
            :key="index"
            :ref="`bullet_${index}`"
            class="bullet"
            :style="getBulletStyle(index)"
          >
            <p
              class="bullet-text"
              :style="getBulletTextStyles(index)"
              v-html="getBulletText(bullet, index)"
            />
          </li>
        </ul>
      </div>

      <div class="media-wrapper">
        <MediaYoutube
          v-if="hasYoutubeMedia"
          class="w-full h-full"
          :url="getMediaUrl('video')"
          :videoId="videoId"
          :start="startVideoTime"
          :end="endVideoTime"
        />

        <MediaAudio
          v-if="hasAudioMedia"
          :src="getMediaUrl('audio')"
          class="audio"
          :size="audioComponentSize"
        />
        <img
          v-show="isImageLoaded"
          v-if="hasImageMedia"
          ref="image"
          :src="getMediaUrl('image')"
          :class="['image', imageLayoutClass]"
          @load="onImageLoaded"
        />
        <Loader
          v-if="hasImageMedia"
          v-show="!isImageLoaded"
          theme="white"
          :size="qLoaderSize"
        />
      </div>
    </div>

    <div
      v-if="isMediaSubtitleType"
      ref="slideTypeContainer"
      class="media-subtitle-container slide-type-container"
      :style="slideTypeContainerStyles"
    >
      <SlideBackground
        :mediaType="backgroundMediaType"
        :mediaSrc="backgroundMediaSrc"
      />

      <div
        ref="mediaWrapper"
        class="media-wrapper"
        :style="mediaWrapperStyles"
      >
        <MediaYoutube
          v-if="hasYoutubeMedia"
          class="w-full h-full"
          :url="getMediaUrl('video')"
          :videoId="videoId"
          :start="startVideoTime"
          :end="endVideoTime"
        />

        <MediaAudio
          v-if="hasAudioMedia"
          :src="getMediaUrl('audio')"
          class="audio"
          :size="audioComponentSize"
        />
        <img
          v-show="isImageLoaded"
          v-if="hasImageMedia"
          ref="image"
          :src="getMediaUrl('image')"
          :class="['image', imageLayoutClass]"
          @load="onImageLoaded"
        />
        <Loader
          v-if="hasImageMedia"
          v-show="!isImageLoaded"
          theme="white"
          :size="qLoaderSize"
        />
      </div>

      <div class="flex items-center justify-center subtitle-wrapper">
        <div
          v-show="subtitleText"
          class="subtitle"
        >
          <span v-html="subtitleText" />
        </div>
      </div>
    </div>

    <div
      v-if="isEmbedWebpageType && isWebpageEmbeddable"
      id="embed-webpage-container"
    >
      <iframe
        id="embed-webpage"
        ref="embed-webpage"
        :src="embeddableWebpageUrl"
        frameborder="0"
        width="100%"
        height="100%"
      />

      <div
        v-if="shouldShowEmbedControls"
        class="controls"
      >
        <button
          class="embed-home icon-text-btn btn"
          :aria-label="$i18n('Home')"
          @click="returnToHome"
        >
          <i
            class="icon icon-fas-home"
            aria-hidden="true"
          />
          <div
            v-if="!isMobile"
            class="text"
          >
            <i18n>Home</i18n>
          </div>
        </button>
        <span
          class="separator"
          aria-hidden="true"
        >|</span>

        <button
          class="embed-open-in-new-tab icon-text-btn btn"
          @click="openLinkInExternalTab"
        >
          <i
            class="icon icon-fas-external-link-alt"
            aria-hidden="true"
          />
          <div class="text">
            <i18n>Open in new tab</i18n>
          </div>
        </button>
        <span
          class="separator"
          aria-hidden="true"
        >|</span>

        <button
          class="embed-copy-link icon-text-btn btn"
          @click="copyEmbedWebpageLink('controlsCopy')"
        >
          <i
            class="icon icon-fas-copy-solid"
            aria-hidden="true"
          />
          <div
            ref="controlsCopy"
            class="text"
            aria-live="assertive"
          >
            <i18n>Copy link</i18n>
          </div>
        </button>
        <span
          class="separator"
          aria-hidden="true"
        >|</span>

        <button
          class="embed-hide text-btn btn"
          @click="toggleEmbedControls"
        >
          <div class="text">
            <i18n>Hide</i18n>
          </div>
        </button>
      </div>
      <div
        v-else
        class="control"
      >
        <button
          class="embed-show text-btn btn"
          @click="toggleEmbedControls"
        >
          <div class="text">
            <i18n>Show</i18n>
          </div>
        </button>
      </div>
    </div>

    <div
      v-if="isEmbedWebpageType && !isWebpageEmbeddable"
      id="embed-webpage-placeholder"
      :style="placeholderBackgroundImageStyle"
    >
      <div class="embed-dialog">
        <h1 class="embed-title">
          <img
            class="embed-logo"
            :src="embeddableWebpageLogo"
            alt=""
            width="25"
          />{{ embeddableWebpageTitle }}
        </h1>
        <h2 class="embed-subtitle">
          <i18n>To interact with this web page, please open it in a new tab.</i18n>
        </h2>

        <div class="btns-wrapper">
          <button
            class="embed-copy-link icon-text-btn btn"
            @click="copyEmbedWebpageLink('dialogCopy')"
          >
            <i
              class="icon icon-fas-copy-solid"
              aria-hidden="true"
            />
            <div
              ref="dialogCopy"
              aria-live="assertive"
            >
              <i18n>Copy link</i18n>
            </div>
          </button>

          <button
            class="embed-open-in-new-tab icon-text-btn btn"
            @click="openLinkInExternalTab"
          >
            <i
              class="icon icon-fas-external-link-alt"
              aria-hidden="true"
            />
            <i18n>Open in new tab</i18n>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import find from 'lodash/find';

import { SlideThemeConstants } from '~/config/SlideV1.js';
import i18n from '~/services/i18n';
import { getQuestionVideoTimesForV1, getQuestionVideoId } from '~/utils/QuizUtils.js';
import { getWebsiteLogo } from '~/utils/Utilities';
import { hexToRGBValues } from '~/services/ColorService';
import { getCookedSlideTheme } from '~/utils/SlideV1Utils.js';

/*
* The styles for the slide container have been set based on the default height of 1080px and width of 1920px.
* As the viewport sizes change this container just scales down or up based on the min of width and height of the container.
* https://codepen.io/chriscoyier/pen/VvRoWy
*/
const DEFAULT_CONTAINER_WIDTH = 1920;
const DEFAULT_CONTAINER_HEIGHT = 1080;

export default {
  props: {
    media: {
      type: Object,
      default: () => ({
        type: 'desktop',
      }),
    },

    rawQuestion: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      mediaWrapperStyles: {},
      scalingStyles: {},
      isScrollToViewVisible: false,
      isImageLandscape: false,
      isYTPlayerLoaded: false,
      isImageLoaded: false,
      hasFontLoaded: false,
      shouldShowEmbedControls: true,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),
    backgroundMediaType() {
      if (this.areStylesPresentForSlideBackground('image')) {
        return 'image';
      }

      if (this.areStylesPresentForSlideBackground('video')) {
        return 'video';
      }

      return '';
    },

    backgroundMediaSrc() {
      if (this.backgroundMediaType === 'image') {
        return this.backgroundImageSrc;
      }

      if (this.backgroundMediaType === 'video') {
        return this.backgroundVideoSrc;
      }

      return '';
    },

    theme() {
      return getCookedSlideTheme(this.slideTheme);
    },

    slideTheme() {
      return get(this.rawQuestion, 'structure.theme', {});
    },

    doesSlideHaveFontFamilyStyle() {
      return !isEmpty(this.fontFamilyStyle);
    },

    titleStyles() {
      const styles = {};

      if (this.areStylesPresentForContentType('fontColor', 'text')) {
        styles.color = this.getContentTypeStyleValues('fontColor', 'text');
      }

      if (this.areStylesPresentForContentType('fontSize', 'title')) {
        const deviceType = this.media.type;
        const fontSizeValue = this.getContentTypeStyleValues('fontSize', 'title');

        styles.fontSize = `${this.getFontSizeForSlideContentType({ contentType: 'text', fontSizeValue, deviceType })}px`;
      }

      if (this.doesSlideHaveFontFamilyStyle && this.hasFontLoaded) {
        styles.fontWeight = this.getFontWeight('title');
      }

      return styles;
    },

    bodyStyles() {
      const styles = {};

      if (this.areStylesPresentForContentType('fontColor', 'text')) {
        styles.color = this.getContentTypeStyleValues('fontColor', 'text');
      }

      if (this.areStylesPresentForContentType('fontSize', 'text')) {
        const deviceType = this.media.type;
        const fontSizeValue = this.getContentTypeStyleValues('fontSize', 'text');

        styles.fontSize = `${this.getFontSizeForSlideContentType({ contentType: 'text', fontSizeValue, deviceType })}px`;
      }

      if (this.doesSlideHaveFontFamilyStyle && this.hasFontLoaded) {
        styles.fontWeight = this.getFontWeight('text');
      }

      return styles;
    },

    backgroundVideoSrc() {
      return get(this.theme, 'background.video', '');
    },

    backgroundImageSrc() {
      return get(this.theme, 'background.image', '');
    },

    fontFamilyName() {
      return get(this.theme, 'fontFamily') || SlideThemeConstants.fontFamily.Quicksand.name;
    },

    fontFamilyStyle() {
      if (isEmpty(this.fontFamilyName)) {
        return '';
      }

      return `'${this.fontFamilyName}', '${SlideThemeConstants.fontFamily.Quicksand.name}'`;
    },

    backgroundColor() {
      return get(this.theme, 'background.color', '');
    },

    slideContainerStyles() {
      const styles = {};

      if (this.doesSlideHaveFontFamilyStyle) {
        styles.fontFamily = this.fontFamilyStyle;
      }

      return styles;
    },

    slideTypeContainerStyles() {
      const styles = { ...this.scalingStyles };

      if (this.areStylesPresentForSlideBackground('color')) {
        styles.backgroundColor = this.backgroundColor;
      }

      return styles;
    },

    qLoaderSize() {
      return 80;
    },

    startVideoTime() {
      return getQuestionVideoTimesForV1(this.rawQuestion, 'slide').start;
    },

    endVideoTime() {
      return getQuestionVideoTimesForV1(this.rawQuestion, 'slide').end;
    },

    videoId() {
      return getQuestionVideoId(this.rawQuestion, 'slide');
    },

    slideId() {
      return this.rawQuestion.id;
    },

    imageLayoutClass() {
      return 'fit';
    },

    audioComponentSize() {
      return 600;
    },

    imageContainerStyles() {
      const imageUrl = this.getMediaUrl(this.$constants.SlideMediaTypes.IMAGE);

      if (isEmpty(imageUrl)) {
        return {};
      }

      return { backgroundImage: `url(${imageUrl})` };
    },

    bullets() {
      return get(this.rawQuestion, 'structure.bullets', []);
    },

    titleText() {
      return get(this.rawQuestion, 'structure.title.text', '');
    },

    paraText() {
      return get(this.rawQuestion, 'structure.para.text', '');
    },

    subtitleText() {
      return get(this.rawQuestion, 'structure.subtitle.text', '');
    },

    isMobile() {
      return this.media.type === this.$constants.DeviceTypes.PHONE;
    },

    bulletContainerStyles() {
      const styles = {};

      if (this.areStylesPresentForContentType('fontSize', 'text')) {
        const deviceType = this.media.type;
        const fontSizeValue = this.getContentTypeStyleValues('fontSize', 'text');

        styles.fontSize = `${this.getFontSizeForSlideContentType({ contentType: 'text', fontSizeValue, deviceType })}px`;
      }

      if (this.doesSlideHaveFontFamilyStyle && this.hasFontLoaded) {
        styles.fontWeight = this.getFontWeight('text');
      }

      return styles;
    },

    bulletsContainerStylesWithMedia() {
      const styles = {};

      if (this.areStylesPresentForContentType('fontColor', 'text')) {
        styles.color = this.getContentTypeStyleValues('fontColor', 'text');
      }

      if (this.areStylesPresentForContentType('fontSize', 'text')) {
        const deviceType = this.media.type;
        const fontSizeValue = this.getContentTypeStyleValues('fontSize', 'text');

        styles.fontSize = `${this.getFontSizeForSlideContentType({ contentType: 'text', fontSizeValue, deviceType })}px`;
      }

      if (this.doesSlideHaveFontFamilyStyle && this.hasFontLoaded) {
        styles.fontWeight = this.getFontWeight('text');
      }

      return styles;
    },

    slideType() {
      return get(this.rawQuestion, 'structure.kind', '');
    },

    isTitleSubtitleType() {
      return this.slideType === this.$constants.SlideTypesV1.TITLE_SUBTITLE;
    },

    isTitleParaType() {
      return this.slideType === this.$constants.SlideTypesV1.TITLE_PARA;
    },

    isTitleBulletType() {
      return this.slideType === this.$constants.SlideTypesV1.TITLE_BULLETS;
    },

    isTitleBulletsMediaType() {
      return this.slideType === this.$constants.SlideTypesV1.TITLE_BULLETS_MEDIA;
    },

    isTitleParaMediaType() {
      return this.slideType === this.$constants.SlideTypesV1.TITLE_PARA_MEDIA;
    },

    isMediaSubtitleType() {
      return this.slideType === this.$constants.SlideTypesV1.MEDIA_SUBTITLE;
    },

    isEmbedWebpageType() {
      return this.slideType === this.$constants.SlideTypesV1.EMBED_WEBPAGE;
    },

    hasImageMedia() {
      return this.getMediaUrl('image') !== '';
    },

    hasYoutubeMedia() {
      return this.getMediaUrl('video') !== '';
    },

    hasAudioMedia() {
      return this.getMediaUrl('audio') !== '';
    },

    isImageLayoutFit() {
      if (!this.hasImageMedia) {
        return false;
      }

      const mediaObject = this.getMediaObject('image');
      const layout = get(mediaObject, 'meta.layout', '');

      return layout === this.$constants.SlideMediaLayouts.FIT;
    },

    canShowVideoBackground() {
      return false;
    },

    isWebpageEmbeddable() {
      return get(this.rawQuestion, 'structure.media[0].meta.embeddable', false);
    },

    embeddableWebpageUrl() {
      return get(this.rawQuestion, 'structure.media[0].url', '');
    },

    embeddableWebpageLogo() {
      return getWebsiteLogo(this.embeddableWebpageUrl);
    },

    embeddableWebpageTitle() {
      return get(this.rawQuestion, 'structure.media[0].meta.title', '');
    },

    placeholderBackgroundImageStyle() {
      const mobile = (this.isMobile) ? '-mobile' : '';
      return { backgroundImage: `url('https://cf.quizizz.com/img/presentation/blurred-webpage-bg${mobile}.png')` };
    },
  },

  watch: {
    isImageLandscape() {
      this.getMediaWrapperStyles();
    },

    deviceProps(newVal, oldVal) {
      if (newVal.height !== oldVal.height || newVal.width !== oldVal.width) {
        this.setContainerScale();
        this.getMediaWrapperStyles();
      }
    },
  },

  mounted() {
    this.setContainerScale();
    this.getMediaWrapperStyles();
    this.checkIfFontLoaded();

    this.hasScrollToViewBeenInitialized = false;

    this.$nextTick(() => {
      if (this.hasImageMedia) {
        this.checkImageLoaded();
      }
    });
  },

  methods: {

    getFontWeight(type) {
      return SlideThemeConstants.fontFamily[this.fontFamilyName].fontWeight[type];
    },

    getContentTypeStyleValues(style, contentType) {
      return get(this.theme, `${style}.${contentType}`, '');
    },

    areStylesPresentForContentType(style, contentType) {
      return !isEmpty(this.getContentTypeStyleValues(style, contentType));
    },

    areStylesPresentForSlideBackground(type) {
      switch (type) {
        case 'image':
          return !isEmpty(this.backgroundImageSrc);

        case 'video':
          return !isEmpty(this.backgroundVideoSrc);

        case 'color':
          return !isEmpty(this.backgroundColor);

        default:
      }
    },

    onImageLoaded() {
      this.isImageLoaded = true;
    },

    // This is required to initialise scroll after youtube player is loaded so that the correct container height is considered
    onYTPlayerLoaded() {
      this.isYTPlayerLoaded = true;
    },

    checkImageLoaded() {
      if (isEmpty(this.$refs.image)) { return; }

      if (this.$refs.image.complete) {
        this.checkImageOrientation();
      } else {
        this.$refs.image.addEventListener('load', () => {
          this.checkImageOrientation();
        });
      }
    },

    checkImageOrientation() {
      const naturalHeight = get(this.$refs, 'image.naturalHeight', 0);
      const naturalWidth = get(this.$refs, 'image.naturalWidth', 0);

      if (this.isMediaSubtitleType) {
        if (naturalHeight && naturalWidth / naturalHeight > 0.8) {
          this.isImageLandscape = true;
          return;
        }
      }

      if (naturalHeight < naturalWidth) {
        this.isImageLandscape = true;
      }
    },

    getBulletText(bullet, index) {
      const bulletText = (bullet && bullet.text) || '';

      return bulletText;
    },

    getBulletStyle(index) {
      const styles = {};

      if (this.areStylesPresentForContentType('fontColor', 'text')) {
        styles.color = this.getContentTypeStyleValues('fontColor', 'text');
      }

      return styles;
    },

    getBulletPlaceholderColor() {
      const bulletFontColor = this.getContentTypeStyleValues('fontColor', 'text');
      const rgbColorValue = hexToRGBValues(bulletFontColor);

      if (!isEmpty(rgbColorValue)) {
        return `rgba(${rgbColorValue.r},${rgbColorValue.g},${rgbColorValue.b},0.2)`;
      }

      return '#ABABAB33';
    },

    getBulletTextStyles(index) {
      const styles = {};

      return styles;
    },

    scrollIntoSlideContainer() {
      this.isScrollToViewVisible = false;

      const slideContainerElement = this.$refs.slideTypeContainer;
      const maxScroll = slideContainerElement.scrollHeight - slideContainerElement.clientHeight;

      if (slideContainerElement) {
        let scrollFromTop = slideContainerElement.scrollTop;

        let rafId;
        const scrollByThree = () => {
          slideContainerElement.scrollTop = scrollFromTop;

          scrollFromTop += 3;
          if (scrollFromTop < maxScroll) {
            rafId = requestAnimationFrame(scrollByThree);
          } else {
            cancelAnimationFrame(rafId);
          }
        };

        rafId = requestAnimationFrame(scrollByThree);
      }
    },

    onBulletRevealScroll(currentBulletElement, slideContainerElement) {
      const bulletMarginBottom = 24;
      const maxAllowedScroll = slideContainerElement.scrollHeight - slideContainerElement.clientHeight;
      const maxScrollAmount = (currentBulletElement.clientHeight + currentBulletElement.offsetTop + bulletMarginBottom) - (slideContainerElement.clientHeight);

      if (slideContainerElement) {
        let scrollFromTop = slideContainerElement.scrollTop;

        let rafId;
        const scrollByThree = () => {
          slideContainerElement.scrollTop = scrollFromTop;

          scrollFromTop += 3;

          if ((scrollFromTop - maxScrollAmount) < 0 && maxAllowedScroll > scrollFromTop) {
            rafId = requestAnimationFrame(scrollByThree);
          } else {
            cancelAnimationFrame(rafId);
          }
        };

        rafId = requestAnimationFrame(scrollByThree);
      }
    },

    getFontSizeForSlideContentType({ contentType, deviceType, fontSizeValue }) {
      let media = deviceType;

      media = this.$constants.DeviceTypes.TABLET;

      return SlideThemeConstants[media].fontSize[contentType][fontSizeValue];
    },

    getMediaUrl(type) {
      const mediaObject = this.getMediaObject(type);

      if (isEmpty(mediaObject)) {
        return '';
      }

      if (type === 'video') {
        const videoId = get(mediaObject, 'meta.videoId', '');
        return `https://www.youtube.com/embed/${videoId}`;
      }

      return mediaObject.url;
    },

    getMediaObject(type) {
      const mediaArray = get(this.rawQuestion, 'structure.media', []);
      const mediaObject = find(mediaArray, (item) => item.type === type);

      return mediaObject;
    },

    checkIfFontLoaded() {
      const themeFontFamily = this.fontFamilyName;
      const themeFontFamilyData = SlideThemeConstants.fontFamily[themeFontFamily];
      if (!themeFontFamilyData) {
        return;
      }
      const weightText = themeFontFamilyData.fontWeight.text;

      document.fonts.ready.then(() => {
        this.hasFontLoaded = document.fonts.check(`${weightText} 16px ${this.fontFamilyName}`);
      });
    },

    getSlideContainerDimensions() {
      if (!window.getComputedStyle) {
        return {};
      }
      const compStyles = window.getComputedStyle(this.$refs.slideContainer);

      return {
        height: (this.getPxValue(compStyles.height) - this.getPxValue(compStyles.borderTopWidth) - this.getPxValue(compStyles.borderBottomWidth)),
        width: (this.getPxValue(compStyles.width) - this.getPxValue(compStyles.borderLeftWidth) - this.getPxValue(compStyles.borderRightWidth)),
      };
    },

    getPxValue(str) {
      const numString = str.slice(0, -2);

      return parseInt(numString, 10);
    },

    getMediaWrapperStyles() {
      const styles = {};

      this.mediaWrapperStyles = styles;
    },

    /*
    * The styles for the slide container have been set based on the default height of 1080px and width of 1920px.
    * As the viewport sizes change this container just scales down or up based on the min of width and height of the container.
    * This applies only for desktop and tablet.
    * https://codepen.io/chriscoyier/pen/VvRoWy
    */
    setContainerScale() {
      const slideContainerDimensions = this.getSlideContainerDimensions();
      const scale = Math.min(
        slideContainerDimensions.width / DEFAULT_CONTAINER_WIDTH,
        slideContainerDimensions.height / DEFAULT_CONTAINER_HEIGHT,
      );

      this.scalingStyles = {
        transform: `translate(-50%, -50%) scale(${scale})`,
      };
    },

    toggleEmbedControls() {
      this.shouldShowEmbedControls = !this.shouldShowEmbedControls;
    },

    returnToHome() {
      const ele = this.$refs['embed-webpage'];
      if (ele) {
        ele.src = this.embeddableWebpageUrl;
      }
    },

    openLinkInExternalTab() {
      window.open(this.embeddableWebpageUrl);
    },

    copyEmbedWebpageLink(refName) {
      this.$clipboard.copy(this.embeddableWebpageUrl);
      const ele = this.$refs[refName];
      ele.innerText = i18n('Link Copied!');
    },
  },
};

</script>

<style lang="scss" scoped>

$minPhoneWidth: 320px;
$phoneWidth360: 360px;
$minTabletWidth: 576px;
$minDesktopWidth: 1025px;
$maxPhoneWidth: 575px;
$maxTabletWidth: 1024px;

li {
  list-style-type: circle;
}

.slide-container {
  width: 100%;
  height: 100%;
  color: #FFFFFF;
  overflow: hidden;
}

.slide-type-container {
  top: 50%;
  left: 50%;
  position: relative;
  padding: 0 160px;
  width: 1920px;
  height: 1080px;
}

.title-subtitle-container {
  align-items: center;
  max-width: initial;

  >.title {
    font-weight: bold;
    line-height: 150%;
    margin-top: auto;
    font-size: 80px;
    margin-bottom: 24px;
    text-align: center;
  }

  >.subtitle {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.66);
    line-height: 150%;
    font-size: 48px;
    margin-bottom: auto;
    text-align: center;
  }
}

.title-para-container {
  max-width: initial;
  display: flex;
  justify-content: center;

  >.title {
    font-weight: bold;
    line-height: 150%;
    font-size: 80px;
    margin-bottom: 24px;
  }

  >.para {
    color: #E5E5E6;
    font-weight: 500;
    line-height: 150%;
    font-size: 48px;
  }
}

// Bullet Container
ul, li  {
  margin-left: 20px;
}

.title-bullet-container {
  max-width: initial;
  display: flex;
  justify-content: center;
  flex-direction: column;

  >.title {
    font-weight: bold;
    line-height: 150%;
    font-size: 80px;
    margin-bottom: 40px;
  }

  >.bullets-container {
    font-weight: 500;
    font-size: 48px;

    >.bullet {
      color: #E5E5E6;
      line-height: 150%;
      margin-bottom: 24px;

      &.hide-bullet {
        color: rgba(255, 255, 255, 0.1);

        >.bullet-text {
          color: transparent;
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}

.title-para-media-container {
  position: relative;
  justify-content: center;
  flex: 1;
  padding: 64px;
  flex-direction: row;
  align-items: initial;

  > .media-wrapper >.audio {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  >.title-para-wrapper {
    min-height: 0px;
    flex: 1;
    margin-right: 64px;
    max-width: initial;
    padding: initial;
    display: flex;
    flex-direction: column;
    justify-content: center;

    >.title {
      font-weight: bold;
      line-height: 150%;
      font-size: 80px;
      margin-bottom: 24px;
    }

    >.para {
      color: #E5E5E6;
      font-weight: 500;
      line-height: 150%;
      margin-bottom: 8px;
      font-size: 48px;
    }
  }
}

.title-bullets-media-container {
  position: relative;
  justify-content: center;
  padding: 64px;
  flex-direction: row;

  >.media-wrapper >.audio {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  >.title-bullet-container {
    min-height: 0px;
    flex: 1;
    margin-right: 64px;
    max-width: 100%;

    >.bullets-container {
      font-size: 40px;
      margin-right: 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      >.bullet {
        &.hide-bullet {
          color: rgba(255, 255, 255, 0.1);

          >.bullet-text {
            color: transparent;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.2);
          }
        }
      }
    }
  }
}

.title-para-media-container, .title-bullets-media-container {
  > .media-wrapper {
    margin-top: 0px;
  }
}

// Common media wrapper styles
.media-wrapper {
  position: relative;
  width: 896px;
  height: 952px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: initial;

  >.youtube {
    flex:1;
    width: 100%;
    height:50.85%;
  }

  >.audio {
    width: 896px;
    height: 952px;
    margin-bottom: 0px;
    border-radius: 0%;
  }

  >.image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0px;

    &.fit {
      object-fit: contain;
    }

    &.fill {
      object-fit: cover;
    }

    &.stretch {
      width: 100%;
      height: 100%;
      background-size: 100% 100%;
    }
  }
}

.media-subtitle-container {
  position: relative;
  align-items: center;
  justify-content: center;
  display: flex;

  &.slide-type-container {
    padding: 0;
  }

  > .media-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0px;

    > .youtube {
      height: 100%;
    }

  }

  >.subtitle-wrapper {
    width: 95%;
    position: absolute;
    color: white;
    z-index: 111;
    font-weight: 600;
    line-height: 150%;
    bottom: 0px;
    padding: 8px 16px;
    font-size: 32px;
    margin: 0px auto 40px auto;

    >.subtitle {
      background-color: rgba(9,9,9,0.5);
      border-radius: 8px;
      padding: 8px 16px;
    }
  }
}

#embed-webpage-container, #embed-webpage-placeholder {
  display: flex;
  justify-content: center;
  position: relative;
  height: 100%;

  .btn {
    display: flex;
    align-items: center;
    background: #222222;
    border: none;
  }
}

#embed-webpage-container {
  .controls, .control {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    justify-content: center;
    bottom: 5px;
    height: auto;
    background: #222222;
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.06);
    border-radius: 8px;

    .btn {
      background-color: transparent;
      padding: 8px 8px;
      .text {
        font-family: Quicksand;
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 24px;
      }

      &:hover {
        background-color: rgba(255,255,255,0.1);
      }

      &.icon-text-btn {
        .text {
          color: #FFFFFF;
        }
      }

      &.text-btn {
        .text {
          color: rgba(255, 255, 255, 0.66);
        }
      }

      .icon {
        color: rgba(255, 255, 255, 0.66);
        margin-right: 6px;
        line-height: 24px;
      }

      &:first-of-type {
        .icon {
          margin-right: 0;
        }
      }
    }

    .separator {
      color: rgba(255, 255, 255, 0.1);
    }

    @media screen and (min-width: $phoneWidth360) {
      .btn {
        padding: 8px 12px;
      }
    }

    @media screen and (min-width: $minTabletWidth) {
      .btn:first-of-type {
        .icon {
          margin-right: 6px;
        }
      }
    }
  }
  .control {
    right: 5px;
  }
}

#embed-webpage-placeholder {
  align-items: center;
  background-repeat: no-repeat;
  background-size: cover;
  font-style: normal;
  font-weight: bold;
  color: #292A3A;

  .embed-dialog {
    padding: 18px;
    background: #FFFFFF;
    border: 1px solid rgba(9, 9, 9, 0.2);
    border-radius: 8px;
    transform: scale(0.85);

    .embed-title {
      display: flex;
      align-items: center;
      font-size: 20px;
      line-height: 32px;
      letter-spacing: -0.015em;
      margin-bottom: 8px;

      .embed-logo {
        margin-right: 8px;
        height: fit-content;
      }
    }

    .embed-subtitle {
      font-size: 14px;
      line-height: 24px;
      letter-spacing: -0.01em;
      margin-bottom: 16px;
    }

    .btns-wrapper {
      display: flex;
      justify-content: flex-end;

      .btn {
        font-family: Quicksand !important;
        font-style: normal !important;
        font-weight: bold !important;
        font-size: 14px !important;
        line-height: 24px !important;
        letter-spacing: -0.01em !important;
        padding: 8px 8px;

        .icon {
          margin-right: 4px;
        }

        &.embed-copy-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          font-size: 16px;
          margin-right: 16px;
          color: #292a3a;
          font-weight: 700;
          background-color: rgba(41, 42, 58, 0.1);
          cursor: pointer;
          border-radius: 4px;
          line-height: 16px;

          &:hover {
            background-color: rgba(41, 42, 58, 0.15);
          }
        }

        &.embed-open-in-new-tab {
          border: none;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          background-color: #8854c0;
          line-height: 16px;
          border-radius: 4px;
          cursor: pointer;

          &:hover {
            background-color: #a076cc;
          }
        }
      }
    }

    @media screen and (min-width: $phoneWidth360) {
      padding: 24px;
        .btns-wrapper {
          .btn {
            padding: 8px 12px;
          }
        }
    }

    @media screen and (min-width: $minTabletWidth) {
      transform: scale(1);
    }

    @media screen and (min-width: $minDesktopWidth) {
        transform: scale(1.25);
    }

  }
}

</style>

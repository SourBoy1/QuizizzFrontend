import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { mapGetters } from 'vuex';

import Constants from '~/config/Constants';
import { getFontSizeRange } from '~/utils/TypographyUtils';

import { asyncDelay } from '~/services/PausableTimers';

import {
  evaluateMathTemplate, getQuestionVideoTimes, isInteractiveBlankBasedQuestion, isEquationBasedQuestion, isTypingBasedQuestion, isAudioVideoBasedQuestion, isOrderMatchBasedQuestion, isQuestionForPoll, isWordCloudQuestion, isOptionsBasedQuestion, pushCorrectOptionsIntoBlanks, isGraphingBasedQuestion,
  isClassificationQuestion,
} from '~/utils/QuizUtils';
import QuestionOption from '~/models/QuestionOption';

const initialQueryMediaObjects = () => ({
  image: {},
  audio: {},
  video: {},
});

export default {
  props: {
    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },
  },

  data() {
    return {
      editorTextChangedCalled: false,
    };
  },

  computed: {
    ...mapGetters({
      serverData: 'root/serverData',
      quizId: 'contentEditor/quizId',
      parsedQuestionQueryStore: 'contentEditor/parsedQuestionQueryStore',
      getTipTapEditorData: 'contentEditor/getTipTapEditorData',
      getCanVideoBeRendered: 'contentEditor/getCanVideoBeRendered',
      getHideMediaContainer: 'contentEditor/getHideMediaContainer',
      getHideTextContainer: 'contentEditor/getHideTextContainer',
      questionEditorDimensions: 'contentEditor/questionEditorDimensions',
      currentSlide: 'slideEditor/currentSlide',
      currentlyFocusedTiptapEditor: 'slideEditor/currentlyFocusedTiptapEditor',
      lastFocusedTiptapEditor: 'slideEditor/lastFocusedTiptapEditor',
      sourcePage: 'slideEditor/sourcePage',
      currentBlankValues: 'uiManager/currentBlankValues',
      finalOptionsForBlankQuestion: 'uiManager/finalOptionsForBlankQuestion',
      getTipTapRef: 'contentEditor/getTipTapRef',
      quizType: 'contentEditor/quizType',
    }),

    isTipTapEditorInFocus() {
      return this.getTipTapEditorData.isFocused;
    },

    isContainingDeviceDesktop() {
      return this.forDevice === this.$constants.DeviceTypes.DESKTOP;
    },

    isContainingDeviceTablet() {
      return this.forDevice === this.$constants.DeviceTypes.TABLET;
    },

    queryResizeFontJumps() {
      if (this.isContainingDeviceDesktop) {
        return getFontSizeRange(28, 20);
      }

      if (this.isContainingDeviceTablet) {
        return getFontSizeRange(24, 18);
      }

      return getFontSizeRange(20, 14);
    },

    questionType() {
      return this.currentSlide.type;
    },

    questionSettings() {
      return this.currentSlide.structure.settings;
    },

    questionOptions() {
      return this.currentSlide?.structure?.options ?? [];
    },

    questionAnswer() {
      return this.currentSlide?.structure?.answer ?? [];
    },

    shouldUseParsedQuestionQuery() {
      return isInteractiveBlankBasedQuestion({ type: this.questionType });
    },

    queryEditorId() {
      return 'questionQuery';
    },

    isAddBlankDisabled() {
      return this.questionQuery?.text?.split('<blank').length - 1 >= this.$constants.QuestionOptionLimits[this.questionType]?.maxBlanks;
    },

    questionQuery() {
      if (this.shouldUseParsedQuestionQuery) {
        return this.parsedQuestionQueryStore;
      }

      return this.currentSlide.structure.query;
    },

    isUserInTexas() {
      return this.serverData?.region?.includes('TX') ?? false;
    },

    doesQuestionHaveAnyMedia() {
      let check = false;

      Object.keys(this.queryMediaObjects).forEach((key) => {
        if (this.isQuestionMediaPresent(key)) {
          check = true;
        }
      });

      return check;
    },

    queryMediaObjects() {
      const queryMediaObjects = initialQueryMediaObjects();
      const doesQuestionHaveMedia = (Array.isArray(this.questionQuery.media) && !isEmpty(this.questionQuery.media));

      if (doesQuestionHaveMedia) {
        this.questionQuery?.media?.forEach((media) => {
          queryMediaObjects[media.type] = media;
        });
      }

      return queryMediaObjects;
    },

    canVideoBeDisplayed() {
      return this.getCanVideoBeRendered && this.isQuestionMediaPresent('video');
    },

    isGoogleDriveSrcForVideo() {
      return get(this.queryMediaObjects, 'video.meta.src', null) === 'google-drive';
    },

    youtubeVideoId() {
      return get(this.queryMediaObjects, 'video.meta.videoId', null);
    },

    videoStartTime() {
      return getQuestionVideoTimes(this.queryMediaObjects).startTime;
    },

    videoEndTime() {
      return getQuestionVideoTimes(this.queryMediaObjects).endTime;
    },

    queryMediaTypeAdded() {
      const allMediaTypes = Object.keys(this.queryMediaObjects);

      for (let i = 0; i < allMediaTypes.length; i++) {
        if (this.isQuestionMediaPresent(allMediaTypes[i])) {
          return allMediaTypes[i];
        }
      }

      return '';
    },

    isMediaEditorVisible() {
      return !this.doesQuestionHaveAnyMedia;
    },

    shouldShrinkTheQueryEditor() {
      return [Constants.QuestionTypes.REORDER, Constants.QuestionTypes.MATCH].includes(this.questionType);
    },

    dimensionsForMediaButtons() {
      return {
        '--mediaBtnHeight': this.shouldShrinkTheQueryEditor ? '62.4px' : '116px',
        '--mediaBtnWidth': this.shouldShrinkTheQueryEditor ? '128px' : '102px',
        '--mediaBtnContainerHeight': this.shouldShrinkTheQueryEditor ? '50%' : 'auto',
        '--justifyAlignment': this.shouldShrinkTheQueryEditor ? 'space-evenly' : 'center',
        '--flexDirection': this.shouldShrinkTheQueryEditor ? 'row' : 'column',
      };
    },

    fontSizeForIcons() {
      if (this.shouldShrinkTheQueryEditor) {
        return 20;
      }

      return 36;
    },

    isMediaContainerHidden() {
      return this.getHideMediaContainer && !this.doesQuestionHaveAnyMedia;
    },

    questionMediaImageLayout() {
      const mediaLayout = get(this.queryMediaObjects, 'image.meta.layout', '');
      return isEmpty(mediaLayout) ? 'contain' : mediaLayout;
    },

    isTextContainerHidden() {
      return this.getHideTextContainer;
    },

    mediaInQuery() {
      const media = {};

      this.questionQuery.media.forEach((mediaItem) => {
        media[mediaItem.type] = mediaItem;
      });

      return media;
    },

    getActiveTiptapRef() {
      return this.getTipTapRef.child;
    },

    shouldShowSuperBranding() {
      return !this.$user.isCorporate && !this.$user.isPartOfAnOrganization;
    },

    googleDriveVideoId() {
      return get(this.queryMediaObjects, 'video.video', '');
    },

    isCurrentQuestionTypingBased() {
      return isTypingBasedQuestion(this.currentSlide);
    },

    isCurrentQuestionAudioVideoBased() {
      return isAudioVideoBasedQuestion(this.currentSlide);
    },

    isCurrentQuestionOrderMatchBased() {
      return isOrderMatchBasedQuestion(this.currentSlide);
    },

    questionDiscriminator() {
      /**
       * This string contains the least amount of components that can be
       * used to distinguish between different questions especially when the
       * type changes.
       */
      const hasCorrectAnswers = this.currentSlide?.structure?.settings?.hasCorrectAnswer;
      return `${this.currentSlide._id}_${this.questionType}_${hasCorrectAnswers}`;
    },

    selectedSlideType() {
      let displayType = this.currentSlide.type;

      if (isQuestionForPoll(this.currentSlide)) {
        displayType = this.$constants.SlideTypes.POLL;
      }

      if (isWordCloudQuestion(this.currentSlide)) {
        displayType = this.$constants.SlideTypes.WORDCLOUD;
      }

      return displayType;
    },

    isCurrentQuestionOptionsBased() {
      return isOptionsBasedQuestion(this.currentSlide);
    },

    areMultipleAnswersAllowed() {
      return this.questionType === this.$constants.QuestionTypes.MSQ;
    },

    isInteractiveBlankBasedQuestion() {
      return isInteractiveBlankBasedQuestion({ type: this.questionType });
    },

    isEquationBasedQuestion() {
      return isEquationBasedQuestion(this.currentSlide);
    },

    isGraphingBasedQuestion() {
      return isGraphingBasedQuestion(this.currentSlide);
    },

    isHotspotQuestion() {
      return this.questionType === this.$constants.QuestionTypes.HOTSPOT;
    },

    isDndOnImageQuestion() {
      return this.questionType === this.$constants.QuestionTypes.DND_IMAGE;
    },

    isClassificationQuestion() {
      return isClassificationQuestion({ type: this.questionType });
    },
  },

  methods: {
    /**
     *
     * @param {'image' | 'audio' | 'video'} mediaType - The type of media to add to query
     * @param {Boolean} supportMultipleMedia - Whether to support multiple media of different types
     */
    onAddMediaClick(mediaType, supportMultipleMedia = false, isReEdit = false) {
      if (mediaType === 'video') {
        this.$analytics.logEvent(this.$webEvents.QC_VIDEO_UPLOAD_INIT, {
          quizId: this.quizId,
          sourcePage: this.sourcePage,
        });
      }

      const handleAddingMedia = async (media) => {
        if (supportMultipleMedia) {
          let previousMedia = [...this.questionQuery.media];
          if (isReEdit) {
            previousMedia = previousMedia.filter((m) => m.type !== mediaType);
          }
          this.updateQuery({
            media: previousMedia.concat(media),
          });
        } else {
          this.updateQuery({
            media: [media],
          });
        }

        if (mediaType === 'video') {
          /**
           * This toggling handles the issue of youtibe loading a smaller thumbnail
           * because the container animation was not complete
           */
          this.$store.dispatch('contentEditor/setVideoRendered', false);
          await asyncDelay(300);
          this.$store.dispatch('contentEditor/setVideoRendered', true);
        }
      };

      let mediaPresent;

      if (this.mediaInQuery[mediaType]) {
        mediaPresent = this.mediaInQuery[mediaType];
      }

      switch (mediaType) {
        case 'image':
          this.$eventBus.$emit('presentationEditor:showImageUpload', { callback: handleAddingMedia, media: mediaPresent });
          break;
        case 'audio':
          this.$eventBus.$emit('presentationEditor:showAudioUpload', { callback: handleAddingMedia, media: mediaPresent });
          break;
        case 'video':
          this.$eventBus.$emit('presentationEditor:showVideoUpload', { callback: handleAddingMedia, media: mediaPresent });
          break;
        default:
      }
    },

    /**
     *
     * @param {Object} value - update any value in the query
     */
    updateQuery(value = {}) {
      // if (value.media) {
      //   value.media = value.media.filter((media) => media.url || media.video);
      // }

      // const updatedQuery = QuestionQuery({
      //   ...this.questionQuery,
      //   ...value,
      // });
      // const allMediaTypesPresent = updatedQuery.media.map((media) => media.type);

      // const isTextEmpty = this.getTipTapEditorData.isEmpty;

      // if (!isTextEmpty) {
      //   updatedQuery.type = 'text';
      // } else {
      //   // updated type on the basis of existing query
      //   updatedQuery.type = this.questionQuery.text ? 'text' : '';
      // }

      // uniq(allMediaTypesPresent).forEach((type) => {
      //   updatedQuery.type += `${isEmpty(updatedQuery.type) ? '' : '_'}${type}`;
      // });

      // if (this.shouldUseParsedQuestionQuery) {
      //   this.$store.dispatch('contentEditor/setParsedQuestionQuery', {
      //     ...this.parsedQuestionQueryStore,
      //     ...value,
      //     type: updatedQuery.type,
      //   });
      // }

      this.$store.dispatch('slideEditor/updateQuestionQuery', {
        query: null,
        rawData: value,
        isTextEmpty: this.getTipTapEditorData.isEmpty,
        parsedQuestionQueryUpdate: this.shouldUseParsedQuestionQuery,
      });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    handleTiptapUndo() {
      if (isInteractiveBlankBasedQuestion({ type: this.questionType })) {
        this.initialiseParsedQuestionQuery();
      }
    },

    initialiseParsedQuestionQuery() {
      /**
       * syncs blank ids vs text to store to handle mutations
       * syncs blank ids vs option to store
       */
      const { queryText = '', optionForBlankId = {} } = pushCorrectOptionsIntoBlanks(this.currentSlide);

      const configForBlank = [];
      Object.keys(optionForBlankId).forEach((blankId) => {
        configForBlank.push({
          blankId,
          hasMath: Boolean(optionForBlankId[blankId]?.hasMath),
          value: optionForBlankId[blankId]?.hasMath ? optionForBlankId[blankId].math.latex[0] : optionForBlankId[blankId]?.text ?? '',
        });
      });

      this.$store.dispatch('uiManager/setBlankValue', configForBlank);
      this.$store.dispatch('uiManager/setFinalBlankOptions', optionForBlankId);

      this.$store.dispatch('contentEditor/setParsedQuestionQuery', {
        ...cloneDeep(this.currentSlide.structure.query),
        text: queryText,
      });
    },

    getTiptapValue() {
      return {
        text: isEmpty(this.questionQuery.text) ? Constants.TipTap.INITIAL_TIP_TAP_VALUE : this.questionQuery.text,
        isEmpty: this.getTipTapEditorData.isEmpty,
        isFocused: this.getTipTapEditorData.isFocused,
      };
    },

    onTiptapUpdate(value) {
      const { text } = value;
      const { hasMath, math } = evaluateMathTemplate(value.text);

      this.$store.dispatch('contentEditor/setTipTapData', {
        isEmpty: value.isEmpty,
        isFocused: value.isFocused,
      });

      if (value.didTextChange) {
        this.onEditorValueChange(this);
        this.updateQuery({
          math,
          hasMath,
          text: this.getTipTapEditorData.isEmpty ? '' : text,
        });
      }
    },

    syncOptionsWithQueryForBlanks() {
      const options = {};
      // cloning to avoid mutation while iterating since we are updating the same object in store
      const currentBlankValues = cloneDeep(this.currentBlankValues);

      Object.keys(currentBlankValues).forEach((blankId) => {
        const currentBlank = currentBlankValues[blankId];

        const optionWithSameText = [].concat(this.questionOptions, Object.values(options)).find((option) => {
          if (option.hasMath) {
            return option.math.latex[0] === currentBlank.value;
          }

          return option.text === currentBlank.value;
        });

        // if option with same option Id exists but text is not the same, create a new one
        // incase user edits a duplicate option
        let createNewOption = false;
        if (!optionWithSameText && this.finalOptionsForBlankQuestion[blankId]?.text !== currentBlank.value) {
          createNewOption = true;
        }

        let existingOption = { ...(optionWithSameText ?? this.finalOptionsForBlankQuestion[blankId] ?? QuestionOption({})) };
        if (createNewOption) {
          existingOption = QuestionOption({});
        }

        if (currentBlankValues[blankId]?.value?.trim() === '') {
          this.$store.dispatch('uiManager/deleteBlankIdsFromValues', [blankId]);
          return;
        }

        if (currentBlank.hasMath) {
          existingOption.hasMath = currentBlank.hasMath;
          existingOption.math = {
            latex: [currentBlank.value],
            template: null,
          };
          existingOption.text = `<p><katex latex="${currentBlank.value}"></katex>&nbsp;</p>`;
        } else {
          existingOption.text = currentBlank.value;
        }

        options[blankId] = existingOption;
      });

      this.$store.dispatch('uiManager/setFinalBlankOptions', options);
    },

    handleTiptapBlur() {
      if (isInteractiveBlankBasedQuestion({ type: this.questionType })) {
        this.syncOptionsWithQueryForBlanks();
      }
    },

    openMathEditor() {
      /**
       * We refocus the editor because we want the math to always be inserted at the end of text as refocussing puts the
       * cursor at the end of the text
       * We do NOT refocus when questionTextEditor is(or was last element) already focused because we do not want the
       * user to loose the place they are on.
       */
      const shouldRefocusBeforeInsertion = (
        this.currentlyFocusedTiptapEditor.id !== this.queryEditorId
        && this.lastFocusedTiptapEditor.id !== this.queryEditorId
      );

      this.$eventBus.$emit('presentationEditor:showMathEditor', {
        callback: (latex) => {
          const ref = this.getActiveTiptapRef;

          if (shouldRefocusBeforeInsertion && ref) {
            ref.focus();
          }
          this.$eventBus.$emit('questionEditor:insertMath', {
            elementId: this.queryEditorId,
            latex,
          });
        },
        closeCallback: () => {
          this.$eventBus.$emit('questionEditor:closeMathEditor', {
            elementId: this.queryEditorId,
          });
        },
      });
    },

    isQuestionMediaPresent(type) {
      return !isEmpty(this.queryMediaObjects[type]);
    },

    deleteCurrentMedia(mediaType) {
      if (mediaType === 'audio') {
        const mediaObjects = { ...this.queryMediaObjects };
        delete mediaObjects[mediaType];
        this.updateQuery({
          media: Object.values(mediaObjects),
        });
        return;
      }
      this.updateQuery({
        media: [],
      });

      this.evaluateQueryContentVisibility(true);
    },

    onMediaReEdit() {
      this.onAddMediaClick(this.queryMediaTypeAdded);
    },

    evaluateQueryContentVisibility(forceShowMediaContainer = false) {
      this.$store.dispatch('contentEditor/setHideTextContainer', false);
      this.$store.dispatch('contentEditor/setHideMedia', !forceShowMediaContainer);

      if (this.doesQuestionHaveAnyMedia && this.getTipTapEditorData.isEmpty) {
        this.$store.dispatch('contentEditor/setHideTextContainer', true);
      }

      if (!this.doesQuestionHaveAnyMedia && !this.getTipTapEditorData.isEmpty && !forceShowMediaContainer) {
        this.$store.dispatch('contentEditor/setHideMedia', true);
      }
    },

    onHideMediaClick() {
      if (this.isMediaContainerHidden) {
        return;
      }

      this.$store.dispatch('contentEditor/setHideMedia', true);
    },

    setSelectedQuestionElement(elementId = '') {
      // TODO(sarthak): Find a better way to handle keeping the ediitor focussed when clicking toolbar btns; is Debounce required?
      this.$store.dispatch('slideEditor/setTiptapEditorInFocus', { id: elementId, slideType: this.questionType });
    },

    onEditorValueChange() {
      if (this.editorTextChangedCalled) {
        return;
      }
      this.editorTextChangedCalled = true;
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.QUESTION_TEXT_CHANGED);
      this.$analytics.logEvent(eventName);
    },
  },
};

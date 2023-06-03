<template>
  <QuestionAnswerExplanationEditorDesktop
    v-if="isDesktop"
    v-bind="propsForChildren"
    v-on="eventsOfChildren"
  />
  <QuestionAnswerExplanationEditorMobile
    v-else
    :isTipTapEditorInFocus="isTipTapEditorInFocus"
    v-bind="propsForChildren"
    v-on="eventsOfChildren"
  />
</template>

<script>
import forEach from 'lodash/forEach';
import keys from 'lodash/keys';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import has from 'lodash/has';

import { mapGetters } from 'vuex';

import QuestionAnswerExplanation from '~/models/QuestionAnswerExplanation';
import { evaluateMathTemplate } from '~/utils/QuizUtils';
import { convertMathToKatex } from '~/utils/SlideV1Utils';

export default {

  props: {
    editorDimensions: {
      type: Object,
      required: true,
      validator: (val) => has(val, 'width') && has(val, 'height') && has(val, 'scale'),
    },
  },
  emits: ['deleteAnswerExplanation'],

  data() {
    return {
      tiptapEditor: {
        isEmpty: false,
        isFocused: false,
      },
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),
    ...mapGetters('slideEditor', ['currentSlide', 'doesSlideHaveAnswerExplanations', 'sourcePage']),
    ...mapGetters('contentEditor', ['quizId', 'isEditorForQuizContent', 'isEditorForPresentationContent']),

    propsForChildren() {
      return {
        getTiptapValue: this.getTiptapValue,
        editorDimensions: this.editorDimensions,
        isExplanationMediaPresent: this.isExplanationMediaPresent,
        isExplanationMediaGoogleDriveVideo: this.isExplanationMediaGoogleDriveVideo,
        explanationMediaGoogleVideoId: this.explanationMediaGoogleVideoId,
      };
    },

    eventsOfChildren() {
      return {
        updateExplantionValue: this.updateExplantionValue,
        onTiptapUpdate: this.onTiptapUpdate,
        deleteAnswerExplanation: this.deleteAnswerExplanation,
        onAddMediaClick: this.onAddMediaClick,
        setSelectedQuestionElement: this.setSelectedQuestionElement,
        deleteCurrentMedia: this.deleteCurrentMedia,
        onMediaReedit: this.onMediaReEdit,
      };
    },

    answerExplanation() {
      if (this.doesSlideHaveAnswerExplanations) {
        return this.currentSlide.structure.explain;
      }

      return {};
    },

    answerExplainTextEditorId() {
      return 'questionAnswerExplanation';
    },

    isTipTapEditorInFocus() {
      return this.tiptapEditor.isFocused;
    },

    doesExplanationHaveAnyMedia() {
      let check = false;

      forEach(this.explanationMediaObjects, (media, type) => {
        if (this.isExplanationMediaPresent(type)) {
          check = true;
        }
      });

      return check;
    },

    explanationMediaObjects() {
      const doesQuestionHaveMedia = (Array.isArray(this.answerExplanation.media) && !isEmpty(this.answerExplanation.media));
      const explanationMediaObjects = {
        image: {},
        audio: {},
        video: {},
      };

      if (doesQuestionHaveMedia) {
        forEach(this.answerExplanation.media, (media) => {
          explanationMediaObjects[media.type] = media;
        });
      }

      return explanationMediaObjects;
    },

    explanationMediaImageLayout() {
      return get(this.explanationMediaObjects, 'image.meta.layout', '');
    },

    mediaTypeAdded() {
      const allMediaTypes = keys(this.explanationMediaObjects);

      for (let i = 0; i < allMediaTypes.length; i++) {
        if (this.isExplanationMediaPresent(allMediaTypes[i])) {
          return allMediaTypes[i];
        }
      }

      return '';
    },

    reverseScaleDoneButton() {
      const normalButtonWidth = 68;
      const normalButtonHeight = 32;
      const translateX = (normalButtonWidth * (1 - this.editorDimensions.scale)) / 2;
      const translateY = (normalButtonHeight * (1 - this.editorDimensions.scale)) / 2;
      const reverseScale = 1 / this.editorDimensions.scale;

      return {
        transform: `scale(${reverseScale}) translateX(-${translateX}px) translateY(${translateY}px)`,
      };
    },

    isExplanationMediaGoogleDriveVideo() {
      return !isEmpty(this.explanationMediaObjects.video) && get(this.explanationMediaObjects, 'video.meta.src', null) === 'google-drive';
    },

    explanationMediaGoogleVideoId() {
      return get(this.explanationMediaObjects, 'video.video', null);
    },
  },

  watch: {
    isTipTapEditorInFocus(newVal) {
      if (newVal === true) {
        this.setSelectedQuestionElementDebounced(this.answerExplainTextEditorId);
      } else {
        this.setSelectedQuestionElementDebounced('');
      }
    },
  },

  created() {
    this.updateExplantionValueThrottled = throttle(this.updateExplantionValue.bind(this), 200, { trailing: true });
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 100);
  },

  methods: {
    updateExplantionValue(value) {
      const updatedAnswerExplanation = QuestionAnswerExplanation({
        ...this.answerExplanation,
        ...value,
      });

      const allMediaTypesPresent = updatedAnswerExplanation?.media?.map((media) => media.type);
      const isTextEmpty = this.tiptapEditor.isEmpty;

      if (!isTextEmpty) {
        updatedAnswerExplanation.type = 'text';
      } else {
        updatedAnswerExplanation.type = '';
      }

      uniq(allMediaTypesPresent).forEach((type) => {
        updatedAnswerExplanation.type += !updatedAnswerExplanation.type ? `${type}` : `_${type}`;
      });

      this.$store.dispatch('slideEditor/updateAnswerExplanation', { explain: updatedAnswerExplanation });
    },

    getTiptapValue() {
      return {
        text: isEmpty(this.answerExplanation.text)
          ? this.$constants.TipTap.INITIAL_TIP_TAP_VALUE
          : convertMathToKatex(this.answerExplanation.text, get(this.answerExplanation, 'math.latex', [])),
        isEmpty: this.tiptapEditor.isEmpty,
        isFocused: this.tiptapEditor.isFocused,
      };
    },

    onTiptapUpdate(value) {
      const { text } = value;
      const { hasMath, math } = evaluateMathTemplate(value.text);

      this.tiptapEditor.isEmpty = value.isEmpty;
      this.tiptapEditor.isFocused = value.isFocused;

      this.updateExplantionValueThrottled({
        math,
        hasMath,
        text: this.tiptapEditor.isEmpty ? '' : text,
      });
    },

    deleteAnswerExplanation() {
      this.toggleExplanationBeingInView();
      this.updateExplantionValue(QuestionAnswerExplanation());

      this.$emit('deleteAnswerExplanation');
    },

    toggleExplanationBeingInView() {
      this.$store.dispatch('contentEditor/toggleIsAnswerExplanationsInView');
    },

    isExplanationMediaPresent(type) {
      return !isEmpty(this.explanationMediaObjects[type]);
    },

    onAddMediaClick(mediaType) {
      if (mediaType === 'video') {
        this.$analytics.logEvent(this.$webEvents.QC_VIDEO_UPLOAD_INIT, {
          quizId: this.quizId,
          sourcePage: this.sourcePage,
        });
      }

      const handleAddingMedia = (media) => {
        this.updateExplantionValue({
          media: [media],
        });
      };

      let mediaPresent;

      if (this.isExplanationMediaPresent(mediaType)) {
        mediaPresent = this.explanationMediaObjects[mediaType];
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

    setSelectedQuestionElement(elementId = '') {
      // TODO(sarthak): Find a better way to handle keeping the ediitor focussed when clicking toolbar btns; is Debounce required?
      this.$store.dispatch('slideEditor/setTiptapEditorInFocus', { id: elementId, slideType: this.currentSlide.type });
    },

    deleteCurrentMedia() {
      this.updateExplantionValue({
        media: [],
      });
    },

    onMediaReEdit() {
      this.onAddMediaClick(this.mediaTypeAdded);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

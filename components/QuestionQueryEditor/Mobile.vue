<template>
  <div class="question-query-editor-container p-2 md:pb-1 flex flex-col when-media-container-hidden">
    <OnlyAudioMobile
      v-if="shouldShowOnlyAudioVariant"
      ref="editorContainer"
      v-bind="$props"
      v-on="eventsForOnlyAudioQueryEditor"
    />
    <MobilePreview
      v-if="shouldShowQuestionQueryPreview"
      v-bind="$props"
      ref="editorContainer"
      v-on="eventsForGeneralQueryEditor"
    />
    <GeneralMobile
      v-else
      v-bind="$props"
      ref="editorContainer"
      v-on="eventsForGeneralQueryEditor"
    />
    <TiptapMakeLinkModal
      isForQuizEditor
      showMobileLayout
    />
  </div>
</template>

<script>
import GeneralMobile from './Variants/General/Mobile.vue';
import OnlyAudioMobile from './Variants/OnlyAudio/Mobile.vue';
import MobilePreview from './Variants/General/MobilePreview.vue';

export default {

  components: {
    GeneralMobile,
    OnlyAudioMobile,
    MobilePreview,
  },

  props: {
    questionType: {
      type: String,
      required: true,
    },

    questionSettings: {
      type: Object,
      required: true,
    },

    isMediaContainerHidden: {
      type: Boolean,
      required: true,
    },

    isTextContainerHidden: {
      type: Boolean,
      required: true,
    },

    isMediaEditorVisible: {
      type: Boolean,
      required: true,
    },

    doesQuestionHaveAnyMedia: {
      type: Boolean,
      required: true,
    },

    queryMediaObjects: {
      type: Object,
      required: true,
    },

    canVideoBeDisplayed: {
      type: Boolean,
      required: true,
    },

    queryEditorId: {
      type: String,
      required: true,
    },

    queryResizeFontJumps: {
      type: Array,
      required: true,
    },

    isTipTapEditorInFocus: {
      type: Boolean,
      required: true,
    },

    getTiptapValue: {
      type: Function,
      required: true,
    },

    isQuestionMediaPresent: {
      type: Function,
      required: true,
    },

    questionMediaImageLayout: {
      type: String,
      default: '',
    },

    selectedSlideType: {
      type: String,
      default: '',
      required: true,
    },

    videoStartTime: {
      type: Number,
      required: true,
    },

    videoEndTime: {
      type: Number,
      required: true,
    },

    questionAnswer: {
      type: [Number, Array],
      default: () => [],
    },

    questionQuery: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['onAddMediaClick', 'updateValue', 'deleteCurrentMedia', 'onMediaReEdit', 'setSelectedQuestionElement', 'onHideMediaClick', 'onAddTextClick', 'focusTipTap', 'evaluateQueryContentVisibility', 'openMathEditor', 'onTiptapUpdate'],

  data() {
    return {
      showPreview: true,
    };
  },

  computed: {
    shouldShowOnlyAudioVariant() {
      return [this.$constants.QuestionTypes.DND_IMAGE, this.$constants.QuestionTypes.HOTSPOT].includes(this.questionType);
    },

    shouldShowQuestionQueryPreview() {
      return [this.$constants.QuestionTypes.CLASSIFICATION].includes(this.questionType) && this.showPreview;
    },

    eventsForOnlyAudioQueryEditor() {
      return {
        onAddMediaClick: this.onAddMediaClick,
        updateValue: this.updateValue,
        deleteCurrentMedia: this.deleteCurrentMedia,
        onMediaReEdit: this.onMediaReEdit,
        setSelectedQuestionElement: this.setSelectedQuestionElement,
        onHideMediaClick: this.onHideMediaClick,
        onAddTextClick: this.onAddTextClick,
        focusTipTap: this.focusTipTap,
        evaluateQueryContentVisibility: this.evaluateQueryContentVisibility,
        openMathEditor: this.openMathEditor,
        onTiptapUpdate: this.onTiptapUpdate,
      };
    },

    eventsForGeneralQueryEditor() {
      return {
        onAddMediaClick: this.onAddMediaClick,
        updateValue: this.updateValue,
        deleteCurrentMedia: this.deleteCurrentMedia,
        onMediaReEdit: this.onMediaReEdit,
        setSelectedQuestionElement: this.setSelectedQuestionElement,
        onHideMediaClick: this.onHideMediaClick,
        onAddTextClick: this.onAddTextClick,
        focusTipTap: this.focusTipTap,
        evaluateQueryContentVisibility: this.evaluateQueryContentVisibility,
        openMathEditor: this.openMathEditor,
        onTiptapUpdate: this.onTiptapUpdate,
        edit: this.onEdit,
      };
    },
  },

  watch: {
    isTipTapEditorInFocus(newVal) {
      if (!newVal) { this.showPreview = true; }
    },
  },

  methods: {
    onAddMediaClick(mediaType) {
      this.$emit('onAddMediaClick', mediaType);
    },

    updateValue(value) {
      this.$emit('updateValue', value);
    },

    deleteCurrentMedia() {
      this.$emit('deleteCurrentMedia');
    },

    onMediaReEdit() {
      this.$emit('onMediaReEdit');
    },

    setSelectedQuestionElement(elementId = '') {
      this.$emit('setSelectedQuestionElement', elementId);
    },

    onHideMediaClick() {
      this.$emit('onHideMediaClick');
    },

    onAddTextClick() {
      this.$emit('onAddTextClick');
    },

    focusTipTap() {
      this.$emit('focusTipTap');
    },

    evaluateQueryContentVisibility(forceShowMediaContainer = false) {
      this.$emit('evaluateQueryContentVisibility', forceShowMediaContainer);
    },

    openMathEditor() {
      this.$emit('openMathEditor');
    },

    onTiptapUpdate(value) {
      this.$emit('onTiptapUpdate', value);
    },

    onEdit() {
      this.showPreview = false;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

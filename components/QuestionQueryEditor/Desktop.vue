<template>
  <OnlyAudioDesktop
    v-if="shouldShowAudioVariant"
    ref="editorContainer"
    v-bind="$props"
    v-on="eventsOfOnlyAudioQueryEditor"
  />
  <General
    v-else
    ref="editorContainer"
    v-bind="$props"
    v-on="eventsOfGeneralQueryEditor"
  />
</template>

<script>
import Constants from '~/config/Constants';
import OnlyAudioDesktop from '~/components/QuestionQueryEditor/Variants/OnlyAudio/Desktop.vue';
import General from '~/components/QuestionQueryEditor/Variants/General/Desktop.vue';

export default {

  components: {
    OnlyAudioDesktop,
    General,
  },

  props: {
    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },

    questionType: {
      type: String,
      required: true,
    },

    questionMediaImageLayout: {
      type: String,
      default: '',
    },

    questionQuery: {
      type: Object,
      default: () => ({}),
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

    videoStartTime: {
      type: Number,
      required: true,
    },

    videoEndTime: {
      type: Number,
      required: true,
    },

    questionAnswer: {
      type: [Array, Number],
      default: () => [],
    },
  },
  emits: ['blur', 'undo', 'onAddMediaClick', 'updateValue', 'deleteCurrentMedia', 'onMediaReEdit', 'setSelectedQuestionElement', 'onHideMediaClick', 'onAddTextClick', 'focusTipTap', 'evaluateQueryContentVisibility', 'openMathEditor', 'onTiptapUpdate', 'action'],

  computed: {
    shouldShowAudioVariant() {
      return [Constants.QuestionTypes.DND_IMAGE, Constants.QuestionTypes.HOTSPOT].includes(this.questionType);
    },

    eventsOfOnlyAudioQueryEditor() {
      return {
        onTiptapUpdate: this.onTiptapUpdate,
        onAddMediaClick: this.onAddMediaClick,
        openMathEditor: this.openMathEditor,
        deleteCurrentMedia: this.deleteCurrentMedia,
      };
    },

    eventsOfGeneralQueryEditor() {
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
        action: this.handleAction,
        blur: () => this.$emit('blur'),
        undo: () => this.$emit('undo'),
      };
    },
  },

  methods: {
    onAddMediaClick(mediaType, shouldAllowMultiple = false) {
      this.$emit('onAddMediaClick', mediaType, shouldAllowMultiple);
    },

    updateValue(value) {
      this.$emit('updateValue', value);
    },

    deleteCurrentMedia(mediaType) {
      this.$emit('deleteCurrentMedia', mediaType);
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

    handleAction() {
      this.$emit('action', 'add-blank');
    },
  },
};
</script>

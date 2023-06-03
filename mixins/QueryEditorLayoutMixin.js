import Constants from '~/config/Constants';

export default {
  emits: ['onTiptapUpdate'],

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

  mounted() {
    this.$refs.tiptap?.focus();
  },

  methods: {
    onTiptapUpdate(value) {
      this.$emit('onTiptapUpdate', value);
    },

    /**
     *
     * @param {'audio' | 'video' | 'image'} mediaType the type of media user wants to add
     * @param {Boolean} shouldAllowMultipleMedia - whether to allow multiple media of different types
     * @description emits an event to parent component to add media and opens the media editor modals
     */
    onAddMediaClick(mediaType, shouldAllowMultipleMedia = false) {
      this.$emit('onAddMediaClick', mediaType, shouldAllowMultipleMedia);
    },

    openMathEditor() {
      this.$emit('openMathEditor');
    },
  },
};

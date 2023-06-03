import { isInteractiveBlankBasedQuestion } from '~/utils/QuizUtils';

export default {
  emits: ['onTiptapUpdate', 'onAddMediaClick', 'updateValue', 'deleteCurrentMedia', 'onMediaReEdit', 'setSelectedQuestionElement', 'onHideMediaClick', 'onAddTextClick', 'focusTipTap', 'evaluateQueryContentVisibility', 'openMathEditor'],

  computed: {
    isDrawQuestion() {
      return this.questionType === this.$constants.QuestionTypes.DRAW;
    },

    isInteractiveBlankBasedQuestion() {
      return isInteractiveBlankBasedQuestion({ type: this.questionType });
    },

    isAddBlankDisabled() {
      return this.questionQuery?.text?.split('<blank').length - 1 >= this.$constants.QuestionOptionLimits[this.questionType]?.maxBlanks;
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
  },
};

<template>
  <div class="relative flex items-center justify-between bg-dark-1 text-light p-2 font-bold rounded-lg">
    <div class="flex">
      <div
        v-if="!isSingleQuestionPreview"
        class="fraction-text min-w-16 px-3 py-2 bg-light-10% rounded-lg text-xs flex justify-center items-end shrink"
      >
        <span class="text-lg">{{ $i18n(currentQuestionIndex + 1) }}</span> /{{ $i18n(maxQuestions) }}
      </div>
      <div :class="`px-3 py-2 min-w-40 transition-all duration-1000 ml-2 text-light-3 rounded-lg flex items-center justify-center bg-brand-${getQuestionBrandColor}`">
        <FA
          :icon="getQuestionIcon"
          :size="18"
        />
        <span
          :key="getQuestionTitle"
          class="ml-2 text-sm"
        >{{ $i18n(getQuestionTitle) }}</span>
      </div>
    </div>

    <span class="px-4 py-2 bg-light-10% rounded-lg absolute left-1/2 -ml-20">{{ $i18n('Participant\'s view') }}</span>

    <Button
      v-tooltip.top="$i18n('Close (Esc)')"
      data-cy="close-preview-modal-button"
      :class="{ 'is-nudge-on': onLastQuestion }"
      licon="fas fa-times"
      size="lg"
      type="transparent"
      :aria-label="($i18n('close Keyboard Shortcut(Escape)'))"
      @click="closePreviewModal"
    />
  </div>
</template>

<script>
import { getAllContentTypes } from '../../utils/QuizUtils';

export default {
  props: {
    questionType: {
      type: String,
      required: true,
    },

    currentQuestionIndex: {
      type: Number,
      required: true,
    },

    maxQuestions: {
      type: Number,
      required: true,
    },

    isSingleQuestionPreview: {
      type: Boolean,
      default: false,
    },

    quizId: {
      type: String,
      required: true,
    },
  },
  emits: ['close'],

  data() {
    return {
      questionTypes: getAllContentTypes(),
    };
  },

  computed: {
    getQuestionTitle() {
      return this.questionTypes[this.questionType].title;
    },

    getQuestionBrandColor() {
      return this.questionTypes[this.questionType].brandColor;
    },

    getQuestionIcon() {
      return this.questionTypes[this.questionType].icon;
    },

    onLastQuestion() {
      if (this.isSingleQuestionPreview) {
        return false;
      }
      return this.currentQuestionIndex === this.maxQuestions - 1;
    },
  },

  mounted() {
    window.addEventListener('keydown', this.onKeyDownEvent);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDownEvent);
  },

  methods: {
    onKeyDownEvent(ev) {
      if (ev.key === 'Escape') {
        this.$emit('close');
      }
    },

    closePreviewModal() {
      if (this.isSingleQuestionPreview) {
        this.$analytics.logEvent(this.$webEvents.PARTICIPANTS_VIEW_ON_EDITOR_CLOSED, {
          questionType: this.questionType,
          quizId: this.quizId,
        });
      } else {
        this.$analytics.logEvent(this.$webEvents.PREVIEW_CLOSE);
      }
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.fraction-text {
  line-height: 20px;
}

.is-nudge-on {
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: theme('backgroundColor.light.33%');
    border-radius: inherit;

    animation: strobingNudge 2s ease 500ms infinite;
  }
}

@keyframes strobingNudge {
  0% {
    transform: scale(1.15);
  }

  25% {
    transform: scale(1.4);
  }
/* 20, 45 */
/* 10, 25 */
  50% {
    transform: scale(1.25);
  }

  75% {
    transform: scale(1.4);
  }

  100% {
    transform: scale(1.15);
  }
}
</style>

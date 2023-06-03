<template>
  <div class="question-type-toggler">
    <PopoverInfo
      trigger="manual"
      placement="top"
      type="warn"
      :class="{
        '-ml-2': !isDesktopView,
      }"
      :open="isMultipleAnswerWarningTooltipVisible"
    >
      <div
        v-if="canToggleMultipleAnswers"
        class="toggle-btn py-2 pr-4 pl-2 flex flex-row items-center bg-dark-50% text-light text-xs font-bold rounded"
        :class="{
          'w-full justify-center': !isDesktopView,
          'justify-start': isDesktopView,
        }"
      >
        <button
          v-tooltip.top="{ content: multipleAnswerTooltip, triggers: shouldShowMultipleAnswerWarningTooltip, distance: 8 }"
          type="button"
          class="flex flex-row items-center"
          data-cy="more-than-one-answer-button"
          @click.stop.prevent="onInputChange"
        >
          <Switchbox
            inputId="questionMultipleAnswersSwitch"
            name="multipleAnswersSwitch"
            :aria-label="$i18n('Allow multiple answers for the question')"
            size="sm"
            :value="value"
            :tabindex="tabindex"
            backgroundColor="light"
          />

          <span class="ml-2">
            <i18n
              v-if="isQuestionForPoll"
              :key="1"
            >Allow more than one selection</i18n>

            <i18n
              v-else
              :key="2"
            >More than one correct answer</i18n>
          </span>
        </button>

        <Tooltip
          v-bind="tooltipData"
          class="mark-option-as-correct-tooltip relative z-10"
          :tooltipContentStyle="{ fontSize: '0.75rem' }"
        >
          <div class="flex justify-center items-center pt-1 w-10 h-3">
            <FA
              v-if="!isQuestionForPoll"
              icon="fas fa-info-circle"
            />
          </div>
        </Tooltip>
      </div>

      <template #popover-content>
        <div class="body p-3 text-xs max-w-40">
          <i18n>Toggle this if there is more than one correct answer to your question</i18n>
        </div>
      </template>
    </PopoverInfo>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { isQuestionForPoll } from '../utils/QuizUtils.js';
import Question from '../models/Question';
import { validateWithModelFactory } from '../utils/Utilities';

export default {
  props: {
    isMultipleAnswerWarningTooltipVisible: {
      type: Boolean,
      default: false,
    },

    canToggleMultipleAnswers: {
      type: Boolean,
      default: false,
    },

    value: {
      type: Boolean,
      default: false,
    },

    currentQuestion: {
      type: Object,
      required: true,
      default: () => ({}),
      // validator: validateWithModelFactory(Question),
    },

    tabindex: {
      type: Number,
      default: 0,
    },
  },
  emits: ['input'],

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('contentEditor', ['isEditorForPresentationContent']),

    tooltipData() {
      return {
        text: this.$i18n('Full points are awarded only if all correct answers are selected.'),
        theme: 'dark',
        showOnHover: true,
        position: this.isDesktop ? 'top' : 'top-left',
        tooltipSize: 'sm',
        forceShowTooltip: true,
      };
    },

    isDesktopView() {
      return this.isDesktop || this.isEditorForPresentationContent;
    },

    shouldShowMultipleAnswerWarningTooltip() {
      if (!this.isDesktopView) {
        return [];
      }

      return this.isMultipleAnswerWarningTooltipVisible ? [] : ['hover'];
    },

    multipleAnswerTooltip() {
      if (this.isQuestionForPoll) {
        return this.$i18n('Toggle this if multiple options can be selected');
      }

      return this.$i18n('Toggle this if there is more than one correct answer to your question');
    },

    isQuestionForPoll() {
      return isQuestionForPoll(this.currentQuestion);
    },

  },

  methods: {
    onInputChange(ev) {
      this.$emit('input');
    },
  },

};
</script>

<style lang="scss">
  .multiple-selector-popover-container {
    width: calc(100% + 16px);

    @media screen and ( min-width: 1025px ) {
      width: initial;
    }

    >.trigger {
      display: flex !important;

      @media screen and ( min-width: 1025px ) {
        display: inline-block;
      }
    }
  }

</style>

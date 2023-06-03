<template>
  <div
    class="dnd-image-editor h-full flex flex-col gap-y-3"
    :class="{
      'p-4 bg-dark-20% border-1 border-light-20% rounded-lg': !isForMobile,
      'relative p-2': isForMobile,
    }"
    @click="handleContainerClick"
  >
    <Button
      v-if="!isForMobile"
      v-tooltip.bottom="{
        content: addOptionTooltip,
        theme: 'error-tooltip',
      }"
      :tabIndex="101"
      :title="$i18n('Add an option {$1}', [questionImage?.url ? `(${questionOptions.length}/10)` : ''])"
      :class="{
        'opacity-20 hover:bg-light-20%': !questionImage?.url,
      }"
      size="xl"
      :type="questionImage?.url ? 'white' : 'transparent'"
      :applyDisabled="false"
      :disabled="isOptionLimitReached"
      @click="addOption"
    />

    <div
      v-if="isForMobile"
      class="text-light-3 font-semibold"
    >
      <i18n>Answer options</i18n>
    </div>

    <div
      ref="optionsContainer"
      class="max-h-full overflow-y-auto h-full w-full gap-y-3"
    >
      <div class="flex flex-col h-full gap-y-3">
        <transition-group
          enter-active-class="animate__animated animate__fadeIn animation-duration-300"
          leave-active-class="animate__animated animate__fadeOut animation-duration-200"
        >
          <div
            v-for="option, index in questionOptions"
            :key="`option-${index}`"
            :ref="`option-${option._id}`"
            v-click-outside="() => handleOptionClickOutside(option)"
            class="w-full rounded-lg border-3 gap-2 p-2 flex items-center"
            :class="{
              'empty-option': !questionImage?.url,
              'bg-light-5% border-light-3': focussedOptionId === option._id,
              'bg-light-20% border-transparent': highlightedOptionId !== option._id && focussedOptionId !== option._id,
              'bg-light-33% border-1 border-light-3': highlightedOptionId === option._id,
            }"
          >
            <button
              v-tooltip.top="checkboxTooltip(option)"
              type="button"
              class="border flex items-center justify-center border-light-2 rounded-full text-light-3 font-semibold"
              :class="{
                'bg-green': targetIdForOptionId[option._id],
                'min-w-7 h-7': !isForMobile,
                'min-w-4 h-4': isForMobile,
                'mark-answer-nudge': nudgeForMarkingAnswer && option.text,
              }"
              :tabindex="(101 + (index * 3)) + index + 1"
              @click.stop="toggleCheck(option._id)"
            >
              <FA
                icon="fas fa-check"
                :size="isForMobile ? 8 : 14"
              />
            </button>
            <KatexRenderer
              v-if="option.hasMath"
              :ref="`katex-${index}`"
              :tabindex="(101 + (index * 3)) + index + 2"
              class="w-full"
              :latex="option.math.latex[0]"
              type="transparent"
              @click.stop="handleMathInputIntent(option)"
              @change="updateOptionLabel(index, $event, true)"
              @close="() => {
                focussedOptionId = null;
                isMathAdditionInProgress = false;
              }"
            />
            <input
              v-else
              :ref="`optionInput-${option._id}`"
              v-tooltip.bottom="{
                theme: 'error-tooltip',
                triggers: [],
                shown: textInAllOptions[option.text] > 1 && focussedOptionId === option._id,
                content: $i18n('Duplicate option exists'),
              }"
              :tabindex="(101 + (index * 3)) + index + 2"
              class="w-full bg-transparent text-light-2 placeholder-light-33% font-semibold"
              :class="{
                'text-xl': !isForMobile,
                'text-lg': isForMobile,
              }"
              type="text"
              maxlength="35"
              :value="option.text"
              :placeholder="$i18n('Add option text here...')"
              @input="updateOptionLabel(index, $event.target.value)"
              @focus="handleOptionInputFocus(option)"
              @click.stop
              @keydown.backspace="handleBackspace(option)"
              @keydown.enter="handleOptionClickOutside(option)"
            />
            <span
              v-if="focussedOptionId === option._id && option.text.length >= 25"
              class="text-light-2 text-xs font-semibold flex items-end h-full"
            >
              {{ option.text.length }}/35
            </span>
            <Button
              v-tooltip.bottom="optionActionButton(option).tooltip"
              :tabindex="(101 + (index * 3)) + index + 3"
              v-bind="optionActionButton(option).props"
              v-on="optionActionButton(option).events"
            />
          </div>
        </transition-group>
      </div>
    </div>

    <div
      v-if="isForMobile"
      class="bg-dark-1 p-2 fixed left-0 bottom-0 flex items-center gap-2 w-full"
    >
      <Button
        licon="fas fa-arrow-left"
        size="sm"
        type="white"
        @click="handleBack"
      />
      <Button
        class="w-full"
        licon="fas fa-plus-square"
        size="sm"
        type="white"
        :title="$i18n('Add new option')"
        @click="addOption"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import debounce from 'lodash/debounce';
import isNumber from 'lodash/isNumber';
import ObjectId from 'bson-objectid';

import QuestionOption from '~/models/QuestionOption';
import { isOptionEmpty } from '~/utils/QuizUtils';

const OPTION_LENGTH_LIMIT = 10;

export default {
  props: {
    isForMobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],

  data() {
    return {
      focussedOptionId: null,
      highlightedOptionId: null,

      isMathAdditionInProgress: false,
      hideTooltip: false,
      nudgeForMarkingAnswer: false,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('contentEditor', ['questionEditorDimensions', 'quizType']),
    ...mapGetters('uiManager', ['focussedOptionInDndImage', 'editorSaveValidations']),

    questionAnswer() {
      return isNumber(this.currentSlide.structure.answer) ? [] : this.currentSlide.structure.answer;
    },

    questionOptions() {
      return this.currentSlide.structure.options;
    },

    questionTargets() {
      return this.currentSlide.structure.targets;
    },

    questionImage() {
      return this.currentSlide.structure.query.media.find((media) => media.type === 'image');
    },

    editorScale() {
      if (this.isForMobile || !this.questionEditorDimensions.scale) {
        return 1;
      }

      return this.questionEditorDimensions.scale;
    },

    isAddOptionDisabled() {
      return this.isOptionLimitReached || !this.questionImage?.url;
    },

    addOptionTooltip() {
      if (this.isOptionLimitReached) {
        return this.$i18n('You can only add up to 10 options');
      }
      return '';
    },

    optionActionButton() {
      return (option) => {
        const buttonProps = {
          size: this.isForMobile ? 'xs' : 'sm',
          type: 'transparent',
          licon: 'fas fa-trash-alt',
          class: 'ml-auto hover:bg-red',
          ariaLabel: this.$i18n('Delete option'),
        };

        let tooltip = this.$i18n('Delete option');

        if (!option.text && this.focussedOptionId === option._id) {
          buttonProps.licon = 'fas fa-function';
          buttonProps.ariaLabel = this.$i18n('Add math');
          buttonProps.class = 'ml-auto';
          tooltip = this.$i18n('Insert equation');
        }

        return {
          props: buttonProps,
          tooltip,
          events: {
            click: () => {
              if (!option.text && this.focussedOptionId === option._id) {
                this.handleMathInputIntent(option);
                return;
              }

              this.handleOptionDeletion(option._id);
            },
          },
        };
      };
    },

    isOptionLimitReached() {
      return this.questionOptions.length >= OPTION_LENGTH_LIMIT;
    },

    textInAllOptions() {
      const optionText = {};

      this.questionOptions.forEach((option) => {
        if (option.text.trim() === '') {
          return;
        }
        if (!optionText[option.text]) {
          optionText[option.text] = 0;
        }
        optionText[option.text] += 1;
      });

      return optionText;
    },

    checkboxTooltip() {
      return (option) => {
        const tooltip = {
          triggers: ['hover', 'click'],
          content: option.text?.trim() ? '' : this.$i18n('Please add some text first'),
          theme: 'error-tooltip',
        };

        return tooltip;
      };
    },

    targetIdForOptionId() {
      const targetIdMap = {};

      this.questionAnswer.forEach((answer) => {
        targetIdMap[answer.optionId] = answer.targetId;
      });

      return targetIdMap;
    },

    optionsMappedById() {
      const optionMap = {};

      this.currentSlide.structure.options.forEach((option) => {
        optionMap[option._id] = option;
      });

      return optionMap;
    },

    targetsMappedById() {
      const targetData = {};

      this.currentSlide.structure.targets.forEach((target) => {
        targetData[target.id] = target;
      });

      return targetData;
    },
  },

  watch: {
    focussedOptionInDndImage(optionIdToFocus) {
      this.highlightedOptionId = optionIdToFocus;

      if (!optionIdToFocus) {
        return;
      }

      const refName = `option-${optionIdToFocus}`;
      const { top, height } = this.$refs[refName]?.[0]?.getBoundingClientRect() || {};
      const { top: containerTop, height: containerHeight } = this.$refs.optionsContainer?.getBoundingClientRect() || {};

      if (top + height > containerTop + containerHeight) {
        this.$refs.optionsContainer.scroll({
          top: top - containerTop + height,
          behavior: 'smooth',
        });
      }

      if (top < containerTop) {
        this.$refs.optionsContainer.scroll({
          top: containerTop - top - height - 10,
          behavior: 'smooth',
        });
      }
    },

    editorSaveValidations: {
      immediate: true,
      handler() {
        this.checkAndToggleMarkAnswerNudge();
      },
    },
  },

  mounted() {
    this.validateQuestion();

    this.$eventBus.$on('questionEditor:triggerPreSaveActions', this.preSaveHook);
  },

  beforeUnmount() {
    clearTimeout(this.tooltipTimer);

    this.$eventBus.$off('questionEditor:triggerPreSaveActions', this.preSaveHook);
    this.strobingNudgeTimer && clearTimeout(this.strobingNudgeTimer);
  },

  methods: {
    checkAndToggleMarkAnswerNudge() {
      if (this.editorSaveValidations.length > 1) {
        this.nudgeForMarkingAnswer = false;
        return;
      }

      const markAnswerValidation = this.editorSaveValidations[0]?.errorCode === this.$constants.QuestionValidationErrorCodes.ANSWER_NOT_MARKED;

      this.nudgeForMarkingAnswer = markAnswerValidation;

      if (this.nudgeForMarkingAnswer) {
        this.strobingNudgeTimer = setTimeout(() => {
          this.nudgeForMarkingAnswer = false;
        }, 8000);
      }
    },

    addOption() {
      if (this.isAddOptionDisabled) {
        if (!this.questionImage?.url) {
          this.$eventBus.$emit('dndImageEditorCanvas:showImageValidation');
        }
        return;
      }

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.LABELLING_ANSWER_OPTION_ADDED);
      this.$analytics.logEvent(eventName);

      const newOption = QuestionOption();
      this.updateOptionsForQuestion([newOption, ...this.questionOptions]);

      this.$nextTick(() => {
        this.$refs[`optionInput-${newOption._id}`][0].focus();
      });
    },

    handleBackspace(option) {
      if (option.text) {
        return;
      }

      this.handleOptionDeletion(option._id);
    },

    updateOptionLabel: debounce(function updateOptionLabel(optionIndex, value, isLatexInput = false) {
      const text = this.$stringUtils.escapeHTML(value);
      let updatedValue = { text };

      if (isLatexInput) {
        updatedValue = {
          text: `<katex latex="${text}"></katex>`,
          math: {
            latex: [text],
            template: null,
          },
          hasMath: true,
        };
      }

      const option = { ...this.questionOptions[optionIndex], ...updatedValue };
      this.updateSingleQuestionOption(option, optionIndex);
    }, 250),

    handleOptionDeletion(id) {
      const options = this.questionOptions.filter((option) => option._id !== id);

      if (this.targetIdForOptionId[id]) {
        this.removeOptionFromAnswer(id, options);
        return;
      }

      this.updateOptionsForQuestion(options);
    },

    removeOptionFromAnswer(optionId, options) {
      const answer = this.questionAnswer.filter((answer) => answer.optionId[0] !== optionId);
      const targets = this.questionTargets.filter((target) => target.id !== this.targetIdForOptionId[optionId]);

      this.$store.dispatch('slideEditor/updateMultipleQuestionProperties', { options, answer, targets });
      this.validateQuestion();
    },

    toggleCheck(optionId) {
      if (this.targetIdForOptionId[optionId]) {
        this.removeOptionFromAnswer(optionId, this.questionOptions);
        return;
      }

      if (!this.optionsMappedById[optionId].text) {
        return;
      }

      const newTargetId = ObjectId().toHexString();
      const [mobile, desktop] = [50, 60];
      const { width } = this.$refs[`option-${optionId}`][0].getBoundingClientRect();
      this.$store.dispatch(
        'slideEditor/updateMultipleQuestionProperties',
        {
          answer: [...this.questionAnswer, {
            targetId: newTargetId,
            optionId: [optionId],
          }],
          targets: [...this.questionTargets, {
            id: newTargetId,
            position: {
              x: width / 2 / this.editorScale,
              y: 30 + (this.questionTargets.length * (this.isMobile ? mobile : desktop)),
            },
          }],
        },
      );

      this.validateQuestion();
    },

    handleOptionInputFocus(option) {
      this.focussedOptionId = option._id;
    },

    handleMathInputIntent(option) {
      this.isMathAdditionInProgress = true;
      this.focussedOptionId = option._id;

      this.$eventBus.$emit('presentationEditor:showMathEditor', {
        callback: (latex) => {
          this.isMathAdditionInProgress = false;
          const optionIndex = this.questionOptions.findIndex((opt) => opt._id === option._id);
          this.updateOptionLabel(optionIndex, latex, true);
          this.focussedOptionId = null;
        },
        closeCallback: () => {
          this.isMathAdditionInProgress = false;
          this.focussedOptionId = null;
        },
      });
    },

    handleBack() {
      this.preSaveHook();

      this.$nextTick(() => {
        this.$emit('close');
      });
    },

    handleOptionClickOutside(option) {
      if (this.focussedOptionId !== option._id) {
        return;
      }

      const inputRefName = `optionInput-${option._id}`;
      this.$refs[inputRefName][0]?.blur();

      this.handleOptionInputBlur(option);
    },

    handleOptionInputBlur(option) {
      if (!this.isMathAdditionInProgress) {
        this.focussedOptionId = null;
      }

      if (Object.keys(this.textInAllOptions).length === 1) {
        this.$store.dispatch('uiManager/toggleEducationForDndImage', true);
        !this.targetIdForOptionId[option._id] && this.toggleCheck(option._id);
        return;
      }

      if (this.textInAllOptions[this.optionsMappedById[option._id].text] > 1) {
        this.handleOptionDeletion(option._id);
      }
    },

    handleContainerClick() {
      if (this.questionImage?.url) {
        return;
      }

      this.$eventBus.$emit('dndImageEditorCanvas:showImageValidation');
    },

    // ! deleting options which are invalid before saving
    preSaveHook() {
      const invalidTargetIds = [];
      const options = this.questionOptions.filter((option) => {
        const isEmptyOption = isOptionEmpty(option);
        if (isEmptyOption) {
          invalidTargetIds.push(this.targetIdForOptionId[option._id]);
        }
        return !isEmptyOption;
      });
      const answer = this.questionAnswer.filter((answer) => !invalidTargetIds.includes(answer.targetId));
      const targets = this.questionTargets.filter((target) => !invalidTargetIds.includes(target.id));

      this.$store.dispatch('slideEditor/updateMultipleQuestionProperties', { options, answer, targets });
    },

    // ! store actions
    updateSingleQuestionOption(option, index) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', { option, index });

      this.validateQuestion();
    },

    updateOptionsForQuestion(options) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options });

      this.validateQuestion();
    },

    validateQuestion() {
      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.empty-option {
  background: theme('colors.dark.10%');
  height: 40px;
  * {
    display: none;
  }
}

.mark-answer-nudge {
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    width: 30px;
    height: 30px;
    background-color: theme('backgroundColor.light.33%');
    border-radius: inherit;

    animation: strobingNudge 2s ease 200ms infinite;
  }
}

@keyframes strobingNudge {
  0% {
    transform: scale(1.15);
  }

  25% {
    transform: scale(1.8);
  }

  50% {
    transform: scale(1.35);
  }

  75% {
    transform: scale(1.8);
  }

  100% {
    transform: scale(1.15);
  }
}
</style>

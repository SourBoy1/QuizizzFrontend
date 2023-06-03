<template>
  <div>
    <div
      class="relative flex flex-col items-center justify-start w-full h-full question-typing-input-editor-container"
      :class="{
        'px-16 py-10': isQuestionOEQ && isContainerDeviceDesktop,
        'pb-20 pt-2 px-2 rounded-lg': isQuestionOEQ && !isContainerDeviceDesktop,
        'py-4': isQuestionFIB && isContainerDeviceDesktop,
        'bg-dark-20% rounded-2xl': isContainerDeviceDesktop && isQuestionOEQ,
        'bg-dark-20%': !isContainerDeviceDesktop && isQuestionOEQ,
        'bg-none': isContainerDeviceDesktop && isQuestionFIB,

      }"
    >
      <template v-if="isQuestionOEQ">
        <p class="font-medium text-3xl text-light-66% mt-16 mb-5">
          <i18n v-if="isWordCloudTypeQuestion">
            Participants can answer in 1-2 words max.
          </i18n>
          <i18n v-else>
            Participants will type their responses
          </i18n>
        </p>
        <CustomResponseController
          v-if="showCustomResponseController"
          class="px-3 mt-6 mb-0"
          :receivedCanSubmitCustomResponse="getCanSubmitCustomResponse()"
        />
      </template>

      <template v-if="isQuestionFIB">
        <div
          class="flex flex-col gap-4 items-center justify-center w-full h-24 bg-dark-20% answer-container relative rounded-lg"
          :class="[
            { 'pt-0': isContainerDeviceDesktop },
            { 'p-4': !isContainerDeviceDesktop },
          ]"
        >
          <p
            class="font-semibold text-light-50% absolute left-4"
            :class="isContainerDeviceDesktop ? 'text-lg top-4' : 'text-tn top-1'"
          >
            <i18n>Correct answer</i18n>
          </p>
          <div
            class="flex flex-col gap-1 self-center"
            :class="isContainerDeviceDesktop ? 'w-150' : 'w-full max-h-[350px]'"
          >
            <div class="flex items-center gap-2">
              <div class="h-12 bg-light-10% flex w-full relative rounded-t">
                <input
                  id="correct-answer"
                  ref="correctAnswerInput"
                  v-tooltip.top="{
                    triggers: [], shown: isCapitalLetter, content: $i18n('Answers are not case sensitive'), theme: 'info-tooltip',
                  }"
                  :value="correctAnswerValue"
                  :class="isContainerDeviceDesktop ? 'text-xl' : 'text-base'"
                  class="correct-answer w-full bg-transparent placeholder-light-33% placeholder:normal-case text-light-3 font-bold h-full pl-3 pr-26 border-2 border-t-transparent rounded-t border-x-transparent border-b-2 border-b-light-3% focus:rounded focus:border-2 focus:border-light-3 focus:outline-none"
                  :placeholder="$i18n('Type your answer here')"
                  maxlength="40"
                  tabindex="149"
                  autocomplete="off"
                  autocorrect="off"
                  :aria-label="$i18n('Type your answer here')"
                  :aria-required="true"
                  @focus="isAnswerInputFocused = true; resizePreviewBoxes();"
                  @blur="isAnswerInputFocused = false; resizePreviewBoxes();"
                  @keydown.enter="(e) => { e.preventDefault(); $refs?.correctAnswerInput?.blur() }"
                  @input="onCorrectAnswerInput"
                />
                <div
                  v-if="isAnswerInputFocused"
                  class="absolute top-[50%] -translate-y-1/2 right-11 p-0.5 bg-transparent"
                  :class="{ 'bg-red-dark px-1 rounded': correctAnswerValue.length >= 40 }"
                >
                  <span :class="correctAnswerValue.length === 40 ? 'text-light-3' : 'text-light-66%'">{{ correctAnswerValue.length }}/40</span>
                </div>
                <Button
                  v-if="isAnswerInputFocused"
                  buttonClasses="top-[50%] -translate-y-1/2 right-2 bg-light-20% rotate-90"
                  size="sm"
                  type="transparent"
                  licon="fas fa-level-down"
                  :iconOnly="true"
                  :absolutePositioning="true"
                  @click="$refs?.correctAnswerInput?.blur()"
                />
              </div>
              <Tooltip
                :isVisible="showToolTip"
                theme="dark"
                tooltipSize="sm"
                :text="getTooltipText"
                :showOnHover="showToolTip"
                position="bottom"
              >
                <Button
                  buttonClasses="h-12 w-12"
                  licon="fas fa-cog"
                  type="transparent"
                  theme="dark"
                  @click="handleSettingsButtonClick"
                />
              </Tooltip>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="flex flex-col gap-4 items-center justify-center w-full h-60 mt-4 bg-dark-20% relative rounded-lg overflow-y-auto">
          <p
            class="text-light-50% font-semibold absolute left-4"
            :class="isContainerDeviceDesktop ? 'text-lg top-4' : 'text-tn top-2'"
          >
            {{ getPreviewText }}
          </p>
          <template v-if="isBoxVariant">
            <p
              v-if="isContainerDeviceDesktop"
              class="text-xl text-light-50% font-bold"
            >
              <i18n>Type your answer in the boxes</i18n>
            </p>
            <div
              v-if="correctAnswerValue.length === 0"
              class="flex gap-1"
            >
              <div
                v-for="i in 8"
                :key="i"
                class="rounded bg-dark-50%"
                :class="isContainerDeviceDesktop ? 'w-16 h-16' : 'w-8 h-8'"
              />
            </div>
            <div
              v-else
              class="flex gap-1 max-w-full mx-4 flex-wrap justify-center"
            >
              <div
                v-for="char in correctAnswerAsArray"
                :key="char + getUUID()"
                class="char-box flex items-center justify-center rounded"
                :class="[isSpecialCharacter(char) ? `${isContainerDeviceDesktop ? 'w-8' : 'w-4'} bg-transparent` : `bg-dark-50% ${isContainerDeviceDesktop ? 'w-16 h-16' : 'w-8 h-8'}`]"
              >
                <span
                  class="char font-semibold text-light-3"
                  :class="isContainerDeviceDesktop ? isSpecialCharacter(char) ? 'text-2xl' : 'text-4xl' : 'text-xs'"
                >
                  {{ char }}
                </span>
              </div>
            </div>
          </template>
          <template v-else-if="showAlternativeOptions">
            <div
              class="flex flex-col gap-2 justify-start h-full py-6"
              :class="isContainerDeviceDesktop ? 'w-150' : 'w-[90%]'"
            >
              <FIBAlternativeOption
                v-for="(option, index) in optionsData"
                :key="option.id"
                :option="option"
                :isContainerDeviceDesktop="isContainerDeviceDesktop"
                @update-option="handleUpdateOption(index, $event)"
                @delete-option="handleDeleteOption(index)"
              />
              <Button
                :buttonClasses="`rounded h-12 ${isContainerDeviceDesktop ? 'w-1/2' : 'w-full'}`"
                :size="isContainerDeviceDesktop ? 'lg' : 'sm'"
                :title="$i18n('Add alternative answer')"
                licon="fas fa-plus"
                type="transparent"
                theme="dark"
                @click="handleAddAlternativeAnswer"
              />
            </div>
          </template>
          <template v-else-if="isSingleBlankVariant">
            <div
              class="flex items-center rounded-t h-12 p-4 mt-10 bg-light-10% text-light-33% border-b-4 border-light font-bold"
              :class="isContainerDeviceDesktop ? 'w-150 text-xl' : 'w-[92%] text-base'"
            >
              <i18n>Type your answer</i18n>...
            </div>
          </template>
        </div>
      </template>
      <slot />
    </div>
  </div>
</template>
<script>

import { mapGetters, mapActions } from 'vuex';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import unescape from 'lodash/unescape';

import FIBAlternativeOption from '~/components/FIBAlternativeOption.vue';

import { isWordCloudQuestion } from '~/utils/QuizUtils';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import { addSurvicateQueryParam } from '~/utils/SurvicateUtils';
import { getUUID } from '~/services/UIDService.js';
import QuestionOption from '../models/QuestionOption';
import Constants from '../config/Constants';

export default {

  components: {
    FIBAlternativeOption,
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

    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },
  },

  data() {
    const boxVariant = Constants.DisplayVariantNames[Constants.QuestionTypes.BLANK].BOX;
    const singleBlankVariant = Constants.DisplayVariantNames[Constants.QuestionTypes.BLANK].SINGLE_BLANK;
    return {
      correctAnswerValue: '',
      correctAnswerAsArray: [],
      isAnswerInputFocused: false,
      isAnswerGreaterthanCharLimit: false,
      isCapitalLetter: false,
      noOfPreviewBoxes: 8,
      boxVariant,
      singleBlankVariant,
      optionsData: [],
      disableEnableBlockLettersSetting: false,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('uiManager', ['isFIBalternativeAnswersEnabled', 'isFIBBoxSettingDisabledWhenAlternativeEnabled', 'isFIBBoxSettingDisabledWhenLangIsNotSupported', 'isFIBBoxSettingDisabledWhenExceedsMaxLength']),
    ...mapGetters('root', ['isDesktop']),

    fibAnswerOption() {
      return this.currentSlide?.structure?.options?.[0];
    },

    isContainerDeviceDesktop() {
      return this.forDevice === this.$constants.DeviceTypes.DESKTOP;
    },

    isQuestionFIB() {
      return this.questionType === this.$constants.QuestionTypes.BLANK;
    },

    isQuestionOEQ() {
      return this.questionType === this.$constants.QuestionTypes.OPEN;
    },

    isWordCloudTypeQuestion() {
      return isWordCloudQuestion(this.currentSlide);
    },

    doesFIBHaveMoreThanOneOption() {
      return this.currentSlide.structure?.options?.length > 1;
    },

    showCustomResponseController() {
      return !this.isWordCloudTypeQuestion;
    },

    showAlternativeOptions() {
      return this.isFIBalternativeAnswersEnabled && this.isSingleBlankVariant;
    },

    isBoxVariant() {
      return this.fibVariant === this.boxVariant;
    },

    isSingleBlankVariant() {
      return this.fibVariant === this.singleBlankVariant;
    },

    fibVariant() {
      return this.questionSettings?.questionDisplayVariant;
    },

    getPreviewText() {
      if (this.showAlternativeOptions) {
        return this.$i18n('Alternative Options');
      }
      if (this.$user.isCorporate) {
        return this.$i18n('Participant Preview');
      }
      return this.$i18n('Student Preview');
    },

    showToolTip() {
      return (this.isFIBBoxSettingDisabledWhenLangIsNotSupported || this.isFIBBoxSettingDisabledWhenExceedsMaxLength) && !this.isFIBBoxSettingDisabledWhenAlternativeEnabled;
    },

    getTooltipText() {
      if (this.isFIBBoxSettingDisabledWhenExceedsMaxLength) {
        return this.$i18n('Separate boxes are not supported for this answer length');
      }
      if (this.isFIBBoxSettingDisabledWhenLangIsNotSupported) {
        return this.$i18n('Separate boxes are not supported for this language');
      }
      return null;
    },

    questionHint() {
      return this.currentSlide?.structure?.hints?.[0]?.text ?? '';
    },

  },

  watch: {
    isFIBalternativeAnswersEnabled(newVal) {
      if (newVal) {
        this.optionsData = [...this.optionsData, new QuestionOption({ text: '', matcher: 'exact' })];
      }
    },

    correctAnswerValue: {
      handler() {
        this.resizePreviewBoxes();
      },

      immediate: true,
    },

    questionSettings: {
      handler(newVal) {
        if (newVal.questionDisplayVariant === this.boxVariant || (newVal.questionDisplayVariant === this.singleBlankVariant && !this.isFIBalternativeAnswersEnabled)) {
          this.updateQuestionOptions({ options: [this.fibAnswerOption] });
        }
      },
      deep: true,
    },
  },

  mounted() {
    if (!this.isQuestionFIB) {
      return;
    }
    this.updateSingleOptionValueDebounced = debounce(this.updateSingleOptionValue.bind(this), 300, { leading: true, trailing: true });
    this.$eventBus.$on('questionEditor:triggerPreSaveActions', this.preSaveHook);
    const answer = this.currentSlide?.structure?.options?.[0]?.text ?? '';
    const answerWithoutHTMLTags = answer.replace(/(<([^>]+)>)/ig, '');
    this.correctAnswerValue = answerWithoutHTMLTags;
    this.correctAnswerAsArray = this.correctAnswerValue?.split('');

    if (this.isLatinString(this.correctAnswerValue)) {
      if (this.correctAnswerValue.length > 40) {
        this.disableEnableBlockLettersSetting = true;
        this.toggleFIBBoxSettingDisabled({ condition: 'forMaxLength', value: true });
        this.setFIBVariant({ fibVariant: this.singleBlankVariant });
        this.isAnswerGreaterthanCharLimit = true;
      } else {
        this.disableEnableBlockLettersSetting = false;
        this.toggleFIBBoxSettingDisabled({ condition: 'forMaxLength', value: false });
        this.toggleFIBBoxSettingDisabled({ condition: 'forLanguageSupport', value: false });
        if (this.correctAnswerValue.length === 0) {
          this.setFIBVariant({ fibVariant: this.boxVariant });
        } else if (isEmpty(this.questionSettings?.questionDisplayVariant)) {
          this.setFIBVariant({ fibVariant: this.boxVariant });
        } else {
          this.setFIBVariant({ fibVariant: this.questionSettings?.questionDisplayVariant });
        }
      }
    } else {
      this.disableEnableBlockLettersSetting = true;
      this.toggleFIBBoxSettingDisabled({ condition: 'forLanguageSupport', value: true });

      this.setFIBVariant({ fibVariant: this.singleBlankVariant });
    }

    this.toggleFIBAlternativeAnswerSetting(false);
    this.toggleFIBBoxSettingDisabled({ condition: 'forAlternativeAns', value: false });
    this.optionsData = this.currentSlide?.structure?.options?.slice(1).map((option) => option);

    if (this.doesFIBHaveMoreThanOneOption && !this.isBoxVariant) {
      this.setFIBVariant({ fibVariant: this.singleBlankVariant });
      this.toggleFIBAlternativeAnswerSetting(true);
    }

    if (this.isBoxVariant) {
      HotjarService.triggerEvent(HotjarEvents.HOTJAR_FIBV2_CREATE);
    }
  },

  beforeUnmount() {
    this.$eventBus.$off('questionEditor:triggerPreSaveActions', this.preSaveHook);
  },

  methods: {
    ...mapActions({
      setFIBVariant: 'slideEditor/setFIBVariant',
      setEnableAccentMarks: 'slideEditor/setEnableAccentMarks',
      setSpecialCharIndices: 'slideEditor/setSpecialCharIndices',
      setAnswerLength: 'slideEditor/setAnswerLength',
      toggleFIBAlternativeAnswerSetting: 'uiManager/toggleFIBAlternativeAnswerSetting',
      toggleFIBSettingsModal: 'uiManager/toggleFIBSettingsModal',
      updateQuestionOptions: 'slideEditor/updateQuestionOptions',
      toggleFIBBoxSettingDisabled: 'uiManager/toggleFIBBoxSettingDisabled',
    }),

    resizePreviewBoxes() {
      if (this.correctAnswerValue.length > 16 && this.isBoxVariant && this.isContainerDeviceDesktop) {
        this.$nextTick(() => {
          const boxes = this.$el?.querySelectorAll('.char-box');
          boxes.forEach((box) => {
            box.classList.replace('w-16', 'w-12');
            box.classList.replace('h-16', 'h-12');
            box.classList.replace('text-4xl', 'text-3xl');
            box.classList.replace('w-8', 'w-6');
          });
        });
      }
    },

    getUUID,

    handleUpdateOption(optionIndex, option) {
      const copyOfOption = cloneDeep(option);
      this.optionsData[optionIndex] = copyOfOption;
      this.updateSingleOptionValueDebounced({
        ...copyOfOption,
        text: option.text?.trim(),
        matcher: option.matcher,
      }, optionIndex + 1);
    },

    handleDeleteOption(optionIndex) {
      if (optionIndex === 0 && this.optionsData.length === 1) {
        return;
      }
      this.optionsData = this.optionsData.filter((option, index) => index !== optionIndex);
      const finalOptions = [this.fibAnswerOption, ...this.optionsData];
      this.updateQuestionOptions({ options: finalOptions });
    },

    handleAddAlternativeAnswer() {
      this.optionsData = [...this.optionsData, new QuestionOption({ text: '', matcher: 'exact' })];
    },

    handleSettingsButtonClick() {
      this.toggleFIBSettingsModal(true);
    },
    sanitizeFIBAnswer(answer) {
      let str = answer;
      str = str.replace(/“/g, '"').replace(/”/g, '"').replace(/‘/g, '\'').replace(/’/g, '\'');
      str = unescape(str);
      str = str.replace(/\s+/g, ' ');
      return str;
    },

    isLatinChar(char) {
      const codePoint = char.charCodeAt(0);
      if (this.isSpecialCharacter(char)) { return true; }
      return (codePoint >= 0x0041 && codePoint <= 0x005A) // A-Z
           || (codePoint >= 0x0061 && codePoint <= 0x007A) // a-z
            || (codePoint >= 0x0030 && codePoint <= 0x0039) // 0-9
           || (codePoint >= 0x00C0 && codePoint <= 0x00FF) // Latin-1 Supplement
           || (codePoint >= 0x0100 && codePoint <= 0x017F) // Latin Extended-A
           || (codePoint >= 0x0180 && codePoint <= 0x024F) // Latin Extended-B
           || (codePoint >= 0x1E00 && codePoint <= 0x1EFF) // Latin Extended Additional
           || (codePoint >= 0x2C60 && codePoint <= 0x2C7F) // Latin Extended-C
           || (codePoint >= 0xA720 && codePoint <= 0xA7FF) // Latin Extended-D
           || (codePoint >= 0xAB30 && codePoint <= 0xAB6F); // Latin Extended-E
    },

    isLatinString(str) {
      return str.split('').every((char) => this.isLatinChar(char));
    },

    isStringContainsSpecialCharacters(str) {
      return str.split('').some((char) => this.isSpecialCharacter(char));
    },

    checkToDisabledEnableBlockLettersSetting() {
      if (this.correctAnswerValue.length === 0) {
        this.disableEnableBlockLettersSetting = false;
        this.isAnswerBoxFormatChecked = true;
        return;
      }

      if (this.isLatinString(this.correctAnswerValue)) {
        if (this.correctAnswerValue.length > 40) {
          this.toggleFIBBoxSettingDisabled({ condition: 'forMaxLength', value: true });
          this.setFIBVariant({ fibVariant: this.singleBlankVariant });
        } else {
          this.toggleFIBBoxSettingDisabled({ condition: 'forMaxLength', value: false });
          this.toggleFIBBoxSettingDisabled({ condition: 'forLanguageSupport', value: false });
          this.disableEnableBlockLettersSetting = false;
          this.setFIBVariant({ fibVariant: this.fibVariant });
        }
        return;
      }
      this.disableEnableBlockLettersSetting = true;
      this.toggleFIBBoxSettingDisabled({ condition: 'forLanguageSupport', value: true });
      this.setFIBVariant({ fibVariant: this.singleBlankVariant });
    },

    isSpecialCharacter(char) {
      return this.$stringUtils.isSpecialChar(char);
    },

    containsAccents(str) {
      return this.$stringUtils.containsAccents(str);
    },

    onCorrectAnswerInput(event) {
      const el = event.target;
      const { value } = el;
      const sel = el.selectionStart;

      const capitalLetterRegex = /[A-Z]/;
      this.isCapitalLetter = capitalLetterRegex.test(value[value.length - 1]);

      if (isEmpty(value)) {
        this.correctAnswerAsArray = [];
        this.correctAnswerValue = '';

        this.updateSingleOptionValueDebounced({
          ...this.fibAnswerOption,
          text: '',
        }, 0);
        this.$nextTick(() => {
          this.$eventBus.$emit('editor:validateQuestion');
        });
        return;
      }
      this.correctAnswerValue = this.sanitizeFIBAnswer(value);
      el.value = this.correctAnswerValue;
      this.$nextTick(() => {
        el.setSelectionRange(sel, sel);
      });

      this.checkToDisabledEnableBlockLettersSetting();

      this.correctAnswerAsArray = this.correctAnswerValue.split('');
      this.updateSingleOptionValueDebounced({
        ...this.fibAnswerOption,
        text: this.correctAnswerValue,
      }, 0);
    },

    getCanSubmitCustomResponse() {
      return this.questionSettings.canSubmitCustomResponse ?? false;
    },

    updateSingleOptionValue(option, indexInStoreOptions) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', {
        option,
        index: indexInStoreOptions,
      });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    findSpecialChars(str) {
      const specialChars = /[`!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?~ ]/;
      const result = [];

      str.split('').forEach((char, index) => {
        if (specialChars.test(char)) {
          result.push({ index, char });
        }
      });
      return result;
    },

    sanitiseFIBOptions() {
      this.currentSlide.structure.options.forEach((option, index) => {
        // remove html tags from option text
        const text = option.text.replace(/(<([^>]+)>)/gi, '');
        this.$store.dispatch('slideEditor/updateSingleQuestionOption', { option: { ...option, text }, index });
      });
    },

    preSaveHook() {
      if (this.isQuestionFIB) {
        const arrayOfSpecialCharIndicesWithValue = this.findSpecialChars(this.correctAnswerValue.trim());
        const copyOfAnsOption = cloneDeep(this.currentSlide?.structure?.options[0]);
        this.updateSingleOptionValueDebounced(QuestionOption({
          ...copyOfAnsOption,
          text: this.correctAnswerValue.trim(),
        }), 0);
        const optionsWithoutEmptyText = this.currentSlide.structure.options.filter((option) => option.text.length > 0);
        this.updateQuestionOptions({ options: optionsWithoutEmptyText });
        const containsAccents = this.containsAccents(this.correctAnswerValue);
        this.setEnableAccentMarks({ enableAccentMarks: containsAccents });
        this.setSpecialCharIndices({ specialIndices: arrayOfSpecialCharIndicesWithValue });
        this.setAnswerLength({ answerLength: this.correctAnswerValue.length });

        this.$analytics.logEvent(this.$webEvents.FIB_SETTINGS, {
          questionId: this.currentSlide._id,
          questionHintAdded: this.questionHint.length > 0,
          enabledBlockLetters: this.isBoxVariant,
          enabledAccentMarks: containsAccents,
        });

        HotjarService.triggerEvent(HotjarEvents.HOTJAR_FIBV2_SAVE);
        addSurvicateQueryParam(this.$router, this.$route.query, 'addedFIBV2');
      }
    },

  },
};
</script>

<style scoped lang="scss">

.advanced-settings-button {
  height: 3rem !important;
}

.answer-format-checkbox {
  accent-color: #00a06a;
}

</style>

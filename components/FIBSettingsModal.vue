<template>
  <Modal
    icon="far fa-rectangle-wide"
    :title="$i18n('Fill-in-the-Blank settings')"
    containerClasses="max-w-112"
    :button1="{
      title: $i18n('Cancel'),
      type: 'other',
    }"
    :button2="{
      title: $i18n('Save'),
    }"
    dismissOnOverlayClick
    shouldCloseOnEscape
    :stickToBottom="!isDesktop"
    @button1-click="handleCancel"
    @button2-click="handleSave"
    @close="handleSave"
  >
    <div class="flex flex-col">
      <div class="flex gap-4 p-3">
        <div class="flex flex-col w-full">
          <img
            src="https://cf.quizizz.com/image/fibv2-setting-separate.png"
            :alt="$i18n('Separate boxes')"
            class="flex-1 object-contain rounded border-2 border-transparent cursor-pointer"
            :class="{ 'border-lilac': isBoxVariant, 'pointer-events-none opacity-[0.5]': isBoxVariantDisabled }"
            @click="handleAnswerFormatChange(boxVariant)"
          />
          <Radio
            class="flex-1"
            :titleClasses="`text-sm font-semibold ${isBoxVariantDisabled ? 'text-dark-6' : 'text-dark-2'}`"
            inputId="separate-boxes"
            :name="boxVariant"
            :disabled="isBoxVariantDisabled"
            :label="$i18n('Separate boxes')"
            size="sm"
            :checked="isBoxVariantDisabled ? false : isBoxVariant"
            @change="(ev) => handleAnswerFormatChange(ev.target.name)"
          />
        </div>
        <div class="flex flex-col w-full">
          <img
            src="https://cf.quizizz.com/image/fibv2-setting-single.png"
            :alt="$i18n('Single input field')"
            class="flex-1 object-contain rounded border-2 border-transparent cursor-pointer"
            :class="{ 'border-lilac': isSingleBlankVariant }"
            @click="handleAnswerFormatChange(singleBlankVariant)"
          />
          <Radio
            class="flex-1"
            titleClasses="text-sm font-semibold text-dark-2"
            inputId="single-input-field"
            :name="singleBlankVariant"
            :label="$i18n('Single input field')"
            size="sm"
            :checked="isSingleBlankVariant"
            @change="(ev) => handleAnswerFormatChange(ev.target.name)"
          />
        </div>
      </div>
      <div class="flex justify-between p-3 border-t-1 border-dark-6">
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold text-dark-2">
            <i18n>Alternative answers</i18n>
          </p>
          <div
            v-if="alternativeAnswersEnabled"
            class="flex gap-1.5"
          >
            <FA
              icon="far fa-info-circle"
              :size="11"
              class="text-dark-4"
            />
            <p class="text-xs text-dark-4">
              <i18n>When this setting is on, only Single input field can be used.</i18n>
            </p>
          </div>
        </div>
        <Switchbox
          inputId="alternative-answers"
          name="alternative-answers"
          :value="alternativeAnswersEnabled"
          @input="handleAlternativeAnswersChange"
        />
      </div>
      <div class="flex justify-between p-3 border-t-1 border-dark-6">
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold text-dark-2">
            <i18n>Answer Hints</i18n>
          </p>
          <p
            v-if="isCorporateUser"
            class="text-xs text-dark-4"
          >
            <i18n>Write a custom hint to show the participants if they're struggling with the answer</i18n>
          </p>
          <p
            v-else
            class="text-xs text-dark-4"
          >
            <i18n>Write a custom hint to show the students if they're struggling with the answer</i18n>
          </p>
          <Input
            :value="answerHint"
            :placeholder="$i18n('Enter your hint here...')"
            :maxlength="120"
            :showCharLimit="true"
            @input="handleAnswerHintInput"
          />
        </div>
      </div>
      <div class="flex justify-between p-3 border-t-1 border-dark-6">
        <div class="flex flex-col">
          <p class="text-sm font-semibold text-dark-2">
            <i18n>Ignore accent marks like </i18n>à, á, â
          </p>
          <p class="text-xs text-dark-4">
            <i18n>Both “café” and “cafe” will be considered correct</i18n>
          </p>
        </div>
        <Switchbox
          inputId="ignore-accent-marks"
          name="ignore-accent-marks"
          :value="ignoreAccentMarksEnabled"
          @input="handleIgnoreAccentMarksChange"
        />
      </div>
      <div class="flex justify-between p-3 border-t-1 border-dark-6">
        <div class="flex flex-col">
          <div class="flex gap-2">
            <p class="text-sm font-semibold text-dark-2">
              <i18n>Show your work</i18n>
            </p>
            <SuperIcon
              :size="isDesktop ? 12 : 10"
            />
          </div>
          <p
            v-if="isCorporateUser"
            class="text-xs text-dark-4"
          >
            <i18n>Participants can upload images alongside their answer</i18n>
          </p>
          <p
            v-else
            class="text-xs text-dark-4"
          >
            <i18n>Students can upload images alongside their answer</i18n>
          </p>
        </div>
        <ForSuper
          :type="$constants.SuperUpsellTypes.CAN_SHOW_WORK"
          :feat="$constants.FeatureTypes.CAN_SHOW_WORK"
        >
          <Switchbox
            ref="switchbox"
            inputId="submit-custom-response"
            name="submit-custom-response"
            :value="submitCustomResponseEnabled"
            @input="handleSetCustomResponse"
          />
        </ForSuper>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Constants from '~/config/Constants';
import QuestionOption from '../models/QuestionOption';

export default {

  data() {
    const boxVariant = Constants.DisplayVariantNames[Constants.QuestionTypes.BLANK].BOX;
    const singleBlankVariant = Constants.DisplayVariantNames[Constants.QuestionTypes.BLANK].SINGLE_BLANK;
    return {
      alternativeAnswersEnabled: false,
      answerHintsEnabled: false,
      ignoreAccentMarksEnabled: true,
      submitCustomResponseEnabled: false,
      answerFormat: boxVariant,
      answerHint: '',
      boxVariant,
      singleBlankVariant,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('uiManager', ['isFIBalternativeAnswersEnabled', 'isFIBBoxSettingDisabledWhenAlternativeEnabled', 'isFIBBoxSettingDisabledWhenLangIsNotSupported', 'isFIBBoxSettingDisabledWhenExceedsMaxLength']),
    ...mapGetters('root', ['isDesktop']),

    isBoxVariant() {
      return this.answerFormat === this.boxVariant;
    },

    isSingleBlankVariant() {
      return this.answerFormat === this.singleBlankVariant;
    },

    isBoxVariantDisabled() {
      return this.isFIBBoxSettingDisabledWhenAlternativeEnabled || this.isFIBBoxSettingDisabledWhenLangIsNotSupported || this.isFIBBoxSettingDisabledWhenExceedsMaxLength;
    },

    canAccessSuper() {
      return this.$user.isCorporate || this.$user.isSuper;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },
  },

  mounted() {
    this.answerFormat = this.currentSlide?.structure?.settings?.questionDisplayVariant ?? this.boxVariant;
    this.ignoreAccentMarksEnabled = this.currentSlide?.structure?.settings?.ignoreAccentMarksForEvaluation ?? true;
    this.answerHint = this.currentSlide?.structure?.hints?.[0]?.text ?? '';
    this.submitCustomResponseEnabled = this.currentSlide?.structure?.settings?.canSubmitCustomResponse;
    this.alternativeAnswersEnabled = this.isFIBalternativeAnswersEnabled;
    if (this.alternativeAnswersEnabled) {
      this.toggleFIBBoxSettingDisabled({ condition: 'forAlternativeAns', value: true });
    }
  },

  methods: {
    ...mapActions({
      setFIBVariant: 'slideEditor/setFIBVariant',
      setIgnoreAccentMarks: 'slideEditor/setIgnoreAccentMarks',
      setCanSubmitCustomResponse: 'slideEditor/setCanSubmitCustomResponse',
      setQuestionHints: 'slideEditor/setQuestionHints',
      toggleFIBAlternativeAnswerSetting: 'uiManager/toggleFIBAlternativeAnswerSetting',
      toggleFIBSettingsModal: 'uiManager/toggleFIBSettingsModal',
      toggleFIBBoxSettingDisabled: 'uiManager/toggleFIBBoxSettingDisabled',
    }),

    handleAnswerFormatChange(name) {
      this.answerFormat = name;
      if (this.isBoxVariant) {
        this.alternativeAnswersEnabled = false;
      }
    },

    handleAlternativeAnswersChange(value) {
      this.alternativeAnswersEnabled = value;
      if (value) {
        this.answerFormat = this.singleBlankVariant;
        this.toggleFIBBoxSettingDisabled({ condition: 'forAlternativeAns', value: true });
      } else {
        this.toggleFIBBoxSettingDisabled({ condition: 'forAlternativeAns', value: false });
      }
    },

    handleAnswerHintsChange(value) {
      this.answerHintsEnabled = value;
    },

    handleIgnoreAccentMarksChange(value) {
      this.ignoreAccentMarksEnabled = value;
    },

    handleAnswerHintInput(value) {
      this.answerHint = value;
    },

    handleSetCustomResponse(value) {
      if (!this.canAccessSuper && value) {
        this.turnSwitchOff();
        return;
      }
      this.submitCustomResponseEnabled = value;
      this.setCanSubmitCustomResponse({ canSubmitCustomResponse: value });
    },

    handleCancel() {
      this.toggleFIBSettingsModal(false);
    },

    handleSave() {
      this.setFIBVariant({ fibVariant: this.answerFormat });
      this.toggleFIBAlternativeAnswerSetting(this.alternativeAnswersEnabled);
      this.setIgnoreAccentMarks({ ignoreAccentMarksForEvaluation: this.ignoreAccentMarksEnabled });
      const questionHintSchema = QuestionOption({
        type: 'text',
        text: this.answerHint.trim(),
      });
      this.setQuestionHints({ hints: [questionHintSchema] });
      this.toggleFIBSettingsModal(false);
    },

    turnSwitchOff() {
      this.$refs.switchbox.uncheck();
      this.submitCustomResponseEnabled = false;
    },
  },

};
</script>

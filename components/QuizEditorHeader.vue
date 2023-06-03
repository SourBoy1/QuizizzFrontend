<template>
  <nav
    v-if="isFlaggedCorporateUser && !isASlideBeingEdited"
    class="flex bg-light-3 items-center z-100 fixed w-full border-b-1 border-dark-6"
    :class="[!isASlideBeingEdited && 'h-16 px-4 py-[11.5px]']"
  >
    <div
      class="cursor-pointer flex gap-4 ml-2"
      @click="handleBack"
    >
      <FA
        icon="fa-regular fa-arrow-left"
        class="text-purple"
        size="18"
      />
      <a class="hover:cursor-pointer"><img
        class="w-24 h-7"
        src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
        alt="Quizizz"
      ></a>
    </div>

    <div
      class="vertical-divider hidden md:block border border-light-10% rounded-2m ml-2 mr-4 h-8"
    />

    <div
      v-if="hasAutomaticQuizGenerated"
      class="text-light"
    >
      <i18n>Quiz Generator</i18n>
    </div>

    <Button
      v-if="hasAutomaticQuizGenerated"
      type="transparent"
      :aria-label="$i18n('close')"
      licon="far fa-times"
      class="ml-auto"
      @click="$emit('quiz-generator-close')"
    />

    <div
      v-if="areHeaderActionBtnsVisible && hasQuestions"
      class="float-right flex ml-auto space-x-2"
    >
      <ButtonWithTooltip
        v-if="isDesktop"
        buttonClasses="preview-btn w-40 bg-lilac-faded hover:bg-lilac text-lilac hover:text-light py-3 px-9 !h-10"
        :tooltip="{
          text: $i18n('Add atleast one question'), position: 'bottom', showOnHover: !hasQuestions, theme: 'dark',
        }"
        :title="$i18n('Preview Quiz')"
        size="md"
        type="primary"
        :disabled="!hasQuestions"
        @click="toggleShowQuizPreview"
      />

      <Button
        :title="$i18n('Save Quiz')"
        data-cy="save-quiz-button"
        size="md"
        customClasses="bg-lilac-dark hover:bg-lilac text-light rounded w-4 py-3 px-9 !h-10"
        type="custom"
        :loading="isAwaitingPublish"
        @click="handleSave"
      />
    </div>
  </nav>

  <nav
    v-else
    class="flex bg-purple h-12 p-2 items-center z-100 fixed w-full"
    :class="[isFlaggedCorporateUser && 'h-16 px-4 py-[11.5px]']"
  >
    <div
      class="w-18 cursor-pointer"
      @click="handleBack"
    >
      <a class="hover:cursor-pointer"><img
        src="https://cf.quizizz.com/img/quizizz_logos/white-brandmark-600x164.png"
        alt="Quizizz"
      ></a>
    </div>

    <div
      class="vertical-divider hidden md:block border border-light-10% rounded-2m ml-2 mr-4 h-8"
    />

    <div
      v-if="hasAutomaticQuizGenerated"
      class="text-light"
    >
      <i18n>Quiz Generator</i18n>
    </div>

    <ContentNameInput
      v-if="(isDesktop && showContentNameInput)"
      ref="quiz-name-editor"
      :name="quizName"
      :placeholder="getPlaceholder"
      @blur="onBlur"
      @change="onInputChange"
      @keydown="onKeydown"
      @focus="onFocus"
    />
    <span
      v-if="isErrorLabelVisible"
      class="ml-2 text-sm font-semibold text-red-faded"
    ><i18n>Name should have atleast 4 characters</i18n></span>

    <Button
      v-if="hasAutomaticQuizGenerated"
      type="transparent"
      :aria-label="$i18n('close')"
      licon="far fa-times"
      class="ml-auto"
      @click="$emit('quiz-generator-close')"
    />

    <div
      v-if="areHeaderActionBtnsVisible"
      class="float-right flex ml-auto space-x-2"
    >
      <ButtonWithTooltip
        v-if="isDesktop"
        buttonClasses="preview-btn"
        :tooltip="{
          text: $i18n('Add atleast one question'), position: 'bottom', showOnHover: !hasQuestions, theme: 'dark',
        }"
        :title="$i18n('Preview')"
        size="md"
        type="transparent"
        :isDarkThemed="true"
        :disabled="!hasQuestions"
        licon="fas fa-play"
        @click="toggleShowQuizPreview"
      />

      <Button
        :title="$i18n('Settings')"
        size="md"
        type="transparent"
        licon="fas fa-cog"
        @click="toggleSettings(true)"
      />

      <Button
        :title="$i18n('Save')"
        data-cy="save-quiz-button"
        size="md"
        type="white"
        :loading="isAwaitingPublish"
        licon="fas fa-cloud-upload"
        @click="handleSave"
      />
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';

import QuizService from '~/services/apis/QuizService';
import { ContentDefaultName } from '~/config/DefaultCopies.js';

import QLogger from '~/services/QLogger';

export default {
  props: {
    isAwaitingPublish: {
      type: Boolean,
      default: false,
    },

    value: {
      type: Boolean,
      default: false,
    },

    modelValue: {
      type: Boolean,
      default: false,
    },

    isCurrentStateReorder: {
      type: Boolean,
      default: false,
    },

    shouldShowRedirectToOldEditorButton: {
      type: Boolean,
      default: false,
    },

    isQuizPremium: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },
    isQuizGenInProgress: {
      type: Boolean,
      default: false,
    },
    showContentNameInput: {
      type: Boolean,
      default: true,
    },
    hasAutomaticQuizGenerated: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'quiz-generator-close', 'togglePrecreateModal', 'input', 'togglePublishModal', 'toggleNoQuestionsModal', 'onRedirectToOldQuizEditor', 'handleBack'],

  data() {
    return {
      quizName: '',
      isValidName: true,
      isTyping: false,
      isEnterBtnPressed: false,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'draftId', 'draft', 'hasQuestions']),
    ...mapGetters('slideEditor', ['isASlideBeingEdited']),
    ...mapGetters('root', ['isDesktop']),

    areHeaderActionBtnsVisible() {
      return !this.isASlideBeingEdited && !this.isCurrentStateReorder && !this.isQuizGenInProgress;
    },

    isSuperUser() {
      return this.$user.isSuper;
    },

    showCharlimit() {
      return this.isTyping || this.quizName !== '';
    },

    getPlaceholder() {
      return ContentDefaultName.QUIZ_NAME;
    },

    isErrorLabelVisible() {
      return !this.isValidName && this.isTyping && this.quizName.length < 4;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isFlaggedCorporateUser() {
      if (this.isCorporateUser) {
        return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.QFW_CREATE_FLOW);
      }
      return false;
    },

  },

  watch: {
    name(value) {
      this.quizName = value;
    },
  },

  mounted() {
    this.quizName = this.name;
  },

  methods: {
    async handleUpdateQuiz() {
      const quizData = {
        name: this.quizName,
        type: this.$constants.ContentType.QUIZ,
      };
      const { success, draft } = await QuizService.update(this.quizId, this.draftId, quizData);
      if (!success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while updating the quiz'),
        });
        QLogger.error('Error updating quiz name');
        return;
      }
      const eventName = this.$webEvents.getQuizEditorEvent(this.$constants.ContentType.QUIZ, this.$webEvents.EDITOR_HEADER_NAME_EDITED);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        name: this.quizName,
      });

      this.$store.dispatch('contentEditor/setName', draft.name);
      this.$store.dispatch('contentEditor/setQuizPreference', { preference: 'name', value: draft.name });
      this.$store.dispatch('contentEditor/setIsQuizNameChangedUsingHeaderInput', true);
    },

    onBlur(isTyping) {
      this.isTyping = isTyping;
      if (this.isEnterBtnPressed) {
        this.isEnterBtnPressed = false;
        return;
      }
      if (!['', ContentDefaultName.QUIZ_NAME].includes(this.quizName) && this.isValidName) {
        this.handleUpdateQuiz();
      } else {
        this.quizName = this.draft.name;
      }
    },

    onKeydown(ev, isTyping) {
      if (ev.keyCode === 13) {
        this.isTyping = isTyping;
        if (this.quizName !== '' && this.isValidName) {
          this.handleUpdateQuiz();
        } else {
          this.quizName = this.draft.name;
        }

        this.isEnterBtnPressed = true;
        this.$refs['quiz-name-editor'].$refs['content-name-input'].$refs.input.blur();
      }
    },

    onFocus(isTyping) {
      this.isTyping = isTyping;
    },

    onInputChange(value, isValidName, isTyping) {
      this.isTyping = isTyping;
      this.isValidName = isValidName;
      this.quizName = value;
    },

    togglePrecreate() {
      this.$emit('togglePrecreateModal', true);
    },

    toggleShowQuizPreview() {
      this.$analytics.logEvent(this.$webEvents.PREVIEW_QUIZ_EDITOR);

      this.$emit('update:modelValue', !this.value);
      this.$emit('input', !this.value);
    },

    toggleSettings(didClickSettings) {
      this.$emit('togglePublishModal', didClickSettings);
    },

    handleSave() {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'QH:Save');
      const eventName = this.$webEvents.QUIZ_EDITOR_SAVE_BTN;
      this.$analytics.logEvent(
        eventName,
        {
          userId: this.$user.id,
          quizId: this.quizId,
          numberOfQuestions: this.draft.questions.length,
          isUserPremium: this.isSuperUser,
          isQuizPremium: this.isQuizPremium,
        },
      );
      if (!this.hasQuestions) {
        this.$emit('toggleNoQuestionsModal');
      } else {
        this.toggleSettings(false);
      }
    },

    redirectToOldEditor() {
      this.$emit('onRedirectToOldQuizEditor');
    },

    handleBack() {
      this.$emit('handleBack');
    },
  },
};
</script>

<style lang="scss" scoped>
  .header-text {
    white-space: nowrap;
  }
</style>

<template>
  <Modal
    v-show="shouldUpdateQuiz"
    title="Great, you're all done!"
    subtitle="Review quiz settings and you’re good to go"
    :fixedHeight="false"
    :fullScreenOnMobile="true"
    containerClasses="px-0"
    hideFooter
    stickToBottom
    @close="$emit('close')"
  >
    <div class="modal-container w-full flex flex-col gap-4">
      <Input
        ref="quiz-name-input"
        inputId="quiz-name-input"
        required
        :value="getQuizNameValue"
        class="quiz-name-edit"
        label="Name"
        inputClasses="font-semibold"
        :placeholder="getDefaultName"
        :errorMessage="doesFormHaveErrors ? errorsObj.name : ''"
        :maxlength="$constants.ContentNameMaxLength"
        autocomplete="off"
        aria-required="true"
        :showCharLimit="true"
        @input="(value) => handlePreferenceChange('name', value)"
      />
      <CoverImageSection
        :isMediaImageVisible="isMediaImageVisible"
        :mediaObj="mediaObj"
        :isDesktop="false"
        @toggleImageModal="handleToggleImageModal"
        @manualImageUpload="handleManualImageUpload"
        @imageDelete="handleDeleteImage"
        @googleSearch="handleGoogleSearch"
      />
      <Input
        v-if="!isCorporate"
        :value="quizPreferences.selectedSubject"
        :label="$i18n('Subject')"
        :errorMessage="(doesFormHaveErrors && quizPreferences.selectedSubject === '') ? errorsObj.selectedSubject : ''"
        aria-required="true"
        licon="far fa-book"
        ticon="fas fa-caret-down"
        inputClasses="font-semibold"
        ticonClasses="ml-4"
        :ticonSize="14"
        :placeholder="$i18n('Select relevant subject')"
        @focus="(value) => handlePrefenceDropdown('selectedSubject', value)"
      />
      <Input
        v-if="!isCorporate"
        :value="getGrade?.title"
        :label="$i18n('Grade')"
        aria-required="true"
        inputClasses="font-semibold"
        licon="far fa-graduation-cap"
        ticon="fas fa-caret-down"
        ticonClasses="ml-4"
        :ticonSize="14"
        :errorMessage="(doesFormHaveErrors && quizPreferences.grade.length === 0) ? errorsObj.grade : ''"
        :placeholder="$i18n('Select relevant grade')"
        @focus="(value) => handlePrefenceDropdown('grade', value)"
      />
      <Input
        :value="quizPreferences.language"
        :label="$i18n('Language')"
        aria-required="true"
        licon="far fa-language"
        inputClasses="font-semibold"
        ticon="fas fa-caret-down"
        ticonClasses="ml-4"
        :ticonSize="14"
        :placeholder="$i18n('Select relevant language')"
        :errorMessage="(doesFormHaveErrors && quizPreferences.language === '') ? errorsObj.language : ''"
        @focus="(value) => handlePrefenceDropdown('language', value)"
      />
      <div
        v-if="!isCorporate"
        class="flex flex-col"
      >
        <label class="font-semibold text-xs text-dark-4"><i18n>Visibility</i18n></label>
        <Radio
          inputId="public"
          :label="$i18n('Public, visible to everyone')"
          name="public"
          class="mt-2"
          titleClasses="text-dark-2 font-semibold"
          size="md"
          :checked="quizPreferences.visibility"
          @change="handlePreferenceChange('visibility', true)"
        />
        <div
          class="flex items-center gap-1"
          @click="handlePreferenceChange('visibility', false)"
        >
          <Radio
            inputId="private"
            name="private"
            size="md"
            :class="!hasPrivateContentAccess ? 'pointer-events-none' : null"
            titleClasses="text-dark-2 font-semibold"
            :label="$i18n('Private, visible only to you')"
            :checked="!quizPreferences.visibility"
            @change="handlePreferenceChange('visibility', false)"
          />
          <SuperIcon
            v-if="!hasPrivateContentAccess"
            :size="9"
          />
        </div>
      </div>
    </div>
    <div class="fixed bg-light-3 bottom-0 left-1/2 -translate-x-1/2 px-6 h-15 w-full flex justify-between">
      <Button
        buttonClasses="mt-1"
        :title="$i18n('Back')"
        type="other"
        @click="$emit('close')"
      />
      <Button
        buttonClasses="mt-1"
        :title="didClickSettings ? $i18n('Save') : $i18n('Continue')"
        type="primary"
        :loading="isAwaitingApiResponse"
        @click="handleBtn2Click"
      />
    </div>
    <ImageSearchModal
      v-if="showGoogleSearchModal"
      ref="image-search-modal"
      :title="$i18n('Add cover image')"
      icon="far fa-image"
      @onImagePick="handleManualImageUpload"
      @close="showGoogleSearchModal = false"
    />

    <ResultsSuggestionModal
      v-if="showResultsSuggestionModal"
      :title="getDropdownTitle"
      :selectedValue="searchValue"
      :list="getDropdownList"
      :placeholder="getDropdownPlaceholder"
      @selectedValueFromResults="handleSelectedValueFromResults"
      @close="showResultsSuggestionModal = false"
    />

    <ConfirmPublicVisibilityModal
      v-if="showConfirmPublicVisibilityModal"
      :type="type"
      @confirm="handleConfirmPublicVisibilityModalConfirm"
      @close="handleConfirmPublicVisibilityModalClose"
    />
  </Modal>
</template>

<script>
import quizEditMixin from '~/mixins/quizEditMixin';

export default {
  mixins: [quizEditMixin],
  emits: ['close', 'onQuizUpdate', 'onAwaitPublish'],

  data() {
    return {
      preference: '',
      searchValue: '',
      showGoogleSearchModal: false,
      showResultsSuggestionModal: false,
    };
  },

  computed: {
    getDropdownTitle() {
      switch (this.preference) {
        case 'selectedSubject':
          return this.$i18n('Select subject');
        case 'grade':
          return this.$i18n('Select grade');
        case 'language':
          return this.$i18n('Select language');
        default:
          return '';
      }
    },

    getDropdownPlaceholder() {
      switch (this.preference) {
        case 'selectedSubject':
          return this.$i18n('Subject');
        case 'grade':
          return this.$i18n('Grade');
        case 'language':
          return this.$i18n('Language');
        default:
          return '';
      }
    },

    getDropdownList() {
      switch (this.preference) {
        case 'selectedSubject':
          return this.sortedSubjectsList;
        case 'grade':
          return this.gradesList;
        case 'language':
          return this.languagesList;
        default:
          return [];
      }
    },

    modalTitle() {
      if ((this.didClickSettings || this.editMetadataMode) && this.isContentQuizType) {
        return this.$i18n('Quiz settings');
      }
      if ((this.didClickSettings || this.editMetadataMode) && this.isContentPresentationType) {
        return this.$i18n('Lesson settings');
      }

      return this.$i18n('Great, you’re almost done!');
    },

    modalSubtitle() {
      if (
        this.didClickSettings
        || this.editMetadataMode
      ) {
        return '';
      }

      if (this.isContentQuizType) {
        return this.$i18n('Review quiz settings and you’re good to go');
      }
      return this.$i18n('Review lesson settings and you’re good to go');
    },

    getGrade() {
      return this.gradesList.find((grade) => grade.value === this.quizPreferences.grade.toString());
    },

    getPreferenceValue() {
      switch (this.preference) {
        case 'selectedSubject':
          return this.quizPreferences.selectedSubject;
        case 'grade':
          return this.getGrade?.value;
        case 'language':
          return this.quizPreferences.language;
        default:
          return '';
      }
    },
  },

  watch: {
    quizPreferences: {
      handler(val) {
        if (val.name.length < 4) {
          this.errorsObj.name = this.$i18n('Please enter atleast 4 characters');
        } else {
          this.errorsObj.name = '';
        }
      },

      deep: true,
    },

    preference(value) {
      this.searchValue = this.getPreferenceValue;
    },
  },

  mounted() {
    this.$store.dispatch('root/hideHelpButton');
  },

  methods: {
    handlePrefenceDropdown(preference) {
      this.showResultsSuggestionModal = true;
      this.preference = preference;
    },

    handleSelectedValueFromResults(value) {
      this.handlePreferenceChange(this.preference, value);
      this.searchValue = value;
      this.showResultsSuggestionModal = false;
    },

  },
};
</script>

<style scoped lang="scss">
.modal-container {
  max-height: calc(100vh - 150px);
}
</style>

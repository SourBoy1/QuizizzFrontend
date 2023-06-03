<template>
  <div
    v-show="shouldUpdateQuiz"
    class="w-full h-full absolute"
  >
    <Modal
      :title="modalTitle"
      :subtitle="modalSubtitle"
      containerClasses="publish-modal"
      :button1="getButton1Props"
      :button2="getButton2Props"
      :icon="modalIcon"
      :overflowY="false"
      :shouldMaskNotScroll="true"
      dismissOnOverlayClick
      shouldCloseOnEscape
      @button1-click="$emit('close')"
      @button2-click="handleBtn2Click"
      @close="$emit('close')"
    >
      <div
        class="flex gap-6 items-center"
        :class="[modalContainerClasses]"
      >
        <div class="fields-container w-82 flex flex-col gap-5 h-full">
          <Input
            ref="quiz-name-input"
            inputId="quiz-name-input"
            required
            :value="getQuizNameValue"
            class="quiz-name-edit"
            data-cy="publish-modal-name-input"
            inputClasses="quiz-name-input font-semibold"
            :label="$i18n('Name')"
            :tabindex="0"
            :placeholder="getDefaultName"
            :errorMessage="doesFormHaveErrors ? errorsObj.name : ''"
            :maxlength="$constants.ContentNameMaxLength"
            autocomplete="off"
            aria-required="true"
            :showCharLimit="true"
            @input="(value) => handlePreferenceChange('name', value)"
          />
          <SelectBox
            v-if="!isCorporate"
            :value="quizPreferences.selectedSubject"
            :label="$i18n('Subject')"
            :list="sortedSubjectsList"
            cypressTriggerIdentifier="publish-modal-subject-input"
            :errorMessage="(doesFormHaveErrors && quizPreferences.selectedSubject === '') ? errorsObj.selectedSubject : ''"
            aria-required="true"
            icon="far fa-book"
            :truncateLength="truncateLength(sortedSubjectsList, quizPreferences?.selectedSubject)"
            :placeholder="$i18n('Select relevant subject')"
            :forceClose="shouldCloseDropdown('subject')"
            @open="handleDropdown('subject', true)"
            @close="handleDropdown('subject', false)"
            @input="(value) => {
              handlePreferenceChange('selectedSubject', value);
              handleDropdown('subject', false);
            }"
          />
          <SelectBox
            v-if="!isCorporate"
            :value="quizPreferences.grade.toString()"
            :label="$i18n('Grade')"
            :list="gradesList"
            aria-required="true"
            cypressTriggerIdentifier="publish-modal-grade-input"
            icon="far fa-graduation-cap"
            :truncateLength="truncateLength(gradesList, quizPreferences?.grade?.toString())"
            :errorMessage="(doesFormHaveErrors && quizPreferences.grade.length === 0) ? errorsObj.grade : ''"
            :placeholder="$i18n('Select relevant grade')"
            :forceClose="shouldCloseDropdown('grade')"
            @open="handleDropdown('grade', true)"
            @close="handleDropdown('grade', false)"
            @input="(value) => {
              handlePreferenceChange('grade', value);
              handleDropdown('grade', false);
            }"
          />
          <SelectBox
            :value="quizPreferences.language"
            maxListWidth="328px"
            :label="$i18n('Language')"
            aria-required="true"
            cypressTriggerIdentifier="publish-modal-language-input"
            :list="languagesList"
            icon="far fa-language"
            :truncateLength="truncateLength(languagesList, quizPreferences?.language)"
            :forceClose="shouldCloseDropdown('language')"
            @open="handleDropdown('language', true)"
            @close="handleDropdown('language', false)"
            @input="(value) => {
              handlePreferenceChange('language', value);
              handleDropdown('language', false);
            }"
          />
          <SelectBox
            v-if="!isCorporate"
            :value="quizPreferences.visibility"
            :label="$i18n('Visibility')"
            :list="visibilitiesList"
            aria-required="true"
            cypressTriggerIdentifier="publish-modal-visibility-input"
            :icon="
              quizPreferences.visibility === true
                ? 'far fa-eye'
                : 'far fa-eye-slash'
            "
            :truncateLength="truncateLength(visibilitiesList, quizPreferences?.visibility)"
            :forceClose="shouldCloseDropdown('visibility')"
            @open="handleDropdown('visibility', true)"
            @close="handleDropdown('visibility', false)"
            @input="(value) => {
              handlePreferenceChange('visibility', value);
              handleDropdown('visibility', false);
            }"
          />
        </div>

        <CoverImageSection
          ref="coverImageSection"
          :isMediaImageVisible="isMediaImageVisible"
          :mediaObj="mediaObj"
          :isQuizNameChangedUsingHeaderInput="isQuizNameChangedUsingHeaderInput"
          @toggleImageModal="handleToggleImageModal"
          @imageDelete="handleDeleteImage"
          @toggleCropModeOnImgModal="toggleCropModeOnImgModal"
          @manualImageUpload="handleManualImageUpload"
        />
      </div>
      <ImageUploadModal
        v-if="showImageUpload"
        ref="imageUploadModal"
        :title="$i18n('Add cover image')"
        :subtitle="$i18n('You can search or upload an image')"
        :button2-title="$i18n('Insert')"
        :media="mediaObj"
        :inCropMode="inCropMode"
        :showGoogleImageSearch="true"
        showMobileLayout
        @save="imageUploadCallback"
        @close="handleToggleImageModal"
      />
      <ConfirmPublicVisibilityModal
        v-if="showConfirmPublicVisibilityModal"
        :type="type"
        @confirm="handleConfirmPublicVisibilityModalConfirm"
        @close="handleConfirmPublicVisibilityModalClose"
      />
    </Modal>
  </div>
</template>

<script>
import quizEditMixin from '~/mixins/quizEditMixin';

export default {
  mixins: [quizEditMixin],
  emits: ['close', 'onQuizUpdate', 'onAwaitPublish'],

  data() {
    return {
      openedDropdown: false,
    };
  },

  computed: {
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
  },

  methods: {
    handleDropdown(name, value) {
      this.openedDropdown = value ? name : false;
    },

    shouldCloseDropdown(name) {
      const allDropdownIdentifires = ['subject', 'grade', 'language', 'visibility'];
      const filteredDropdownsList = allDropdownIdentifires.filter((item) => item !== name);
      return filteredDropdownsList.includes(this.openedDropdown) ?? false;
    },
  },
};
</script>

<style lang="scss">
.publish-modal {
  max-width: 640px !important;
}
.publish-modal-container-large {
  height: 416px !important;
}
.publish-modal-container-small {
  height: 284px !important;
}
.fields-container {
  width: 328px;
}
.image-container {
  height: 276px
}
.image-search input {
  height: theme('spacing.8');
  font-size: theme('fontSize.sm');
}
.publish-presentation-modal-visibilities-select ul li {
  display: flex;
  justify-content: space-between;
}

.quiz-name-input {
  // on dev/local normal focus works, but on prod it doesn't, this might be workaround, need to test on prod
  &.focus {
    box-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;
  }
}
</style>

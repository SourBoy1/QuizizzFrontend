<template>
  <div>
    <Input
      data-cy="content-name-input"
      required
      :label="inputLabel"
      :placeholder="inputPlaceholder"
      :value="entityName"
      :errorMessage="quizNameError"
      :maxlength="charLimit"
      autocomplete="off"
      :showCharLimit="true"
      @focus="$emit('nameFieldFocused')"
      @input="onInputChange"
      @blur="onInputBlur"
    />

    <div
      v-if="!$user.isCorporate"
      class="mt-4"
    >
      <div class="text-xs font-semibold mb-1 text-dark-4">
        {{ numberingStartIndex + 1 }}. <i18n>Choose relevant subjects</i18n>
        <span
          v-if="errorType === $constants.SubjectSelectionErrors.LIMIT_EXCEEDED"
          class="text-red text-xs font-semibold"
        >
          <i18n>Maximum 3 subjects</i18n>
        </span>
      </div>
      <ChooseSubjects
        class="pb-2"
        :selectedSubjects="selectedSubjects"
        @toggleSubject="onToggleSubject"
      />

      <div
        v-show="errorType === $constants.SubjectSelectionErrors.NO_SUBJECT_SELECTED"
        class="flex text-red text-xs font-semibold mt-1"
        aria-live="assertive"
      >
        <span class="w-4 h-4 flex items-center justify-center mr-0.5">
          <FA
            :size="11"
            icon="far fa-exclamation-circle"
          />
        </span>
        <span id="relevant-subjects-error-message">
          <i18n>Please select relevant subjects for better content suggestions</i18n>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import remove from 'lodash/remove';

import Constants from '~/config/Constants';

export default {

  props: {
    name: {
      type: String,
      default: '',
    },

    subjects: {
      type: Array,
      default: () => ([]),
    },

    forContentType: {
      type: String,
      default: null,
    },

    numberingStartIndex: {
      type: Number,
      default: 1,
    },

    errors: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['nameFieldFocused', 'nameChanged', 'error', 'subjectChanged'],

  data() {
    return {
      errorType: null,
      quizNameError: null,
      charLimit: 64,
      entityName: '',
      selectedSubjects: [],
    };
  },

  computed: {
    isQuizTypeContent() {
      return this.forContentType === Constants.ContentType.QUIZ;
    },

    isPresentationTypeContent() {
      return this.forContentType === Constants.ContentType.PRESENTATION;
    },

    inputLabel() {
      if (this.isQuizTypeContent) {
        const label = this.$i18n('Name this quiz');
        return this.$user.isCorporate ? label : `${this.numberingStartIndex}. ${this.$i18n('{$1}', [label])}`;
      }

      if (this.isPresentationTypeContent) {
        return `${this.numberingStartIndex}. ${this.$user.isCorporate ? this.$i18n('Name this presentation') : this.$i18n('Name this lesson')}`;
      }

      return `${this.numberingStartIndex}. ${this.$i18n('Name this activity')}`;
    },

    inputPlaceholder() {
      if (this.isQuizTypeContent) {
        return this.$i18n('Enter a quiz name');
      }

      if (this.isPresentationTypeContent) {
        return this.$user.isCorporate ? this.$i18n('Enter a presentation name') : this.$i18n('Enter a lesson name');
      }

      return this.$i18n('Enter activity name');
    },
  },

  created() {
    this.entityName = this.name;
    this.selectedSubjects = this.subjects;
  },

  methods: {
    onInputChange(value) {
      this.entityName = value;

      if (this.quizNameError) {
        this.checkInputNameError();
      }

      this.$emit('nameChanged', value);
    },

    checkErrors() {
      this.entityName = this.entityName.trim();
      this.checkInputNameError();

      if (this.selectedSubjects.length === 0 && !this.$user.isCorporate) {
        this.errorType = this.$constants.SubjectSelectionErrors.NO_SUBJECT_SELECTED;
      } else {
        this.errorType = this.selectedSubjects.length > 3 ? this.$constants.SubjectSelectionErrors.LIMIT_EXCEEDED : null;
      }
    },

    checkInputNameError() {
      if (this.entityName.length <= 3) {
        this.quizNameError = this.$i18n('Please enter a name longer than 3 characters');
      } else {
        this.quizNameError = null;
      }

      this.$emit('error', !!this.quizNameError);
    },

    onInputBlur() {
      this.checkInputNameError();
    },

    isSubjectSelected(subject) {
      return this.selectedSubjects.includes(subject.val);
    },

    onToggleSubject(subject) {
      if (this.isSubjectSelected(subject)) {
        const copy = [...this.selectedSubjects];
        remove(copy, (el) => el === subject.val);
        this.selectedSubjects = copy;
      } else {
        this.selectedSubjects = [subject.val, ...this.selectedSubjects];
      }

      this.checkErrors();

      if (this.selectedSubjects.length > 3) {
        this.selectedSubjects.shift();
        return;
      }

      this.$emit('subjectChanged', this.selectedSubjects);
    },
  },
};
</script>

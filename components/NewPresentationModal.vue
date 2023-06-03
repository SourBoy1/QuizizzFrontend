<template>
  <Modal
    subtitle=""
    title=""
    transition="none"
    :button1="{
      title: $i18n('Cancel'),
      type: 'other',
      size: 'md',
      disabled: false,
      loading: false,
      layout: 'default',
    }"
    :button2="{
      title: savedName ? $i18n('Save') : $i18n('Next'),
      type: 'primary',
      size: 'md',
      disabled: isSaveDisabled,
      loading: isAwaitingSave,
      layout: 'default',
      ariaDescribedBy: 'relevant-subjects-error-message',
    }"
    :stickToBottom="isStuckToBottom"
    @button1-click="onCancelClicked"
    @button2-click="onNextClick"
    @close="onCancelClicked"
  >
    <div class="flex">
      <img
        class="w-10 h-10 rounded-full grow-0"
        :src="contentImage"
      />

      <div class="flex flex-col mb-6 ml-3">
        <h1 class="text-lg font-semibold text-dark-2">
          <template v-if="savedName">
            <i18n v-if="isQuizTypeContent">
              Edit quiz
            </i18n>
            <i18n v-else-if="$user.isCorporate">
              Edit presentation
            </i18n>
            <i18n v-else>
              Edit lesson
            </i18n>
          </template>

          <template v-else>
            <i18n v-if="isQuizTypeContent">
              Create a quiz
            </i18n>
            <i18n v-else-if="$user.isCorporate">
              Create a presentation
            </i18n>
            <i18n v-else>
              Create a lesson
            </i18n>
          </template>
        </h1>
        <h2 class="text-xs text-dark-4">
          <template v-if="isCorporateUser">
            <i18n v-if="isQuizTypeContent">
              Great for training and engagement activities
            </i18n>
            <i18n v-else>
              Interactive presentations with real time feedback
            </i18n>
          </template>

          <template v-else>
            <i18n v-if="isQuizTypeContent">
              Ideal for student-paced sessions or self-paced assignments.
            </i18n>
            <i18n v-else>
              Ideal for instructor-led sessions or self-paced assignments.
            </i18n>
          </template>
        </h2>
      </div>
    </div>

    <QuizNameAndSubjectEditor
      ref="quiz-name-subjects-editor"
      :name="savedName"
      :errors="errors"
      :forContentType="forContentType"
      :subjects="[...savedSubjects]"
      @error="handleQuizNameError"
      @nameChanged="handleQuizNameChange"
      @subjectChanged="handleSubjectChange"
    />
  </Modal>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import get from 'lodash/get';

import { mapGetters } from 'vuex';

import { redirectOnLeavingEditor } from '~/utils/QuizUtils.js';
import Constants from '../config/Constants';

import QuizService from '../services/apis/QuizService';
import QLogger from '../services/QLogger';

export default {

  props: {
    forContentType: {
      type: String,
      required: true,
      validator: (val) => values(Constants.ContentType).includes(val),
    },

    savedName: {
      type: String,
      default: '',
    },
    savedSubjects: {
      type: Array,
      default: () => [],
    },

    isStuckToBottom: {
      type: Boolean,
      default: false,
    },
    shouldRedirectToAdmin: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'onLessonUpdate'],

  data() {
    return {
      selectedSubjects: [...this.savedSubjects],
      lessonName: this.savedName,
      errors: {
        selectedSubjects: {
          show: false,
          message:
            this.$i18n('Please select relevant subjects for better content suggestions'),
        },

        lessonName: {
          show: false,
          message: this.$i18n('Please enter a name longer than 3 characters'),
        },

        maximumSubjectsExceeded: {
          show: false,
          message: this.$i18n(' (maximum 3 subjects)'),
        },
      },

      isAwaitingSave: false,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'draftId', 'draft', 'getCurriculum']),
    ...mapGetters('root', ['isDesktop', 'isMobile']),

    isContentQuizType() {
      return this.type === this.$constants.ContentType.QUIZ;
    },

    hasValidLessonName() {
      return this.lessonName.length > 3;
    },
    hasSelectedSubjects() {
      return !isEmpty(this.selectedSubjects);
    },
    isCorporateUser() {
      return this.$user.isCorporate;
    },
    canCreateLesson() {
      if (this.isCorporateUser) {
        return this.hasValidLessonName;
      }

      return this.hasSelectedSubjects && this.hasValidLessonName;
    },

    isQuizTypeContent() {
      return this.forContentType === Constants.ContentType.QUIZ;
    },

    contentImage() {
      if (this.isQuizTypeContent) {
        return 'https://cf.quizizz.com/img/illustrations/quiz.png';
      }

      return 'https://cf.quizizz.com/img/illustrations/lesson.png';
    },

    isSaveDisabled() {
      return this.lessonName.length > this.charLimit || this.isAwaitingSave;
    },
  },

  watch: {
    selectedSubjects: {
      handler(newValue) {
        if (newValue.length > 3) {
          this.errors.maximumSubjectsExceeded.show = true;
          this.selectedSubjects.shift();
        } else if (newValue.length < 3) {
          this.errors.maximumSubjectsExceeded.show = false;
        }
      },

      deep: true,
    },
  },

  created() {
    this.$eventBus.$on('presentationEditor:createOrUpdateQuiz', this.createOrUpdateQuiz);
  },

  beforeUnmount() {
    this.$eventBus.$off('presentationEditor:createOrUpdateQuiz', this.createOrUpdateQuiz);
  },

  mounted() {
    // Send event only when new lesson is created
    if (!this.savedName) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.forContentType, this.$webEvents.EDITOR_PRE_CREATE_LOAD);
      this.$analytics.logEvent(eventName);
    }

    if (this.isMobile) {
      this.$store.dispatch('root/hideHelpButton');
    }
  },

  methods: {

    onNextClick() {
      this.checkErrors();
      if (!this.canCreateLesson) {
        return;
      }
      if (this.isQuizTypeContent) {
        this.createOrUpdateQuiz();
        return;
      }

      this.handleNextClickForLesson();
    },

    handleNextClickForLesson() {
      if (!this.savedName) {
        this.$eventBus.$emit('newPresentationModal:nextClicked', { lessonName: this.lessonName, selectedSubjects: this.selectedSubjects });
      } else {
        this.createOrUpdateQuiz();
      }
    },

    handleQuizNameError(hasError) {
      this.errorInQuizName = hasError;

      if (hasError) {
        this.$refs['quiz-name-subjects-editor'].$el.scrollIntoView();
      }
    },

    handleQuizNameChange(name) {
      this.lessonName = name;
    },

    handleSubjectChange(subjects) {
      this.selectedSubjects = subjects;
    },

    onCancelClicked() {
      if (this.shouldRedirectToAdmin) {
        const { query } = this.$route;

        redirectOnLeavingEditor(query, '/admin', this.$router, this.$store);
      } else {
        this.$emit('close');
      }
    },

    checkErrors(type) {
      this.$refs['quiz-name-subjects-editor'].checkErrors();

      if (type === 'lessonName' || isEmpty(type)) {
        this.errors.lessonName.show = !this.hasValidLessonName;
      }

      if (!this.isCorporateUser) {
        if (type === 'selectedSubjects' || isEmpty(type)) {
          this.errors.selectedSubjects.show = !this.hasSelectedSubjects;
        }
      }
    },

    async createOrUpdateQuiz() {
      const data = {
        subjects: this.selectedSubjects,
        name: this.lessonName,
        type: this.isQuizTypeContent ? this.$constants.ContentType.QUIZ : this.$constants.ContentType.PRESENTATION,
      };

      this.isAwaitingSave = true;
      let response;

      if (this.savedName) {
        const response = await QuizService.update(this.quizId, this.draftId, data);

        // toggle editor of sync modal if draft ID is incorrect
        if (!response.success) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Something went wrong while updating the quiz'),
          });
          if (get(response, 'error.response.data.error', null) === 'version.NOT_ALLOWED') {
            this.$eventBus.$emit('quizVersion:staleDraft', true);
          }
        }
        this.$emit('onLessonUpdate');
      } else {
        try {
          response = await QuizService.createQuiz(data);

          const quizId = response.quiz._id;
          const { query } = this.$route;

          if (this.isQuizTypeContent) {
            this.$router.push({ path: `/quiz/creator/${quizId}/edit`, query });
          } else {
            const eventName = this.$webEvents.getQuizEditorEvent(this.forContentType, this.$webEvents.EDITOR_PRE_CREATE_SAVE);
            this.$analytics.logEvent(eventName, { quizId });
            this.$router.push({ path: `/presentation/${quizId}/edit`, query });
          }
        } catch (error) {
          QLogger.error('Error at NewPresentationModal.createOrUpdateQuiz', error);

          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Something went wrong while creating the quiz!'),
          });

          this.isAwaitingSave = false;
        }
      }
    },

    isSelected(subject) {
      return this.selectedSubjects.includes(subject.val);
    },

  },
};
</script>

<template>
  <div class="fixed inset-0 w-full z-9999 flex flex-col">
    <div class="w-full bg-light-3 h-14 flex items-center justify-between px-4">
      <div class="flex items-center space-x-4">
        <div @click="handleBack">
          <FA
            icon="fa-solid fa-arrow-left"
            :size="18"
          />
        </div>
        <h2 class="text-dark-2 text-xl font-semibold">
          <i18n>Quiz generator</i18n>
        </h2>
      </div>
      <Button
        v-if="quizGenLoading"
        type="link"
        :title="$i18n('Stop')"
        @click="handleStopQuizGen"
      />
    </div>
    <div
      class="bg-light-1 flex flex-col items-center justify-center h-full"
    >
      <div
        v-if="quizGenGenerated"
        class="flex-1 w-full flex justify-center pt-25"
      >
        <div class="flex flex-col items-center">
          <transition
            appear
            enter-active-class="animate__animated animate__flipInY animation-duration-300 animation-delay-200"
            leave-active-class="animate__animated animate__flipOutY animation-duration-200"
          >
            <FA
              icon="fa-solid fa-circle-check"
              class="text-green-light"
              :size="72"
            />
          </transition>
          <p class="text-dark-4 text-lg font-semibold mt-5">
            <i18n>Your quiz is ready!</i18n>
          </p>
        </div>
      </div>
      <div
        v-else-if="quizGenLoading"
        class="flex-1 w-full flex pt-32"
      >
        <div class="flex flex-col items-center w-full px-8">
          <img
            src="https://cf.quizizz.com/gif/magic_wand_chat_gpt.gif"
            :alt="$i18n('Sit back while we generate your quiz')"
            class="w-44 min-h-15 h-auto object-contain mb-4"
          />
          <ProgressBar
            ref="render-progress-bar"
            :maxValue="100"
            :currentValue="quizGenLoaderStatus"
            class="h-1.5 w-45"
          />
          <p class="text-sm font-semibold text-dark-4 text-center mt-10 min-h-12">
            {{ loadingString }}
          </p>
        </div>
      </div>
      <QuizGenError
        v-else-if="quizGenError"
        :title="$i18n('We couldn’t generate this quiz')"
        :subTitle="$i18n('You can retry generating this quiz or create a new one')"
        @primary-click="handleQuizGeneratorSelection({ isCanceled: true, screen: 'EditorSelectorError' })"
        @secondary-click="handleQuizGeneratorSelection({ screen: 'EditorSelectorError' })"
      />
      <QuizGeneratorForm
        v-else
        :formValues="formValues"
        :gradesList="gradesList"
        :handleFormUpdate="handleFormUpdate"
        :isFormValid="isFormValid"
        :sortedSubjectsList="sortedSubjectsList"
        :isDesktop="isDesktop"
        @submit="handleFormSubmit('QuizGeneratorForm')"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import QuizService from '~/services/apis/QuizService';

import HotjarService, { HotjarEvents } from '~/services/HotjarService';

import getSubjectsList from '~/config/Subjects';
import Grades from '~/config/Grades';
import Languages from '~/config/Languages.js';
import QuizGenError from './QuizGenError.vue';
import QuizGeneratorForm from './QuizGeneratorForm.vue';

const ALL = 'All';

export default {

  components: {
    QuizGeneratorForm,
    QuizGenError,
  },

  props: {
    quizId: {
      type: String,
      required: true,
    },
    draftId: {
      type: String,
      required: true,
    },
    toggleQuizGenerator: {
      type: Function,
      required: true,
    },
  },
  emits: ['refreshQuiz'],

  data() {
    const subjectsList = getSubjectsList().map((subject) => ({
      title: subject.text,
      value: subject.val,
    }));
    const sortedSubjectsList = subjectsList.sort((a, b) => a.value.localeCompare(b.value));
    sortedSubjectsList.unshift({
      title: this.$i18n('All Subjects'),
      arrayValue: -1,
      value: ALL,
    });

    const gradesList = Grades.map((grade) => ({
      title: grade.text,
      arrayValue: grade.val,
      value: grade.val.toString(),
    }));
    gradesList.unshift({
      title: this.$i18n('All Grades'),
      arrayValue: -1,
      value: ALL,
    });

    const languagesList = Languages.map((language) => ({
      title: language.name,
      value: language.val,
      code: language.code,
    }));
    const defaultLanguage = languagesList.find((language) => language.code === this.$user.preferences.lang)?.value || 'English';

    return {
      sortedSubjectsList,
      gradesList,
      languagesList,

      dataToUpdateTheQuizInfo: { // gets updated once a form is submitted
        subject: '',
        grade: '',
        numberOfQuestions: 10,
        lang: defaultLanguage,
      },

      formValues: {
        topic: '',
        subject: '',
        grade: '',
        numberOfQuestions: 10,
        lang: defaultLanguage,
      },

      loadingIterations: 1,
      loadingStrings: [
        this.$i18n('Hang tight! Your quiz is being generated.'),
        this.$i18n('This may take a moment'),
        this.$i18n('This may take a moment. Almost there.'),
        this.$i18n('Hold on tight! Adding finishing touches'),
      ],

      loadingString: this.$i18n('Hang tight! Your quiz is being generated.'),
      loaderInterval: null,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['draft']),
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('uiManager', ['quizGenLoading', 'quizGenLoaderStatus', 'quizGenGenerated', 'quizGenError']),
    isFormValid() {
      return this.formValues.topic !== '';
    },
  },

  watch: {
    quizGenGenerated(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.$store.dispatch('uiManager/resetQuizGenData');
          this.$emit('refreshQuiz');
          this.toggleQuizGenerator({ shouldShow: false });
          this.$router.replace({ path: this.$route.path, query: { survey: 'quizGenContinueToEdit' } });
        }, 2000);
      }
    },
  },

  mounted() {
    if (this.draft) {
      this.dataToUpdateTheQuizInfo.subject = this.draft.subjects?.[0] || '';
      this.dataToUpdateTheQuizInfo.grade = String(this.draft.grade?.[0]) || '';
      this.dataToUpdateTheQuizInfo.lang = this.draft.lang || '';

      this.formValues.subject = this.draft.subjects?.[0] || '';
      this.formValues.grade = String(this.draft.grade?.[0]) || '';
    }
  },

  unmounted() {
    if (this.loaderInterval) {
      clearInterval(this.loaderInterval);
    }
  },

  methods: {
    handleFormUpdate(key, value, clickEvent) {
      this.formValues[key] = value;
      if (clickEvent) {
        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_SUGGESTIONS_SELECTED, {
          quizId: this.quizId,
          suggestion: value,
        });
      }
    },

    /**
     * {isCanceled: Boolean, eventName?: string}
     * isCanceled: true => user wants to create a quiz from scratch
     * screen: on which screen the button was clicked
     */
    handleQuizGeneratorSelection({ isCanceled, screen }) {
      if (isCanceled) {
        this.toggleQuizGenerator({ shouldShow: false });
      }
      this.$store.dispatch('uiManager/resetQuizGenData');
      if (this.loaderInterval) {
        clearInterval(this.loaderInterval);
      }
      const eventName = isCanceled ? this.$webEvents.CREATE_QUIZ_FROM_SCRATCH : this.$webEvents.USE_QUIZ_GENERATOR;
      HotjarService.triggerEvent(HotjarEvents.HOTJAR_QUIZ_GEN_SELECTED);
      this.$analytics.logEvent(eventName, {
        screen,
        quizId: this.quizId,
      });
    },

    handleFormSubmit() {
      const {
        topic, subject, grade, numberOfQuestions,
      } = this.formValues;
      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_CREATE_CLICK, {
        quizId: this.quizId,
      });
      this.$store.dispatch('uiManager/generateQuiz', {
        meta: {
          topic, subject, grade, numberOfQuestions, draftId: this.draftId, quizId: this.quizId,
        },
      });
      this.loaderInterval = setInterval(() => {
        this.loadingIterations += 1;
        this.$nextTick(() => {
          this.loadingString = this.loadingStrings[this.loadingIterations % 4];
        });
      }, 5000);
    },

    handleBack() {
      if (!this.quizGenLoading && !this.quizGenGenerated) {
        QuizService.deleteQuiz(this.quizId).then((response) => {
          if (response.success) {
            this.$toasts.add({
              type: this.$constants.ToastTypes.ERROR,
              title: this.$i18n('The quiz has been deleted since it had no questions'),
            });
          }
        });
      }

      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_BACK_CLICK, {
        quizId: this.quizId,
      });
      this.$router.push({ path: '/admin' });
    },

    handleStopQuizGen() {
      QuizService.deleteQuiz(this.quizId).then((response) => {
        if (response.success) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            title: this.$i18n('Stopped Generating the Quiz'),
          });
        }
      });
      this.$analytics.logEvent(this.$webEvents.STOP_QUIZ_GEN, {
        quizId: this.quizId,
      });
      this.$store.dispatch('uiManager/resetQuizGenData');
      this.$router.push({ path: '/admin' });
    },
  },
};
</script>

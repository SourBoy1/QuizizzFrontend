<template>
  <Modal
    :title="$i18n('What kind of questions do you want?')"
    icon="fas fa-wand-magic-sparkles"
    :button2="{
      title: $i18n('Add questions'),
      type: 'primary',
      loading: isAddingQuestions,
      disabled: !formData.topic.trim(),
    }"
    @close="$emit('close')"
    @button2-click="handleAddQuestions"
  >
    <div class="flex flex-col gap-4 mx-4 mb-2">
      <Input
        :label="$i18n('Topic')"
        :placeholder="$i18n('Enter topic here...')"
        :tabindex="0"
        inputClasses="font-semibold"
        :value="formData.topic"
        @input="(value) => handleUpdateFormData('topic', value)"
      />
      <div class="flex flex-col gap-4">
        <div class="flex gap-4">
          <SelectBox
            :value="formData.grade"
            class="basis-1/2"
            :label="$i18n('Grade')"
            :list="gradesList"
            :placeholder="$i18n('Select grade')"
            @input="(value) => handleUpdateFormData('grade', value)"
          />
          <SelectBox
            :value="formData.subject"
            class="basis-1/2"
            :label="$i18n('Subject')"
            :list="sortedSubjectsList"
            :placeholder="$i18n('Select subject')"
            @input="(value) => handleUpdateFormData('subject', value)"
          />
        </div>
        <div class="flex gap-4">
          <SelectBox
            :value="formData.difficulty"
            class="basis-1/2"
            :list="difficultyList"
            :label="$i18n('Difficulty level')"
            :placeholder="$i18n('Select difficulty')"
            @input="(value) => handleUpdateFormData('difficulty', value)"
          />
          <SelectBox
            :value="formData.numberOfQuestions"
            :list="numberOfQuestionsList"
            class="basis-1/2"
            :label="$i18n('Number of questions')"
            @input="(value) => handleUpdateFormData('numberOfQuestions', value)"
          />
        </div>
      </div>
      <div
        v-if="noQuestionsFound"
        class="flex gap-1.5 items-start"
      >
        <FA
          icon="fas fa-circle-exclamation"
          :size="12"
          class="text-red-dark mt-[7px]"
        />
        <p class="text-red-dark text-sm">
          <i18n>We couldn’t find any relevant questions. Please try a different topic.</i18n>
        </p>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import uniqBy from 'lodash/uniqBy';
import isEmpty from 'lodash/isEmpty';

import { setSearchQueryIdFromUserObject } from '~/utils/Utilities.js';
import SearchService from '~/services/apis/SearchService';
import { createQuestionsPool, generateAutomaticQuiz } from '~/utils/QuizGenUtils.js';
import getSubjectsList from '~/config/Subjects';
import Grades from '~/config/Grades';
import getDifficultyList from '~/config/Difficulties';

const ALL = 'All';
const DifficultyLevels = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};
export default {

  props: {
    addnewquestionsIndex: {
      type: Number,
      default: -1,
    },
  },
  emits: ['close'],

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

    const difficultyList = getDifficultyList().map((difficulty) => ({
      title: difficulty.text,
      value: difficulty.val,
    }));
    const numberOfQuestionsList = [5, 10, 15, 20].map((number) => ({
      title: number,
      value: number,
    }));

    return {
      numberOfQuestionsList,
      formData: {
        topic: '',
        subject: '',
        grade: '',
        difficulty: 'easy',
        numberOfQuestions: 5,
        lang: '',
      },

      isAddingQuestions: false,
      quizGenPool: {
        mcqPool: [],
        nonMcqPool: [],
        usedQuestionsMap: {}, // list of questions which user has seen at least once so that we can filter these out while creating a new quiz
        currentQuiz: [],
      },

      noQuestionsFound: false,

      uniqueQuestions: [],
      subjectsList,
      sortedSubjectsList,
      gradesList,
      difficultyList,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'quizGenFilters']),
  },

  mounted() {
    this.formData.topic = this.quizGenFilters?.topic?.trim() ?? '';
    this.formData.subject = this.quizGenFilters?.subject ?? '';
    this.formData.grade = this.quizGenFilters?.grade ?? '';
    this.formData.numberOfQuestions = this.quizGenFilters.numberOfQuestions;
    this.formData.lang = this.quizGenFilters.language;
  },

  methods: {
    ...mapActions({
      setQuizGenFilters: 'contentEditor/setQuizGenFilters',
    }),

    handleDifficulty() {
      if (this.formData.grade === ALL) {
        return this.formData.grade;
      }
      if (this.formData.difficulty === DifficultyLevels.MEDIUM) {
        return Number(this.formData.grade) + 1;
      } if (this.formData.difficulty === DifficultyLevels.HARD) {
        return Number(this.formData.grade) + 2;
      }
      return this.formData.grade;
    },

    handleUpdateFormData(key, value) {
      this.formData[key] = value;
      this.setQuizGenFilters({ filter: key, value });
    },

    async handleAddQuestions() {
      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_ADD_QUESTIONS_BTN_CLICKED, {
        quizId: this.quizId,
        topic: this.formData.topic,
        subject: this.formData.subject,
        grade: this.formData.grade,
        difficulty: this.formData.difficulty,
        numberOfQuestions: this.formData.numberOfQuestions,
        lang: this.formData.lang,
      });
      this.isAddingQuestions = true;
      const {
        topic, subject, lang, numberOfQuestions,
      } = this.formData;
      const grade = this.handleDifficulty();

      let finalGrade; let
        finalSubject;
      if (grade === ALL) {
        finalGrade = [];
      } else if (isEmpty(grade)) {
        finalGrade = [];
      } else {
        finalGrade = [Number(grade)];
      }

      if (subject === ALL) {
        finalSubject = [];
      } else if (isEmpty(subject)) {
        finalSubject = [];
      } else {
        finalSubject = [subject];
      }

      const teleportData = {
        grades: finalGrade,
        langs: [lang],
        numQuestions: [],
        page: 'Editor',
        queryId: setSearchQueryIdFromUserObject(this.$user),
        searchIn: 'all_quizzes',
        sortKey: '_score',
        source: 'QuizGenerator',
        subject: finalSubject,
        term: topic.trim(),
        type: ['quiz'],
        noCache: true,
      };
      await this.handleAddQuestionsForEditor(teleportData, numberOfQuestions);
      this.isAddingQuestions = false;
    },

    handleQuestionsCreation(responses) {
      const quizPool = responses.hits?.slice(0, 5);
      const questionsPool = createQuestionsPool(quizPool, this.$user.isSuper);
      this.quizGenPool.mcqPool = questionsPool.mcqPool;
      this.quizGenPool.nonMcqPool = questionsPool.nonMcqPool;
      const { quiz, mcqPool, nonMcqPool } = generateAutomaticQuiz(this.quizGenPool, this.formData.numberOfQuestions);
      if (quiz.length) {
        this.hasQuizGeneratorError = false;
        this.quizGenPool.mcqPool = mcqPool;
        this.quizGenPool.nonMcqPool = nonMcqPool;
        this.quizGenPool.currentQuiz = quiz;
      } else {
        this.quizGenPool.mcqPool = [];
        this.quizGenPool.nonMcqPool = [];
        this.quizGenPool.currentQuiz = [];
      }
    },

    async handleAddQuestionsForEditor(data) {
      let response = await SearchService.getTeleportQuizzes(0, data, 'Editor');
      if (response?.hits?.length === 0) {
        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_ZERO_SEARCH_RESULTS, {
          hitNumber: 1,
        });
        data.subject = '';
        data.grades = [];
        // if the results are empty, we will try to search without subject and grade
        response = await SearchService.getTeleportQuizzes(0, data, 'Editor');
        if (response?.hits?.length === 0) {
          this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_ZERO_SEARCH_RESULTS, {
            hitNumber: 2,
          });
          this.noQuestionsFound = true;
          return;
        }
      }
      this.handleQuestionsCreation(response);
      const array = [...this.quizGenPool.currentQuiz];
      this.uniqueQuestions = uniqBy(array, '_id');
      if (this.uniqueQuestions.length === 0) {
        this.noQuestionsFound = true;
        return;
      }
      const questionsResponse = await this.$store.dispatch('contentEditor/createMultipleQuizQuestion', { questions: this.uniqueQuestions, index: this.addnewquestionsIndex + 1 });
      if (!questionsResponse.success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while creating the questions'),
        });
        return;
      }
      this.$emit('close');
    },
  },
};
</script>

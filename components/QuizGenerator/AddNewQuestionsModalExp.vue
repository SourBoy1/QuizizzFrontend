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
    shouldCloseOnEscape
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
import { mapGetters, mapActions } from 'vuex';
import uniqBy from 'lodash/uniqBy';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

import { setSearchQueryIdFromUserObject } from '~/utils/Utilities.js';
import SearchService from '~/services/apis/SearchService';
import SuggestionService from '~/services/SuggestionService';
import Constants from '~/config/Constants';
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
        language: '',
      },

      isAddingQuestions: false,

      noQuestionsFound: false,

      finalRankedQuestions: [],
      subjectsList,
      sortedSubjectsList,
      gradesList,
      difficultyList,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'quizGenFilters', 'quizGenFiltersCopy', 'quizGenQuestions', 'indexToAddQuizGenQuestions']),

    isFormDataWithoutNumberOfQuestionsChanged() {
      const obj1 = { ...this.quizGenFiltersCopy };
      delete obj1.numberOfQuestions;
      const obj2 = { ...this.quizGenFilters };
      delete obj2.numberOfQuestions;
      return !isEqual(obj1, obj2);
    },

    isNumberOfQuestionsChanged() {
      return this.quizGenFilters.numberOfQuestions !== this.quizGenFiltersCopy.numberOfQuestions;
    },

  },

  mounted() {
    this.formData.topic = this.quizGenFilters?.topic ?? '';
    this.formData.subject = this.quizGenFilters?.subject ?? '';
    this.formData.grade = this.quizGenFilters?.grade ?? '';
    this.formData.numberOfQuestions = this.quizGenFilters.numberOfQuestions;
    this.formData.language = this.quizGenFilters.language;
  },

  methods: {
    ...mapActions({
      setQuizGenFilters: 'contentEditor/setQuizGenFilters',
      setQuizGenQuestions: 'contentEditor/setQuizGenQuestions',
      setIndexToAddQuizGenQuestions: 'contentEditor/setIndexToAddQuizGenQuestions',
    }),

    getFinalQuestions() {
      return this.quizGenQuestions.slice(this.indexToAddQuizGenQuestions, this.indexToAddQuizGenQuestions + this.formData.numberOfQuestions);
    },

    getCorrectAnswerString(question) {
      const structure = question?.structure;
      switch (question?.type) {
        case Constants.QuestionTypes.MCQ:
          if (!Array.isArray(structure?.answer)) {
            return structure?.options?.find((_, index) => index === structure?.answer)?.text ?? '';
          }
          if (Array.isArray(structure?.answer) && structure?.answer?.length > 0) {
            const answerOptions = structure?.options?.filter((_, index) => structure?.answer?.includes(index));
            return answerOptions?.map((option) => option?.text ?? '').join(' ');
          }
          break;
        case Constants.QuestionTypes.BLANK:
        case Constants.QuestionTypes.EQUATION:
          return structure?.options?.map((option) => option?.text ?? '').join(' ');
        case Constants.QuestionTypes.DROPDOWN:
        case Constants.QuestionTypes.DRAGNDROP: {
          const AnsOptionIds = structure?.answer?.map((ans) => ans?.optionId[0]);
          const answerOptions = structure?.options?.filter((option) => AnsOptionIds?.includes(option?._id ?? ''));
          return answerOptions?.map((option) => option?.text ?? '').join(' ');
        }
        default:
          return '';
      }
    },
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
        language: this.formData.language,
      });
      this.isAddingQuestions = true;
      const {
        topic, subject, language, numberOfQuestions,
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
        langs: [language],
        numQuestions: [],
        page: 'Editor',
        queryId: setSearchQueryIdFromUserObject(this.$user),
        searchIn: 'all_quizzes',
        sortKey: '_score',
        source: 'QuizGenerator',
        subject: finalSubject,
        term: topic?.trim(),
        type: ['quiz'],
        noCache: true,
      };

      if (this.isFormDataWithoutNumberOfQuestionsChanged) {
        await this.handleAddQuestionsForEditor(teleportData, numberOfQuestions);
      } else if (this.isNumberOfQuestionsChanged) {
        await this.handleQuestionAddWhenNoFiltersChange();
      } else {
        await this.handleQuestionAddWhenNoFiltersChange();
      }
      this.isAddingQuestions = false;
    },

    async handleQuestionAddWhenNoFiltersChange() {
      this.finalRankedQuestions = this.getFinalQuestions();
      this.setIndexToAddQuizGenQuestions(this.indexToAddQuizGenQuestions + this.formData.numberOfQuestions);
      if (this.finalRankedQuestions?.length === 0) {
        this.noQuestionsFound = true;
        return;
      }
      const questionsResponse = await this.$store.dispatch('contentEditor/createMultipleQuizQuestion', { questions: this.finalRankedQuestions, index: this.addnewquestionsIndex + 1 });
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

    async handleAddQuestionsForEditor(data) {
      this.noQuestionsFound = false;
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

      let searchQuestions = response?.hits?.map(({ info }) => [...info?.questions]);
      searchQuestions = searchQuestions.flat();
      const uniqueQuestions = uniqBy(searchQuestions, '_id');
      if (uniqueQuestions.length === 0) {
        this.noQuestionsFound = true;
        return;
      }

      const questionArrayForRelevancy = uniqueQuestions.reduce((acc, question) => {
        acc.push({
          qnid: question._id,
          text: question.structure?.query?.text ?? '',
          ra: this.getCorrectAnswerString(question),
        });
        return acc;
      }, []);
      const { data: responseData, success } = await SuggestionService.rankQuestions({
        topic: this.formData?.topic?.trim(),
        questions: questionArrayForRelevancy,
      });

      if (!success) {
        return;
      }

      const orderedQuestions = [];
      responseData?.qn_ids?.forEach((qnid) => {
        const question = uniqueQuestions.find((q) => q?._id === qnid);
        orderedQuestions.push(question);
      });

      this.setQuizGenQuestions(orderedQuestions);
      if (orderedQuestions?.length === 0) {
        this.noQuestionsFound = true;
        return;
      }
      this.setQuizGenFilters({ updateCopyOfFilters: true, value: this.formData });
      this.setIndexToAddQuizGenQuestions(this.formData.numberOfQuestions);

      const questionsResponse = await this.$store.dispatch('contentEditor/createMultipleQuizQuestion', { questions: orderedQuestions.slice(0, this.quizGenFilters.numberOfQuestions), index: this.addnewquestionsIndex + 1 });
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

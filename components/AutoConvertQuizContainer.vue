<template>
  <AutoConvertModal
    v-if="isAutoConvertModalOpen"
    :autoConvertItems="autoConvertItems"
    :convertedQuestion="convertedQuestion"
    :quizId="quizId"
    @close="handleAutoConvertModalClose"
    @bulkAutoConvert="bulkAutoConvert"
  />
</template>

<script>
import { mapGetters } from 'vuex';

import SessionStorage from '~/services/SessionStorage';
import { getAccountType } from '~/utils/UserUtils';
import Constants from '~/config/Constants';

const MIN_QUESTIONS_FOR_BULK_AUTO_CONVERT = 2;

export default {

  props: {
    quizViewData: {
      type: Array,
      required: true,
    },

    autoConvertQuestionsVersionsMap: {
      type: Object,
      default: () => { },
    },

    quizId: {
      type: String,
      required: true,
    },

    showConvertMore: {
      type: Boolean,
      default: false,
    },

    isUserQuizOwner: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['saveAutoConvertFromModal'],

  data() {
    return {
      isAutoConvertModalOpen: false,
      autoConvertItems: [],
      convertedQuestion: null,
      questionToConvert: null,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    isBasicUser() {
      return getAccountType(this.$user) === this.$constants.AccountTypes.BASIC;
    },

    // In bulk convert mode, limit the number of items to 25% of the total MCQs
    bulkAutoConvertItemsLimit() {
      const numberOfMCQQuestions = this.quizViewData.reduce((count, item) => (item.type === Constants.QuestionTypes.MCQ ? count + 1 : count), 0);
      return Math.ceil(numberOfMCQQuestions / 4);
    },
  },

  watch: {
    autoConvertQuestionsVersionsMap: {
      handler() {
        this.openAutoConvertModalOnLaunch();
      },
    },
  },

  mounted() {
    this.$eventBus.$on('autoConvertModal:show', this.handleAutoConvertModalOpen);
    this.$eventBus.$on('autoConvertModal:showConvertMore', this.openAutoConvertModalOnLaunch);
  },

  beforeUnmount() {
    this.$eventBus.$off('autoConvertModal:show', this.handleAutoConvertModalOpen);
    this.$eventBus.$off('autoConvertModal:showConvertMore', this.openAutoConvertModalOnLaunch);
  },

  methods: {
    handleAutoConvertModalClose() {
      this.isAutoConvertModalOpen = false;
      this.autoConvertItems = [];
      this.convertedQuestion = null;
      this.questionToConvert = null;
    },

    handleAutoConvertModalOpen(questionToConvert) {
      const modalItem = this.getAutoConvertModalItem(questionToConvert);
      if (modalItem) {
        this.autoConvertItems = [modalItem];
        this.isAutoConvertModalOpen = true;
        this.questionToConvert = questionToConvert;
      }
    },

    openAutoConvertModalOnLaunch() {
      const convertedQuestionIndex = SessionStorage.getItem('convertedQuestionIndex');
      this.convertedQuestion = this.quizViewData[convertedQuestionIndex];

      // Can't check for falsy values since index can be zero
      if (convertedQuestionIndex === null || !this.convertedQuestion) {
        return;
      }

      SessionStorage.removeItem('convertedQuestionIndex');

      if (!this.isUserQuizOwner) {
        return;
      }

      this.autoConvertItems = this.quizViewData.reduce((items, quizViewDataItem) => {
        const autoConvertModalItem = this.getAutoConvertModalItem(quizViewDataItem);
        return autoConvertModalItem ? items.concat(autoConvertModalItem) : items;
      }, []);

      this.autoConvertItems = this.autoConvertItems.slice(
        0,
        Math.max(this.bulkAutoConvertItemsLimit, MIN_QUESTIONS_FOR_BULK_AUTO_CONVERT),
      );

      this.isAutoConvertModalOpen = this.autoConvertItems.length >= MIN_QUESTIONS_FOR_BULK_AUTO_CONVERT;
      this.convertedQuestion = this.quizViewData[convertedQuestionIndex];
      this.questionToConvert = null;
    },

    getAutoConvertModalItem(question) {
      const mapId = question.cardId || question._id;
      const questionAutoConvertVersions = [...(this.autoConvertQuestionsVersionsMap[mapId] || [])];
      if (!questionAutoConvertVersions || !questionAutoConvertVersions.length) {
        return;
      }
      const lastQuestion = questionAutoConvertVersions.pop();
      const autoConvertVersions = [...questionAutoConvertVersions.slice(0, 2), lastQuestion];
      return { question, autoConvertVersions };
    },

    bulkAutoConvert({ autoConvertMap }) {
      const mapIds = Object.keys(autoConvertMap);

      if (!this.showConvertMore || mapIds.length > 1) {
        this.isAutoConvertModalOpen = false;
      }

      if (!this.isBasicUser && !this.$route.query.autoConvert && this.questionToConvert) {
        SessionStorage.setItem('convertedQuestionIndex', this.questionToConvert.index);
      }

      const quizViewData = this.quizViewData.map((quizViewItem) => {
        const mapId = quizViewItem.cardId || quizViewItem._id;
        if (mapIds.includes(mapId)) {
          return { ...quizViewItem, ...autoConvertMap[mapId].convertedQuestion };
        }
        return quizViewItem;
      });

      this.$emit('saveAutoConvertFromModal', { autoConvertMap, quizViewData });
    },
  },

};
</script>

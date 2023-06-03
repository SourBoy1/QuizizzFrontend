<template>
  <div
    class="q-types-list rounded-lg flex flex-col h-full bg-light-3 border-1 border-dark-6"
    :class="isDesktop ? isMcqBannerVisible ? 'min-w-197 min-h-[610px]' : 'min-w-197 min-h-[530px]' : 'max-w-190 min-h-[510px] w-full overflow-x-hidden'"
  >
    <FilterBar
      v-if="isDesktopOrTablet"
      :allQuestionTypesList="allQuestionTypesList"
      :questionTypesFromTemplate="questionTypesFromTemplate"
      @filterCategoryClicked="handleGradeFilterCategoryClick($event)"
      @questionTypeClickForPreview="handleQuestionTypeClickForPreview"
      @searchTextChange="handleSearchTextChange"
    />
    <div v-if="isDesktop">
      <hr class="w-full border-dark-6" />
    </div>
    <div
      v-if="isMcqBannerVisible && isDesktop"
      class="banner relative h-full p-2 m-3 flex bg-orange-faded flex-col border-1 border-solid border-orange border-opacity-20 rounded-md"
      @mouseenter="showCancelBtn = true"
      @mouseleave="showCancelBtn = false"
    >
      <Button
        v-if="showCancelBtn"
        absolutePositioning
        buttonClasses="right-1 top-1 rounded-[50%]"
        type="dark"
        size="xs"
        licon="fas fa-close"
        @click="handleMcqBannerClose"
      />
      <p class="text-sm text-black font-bold">
        <i18n>Uh-oh, Your quiz contains just multiple-choices.</i18n>
      </p>
      <p class="text-xs">
        <i18n>Add different question types to make the quiz more engaging.</i18n>&nbsp;<span class="text-black font-bold">Try now</span>👇
      </p>
    </div>
    <div
      v-else-if="isMcqBannerVisible && !isDesktop"
      class="banner h-full p-2 m-3 bg-orange-faded border-1 border-solid border-orange border-opacity-20 rounded-md"
    >
      <span class="text-sm text-black font-bold">
        <i18n>Uh-oh, Your quiz contains just multiple-choices.</i18n>
      </span>
      <span class="text-xs">
        <i18n>Add other question types</i18n>
      </span>
    </div>
    <div
      class="list h-full grid gap-y-6 p-4"
      :class="isDesktopOrTablet ? 'grid-cols-3' : 'grid-cols-1'"
    >
      <QuestionTypesSection
        v-for="questionSection in questionSectionData"
        :key="questionSection.value"
        :title="questionSection.title"
        :source="source"
        :questionsList="questionsListObject[questionSection.value]"
        :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
        :selectedGradeCategoryTab="selectedGradeCategoryTab"
        @questionTypeSelected="handleQuestionTypeSelected"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';

import FilterBar from '~/components/QuestionTypesVisibility/FilterBar.vue';
import QuestionTypesSection from '~/components/QuestionTypesVisibility/QuestionTypesSection.vue';

import { getAllContentTypes } from '~/utils/QuizUtils';

export default {

  components: {
    FilterBar,
    QuestionTypesSection,
  },

  props: {
    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },
    questionTypesFromTemplate: {
      type: Array,
      default: () => [],
    },
    doesQuizContainsOnlyMcqQuestions: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      default: '',
    },
  },
  emits: ['questionTypeClickForPreview', 'questionTypeSelected'],

  data() {
    const QuestionSectionData = [
      {
        title: this.$i18n('Choose Options'),
        value: 'chooseOptions',
      },
      {
        title: this.$i18n('Highlight'),
        value: 'highlight',
      },
      {
        title: this.$i18n('Open Response'),
        value: 'openResponse',
      },
      {
        title: this.$i18n('Fill, Match & Sort'),
        value: 'fillMatchSort',
      },
      {
        title: this.$i18n('Math'),
        value: 'math',
      },
      {
        title: this.$i18n('Opinion/Pulse check'),
        value: 'opinionPulseCheck',
      },
      {
        title: this.$i18n('Presentation'),
        value: 'presentation',
      },
    ];
    return {
      questionsListObject: {
        chooseOptions: [],
        highlight: [],
        openResponse: [],
        fillMatchSort: [],
        math: [],
        opinionPulseCheck: [],
        presentation: [],
      },

      copyOfQuestionsListObject: {},
      showCancelBtn: false,
      selectedGradeCategoryTab: 'all',
      questionSectionData: QuestionSectionData,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'isTablet']),
    ...mapGetters('uiManager', ['showMcqBannerOnQtypesList']),

    allQuestionTypesList() {
      return getAllContentTypes();
    },

    isDesktopOrTablet() {
      return this.isDesktop || this.isTablet;
    },

    isMcqBannerVisible() {
      return this.doesQuizContainsOnlyMcqQuestions && this.showMcqBannerOnQtypesList;
    },
  },

  mounted() {
    if (this.isMcqBannerVisible) {
      this.$analytics.logEvent(this.$webEvents.QTYPE_VISIBILITY_MCQ_BANNER_SHOWN);
    }
    this.questionsListObject = {
      chooseOptions: this.getQuestionTypesBySection('chooseOptions'),
      highlight: this.getQuestionTypesBySection('highlight'),
      openResponse: this.getQuestionTypesBySection('openResponse'),
      fillMatchSort: this.getQuestionTypesBySection('fillMatchSort'),
      math: this.getQuestionTypesBySection('math'),
      opinionPulseCheck: this.getQuestionTypesBySection('opinionPulseCheck'),
      presentation: this.getQuestionTypesBySection('presentation'),
    };
    this.copyOfQuestionsListObject = cloneDeep(this.questionsListObject);
  },

  methods: {
    getQuestionTypesBySection(section) {
      const allQuestionTypes = getAllContentTypes();
      return Object.values(allQuestionTypes).filter((question) => question.questionCategoryValue === section);
    },

    handleGradeFilterCategoryClick(category) {
      this.selectedGradeCategoryTab = category.value;
      const filteredQuestions = {};

      // filter the questions list object based on the category
      Object.keys(this.copyOfQuestionsListObject).forEach((section) => {
        filteredQuestions[section] = this.copyOfQuestionsListObject[section].filter((question) => question.questionCategoryBasedOnGrading?.includes(category.value));
      });

      // Update the questionsListObject with the filtered questions
      this.questionsListObject = filteredQuestions;
    },

    handleQuestionTypeClickForPreview(index) {
      this.$emit('questionTypeClickForPreview', index);
    },

    handleSearchTextChange(searchText) {
      const filteredQuestions = {};

      // filter the questions list object based on the searchText
      Object.keys(this.questionsListObject).forEach((section) => {
        filteredQuestions[section] = this.questionsListObject[section].map((question) => {
          if (question?.title?.toLowerCase()?.includes(searchText?.toLowerCase())) {
            return {
              ...question,
              highlighted: false,
            };
          }
          return {
            ...question,
            highlighted: true,
          };
        });
      });

      // Update the questionsListObject with the filtered questions
      this.questionsListObject = filteredQuestions;
    },

    handleQuestionTypeSelected(questionTypeData) {
      if (this.isMcqBannerVisible) {
        this.$analytics.logEvent(this.$webEvents.QTYPE_VISIBILITY_MCQ_BANNER_SHOWN, {
          onQuestionTypeSelect: true,
          questionType: questionTypeData.type,
        });
      }
      this.$emit('questionTypeSelected', questionTypeData);
    },

    handleMcqBannerClose() {
      this.$store.dispatch('uiManager/setMcqBannerVisibility', false);
    },
  },

};
</script>

<style lang="scss" scoped>
.list {
  grid-template-rows: min-content;
  grid-column-gap: 5.625rem;
}

.banner {
  background-image: url(https://cf.quizizz.com/image/banner.png);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right;
}
</style>

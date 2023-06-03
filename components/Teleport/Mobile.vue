<template>
  <transition
    :name="isEditorForPresentationContent ? 'slideInRight' : 'slideInLeft'"
    appear
  >
    <div
      v-if="showTeleport"
      ref="teleport-panel-wrapper-mobile"
      class="fixed top-0 bottom-0 w-full overflow-hidden bg-light"
      :style="teleportPanelWrapperStyles"
      :class="[shouldShowFiltersMobile ? '' : 'px-3']"
    >
      <div class="flex mt-3 ">
        <div
          class="flex"
          @click="closeTeleport"
        >
          <FA
            icon="fas fa-chevron-left"
            class="self-center mx-4"
            :size="12"
          />
        </div>
        <TeleportSearchMobile
          :searchTerm="currentTeleportSearchTerm"
          :teleportSearchTerm="teleportSearchTerm"
          @input="onTeleportSearchInputChange"
          @searchTermSubmit="onSearchTeleportSubmit"
          @openFilters="onOpenFilters"
        />
        <SearchFiltersContainerMobile
          v-if="shouldShowFiltersMobile && teleportSearchTerm"
          :filters="requiredSearchFilters"
          :selectedFilters="selectedFilters"
          :multiFilters="multiFilters"
          @close="toggleFilterContainer"
          @toggleFilterCheckbox="toggleFilterCheckbox"
          @clearFilters="onClearFilters"
          @onSearch="onSearch"
        />
      </div>

      <div
        v-if="teleportSearchTerm"
        class="mt-4 flex flex-row mb-4 ml-1"
      >
        <div class="mr-2 font-semibold text-dark-3 text-xxs">
          <i18n>Show only from My Library</i18n>
        </div>
        <Switchbox
          :inputId="getUUID()"
          name="switches"
          :aria-label="$i18n('My library filter')"
          size="sm"
          @input="toggleFilter"
        />
      </div>

      <hr class="pb-1 -ml-3 divider" />

      <div
        ref="quizQuestionCard"
        :class="['flex mt-2', showEmptyState ? 'h-full' : 'custom-height']"
      >
        <div
          v-if="showEmptyState"
          class="flex flex-col items-center w-full h-full px-4 py-8 rounded-lg bg-light-2"
        >
          <img
            src="https://cf.quizizz.com/image/emptystate-notfound.png"
            class="w-24 h-24"
            alt=""
          />
          <div class="font-semibold text-dark-2">
            <i18n v-if="onlyLessons">
              No lessons found
            </i18n>
            <i18n v-else>
              No quizzes or lessons found
            </i18n>
          </div>
          <div class="mt-2 text-sm text-dark-2">
            <i18n>Try using a different search term or fewer filters.</i18n>
          </div>
        </div>
        <div
          v-if="!hasDisplayContent && !showEmptyState"
          class="bg-light-2 flex-1 border-1 border-dark-20% border-dashed rounded relative z-10"
        >
          <div
            class="absolute inset-0 text-2xl font-semibold text-yellow-light"
            style="top: calc(50% - 16px); left: calc(50% - 110px)"
          >
            <i18n>Select a quiz below.</i18n>
          </div>
          <div
            class="h-14 w-14 bg-yellow-10% rounded-full absolute"
            style="top: calc(80% - 28px); left: calc(50% - 28px)"
          >
            <img
              height="40"
              width="40"
              src="https://storage.googleapis.com/quizizz-static-content/game/img/misc/icon-point-down.png"
              class="relative"
              style="top: calc(50% - 20px); left: calc(50% - 20px)"
            />
          </div>
        </div>

        <transition name="fade">
          <div
            v-if="hasDisplayContent"
            :key="displayContent._id"
            ref="teleportMobileScrollContainer"
            :class="['overflow-y-scroll teleport-questions-list-container bg-light w-full', canShowAddAllQuestionsOption ? 'add-all-option' : '', canShowSuperResourceBanner ? 'super-banner' : '', isSuperUser ? 'super-user' : '']"
          >
            <MultiQuestionsTeleportScroll
              class="mr-1"
              :displayContentList="[displayContent]"
              :isAddingTeleportInProgress="isAddingTeleportInProgress"
              :searchSubmitCallInProgress="searchSubmitCallInProgress"
              :addAllQuestionsTitle="addAllQuestionsTitle"
              :canAddAllQuestions="canAddAllQuestions"
              :addAllQuestionButtonType="addAllQuestionButtonType"
              :isDisplayContentQuizType="isDisplayContentQuizType"
              :isBulkAddingTeleportInProgress="isBulkAddingTeleportInProgress"
              :isForQuizEditor="isForQuizEditor"
              @addAllQuestions="addAllQuestions"
              @addQuestion="onAddSingleQuestion"
            />
            <hr class="border-1 border-super-20% fixed horizontal-line z-1 left-0 w-full" />
          </div>
        </transition>
      </div>
      <div
        v-show="!showEmptyState"
        class="flex absolute bg-super-faded inset-x-0 bottom-0 border-t-2 border-solid h-32 border-super-20%"
      >
        <div
          class="absolute left-0 right-0 flex justify-center teleport-question-wrapper bottom-4"
        >
          <TeleportHorizontalQuestionList
            ref="teleportHorizontalQuestionList"
            :isLoadingState="searchSubmitCallInProgress"
            :showLoader="loadMoreCallInProgress"
            :selectedCard="displayContent"
            :list="quizzesList"
            :searchSubmitCallInProgress="searchSubmitCallInProgress"
            @loadMoreQuiz="loadMoreQuiz"
            @onContentSelected="onContentSelected"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import omit from 'lodash/omit';
import remove from 'lodash/remove';
import isEmpty from 'lodash/isEmpty';

import { getUUID } from '~/services/UIDService.js';
import Search from '~/config/SearchConfig';
import getSubjectsList from '~/config/Subjects';
import GRADES from '~/config/Grades';
import LANGUAGES from '~/config/Languages';
import Constants from '~/config/Constants';
import { getOnlyQuestions } from '~/utils/QuizUtils.js';

export default {
  props: {
    forPage: {
      type: String,
      default: Constants.TeleportPageTypes.PRESENTATION_EDITOR,
      validator: (val) => ([Constants.TeleportPageTypes.QUIZ_EDITOR, Constants.TeleportPageTypes.PRESENTATION_EDITOR]).includes(val),
    },

    currentTeleportSearchTerm: {
      type: String,
      default: '',
    },

    onSearchTeleport: {
      type: Function,
      default: () => true,
    },

    isAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },

    isBulkAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },

    teleportSearchTerm: {
      type: String,
      default: '',
    },

    onlyLessons: {
      type: Boolean,
      default: false,
    },

    isOnlyPersonal: {
      type: Boolean,
      default: false,
    },

    quizzesList: {
      type: Array,
      default: () => [],
    },

    grades: {
      type: Array,
      default: () => [],
    },
    subjects: {
      type: Array,
      default: () => [],
    },
    languages: {
      type: Array,
      default: () => [],
    },
    numQuestions: {
      type: Array,
      default: () => [],
    },
    filterTags: {
      type: Array,
      default: () => [],
    },
    loadMoreCallInProgress: {
      type: Boolean,
      default: false,
    },
    searchSubmitCallInProgress: {
      type: Boolean,
      default: false,
    },
    displayContent: {
      type: Object,
      default: () => {},
    },

    showTeleport: {
      type: Boolean,
      default: false,
    },
    showEmptyState: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['loadMoreQuiz', 'onContentSelected', 'closeTeleport', 'teleportSearchInputChange', 'searchTeleportSubmit', 'addQuestion', 'addAllQuestions', 'updateFiltersForMobile', 'toggleFilter'],

  data() {
    return {
      addAllQuestionButtonType: 'secondary',
      shouldShowFiltersMobile: false,
      multiFilters: ['numQuestions', 'subject', 'langs', 'grade'],
      filterKeys: Search.FILTER_KEYS,
      selectedFilters: {
        type: ['quiz', 'presentation'],
      },
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'isTeleportContentPremium', 'isTeleportContentSuper', 'isEditorForPresentationContent']),
    ...mapGetters('root', ['deviceProps']),

    teleportPanelWrapperStyles() {
      return {
        maxHeight: `${this.deviceProps.visibleViewportHeight}px`,
      };
    },

    isForQuizEditor() {
      return this.forPage === this.$constants.TeleportPageTypes.QUIZ_EDITOR;
    },

    hasDisplayContent() {
      return !isEmpty(this.displayContent);
    },
    canShowAddAllQuestionsOption() {
      return this.hasDisplayContent;
    },

    canShowSuperResourceBanner() {
      return !(this.$user.isCorporate || this.$user.paidOrganization) && this.hasDisplayContent && this.isDisplayContentSuper;
    },
    isDisplayContentSuper() {
      return this.isTeleportContentSuper(this.displayContent);
    },
    canAddAllQuestions() {
      return this.isSuperUser || !this.isDisplayContentSuper;
    },
    isSuperUser() {
      return this.$user.isSuper;
    },
    displayContentType() {
      return this.displayContent.type || this.$constants.ContentType.QUIZ;
    },
    isDisplayContentQuizType() {
      return this.displayContentType === this.$constants.ContentType.QUIZ;
    },
    addAllQuestionsTitle() {
      if (this.isBulkAddingTeleportInProgress) {
        return `${this.$i18n('Adding')}...`;
      }

      const contentType = this.isDisplayContentQuizType || this.isForQuizEditor ? this.$i18n('questions') : this.$i18n('slides');
      return `${this.$i18n('Add all')} ${this.questionsList.length} ${contentType}`;
    },

    questionsList() {
      const questions = get(this.displayContent, 'info.questions', []);

      if (questions.length === 0) {
        return [];
      }

      if (this.isForQuizEditor) {
        return getOnlyQuestions(questions);
      }

      return questions;
    },

    requiredSearchFilters() {
      const requiredSearchFilter = {};
      requiredSearchFilter.subjects = getSubjectsList();
      requiredSearchFilter.grades = GRADES;
      requiredSearchFilter.languages = LANGUAGES;
      requiredSearchFilter.numQuestions = Search.QUESTIONS_RANGE_LIST;
      return requiredSearchFilter;
    },
  },

  methods: {
    getUUID() {
      return getUUID();
    },
    loadMoreQuiz() {
      this.$emit('loadMoreQuiz');
    },
    onContentSelected(content, emptyStateType) {
      this.$emit('onContentSelected', content, emptyStateType);
      if (this.$refs.teleportMobileScrollContainer) {
        this.$refs.teleportMobileScrollContainer.scrollTop = 0;
      }
    },

    closeTeleport() {
      this.$emit('closeTeleport');
    },
    onTeleportSearchInputChange(input) {
      this.$emit('teleportSearchInputChange', input);
    },
    onSearchTeleportSubmit() {
      this.$emit('searchTeleportSubmit');
    },
    onAddSingleQuestion(question) {
      this.$emit('addQuestion', question);
    },
    addAllQuestions(el) {
      this.$emit('addAllQuestions', el);
    },
    onOpenFilters() {
      this.shouldShowFiltersMobile = true;
    },
    toggleFilterContainer() {
      this.shouldShowFiltersMobile = false;
    },

    onClearFilters() {
      this.selectedFilters = {
        type: ['quiz', 'presentation'],
      };

      this.onSearch();
    },

    onSearch() {
      this.$emit('updateFiltersForMobile', this.selectedFilters);
    },
    toggleFilterCheckbox(status, filter) {
      if (status) {
        this.selectedFilters = this.addFilter(filter);
      } else {
        this.selectedFilters = this.removeFilter(filter);
      }
    },

    addFilter(filter) {
      const selectedFilters = { ...this.selectedFilters };

      if (this.multiFilters.includes(filter.key)) {
        if (!selectedFilters[filter.key]) {
          selectedFilters[filter.key] = [filter.val];
        } else {
          selectedFilters[filter.key].push(filter.val);
        }
      } else {
        selectedFilters[filter.key] = filter.val;
      }

      return selectedFilters;
    },

    removeFilter(filter) {
      let selectedFilters = { ...this.selectedFilters };

      if (!selectedFilters[filter.key]) {
        return;
      }

      if (this.multiFilters.includes(filter.key)) {
        if (selectedFilters[filter.key].length > 1) {
          remove(selectedFilters[filter.key], (el) => el === filter.val);
        } else {
          selectedFilters = omit(selectedFilters, [filter.key]);
        }
      } else {
        selectedFilters = omit(selectedFilters, [filter.key]);
      }

      return selectedFilters;
    },

    toggleFilter(val = false) {
      this.$emit('toggleFilter', val);
    },
  },
};
</script>

<style scoped lang="scss">
  $topSearchContainer: 56px + 56px;
  $bottomScrollContainer: 128px + 8px;

  .divider {
    width: calc(100% + 24px);
    color: transparent;
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0), 0px 2px 2px rgba(0, 0, 0, 0.08);
  }

  .custom-height {
    height: calc(100% - ($topSearchContainer + $bottomScrollContainer));
  }

  .horizontal-line {
    bottom: 128px;
  }

  .slideInLeft-enter-active, .slideInLeft-leave-active {
    transition: transform 0.5s;
    transform: translate(0%, 0);
  }

  .slideInLeft-enter, .slideInLeft-leave-to{
    transform: translate(-100%, 0);
  }

  .slideInRight-enter-active, .slideInRight-leave-active {
    transition: transform 0.5s;
    transform: translate(0%, 0);
  }

  .slideInRight-enter, .slideInRight-leave-to{
    transform: translate(200%, 0);
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>

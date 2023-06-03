<template>
  <div class="teleport-container">
    <template v-if="!isDesktop">
      <TeleportMobile
        ref="teleportMobile"
        :style="teleportContainerStyles"
        v-bind="propsForChildren"
        v-on="eventsOfChildren"
      />
    </template>
    <template v-else>
      <TeleportDesktop
        ref="teleportDesktop"
        v-bind="propsForChildren"
        v-on="eventsOfChildren"
      />
    </template>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import remove from 'lodash/remove';
import includes from 'lodash/includes';

import ObjectId from 'bson-objectid';
import { mapGetters } from 'vuex';

import Constants from '~/config/Constants';
import { setFocusOnFirstElement, setSearchQueryIdFromUserObject } from '~/utils/Utilities';
import { getUUID } from '~/services/UIDService';
import SearchService from '../services/apis/SearchService';
import searchConfig from '../config/SearchConfig';
import { ensureSlideV2 } from '../utils/SlideV1Utils';
import QLogger from '../services/QLogger';
import LocalStorage from '../services/LocalStorage';

import { isSlideForContent, getOnlyQuestions } from '../utils/QuizUtils';

export default {
  props: {
    forPage: {
      type: String,
      default: Constants.TeleportPageTypes.PRESENTATION_EDITOR,
      validator: (val) => ([Constants.TeleportPageTypes.QUIZ_EDITOR, Constants.TeleportPageTypes.PRESENTATION_EDITOR]).includes(val),
    },

    contentType: {
      type: String,
      default: 'presentation',
    },
    currentTeleportSearchTerm: {
      type: String,
      default: '',
    },

    showTeleport: {
      type: Boolean,
      default: false,
    },

    teleportContainerStyles: {
      type: Object,
      default: () => {},
    },

    lastActiveElement: {
      type: Object,
      default: () => ({}),
    },

    isAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },

    isBulkAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['addQuestion', 'onTeleportSearch', 'addAllQuestions', 'closeTeleport'],

  data() {
    return {
      addAllQuestionsEmptyStateType: '',
      onlyLessons: false,
      questionsRangeList: searchConfig.QUESTIONS_RANGE_LIST,
      teleportSearchTerm: '',
      currentSearchTermDisplay: '',
      isOnlySuper: false,
      isStudentCreated: true,
      isOnlyPersonal: false,
      queryId: '',
      grades: [],
      subjects: [],
      languages: [],
      numQuestions: [],
      quizzesList: [],
      displayContent: {},
      searchSubmitCallInProgress: false,
      teleportSearchPage: 0,
      teleportSearchCallCount: 0,
      loadMoreCallInProgress: false,
      canLoadMoreQuizOnScroll: true,
      filterTags: [],
      teleportSearchCancelTokenSource: null,
      fixedCardStyles: {},
      addAllQuestionButtonType: 'other',
      searchScopeId: 'community',
      showEmptyState: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'serverData']),
    ...mapGetters('contentEditor', ['quizId', 'isTeleportContentPremium', 'isTeleportContentSuper']),
    ...mapGetters('sharedLibrary', ['hasSharedLibraryPriviledges']),

    isForQuizEditor() {
      return this.forPage === this.$constants.TeleportPageTypes.QUIZ_EDITOR;
    },

    canAddAllQuestions() {
      return this.isSuperUser || !this.isDisplayContentSuper;
    },
    isSuperUser() {
      return this.$user.isSuper;
    },
    isDisplayContentSuper() {
      return this.isTeleportContentSuper(this.displayContent);
    },

    eventsOfChildren() {
      return {
        updateFiltersForMobile: this.updateFiltersForMobile,
        updateIsOnlyPersonal: this.updateIsOnlyPersonal,
        updateGradesFilter: this.updateGradesFilter,
        updateSubjectsFilter: this.updateSubjectsFilter,
        updateNumQuestionsFilter: this.updateNumQuestionsFilter,
        updateLanguagesFilter: this.updateLanguagesFilter,
        deleteFilterTag: this.deleteFilterTag,
        toggleFilter: this.toggleFilter,
        toggleOnlyLessonsFilter: this.toggleOnlyLessonsFilter,
        onContentSelected: this.onContentSelected,
        loadMoreQuiz: this.loadMoreQuiz,
        addAllQuestions: this.addAllQuestions,
        teleportSearchInputChange: this.onTeleportSearchInputChange,
        searchTeleportSubmit: this.onSearchTeleportSubmit,
        onTeleportSearch: this.onTeleportSearch,
        closeTeleport: this.closeTeleport,
        addQuestion: this.addQuestion,
        updateSearchScopeFilter: this.updateSearchScopeFilter,
      };
    },

    propsForChildren() {
      return {
        isForQuizEditor: this.isForQuizEditor,
        forPage: this.forPage,
        teleportSearchTerm: this.teleportSearchTerm,
        currentTeleportSearchTerm: this.currentTeleportSearchTerm,
        lastActiveElement: this.lastActiveElement,
        isAddingTeleportInProgress: this.isAddingTeleportInProgress,
        isBulkAddingTeleportInProgress: this.isBulkAddingTeleportInProgress,
        onlyLessons: this.onlyLessons,
        grades: this.grades,
        subjects: this.subjects,
        languages: this.languages,
        numQuestions: this.numQuestions,
        filterTags: this.filterTags,
        isOnlyPersonal: this.isOnlyPersonal,
        quizzesList: this.quizzesList,
        displayContent: this.displayContent,
        searchSubmitCallInProgress: this.searchSubmitCallInProgress,
        loadMoreCallInProgress: this.loadMoreCallInProgress,
        onSearchTeleport: this.onSearchTeleport,
        currentSearchTermDisplay: this.currentSearchTermDisplay,
        showTeleport: this.showTeleport,
        showEmptyState: this.showEmptyState,
      };
    },
  },

  watch: {
    showTeleport(newVal, oldVal) {
      if (newVal) {
        this.onShowTeleport();
      }
    },

    displayContent: {
      deep: true,
      handler(newVal, oldVal) {
        // Set focus to add all questions button when a quiz is selected from the teleport list.
        if (newVal && newVal._id !== oldVal._id) {
          this.$nextTick(() => {
            this.$refs.addAllQuestions && this.$refs.addAllQuestions.$refs.button.focus();
          });
        }
      },
    },
  },

  methods: {
    updateFiltersForMobile(selectedFilters) {
      this.grades = selectedFilters.grade ? selectedFilters.grade : [];
      this.languages = selectedFilters.langs ? selectedFilters.langs : [];
      this.numQuestions = selectedFilters.numQuestions ? selectedFilters.numQuestions : [];
      this.subjects = selectedFilters.subject ? selectedFilters.subject : [];
      this.onSearchTeleportSubmit({ isFilterSearch: true });
    },

    addQuestion(data) {
      this.$emit('addQuestion', data);
    },

    onTeleportSearch(data) {
      this.$emit('onTeleportSearch', data);
    },

    updateIsOnlyPersonal(value) {
      this.isOnlyPersonal = value;
    },

    updateAddAllQuestionsButtonType(type) {
      this.addAllQuestionButtonType = type;
    },

    updateTeleportSearchTerm(value) {
      this.teleportSearchTerm = value;
    },

    getSelectedDropdownItems(list, selectedItems) {
      const selectedItemsFromList = list?.filter((item) => selectedItems.includes(item.val));

      return selectedItemsFromList?.map((item) => item.text).join(',');
    },

    onKeydownEvent(ev) {
      if (ev.key === 'Escape') {
        this.closeTeleport();
      }
    },

    setFocusOnFirstElement() {
      const containerElement = this.$refs['teleport-panel-wrapper'];

      setFocusOnFirstElement(containerElement);
    },

    onContainerClick(ev) {
      if (ev.target !== ev.currentTarget) {
        return;
      }

      this.closeTeleport();
    },

    onShowTeleport() {
      if (this.teleportSearchTerm !== this.currentTeleportSearchTerm) {
        this.updateTeleportSearchTerm(this.currentTeleportSearchTerm);
        this.onSearchTeleport();
      }
    },

    onSearchTeleportSubmit({ isFilterSearch = false } = {}) {
      if (isEmpty(this.teleportSearchTerm)) {
        return;
      }

      const eventName = this.$webEvents.getQuizEditorEvent(this.contentType, this.$webEvents.EDITOR_TELEPORT_SEARCH);
      this.$analytics.logEvent(eventName, {
        term: this.teleportSearchTerm,
        quizId: this.quizId,
        previous_source: 'search_button_inside',
      });

      this.onSearchTeleport({ isFilterSearch });
    },

    setFixedCardStyles() {
      const rightPanelContainerRef = this.$refs.rightPanelContainer;

      if (isEmpty(rightPanelContainerRef)) {
        return;
      }

      const width = `${rightPanelContainerRef.getBoundingClientRect().width - 32}px`;

      this.fixedCardStyles = { width };
    },

    isPremiumContent(content) {
      return this.isTeleportContentPremium(content);
    },

    addAllQuestions(el) {
      if (!this.canAddAllQuestions) {
        this.$eventBus.$emit('superUpsell:show', { type: this.$constants.SuperUpsellTypes.BULK_ADD_TELEPORT, options: { feat: 'premiumContent-bulkAddTeleport' } });
        return;
      }

      const eventName = this.$webEvents.getQuizEditorEvent(this.contentType, this.$webEvents.EDITOR_TELEPORT_ADD_ALL);
      this.$analytics.logEvent(eventName, {
        teleportedQuizId: this.displayContent._id,
        quizId: this.quizId,
      });

      let questions = this.displayContent?.info?.questions;

      if (this.isForQuizEditor) {
        questions = getOnlyQuestions(questions);
      }

      const cookedQuestions = questions.map((question) => this.addTeleportFlagsForQuestions(question));
      this.$emit('addAllQuestions', { questions: cookedQuestions, addButtonRef: el.target });
    },

    addTeleportFlagsForQuestions(question) {
    /**
     * The new Question data needs to get data about the parent quiz and question for super validation
    */
      const questionCopy = { ...question };

      questionCopy.isSuperParent = this.isPremiumContent(this.displayContent);
      questionCopy.parent = question._id;
      questionCopy.cloneFrom = question._id;
      questionCopy.teleportFrom = this.displayContent._id;
      questionCopy._id = ObjectId().toHexString();
      ensureSlideV2(questionCopy);

      return questionCopy;
    },

    loadMoreQuiz() {
      if (this.loadMoreCallInProgress || !this.canLoadMoreQuizOnScroll) { return; }

      this.loadMoreCallInProgress = true;

      this.teleportSearchPage += 1;

      this.callSearchTeleportApi({ isNewSearch: false, shouldSetQueryId: false });
    },

    onSearchTeleport({ isFilterSearch = false } = {}) {
      if (this.searchScopeId === 'myDistrict') {
        if (!this.hasSharedLibraryPriviledges) {
          this.$eventBus.$emit('sndUpsell:open', {
            feat: this.$constants.FeatureTypes.DISTRICT_LIBRARY,
            webEvent: this.$webEvents.UPSELL_CONTENTS_END_CTA,
          });

          return;
        }
      }

      this.searchSubmitCallInProgress = true;
      this.teleportSearchPage = 0;
      this.showEmptyState = false;

      this.callSearchTeleportApi({ isNewSearch: true, isFilterSearch });
    },

    onContentSelected(content, emptyStateType) {
      this.displayContent = content;
      this.addAllQuestionsEmptyStateType = emptyStateType;
    },

    updateLanguagesFilter(updatedItem) {
      this.languages = this.getUpdatedFiltersList(this.languages, updatedItem);
      this.updateFilterTags('languages', updatedItem);
      this.onSearchTeleport({ isFilterSearch: true });
    },

    updateSubjectsFilter(updatedItem) {
      this.subjects = this.getUpdatedFiltersList(this.subjects, updatedItem);
      this.updateFilterTags('subjects', updatedItem);
      this.onSearchTeleport({ isFilterSearch: true });
    },

    toggleOnlyLessonsFilter() {
      this.onlyLessons = !this.onlyLessons;

      this.onSearchTeleport({ isFilterSearch: true });
    },

    updateGradesFilter(updatedItem) {
      this.grades = this.getUpdatedFiltersList(this.grades, updatedItem);
      this.updateFilterTags('grades', updatedItem);
      this.onSearchTeleport({ isFilterSearch: true });
    },

    updateNumQuestionsFilter(updatedItem) {
      this.numQuestions = this.getUpdatedFiltersList(this.numQuestions, updatedItem);
      this.updateFilterTags('numQuestions', updatedItem);
      this.onSearchTeleport({ isFilterSearch: true });
    },

    getUpdatedFiltersList(selectedFilters, item) {
      if (item === 'clearAll') {
        return [];
      }

      const selectedFiltersCopy = [...selectedFilters];

      if (selectedFiltersCopy.includes(item.val)) {
        remove(selectedFiltersCopy, (el) => el === item.val);
      } else {
        selectedFiltersCopy.push(item.val);
      }

      return selectedFiltersCopy;
    },

    updateFilterTags(type, updatedItem) {
      // Remove all tags of particular type
      if (isEmpty(updatedItem)) {
        this.removeAllTagsOfType(type);
      } else if (this.doesFilterTagExist(updatedItem)) {
        // Remove updated item from tags
        this.removeTagFromList(updatedItem);
      } else {
        // Add updatedItem to tags
        this.filterTags.push({ ...updatedItem, type });
      }
    },

    deleteFilterTag(tag) {
      switch (tag.type) {
        case 'languages':
          this.updateLanguagesFilter(tag);
          break;

        case 'grades':
          this.updateGradesFilter(tag);
          break;

        case 'subjects':
          this.updateSubjectsFilter(tag);
          break;

        case 'numQuestions':
          this.updateNumQuestionsFilter(tag);
          break;

        default:
      }
    },

    removeAllTagsOfType(type) {
      const copy = [...this.filterTags];
      remove(copy, (el) => el.type === type);
      this.filterTags = copy;
    },

    removeTagFromList(item) {
      const copy = [...this.filterTags];
      remove(copy, (el) => el.val === item.val);
      this.filterTags = copy;
    },

    doesFilterTagExist(item) {
      return includes(this.filterTags.map((item) => item.val), item.val);
    },

    isSlideForContent(question) {
      return isSlideForContent(question);
    },

    async callSearchTeleportApi({ isNewSearch = false, shouldSetQueryId = true, isFilterSearch = false } = {}) {
      /**
       * Handle aborting teleport calls if a fresh one is initiated.
       */

      if (isNewSearch) {
        this.displayContent = {};
      }

      try {
        const metaData = LocalStorage.getItem('QuizizzAnalytics') || {};
        if (!this.teleportSearchTerm) {
          return;
        }

        if (this.teleportSearchCancelTokenSource) {
          this.teleportSearchCancelTokenSource.cancel();
          // TODO #migration fix cancel token
          this.teleportSearchCancelTokenSource = this.$axios?.CancelToken?.source();
        } else {
          this.teleportSearchCancelTokenSource = this.$axios?.CancelToken?.source();
        }

        if (shouldSetQueryId) {
          this.queryId = setSearchQueryIdFromUserObject(this.$user);
        }

        let type = ['quiz', 'presentation'];

        if (this.onlyLessons) {
          type = ['presentation'];
        }

        const params = {
          cloned: this.isOnlyPersonal,
          term: this.teleportSearchTerm,
          personal: this.isOnlyPersonal,
          sessionId: metaData.sessionId,
          queryId: this.queryId,
          source: isFilterSearch ? 'Teleport:FilterComp' : 'Teleport',
          page: 'EditorPage',
          grades: this.grades,
          subjects: this.subjects,
          numQuestions: this.$stringUtils.getNumQuestionsValue(this.numQuestions),
          langs: this.languages,
          type,
          createdBy: this.$user.id,
          scopeFilterType: this.searchScopeId,
          organizations: this.$user.organizationIds || [],
        };

        this.currentSearchTermDisplay = this.teleportSearchTerm;
        this.$emit('onTeleportSearch', this.currentSearchTermDisplay);

        const results = await SearchService.getTeleportQuizzes(this.teleportSearchPage, params, this.teleportSearchCancelTokenSource);
        if (isEmpty(results)) {
          return;
        }

        if (this.teleportSearchPage === 0) { this.quizzesList = []; }

        let resultingList = !isEmpty(results) ? results.hits : [];

        if (this.isForQuizEditor) {
          resultingList = this.getContentWithOnlyQuestions(resultingList);
        }

        this.quizzesList = [...this.quizzesList, ...resultingList];

        if (isEmpty(this.quizzesList)) {
          this.displayContent = {};
          this.showEmptyState = true;
        }

        this.searchSubmitCallInProgress = false;

        if (this.loadMoreCallInProgress && results.hits.length === 0) {
          this.canLoadMoreQuizOnScroll = false;
        } else {
          this.canLoadMoreQuizOnScroll = true;
        }
        this.loadMoreCallInProgress = false;
      } catch (err) {
        QLogger.error('Error at Teleport.callSearchTeleportApi');
      }
    },

    getContentWithOnlyQuestions(list) {
      return list.filter((content) => {
        const index = content.info.questions.findIndex((q) => !isSlideForContent(q));

        return index > -1;
      });
    },

    getUUID() {
      return getUUID();
    },

    toggleFilter(toggleFlag) {
      this.isOnlyPersonal = toggleFlag;

      if (toggleFlag) {
        this.searchScopeId = 'myLibrary';
      } else {
        this.searchScopeId = 'community';
      }

      this.onSearchTeleport();
    },

    onTeleportSearchInputChange(value) {
      this.teleportSearchTerm = value;
    },

    closeTeleport() {
      this.$emit('closeTeleport');
    },

    onAddSingleQuestion(question) {
      this.$emit('addQuestion', question);
    },

    updateSearchScopeFilter(updatedItem) {
      this.searchScopeId = updatedItem;

      if (this.searchScopeId === 'myLibrary') {
        this.isOnlyPersonal = true;
      } else {
        this.isOnlyPersonal = false;
      }
      this.onSearchTeleport();
    },
  },
};
</script>

<style lang="scss" scoped>
.right-panel-container {
  width: calc(100% - 384px);
}

.teleport-panel-wrapper {
  right: 0%;
}

.teleport-panel {
  width: 80%;

  &.quiz-editor {
    width: 66%;
  }
  min-width: 800px;
  max-width: 1440px;
  position: absolute;
}

.teleport-questions-list-container {
  height: 100%;

  &.add-all-option {
    height: calc(100% - 64px);
  }

  &.super-banner {

    &.super-user {
       height: calc(100% - 134px);
    }

    height: calc(100% - 168px);
  }
}

.bottom-section {
  height: calc(100% - 118px);
}

.empty-state-title {
  max-width: 322px;
}

.teleport-filters {
  max-width: 768px;
}

.subjects-dropdown {
  height: 404px;
}

.teleport-search-input {
  max-width: 413px;
  min-width: 413px;
}

// For Slide Transition
$transitionTiming: 0.3s;
.slide-enter.teleport-panel-wrapper, .slide-leave-active.teleport-panel-wrapper {
  background-color: rgba(0, 0, 0, 0);
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1) background-color;
}

.slide-enter-active.teleport-panel-wrapper, .slide-leave-active.teleport-panel {
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1) background-color;
}

.slide-enter-active .teleport-panel {
  animation:modalSlideInLeft;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

.slide-leave-active .teleport-panel {
  animation: modalSlideOutRight;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

// For Fade Transition
.fade-enter.teleport-panel-wrapper, .fade-leave-active.teleport-panel-wrapper {
  background-color: rgba(0, 0, 0, 0);
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1) background-color;
}

.fade-enter-active.teleport-panel-wrapper, .fade-leave-active.teleport-panel {
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1) background-color;
}

.fade-enter-active .teleport-panel {
  animation: modalFadeIn;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

.fade-leave-active .teleport-panel {
  animation: modalFadeOut;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

@keyframes modalSlideInLeft {
  from {
    opacity: 0.3;
    transform: translate3d(100%, 0, 0);
    visibility: visible;
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes modalSlideOutRight {
  from {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  to {
    opacity: 0.2;
    visibility: hidden;
    transform: translate3d(150%, 0, 0);
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

</style>

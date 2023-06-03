<template>
  <transition
    name="teleport-slide"
    appear
  >
    <div
      v-if="showTeleport"
      ref="teleport-panel-wrapper"
      class="fixed w-screen h-screen teleport-panel-wrapper"
      :class="[allowPointerEvents ? 'pointer-events-none bg-transparent' : 'bg-dark-50%']"
      @click="onContainerClick"
    >
      <div
        :class="['flex flex-col teleport-panel right-0 h-full pointer-events-auto bg-light-3', forPage]"
      >
        <!-- Close button -->
        <button
          class="close-btn absolute w-8 h-8 flex justify-center items-center top-3 -left-8 p-2.5 bg-light-3 hover:bg-light-2 active:bg-light-1 text-dark rounded-l"
          :aria-label="$i18n('Close')"
          @click="closeTeleport"
        >
          <FA
            icon="far fa-times"
            :size="12"
          />
        </button>

        <div
          translate="no"
          class="p-4 border-b top-section border-dark-6"
        >
          <div class="flex justify-between">
            <div class="relative flex mb-2">
              <form
                class="teleport-search-input"
                @submit.prevent="onSearchTeleportSubmit"
              >
                <Input
                  :value="teleportSearchTerm"
                  :placeholder="$i18n('Search from millions of questions')"
                  :button="searchButton"
                  disableButtonWidth
                  @input="onTeleportSearchInputChange"
                  @buttonClicked="onSearchTeleportSubmit"
                />
              </form>

              <div
                v-if="teleportSearchTerm"
                class="flex items-center ml-3"
              >
                <Checkbox
                  :inputId="getUUID()"
                  :label="$user.isCorporate ? $i18n('Only presentations') : $i18n('Only lessons')"
                  :value="onlyLessons.toString()"
                  name="checkboxes"
                  size="md"
                  :checked="onlyLessons"
                  checkBgColor="lilac"
                  @input="toggleOnlyLessonsFilter"
                />
              </div>
            </div>
          </div>

          <div
            v-if="canShowTeleportFilters"
            class="flex items-center teleport-filters"
          >
            <span class="mr-2 text-sm font-semibold text-dark-3"><i18n>Filter by:</i18n></span>
            <div class="flex flex-auto">
              <Dropdown
                v-if="!isCorporateUser"
                class="flex-1 mr-2"
                size="sm"
                :title="$i18n('Grades')"
                listWidth="w-50"
                ariaLabel="Grades"
                :selectedItem="grades.length ? getSelectedDropdownItems(gradesList, grades) : ''"
              >
                <MultipleSelectDropdown
                  :list="gradesList"
                  :selectedValues="grades"
                  :listWidth="200"
                  @update="updateGradesFilter"
                />
              </Dropdown>

              <Dropdown
                class="flex-1 mr-2"
                size="sm"
                :title="$i18n('Subjects')"
                listWidth="w-50"
                ariaLabel="Subjects"
                :selectedItem="subjects.length ? getSelectedDropdownItems(subjectsList, subjects) : ''"
              >
                <MultipleSelectDropdown
                  :list="subjectsList"
                  :selectedValues="subjects"
                  :listWidth="200"
                  @update="updateSubjectsFilter"
                />
              </Dropdown>

              <Dropdown
                class="flex-1 mr-2"
                size="sm"
                ariaLabel="Number of Questions Ranges"
                :title="$i18n('Number of questions')"
                :selectedItem="numQuestions.length ? getSelectedDropdownItems(questionsRangeList, numQuestions) : ''"
              >
                <MultipleSelectDropdown
                  :list="questionsRangeList"
                  :selectedValues="numQuestions"
                  @update="updateNumQuestionsFilter"
                />
              </Dropdown>

              <Dropdown
                class="flex-1 mr-2"
                size="sm"
                :title="$i18n('Languages')"
                listWidth="w-60"
                ariaLabel="Languages"
                :selectedItem="languages.length ? getSelectedDropdownItems(languagesList, languages) : ''"
              >
                <MultipleSelectDropdown
                  class="h-80"
                  hasSearch
                  :list="languagesList"
                  :selectedValues="languages"
                  :listWidth="240"
                  @update="updateLanguagesFilter"
                />
              </Dropdown>
            </div>
          </div>
        </div>

        <div class="flex w-full bottom-section">
          <div class="relative flex flex-col p-4 w-96 shrink-0">
            <div
              translate="no"
              class="mb-3 text-xs text-dark-4"
            >
              <i18n>Showing results for</i18n>
              <span class="font-semibold">“{{ currentSearchTermDisplay }}”</span>
            </div>

            <div
              translate="no"
              class="filters"
            >
              <Tag
                v-for="(tag, index) in filterTags"
                :key="index"
                class="mb-2 mr-2"
                size="xs"
                :title="tag.text"
                @delete="deleteFilterTag(tag)"
              />
            </div>

            <div
              v-if="teleportSearchTerm"
              translate="no"
              class="flex flex-col p-4 mb-3 space-y-2 border boder-solid border-light-1 rounded-2xl"
            >
              <div class="flex w-full text-sm font-semibold text-dark-4">
                <i18n>Show content from:</i18n>
              </div>
              <div class="flex flex-row w-full">
                <Radio
                  v-for="option in searchScopeOptions"
                  :key="option.id"
                  class="flex flex-row w-full space-x-2 text-sm font-semibold text-dark-3"
                  :licon="(!hasSharedLibraryPriviledges && (option.id === 'myDistrict')) ? 'fas fa-lock' : null"
                  :inputId="option.id"
                  :label="option.label"
                  :name="option.id"
                  :checked="selectedSearchScopeId === option.id"
                  @change="handleChangeSearchScope"
                />
              </div>
            </div>

            <div
              v-if="canShowMainLoader"
              class="absolute z-10 w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            >
              <Loader :size="48" />
            </div>

            <TeleportSearchList
              :isLoadingState="searchSubmitCallInProgress"
              :showLoader="loadMoreCallInProgress"
              :selectedCard="displayContent"
              :list="quizzesList"
              :searchSubmitCallInProgress="searchSubmitCallInProgress"
              @loadMoreQuiz="loadMoreQuiz"
              @onContentSelected="onContentSelected"
            />

            <div
              v-if="showEmptyState"
              class="flex flex-col items-center px-4 py-8 rounded-lg bg-light-2"
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
          </div>

          <div
            ref="rightPanelContainer"
            class="p-4 right-panel-container bg-light-1"
          >
            <div
              v-if="!hasDisplayContent && !showEmptyState && !searchSubmitCallInProgress"
              class="ml-auto mr-auto text-4xl font-semibold text-center text-dark-5 mt-18 empty-state-title"
            >
              <i18n>Select a quiz to see its preview here.</i18n>
            </div>

            <div class="pb-4">
              <SuperResourceBanner
                v-if="canShowSuperResourceBanner"
                :style="fixedCardStyles"
                class="mb-3"
                feat="premiumContent:teleport"
                variant="teleport"
              />

              <div
                v-if="canShowAddAllQuestionsOption"
                :style="fixedCardStyles"
                class="z-10 flex justify-between p-2 border rounded shadow-sm bg-light-3 add-all-options-container border-dark-6"
                @mouseenter="updateAddAllQuestionsButtonType('primary')"
                @mouseleave="updateAddAllQuestionsButtonType('other')"
              >
                <div class="flex">
                  <div class="flex items-center justify-center w-8 h-8 mr-2 overflow-hidden rounded bg-light-1 shrink-0">
                    <img
                      v-if="!!displayContent.info.image"
                      :src="getImageURL(displayContent.info.image)"
                    >
                    <QuizImageEmptyState
                      v-else
                      :type="addAllQuestionsEmptyStateType"
                    />
                  </div>

                  <div class="flex flex-col justify-center">
                    <div
                      translate="no"
                      class="text-xs text-dark-2"
                    >
                      {{ displayContent.info.name }}
                    </div>
                    <div class="text-dark-3 text-tn">
                      {{ questionsList.length }}&nbsp;{{ isDisplayContentQuizType || isForQuizEditor ? $i18n('questions') : $i18n('slides') }}
                    </div>
                  </div>
                </div>

                <Button
                  ref="addAllQuestions"
                  translate="no"
                  :title="addAllQuestionsTitle"
                  size="sm"
                  :type="canAddAllQuestions ? addAllQuestionButtonType : 'super-secondary'"
                  licon="far fa-plus-circle"
                  :disabled="isAddingTeleportInProgress"
                  @click="addAllQuestions"
                />
              </div>
            </div>

            <div
              v-if="hasDisplayContent"
              :class="['overfloy-y-scroll teleport-questions-list-container', canShowAddAllQuestionsOption ? 'add-all-option' : '', canShowSuperResourceBanner ? 'super-banner' : '', isSuperUser ? 'super-user' : '']"
            >
              <TeleportQuestionsList
                :isAddingTeleportInProgress="isAddingTeleportInProgress"
                :isLoadingState="searchSubmitCallInProgress"
                :content="displayContent"
                :questionsList="questionsList"
                @addQuestion="onAddSingleQuestion"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';

import { getUUID } from '~/services/UIDService';
import getSubjectsList from '~/config/Subjects';
import GRADES from '~/config/Grades';
import searchConfig from '~/config/SearchConfig';
import LANGUAGES from '~/config/Languages';
import Constants from '~/config/Constants';

import { setFocusOnFirstElement } from '~/utils/Utilities';
import { getOnlyQuestions } from '~/utils/QuizUtils';

export default {
  props: {
    forPage: {
      type: String,
      default: Constants.TeleportPageTypes.PRESENTATION_EDITOR,
      validator: (val) => ([Constants.TeleportPageTypes.QUIZ_EDITOR, Constants.TeleportPageTypes.PRESENTATION_EDITOR]).includes(val),
    },

    showTeleport: {
      type: Boolean,
      default: false,
    },

    currentTeleportSearchTerm: {
      type: String,
      default: '',
    },

    onSearchTeleport: {
      type: Function,
      default: () => true,
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

    allowPointerEvents: {
      type: Boolean,
      default: false,
    },

    teleportSearchTerm: {
      type: String,
      default: '',
    },

    currentSearchTermDisplay: {
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
    showEmptyState: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['updateIsOnlyPersonal', 'searchTeleportSubmit', 'loadMoreQuiz', 'addAllQuestions', 'onContentSelected', 'updateLanguagesFilter', 'updateSubjectsFilter', 'toggleOnlyLessonsFilter', 'updateGradesFilter', 'updateNumQuestionsFilter', 'deleteFilterTag', 'teleportSearchInputChange', 'closeTeleport', 'addQuestion', 'updateSearchScopeFilter'],

  data() {
    return {
      addAllQuestionsEmptyStateType: '',
      subjectsList: getSubjectsList(),
      gradesList: GRADES,
      questionsRangeList: searchConfig.QUESTIONS_RANGE_LIST,
      languagesList: LANGUAGES,
      isOnlySuper: false,
      isStudentCreated: true,
      queryId: '',
      teleportSearchPage: 0,
      teleportSearchCallCount: 0,
      canLoadMoreQuizOnScroll: true,
      teleportSearchCancelTokenSource: null,
      fixedCardStyles: {},
      addAllQuestionButtonType: 'other',
      selectedSearchScopeId: 'community',
      searchScopeOptions: [
        {
          id: 'community',
          label: this.$i18n('Community'),
        },
        {
          id: 'myDistrict',
          label: this.$i18n('My district'),
        },
        {
          id: 'myLibrary',
          label: this.$i18n('My library'),
        },
      ],
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'serverData']),
    ...mapGetters('contentEditor', ['quizId', 'isTeleportContentPremium', 'isTeleportContentSuper']),
    ...mapGetters('sharedLibrary', ['enableSharedLibrary', 'hasSharedLibraryPriviledges']),

    isSuperUser() {
      return this.$user.isSuper;
    },
    isForQuizEditor() {
      return this.forPage === this.$constants.TeleportPageTypes.QUIZ_EDITOR;
    },

    canAddAllQuestions() {
      return this.isSuperUser || !this.isDisplayContentSuper;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    displayContentType() {
      return this.displayContent.type || this.$constants.ContentType.QUIZ;
    },

    isDisplayContentQuizType() {
      return this.displayContentType === this.$constants.ContentType.QUIZ;
    },

    canShowMainLoader() {
      return this.searchSubmitCallInProgress && this.quizzesList.length === 0;
    },
    addAllQuestionsTitle() {
      if (this.isBulkAddingTeleportInProgress) {
        return `${this.$i18n('Adding')}...`;
      }

      const contentType = this.isDisplayContentQuizType || this.isForQuizEditor ? this.$i18n('questions') : this.$i18n('slides');
      return `${this.$i18n('Add all')} ${this.questionsList.length} ${contentType}`;
    },

    questionsList() {
      if (this.isForQuizEditor) {
        return getOnlyQuestions(this.displayContent.info.questions);
      }

      return this.displayContent.info.questions;
    },

    searchButton() {
      return {
        title: this.$i18n('Search'),
        type: 'secondary',
        size: 'md',
        disabled: !this.teleportSearchTerm,
      };
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

    canShowTeleportFilters() {
      return !this.isOnlyPersonal && this.teleportSearchTerm;
    },
  },

  watch: {
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

    deviceProps(newVal, oldVal) {
      if (newVal.height !== oldVal.height || newVal.width !== oldVal.width) {
        this.setFixedCardStyles();
      }
    },
  },

  deactivated() {
    if (this.lastActiveElement && isFunction(this.lastActiveElement.focus)) {
      this.$nextTick(() => {
        this.lastActiveElement.focus();
      });
    }
  },

  created() {
    this.setFilterList();
  },

  mounted() {
    this.$nextTick(() => {
      this.setFixedCardStyles();
    });

    const containerElement = this.$refs['teleport-panel-wrapper'];

    if (isEmpty(containerElement)) {
      return;
    }

    containerElement.addEventListener('keydown', this.onKeydownEvent);

    if (this.isCorporateUser) {
      this.$emit('updateIsOnlyPersonal', true);
      // this.isOnlyPersonal = true;
    }
  },

  beforeUnmount() {
    const containerElement = this.$refs['teleport-panel-wrapper'];

    if (isEmpty(containerElement)) {
      return;
    }

    containerElement.addEventListener('keydown', this.onKeydownEvent);
  },

  methods: {
    getImageURL(url) {
      return `${url}?w=90&h=90`;
    },

    setFilterList() {
      if (this.enableSharedLibrary) {
        return;
      }

      this.searchScopeOptions = [
        {
          id: 'community',
          label: this.$i18n('Community'),
        },
        {
          id: 'myLibrary',
          label: this.$i18n('My library'),
        },
      ];
    },

    updateAddAllQuestionsButtonType(type) {
      this.addAllQuestionButtonType = type;
    },

    getSelectedDropdownItems(list, selectedItems) {
      const selectedItemsFromList = list.filter((item) => selectedItems.includes(item.val));

      return selectedItemsFromList.map((item) => item.text).join(',');
    },

    onKeydownEvent(ev) {
      if (ev.key === 'Escape') {
        this.closeTeleport();
      }
    },

    onContainerClick(ev) {
      if (ev.target !== ev.currentTarget) {
        return;
      }

      this.closeTeleport();
    },

    onSearchTeleportSubmit() {
      this.$emit('searchTeleportSubmit');
    },

    loadMoreQuiz() {
      this.$emit('loadMoreQuiz');
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
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'Q:TeleAddAll');
      this.$emit('addAllQuestions', el);
    },

    onContentSelected(content, emptyStateType) {
      this.$emit('onContentSelected', content, emptyStateType);
    },

    setFocusOnFirstElement() {
      const containerElement = this.$refs['teleport-panel-wrapper'];
      setFocusOnFirstElement(containerElement);
    },

    updateLanguagesFilter(updatedItem) {
      this.$emit('updateLanguagesFilter', updatedItem);
    },

    updateSubjectsFilter(updatedItem) {
      this.$emit('updateSubjectsFilter', updatedItem);
    },

    toggleOnlyLessonsFilter() {
      this.$emit('toggleOnlyLessonsFilter');
    },

    updateGradesFilter(updatedItem) {
      this.$emit('updateGradesFilter', updatedItem);
    },

    updateNumQuestionsFilter(updatedItem) {
      this.$emit('updateNumQuestionsFilter', updatedItem);
    },

    deleteFilterTag(tag) {
      this.$emit('deleteFilterTag', tag);
    },

    getUUID() {
      return getUUID();
    },

    onTeleportSearchInputChange(value) {
      this.$emit('teleportSearchInputChange', value);
    },

    closeTeleport() {
      this.$emit('closeTeleport');
    },

    onAddSingleQuestion(question) {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'Q:TeleAddOne');
      this.$emit('addQuestion', question);
    },

    handleChangeSearchScope(event) {
      const selectedFilter = event.target.name;

      if (selectedFilter === 'myDistrict' && !this.hasSharedLibraryPriviledges) {
        event.target.checked = false;
        const UpsellHeading = 'Unlock Your District';

        this.$eventBus.$emit('sndUpsell:open', {
          feat: 'search_filter_shared_library',
          heading: UpsellHeading,
          webEvent: this.$webEvents.UPSELL_SEARCH_TELEPORT,
        });

        this.$analytics.logEvent(this.$webEvents.UPSELL_SEARCH_TELEPORT);
        return;
      }

      this.selectedSearchScopeId = selectedFilter;
      this.$emit('updateSearchScopeFilter', this.selectedSearchScopeId);
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
.teleport-slide-enter.teleport-panel-wrapper, .teleport-slide-leave-active.teleport-panel-wrapper {
  background-color: rgba(0, 0, 0, 0);
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1) background-color;
}

.teleport-slide-enter-active.teleport-panel-wrapper, .teleport-slide-leave-active.teleport-panel {
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1) background-color;
}

.teleport-slide-enter-active .teleport-panel {
  animation:modalSlideInLeft;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

.teleport-slide-leave-active .teleport-panel {
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

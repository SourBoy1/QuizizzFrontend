import ObjectId from 'bson-objectid';

import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import find from 'lodash/find';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import compact from 'lodash/compact';

import EventBus from '~/services/EventBus';
import { isSlideForQuestion } from '~/utils/SlideUtils';

import { asyncDelay } from '~/services/PausableTimers';

import UserService from '~/services/UserService';
import Constants from '~/config/Constants';
import Languages from '~/config/Languages';
import MutationTypes from '~/config/MutationTypes';
import Quiz from '~/models/Quiz';
import QuizService from '~/services/apis/QuizService';
import QLogger from '~/services/QLogger';
import ToastService from '~/services/ToastService';
import i18n from '~/services/i18n';
import { getters as mainGetters } from '.';
import QuizVersion from '../models/QuizVersion';
import Question from '../models/Question';
import UrlUtils from '../utils/UrlUtils';
import { getNetworkErrorType } from '../utils/Utilities';
import {
  getQuestionDefaultMarks, isQuestionForPoll, getNewSlideFromExplanation, addNewAnswerExplanationSlide, doesQuestionHaveAnswerExplanations, isSlideForContent, getSingleSlideValidationErrors, isQuizTypeContent, isQuizVersionGradeValid, isQuizVersionLanguageValid,
} from '../utils/QuizUtils';

export const state = () => ({
  quiz: Quiz(),
  curriculum: null,
  selectedSlide: '',
  dirtySlides: [],
  lock: false,
  autoSaveInProgress: false,
  staleDraftWarning: false,
  editorForContentType: Constants.ContentType.QUIZ,
  history: [],
  historyCursor: -1,
  shouldShowCurriculumSelection: true,
  previousStandards: [],
  previousFilter: {},
  imageDropUploading: false,
  reorderSlides: {},
  loadingTracker: {
    all_time: false,
    all_marks: false,
  },
  quizPreferences: {
    name: '',
    // Preferred Subjects list
    subjects: [],
    // Selected Grades list
    grade: [],
    language: '',
    // Don't set visibility in corporate
    visibility: !mainGetters.user.isCorporate,
    // Selected subject in dropdown
    selectedSubject: '',
    image: '',
  },
  copyOfQuizPreferences: {
    selectedSubject: '',
    grade: [],
    language: '',
  },
  isQuizNameChangedUsingHeaderInput: false,
  quizWithoutDrafts: false,
  questionEditorDimensions: {},
  isAnswerExplanationsInView: false,
  parsedQuestionQuery: {},
  tiptapEditor: {
    isEmpty: true,
    isFocused: false,
  },
  canVideoBeRendered: true,
  shouldHideMediaContainer: true,
  shouldHideTextContainer: false,
  tiptapRefs: [],
  lastFocusedTipTap: null,
  validationErrors: {
    pending: false,
    active: {},
    deleted: {},
  },
  globalClipboardManager: {
    loading: false,
    url: '',
  },
  subjectForGeneratedOptions: null,
  aiGenerated: {
    isAIGenerated: false,
    isAIGeneratedFromExtraction: false,
    documentScannedByAIPercent: 0,
    aiGenerationType: null,
  },
  quizGenFilters: {
    topic: '',
    grade: '',
    subject: '',
    difficulty: 'easy',
    numberOfQuestions: 5,
    language: '',
  },
  quizGenFiltersCopy: {
    topic: '',
    grade: '',
    subject: '',
    difficulty: 'easy',
    numberOfQuestions: 5,
    language: '',
  },
  quizGenQuestions: [],
  indexToAddQuizGenQuestions: 0,
});

export const getters = {
  quiz(state) {
    return state.quiz;
  },

  quizType(state) {
    return state.quiz.type;
  },

  quizId(state) {
    return state.quiz._id;
  },

  isCloned(state) {
    return state.quiz.cloned;
  },

  quizPreferences(state) {
    return state.quizPreferences;
  },

  copyOfQuizPreferences(state) {
    return state.copyOfQuizPreferences;
  },

  isQuizNameChangedUsingHeaderInput(state) {
    return state.isQuizNameChangedUsingHeaderInput;
  },

  slidesToReorder(state) {
    return state.reorderSlides;
  },

  questionEditorDimensions(state) {
    return state.questionEditorDimensions;
  },

  showCurriculumSelection(state) {
    return state.shouldShowCurriculumSelection;
  },

  versionId(state) {
    if (state.quiz.hasDraftVersion) {
      return state.quiz.draftVersion;
    }

    return state.quiz.publishedVersion;
  },

  publishedVersionDate(state) {
    return state.quiz.createdAt;
  },

  isDefaultTimeChangeLoading(state) {
    return state.loadingTracker.all_time;
  },

  isDefaultPointsChangeLoading(state) {
    return state.loadingTracker.all_marks;
  },

  chosenStandards(state) {
    return state.previousStandards;
  },

  savedStandards(state) {
    return state.quiz.draft.stateStandards;
  },

  standardIdsForQuestionIds(state) {
    const questionIdMap = {};
    state.quiz.draft.questions.forEach((question) => {
      if (!questionIdMap[question._id]) {
        questionIdMap[question._id] = [];
      }

      question.standardIds.forEach((standard) => {
        questionIdMap[question._id].push(standard);
      });
    });

    return questionIdMap;
  },

  chosenStandardsFilter(state) {
    return state.previousFilter;
  },

  draftId(state) {
    return state.quiz.draft._id;
  },

  draft(state) {
    return state.quiz.draft;
  },

  standards(state) {
    return state.quiz.draft.standardData;
  },

  questionDraftKey: getQuestionDraftKey,
  questions(state, getters) {
    return state.quiz.draft[getters.questionDraftKey];
  },
  sortedQuestions(state, getters) {
    const questions = filter(getters.questions, (item) => item.index >= 0);

    return sortBy(questions, (item) => item.index);
  },

  hasQuestions(state, getters) {
    return !!state.quiz.draft[getters.questionDraftKey].filter((question) => !question.deleted).length;
  },

  totalQuestions(state, getters) {
    return state.quiz.draft[getters.questionDraftKey].filter((question) => !question.deleted).length;
  },

  getQuestionByIndex: (state, getters) => (index) => state.quiz.draft[getters.questionDraftKey].find((question) => question.index === index),
  getQuestionIndexById: (state, getters) => (id) => {
    const question = state.quiz.draft[getters.questionDraftKey].find((question) => question._id === id);

    return question ? question.index : -1;
  },
  getQuestionById: (state, getters) => (id) => state.quiz.draft[getters.questionDraftKey].find((question) => question._id === id),
  // TODO(vimal): rename this to selectedSlideId
  selectedSlide(state) {
    return state.selectedSlide;
  },

  selectedSlideData(state, getters) {
    const data = getters.getQuestionById(getters.selectedSlide);

    return data ?? {};
  },

  isSelectedSlideForQuestion(state, getters) {
    const { selectedSlideData } = getters;

    return !!selectedSlideData && isSlideForQuestion(selectedSlideData);
  },

  isSelectedSlideForContent(state, getters) {
    const { selectedSlideData } = getters;

    return !!selectedSlideData && isSlideForContent(selectedSlideData);
  },

  /**
   * Returns all the slides which have valiidation errors.
   * Divides them into 2 categories
   *  1. `active` - for all the active slides that are visible.
   *  2. `deleted` - errors for all slides that are marked deleted
   */
  draftValidationErrors(state) {
    return state.validationErrors;
  },

  getVisibility: (state) => () => state?.quiz?.draft?.visibility ?? true,

  getGradeRange: (state) => () => state?.quiz?.draft?.grade || [],

  getLanguage: (state) => () => state?.quiz?.draft?.lang || '',

  getSubjects: (state) => () => state?.quiz?.draft?.subjects || [],

  getImage: (state) => () => state?.quiz?.draft?.image || '',

  getSlideValidationErrors: (state) => (slide) => {
    if (!slide) {
      return [];
    }

    const slideId = slide._id || slide.id || '';
    const errors = state.validationErrors;

    return errors.active[slideId] || errors.deleted[slideId] || (errors.pending ? [{ isValid: false, errorCode: 'validation pending' }] : []);
  },

  isSlideValidated: (state, getters) => (slide) => isEmpty(getters.getSlideValidationErrors(slide)),

  isLocked(state) {
    return state.lock;
  },

  hasDirtySlides(state) {
    return state.dirtySlides.length > 0;
  },

  getTheme: (state, getters) => (questionId) => {
    let hasDraft = false;
    if (state.quiz.draftVersion) {
      hasDraft = true;
    }
    const questionDraft = state.quiz[hasDraft ? 'draft' : 'info'][getters.questionDraftKey].find((question) => question._id === questionId);
    if (!questionDraft) {
      return;
    }
    return questionDraft.structure.theme;
  },

  getTotalQuizMarks(state, getters) {
    return state.quiz.draft[getters.questionDraftKey].reduce((sum, question) => sum + (!question.deleted ? getQuestionDefaultMarks(question) : 0), 0);
  },

  getTotalGradedQuestions(state, getters) {
    return state.quiz.draft[getters.questionDraftKey].reduce((count, question) => {
      if (!question.deleted) {
        return count + (getQuestionDefaultMarks(question) > 0 ? 1 : 0);
      }
      return count + 0;
    }, 0);
  },

  isAutoSaveInProgress(state) {
    return state.autoSaveInProgress;
  },

  IsDraftVersionStale(state) {
    return state.staleDraftWarning;
  },

  hasPublishedVersion(state) {
    return state.quiz.hasPublishedVersion;
  },

  allQuestionTopics(state, getters) {
    const questionTopics = new Set();

    // TODO(Anirudh): Optimize this, figure out which ones are actually required here
    state.quiz.draft[getters.questionDraftKey].forEach((draft) => {
      draft.topics.forEach((topic) => questionTopics.add(topic));
    });

    state.quiz.draft.questions.forEach((draft) => {
      draft.topics.forEach((topic) => questionTopics.add(topic));
    });

    state.quiz.info.questions.forEach((question) => {
      question.topics.forEach((topic) => questionTopics.add(topic));
    });

    return Array.from(questionTopics);
  },

  quizLockData(state) {
    return state.quiz.lock;
  },

  /**
   * We are blocking all lessons for non super users, however if a super user tries to teleport,
   * we set the isSuperParent flag only if the quiz from which the question/slide is teleported is a
   * premiumContent.
   *
   * Premium content is content that has any of the premium features like audio or video etc.
   */

  teleportedQuestions(state) {
    return state.quiz.draft.teleportedQuestions;
  },

  /**
   * Checks if the draft contains old slides so conversion API call can happen
   */
  doesQuizHaveOldSlides(state) {
    const { questions } = state.quiz.draft;

    for (const question of questions) {
      if (question.type === 'SLIDE') {
        return true;
      }
    }

    return false;
  },

  isTeleportContentSuper: (state, getters, rootState) => (content) => {
    const user = new UserService(rootState.user);

    if (user.isCorporate) {
      return false;
    }

    if (isQuizTypeContent(content)) {
      return get(content, 'isSuper', false);
    }

    return content.createdBy.id !== user.id;
  },

  isTeleportContentPremium: () => (content) => get(content, 'isSuper', false),

  isEditorForPresentationContent(state) {
    return state.editorForContentType === Constants.ContentType.PRESENTATION;
  },

  isEditorForQuizContent(state) {
    return state.editorForContentType === Constants.ContentType.QUIZ;
  },

  dirtySlides(state) {
    return state.dirtySlides;
  },

  history(state) {
    return state.history;
  },

  historyCursor(state) {
    return state.historyCursor;
  },

  lastHistoryEntry(state) {
    return state.history[state.historyCursor];
  },

  canUndo(state) {
    return state.historyCursor >= 0;
  },

  canRedo(state) {
    return state.historyCursor < state.history.length - 1;
  },

  hasNoSlides(state, getters) {
    return getters.sortedQuestions.length === 0;
  },

  getDraftPreferences(state, getters) {
    return getters.draft.pref || {};
  },

  getCurriculum(state) {
    return state.curriculum;
  },

  imageDropUploading(state) {
    return state.imageDropUploading;
  },

  isQuizWithoutDrafts(state) {
    return state.quizWithoutDrafts;
  },

  isAnswerExplanationsInViewStore(state) {
    return state.isAnswerExplanationsInView;
  },

  parsedQuestionQueryStore(state) {
    return state.parsedQuestionQuery;
  },

  getSelectedQuestionElementDebounced(state) {
    return state.setSelectedQuestionElementDebounced;
  },

  getTipTapEditorData(state) {
    return state.tiptapEditor;
  },

  getTipTapRef(state) {
    if (state.lastFocusedTipTap !== null) {
      return state.lastFocusedTipTap;
    }
    if (state.tiptapRefs.length === 0) {
      return null;
    }
    return state.tiptapRefs[state.tiptapRefs.length - 1];
  },

  getCanVideoBeRendered(state) {
    return state.canVideoBeRendered;
  },

  getHideMediaContainer(state) {
    return state.shouldHideMediaContainer;
  },

  getHideTextContainer(state) {
    return state.shouldHideTextContainer;
  },

  globalClipboardState(state) {
    return state.globalClipboardManager;
  },

  getSubjectForGeneratedOptions(state) {
    return state.subjectForGeneratedOptions;
  },

  isAIGenerated(state) {
    return state.aiGenerated.isAIGenerated;
  },

  isAIGeneratedFromExtraction(state) {
    return state.aiGenerated.isAIGeneratedFromExtraction;
  },

  documentScannedByAIPercent(state) {
    return state.aiGenerated.documentScannedByAIPercent;
  },

  aiGenerationType(state) {
    return state.aiGenerated.aiGenerationType;
  },

  quizGenFilters(state) {
    return state.quizGenFilters;
  },

  quizGenQuestions(state) {
    return state.quizGenQuestions;
  },

  quizGenFiltersCopy(state) {
    return state.quizGenFiltersCopy;
  },

  indexToAddQuizGenQuestions(state) {
    return state.indexToAddQuizGenQuestions;
  },

};

export const mutations = {
  [MutationTypes.contentEditor.SET_QUIZ](state, payload) {
    state.quiz = Quiz(payload.quiz);
    state.editorForContentType = payload.editorForContentType;
  },

  [MutationTypes.contentEditor.SET_CLIPBOARD_STATE](state, payload) {
    state.globalClipboardManager = {
      ...state.globalClipboardManager,
      ...payload,
    };
  },

  [MutationTypes.contentEditor.SET_QUESTION_EDITOR_DIMENSIONS](state, dimensions) {
    state.questionEditorDimensions = dimensions;
  },

  [MutationTypes.contentEditor.RESET_QUIZ](state, payload) {
    state.quiz = Quiz();
  },
  [MutationTypes.contentEditor.SET_QUIZ_PREFERENCES](state, payload) {
    Object.keys(payload).forEach((key) => {
      state.quizPreferences[key] = payload[key];
    });
  },
  [MutationTypes.contentEditor.SET_COPY_OF_QUIZ_PREFERENCES](state, payload) {
    Object.keys(payload).forEach((key) => {
      state.copyOfQuizPreferences[key] = payload[key];
    });
  },

  [MutationTypes.contentEditor.SET_IS_QUIZ_NAME_CHANGED_USING_HEADER_INPUT](state, payload) {
    state.isQuizNameChangedUsingHeaderInput = payload;
  },

  [MutationTypes.contentEditor.SET_QUIZ_PREFERENCE](state, payload) {
    const { preference, value } = payload;
    state.quizPreferences[preference] = value;
  },

  [MutationTypes.contentEditor.SET_DRAFT_QUESTIONS](state, payload) {
    state.quiz.draft[getQuestionDraftKey(state)] = payload.questions;
  },

  [MutationTypes.contentEditor.SET_IMAGE](state, image) {
    state.quiz.draft.image = image;
  },
  [MutationTypes.contentEditor.SET_THEME](state, { questionId, theme }) {
    const questionDraft = state.quiz.draft[getQuestionDraftKey(state)].find((question) => question._id === questionId);
    if (!questionDraft || !questionDraft.structure) {
      return;
    }
    questionDraft.structure.theme = theme;
  },
  [MutationTypes.contentEditor.SET_THEME_ALL](state, theme) {
    state.quiz.draft[getQuestionDraftKey(state)] = forEach(state.quiz.draft[getQuestionDraftKey(state)], (questionDraft) => {
      if (!questionDraft || !questionDraft.structure) {
        return;
      }
      questionDraft.structure.theme = theme;
      state.dirtySlides.push(questionDraft._id);
      return questionDraft;
    });
  },

  [MutationTypes.contentEditor.SET_SLIDES_TO_REORDER](state, config) {
    state.reorderSlides = config;
  },

  [MutationTypes.contentEditor.SET_LANGUAGE](state, language) {
    state.quiz.draft.lang = language;
  },

  [MutationTypes.contentEditor.SET_CURRICULUM](state, curriculum) {
    state.curriculum = curriculum;
  },

  [MutationTypes.contentEditor.SET_PREVIOUS_FILTER](state, filters) {
    state.previousFilter = filters;
  },

  [MutationTypes.contentEditor.SET_PREVIOUS_STANDARDS](state, standards) {
    state.previousStandards = standards;
  },

  [MutationTypes.contentEditor.SET_STANDARD_DATA](state, standards) {
    state.quiz.draft.standardData = standards;
  },

  [MutationTypes.contentEditor.SET_GRADE_RANGE](state, gradeRange) {
    state.quiz.draft.grade = gradeRange;
  },

  [MutationTypes.contentEditor.SET_VISIBILITY](state, visibility) {
    state.quiz.draft.visibility = visibility;
  },

  [MutationTypes.contentEditor.SET_NAME](state, name) {
    state.quiz.draft.name = name;
  },

  [MutationTypes.contentEditor.SET_STATE_STANDARDS](state, standards) {
    state.quiz.draft.stateStandards = standards;
  },

  [MutationTypes.contentEditor.SET_SUBJECTS](state, subjects) {
    state.quiz.draft.subjects = subjects;
  },

  [MutationTypes.contentEditor.ADD_NEW_SLIDE](state, question) {
    question.structure.marks.correct = getQuestionDefaultMarks(question);
    question.structure.marks.incorrect = 0;
    state.quiz.draft[getQuestionDraftKey(state)].push(question);
  },

  [MutationTypes.contentEditor.SET_SELECTED_SLIDE](state, draftId) {
    state.selectedSlide = draftId;
  },

  [MutationTypes.contentEditor.SET_DIRTY_SLIDE](state, id) {
    if (id && !state.dirtySlides.includes(id)) {
      state.dirtySlides.push(id);
    }
  },

  [MutationTypes.contentEditor.SET_ALL_SLIDES_DIRTY](state) {
    const draftQuestions = state.quiz.draft[getQuestionDraftKey(state)];
    map(draftQuestions, (question) => {
      if (!state.dirtySlides.includes(question._id) && question.marksUpdated) {
        state.dirtySlides.push(question._id);
      }
    });
  },

  [MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES](state) {
    state.dirtySlides = [];
  },

  [MutationTypes.contentEditor.DELETE_SLIDE_BY_ID](state, id) {
    const question = state.quiz.draft[getQuestionDraftKey(state)].find((item) => item._id === id);
    question.deleted = true;
    question.index = -1;
  },

  [MutationTypes.contentEditor.REMOVE_SLIDE_BY_ID](state, id) {
    state.quiz.draft[getQuestionDraftKey(state)] = filter(state.quiz.draft[getQuestionDraftKey(state)], (question) => question._id !== id);
  },

  [MutationTypes.contentEditor.UNDELETE_SLIDE_BY_ID](state, { id, index }) {
    const question = state.quiz.draft[getQuestionDraftKey(state)].find((item) => item._id === id);
    question.deleted = false;
    question.index = index;
  },

  [MutationTypes.contentEditor.PUSH_ONE_INDEX_FROM](state, { start, end, updateDirtySlides = true }) {
    pushOrPullIndex(state, start, end, updateDirtySlides, 'PUSH');
  },

  [MutationTypes.contentEditor.PULL_ONE_INDEX_FROM](state, { start, end, updateDirtySlides = true }) {
    pushOrPullIndex(state, start, end, updateDirtySlides, 'PULL');
  },

  [MutationTypes.contentEditor.SET_INDEX_BY_ID](state, { id, index }) {
    const question = state.quiz.draft[getQuestionDraftKey(state)].find((question) => question._id === id);
    question.index = index;

    if (!state.dirtySlides.includes(question._id)) {
      state.dirtySlides.push(question._id);
    }
  },

  [MutationTypes.contentEditor.LOCK](state) {
    state.lock = true;
  },

  [MutationTypes.contentEditor.UNLOCK](state) {
    state.lock = false;
  },

  [MutationTypes.contentEditor.SET_AUTOSAVE_IN_PROGRESS](state, isInProgress) {
    state.autoSaveInProgress = isInProgress;
  },

  [MutationTypes.contentEditor.TOGGLE_STALE_DRAFT_WARNING](state, isShowing) {
    state.staleDraftWarning = isShowing;
  },

  [MutationTypes.contentEditor.SET_ALL_QUESTION_TIME_CHANGE_LOADER](state, isLoading) {
    state.loadingTracker.all_time = isLoading;
  },

  [MutationTypes.contentEditor.SET_ALL_QUESTION_POINTS_CHANGE_LOADER](state, isLoading) {
    state.loadingTracker.all_marks = isLoading;
  },

  [MutationTypes.contentEditor.UPDATE_DRAFT_QUESTION](state, payload) {
    const questionId = payload.id;
    const updatedKeys = payload.question;
    const draftQuestions = state.quiz.draft[getQuestionDraftKey(state)];
    const indexOfQuestion = findIndex(draftQuestions, (q) => q._id === questionId);

    if (indexOfQuestion >= 0) {
      Object.assign(draftQuestions[indexOfQuestion], updatedKeys);
    }
  },

  [MutationTypes.contentEditor.UPDATE_DRAFT_QUESTIONS](state, payload) {
    if (payload.questionIds.length > 0) {
      const draftQuestions = state.quiz.draft[getQuestionDraftKey(state)];
      let indexOfQuestion = 0;
      let updatedQuestion = {};
      forEach(payload.questionIds, (questionId) => {
        indexOfQuestion = findIndex(draftQuestions, (q) => q._id === questionId);

        if (indexOfQuestion >= 0) {
          updatedQuestion = cloneDeep(draftQuestions[indexOfQuestion]);
          updatedQuestion.structure.marks = {
            correct: payload.points,
            incorrect: 0,
          };
          Object.assign(draftQuestions[indexOfQuestion], updatedQuestion);
        }
      });
    }
  },

  [MutationTypes.contentEditor.CORRECT_INDICES](state) {
    let questions = state.quiz.draft[getQuestionDraftKey(state)];
    questions = filter(questions, (item) => item.index >= 0);
    const sortedQuestions = sortBy(questions, (item) => item.index);

    for (let i = 0; i < sortedQuestions.length; i++) {
      sortedQuestions[i].index = i;
    }
  },

  [MutationTypes.contentEditor.ADD_TELEPORTED_QUESTIONS](state, ids) {
    state.quiz.draft.teleportedQuestions = state.quiz.draft.teleportedQuestions.concat(ids);
  },

  [MutationTypes.contentEditor.PUSH_HISTORY](state, payload) {
    state.historyCursor += 1;
    state.history[state.historyCursor] = payload;
    state.history = state.history.slice(0, state.historyCursor + 1);

    if (state.historyCursor === Constants.HistoryStackProps.WindowSize) {
      state.history.shift();
      state.historyCursor -= 1;
    }
  },

  [MutationTypes.contentEditor.SET_HISTORY_CURSOR](state, cursorPosition) {
    state.historyCursor = cursorPosition;
  },

  [MutationTypes.contentEditor.SET_SHOULD_SHOW_CURRICULUM_SELECTION](state, shouldShow) {
    state.shouldShowCurriculumSelection = shouldShow;
  },

  [MutationTypes.contentEditor.SET_DRAFT_PREFERENCE](state, payload) {
    state.quiz.draft.pref = payload.preferences;
  },

  [MutationTypes.contentEditor.SET_IMAGE_DROP_UPLOADING](state, status) {
    state.imageDropUploading = status;
  },

  [MutationTypes.contentEditor.SET_QUIZ_IS_SUPER](state) {
    const isQuizSuper = !!state.quiz.draft.questionDrafts.find((draftQuestion) => draftQuestion.structure.settings.canSubmitCustomResponse);
    state.quiz.isSuper = isQuizSuper;
  },

  [MutationTypes.contentEditor.CLEAN_ELEMENTS_ARRAY](state) {
    const draftQuestions = state.quiz.draft[getQuestionDraftKey(state)];
    for (const question of draftQuestions) {
      question.structure.elements = compact(question.structure.elements);
    }
  },

  [MutationTypes.contentEditor.UPDATE_SELECTED_SLIDE](state, newSlide) {
    let questions = state.quiz.draft[getQuestionDraftKey(state)];
    questions = map(questions, (question, index) => {
      if (question._id === state.selectedSlide) {
        return newSlide;
      }
      return question;
    });
    state.quiz.draft[getQuestionDraftKey(state)] = questions;
  },

  [MutationTypes.contentEditor.SET_QUIZ_WITHOUT_DRAFTS](state, quizWithoutDrafts) {
    state.quizWithoutDrafts = quizWithoutDrafts;
  },

  [MutationTypes.contentEditor.SET_ANSWER_EXPLANATION_VIEW](state, val) {
    state.isAnswerExplanationsInView = val;
  },

  [MutationTypes.contentEditor.SET_PARSED_QUESTION_QUERY](state, val) {
    state.parsedQuestionQuery = {
      ...state.parsedQuestionQuery,
      ...val,
    };
  },

  [MutationTypes.contentEditor.SET_TIPTAP_EDITOR_DATA](state, val) {
    state.tiptapEditor = val;
  },

  [MutationTypes.contentEditor.SET_VIDEO_RENDERED](state, val) {
    state.canVideoBeRendered = val;
  },

  [MutationTypes.contentEditor.SET_HIDE_MEDIA](state, val) {
    state.shouldHideMediaContainer = val;
  },

  [MutationTypes.contentEditor.SET_HIDE_TEXT_CONTAINER](state, val) {
    state.shouldHideTextContainer = val;
  },

  [MutationTypes.contentEditor.ADD_TIPTAP_REF](state, val) {
    if (!state.tiptapRefs.find((ref) => ref === val)) {
      state.tiptapRefs.push(val);
    }
  },

  [MutationTypes.contentEditor.SET_FOCUSED_TIPTAP](state, val) {
    state.lastFocusedTipTap = val;
  },

  [MutationTypes.contentEditor.REMOVE_TIPTAP_REF](state, val) {
    state.tiptapRefs = state.tiptapRefs.filter((ref) => ref !== val);
    if (state.lastFocusedTipTap === val) {
      state.lastFocusedTipTap = null;
    }
  },

  [MutationTypes.contentEditor.SET_VALIDATION_ERRORS](state, val) {
    state.validationErrors.active = val.active;
    state.validationErrors.deleted = val.deleted;
    state.validationErrors.pending = false;
  },

  [MutationTypes.contentEditor.SET_VALIDATION_PENDING](state) {
    state.validationErrors.pending = true;
  },

  [MutationTypes.contentEditor.SET_SUBJECT_FOR_GENERATED_OPTIONS](state, val) {
    state.subjectForGeneratedOptions = val;
  },

  [MutationTypes.contentEditor.SET_AI_GENERATED](state, val) {
    state.aiGenerated.isAIGenerated = true;
    state.aiGenerated.isAIGeneratedFromExtraction = val.isAIGeneratedFromExtraction;
    state.aiGenerated.documentScannedByAIPercent = ~~(val.documentScannedByAIPercent);
    state.aiGenerated.aiGenerationType = val.aiGenerationType;
  },

  [MutationTypes.contentEditor.RESET_AI_GENERATED](state) {
    state.aiGenerated.isAIGenerated = false;
    state.aiGenerated.isAIGeneratedFromExtraction = false;
    state.aiGenerated.documentScannedByAIPercent = 0;
    state.aiGenerated.aiGenerationType = null;
  },

  [MutationTypes.contentEditor.SET_QUIZ_GEN_FILTERS](state, payload) {
    const {
      filter, value, updateAllValues, updateCopyOfFilters,
    } = payload;
    if (updateAllValues) {
      state.quizGenFilters = { ...state.quizGenFilters, ...value };
    } else if (updateCopyOfFilters) {
      state.quizGenFiltersCopy = { ...state.quizGenFiltersCopy, ...value };
    } else { state.quizGenFilters[filter] = value; }
  },

  [MutationTypes.contentEditor.SET_QUIZ_GEN_QUESTIONS](state, payload) {
    state.quizGenQuestions = payload;
  },

  [MutationTypes.contentEditor.SET_INDEX_TO_ADD_QUIZ_GEN_QUESTIONS](state, payload) {
    state.indexToAddQuizGenQuestions = payload;
  },
};

function checkCorrectIndices(getters) {
  for (let i = 0; i < getters.sortedQuestions.length; i++) {
    const isIndexAtCorrectOrder = getters.sortedQuestions[i] && i === getters.sortedQuestions[i].index;
    QLogger.invariant(isIndexAtCorrectOrder, `contentEditor: Attention: indices are in the wrong state. For ${i} in sortedQuestions`);
  }
}

function getTimeTitle(selectedTime) {
  const inSecs = selectedTime / 1000;
  const inMinutes = inSecs / 60;

  if (inMinutes >= 1) {
    return (inMinutes === 1) ? `${inMinutes} minute` : `${inMinutes} minutes`;
  }

  return `${inSecs} seconds`;
}

export const actions = {
  setQuiz({ commit, dispatch }, { quiz, editorForContentType, quizWithoutDrafts }) {
    dispatch('analyticsManager/addBreadcrumb', `QTM:${quiz.type}-${editorForContentType}`, { root: true });
    if (!editorForContentType) {
      // eslint-disable-next-line no-param-reassign
      editorForContentType = quiz.type;
    }
    commit(MutationTypes.contentEditor.SET_QUIZ, { quiz, editorForContentType });
    commit(MutationTypes.contentEditor.SET_SUBJECT_FOR_GENERATED_OPTIONS, null);
    // Validations to be done for null points and negative points on questions
    commit(MutationTypes.contentEditor.SET_ALL_SLIDES_DIRTY);

    commit(MutationTypes.contentEditor.SET_QUIZ_WITHOUT_DRAFTS, !!quizWithoutDrafts);

    if (quizWithoutDrafts) {
      dispatch('setDraftQuestions', {
        questions: quiz.info.questions.map((item, index) => Question(cloneDeep(item))),
      });
    }
  },

  setSubjectForGeneratedOptions({ commit }, val) {
    commit(MutationTypes.contentEditor.SET_SUBJECT_FOR_GENERATED_OPTIONS, val);
  },

  setQuestionEditorDimensions({ commit }, dimensions) {
    commit(MutationTypes.contentEditor.SET_QUESTION_EDITOR_DIMENSIONS, dimensions);
  },
  setQuizPreferences({ commit }, preferences) {
    commit(MutationTypes.contentEditor.SET_QUIZ_PREFERENCES, preferences);
  },
  setQuizPreference({ commit }, preference) {
    commit(MutationTypes.contentEditor.SET_QUIZ_PREFERENCE, preference);
  },
  setCopyOfQuizPreferences({ commit }, preferences) {
    commit(MutationTypes.contentEditor.SET_COPY_OF_QUIZ_PREFERENCES, preferences);
  },
  setIsQuizNameChangedUsingHeaderInput({ commit }, isChanged) {
    commit(MutationTypes.contentEditor.SET_IS_QUIZ_NAME_CHANGED_USING_HEADER_INPUT, isChanged);
  },
  resetQuiz({ commit }) {
    commit(MutationTypes.contentEditor.RESET_QUIZ);
    commit(MutationTypes.contentEditor.RESET_AI_GENERATED);
  },

  setImage({ commit }, image) {
    commit(MutationTypes.contentEditor.SET_IMAGE, image);
  },

  setName({ commit }, name) {
    commit(MutationTypes.contentEditor.SET_NAME, name);
  },

  setSubjects({ commit }, subjects) {
    commit(MutationTypes.contentEditor.SET_SUBJECTS, subjects);
  },

  setTheme({ commit }, theme) {
    commit(MutationTypes.contentEditor.SET_THEME, theme);
  },

  setThemeAll({ commit }, theme) {
    commit(MutationTypes.contentEditor.SET_THEME_ALL, theme);
  },

  setLanguage({ commit }, language) {
    commit(MutationTypes.contentEditor.SET_LANGUAGE, language);
  },

  setGradeRange({ commit }, gradeRange) {
    commit(MutationTypes.contentEditor.SET_GRADE_RANGE, gradeRange);
  },

  setVisibility({ commit }, visibility) {
    commit(MutationTypes.contentEditor.SET_VISIBILITY, visibility);
  },

  setCurriculum({ commit }, curriculum) {
    commit(MutationTypes.contentEditor.SET_CURRICULUM, curriculum);
  },

  setPreviousFilter({ commit }, filter) {
    commit(MutationTypes.contentEditor.SET_PREVIOUS_FILTER, filter);
  },

  setPreviousStandards({ commit }, standards) {
    commit(MutationTypes.contentEditor.SET_PREVIOUS_STANDARDS, standards);
  },

  setStateStandards({ commit }, standards) {
    commit(MutationTypes.contentEditor.SET_STATE_STANDARDS, standards);
  },

  setStandardData({ commit }, standards) {
    commit(MutationTypes.contentEditor.SET_STANDARD_DATA, standards);
  },

  setShouldShowCurriculumSelection({ commit }, shouldShow) {
    commit(MutationTypes.contentEditor.SET_SHOULD_SHOW_CURRICULUM_SELECTION, shouldShow);
  },

  addNewSlide({ commit, getters, dispatch }, {
    slide, atIndex = -1, markSlideDirty = true, noStack = false,
  }) {
    QLogger.invariant(!isEmpty(slide), 'addNewSlide: cannot add an empty slide');

    if (atIndex < 0) {
      slide.index = getters.getQuestionIndexById(getters.selectedSlide) + 1;
    } else {
      const isAtIndexValid = atIndex <= getters.sortedQuestions.length;

      QLogger.invariant(isAtIndexValid, `addNewSlide: The index '${atIndex}' given to addNewSlide is not valid as it can only be <= ${getters.sortedQuestions.length}`);

      slide.index = atIndex;
    }

    commit(MutationTypes.contentEditor.LOCK);
    commit(MutationTypes.contentEditor.PUSH_ONE_INDEX_FROM, {
      start: slide.index,
      end: getters.sortedQuestions.length - 1,
    });
    commit(MutationTypes.contentEditor.ADD_NEW_SLIDE, slide);

    if (markSlideDirty) {
      commit(MutationTypes.contentEditor.SET_DIRTY_SLIDE, slide._id);
    }

    commit(MutationTypes.contentEditor.CORRECT_INDICES);
    commit(MutationTypes.contentEditor.UNLOCK);
    if (!noStack) {
      const { selectedSlide } = getters;
      setTimeout(() => {
        commit(MutationTypes.contentEditor.PUSH_HISTORY, cloneDeep({
          op: Constants.HistoryOps.ADD_SLIDE,
          props: slide,
          selectedSlide,
        }));
      }, 50);
    }
    checkCorrectIndices(getters);
  },

  addNewSlideFromHistory({ commit, getters, dispatch }, question) {
    question.index = getters.getQuestionIndexById(getters.selectedSlide) + 1;

    commit(MutationTypes.contentEditor.LOCK);
    commit(MutationTypes.contentEditor.PUSH_ONE_INDEX_FROM, {
      start: question.index,
      end: getters.sortedQuestions.length - 1,
    });
    commit(MutationTypes.contentEditor.REMOVE_SLIDE_BY_ID, question._id);
    commit(MutationTypes.contentEditor.ADD_NEW_SLIDE, question);
    commit(MutationTypes.contentEditor.SET_DIRTY_SLIDE, question._id);
    commit(MutationTypes.contentEditor.CORRECT_INDICES);
    commit(MutationTypes.contentEditor.UNLOCK);
    checkCorrectIndices(getters);
  },

  /* Optimised adding slides for the Adding multiple questions feature in teleport slider */
  addMultipleNewSlides({ commit, getters }, { slides = [], atIndex = -1, markSlideDirty = true }) {
    const cleanSlideArray = [];

    for (let i = 0; i < slides.length; i++) {
      const cleanSlide = Question(cloneDeep(slides[i]));

      if (atIndex < 0) {
        cleanSlide.index = getters.getQuestionIndexById(getters.selectedSlide) + i + 1;
      } else {
        const isAtIndexValid = atIndex <= getters.sortedQuestions.length;

        QLogger.invariant(isAtIndexValid, `addMultipleNewSlides: The index '${atIndex}' given to addNewSlide is not valid as it can only be <= ${getters.sortedQuestions.length}`);

        cleanSlide.index = atIndex;
      }

      cleanSlideArray[i] = cleanSlide;
    }

    commit(MutationTypes.contentEditor.LOCK);
    commit(MutationTypes.contentEditor.PUSH_ONE_INDEX_FROM, {
      start: cleanSlideArray[0].index,
      end: getters.sortedQuestions.length - 1,
    });

    for (let i = 0; i < cleanSlideArray.length; i++) {
      commit(MutationTypes.contentEditor.ADD_NEW_SLIDE, cleanSlideArray[i]);

      if (markSlideDirty) {
        commit(MutationTypes.contentEditor.SET_DIRTY_SLIDE, cleanSlideArray[i]._id);
      }
    }

    commit(MutationTypes.contentEditor.CORRECT_INDICES);
    commit(MutationTypes.contentEditor.UNLOCK);
    checkCorrectIndices(getters);
  },

  selectSlideById({ dispatch, commit, getters }, id = '') {
    const slide = getters.getQuestionById(id);

    commit(MutationTypes.contentEditor.SET_SELECTED_SLIDE, id);

    if (isEmpty(id) || isEmpty(slide)) {
      if (getters.isEditorForQuizContent) {
        /**
         * Setting selectedSlideToEmpty means that no slide is being edited right now
         * which can only happen when the content is quiz because lessons will always have
         * some slide being edited
         */
        dispatch('slideEditor/resetSlideEditor', {}, { root: true });
      }

      return;
    }

    dispatch('slideEditor/setSlide', { slide }, { root: true });
  },

  setDirtySlide({ commit }, id) {
    commit(MutationTypes.contentEditor.SET_DIRTY_SLIDE, id);
  },

  setAIGenerated({ commit }, payload) {
    commit(MutationTypes.contentEditor.SET_AI_GENERATED, payload);
  },

  async autoSave({ commit, state, getters }) {
    if (getters.isAutoSaveInProgress) {
      return;
    }

    const questionsToUpdate = [];

    for (const qId of state.dirtySlides) {
      const question = getters.getQuestionById(qId);

      if (question) {
        questionsToUpdate.push(question);
      }
    }

    if (questionsToUpdate.length === 0) {
      return;
    }

    if (getters.isLocked) {
      QLogger.warn('In locked state. Not autosaving.... ');
      return;
    }

    commit(MutationTypes.contentEditor.SET_AUTOSAVE_IN_PROGRESS, true);

    const result = await QuizService.autoSave(getters.draft._id, questionsToUpdate, state.quiz._id);
    if (!result.success) {
      // if (result.error === 'version.NOT_ALLOWED') {
      commit(MutationTypes.contentEditor.TOGGLE_STALE_DRAFT_WARNING, true);
      // }
    }

    if (result.data) {
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);
    }

    commit(MutationTypes.contentEditor.SET_AUTOSAVE_IN_PROGRESS, false);
  },

  setStaleVersionWarningVisibility({ commit }, isShowing) {
    commit(MutationTypes.contentEditor.TOGGLE_STALE_DRAFT_WARNING, isShowing);
  },

  async deleteSlideById({ getters, dispatch }, id) {
    if (getters.isEditorForPresentationContent) {
      dispatch('deletePresentationSlideById', { id });
    }

    if (getters.isEditorForQuizContent) {
      await dispatch('deleteQuizSlideById', { id });
    }
  },

  async deleteQuizSlideById({ commit, getters, dispatch }, { id }) {
    if (id === getters.selectedSlide) {
      dispatch('selectSlideById', '');
    }

    const result = await dispatch('deleteQuizQuestion', { id });

    if (!result.success) {
      return;
    }

    dispatch('handleSlideDeletion', { id, updateDirtySlides: false });
  },

  async deletePresentationSlideById({ commit, getters, dispatch }, { id }) {
    const index = getters.getQuestionIndexById(id);

    if (id === getters.selectedSlide) {
      let selectIndex = index + 1;
      selectIndex = selectIndex >= getters.sortedQuestions.length ? index - 1 : selectIndex;

      if (selectIndex >= 0) {
        const _id = getters.getQuestionByIndex(selectIndex)?._id;

        if (getters.selectedSlide === id) {
          await asyncDelay(10);

          commit(MutationTypes.contentEditor.PUSH_HISTORY, cloneDeep({
            op: Constants.HistoryOps.DELETE_SLIDE,
            id,
            index,
            fromSelectedSlide: getters.selectedSlide,
            toSelectedSlide: _id,
          }));

          dispatch('selectSlideById', _id);
        }
      } else {
        await asyncDelay(10);

        dispatch('selectSlideById', '');
      }
    }

    dispatch('handleSlideDeletion', { id, updateDirtySlides: true });
  },

  async deleteSlideByIdFromHistory({ commit, getters, dispatch }, id) {
    const index = getters.getQuestionIndexById(id);

    if (id === getters.selectedSlide) {
      let selectIndex = index + 1;
      selectIndex = selectIndex >= getters.sortedQuestions.length ? index - 1 : selectIndex;

      if (selectIndex >= 0) {
        const _id = getters.getQuestionByIndex(selectIndex)?._id;

        if (getters.selectedSlide === id) {
          await asyncDelay(10);

          dispatch('selectSlideById', _id);
        }
      } else {
        await asyncDelay(10);

        dispatch('selectSlideById', '');
      }
    }

    dispatch('handleSlideDeletion', { id, updateDirtySlides: true });

    checkCorrectIndices(getters);
  },

  handleSlideDeletion({ commit, getters }, { id, updateDirtySlides = true }) {
    const index = getters.getQuestionIndexById(id);
    const start = index + 1;
    const end = getters.sortedQuestions.length - 1;

    commit(MutationTypes.contentEditor.LOCK);
    commit(MutationTypes.contentEditor.PULL_ONE_INDEX_FROM, { start, end, updateDirtySlides });
    commit(MutationTypes.contentEditor.DELETE_SLIDE_BY_ID, id);

    if (updateDirtySlides) {
      commit(MutationTypes.contentEditor.SET_DIRTY_SLIDE, id);
    }

    commit(MutationTypes.contentEditor.CORRECT_INDICES);
    commit(MutationTypes.contentEditor.UNLOCK);

    checkCorrectIndices(getters);
  },

  /**
   * Duplicate a slide
   * @param getters
   * @param dispatch
   * @param id
   * @param atIndex
   * @param shouldSelectSlide
   */
  async duplicateSlideById({ getters, dispatch }, { id, atIndex = -1, shouldSelectSlide = true }) {
    const duplicateSlide = Question(cloneDeep(getters.getQuestionById(id)));
    duplicateSlide._id = ObjectId().toHexString();
    duplicateSlide.standardIds = duplicateSlide.standardIds?.map((stdId) => stdId?._id) ?? [];

    for (const element of duplicateSlide.structure.elements) {
      element._id = ObjectId().toHexString();
    }

    if (getters.isEditorForQuizContent) {
      const result = await dispatch('createQuizQuestion', {
        question: duplicateSlide,
        atIndex,
        cloneInfo: { questionId: id, quizId: getters.quizId },
      });

      if (!result.success) {
        ToastService.add({
          type: Constants.ToastTypes.ERROR,
          title: i18n('Could not duplicate question. Please try again.'),
        });

        return;
      }
    } else {
      dispatch('addNewSlide', { slide: duplicateSlide, atIndex });
    }

    checkCorrectIndices(getters);

    if (shouldSelectSlide) {
      await asyncDelay(10);

      dispatch('selectSlideById', duplicateSlide._id);
    }
  },

  async teleportSlide({ getters, dispatch, commit }, question) {
    const data = cloneDeep(question);

    dispatch('addNewSlide', { slide: Question(data) });
    commit(MutationTypes.contentEditor.ADD_TELEPORTED_QUESTIONS, [data.parent]);

    if (doesQuestionHaveAnswerExplanations(question)) {
      addNewAnswerExplanationSlide(data.structure.explain, data.index);
      commit(MutationTypes.contentEditor.ADD_TELEPORTED_QUESTIONS, [data.parent]);
    }

    await asyncDelay(10);

    dispatch('selectSlideById', data._id);
  },

  async teleportMultipleSlides({ getters, dispatch, commit }, slides) {
    const allSlides = [];
    let newSlideWithExplanation = {};

    for (let i = 0; i < slides.length; i++) {
      allSlides.push(slides[i]);

      if (doesQuestionHaveAnswerExplanations(slides[i])) {
        newSlideWithExplanation = {
          ...getNewSlideFromExplanation(slides[i].structure.explain),
          parent: allSlides.at(-1).parent,
          isSuperParent: allSlides.at(-1).isSuperParent,
        };

        allSlides.push(newSlideWithExplanation);
      }
    }

    await dispatch('addMultipleNewSlides', { slides: allSlides });

    commit(MutationTypes.contentEditor.ADD_TELEPORTED_QUESTIONS, allSlides.map((q) => q.parent));

    const firstQuestion = slides[0];

    await asyncDelay(10);

    dispatch('selectSlideById', firstQuestion._id);
  },

  changeIndex({ commit, getters }, { oldIndex, newIndex, noStack = false }) {
    const id = getters.getQuestionByIndex(oldIndex)._id;

    if (oldIndex === newIndex || newIndex < 0 || newIndex >= getters.sortedQuestions.length) {
      return;
    }
    commit(MutationTypes.contentEditor.LOCK);

    if (oldIndex < newIndex) {
      commit(MutationTypes.contentEditor.PULL_ONE_INDEX_FROM, { start: oldIndex + 1, end: newIndex });
      commit(MutationTypes.contentEditor.SET_INDEX_BY_ID, { id, index: newIndex });
    } else {
      commit(MutationTypes.contentEditor.PUSH_ONE_INDEX_FROM, { start: newIndex, end: oldIndex - 1 });
      commit(MutationTypes.contentEditor.SET_INDEX_BY_ID, { id, index: newIndex });
    }

    commit(MutationTypes.contentEditor.CORRECT_INDICES);
    commit(MutationTypes.contentEditor.UNLOCK);
    if (!noStack) {
      commit(MutationTypes.contentEditor.PUSH_HISTORY, {
        op: Constants.HistoryOps.REORDER_SLIDE,
        questionId: id,
        movedFrom: oldIndex,
        movedTo: newIndex,
      });
    }
    checkCorrectIndices(getters);
  },

  updateDraftQuestion({ commit, dispatch }, { id, question }) {
    commit(MutationTypes.contentEditor.UPDATE_DRAFT_QUESTION, { id, question });

    dispatch('setDirtySlide', id);
  },

  updateAllQuestions({ commit, dispatch, state }) {
    const questions = state.quiz.draft[getQuestionDraftKey(state)];

    for (let i = 0; i < questions.length; i++) {
      const questionCopy = cloneDeep(Question(questions[i]));
      questionCopy.structure.marks = {
        correct: getQuestionDefaultMarks(questionCopy),
        incorrect: 0,
      };
      dispatch('updateDraftQuestion', { id: questionCopy._id, question: questionCopy });
    }
  },

  pushHistory({ commit }, payload) {
    if (payload.op === 'UPDATE_ELEMENT' && (!payload.from || !payload.to)) {
      return;
    }
    commit(MutationTypes.contentEditor.PUSH_HISTORY, payload);
  },

  undeleteSlideById({ commit }, payload) {
    commit(MutationTypes.contentEditor.LOCK);
    commit(MutationTypes.contentEditor.UNDELETE_SLIDE_BY_ID, payload);
    commit(MutationTypes.contentEditor.SET_DIRTY_SLIDE, payload.id);
    commit(MutationTypes.contentEditor.CORRECT_INDICES);
    commit(MutationTypes.contentEditor.UNLOCK);
  },

  setDraftQuestions({ commit }, { questions }) {
    commit(MutationTypes.contentEditor.SET_DRAFT_QUESTIONS, { questions });
  },

  async saveQuizQuestion({
    dispatch, getters, rootGetters, commit,
  }, { id }) {
    let question = getters.getQuestionById(id);
    const shouldCreateNewQuestion = isEmpty(question);
    const showErroToast = () => {
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        title: i18n('Unable to save the question. Please try again.'),
        time: 5000,
      });
    };

    if (shouldCreateNewQuestion) {
      // let question = getters.getQuestionById(id);
      const currentSlideIdState = rootGetters['slideEditor/currentSlideId'];

      if (currentSlideIdState === id) {
        question = rootGetters['slideEditor/currentSlide'];
      } else {
        dispatch('analyticsManager/addBreadcrumb', `CX:${id}-${currentSlideIdState}`, { root: true });
        dispatch('analyticsManager/addBreadcrumb', `QD:${JSON.stringify(rootGetters['slideEditor/currentSlide'])}`, { root: true });
      }

      const result = await dispatch('createQuizQuestion', { id, question });

      if (!result.success) {
        showErroToast();
      }

      return result;
    }

    let result;

    if (getters.isQuizWithoutDrafts) {
      result = await dispatch('updateQuizQuestionWithoutDrafts', { id });
    } else {
      result = await dispatch('updateQuizQuestion', { id });
    }

    if (!result.success) {
      showErroToast();
    }

    return result;
  },

  async createQuizQuestion({
    dispatch, getters, rootGetters, commit,
  }, { question, atIndex = -1, cloneInfo: { questionId, quizId } = {} }) {
    const indexToCreateAt = atIndex >= 0 ? atIndex : question.index;
    const index = indexToCreateAt >= 0 ? indexToCreateAt : getters.sortedQuestions.length;
    const questionToCreate = Question(cloneDeep({ ...question, index }));

    try {
      const { success, data, error } = await QuizService.createNewQuestion({
        question: questionToCreate,
        quizDraftId: getters.draftId,
        quizId: getters.quizId,
        cloneInfo: { questionId, quizId },
      });
      if (error || !success) {
        throw new Error(error);
      }
      const createdQuestion = Question(data.question);
      dispatch('addNewSlide', {
        slide: createdQuestion,
        atIndex: questionToCreate.index,
        markSlideDirty: false,
      });
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);

      return { success: true, question: createdQuestion };
    } catch (error) {
      const errorType = getNetworkErrorType(error);
      QLogger.errorForceLogged(`Error at createQuizQuestion: ${errorType} with details -`, error);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Cannot create question. Please try again.'),
      });

      return { success: false, errorType, error };
    }
  },

  async createMultipleQuizQuestion({ dispatch, getters, commit }, { questions, index, translationLocale }) {
    try {
      const { data } = await QuizService.createMultipleNewQuestions(getters.draftId, questions, index, getters.quizId, { translationLocale });
      const createdQuestions = map(data.questions, Question);
      let atIndex = -1;
      if (typeof index !== 'undefined') {
        atIndex = index;
      } else {
        atIndex = getters.sortedQuestions.length;
      }

      dispatch('addMultipleNewSlides', {
        slides: createdQuestions,
        atIndex,
        markSlideDirty: false,
      });

      commit(MutationTypes.contentEditor.ADD_TELEPORTED_QUESTIONS, [questions.map((q) => q.parent)]);

      return { success: true };
    } catch (error) {
      const errorType = getNetworkErrorType(error);
      QLogger.errorForceLogged(`Error at createMultipleQuizQuestion: ${errorType} with details -`, error);

      return { success: false, errorType, error };
    }
  },

  async updateQuestion({ dispatch, getters, commit }, { id, question }) {
    try {
      const { success, data, error } = await QuizService.updateQuestion(question, getters.draftId, getters.quizId);
      if (error || !success) {
        throw new Error(error);
      }
      const updatedQuestion = data.question;
      /** When a quiz is cloned and then a user edits a question, a new question is created with a new id.
       *  We need the oldQuestionId to find the question in the questions state list
       * */
      const oldQuestionId = id;

      commit(MutationTypes.contentEditor.UPDATE_DRAFT_QUESTION, { id: oldQuestionId, question: updatedQuestion });
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);

      return { success: true, question: updatedQuestion };
    } catch (error) {
      const errorType = getNetworkErrorType(error);
      QLogger.errorForceLogged(`Error at updateQuestion: ${errorType} with details -`, error);

      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Cannot update question. Please try again.'),
      });
      return { success: false, errorType, error };
    }
  },

  async updateMultipleQuestionPoints({
    dispatch, getters, commit, state,
  }, { points }) {
    const questions = state.quiz.draft[getQuestionDraftKey(state)];
    const questionIds = map(
      filter(questions, (item) => !isQuestionForPoll(item)),
      (question) => question._id,
    );
    commit(MutationTypes.contentEditor.SET_ALL_QUESTION_POINTS_CHANGE_LOADER, true);
    try {
      const { data } = await QuizService.updateMultipleQuestionPoints({
        questionIds, quizDraftId: getters.draftId, quizId: getters.quizId, points,
      });
      if (!data.success) {
        return { success: false, errorType: '' };
      }

      dispatch('updateDraftPreferences', { preferences: { marks: points } });
      commit(MutationTypes.contentEditor.SET_ALL_QUESTION_POINTS_CHANGE_LOADER, false);
      commit(MutationTypes.contentEditor.UPDATE_DRAFT_QUESTIONS, { questionIds, points });
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);
      ToastService.add({
        type: Constants.ToastTypes.SUCCESS,
        title: i18n('Points changed to {$1} for all questions', [points]),
      });

      return { success: true };
    } catch (error) {
      const errorType = getNetworkErrorType(error);
      QLogger.errorForceLogged(`Error at updateQuizQuestionPoints: ${errorType} with details -`, error);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        title: i18n('Could not update points for all questions. Please try again.'),
      });

      return { success: false, errorType, error };
    }
  },

  async updateQuizQuestion({ dispatch, getters, commit }, { id }) {
    const question = getters.getQuestionById(id);
    if (!question) {
      dispatch('analyticsManager/addBreadcrumb', `PQNFUQQ:${id}`, { root: true });
    }
    try {
      const questionCopy = Question(question);
      const { success, data, error } = await QuizService.updateQuestion(questionCopy, getters.draftId, getters.quizId);
      if (error || !success) {
        throw new Error(error);
      }
      const updatedQuestion = data.question;
      /** When a quiz is cloned and then a user edits a question, a new question is created with a new id.
       *  We need the oldQuestionId to find the question in the questions state list
       * */
      const oldQuestionId = id;

      commit(MutationTypes.contentEditor.UPDATE_DRAFT_QUESTION, { id: oldQuestionId, question: updatedQuestion });
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);

      return { success: true, question: updatedQuestion };
    } catch (error) {
      const errorType = getNetworkErrorType(error);
      QLogger.errorForceLogged(`Error at updateQuizQuestion: ${errorType} with details -`, error);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Cannot update question. Please try again.'),
      });
      return { success: false, errorType, error };
    }
  },

  async updateQuizQuestionWithoutDrafts({ dispatch, getters, commit }, { id }) {
    const question = getters.getQuestionById(id);
    if (!question) {
      dispatch('analyticsManager/addBreadcrumb', `PQNFUQQWD:${id}`, { root: true });
    }
    try {
      const { data } = await QuizService.updateQuestionWithoutDrafts(question, getters.draftId, getters.quizId);
      const updatedQuestion = cloneDeep(question);
      updatedQuestion._id = data.modifications[0].added;
      /** When a quiz is cloned and then a user edits a question, a new question is created with a new id.
       *  We need the oldQuestionId to find the question in the questions state list
       * */
      const oldQuestionId = id;

      commit(MutationTypes.contentEditor.UPDATE_DRAFT_QUESTION, { id: oldQuestionId, question: updatedQuestion });
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);

      return { success: true, question: updatedQuestion };
    } catch (error) {
      const errorType = getNetworkErrorType(error);
      QLogger.errorForceLogged(`Error at updateQuizQuestion: ${errorType} with details -`, error);

      return { success: false, errorType, error };
    }
  },

  async deleteQuizQuestion({ dispatch, getters, commit }, { id }) {
    const question = getters.getQuestionById(id);
    if (!question) {
      dispatch('analyticsManager/addBreadcrumb', `PQNFDQQ:${id}`, { root: true });
    }
    try {
      await QuizService.deleteQuestion(question, getters.draftId, getters.quizId);
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);

      return { success: true };
    } catch (error) {
      const errorType = getNetworkErrorType(error);
      QLogger.errorForceLogged(`Error at deleteQuizQuestion: ${errorType} with details -`, error);

      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        title: i18n('Could not delete question. Please try again.'),
      });

      return { success: false, errorType, error };
    }
  },

  /**
   *
   * Teleport question from the question editor
   */
  async teleportQuizQuestion({ getters, dispatch, commit }, { question, params = {} }) {
    try {
      const index = question.index >= 0 ? question.index : getters.sortedQuestions.length;
      const questionToCreate = Question({ ...question, index });
      if (questionToCreate.standardIds?.length > 0) {
        const stdIdArray = questionToCreate.standardIds.map((std) => std._id);
        questionToCreate.standardIds = stdIdArray;
      }
      const { success, data, error } = await QuizService.createNewQuestion({
        question: questionToCreate,
        quizDraftId: getters.draftId,
        quizId: getters.quizId,
        cloneInfo: {
          questionId: question.cloneFrom,
          quizId: question.teleportFrom,
        },
        translationLocale: params?.translationLocale,
      });
      if (error || !success) {
        throw new Error(error);
      }
      const createdQuestion = Question(cloneDeep(data.question));

      dispatch('addNewSlide', {
        slide: createdQuestion,
        atIndex: questionToCreate.index,
        markSlideDirty: false,
      });

      commit(MutationTypes.contentEditor.ADD_TELEPORTED_QUESTIONS, [createdQuestion.parent]);
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);

      return { success: true };
    } catch (error) {
      const errorType = getNetworkErrorType(error);
      QLogger.errorForceLogged(`Error at teleportQuizQuestion: ${errorType} with details -`, error);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Cannot update question. Please try again.'),
      });
      return { success: false, errorType, error };
    }
  },

  async reorderQuizQuestions({ getters, dispatch, commit }, questions) {
    try {
      const questionIds = questions.map((q) => q._id);
      const { data, error } = await QuizService.reorderQuestions(questionIds, getters.draftId, getters.quizId);
      if (error) {
        if (get(error, 'response.data.error', null) === 'version.NOT_ALLOWED') {
          EventBus.$emit('quizVersion:staleDraft', true);
        }
      }
      const updatedQuestions = data.version.questions;
      const cleanQuestionArray = [];

      for (let i = 0; i < updatedQuestions.length; i++) {
        const cleanQuestion = Question(cloneDeep(updatedQuestions[i]));

        cleanQuestion.index = i;
        cleanQuestionArray[i] = cleanQuestion;
      }

      dispatch('setDraftQuestions', { questions: cleanQuestionArray });
      commit(MutationTypes.contentEditor.CLEAR_DIRTY_SLIDES);
    } catch (error) {
      QLogger.error('Error at contentEditor:updateQuizQuestions', error);

      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Could not re-order questions. Please try again.'),
      });

      return { success: false };
    }
  },

  updateDraftPreferences({ getters, commit }, { preferences = {} }) {
    const updatedPreferences = { ...getters.getDraftPreferences, ...preferences };

    commit(MutationTypes.contentEditor.SET_DRAFT_PREFERENCE, { preferences: updatedPreferences });
  },

  async updateAllQuestionTimesInQuiz({ getters, commit, dispatch }, { time }) {
    commit(MutationTypes.contentEditor.SET_ALL_QUESTION_TIME_CHANGE_LOADER, true);
    try {
      const response = await QuizService.updateQuestionTimeForAll(getters.quizId, getters.draftId, time);

      if (!response.success) {
        commit(MutationTypes.contentEditor.TOGGLE_STALE_DRAFT_WARNING, true);
        throw new Error(response.error);
      }

      forEach(getters.sortedQuestions, (question) => {
        commit(MutationTypes.contentEditor.UPDATE_DRAFT_QUESTION, { id: question._id, question: { time } });
      });

      dispatch('updateDraftPreferences', { preferences: { time } });

      const timeTitle = getTimeTitle(time);
      ToastService.add({
        type: Constants.ToastTypes.SUCCESS,
        title: i18n('Timer changed to {$1} for all questions', [timeTitle]),
      });

      commit(MutationTypes.contentEditor.SET_ALL_QUESTION_TIME_CHANGE_LOADER, false);

      return { success: true };
    } catch (error) {
      QLogger.error('Error at updateAllQuestionTimesInQuiz:', error);

      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Could not update time for all questions. Please try again.'),
      });

      commit(MutationTypes.contentEditor.SET_ALL_QUESTION_TIME_CHANGE_LOADER, false);

      return { success: false };
    }
  },

  async updateContentMetaInfo({ commit, getters }, { info = {} }) {
    const { draft } = getters;
    const englishName = find(Languages, { code: 'en' });
    const showErrorToast = () => {
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while updating this quiz!'),
      });
    };

    const updatedInfo = {
      grade: isQuizVersionGradeValid(draft) ? draft.grade : [],
      image: isString(draft.image) ? draft.image : '',
      lang: isQuizVersionLanguageValid(draft) ? draft.lang : englishName,
      visibility: isBoolean(draft.visibility) ? draft.visibility : true,

      ...info,
    };

    const isGradeValid = isQuizVersionGradeValid(updatedInfo);
    const isImageValid = isEmpty(updatedInfo.image) || UrlUtils.isValidURL(updatedInfo.image);
    const isLangValid = isQuizVersionLanguageValid(updatedInfo);
    const isVisibilityValid = isBoolean(updatedInfo.visibility);

    if (!isGradeValid || !isImageValid || !isLangValid || !isVisibilityValid) {
      showErrorToast();

      QLogger.error('Error at updateContentMetaInfo: invalid data', {
        isGradeValid,
        isImageValid,
        isLangValid,
        isVisibilityValid,
      }, updatedInfo);

      return;
    }

    const result = await QuizService.update(getters.quizId, getters.draftId, updatedInfo);
    if (!result.success) {
      EventBus.$emit('quizVersion:staleDraft', true);
    }
    const updatedDraft = QuizVersion(result.draft);
    commit(MutationTypes.contentEditor.SET_NAME, updatedDraft.name);
    commit(MutationTypes.contentEditor.SET_IMAGE, updatedDraft.image);
    commit(MutationTypes.contentEditor.SET_LANGUAGE, updatedDraft.lang);
    commit(MutationTypes.contentEditor.SET_SUBJECTS, updatedDraft.subjects);
    commit(MutationTypes.contentEditor.SET_GRADE_RANGE, updatedDraft.grade);
    commit(MutationTypes.contentEditor.SET_VISIBILITY, updatedDraft.visibility);

    if (!result.success) {
      showErrorToast();
    }
  },

  setImageDropUploading({ commit }, status) {
    commit(MutationTypes.contentEditor.SET_IMAGE_DROP_UPLOADING, status);
  },

  setQuizIsSuper({ commit }) {
    commit(MutationTypes.contentEditor.SET_QUIZ_IS_SUPER);
  },

  setNewSlide({ commit }) {
    commit(MutationTypes.contentEditor.SET_NEW_SLIDE);
  },

  updateSelectedSlide({ commit }, newSlide) {
    commit(MutationTypes.contentEditor.UPDATE_SELECTED_SLIDE, newSlide);
    commit(MutationTypes.contentEditor.SET_DIRTY_SLIDE, newSlide._id);
  },

  resetIsAnswerExplanationsInView({ commit }) {
    commit(MutationTypes.contentEditor.SET_ANSWER_EXPLANATION_VIEW, false);
  },

  toggleIsAnswerExplanationsInView({ commit, getters }) {
    commit(MutationTypes.contentEditor.SET_ANSWER_EXPLANATION_VIEW, !getters.isAnswerExplanationsInViewStore);
  },

  setParsedQuestionQuery({ commit }, parsedQuestionQuery) {
    commit(
      MutationTypes.contentEditor.SET_PARSED_QUESTION_QUERY,
      parsedQuestionQuery,
    );
  },

  setTipTapData({ commit }, val) {
    commit(MutationTypes.contentEditor.SET_TIPTAP_EDITOR_DATA, val);
  },

  setVideoRendered({ commit }, val) {
    commit(MutationTypes.contentEditor.SET_VIDEO_RENDERED, val);
  },

  setHideMedia({ commit }, val) {
    commit(MutationTypes.contentEditor.SET_HIDE_MEDIA, val);
  },

  setHideTextContainer({ commit }, val) {
    commit(MutationTypes.contentEditor.SET_HIDE_TEXT_CONTAINER, val);
  },

  addTipTapRef({ commit }, val) {
    commit(MutationTypes.contentEditor.ADD_TIPTAP_REF, val);
  },

  removeTipTapRef({ commit }, val) {
    commit(MutationTypes.contentEditor.REMOVE_TIPTAP_REF, val);
  },

  setFocusedTipTapRef({ commit }, val) {
    commit(MutationTypes.contentEditor.SET_FOCUSED_TIPTAP, val);
  },

  async validateQuestions({ commit, getters, rootGetters }) {
    const slideBeingCurrentlyEdited = rootGetters['slideEditor/currentSlide'];
    const draftSlides = getters.questions;
    const active = {};
    const deleted = {};
    const setErrors = async (slide) => {
      const slideId = slide._id;

      if (!slideId) {
        return;
      }

      const isSlideDeleted = slide.deleted === true;
      const errorsForThisSlide = await getSingleSlideValidationErrors(slide);

      if (isSlideDeleted) {
        deleted[slideId] = errorsForThisSlide;
        return;
      }

      // to avoid setting errors when array is empty
      if (errorsForThisSlide && errorsForThisSlide.length) {
        active[slideId] = errorsForThisSlide;
      }
    };

    await Promise.all(draftSlides.map(setErrors));

    if (!isEmpty(slideBeingCurrentlyEdited)) {
      await setErrors(slideBeingCurrentlyEdited);
    }

    commit(MutationTypes.contentEditor.SET_VALIDATION_ERRORS, {
      active,
      deleted,
    });

    EventBus.$emit('questionValidation:complete');
  },

  setClipboardState({ commit }, payload) {
    commit(MutationTypes.contentEditor.SET_CLIPBOARD_STATE, payload);
  },

  setValidationPending({ commit }) {
    commit(MutationTypes.contentEditor.SET_VALIDATION_PENDING);
  },

  setQuizGenFilters({ commit }, payload) {
    commit(MutationTypes.contentEditor.SET_QUIZ_GEN_FILTERS, payload);
  },

  setQuizGenQuestions({ commit }, payload) {
    commit(MutationTypes.contentEditor.SET_QUIZ_GEN_QUESTIONS, payload);
  },

  setIndexToAddQuizGenQuestions({ commit }, payload) {
    commit(MutationTypes.contentEditor.SET_INDEX_TO_ADD_QUIZ_GEN_QUESTIONS, payload);
  },
};

// Helper Functions
function getQuestionDraftKey(state) {
  return state.editorForContentType === Constants.ContentType.PRESENTATION ? 'questionDrafts' : 'questions';
}

function pushOrPullIndex(state, start, end, updateDirtySlides, task = 'PULL') {
  const tempQuestions = [];
  let questions = state.quiz.draft[getQuestionDraftKey(state)];
  questions = filter(questions, (item) => item.index >= 0);

  for (let i = start; i <= end; i++) {
    const question = questions.find((question) => question.index === i);

    if (question) {
      tempQuestions.push(question);
    }
  }

  for (const tempQuestion of tempQuestions) {
    if (task === 'PULL') {
      tempQuestion.index -= 1;
    } else if (task === 'PUSH') {
      tempQuestion.index += 1;
    }
    if (updateDirtySlides && !state.dirtySlides.includes(tempQuestion._id)) {
      state.dirtySlides.push(tempQuestion._id);
    }
  }
}

const contentEditorStore = {
  state,
  getters,
  mutations,
  actions,
};

export default contentEditorStore;

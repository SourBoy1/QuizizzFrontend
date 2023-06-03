import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';

import MutationTypes from '~/config/MutationTypes';
import Quiz from '~/models/Quiz';
import { isContentByContactQuizizz } from '~/utils/Utilities';

export const state = () => ({
  quiz: Quiz(),
  tags: [],
  permission: null,
  coAuthors: [],
});

export const getters = {
  currentQuiz(state) {
    return state.quiz;
  },

  isProfane(state) {
    return !!state.quiz.info?.isProfane;
  },

  isWhitelisted(state) {
    return !!state.quiz.info?.isWhitelisted;
  },

  quizId(state) {
    return state.quiz._id;
  },

  draftQuestions(state) {
    const { draft } = state.quiz;

    if (draft.questionDrafts && draft.questionDrafts.length > 0) {
      return draft.questionDrafts;
    }

    return draft.questions;
  },

  sortedDraftQuestions(state, getters) {
    const questions = filter(getters.draftQuestions, (item) => item.index >= 0);

    return sortBy(questions, (item) => item.index);
  },

  publishedQuestions(state) {
    return state.quiz.info.questions;
  },

  permissions(state) {
    return state.permission;
  },

  quizName(state) {
    if (state.quiz.hasDraftVersion) {
      return state.quiz.draft.name;
    }

    return state.quiz.info.name;
  },

  quizType(state) {
    return state.quiz.type;
  },

  quizPlays(state) {
    return state.quiz.stats.played;
  },

  quizCreatedBy(state) {
    return state.quiz.createdBy;
  },

  isQuizPremium(state, getters) {
    const currentQuizCreatorId = get(getters, 'currentQuiz.createdBy.id', '');

    if (isContentByContactQuizizz(currentQuizCreatorId)) {
      return false;
    }

    return state.quiz.isPremium;
  },

  quizSubjects(state) {
    if (state.quiz.hasDraftVersion) {
      return state.quiz.draft.subjects;
    }

    return state.quiz.info.subjects;
  },

  quizGrades(state) {
    if (state.quiz.hasDraftVersion) {
      return state.quiz.draft.grade;
    }

    return state.quiz.info.grade;
  },

  quizTopics(state) {
    if (state.quiz.hasDraftVersion) {
      return state.quiz.draft.topics;
    }

    return state.quiz.info.topics;
  },

  tags(state) {
    return state.tags;
  },

  hasPublicAccess(state) {
    if (state.quiz.hasDraftVersion) {
      return state.quiz.draft.visibility;
    }

    return state.quiz.info.visibility;
  },

  coAuthors(state) {
    return state.coAuthors;
  },

  tagIds(state) {
    return state.quiz.tagIds;
  },

  getTheme: (state, getters) => (questionId) => {
    const questionDraft = state.quiz.info.questions.find((question) => question._id === questionId);
    if (!questionDraft) {
      return;
    }
    return questionDraft.structure.theme;
  },

  quizLanguage(state) {
    if (state.quiz.hasDraftVersion) {
      return state.quiz.draft.lang;
    }

    return state.quiz.info.lang;
  },

  isPublicQuiz(state) {
    return state.quiz.info.visibility;
  },

  quizCreatedAt(state) {
    return state.quiz.createdAt;
  },
};

export const mutations = {
  [MutationTypes.currentQuiz.SET_QUIZ](state, quiz) {
    state.quiz = Quiz(quiz);
  },

  [MutationTypes.currentQuiz.SET_QUIZ_TAGS](state, tags) {
    state.quiz.tagIds = tags;
  },

  [MutationTypes.currentQuiz.SET_PUBLISHED_QUIZ_META](state, { key, value }) {
    state.quiz.info[key] = value;
  },

  [MutationTypes.currentQuiz.SET_DRAFT_QUIZ_META](state, { key, value }) {
    state.quiz.draft[key] = value;
  },

  [MutationTypes.currentQuiz.SET_PERMISSIONS](state, permission) {
    state.permission = permission;
  },

  [MutationTypes.currentQuiz.SET_COAUTHORS](state, authors) {
    state.coAuthors = authors;
  },

  [MutationTypes.currentQuiz.SET_QUIZ_VISIBILITY](state, visibility) {
    state.quiz.info.visibility = visibility;
  },

  [MutationTypes.currentQuiz.UPDATE_QUESTION](state, { question, id }) {
    const currentQuestion = state.quiz.info.questions.find((item) => item._id === id);

    Object.assign(currentQuestion, question);
  },

  [MutationTypes.currentQuiz.SET_IS_TAGGED](state, isTagged) {
    state.quiz.isTagged = isTagged;
  },
  [MutationTypes.currentQuiz.RESET_QUIZ](state) {
    state.quiz = Quiz();
  },
};

export const actions = {
  setQuiz({ commit }, quiz) {
    commit(MutationTypes.currentQuiz.SET_QUIZ, quiz);
  },

  resetQuiz({ commit }) {
    commit(MutationTypes.currentQuiz.RESET_QUIZ);
  },

  setQuizTags({ commit }, tags) {
    commit(MutationTypes.currentQuiz.SET_QUIZ_TAGS, tags);
  },

  setPublishedQuizMeta({ commit }, name) {
    commit(MutationTypes.currentQuiz.SET_PUBLISHED_QUIZ_META, name);
  },

  setDraftQuizMeta({ commit }, name) {
    commit(MutationTypes.currentQuiz.SET_DRAFT_QUIZ_META, name);
  },

  setPermissions({ commit }, permissions) {
    commit(MutationTypes.currentQuiz.SET_PERMISSIONS, permissions);
  },

  setCoAuthors({ commit }, authors) {
    commit(MutationTypes.currentQuiz.SET_COAUTHORS, authors);
  },

  setQuizVisibililty({ commit }, visibility) {
    commit(MutationTypes.currentQuiz.SET_QUIZ_VISIBILITY, visibility);
  },

  updateQuestion({ commit }, payload) {
    commit(MutationTypes.currentQuiz.UPDATE_QUESTION, payload);
  },

  setIsTagged({ commit }, isTagged) {
    commit(MutationTypes.currentQuiz.SET_IS_TAGGED, isTagged);
  },
};

const currentQuizStore = {
  state,
  getters,
  mutations,
  actions,
};

export default currentQuizStore;

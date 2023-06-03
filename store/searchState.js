/**
 * Handles the search page entirely
 * Set filters using mutations anywhere in the UI and it will trigger search
 *
 * ! The initial filter values are declared here
 */
import isEmpty from 'lodash/isEmpty';
import MutationTypes from '~/config/MutationTypes';

export const state = () => ({
  term: '',
  filters: {
    contentTypes: ['quiz', 'presentation'],
  },
  sortBy: { key: '_score', order: 'desc' },
  quizIdsTagged: {},
  source: null,
  mathStandards: {
    state: false,
    grade: false,
    selectedTerm: false,
  },
});

export const getters = {
  searchTerm(state) {
    return state.term;
  },

  activeFilters(state) {
    return state.filters;
  },

  activeSortKey(state) {
    return state.sortBy;
  },

  taggedQuizIds(state) {
    return state.quizIdsTagged;
  },

  searchSource(state) {
    return state.source;
  },

  mathStandards(state) {
    return state.mathStandards;
  },

};

export const actions = {
  setSearchTerm({ commit }, term) {
    commit(MutationTypes.searchState.SET_SEARCH_TERM, term);
  },

  setFilterTerm({ commit }, { term, value }) {
    commit(MutationTypes.searchState.SET_FILTER_TERM, { term, value });
  },

  setSortKey({ commit }, sortBy) {
    commit(MutationTypes.searchState.SET_SORT_KEY, sortBy);
  },

  setAllFilters({ commit, state }, filters) {
    commit(MutationTypes.searchState.SET_ALL_FILTERS, filters);
  },

  resetFilters({ commit }, filters) {
    commit(MutationTypes.searchState.RESET_FILTERS, filters);
  },

  tagQuizId({ commit }, { quizId, isTagged }) {
    commit(MutationTypes.searchState.TAG_QUIZ_ID, { quizId, isTagged });
  },

  setSearchSource({ commit }, source) {
    commit(MutationTypes.searchState.SET_SEARCH_SOURCE, source);
  },

  setMathStandards({ commit }, mathStandards) {
    commit(MutationTypes.searchState.SET_MATH_STANDARDS, mathStandards);
  },
};

export const mutations = {
  [MutationTypes.searchState.SET_SEARCH_TERM](state, term) {
    state.term = term;
  },

  [MutationTypes.searchState.SET_FILTER_TERM](state, { term, value }) {
    if (isEmpty(value)) {
      const filters = { ...state.filters };
      delete filters[term];
      state.filters = filters;
      return;
    }
    state.filters[term] = value;
  },

  [MutationTypes.searchState.SET_ALL_FILTERS](state, filters) {
    state.filters = { ...state.filters, ...filters };
  },

  [MutationTypes.searchState.RESET_FILTERS](state, filters) {
    state.filters = filters;
  },

  [MutationTypes.searchState.SET_SORT_KEY](state, sortBy) {
    state.sortBy = sortBy;
  },

  [MutationTypes.searchState.TAG_QUIZ_ID](state, { quizId, isTagged = false }) {
    const incrementFactor = isTagged ? 1 : -1;
    state.quizIdsTagged[quizId] = (state.quizIdsTagged[quizId] ?? 0) + incrementFactor;
  },

  [MutationTypes.searchState.SET_SEARCH_SOURCE](state, source) {
    state.source = source;
  },

  [MutationTypes.searchState.SET_MATH_STANDARDS](state, mathStandards) {
    state.mathStandards = { ...state.mathStandards, ...mathStandards };
  },
};

const searchState = {
  state,
  getters,
  mutations,
  actions,
};

export default searchState;

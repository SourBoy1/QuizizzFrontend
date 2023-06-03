import cloneDeep from 'lodash/cloneDeep';
import has from 'lodash/has';

import MutationTypes from '~/config/MutationTypes';

const getDefaultState = () => ({
  currentState: null,

  isNextLoading: false,
  nextState: null,
  hasNextState: false,
  prevState: null,
  hasPrevState: false,

  isFinalLoading: false,
  isFinalState: false,

  orgDetails: null,
  subscriptionDetails: null,
  accountDetails: null,

  orgType: null,
  orgMetaData: null,
  hierarchyData: null,
  skipHierarchy: false,
});

const defaultState = getDefaultState();

export const state = () => cloneDeep(defaultState);

export const getters = {
  hasNextState(state) {
    return state.hasNextState;
  },

  hasPrevState(state) {
    return state.hasPrevState;
  },

  nextState(state) {
    return state.nextState;
  },

  isNextLoading(state) {
    return state.isNextLoading;
  },

  prevState(state) {
    return state.prevState;
  },

  currentState(state) {
    return state.currentState;
  },

  isFinalState(state) {
    return state.isFinalState;
  },

  isFinalLoading(state) {
    return state.isFinalLoading;
  },

  orgDetails(state) {
    return state.orgDetails;
  },

  subscriptionDetails(state) {
    return state.subscriptionDetails;
  },

  subscriptionID(state) {
    return state.subscriptionID;
  },

  accountDetails(state) {
    return state.accountDetails;
  },

  orgType(state) {
    return state.orgType;
  },

  orgMetaData(state) {
    return state.orgMetaData;
  },

  hierarchyData(state) {
    return state.hierarchyData;
  },
  skipHierarchy(state) {
    return state.skipHierarchy;
  },
};

export const mutations = {
  [MutationTypes.orgDashboard.SET_PREV_STATE](state, payload) {
    state.hasPrevState = payload.hasPrevState;
    if (!has(payload, 'prevState')) {
      state.prevState = null;
      return;
    }
    state.prevState = payload.prevState;
  },

  [MutationTypes.orgDashboard.SET_NEXT_STATE](state, payload) {
    state.hasNextState = payload.hasNextState;
    if (!has(payload, 'nextState')) {
      state.nextState = null;
      return;
    }
    state.nextState = payload.nextState;
  },

  [MutationTypes.orgDashboard.SET_FINAL_STATE](state, isFinal) {
    state.isFinalState = isFinal;
  },

  [MutationTypes.orgDashboard.SET_CURRENT_STATE](state, currentState) {
    state.currentState = currentState;
  },

  setFinalLoading(state, loading) {
    state.isFinalLoading = loading;
  },

  setNextLoading(state, loading) {
    state.isNextLoading = loading;
  },

  setOrgDetails(state, payload) {
    state.orgDetails = payload;
  },

  setSubscriptionDetails(state, payload) {
    state.subscriptionDetails = payload;
  },

  setAccountDetails(state, payload) {
    state.accountDetails = payload;
  },

  setOrgType(state, payload) {
    state.orgType = payload;
  },

  setHierarchyData(state, payload) {
    state.hierarchyData = payload;
  },

  setOrgMetaData(state, payload) {
    state.orgMetaData = { ...state.orgMetaData, ...payload };
  },

  resetOrgStore(state) {
    Object.assign(state, getDefaultState());
  },

  setSkipHierarchy(state, payload) {
    state.skipHierarchy = payload;
  },
};

export const actions = {
  setPrevState({ commit }, payload) {
    commit(MutationTypes.orgDashboard.SET_PREV_STATE, payload);
  },

  setNextState({ commit }, payload) {
    commit(MutationTypes.orgDashboard.SET_NEXT_STATE, payload);
  },

  setFinalState({ commit }, payload) {
    commit(MutationTypes.orgDashboard.SET_FINAL_STATE, payload);
  },

  setCurrentState({ commit }, currentState) {
    commit(MutationTypes.orgDashboard.SET_CURRENT_STATE, currentState);
  },

  setFinalLoading({ commit }, loading) {
    commit('setFinalLoading', loading);
  },

  setNextLoading({ commit }, loading) {
    commit('setNextLoading', loading);
  },

  setOrgDetails({ commit }, payload) {
    commit('setOrgDetails', payload);
  },

  setSubscriptionDetails({ commit }, payload) {
    commit('setSubscriptionDetails', payload);
  },

  setAccountDetails({ commit }, payload) {
    commit('setAccountDetails', payload);
  },

  setOrgType({ commit }, payload) {
    commit('setOrgType', payload);
  },

  setHierarchyData({ commit }, payload) {
    commit('setHierarchyData', payload);
  },

  setOrgMetaData({ commit }, payload) {
    commit('setOrgMetaData', payload);
  },

  resetOrgStore({ commit }) {
    commit('resetOrgStore');
  },

  setSkipHierarchy({ commit }, payload) {
    commit('setSkipHierarchy', payload);
  },
};

const orgDashboard = {
  state,
  getters,
  mutations,
  actions,
};

export default orgDashboard;

import ObjectId from 'bson-objectid';

import breadcrumb from '~/utils/breadcrumb';

export const state = () => ({
  analyticsData: [],
  enrichmentData: {},
});

export const getters = {
  read(state) {
    return state.analyticsData;
  },
  enrichmentData(state) {
    return state.enrichmentData;
  },
  breadcrumbs: (state) => () => ({
    mutations: breadcrumb().getMutations(),
    actions: breadcrumb().getActions(),
    breadcrumbs: breadcrumb().getBreadcrumbs(),
  }),
};

export const mutations = {
  setAnalyticsData(state, payload) {
    const { analyticsData } = { ...state };
    const newArray = [payload, ...(analyticsData.slice(0, 40))];
    state.analyticsData = newArray;
  },
  clearAnalyticsData(state) {
    state.analyticsData = [];
  },
  addReplaceEnrichmentData(state, payload) {
    state.enrichmentData[payload.key] = payload.value;
  },
  removeEnrichmentData(state, payload) {
    delete state.enrichmentData[payload];
  },
};

export const actions = {
  setAnalyticsData({ commit }, payload) {
    commit('setAnalyticsData', payload);
  },
  clearAnalyticsData({ commit }) {
    commit('clearAnalyticsData');
  },
  // Use this when we want to keep a data point available across multiple events. Whatever key-value is added in this map, will be sent with each event fired after the data is set till the data point is removed from map using remove enrichment call.
  addReplaceEnrichmentData({ commit }, payload) {
    commit('addReplaceEnrichmentData', payload);
  },
  removeEnrichmentData({ commit }, payload) {
    commit('removeEnrichmentData', payload);
  },
  // This acts as a local session id, to help join all events fired after the question editor is opened, till it is closed. This is not foolproof, for the multi-tabs, as this is data being saved in client. For that fix such an enrichment will need to be done in user session in the Backend.
  addQuestionInstanceEnrichmentData({ commit }) {
    commit('addReplaceEnrichmentData', { key: 'question_instance', value: (new ObjectId()).toString() });
  },
  removeQuestionInstanceEnrichmentData({ commit }) {
    commit('removeEnrichmentData', 'question_instance');
  },

  addBreadcrumb({ commit }, payload) {
    breadcrumb().addBreadcrumb(payload);
  },
};

const analyticsManagerStore = {
  state,
  getters,
  mutations,
  actions,
};

export default analyticsManagerStore;

import i18n from '~/services/i18n';
import featureFlags from '~/services/FeatureFlagsService.js';
import Constants from '~/config/Constants';

export const state = function () {
  return {
    plan: {},
    plans: [],
  };
};

export const getters = {
  trialDaysAllowed(state) { return state.plan?.trial?.days || 0; },
  isEligibleForTrial(_state, getters) {
    return getters.trialDaysAllowed > 0;
  },
  plan(state) {
    return state.plan || {};
  },
  planPrice(_state, getters) {
    if (getters.planPriceCents) {
      return getters.planPriceDollars + getters.planPriceCents / 100;
    }

    return getters.planPriceDollars;
  },
  planPriceCents(state) {
    return state.plan?.amountLabel?.cents || 0;
  },
  planPriceDollars(state) {
    return state.plan?.amountLabel?.dollor || 0;
  },
  superUpgradeText(_state, getters) {
    if (featureFlags().isEnabled(Constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN)) {
      return i18n('Upgrade now');
    }
    if (getters.isEligibleForTrial) {
      return i18n('Get free Super trial');
    }
    return i18n('Upgrade your Plan');
  },
};

export const mutations = {
  SET_PLAN(state, plan) {
    state.plan = plan;
  },
  SET_PLANS(state, plans) {
    state.plans = plans;
  },
};

export const actions = {
  updatePlans({ commit }, { plan, plans }) {
    commit('SET_PLAN', plan);
    commit('SET_PLANS', plans);
  },
};

const productStore = {
  state,
  getters,
  mutations,
  actions,
};

export default productStore;

import MutationTypes from '~/config/MutationTypes';

import UserService from '~/services/UserService';

export const state = () => ({
  userTags: [],
  referralCampaigns: [],
  recommendationMeta: null,
});

export const getters = {
  userTags(state) {
    return state.userTags;
  },
  userType(_state, _getters, rootState, _rootGetters) {
    const user = new UserService(rootState.user);

    if (user.isSuper) {
      return 'super';
    } if (user.isPartOfAnOrganization) {
      return 'snd';
    } if (user.isCorporate) {
      return 'corporate';
    } if (!user.isLoggedIn) {
      return 'non-logged-in';
    }
    return 'unknown';
  },
  referralCampaigns(state) {
    return state.referralCampaigns;
  },
  recommendationMeta(state) {
    return state.recommendationMeta;
  },
};

export const mutations = {
  [MutationTypes.currentUser.SET_USER_TAGS](state, userTags) {
    state.userTags = userTags;
  },

  [MutationTypes.currentUser.SET_REFERRAL_CAMPAIGNS](state, userCampaigns) {
    state.referralCampaigns = userCampaigns;
  },

  [MutationTypes.currentUser.SET_RECOMMENDATION_META](state, recommendationMeta) {
    state.recommendationMeta = recommendationMeta;
  },
};

export const actions = {
  setUserTags({ commit }, userTags) {
    commit(MutationTypes.currentUser.SET_USER_TAGS, userTags);
  },

  setReferralCampaigns({ commit }, campaigns) {
    commit(MutationTypes.currentUser.SET_REFERRAL_CAMPAIGNS, campaigns);
  },

  setRecommendationMeta({ commit }, recommendationMeta) {
    commit(MutationTypes.currentUser.SET_RECOMMENDATION_META, recommendationMeta);
  },
};

const currentUserStore = {
  state,
  getters,
  mutations,
  actions,
};

export default currentUserStore;

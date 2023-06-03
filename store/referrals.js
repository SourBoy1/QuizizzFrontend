import { isReferralPeriodExpired } from '~/utils/ReferralUtils';

export const state = () => ({
  referralPeriodExpired: isReferralPeriodExpired(),
});

export const getters = {
  shouldShowReferralCards(referralStoreState, referralStoreGetters, rootState, rootGetters) {
    const country = rootGetters['root/user']?.country || rootGetters['root/serverData']?.requestCountry;
    return (country !== 'US') || !referralStoreState.referralPeriodExpired;
  },
};

export const mutations = {};

export const actions = {};

export default {
  state,
  getters,
  mutations,
  actions,
};

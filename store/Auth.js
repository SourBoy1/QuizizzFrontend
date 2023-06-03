export const state = () => ({
  email: '',
  phoneNumber: '',
  place: '',
  isCommsOptedIn: true,
});

export const getters = {
  email(state) {
    return state.email;
  },

  place(state) {
    return state.place;
  },

  phoneNumber(state) {
    return state.phoneNumber;
  },

  isCommsOptedIn(pustate) {
    return state.isCommsOptedIn;
  },
};

export const mutations = {
  setAuthEmail(state, value) {
    state.email = value;
  },
  setAuthPlace(state, value) {
    state.place = value;
  },
  setPhoneNumber(state, value) {
    state.phoneNumber = value;
  },
  setIsCommsOptedIn(state, value) {
    state.isCommsOptedIn = value;
  },
};

export const actions = {
  setAuthEmail({ commit }, email) {
    commit('setAuthEmail', email);
  },
  setAuthPlace({ commit }, place) {
    commit('setAuthPlace', place);
  },
  setPhoneNumber({ commit }, phoneNumber) {
    commit('setPhoneNumber', phoneNumber);
  },
  setIsCommsOptedIn({ commit }, isCommsOptedIn) {
    commit('setIsCommsOptedIn', isCommsOptedIn);
  },
};

const authStore = {
  state,
  getters,
  mutations,
  actions,
};

export default authStore;

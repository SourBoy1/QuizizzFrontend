import MutationTypes from '~/config/MutationTypes';

export const state = () => ({
  dataType: '',
  content: '',
});

export const getters = {
  read(state) {
    return state;
  },
};

export const mutations = {
  [MutationTypes.clipboard.WRITE](state, payload) {
    state.dataType = payload.dataType;
    state.content = payload.content;
  },
};

export const actions = {
  write({ commit }, { dataType, content }) {
    commit(MutationTypes.clipboard.WRITE, {
      dataType,
      content,
    });
  },
  clear({ commit }) {
    commit(MutationTypes.clipboard.WRITE, {
      dataType: '',
      content: '',
    });
  },
};

const clipboardStore = {
  state,
  getters,
  mutations,
  actions,
};

export default clipboardStore;

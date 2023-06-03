import MutationTypes from '~/config/MutationTypes';

export const state = () => ({
  rosters: [],
  currentRoster: null,
});

export const getters = {
  currentRoster(state) {
    return state.currentRoster;
  },
  rosters(state) {
    return state.rosters;
  },
};

export const mutations = {
  [MutationTypes.PapperModeRoster.SET_CURRENT_ROSTER](state, roster) {
    state.currentRoster = roster;
  },
  [MutationTypes.PapperModeRoster.SET_ROSTERS](state, rosters) {
    state.rosters = rosters;
  },
  [MutationTypes.PapperModeRoster.UPDATE_ROSTERS](state, payload) {
    if (payload.updated) {
      state.rosters = [...state.rosters].map((roster) => {
        if (roster.id === payload.data.id) {
          return { ...roster, ...payload.data };
        }
        return roster;
      });
    } else {
      state.rosters = [...state.rosters, payload.data];
    }
  },
  [MutationTypes.PapperModeRoster.REMOVE_ROSTER](state, rosterId) {
    state.rosters = state.rosters.filter((roster) => roster.id !== rosterId);
  },
  [MutationTypes.PapperModeRoster.UPDATE_ROSTER](state, payload) {
    if (payload.rosterId) {
      const { rosterId, ...rest } = payload;
      state.rosters = state.rosters.map((roster) => {
        if (roster.id === rosterId) {
          return { ...roster, ...rest };
        }
        return roster;
      });
    }
  },
};

export const actions = {
  setRoster({ commit }, roster) {
    commit(MutationTypes.PapperModeRoster.SET_CURRENT_ROSTER, roster);
  },

  setAllRosters({ commit }, rosters) {
    commit(MutationTypes.PapperModeRoster.SET_ROSTERS, rosters);
  },

  updateRoster({ commit }, payload) {
    commit(MutationTypes.PapperModeRoster.UPDATE_ROSTER, payload);
  },

  updateRosters({ commit }, payload) {
    commit(MutationTypes.PapperModeRoster.UPDATE_ROSTERS, payload);
  },

  removeRoster({ commit }, rosterId) {
    commit(MutationTypes.PapperModeRoster.REMOVE_ROSTER, rosterId);
  },
};

const paperModeRoster = {
  state,
  getters,
  mutations,
  actions,
};

export default paperModeRoster;

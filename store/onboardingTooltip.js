import isEmpty from 'lodash/isEmpty';

export const state = () => ({
  tooltips: [],
  activeTooltip: null,
  counter: 0,
  total: 0,
});

export const mutations = {
  pushTooltipToQueue(state, value) {
    if (!isEmpty(value)) {
      state.tooltips = state.tooltips.concat([value]);
    }
  },

  deleteTooltipFromQueue(state, tooltipId) {
    state.tooltips = state.tooltips.filter((tooltip) => tooltip.id !== tooltipId);
  },

  setActiveTooltip(state, tooltip = null) {
    if (!isEmpty(tooltip)) {
      state.activeTooltip = { ...tooltip };
    } else {
      state.activeTooltip = null;
    }
  },

  incrementCounter(state) {
    state.counter += 1;
  },

  setTotalCount(state, value) {
    state.total = value;
  },

  resetCounter(state) {
    state.counter = 0;
  },
};

export const actions = {
  addTooltip({ commit }, value) {
    const tooltip = { ...value };

    if (!value.order) {
      tooltip.order = 0;
    }

    commit('pushTooltipToQueue', tooltip);
  },

  show({ commit, state }, name = '') {
    if (state.activeTooltip && state.activeTooltip.name !== name) {
      return;
    }

    // Filter and get sorted tooltip list (sorted by order)
    const tooltips = state.tooltips.filter((tooltip) => tooltip.name === name).sort((a, b) => a.order - b.order);
    if (tooltips.length === 0) {
      commit('resetCounter');
      commit('setTotalCount', 0);
      return;
    }
    const tooltipToShow = tooltips.shift();
    commit('setActiveTooltip', tooltipToShow);
    commit('deleteTooltipFromQueue', tooltipToShow.id);

    // If this is first show call in a flow, set value of total
    if (state.total === 0) {
      commit('setTotalCount', tooltips.length + 1);
    }

    commit('incrementCounter');
  },

  showNext({ commit, state, dispatch }) {
    const currentActive = { ...state.activeTooltip };

    if (isEmpty(currentActive)) {
      commit('resetCounter');
      commit('setTotalCount', 0);
      return;
    }

    commit('setActiveTooltip');
    dispatch('show', currentActive.name);
  },

  clearActive({ commit }) {
    commit('setActiveTooltip');
  },
};

const onboardingTooltipStore = {
  state,
  mutations,
  actions,
};

export default onboardingTooltipStore;

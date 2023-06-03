import cloneDeep from 'lodash/cloneDeep';

import StringUtils from '~/utils/StringUtils.js';

import MutationTypes from '~/config/MutationTypes';
import salesConstants from '~/config/Sales';

const { planTypes } = salesConstants;

const defaultState = {
  pickedPlanType: '',
  newSubStepsCompleted: false,
  orgData: {},
  newSubStepIndex: 0,
  paidOrgSelectedTab: '',
};

export const state = () => cloneDeep(defaultState);

export const getters = {
  pickedPlanType(state) {
    return state.pickedPlanType;
  },

  newSubStepsCompleted(state) {
    return state.newSubStepsCompleted;
  },

  newSubStepIndex(state) {
    return state.newSubStepIndex;
  },

  orgDetails(state) {
    return state.orgData;
  },

  isStep2(state) {
    return state.newSubStepIndex === 1;
  },

  isDistrict(state) {
    return [planTypes['K-12'].DISTRICT].includes(state.pickedPlanType);
  },

  isDepartment(state) {
    return [planTypes['K-12'].DEPARTMENT].includes(state.pickedPlanType);
  },

  isSchoolOrDepartment(state) {
    return [planTypes['K-12'].SCHOOL, planTypes['K-12'].DEPARTMENT].includes(state.pickedPlanType);
  },

  isInternational(state) {
    return state.pickedPlanType === planTypes['K-12'].INTERNATIONAL;
  },

  isMisc(state) {
    return state.pickedPlanType === planTypes.Others.MISC;
  },

  isInternationalOrMisc(state) {
    return [planTypes['K-12'].INTERNATIONAL, planTypes.Others.MISC].includes(state.pickedPlanType);
  },

  orgTypeToDisplayForStep2(state, getters) {
    let orgTypeToDisplay = getters.pickedPlanType;
    if (getters.isSchoolOrDepartment) {
      orgTypeToDisplay = planTypes['K-12'].DISTRICT;
    } else if (getters.isDistrict) {
      orgTypeToDisplay = planTypes['K-12'].SCHOOL;
    }
    return StringUtils.toSentenceCase(orgTypeToDisplay);
  },

  orgTypeToDisplayForStep1(state, getters) {
    let orgTypeToDisplay = getters.pickedPlanType;
    if (getters.isDepartment || getters.isInternational) {
      orgTypeToDisplay = planTypes['K-12'].SCHOOL;
    } else if (getters.isMisc) {
      orgTypeToDisplay = 'Org';
    }
    return StringUtils.toSentenceCase(orgTypeToDisplay);
  },

  orgTypeToDisplay(state, getters) {
    if (getters.isStep2) {
      return getters.orgTypeToDisplayForStep2;
    }

    let orgTypeToDisplay = getters.pickedPlanType;
    if (getters.isDepartment || getters.isInternational) {
      orgTypeToDisplay = planTypes['K-12'].SCHOOL;
    } else if (getters.isMisc) {
      orgTypeToDisplay = 'Org';
    }
    return StringUtils.toSentenceCase(orgTypeToDisplay);
  },

  paidOrgSelectedTab(state) {
    return state.paidOrgSelectedTab;
  },
};

export const mutations = {
  [MutationTypes.sales.PICK_PLAN_TYPE](state, planType) {
    state.pickedPlanType = planType;
  },
  [MutationTypes.sales.SET_NEW_SUB_STEPS_COMPLETED](state, newSubStepsCompleted) {
    state.newSubStepsCompleted = newSubStepsCompleted;
  },
  [MutationTypes.sales.SET_ORG_DATA](state, orgData) {
    state.orgData = orgData;
  },
  [MutationTypes.sales.SET_NEW_SUB_STEPS_INDEX](state, newSubStepIndex) {
    state.newSubStepIndex = newSubStepIndex;
  },
  [MutationTypes.sales.RESET_NEW_SUB_FLOW](state) {
    /* eslint-disable-next-line */
    // state = defaultState;
    for (const key in state) {
      state[key] = defaultState[key];
    }
  },
  [MutationTypes.sales.SET_SELECTED_TAB](state, paidOrgSelectedTab) {
    /* eslint-disable-next-line */
    // state = defaultState;
    state.paidOrgSelectedTab = paidOrgSelectedTab;
  },
};

export const actions = {
  pickPlanType({ commit }, planType) {
    commit(MutationTypes.sales.PICK_PLAN_TYPE, planType);
  },
  setOrgDetails({ commit }, orgData) {
    commit(MutationTypes.sales.SET_ORG_DATA, orgData);
  },
  setNewSubStepsCompleted({ commit }, newSubStepsCompleted) {
    commit(MutationTypes.sales.SET_NEW_SUB_STEPS_COMPLETED, newSubStepsCompleted);
  },
  setNewSubStepIndex({ commit }, newSubStepIndex) {
    commit(MutationTypes.sales.SET_NEW_SUB_STEPS_INDEX, newSubStepIndex);
  },
  resetNewSubFlow({ commit }) {
    commit(MutationTypes.sales.RESET_NEW_SUB_FLOW);
  },
  setSelectedTab({ commit }, paidOrgSelectedTab) {
    commit(MutationTypes.sales.SET_SELECTED_TAB, paidOrgSelectedTab);
  },
};

const salesStore = {
  state,
  getters,
  mutations,
  actions,
};

export default salesStore;

import findIndex from 'lodash/findIndex';
import sortBy from 'lodash/sortBy';
import filter from 'lodash/filter';

import MutationTypes from '~/config/MutationTypes';
import ClassModel from '~/models/ClassModel';
import Classes from '~/models/Classes';

export const state = () => ({
  classes: Classes(),
});

export const getters = {
  classes(state) {
    return state.classes;
  },
  archivedCount(state) {
    return state.classes.archivedCount;
  },
  getClassById: (state) => (id) => state.classes.groups.find((cls) => cls._id === id),
};

export const mutations = {
  [MutationTypes.classes.SET_CLASSES](state, classes) {
    state.classes = Classes(classes);
  },

  [MutationTypes.classes.SET_CLASS](state, classObj) {
    const index = findIndex(state.classes.groups, (cls) => cls._id === classObj.group._id);
    const cls = { ...classObj.group, users: classObj.users };
    if (index < 0) {
      state.classes.groups.push(ClassModel(cls));
    } else {
      state.classes.groups[index] = ClassModel(cls);
    }
  },

  [MutationTypes.classes.REMOVE_CLASS_BY_ID](state, id) {
    state.classes.groups = filter(state.classes.groups, (cls) => cls._id !== id);
  },

  [MutationTypes.classes.ADD_CLASS](state, classObj) {
    state.classes.groups.push(classObj);
  },

  [MutationTypes.classes.ARCHIVE_CLASS](state) {
    state.classes.archivedCount += 1;
  },

  [MutationTypes.classes.SORT_CLASSES](state) {
    state.classes.groups = sortBy(state.classes.groups, (cls) => cls.name.toLowerCase());
  },

  [MutationTypes.classes.UPDATE_MEMBERS](state, classObj) {
    const index = findIndex(state.classes.groups, (cls) => cls._id === classObj._id);
    const cls = ClassModel(classObj);
    const { users } = state.classes.groups[index];

    cls.members.forEach((member) => {
      if (!users[member.userId]) {
        return;
      }
      member.local = users[member.userId].local || {};
      member.google = users[member.userId].google || {};
      member.canvas = users[member.userId].canvas || {};
      member.schoology = users[member.userId].schoology || {};
      member.isUnderAge = users[member.userId].student && users[member.userId].student.underAge;
      member.deactivated = users[member.userId].deactivated;
    });

    state.classes.groups[index].members = cls.members;
    state.classes.groups[index].totalMembers = cls.totalMembers;
  },

  [MutationTypes.classes.ADD_MEMBERS_DATA](state, classes) {
    classes.forEach((classObj) => {
      const { users } = classObj;
      classObj.group.members.forEach((member) => {
        if (!users[member.userId]) {
          return;
        }
        member.local = users[member.userId].local || {};
        member.google = users[member.userId].google || {};
        member.canvas = users[member.userId].canvas || {};
        member.schoology = users[member.userId].schoology || {};
        member.isUnderAge = users[member.userId].student && users[member.userId].student.underAge;
        member.deactivated = users[member.userId].deactivated;
      });
    });
  },

  [MutationTypes.classes.UPDATE_LINK](state, response) {
    const index = findIndex(state.classes.groups, (cls) => cls._id === response.group._id);
    state.classes.groups[index].link = response.group.link;
  },
};

export const actions = {
  setClasses({ commit }, classes) {
    commit(MutationTypes.classes.SET_CLASSES, classes);
    commit(MutationTypes.classes.SORT_CLASSES);
  },

  setClass({ commit }, classObj) {
    commit(MutationTypes.classes.ADD_MEMBERS_DATA, [classObj]);
    commit(MutationTypes.classes.SET_CLASS, classObj);
    commit(MutationTypes.classes.SORT_CLASSES);
  },

  removeClassById({ commit }, id) {
    commit(MutationTypes.classes.REMOVE_CLASS_BY_ID, id);
  },

  addClass({ commit }, classObj) {
    commit(MutationTypes.classes.ADD_CLASS, classObj.group);
    commit(MutationTypes.classes.SORT_CLASSES);
  },

  archiveClass({ commit }, id) {
    commit(MutationTypes.classes.REMOVE_CLASS_BY_ID, id);
    commit(MutationTypes.classes.ARCHIVE_CLASS);
  },

  updateMembers({ commit }, classObj) {
    commit(MutationTypes.classes.UPDATE_MEMBERS, classObj.group);
  },

  removeMembers({ commit }, classObj) {
    commit(MutationTypes.classes.UPDATE_MEMBERS, classObj.group);
  },

  updateLink({ commit }, response) {
    commit(MutationTypes.classes.UPDATE_LINK, response);
  },
};

const classesStore = {
  state,
  getters,
  mutations,
  actions,
};

export default classesStore;

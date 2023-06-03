import MutationTypes from '~/config/MutationTypes';
import Teams from '~/models/Team';
import TeamMemberModel from '~/models/TeamMemberModel';
import TeamModel from '~/models/TeamModel';
import TeamsAPIService from '~/services/apis/TeamsAPIService';

export const state = () => ({
  ...Teams(),
});

export const getters = {
  teams(state) {
    return state.teams;
  },

  getTeamById: (state) => (id) => state.teams.find((team) => team._id === id),

  getTeamMembers: (state) => (id) => {
    const team = state.teams.find((team) => team._id === id);
    if (team?.members) {
      return team.members;
    }

    return [];
  },

  getTeamMemberByUserId: (state) => (teamId, userId) => {
    const team = state.teams.find((team) => team._id === teamId);
    if (team) {
      const member = team.members?.find((member) => member._id === userId);
      return member;
    }

    return null;
  },

  getTeamsInviteLink: (state) => (teamId) => new Promise((resolve) => {
    let triedTimes = 0;
    const MAX_TRIES = 100;
    const tryResolving = () => {
      triedTimes++;
      if (state.teamInviteLinksById[teamId]) {
        resolve(state.teamInviteLinksById[teamId]);
      } else if (triedTimes >= MAX_TRIES) {
        resolve('');
      } else {
        setTimeout(tryResolving, 100);
      }
    };
    tryResolving();
  }),
};

export const mutations = {
  [MutationTypes.teams.SET_TEAMS](state, teams) {
    state.teams = Teams(teams);
  },

  [MutationTypes.teams.SET_TEAM](state, team) {
    const idx = state.teams.findIndex((t) => t._id === team._id);
    if (idx === -1) {
      state.teams.push(TeamModel(team));
    } else {
      state.teams[idx] = TeamModel(team);
    }
  },

  [MutationTypes.teams.SET_MEMBERS](state, { teamId, members, invitedEmails = [] }) {
    const teamIdx = state.teams.findIndex((t) => t._id === teamId);

    if (teamIdx === -1) {
      return;
    }

    state.teams[teamIdx] = Object.assign(state.teams[teamIdx], { members: members.map((member) => TeamMemberModel(member)), invitedEmails });
  },

  [MutationTypes.teams.DELETE_TEAM](state, teamId) {
    state.teams = state.teams.filter((team) => team._id !== teamId);
  },

  [MutationTypes.teams.SET_SHAREABLE_LINK](state, val) {
    state.teamInviteLinksById = { ...state.teamInviteLinksById, [val.teamId]: val.link };
  },
  [MutationTypes.teams.DECREMENT_TEAM_CONTENT_COUNT](state, teamId) {
    const teamIndex = state.teams.findIndex((team) => team._id === teamId);
    const team = state.teams[teamIndex];
    state.teams[teamIndex] = Object.assign(team, { contentMetrics: { sharedQuizzes: Math.max(team.contentMetrics.sharedQuizzes - 1, 0) } });
  },
};

export const actions = {
  setTeams({ commit }, teams) {
    commit(MutationTypes.teams.SET_TEAMS, teams);
  },

  setTeam({ commit }, team) {
    commit(MutationTypes.teams.SET_TEAM, team);
  },

  setTeamMembers({ commit }, { teamId, members, invitedEmails = [] }) {
    commit(MutationTypes.teams.SET_MEMBERS, { teamId, members, invitedEmails });
  },

  setTeamName({ commit, getters }, { teamId, teamName }) {
    const team = { ...getters.getTeamById(teamId) };
    team.name = teamName;

    commit(MutationTypes.teams.SET_TEAM, team);
  },

  addTeamMembers({ commit, getters }, { teamId, members }) {
    const team = { ...getters.getTeamById(teamId) };
    const teamMembers = [...team.members, ...members];

    commit(MutationTypes.teams.SET_MEMBERS, { teamId, members: teamMembers });
  },

  deleteTeam({ commit }, teamId) {
    commit(MutationTypes.teams.DELETE_TEAM, teamId);
  },

  async getInviteLinkByTeamId({ commit }, { teamId, inviterOrgIds }) {
    if (!teamId) { return; }
    const response = await TeamsAPIService.getShareableLink({ teamId, inviterOrgIds });
    if (response?.shareableLink) {
      commit(MutationTypes.teams.SET_SHAREABLE_LINK, { teamId, link: response.shareableLink });
    }
  },

  async syncTeamMembers({ dispatch }, teamId) {
    const response = await TeamsAPIService.getTeamMembers(teamId);
    if (response.members || response.invitedEmails) {
      dispatch('setTeamMembers', { teamId, ...response });
    }
  },

  decrementTeamContentCount({ commit }, teamId) {
    commit(MutationTypes.teams.DECREMENT_TEAM_CONTENT_COUNT, teamId);
  },
};

const teamStore = {
  state,
  getters,
  mutations,
  actions,
};

export default teamStore;

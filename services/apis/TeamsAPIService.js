import isNumber from 'lodash/isNumber';
import isEmpty from 'lodash/isEmpty';
import $axios from '../AxiosService.js';
import QLogger from '../QLogger.js';

export default class TeamService {
  static async createTeam(data = { name: `team${+new Date()}` }) {
    try {
      const response = await $axios().post('/team', data);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.createTeam', err);
    }
  }

  static async getUserTeams(quizId) {
    try {
      const response = await $axios().get(`/teams/list${quizId ? `?forQuiz=${quizId}` : ''}`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.getUserTeams', err);
    }
  }

  static async getUserRecommendedDetails() {
    try {
      const response = await $axios().get('/teams/recommend-user-details');
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.getUserRecommendedDetails', err);
    }
  }

  static async getRecommendedUsers(payload) {
    if (!payload.paidOrgIds && !payload.orgIds) { return null; }
    try {
      const response = await $axios().post('/teams/recommend-users?size=6', payload);
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.getRecommendedUsers', err);
    }
  }

  static async addMembersToTeam(teamId, userIds, skipCache = false) {
    try {
      const response = await $axios().put(`/team/${teamId}/members?skipCache=${skipCache}`, {
        userIds,
      });
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.addMembersToTeam', err);
    }
  }

  static async addMembersToTeamV2({ teamId, emailIds, skipCache = false }) {
    try {
      const response = await $axios().put(`/team/v2/${teamId}/members?skipCache=${skipCache}`, {
        emails: emailIds,
      });
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.addMembersToTeamV2', err);
    }
  }

  static async removeMemberFromTeam({ teamId, userId } = {}) {
    try {
      const response = await $axios().delete(`/team/${teamId}/member/${userId}`);
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.removeMemberFromTeam', err);
    }
  }

  static async addContentToTeam(teamId, entityId, skipCache = false) {
    try {
      const response = await $axios().put(`/team/${teamId}/content/${entityId}?skipCache=${skipCache}`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.addContentToTeam', err);
      return err.response.data;
    }
  }

  static async removeContentFromTeam({ teamId, entityId } = {}) {
    try {
      if (!teamId || !entityId) { return; }
      const response = await $axios().delete(`/team/${teamId}/content/${entityId}`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.removeContentFromTeam', err);
      return err.response.data;
    }
  }

  static async deleteTeam(teamId) {
    try {
      const response = await $axios().delete(`/team/${teamId}`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.deleteTeam', err);
    }
  }

  static async addContentToManyTeams(teamIds, entityId) {
    try {
      const response = await $axios().put(`/teams/content/${entityId}`, { teamIds });
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at QuizService.addEntityToFolders', err);
    }
  }

  static async getTeamContent(teamId) {
    try {
      const response = await $axios().put(`/team/${teamId}/content`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at QuizService.addEntityToFolders', err);
    }
  }

  static async editTeam(teamId, name) {
    try {
      const response = await $axios().put(`/team/${teamId}`, {
        name,
      });
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.createTeam', err);
    }
  }

  static async getTeamContent_(_pageNumber, filters, cancelToken = null) {
    const PAGE_SIZE = 10;
    const pageNumber = isNumber(_pageNumber) ? _pageNumber : 0;

    const params = {
      from: pageNumber * PAGE_SIZE,
      size: PAGE_SIZE,
      sortKey: filters.sortKey ? filters.sortKey : 'createdAt',
      order: filters.order || 'desc',
      // disables raw serialization of filters
      disabledSerialization: true,
    };

    if (!isEmpty(filters.type)) {
      params.type = filters.type;
    }

    try {
      const config = { params };

      if (cancelToken !== null) {
        config.cancelToken = cancelToken.token;
      }
      const response = await $axios().get(`/team/${filters.teamId}/content`, config);
      return response.data.data;
    } catch (err) {
      QLogger.log('Error at TeamService.getTeamContent', err);

      return null;
    }
  }

  static async getTeamMembers(teamId) {
    try {
      const response = await $axios().get(`/team/${teamId}/members`);
      return response.data.data;
    } catch (err) {
      QLogger.log('Error at TeamService.getTeamMembers', err);

      return [];
    }
  }

  static async deleteTeamMember(teamId, userId) {
    try {
      const response = await $axios().delete(`/team/${teamId}/member/${userId}`);
      return response.data.data;
    } catch (err) {
      QLogger.log('Error at TeamService.deleteTeamMember', err);

      return null;
    }
  }

  static async getShareableLink({ teamId, inviterOrgIds }) {
    try {
      const response = await $axios().get(`/teams/${teamId}/shareableLink`, {
        params: {
          inviterOrgIds,
          // disables raw serialization of filters
          disabledSerialization: true,
        },
      });
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at TeamService.getShareableLink', err);
    }
  }
}

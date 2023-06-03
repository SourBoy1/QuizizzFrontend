import i18n from '~/services/i18n';
import Constants from '~/config/Constants';
import ToastService from '~/services/ToastService';
import UserService from '~/services/UserService';
import $store from '~/services/StoreService';
import QLogger from '../QLogger';
import $axios from '../AxiosService';

export default class ClassAPIService {
  static async getClass(id, mock = false) {
    try {
      const response = await $axios().get(`/group/${id}`, {
        params: {
          mock,
        },
      });
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassAPIService.getClass', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while fetching information about the class!'),
      });
    }
  }

  static async createClass(classDetails) {
    try {
      const response = await $axios().post('/group', classDetails);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.createClass', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while creating class!'),
      });
    }
  }

  static async updateClass(classId, classDetails) {
    try {
      const response = await $axios().put(`/group/${classId}`, classDetails);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.updateClass', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while updating the class!'),
      });
    }
  }

  static async updateMembers(classId, memberDetails) {
    try {
      const response = await $axios().put(`/group/${classId}/members/update`, memberDetails);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.updateMembers', err);
      const user = new UserService($store()?.state.root?.user);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: user.isCorporate ? i18n('Something went wrong while updating members in group!') : i18n('Something went wrong while updating members in class!'),
      });
    }
  }

  static async addMembers(classId, memberDetails) {
    try {
      const response = await $axios().post(`/group/${classId}/members`, memberDetails);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.updateMembers', err);
      const user = new UserService($store()?.state.root?.user);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: user.isCorporate ? i18n('Something went wrong while updating members in group!') : i18n('Something went wrong while updating members in class!'),
      });
    }
  }

  static async addCoTeachers(classId, userIds = []) {
    try {
      const response = await $axios().put('/class/co-teacher', { classId, userIds });
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.addCoTeachers', err);
    }
  }

  static async removeCoTeachers(classId, userIds = []) {
    try {
      const response = await $axios().delete('/class/co-teacher', { data: { classId, userIds } });
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.removeCoTeachers', err);
    }
  }

  static async getCoTeachers(classId, token) {
    try {
      const response = await $axios().get(`/class/${classId}/co-teachers`, { params: { token } });
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.getCoTeachers', err);
    }
  }

  static async removeMembers(classId, memberDetails) {
    try {
      const response = await $axios().put(`/group/${classId}/members/delete`, memberDetails);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.removeMembers', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while removing members from class!'),
      });
    }
  }

  static async generateLink(classId) {
    try {
      const response = await $axios().post(`/group/${classId}/link`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.generateLink', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while generating new link!'),
      });
    }
  }

  static async getStudentsReportOverview(classId, userId) {
    try {
      let link = `/group/${classId}/members/performance`;
      if (userId) {
        link += `?userId=${userId}`;
      }
      const response = await $axios().get(link);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.getStudentsReportOverview', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while fetching reports'),
      });
    }
  }

  static async getStudentReport(studentId, classId, pageNo = '', size = 10, query = { quizIds: [], rangeFilter: { from: null, end: null } }) {
    try {
      let link = encodeURI(`/playerGames/${studentId}?query=&from=${pageNo}&size=${size}&groupIds=["${classId}"]`);
      if (query.quizIds?.length) {
        link += encodeURI(`&filterList={"quizIds": ${JSON.stringify(query.quizIds)}}`);
      }
      if (query.rangeFilter?.start || query.rangeFilter?.end) {
        link += encodeURI(`&rangeFilter={ "from": "${query.rangeFilter.start}", "to": "${query.rangeFilter.end}" }`);
      }
      const response = await $axios().get(link);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.getStudentReport', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while fetching report'),
      });
    }
  }

  static async announceLMS(group, messageFor, quizId, quizName) {
    try {
      const response = await $axios().post('/groups/announce-lms', {
        groupId: group._id, messageFor, quizId, quizName,
      });
      const result = response.data;
      if (result.success) {
        return result;
      }
      return { success: false, groupName: group.name };
    } catch (err) {
      QLogger.log('Error at ClassesAPIService.createClass', err);
      return { success: false, groupName: group.name };
    }
  }
}

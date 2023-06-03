import i18n from '~/services/i18n';
import Constants from '~/config/Constants';
import ToastService from '~/services/ToastService';
import QLogger from '../QLogger';
import $axios from '../AxiosService';

export default class PaperModeGroupAPIService {
  static async getRoster(rosterId) {
    try {
      const response = await $axios().get(`/paper-mode/rosters/${rosterId}`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaperModeGroupAPIService.getRoster', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while fetching information about the group!'),
      });
    }
  }

  static async getAllRosters() {
    try {
      const response = await $axios().get('/paper-mode/rosters');
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaperModeGroupAPIService.getAllRosters', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while fetching information about the groups!'),
      });
    }
  }

  static async createRoster(body = []) {
    try {
      const response = await $axios().post('/paper-mode/rosters', body);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaperModeGroupAPIService.createRoster', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while creating the group!'),
      });
    }
  }

  static async updateRoster(rosterId, body = []) {
    try {
      const response = await $axios().put(`/paper-mode/rosters/${rosterId}`, body);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaperModeGroupAPIService.updateRoster', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while updating the group!'),
      });
    }
  }

  static async deleteRoster(rosterId) {
    try {
      const response = await $axios().delete(`/paper-mode/rosters/${rosterId}`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaperModeGroupAPIService.deleteRoster', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while deleting the group!'),
      });
    }
  }
}

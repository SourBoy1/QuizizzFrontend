import $axios from '../AxiosService.js';
import QLogger from '../QLogger.js';

import CookieService from '../CookieService.js';

export default class UserAPIService {
  static async updateInfo(payload) {
    try {
      const response = await $axios().put('/user/info', payload);
      const result = response.data;

      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false };
    } catch (err) {
      QLogger.log('Error at UserAPIService.updateInfo', err);
      return { success: false, error: err, data: err.response && err.response.data ? err.response.data : {} };
    }
  }

  static async updateUserData(payload) {
    try {
      const response = await $axios().put('/user/updateUserData', payload);
      const result = response.data;

      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false };
    } catch (err) {
      QLogger.log('Error at UserAPIService.updateInfo', err);
      return { success: false, error: err, data: err.response && err.response.data ? err.response.data : {} };
    }
  }

  static async register(payload) {
    try {
      const response = await $axios().post('user/register', payload);
      const result = response.data;

      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false };
    } catch (err) {
      QLogger.log('Error at UserAPIService.register', err);
      return { success: false, error: err };
    }
  }

  static async updateOccupation(payload) {
    try {
      const CSRFToken = CookieService.get('x-csrf-token');

      const response = await $axios().put('/user/occupation', payload, {
        headers: { 'x-csrf-token': CSRFToken },
      });

      const result = response.data;

      return { success: true, data: result.data };
    } catch (err) {
      QLogger.log('Error at UserAPIService.updateOccupation', err);
    }
  }

  static async updateUserEvents(payload) {
    try {
      const response = await $axios().post('/user/events', payload);
      const result = response.data;
      if (result.success) {
        return { success: true, ...result.data };
      }
      return { success: false };
    } catch (err) {
      QLogger.log('Error at UserAPIService.updateUserEvents', err);
      return { success: false, error: err };
    }
  }

  static async getInfo(userId) {
    try {
      const response = await $axios().get(`/user/${userId}`);
      const result = response.data;

      if (result.success) {
        return { success: true, ...result.data };
      }
      return { success: false };
    } catch (err) {
      QLogger.log('Error at UserAPIService.getInfo', err);
      return { success: false, error: err };
    }
  }

  static async setPassword(payload) {
    try {
      const response = await $axios().put('/user/setPassword', payload);
      const result = response.data;

      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false };
    } catch (err) {
      QLogger.log('Error at UserAPIService.setPassword', err);
      return { success: false, error: err };
    }
  }
}

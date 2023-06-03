import $axios from '~/services/AxiosService';

export default class GoogleDriveService {
  static async exportFile({
    token,
    fileId,
    apiKey,
    mimeType = 'application/pdf',
  }) {
    try {
      const response = await $axios().get(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${mimeType}&key=${apiKey}`, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async getFile({
    token,
    fileId,
    apiKey,
  }) {
    try {
      const response = await $axios().get(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async uploadFile({
    file,
    config,
  }) {
    try {
      const response = await $axios().post('https://www.googleapis.com/upload/drive/v3/files?uploadType=media&ignoreDefaultVisibility=true', file, config);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  static async listPermissions(fileId, token, apiKey) {
    try {
      const response = await $axios().get(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?key=${apiKey}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  static async createPermission(fileId, token, apiKey, permission) {
    try {
      const response = await $axios().post(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?key=${apiKey}?transferOwnership=true`, permission, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  static async updatePermission(fileId, token, apiKey, permissionId) {
    try {
      const response = await $axios().patch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${permissionId}?key=${apiKey}?transferOwnership=true`, {
        role: 'writer',
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
}

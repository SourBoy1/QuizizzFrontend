import axios from 'axios';

import QLogger from '../QLogger.js';

export default class GoogleFormsService {
  static async getForm({ token, formId, apiKey }) {
    try {
      const response = await axios.get(`https://forms.googleapis.com/v1/forms/${formId}?key=${apiKey}`, {
        responseType: 'json',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      QLogger.log('Error at GoogleFormsService.getForm', err);
      return {
        success: false,
        error: err.response,
      };
    }
  }
}

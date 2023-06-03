import get from 'lodash/get';
import axios from 'axios';

import { getEnvironmentEnv } from '~/utils/EnvUtils';
import BaseURLS from '~/config/BaseURLs';
import QLogger from '../QLogger';

import LocalStorage from '../LocalStorage';

export default class BootService {
  static async getMetadata() {
    try {
      const baseURL = BaseURLS.API_SERVER[getEnvironmentEnv()];
      const response = await axios(`${baseURL}/_meta/admin-render-meta`);
      const data = get(response, 'data.data');

      return data;
    } catch (err) {
      QLogger.log('Error at BootService.getMetadata', err);
    }
  }

  static createGlobalFunctions() {
    // to support demos for the shared library (for CSM & sales)
    window.setSharedLibConfig = function setSharedLibConfig(orgId, orgType) {
      if (!orgId) {
        return;
      }

      LocalStorage.setItem('overrideOrgId', orgId);

      if (orgType) {
        const lowerCasedOrgType = orgType.toLowerCase();
        LocalStorage.setItem('overrideOrgType', lowerCasedOrgType);
      }

      window.location.reload();
    };
  }
}

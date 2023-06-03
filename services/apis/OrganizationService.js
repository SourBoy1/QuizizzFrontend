import QLogger from '~/services/QLogger';
import $axios from '~/services/AxiosService';

import i18n from '~/services/i18n';
import Constants from '~/config/Constants';
import ToastService from '~/services/ToastService';

const PAGE_SIZE = 10;

export default class OrganizationService {
  static async getOrganizationById(orgId) {
    try {
      const response = await $axios().get(`/organization/${orgId}/details`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at OrganizationService.getOrganizationById', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while fetching information about the organization!'),
      });
    }
  }

  static async getCurrentCity() {
    try {
      const response = await $axios().get('/organization/current-city');
      return response.data.data;
    } catch (e) {
      return null;
    }
  }

  static async findOrganization(searchTerm = '', page = 1) {
    try {
      const response = await $axios().get(`/suggestOrganisation?searchTerm=${searchTerm}&page=${page}&pageSize=${PAGE_SIZE}&international=true`);
      return response.data.data;
    } catch (error) {
      QLogger.log('Error at OrganizationService.findOrganization', error);
    }
    return [];
  }

  static async findSchools(keyword, cityDetails, page) {
    try {
      const response = await $axios().get('/organization/schools', {
        params: {
          keyword,
          page,
          location: cityDetails.location,
          city: cityDetails.name,
          state: cityDetails.state,
          country: cityDetails.country,
        },
      });
      return {
        organizations: response.data.data.results,
        hasNextPage: response.data.data.nextPageToken,
      };
    } catch (error) {
      QLogger.log('Error at OrganizationService.findSchools', error);
    }
    return {};
  }

  static async checkIfOrganizationExists(placeId) {
    try {
      const response = await $axios().get(`/organization/check-organization?placeId=${placeId}`);
      return response.data.data;
    } catch (e) {
      return null;
    }
  }

  static async addOrganizationV3(data) {
    try {
      const response = await $axios().post('/organization/v3/add', data);
      return response.data.data;
    } catch (error) {
      QLogger.log('Error at OrganizationService.addOrganizationV3', error);
    }
    return {};
  }

  static async findCity(input) {
    try {
      const response = await $axios().get('/organization/places', {
        params: {
          input,
          type: 'cities',
        },
      });
      return response.data.data.predictions;
    } catch (error) {
      QLogger.log('Error at OrganizationService.findCity', error);
    }
    return [];
  }

  static async findCityDetail(placeId) {
    try {
      const response = await $axios().get(`/organization/city?id=${placeId}`);
      return response.data.data;
    } catch (error) {
      QLogger.log('Error at OrganizationService.findGeocode', error);
    }
    return '';
  }

  static async setCurrentPaidOrganization(paidOrgId) {
    try {
      await $axios().post('/paid-org/set-current', {
        paidOrgId,
      });

      window.location.reload();
      return true;
    } catch (error) {
      QLogger.log('Error at OrganizationService.setCurrentPaidOrganization', error);
      return false;
    }
  }

  static async listTeachersInOrg(orgId) {
    try {
      const { data } = await $axios().get(`/organization/${orgId}/teachers`);
      return data;
    } catch (error) {
      QLogger.log('Error at OrganizationService.listTeachersInOrg', error);
      return { success: false, error };
    }
  }

  static async listTeachersInOrgV2(organizationIds) {
    try {
      const { data } = await $axios().post('/organization/list-teachers', {
        organizationIds,
      });
      return data;
    } catch (error) {
      QLogger.log('Error at OrganizationService.listTeachersInOrgV2', error);
      return { success: false, error };
    }
  }

  static async listTeachersInPaidOrgs({
    paidOrgIds, from = 0, size = 12, query,
  }) {
    try {
      const { data } = await $axios().post('/snd/paid-orgs/teachers', {
        paidOrgIds,
      }, {
        params: { from, size, query },
      });
      return data;
    } catch (error) {
      QLogger.log('Error at OrganizationService.listTeachersInPaidOrgs', error);
      return { success: false, error };
    }
  }
}

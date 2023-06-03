import i18n from '~/services/i18n';
import EventBus from '~/services/EventBus';
import $axios from '~/services/AxiosService.js';
import QLogger from '~/services/QLogger.js';
import ToastService from '~/services/ToastService';
import { orgsResponseStub, orgResponseStub } from '~/stubs/snd';
import Constants from '~/config/Constants.js';
import $store from '~/services/StoreService.js';

class SalesService {
  constructor() {
    this.toastMessage = '';
    this.view = null;
  }

  assignView(view) {
    this.view = view;
  }

  // eslint-disable-next-line
  addFiltersToSearchOrgs (requestPayload) {
    if ($store().getters['sales/isStep2'] || requestPayload.filters.parentOrgId) {
      return requestPayload;
    }
    if (requestPayload.exists?.includes('paidOrgId')) {
      return requestPayload;
    }
    if ($store().getters['sales/isInternational']) {
      requestPayload.excludeFilters = {
        country: 'US',
      };
      const exists = requestPayload.exists?.length ? [...requestPayload.exists, 'country'] : ['country'];
      requestPayload.exists = exists;
    } else if ($store().getters['sales/isMisc']) {
      requestPayload.excludeFilters = {
        organizationType: ['school', 'district', 'department'],
      };
      requestPayload.filters.organizationType = 'other';
    } else if (!$store().getters['sales/isStep2'] && requestPayload.filters.organizationType !== 'district') {
      requestPayload.filters.country = 'US';
    }
    return requestPayload;
  }

  async searchOrgs(searchFilters, resourceName, definedVales) {
    let { orgId } = searchFilters;
    orgId = orgId || (definedVales && definedVales.orgId) ? '' : undefined;
    const {
      orgName, paidOrgId, exist, notExist, orgState, excludes, orgType, parentOrgId, page, pageSize,
    } = searchFilters;
    let requestPayload = {
      filters: {
        parentOrgId: parentOrgId || undefined,
        id: orgId,
        paidOrgId: paidOrgId || undefined,
        organizationType: orgType || undefined,
        state: orgState || undefined,
      },
      excludes: excludes || undefined,
      exists: exist?.length ? exist : undefined,
      notExists: notExist?.length ? notExist : undefined,
      searchTerm: orgName || undefined,
      page,
      pageSize,
    };
    requestPayload = this.addFiltersToSearchOrgs(requestPayload);

    // TODO: say unpaid when isPaid is false
    try {
      EventBus.$emit('overlay:show');
      const response = await $axios().post(
        '/searchOrganisation/internal',
        requestPayload,
      );
      /*
       * Error Stub
        throw new Error('chaos is a ladder');
      */
      const orgs = response.data.data.hits.hits;
      /*
       * Response Stub
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
        const orgs = orgsResponseStub;
      */
      this.toastMessage = i18n(`Fetched ${resourceName} successfully`);
      // this.onSuccessResponse();
      return { numberOfHits: response.data.data.hits.total, orgs, success: true };
    } catch (err) {
      this.toastMessage = i18n(`Failed to fetch ${resourceName}`);
      QLogger.log('Error at SalesService.searchOrgs', err);
      // this.onErrorResponse();
      return { orgs: [], success: false };
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async subscribe(requestPayload) {
    try {
      // delete requestPayload.lmsType;
      const response = await $axios().post('/payment/apply-org-sub', requestPayload);
      this.toastMessage = i18n('Org Subscription successful!');
      EventBus.$emit('overlay:show');
      // await new Promise((resolve) => {
      //   setTimeout(resolve, 1000);
      // });
      // throw new Error('404');
      // const orgDistrict = orgResponseStub;
      // this.onSuccessResponse();
      return { success: response?.data?.success, paidOrgId: response?.data?.data?.paidOrg?._id };
    } catch (err) {
      this.toastMessage = i18n('Org Subscription failed');
      QLogger.log('Error at SalesService.subscribe', err);
      // this.onErrorResponse();
      return {};
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async updateSubscription(crmId, paidOrgId) {
    try {
      const response = await $axios().patch(`/paid-org/${paidOrgId}/billing`, { crmId });
      this.toastMessage = i18n('Edit Org Subscription successful!');
      EventBus.$emit('overlay:show');
      // await new Promise((resolve) => {
      //   setTimeout(resolve, 1000);
      // });
      // throw new Error('404');
      // const orgDistrict = orgResponseStub;
      // this.onSuccessResponse();
      return { success: response?.data?.success };
    } catch (err) {
      this.toastMessage = i18n('Edit Org Subscription failed');
      QLogger.log('Error at SalesService.updateSubsription', err);
      // this.onErrorResponse();
      return {};
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async getOverview(orgId) {
    try {
      EventBus.$emit('overlay:show');
      const response = await $axios().get(
        `/paid-org/v2/${orgId.orgId}?populateOrg=true`,
      );
      /*
       * Error Stub
        throw new Error('chaos is a ladder');
      */
      const orgs = response.data.data.organization;
      /*
       * Response Stub
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
        const orgs = orgsResponseStub;
      */
      this.toastMessage = i18n('Fetched Organization successfully');
      // this.onSuccessResponse();
      return {
        orgs, success: true, paidOrg: response.data.data.billing, id: response.data.data.organizationId, displayName: response.data.data.displayName,
      };
    } catch (err) {
      this.toastMessage = i18n('Failed to fetch organization');
      QLogger.log('Error at SalesService.searchOrgs', err);
      // this.onErrorResponse();
      return { orgs: {}, success: false };
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async addNewDistrict(districtData) {
    try {
      EventBus.$emit('overlay:show');
      const response = await $axios().post(
        '/organization/v4/add',
        districtData,
      );
      this.toastMessage = i18n('District Successfully Created');
      // this.onSuccessResponse();
      return { success: response?.data.success, org: response.data?.data?.organization };
    } catch (err) {
      QLogger.log('Error at QuizService.publish', err);
      this.toastMessage = i18n('Failed to create district');
      // this.onErrorResponse();
      return {};
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async linkSchool(requestPayload) {
    // payload
    // {
    //   parentOrgId: string,
    //   orgIds: string[]
    // }
    try {
      const response = await $axios().put('organization/link', requestPayload);
      this.toastMessage = i18n('Linked school successfully');
      EventBus.$emit('overlay:show');
      // this.onSuccessResponse();
      return { success: response?.data?.success };
    } catch (err) {
      this.toastMessage = i18n('Failed to link school');
      QLogger.log('Error at QuizService.publish', err);
      // this.onErrorResponse();
      return { success: false };
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async unLinkSchool(requestPayload) {
    // payload
    // {
    //   parentOrgId: string,
    //   orgIds: string[]
    // }
    try {
      const response = await $axios().delete('organization/unlink', { data: requestPayload });
      this.toastMessage = i18n('Unlinked school successfully');
      EventBus.$emit('overlay:show');
      // this.onSuccessResponse();
      return { success: response?.data?.success };
    } catch (err) {
      this.toastMessage = i18n('Failed to unlink school');
      QLogger.log('Error at QuizService.publish', err);
      // this.onErrorResponse();
      return { success: false };
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async updateOrg(org) {
    const {
      id, name, city, zip, state, enrolled, address, county, country, lowGrade, highGrade, studentTeacherRatio, organizationType, type, numberOfPublicSchools, numberOfOperationalSchools,
    } = org;
    const requestPayload = {
      organizationId: id,
      name,
      city,
      zip,
      county,
      state,
      lowGrade,
      organizationType,
      highGrade,
      address,
      country,
      organizationMetadata: {
        type,
        numberOfPublicSchools,
        numberOfOperationalSchools,
        studentTeacherRatio,
        enrolled,
      },
    };
    try {
      const response = await $axios().post('/organization/v2/update', requestPayload);
      EventBus.$emit('overlay:show');
      this.toastMessage = i18n('School details updated successfully');
      // this.onSuccessResponse();
      return { success: response?.data?.success };
    } catch (err) {
      QLogger.log('Error at QuizService.editOrg', err);
      this.toastMessage = i18n('Failed to update school details');
      // this.onErrorResponse();
      return { success: false };
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async createOrg(org) {
    const {
      name, city, zip, state, address, orgType, type,
    } = org;
    let { country } = org;
    if ($store().getters['sales/isMisc']) {
      country = 'US';
    }
    const requestPayload = {
      organizationType: orgType,
      name,
      city,
      zip,
      state,
      address,
      country,
      organizationMetadata: {
        type,
      },
    };

    try {
      const response = await $axios().post('/organization/v4/add', requestPayload);
      EventBus.$emit('overlay:show');
      this.toastMessage = i18n('School details updated successfully');
      // this.onSuccessResponse();
      return { success: response?.data.success, org: response.data?.data?.organization };
    } catch (err) {
      QLogger.log('Error at QuizService.editOrg', err);
      this.toastMessage = i18n('Failed to update school details');
      // this.onErrorResponse();
      return null;
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async getAdmins(paidOrgId) {
    try {
      const response = await $axios().get(`/paid-org/members/${paidOrgId}?role=admin`);
      this.toastMessage = i18n('Get admins successful!');
      EventBus.$emit('overlay:show');
      // await new Promise((resolve) => {
      //   setTimeout(resolve, 1000);
      // });
      // throw new Error('404');
      // const orgDistrict = orgResponseStub;
      // this.onSuccessResponse();
      return { success: response?.data?.success, admins: response?.data?.data };
    } catch (err) {
      this.toastMessage = i18n('Get admins failed');
      QLogger.log('Error at SalesService.getAdmins', err);
      // this.onErrorResponse();
      return {};
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async addAdmin(requestPayload) {
    try {
      const response = await $axios().post('/org-invite/send', requestPayload);
      this.toastMessage = i18n('Add admin successful!');
      EventBus.$emit('overlay:show');
      // await new Promise((resolve) => {
      //   setTimeout(resolve, 1000);
      // });
      // throw new Error('404');
      // const orgDistrict = orgResponseStub;
      // this.onSuccessResponse();
      return { success: response?.data?.success, paidOrgId: response?.data?.data?.paidOrg?._id };
    } catch (err) {
      this.toastMessage = i18n('Add admin failed');
      QLogger.log('Error at SalesService.addAdmin', err);
      // this.onErrorResponse();
      return {};
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async removeAdmin(requestPayload) {
    try {
      const response = await $axios().post('/paid-org/internal/remove-member/', requestPayload);
      this.toastMessage = i18n('Add admin successful!');
      EventBus.$emit('overlay:show');
      // await new Promise((resolve) => {
      //   setTimeout(resolve, 1000);
      // });
      // throw new Error('404');
      // const orgDistrict = orgResponseStub;
      // this.onSuccessResponse();
      return { success: response?.data?.success, paidOrgId: response?.data?.data?.paidOrg?._id };
    } catch (err) {
      this.toastMessage = i18n('Delete admin failed');
      QLogger.log('Error at SalesService.removeAdmin', err);
      // this.onErrorResponse();
      return {};
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async getOrgById(orgId) {
    try {
      const response = await $axios().get(`/organization/internal/${orgId}`);
      this.toastMessage = i18n('Successfully fetched Org details');
      EventBus.$emit('overlay:show');
      // this.onSuccessResponse();
      return { success: response?.data?.success, org: response?.data?.data };
    } catch (err) {
      this.toastMessage = i18n('Failed to fetch Org details');
      QLogger.log('Error at QuizService.getOrgById', err);
      // this.onErrorResponse();
      return { success: false };
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  async editDisplayName(requestPayload) {
    try {
      const response = await $axios().patch('/paid-org', requestPayload);
      this.toastMessage = i18n('Edit display name successful!');
      EventBus.$emit('overlay:show');
      // throw new Error('404');
      // this.onSuccessResponse();
      return { success: response?.data?.success };
    } catch (err) {
      this.toastMessage = i18n('Edit display name failed');
      QLogger.log('Error at SalesService.editDisplayName', err);
      // this.onErrorResponse();
      return {};
    } finally {
      EventBus.$emit('overlay:hide');
    }
  }

  onSuccessResponse() {
    ToastService.add({
      type: Constants.ToastTypes.SUCCESS,
      icon: 'fas fa-check-circle',
      title: this.toastMessage,
    });
  }

  onErrorResponse() {
    ToastService.add({
      type: Constants.ToastTypes.ERROR,
      icon: 'fas fa-times-circle',
      title: this.toastMessage,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onNewSubscriptionError() {}
}

const salesService = new SalesService();
QLogger.log('SalesService created!');
export default salesService;

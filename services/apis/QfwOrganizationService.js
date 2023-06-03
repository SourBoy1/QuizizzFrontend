import Constants from '~/config/Constants';
import $axios from '../AxiosService';
import QLogger from '../QLogger';
import ToastService from '../ToastService';
import i18n from '../i18n';

export default class QfwOrganizationService {
  static async fetchOrgInfo(token) {
    try {
      const { data } = await $axios().get('/paid-org/v2/org-info');
      if (!data.success) {
        return null;
      }

      return data.data.org;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.fetchOrgInfo. ', error);
      return null;
    }
  }

  static async removeMember(memberId) {
    try {
      const requestParams = {
        memberId,
      };
      const { data } = await $axios().post('/paid-org/remove-member', requestParams);
      if (!data.success) {
        return null;
      }

      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.removeMember. ', error);
      return null;
    }
  }

  static async inviteMembers(emailsToInvite, role, orgId) {
    try {
      const requestData = {
        paidOrgId: orgId,
        role,
        userEmails: emailsToInvite,
      };

      const { data } = await $axios().post('/org-invite/send', requestData);
      if (!data.success) {
        return null;
      }

      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.inviteMembers. ', error);
      return null;
    }
  }

  static async addQfwSubscription(organizationName, subscriptionId, userId) {
    try {
      const requestData = {
        organizationName,
        subscriptionId,
        userId,
      };

      const { data } = await $axios().post('/payment/add-qfw-subscription', requestData);

      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.addQfwSubscription. ', error);
      return error;
    }
  }

  static async getSubscriptions(queryString) {
    try {
      const { data } = await $axios().get(`/internal/get-subscription/${queryString}`);
      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.getSubscriptions. ', error);
      return error.response.data;
    }
  }

  static async cancelSubscription(subscriptionId, paidOrgId, cancelWithFullRefund, cancelWithProratedRefund) {
    try {
      const requestData = {
        paidOrgId,
        subscriptionId,
        cancelWithFullRefund,
        cancelWithProratedRefund,
      };
      const { data } = await $axios().post('/internal/cancel-subscription', requestData);
      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.cancelSubscriptions. ', error);
      return error.response.data;
    }
  }

  static async previewUpdate(subscriptionId, paidOrgId, planId, quantity, cancellation) {
    try {
      const requestData = {
        paidOrgId,
        subscriptionId,
        planId,
        quantity: Number(quantity) || null,
        cancellation,
      };
      const { data } = await $axios().post('/internal/get-prorated-amount', requestData);
      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.previewUpdate. ', error);
      return error.response.data;
    }
  }

  static async getQfwPlans() {
    try {
      const { data } = await $axios().get('/internal/get-plans');
      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.getQfwPlans. ', error);
      return error.response.data;
    }
  }

  static async updateSubscription(subscriptionId, paidOrgId, planId, quantity) {
    try {
      const requestData = {
        paidOrgId,
        subscriptionId,
        planId,
        quantity: Number(quantity) || null,
      };
      const { data } = await $axios().post('/internal/update-subscription', requestData);
      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.updateSubscription. ', error);
      return error.response.requestData;
    }
  }

  static async extendTrial(userId, days) {
    try {
      const payload = {
        userId,
        days: Number(days) || null,
      };

      const { data } = await $axios().post('/internal/trial/extend', payload);
      return data;
    } catch (error) {
      QLogger.log('Error at service QfwOrganizationService.extendTrial. ', error);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while extending trial!'),
      });
      return null;
    }
  }
}

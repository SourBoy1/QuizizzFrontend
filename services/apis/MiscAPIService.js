import axios from 'axios';

import $store from '~/services/StoreService';
import Constants from '~/config/Constants';
import $axios from '../AxiosService';
import CookieService from '../CookieService';
import i18n from '../i18n';
import QLogger from '../QLogger';
import ToastService from '../ToastService';

export default class MiscService {
  static async getEmbedMetadata(data) {
    try {
      const response = await $axios().post('/getEmbedMetadata', data);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at MiscService.getEmbedMetadata', err);
    }
  }

  static async sendAnalyticsEvent(apiEndpoint, data) {
    try {
      const response = await axios.post(apiEndpoint, data);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at MiscService.sendAnalyticsEvent', err);
    }
  }

  static async getUserContentMetrics() {
    try {
      const response = await $axios().get('/user/content-metrics');
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at MiscService.getUserContentMetrics', err);
    }
  }

  static async shareSuperTraineeInvite(payload) {
    try {
      const response = await $axios().post('/user/refer', {
        ...payload,
        type: 'stp',
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      QLogger.log('Error at MiscAPIService.shareSuperTraineeInvite', error);
      return { success: false, error };
    }
  }

  static async shareUserProfileViaEmail(payload) {
    try {
      const response = await $axios().post('/profile/share', payload);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      QLogger.log('Error at MiscAPIService.shareUserProfileViaEmail', error);
      return { success: false, error };
    }
  }

  static async shareGcsePapersViaEmail(payload) {
    try {
      const response = await $axios().post('/gcse/share', payload);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      QLogger.log('Error at MiscAPIService.shareUserProfileViaEmail', error);
      return { success: false, error };
    }
  }

  static async shareContestInviteViaEmail({ emailsToShare: referrals, link: redirect }) {
    try {
      const response = await $axios().post('/user/refer', {
        referrals,
        redirect,
        type: 'refer-contest',
      });

      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      QLogger.log('Error at MiscAPIService.shareContestInviteViaEmail', error);
      return { success: false, error };
    }
  }

  static async getGenericCertification({
    category, type, data, debug,
  }) {
    const body = {
      category,
      type,
    };

    if (data) {
      body.data = data;
    }

    if (debug) {
      body.debug = true;
    }

    const response = await $axios().post('/certifications/generic', body);
    return response;
  }

  static async shareReferralLinkViaEmail({ emailsToShare: referrals, link: redirect }) {
    try {
      const response = await $axios().post('/user/refer', {
        referrals,
        redirect,
        type: 'refer-teacher',
      });

      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      QLogger.log('Error at MiscAPIService.shareReferralLinkViaEmail', error);
      return { success: false, error };
    }
  }

  static async shareLinkViaEmail({ emailsToShare: referrals, link: redirect, campaignId }) {
    try {
      const response = await $axios().post('/user/giftSuper', {
        referrals,
        redirect,
        type: 'refer-teacher',
        campaignId,
      });

      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      QLogger.log('Error at MiscAPIService.shareReferralLinkViaEmail', error);
      return { success: false, error };
    }
  }

  static async sendFeedback(params, eventName, isDismissed = false) {
    try {
      const headers = {
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
      };
      const payload = {
        quizizz_uid: CookieService.get('quizizz_uid'),
        slot: CookieService.get('QUIZIZZ_EXP_SLOT') || '0',
        experiment: CookieService.get('QUIZIZZ_EXP_NAME') || 'main',
        isDismissed,
        eventName,
        platform: 'web',
        country: $store()?.getters?.['root/serverData']?.requestCountry || '',
        timezoneOffset: (new Date()).getTimezoneOffset(),
        params,
      };
      if (import.meta.env.VITE_NODE_ENV === Constants.NodeEnvs.PROD) {
        return await $axios().post('https://analytics.quizizz.com/feedback2', payload, headers);
      }
    } catch (error) {
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Feedback cannot be submitted. Please try again!'),
      });
      QLogger.error(error);
      throw (error);
    }
  }

  static async sendEmail(templateName, email, payload, userId) {
    const response = await $axios().post('/send-email', {
      templateName,
      email,
      payload,
      userId,
    });
    const result = response.data;

    if (result.success) {
      return result.data;
    }
    return null;
  }
}

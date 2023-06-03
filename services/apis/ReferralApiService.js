import $axios from '~/services/AxiosService';
import QLogger from '../QLogger.js';

import LocalStorage from '../LocalStorage.js';

export default class ReferralApiService {
  static async fetchUserReferralStats({ email, campaignId }) {
    try {
      const { status, data } = await $axios().get(`/user/referral/stats/${email}/${campaignId}`);
      if (status === 200) {
        return data.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ReferralApiService.fetchUserReferralStats', err);
    }
  }

  static enrollUser(campaignId) {
    return new Promise((resolve, reject) => {
      $axios().post(`/referrals/${campaignId}/enroll`).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  static async getLink(emails = []) {
    const campaignPayload = { mailTemplate: 'refer-teacher', referees: emails };

    try {
      const response = await $axios().post('referral/32748/invite?getInviteLink=true', campaignPayload);
      const result = response.data;

      if (result.success) {
        return result;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaymentService.cancelSubscription', err);
      return err.response.data;
    }
  }

  static async getLinkForBasic(emails = []) {
    const campaignPayload = { mailTemplate: 'refer-teacher', referees: emails };

    try {
      const response = await $axios().post('referral/32749/invite?getInviteLink=true', campaignPayload);
      const result = response.data;

      if (result.success) {
        return result;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ReferralApiService.getLinkForBasic', err);
      return err.response.data;
    }
  }

  static async activateTrial() {
    try {
      const { data: result } = await $axios().post('/trial/start');

      if (result.success) {
        return result;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ReferralApiService.activateTrial', err);
      return err.response.data;
    }
  }

  static async acceptReferral() {
    const campaignPayload = LocalStorage.getItem('referralToken');

    try {
      const response = await $axios().post(`referral/accept?token=${campaignPayload}`);
      const result = response.data;

      if (result.success) {
        return result;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ReferralApiService.acceptReferral', err);
      return err.response.data;
    }
  }

  static async activateReferral(campId) {
    try {
      let cmpId;
      if (LocalStorage.getItem('campaignId')) {
        cmpId = LocalStorage.getItem('campaignId');
      } else {
        cmpId = campId || '32748';
      }
      const response = await $axios().post(`referral/${cmpId}/activate`);
      const result = response.data;

      if (result.success) {
        return result;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at ReferralApiService.activateReferral', err);
      return err.response?.data;
    }
  }

  static campaignFetchPromises = [];

  static beingFetchedAreCampaigns = false;

  static processCampaignFetchPromises() {
    const [isSuccess, ...params] = arguments;
    if (this.campaignFetchPromises.length) {
      this.campaignFetchPromises.forEach(([resolve, reject]) => {
        if (isSuccess) {
          resolve.apply(null, params);
        } else {
          reject.apply(null, params);
        }
      });
    }

    this.campaignFetchPromises.length = 0;
    this.beingFetchedAreCampaigns = false;
  }

  static getCampaigns() {
    return new Promise((resolve, reject) => {
      if (this.beingFetchedAreCampaigns) {
        this.campaignFetchPromises.push([resolve, reject]);
        return;
      }

      this.beingFetchedAreCampaigns = true;

      $axios().get('/user/referral-campaigns').then((response) => {
        const { status, data } = response;

        if (status === 200) {
          const campaignList = data.data?.campaignList;
          resolve(campaignList);
          this.processCampaignFetchPromises(true, campaignList);
        } else {
          reject(null);
          this.processCampaignFetchPromises(false, null);
        }
      }, (error) => {
        reject(error);
        this.processCampaignFetchPromises(false, error);
      });
    });
  }
}

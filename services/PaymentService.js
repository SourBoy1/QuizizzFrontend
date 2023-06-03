import $store from '~/services/StoreService';
import CookieService from '~/services/CookieService';
import Constants from '~/config/Constants.js';
import QLogger from './QLogger.js';
import $axios from './AxiosService.js';
import ToastService from './ToastService.js';

import i18n from './i18n.js';

export default class PaymentService {
  constructor(serviceProvider) {
    this.provider = serviceProvider || 'stripe';
    this.config = {};
  }

  async init() {
    if (this.provider === 'stripe') {
      const stripe = await import(/* webpackPrefetch: true */'@stripe/stripe-js');
      const serverData = $store().getters['root/serverData'];
      this.config = {
        stripePublishableKey: serverData.stripePublishableKey,
      };
      return await stripe.loadStripe(this.config.stripePublishableKey);
    }
  }

  static async createPortalSession({ redirectToAddPaymentMethodPage = false }) {
    try {
      const CSRFToken = CookieService.get('x-csrf-token');

      const response = await $axios().post(
        '/payment/create-portal-session',
        {
          redirectToAddPaymentMethodPage,
        },
        {
          headers: { 'x-csrf-token': CSRFToken },
        },
      );

      const result = response.data;

      return { success: true, data: result.data };
    } catch (err) {
      QLogger.log('Error at PaymentService.createPortalSession', err);
      return { success: false, error: err };
    }
  }

  static async getInvoices() {
    try {
      const response = await $axios().get('/customer/invoices');
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaymentService.getInvoices', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while fetching invoices!'),
      });
    }
  }

  static async getPaymentMethods() {
    try {
      const response = await $axios().get('/payment/methods');
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaymentService.getPaymentMethods', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while fetching payment methods!'),
      });
    }
  }

  static async cancelSubscription({ subscriptionId, reason }) {
    try {
      const response = await $axios().post(
        '/subscription/cancel',
        {
          subscriptionId,
          reason,
        },
      );
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaymentService.cancelSubscription', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while canceling subscription!'),
      });
    }
  }

  static async renewSubscription({ subscriptionId }) {
    try {
      const response = await $axios().post(
        '/subscription/cancel-update',
        {
          subscriptionId,
        },
      );
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at PaymentService.cancelSubscription', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while canceling subscription!'),
      });
    }
  }

  static async previewUpdate(params) {
    try {
      const CSRFToken = CookieService.get('x-csrf-token');

      const response = await $axios().post('/subscription/preview-update', params, {
        headers: { 'x-csrf-token': CSRFToken },
      });

      const result = response.data;

      return { success: true, data: result.data };
    } catch (err) {
      QLogger.log('Error at service PaymentService.previewUpdate ', err);
      return { success: false, error: err };
    }
  }

  static async updateSubscription(params) {
    try {
      const CSRFToken = CookieService.get('x-csrf-token');

      const response = await $axios().post('/subscription/update', params, {
        headers: { 'x-csrf-token': CSRFToken },
      });

      const result = response.data;

      return { success: true, data: result.data };
    } catch (err) {
      QLogger.log('Error at service PaymentService.update ', err);
      return { success: false, error: err };
    }
  }
}

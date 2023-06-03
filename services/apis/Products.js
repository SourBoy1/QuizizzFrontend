import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import reverse from 'lodash/reverse';

import i18n from '~/services/i18n';
import Constants from '~/config/Constants';
import ToastService from '~/services/ToastService';
import Analytics from '~/services/EventLoggerService';
import WebEvents from '~/config/WebEvents';
import { isClient } from '~/utils/EnvUtils';
import UrlUtils from '~/utils/UrlUtils';
import { getCouponFromUrlParam, getQuantityFromUrlParam } from '~/utils/Utilities';
import QLogger from '../QLogger';
import PaymentService from '../PaymentService';
import $axios from '../AxiosService';
import $store from '../StoreService';

export default class Products {
  static async fetchProducts(forOccupation = 'teacher_school', options = {}, upgradablePlans = false) {
    try {
      const params = {
        occupation: forOccupation,
        groupPlans: true,
        upgradablePlans,
      };

      const sev = isClient() ? UrlUtils.parse(window.location.href).query.sev : null;
      if (sev) {
        params.sev = sev;
      }

      const { data } = await $axios().get('/products', { params });
      if (!data.success) {
        return {
          plans: [],
          plan: {},
          products: [],
        };
      }

      const { products } = data.data;

      // Plans for Qfw Pricing page
      if (forOccupation === 'corporate_teacher') {
        return this.getQfwPricingProducts(data.data, options);
      }

      // Get checkout only product
      const product = products.find((product) => product.action === 'checkout');
      if (product && product.plans) {
        const plans = product.plans.filter((plan) => plan.interval === 'year' || plan.interval === 'month');
        return { plans };
      }

      return { plan: product || {} };
    } catch (error) {
      QLogger.log('Error at service Products.fetchProducts. ', error);
      return {
        plans: [],
        plan: {},
        products: [],
      };
    }
  }

  static async checkoutPlan(planId, params = {}) {
    if (!planId) {
      return null;
    }

    try {
      const {
        cameFrom, redirectTo, source, feat, variant,
      } = params;
      const requestParams = {
        planId,
        quantity: getQuantityFromUrlParam() || 1,
        metadata: {
          upsellFeatureName: cameFrom.feature,
          upsellFeatureVariant: cameFrom.variant,
        },
        redirectTo,
        source,
        feat,
        variant,
      };

      const coupon = getCouponFromUrlParam();
      if (coupon) {
        requestParams.coupon = coupon;
      }

      const { data } = await $axios().post('/payment/create-session', requestParams, { headers: { 'Content-Type': 'application/json' } });

      const { checkoutSessionId } = data.data;
      if (checkoutSessionId) {
        const stripe = await new PaymentService('stripe').init();
        const { error } = await stripe.redirectToCheckout({
          sessionId: checkoutSessionId,
        });

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      QLogger.log('Error at service Products.checkoutPlan. ', error);
      return null;
    }
  }

  static async startFreeTrial({ redirectTo, planId = null, disableRedirection = false }) {
    try {
      const { data: result } = await $axios().post('/trial/start', { planId });

      if (result?.data?.user) {
        $store().dispatch('root/setUser', result.data.user);

        if (!disableRedirection) {
          window.location.href = decodeURIComponent(redirectTo);
        }
      } else {
        window.location.href = '/signup?source=fw_pricing';
      }
    } catch (error) {
      QLogger.log('Error at service Products.startFreeTrial. ', error);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while processing you free trial'),
      });

      return null;
    }
  }

  static getQfwPricingProducts(productsData, options) {
    try {
      const { products } = productsData;
      let t1Monthly;
      const noFreeTrial = products.filter((product) => product.group === 'trainer_t4').length > 0;
      const filteredProducts = products.filter((product) => {
        if (product.group === 'trainer_t1') {
          t1Monthly = product.plans.filter((plan) => plan.interval === 'month')[0];
        }
        if (product.group === 'trainer_t4' && options?.onlyListed) {
          product.plans = product.plans.filter((plan) => plan.list);
        }
        if (noFreeTrial && product.group === 'trainer_trial') {
          return false;
        }
        return product.priority >= 0;
      });

      const { nonProfitPlanGroup } = productsData;
      let percentageSaved = 50;
      if (t1Monthly?.id === 'trainer_t1_monthly_v2') {
        percentageSaved = 70;
      }
      const nonProfitPlan = products.filter((product) => {
        if (product.group === nonProfitPlanGroup) {
          return product;
        }
        return null;
      });
      return {
        products: cloneDeep(filteredProducts),
        productsR: reverse(filteredProducts), // Products in reverse order
        nonProfitPlanGroup,
        nonProfitPlan,
        percentageSaved,
        sev: productsData.sev,
      };
    } catch (error) {
      Analytics.logEvent(
        WebEvents.QFW_PRICING_PAGE_SERVICE_ERRORS,
        {
          // what is queryID from localstorage??
          errorText: JSON.stringify(error),
        },
      );
      return {
        products: [],
        productsR: [],
      };
    }
  }
}

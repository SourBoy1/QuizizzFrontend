<template>
  <Modal
    v-if="shouldShowPlanExpiredModal"
    ref="qfw-churn-modal"
    :zeroPadding="true"
    :showCloseModalBtn="false"
    containerClasses="max-w-96"
    size="custom"
    headerCustomClasses="border-4 border-red-light rounded-t-lg"
    footerClasses="py-2 bg-light-2 h-auto rounded-b-full"
    :button1="{
      type: 'danger',
      title: $i18n('Update payment info'),
    }"
    :disableDefaultFocus="true"
    @button1-click="onUpdatePaymentInfo"
  >
    <div class="flex justify-between p-4 pb-2">
      <div class="flex justify-center w-6 h-6 px-3 mt-3 mr-3 text-lg rounded-full bg-red-faded text-red-light">
        <FA icon="far fa-credit-card" />
      </div>
      <div class="">
        <div class="">
          <div class="text-sm font-semibold text-dark-2">
            <i18n>Issue with your payment </i18n>
          </div>
          <p class="text-xxs text-dark-4">
            <i18n>Please update your payment information</i18n>
            <span class="font-semibold">
              <i18n :injections="[lastDateToUpdateCardDetails]">before {$1}</i18n>
            </span>
            <i18n>to keep using Quizizz</i18n>
          </p>
        </div>
        <div class="mt-3">
          <div
            v-for="(benefit, ind) in benefits"
            :key="ind"
            class="flex items-baseline mb-2"
          >
            <FA icon="far fa-check text-sm text-green-light mr-2" />
            <p class="text-xs text-dark-4">
              {{ benefit }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import PaymentService from '~/services/PaymentService';

export default {
  data() {
    return {
      renderBanner1: true,
      renderBanner2: false,
    };
  },

  computed: {
    benefits() {
      return [
        this.$i18n('Unlimited access to all question types and content'),
        this.$i18n('Unlimited quizzes and presentations'),
        this.$i18n('Flexible assignment deadlines'),
        this.$i18n('Detailed reports for every hosted quiz or presentation'),
      ];
    },

    shouldShowPlanExpiredModal() {
      return this.$user.isLoggedIn
        && this.$user.isCorporate
        && this.$user.isPastDueSubscription;
    },

    lastDateToUpdateCardDetails() {
      const subscription = this.$user.subscription || {};
      if (isEmpty(subscription)) {
        return '';
      }
      const subsStartAt = this.$dayjs(subscription.startAt);
      const pastDueDate = subsStartAt.add(this.$constants.SubscriptionRetryPeriod, 'day').format('Do MMM');
      return pastDueDate;
    },
  },

  created() {
    this.selectBannerToShow();
  },

  methods: {
    async onUpdatePaymentInfo() {
      const response = await PaymentService.createPortalSession({ redirectToAddPaymentMethodPage: true });

      this.$analytics.logEvent(this.$webEvents.MANAGE_BILLING_INFO, {
        source: this.$webEvents.QFW_CHURN_MODAL_PAYMENT_INFO_CLICK,
        userId: this.$user.id,
        subscriptionEndAt: get(this.$user, 'subscription.endAt', null),
        bannerType: this.renderBanner1 ? 'banner1' : 'banner2',
      });

      if (!response.success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong!'),
        });
        return;
      }

      window.location = response.data.portalSessionUrl;
    },

    selectBannerToShow() {
      const userId = this.$user ? this.$user.id : null;
      if (!userId) {
        return;
      }
      const userCreatedTime = new Date(parseInt(userId.substring(0, 8), 16)).getTime();
      if (userCreatedTime % 2 === 0) {
        this.renderBanner1 = false;
        this.renderBanner2 = true;
      }
    },
  },
};
</script>

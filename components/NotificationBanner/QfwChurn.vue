<template>
  <portal
    v-if="shouldShowNotification"
    to="notification-banner"
  >
    <div
      role="banner"
      class="flex items-center justify-center w-full py-2 bg-red-light"
    >
      <p
        v-if="renderBanner1"
        class="mr-4 text-sm text-light"
      >
        <FA
          icon="fas fa-exclamation-triangle mr-1.5"
          :size="14"
        />
        <span class="font-bold">
          <i18n>We couldn’t renew your subscription.</i18n>
        </span>
        <span class="font-semibold">
          <i18n>Please update your payment information by</i18n>
          <span class="font-bold">
            <i18n :injections="[bannerTimeLeftText]">{$1}</i18n>
          </span>
          <i18n>to keep using Quizizz.</i18n>
        </span>
      </p>
      <p
        v-else-if="renderBanner2"
        class="mr-4 text-sm text-light"
      >
        <FA
          icon="fas fa-exclamation-triangle mr-1.5"
          :size="14"
        />
        <span class="font-bold">
          <i18n>Your payment failed.</i18n>
        </span>
        <span class="font-semibold">
          <i18n>Please update your payment information in</i18n>
        </span>
        <span class="font-bold">
          <i18n :injections="[bannerTimeLeftText]">{$1} days.</i18n>
        </span>
        <span class="font-semibold">
          <i18n>to keep using Quizizz!</i18n>
        </span>
      </p>
      <Button
        size="sm"
        type="danger"
        :title="$i18n('Update payment info')"
        @click="onUpdatePaymentInfo"
      />
    </div>
  </portal>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import LocalStorage from '~/services/LocalStorage';
import PaymentService from '~/services/PaymentService';

export default {
  data() {
    return {
      showNotification: false,
      renderBanner1: true,
      renderBanner2: false,
    };
  },

  computed: {
    shouldShowNotification() {
      return this.$user.isLoggedIn
          && this.$user.isCorporate
          && this.$user.isPastDueSubscription
          && this.showNotification;
    },

    bannerTimeLeftText() {
      return this.renderBanner1 ? this.lastDateToUpdateCardDetails : this.daysLeftToUpdateCardDetails;
    },

    daysLeftToUpdateCardDetails() {
      const subscription = this.$user.subscription || {};
      if (isEmpty(subscription)) {
        return '0';
      }
      const now = this.$dayjs();
      const subsStartAt = this.$dayjs(subscription.startAt);
      const retryPeriod = subsStartAt.add(this.$constants.SubscriptionRetryPeriod, 'day');
      return retryPeriod.diff(now, 'day');
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

  mounted() {
    this.$eventBus.$on('planExpiredNotification:show', this.computeTimeToReshow);
    this.computeTimeToReshow();
    this.selectBannerToShow();
  },

  beforeUnmount() {
    this.$eventBus.$off('planExpiredNotification:show', this.computeTimeToReshow);
  },

  methods: {
    computeTimeToReshow() {
      const now = this.$dayjs();
      let diffHours = 0;
      const lastShowEpoch = LocalStorage.getItem(this.$constants.LocalStorageItems.QFW_CHURN_MODAL_CLOSE_TIME);
      if (lastShowEpoch) {
        const lastShowTime = this.$dayjs(lastShowEpoch);
        diffHours = now.diff(lastShowTime, 'hour');
      }
      this.showNotification = lastShowEpoch && (diffHours < this.$constants.CHURN_NOTIFICATION_RESHOW_TIME);
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

    async onUpdatePaymentInfo() {
      const response = await PaymentService.createPortalSession({ redirectToAddPaymentMethodPage: true });

      this.$analytics.logEvent(this.$webEvents.MANAGE_BILLING_INFO, {
        source: this.$webEvents.QFW_CHURN_BANNER_PAYMENT_INFO_CLICK,
        userId: this.$user.id,
        bannerType: this.renderBanner1 ? 'banner1' : 'banner2',
        subscriptionEndAt: get(this.$user, 'subscription.endAt', null),
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
  },
};
</script>

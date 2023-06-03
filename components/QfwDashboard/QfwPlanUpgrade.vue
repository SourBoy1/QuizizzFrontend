<template>
  <Modal
    icon="fas fa-user-plus"
    :title="$i18n('Confirm Payment')"
    @close="closePaymentModal"
  >
    <div class="text-xs text-dark-50% pb-5 border-t border-b payment-modal-container">
      <div>
        <div class="p-3 text-sm text-center text-dark-2">
          <span>{{ upgradeMessage }}</span>
        </div>
        <div class="flex justify-between px-4 py-2 text-sm text-center text-dark bg-light-2 plan-detail">
          <div>
            {{ getCurrentPlanName }}
            <i class="fas fa-circle text-dark-4 bullet-scale" />
            <span class="text-dark-4"><i18n>Billed </i18n> {{ getCurrentInterval }}</span>
          </div>
          <div
            v-if="priceLoading"
            class="flex"
          >
            <Loader :size="12" />
          </div>
          <div
            v-else
            class="flex"
          >
            <div class="mr-2 text-dark-5 strikethrough">
              ${{ getDisplayPrice }}
            </div>
            <div>
              ${{ discountedPriceToDisplay / 100 }}<span class="text-sm">*</span>
            </div>
          </div>
        </div>
        <div class="w-4/5 p-3 m-auto text-xs text-center text-dark-3">
          <i18n>* This is the prorated price of the upgraded plan for the remaining duration. You will be charged the full price in the next renewal period.</i18n>
        </div>
      </div>
    </div>
    <div class="flex justify-between pt-4">
      <Button
        class="w-1/5"
        type="other"
        :title="$i18n('Back')"
        :aria-label="$i18n('Back')"
        licon="far fa-arrow-left"
        size="sm"
        @click="handleBackButton"
      />
      <Button
        class="w-1/5"
        type="primary"
        :title="$i18n('Confirm')"
        :aria-label="$i18n('Confirm')"
        size="sm"
        :disabled="updatePaymentLoading || priceLoading"
        :loading="updatePaymentLoading"
        @click="proceedPayment"
      />
    </div>
  </Modal>
</template>
<script>
import isEmpty from 'lodash/isEmpty';

import PaymentService from '~/services/PaymentService';

export default {
  props: {
    paymentModalOpen: {
      type: Boolean,
      default: false,
    },
    closePaymentModal: {
      type: Function,
      default: () => false,
    },
    planToUpgrade: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      paymentError: false,
      originalPlanPrice: 0,
      discountedPrice: 0,
      priceLoading: false,
      updatePaymentLoading: false,
      quantity: this.$user.subscription.quantity || -1,
    };
  },

  computed: {

    discountedPriceToDisplay() {
      return this.discountedPrice;
    },

    upgradeMessage() {
      if (this.quantity > 1) {
        return `${this.$i18n('Upgrading')} ${this.quantity} ${this.$i18n('seats to')} ${this.getCurrentPlanName} ${this.$i18n('plan')}`;
      }
      return `${this.$i18n('Upgrading to')} ${this.getCurrentPlanName} ${this.$i18n('plan')}`;
    },

    getCurrentPlanName() {
      return `${this.planToUpgrade?.planName}`;
    },

    getCurrentInterval() {
      return `${this.planToUpgrade?.interval === 'year' ? this.$i18n('( Annual )') : this.$i18n('( Monthly )')}`;
    },

    getDisplayPrice() {
      let displayPrice = '';
      const plan = this.planToUpgrade;
      if (!isEmpty(plan) && plan.amount) {
        displayPrice += plan.amount ? plan.amount : '';
      }

      return displayPrice ? (Number(displayPrice) * this.quantity) / 100 : this.$i18n('Free');
    },
  },

  async created() {
    this.priceLoading = true;
    this.quantity = this.$user.subscription.quantity;
    await this.fetchPreviewPaymentData();
    this.priceLoading = false;
  },

  beforeUnmount() {
    this.paymentError = false;
  },
  methods: {
    async fetchPreviewPaymentData() {
      const { subscription } = this.$user;
      const previewUpdate = await PaymentService.previewUpdate({
        planId: this.planToUpgrade.planId,
        actionType: 'upgrade',
        subscriptionId: subscription.subscriptionId,
        quantity: subscription.quantity,
        scheduleId: subscription.scheduleId,
      });
      if (previewUpdate) {
        this.discountedPrice = previewUpdate.data.cost;
      }
    },

    async proceedPayment() {
      if (this.updatePaymentLoading) {
        return;
      }
      this.updatePaymentLoading = true;
      const { subscription } = this.$user;

      const params = {
        plan: this.planToUpgrade.planName,
        plan_id: this.planToUpgrade.id,
        plan_interval: this.planToUpgrade.interval,
        role_description: this.$user.userStore?.roleDescription,
        number_of_members: this.quantity,

      };
      this.$analytics.logEvent(this.$webEvents.QFW_PAYMENT_CONFIRM_CLICKED, params);

      const updateSubscription = await PaymentService.updateSubscription({
        planId: this.planToUpgrade.planId,
        actionType: 'upgrade',
        subscriptionId: subscription.subscriptionId,
        quantity: subscription.quantity,
        scheduleId: subscription.scheduleId,
      });

      if (!updateSubscription.error) {
        this.closePaymentModal('success');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 300);
      } else {
        this.paymentError = true;
      }
      this.updatePaymentLoading = false;
    },

    handleBackButton() {
      const params = {
        plan: this.$user.subscription.planName,
        plan_id: this.$user.subscription.id,
        plan_interval: this.$user.subscription.interval,
        role_description: this.$user.userStore?.roleDescription,
        number_of_members: this.seatsToBuy,

      };
      this.$analytics.logEvent(this.$webEvents.QFW_INVITE_PAYMENT_BACK_CLICKED, params);
      this.closePaymentModal('back');
    },
  },

};
</script>

<style scoped>

.payment-error {
  background: #FCDBE3;
}
.bullet-scale{
  transform: scale(0.3);
}
.payment-modal-container{
 border-color: #F2F2F2;
}

.plan-detail{
  background: #F9F9F9;
}

.strikethrough {
  position: relative;
}
.strikethrough:before {
  position: absolute;
  color: black;
  content: "";
  left: 0;
  top: 50%;
  right: 0;
  border-top: 1px solid;
  border-color: inherit;

  -webkit-transform:rotate(-15deg);
  -moz-transform:rotate(-15deg);
  -ms-transform:rotate(-15deg);
  -o-transform:rotate(-15deg);
  transform:rotate(-15deg);
}

</style>

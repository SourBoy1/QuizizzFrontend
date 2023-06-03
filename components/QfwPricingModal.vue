<template>
  <Modal
    :zeroPadding="true"
    :zeroMargin="true"
    :hideHeader="true"
    :fixedHeight="false"
    containerClasses="rounded-sm w-full xs:w-144 overflow-hidden"
    size="custom"
    :shouldCloseOnEscape="true"
    :shouldSubmitOnEnter="false"
    :dismissOnOverlayClick="false"
    :stickToBottom="isMobile"
    @close="$emit('closeQfwPricingModal')"
  >
    <div class="flex flex-col rounded-sm">
      <div class="top-container pt-6 flex flex-col gap-4 justify-center items-center">
        <img
          src="https://cf.quizizz.com/image/qfw_pricing_group.png"
          class="w-[180px] h-[70px] xs:w-[230px] xs:h-[90px]"
        />
        <div class="flex flex-col gap-2 w-90">
          <span
            v-if="productsToShow.length > 0"
            class="text-lilac-dark text-base xs:text-2xl text-center font-semibold"
          >
            <i18n :injections="[getHighestParticipantLimit]"> Engage up to {$1} participants with every activity</i18n>
          </span>
          <span
            v-else
            class="text-lilac-dark w-22 h-10 text-base xs:text-2xl text-center font-semibold shine-div"
          />
          <span class="text-dark-3 text-xs xs:text-sm text-center font-normal">
            <i18n>
              More Participants = Better Engagement
            </i18n>
          </span>
        </div>
      </div>
      <div class="px-3 xs:px-6 flex flex-col gap-4 mt-6">
        <div
          class="rounded-3xl flex gap-2 py-2 justify-center items-center font-semibold"
          :class="[(trialDaysLeft > trialRemainingDaysLimitForWarning) ? 'warning-yellow text-dark-3' : 'bg-red-faded text-red-dark']"
        >
          <FA
            icon="fas fa-warning"
            :class="[trialDaysLeft > trialRemainingDaysLimitForWarning && 'text-yellow']"
            size="14"
          />
          <span class="text-xs xs:text-sm">
            {{ trialExpiryMessage }}
          </span>
        </div>
        <div
          v-if="productsToShow.length > 0"
          class="flex gap-4 p-1"
        >
          <div
            v-for="(product, index) in productsToShow"
            :key="index"
            class="flex flex-col border-t-none plan-card w-40 xs:w-64 px-px pt-px gap-4"
          >
            <div class="flex flex-col bg-light-3 rounded p-4 xs:p-6 gap-4 w-full h-full">
              <div class="flex flex-col gap-1">
                <span class="text-dark-3 text-sm xs:text-base font-semibold"><si18n>{{ getPlanName(product) }}</si18n></span>
                <span class="text-dark-4 text-xxs xs:text-xs font-normal">
                  <i18n>Upto</i18n>
                  <si18n>
                    {{ getParticipantLimit(product) }}
                  </si18n>
                  <i18n>Participants</i18n>
                </span>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex gap-3 items-center">
                  <div
                    v-if="getPlan(product).discounted"
                    class="text-3xl xs:text-5xl font-bold"
                  >
                    {{ getDiscountedDisplayPrice(product) }}
                  </div>
                  <div
                    v-else
                    class="text-3xl xs:text-5xl font-bold"
                    :class="[getPlan(product).discounted ? 'line-through text-dark-4 xs:!text-4xl' : '']"
                  >
                    {{ getDisplayPrice(product) }}
                  </div>
                  <div class="flex flex-col text-xxs xs:text-xs font-normal text-dark-3">
                    <i18n>per host,</i18n>
                    <i18n>per month</i18n>
                  </div>
                </div>
                <div class="text-xxs xs:text-xs font-normal text-dark-4 flex gap-1">
                  {{ getAnnualDisplayPrice(product) }} <i18n>Billed annually</i18n>
                </div>
              </div>
              <Button
                type="primary"
                class="cursor-pointer text-xs xs:text-sm font-semibold"
                :title="getCheckoutBtnTitle(product)"
                :loading="ctaLoading"
                :disabled="ctaLoading"
                @click="upgradePlan(getPlan(product), $event)"
              />
            </div>
          </div>
        </div>
        <div
          v-else
          class="flex gap-4 p-1"
        >
          <div
            v-for="(item, index) in ['', '']"
            :key="item + index"
            class="flex flex-col border-t-none plan-card w-64 h-56 px-[1px] pt-[1px] gap-4 shine-div"
          >
            <div class="flex flex-col bg-light-3 rounded p-6 gap-5 w-full h-full">
              <div class="flex flex-col gap-1">
                <span class="w-10 h-3 rounded bg-dark-6 shine-div font-semibold" />
                <span class="w-15 h-2 rounded bg-dark-6 shine-div font-normal" />
              </div>
              <div class="flex gap-2 items-center">
                <span class="w-10 h-8 rounded bg-dark-6 shine-div font-semibold" />
                <div class="flex flex-col gap-2">
                  <span class="w-15 h-2 rounded bg-dark-6 shine-div font-normal" />
                  <span class="w-15 h-2 rounded bg-dark-6 shine-div font-normal" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <span class="w-20 h-4 rounded bg-dark-6 shine-div font-semibold" />
              </div>
              <div class="shine-div h-8 bg-lilac-faded" />
            </div>
          </div>
        </div>
      </div>
      <div class="text-dark-4 text-xs font-semibold text-center mt-4">
        <span>
          <i18n> Not sure which plan is best for you?</i18n>
        </span>
        <span
          class="text-lilac cursor-pointer"
          @click="handleComparePlans"
        >
          <i18n>
            Compare Plans
          </i18n>
        </span>
      </div>
      <div class="flex items-center border-t-1 border-dashed border-dark-10% pt-2 mt-6 mb-6 mx-auto">
        <div class="description text-dark-3 font-semibold  text-sm">
          <FA
            icon="far fa-building-columns"
            class="text-dark-3 mr-1"
            :size="12"
          />
          <i18n>Want to buy multiple seats for your organization?</i18n>
        </div>
        <Button
          :title="$i18n('Contact Us')"
          size="sm"
          type="secondary"
          class="ml-5"
          @click="onContactUs"
        />
      </div>
    </div>
  </Modal>
</template>
<script>
import { mapGetters } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import ProductsService from '~/services/apis/Products';

export default {

  props: {
    source: {
      type: String,
      default: '',
    },

    feat: {
      type: String,
      default: '',
    },
  },
  emits: ['closeQfwPricingModal'],

  data() {
    return {
      products: [],
      productInterval: 'year',
      redirectTo: this.$user.occupation === 'corporate_learner' ? '/pro/join' : '/admin',
      trialRemainingDaysLimitForWarning: 3,
      ctaLoading: false,
    };
  },

  async created() {
    const { products } = await ProductsService.fetchProducts('corporate_teacher', { onlyListed: true });
    this.products = cloneDeep(products);
  },

  computed: {
    ...mapGetters('root', ['isMobile']),

    productsToShow() {
      return this.products.filter((product) => this.canShowCard(product));
    },

    hasTrialAccount() {
      return this.$user?.isCorporateTrial;
    },

    trialDaysLeft() {
      return this.$user.trialDaysLeft;
    },

    trialExpiryMessage() {
      if (this.trialDaysLeft === 0) {
        return this.$i18n('Your free trial has expired! Upgrade now.');
      }
      return this.$i18n('Your Free trial will expire in {$1} Days. Upgrade now!', [this.trialDaysLeft]);
    },

    getHighestParticipantLimit() {
      let highestParticipantLimit = 0;
      this.productsToShow?.forEach((product) => {
        const participantLimit = this.getParticipantLimit(product);
        if (participantLimit > highestParticipantLimit) {
          highestParticipantLimit = participantLimit;
        }
      });

      return highestParticipantLimit;
    },

  },

  mounted() {
    this.$analytics.logEvent(this.$webEvents.QFW_PRICING_MODAL_SHOWN, { source: this.source, feat: this.feat });
  },

  methods: {
    getPlan(product) {
      return product.plans.find((plan) => get(plan, 'interval', '') === this.productInterval);
    },

    getPlanName(product) {
      return this.getPlan(product).planName;
    },

    handleComparePlans() {
      this.$analytics.logEvent(this.$webEvents.QFW_PRICING_UPSELL_COMPARE_PLANS_CLICKED, { source: this.source, feat: this.feat });
      this.$router.push(`/forwork/plans?source=${this.source}&feat=${this.feat}`);
    },

    getAnnualDisplayPrice(product) {
      let priceString = '';
      const plan = this.getPlan(product);

      if (!isEmpty(plan) && plan.amount) {
        return `$${plan.amount / 100}`;
      }

      if (!isEmpty(plan) && plan.amountLabel) {
        priceString += plan.amountLabel.dollars ? (plan.amountLabel.dollars) : '';
        priceString += plan.amountLabel.cents ? (`.${plan.amountLabel.cents}`) : '';
      }

      if (this.plan.planNameClass === 'intro') {
        return '';
      }

      return priceString ? `$${priceString * 12}` : this.$i18n('Free');
    },

    getCheckoutBtnTitle(product) {
      if (this.isMobile) {
        return this.$i18n('Upgrade');
      }
      return `${this.$i18n('Upgrade to')} ${this.getPlan(product).planName}`;
    },

    getDisplayPrice(product) {
      let string = '';
      const plan = this.getPlan(product);

      if (!isEmpty(plan) && plan.amountLabel) {
        string += plan.amountLabel.dollars ? (`$${plan.amountLabel.dollars}`) : '';
        string += plan.amountLabel.cents ? (`.${plan.amountLabel.cents}`) : '';
      }

      return string || this.$i18n('Free');
    },

    getDiscountedDisplayPrice(product) {
      let string = '';
      const plan = this.getPlan(product);

      if (!isEmpty(plan) && !isEmpty(plan.discounted) && plan.discounted.amountLabel) {
        string += plan.discounted.amountLabel.dollars ? (`$${plan.discounted.amountLabel.dollars}`) : '';
        string += plan.discounted.amountLabel.cents ? (`.${plan.discounted.amountLabel.cents}`) : '';
      }

      return string || '$0';
    },

    getParticipantLimit(product) {
      return this.getPlan(product).priviledges.playerLimit;
    },

    canShowCard(product) {
      const plan = this.getPlan(product);
      if (!plan) {
        return false;
      }
      if (product.group !== 'trainer_trial') {
        if (!plan) {
          return false;
        }
        if (!plan.trial) {
          return true;
        }
      }
      if (this.hasTrialAccount || this.productInterval === 'onetime') {
        return false;
      }
      return true;
    },

    async upgradePlan(plan, event) {
      if (event) {
        event.stopPropagation();
      }
      this.ctaLoading = true;
      if (this.$user.paidOrganization) {
        window.location.href = '/admin/subscription/manage';
      } else if (!this.$user.isLoggedIn) {
        window.location.href = '/signup?source=qfw_pricing_modal';
      } else if (plan.action === 'checkout' || plan.action === 'trial') {
        if (event) {
          this.$analytics.logEvent(this.$webEvents.QFW_PRICING_MODAL_PLANCARD_UPGRADE, {
            plansGroup: plan.group,
            interval: this.productInterval,
            productsShown: this.productsShown,
            hasTrialAccount: this.hasTrialAccount,
            source: this.source || 'qfw-pricing-modal',
            feat: this.feat || 'qfw-pricing-modal',
            variant: 'qfw-pricing-modal',
          });
        }

        await ProductsService.checkoutPlan(plan.planId, {
          cameFrom: 'qfw-pricing-modal',
          redirectTo: this.redirectTo.split('?').length > 1 ? `${this.redirectTo.split('?')[0]}?${encodeURIComponent(this.redirectTo.split('?')[1])}` : this.redirectTo,
          source: this.source || 'qfw-pricing-modal',
          feat: this.source || 'qfw-pricing-modal',
          variant: 'qfw-pricing-modal',
        });
      }
      this.ctaLoading = false;
    },

    onContactUs() {
      this.$analytics.logEvent(this.$webEvents.QFW_PRICING_PAGE_ENTERPRISE_CONTACT_US, { source: 'qfw-upgrade-modal' });
      window.location.href = `https://quizizz.typeform.com/to/JWaaWA?userid=${this.$user ? this.$user.id : null}`;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~/assets/scss/mixins.scss";

.top-container {
  background: linear-gradient(180deg, #EDE6F6 0%, rgba(237, 230, 246, 0) 100%);
}
.plan-card {
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.06), 0px 4px 6px -1px rgba(0, 0, 0, 0.1);
  background: linear-gradient(
      to bottom,
      #A076CC,
      rgba(0, 0, 0, 0)
    );
  border-radius: 4px;
}

.warning-yellow {
  background: #FDF2DF;
}

.shine-div {
  @apply relative;
  @apply overflow-hidden;
  @include shine(1.5s);
}

</style>

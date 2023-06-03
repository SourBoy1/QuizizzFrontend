<template>
  <div>
    <div
      class="flex flex-col items-center justify-evenly md:flex-row md:m-auto md:max-w-260 md:items-end"
    >
      <div
        v-for="(product) in productsToShow"
        :key="product.group"
      >
        <div>
          <transition
            appear
            enter-active-class="animate__animated animate__zoomIn animation-duration-300 animation-delay-300"
            leave-active-class="animate__animated animate__fadeOut animation-duration-200 "
          >
            <QfwPricingUpgradeCard
              v-if="getAnnualPlan(product.plans)"
              :plan="getAnnualPlan(product.plans)"
              :isTrial="isTrial"
              @click="upgradePlan"
            />
          </transition>
        </div>
      </div>
      <QfwDashboardQfwPlanUpgrade
        v-if="qfwPaymentModalOpen"
        :closePaymentModal="closeQfwPaymentModal"
        :planToUpgrade="currentQfwSelectedPlan"
      />
    </div>
    <div
      v-if="isTrial"
      class="text-sm text-dark-3 text-center p-3 w-4/5 m-auto"
    >
      <i18n>By clicking on upgrade, your trial will end and you will be charged for the annual plan.</i18n>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';

export default {

  props: {
    products: {
      type: Array,
      default: () => [],
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      productInterval: 'year',
      qfwPaymentModalOpen: false,
      ctaLoading: false,
      currentQfwSelectedPlan: {},
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    productsToShow() {
      return this.products.filter((product) => this.canShowCard(product));
    },
  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },

  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    canShowCard(product) {
      if (product.group === 'trainer_t1' || product.group === 'trainer_t2') {
        return true;
      }
      return false;
    },

    getAnnualPlan(plans) {
      return plans.find((x) => x.interval === 'year');
    },

    closeQfwPaymentModal(param) {
      const eventName = this.$webEvents.QFW_PLAN_MODAL_CLOSED;
      if (param !== 'success') {
        this.$analytics.logEvent(eventName, {});
        this.qfwPaymentModalOpen = false;
      } else {
        this.$store.dispatch('uiManager/toggleQfwModal');
        window.location.reload();
      }
    },

    upgradePlan(plan) {
      const eventName = this.$webEvents.QFW_PLAN_BUTTON_CLICKED;
      this.$analytics.logEvent(eventName, {
        id: plan.id,
      });
      this.qfwPaymentModalOpen = true;
      this.currentQfwSelectedPlan = plan;
    },
  },
};

</script>

<style scoped>

</style>

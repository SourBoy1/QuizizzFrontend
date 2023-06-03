<template>
  <div class="locked-qfw-content-modal absolute h-full w-full z-10 flex flex-col justify-center items-center">
    <div class="flex space-x-6 bg-light p-8 rounded shadow-elevation-hard max-w-[654px]">
      <div>
        <div class="flex items-center justify-center bg-lilac-faded w-20 h-20 rounded-full">
          <FA
            icon="fas fa-user-lock"
            class="text-lilac-dark"
            :size="32"
          />
        </div>
      </div>
      <div class="description">
        <div class="text-xl font-bold text-dark-2">
          <i18n>Your Free trial has expired!</i18n>
        </div>
        <div class="mt-1 text-dark-4 font-semibold">
          <i18n>But don’t worry, all your data is safe. Get access now by simply upgrading!</i18n>
        </div>
        <div class="mt-6 flex space-x-6">
          <Button
            :title="$i18n('UPGRADE')"
            size="md"
            type="primary"
            buttonClasses="py-2 max-w-46 w-full text-normal h-auto"
            @click="onUpgrade"
          />
        </div>
      </div>
    </div>
    <div class="bg-light p-8 rounded shadow-elevation-hard max-w-[654px] mt-0.5">
      <div class="text-lg font-semibold text-lilac-dark">
        <i18n>50,000+ organizations supported</i18n>
      </div>
      <div class="testimonial flex items-start space-x-4 mt-6">
        <img
          class="w-18 object-contain"
          src="https://cf.quizizz.com/img/testimonials/user-3.png"
        />
        <div class="font-semibold text-dark-4">
          <i18n>The platform has multiple options for gameplay, and a visual interface which is pleasing for the audience. I have tested other similar platforms and can easily and confidently state that Quizizz is the best.</i18n>
        </div>
      </div>
      <div class="signature text-sm text-dark-2 mt-6">
        DYU D'CUNHA
        <br>
        <i18n>Co-Founder</i18n>, OnStage Experiences
      </div>
    </div>
  </div>
</template>

<script>
import ProductsService from '~/services/apis/Products';
import { getPageTitleForInhouseEvents } from '~/config/PageTitles';

export default {
  emits: [],
  created() {
    this.$eventBus.$emit('sidebar:disable', true);
    this.$eventBus.$emit('mainHeaderSearchBar:disable', true);

    this.$analytics.logEvent(this.$webEvents.QFW_LOCKED_CONTENT_MODAL_SHOWN);
  },

  methods: {
    redirectToCorporatePricing() {
      const fromPage = getPageTitleForInhouseEvents(this.$route.path);
      this.$eventBus.$emit('qfwPricingModal:show', { source: 'trial-expired', feat: fromPage });
    },

    onUpgrade() {
      this.$analytics.logEvent(this.$webEvents.QFW_LOCKED_CONTENT_MODAL_UPGRADE_CTA_CLICKED, {
        route: this.$route.fullPath,
      });

      this.redirectToCorporatePricing();
    },
  },
};
</script>

<style lang="scss" scoped>
.locked-qfw-content-modal {
    background: rgba(255, 255, 255, 0.95);
}
</style>

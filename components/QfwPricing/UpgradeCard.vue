<template>
  <div class="bg-light mb-3 md:mb-0 w-80 h-auto p-6 md:p-8 rounded-2xl text-center m-auto flex flex-col justify-start border-lilac md:border-2 rounded-b-2xl">
    <h2 class="text-2xl md:text-4xl font-bold">
      {{ plan.planName }}
    </h2>
    <div class="h-52">
      <div class="text-sm md:text-base font-medium mb-2 mt-5">
        {{ $i18n('TOP FEATURES') }}
      </div>
      <div
        v-for="(feature, thisIndex) in getFeaturesForProduct(plan)"
        :key="thisIndex"
      >
        <div
          class="text-xs md:text-sm text-dark-4 mb-2 mt-2 md:mb-1"
        >
          {{ feature }}
        </div>
      </div>
    </div>

    <div class="w-18 max-h-2 m-auto mt-3 mb-5 border-t-1 border-dark-6" />

    <div>
      <div class="text-2xl md:text-4xl font-extralight">
        {{ getDisplayPrice }}
      </div>
      <div class="text-xs md:text-base text-dark-3 m-auto leading-tight max-w-64 font-extralight">
        {{ getDisplayPriceSubtext }}
      </div>
    </div>

    <div class="mt-3 md:mt-3">
      <Button
        class="p-5 m-auto bg-dark-4"
        :title="$i18n('Upgrade')"
        titleClasses="text-sm md:text-base"
        type="primary"
        size="xl"
        :loading="loadingOn"
        :disabled="ctaLoading"
        @click="upgradePlan(plan)"
      />
    </div>
  </div>
</template>

<script>

import $axios from '~/services/AxiosService.js';

export default {

  props: {
    plan: {
      type: Object,
      default: () => ({}),
    },
    productInterval: {
      type: String,
      default: '',
    },
    ctaLoading: {
      type: Boolean,
      default: false,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],

  data() {
    return {
      loadingOn: false,
    };
  },

  computed: {
    getDisplayPrice() {
      let string = '';
      const { plan } = this;

      if (plan && plan.amount) {
        string += `$${plan.amount / 100}`;
      }

      return string || this.$i18n('Free');
    },

    getDisplayPriceSubtext() {
      return this.$i18n('Per year, per host');
    },
  },

  methods: {

    async upgradePlan(plan) {
      if (this.isTrial) {
        this.loadingOn = true;
        await $axios().post('/trial/cancel');
      }
      this.loadingOn = false;
      this.$emit('click', plan);
    },

    getFeaturesForProduct(product) {
      let features = [];
      const playerLimit = product?.priviledges?.playerLimit || 100;

      switch (product.group) {
        case 'trainer_t1':
          features = [
            `✌️ ${this.$i18n('Up to ')}${playerLimit}${this.$i18n(' participants per quiz and 750 per presentation')}`,
            `🖼️ ${this.$i18n('Add your logo and branding')}`,
            `📨 ${this.$i18n('Participant email export')}`,
            `⚙ ${this.$i18n('Assign trainings and track progress')}`,
          ];
          break;
        case 'trainer_t2':
          features = [
            `☝️ ${this.$i18n('Up to ')}${playerLimit}${this.$i18n(' participants per activity')}`,
            `🏆 ${this.$i18n('Unlimited quizzes and presentations')}`,
            `💻 ${this.$i18n('Collaborate with team members')}`,
            `📊 ${this.$i18n('Unlimited instant reports')}`,
          ];
          break;

        default:
          features = [
            `⁉️ ${this.$i18n('Every poll and quiz question type')}`,
            `🏡 ${this.$i18n('In-person and remote instruction')}`,
            `🗓️ ${this.$i18n('Schedule activities in advance')}`,
            `📱 ${this.$i18n('Participants join from any device')}`,
          ];
      }

      return features;
    },
  },
};
</script>

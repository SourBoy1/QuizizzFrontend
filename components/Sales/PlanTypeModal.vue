<template>
  <Modal
    class="plan-type-modal"
    :title="$i18n('Select Plan Type')"
    subtitle=""
    size="md"
    :button1="{
      title: $i18n('CONTINUE'),
    }"
    @button1-click="submitPlanType"
    @close="handleClose"
  >
    <SalesDivider class="m-0-important" />
    <h3 class="mt-4">
      <i18n>K-12</i18n>
    </h3>
    <div class="radio-group flex flex-col">
      <Radio
        v-for="(key, index) in Object.keys(planTypes['K-12'])"
        :key="index"
        :checked="planType === planTypes['K-12'][key]"
        :inputId="getUUID()"
        name="planType"
        size="md"
        :label="$stringUtils.toSentenceCase(planTypes['K-12'][key])"
        class="pt-2.5"
        @change="changePlanType(planTypes['K-12'][key])"
      />
    </div>
    <h3 class="pt-6">
      <i18n>Others</i18n>
    </h3>
    <div class="radio-group flex flex-col">
      <Radio
        v-for="(key, index) in Object.keys(planTypes['Others'])"
        :key="index"
        :inputId="getUUID()"
        name="planType"
        size="md"
        :label="$stringUtils.toSentenceCase(planTypes['Others'][key])"
        class="pt-2.5"
        @change="changePlanType(planTypes['Others'][key])"
      />
    </div>
    <SalesDivider />
  </Modal>
</template>

<script>

import salesConstants from '~/config/Sales';
import { getUUID } from '~/services/UIDService.js';
import '~/assets/scss/sales.scss';

export default {
  emits: ['submitPlanType', 'togglePlanTypeModal'],
  data() {
    return {
      planType: 'district',
      planTypes: salesConstants.planTypes,
    };
  },

  methods: {
    changePlanType(planType) {
      this.planType = planType;
    },
    submitPlanType() {
      this.$store.dispatch('sales/resetNewSubFlow');
      this.$emit('submitPlanType', this.planType);
    },

    getUUID() {
      return getUUID();
    },

    handleClose() {
      this.$eventBus.$emit('togglePlanTypeModal');
      this.$router.push('/sales');
    },
  },
};

</script>

<style scoped>
:deep() .radiobox.md .radiobox__label.has-label::after {
  top: 6.5px !important;
}
</style>

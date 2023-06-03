<template>
  <div
    class="
      mb-20
      pb-8
      relative
      overview
    "
    :class="isModal === false ? 'border border-sm border-dark-6 bg-light-1 rounded p-6 mt-5 pt-6 shadow-md' : '' "
  >
    <div
      v-if="isModal === false"
      class="font-bold text-md"
    >
      <i18n>Details</i18n>
      <span
        @click="editDistrict"
      ><i18n class="float-right text-xs cursor-pointer"> EDIT </i18n></span>
    </div>
    <SalesDivider v-if="isModal === false" />
    <div
      v-for="obj in details"
      :key="obj.value + obj.name"
      class="flex mt-4"
    >
      <div class="w-1/4 font-bold text-xs">
        {{ $i18n('{$1}', [obj.name]) }}
      </div>
      <div class="w-3/4 font-normal text-xs">
        {{ $i18n('{$1}', [obj.value]) }}
      </div>
    </div>
  </div>
</template>
<script>
import salesConstants from '~/config/Sales';

export default {
  props: {
    details: {
      type: Array,
      default: () => [],
    },
    isModal: {
      type: Boolean,
      default: false,
    },
    subscriptionId: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
    planType: {
      type: String,
      default: '',
    },
  },
  emits: ['editOrgModal'],

  data() {
    return {
      planTypes: salesConstants.planTypes,
    };
  },

  computed: {
    isDistrict() {
      return [this.planTypes['K-12'].DISTRICT].includes(this.planType);
    },

    isDepartment() {
      return [this.planTypes['K-12'].DEPARTMENT].includes(this.planType);
    },

    isSchoolOrDepartment() {
      return [this.planTypes['K-12'].SCHOOL, this.planTypes['K-12'].DEPARTMENT].includes(this.planType);
    },

    isInternational() {
      return this.planType === this.planTypes['K-12'].INTERNATIONAL;
    },

    isMisc() {
      return this.planType === this.planTypes.Others.MISC;
    },

    isInternationalOrMisc() {
      return [this.planTypes['K-12'].INTERNATIONAL, this.planTypes.Others.MISC].includes(this.planType);
    },
  },

  created() {
  },

  methods: {
    editDistrict() {
      // TODO: check organization type
      if (this.isDistrict) {
        this.$router.push(`/sales/organizations/${this.subscriptionId}/edit?id=${this.id}`);
      } else {
        this.$emit('editOrgModal');
      }
    },
  },
};
</script>

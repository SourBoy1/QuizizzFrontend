<template>
  <Modal
    class="edit-school-modal"
    :title="title"
    subtitle=""
    size="md"
    :button1="{
      title: $i18n('CANCEL'),
      type: 'secondary',
    }"
    :button2="{
      title: button2Title,
    }"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="onAddOrg"
  >
    <section
      v-if="!shouldShowDistrictModal"
      class="add-or-edit-school-section"
    >
      <SalesDivider :noMarginTop="true" />
      <div class="grid grid-cols-2 gap-6 mt-1">
        <Input
          v-model="orgData.name"
          :placeholder="$i18n('Aberdeen High School')"
          :label="orgNameLabel"
        />
        <template v-if="!isEditDisplayNameModal">
          <SelectBox
            v-if="isMisc || pickedPlanType === 'other'"
            v-model="orgData.type"
            class="self-end"
            size="md"
            :label="$i18n('{$1} Type', [orgTypeToDisplay])"
            :placeholder="$i18n('Select Type')"
            :list="miscTypes"
          />
          <SelectBox
            v-if="!isNotSchool && !isMisc && pickedPlanType !== 'other' && !isPaidFlowInternational && !isInternational"
            v-model="orgData.type"
            class="self-end"
            size="md"
            :label="$i18n('{$1} Type', [orgTypeToDisplay])"
            :placeholder="$i18n('Select Type')"
            :list="schoolTypes"
          />
          <Input
            v-if="title === $i18n('Add International School')"
            v-model="orgData.country"
            :placeholder="$i18n('US')"
            :label="$i18n('Country')"
          />
          <Input
            v-model="orgData.address"
            :placeholder="$i18n('1-3-A/12-13')"
            :label="$i18n('Address*')"
            :errorMessage="errors.address.isError ? errors.address.message : ''"
          />
          <Input
            v-model="orgData.zip"
            :placeholder="$i18n('(123) 456-7890')"
            :label="$i18n('Zip Code*')"
            :errorMessage="errors.zip.isError ? errors.zip.message : ''"
          />
          <!-- //TODO #migration check v-model -->
          <SalesSelect
            v-if="!isNotSchool && !isInternational && !isPaidFlowInternational"
            v-model="orgData.state"
            class="w-51"
            :value="orgData.state"
            :options="statesInUS"
            :firstOption="$i18n('Select State')"
            :label="$i18n('State')"
          />
          <SalesSelect
            v-if="!isInternational && !isPaidFlowInternational"
            v-model="orgData.city"
            class="w-51"
            :value="orgData.city"
            :options="citiesForSelectedStated"
            :firstOption="$i18n('Select City')"
            :label="$i18n('City')"
          />
          <SalesSelect
            v-if="isInternational || isPaidFlowInternational"
            v-model="orgData.country"
            class="mb-4 max-w-60"
            :value="orgData.country"
            :options="countryList"
            :firstOption="$i18n('Select Country')"
            :label="$i18n('Country*')"
            :errorMessage="errors.country.isError ? errors.country.message : ''"
          />
          <Input
            v-if="isInternational || isPaidFlowInternational"
            v-model="orgData.city"
            arrowIcon="fas fa-caret-down"
            :label="$i18n('City*')"
            :placeholder="$i18n('City')"
            :errorMessage="errors.city.isError ? errors.city.message : ''"
          />
        </template>
      </div>
      <SalesDivider />
    </section>
    <SalesCreateDistrict
      v-else
      ref="createDistrict"
      class="add-or-edit-district-section"
      @addDistrictSuccessResponse="onAddOrgSuccessResponse"
    />
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import '../../assets/scss/sales.scss';

import salesConstants from '~/config/Sales';
import salesService from '~/services/apis/SalesService.js';
import { citiesInStatesOfUS } from '~/config/CitiesOfStatesInUS';

export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    isNotSchool: {
      type: Boolean,
      default: false,
    },
    orgDetails: {
      type: Object,
      default: () => {},
    },
    button2Title: {
      type: String,
      default: '',
    },
    orgType: {
      type: String,
      default: '',
    },
    isEditModal: {
      type: Boolean,
      default: false,
    },
    isEditDisplayNameModal: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],

  data() {
    const orgData = {
      id: this.orgDetails.id || undefined,
      name: this.orgDetails.name || undefined,
      type: this.orgDetails.type || undefined,
      address: this.orgDetails.address || undefined,
      zip: this.orgDetails.zip || undefined,
      state: this.orgDetails.state || undefined,
      city: this.orgDetails.city || undefined,
      country: this.orgDetails.country || undefined,
      orgType: this.orgDetails.orgType || undefined,
    };
    return {
      statesInUS: salesConstants.statesListForSelect,
      countryList: salesConstants.countryListForSelect,
      orgData,
      schoolTypes: salesConstants.schoolTypes,
      miscTypes: salesConstants.miscTypes,
      planTypes: salesConstants.planTypes,
      planType: orgData.orgType,
      errors: {
        address: {
          isError: false,
          message: this.$i18n('Please enter address'),
        },
        zip: {
          isError: false,
          message: this.$i18n('Please enter zipcode'),
        },
        country: {
          isError: false,
          message: this.$i18n('Please enter country name'),
        },
        city: {
          isError: false,
          message: this.$i18n('Please enter city name'),
        },
      },
    };
  },

  computed: {
    ...mapGetters('sales', ['isDistrict', 'isMisc', 'newSubStepIndex', 'orgTypeToDisplay', 'isInternational', 'paidOrgSelectedTab', 'pickedPlanType']),
    shouldShowDistrictModal() {
      if (!this.$route.path.match(/new\/?$/)) {
        return this.paidOrgSelectedTab === 'districts';
      }
      return !((!this.isDistrict && this.newSubStepIndex === 0) || (this.isDistrict && this.newSubStepIndex !== 0));
    },

    orgNameLabel() {
      return this.isEditDisplayNameModal ? this.$i18n('Display Name') : this.$i18n('{$1} Name', [this.orgTypeToDisplay]);
    },
    isPaidFlowInternational() {
      return (this.pickedPlanType === 'school' && this.orgData.country !== 'US' && this.orgData.country !== undefined);
    },
    citiesForSelectedStated() {
      return citiesInStatesOfUS && citiesInStatesOfUS[this.orgData?.state].map((city) => ({
        title: city,
        value: city,
      }));
    },
  },

  watch: {
    orgDetails: {
      deep: true,
      handler(newValue) {
        this.$store.dispatch('sales/pickPlanType', newValue);
      },
    },
  },

  methods: {
    checkErrors() {
      this.errors.address.isError = this.orgData.address === undefined;
      this.errors.zip.isError = this.orgData.zip === undefined;
      this.errors.city.isError = this.orgData.city === undefined;
      this.errors.country.isError = this.orgData.country === undefined;
    },

    onAddOrg() {
      this.checkErrors();
      if (this.shouldShowDistrictModal) {
        this.$refs.createDistrict.addDistrict();
      } else if (this.pickedPlanType === this.planTypes['K-12'].INTERNATIONAL) {
        if (this.orgData.country) {
          this.onAddSchool();
        }
      } else {
        this.onAddSchool();
      }
    },

    async onAddSchool() {
      if (this.isEditModal) {
        const response = await salesService.updateOrg(this.orgData);
        if (response.success) {
          this.$emit('close');
          if (this.isDistrict) {
            setTimeout(() => {
              this.$eventBus.$emit('sales:getSchoolsInDistrict');
            }, 500);
            setTimeout(() => {
              this.$eventBus.$emit('sales:getPaidSchoolsInDistrict');
            }, 500);
          } else if (!this.isMisc) {
            this.$eventBus.$emit('sales:getOrgOverview');
          } else {
            // TODO: show edit misc modal
            this.$eventBus.$emit('sales:getOrgOverview');
          }
        }
      } else {
        this.orgData = { ...this.orgData, country: this.orgData.country ?? 'US' };
        const response = await salesService.createOrg(this.orgData);
        if (response.success) {
          this.onAddOrgSuccessResponse({
            _source: {
              id: response.org._id,
              parentOrgId: response.org.parentOrgId,
              name: response.org.name,
              state: response.org.state,
            },
          });
        }
      }
    },

    onAddOrgSuccessResponse(org) {
      this.$eventBus.$emit('sales:addOrgSuccessResponse', org);
      this.$emit('close');
    },
  },
};
</script>

<style scoped></style>

<template>
  <div>
    <SalesDivider />
    <section>
      <div class="grid grid-cols-2 gap-6 mb-4">
        <Input
          v-model="districtData.districtName"
          class="mr-6 max-w-60"
          :inputId="getUUID()"
          :label="$i18n('District Name *')"
          :errorMessage="errors.districtName.isError ? errors.districtName.message : ''"
          placeholder=" "
        />
        <SelectBox
          v-model="districtData.districtType"
          :label="$i18n('District Type *')"
          class="mb-4 max-w-60"
          :list="selectBoxDistrictType"
          :errorMessage="errors.districtType.isError ? errors.districtType.message : ''"
        />
        <SalesSelect
          v-model="districtData.state"
          class="mb-4 max-w-60"
          :value="districtData.state"
          :options="statesInUS"
          :firstOption="$i18n('Select State')"
          :label="$i18n('State *')"
        />
        <Input
          v-model="districtData.county"
          class="mb-4 max-w-60"
          :inputId="getUUID()"
          :label="$i18n('County *')"
          placeholder=" "
          :errorMessage="errors.county.isError ? errors.county.message : ''"
        />
        <SelectBox
          v-model="districtData.lowestGrade"
          :label="$i18n('Lowest Grade *')"
          class="mb-4 max-w-60"
          :list="grade"
          :errorMessage="errors.lowestGrade.isError ? errors.lowestGrade.message : ''"
        />
        <SelectBox
          v-model="districtData.highestGrade"
          :label="$i18n('Highest Grade *')"
          class="mb-4 max-w-60"
          :list="grade"
          :errorMessage="errors.highestGrade.isError ? errors.highestGrade.message : ''"
        />
        <Input
          v-model="districtData.publicSchools"
          class="mr-6 max-w-60"
          :inputId="getUUID()"
          :label="$i18n('# of Public Schools')"
          placeholder=" "
        />
        <Input
          v-model="districtData.operationalSchools"
          class="mr-6 max-w-60"
          :inputId="getUUID()"
          :label="$i18n('# of Operational Schools')"
          placeholder=" "
        />
        <Input
          v-model="districtData.enrolled"
          class="mr-6 max-w-60"
          :inputId="getUUID()"
          :label="$i18n('Students Enrolled *')"
          :errorMessage="errors.enrolled.isError ? errors.enrolled.message : ''"
          placeholder=" "
        />
        <Input
          v-model="districtData.fullTime"
          class="mr-6 max-w-60"
          :inputId="getUUID()"
          :label="$i18n('Full Time Equivalent')"
          placeholder=" "
        />
        <Input
          v-model="districtData.studentTeacher"
          class="mr-6 max-w-60"
          :inputId="getUUID()"
          :label="$i18n('Student Teacher Ratio')"
          placeholder=" "
        />
      </div>
    </section>
    <SalesDivider />
  </div>
</template>

<script>

import { mapGetters } from 'vuex';

import Grades from '~/config/Grades.js';

import { getUUID } from '~/services/UIDService.js';

import '~/assets/scss/sales.scss';

import orgConfig from '~/config/OrgConfig';
import salesService from '~/services/apis/SalesService.js';
import salesConstants from '~/config/Sales';

export default {
  layout: 'salesDashboard',
  emits: ['addDistrictSuccessResponse'],
  data() {
    return {
      statesInUS: salesConstants.statesListForSelect,
      hasDistrictFormErrors: {},
      districtData: {
        districtType: '',
        districtName: '',
        state: '',
        county: '',
        lowestGrade: '',
        highestGrade: '',
        publicSchools: '',
        operationalSchools: '',
        enrolled: '',
        fullTime: '',
        studentTeacher: '',
      },

      errors: {
        districtName: {
          isError: false,
          message: this.$i18n('Please enter name'),
        },
        state: {
          isError: false,
          message: this.$i18n('Please enter state'),
        },
        county: {
          isError: false,
          message: this.$i18n('Please enter county'),
        },
        lowestGrade: {
          isError: false,
          message: this.$i18n('Please select grade'),
        },
        highestGrade: {
          isError: false,
          message: this.$i18n('Please select grade'),
        },
        enrolled: {
          isError: false,
          message: this.$i18n('Please enter students enrolled'),
        },
        districtType: {
          isError: false,
          message: this.$i18n('Please select district type'),
        },
      },

      selectBoxDistrictType: orgConfig?.districtType?.map((type) => ({
        title: type.title,
        value: type.title,
      })),
      grade: Grades.map((grade) => ({
        title: grade.text,
        value: grade.text,
      })),
    };
  },

  computed: {
    ...mapGetters('sales', ['pickedPlanType']),
  },

  watch: {
    districtData: {
      handler(newValue) {
        Object.keys(newValue).forEach((key) => {
          if (newValue[key].length > 0 && this.errors[key]) {
            this.errors[key].isError = false;
            this.hasDistrictFormErrors[key] = false;
          }
        });
      },

      deep: true,
    },
  },

  methods: {
    getUUID() {
      return getUUID();
    },

    resetDistrictForm() {
      Object.keys(this.districtData).forEach((v) => { this.districtData[v] = ''; });
    },

    checkErrors() {
      Object.keys(this.errors).forEach((key) => {
        if (this.districtData[key].length === 0) {
          this.errors[key].isError = true;
          this.hasDistrictFormErrors[key] = true;
        }
      });
    },

    cancelAddNewDistrict() {
      this.$router.back();
    },

    hasDistrictErrors() {
      return !!Object.keys(this.hasDistrictFormErrors).find((key) => !!this.hasDistrictFormErrors[key]);
    },

    async addDistrict() {
      this.checkErrors();
      if (!this.hasDistrictErrors()) {
        const districtPayload = {
          name: this.districtData.districtName,
          county: this.districtData.county,
          state: this.districtData.state,
          lowGrade: this.districtData.lowestGrade,
          highGrade: this.districtData.highestGrade,
          organizationMetadata: {
            type: this.districtData.districtType,
            numberOfPublicSchools: this.districtData.publicSchools || undefined,
            numberOfOperationalSchools: this.districtData.operationalSchools || undefined,
            studentTeacherRatio: this.districtData.studentTeacher || undefined,
            enrolled: parseInt(this.districtData.enrolled, 10) || undefined,
          },

          organizationType: 'district',
        };
        const response = await salesService.addNewDistrict(districtPayload);

        if (response.success) {
          this.$emit('addDistrictSuccessResponse', {
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
  },
};
</script>

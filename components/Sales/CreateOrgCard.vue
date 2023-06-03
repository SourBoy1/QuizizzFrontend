<template>
  <div class="create-school-card w-full bg-dark-1 h-8 text-light-1 text-xs rounded-b-lg flex items-center justify-center">
    <i18n>Did not find what you were looking for?</i18n><span
      class="border-b-1 cursor-pointer ml-1"
      @click="$emit('click')"
    >{{ title }}</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import salesConstants from '~/config/Sales';

export default {
  props: {
    planType: {
      type: String,
      default: 'District',
    },
  },
  emits: ['click'],

  data() {
    return {
      planTypes: salesConstants.planTypes,
    };
  },

  computed: {
    ...mapGetters('sales', ['newSubStepIndex', 'paidOrgSelectedTab']),

    title() {
      if (!this.$route.path.match(/new\/?$/) && this.paidOrgSelectedTab === 'districts') {
        return this.$i18n('Create a District');
      }

      let orgType;
      if (this.newSubStepIndex === 1 && this.isOrgSchoolOrDepartment) {
        orgType = this.$i18n('District');
      } else if (this.newSubStepIndex === 0 && this.isDepartment) {
        orgType = this.$i18n('School');
      } else {
        orgType = this.$stringUtils.toSentenceCase(this.planType);
      }
      return this.$i18n('Create a {$1}', [orgType]);
    },

    isOrgSchoolOrDepartment() {
      return [this.planTypes['K-12'].SCHOOL, this.planTypes['K-12'].DEPARTMENT].includes(this.planType);
    },

    isDepartment() {
      return [this.planTypes['K-12'].DEPARTMENT].includes(this.planType);
    },

  },
};
</script>

<style scoped>

</style>

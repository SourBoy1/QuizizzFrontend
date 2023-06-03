<template>
  <Modal
    class="unkink-confirm-modal"
    title=""
    subtitle=""
    size="md"
    :button1="{
      title: $i18n('CANCEL'),
      type: 'transparent-floating-dark',
    }"
    :button2="{
      title: $i18n('CONFIRM'),
      type: 'secondary',
    }"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="handleUnlinkSchool"
  >
    <div class="h-14 flex align-center justify-center">
      <p class="text-base p-2">
        {{ $i18n("Unlinking “{$1}” from “{$2}”", [org.name, org.district]) }}
      </p>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import salesConstants from '~/config/Sales';
import salesService from '~/services/apis/SalesService.js';

export default {

  props: {
    org: {
      type: Object,
      default: () => {},
    },
    parentOrgId: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'schoolUnlinked'],

  data() {
    return {
      planTypes: salesConstants.planTypes,
      linkedSchool: {
        orgIds: [this.org.id],
        parentOrgId: this.parentOrgId,
      },
    };
  },

  computed: {
    ...mapGetters('sales', ['pickedPlanType']),
  },

  methods: {
    async handleUnlinkSchool() {
      await salesService.unLinkSchool(this.linkedSchool);
      this.$eventBus.$emit('schoolUnlinked');
      this.$emit('close');
      if (this.pickedPlanType === salesConstants.planTypes['K-12'].DISTRICT) {
        setTimeout(() => {
          this.$eventBus.$emit('sales:getSchoolsInDistrict');
        }, 1000);
      } else if (this.pickedPlanType === salesConstants.planTypes['K-12'].SCHOOL) {
        setTimeout(() => {
          this.$eventBus.$emit('sales:unlinkDistrictSuccess');
        }, 1000);
      }
      setTimeout(() => {
        this.$eventBus.$emit('sales:getPaidSchoolsInDistrict');
      }, 1000);
    },
  },
};
</script>

<style scoped></style>

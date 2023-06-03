<template>
  <Modal
    class="link-school-modal"
    title="Link School"
    subtitle=""
    size="lg"

    :button1="{
      title: $i18n('CANCEL'),
      type: 'secondary',
    }"
    :button2="{
      disabled: linkedSchool.orgIds.length === 0,
      title: $i18n('LINK'),
      type: 'primary',
    }"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="handleLinkSchool"
  >
    <SalesDivider class="m-0-important" />
    <div class="h-112">
      <div class="w-full flex flex-col my-4">
        <div class="flex items-end w-full">
          <div class="w-1/2 mr-6">
            <Input
              id="search-schools"
              v-model="searchFilters.orgName"
              :placeholder="$i18n('TJ High School')"
              label="School Name"
              @keyup.enter="searchOrgs"
            />
          </div>
          <Input
            v-model="searchFilters.orgState"
            class="w-50-important"
            :disabled="true"
            :label="$i18n('State')"
            :placeholder="$i18n('CA')"
            maxlength="2"
            @keyup.enter="searchOrgs"
          />
        </div>
        <Button
          class="py-1 px-4 w-26 h-8 rounded mt-4"
          type="secondary"
          :title="$i18n('SEARCH')"
          buttonType="submit"
          licon="fa fa-search"
          size="xs"
          @click="searchOrgs"
        />
        <SalesDivider />
      </div>
      <div
        v-if="isCreateSchoolBannerVisible"
        class="mt-4 max-h-68 overflow-y-auto"
      >
        <SalesTable
          :data="schoolsData"
          :selectedItem="selectedOrgIndex"
          :isRowClickable="true"
          @click="getSelectedSchool"
          @link-click="handleLinkClick"
        />
        <SalesCreateOrgCard
          planType="School"
          @click="$eventBus.$emit('onCreateOrg', orgModalDetails)"
        />
        <Pagination
          :pageNumber="searchFilters.page"
          :totalEntities="totalNoOfOrgs"
          :pageSize="searchFilters.pageSize"
          :startingPageIndex="1"
          :isLoading="false"
          @pageChange="onPageChange"
        />
      </div>
      <SalesDivider
        v-if="hasSchools"
        class="mt-0"
      />
      <SalesDivider
        v-else
        class="mt-72"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import salesConstants from '~/config/Sales';
import '../../assets/scss/sales.scss';
import salesService from '~/services/apis/SalesService.js';

export default {
  props: {
    showTable: {
      type: Boolean,
      default: false,
    },
    state: {
      type: String,
      default: '',
    },
    parentOrgId: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'onCreateOrg', 'orgNameLinkClick'],

  data() {
    return {
      planTypes: salesConstants.planTypes,
      fetchedSchoolsInState: [],
      selectedOrgIndex: -1,
      searchFilters: {
        ...salesConstants.unpaidOrgsSearchFilters, orgName: '', orgState: this.state, pageSize: 20, page: 1,
      },
      schoolsData: {
        head: {
          _id: '',
          Radio: '',
          LinkName: 'School Name',
          cityName: 'City',
        },

        body: [],
      },

      linkedSchool: {
        parentOrgId: this.parentOrgId,
        orgIds: [],
      },
      orgModalDetails: {
        title: this.$i18n('Add School'),
        button2Title: this.$i18n('ADD SCHOOL'),
        orgType: salesConstants.planTypes['K-12'].SCHOOL,
      },

      isCreateSchoolBannerVisible: false,
      totalNoOfOrgs: 0,
    };
  },

  computed: {
    ...mapGetters('sales', ['pickedPlanType']),
    hasSchools() {
      return this.schoolsData?.body?.length;
    },
  },

  methods: {
    getSelectedSchool({ itemId, itemIndex }) {
      this.linkedSchool.orgIds = [itemId];
      this.selectedOrgIndex = itemIndex;
    },

    handleLinkClick(itemId, columnKey) {
      if (columnKey === 'LinkName') {
        const orgDetails = this.fetchedSchoolsInState.find((org) => org._source.id === itemId);
        this.$eventBus.$emit('orgNameLinkClick', { source: orgDetails._source, plan: this.planTypes['K-12'].SCHOOL });
      }
    },

    async searchOrgs() {
      const response = await salesService.searchOrgs({ ...this.searchFilters, orgType: salesConstants.planTypes['K-12'].SCHOOL }, 'schools in the selected state');
      this.showFetchedOrgs(response.orgs);
      this.fetchedSchoolsInState = response.orgs;
      this.totalNoOfOrgs = response.numberOfHits;
      this.isCreateSchoolBannerVisible = response.success;
    },

    async handleLinkSchool() {
      const response = await salesService.linkSchool(this.linkedSchool);
      if (response.success) {
        this.$emit('close');
        setTimeout(() => {
          this.$eventBus.$emit('sales:getSchoolsInDistrict');
        }, 1000);
        setTimeout(() => {
          this.$eventBus.$emit('sales:getPaidSchoolsInDistrict');
        }, 1000);
      }
    },

    showFetchedOrgs(schools) {
      this.schoolsData.body = schools.map((school) => ({
        _id: school._source.id,
        Radio: '',
        id: school._source.id,
        LinkName: school._source.name || '-',
        cityName: school._source.city || '-',
      }));
    },

    onPageChange(pageNumber) {
      this.searchFilters.page = pageNumber;
      this.searchOrgs();
    },
  },
};
</script>

<style scoped>

</style>

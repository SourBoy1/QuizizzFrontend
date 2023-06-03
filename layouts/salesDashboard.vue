<template>
  <div class="sales-dashboard-layout">
    <ToastManager />
    <Overlay ref="overlay" />
    <div class="h-screen">
      <SalesHeader v-if="shouldShowHeader" />
      <main>
        <div class="content mx-16 mt-16">
          <RouterView v-slot="{ Component }">
            <Transition
              name="fade"
              mode="out-in"
              appear
            >
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
      <SalesFooter
        v-if="shouldShowFooter"
        @exit="toggleExitConfirmModal"
      />
    </div>
    <SalesLinkSchoolModal
      v-if="shouldShowLinkSchoolModal"
      :state="linkSchoolData.state"
      :parentOrgId="linkSchoolData.parentOrgId"
      @close="toggleLinkSchoolModal"
    />
    <SalesUnlinkConfirmModal
      v-if="shouldShowUnlinkSchoolModal"
      :parentOrgId="unlinkSchoolData.parentOrgId"
      :org="unlinkSchoolData.org"
      @close="toggleUnlinkSchoolModal"
    />
    <SalesRemoveAdminModal
      v-if="shouldShowRemoveAdminModal"
      @close="showRemoveAdminModal"
    />
    <SalesAddOrEditOrgModal
      v-if="shouldShowOrgDataModal"
      :orgDetails="orgDetails"
      :title="orgModal.title"
      :button2Title="orgModal.button2Title"
      :isEditModal="orgModal.isEditModal"
      :isEditDisplayNameModal="isEditDisplayNameModal"
      @close="toggleOrgDataModal"
    />
    <SalesOverviewModal
      v-if="shouldShowOverviewModal"
      :title="title"
      :details="details"
      @close="toggleOverviewModal"
    />
    <ExitConfirmModal
      v-if="shouldShowExitModal"
      @confirm="handleConfirm"
      @close="toggleExitConfirmModal"
    />
    <SalesPlanTypeModal
      v-if="shouldShowPlanTypeModal"
      @submitPlanType="submitPlanType"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

import $axios from '~/services/AxiosService.js';
import $store from '~/services/StoreService.js';

import IdleQueueService from '~/services/IdleQueueService.js';
import FontService from '~/services/FontService.js';
import Fonts from '~/config/Fonts.js';

export default {

  data() {
    return {
      idleQueue: null,
      shouldShowLinkSchoolModal: false,
      shouldShowUnlinkSchoolModal: false,
      shouldShowRemoveAdminModal: false,
      shouldShowOrgDataModal: false,
      shouldShowOverviewModal: false,
      title: '',
      details: [
        { name: 'District Name', value: 'Aberdeen School District' },
        { name: 'District ID', value: '5300030' },
        { name: 'State', value: 'Washington / WA' },
        { name: 'County', value: 'Brown County' },
        { name: 'Public Schools', value: '12' },
        { name: 'Lowest Grade', value: '13' },

      ],

      unlinkSchoolData: {
        parentOrgId: '',
        org: {
          id: '',
          name: '',
          district: '',
        },
      },

      linkSchoolData: {
        parentOrgId: '',
        state: '',
      },
      orgDetails: {
        type: '',
        id: '',
        name: '',
        state: '',
        zip: '',
        city: '',
        address: '',
        orgType: '',
        country: '',
      },

      orgModal: {
        isEditModal: false,
        title: '',
        button2Title: '',
      },

      shouldShowExitModal: false,
      shouldShowPlanTypeModal: false,
      planType: 'district',

      displayName: '',
    };
  },

  head() {
    return {
      title: this.$i18n('Org Dashboard'),
    };
  },

  computed: {
    ...mapGetters('sales', ['isDepartment', 'paidOrgSelectedTab']),
    shouldShowHeader() {
      const { path } = this.$route;
      if (path.match(/sales\/?$/) || path.match(/add\/?$/) || path.match(/edit\/?$/)) {
        return true;
      }
      return false;
    },

    shouldShowFooter() {
      const { path } = this.$route;
      if (path.match(/^\/sales\/subscriptions\/[^/]*[0-9][^/]*?$/)) {
        return false;
      }
      if (path.match(/sales\/?$/) || path.match(/add\/?$/) || path.match(/edit\/?$/)) {
        return false;
      }
      return true;
    },

    isEditDisplayNameModal() {
      return (this.isDepartment && this.paidOrgSelectedTab === 'overview');
    },
  },

  watch: {
    $route(to, from) {
      if (to.path.match(/new\/?$/)) {
        this.$store.dispatch('sales/resetNewSubFlow');
      }
    },
  },

  created() {
    $store(this.$store);
    $axios(this.$axios);
    /**
     * Use IdleQueueService service to make sure these resources are loaded during idle time or at the earliest when they are needed
    */
    this.idleQueue = new IdleQueueService();
    this.$eventBus.$on('showUnlinkAdminModal', this.showUnlinkAdminModal);
    this.$eventBus.$on('showUnlinkSchoolModal', this.showUnlinkSchoolModal);

    this.idleQueue.addTask(FontService.loadOpenSans);
    this.$eventBus.$on('togglePlanTypeModal', this.togglePlanTypeModal);
    this.$eventBus.$on('orgNameLinkClick', this.handleOverviewModalOpen);
    this.$eventBus.$on('schoolUnlinkClick', this.handleUnlinkSchool);
    this.$eventBus.$on('linkSchoolClick', this.handleLinkSchool);
    this.$eventBus.$on('editOrgModal', this.handleEditSchoolModal);
    this.$eventBus.$on('onCreateOrg', this.showCreateOrgModal);
  },

  mounted() {
    this.$nextTick(() => {
      for (const fontKey in Fonts) {
        const font = Fonts[fontKey];

        this.idleQueue.addTask(FontService.loadFont.bind(null, font));
      }
    });
  },

  beforeUnmount() {
    this.$eventBus.$off('showUnlinkAdminModal', this.showUnlinkAdminModal);
    this.$eventBus.$off('showUnlinkSchoolModal', this.showUnlinkSchoolModal);
    this.$eventBus.$off('togglePlanTypeModal', this.togglePlanTypeModal);
    this.$eventBus.$off('orgNameLinkClick', this.handleOverviewModalOpen);
    this.$eventBus.$off('schoolUnlinkClick', this.handleUnlinkSchool);
    this.$eventBus.$off('linkSchoolClick', this.handleLinkSchool);
    this.$eventBus.$off('editOrgModal', this.handleEditSchoolModal);
    this.$eventBus.$off('onCreateOrg', this.showCreateOrgModal);
  },

  methods: {
    showUnlinkAdminModal() {
      this.showRemoveAdminModal();
    },

    togglePlanTypeModal() {
      this.shouldShowPlanTypeModal = !this.shouldShowPlanTypeModal;
    },
    submitPlanType(planType) {
      this.togglePlanTypeModal();
      this.planType = planType;
      this.$store.dispatch('sales/pickPlanType', this.planType);
      this.$router.push('/sales/subscriptions/new');
    },

    showUnlinkSchoolModal(
      {
        schoolId,
        schoolName,
        districtId,
        districtName,
      },
    ) {
      this.unlinkSchoolData.parentOrgId = districtId;
      this.unlinkSchoolData.org.id = schoolId;
      this.unlinkSchoolData.org.name = schoolName;
      this.unlinkSchoolData.org.district = districtName;
      this.shouldShowUnlinkSchoolModal = true;
    },

    showRemoveAdminModal() {
      this.shouldShowRemoveAdminModal = !this.shouldShowRemoveAdminModal;
    },
    showCreateOrgModal(orgDetailsModalDetails) {
      this.orgModal.isEditModal = false;
      this.orgModal.title = this.$i18n('{$1}', [orgDetailsModalDetails.title]);
      this.orgModal.button2Title = this.$i18n('{$1}', [orgDetailsModalDetails.button2Title]);
      this.orgDetails = {
        name: '',
        state: '',
        zip: '',
        city: '',
        address: '',
        country: '',
        orgType: orgDetailsModalDetails.orgType,
      };
      if (this.shouldShowLinkSchoolModal === true) {
        this.toggleLinkSchoolModal();
      }
      this.toggleOrgDataModal();
    },

    handleOverviewModalOpen({ source, plan }) {
      this.toggleOverviewModal();
      this.title = source.name;
      if (['school', 'department', 'international'].includes(plan)) {
        this.details = [
          {
            name: 'School Name', value: source.name,
          },
          { name: 'School ID', value: source.id },
          { name: 'State', value: source.state },
          { name: 'City', value: source.city },
          { name: 'Zipcode', value: source.zip },
        ];
      } else if (plan === 'misc') {
        this.details = [
          { name: 'Name', value: source.name || '-' },
          { name: 'Type', value: this.$stringUtils.toTitleCase(source.organizationMetadata?.type) || '-' },
          { name: 'Country', value: source.country || '-' },
          { name: 'City', value: source.city || 'sdjsdj' },
          { name: 'Zipcode', value: source.zip || '-' },
          { name: 'Address', value: source.address || '-' },
        ];
      } else {
        this.details = [
          { name: 'District Name', value: source.name ?? '-' },
          { name: 'District ID', value: source._id ?? source.id ?? '-' },
          { name: 'State', value: source.state ?? '-' },
          { name: 'County', value: source.county ?? '-' },
          { name: 'Operational Schools', value: source?.organizationMetadata?.numberOfOperationalSchools ?? '-' },
          { name: 'Public Schools', value: source?.organizationMetadata?.numberOfPublicSchools ?? '-' },
          { name: 'Lowest Grade', value: source.low_grade ?? '-' },
          { name: 'Highest Grade', value: source.high_grade ?? '-' },
          { name: 'Student Enrolled', value: source?.organizationMetadata?.enrolled ?? '-' },
          { name: 'Full Time Equivalent', value: source.fullTime ?? '-' },
          { name: 'Student Teacher Ratio', value: source?.organizationMetadata?.studentTeacherRatio ?? '-' },
          { name: 'District Type', value: this.$stringUtils.toTitleCase(source?.organizationMetadata?.type) ?? '-' },
        ];
      }
    },

    handleUnlinkSchool({ schoolDetails, orgName }) {
      this.toggleUnlinkSchoolModal();
      this.unlinkSchoolData.parentOrgId = schoolDetails._source.parentOrgId;
      this.unlinkSchoolData.org.name = schoolDetails._source.name;
      this.unlinkSchoolData.org.district = orgName;
      this.unlinkSchoolData.org.id = schoolDetails._source.id;
    },

    toggleOverviewModal() {
      this.shouldShowOverviewModal = !this.shouldShowOverviewModal;
    },
    toggleExitConfirmModal() {
      this.shouldShowExitModal = !this.shouldShowExitModal;
    },
    toggleUnlinkSchoolModal() {
      this.shouldShowUnlinkSchoolModal = !this.shouldShowUnlinkSchoolModal;
    },
    toggleLinkSchoolModal() {
      this.shouldShowLinkSchoolModal = !this.shouldShowLinkSchoolModal;
    },
    toggleOrgDataModal(orgType) {
      this.shouldShowOrgDataModal = !this.shouldShowOrgDataModal;
    },
    handleConfirm() {
      this.shouldShowExitModal = false;
      this.$router.push('/sales');
    },
    handleLinkSchool(org) {
      this.linkSchoolData.parentOrgId = org._id ?? org._source.id;
      this.linkSchoolData.state = org._source?.state ?? org.state;
      this.orgDetails = {};
      this.toggleLinkSchoolModal();
    },

    handleEditSchoolModal(school) {
      this.orgModal.isEditModal = true;
      this.orgModal.title = this.isEditDisplayNameModal ? this.$i18n('Edit Display Name') : this.$i18n('Edit School');
      this.orgModal.button2Title = this.$i18n('SAVE');
      this.orgDetails.id = school._source.id || school._source._id;
      this.orgDetails.name = school._source.name;
      this.orgDetails.state = school._source.state;
      this.orgDetails.city = school._source.city;
      this.orgDetails.zip = school._source.zip;
      this.orgDetails.address = school._source.address;
      this.orgDetails.type = school._source?.organizationMetadata?.type;
      this.orgDetails.orgType = school.orgType;
      this.orgDetails.country = school._source.country;
      this.toggleOrgDataModal();
    },

    submitCreateOrg() {

    },
  },

};
</script>

<style lang="scss"></style>

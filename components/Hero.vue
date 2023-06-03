<template>
  <div class="relative min-w-40">
    <div :class="['flex', 'items-center', { 'mb-3': shouldShowLozenge }]">
      <div class="w-full">
        <router-link
          v-if="$user.id"
          class="inline-block w-full text-sm font-semibold text-dark-2 cursor-pointer"
          :to="`/profile/${$user.id}`"
        >
          <EllipsisWithTooltip :name="nameTitle" />
        </router-link>
        <p
          v-else
          class="text-sm font-semibold text-dark-2"
        >
          {{ nameTitle }}
        </p>
        <div
          v-if="hasAnyPaidOrgs"
          class="flex items-center w-full"
        >
          <span
            v-if="hasAnyPaidOrgs"
            class="text-dark-4 font-normal text-xxs max-w-[70%] text-ellipsis whitespace-nowrap overflow-hidden"
          >{{ currentPaidOrgName }}</span>
          <!-- ! Do not change the button id, paid org dropdown uses it for positioning -->
          <Button
            v-if="hasMultiplePaidOrgs"
            id="paid-org-dropdown-btn"
            ref="paidOrgDropdownButton"
            licon="fa fa-angle-down"
            :customIconSize="10"
            type="transparent"
            class="w-4 h-4 ml-2 text-dark-4 paid-org-dropdown-btn rounded-3xl"
            @click.stop="openPaidOrgList"
          />
        </div>
        <div
          v-if="showViewMyDistrict"
          class="mb-2"
        >
          <button
            class="text-lilac text-xs border-b-1 border-dashed border-lilac"
            @click.stop="showMyDistrict"
          >
            <i class="fas fa-school mr-1" />
            <i18n>View my district</i18n>
          </button>
        </div>
        <Lozenge
          v-if="shouldShowLozenge"
          :class="[lozenge.classes]"
          :icon="lozenge.icon"
          size="xs"
          :title="lozenge.title"
        />

        <UpgradeToSchoolPlanCTA v-if="shouldShowUpgradeToSchoolCTA && (!isreferred && !isReferredSuper)" />
        <TrialExpiryCard v-if="isreferred || isReferredSuper" />
      </div>
    </div>
    <div
      v-if="fetchingOrgInfoLoading"
      class="flex justify-center w-full h-4"
    >
      <Loader :size="12" />
    </div>
    <Button
      v-if="shouldShowButton && !fetchingOrgInfoLoading"
      :size="buttonDetails.size || 'sm'"
      :type="buttonDetails.type"
      :title="buttonDetails.title"
      :class="[shouldButtonHaveFullWidth ? 'min-w-full min-h-8' : '', 'flex', buttonDetails.class]"
      :ticon="buttonDetails.ticon && buttonDetails.icon"
      :licon="buttonDetails.licon && buttonDetails.icon"
      :rounded="buttonDetails.rounded"
      minContentWidth
      fullHeight
      @click.stop="buttonDetails.onClick"
    />
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import includes from 'lodash/includes';
import escape from 'lodash/escape';

import OrganizationService from '~/services/apis/OrganizationService';
import QfwOrganizationService from '~/services/apis/QfwOrganizationService';

import referralMixin from '~/mixins/referralMixin';

export default {
  mixins: [referralMixin],
  props: {
    type: {
      type: String,
      default: 'log-in',
    },
  },
  emits: ['togglePaidOrgListModal'],

  data() {
    return {
      paidOrgSearchText: '',
      paidOrgList: [],
      qfwOrg: [],
      emailIds: [],
      isreferred: false,
      isReferredSuper: false,
      qfwUpsell: false,
      fetchingOrgInfoLoading: false,
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),
    ...mapGetters('root', ['isDesktop', 'user', 'serverData']),
    ...mapGetters('products', [
      'isEligibleForTrial',
      'planPrice',
      'superUpgradeText',
    ]),

    ...mapGetters('sharedLibrary', ['enableSharedLibrary']),

    showIndividualPlanInfo() {
      const projectLaunchDate = this.$dayjs('Fri, 02 Dec 2022 05:00:00 GMT');
      const { subscription } = this.$user;
      const subscriptionStartAt = subscription?.startAt;

      return this.$dayjs(subscriptionStartAt).isBefore(projectLaunchDate)
        && this.shouldShowLozenge
        && this.showIndividualPlan
        && this.type === this.$constants.AccountTypes.SUPER;
    },

    filteredPaidOrgList() {
      if (!this.paidOrgSearchText) {
        return this.paidOrgList;
      }

      return this.paidOrgList.filter((paidOrg) => {
        if (paidOrg.name) {
          return paidOrg.name.toLowerCase().includes(this.paidOrgSearchText.toLowerCase());
        }

        return false;
      });
    },

    hasMultiplePaidOrgs() {
      return this.$user?.paidOrganizations?.length > 1;
    },

    getCount() {
      return 3 - this.emailIds.length;
    },

    hasAnyPaidOrgs() {
      return this.$user?.paidOrganizations?.length > 0;
    },

    currentPaidOrgName() {
      if (!this.$user.paidOrganizations) {
        return '';
      }
      const currentPaidOrg = this.$user.paidOrganizations.find((paidOrg) => paidOrg.id === this.$user.paidOrganization);

      return currentPaidOrg.displayName || currentPaidOrg.organizationName;
    },

    shouldButtonHaveFullWidth() {
      return this.type !== 'log-in';
    },

    shouldShowButton() {
      if (this.isCorporateAdminOrFreeTrialAccount) {
        return true;
      }

      if (this.type === this.$constants.AccountTypes.SCHOOL_AND_DISTRICT && !this.$user.isAdmin) {
        return false;
      }

      if (this.$msTeams.isTeamApp() && !this.isDesktop && this.type === this.$constants.AccountTypes.BASIC) {
        return false;
      }

      const accountTypesToShowButtons = [
        this.$constants.AccountTypes.BASIC,
        this.$constants.AccountTypes.SCHOOL_AND_DISTRICT,
        this.$constants.AccountTypes.ANONYMOUS,
      ];

      return includes(accountTypesToShowButtons, this.type);
    },

    shouldShowLozenge() {
      return !isEmpty(this.lozenge);
    },
    isCorporateFreeTrial() {
      return this.$user?.isCorporateTrial;
    },

    isCorporateAdminOrFreeTrialAccount() {
      return this.$user.isCorporate && (this.$user.organizationRole === this.$constants.OrganizationRole.ADMIN || this.isCorporateFreeTrial);
    },

    buttonDetails() {
      if (this.isCorporateAdminOrFreeTrialAccount) {
        const totalMembers = this.qfwOrg?.admins?.concat(this.qfwOrg?.members);
        return {
          title: totalMembers?.length > 1 ? this.$i18n('Manage Members') : this.$i18n('Invite Teammates'),
          icon: 'fas fa-user-plus',
          type: 'other',
          rounded: 'semi',
          ticon: '',
          licon: 'fas fa-user-plus',
          onClick: () => this.forWorkDashboardNavigation(),
        };
      }
      switch (this.type) {
        case this.$constants.AccountTypes.ANONYMOUS:
          return {
            title: this.$i18n('Log in'),
            type: 'secondary',
            rounded: 'default',
            size: 'xs',
            class: 'mb-4',
            ticon: '',
            licon: '',
            onClick: () => this.showLoginModal(),
          };

        case this.$constants.AccountTypes.BASIC:
          return {
            title: this.superUpgradeText,
            licon: 'fas fa-bolt-lightning',
            type: 'super-secondary',
            rounded: 'semi',
            class: 'mb-4',
            ticon: '',
            onClick: this.routeToPricingPage,
          };

        case this.$constants.AccountTypes.SCHOOL_AND_DISTRICT:
          return {
            title: this.$i18n('Manage members'),
            icon: 'fas fa-user-cog',
            type: 'other',
            rounded: 'semi',
            ticon: 'fas fa-user-cog',
            licon: '',
            onClick: () => this.navigate('/organization/dashboard'),
          };

        default:
          return {
            title: '',
            icon: null,
            type: '',
            rounded: '',
            ticon: '',
            licon: '',
          };
      }
    },

    nameTitle() {
      switch (this.type) {
        case this.$constants.AccountTypes.ANONYMOUS:
          return this.$i18n('Have an account?');

        case this.$constants.AccountTypes.BASIC:
        case this.$constants.AccountTypes.SCHOOL_AND_DISTRICT:
        case this.$constants.AccountTypes.CORPORATE_INTRO:
        case this.$constants.AccountTypes.SUPER:
          return this.getUserDisplayName;

        default:
          return `${this.user.firstName} ${this.user.lastName}`;
      }
    },

    getUserDisplayName() {
      const { user } = this;
      if (user.title && user.lastName) {
        return `${user.title} ${user.lastName}`;
      }

      if (!user.title && user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }

      return user.username;
    },

    lozenge() {
      const details = {};

      switch (this.type) {
        case this.$constants.AccountTypes.BASIC:
          details.title = this.$i18n('Basic account');
          details.icon = null;
          details.classes = 'bg-dark-5% text-dark-3';
          break;

        case this.$constants.AccountTypes.SCHOOL_AND_DISTRICT:
          details.title = this.$i18n('Schools & Districts account');
          details.icon = null;
          details.classes = 'bg-dark-5% text-dark-3';
          break;

        case this.$constants.AccountTypes.SUPER:
          details.title = this.showIndividualPlan ? this.$i18n('Individual account') : this.$i18n('Super account');
          details.icon = 'fas fa-bolt-lightning';
          details.classes = 'bg-super-10% text-super';
          break;

        case this.$constants.AccountTypes.CORPORATE_INTRO:
          details.title = this.$i18n('Intro plan');
          details.icon = null;
          details.classes = 'bg-lilac-faded text-lilac';
          break;

        case this.$constants.AccountTypes.CORPORATE_STANDARD:
        case this.$constants.AccountTypes.CORPORATE_STANDARD_NONPROFIT:
          details.title = this.$i18n('Standard plan');
          details.icon = null;
          details.classes = 'bg-lilac-faded text-lilac';
          break;

        case this.$constants.AccountTypes.CORPORATE_PREMIER:
          details.title = this.$i18n('Premier Plan');
          details.icon = null;
          details.classes = 'bg-lilac-faded text-lilac';
          break;

        case this.$constants.AccountTypes.CORPORATE_STARTER:
          details.title = this.$i18n('Starter Plan');
          details.icon = null;
          details.classes = 'bg-lilac-faded text-lilac';
          break;

        default:
      }

      return details;
    },

    showViewMyDistrict() {
      if (this.$user.isCorporate) { return false; }
      return this.$user.isLoggedIn && this.enableSharedLibrary;
    },

    isSuperUser() {
      return this.type === this.$constants.AccountTypes.SUPER;
    },

    localeCountry() {
      return this.serverData?.requestCountry;
    },

    isUserFromUSA() {
      return this.localeCountry === 'US';
    },

    shouldShowUpgradeToSchoolCTA() {
      return this.isSuperUser && this.isUserFromUSA;
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

  },

  async created() {
    this.fetchingOrgInfoLoading = true;
    if (this.$user.isCorporatePaidOrgAccount) {
      this.qfwOrg = await QfwOrganizationService.fetchOrgInfo();
    }
    this.fetchingOrgInfoLoading = false;
  },

  mounted() {
    if (this.shouldShowUpgradeToSchoolCTA) {
      const eventName = this.$webEvents.HOME_PAGE_SCHOOL_PRICING_CTA_SHOWN;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
      });
    }

    this.hasBeenReferred();

    if (this.$user?.paidOrganizations) {
      this.paidOrgList = this.$user.paidOrganizations.map((paidOrg) => ({
        id: paidOrg.id,
        name: paidOrg.displayName || paidOrg.organizationName,
        address: `${paidOrg.state ? `${paidOrg.state},` : ''}${paidOrg.country ?? ''}`,
      })) || [];
    }
  },

  methods: {
    openPaidOrgList() {
      this.$eventBus.$emit('togglePaidOrgListModal', true);
    },

    async hasBeenReferred() {
      const campaignId = '32748';
      const foundCampaign = await this.getReferralCampaign(campaignId);
      if (foundCampaign?.meta?.refereeDetails?.length === 0 && foundCampaign?.meta?.referredEmails?.length !== 0) {
        this.emailIds = foundCampaign?.meta?.referredEmails || [];
      } else if (foundCampaign?.meta?.refereeDetails?.length !== 0 && foundCampaign?.meta?.referredEmails?.length === 0) {
        this.emailIds = foundCampaign?.meta?.refereeDetails || [];
        this.emailIds = this.emailIds.map((data) => data.email);
      } else {
        this.emailIds = foundCampaign?.meta?.refereeDetails || [];
        const referredEmail = this.emailIds.map((data) => data.referralEmail);
        this.emailIds = this.emailIds.map((data) => data.email);
        if (this.getCount > 0) {
          foundCampaign?.meta?.referredEmails.forEach((email) => {
            if (!referredEmail.includes(email)) {
              this.emailIds.push(email);
            }
          });
        }
      }
      if (foundCampaign?.meta?.referrerUserId || (this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V1) && this.getCount > 0)) {
        this.isreferred = true;
      } else {
        this.isreferred = false;
      }
    },

    async hasBeenReferredSuper() {
      const campaignId = this.$constants.CAMPAIGN_ID_SUPER_PLAN_REFER;
      const foundCampaign = await this.getReferralCampaign(campaignId);
      this.isReferredSuper = foundCampaign?.meta?.referrerUserId || (this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V3) && this.getCount > 0);
    },

    navigate(path, routeWithinNuxt) {
      if (routeWithinNuxt) {
        this.$router.push(path);
        return;
      }
      window.location = path;
    },

    routeToPricingPage() {
      this.$analytics.logEvent(this.$webEvents.SuperTrialEvents.SUPER_TRIAL_CTA, {
        page: window.location.href,
        component: 'hero_container',
        feat: 'navbar',
        trial_shown: this.isEligibleForTrial,
        price: this.planPrice,
      });

      this.navigate(`/super-pricing?backto=${escape(window.location.pathname)}&feat=navbar`, true);
    },

    forWorkDashboardNavigation() {
      const totalMembers = this.qfwOrg?.admins?.concat(this.qfwOrg?.members);
      const params = {
        user_status: this.$user.isCorporateTrial ? 'free' : 'paid',
        plan: this.$user.subscription.planName,
        plan_id: this.$user.subscription.id,
        plan_interval: this.$user.subscription.interval,
        button_source: 'left_panel',
        action_name: totalMembers?.length > 1 ? 'manage_members' : 'invite_members',
        role_description: this.$user.userStore?.roleDescription,
      };
      this.$analytics.logEvent(this.$webEvents.QFW_INVITE_MEMBER_CLICKED, params);
      if (this.$user.isCorporateTrial) {
        this.$eventBus.$emit('qfwUpsellModal:open', 'left_panel');
        return;
      }
      this.navigate('/forwork/dashboard', true);
    },

    showLoginModal() {
      this.$router.push({
        name: this.$router.name,
        query: {
          ...this.$route.query,
          ctaSource: 'sidebar-login',
          fromPage: this.$route.name,
        },
      });
      this.$analytics.logEvent(
        this.$webEvents.LOGIN_FLOW,
        {
          popup_name: 'login_pop_up',
          previous_source: 'side_bar_login_btn',
        },
      );
      this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW, { type: 'login' });
    },

    closeQfwUpsellModal() {
      this.qfwUpsell = false;
    },

    showMyDistrict() {
      this.$analytics.logEvent(this.$webEvents.SharedLibraryEvents.leads.SIDEMENU_CTA, {
        user_id: this.$user.id,
        hasSNDPriviledge: this.hasSharedLibraryPriviledges,
      });

      this.$router.push('/admin/district');
    },
  },
};
</script>

<style lang="scss" scoped>
.paid-org-dropdown-btn {
  color: black;
  &:hover {
    background-color: rgba(9, 9, 9, 0.05);
  }
}
</style>

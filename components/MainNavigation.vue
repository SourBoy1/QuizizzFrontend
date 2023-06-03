<template>
  <div class="main-navigation-container h-screen">
    <!-- Since sidebar is collapsed
    Added a placeholder div to prevent the main content from moving to the left
    when the sidebar is collapsed -->
    <div
      v-if="isSidebarCollapsed"
      class="sidebar-placeholder"
    />

    <transition
      appear
      enter-active-class="animate__animated animate__fadeIn animation-duration-300"
      leave-active-class="animate__animated animate__fadeOut animation-duration-200"
    >
      <div
        v-if="isSidebarExpandedOnContent"
        class="overlay fixed h-screen w-screen pointer-events-none top-0 bg-dark-80% left-0 z-999"
      />
    </transition>
    <div
      class="main-navigation flex flex-col h-full bg-light-3 shrink-0"
      :class="{
        'z-10': !isDesktop,
        'filter-box-shadow': !shouldShowCreateQuizLessonOptions,
        collapsed: isSidebarCollapsed,
        'fixed-expansion': isSidebarExpandedOnContent,
      }"
      :style="{
        '--transition-duration': `${transitionDuration}ms`,
      }"
      translate="no"
      @mouseenter="toggleSidebarCollapse(true)"
      @mouseleave="toggleSidebarCollapse(false)"
    >
      <div class="quizizz-logo-container hidden md:block ml-2 mt-2">
        <router-link
          :to="logoRedirectionUrl"
          aria-label="Quizizz"
          title="Quizizz"
        >
          <img
            aria-hidden="true"
            class="logo"
            :class="{
              'object-contain h-full': !shouldUpdateUIForCollapsedSidebar,
              clipped: shouldUpdateUIForCollapsedSidebar,
            }"
            src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
            alt="logo"
          />
        </router-link>
      </div>

      <transition name="hero">
        <div
          v-if="!shouldSidebarBeCollapsed"
          class="user-details"
        >
          <div class="pb-2 p-4 user-section">
            <HeroContainer />
            <ReferralSidebarCard v-if="isDesktop && !showForNonIndividualReferralUs" />
            <template v-if="shouldShowReferralCards">
              <ReferralIndividualSidebarCard v-if="isDesktop" />
              <ReferralSuperRefer v-if="isDesktop" />
              <ReferralUpgradeCard v-if="isDesktop && !$user.isSuper" />
            </template>
            <ReferralRefereeRewardSidebarCard v-if="isDesktop && !showForNonIndividualReferralUs" />
            <ReferralRewardSuperPlanCard v-if="isDesktop" />
          </div>

          <div v-if="isDesktop && !shouldSidebarBeCollapsed">
            <NavigationPromo
              v-if="shouldShowNavigationPromo"
              :title="`🏫 ${$i18n('Go schoolwide, get reimbursed, and more.')}`"
              :description="$i18n('Want upgrades for everyone, a refund for you, and LMS integrations?')"
              :linkTitle="$i18n('Learn More')"
              :titleWhenHidden="`🏫 ${$i18n('Go schoolwide')}`"
              @promoLinkClick="onPromoLinkCLick"
            />
          </div>
        </div>
      </transition>

      <div
        class="create-btn-container mb-4 relative block mx-auto"
        :class="{
          'flex flex-col items-center mt-24': shouldUpdateUIForCollapsedSidebar,
        }"
      >
        <Button
          ref="createButton"
          data-cy="create-quiz-lesson-button"
          :aria-label="$i18n('Create content')"
          v-bind="createButtonProps"
          @click.stop="onCreateClicked"
        />
      </div>
      <Sidebar @disabled="handleSidebarDisabled" />
      <transition name="block">
        <div v-if="!shouldSidebarBeCollapsed">
          <CorporateUpgradeCard v-if="shouldShowCorporateUpgradeCard" />
          <QfwUpgradeFromMonthlyCard v-else-if="showUpgradeFromMonthlyCard" />
          <QfwUpgradeFromStarterCard v-else-if="showUpgradeFromStarterCard" />
        </div>
      </transition>
    </div>
    <div
      v-if="isSidebarExpandedOnContent"
      class="w-14 h-full"
    />
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

export default {
  mixins: [referralMixin],
  emits: ['handleCreateContent'],
  data() {
    return {
      isSidebarDisabled: false,
      shouldShowCreateQuizLessonOptions: false,
      logoRedirectionUrl: this.getLogoRedirectionUrl(),
      shouldUpdateUIForCollapsedSidebar: false,

      // for collapse animation
      transitionDuration: 400,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'serverData', 'isMobile']),
    ...mapGetters('uiManager', ['isSidebarCollapsed', 'isSidebarExpandedOnContent']),
    ...mapGetters('sharedLibrary', ['enableSharedLibrary']),
    ...mapGetters('referrals', ['shouldShowReferralCards']),

    isCorporatePaywallVisible() {
      return this.$user.isCorporate && this.$user.isOnTrialSubscription && this.$user.isTrialExpired;
    },

    accountType() {
      const user = this.$user;
      const planName = this.$user.plan;

      if (!user.id) {
        return this.$constants.AccountTypes.ANONYMOUS;
      }

      if (user.isPartOfAnOrganization && planName !== '') {
        return this.$constants.AccountTypes.SCHOOL_AND_DISTRICT;
      }

      if (!planName) {
        if (user.isCorporate) {
          return this.$constants.AccountTypes.CORPORATE_INTRO;
        }

        return this.$constants.AccountTypes.BASIC;
      }

      if (user.isSuper) {
        return this.$constants.AccountTypes.SUPER;
      }

      // If none of the above, it must be a corporate account
      switch (planName) {
        case 'Intro':
          return this.$constants.AccountTypes.CORPORATE_INTRO;
        case 'Standard':
          return this.$constants.AccountTypes.CORPORATE_STANDARD;
        case 'Standard (Non Profit)':
          return this.$constants.AccountTypes.CORPORATE_STANDARD_NONPROFIT;
        case 'Premier':
          return this.$constants.AccountTypes.CORPORATE_PREMIER;
        case 'Starter':
          return this.$constants.AccountTypes.CORPORATE_STARTER;
        default:
          return this.$constants.AccountTypes.SUPER;
      }
    },

    miniHeroConfig() {
      let name;
      let lozengeClasses = 'bg-lilac-faded text-lilac';

      switch (this.accountType) {
        case this.$constants.AccountTypes.ANONYMOUS:
          name = this.$i18n('Log In');
          break;

        case this.$constants.AccountTypes.BASIC:
          name = this.$i18n('Basic');
          lozengeClasses = 'bg-dark-5% text-dark-2';
          break;
        case this.$constants.AccountTypes.SCHOOL_AND_DISTRICT:
          name = this.$i18n('S&D');
          lozengeClasses = 'bg-dark-5% text-dark-2';
          break;

        case this.$constants.AccountTypes.CORPORATE_INTRO:
          name = this.$i18n('Intro');
          break;

        case this.$constants.AccountTypes.SUPER:
          name = this.$i18n('Super');
          lozengeClasses = 'bg-super-faded text-super';
          break;

        default:
          break;
      }

      return {
        name,
        lozengeClasses,
      };
    },

    isCollapsedSidebarRoute() {
      const collapsedRoute = ['admin/search', 'curriculum/id/merdeka'].find((val) => this.$route.path.includes(val));
      return !!collapsedRoute;
    },

    showForNonIndividualReferralUs() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V1);
    },

    showViewMyDistrict() {
      if (this.$user.isCorporate) {
        return false;
      }

      return this.$user.isLoggedIn && this.enableSharedLibrary;
    },

    shouldShowNavigationPromo() {
      // return this.$user.isSuper && !this.$user.isPartOfAnOrganization;
      // Temporarily disabling this till referral is running.
      return false;
    },

    shouldSidebarBeCollapsed() {
      return this.isSidebarCollapsed && !this.isSidebarExpandedOnContent;
    },

    createButtonProps() {
      if (this.shouldSidebarBeCollapsed) {
        return {
          licon: 'fal fa-plus-circle',
          size: 'lg',
          type: 'primary',
        };
      }

      return {
        title: this.$i18n('Create'),
        licon: 'fal fa-plus-circle',
        type: 'primary',
        class: 'w-42',
        size: 'xl',
        disabled: this.isSidebarDisabled,
        variant: 'shadow',
      };
    },

    shouldShowCorporateUpgradeCard() {
      return this.$user.isCorporate && this.$user.isOnTrialSubscription;
    },

    showUpgradeFromStarterCard() {
      return this.$user.isCorporate && this.$user.isAdmin && this.$user.subscription.id === 'trainer_t4_annual_v1';
    },

    showUpgradeFromMonthlyCard() {
      if (this.$user.subscription.subscription_type === 'onetime') {
        return false;
      }
      return this.$user.isCorporate && this.$user.isAdmin && this.$user.subscription.interval === 'month';
    },

    isSidebarInCollapsedState() {
      return this.isSidebarCollapsed && !this.isSidebarExpandedOnContent;
    },
  },

  watch: {
    '$route.path': function () {
      this.setSidebarLayout();
    },

    isSidebarInCollapsedState(isCollapsed) {
      if (isCollapsed) {
        this.sidebarUITimer = setTimeout(() => {
          this.shouldUpdateUIForCollapsedSidebar = true;
        }, 300);
      } else {
        this.shouldUpdateUIForCollapsedSidebar = false;
      }
    },
  },

  created() {
    this.$eventBus.$on('url-query-params-added', this.onQueryParamAdded);
    this.$eventBus.$on('onCreateClicked', this.onCreateClicked);
  },

  mounted() {
    this.setSidebarLayout();
    if (this.isCorporatePaywallVisible) {
      this.handleSidebarDisabled(true);
    }
  },

  beforeUnmount() {
    this.$eventBus.$off('url-query-params-added', this.onQueryParamAdded);
    this.$eventBus.$off('onCreateClicked', this.onCreateClicked);

    this.sidebarUITimer && clearTimeout(this.sidebarUITimer);
  },

  methods: {
    setSidebarLayout() {
      this.shouldUpdateUIForCollapsedSidebar = this.isSidebarInCollapsedState;
      this.$store.dispatch('uiManager/shouldCollapseSidebar', { shouldCollapse: this.isCollapsedSidebarRoute && this.isDesktop, expandOnContent: false });
    },

    showAuthModal() {
      this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW);
    },

    onCreateClicked(ctaSource) {
      if (!this.$user.isLoggedIn) {
        this.$analytics.logEvent(
          this.$webEvents.SIGNUP_FLOW,
          {
            popup_name: 'signup_pop_up',
            previous_source: 'create_btn',
            ctaSource: 'create-button',
            fromPage: this.$route.name,
          },
        );

        this.showAuthModal();

        this.$router.push({
          path: this.$route.path,
          query: {
            ...this.$route.query,
            ctaSource: 'create-button',
            fromPage: this.$route.name,
          },
        });
        return;
      }
      if (this.$user.id) {
        this.$analytics.logEvent(this.$webEvents.UX_CREATE_CONTENT_BTN_CLICK, { ctaSource: ctaSource || 'main-navigation-create' });
        if (!this.isDesktop && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_QUIZ_GEN_MOBILE)) {
          this.$eventBus.$emit('overlay:hide');
          this.$eventBus.$emit(this.$constants.EventBus.QUIZ_GEN_MOBILE_MODAL_SHOW);
        } else if (this.isMobile) {
          this.$emit('handleCreateContent', { forContentType: this.$constants.ContentType.QUIZ });
        } else {
          this.$store.dispatch('uiManager/toggleContentCreationModal');
        }
      }
    },

    handleSidebarDisabled(isDisabled = false) {
      this.isSidebarDisabled = isDisabled;
    },

    onPromoLinkCLick() {
      this.$eventBus.$emit('sndUpsell:open', {
        feat: 'promoLinkClick-mainNavigation',
      });
    },

    getLogoRedirectionUrl() {
      return '/admin';
    },

    onQueryParamAdded() {
      this.logoRedirectionUrl = this.getLogoRedirectionUrl();
    },

    showMyDistrict() {
      this.$analytics.logEvent(this.$webEvents.SharedLibraryEvents.leads.SIDEMENU_CTA, {
        user_id: this.$user.id,
        hasSNDPriviledge: this.hasSharedLibraryPriviledges,
      });

      this.$router.push('/admin/district');
    },

    toggleSidebarCollapse: debounce(function toggleSidebarCollapse(shouldExpand) {
      if (!this.isSidebarCollapsed) {
        return;
      }

      this.$store.dispatch('uiManager/shouldCollapseSidebar', { shouldCollapse: true, expandOnContent: shouldExpand });
    }, 100),
  },
};
</script>

<style lang="scss" scoped>
$transition-duration: var(--transition-duration);
$mini-sidebar-width: 60px;
$expanded-sidebar-width: 200px;
$logo-height: 40px;
$logo-width: 128px;

.main-navigation {
  width: $expanded-sidebar-width;
  transition: width $transition-duration ease-in-out;
  overflow-x: hidden;

  &.collapsed {
    position: fixed;
    top: 0;
    min-width: $mini-sidebar-width;
    width: $mini-sidebar-width;
    z-index: theme('zIndex.overlay');

    &.fixed-expansion {
      position: fixed;
      top: 0;
      left: 0;
      height: theme('height.full');
      width: $expanded-sidebar-width;
      padding: 0 4px;
    }
  }
}

.logo {
  min-height: $logo-height;
  max-height: $logo-height;
  min-width: $logo-width;
  max-width: $logo-width;

  &.clipped {
    position: absolute;
    clip: rect(0px, 35px, 200px, 0px);
    padding: 2px;
  }
}

.sidebar-placeholder {
  width: $mini-sidebar-width;
  height: 100vh;
  background: transparent;
}

.hero-enter-active,
.block-enter-active {
  transform-origin: 0 0;
  animation: scale-in $transition-duration ease-in-out;
  will-change: transform;
}

.hero-leave-active,
.block-leave-active {
  transform-origin: 0 0;
  animation: scale-in $transition-duration ease-in-out;
  animation-direction: reverse;
  will-change: transform;
}

@keyframes scale-in {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

.filter-box-shadow {
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.05)) drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.08));
}
</style>

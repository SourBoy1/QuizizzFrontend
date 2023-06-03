<template>
  <div
    class="fixed top-0 z-20 w-full bg-light"
    :class="[scrolled ? 'shadow-md' : '']"
  >
    <div class="w-full navContainer border-b-1 h-fit md:mx-auto borderColor">
      <nav class="m-auto pt-2.5 pb-2.5 px-4 h-13 xs:max-w-320 xs:pt-3 xs:pb-3 xs:px-6 xs:h-19 xs:mx-auto xs:my-0 flex items-center">
        <header
          class="flex justify-between w-full text-base"
          kr-inert="false"
        >
          <div class="box-border flex items-center header-top-bar">
            <a
              class="object-contain mr-3 header-logo"
              tabindex="0"
              :href="$user.isLoggedIn ? 'https://quizizz.com/admin' : 'https://quizizz.com/forwork?ref=header_tab'"
            ><img
              class="max-w-22 xs:max-w-28"
              src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
              alt="Quizizz"
            /></a>
            <ul
              v-if="isDesktop && !$user.isLoggedIn"
              role="menu"
              class="flex page-tabs"
            >
              <li role="menuitem">
                <a
                  class="p-2 pl-3 pr-3 mr-3 rounded-xl hover:bg-super-10%"
                  href="/forwork?ref=header_tab"
                >
                  <i18n>For Work</i18n></a>
              </li>
              <li role="menuitem">
                <a
                  class="p-2 pl-3 pr-3 mr-3 rounded-xl hover:bg-super-10%"
                  href="/teachers?ref=header_tab"
                >
                  <i18n> For Teachers </i18n></a>
              </li>
              <li role="menuitem">
                <a
                  class="p-2 pl-3 pr-3 rounded-xl hover:bg-super-10%"
                  href="/home/schools-and-districts?source=header_tab&source_cat=product"
                >Schools &amp; Districts
                  <span
                    v-if="!isMobile"
                    class="py-0.5 px-2 ml-1.5 rounded-xl bg-super shadow-md text-light-1 font-bold text-xs"
                  >NEW</span></a>
              </li>
            </ul>
          </div>
          <div
            v-if="!$user.isLoggedIn"
            class="flex items-center"
          >
            <a
              v-if="!isMobile"
              class="pt-2.5 pb-2.5 px-6 text-light-1 rounded-xl bg-purple-light sign-up-btn hover:bg-purple-dark"
              tabindex="0"
              href="/signup?source=fw_landing_header"
            >Sign up <i class="far fa-angle-right ml-1.5 mt-1" /></a>
            <button
              v-if="isMobile"
              class="header-burger text-purple-light text-2xl pl-1.5 pr-1.5"
              tabindex="0"
              aria-label="open navigation menu"
              @click="toggleSidebar"
            >
              <i class="fas fa-bars" />
            </button>
          </div>

          <div
            v-if="$user.isLoggedIn && !hadTrialOrSubscription"
            class="flex items-center"
          >
            <a
              v-if="!isMobile"
              class="pt-2.5 pb-2.5 px-6 text-light-1 rounded-xl bg-purple-light sign-up-btn hover:bg-purple-dark cursor-pointer"
              tabindex="0"
              @click="startFreeTrial"
            ><i18n>Start free trial</i18n> </a>
            <button
              v-if="isMobile"
              class="header-burger text-purple-light text-2xl pl-1.5 pr-1.5"
              tabindex="0"
              aria-label="open navigation menu"
              @click="toggleSidebar"
            >
              <i class="fas fa-bars" />
            </button>
          </div>
        </header>
      </nav>
    </div>

    <!-- ----------------------- IF Tablet type ------------------------------------ -->

    <div
      v-if="!isDesktop && !$user.isLoggedIn"
      class="flex items-center justify-center h-10 align-middle border-b-2 xs:h-16 borderColor"
    >
      <ul
        role="menu"
        class="flex page-tabs"
      >
        <li role="menuitem">
          <a
            :class="'p-1.5 pl-2 pr-2 mr-2 xs:p-2 xs:pl-3 xs:pr-3 xs:mr-3 rounded-xl hover:bg-super-10%'"
            href="/forwork?ref=header_tab"
          > Work </a>
        </li>
        <li role="menuitem">
          <a
            :class="'p-1.5 pl-2 pr-2 mr-2 xs:p-2 xs:pl-3 xs:pr-3 xs:mr-3 rounded-xl hover:bg-super-10%'"
            href="/teachers?ref=header_tab"
          >For Teachers</a>
        </li>
        <li role="menuitem">
          <a
            :class="'p-1.5 pl-2 pr-2 xs:p-2 xs:pl-3 xs:pr-3 rounded-xl hover:bg-super-10%'"
            href="/home/schools-and-districts?source=header_tab&source_cat=product"
          >Schools &amp; Districts
            <span
              v-if="!isMobile"
              class="new-tag"
            >NEW</span>
          </a>
        </li>
      </ul>
    </div>

    <div
      v-if="!$user.isLoggedIn && !isMobile"
      class="flex items-center justify-center h-8 align-middle border-b-2 xs:h-12 borderColor"
    >
      <ul
        role="menu"
        class="flex items-center justify-center page-tabs"
      >
        <li role="menuitem flex">
          <a
            class="p-1.5 pl-2 pr-2 mr-2 xs:p-2 xs:pl-3 xs:pr-3 xs:mr-3 rounded-xl hover:bg-super-10% cursor-pointer"
            href="/forwork/product"
          > <i18n>Products </i18n></a>
        </li>
        <li role="menuitem flex">
          <div
            class="p-1.5 pl-2 pr-2 mr-2 xs:p-2 xs:pl-3 xs:pr-3 xs:mr-3 rounded-xl hover:bg-super-10% cursor-pointer"
            href="/teachers?ref=header_tab"
            @click="handleClickSolutions"
          >
            <i18n> Solutions </i18n><i class="ml-2 fas fa-caret-down" />
          </div>
          <transition
            appear
            enter-active-class="animate__animated animate__zoomIn animation-duration-300 animation-delay-300"
            leave-active-class="animate__animated animate__zoomOut animation-duration-200 "
          >
            <div
              v-if="showOptions"
              class="absolute py-5 mt-2 text-center transition duration-300 w-50 md:w-60 bg-light rounded-xl"
              :class="[showOptions ? 'h-auto' : 'h-0']"
            >
              <div class="py-2 cursor-pointer solutions">
                <a href="/forwork/training">
                  <i18n>Employee Training</i18n>
                </a>
              </div>
              <div class="py-2 cursor-pointer solutions">
                <a href="/forwork/customer-engagement">
                  <i18n>Customer Engagement</i18n>
                </a>
              </div>
              <div class="py-2 cursor-pointer solutions">
                <a href="/forwork/presentations">
                  <i18n>Presentations</i18n>
                </a>
              </div>
            </div>
          </transition>
        </li>
        <li role="menuitem cursor-pointer flex">
          <a
            class="p-1.5 pl-2 pr-2 xs:p-2 xs:pl-3 xs:pr-3 rounded-xl hover:bg-super-10%"
            href="/forwork/plans?source=qfw-pricing-navbar"
          >
            <i18n>Pricing</i18n>
          </a>
        </li>
      </ul>
    </div>

    <!-----------Sidebar menu------------------>
    <nav
      v-if="isMobile"
      class="absolute top-0 w-full h-screen duration-200 ease-linear sidebar-menu show bg-light"
      :class="[showSidebar ? 'ml-0' : ' ml-320']"
      aria-hidden="false"
    >
      <div class="flex items-center justify-between pt-4 pb-3 pl-4 pr-3 menu-header">
        <div class="menu-header-logo">
          <img
            aria-label="Quizizz"
            class="h-7"
            src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
          >
        </div><button
          id="navigation-menu-close-btn"
          class=" menu-close-btn px-1 py-0.5 border-1 text-purple border-dark-6
        rounded-sm h-9 flex justify-center items-center text-2xl"
          aria-label="Close navigation menu"
          @click="toggleSidebar"
        >
          <i class="fas fa-times" />
        </button>
      </div>
      <div class="max-w-full py-4 menu-body bg-light">
        <a
          class="box-border block px-1 py-4 mx-5 text-lg font-bold border-b-1 border-dark-6"
          href="/forwork/product"
          tabindex="0"
        >
          <i18n>Products </i18n>
        </a>
        <div
          class="box-border block px-1 py-4 mx-5 text-lg font-bold border-b-1 border-dark-6"
          target="_blank"
          tabindex="0"
          @click="handleClickSolutions"
        >
          <i18n> Solutions </i18n><i class="fas fa-caret-down" />
        </div>
        <div
          v-if="showOptions"
        >
          <div class="box-border block px-1 py-4 pl-3 mx-5 text-lg font-bold border-b-1 border-dark-6">
            <a href="/forwork/training">
              <i18n>Employee Training</i18n>
            </a>
          </div>
          <div class="box-border block px-1 py-4 pl-3 mx-5 text-lg font-bold border-b-1 border-dark-6">
            <a href="/forwork/customer-engagement">
              <i18n>Customer Engagement</i18n>
            </a>
          </div>
          <div class="box-border block px-1 py-4 pl-3 mx-5 text-lg font-bold border-b-1 border-dark-6">
            <a href="/forwork/presentations">
              <i18n>Presentations</i18n>
            </a>
          </div>
        </div>
        <a
          class="mx-5 block text-lg box-border font-bold py-4 px-1 border-b-1 border-dark-6"
          href="/forwork/plans?source=navbar"
          target="_blank"
          tabindex="0"
        >
          <i18n>Pricing</i18n>

        </a>
        <div
          v-if="!$user.isLoggedIn"
          class="menu-cta-wrapper py-8 px-5"
        >
          <button
            class="w-full px-6 py-3 mb-4 text-lg font-bold rounded-lg bg-green text-light active:bg-green-dark"
            type="button"
            tabindex="0"
            @click="handleRedirectToSignup"
          >
            <i18n>Sign up free</i18n>
          </button>
          <button
            class="w-full py-3 px-6 text-lg font-bold rounded-lg mb-4 active:bg-dark-20%"
            type="button"
            tabindex="0"
            @click="handleRedirectToLogin"
          >
            <i18n>Log In</i18n>
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ProductsService from '~/services/apis/Products';
import LifecycleEventService from '~/services/LifecycleEventService';

export default {
  data() {
    return {
      showSidebar: false,
      scrolled: false,
      showPlansNav: false,
      redirectTo: this.$user.occupation === 'corporate_learner' ? '/pro/join' : '/admin',
      showOptions: false,
      trialExtensionInProgress: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'isTablet', 'isMobile']),
    hadTrialOrSubscription() {
      return !!this.$user?.userStore?.trial || !!this.$user?.userStore?.subscriptionsStatus?.have;
    },

    freeTrialReidrectTo() {
      return this.$user.occupation === 'corporate_learner' ? '/pro/join' : this.isDesktop ? '/qfwdemo?source=start_trial_cta' : '/admin?source=start_trial_cta';
    },
  },

  mounted() {
    // Note: do not add parentheses () for this.handleScroll
    window.addEventListener('scroll', this.handleScroll);
  },

  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    handleScroll() {
      this.scrolled = window.scrollY > 50;
      if (window.scrollY > 1060) {
        this.showPlansNav = true;
      } else {
        this.showPlansNav = false;
      }
    },

    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    handleRedirectToSignup() {
      window.location.href = '/signup?source=fw_landing_header_burger';
    },
    handleRedirectToLogin() {
      window.location.href = '/login';
    },
    handleClickSolutions() {
      this.showOptions = !this.showOptions;
    },
    async startFreeTrial() {
      if (this.trialExtensionInProgress) {
        return;
      }

      this.$analytics.logEvent(this.$webEvents.QFW_PRICING_PAGE_HEADER_TRIAL_CTA);
      LifecycleEventService.triggerEvent(this.$constants.LifecycleEventServices.BRAZE, this.$user, 'event', 'Pricing Page Plan Card Trial Cta');

      this.trialExtensionInProgress = true;
      await ProductsService.startFreeTrial({ redirectTo: this.freeTrialReidrectTo });
      this.trialExtensionInProgress = false;
    },
  },
};
</script>

<style scoped>
nav {
  font-family: "Quicksand";
}

.borderColor {
  border-color: rgba(0,0,0,0.05);
}

.solutions:hover{
  background: rgb(234, 234, 234);
}
</style>

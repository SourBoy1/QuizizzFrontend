<template>
  <div class="sidebar-navigation flex flex-col overflow-y-auto">
    <SidebarOptionItem
      v-if="shouldShowOrganization"
      to="/snd/dashboard"
      :title="$i18n('My organization')"
      licon="fa-school"
      :aria-label="$i18n('My organization')"
    />

    <SidebarOptionItem
      to="/admin"
      :title="$user.isCorporate ? $i18n('Home') : $i18n('Explore')"
      licon="fa-map-marked-alt"
      :aria-label="$user.isCorporate ? $i18n('Home') : $i18n('Explore')"
    />

    <div
      v-if="!isDesktop"
      class="link flex w-full items-center h-11 hover:bg-dark-5% cursor-pointer text-dark-3"
      @click="showNotification"
    >
      <div class="relative flex justify-center w-4 ml-4 mr-3 icon">
        <div
          v-if="unreadNotificationCount > 0"
          class="w-1.5 h-1.5 absolute rounded-full bg-red text-light right-0 top-0 -mr-0.5 -mt-0.5 opacity-1"
        />
        <FA
          icon="fal fa-bell"
          :size="12"
        />
      </div>
      <span class="text-sm title">
        <i18n>Notifications</i18n>
      </span>
    </div>

    <SidebarOptionItem
      v-if="isUserLoggedIn"
      exactPath
      :to="myLibraryURL"
      :title="$i18n('My Library')"
      licon="fa-books"
      :aria-label="$i18n('My Library')"
    />

    <SidebarOptionItem
      v-if="shouldShowOldOrganization && isUserLoggedIn"
      isExternalRoute
      :to="`/organization/${$user.organization}`"
      licon="fa-school"
      :title="$i18n('My organization')"
      :aria-label="$i18n('My organization')"
    />

    <SidebarOptionItem
      v-if="shouldShowSchool && isUserLoggedIn && isUserATeacher"
      isExternalRoute
      :title="$i18n('My school')"
      licon="fa-school"
      :aria-label="$i18n('My school')"
      :to="$user?.organization ? `/organization/${$user.organization}?source=sidebar_nav` : '/join-organization'"
    />

    <SidebarOptionItem
      v-if="!isUserLoggedIn"
      :title="$i18n('My Library')"
      :aria-label="$i18n('My Library')"
      licon="fa-books"
      to="/admin/private"
      name="library"
      emitClick
      @click="handleSidebarLink"
    />

    <SidebarOptionItem
      v-if="!isUserLoggedIn"
      :title="$i18n('Reports')"
      :aria-label="$i18n('Reports')"
      licon="fa-analytics"
      to="/admin/reports"
      name="reports"
      emitClick
      @click="handleSidebarLink"
    />

    <SidebarOptionItem
      v-if="isUserLoggedIn"
      isExternalRoute
      :title="$i18n('Reports')"
      :aria-label="$i18n('Reports')"
      licon="fa-analytics"
      to="/admin/reports"
    />

    <SidebarOptionItem
      v-if="shouldShowClasses && !isUserLoggedIn"
      :title="$i18n('Classes')"
      :aria-label="$i18n('Classes')"
      licon="fa-analytics"
      to="/admin/classes"
      name="classes"
      emitClick
      @click="handleSidebarLink"
    />

    <SidebarOptionItem
      v-if="shouldShowClasses && isUserLoggedIn"
      exactPath
      to="/admin/classes"
      :title="$i18n('Classes')"
      licon="fa-users-class"
      :aria-label="$i18n('Classes')"
    />

    <SidebarOptionItem
      v-if="shouldShowGroups"
      :title="$i18n('Groups')"
      :aria-label="$i18n('Groups')"
      licon="fa-users-class"
      to="/admin/groups"
      name="groups"
      @click="handleSidebarLink"
    />

    <SidebarOptionItem
      v-if="!isUserLoggedIn"
      :title="$i18n('Settings')"
      :aria-label="$i18n('Settings')"
      licon="fa-cog"
      to="/settings"
      name="settings"
      emitClick
      @click="handleSidebarLink"
    />

    <SidebarOptionItem
      v-if="isUserLoggedIn"
      exactPath
      to="/settings"
      :title="$i18n('Settings')"
      licon="fa-cog"
      :aria-label="$i18n('Settings')"
    />

    <transition
      appear
      enter-active-class="animate__animated animate__fadeIn animation-duration-100"
      leave-active-class="animate__animated animate__fadeOut animation-duration-100"
    >
      <div
        v-if="open"
      >
        <SidebarOptionItem
          v-if="!isUserLoggedIn"
          :title="$i18n('Memes')"

          :aria-label="$i18n('Memes')"
          licon="fa-images"
          to="/memes"
          name="memes"
          emitClick
          @click="handleSidebarLink"
        />
        <SidebarOptionItem
          v-else
          exactPath
          to="/admin/memes"
          :title="$i18n('Memes')"

          licon="fa-images"
          :aria-label="$i18n('Memes')"
        />

        <SidebarOptionItem
          v-if="!isUserLoggedIn"
          :title="$i18n('Collections')"

          :aria-label="$i18n('Collections')"
          licon="fa-folder"
          to="/collections"
          name="collections"
          emitClick
          @click="handleSidebarLink"
        />

        <SidebarOptionItem
          v-if="isUserLoggedIn"
          exactPath
          :to="`/profile/${$user.id}?section=collections`"
          :title="$i18n('Collections')"
          licon="fa-folder"
          :aria-label="$i18n('Collections')"
        />

        <SidebarOptionItem
          v-if="!isUserLoggedIn"
          :title="$i18n('Profile')"

          :aria-label="$i18n('Profile')"
          licon="fa-circle-user"
          to="/profile"
          name="profile"
          emitClick
          @click="handleSidebarLink"
        />

        <SidebarOptionItem
          v-if="isUserLoggedIn"
          exactPath
          :to="`/profile/${$user.id}?section=library`"
          :title="$i18n('Profile')"

          licon="fa-user-circle"
          :aria-label="$i18n('Profile')"
        />

        <SidebarOptionItem
          v-if="isUserLoggedIn"
          :title="$i18n('Logout')"

          :aria-label="$i18n('Logout')"
          licon="fa-sign-out"
          to="/logout"
          name="logout"
          emitClick
          @click="logOut()"
        />
      </div>
    </transition>

    <SidebarOptionItem
      v-if="isUserLoggedIn && !isDesktop"
      :title="$i18n('Logout')"
      :aria-label="$i18n('Logout')"
      licon="fa-sign-out"
      to="/logout"
      name="logout"
      emitClick
      @click="logOut()"
    />

    <button
      v-if="isDesktop"
      type="button"
      class="link flex w-full items-center p-4 hover:bg-dark-5% cursor-pointer"
      :class="[isSidebarCollapsed ? 'text-dark-4' : 'text-dark-3']"
      :aria-label="open ? $i18n('More') : $i18n('Less')"
      @click="open = !open"
    >
      <div
        class="flex justify-center w-6 icon"
        :class="{
          'w-full': isSidebarCollapsed && !isSidebarExpandedOnContent,
        }"
      >
        <FA
          :icon="`fal fa-chevron-${open ? 'up' : 'down'}`"
          :size="12"
        />
      </div>
      <div
        v-if="!isSidebarCollapsed || isSidebarExpandedOnContent"
        class="text-sm title ml-1"
      >
        <i18n v-if="open">
          Less
        </i18n>
        <span v-else>{{ $i18n('More') }}</span>
      </div>
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import AuthService from '~/services/apis/AuthService';

import zendeskUtils from '~/utils/ZendeskUtils';
import { shouldHideCT } from '~/utils/ExperimentUtils';
import showSnDAdminFeatures from '~/utils/SnDUtils';

let zendeskInitTimeout; let showWidgetTimeout; let
  hideWidgetTimeout;

export default {
  emits: ['disabled'],
  data() {
    return {
      open: false,
      displayLoginPromptModal: false,
      myLibraryURL: this.getMyLibraryURL(),
    };
  },

  head() {
    return {
      script: [
        {
          id: 'ze-snippet',
          src: zendeskUtils.zendeskScriptSrc(this.$user),
        },
      ],
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'unreadNotificationCount']),
    ...mapGetters('root', ['serverData']),
    ...mapGetters('uiManager', ['isSidebarCollapsed', 'isSidebarExpandedOnContent']),

    isMyLibraryPage() {
      return this.$route.name === this.$constants.PageNames.MY_LIBRARY;
    },

    isUserLoggedIn() {
      return Boolean(this.$user.id);
    },

    shouldShowOrganization() {
      return showSnDAdminFeatures();
    },

    shouldShowOldOrganization() {
      if (this.$user.isCorporate) {
        return false;
      }

      return this.isUserLoggedIn && this.isDesktop
      && !Object.values(this.$constants.OrganizationRole).includes(this.$user.organizationRole)
         && (this.isCountryUSA || ['dev', 'development'].includes(import.meta.env.VITE_NODE_ENV));
    },

    isUserATeacher() {
      return ['teacher', 'teacher_school', 'teacher_university'].includes(this.$user.occupation);
    },

    shouldShowSchool() {
      const isInSelectedCategory = ['PH', 'MX', 'MY', 'PE', 'CO', 'AE', 'PL'].includes(this.serverData.requestCountry);
      return (isInSelectedCategory || ['dev', 'development'].includes(import.meta.env.VITE_NODE_ENV));
    },

    isCountryUSA() {
      return this.serverData.requestCountry === 'US';
    },

    shouldShowClasses() {
      return this.$user.occupation !== this.$constants.UserOccupation.STUDENT && !this.$user.isCorporate;
    },

    shouldShowGroups() {
      return this.$user.isCorporate;
    },

    isCollectionsRoute() {
      return this.$route.query.section === 'collections';
    },

  },

  mounted() {
    this.$eventBus.$on('sidebar:disable', this.handleDisable);
    this.$eventBus.$on('url-query-params-added', this.onQueryParamAdded);
    this.$router.beforeEach((to, from, next) => {
      this.hideSidebar();
      next();
    });

    this.showZendesk();
  },

  beforeUnmount() {
    this.hideZendesk();
    zendeskInitTimeout && clearTimeout(zendeskInitTimeout);
    showWidgetTimeout && clearTimeout(showWidgetTimeout);
    hideWidgetTimeout && clearTimeout(hideWidgetTimeout);

    this.$eventBus.$off('sidebar:disable', this.handleDisable);
    this.$eventBus.$off('url-query-params-added', this.onQueryParamAdded);
  },

  methods: {
    shouldHideCT,

    isCurrentRoute(route) {
      return this.$route.name === route;
    },

    isCurrentRouteStartingWith(value) {
      return this.$route.name.startsWith(value);
    },

    navigate(path, shouldUseInternalRouting) {
      if (shouldUseInternalRouting) {
        this.$router.push(path || '/admin');
        return;
      }

      window.location.pathname = path || '/admin';
    },

    async logOut() {
      await AuthService.logout();
      window.location = '/';
    },

    showZendesk() {
      showWidgetTimeout = zendeskUtils.showWebWidget();
    },

    hideZendesk() {
      hideWidgetTimeout = zendeskUtils.hideWebWidget();
    },

    showSignUpModal(title) {
      this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW, { type: 'signup', title });
    },

    showNotification() {
      if (this.isUserLoggedIn) {
        this.$eventBus.$emit('notification:show');
        this.$eventBus.$emit('sidebar:hide');
      } else {
        this.showSignUpModal();
        this.hideSidebar();
      }
    },

    userFlowEventLogger(eventName, popupName, prevSource) {
      this.$analytics.logEvent(
        eventName,
        {
          popup_name: popupName,
          previous_source: prevSource,
          ctaSource: prevSource,
          fromPage: this.$route.name,
        },
      );
    },

    handleSidebarLink(type) {
      switch (type) {
        case 'library':
          if (this.$user?.isCorporate) {
            this.navigate('/admin/corporate', true);
            break;
          }

          this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'intermediate_pop_up', 'my_library_btn');
          this.navigateOrShowAuthModal('/admin/private', this.$i18n('Where should we save your quizzes?'), {
            shouldUseInternalRouting: true,
          });

          this.$router.push({
            path: this.$route.path,
            query: {
              ...this.$route.query,
              ctaSource: 'my_library_btn',
              fromPage: this.$route.name,
            },
          });
          break;
        case 'reports':
          this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'intermediate_pop_up', 'reports_btn');
          this.navigateOrShowAuthModal('/admin/reports', this.$i18n('Don\'t lose hard-earned feedback!'));

          this.$router.push({
            path: this.$route.path,
            query: {
              ...this.$route.query,
              ctaSource: 'reports_btn',
              fromPage: this.$route.name,
            },
          });
          break;
        case 'classes':
          this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'intermediate_pop_up', 'classes_btn');
          this.navigateOrShowAuthModal('/admin/classes', this.$i18n('Assign quizzes with Classes!'), {
            shouldUseInternalRouting: true,
          });

          this.$router.push({
            path: this.$route.path,
            query: {
              ...this.$route.query,
              ctaSource: 'classes_btn',
              fromPage: this.$route.name,
            },
          });
          break;
        case 'groups':
          this.userFlowEventLogger(this.$webEvents.QfwGroup.GROUP_TAB_CLICK, '', 'group_btn');
          break;
        case 'memes':
          if (this.isUserLoggedIn) {
            this.navigate('/admin/memes', true);
          } else {
            this.showSignUpModal();
            this.hideSidebar();

            this.$router.push({
              path: this.$route.path,
              query: {
                ...this.$route.query,
                ctaSource: 'memes_btn',
                fromPage: this.$route.name,
              },
            });

            this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'signup_pop_up', 'memes_btn');
          }
          break;
        case 'collections':
          if (this.isUserLoggedIn) {
            this.navigate(`/profile/${this.$user.id}?section=collections`, true);
          } else {
            this.showSignUpModal();
            this.hideSidebar();

            this.$router.push({
              path: this.$route.path,
              query: {
                ...this.$route.query,
                ctaSource: 'collections_btn',
                fromPage: this.$route.name,
              },
            });
            this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'signup_pop_up', 'collections_btn');
          }
          break;
        case 'profile':
          if (this.isUserLoggedIn) {
            this.navigate(`/profile/${this.$user.id}`, true);
          } else {
            this.showSignUpModal();
            this.hideSidebar();

            this.$router.push({
              path: this.$route.path,
              query: {
                ...this.$route.query,
                ctaSource: 'profile_btn',
                fromPage: this.$route.name,
              },
            });

            this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'signup_pop_up', 'profile_btn');
          }
          break;
        case 'settings':
          if (this.isUserLoggedIn) {
            this.navigate('/settings', true);
          } else {
            this.showSignUpModal();
            this.hideSidebar();

            this.$router.push({
              path: this.$route.path,
              query: {
                ...this.$route.query,
                ctaSource: 'settings_btn',
                fromPage: this.$route.name,
              },
            });

            this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'signup_pop_up', 'settings_btn');
          }
          break;
        case 'snd-dashboard':
          this.navigateOrShowAuthModal('/snd/dashboard', this.$i18n('Admin Dashboard!'), {
            shouldUseInternalRouting: true,
          });

          this.$router.push({
            path: this.$route.path,
            query: {
              ...this.$route.query,
              ctaSource: 'snd-dashboard',
              fromPage: this.$route.name,
            },
          });

          this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'intermediate_pop_up', 'snd-dashboard');
          break;
        default:
      }
    },

    navigateOrShowAuthModal(url, title, opts = {}) {
      const { shouldUseInternalRouting } = opts;
      if (this.$user.id) {
        this.displayLoginPromptModal = false;
        this.navigate(url, shouldUseInternalRouting ?? false);
      } else {
        this.displayLoginPromptModal = true;
        this.showSignUpModal(title);

        this.hideSidebar();
      }
    },

    handleDisable(status = true) {
      if (status) {
        this.$emit('disabled', status);
      }
      this.isSidebarDisabled = status;
    },

    getMyLibraryURL() {
      if (this.$user.isCorporate) {
        return '/admin/corporate';
      }
      return '/admin/private';
    },

    onQueryParamAdded() {
      this.myLibraryURL = this.getMyLibraryURL();
    },

    hideSidebar() {
      if (!this.isDesktop) {
        this.$eventBus.$emit('sidebar:hide');
        this.$eventBus.$emit('overlay:hide');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/colors.scss';

.sidebar-navigation {
  .link {
    &.selected {
      box-shadow: inset -4px 0 0 0 $lilac;
    }
  }
}

.create-btn-container {
  width: fit-content;
}
</style>

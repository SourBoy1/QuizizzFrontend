<!-- eslint-disable vue/no-lone-template -->
<template>
  <header>
    <div
      id="app-header"
      v-click-outside="() => hideSearchBar()"
      class="main-header fixed border-light-1 h-14.5 box-content"
      :style="headerWidthConfig"
      :class="[shouldHaveHigherZIndex && !isPageSearchActive ? 'z-50 border-b-0' : `border-b ${isCurrentMyLibraryPage || isPageSearchActive ? 'z-0' : 'z-10' }`]"
      translate="no"
    >
      <nav
        :class="[
          'bg-light-3 text-dark-3 flex flex-row relative justify-between space-x-2 h-auto',
          overlay ? 'overlay' : '', navigationStyles, showQuizizzLogo ? 'md:w-screen' : '', quizPageSearchStyle && !isShowingSearchBarQuizPage ? 'bg-lilac-faded' : '',
        ]"
      >
        <router-link
          v-show="showQuizizzLogo"
          :prefetch="false"
          :to="logoRedirectionUrl"
          :class="['logo', 'hidden', 'md:block']"
          aria-label="Quizizz"
          title="Quizizz"
        >
          <img
            aria-hidden="true"
            class="p-1 w-32 h-10 object-contain"
            src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
            alt="logo"
          />
        </router-link>
        <div
          class="flex flex-row items-center md:hidden md:pl-3"
        >
          <div
            v-show="showBackBtn"
            class="flex items-center h-full text-xxs"
            @click.stop="onBackClick"
          >
            <span class="pr-1.5">
              <i class="fas fa-angle-left pr-1.5" />
            </span>
            <i18n class="font-semibold">
              Back
            </i18n>
          </div>
          <button
            type="button"
            @click.stop="showSidebar"
          >
            <div class="relative">
              <div
                v-if="getUnreadNotificationsCount > 0"
                class="absolute right-0 w-2 h-2 -mr-1 rounded-full bg-red text-light opacity-1"
              />
              <FA
                icon="fas fa-bars"
                :size="16"
              />
            </div>
          </button>
          <router-link
            v-show="shouldShowQuizizzLogo"
            :prefetch="false"
            class="pl-2 md:hidden"
            :to="logoRedirectionUrl"
          >
            <img
              class="object-contain w-20 h-full p-1 mr-auto"
              src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
              alt="logo"
            />
          </router-link>
        </div>
        <div
          class="flex flex-row space-x-2"
          :class="[isUserLoggedIn ? 'flex-grow' : 'flex-none md:flex-grow', searchBarMobileContainerStyles, quizPageSearchStyleWithoutIsDesktop ? 'md:justify-end' : '']"
        >
          <client-only>
            <div
              v-if="shouldShowSearchBar && !(isShowingSearchBarQuizPage && showQuizizzLogo) && !showForGroup && showForClasses"
              class="flex flex-grow ml-auto"
            >
              <MainHeaderSearchBar
                :showQuizizzLogo="showQuizizzLogo"
                @active="onActive"
                @dropdown:show="showDropdown = true"
                @dropdown:hide="showDropdown = false"
              />
            </div>
            <div
              v-else-if="(isClassesPage || isGroupPage)"
              class="flex md:hidden items-center flex-grow h-10 text-base font-semibold text-dark-2"
              :class="[isEmpty(dynamicHeaderBtn) ? 'ml-12' : 'ml-2']"
            >
              {{ pageTitle }}
            </div>
          </client-only>
          <div :class="['flex space-x-2 flex-row pl-0 md:pl-2 h-10', { 'items-center pr-2': isMobile }]">
            <div
              v-show="(isClassesPage || isGroupPage)"
              class="xs:hidden"
            >
              <Button
                v-if="!isEmpty(dynamicHeaderBtn)"
                :title="$i18n(dynamicHeaderBtn.title)"
                :licon="dynamicHeaderBtn.licon"
                :fullHeight="true"
                size="md"
                type="secondary"
                @click.stop="onDynamicHeaderBtn"
              />
            </div>
            <Button
              v-show="shouldShowSearchButton"
              licon="far fa-search"
              class="mt-auto mb-auto md:hidden"
              :fullHeight="true"
              size="md"
              type="other"
              rounded="full"
              :aria-label="$i18n('search')"
              :iconSize="'sm'"
              @click.stop="showSearchBar = true"
            />
            <Button
              v-show="showEnterCode && shouldShowLoginAndCodeButtons && !(isClassesPage && isMobile)"
              :class="quizPageSearchStyle && isShowingSearchBarQuizPage ? 'h-10' : quizPageSearchStyle && !isShowingSearchBarQuizPage ? 'whiteBG' : ''"
              :title="$i18n('Enter code')"
              :fullHeight="true"
              :size="!isDesktop ? 'xs' : 'md'"
              :type="$user.id ? 'secondary' : 'other'"
              @click.stop="redirectToJoin"
            />
            <div v-if="!!$user.id">
              <div class="relative hidden md:block">
                <div
                  v-if="getUnreadNotificationsCount > 0"
                  class="absolute right-0 flex items-center justify-center w-5 h-5 -mt-1 -mr-1 text-xs rounded-full bg-red text-light opacity-1"
                >
                  {{ formattedUnreadCount }}
                </div>
                <Button
                  licon="far fa-bell"
                  :fullHeight="true"
                  size="xl"
                  type="other"
                  rounded="full"
                  :aria-label="$i18n('notification')"
                  :iconSize="'lg'"
                  @click.stop="toggleNotification"
                />
              </div>
            </div>
            <div
              v-else
              class="flex h-10"
            >
              <Button
                v-show="shouldShowLoginAndCodeButtons"
                class="mr-2 h-10"
                :class="quizPageSearchStyle && isShowingSearchBarQuizPage ? 'h-10' : quizPageSearchStyle && !isShowingSearchBarQuizPage ? 'whiteBG' : ''"
                :title="$i18n('Log in')"
                :fullHeight="true"
                size="md"
                :type="isDesktop ? 'secondary' : 'primary'"
                @click.stop="showLoginModal"
              />
              <Button
                :class="[quizPageSearchStyle && isShowingSearchBarQuizPage ? 'h-10' : '', 'hidden md:block']"
                :title="$i18n('Sign up')"
                :fullHeight="true"
                size="md"
                type="primary"
                @click.stop="showSignupModal"
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
    <div class="absolute">
      <GroupCreateNewModal
        v-if="qfwCreateGroupModalState"
        action="create"
        @close="addNewGroup"
        @groupCreated="handleClassCreated"
      />
    </div>
    <NotificationDropdown
      v-if="showNotification"
      :notifications="notifications"
      :loading="isLoading"
      @markOneNotificationAsRead="markOneNotificationAsRead"
      @toggleNotification="toggleNotification"
    />
  </header>
</template>

<script>

import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

import { mapActions, mapGetters } from 'vuex';

import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import { isClient } from '~/utils/EnvUtils';
import NotificationService from '~/services/apis/NotificationService';
import BrazeService from '~/services/BrazeService';

import brazeNotificationsMixin from '~/mixins/brazeNotificationsMixin';

dayjs.extend(relativeTime);

export default {
  mixins: [brazeNotificationsMixin],

  props: {
    showQuizizzLogo: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],

  data() {
    return {
      showEnterCode: true,
      overlay: false,
      showNotification: false,
      notifications: {},
      currentPage: 0,
      hasMoreNotification: true,
      loadingMoreNotification: false,
      socket: null,
      unreadNotifications: [],
      showSearchBar: true,
      showDropdown: false,
      pageTitle: '',
      dynamicHeaderBtn: {},
      showBackBtn: false,
      isPageSearchActive: false,
      gameSocket: null,
      logoRedirectionUrl: this.getLogoRedirectionUrl(),
      isLoading: false,
    };
  },

  computed: {
    ...mapGetters('root', ['unreadNotificationCount', 'serverData', 'deviceProps', 'isDesktop']),
    ...mapGetters('uiManager', ['isShowingSearchBarQuizPage', 'isSidebarCollapsed', 'isSidebarExpandedOnContent', 'qfwCreateGroupModalState']),

    formattedUnreadCount() {
      return this.getUnreadNotificationsCount > 9 ? '9+' : this.getUnreadNotificationsCount;
    },

    isMobile() {
      return this.deviceProps.type === this.$constants.DeviceTypes.PHONE;
    },

    isCurrentPageSearchPage() {
      return this.$route.name === this.$constants.PageNames.SEARCH_PAGE;
    },

    isCurrentMyLibraryPage() {
      return [this.$constants.PageNames.MY_LIBRARY, this.$constants.PageNames.CORPORATE].includes(this.$route.name);
    },

    isClassesPage() {
      return this.$route.name.startsWith(this.$constants.PageNames.CLASSES_PAGE);
    },

    shouldSidebarBeCollapsed() {
      return this.isSidebarCollapsed;
    },

    headerWidthConfig() {
      return {
        '--sidebar-width': this.shouldSidebarBeCollapsed ? '56px' : '200px',
      };
    },

    shouldShowLoginAndCodeButtons() {
      return !(this.showSearchBar && !this.isDesktop);
    },

    isUserLoggedIn() {
      return Boolean(this.$user.id);
    },

    isGroupPage() {
      return this.$route.name.startsWith('admin-groups');
    },

    // Show quizizz logo only if client is logged out and not searching
    shouldShowQuizizzLogo() {
      return (!this.showSearchBar) && !this.isUserLoggedIn;
    },

    showForGroup() {
      return this.isMobile && this.isGroupPage;
    },

    showForClasses() {
      return (!this.isMobile || !this.isClassesPage);
    },

    shouldShowSearchBar() {
      return (this.showSearchBar || this.isUserLoggedIn);
    },

    // Show search button only if client is logged out or not using search input
    shouldShowSearchButton() {
      return !this.showSearchBar && !this.isUserLoggedIn;
    },

    navigationStyles() {
      if (this.isUserLoggedIn || this.isDesktop) {
        return 'p-2';
      }

      return 'px-1 py-3';
    },

    searchBarMobileContainerStyles() {
      if (this.showSearchBar) {
        return 'flex-grow pl-6 md:pl-0';
      }

      return '';
    },

    searchBarMobileWrapperOnLoggedInStyles() {
      if (this.isUserLoggedIn && !this.isDesktop) {
        return 'pl-4';
      }

      return '';
    },

    shouldHaveHigherZIndex() {
      return (this.overlay || this.showDropdown);
    },

    quizPageSearchStyle() {
      return this.isDesktop && !this.isUserLoggedIn && this.showQuizizzLogo;
    },

    quizPageSearchStyleWithoutIsDesktop() {
      return !this.isUserLoggedIn && this.showQuizizzLogo;
    },

    deviceWidth() {
      return this.deviceProps.width;
    },
  },

  watch: {
    async showNotification(value) {
      if (value) {
        if (this.unreadNotifications.length) {
          const response = await this.notificationService.markMultipleNotificationsAsRead(
            this.unreadNotifications.map((notif) => notif._id),
          );
          if (response) {
            this.markMultipleNotificationsAsRead();
          }
        }
      }
    },
    deviceWidth() {
      if (!this.isDesktop) {
        this.showSearchBar = false;
      } else {
        this.showSearchBar = true;
      }
    },
  },

  async created() {
    this.isLoading = true;
    // if page is quiz page then set showSearchBar as true
    const regex = /\/admin\/[\s\S]*\/[0-9a-fA-F]{24}\/[\s\S]*/s;
    if (!this.$user.isLoggedIn && regex.test(this.$route.path)) {
      this.showSearchBar = false;
    }

    // Get and setup notifications
    if (isClient() && this.isUserLoggedIn) {
      this.notificationService = new NotificationService(
        this.serverData.notification_server,
        this.serverData.notification_socket,
        this.$user.id,
      );
      this.loadingMoreNotification = true;
      const res = await this.notificationService.get();
      if (!res.data) {
        return;
      }
      this.notifications = this.sortByDaysAgo(res.data.notifications);
      // Check if user has more notifications
      if (!res.data.notifications.length) {
        this.hasMoreNotification = false;
      }
      // Check for unread notifications
      res.data.notifications.forEach((notif) => {
        if (!notif.read) {
          this.unreadNotifications.push(notif);
        }
      });

      this.setUnreadNotificationCount(res.data.unread);
      this.loadingMoreNotification = false;
      this.isLoading = false;
    }
  },

  mounted() {
    this.$eventBus.$on('mainDynamicHeader:show', this.assignDynamicHeader);
    this.$eventBus.$on('dynamicHeaderBtn:createGroup', this.addNewGroup);
    this.$eventBus.$on('url-query-params-added', this.onQueryParamAdded);
    if (this.$user.id && this.notificationService) {
      this.socket = this.notificationService.initSocket();
      this.socket.on('connect', () => {
        this.socket.emit('subscribe', {
          userId: this.$user.id,
        });

        this.socket.on('add-notification', (data) => {
          this.notifications = { ...this.sortByDaysAgo([data.notification]), ...this.notifications };
          this.unreadNotifications.push(data.unreadNotifications);
          this.setUnreadNotificationCount(this.unreadNotificationCount + 1);
        });

        this.socket.on('update-notification', (data) => {
          Object.keys(this.notifications).forEach((key) => {
            const index = this.notifications[key].findIndex((notification) => notification._id === data.notification._id);
            this.notifications[key][index] = data.notification;
          });
          this.setUnreadNotificationCount(this.unreadNotificationCount + 1);
        });
      });
    }

    this.$eventBus.$on('notification:show', this.toggleNotification);

    this.$eventBus.$on('page-search-active', () => {
      this.isPageSearchActive = true;
    });

    this.$eventBus.$on('page-search-inactive', () => {
      this.isPageSearchActive = false;
    });

    window.addEventListener('scroll', this.onScroll, true);

    if (!this.isDesktop) {
      this.hideSearchBar();
    } else {
      this.showSearchBar = true;
    }
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.emit('disconnected', {
        user: this.$user.id,
      });
    }

    window.removeEventListener('scroll', this.onScroll, true);
    this.$eventBus.$off('notification:show', this.toggleNotification);
    this.$eventBus.$off('mainDynamicHeader:show');
    this.$eventBus.$off('dynamicHeaderBtn:createGroup', this.addNewGroup);
    this.$eventBus.$off('page-search-active');
    this.$eventBus.$off('page-search-inactive');
    this.$eventBus.$off('url-query-params-added', this.onQueryParamAdded);
  },

  methods: {
    isEmpty,
    ...mapActions('root', ['setUnreadNotificationCount']),

    showSidebar() {
      this.$eventBus.$emit('sidebar:show');
    },

    onDynamicHeaderBtn() {
      this.$eventBus.$emit(`dynamicHeaderBtn:${this.dynamicHeaderBtn.action}`);
    },

    onBackClick() {
      this.$eventBus.$emit('headerBackClick:click');
    },

    onScroll() {
      if (this.$route.path.includes('admin/search')) {
        return;
      }

      const header = document.getElementById('app-header');
      const body = document.getElementById('app-body-container');
      if (header && body) {
        header.classList.toggle('shadow-soft-lowest', body.scrollTop > 0);
        header.classList.toggle('border-b', body.scrollTop === 0);
      }
    },

    addNewGroup() {
      this.$store.dispatch('uiManager/toggleQfwCreateGroupModal');
    },

    handleClassCreated(groupId) {
      this.$analytics.logEvent(this.$webEvents.QfwGroup.CREATE_GROUP_SUCCESS, { groupId });
      this.$router.push(`/admin/groups/${groupId}/manageRoster?showAddStudent=true`);
    },

    onActive(isActive) {
      if (this.isPageSearchActive) {
        return;
      }

      if (isActive) {
        this.$eventBus.$emit('overlay:show', { zIndex: 20 });
      } else {
        this.$eventBus.$emit('overlay:hide');
        this.hideSearchBar();
      }

      this.overlay = isActive;

      if (!this.isDesktop) {
        this.showEnterCode = !isActive;
      } else {
        this.showEnterCode = true;
      }
    },

    showLoginModal() {
      this.$router.push({
        name: this.$router.name,
        query: {
          ...this.$route.query,
          ctaSource: 'main-header-login',
          fromPage: this.$route.name,
        },
      });

      this.$analytics.logEvent(
        this.$webEvents.LOGIN_FLOW,
        {
          popup_name: 'login_pop_up',
          previous_source: 'main_header_login_btn',
        },
      );

      this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW, {
        type: 'login',
        header: this.$i18n('Welcome to Quizizz'),
      });
    },

    hideSearchBar() {
      if (this.isDesktop) {
        return;
      }
      this.showSearchBar = false;
    },

    showSignupModal() {
      this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW, {
        type: 'signup',
        header: this.$i18n('Welcome to Quizizz'),
      });

      this.$router.push({
        name: this.$router.name,
        query: {
          ...this.$route.query,
          ctaSource: 'main-header',
          fromPage: this.$route.name,
        },
      });

      this.$analytics.logEvent(
        this.$webEvents.SIGNUP_FLOW,
        {
          popup_name: 'signup_pop_up',
          previous_source: 'main-header_signup_btn',
          ctaSource: 'main-header',
          fromPage: this.$route.name,
        },
      );
    },

    redirectToJoin() {
      let url = '/join';
      if (this.$user?.isCorporate) {
        url = '/pro/join';
      }

      if (this.$msTeams?.isTeamApp()) {
        this.$msTeams?.openStageView(url);
        return;
      }

      window.open(url);
    },

    markOneNotificationAsRead(detail) {
      const { key, index } = detail;
      if (key && index > -1) {
        this.notifications[key][index].read = true;
      }
    },

    markMultipleNotificationsAsRead() {
      this.unreadNotifications.forEach((notif) => {
        Object.keys(this.notifications).forEach((key) => {
          this.notifications[key].forEach((value, index) => {
            if (value._id === notif._id) {
              this.notifications[key][index].read = true;
            }
          });
        });
        this.setUnreadNotificationCount(this.unreadNotificationCount - 1);
      });
    },

    getKey(notification) {
      return dayjs(notification.at).from(dayjs());
    },

    getLogoRedirectionUrl() {
      return '/admin';
    },

    onQueryParamAdded() {
      this.logoRedirectionUrl = this.getLogoRedirectionUrl();
    },

    sortByDaysAgo(data) {
      return groupBy(data, this.getKey);
    },

    toggleNotification() {
      BrazeService.refreshContentCards();
      this.showNotification = !this.showNotification;
    },

    addMoreNotifications(notifications) {
      const groupedNotification = this.sortByDaysAgo(notifications);
      Object.keys(groupedNotification).forEach((notification) => {
        if (this.notifications[notification]) {
          const mergedArray = [...this.notifications[notification], ...groupedNotification[notification]];
          const set = new Set();
          this.notifications[notification] = mergedArray.filter((item) => {
            if (!set.has(item._id)) {
              set.add(item._id);
              return true;
            }
            return false;
          }, set);
        } else {
          this.notifications[notification] = groupedNotification[notification];
        }
      });
    },

    async loadMoreNotification() {
      if (!this.loadingMoreNotification && this.hasMoreNotification) {
        this.currentPage += 1;
        this.loadingMoreNotification = true;
        const res = await this.notificationService.get(this.currentPage);

        if (res.data.notifications.length) {
          this.addMoreNotifications(res.data.notifications);
        }

        if (!res.data.notifications.length) {
          this.hasMoreNotification = false;
        }

        this.loadingMoreNotification = false;
      }
    },

    assignDynamicHeader({ title = '', dynamicBtn = {}, showBackBtn = false }) {
      // Adjust Header for mobile view (remove search, burger menu and add "< Back" option)
      this.pageTitle = this.$i18n(title);
      this.dynamicHeaderBtn = dynamicBtn;
      this.showBackBtn = showBackBtn;
    },
  },
};
</script>

<style lang="scss" scoped>
.main-header {
  width: 100%;
  @screen md {
    width: calc(100% - var(--sidebar-width));
  }
}
.whiteBG {
  background: #F9F9F9;
}
</style>

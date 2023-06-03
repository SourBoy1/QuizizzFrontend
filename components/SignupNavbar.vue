<template>
  <div
    class="box-border fixed top-0 z-20 w-full px-2 py-4 admin-signup bg-purple"
    :class="!shouldShowHeader && !isDesktop ? 'hidden' : ''"
  >
    <div class="signup-header-view">
      <div class="flex justify-between max-w-screen-xl mx-auto my-0">
        <div class="h-7">
          <a href="/">
            <img
              class="h-full xs:ml-10"
              src="https://cf.quizizz.com/img/quizizz_logos/white-brandmark-600x164.png"
              alt="Quizizz"
            />
          </a>
        </div>
        <div class="flex items-center justify-center btn-tray-right align-center">
          <div class="h-8 px-4 py-1 mr-3 text-sm transition-transform scale-100 rounded bg-purple-dark text-light-3 xs:mr-6 hover:scale-110">
            <router-link
              to="/join"
              target="_blank"
            >
              <span>{{ joinAGame }}</span>
            </router-link>
          </div>
          <div
            v-if="!isLoggedIn"
            class="h-8 px-4 py-1 text-sm transition-transform scale-100 rounded bg-purple-light text-light-3 hover:scale-110"
          >
            <router-link :to="isLoginPage ? { path: `/signup`, query: $route.query } : { path: `/login`, query: $route.query }">
              {{ isLoginPage ? $i18n('Sign up') : $i18n('Log in') }}
            </router-link>
          </div>
          <div
            v-else
            class="account-status inline-block align-middle mt-4 border-1 border-solid border-dark-4 py-0.5 w-[157px] h-12 group rounded-lg cursor-pointer"
          >
            <div
              tabindex="0"
              class="flex w-full mt-1"
              @keyup.enter="handleStatusClick"
              @click="handleStatusClick"
            >
              <div class="h-8 w-8 mt-0.5 mx-1.5">
                <img
                  class="rounded-full"
                  :src="userMedia"
                  alt="profile-logo"
                />
              </div>
              <div class="w-20 whitespace-nowrap">
                <div class="text-xxs text-dark-4">
                  <i18n>Signed in as</i18n>
                </div>
                <div class="text-xs font-bold truncate text-light">
                  {{ userDisplayName }}
                </div>
              </div>
              <FA
                icon="far fa-chevron-down"
                class="ml-3.5 text-dark-4"
              />
            </div>
            <div
              ref="logOut"
              :class="statusButtonClicked ? 'block' : 'hidden'"
              class="w-full h-8 py-1 mt-2 text-sm text-left align-middle rounded-lg cursor-pointer group-hover:block log-out-button bg-purple-dark text-light"
              @click="logOut"
            >
              <FA
                :size="12"
                class="ml-4 mr-1 text-light"
                icon="far fa-arrow-right-from-bracket"
              />
              <i18n>Log out</i18n>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import AuthService from '~/services/apis/AuthService';

export default {

  data() {
    return {
      shouldShowLogOut: true,
      statusButtonClicked: false,
      shouldShowHeader: true,
      isLoginPage: this.$route?.name === 'login',
    };
  },

  computed: {
    ...mapGetters('root', ['isMobile', 'isDesktop', 'user']),
    userDisplayName() {
      const { user } = this;
      if (user.title && user.lastName) {
        return `${user.title} ${user.lastName}`;
      }

      if (!user.title && user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }

      return user.username;
    },

    joinAGame() {
      return this.isMobile ? this.$i18n('Join') : this.$i18n('Join a game');
    },

    userMedia() {
      return this.$user.media;
    },

    isLoggedIn() {
      return Boolean(this.$user.id);
    },
  },

  watch: {
    '$route.path': {
      handler(to, from) {
        const regexLogin = /^\/login/s;
        const regexSignup = /^\/signup/s;
        if (!this.$user.isLoggedIn && regexLogin.test(to)) {
          this.shouldShowHeader = false;
        } else if (!this.$user.isLoggedIn && regexSignup.test(to)) {
          this.shouldShowHeader = false;
        } else {
          this.shouldShowHeader = true;
        }
      },

      immediate: true,
    },

    $route() {
      this.isLoginPage = this.$route?.name === 'login';
    },
  },

  methods: {
    async logOut() {
      await AuthService.logout();
      window.location.href = '/';
    },

    handleStatusClick() {
      this.statusButtonClicked = !this.statusButtonClicked;
    },
  },

};
</script>

<style lang="scss">
.admin-signup {
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 40%);
}
</style>

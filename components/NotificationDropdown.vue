<template>
  <div
    class="notif-dimension shadow-lg border-dark-6 border bg-light absolute z-on-overlay right-0 flex flex-col"
    :class="[isDesktop ? '' : 'fixed top-0']"
  >
    <div
      v-if="!isDesktop"
      class="text-center py-4 px-2 sticky"
      :class="[scrolled ? 'shadow-soft-lowest' : 'border-b border-light-1']"
    >
      <div class="absolute top-0 mt-4">
        <Button
          size="xs"
          :title="$i18n('Close')"
          licon="fa fa-times mb-0.5"
          type="custom"
          @click="toggleNotification"
        />
      </div>
      <h3 class="font-semibold text-purple-dark text-base inline-block">
        <i18n>Notifications</i18n>
      </h3>
    </div>
    <div
      v-if="isDesktop"
      class="py-4 px-4 relative sticky"
      :class="[scrolled ? 'shadow-soft-lowest' : 'border-b border-light-1']"
    >
      <h3 class="font-semibold text-purple-dark text-base inline-block">
        <i18n>Notifications</i18n>
      </h3>
    </div>
    <div
      v-if="notificationData.length < 1 && !loading"
      class="flex flex-col space-y-1 text-dark-3 justify-center items-center w-full h-full text-sm py-4 text-center"
    >
      <h1 class="text-base font-semibold">
        <i18n>You're all caught up!</i18n>
      </h1>
      <img
        src="https://cf.quizizz.com/img/notification-empty.png"
        class="w-32 h-32 rounded-full"
        aria-hidden="true"
      />
      <h1 class="text-base font-semibold">
        <i18n>No updates to report.</i18n>
      </h1>
      <p class="text-tn text-dark-4">
        <i18n>Try playing a game or creating a</i18n> <br /> <i18n>new quiz</i18n>
      </p>
    </div>
    <div v-if="loading">
      <div
        v-for="loader in [0, 1, 2, 3]"
        :key="loader"
        class="flex flex-col space-y-6 p-4"
      >
        <div class="w-16 h-3 bg-dark-10% rounded shine-div" />
        <div class="flex space-x-2 items-center">
          <div class="w-8 h-8 bg-dark-10% rounded-full shine-div" />
          <div class="flex flex-col flex-1 space-y-2">
            <div class="flex space-x-1">
              <div class="w-3/12 h-3 bg-dark-10% rounded shine-div" />
              <div class="w-6/12 h-3 bg-dark-10% rounded shine-div" />
              <div class="w-3/12 h-3 bg-dark-10% rounded shine-div" />
            </div>
            <div class="flex space-x-1">
              <div class="w-16 h-3 bg-dark-10% rounded shine-div" />
              <div class="w-12 h-3 bg-dark-10% rounded shine-div" />
            </div>
          </div>
          <div class="w-8 h-8 bg-dark-10% rounded shine-div" />
        </div>
      </div>
    </div>
    <div
      v-else
      ref="notifications"
      class="overflow-y-auto"
      @scroll="throttleHandleScroll"
    >
      <div>
        <!-- <div class="text-dark-4 px-8 md:px-4 pt-2 -mb-2 text-tn">
          Braze Content Cards
        </div> -->
        <div
          v-for="(notification, index) in notificationData"
          :key="notification.id"
        >
          <div v-if="notification?.extras?.notification_center === 'true' && !notification.dismissed">
            <NotificationItem
              :index="index"
              :notification="notification"
              :observer="observer"
              @markOneNotificationAsRead="markOneNotificationAsRead"
              @handleDeleteNotification="handleDeleteNotification"
            />
          </div>
        </div>
        <div class="border-b border-light-1 mx-4 block md:hidden" />
      </div>
    </div>
    <!-- <div v-if="showLoader" class="relative p-4 text-dark flex justify-center">
      <Loader :size="20" />
    </div> -->
    <!-- <div v-if="Object.keys(notifications).length && !loading" class="flex py-2 px-8 mt-4 space-x-4">
    </div> -->
  </div>
  <div
    class="notification-overlay z-50 fixed top-0 left-0 bg-dark-50% w-screen h-screen"
    @click="toggleNotification"
  />
</template>

<script>

import { mapGetters } from 'vuex';
import throttle from 'lodash/throttle';

import BrazeService from '~/services/BrazeService';

export default {
  props: {
    loading: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['loadMoreNotification', 'toggleNotification', 'markOneNotificationAsRead'],

  data() {
    return {
      observer: null,
      notificationIDs: [],
      notificationData: [],
      scrolled: false,
      isOverlayVisible: true,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'lifecycleData']),
    brazeNotificationData() {
      const contentCards = this.lifecycleData?.contentCards || [];
      const notificationData = contentCards.filter((card) => card?.extras?.notification_center === 'true');
      return notificationData;
    },
  },

  watch: {
    notificationIDs(value) {
      this.markNotificationOnScroll(value);
    },
  },

  created() {
    this.observer = new IntersectionObserver(this.onIntersection, {
      root: null,
      threshold: 0.5,
    });
    this.throttleHandleScroll = throttle(this.handleScroll, 1000);
  },

  mounted() {
    this.notificationData = this.brazeNotificationData;
  },

  beforeUnmount() {
    this.observer.disconnect();
  },

  methods: {
    handleScroll(e) {
      if (this.loading) { return; }

      if ((e.target.scrollTop + e.target.clientHeight) >= (e.target.scrollHeight - 100)) {
        // this.$emit('loadMoreNotification');
        this.scrolled = true;
      } else {
        this.scrolled = false;
      }
    },

    onIntersection(entries) {
      let addedItems = false;
      const localNotificationIDs = [...this.notificationIDs];
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        if (entry.target.dataset.id) {
          if (!localNotificationIDs.find((notif) => notif.id === entry.target.dataset.id)) {
            if (entry.target.dataset.viewed === 'false') {
              addedItems = true;
              localNotificationIDs.push({
                id: entry.target.dataset.id,
                markedRead: false,
                index: entry.target.dataset.index,
              });
            }
          }
        }
      });
      if (addedItems) {
        this.notificationIDs = localNotificationIDs;
      }
    },

    markOneNotificationAsRead(notification, index) {
      this.$emit('markOneNotificationAsRead', notification, index);
      BrazeService.logContentCardClick(notification);

      if (notification?.url) {
        const url = new URL(notification.url);
        location = url.pathname;
      }
    },

    markNotificationOnScroll(notifications) {
      // Braze based notification read event
      notifications.forEach((notification) => {
        const index = this.brazeNotificationData.findIndex((notif) => notif.id === notification.id);
        if (index !== -1) {
          BrazeService.logContentCardImpressions([this.brazeNotificationData[index]]);
        }
      });
    },

    handleDeleteNotification(notification) {
      BrazeService.logContentCardDismiss(notification);
      this.notificationData = this.notificationData.filter((brazeNotification) => brazeNotification.id !== notification.id);
      this.$toasts.add({
        icon: 'fas fa-trash',
        title: this.$i18n('Notification is deleted'),
      });
    },

    getPrimaryNotificationImage(notification) {
      if (notification.category === 'user') {
        return notification.images.primary;
      } if (notification.category === 'marketing') {
        return 'https://cf.quizizz.com/img/notification/mktg.png';
      } if (notification.category === 'system') {
        switch (notification.kind) {
          case 'game-expired':
            return 'https://cf.quizizz.com/img/notification/homework-game.png';
          case 'quiz-played':
            return 'https://cf.quizizz.com/img/notification/players.png';
          default:
            return 'https://cf.quizizz.com/img/notification/team-quizizz.png';
        }
      }
      return 'https://cf.quizizz.com/img/notification/team-quizizz.png';
    },

    toggleNotification() {
      this.$emit('toggleNotification');
      this.$eventBus.$emit('overlay:hide');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/mixins.scss';
  .notif-dimension {
    width: 100%;
    z-index: 90;
    height: 100vh;
    max-height: 100vh;
    margin-right: 0;
    border-radius: 0;
    margin-top: 0;
    @screen md {
      max-height: 608px;
      height: auto;
      width: 360px;
      margin-top: 56px;
      @apply rounded-lg mr-2
    }
  }
  .shine-div {
    position: relative;
    overflow: hidden;
    @include shine(1.5s);
  }
</style>

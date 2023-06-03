import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('root', ['lifecycleData']),
    brazeNotificationData() {
      const contentCards = this.lifecycleData?.contentCards || [];
      const notificationData = contentCards.filter((card) => card?.extras?.notification_center === 'true');
      return notificationData;
    },

    getUnreadNotificationsCount() {
      return this.brazeNotificationData.filter((notif) => notif?.viewed === false).length;
    },
  },
};

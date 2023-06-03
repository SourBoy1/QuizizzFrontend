import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('root', ['serverData']),
    userCountry() {
      return this?.$user?.country || this?.serverData?.requestCountry;
    },
    isUserFromUSA() {
      return this.userCountry === 'US';
    },
  },
};

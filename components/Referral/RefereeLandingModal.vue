<template>
  <Modal
    v-if="canShow"
    title=""
    subtitle=""
    :button2="null"
    :button1="null"
    :shouldCloseOnMaskClick="true"
    :zeroPadding="true"
    :hideHeader="true"
    containerClasses="max-w-qmd z-10 p-0"
    closeBtnClasses="text-dark-4"
    :stickToBottom="isMobile"
    backgroundColor="bg-light-3"
    :showFooter="false"
    :fixedHeight="false"
    @close="close"
  >
    <div
      v-click-outside="() => onOutsideClicked()"
      class="px-6 py-4"
    >
      <ReferralProgramWrapper
        isOnboardingReferee
        :referrerName="referrerName"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';
import { isReferralPeriodExpired } from '~/utils/ReferralUtils';
import countryMixin from '~/mixins/CountryMixin';

export default {
  name: 'RefereeLandingModal',
  mixins: [referralMixin, countryMixin],
  data() {
    return {
      canShow: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),
    ...mapGetters('sales', ['isSchoolOrDepartment']),

    isMobile() {
      return this.deviceProps.type === this.$constants.DeviceTypes.PHONE;
    },

    referrerName() {
      return this.$route.query?.referrerName;
    },

    getRewardText() {
      if (this.isCountryUSA) {
        return this.$i18n('Here\'s how to claim your free Individual plan');
      }
      return this.$i18n('Here\'s how to claim your free Super');
    },
  },

  mounted() {
    // Hide for users in the USA after referral period expiry
    // Show referee landing modal only for non s&d teachers who don't have super already and if IR has passed referrrerName query param (hacky check I know)
    this.canShow = (this.isUserFromUSA && isReferralPeriodExpired())
      ? false
      : (!this.$user.isLoggedIn
          || (this.$user.isTeacher && !this.$user.isSuper && !this.isSchoolOrDepartment)) && !!this.referrerName;
  },

  methods: {
    onOutsideClicked(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this.close();
    },

    close() {
      this.canShow = false;
    },
  },
};
</script>

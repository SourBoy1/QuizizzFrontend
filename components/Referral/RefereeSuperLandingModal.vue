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
    containerClasses="max-w-qmd z-10 bg-super-faded border-1 border-super pl-0 pr-0 pt-0 pb-0 rounded-2xl"
    closeBtnClasses="text-dark-4"
    :stickToBottom="isMobile"
    backgroundColor="bg-super-faded"
    :showFooter="false"
    :fixedHeight="false"
    @close="close"
  >
    <div
      v-click-outside="() => onOutsideClicked()"
      class="px-6 py-4"
    >
      <i18n
        :injections="[referrerName]"
        class="font-bold text-xl md:text-3xl mt-3"
      >
        {$1} has gifted you a 1 month
      </i18n>&nbsp;&nbsp;<em class="text-super font-bold text-xl md:text-3xl mt-3">{{ $i18n('QUIZIZZ PREMIUM') }}</em>&nbsp;&nbsp;<i18n class="font-bold text-xl md:text-3xl mt-3">
        subscription
      </i18n>
      <div class="w-11/12 mt-2 mb-4">
        <i18n class="text-dark-4 text-xs md:text-sm">
          Quizizz is a student engagement platform that can be used in class, group assignments, pre-test review and formative assessments. Watch the video to learn what teachers love about Quizizz
        </i18n>
      </div>
      <img
        class="w-full mb-1 cursor-pointer"
        src="https://cf.quizizz.com/image/image%2032.png"
        :alt="$i18n('What do you love about Quizizz?')"
        @click.stop="handleUrlClick"
      />
      <div class="leading-3 my-4 text-dark-4">
        <i18n class="text-sm">
          The usual value of this subscription is $12
        </i18n>
      </div>
      <Button
        :title="$i18n('Register to accept the gift')"
        class="w-8"
        size="md"
        type="super"
        @click.stop="handleRegisterClick"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

import LocalStorage from '~/services/LocalStorage';

export default {

  mixins: [referralMixin],
  emits: [],
  data() {
    return {
      canShow: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isMobile']),
    ...mapGetters('sales', ['isSchoolOrDepartment']),

    referrerName() {
      return this.$route.query?.referrerName;
    },
  },

  mounted() {
    this.canShow = (!this.$user.isLoggedIn && !!this.referrerName);
    if (this.canShow) {
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFEREE_MODAL_OPEN, {
        referrer_Name: this.referrerName,
        campaignId: LocalStorage.getItem('campaignId') || this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
      });
    }
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

    handleUrlClick() {
      window.open('https://youtu.be/wpySoorZy6E', '_blank');
    },

    handleRegisterClick() {
      this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFEREE_MODAL_REGISTER_BUTTON, {
        referrer_Name: this.referrerName,
        campaignId: LocalStorage.getItem('campaignId') || this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
      });
      this.$router.push({
        name: this.$router.name,
        query: {
          ...this.$route.query,
          ctaSource: 'gift_individual_plan',
          fromPage: this.$route.name,
        },
      });
      this.close();
      this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW, { type: 'signup' });
    },
  },
};
</script>

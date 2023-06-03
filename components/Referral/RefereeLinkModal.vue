<template>
  <Modal
    v-if="shouldShow"
    title=""
    subtitle=""
    :button2="null"
    :button1="null"
    :hideHeader="true"
    :shouldCloseOnMaskClick="true"
    :zeroPadding="true"
    containerClasses="max-w-qmd super-upsell z-10 bg-super-faded border-1 border-super pl-0 pr-0 pt-0 pb-0 rounded-2xl"
    closeBtnClasses="text-dark-4"
    :stickToBottom="isMobile"
    backgroundColor="bg-super-faded"
    :showFooter="false"
    :fixedHeight="false"
    @close="close"
  >
    <div class="px-6 py-7">
      <div class="flex flex-col items-center">
        <div>
          <img
            src="https://cf.quizizz.com/image/Dino_Search%202.png"
            class="w-50 h-36"
          />
        </div>
        <div
          v-if="ms1"
          class="text-2xl font-bold mt-4"
        >
          <i18n>Sorry, this gift subscription has already been claimed</i18n>
        </div>
        <div
          v-if="ms2"
          class="text-2xl font-bold mt-4 text-center"
        >
          <i18n>You have already claimed this upgrade once</i18n>
        </div>
        <div v-if="ms3">
          <div class="text-2xl font-bold mt-4 text-center">
            <i18n>Not eligible for upgrade</i18n>
          </div>
          <div class="text-md font-normal mt-4 text-dark-2 text-center">
            <i18n>Since your account is already premium you are not eligible to claim this free 1-month upgrade</i18n>
          </div>
        </div>
        <div class="mt-4">
          <Button
            size="md"
            type="super"
            :title="$i18n('Back to Quizizz')"
            @click="close"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

export default {

  mixins: [referralMixin],
  data() {
    return {
      shouldShow: false,
      hasNotUpgraded: false,
      ms1: false,
      ms2: false,
      ms3: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'isMobile']),

    hasTrialLeft() {
      return this.$user.trialDaysLeft > 1;
    },
  },

  mounted() {
    this.$eventBus.$on('showLinkModal', this.show);
  },

  beforeUnmount() {
    this.$eventBus.$off('showLinkModal', this.show);
  },

  methods: {

    show() {
      this.shouldShow = true;
      if (this.$user.hasActiveSnDPlan || (this.$user.isSuper && !this.$user.isOnTrialSubscription)) {
        this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_PLAN_NOT_ELIGIBLE, {
          campaignId: this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
        });
        this.ms3 = true;
      } else {
        this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_PLAN_ALREADY_CLAIMED, {
          campaignId: this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
        });
        this.ms2 = true;
      }
    },

    close() {
      this.shouldShow = false;
    },
  },
};
</script>

<style scoped lang="scss">
</style>

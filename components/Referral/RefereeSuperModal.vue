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
      <div
        v-if="hasNotUpgraded"
        class="flex flex-col rounded-lg"
      >
        <div>
          <span class="font-bold text-xl md:text-3xl mt-3"><i18n :injections="[referrerName]">{$1} has gifted you a 1 month</i18n></span><span><i18n class="font-bold text-xl md:text-3xl mt-3 text-super mx-1">{{ $i18n('QUIZIZZ PREMIUM') }}</i18n></span><span><i18n class="font-bold text-xl md:text-3xl mt-3 ml-1">subscription</i18n></span>
        </div>
        <div class="w-11/12 mt-6 mb-4 ml-2">
          <span class="text-sm text-dark-3"><i18n>With this upgraded subscription, you can</i18n></span>
        </div>
        <div class="flex w-11/12 mb-4 ml-1">
          <div class="w-6 h-6 flex items-center justify-center text-super mr-1">
            <FA
              icon="fas fa-question"
              :size="12"
            />
          </div>
          <div class="text-dark-2 font-semibold text-sm">
            <i18n>Access all question types</i18n>
          </div>
        </div>
        <div class="flex w-11/12 mb-4 ml-1">
          <div class="w-6 h-6 flex items-center justify-center text-super mr-1">
            <FA
              icon="fas fa-video"
              :size="12"
            />
          </div>
          <div class="text-dark-2 font-semibold text-sm">
            <i18n>Embed interactive video in Lessons and Quizzes</i18n>
          </div>
        </div>
        <div class="flex w-11/12 mb-4 ml-1">
          <div class="w-6 h-6 flex items-center justify-center text-super mr-1">
            <FA
              icon="fas fa-abacus"
              :size="12"
            />
          </div>
          <div class="text-dark-2 font-semibold text-sm">
            <i18n>Promote mastery with answer explanations</i18n>
          </div>
        </div>
        <div class="flex w-11/12 mb-4 ml-1">
          <div class="w-6 h-6 flex items-center justify-center text-super mr-1">
            <FA
              icon="fas fa-memo"
              :size="12"
            />
          </div>
          <div class="text-dark-2 font-semibold text-sm">
            <i18n>Assign for Practice with Flexible Deadlines</i18n>
          </div>
        </div>
        <div class="flex mb-6 ml-1">
          <div class="flex items-center justify-center w-6 h-6 mr-1 text-dark-4">
            <FA
              icon="far fa-plus"
              :size="12"
            />
          </div>
          <div class="text-sm font-semibold text-dark-4">
            <i18n>Custom themes, topics, and more.</i18n>
          </div>
        </div>
        <Button
          :title="$i18n('Activate Upgrade')"
          class="w-8"
          size="md"
          :loading="loading"
          type="super"
          @click="handleUpgrade"
        />
      </div>
      <div
        v-else
        class="flex flex-col items-center"
      >
        <div>
          <img
            src="https://cf.quizizz.com/image/Celebration.png"
            class="w-51 h-49"
          />
        </div>
        <div class="text-2xl font-bold mt-4">
          <i18n>Your account has been upgraded</i18n>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

import LocalStorage from '~/services/LocalStorage';
import SessionStorage from '~/services/SessionStorage';

export default {

  mixins: [referralMixin],
  data() {
    return {
      shouldShow: false,
      referrerName: '',
      loading: false,
      cmpId: '',
      inProductActivation: false,
      hasNotUpgraded: true,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'isMobile']),

    hasTrialLeft() {
      return this.$user.trialDaysLeft > 1;
    },
  },

  mounted() {
    this.$eventBus.$on('refereeSuperRewardModal:show', this.show);
    this.referrerName = LocalStorage.getItem('name') || this.$route.query?.referrerName;
  },

  beforeUnmount() {
    this.$eventBus.$off('refereeSuperRewardModal:show', this.show);
  },

  methods: {

    show(campaignDetails) {
      if (!SessionStorage.getItem('refereeSuperRewardModalShown')) {
        if (campaignDetails) {
          this.referrerName = campaignDetails[0]?.meta.referrerUserMetaData.firstName;
          this.cmpId = campaignDetails[0].id;
          this.inProductActivation = true;
        }
        this.shouldShow = true;
        this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFEREE_MODAL_SHOWN, {
          campaignId: LocalStorage.getItem('campaignId') || this.cmpId || this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
        });
        SessionStorage.setItem('refereeSuperRewardModalShown', true);
      }
    },

    close() {
      this.shouldShow = false;
      if (!this.hasNotUpgraded) {
        window.location = window.location.href.split('?')[0];
      }
    },

    async handleUpgrade() {
      this.loading = true;
      if (this.inProductActivation) {
        const activateResponse = await this.activateReferral(this.cmpId);
        if (activateResponse?.success) {
          this.loading = false;
          this.hasNotUpgraded = false;
          this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFEREE_UPGRADE_ACTIVATED, {
            campaignId: this.cmpId || this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
          });
          LocalStorage.removeItem('name');
          LocalStorage.removeItem('referralToken');
          LocalStorage.removeItem('campaignId');
        } else {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: activateResponse?.message,
          });
        }
      } else {
        const response = await this.acceptReferral();
        if (response.success) {
          const activateResponse = await this.activateReferral();
          if (activateResponse.success) {
            this.loading = false;
            this.hasNotUpgraded = false;
            this.$analytics.logEvent(this.$webEvents.INDIVIDUAL_REFEREE_UPGRADE_ACTIVATED, {
              campaignId: LocalStorage.getItem('campaignId') || this.$constants.CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER,
            });
            LocalStorage.removeItem('name');
            LocalStorage.removeItem('referralToken');
            LocalStorage.removeItem('campaignId');
          } else {
            this.$toasts.add({
              type: this.$constants.ToastTypes.ERROR,
              icon: 'fas fa-times-circle',
              title: activateResponse.message,
            });
          }
        } else {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: response.message,
          });
          LocalStorage.removeItem('name');
          LocalStorage.removeItem('referralToken');
          LocalStorage.removeItem('campaignId');
        }
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped lang="scss">
</style>

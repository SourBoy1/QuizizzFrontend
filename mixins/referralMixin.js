import { mapGetters } from 'vuex';

import get from 'lodash/get';

import cloneDeep from 'lodash/cloneDeep';

import Constants from '~/config/Constants';
import ReferralApiService from '~/services/apis/ReferralApiService';
import QLogger from '~/services/QLogger';
import LocalStorage from '~/services/LocalStorage';
import { isReferralPeriodExpired } from '~/utils/ReferralUtils';
import countryMixin from '~/mixins/CountryMixin';

export default {
  mixins: [countryMixin],
  computed: {
    ...mapGetters('root', ['currentLanguage', 'user']),
    ...mapGetters('currentUser', ['referralCampaigns']),

    canPromoteReferral() {
      const notExpiredForCountry = this.isUserFromUSA ? !isReferralPeriodExpired() : true;
      return (this.isReferralEnabledForROW || this.isReferralEnabledForUS)
        && !this.$user.isSuper && this.$user.isTeacher && notExpiredForCountry;
    },
    isReferralEnabledForROW() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.REFERRALS);
    },
    isReferralEnabledForUS() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.US_SUPER);
    },
    showReferralStats() {
      return (this.isReferralEnabledForROW || this.isReferralEnabledForUS) && this.$user.isTeacher && !this.$user.isOnPaidSubscription;
    },
    currentCampaignId() {
      if (import.meta.env.VITE_NODE_ENV === 'dev') {
        return Constants.ReferralCampaigns.QUIZIZZ_TEST_CAMPAIGN;
      }
      switch (this.currentLanguage) {
        case 'en': return Constants.ReferralCampaigns.QUIZIZZ_ENGLISH_CAMPAIGN;
        case 'id': return Constants.ReferralCampaigns.QUIZIZZ_INDONESIAN_CAMPAIGN;
        default: return Constants.ReferralCampaigns.QUIZIZZ_ENGLISH_CAMPAIGN;
      }
    },
    showOneTimeReferralModal() {
      if (this.timeSinceAccountCreated <= 30) {
        return false;
      }
      return this.canPromoteReferral;
    },
    timeSinceAccountCreated() {
      const createdDay = this.$dayjs(this.$user.createdAt);
      const today = this.$dayjs();
      return today.diff(createdDay, 'day');
    },
    iframeSrc() {
      const userIdentificationField = this.$user.email || this.$user.userStore.phoneNumber;
      const userName = this.user.firstName;
      const brandId = 47836;
      const campaignId = this.currentCampaignId;
      const url = `https://www.ref-r.com/campaign_user/p/home?brandid=${brandId}&campaignid=${campaignId}&bid_e=529F9ECECB14E579D0B6CA880B9A9B9C&t=420&email=${encodeURIComponent(userIdentificationField)}&fname=${encodeURIComponent(userName)}&widget=popup`;
      return url;
    },
    showRefereeRewardCard() {
      const isReferralPending = get(this.$user, 'userStore.referralMetrics.isReferralPending', false);
      if (isReferralPending && this.canPromoteReferral) {
        return true;
      }
      return false;
    },

    showRefereeRewardCardIndividual() {
      const isReferralPending = LocalStorage.getItem('referralToken');
      if (this.$user.isLoggedIn && isReferralPending) {
        if (this.$user.isSuper) {
          LocalStorage.removeItem('referralToken');
          LocalStorage.removeItem('name');
          LocalStorage.removeItem('campaignId');
          return false;
        }
        return true;
      }
      return false;
    },
    hasSomeConverts() {
      return this.userConverts > 0;
    },
    userConverts() {
      if (this.$user) {
        const userConverts = get(this.$user, 'userStore.referralMetrics.userConverts', 0);
        return userConverts;
      }
      return 0;
    },
    needToShowReferralSteps() {
      return this.$user && !this.$user.isOnTrialSubscription;
    },
    getRemainingSuperDays() {
      return this.$user && this.$user.isOnTrialSubscription && !this.$user.isTrialExpired ? this.$user.trialDaysLeft : null;
    },
  },
  methods: {
    redirectToReferPage() {
      this.$analytics.logEvent(this.$webEvents.REFERRAL_LANDING_PAGE_SHOWN, {});
      window.open('/referral', '_blank');
    },

    openReferralModal() {
      this.$eventBus.$emit('referralStatsModal:show');
    },

    openSuperReferralModal() {
      this.$eventBus.$emit('superReferralStatsModal:show');
    },

    openSuperReferralModalForBasic(shouldReloadOnClose) {
      this.$eventBus.$emit('superReferralModalBasic:show', shouldReloadOnClose);
    },

    openRefereeRewardModal() {
      this.$eventBus.$emit('refereeRewardModal:show');
    },

    async getReferralCampaign(campaignId, useStoreCache = true) {
      if (!this.$user.isLoggedIn) {
        return null;
      }

      let campaigns = useStoreCache ? this.referralCampaigns : null;
      if (!campaigns || campaigns.length === 0) {
        campaigns = await ReferralApiService.getCampaigns();
        if (campaigns) {
          this.$store.dispatch('currentUser/setReferralCampaigns', campaigns);
        }
      }

      let selectedCampaign = null;
      if (campaigns) {
        selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId);
      }

      return selectedCampaign;
    },

    openRefereeSuperRewardModal() {
      this.$eventBus.$emit('refereeSuperRewardModal:show');
    },

    async getLinkForRefer(emails) {
      const apiResponse = await ReferralApiService.getLink(emails);
      return apiResponse;
    },

    async getLinkForReferBasic(emails) {
      const apiResponse = await ReferralApiService.getLinkForBasic(emails);
      return apiResponse;
    },

    async acceptReferral() {
      const apiResponse = await ReferralApiService.acceptReferral();
      return apiResponse;
    },

    async activateReferral(cmpId) {
      const apiResponse = await ReferralApiService.activateReferral(cmpId);
      return apiResponse;
    },

    async getReferralLink(campaignId) {
      let link = null;

      if (!this.$user.isLoggedIn) {
        return null;
      }

      const campaignData = await this.getReferralCampaign(campaignId);
      if (campaignData?.link) {
        link = campaignData.link;
      }

      if (!link) {
        const apiResponse = await ReferralApiService.enrollUser(campaignId).catch((err) => {
          QLogger.log('Enroll to campaign failure', err);
        });

        const responseData = apiResponse?.data?.data;
        const referralCampaigns = cloneDeep(this.referralCampaigns);

        if (responseData.campaign) {
          const foundCampaign = referralCampaigns.find((campaign) => campaign.id === campaignId);
          if (foundCampaign) {
            Object.assign(foundCampaign, responseData.campaign);
          } else {
            referralCampaigns.push(responseData.campaign);
          }

          this.$store.dispatch('currentUser/setReferralCampaigns', referralCampaigns);
        }

        link = responseData?.link || link;

        if (!link) {
          this.$analytics.logEvent(this.$webEvents.REFERRAL_ENROLL_FAIL, {
            campaignId,
          });
        }
      }

      return link;
    },
  },
};

<!--
NOTE: This layout is for mobile and for desktop there is dashboard.vue. You should prefer use adminDashboard.vue as one single layout file.
-->
<template>
  <div class="flex flex-col font-sans">
    <button
      data-quizizz="analytics-event-listener"
      type="button"
      class="hidden"
      @click="showEventsViewer = true"
    >
      x
    </button>
    <ToastManager />
    <QuestionBulkUpdateToastManager />
    <Overlay @click="onHide" />
    <SuperUpsell />
    <ReferralRefereeLandingModal />
    <ReferralSuperUpsellModal />
    <ReferralStatsModal />
    <ReferralGiftPlanCard
      v-if="shouldShow"
      @close="close"
    />
    <ReferralRefereeRewardModal />
    <SchoolAndDistrictModal />
    <UserInfoDetailsModal />
    <OnBoardingWelcomeModal />
    <QfwChurnModal />
    <ChurnModal />
    <AuthModal />
    <AnalyticsViewer
      v-if="showEventsViewer"
      @close="showEventsViewer = false"
    />
    <transition name="slide">
      <div
        v-if="showSidebar"
        class="fixed top-0 bottom-0 w-auto transition-all z-100"
      >
        <div class="z-9999">
          <HelpButton />
        </div>
        <MainNavigation @handleCreateContent="handleCreateContent" />
      </div>
    </transition>
    <QuizGenModalForMobile />
    <div class="flex flex-col flex-grow w-full h-screen overflow-hidden bg-light-1">
      <MainHeader v-if="!isMobileAppWebView && shouldShowMainHeader" />
      <div
        id="app-body-container"
        ref="appBodyContainer"
        class="flex flex-grow overflow-auto bg-light-1 content"
        :class="appBodyContainerClasses"
      >
        <slot />
        <LockedQfwContentModal v-if="isCorporatePaywallVisible" />
      </div>
    </div>
    <BottomNavigationMobile
      v-if="!isMobileAppWebView"
      @handleCreateContent="handleCreateContent"
    />
    <QfwPricingModal
      v-if="canShowQfwPricingModal"
      :source="qfwUpsellSource"
      :feat="qfwUpsellFeat"
      @closeQfwPricingModal="closeQfwPricingModal"
    />

    <MemeSetAddOrEditModal
      v-if="shouldShowMemesetAddOrEditModal"
      :isEditModal="memeset.isEditModal"
      :memesetId="memeset.id"
      :memesetName="memeset.name"
      :memesetLang="memeset.lang"
      :isPublic="memeset.isPublic"
      :title="memeset.modalTitle"
      @close="toggleMemesetAddOrEditModal"
    />
    <portal-target name="media-preview" />
    <portal-target name="folder-access-denied" />
    <portal-target
      name="shared-folders-modal-portal"
      multiple
    />
    <portal-target name="collections-modal-portal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import has from 'lodash/has';

import IdleQueueService from '~/services/IdleQueueService';

import FontService from '~/services/FontService';
import { generateSurvey, setVisitorTraits } from '~/services/Survicate';

import { handleFocusRings, stopHandlingFocusRings } from '~/services/FocusRingsService';

import GoogleOneTapMixin from '~/mixins/GoogleOneTapMixin';
import QuizService from '~/services/apis/QuizService';
import QLogger from '~/services/QLogger';

import LocalStorage from '~/services/LocalStorage';
import referralMixin from '~/mixins/referralMixin';

import { getSubjectFromPreferencesOrUserData, getGradeFromPreferencesOrUserData } from '~/utils/QuizUtils';
import { ContentDefaultName } from '../config/DefaultCopies';
import $axios from '../services/AxiosService';
import $store from '../services/StoreService';

export default {
  mixins: [GoogleOneTapMixin, referralMixin],
  data() {
    return {
      showEventsViewer: false,
      isMobileAppWebView: false,
      showSidebar: false,
      isCreateCallInProgress: false,
      shouldShowNewContentModal: false,
      shouldShowLandingModal: true,
      newContentModalType: this.$constants.ContentType.QUIZ,
      excludedRoutes: ['/settings'],
      idleQueue: null,
      shouldShow: false,
      shouldShowMemesetAddOrEditModal: false,
      showQfwPricingModal: true,
      forceShowQfwPricingModal: false,
      qfwUpsellSource: 'qfw-pricing-modal',
      qfwUpsellFeat: 'qfw-pricing-modal',
      memeset: {
        isEditModal: false,
        modalTitle: '',
        id: null,
        name: '',
      },
    };
  },

  head() {
    return {
      link: [
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400;1,800&display=swap',
        },
      ],

      script: [
        {
          src: 'https://www.youtube.com/player_api',
          defer: true,
        },
        {
          src: 'https://www.youtube.com/iframe_api',
          defer: true,
        },
      ],
    };
  },

  computed: {
    ...mapGetters('products', ['isEligibleForTrial', 'planPrice']),

    canShowQfwPricingModal() {
      if (!this.$user.isCorporateTrial) {
        return false;
      }
      const pricingModalData = LocalStorage.getItem('qfwPricingModal');

      if (this.forceShowQfwPricingModal && this.qfwUpsellSource !== 'content-created') {
        return true;
      }

      if (!pricingModalData || pricingModalData?.date !== this.$dayjs().format('YYYYMMDD')) {
        LocalStorage.setItem('qfwPricingModal', { date: this.$dayjs().format('YYYYMMDD'), count: 1 });
        return this.showQfwPricingModal;
      }

      if (pricingModalData?.date === this.$dayjs().format('YYYYMMDD') && pricingModalData?.count >= 1 && !this.forceShowQfwPricingModal) {
        return false;
      }

      if (pricingModalData?.count >= 2 && pricingModalData?.date === this.$dayjs().format('YYYYMMDD')) {
        return false;
      }

      if (this.showQfwPricingModal) {
        LocalStorage.setItem('qfwPricingModal', { date: this.$dayjs().format('YYYYMMDD'), count: pricingModalData.count + 1 });
      }
      return this.showQfwPricingModal;
    },

    isCorporatePaywallVisible() {
      return !this.excludedRoutes.includes(this.$route.path)
      && this.$user.isCorporate && this.$user.isOnTrialSubscription && this.$user.isTrialExpired;
    },

    appBodyContainerClasses() {
      if (this.isCorporatePaywallVisible) {
        return 'relative overflow-hidden';
      }

      const classes = ['overflow-auto'];

      if (this.isMobileAppWebView) {
        classes.push('mt-0');
        classes.push('mb-0');
        classes.push('mobile-app');
      }

      if (this.shouldShowMasteryMode) {
        classes.push('no-main-header');
      } else {
        classes.push('has-main-header');
      }

      return classes.join(' ');
    },

    shouldShowMainHeader() {
      const { path } = this.$route;
      if (this.shouldShowMasteryMode && path.match(/admin\/quiz\/homework/)) {
        return false;
      }
      return true;
    },

    shouldShowMasteryMode() {
      const isMasteryModeFeatureFlag = this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.MASTERY_MODE);
      return isMasteryModeFeatureFlag;
    },
  },

  watch: {
    $route(to, from) {
      // eslint-disable-next-line quote-props
      this.$gtag.customMap({ 'dimension2': 'plan', 'dimension3': 'occupation' });
      this.$gtag.query('set', 'user_properties', { plan_dimension: this.$user.plan || 'null', occupation_dimension: this.$user.occupation || 'null' });

      // in house pageview events
      this.handlePageViewEvent(to, from);

      // scroll to top on every route change
      const appContainer = this.$refs.appBodyContainer;
      if (appContainer) {
        appContainer.scrollTo(0, 0);
      }

      this.shouldShowNewContentModal = false;
    },
  },

  created() {
    $store(this.$store);
    $axios(this.$axios);

    /**
     * Use IdleQueueService service to make sure these resources are loaded during idle time or at the earliest when they are needed
     */
    this.idleQueue = new IdleQueueService();

    this.idleQueue.addTask(FontService.loadOpenSans);
    /** query.mr contains string of the redirect url so using double negation * */
    this.isMobileAppWebView = !!get(this.$route, 'query.mr', false);
  },

  mounted() {
    handleFocusRings(window);

    setVisitorTraits(window._sva = window._sva || {});

    this.idleQueue.addTask(generateSurvey.bind(null, window));

    this.$nextTick(() => {
      this.handleOnboardingRedirection();
    });

    this.$eventBus.$on('sidebar:show', this.onShow);
    this.$eventBus.$on('sidebar:hide', this.onHide);
    this.$eventBus.$on('qfwPricingModal:show', this.handleQfwPricingModal);

    const { query } = this.$route;
    if (this.$route.query?.token) {
      this.shouldShowLandingModal = false;
      LocalStorage.setItem('referralToken', this.$route.query?.token);
      LocalStorage.setItem('name', this.$route.query?.referrerName);
      LocalStorage.setItem('campaignId', this.$route.query?.campaignId);
      this.checkLinkStatus();
    }
    if (has(query, 'modal') && query.modal === 'contentCreation') {
      if (this.$user.id) {
        this.$nextTick(() => {
          this.$eventBus.$emit(this.$constants.EventBus.QUIZ_GEN_MOBILE_MODAL_SHOW);
        });
      } else {
        this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW);
      }
    }

    // log page view event on browser load
    this.handlePageViewEvent(this.$route, null, true);
    this.$eventBus.$on('newContentModal:show', this.handleCreateContent);
    this.$eventBus.$on('superReferralStatsModal:show', this.show);

    // MemeSet Modal Events
    this.$eventBus.$on('memesetAddOrEditModal', this.handleMemesetAddOrEditModal);

    this.$store.dispatch('root/hideHelpButton');
  },

  beforeUnmount() {
    stopHandlingFocusRings();
    this.$eventBus.$off('sidebar:show', this.onShow);
    this.$eventBus.$off('sidebar:hide', this.onHide);

    this.$eventBus.$off('newContentModal:show', this.handleCreateContent);

    // MemeSet Modal Events
    this.$eventBus.$off('memesetAddOrEditModal', this.handleMemesetAddOrEditModal);
    this.$eventBus.$off('superReferralStatsModal:show', this.show);
    this.$eventBus.$off('qfwPricingModal:show', this.handleQfwPricingModal);
  },

  methods: {
    showNewContentModal({ forContentType = 'quiz' }) {
      this.shouldShowNewContentModal = true;
      this.newContentModalType = forContentType;
    },

    handleQfwPricingModal({ source, feat }) {
      this.qfwUpsellSource = source;
      this.qfwUpsellFeat = feat;
      this.forceShowQfwPricingModal = true;
    },

    closeQfwPricingModal() {
      this.showQfwPricingModal = false;
      this.forceShowQfwPricingModal = false;
    },

    onShow() {
      this.showSidebar = true;
      this.$eventBus.$emit('overlay:show', { zIndex: 30 });
      this.$store.dispatch('root/showHelpButton');
    },

    onHide() {
      this.showSidebar = false;
      this.$store.dispatch('root/hideHelpButton');
      // this.$eventBus.$emit('overlay:hide');
    },

    show() {
      this.shouldShow = true;
      this.$analytics.logEvent(this.$webEvents.REFERRAL_STATS_MODAL_SHOWN);
    },

    close() {
      this.shouldShow = false;
    },

    async checkLinkStatus() {
      if (this.$user.isLoggedIn && this.$user.isSuper) {
        const response = await this.acceptReferral();
        if (!response.success) {
          this.$eventBus.$emit('showLinkModal');
          LocalStorage.removeItem('name');
          LocalStorage.removeItem('referralToken');
          LocalStorage.removeItem('campaignId');
        }
      }
      if (this.$user.isLoggedIn && !this.$user.isSuper && !this.$user.hasActiveSnDPlan) {
        this.$eventBus.$emit('refereeSuperRewardModal:show');
      }
    },

    async handleCreateContent({ forContentType = 'quiz' }) {
      if (this.isCreateCallInProgress) { return; }
      const quizData = {
        name: forContentType === this.$constants.ContentType.QUIZ ? ContentDefaultName.QUIZ_NAME : ContentDefaultName.LESSON_NAME,
        subjects: getSubjectFromPreferencesOrUserData(this.$user),
        grade: getGradeFromPreferencesOrUserData(this.$user),
        type: forContentType,
      };
      try {
        this.isCreateCallInProgress = true;
        const response = await QuizService.createQuiz(quizData);
        const quizId = response.quiz._id;
        const { query } = this.$route;
        const eventName = this.$webEvents.getQuizEditorEvent(forContentType, this.$webEvents.CREATE_CONTENT_CLICKED_V2, {
          source: 'mobile',
        });
        this.$analytics.logEvent(eventName);
        if (forContentType === this.$constants.ContentType.QUIZ) {
          this.$router.push({ path: `/quiz/creator/${quizId}/edit`, query });
        } else {
          this.$router.push({ path: `/presentation/${quizId}/edit`, query });
        }
      } catch (error) {
        QLogger.error('Error creating quiz', error);
      } finally {
        this.isCreateCallInProgress = false;
      }
    },

    handlePageViewEvent(to, from, isBrowserLoaded = false) {
      if (to && from && to.path === from.path) {
        return;
      }
      const plansAndPricing = {
        trail_show: this.isEligibleForTrial,
        price: this.planPrice,
      };

      this.$analytics.processPageViewEvents(to, from, this.$gtag, this.$router, isBrowserLoaded, plansAndPricing);
    },

    handleMemesetAddOrEditModal({ memesetData, type }) {
      this.toggleMemesetAddOrEditModal();
      this.memeset.isEditModal = type;
      this.memeset.modalTitle = type ? this.$i18n('Edit meme set') : this.$i18n('Create meme set');
      this.memeset.name = memesetData?.name ?? '';
      this.memeset.lang = memesetData?.lang ?? 'English';
      this.memeset.isPublic = memesetData?.isPublic;
      this.memeset.id = memesetData?.id ?? '';
    },

    toggleMemesetAddOrEditModal() {
      this.shouldShowMemesetAddOrEditModal = !this.shouldShowMemesetAddOrEditModal;
    },

    handleOnboardingRedirection() {
      if (this.$user.id
        && this.$user.onboardingState
        && this.$user.onboardingState.completedTill !== this.$constants.SnDTeacherOnboarding.CompletedTill.COMPLETED
        && this.$route.name !== this.$constants.PageNames.TEACHER_ONBOARDING
      ) {
        this.$eventBus.$emit('onboardingWelcomeModal:show');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s;
  transform: translate(0%, 0);
}

.slide-enter,
.slide-leave-to {
  transform: translate(-100%, 0);
}

#app-body-container:not(.mobile-app) {
  margin-top: 58px;

  &.has-main-header {}
}
</style>

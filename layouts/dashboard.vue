<!--
NOTE: This layout is for desktop and for mobile there is dashboardMobile.vue. You should prefer use adminDashboard.vue as one single layout file.
-->
<template>
  <div class="flex flex-col h-screen overflow-hidden font-sans dashboard-layout">
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
    <SuperUpsell />
    <SchoolAndDistrictModal />
    <ReferralRefereeLandingModal v-if="shouldShowLandingModal" />
    <ReferralRefereeSuperLandingModal v-else />
    <ReferralRefereeRewardModal />
    <ReferralSuperUpsellModal />
    <ReferralStatsModal />
    <ReferralGiftPlanCard
      v-if="shouldShow"
      @close="close"
    />
    <ReferralSuperPlanCard
      v-if="shouldShowSuperReferModal"
      :shouldReloadOnClose="shouldReloadOnClose"
      @close="closeBasicModal"
    />
    <ReferralBasicReferModal
      v-if="shouldShowReferModal"
      @close="closeModal"
    />
    <ReferralRefereeSuperModal />
    <ReferralRefereeLinkModal />
    <UserInfoDetailsModal />
    <OnBoardingWelcomeModal />
    <QfwDashboardQfwUpgradePlanModal />
    <QfwChurnModal />
    <ChurnModal />
    <AuthModal />
    <EmbedQuizModal />
    <PostSignupSchoolUpsellModal />
    <SuperTrainerTraineeStatusModal />
    <AnalyticsViewer
      v-if="showEventsViewer"
      @close="showEventsViewer = false"
    />
    <a
      class="skip-link"
      :aria-label="$i18n('Skip to main content')"
      href="#app-body-container"
    >
      <i18n>Skip to Content</i18n>
    </a>

    <portal-target name="delete-confirmation-modal-portal" />
    <portal-target name="folder-access-denied" />
    <portal-target
      name="shared-folders-modal-portal"
      multiple
    />
    <portal-target name="collections-modal-portal" />

    <ShareToFolderModalSet />

    <portal-target
      name="notification-banner"
      @change="handleChange"
    />
    <!-- Notification Banners
                                  Order of these Banners is important as they use the same portal-target
                                  i.e incase of multiple banner shown, only the latest declared banner will be rendered.
                                -->
    <NotificationBannerQfwChurn />
    <NotificationBannerChurnV2 />
    <NotificationBannerSnDChurn />

    <div class="flex flex-grow h-screen">
      <MainNavigation v-if="shouldShowSidebar" />
      <div
        class="flex flex-col flex-grow w-full overflow-hidden border-l border-light-1"
        :class="shouldResizeForChurnNotification ? 'main-container' : 'h-screen'"
      >
        <MainHeader
          v-if="shouldShowMainHeader"
          :showQuizizzLogo="showQuizizzLogo"
        />
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
    </div>
    <Overlay />

    <NewPresentationModal
      v-if="shouldShowNewContentModal"
      class="new-content-modal"
      :forContentType="newContentModalType"
      :style="{ backgroundColor: '#6D6D6D' }"
      @close="shouldShowNewContentModal = false"
    />
    <ContentCreationModal v-if="isContentCreationModalVisible" />

    <ThemePickerV2
      v-if="shouldShowThemePickerV2"
      :isNewLesson="true"
      :lessonName="lessonName"
      :selectedSubjects="selectedSubjects"
      @themeSaved="onThemeSave"
      @close="closeModals"
    />
    <LoadSVG
      name="shapes"
      class="absolute invisible hidden svg-shapes-import"
    />
    <portal-target name="media-preview" />
    <FeedbackPeekaboo v-if="showFeedbackPeekaboo" />
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
    <ImportSlidesModal
      v-if="isBulkImportModalShowing"
      isForBulkImport
    />
    <ImportGoogleForms v-if="isImportFormsShowing" />
    <DashboardBottomProgressPopUp v-if="isBottomProgressPopUpShowing" />
    <DashboardLogErrorModal />
    <Modal
      v-if="qfwModalState"
      class="qfw-plan-modal"
      :title="isTrial ? $i18n('Cancel trial & Upgrade the plan') : $i18n('Upgrade the plan')"
      titleCustomClasses="text-lg"
      subtitle=""
      :dismissOnOverlayClick="true"
      size="xl"
      backgroundColor="bg-dark-6"
      @close="handleClose"
    >
      <QfwPricingPlanModal
        :products="products"
        :isTrial="isTrial"
      />
    </Modal>
    <QfwPricingModal
      v-if="canShowQfwPricingModal"
      :source="qfwUpsellSource"
      :feat="qfwUpsellFeat"
      @closeQfwPricingModal="closeQfwPricingModal"
    />
    <HelpButton />

    <transition
      appear
      enter-active-class="animate__animated animate__fadeIn animation-duration-300 animation-delay-300"
      leave-active-class="animate__animated animate__fadeOut animation-duration-200 "
    >
      <PaidOrgListDropdown
        v-if="shouldShowPaidOrgListDropdown"
        @click="togglePaidOrgListDropdown"
      />
    </transition>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex';
import has from 'lodash/has';

import { generateSurvey, setVisitorTraits } from '~/services/Survicate.js';

import { handleFocusRings, stopHandlingFocusRings } from '~/services/FocusRingsService.js';

import FontService from '~/services/FontService.js';
import IdleQueueService from '~/services/IdleQueueService.js';
import ProductsService from '~/services/apis/Products';
import Fonts from '~/config/Fonts.js';
import GoogleOneTapMixin from '~/mixins/GoogleOneTapMixin';
import referralMixin from '~/mixins/referralMixin';
import LocalStorage from '~/services/LocalStorage';
import CountryMixin from '~/mixins/CountryMixin';
import { isReferralPeriodExpired } from '~/utils/ReferralUtils';
import $axios from '../services/AxiosService.js';
import $store from '../services/StoreService.js';

export default {
  mixins: [GoogleOneTapMixin, referralMixin, CountryMixin],

  data() {
    return {
      showEventsViewer: false,
      shouldShowNewContentModal: false,
      newContentModalType: this.$constants.ContentType.QUIZ,
      shouldShowThemePickerV2: false,
      lessonName: '',
      shouldShow: false,
      shouldShowReferModal: false,
      selectedSubjects: [],
      shouldShowLandingModal: true,
      shouldShowSuperReferModal: false,
      products: [],
      shouldReloadOnClose: false,
      shouldResizeForChurnNotification: false,
      showFeedbackPeekaboo: false,
      excludedRoutes: ['/settings'],
      idleQueue: null,
      shouldShowMemesetAddOrEditModal: false,
      shouldShowSidebar: true,
      showQfwPricingModal: true,
      forceShowQfwPricingModal: false,
      qfwUpsellSource: this.$route.query.source || 'qfw-pricing-modal',
      qfwUpsellFeat: 'qfw-pricing-modal',
      memeset: {
        isEditModal: false,
        modalTitle: '',
        id: null,
        name: '',
      },

      shouldShowPaidOrgListDropdown: false,
    };
  },

  head() {
    return {
      link: [
        {
          rel: 'stylesheet',
          media: 'print',
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

    isCorporatePaywallVisible() {
      return !this.excludedRoutes.includes(this.$route.path) && this.$user.isCorporate && this.$user.isOnTrialSubscription && this.$user.isTrialExpired;
    },

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

    isTrial() {
      return this.$user.subscription.status === 'trialing';
    },

    appBodyContainerClasses() {
      if (this.isCorporatePaywallVisible) {
        return 'relative overflow-hidden';
      }

      return 'overflow-auto';
    },

    showQuizizzLogo() {
      return !this.shouldShowSidebar;
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

    ...mapGetters('root', ['serverData']),
    ...mapGetters('uiManager', ['isBulkImportModalShowing', 'isBottomProgressPopUpShowing', 'isContentCreationModalVisible', 'qfwModalState', 'isImportFormsShowing']),

  },

  watch: {
    '$route.path': {
      handler(to, from) {
        const regex = /\/admin\/[\s\S]*\/[0-9a-fA-F]{24}\/[\s\S]*/s;
        if (!this.$user.isLoggedIn && regex.test(to)) {
          this.shouldShowSidebar = false;
        } else {
          this.shouldShowSidebar = true;
        }
      },

      immediate: true,
    },

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

  async created() {
    this.loading = true;
    const { products } = await ProductsService.fetchProducts('corporate_teacher', { onlyListed: true });
    this.products = products;

    this.loading = false;

    $store(this.$store);
    $axios(this.$axios);
  },

  mounted() {
    /**
     * Use IdleQueueService service to make sure these resources are loaded during idle time or at the earliest when they are needed
    */
    this.idleQueue = new IdleQueueService();

    this.idleQueue.addTask(FontService.loadOpenSans);

    handleFocusRings(window);

    setVisitorTraits(window._sva = window._sva || {});

    this.idleQueue.addTask(generateSurvey.bind(null, window));

    this.$nextTick(() => {
      for (const fontKey in Fonts) {
        const font = Fonts[fontKey];

        this.idleQueue.addTask(FontService.loadFont.bind(null, font));
      }
      this.handleOnboardingRedirection();
    });

    const { query } = this.$route;
    if (this.$route.query?.token) {
      this.shouldShowLandingModal = false;
      LocalStorage.setItem('referralToken', this.$route.query?.token);
      LocalStorage.setItem('name', this.$route.query?.referrerName);
      LocalStorage.setItem('campaignId', this.$router.query?.campaignId);
      this.checkLinkStatus();
    }
    if (has(query, 'modal') && query.modal === 'contentCreation') {
      if (this.$user.id) {
        this.$nextTick(() => {
          this.$store.dispatch('uiManager/toggleContentCreationModal');
          if (has(query, 'type') && ['quiz', 'lesson'].includes(query.type)) {
            this.$eventBus.$emit('contentCreationModal:contentType', query.type === 'quiz' ? this.$constants.ContentType.QUIZ : this.$constants.ContentType.PRESENTATION);
          } else {
            this.$eventBus.$emit('contentCreationModal:contentType', this.$constants.ContentType.QUIZ);
          }
        });
      } else {
        this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW);
      }
    }

    // log page view event on browser load
    this.handlePageViewEvent(this.$route, null, true);

    this.$eventBus.$on('newContentModal:show', this.showNewContentModal);
    this.$eventBus.$on('newPresentationModal:nextClicked', this.onNextClick);
    this.$eventBus.$on('superReferralStatsModal:show', this.show);
    this.$eventBus.$on('superReferralModalBasic:show', this.showBasicRefer);
    this.$eventBus.$on('superReferralForBasicModal:show', this.showModal);

    this.$eventBus.$on('togglePaidOrgListModal', this.togglePaidOrgListDropdown);

    // Peekaboo Events
    this.$eventBus.$on('openFeedbackPeekaboo', this.onOpenFeedbackPeekaboo);
    this.$eventBus.$on('closeFeedbackPeekaboo', this.onCloseFeedbackPeekaboo);

    // MemeSet Modal Events
    this.$eventBus.$on('memesetAddOrEditModal', this.handleMemesetAddOrEditModal);

    // Qfw Pricing Events
    this.$eventBus.$on('qfwPricingModal:show', this.handleQfwPricingModal);
    // Pop up the modals Before referral period expiry, Only for US users
    if (this.isUserFromUSA && !isReferralPeriodExpired()) {
      if (this.$user.isLoggedIn && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V3) && !this.$user.isSuper && !LocalStorage.getItem('hasReferralBasicReferModalOpenedBefore')) {
        this.$eventBus.$emit('superReferralForBasicModal:show');
        LocalStorage.setItem('hasReferralBasicReferModalOpenedBefore', true);
      }

      if (this.$user.isLoggedIn && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V3) && this.$user.isSuper && !this.$user.hasActiveSnDPlan && this.$user.trialDaysLeft !== 0 && this.getCount > 0 && !LocalStorage.getItem('hasReferralSuperPlanCardOpenedBefore')) {
        this.openSuperReferralModalForBasic();
        LocalStorage.setItem('hasReferralSuperPlanCardOpenedBefore', true);
      }

      if (this.$user.isLoggedIn && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SUPER_REFER_US_V1) && !this.$user.hasActiveSnDPlan && this.$user.trialDaysLeft === 0 && this.getCount > 0 && !LocalStorage.getItem('hasReferralGiftPlanCardOpenedBefore')) {
        this.openSuperReferralModal();
        LocalStorage.setItem('hasReferralGiftPlanCardOpenedBefore', true);
      }
    }
  },

  beforeUnmount() {
    stopHandlingFocusRings();

    this.$eventBus.$off('superReferralForBasicModal:show', this.showModal);
    this.$eventBus.$off('superReferralModalBasic:show', this.showBasicRefer);
    this.$eventBus.$off('newContentModal:show', this.showNewContentModal);
    this.$eventBus.$off('newPresentationModal:nextClicked', this.onNextClick);
    this.$eventBus.$off('openFeedbackPeekaboo', this.onOpenFeedbackPeekaboo);
    this.$eventBus.$off('closeFeedbackPeekaboo', this.onCloseFeedbackPeekaboo);
    this.$eventBus.$off('memesetAddOrEditModal', this.handleMemesetAddOrEditModal);
    this.$eventBus.$off('superReferralStatsModal:show', this.show);
    this.$eventBus.$off('qfwPricingModal:show', this.handleQfwPricingModal);
    this.$eventBus.$off('togglePaidOrgListModal', this.togglePaidOrgListDropdown);
  },

  methods: {
    ...mapActions('root', ['toggleUITopBanner']),

    togglePaidOrgListDropdown(orgButtonClicked) {
      if (orgButtonClicked) {
        this.shouldShowPaidOrgListDropdown = !this.shouldShowPaidOrgListDropdown;
      }
    },

    closeQfwPricingModal() {
      this.showQfwPricingModal = false;
      this.forceShowQfwPricingModal = false;
    },

    handleQfwPricingModal({ source, feat }) {
      this.qfwUpsellSource = source;
      this.qfwUpsellFeat = feat;
      this.forceShowQfwPricingModal = true;
    },

    closeModals() {
      this.shouldShowThemePickerV2 = false;
      this.shouldShowNewContentModal = false;
    },

    handleChangeForContentCreation(name) {
      this.lessonName = name;
    },

    show() {
      this.shouldShow = true;
      this.$analytics.logEvent(this.$webEvents.REFERRAL_STATS_MODAL_SHOWN);
    },

    showModal() {
      this.shouldShowReferModal = true;
      this.$analytics.logEvent(this.$webEvents.REFERRAL_MODAL_SHOWN_SUPER);
    },

    showBasicRefer(shouldReloadOnClose) {
      if (shouldReloadOnClose) {
        this.shouldReloadOnClose = shouldReloadOnClose;
      }
      this.shouldShowSuperReferModal = true;
      this.$analytics.logEvent(this.$webEvents.CAMPAIGN_REFERRAL_STATS_MODAL_SHOWN);
    },

    close() {
      this.shouldShow = false;
    },

    closeBasicModal() {
      this.shouldShowSuperReferModal = false;
      if (this.shouldReloadOnClose) {
        window.location.reload();
      }
    },

    closeModal() {
      this.shouldShowReferModal = false;
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

    showNewContentModal({ forContentType = 'quiz' }) {
      this.shouldShowNewContentModal = true;
      this.newContentModalType = forContentType;
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

    handleClose() {
      this.$store.dispatch('uiManager/toggleQfwModal');
    },

    onThemeSave() {
      this.$eventBus.$emit('presentationEditor:createOrUpdateQuiz');
    },

    onNextClick({ lessonName, selectedSubjects }) {
      this.lessonName = lessonName;
      this.selectedSubjects = selectedSubjects;
      this.shouldShowThemePickerV2 = true;
    },

    onOpenFeedbackPeekaboo() {
      this.showFeedbackPeekaboo = true;
    },

    onCloseFeedbackPeekaboo() {
      this.showFeedbackPeekaboo = false;
    },

    handleChange(newValue) {
      // true -> if received a content inside portal
      this.shouldResizeForChurnNotification = newValue;
      this.toggleUITopBanner(newValue);
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

    handleOnboardingRedirection() {
      if (this.$user.id
        && this.$user.onboardingState
        && this.$user.onboardingState.completedTill !== this.$constants.SnDTeacherOnboarding.CompletedTill.COMPLETED
        && this.$route.name !== this.$constants.PageNames.TEACHER_ONBOARDING
      ) {
        this.$eventBus.$emit('onboardingWelcomeModal:show');
      }
    },

    toggleMemesetAddOrEditModal() {
      this.shouldShowMemesetAddOrEditModal = !this.shouldShowMemesetAddOrEditModal;
    },
  },

};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/mixins.scss';
@import '~/assets/scss/extends.scss';

html {
  @extend %keyboard-only-focus-rings;
}

#app-body-container {
  margin-top: 58px;

  &.has-main-header {}
}

.skip-link {
  @apply bg-light-3 border border-dark-6 text-tn font-semibold p-2 rounded-sm absolute;
  transform: translateY(-100%);
  left: 50%;
  transition: transform 0.3s;
  z-index: 100;

  &:focus {
    transform: translateY(0%);
  }
}

.main-container {
  height: calc(100vh - 48px);
}
</style>

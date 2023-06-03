<!--
NOTE: This is a new layout derived from layouts/dashboard.vue and layouts.dashboardmobile.vue. It serves as one layout for both mobile and desktop rather than having two separate layouts like dashboard.vue & dashboardmobile.vue.

 - used at => /quiz/:slug/:id
 - TODO: this layout should be used at other places where dashboard and dashboardmobile being used.
 - Should be updated when updating layouts/dashboard.vue and layouts.dashboardmobile.vue
-->
<template>
  <div class="flex flex-col h-screen overflow-hidden font-sans dashboard-layout">
    <ToastManager />
    <QuestionBulkUpdateToastManager />
    <Overlay />
    <SuperUpsell />
    <ReferralRefereeLandingModal />
    <ReferralStatsModal />
    <ReferralRefereeRewardModal />
    <DeferredReferralSuperUpsellModal />
    <SchoolAndDistrictModal />
    <UserInfoDetailsModal />
    <OnBoardingWelcomeModal />
    <QfwChurnModal />
    <ChurnModal />
    <DeferredAuthModal />
    <QfwUpgradePlanModal class="hidden md:flex" />
    <DeferredEmbedQuizModal class="hidden md:flex" />
    <PostSignupSchoolUpsellModal class="hidden md:block" />
    <DeferredQuizGenModalForMobile />
    <a
      class="skip-link"
      :aria-label="$i18n('Skip to main content')"
      href="#app-body-container"
    >
      <i18n>Skip to Content</i18n>
    </a>

    <portal-target name="folder-access-denied" />
    <portal-target
      name="shared-folders-modal-portal"
      multiple
    />
    <portal-target name="collections-modal-portal" />

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

    <!-- This is for mobile -->
    <transition name="slide">
      <div
        v-show="showSidebar"
        v-click-outside="onHide"
        class="fixed top-0 bottom-0 w-auto transition-all z-100 md:hidden"
      >
        <client-only>
          <MainNavigation />
        </client-only>
      </div>
    </transition>

    <div class="flex flex-grow h-screen">
      <!-- this for desktop -->
      <client-only>
        <MainNavigation
          v-show="shouldShowSidebar"
          class="hidden md:block"
        />
      </client-only>
      <div
        class="flex flex-col flex-grow w-full overflow-hidden border-l border-light-1"
        :class="shouldResizeForChurnNotification ? 'main-container' : 'h-screen'"
      >
        <MainHeader
          v-show="shouldShowMainHeader"
          class="hidden md:block"
          :showQuizizzLogo="showQuizizzLogo"
        />
        <MainHeader
          v-show="!isMobileAppWebView && shouldShowMainHeader"
          class="block md:hidden"
        />
        <div
          id="app-body-container"
          ref="appBodyContainer"
          class="flex flex-grow overflow-auto bg-light-1 content"
          :class="appBodyContainerClasses"
        >
          <RouterView v-slot="{ Component }">
            <Transition
              name="fade"
              mode="out-in"
              appear
            >
              <component :is="Component" />
            </Transition>
          </RouterView>
          <CorporateTrialExpired v-if="isCorporatePaywallVisible" />
        </div>
      </div>
    </div>
    <BottomNavigationMobile
      v-show="!isMobileAppWebView"
      class="md:hidden"
      @handleCreateContent="handleCreateContent"
    />
    <NewPresentationModal
      v-if="shouldShowNewContentModal"
      class="new-content-modal md:hidden"
      :forContentType="newContentModalType"
      :style="{ backgroundColor: '#6D6D6D' }"
      @close="shouldShowNewContentModal = false"
    />
    <ContentCreationModal
      v-if="isContentCreationModalVisible"
      class="hidden md:block"
    />
    <ThemePickerV2
      v-if="shouldShowThemePickerV2"
      class="hidden md:block"
      :isNewLesson="true"
      :lessonName="lessonName"
      :selectedSubjects="selectedSubjects"
      @themeSaved="onThemeSave"
      @close="closeModals"
    />
    <LoadSVG
      name="shapes"
      class="absolute invisible hidden svg-shapes-import md:block"
    />
    <portal-target name="media-preview" />
    <FeedbackPeekaboo
      v-if="showFeedbackPeekaboo"
      class="hidden md:block"
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
    <ImportSlidesModal
      v-if="isBulkImportModalShowing"
      class="hidden md:block"
      isForBulkImport
    />
    <ImportGoogleForms
      v-if="isImportFormsShowing"
      class="hidden md:block"
    />
    <DashboardBottomProgressPopUp
      v-if="isBottomProgressPopUpShowing"
      class="hidden md:block"
    />
    <DashboardLogErrorModal class="hidden md:hidden" />
    <Modal
      v-if="qfwModalState"
      class="qfw-plan-modal hidden md:hidden"
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
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { mapGetters, mapActions } from 'vuex';
import has from 'lodash/has';
import get from 'lodash/get';

import { generateSurvey, setVisitorTraits } from '~/services/Survicate.js';

import { handleFocusRings, stopHandlingFocusRings } from '~/services/FocusRingsService.js';

import FontService from '~/services/FontService.js';
import IdleQueueService from '~/services/IdleQueueService.js';
import ProductsService from '~/services/apis/Products';
import Fonts from '~/config/Fonts.js';
import GoogleOneTapMixin from '~/mixins/GoogleOneTapMixin';
import QLogger from '~/services/QLogger';
import QuizService from '~/services/apis/QuizService';
import { getSubjectFromPreferencesOrUserData, getGradeFromPreferencesOrUserData } from '~/utils/QuizUtils';
import LocalStorage from '~/services/LocalStorage';
import { ContentDefaultName } from '../config/DefaultCopies';
import $axios from '../services/AxiosService.js';
import $store from '../services/StoreService.js';

export default {

  components: {
    DeferredReferralSuperUpsellModal: defineAsyncComponent(() => import('../components/Referral/SuperUpsellModal.vue')),
    DeferredAuthModal: defineAsyncComponent(() => import('../components/Auth/Modal.vue')),
    DeferredEmbedQuizModal: defineAsyncComponent(() => import('../components/EmbedQuizModal/index.vue')),
    DeferredQuizGenModalForMobile: defineAsyncComponent(() => import('../components/QuizGenModalForMobile.vue')),
  },

  mixins: [GoogleOneTapMixin],

  data() {
    return {
      shouldShowNewContentModal: false,
      isMobileAppWebView: false,
      showSidebar: false,
      newContentModalType: this.$constants.ContentType.QUIZ,
      shouldShowThemePickerV2: false,
      lessonName: '',
      selectedSubjects: [],
      products: [],
      shouldResizeForChurnNotification: false,
      showFeedbackPeekaboo: false,
      excludedRoutes: ['/settings'],
      idleQueue: null,
      shouldShowMemesetAddOrEditModal: false,
      shouldShowSidebar: true,
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
          media: 'print',
          body: true,
          href:
            'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400;1,800&display=swap',
        },
      ],

      script: [
        {
          src: 'https://www.youtube.com/player_api',
          defer: true,
          body: true,
        },
        {
          src: 'https://www.youtube.com/iframe_api',
          defer: true,
          body: true,
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
      const classes = ['overflow-auto'];
      if (this.isMobileAppWebView) {
        classes.push('mt-0');
        classes.push('mb-0');
        classes.push('mobile-app');
      }

      return classes.join(' ');
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

    ...mapGetters('root', ['serverData', 'isDesktop']),
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
    $store(this.$store);
    $axios(this.$axios);

    this.loading = true;
    const { products } = await ProductsService.fetchProducts('corporate_teacher', { onlyListed: true });
    this.products = products;

    this.loading = false;
  },

  mounted() {
    handleFocusRings(window);
    this.handleSideBarShowOrHide();

    setVisitorTraits(window._sva = window._sva || {});

    /**
     * Use IdleQueueService service to make sure these resources are loaded during idle time or at the earliest when they are needed
    */
    this.idleQueue = new IdleQueueService();

    this.idleQueue.addTask(FontService.loadOpenSans);
    this.idleQueue.addTask(generateSurvey.bind(null, window));
    this.isMobileAppWebView = !!get(this.$route, 'query.mr', false);

    this.$nextTick(() => {
      for (const fontKey in Fonts) {
        const font = Fonts[fontKey];

        this.idleQueue.addTask(FontService.loadFont.bind(null, font));
      }
      this.handleOnboardingRedirection();
    });

    const { query } = this.$route;
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
    this.$eventBus.$on('newContentModal:show', this.handleCreateContent);

    this.$eventBus.$on('newContentModal:show', this.showNewContentModal);
    this.$eventBus.$on('newPresentationModal:nextClicked', this.onNextClick);

    // Peekaboo Events
    this.$eventBus.$on('openFeedbackPeekaboo', this.onOpenFeedbackPeekaboo);
    this.$eventBus.$on('closeFeedbackPeekaboo', this.onCloseFeedbackPeekaboo);

    // MemeSet Modal Events
    this.$eventBus.$on('memesetAddOrEditModal', this.handleMemesetAddOrEditModal);
    // Show hide mobile sidebar
    this.$eventBus.$on('sidebar:show', this.onShow);
    this.$eventBus.$on('sidebar:hide', this.onHide);
  },

  beforeUnmount() {
    stopHandlingFocusRings();

    this.$eventBus.$off('newContentModal:show', this.handleCreateContent);

    // Show hide mobile sidebar
    this.$eventBus.$off('sidebar:show', this.onShow);
    this.$eventBus.$off('sidebar:hide', this.onHide);

    this.$eventBus.$off('newContentModal:show', this.showNewContentModal);
    this.$eventBus.$off('newPresentationModal:nextClicked', this.onNextClick);
    this.$eventBus.$off('openFeedbackPeekaboo', this.onOpenFeedbackPeekaboo);
    this.$eventBus.$off('closeFeedbackPeekaboo', this.onCloseFeedbackPeekaboo);
    this.$eventBus.$off('memesetAddOrEditModal', this.handleMemesetAddOrEditModal);
  },

  methods: {
    ...mapActions('root', ['toggleUITopBanner']),

    handleSideBarShowOrHide() {
      const regex = /\/admin\/[\s\S]*\/[0-9a-fA-F]{24}\/[\s\S]*/s;
      if (!this.$user.isLoggedIn && regex.test(this.$route.path)) {
        this.shouldShowSidebar = false;
      } else {
        this.shouldShowSidebar = true;
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

    onShow() {
      this.showSidebar = true;
      this.$eventBus.$emit('overlay:show', { zIndex: 30 });
    },

    onHide() {
      this.showSidebar = false;
      // this.$eventBus.$emit('overlay:hide');
    },

    closeModals() {
      this.shouldShowThemePickerV2 = false;
      this.shouldShowNewContentModal = false;
    },

    handleChangeForContentCreation(name) {
      this.lessonName = name;
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

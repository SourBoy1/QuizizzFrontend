<template>
  <div class="default-layout">
    <ToastManager />
    <QuestionBulkUpdateToastManager />
    <Overlay />
    <RouterView v-slot="{ Component }">
      <Transition
        name="fade"
        mode="out-in"
        appear
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
    <SuperUpsell />
    <ReferralSuperUpsellModal />
    <ReferralStatsModal />
    <AuthModal />
    <UserInfoDetailsModal />

    <MediaPreview
      v-if="shouldShowMediaPreview"
      :queryMediaObjects="queryMediaObjects"
      @close="shouldShowMediaPreview = false"
    />
    <NewPresentationModal
      v-if="shouldShowNewContentModal"
      class="new-content-modal"
      :forContentType="newContentModalType"
      :style="{ backgroundColor: '#6D6D6D' }"
      @close="shouldShowNewContentModal = false"
    />
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
      class="svg-shapes-import absolute invisible hidden"
    />
    <FeedbackPeekaboo v-if="showFeedbackPeekaboo" />
    <portal-target name="media-preview" />
  </div>
</template>
<script>

import IdleQueueService from '~/services/IdleQueueService.js';

import { generateSurvey, setVisitorTraits } from '~/services/Survicate.js';

import PageTitles from '~/config/PageTitles';
import FontService from '~/services/FontService.js';
import Fonts from '~/config/Fonts.js';
import $axios from '../services/AxiosService.js';
import $store from '../services/StoreService.js';

const initialQueryMediaObjects = () => ({
  image: {},
  audio: {},
  video: {},
});

export default {
  data() {
    return {
      shouldShowMediaPreview: false,
      queryMediaObjects: initialQueryMediaObjects(),
      shouldShowNewContentModal: false,
      newContentModalType: this.$constants.ContentType.QUIZ,
      shouldShowThemePickerV2: false,
      lessonName: '',
      selectedSubjects: [],
      showFeedbackPeekaboo: false,
      idleQueue: null,
    };
  },

  head() {
    return {
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

  watch: {
    $route(to, from) {
      const pageTitle = PageTitles[to.name];

      // eslint-disable-next-line quote-props
      this.$gtag.customMap({ 'dimension2': 'plan', 'dimension3': 'occupation' });
      this.$gtag.query('set', 'user_properties', { plan_dimension: this.$user.plan || 'null', occupation_dimension: this.$user.occupation || 'null' });

      if (pageTitle) {
        this.$gtag.pageview({
          page_title: pageTitle,
          page_path: to.path,
          page_location: to.fullPath,
        });
      }

      this.shouldShowMediaPreview = false;
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
  },

  mounted() {
    this.idleQueue.addTask(generateSurvey.bind(null, window));

    this.$nextTick(() => {
      for (const fontKey in Fonts) {
        const font = Fonts[fontKey];

        this.idleQueue.addTask(FontService.loadFont.bind(null, font));
      }
      this.handleOnboardingRedirection();
    });

    setVisitorTraits(window._sva = window._sva || {});

    this.$eventBus.$on('mediaPreview:show', this.showMediaPreview);
    this.$eventBus.$on('mediaPreview:hide', this.hideMediaPreview);
    this.$eventBus.$on('newContentModal:show', this.showNewContentModal);
    this.$eventBus.$on('newPresentationModal:nextClicked', this.onNextClick);
    this.$eventBus.$on('openFeedbackPeekaboo', this.onOpenFeedbackPeekaboo);
    this.$eventBus.$on('closeFeedbackPeekaboo', this.onCloseFeedbackPeekaboo);
  },

  beforeUnmount() {
    this.$eventBus.$off('mediaPreview:show', this.showMediaPreview);
    this.$eventBus.$off('mediaPreview:hide', this.hideMediaPreview);
    this.$eventBus.$off('newContentModal:show', this.showNewContentModal);
    this.$eventBus.$off('newPresentationModal:nextClicked', this.onNextClick);
    this.$eventBus.$off('openFeedbackPeekaboo', this.onOpenFeedbackPeekaboo);
    this.$eventBus.$off('closeFeedbackPeekaboo', this.onCloseFeedbackPeekaboo);
  },

  methods: {
    closeModals() {
      this.shouldShowThemePickerV2 = false;
      this.shouldShowNewContentModal = false;
    },

    showNewContentModal({ forContentType = 'quiz' }) {
      this.shouldShowNewContentModal = true;
      this.newContentModalType = forContentType;
    },

    onNextClick({ lessonName, selectedSubjects }) {
      this.lessonName = lessonName;
      this.selectedSubjects = selectedSubjects;
      this.shouldShowThemePickerV2 = true;
    },

    onThemeSave() {
      this.$eventBus.$emit('presentationEditor:createOrUpdateQuiz');
    },

    onOpenFeedbackPeekaboo() {
      this.showFeedbackPeekaboo = true;
    },

    onCloseFeedbackPeekaboo() {
      this.showFeedbackPeekaboo = false;
    },

    showMediaPreview(queryMediaObjects) {
      this.shouldShowMediaPreview = true;
      this.queryMediaObjects = queryMediaObjects;
    },

    hideMediaPreview() {
      this.shouldShowMediaPreview = false;
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

<style lang="scss"></style>

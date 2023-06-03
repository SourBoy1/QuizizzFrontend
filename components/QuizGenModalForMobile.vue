<template>
  <Modal
    v-if="showCreateMobileModalBool"
    dismissOnOverlayClick
    :stickToBottom="true"
    :showCloseModalBtn="false"
    :fullWidth="true"
    :zeroPadding="true"
    headerCustomClasses="!px-4 pt-4"
    :title="$i18n('How would you like to create the quiz?')"
    @close="toggleModalClose"
  >
    <template
      v-if="canShowTopBanner"
      #top-panel
    >
      <img
        alt="topBanner"
        :src="bannerSrc"
        class="absolute -translate-y-full_1rem cursor-pointer w-full max-w-100 left-0 right-0 m-auto px-4"
        :bannerTag="bannerTag"
        @click="handleBannerClick"
      />
    </template>
    <div class="p-4">
      <div
        v-if="isQuizGenModalLoading"
        class="w-full flex justify-center items-center my-10"
      >
        <Loader :size="40" />
      </div>
      <div
        v-else
        class="flex flex-col"
      >
        <button
          :aria-label="$i18n('Quiz generator')"
          class="flex items-center border-y border-dark-5% py-4 w-full justify-between cursor-pointer"
          @click="handleOpenQuizGenerator"
        >
          <div class="flex">
            <FA
              icon="fas fa-wand-magic-sparkles"
              class="rounded-lg text-lilac bg-lilac-faded w-10 h-10 flex justify-center items-center"
              size="14"
            />
            <div class="flex flex-col pl-4 items-start">
              <p class="text-sm text-dark-2 font-semibold flex items-center">
                <i18n>Quiz generator</i18n>
                <span class="ml-1 text-lilac bg-lilac-faded px-2 text-xxs rounded flex justify-center items-center font-semibold">Beta</span>
              </p>
              <span class="font-normal text-xs text-dark-4"><i18n>Get a ready-to-use, personalised quiz</i18n></span>
            </div>
          </div>
          <FA
            icon="fas fa-chevron-right"
            class="text-dark-5"
          />
        </button>
        <button
          :aria-label="$i18n('Create from scratch')"
          class="flex items-center border-b border-dark-5% py-4 w-full justify-between cursor-pointer"
          @click="createQuiz"
        >
          <div class="flex items-center">
            <FA
              icon="fas fa-plus-large"
              class="rounded-lg text-lilac bg-lilac-faded w-10 h-10 flex justify-center items-center"
              size="14"
            />
            <div class="flex flex-col pl-4 items-start">
              <p class="text-sm text-dark-2 font-semibold">
                <i18n>Create from scratch</i18n>
              </p>
              <span class="font-normal text-xs text-dark-4"><i18n>Build the quiz one question at a time</i18n></span>
            </div>
          </div>
          <FA
            icon="fas fa-chevron-right"
            class="text-dark-5"
          />
        </button>
      </div>
    </div>
  </Modal>
</template>
<script>
import MoengageService from '~/services/MoengageService';
import { getSubjectFromPreferencesOrUserData, getGradeFromPreferencesOrUserData } from '~/utils/QuizUtils';
import QuizService from '~/services/apis/QuizService';
import { ContentDefaultName } from '~/config/DefaultCopies';
import RecommendationsService from '~/services/RecommendationsService';

export default {
  emits: [],

  data() {
    return {
      showCreateMobileModalBool: false,
      isQuizGenModalLoading: false,
      subjectPreferences: [],
    };
  },

  computed: {
    canShowTopBanner() {
      // Add other banners in future maybe
      return this.canShowMerdekaBanner;
    },

    canShowMerdekaBanner() {
      return this.canShowCurriculumCuration && this.subjectPreferences.includes('Mathematics');
    },

    canShowCurriculumCuration() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.KURIKULUM_ID);
    },

    bannerTag() {
      if (this.canShowMerdekaBanner) {
        return 'merdeka';
      }

      return null;
    },

    bannerSrc() {
      if (this.canShowMerdekaBanner) {
        return 'https://cf.quizizz.com/img/curriculum/indonesia/qc-banner-mobile.png';
      }

      return null;
    },
  },

  mounted() {
    this.$eventBus.$on(this.$constants.EventBus.QUIZ_GEN_MOBILE_MODAL_SHOW, this.showCreateMobileModal);
    this.$eventBus.$on(this.$constants.EventBus.QUIZ_GEN_MOBILE_MODAL_HIDE, this.toggleModalClose);
  },

  beforeUnmount() {
    this.$eventBus.$off(this.$constants.EventBus.QUIZ_GEN_MOBILE_MODAL_SHOW, this.showCreateMobileModal);
    this.$eventBus.$off(this.$constants.EventBus.QUIZ_GEN_MOBILE_MODAL_HIDE, this.toggleModalClose);
  },

  async created() {
    if (this.canShowCurriculumCuration) {
      const metadata = await RecommendationsService.getUserRecommendationMetadata();
      this.subjectPreferences = (metadata && metadata.subject) || [];
    }
  },

  methods: {
    showCreateMobileModal() {
      this.$analytics.logEvent(this.$webEvents.QUIZ_GENERATOR_MOBILE_MODAL_OPEN);
      if (!this.$user.isCorporate && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_QUIZ_GEN_MOBILE)) {
        this.showCreateMobileModalBool = true;
        return;
      }
      this.createQuiz();
    },

    toggleModalClose() {
      this.$analytics.logEvent(this.$webEvents.QUIZ_GENERATOR_MOBILE_MODAL_CLOSE);
      this.showCreateMobileModalBool = false;
    },

    async handleOpenQuizGenerator() {
      this.$store.dispatch('uiManager/resetQuizGenData');
      const quizName = ContentDefaultName.QUIZ_NAME;
      this.$analytics.logEvent(this.$webEvents.QUIZ_GENERATOR_MOBILE_MODAL);
      const quizData = {
        name: quizName,
        subjects: !this.$user.isCorporate ? getSubjectFromPreferencesOrUserData(this.$user) : [],
        grade: !this.$user.isCorporate ? getGradeFromPreferencesOrUserData(this.$user) : [],
        type: this.$constants.ContentType.QUIZ,
      };
      try {
        this.isQuizGenModalLoading = true;
        const response = await QuizService.createQuiz(quizData);
        const quizId = response.quiz._id;
        this.$router.push({ path: `/quiz/creator/${quizId}/edit`, query: { ...this.$router.query, source: 'quizGenMobile' } });
      } catch (err) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while creating the quiz'),
        });
      } finally {
        this.isQuizGenModalLoading = false;
      }
    },

    createQuiz() {
      this.$analytics.logEvent(this.$webEvents.CREATE_QUIZ_MOBILE_MODAL);
      this.isQuizGenModalLoading = true;
      this.$eventBus.$emit('newContentModal:show', { forContentType: this.$constants.ContentType.QUIZ });
      this.$eventBus.$emit('overlay:show');

      MoengageService.triggerEvent(this.$user, 'event', 'Create Selected', {
        activityType: 'Quiz',
      });
    },

    handleBannerClick(event) {
      const elem = event.currentTarget;
      const bannerTag = elem.getAttribute('bannerTag');
      switch (bannerTag) {
        case 'merdeka':
          this.$router.push('/curriculum/id/merdeka/junior?source=content_creation');
          this.closeModal();
          break;
        default:
      }
    },
  },
};
</script>

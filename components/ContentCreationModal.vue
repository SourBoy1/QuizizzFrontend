<template>
  <div>
    <Modal
      v-if="!isFlaggedCorporateUser"
      ref="content-creation-modal"
      containerClasses="content-creation-modal"
      dismissOnOverlayClick
      shouldCloseOnEscape
      size="sm"
      :showCloseModalBtn="false"
      :sidePanel="{
        show: true,
        timer: 100,
        animationDuration: 200,
      }"
      @close="toggleModal"
    >
      <template
        v-if="canShowTopBanner"
        #top-panel
      >
        <img
          :class="[!topBannerSpaceAvailable && 'hidden']"
          :src="bannerSrc"
          class="fixed cursor-pointer"
          :bannerTag="bannerTag"
          @click="handleBannerClick"
        />
      </template>
      <div
        class="content-creation-modal-container overflow-x-hidden"
        :class="{ 'flex items-center justify-center': isLoading }"
      >
        <Loader
          v-if="isLoading"
          :size="40"
        />
        <div
          v-else
          class="flex flex-col items-center"
        >
          <h1 class="text-lg font-semibold">
            <i18n>
              What would you like to create?
            </i18n>
          </h1>
          <div class="content-cards-container flex flex-col gap-6 mt-6 w-30">
            <button
              data-cy="create-quiz-button"
              class="content-card content-card-shadow border-dark-6 bg-light-2 min-h-33 h-full w-full px-4 pt-3 pb-4 border-1 rounded-lg flex gap-2 flex-col items-start hover:bg-lilac-faded hover:border-lilac-light hover:bg-lilac-faded hover:border-lilac-light hover:content-card-click-shadow"
              :aria-label="$i18n('Quiz creation button')"
              @click="handleCreateContent('quiz')"
              @mouseenter="handleCardHover('quiz')"
            >
              <div class="flex items-center gap-2">
                <img
                  src="https://cf.quizizz.com/img/illustrations/quiz.png"
                  width="48"
                  height="48"
                  alt="quiz-creation"
                />
                <p class="text-xl font-bold text-dark-1">
                  <i18n>Quiz</i18n>
                </p>
              </div>

              <p
                class="text-sm text-left"
                :class="isCardHovered ? 'text-dark-3' : 'text-dark-4'"
              >
                <i18n>Make assessment and practice motivating with interactive questions</i18n>
              </p>
            </button>
            <button
              data-cy="create-lesson-button"
              class="content-card content-card-shadow border-dark-6 bg-light-2 min-h-33 h-full w-full px-4 pt-3 pb-4 border-1 rounded-lg flex gap-2 flex-col items-start hover:bg-lilac-faded hover:border-lilac-light hover:bg-lilac-faded hover:border-lilac-light hover:content-card-click-shadow"
              :aria-label="$i18n('Lesson creation button')"
              @click="handleCreateContent('presentation')"
              @mouseenter="handleCardHover('presentation')"
            >
              <div class="flex items-center gap-2">
                <img
                  src="https://cf.quizizz.com/img/illustrations/lesson.png"
                  width="48"
                  height="48"
                  alt="quiz-creation"
                />
                <p class="text-xl font-bold text-dark-1">
                  {{ lessonTitle }}
                </p>
              </div>

              <p
                class="text-sm text-left"
                :class="isCardHovered ? 'text-dark-3' : 'text-dark-4'"
              >
                {{ lessonDescription }}
              </p>
            </button>
          </div>
          <div class="w-full mt-3 font-semibold text-dark-4 flex flex-col justify-center items-center p-2 text-sm">
            <i18n>Already have content ready? Let’s import</i18n>
            <div class="flex space-x-2 mt-3 w-full">
              <button
                class="flex-1 py-1 px-5 rounded border-1 border-dark-5% bg-dark-5% text-dark-2 text-xs flex items-center justify-center"
                @click="handleImportGoogleForms"
              >
                <FA
                  v-if="isImportFormsShowing"
                  icon="far fa-sync"
                  :size="12"
                  class="loading-icon animate-spin"
                />
                <template v-else>
                  <FA
                    icon="fa-solid fa-file-lines"
                    :size="12"
                    class="text-lilac w-4 mr-1 flex items-center justify-center"
                  />
                  <i18n>Google Forms</i18n>
                </template>
              </button>
              <button
                class="flex-1 py-1 px-5 rounded border-1 border-dark-5% bg-dark-5% text-dark-2 text-xs flex items-center justify-center"
                @click="toggleBulkImport"
              >
                <img
                  src="https://cf.quizizz.com/image/google-slides.svg"
                  alt="Google Slides"
                  class="mr-1"
                />
                <i18n>Google Slides</i18n>
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #side-panel>
        <div class="w-full">
          <div
            class="relative h-80 w-60 rounded-lg overflow-hidden bg-dark-4"
          >
            <div
              class="h-full w-full flex transition-transform duration-500"
              :style="`transform: translateX(${getTranslateXParameter})`"
            >
              <video
                v-for="(src, videoIndex) in getVideoSrc"
                :key="src + videoIndex"
                :ref="'demonstration-video-' + videoIndex"
                playsinline
                class="object-fill h-full"
                @timeupdate="handleVideoProgress($event, videoIndex)"
                @canplay="($event) => { $event.target.play() }"
              >
                <source
                  :src="src"
                  type="video/mp4"
                >
              </video>
            </div>

            <div class="absolute w-full flex justify-center bottom-0 p-2 gap-1">
              <button
                v-for="(src, videoIndex) in getVideoSrc"
                :key="src + '-' + videoIndex"
                class="bg-light-33% h-1 rounded-full w-7 overflow-hidden"
                @click="setActiveVideo(videoIndex)"
              >
                <div
                  v-if="activeVideo > videoIndex"
                  class="bg-light w-full h-full transition-all"
                />
                <div
                  v-if="activeVideo === videoIndex"
                  :style="`width:${activeVideo === videoIndex ? videoElapsed : '100'}%`"
                  class="bg-light h-full transition-all"
                />
              </button>
            </div>
            <div class="absolute top-0 w-full h-full grid grid-cols-2">
              <button
                class="h-full"
                @click="setActiveVideo(activeVideo - 1)"
              />
              <button
                class="h-full"
                @click="setActiveVideo(activeVideo + 1)"
              />
            </div>
          </div>
        </div>
      </template>
    </Modal>
    <QfwCreateFlow
      v-else
      ref="content-creation-modal"
      :toggleModal="toggleModal"
      :handleCreateContent="handleCreateContent"
      @handleImportGoogleForms="handleImportGoogleForms"
      @toggleBulkImport="toggleBulkImport"
    />
  </div>
</template>

<script>

import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { mapGetters } from 'vuex';

import QuizService from '~/services/apis/QuizService';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import RecommendationsService from '~/services/RecommendationsService';

import { getSubjectFromPreferencesOrUserData, getGradeFromPreferencesOrUserData } from '~/utils/QuizUtils';
import { ContentDefaultName } from '../config/DefaultCopies';

const TOP_PANEL_HEIGHT = 124;
const TOP_PANEL_MARGIN = 12; // x3 will be used as margin is needed around banner and below the entire modal

export default {

  data() {
    return {
      isModalVisible: false,
      isLoading: false,
      isCardHovered: false,
      contentType: '',
      activeVideo: 0,
      videoElapsed: 0,

      lessonVideoSrc: [
        'https://cf.quizizz.com/videos/contentCreation/C.mp4',
        'https://cf.quizizz.com/videos/contentCreation/B.mp4',
        'https://cf.quizizz.com/videos/contentCreation/A.mp4',
        'https://cf.quizizz.com/videos/contentCreation/D.mp4',
      ],

      quizVideoSrc: [
        'https://cf.quizizz.com/videos/contentCreation/quiz/a.mp4',
        'https://cf.quizizz.com/videos/contentCreation/quiz/b.mp4',
        'https://cf.quizizz.com/videos/contentCreation/quiz/c.mp4',
      ],

      isShortScreen: false,

      quizName: null,
      subjects: [],
      subjectPreferences: [],

      topBannerSpaceAvailable: false,
      // The automatically positioned top value of the modal, for use in repositioning the modal
      modalContainerAutoTop: null,
    };
  },

  computed: {
    ...mapGetters('uiManager', ['isImportFormsShowing']),

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
        return 'https://cf.quizizz.com/img/curriculum/indonesia/qc-banner-desk.png';
      }

      return null;
    },

    getVideoSrc() {
      return this.contentType === 'quiz' ? this.quizVideoSrc : this.lessonVideoSrc;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isFlaggedCorporateUser() {
      if (this.isCorporateUser) {
        return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.QFW_CREATE_FLOW);
      }
      return false;
    },

    isCreationNotAllowed() {
      if (this.hasError || !this.contentTypeToCreate) {
        return true;
      }

      if (!this.quizName) {
        return true;
      }

      return !this.$user.isCorporate && (!this.subjects || this.subjects?.length === 0);
    },

    getTranslateXParameter() {
      switch (this.activeVideo) {
        case 0:
          return '0%';
        case 1:
          return '-100%';
        case 2:
          return '-200%';
        case 3:
          return '-300%';
        default: return '0%';
      }
    },

    isCorporate() {
      return this.$user.isCorporate;
    },

    lessonTitle() {
      if (this.isCorporate) {
        return this.$i18n('Presentation');
      }
      return this.$i18n('Lesson');
    },

    lessonDescription() {
      if (this.isCorporate) {
        return this.$i18n('Use fun and interactive slides that your colleagues will enjoy');
      }
      return this.$i18n('Add fun and interactive slides to assessments that students already love');
    },
  },

  watch: {
    contentType(oldVal, newVal) {
      if (oldVal !== newVal) {
        this.activeVideo = 0;
      }
    },
  },

  async created() {
    if (this.canShowCurriculumCuration) {
      const metadata = await RecommendationsService.getUserRecommendationMetadata();
      this.subjectPreferences = (metadata && metadata.subject) || [];
    }
  },

  mounted() {
    this.setActiveVideo(0);
    HotjarService.triggerEvent(HotjarEvents.HOTJAR_PRECURSOR_CREATE_MODAL);
    window.addEventListener('resize', this.setContentDimensions);
    // To ensure it happens after modal has animated
    if (!this.canShowTopBanner) {
      setTimeout(() => {
        const modalContainer = this.$el.querySelectorAll('.content-creation-modal')?.[0];
        if (modalContainer) {
          this.modalContainerAutoTop = parseInt(modalContainer.getBoundingClientRect().top, 10);
          this.resizeAndPositionTopPanel();
        }
      }, 1000);
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.setContentDimensions);
  },

  methods: {
    setContentDimensions: debounce(function setContentDimensions() {
      this.isShortScreen = window.innerHeight < 600;
      this.resizeAndPositionTopPanel();
    }),

    resizeAndPositionTopPanel() {
      if (!this.canShowTopBanner) {
        return;
      }

      const modalContainer = this.$el.querySelectorAll('.content-creation-modal')?.[0];
      const bannerImage = modalContainer?.querySelectorAll('img')?.[0];

      if (!(modalContainer && bannerImage)) {
        return;
      }

      const modalBody = modalContainer.querySelectorAll('.modal-body')?.[0];
      const modalSidePanel = modalContainer.querySelectorAll('.side-panel')?.[0];

      if (!(modalBody && modalSidePanel)) {
        return;
      }

      const modalBodyClientRect = modalBody.getBoundingClientRect();
      const modalSidePanelClientRect = modalSidePanel.getBoundingClientRect();

      const { clientHeight } = document.body;

      const available = clientHeight - modalSidePanelClientRect.height;
      this.topBannerSpaceAvailable = available > (TOP_PANEL_HEIGHT + TOP_PANEL_MARGIN * 3);

      if (!this.topBannerSpaceAvailable) {
        return;
      }

      // For centering the modal with the banner
      const modalMidPoint = modalBodyClientRect.width + modalSidePanelClientRect.width / 2;
      modalContainer.style.left = `-${modalMidPoint - modalBodyClientRect.width}px`;

      /*
      * Uhh, let me explain --> We need the midpoint vertically for the modal, so clientHeight / 2 - modalHeight + the banner we are going to add + some margins
      * Then modal container has an auto top value due to flex items-center in parent, so removing that offset and adding back the top banner heights as offset
      */

      modalContainer.style.top = null;
      modalContainer.style.top = `${(clientHeight / 2) - ((modalBodyClientRect.height + TOP_PANEL_HEIGHT + TOP_PANEL_MARGIN) / 2) - this.modalContainerAutoTop + TOP_PANEL_HEIGHT + TOP_PANEL_MARGIN * 2}px`;

      bannerImage.width = modalBodyClientRect.width + modalSidePanelClientRect.width;
      bannerImage.height = TOP_PANEL_HEIGHT;
      bannerImage.style.top = `${modalContainer.getBoundingClientRect().top - TOP_PANEL_HEIGHT - TOP_PANEL_MARGIN}px`;
    },

    setActiveVideo(videoIndex) {
      const idx = videoIndex < 0 ? 0 : videoIndex % this.getVideoSrc.length;
      const video = this.$refs[`demonstration-video-${videoIndex}`];
      if (video?.length > 0) {
        const currentVideo = video[0];
        currentVideo.currentTime = 0;
      }
      this.videoElapsed = 0;
      this.activeVideo = idx;
    },

    handleVideoProgress(event, videoIndex) {
      if (this.activeVideo !== videoIndex) {
        return;
      }
      const { duration } = event.target;
      const current = event.target.currentTime;
      this.videoElapsed = current / duration * 100;
      if (this.videoElapsed === 100) {
        this.setActiveVideo(this.activeVideo + 1);
      }
    },

    handleCardHover: debounce(function handleCardHover(type) {
      this.contentType = type;
    }, 150),

    handleContentCardClick(type) {
      this.contentType = type;
    },

    toggleModal() {
      this.$store.dispatch('uiManager/toggleContentCreationModal');
    },

    closeModal() {
      const contentCreationModal = this.$refs['content-creation-modal'];

      if (contentCreationModal) {
        contentCreationModal.close();
      }
    },

    toggleBulkImport() {
      this.$store.dispatch('uiManager/toggleBulkImport');
      this.closeModal();
    },

    async handleCreateContent(type, importFromSheet = false) {
      const quizData = {
        name: type === this.$constants.ContentType.QUIZ ? ContentDefaultName.QUIZ_NAME : ContentDefaultName.LESSON_NAME,
        subjects: !this.isCorporateUser ? getSubjectFromPreferencesOrUserData(this.$user) : [],
        grade: !this.isCorporateUser ? getGradeFromPreferencesOrUserData(this.$user) : [],
        type,
      };
      this.isLoading = true;
      const response = await QuizService.createQuiz(quizData);
      if (isEmpty(response)) {
        this.isLoading = false;
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while creating the quiz'),
        });
        return;
      }
      const quizId = response.quiz._id;
      const { query } = this.$route;

      if (this.isFlaggedCorporateUser && !importFromSheet) {
        this.$analytics.logEvent(this.$webEvents.QFW_CREATE_ + type);
      }
      if (importFromSheet) {
        query.importFromSheet = true;
      } else {
        const eventName = this.$webEvents.getQuizEditorEvent(type, this.$webEvents.CREATE_CONTENT_CLICKED_V2);
        this.$analytics.logEvent(eventName, { source: 'content-creation-modal' });
      }
      if (type === this.$constants.ContentType.QUIZ) {
        this.$router.push({ path: `/quiz/creator/${quizId}/edit`, query });
      } else {
        this.$router.push({ path: `/presentation/${quizId}/edit`, query });
      }
      this.toggleModal();
    },

    handleImportGoogleForms() {
      this.$analytics.logEvent(
        this.$webEvents.IMPORT_GOOGLE_FORMS_BTN,
        {
          position: 'content_creation_modal',
        },
      );
      this.$store.dispatch('uiManager/toggleGoogleFormsImport', { publish: true });
      this.closeModal();
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

<style lang="scss">
$cardsContainerMaxWidth: 296px;
$contentCreationModalMaxWidth: 360px;
$contentCreationModalHeight: 430px;
$bulkUploadContainerWidth: 448px;

.content-cards-container  {
  width: $cardsContainerMaxWidth;
}

.start-btn {
  width: $cardsContainerMaxWidth;
}

.content-creation-modal{
  max-width: $contentCreationModalMaxWidth !important;
}

.content-creation-modal-container {
  min-height: $contentCreationModalHeight;
}
.content-card-shadow {
  box-shadow: 0px 4px 0px theme('colors.dark.5');
  &:hover {
    box-shadow: 0px 4px 0px theme('colors.lilac.DEFAULT');
  }
}

.content-card-click-shadow {
  box-shadow: 0px 4px 0px theme('colors.lilac.DEFAULT');
}
</style>

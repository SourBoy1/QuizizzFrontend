import { mapGetters } from 'vuex';

import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import UserAPIService from '~/services/apis/UserAPIService';
import QuizService from '~/services/apis/QuizService';
import { redirectOnLeavingEditor, getGradeFromPreferencesOrUserData, getSubjectFromPreferencesOrUserData } from '~/utils/QuizUtils.js';
import HotjarService, { HotjarEvents } from '~/services/HotjarService.js';
import { addSurvicateQueryParam } from '~/utils/SurvicateUtils.js';
import getSubjectsList from '../config/Subjects.js';
import Grades from '../config/GradesForContentPublish.js';
import Languages from '../config/Languages.js';
import Visibilities from '../config/Visibility.js';
import { ContentDefaultName } from '../config/DefaultCopies';

export default {
  props: {
    didClickSettings: {
      type: Boolean,
      default: false,
    },
    editMetadataMode: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'presentation',
    },
  },

  data() {
    const hasPrivateContentAccess = get(
      this.$user.subscription,
      'priviledges.privateContent',
      false,
    );
    const subjectsList = getSubjectsList().map((subject) => ({
      title: subject.text,
      value: subject.val,
    }));

    const sortedSubjects = subjectsList.sort((a, b) => a.value.localeCompare(b.value));
    return {
      inputFocusTimeout: null,
      sortedSubjectsList: sortedSubjects,
      gradesList: Grades.map((grade) => ({
        title: grade.text,
        arrayValue: grade.val,
        value: grade.val.toString(),
      })),

      languagesList: Languages.map((language) => ({
        title: language.name,
        value: language.name,
        code: language.code,
      })),

      mediaObj: {
        url: '',
      },

      errorsObj: {
        name: '',
        selectedSubject: '',
        grade: '',
      },

      showError: false,
      hasUploaded: false,
      placeholder: '',
      showImageUpload: false,
      isAwaitingApiResponse: false,
      showConfirmPublicVisibilityModal: false,
      hasPrivateContentAccess,
      startSearch: false,
      isSuggestedImageUploading: false,
      inCropMode: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'currentLanguage']),
    ...mapGetters('currentQuiz', ['currentQuiz', 'hasPublicAccess']),
    ...mapGetters('contentEditor', ['quizId', 'isCloned', 'draftId', 'draft', 'quizPreferences', 'copyOfQuizPreferences', 'hasQuestions', 'hasDirtySlides', 'getImage', 'hasPublishedVersion', 'getCurriculum', 'chosenStandards', 'teleportedQuestions', 'isQuizNameChangedUsingHeaderInput', 'getVisibility', 'getSubjects', 'getGradeRange', 'getLanguage']),

    isCurrentDraftQuizPrivate() {
      return !this.draft.visibility;
    },

    isPromptToGameEnabled() {
      if (!this.isContentQuizType || (this.hasPublishedVersion && !this.isCloned) || !this.isDesktop) {
        return false;
      }

      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.CREATION_TO_GAME);
    },

    getAllSubjectsPreference() {
      const subjectsFromQuizPreferences = getSubjectFromPreferencesOrUserData(this.$user);
      const subjectsFromCurrentQuiz = this.getSubjects();
      const subjectsFromUserData = this.$user?.subjectTags ?? [];
      return Array.from(new Set([...subjectsFromQuizPreferences, ...subjectsFromCurrentQuiz, ...subjectsFromUserData]));
    },

    getSelectedSubjectPreference() {
      return this.getSubjects()[0] || getSubjectFromPreferencesOrUserData(this.$user)[0] || '';
    },

    getGradePreference() {
      return this.getGradeRangeFromCurrentQuiz(this.getGradeRange()) || getGradeFromPreferencesOrUserData(this.$user);
    },

    getLanguagePreference() {
      return this.getLanguage() ?? 'English';
    },

    visibilitiesList() {
      return Visibilities.map((visibility) => ({
        title: this.translationOfVisibility[visibility.title],
        value: visibility.isVisible,
        isSuper: !this.hasPrivateContentAccess && visibility.isSuper,
        forSuper: this.type === this.$constants.ContentType.QUIZ ? visibility.forSuperQuiz : visibility.forSuperPresentation,
      }));
    },

    translationOfVisibility() {
      return {
        'Public, visible to everyone': this.$i18n('Public, visible to everyone'),
        'Private, only visible to you': this.$i18n('Private, only visible to you'),
      };
    },

    getVisibilityPreference() {
      return this.getVisibility() ?? true;
    },
    isCorporate() {
      return this.$user.isCorporate;
    },

    isContentQuizType() {
      return this.type === this.$constants.ContentType.QUIZ;
    },

    isContentPresentationType() {
      return this.type === this.$constants.ContentType.PRESENTATION;
    },

    modalContainerClasses() {
      if (this.isCorporate) {
        return 'publish-modal-container-small';
      }
      return 'publish-modal-container-large';
    },

    getButton1Props() {
      return {
        title: this.$i18n('Cancel'),
        type: 'other',
        size: 'md',
        ariaLabel: this.$i18n('Cancel'),
      };
    },

    getButton2Props() {
      if (this.editMetadataMode || this.didClickSettings) {
        return {
          title: this.$i18n('Save'),
          type: 'primary',
          size: 'md',
          loading: this.isAwaitingApiResponse,
          ariaLabel: this.$i18n('Save'),
          dataCy: 'save-content-button-publish-modal',
        };
      }

      return {
        title: this.isPromptToGameEnabled
          ? this.$i18n('Save & Continue')
          : this.$i18n('Continue'),
        type: 'primary',
        size: 'md',
        loading: this.isAwaitingApiResponse,
        ariaLabel: this.$i18n('Continue'),
        dataCy: 'save-content-button-publish-modal',
      };
    },

    getDefaultName() {
      if (this.isContentQuizType) {
        return ContentDefaultName.QUIZ_NAME;
      }
      return ContentDefaultName.LESSON_NAME;
    },

    getQuizNameValue() {
      if (this.quizPreferences.name.trim() === this.getDefaultName) {
        return '';
      }
      return this.quizPreferences.name;
    },

    modalIcon() {
      if (this.didClickSettings || this.editMetadataMode) {
        return 'fa fa-cog';
      }
      return 'far fa-sparkles';
    },

    doesFormHaveErrors() {
      if (this.isCorporate) {
        delete this.errorsObj.grade;
        delete this.errorsObj.selectedSubject;
      }
      return Object.values(this.errorsObj).some((error) => error !== '');
    },

    getHeaderImage() {
      return this.isDesktop ? 'https://cf.quizizz.com/img/illustrations/Cards_V.png' : '';
    },
    isUserPaidOrg() {
      return !!this.$user.paidOrganization;
    },
    shouldUpdateQuiz() {
      return !this.hasPublishedVersion || (this.hasPublishedVersion && this.didClickSettings) || this.editMetadataMode;
    },

    isMediaImageVisible() {
      return !!this.mediaObj.url;
    },

    metaQuizData() {
      if (this.isQuizDraft) {
        return this.currentQuiz.draft;
      }

      return this.currentQuiz.info;
    },

    isQuizDraft() {
      return this.currentQuiz.hasDraftVersion;
    },

    metaSubject() {
      if (this.metaQuizData.subjects && this.metaQuizData.subjects.length) {
        return this.metaQuizData.subjects[0];
      }

      return '';
    },

    didUserChangeTheSettings() {
      let { grade } = this.quizPreferences;
      const { language, selectedSubject } = this.quizPreferences;
      const { grade: copyGrade, language: copyLanguage, selectedSubject: copySelectedSubject } = this.copyOfQuizPreferences;
      if (!Array.isArray(grade)) {
        grade = grade.split(',').map((grade) => Number(grade));
      }
      return !isEqual(grade, copyGrade) || language !== copyLanguage || selectedSubject !== copySelectedSubject;
    },
  },

  created() {
    let quizPref = {};

    if (this.editMetadataMode) {
      quizPref = {
        name: this.metaQuizData.name,
        grade: this.getGradeRangeFromCurrentQuiz(this.metaQuizData.grade),
        language: this.metaQuizData?.lang || '',
        visibility: this.hasPublicAccess,
        selectedSubject: this.metaSubject,
        image: this.metaQuizData.image,
      };
    } else {
      quizPref = {
        name: this.draft.name,
        subjects: this.getAllSubjectsPreference,
        grade: this.getGradePreference,
        language: this.getLanguagePreference,
        visibility: this.getVisibilityPreference,
        selectedSubject: this.getSelectedSubjectPreference,
        image: this.draft.image,
      };
    }

    this.$store.dispatch('contentEditor/setQuizPreferences', quizPref);

    // making a copy when the editor loads, for analytics
    this.$store.dispatch('contentEditor/setCopyOfQuizPreferences', quizPref);

    if (this.quizPreferences.image) {
      this.mediaObj = {
        url: this.quizPreferences.image,
      };
    }
    if (this.hasPublishedVersion && !this.didClickSettings && !this.editMetadataMode) {
      this.$emit('onAwaitPublish', true);
      if (this.hasQuestions) {
        this.handleBtn2Click();
      } else {
        this.$emit('onAwaitPublish', false);
        this.$emit('close');
        this.$eventBus.$emit('presentationEditor:showEmptyPresentationModal');
      }
    }
  },

  mounted() {
    HotjarService.triggerEvent(HotjarEvents.HOTJAR_PRECURSOR_PUBLISH_MODAL);

    // filter selected subjects from the list and append them to front of the list
    const filteredSelectedSubjects = this.sortedSubjectsList.filter((subject) => this.quizPreferences.subjects.includes(subject.value));
    const finalSortedSubjects = [...filteredSelectedSubjects, ...this.sortedSubjectsList.filter((subject) => !this.quizPreferences.subjects.includes(subject.value))];
    this.sortedSubjectsList = finalSortedSubjects;

    if (this.currentLanguage !== 'en') {
      const currentLangIndex = this.languagesList?.findIndex((lang) => lang.code === this.currentLanguage);
      const userLanguage = this.languagesList?.splice(currentLangIndex, 1)[0];
      this.languagesList.splice(1, 0, userLanguage); // Moving the current language as the second option
    }

    if (this.shouldUpdateQuiz) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.type, this.$webEvents.PRE_PUBLISH_MODAL_OPENED_V2);
      this.$analytics.logEvent(
        eventName,
        {
          source: this.editMetadataMode ? 'edit' : (this.didClickSettings ? 'settings' : 'save'),
          quizId: this.quizId,
        },
      );
    }

    this.handleFocus();
  },

  beforeUnmount() {
    this.inputFocusTimeout && clearTimeout(this.inputFocusTimeout);
  },

  methods: {

    truncateLength(entityList, value) {
      const truncatedEntity = entityList.find((entity) => entity.value === value);
      return truncatedEntity?.title?.length;
    },

    toggleCropModeOnImgModal() {
      this.inCropMode = !this.inCropMode;
      this.showImageUpload = !this.showImageUpload;
    },

    handleManualImageUpload(url) {
      this.mediaObj.url = url;
      this.$store.dispatch('contentEditor/setImage', url);
      if (this.$refs['image-search-modal']) {
        this.$refs['image-search-modal']?.close();
      }
    },

    handleDeleteImage() {
      this.mediaObj.url = '';
      this.handlePreferenceChange('image', '');
    },
    checkErrors() {
      if (this.quizPreferences.selectedSubject === '' && !this.isCorporate) {
        this.errorsObj.selectedSubject = this.$i18n('Please select the relevant subject');
      } else {
        this.errorsObj.selectedSubject = '';
      }

      if (this.quizPreferences.grade.length === 0 && !this.isCorporate) {
        this.errorsObj.grade = this.$i18n('Please select the relevant grade');
      } else {
        this.errorsObj.grade = '';
      }

      if (['', this.getDefaultName].includes(this.quizPreferences.name.trim())) {
        this.errorsObj.name = this.$i18n('Every {$1} deserves a name', [this.isContentQuizType ? 'quiz' : this.isCorporate ? 'presentation' : 'lesson']);
      } else if (this.quizPreferences.name.length < 4) {
        this.errorsObj.name = this.$i18n('Please enter atleast 4 characters');
      } else {
        this.errorsObj.name = '';
      }
    },

    handlePreferenceChange(preference, value) {
      if (preference === 'visibility') {
        if (this.isDesktop) {
          if (value && !this.hasPrivateContentAccess && this.isCurrentDraftQuizPrivate) {
            this.showConfirmPublicVisibilityModal = true;
          }
        } else if (!this.hasPrivateContentAccess && !value) {
          const type = this.isContentQuizType ? this.$constants.SuperUpsellTypes.PRIVATE_CONTENT_QUIZ : this.$constants.SuperUpsellTypes.PRIVATE_CONTENT_LESSON;
          const options = { feat: this.$constants.FeatureTypes.PRIVATE_CONTENT_QUIZ };
          this.$eventBus.$emit('superUpsell:show', { type, options });
          return;
        }
      } else if (preference === 'grade') {
        const { arrayValue: arr } = this.gradesList.find(({ value: val }) => val === value);

        this.$store.dispatch('contentEditor/setQuizPreference', { preference, value: arr });
        return;
      }
      this.$store.dispatch('contentEditor/setQuizPreference', { preference, value });
    },

    handleConfirmPublicVisibilityModalConfirm() {
      this.showConfirmPublicVisibilityModal = false;
    },

    handleConfirmPublicVisibilityModalClose() {
      this.showConfirmPublicVisibilityModal = false;
      this.$store.dispatch('contentEditor/setQuizPreference', { name: 'visibility', value: this.quizPreferences.visibility });
    },

    handleFocus() {
      if (this.quizPreferences.name !== '' && this.quizPreferences.name !== this.getDefaultName) {
        return;
      }
      this.inputFocusTimeout = setTimeout(() => {
        this.$refs?.['quiz-name-input']?.$refs?.input?.focus();
      }, 300);
    },

    imageUploadCallback(media) {
      this.showImageUpload = false;
      this.mediaObj.url = media.url;
      const eventName = this.$webEvents.getQuizEditorEvent(this.type, this.$webEvents.COVER_IMAGE_SELECTED);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        source: media.isGoogleSearchMode ? 'search' : 'upload',
      });
      this.handlePreferenceChange('image', media.url);
    },

    handleToggleImageModal() {
      this.inCropMode = false;
      if (!this.showImageUpload) {
        const eventName = this.$webEvents.getQuizEditorEvent(this.type, this.$webEvents.COVER_IMAGE_SELECT_BTN_CLICKED);
        this.$analytics.logEvent(eventName, {
          quizId: this.quizId,
        });
      }
      this.showImageUpload = !this.showImageUpload;
    },

    redirectOnPublish() {
      const { query } = this.$route;
      redirectOnLeavingEditor(query, `/admin/quiz/${this.quizId}?qcPublish=true`, this.$router, this.$store);
    },

    getGradeRangeFromCurrentQuiz(gradeRange) {
      if (gradeRange[0] === gradeRange[1]) {
        return gradeRange;
      }

      const groupGrade = Grades.find(({ val }) => val[0] === gradeRange[0] && val[1] === gradeRange[1]);

      if (groupGrade) {
        return groupGrade.val;
      }

      return [gradeRange[0], gradeRange[0]];
    },

    async handleBtn2Click() {
      // Check errors before updating quiz
      if (this.shouldUpdateQuiz) { this.checkErrors(); }
      if (this.doesFormHaveErrors) {
        return;
      }

      if (this.didUserChangeTheSettings) {
        const eventName = this.$webEvents.getQuizEditorEvent(this.type, this.$webEvents.PRE_PUBLISH_MODAL_DATA_CHANGED);
        this.$analytics.logEvent(eventName);
      }

      if (this.editMetadataMode) {
        this.isAwaitingApiResponse = true;

        const data = {
          name: this.quizPreferences.name,
          grade: this.quizPreferences.grade,
          lang: this.quizPreferences.language,
          image: this.mediaObj.url,
          visibility: this.quizPreferences.visibility,
          subjects: [this.quizPreferences.selectedSubject],
        };

        const response = await QuizService.quickEditMeta(this.isQuizDraft, data, this.currentQuiz?._id, this.currentQuiz?.draft?._id);

        if (!response.success) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Something went wrong while updating the quiz'),
          });
          if (get(response, 'error.response.data.error', null) === 'version.NOT_ALLOWED') {
            this.$eventBus.$emit('quizVersion:staleDraft', true);
          }
          this.$emit('close');
          return;
        }

        Object.entries(data).forEach(([key, value]) => {
          if (this.isQuizDraft) {
            this.$store.dispatch('currentQuiz/setDraftQuizMeta', { key, value });
          } else {
            this.$store.dispatch('currentQuiz/setPublishedQuizMeta', { key, value });
          }
        });

        this.isAwaitingApiResponse = true;

        this.$toasts.add({
          type: this.$constants.ToastTypes.SUCCESS,
          icon: 'fas fa-check-circle',
          title: this.$i18n('Yayy! Quiz updated successfully'),
        });

        this.$emit('close');
        return;
      }

      if (this.hasDirtySlides) {
        // Trigger autosave once if dirty slides are present
        await this.$store.dispatch('contentEditor/autoSave');
      }

      // Update quiz info before publish
      if (this.shouldUpdateQuiz) {
        const eventName = this.$webEvents.getQuizEditorEvent(this.type, this.$webEvents.PRE_PUBLISH_MODAL_SAVED_V2);
        this.$analytics.logEvent(eventName, {
          source: this.didClickSettings ? 'settings' : 'save',
          quizId: this.quizId,
        });

        this.isAwaitingApiResponse = true;
        let info = {};

        if (this.isCorporate) {
          info = {
            name: this.quizPreferences.name,
            subjects: [],
            lang: this.quizPreferences.language,
            grade: [],
            image: this.mediaObj.url,
            visibility: false,
          };
        } else {
          info = {
            name: this.quizPreferences.name,
            grade: this.quizPreferences.grade,
            image: this.mediaObj.url,
            lang: this.quizPreferences.language,
            visibility: this.quizPreferences.visibility,
            subjects: [this.quizPreferences.selectedSubject],
          };
        }

        await this.$store.dispatch('contentEditor/updateContentMetaInfo', { info });
        if (this.didClickSettings) {
          if (this.isContentQuizType) {
            this.$emit('onQuizUpdate');
          }
        }
        this.isAwaitingApiResponse = false;
      }

      // Clicked save, publish changes
      if (!this.didClickSettings) {
        this.isAwaitingApiResponse = true;

        const mostRecentSubject = this.quizPreferences.selectedSubject;
        const mostRecentGrade = this.quizPreferences.grade;
        this.$store.dispatch(
          'root/setUserQuizRecentSubject',
          mostRecentSubject,
        );
        this.$store.dispatch('root/setUserQuizRecentGrade', mostRecentGrade);

        // Delete quiz with no questions
        if (!this.hasQuestions) {
          const deleteResponse = await QuizService.deleteQuiz(this.quizId);
          if (deleteResponse.success) {
            this.$toasts.add({
              type: 'success',
              text: this.$i18n('Quiz deleted successfully'),
            });
            this.$router.push('/admin');
            return;
          }
          this.$toasts.add({
            type: 'danger',
            text: this.$i18n('Could not delete the quiz'),
          });
          return;
        }
        const response = await QuizService.publish(this.quizId, this.draftId);
        const eventName = this.$webEvents.getQuizEditorEvent(this.type, this.$webEvents.EDITOR_SAVE);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
            numErrors: 0,
          },
        );
        if (this.isCloned) {
          addSurvicateQueryParam(this.$router, this.$route.query, 'savedClonedQuiz');
        }
        if (response.success) {
          if (this.isUserPaidOrg && this.getCurriculum && this.chosenStandards.length) {
            this.isAwaitingApiResponse = true;
            let preferences = structuredClone(this.$user.preferences);
            const standards = get(this.$user, 'preferences.standards', {});
            this.chosenStandards.slice(0, 5).forEach((standard) => {
              standards[standard.short_code] = standard;
            });
            if (preferences.curriculum) {
              preferences.curriculum.default = this.getCurriculum._id;
              preferences.curriculum.standards = standards;
            } else {
              preferences = Object.assign(preferences, {
                curriculum: {
                  standards,
                },
              });
            }
            await UserAPIService.updateInfo({
              preferences,
            });
            this.isAwaitingApiResponse = false;
          }
          this.$store.dispatch('slideEditor/resetSlideEditor', {}, { root: true });

          if (this.isPromptToGameEnabled && !this.$user.isCorporate) {
            this.$eventBus.$emit('editor:promptGameModal');
            return;
          }

          this.redirectOnPublish();
        } else {
          if (get(response, 'error.response.data.error', null) === 'version.NOT_ALLOWED') {
            this.$eventBus.$emit('quizVersion:staleDraft', true);
          }
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Something went wrong while publishing this quiz!'),
          });
        }
      }
      this.isAwaitingApiResponse = false;
      this.$emit('onAwaitPublish', false);
      if (this.shouldUpdateQuiz) {
        this.$emit('close');
      }
    },

    handleGoogleSearch() {
      this.showGoogleSearchModal = !this.showGoogleSearchModal;
    },
  },
};

/**
 * Use this store to make reactive changes accross components which are not in hierarchy
 * This will avoid usage of event bus and makes it easier to track changes via logger for debugging
 */

import Constants from '~/config/Constants';
import MutationTypes from '~/config/MutationTypes';

import SuggestionService from '~/services/SuggestionService';

export const state = () => ({
  dashboard: {
    isContentCreationModalVisible: false,
    isContentPublishModalVisible: false,
  },
  slidesBulkImport: {
    isShowing: false,
  },
  googleFormsImport: {
    isShowing: false,
    shouldPublish: false,
  },
  pdfImport: {
    isImported: false,
    editAfterImportEventSent: false,
  },
  bottomProgressPopUp: {
    isShowing: false,
    isInProgress: true,
    hasErrored: false,
    title: 'Progress bar title',
    subtitle: 'Progress bar subtitle',
    blacklistRoutes: ['/admin/corporate?imported=true', '/admin/private?imported=true'],
    current: 0,
    maxValue: 1,
    onCancel: () => { },

    successBtnConfig: {
      title: 'View',
      click: () => { },
    },

    errorBtnConfig: {
      title: 'View',
      click: () => { },
    },

    pollOn: () => { },
    pollTime: Constants.BulkImport.POLL_TIME,
  },

  qfwModal: {
    showModal: false,
    createGroupModal: false,
  },
  qfwEventType: '',
  questionsInCart: [],
  shouldShowAddToCartHint: true,

  libraryView: {
    showBulkImportProgress: false,
    currentProgress: 0,
  },

  errorModalConfig: {
    isShowing: false,
    title: 'Some error',
    subtitlle: 'Issue for error',
    errors: [
      {
        title: 'Caused error 1',
        hasFailed: true,
        description: 'some description',
      },
      {
        title: 'Caused error 1',
        hasFailed: true,
        description: 'some description',
      },
      {
        title: 'Caused error 1',
        hasFailed: false,
      },
    ],
  },

  // communication between blank plugin and interactive blank editor
  blankOptionEditor: {
    /**
       * has current values for a blank vs it's blank id
       * [blank-id]: text
       */
    blankDetails: {},
    /**
       * has current option vs it's blank id
       * [blank-id]: option
       */
    finalOptions: {},
    /**
       * blank details history cache
       * Maintains all changes done in blank details
       */
    blankDetailsHistory: {},
  },

  questionEditor: {
    saveErrors: [],

    hotspot: {
      type: null,
      showMarkAsDoneCta: false,
    },

    dndImage: {
      focusOnOption: null,
      showEducation: false,
    },

    fib: {
      isSettingsModalOpen: false,
      alternativeAnswersEnabled: false,
      BoxSettingDisabledConditions: {
        forAlternativeAns: false,
        forLanguageSupport: false,
        forMaxLength: false,
      },
    },
  },
  onShowSearchBarQuizPage: false,

  sidebarConfig: {
    isCollapsed: false,
    expandOnContent: false,
  },
  isValidMathEquation: false,
  isNotifyMeClicked: false,
  shouldShowQuestionPreview: false,

  showMcqBannerOnQtypesList: true,

  quizGen: {
    isShowing: false,
    isLoading: false,
    hasError: false,
    isGenerated: false,
    loaderStatus: 0,
    meta: {
      quizId: '',
      topic: '',
      subject: '',
      grade: '',
      numberOfQuestions: '',
      draftId: '',
    },
  },

  quizEditorDisplayType: 'full',
});

export const getters = {
  quizEditorDisplayType(state) {
    return state.quizEditorDisplayType;
  },

  shouldShowQuestionPreview(state) {
    return state.shouldShowQuestionPreview;
  },

  isContentCreationModalVisible(state) {
    return state.dashboard.isContentCreationModalVisible;
  },

  isContentPublishModalVisible(state) {
    return state.dashboard.isContentPublishModalVisible;
  },
  isFileImported(state) {
    return state.pdfImport.isImported;
  },

  isEditAfterImportEventSent(state) {
    return state.pdfImport.editAfterImportEventSent;
  },

  showErrorLogModal(state) {
    return state.errorModalConfig.isShowing;
  },

  isBulkImportModalShowing(state) {
    return state.slidesBulkImport.isShowing;
  },

  isImportFormsShowing(state) {
    return state.googleFormsImport.isShowing;
  },

  shouldPublishImportForm(state) {
    return state.googleFormsImport.shouldPublish;
  },

  isBottomProgressPopUpShowing(state) {
    return state.bottomProgressPopUp.isShowing;
  },

  bottomProgressState(state) {
    return state.bottomProgressPopUp;
  },

  errorModalConfig(state) {
    return state.errorModalConfig;
  },

  qfwModalState(state) {
    return state.qfwModal.showModal;
  },

  qfwCreateGroupModalState(state) {
    return state.qfwModal.createGroupModal;
  },

  qfwEventState(state) {
    return state.qfwEventType;
  },

  shouldShowLibraryBulkProgress(state) {
    return state.libraryView.showBulkImportProgress;
  },

  libraryBulkImportProgress(state) {
    return state.libraryView.currentProgress;
  },

  questionsInCart(state) {
    return state.questionsInCart;
  },

  shouldShowAddToCartHint(state) {
    return state.shouldShowAddToCartHint;
  },

  numberOfBlanks(state) {
    return Object.keys(state.blankOptionEditor.blankDetails).length;
  },

  currentBlankValues(state) {
    return state.blankOptionEditor.blankDetails;
  },

  previousBlankValues(state) {
    return state.blankOptionEditor.blankDetailsHistory;
  },

  finalOptionsForBlankQuestion(state) {
    return state.blankOptionEditor.finalOptions;
  },

  keyPressInBlank(state) {
    return state.blankOptionEditor.keypress;
  },

  isShowingSearchBarQuizPage(state) {
    return state.onShowSearchBarQuizPage;
  },

  editorSaveValidations(state) {
    return state.questionEditor.saveErrors;
  },

  // sidebar
  isSidebarCollapsed(state) {
    return state.sidebarConfig.isCollapsed;
  },

  isSidebarExpandedOnContent(state) {
    return state.sidebarConfig.expandOnContent;
  },

  isValidMathEquation(state) {
    return state.isValidMathEquation;
  },

  hotspotType(state) {
    return state.questionEditor.hotspot.type;
  },

  hotspotShowMarkAsDoneCta(state) {
    return state.questionEditor.hotspot.showMarkAsDoneCta;
  },

  focussedOptionInDndImage(state) {
    return state.questionEditor.dndImage.focusOnOption;
  },

  shouldShowEducationInDndImage(state) {
    return state.questionEditor.dndImage.showEducation;
  },

  isNotifyMeClicked(state) {
    return state.isNotifyMeClicked;
  },

  showMcqBannerOnQtypesList(state) {
    return state.showMcqBannerOnQtypesList;
  },

  quizGenShowing(state) {
    return state.quizGen.isShowing;
  },

  quizGenLoading(state) {
    return state.quizGen.isLoading;
  },

  quizGenLoaderStatus(state) {
    return state.quizGen.loaderStatus;
  },

  quizGenGenerated(state) {
    return state.quizGen.isGenerated;
  },

  quizGenError(state) {
    return state.quizGen.hasError;
  },

  quizGenMeta(state) {
    return state.quizGen.meta;
  },

  isFIBSettingsModalOpen(state) {
    return state.questionEditor.fib.isSettingsModalOpen;
  },

  isFIBalternativeAnswersEnabled(state) {
    return state.questionEditor.fib.alternativeAnswersEnabled;
  },

  isFIBBoxSettingDisabledWhenAlternativeEnabled(state) {
    return state.questionEditor.fib.BoxSettingDisabledConditions.forAlternativeAns;
  },

  isFIBBoxSettingDisabledWhenLangIsNotSupported(state) {
    return state.questionEditor.fib.BoxSettingDisabledConditions.forLanguageSupport;
  },

  isFIBBoxSettingDisabledWhenExceedsMaxLength(state) {
    return state.questionEditor.fib.BoxSettingDisabledConditions.forMaxLength;
  },
};

export const mutations = {
  [MutationTypes.uiManager.SET_QUIZ_EDITOR_DISPLAY_TYPE](state, payload) {
    state.quizEditorDisplayType = payload.quizEditorDisplayType;
  },

  [MutationTypes.uiManager.TOGGLE_QUESTION_PREVIEW_ON_EDITOR](state, payload) {
    state.shouldShowQuestionPreview = payload.shouldShowQuestionPreview;
  },

  [MutationTypes.uiManager.TOGGLE_CONTENT_CREATION_MODAL](state) {
    state.dashboard.isContentCreationModalVisible = !state.dashboard.isContentCreationModalVisible;
  },

  [MutationTypes.uiManager.TOGGLE_CONTENT_PUBLISH_MODAL](state) {
    state.dashboard.isContentPublishModalVisible = !state.dashboard.isContentPublishModalVisible;
  },

  [MutationTypes.uiManager.TOGGLE_PDF_IMPORT](state, payload) {
    state.pdfImport.isImported = payload.isPdfImported;
    if (payload.isPdfImported === true) {
      state.pdfImport.editAfterImportEventSent = false;
    }
  },

  [MutationTypes.uiManager.TOGGLE_EDIT_AFTER_IMPORT_EVENT](state, payload) {
    state.pdfImport.editAfterImportEventSent = payload.editAfterImportEventSent;
  },

  [MutationTypes.uiManager.TOGGLE_BULK_IMPORT](state) {
    state.slidesBulkImport.isShowing = !state.slidesBulkImport.isShowing;
  },

  [MutationTypes.uiManager.TOGGLE_FORMS_IMPORT](state, payload) {
    if (payload?.isShowing) {
      state.googleFormsImport.isShowing = payload.isShowing;
    } else {
      state.googleFormsImport.isShowing = !state.googleFormsImport.isShowing;
    }
    state.googleFormsImport.shouldPublish = payload?.publish ?? false;
  },

  [MutationTypes.uiManager.TOGGLE_BOTTOM_PROGRESS_POPUP](state) {
    state.bottomProgressPopUp = !state.bottomProgressPopUp.isShowing;
  },

  [MutationTypes.uiManager.TOGGLE_LOG_ERROR_MODAL](state) {
    state.errorModalConfig.isShowing = !state.errorModalConfig.isShowing;
  },

  [MutationTypes.uiManager.TOGGLE_QFW_MODAL](state) {
    state.qfwModal.showModal = !state.qfwModal.showModal;
  },

  [MutationTypes.uiManager.SET_HOTSPOT_TYPE](
    state,
    type = Constants.HOTSPOT_TYPES.CIRCLE,
  ) {
    state.questionEditor.hotspot.type = type;
  },

  [MutationTypes.uiManager.SET_HOTSPOT_MARK_AS_DONE_CTA](state, shouldShow) {
    state.questionEditor.hotspot.showMarkAsDoneCta = shouldShow;
  },

  [MutationTypes.uiManager.SET_DND_IMAGE_OPTION_FOCUS](state, optionId) {
    state.questionEditor.dndImage.focusOnOption = optionId;
  },

  [MutationTypes.uiManager.TOGGLE_DND_IMAGE_EDUCATION](state, shouldShow) {
    state.questionEditor.dndImage.showEducation = shouldShow;
  },

  [MutationTypes.uiManager.TOGGLE_QFW_GROUP_MODAL](state) {
    state.qfwModal.createGroupModal = !state.qfwModal.createGroupModal;
  },

  [MutationTypes.uiManager.QFW_EVENT_TYPE](state, payload) {
    state.qfwEventType = payload.event;
  },

  [MutationTypes.uiManager.TOGGLE_LIBRARY_VIEW_PROGRESS_BAR](
    state,
    shouldShow = !state.libraryView.showBulkImportProgress,
  ) {
    state.libraryView.showBulkImportProgress = shouldShow;
  },

  [MutationTypes.uiManager.SET_EDITOR_VALIDATIONS](state, errors) {
    state.questionEditor.saveErrors = errors;
  },

  [MutationTypes.uiManager.TOGGLE_VISIBLITY_SEARCH_BAR_QUIZ_PAGE](
    state,
    shouldShow = false,
  ) {
    state.onShowSearchBarQuizPage = shouldShow;
  },

  [MutationTypes.uiManager.EDIT_BOTTOM_PROGRESS_POPUP](state, payload) {
    Object.keys(payload).forEach((key) => {
      state.bottomProgressPopUp[key] = payload[key];
    });
  },

  [MutationTypes.uiManager.EDIT_LOG_ERROR_MODAL_CONFIG](state, payload) {
    Object.keys(payload).forEach((key) => {
      state.errorModalConfig[key] = payload[key];
    });
  },

  [MutationTypes.uiManager.EDIT_LIBRARY_VIEW_CONFIG](state, payload) {
    Object.keys(payload).forEach((key) => {
      state.libraryView[key] = payload[key];
    });
  },

  [MutationTypes.uiManager.ADD_QUESTION_TO_CART](state, question) {
    state.questionsInCart.push(question);
  },

  [MutationTypes.uiManager.ADD_ALL_QUESTIONS_TO_CART](state, questions) {
    state.questionsInCart.push(...questions);
  },

  [MutationTypes.uiManager.DELETE_QUESTION_FROM_CART](state, questionIndex) {
    state.questionsInCart = state.questionsInCart.filter((question, index) => index !== questionIndex);
  },

  [MutationTypes.uiManager.RESET_QUESTIONS_FROM_CART](state) {
    state.questionsInCart = [];
  },

  [MutationTypes.uiManager.HIDE_ADD_TO_CART_HINT](state) {
    state.shouldShowAddToCartHint = false;
  },

  [MutationTypes.uiManager.SET_CURRENT_BLANK_VALUE](state, values) {
    values.forEach(({ blankId, value, hasMath = false }) => {
      state.blankOptionEditor.blankDetails[blankId] = {
        value,
        hasMath,
      };
      state.blankOptionEditor.blankDetailsHistory[blankId] = {
        value,
        hasMath,
      };
    });
  },

  [MutationTypes.uiManager.SET_FINAL_OPTIONS_FOR_BLANK_QUESTION](state, payload) {
    state.blankOptionEditor.finalOptions = payload;
  },

  [MutationTypes.uiManager.RESET_BLANK_EDITOR_CONFIG](state) {
    state.blankOptionEditor = {
      blankDetails: {},
      finalOptions: {},
      blankDetailsHistory: {},
    };
  },

  [MutationTypes.uiManager.DELETE_BLANK_ID_FROM_VALUES](state, blankIds) {
    const blankIdValues = { ...state.blankOptionEditor.blankDetails };

    blankIds.forEach((blankId) => {
      delete blankIdValues[blankId];
    });

    state.blankOptionEditor.blankDetails = blankIdValues;
  },

  [MutationTypes.uiManager.DELETE_BLANK_ID_FROM_FINAL_OPTIONS](state, blankIds) {
    const finalOptionsForBlankQuestion = { ...state.blankOptionEditor.finalOptions };

    blankIds.forEach((blankId) => {
      delete finalOptionsForBlankQuestion[blankId];
    });

    state.blankOptionEditor.finalOptions = finalOptionsForBlankQuestion;
  },

  [MutationTypes.uiManager.DELETE_BLANK_ID_FROM_CONFIG](state, blankIds) {
    const blankIdValues = { ...state.blankOptionEditor.blankDetails };
    const finalOptionsForBlankQuestion = { ...state.blankOptionEditor.finalOptions };

    blankIds.forEach((blankId) => {
      delete blankIdValues[blankId];
      delete finalOptionsForBlankQuestion[blankId];
    });

    state.blankOptionEditor.blankDetails = blankIdValues;
    state.blankOptionEditor.finalOptions = finalOptionsForBlankQuestion;
  },

  [MutationTypes.uiManager.SHOULD_COLLAPSE_SIDEBAR](state, { shouldCollapse, expandOnContent }) {
    state.sidebarConfig.isCollapsed = shouldCollapse;
    state.sidebarConfig.expandOnContent = expandOnContent;
  },

  [MutationTypes.uiManager.SET_IS_VALID_MATH_EQUATION](state, payload) {
    state.isValidMathEquation = payload;
  },

  [MutationTypes.uiManager.SET_NOTIFY_ME_CTA](state, payload) {
    state.isNotifyMeClicked = payload;
  },

  [MutationTypes.uiManager.SET_MCQ_BANNER_VISIBILITY](state, payload) {
    state.showMcqBannerOnQtypesList = payload;
  },

  [MutationTypes.uiManager.SET_QUIZ_GEN_DATA](state, payload) {
    for (const [key, value] of Object.entries(payload)) {
      state.quizGen[key] = value;
    }
  },

  [MutationTypes.uiManager.RESET_QUIZ_GEN_DATA](state) {
    state.quizGen = {
      isShowing: false,
      isLoading: false,
      hasError: false,
      isGenerated: false,
      loaderStatus: 0,
      meta: {
        quizId: '',
        topic: '',
        subject: '',
        grade: '',
        numberOfQuestions: '',
        draftId: '',
      },
    };
  },

  [MutationTypes.uiManager.TOGGLE_FIB_SETTINGS_MODAL](state, payload) {
    state.questionEditor.fib.isSettingsModalOpen = payload;
  },

  [MutationTypes.uiManager.TOGGLE_FIB_ALTERNATIVE_ANSWER_SETTING](state, payload) {
    state.questionEditor.fib.alternativeAnswersEnabled = payload;
  },

  [MutationTypes.uiManager.TOGGLE_FIB_BOX_SETTING_DISABLED](state, payload) {
    state.questionEditor.fib.BoxSettingDisabledConditions[payload.condition] = payload.value;
  },
};

export const actions = {
  setQuizEditorDisplayType({ commit }, payload) {
    commit(MutationTypes.uiManager.SET_QUIZ_EDITOR_DISPLAY_TYPE, payload);
  },

  toggleQuestionPreviewOnEditor({ commit }, payload) {
    commit(MutationTypes.uiManager.TOGGLE_QUESTION_PREVIEW_ON_EDITOR, payload);
  },

  toggleContentCreationModal({ commit }) {
    commit(MutationTypes.uiManager.TOGGLE_CONTENT_CREATION_MODAL);
  },

  toggleContentPublishModal({ commit }) {
    commit(MutationTypes.uiManager.TOGGLE_CONTENT_PUBLISH_MODAL);
  },

  togglePdfImport({ commit }, payload) {
    commit(MutationTypes.uiManager.TOGGLE_PDF_IMPORT, payload);
  },

  toggleEditAfterImportEvent({ commit }, payload) {
    commit(MutationTypes.uiManager.TOGGLE_EDIT_AFTER_IMPORT_EVENT, payload);
  },

  toggleBulkImport({ commit }) {
    commit(MutationTypes.uiManager.TOGGLE_BULK_IMPORT);
  },

  toggleGoogleFormsImport({ commit }, payload) {
    commit(MutationTypes.uiManager.TOGGLE_FORMS_IMPORT, payload);
  },

  toggleBottomProgressPopUp({ commit }) {
    commit(MutationTypes.uiManager.TOGGLE_BOTTOM_PROGRESS_POPUP);
  },

  toggleLogErrorModal({ commit }) {
    commit(MutationTypes.uiManager.TOGGLE_LOG_ERROR_MODAL);
  },

  toggleQfwModal({ commit }) {
    commit(MutationTypes.uiManager.TOGGLE_QFW_MODAL);
  },

  toggleQfwCreateGroupModal({ commit }) {
    commit(MutationTypes.uiManager.TOGGLE_QFW_GROUP_MODAL);
  },

  changeQfwEvent({ commit }, payload) {
    commit(MutationTypes.uiManager.QFW_EVENT_TYPE, payload);
  },

  toggleLibraryProgress({ commit }, shouldShow) {
    commit(MutationTypes.uiManager.TOGGLE_LIBRARY_VIEW_PROGRESS_BAR, shouldShow);
  },

  toggleFIBSettingsModal({ commit }, payload) {
    commit(MutationTypes.uiManager.TOGGLE_FIB_SETTINGS_MODAL, payload);
  },

  toggleFIBAlternativeAnswerSetting({ commit }, payload) {
    commit(MutationTypes.uiManager.TOGGLE_FIB_ALTERNATIVE_ANSWER_SETTING, payload);
  },

  toggleFIBBoxSettingDisabled({ commit }, payload) {
    commit(MutationTypes.uiManager.TOGGLE_FIB_BOX_SETTING_DISABLED, payload);
  },

  setBottomProgressPopUpConfig({ commit }, payload) {
    commit(MutationTypes.uiManager.EDIT_BOTTOM_PROGRESS_POPUP, payload);
  },

  setLogErrorModalConfig({ commit }, payload) {
    commit(MutationTypes.uiManager.EDIT_LOG_ERROR_MODAL_CONFIG, payload);
  },

  seLibraryViewConfig({ commit }, payload) {
    commit(MutationTypes.uiManager.EDIT_LIBRARY_VIEW_CONFIG, payload);
  },

  addQuestionToCart({ commit }, payload) {
    commit(MutationTypes.uiManager.ADD_QUESTION_TO_CART, payload);
  },

  addAllQuestionsToCart({ commit }, payload) {
    commit(MutationTypes.uiManager.ADD_ALL_QUESTIONS_TO_CART, payload);
  },

  deleteQuestionFromCart({ commit }, payload) {
    commit(MutationTypes.uiManager.DELETE_QUESTION_FROM_CART, payload);
  },

  resetQuestionsFromCart({ commit }) {
    commit(MutationTypes.uiManager.RESET_QUESTIONS_FROM_CART);
  },

  hideAddToCartHint({ commit }) {
    commit(MutationTypes.uiManager.HIDE_ADD_TO_CART_HINT);
  },

  setBlankValue({ commit }, values = []) {
    commit(MutationTypes.uiManager.SET_CURRENT_BLANK_VALUE, values);
  },

  setFinalBlankOptions({ commit }, options) {
    commit(MutationTypes.uiManager.SET_FINAL_OPTIONS_FOR_BLANK_QUESTION, options);
  },

  resetBlankOptionEditorConfig({ commit }) {
    commit(MutationTypes.uiManager.RESET_BLANK_EDITOR_CONFIG);
  },

  deleteBlankIdsFromValues({ commit }, blankIds = []) {
    commit(MutationTypes.uiManager.DELETE_BLANK_ID_FROM_VALUES, blankIds);
  },

  deleteBlankIdsFromFinalOptions({ commit }, blankIds = []) {
    commit(MutationTypes.uiManager.DELETE_BLANK_ID_FROM_FINAL_OPTIONS, blankIds);
  },

  deleteBlankIdsFromConfig({ commit }, blankIds = []) {
    commit(MutationTypes.uiManager.DELETE_BLANK_ID_FROM_CONFIG, blankIds);
  },

  onShowSearchBarQuizPage({ commit }, shouldShow) {
    commit(MutationTypes.uiManager.TOGGLE_VISIBLITY_SEARCH_BAR_QUIZ_PAGE, shouldShow);
  },

  setQuestionEditorValidations({ commit }, errors = []) {
    commit(MutationTypes.uiManager.SET_EDITOR_VALIDATIONS, errors);
  },

  // sidebar actions
  shouldCollapseSidebar({ commit }, { shouldCollapse = false, expandOnContent = false }) {
    commit(MutationTypes.uiManager.SHOULD_COLLAPSE_SIDEBAR, { shouldCollapse, expandOnContent });
  },

  setIsValidMathEquation({ commit }, payload) {
    commit(MutationTypes.uiManager.SET_IS_VALID_MATH_EQUATION, payload);
  },

  setHotspotType({ commit }, type) {
    commit(MutationTypes.uiManager.SET_HOTSPOT_TYPE, type);
  },

  setHotspotMarkAsDoneCta({ commit }, shouldShow = false) {
    commit(MutationTypes.uiManager.SET_HOTSPOT_MARK_AS_DONE_CTA, shouldShow);
  },

  setDndImageOptionFocus({ commit }, optionId) {
    commit(MutationTypes.uiManager.SET_DND_IMAGE_OPTION_FOCUS, optionId);
  },

  toggleEducationForDndImage({ commit }, shouldShow = false) {
    commit(MutationTypes.uiManager.TOGGLE_DND_IMAGE_EDUCATION, shouldShow);
  },

  setIsNotifyMeClicked({ commit }, payload) {
    commit(MutationTypes.uiManager.SET_NOTIFY_ME_CTA, payload);
  },

  setMcqBannerVisibility({ commit }, payload) {
    commit(MutationTypes.uiManager.SET_MCQ_BANNER_VISIBILITY, payload);
  },

  setQuizGenData({ commit }, payload) {
    commit(MutationTypes.uiManager.SET_QUIZ_GEN_DATA, payload);
  },

  resetQuizGenData({ commit }) {
    commit(MutationTypes.uiManager.RESET_QUIZ_GEN_DATA);
  },

  async generateQuiz({ commit }, payload) {
    const {
      meta: {
        topic, subject, grade, numberOfQuestions, draftId, quizId,
      },
    } = payload;
    let progressRemaining = 0;
    const progressBarInterval = setInterval(() => {
      progressRemaining += 1;
      commit(MutationTypes.uiManager.SET_QUIZ_GEN_DATA, { loaderStatus: progressRemaining });
      if (progressRemaining >= 100) {
        clearInterval(progressBarInterval);
      }
    }, 500);
    commit(MutationTypes.uiManager.SET_QUIZ_GEN_DATA, {
      isLoading: true,
      isShowing: true,
      meta: {
        topic, subject, grade, numberOfQuestions, draftId, quizId,
      },
    });
    const response = await SuggestionService.generateQuestions({
      topic, subject, grade, numberOfQuestions, draftId,
    });
    if (progressBarInterval) {
      clearInterval(progressBarInterval);
    }
    if (response.success) {
      commit(MutationTypes.uiManager.SET_QUIZ_GEN_DATA, { isGenerated: true, isLoading: false, hasError: false });
    } else {
      commit(MutationTypes.uiManager.SET_QUIZ_GEN_DATA, { hasError: true, isLoading: false });
    }
  },

};

const uiManagerStore = {
  state,
  getters,
  mutations,
  actions,
};

export default uiManagerStore;

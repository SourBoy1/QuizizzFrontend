import Constants from '~/config/Constants.js';
import { isNonProd, isCustomLoggingEnabled } from './EnvUtils.js';
import breadcrumb from './breadcrumb.js';

// vuex logger with special powers

const disallowedMutations = [
  'setTranslations',
  'DO_CLIENT_INITIATION',
  'SET_DEVICE_PROPERTIES',
  'SET_DEVICE_INFO',
  'serverData',
  'user',
  'setLifecycleData',
  'pushFont',
  'analyticsManager/setAnalyticsData',
  'contentEditor/SET_SUBJECT_FOR_GENERATED_OPTIONS',
  'contentEditor/SET_ALL_SLIDES_DIRTY',
  'SET_USER_REGION',
  'contentEditor/SET_QUIZ',
  'contentEditor/SET_QUIZ_WITHOUT_DRAFTS',
  'contentEditor/SET_QUIZ',
  'contentEditor/SET_HIDE_MEDIA',
  'contentEditor/SET_HIDE_TEXT_CONTAINER',
  'slideEditor/UPDATE_QUESTION_ANSWER',
  'slideEditor/SET_GRAPH_COMPONENT_READY',
  'uiManager/SET_EDITOR_VALIDATIONS',
  'contentEditor/SET_HIDE_TEXT_CONTAINER',
  'slideEditor/SET_OPTION_GENERATOR_TOKENS',
  'slideEditor/SET_OPTION_GENERATOR_LOG_PROBS',
  'contentEditor/SET_QUESTION_EDITOR_DIMENSIONS',
  'slideEditor/SET_PARAMETER_VERSION',
  'slideEditor/SET_SELECTED_ELEMENT',
  'uiManager/SHOULD_COLLAPSE_SIDEBAR',
];

const disallowedActions = [
  'nuxtClientInit',
  'getRenderMetaData',
  'setDeviceProperties',
  'setDeviceInfoFromClient',
  'createGlobalFunctions',
  'pushFont',
  'setLifecycleData',
  'analyticsManager/setAnalyticsData',
  'contentEditor/setQuiz',
  'setUserRegion',
  'setHelpButtonOffset',
  'setHelpButtonTheme',
  'setHelpButtonZIndex',
  'analyticsManager/addQuestionInstanceEnrichmentData',
  'setUser',
  'contentEditor/setHideMedia',
  'contentEditor/setHideTextContainer',
  'slideEditor/updateQuestionHistory',
  'action: slideEditor/onCurrentSlideUpdate',
  'slideEditor/updateQuestionAnswer',
  'slideEditor/setGraphComponentReady',
  'uiManager/setQuestionEditorValidations',
  'contentEditor/setHideTextContainer',
  'slideEditor/onCurrentSlideUpdate',
  'contentEditor/setQuestionEditorDimensions',
  'uiManager/shouldCollapseSidebar',
];

// to bypass the eslint warning
const logger = console;

const parseObserver = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    return obj;
  }
};

// helps you inspect the state between UI interactions
const handleStoreInactivity = () => {
  let wasRunning = false;
  let runningTimer = null;
  const logInactivity = () => {
    wasRunning = true;
    clearTimeout(runningTimer);
    runningTimer = setTimeout(() => {
      if (wasRunning) {
        logger.log('%c ************ store idle ************', 'color: red; font-size: 16px');
        wasRunning = false;
      }
    }, 500);
  };
  return logInactivity;
};
const logInactivity = handleStoreInactivity();

const mutationsLogger = (store) => {
  store.subscribe((mutation, state) => {
    if (!mutation) {
      return;
    }
    const loggingDisabled = disallowedMutations.includes(mutation.type) || mutation.type.toLowerCase().includes('tiptap') || mutation.type.toUpperCase().includes('HELP_BUTTON') || mutation.type.toLowerCase().includes('analytics');
    if (!loggingDisabled) {
      logInactivity();
      const stateKey = mutation.type.split('/')[0];
      logger.group(`%c mutation: ${mutation.type}`, 'color: #c41bf7');
      logger.log('%c payload:', 'color: #19800e', parseObserver(mutation.payload));
      logger.log('%c state:', 'color: #19800e', parseObserver(state[stateKey]));
      logger.log('%c root state:', 'color: #19800e', state);
      logger.groupEnd();
    }
  });
};

const actionsLogger = (store) => {
  // no array function for better trace
  // eslint-disable-next-line space-before-function-paren
  store.subscribeAction((action, state) => {
    if (!action) {
      return;
    }
    const loggingDisabled = disallowedActions.includes(action.type) || action.type.toLowerCase().includes('tiptap') || action.type.toLowerCase().includes('analytics');
    if (!loggingDisabled) {
      logInactivity();
      const stateKey = action.type.split('/')[0];
      logger.groupCollapsed(`%c action: ${action.type}`, 'color: #03A9F4');
      logger.log('%c payload:', 'color: #19800e', parseObserver(action.payload));
      logger.log('%c state:', 'color: #19800e', parseObserver(state[stateKey]));
      logger.log('%c root state:', 'color: #19800e', state);
      // find out "Who Updated My Store"
      logger.groupCollapsed('%c call-stack of action', 'color: #9c5c19');
      logger.trace();
      logger.groupEnd();

      logger.groupEnd();
    }
  });
};

const allowedActionsBreadcrumb = [
  'contentEditor/saveQuizQuestion',
  'contentEditor/createQuizQuestion',
  'contentEditor/updateQuizQuestionWithoutDrafts',
  'contentEditor/updateQuizQuestion',
  'currentQuiz/updateQuestion',
  'contentEditor/addNewSlide',
  'slideEditor/resetSlideEditor',
];

const actionsBreadcrumb = (store) => {
  store.subscribe((action, state) => {
    if (!action) {
      return;
    }
    if (state.contentEditor.quiz.type !== Constants.ContentType.QUIZ) {
      return;
    }
    const loggingDisabled = !allowedActionsBreadcrumb.includes(action.type) || action.type.toLowerCase().includes('tiptap') || action.type.toUpperCase().includes('HELP_BUTTON') || action.type.toLowerCase().includes('analytics');
    if (!loggingDisabled) {
      breadcrumb().addAction(action.type);
    }
  });
};

const disallowedMutationsBreadcrumb = [
  'slideEditor/UPDATE_QUESTION_OPTIONS',
];

const mutationsBreadcrumb = (store) => {
  store.subscribe((mutation, state) => {
    if (!mutation) {
      return;
    }
    if (state.contentEditor.quiz.type !== Constants.ContentType.QUIZ) {
      return;
    }
    const loggingDisabled = disallowedMutationsBreadcrumb.includes(mutation.type) || mutation.type.toLowerCase().includes('tiptap') || mutation.type.toUpperCase().includes('HELP_BUTTON') || mutation.type.toLowerCase().includes('analytics');
    if (!loggingDisabled) {
      breadcrumb().addMutation(mutation.type);
    }
  });
};

const contentLogger = (store) => {
  actionsBreadcrumb(store);
  mutationsBreadcrumb(store);
  if (isCustomLoggingEnabled() && isNonProd()) {
    mutationsLogger(store);
    actionsLogger(store);
  }
};

export default contentLogger;

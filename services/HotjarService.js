import CookieService from './CookieService';
import QLogger from './QLogger';

function getSignupType(user) {
  if (user?.userStore?.microsoft) {
    return 'microsoft';
  } if (user?.userStore?.google) {
    return 'google';
  } if (user?.userStore?.local?.phoneNumber) {
    return 'mobile';
  } if (user?.local?.email) {
    return 'email';
  }
  return '';
}
export default class HotjarService {
  static setUserAttributes(user) {
    if (!user.id || !window.hj) {
      return;
    }
    if (user.id && window.hj) {
      const signupType = getSignupType(user);

      window.hj('identify', user?.id, {
        user_id: user?.id,
        occupation: user?.occupation,
        country: user?.country,
        plan: user?.currentPlanStatus?.status,
        createdAt: user?.createdAt,
        organizationId: user?.organization,
        studentUnderage: user?.userStore?.student?.underage,
        paidOrganization: user?.paidOrganization,
        organizationRole: user?.organizationRole,
        experiment: CookieService.get('QUIZIZZ_EXP_NAME'),
        signupType,
      });
    }
  }

  static triggerEvent(eventName) {
    QLogger.log('\n HotjarService logEvent:', eventName); // use hjDebug=1 as query param to turn on debugger mode
    if (window.hj) {
      window.hj('event', eventName);
    }
  }
}

function getHotjarEventWithExperiment(event) {
  return `${event}_${CookieService.get('QUIZIZZ_EXP_NAME')}`;
}

export const HotjarEvents = {
  // Hotjar Events

  // The final event name will be '<event_name>_<experiment_name>'
  // example - admin_dashboard_visit_main_main

  HOTJAR_ADMIN_DASHBOARD_VISIT: getHotjarEventWithExperiment('admin_dashboard_visit'),
  HOTJAR_QFW_ADMIN_DASHBOARD_VISIT: getHotjarEventWithExperiment('qfw_admin_dashboard_visit'),
  HOTJAR_SUPER_UPSELL_SHOW: getHotjarEventWithExperiment('super_upsell'),
  HOTJAR_SND_UPSELL_SHOW: getHotjarEventWithExperiment('snd_upsell'),
  HOTJAR_MATCH_REORDER_CREATE: getHotjarEventWithExperiment('match_reorder_create'),
  HOTJAR_DND_CREATE: getHotjarEventWithExperiment('dnd_question_create'),
  HOTJAR_MATH_RESPONSE_CREATE: getHotjarEventWithExperiment('math_response_create'),
  HOTJAR_FIBV2_CREATE: getHotjarEventWithExperiment('fibv2_question_create'),
  HOTJAR_FIBV2_SAVE: getHotjarEventWithExperiment('fibv2_question_save'),
  HOTJAR_BULK_IMPORT_INIT: getHotjarEventWithExperiment('bulk_import_init'),
  HOTJAR_BULK_IMPORT_INTENT: getHotjarEventWithExperiment('bulk_import_intent'),
  HOTJAR_QFW_COLLAB_FLOW: getHotjarEventWithExperiment('qfw_collab_flow'),
  HOTJAR_QFW_RESOURCE_SHARING: getHotjarEventWithExperiment('qfw_resource_sharing'),
  HOTJAR_PRICING_PAGE: 'pricing_page',
  HOTJAR_PRECURSOR_CREATE_MODAL: getHotjarEventWithExperiment('precursor_create_modal'),
  HOTJAR_PRECURSOR_PUBLISH_MODAL: getHotjarEventWithExperiment('precursor_publish_modal'),
  HOTJAR_TOP_CONTENT_TRACK: 'hotjar_top_content_track',
  HOTJAR_KURIKULUM_PAGE: 'hotjar_kurikulum_page',
  ADD_TO_CART_ONBOARDING_SHOWN: getHotjarEventWithExperiment('add_to_cart_onboarding_shown'),
  ADD_TO_CART_ONBOARDING_CLOSED: getHotjarEventWithExperiment('add_to_cart_onboarding_closed'),
  SEARCH_EVENT_ADD_QUESTION_TO_CART: getHotjarEventWithExperiment('searchEvent_addQuestionToCart'),
  SEARCH_EVENT_ADD_ALL_QUESTIONS_TO_CART: getHotjarEventWithExperiment('searchEvent_addAllQuestionsToCart'),
  ADD_TO_CART_OPEN_IN_EDITOR: getHotjarEventWithExperiment('add_to_cart_open_in_editor'),
  ADD_TO_CART_SAVE_QUIZ: getHotjarEventWithExperiment('add_to_cart_save_quiz'),
  PREVIEW_QUESTIONS_IN_CART: getHotjarEventWithExperiment('preview_questions_in_cart'),
  SHOW_CART_ONBOARDING_MODAL: getHotjarEventWithExperiment('show_cart_onboarding_modal'),
  GENERATE_INCORRECT_OPTIONS: 'generate_incorrect_options',
  SEARCH_TRIGGER_V2: getHotjarEventWithExperiment('search_trigger_v2'),
  HOTJAR_QUIZ_GEN_SELECTED: getHotjarEventWithExperiment('quiz_gen_selected'),
  HOTJAR_QUIZ_GEN_FORM_SUBMITTED: getHotjarEventWithExperiment('quiz_gen_form_submitted'),
  HOTJAR_QUIZ_GEN_CONTINUE_TO_EDIT: getHotjarEventWithExperiment('quiz_gen_continue_to_edit'),
  PRICING_PAGE_TRIAL_OPTION: 'pricing_page_trial_option',
  PAPER_MODE_CTA_CLICK: 'paper_mode_cta_click',
  HOTJAR_MASTERY_MODE_GTM: 'mastery-gtm',
  TELEPORT_SEARCH: 'teleport_search',
  POST_SIGNUP_PRICING_PAGE_SHOWN: 'post_signup_pricing_page_shown',
  QFW_PRICING_PAGE_SHOWN: 'qfw_pricing_page_shown',
  PRICING_PG_V2_VISITED: 'PRICING_PG_V2_VISITED',
  HOTJAR_CREATE_HOTSPOT_QUESTION: 'create_hotspot_question',
  HOTJAR_CREATE_LABELING_QUESTION: 'create_labeling_question',
  HOTJAR_QFW_NEW_CREATE_FLOW: 'qfw_new_create_flow',
  QFW_SAVE_QUIZ: 'qfw_save_quiz',
  HOTJAR_CREATE_GRAPHING_QUESTION: 'create_graphing_question',
  HOTJAR_MASTERY_MODE_SETTING: 'mastery_settings_page',
  DEMO_QUIZ_PAGE: 'demo_quiz_page',
  HOTJAR_MASTERY_PEAK_SETTINGS: 'mastery_peak_settings',
  HOTJAR_MASTERY_PEAK_TEACHER_WAITING: 'mastery_peak_waiting_lobby',

  QFW_USER_GAME_SETTINGS_PAGE: 'qfw_user_game_settings_page',
  QFW_AI_QUIZ_GEN: 'qfw_ai_quiz_gen',
  QFW_LESSON_VIEW: 'qfw_lesson_view',
};

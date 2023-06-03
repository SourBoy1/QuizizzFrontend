import SharedLibraryEvents from './events/sharedLibrary';
import SuperTrialEvents from './events/superTrial';
import GameSettings from './events/gameSettings';
import QfwGroup from './events/qfwGroups';
import Constants from './Constants';
import CoTeaching from './events/coTeaching';

export default {
  EDITOR_AUDIO_SAVE: 'audio_save',
  EDITOR_DOCK_BUTTON: 'dock_btn',
  EDITOR_GOOGLE_IMAGE_SEARCH: 'google_search_image',
  EDITOR_GOOGLE_VIDEO_SEARCH: 'google_search_video',
  EDITOR_IMAGE_REPLACE: 'image_replace',
  EDITOR_IMAGE_SAVE: 'image_save',
  EDITOR_ADD_NEW_SLIDE_NO_SLIDES: 'add_new_slide_no_slides',
  EDITOR_IMPORT_FILETYPE: 'import_filetype',
  EDITOR_IMPORT_INIT: 'import_init',
  EDITOR_IMPORT_INIT_NO_SLIDES: 'import_init_no_slides',
  EDITOR_IMPORT_PREP_START: 'import_prep_start',
  EDITOR_IMPORT_PREP_FINISH: 'import_prep_finish',
  EDITOR_INITIAL_THEME_MODAL_SAVE: 'initialThemeModal_save',
  EDITOR_INITIAL_THEME_MODAL_SKIP: 'initialThemeModal_skip',
  EDITOR_IMPORT_UPLOAD_START: 'import_upload_start',
  EDITOR_IMPORT_UPLOAD_FINISH: 'import_upload_finish',
  EDITOR_LINK_SAVE: 'link_save',
  EDITOR_LOAD: 'load',
  EDITOR_MATH_SAVE: 'math_save',
  EDITOR_PRE_CREATE_LOAD: 'precreate_load',
  EDITOR_PRE_CREATE_SAVE: 'precreate_save',
  EDITOR_PRE_PUBLISH_LOAD: 'prepublish_load',
  EDITOR_PRE_PUBLISH_SAVE: 'prepublish_save',
  EDITOR_REORDER_SAVE: 'reorder_save',
  EDITOR_QUESTION_CREATE: 'question_create',
  EDITOR_QUESTION_DELETE: 'delete_question',
  EDITOR_QUESTION_CANCEL: 'cancel_question_addition',
  EDITOR_SAVE: 'save',
  EDITOR_SAVE_QUESTION_BUTTON: 'saveQBtn',
  EDITOR_SHAPES_ADD: 'shapes_add',
  EDITOR_TABLE_ADD: 'table_add',
  EDITOR_TABLE_MODIFY: 'table_modify',
  EDITOR_TELEPORT_ADD: 'teleport_add',
  EDITOR_TELEPORT_ADD_ALL: 'teleport_add_all',
  EDITOR_TELEPORT_SEARCH_INIT: 'teleport_search_init',
  EDITOR_TELEPORT_SEARCH: 'teleport_search',
  EDITOR_TEMPLATE_SELECT: 'template_select',
  EDITOR_TEXT_ADD: 'text_add',
  EDITOR_THEMEPICKER_OPEN: 'themePicker_open',
  EDITOR_THEME_APPLY: 'theme_apply',
  EDITOR_VIDEO_SAVE: 'video_save',
  EDITOR_WEBPAGE_SAVE: 'webpage_save',
  QUIZ_EDITOR_OPENED: 'quiz_editor_opened',
  LESSON_EDITOR_OPENED: 'lesson_editor_opened',
  QUIZ_EDITOR_SUPER_QUESTION_INTENT: 'quiz_editor_super_question_intent',
  PROMPT_GAME_MODAL_USED: 'prompt_game_modal_used',
  INITIAL_GRAPH_SELECTION_ON_EDITOR: 'initial_graph_selection_on_editor',
  GRAPH_CHANGE_ON_EDITOR: 'graph_change_on_editor',
  EDIT_GRAPH_MODAL_OPENED_EDITOR: 'edit_graph_modal_opened_editor',
  EDIT_GRAPH_MODAL_SAVED_EDITOR: 'edit_graph_modal_saved_editor',
  EDIT_GRAPH_MODAL_CLOSED_EDITOR: 'edit_graph_modal_closed_editor',
  EDITOR_IMAGE_PASTE_INTENT: 'editor_image_paste_intent',
  CREATOR_INTERACTED_WITH_GRAPH: 'creator_interacted_with_graph',
  QUESTION_EDITOR_TEMPLATE_SHOWN: 'question_editor_template_shown',
  QUESTION_EDITOR_TEMPLATE_SELECTED: 'question_editor_template_selected',
  QUESTION_EDITOR_TEMPLATE_SAVED: 'question_editor_template_saved',
  QUESTION_EDITOR_TEMPLATE_COLLAPSED: 'question_editor_template_collapsed',

  CREATE_CONTENT_CLICKED_V2: 'create_content_clicked_v2',
  EDITOR_HEADER_NAME_EDITED: 'editor_header_name_edited',
  PRE_PUBLISH_MODAL_OPENED_V2: 'pre_publish_modal_opened_v2',
  PRE_PUBLISH_MODAL_SAVED_V2: 'pre_publish_modal_saved_v2',
  PRE_PUBLISH_MODAL_DATA_CHANGED: 'pre_publish_modal_data_changed',
  PRE_PUBLISH_MODAL_CONTENT_USING_FOR: 'pre_publish_modal_content_using_for',
  COVER_IMAGE_SELECTED: 'cover_image_selected',
  COVER_IMAGE_SELECT_BTN_CLICKED: 'cover_image_select_btn_clicked',
  COVER_IMAGE_SELECTED_FROM_SUGGESTIONS: 'cover_image_selected_from_suggestions',
  PARTICIPANTS_VIEW_ON_EDITOR_OPENED: 'participants_view_on_editor_opened',
  PARTICIPANTS_VIEW_ON_EDITOR_CLOSED: 'participants_view_on_editor_closed',

  // Spreadsheet
  SPREADSHEET_UPLOADED: 'spreadsheetUploaded',
  SPREADSHEET_SAVE: 'spreadsheetSaveClicked',
  IMPORT_SPREADSHEET_BTN: 'importSpreadsheetBtn',
  IMPORT_SPREADSHEET_ERROR: 'importSpreadsheetError',

  // Influential teachers
  TOP_CONTENT_LIST: 'top_content_list',
  TOP_CREATOR_PROFILE_CLICK: 'top_creator_profile_click',
  VIEW_ALL_CLICK: 'view_all_click',
  SUBJECT_TOGGLE_CREATOR: 'subject_toggled',
  DISTRICT_SEARCH_CONTENT: 'district_search_content',
  RECENT_CONTENT_VIEW_ALL_CLICK: 'recent_content_view_all_click',
  TOP_CREATOR_VIEW_ALL_CLICK: 'top_creator_view_all_click',
  TOP_CREATOR_CARD_CLICK_SIDEBAR: 'top_creator_card_click_sidebar',
  BASIC_USER_SEARCH_IN_DISTRICT_BUTTON_CLICK: 'basic_user_search_in_district_button_click',
  SEARCH_IN_DISTRICT_BUTTON_CLICK: 'search_in_district_button_click',
  TOP_CREATOR_CARD_SIDEBAR: 'top_creator_card_sidebar',
  TOP_CREATOR_SECTION_EXPLORE: 'top_creator_section_explore',
  DISTRICT_CREATOR_PROFILE_CLICK_SEARCH: 'district_creator_profile_click_search',

  // Import editable pdf
  IMPORT_PDF_ERROR: 'import_pdf_error',
  IMPORT_MODAL_CLOSED: 'import_modal_closed',
  IMPORT_PDF_EDITED: 'import_pdf_edited',

  // Quiz Editor Events via Function
  getQuizEditorEvent(contentType, eventName) {
    const prefix = contentType === Constants.ContentType.QUIZ ? 'qc' : 'qle';
    return `${prefix}_${eventName}`;
  },

  CONTENT_LIMIT_UPSELL_SHOWN: 'contentLimitUpsellShown',
  CONTENT_LIMIT_BANNER_SUPRESSED: 'content_limit_banner_supressed',
  GCL_LIMIT_UPSELL_SHOWN: 'gcl_limit_upsell_shown',
  GCL_LIMIT_BANNER_CLICKED_LEARN_MORE: 'gcl_limit_banner_clicked_learn_more',
  GCL_UPGRADE_UPSELL_BANNER_CANCELED: 'gcl_upgrade_upsell_banner_cancel',
  GCL_LIMIT_BANNER_CLICKED_UPGRADE: 'gcl_limit_banner_clicked_upgrade',
  CONTENT_LIMIT_BANNER_CLICKED_LEARN_MORE: 'content_limit_banner_clicked_learn_more',
  CONTENT_LIMIT_BANNER_CLICKED_UPGRADE: 'content_limit_banner_clicked_upgrade',
  CONTENT_LIMIT_TOOLTIP_INTERACTED: 'content_limit_tooltip_interacted',
  POST_SIGNUP_UPSELL_SHOWN: 'postSignupUpsellShown',
  POST_SIGNUP_UPSELL_CLOSED: 'postSignupUpsellClosed',

  // Qfw HomePage events
  QFW_BANNER_CREATE: 'qfw_banner_create_quiz',
  QFW_BANNER_QUIZ: 'qfw_banner_play_quiz',
  QFW_BANNER_LESSON: 'qfw_banner_presentation',
  QFW_TAB_CLICK: 'qfw_tab_click',
  QFW_CONTENT_CLICK: 'qfw_template_clicked',
  QFW_SEE_MORE_CLICK: 'qfw_see_more_clicked',

  // Post signup upsell events
  POST_SIGNUP_UPSELL_BASIC_CLICK: 'post_signup_upsell_basic_click',
  POST_SIGNUP_UPSELL_SUPER_CLICK: 'post_signup_upsell_super_click',
  POST_SIGNUP_UPSELL_SND_CLICK: 'post_signup_upsell_snd_click',

  // Signup/Login stuff
  SIGNUP_ACCOUNT_ALREADY_EXISTS: 'signup_accountAlreadyExists',
  LOGIN_ACCOUNT_DOES_NOT_EXIST: 'login_accountDoesNotExist',

  // Super pricing page
  SuperTrialEvents,
  SUPER_PRICING_FOLLOWUP_NOTNOW: 'super_pricing_followup_notnow',
  SUPER_PRICING_FOLLOWUP_GO_BACK_TO_QUIZIZZ: 'super_pricing_followup_go_back_to_quizizz',
  SUPER_PRICING_FOLLOWUP_REQUEST_QUOTE: 'super_pricing_followup_request_quote',
  SUPER_PRICING_FOLLOWUP_SUBSCRIBE: 'super_pricing_followup_subscribe',
  SUPER_PRICING_PAGE_CONTACT_US: 'super_pricing_page_contact_us',
  SUPER_PRICING_PAGE_REQUEST_QUOTE: 'super_pricing_page_request_quote',
  SUPER_UPSELL_PRICING_CTA: 'super_upsell_pricing_cta_btn',
  SUPER_UPSELL_PRICING_PAGE: 'super_upsell_pricing_page',

  // Quiz editor
  GO_BACK_TO_OLD_EDITOR: 'qc_back_to_old_editor',

  // Search events

  SEARCH_EVENT_SEARCH_ITEM_CLICK: 'searchEvent_searchItemClick',
  SEARCH_EVENT_SEARCH_ITEM_SAVE_BTN_CLICK: 'searchEvent_searchItemSaveBtnClick',
  SEARCH_EVENT_SEARCH_ITEM_VIEW_FULL_QUIZ_BTN_CLICK: 'searchEvent_searchItemViewFullQuizBtnClick',
  SEARCH_EVENT_SEARCH_ITEM_LIVE_BTN_CLICK: 'searchEvent_searchItemLiveBtnClick',
  SEARCH_EVENT_SEARCH_ITEM_SOLO_BTN_CLICK: 'searchEvent_searchItemSoloBtnClick',
  SEARCH_EVENT_SEARCH_ITEM_HOMEWORK_BTN_CLICK: 'searchEvent_searchItemHomeworkBtnClick',
  SEARCH_EVENT_SEARCH_ITEM_USERNAME_CLICK: 'searchEvent_searchItemUsernameClick',
  SEARCH_EVENT_SHOW_ANSWERS: 'searchEvent_showAnswers',
  SEARCH_EVENT_SHARE_BTN_CLICK: 'searchEvent_shareBtnClick',
  SEARCH_EVENT_COPY_AND_EDIT: 'searchEvent_cloneBtnclick',
  SEARCH_EVENT_PRINT_QUIZ: 'searchEvent_printBtnclick',
  SEARCH_EVENT_FILTER_EXPANDED: 'searchEvent_filterExpanded',
  SEARCH_EVENT_NAV_BAR_EXPANDED: 'searchEvent_navBarExpanded',
  SEARCH_EVENT_NAV_BAR_CLICKED: 'searchEvent_navBarClicked',

  SEARCH_EVENT_SUBJECT_TAG: 'searchEvent_subjectTagAdded',
  SEARCH_EVENT_HERO_SEARCH_TRIGGERED: 'searchEvent_heroSearch',
  SEARCH_EVENT_HERO_SEARCH_SUGGESIONS: 'searchEvent_heroSearch_suggestions',

  SEARCH_EVENT_HERO_SEARCH_RESPONSE_TIME: 'searchEvent_heroSearchResponseTime',
  SEARCH_EVENT_TELEPORT_SEARCH_RESPONSE_TIME: 'searchEvent_teleportSearchResponseTime',

  SEARCH_EVENT_SEARCH_EXIT: 'searchEvent_searchExit',

  SEARCH_EVENT_MATH_STANDARD_SELECTED: 'searchEvent_mathStandardSelected',
  SEARCH_EVENT_MATH_STANDARD_STATE_SELECTED: 'searchEvent_mathStandardStateSelected',
  SEARCH_EVENT_MATH_STANDARD_GRADE_SELECTED: 'searchEvent_mathStandardGradeSelected',

  // GTranslate events

  QUIZ_TRANSLATED: 'quizpage_translated',
  SEARCH_RESULT_BOOST: 'search_result_boost',

  // Generate Report Events
  SHOW_REPORT_BUTTON: 'show_report_button',
  GENERATE_BUTTON_CLICK: 'generate_button_click',
  SHOW_REPORT_MODAL: 'show_report_modal',
  CLOSE_REPORT_MODAL: 'close_report_modal',
  REPORT_SELECTION_DONE: 'report_selection_done',

  // Contest events

  CONTEST_INVITE_OTHERS_CLICK: 'contest_invite_others',
  CONTEST_SHARE_WITH_FRIENDS_CLICK: 'contest_share_with_friend',
  CONTEST_CERTIFICATE_DOWNLOAD: 'contest_cert_download',
  CONTEST_SIGNUP: 'contest_signup',
  CONTEST_REGISTERED: 'contest_registered',
  CONTEST_JOINED: 'contest_joined',
  CONTEST_RESUMED: 'contest_resumed',

  // My Library
  MY_LIBRARY_QUIZ_TYPE_FILTER_SELECTED: 'myLibrary_quizTypeFilterSelected',
  MY_LIBRARY_START_THIS_QUIZ_CLICK: 'myLibrary_startThisQuizClick',
  MY_LIBRARY_FINISH_EDITING_CLICK: 'myLibrary_finishEditingClick',
  MY_LIBRARY_LIVE_QUIZ_CLICK: 'myLibrary_liveQuizClick',
  MY_LIBRARY_INSTRUCTOR_PACED_CLICK: 'myLibrary_instructorPacedClick',
  MY_LIBRARY_ASSIGN_HOMEWORK_CLICK: 'myLibrary_assignHomeworkClick',
  MY_LIBRARY_CONTENT_STATUS_TAB_SWITCH: 'myLibrary_content_status_tab_switch',
  MY_LIBRARY_SORT_CONTENT: 'myLibrary_sort_content',
  MY_LIBRARY_SELECT_CONTENT_TYPE: 'myLibrary_select_content_type',

  // Preview Modal
  PREVIEW_MODAL_OPEN: 'previewModal_open',
  PREVIEW_MODAL_CLOSED: 'previewModal_closed',
  PREVIEW_MODAL_LIVE_QUIZ_BUTTON_CLICK: 'previewModal_liveQuizButtonClick',
  PREVIEW_MODAL_ASSIGN_HOMEWORK_CLICK: 'previewModal_assignHomeworkClick',
  PREVIEW_MODAL_CLASSIC_CLICK: 'previewModal_classic_click',
  PREVIEW_MODAL_INSTRUCTOR_PACED_CLICK: 'previewModal_instructorPacedClick',
  PREVIEW_MODAL_FINISH_EDITING_CLICK: 'previewModal_finishEditingClick',

  // Page view
  PAGE_VIEW: 'pageview',
  HEADER_SEARCH_BAR_CLICK: 'header_search_bar_click',
  HEADER_SEARCH_BAR_ENTER: 'header_search_bar_enter',

  // Schedule Later
  SCHEDULE_LATER: 'schedule_later_event',

  // Post Signup School Upsell Modal
  SCHOOL_UPSELL_OPEN: 'school_upsell_open',
  GET_QUOTE_BUTTON_CLICK: 'get_a_quote_button_click',
  SKIP_NOW_CLICK: 'skip_now_click',

  // Classes Events
  CLASS_IMPORT_GCL: 'class_import_gcl',
  CLASS_IMPORT_CANVAS: 'class_import_canvas',
  CLASS_IMPORT_SCHOOLOGY: 'class_import_schoology',
  CLASS_GCL_UPSELL_BTN_CLICK: 'class_gclSyncUpsellSuperBtnClicked',
  CLASS_GCL_ALLOW_BTN_CLICK: 'class_gclSyncUpsellAllowBtnClicked',
  CLASS_VIEW_ALL_VISIT: 'class_viewCLassesPageVisited',
  CLASS_OVERVIEW_VISIT: 'class_overviewTabVisited',
  CLASS_GRAPH_INTERACTION_HOVER: 'class_graphHovered',
  CLASS_GRAPH_INTERACTION_NAVIGATE: 'class_navigatedToReportsFromGraph',
  CLASS_ACCESS_REPORT_FROM_CLASS_TAB: 'class_accessedReportFromClassTab',
  CLASS_STUDENT_REPORT_BTN_TOOLTIP_CLICK: 'class_studentReportBtnTooltipClick',
  CLASS_TAB_SELECTED: 'CLASS_TAB_SELECTED',

  // Games
  GameSettings,
  GAME_REOPENED: 'game_reopened',
  GAME_STARTED: 'game_started',
  // Referral Events
  REFERRAL_MODAL_SHOWN: 'referral_modal_shown',
  REFERRAL_STATS_MODAL_SHOWN: 'referral_stats_modal_shown',
  CAMPAIGN_REFERRAL_STATS_MODAL_SHOWN: 'campaign_referral_modal_shown',
  REFERRAL_MODAL_SHOWN_SUPER: 'campaign_upgrade_to_trial_super',
  REFERRAL_MODAL_BTN_CLICK: 'referral_modal_btn_click',
  INDIVIDUAL_REFERRAL_SIDEBAR_BTN_CLICK: 'campaign_individual_refer_sidebar_click',
  INDIVIDUAL_REFERRAL_SIDEBAR: 'campaign_individual_refer_sidebar',
  INDIVIDUAL_REFEREE_MODAL_OPEN: 'campaign_individual_referee_register_modal',
  INDIVIDUAL_REFEREE_SIDEBAR_BTN: 'campaign_individual_referee_side_card_shown',
  INDIVIDUAL_REFEREE_SIDEBAR_BTN_CLICKED: 'campaign_individual_referee_sidebar_btn_click',
  INDIVIDUAL_REFEREE_MODAL_SHOWN: 'campaign_individual_referee_modal_shown',
  INDIVIDUAL_REFEREE_MODAL_REGISTER_BUTTON: 'campaign_individual_referee_modal_register_button',
  INDIVIDUAL_PLAN_NOT_ELIGIBLE: 'campaign_individual_plan_not_eligible',
  HOME_PAGE_TO_SCHOOL_PRICING_PAGE_INDIVIDUAL_PLAN_REFER: 'campaign_individual_plan_refer_pricing_page',
  INDIVIDUAL_PLAN_ALREADY_CLAIMED: 'campaign_individual_plan_already_claimed',
  INDIVIDUAL_REFEREE_UPGRADE_ACTIVATED: 'campaign_individual_referee_upgrade_activated',
  INDIVIDUAL_REFERRAL_STATS_MODAL_SHOWN: 'campaign_individual_referral_stats_modal_shown',
  INDIVIDUAL_REFERRAL_MAIL_SUCCESS: 'campaign_individual_referral_mail_success',
  INDIVIDUAL_REFERRAL_MAIL_FAIL: 'campaign_individual_referral_mail_fail',
  INDIVIDUAL_REFERRAL_COPY_CLICK: 'campaign_individual_referral_copy_click',
  USER_TRIAL_ACTIVATED: 'campaign_user_trial_activated',
  REFERRAL_SUPER_UPSELL_SHOWN: 'referral_super_upsell_shown',
  REFERRAL_SUPER_UPSELL_BTN_CLICK: 'referral_super_upsell_btn_click',
  REFERRAL_SIDEBAR_BTN_CLICK: 'referral_sidebar_btn_click',
  REFERRAL_PRICING_PAGE_MODAL_BTN_CLICK: 'referral_pricing_page_modal_btn_click',
  REFERRAL_LANDING_PAGE_SHOWN: 'referral_landing_page_shown',
  REFEREE_SIDEBAR_BTN_CLICKED: 'referee_sidebar_btn_clicked',
  REFEREE_REWARD_MODAL_SHOWN: 'referee_reward_modal_shown',
  REFERRAL_PRICING_PAGE_FREE_SUPER_BTN_CLICK: 'referral_pricing_page_free_super_btn_click',
  REFERRAL_ENROLL_FAIL: 'referral_enroll_fail',
  REFERRAL_LINK_CLICK: 'referral_link_click',

  // Sidebar Events
  SIDEBAR_OPTION_CLICKED: 'sidebar_option_clicked',

  // Super events
  SUPER_FEAT_UPSELL_SHOWN: 'super_feat_upsell_shown',

  // Manage Billing Info
  MANAGE_BILLING_INFO: 'manage_billing_info',

  // Churn Modals
  CHURN_MODAL_PAYMENT_INFO_CLICK: 'churn_modal_payment_info_click',
  CHURN_MODAL_CLOSED: 'churn_modal_closed',

  // Qfw Churn Modals
  QFW_CHURN_MODAL_PAYMENT_INFO_CLICK: 'qfw_churn_modal_payment_info_click',
  QFW_CHURN_MODAL_CLOSED: 'qfw_churn_modal_closed',
  QFW_CHURN_BANNER_PAYMENT_INFO_CLICK: 'qfw_churn_banner_payment_info_click',

  // Qfw Groups
  QfwGroup,

  // Churn Notification Banner
  PAST_DUE_HEADER_NOTIFICATION: 'PastDueHeaderNotification',
  PAST_DUE_HEADER_NOTIFICATION_BILLING_INFO_CLICK: 'PastDueHeaderNotificationBillingInfoClick',
  CHURN_BANNER_PAYMENT_INFO_CLICK: 'churn_banner_payment_info_click',

  // SnD Churn Notification Banner
  SND_CHURN_BANNER_SHOWN: 'snd_churn_banner_shown',
  SND_CHURN_BANNER_CLOSED: 'snd_churn_banner_closed',
  SND_CHURN_BANNER_CONTACT_SUCCESS: 'snd_churn_contact_success',
  SND_CHURN_BANNER_CONTACT_FAILURE: 'snd_churn_contact_failure',
  SND_FOCUSMODE_UPSELL_SHOW: 'snd_focusmode_upsell_show',
  SND_FOCUSMODE_UPSELL_CLOSED: 'snd_focusmode_upsell_closed',
  SND_REVIEWANDSUBMIT_UPSELL_SHOW: 'snd_reviewAndSubmit_upsell_show',
  SND_REVIEWANDSUBMIT_UPSELL_CLOSED: 'snd_reviewAndSubmit_upsell_closed',

  // SnD Credit Coupon Extended Banner
  SND_CREDIT_REMINDER_BANNER_SHOWN: 'snd_credit_reminder_banner_shown',
  SND_CREDIT_REMINDER_BANNER_CONFIRM_CLICK: 'snd_credit_reminder_banner_confirm_click',

  // Banner
  DISCOUNT_BANNER_SHOWN: 'discount_banner_shown',
  DISCOUNT_BANNER_BTN_CLICK: 'discount_banner_btn_click',

  // Peekaboo Events
  FEEDBACK_PEEKABOO_SHOW: 'feedback_peekaboo_show',
  FEEDBACK_PEEKABOO_CLOSED: 'feedback_peekaboo_closed',
  FEEDBACK_PEEKABOO_LINK_CLICKED: 'feedback_peekaboo_link_clicked',
  QUESTION_TYPE_PEEKABOO_CTA_CLICKED: 'question_type_peekaboo_cta_clicked',

  // Forgot Password Event
  FORGOT_PASSWORD_CLICK: 'forgot_password_click',

  // Content creation events
  UX_CREATE_CONTENT_BTN_CLICK: 'ux_create_content_btn',
  UX_CREATE_MODAL_NEXT_BTN_CLICK: 'ux_create_modal_next_btn',
  SHARED_FOLDER_SND_PLAN_UPGRADE: 'shared_folder_snd_plan_upgrade',
  SHARED_FOLDER_SND_PLAN_UPSELL_OPEN: 'shared_folder_snd_plan_upsell_open',

  // SharedLibrary Events
  SharedLibraryEvents,
  CONTENT_VIEWED: 'districtLib_content_viewed',
  CONTENT_FILTERED: 'districtLib_content_filtered',
  CONTENT_SEARCHED: 'districtLib_content_searched',
  INVITE_TEACHERS_ACTIVATED: 'districtLib_invite_teachers_activated',
  MANAGE_DISTRICT_CLICKED: 'districtLib_manage_district_clicked',
  TAB_SWITCHED: 'districtLib_tab_switched',
  TEACHER_INVITED: 'districtLib_teacher_invited',
  TEACHER_VIEWED: 'districtLib_teacher_viewed',
  UPSELL_BANNER_CTA: 'districtLib_upsell_banner_cta',
  UPSELL_CONTENTS_END_CTA: 'districtLib_upsell_prompt_cta',
  UPSELL_MAIN_HEADER_LOCK: 'districtLib_upsell_main_header_lock',
  UPSELL_ORG_SELECTOR: 'districtLib_upsell_org_selector',
  UPSELL_SEARCH: 'districtLib_upsell_search',
  UPSELL_SEARCH_TELEPORT: 'districtLib_upsell_search_teleport',
  VIEW_ALL_TEACHERS: 'districtLib_view_all_teachers',

  // Large Modal Preview Events
  PREVIEW_TOGGLE_EXPLANATION: 'preview_toggle_explanation_click',
  PREVIEW_PREVIOUS: 'preview_previous_click',
  PREVIEW_NEXT: 'preview_next_click',
  PREVIEW_TOGGLE_SHOW_ANSWERS: 'preview_toggle_show_answers_click',
  PREVIEW_CLOSE: 'preview_close_click',
  PREVIEW_LESSONS_PRESENTATION_EDITOR: 'preview_presentation_editor_click',
  PREVIEW_QUIZ_EDITOR: 'preview_quiz_editor_click',

  // Google Drive videos
  QC_VIDEO_UPLOAD_INIT: 'qc_video_upload_init',
  DRIVE_VIDEO_INIT: 'qc_drive_video_init',
  DRIVE_VIDEO_SAVE: 'qc_drive_video_save',

  // Game Changer Banner
  GAME_CHANGER_BANNER_CTA: 'game_changer_banner_cta',
  GAME_CHANGER_BANNER_SHOWN: 'game_changer_banner_shown',

  // STP Events
  STP_TRAINER_SIGNUP: 'stp_trainer_signup',
  STP_TRAINEE_SIGNUP: 'stp_trainee_signup',
  STP_TRAINER_ENROLL: 'stp_trainer_enroll',
  STP_TRAINEE_LESSON: 'stp_trainee_lesson',
  STP_TRAINER_PROFILE_VIEW: 'stp_trainer_profile_view',
  STP_ONBOARDING_CLICK: 'stp_onboarding_click',
  STP_PROFILE_CTA_CLICK: 'stp_profile_cta_click',
  STP_START_TRAINER_LESSON: 'stp_start_trainer_lesson',
  STP_INVITE_TRAINEES_CLICK: 'stp_invite_trainee_click',
  STP_VIEW_TRAINEE_LESSON: 'stp_view_trainee_lesson',
  STP_TRAINER_CERTIFICATE: 'stp_trainer_certificate',
  STP_TRAINEE_CERTIFICATE: 'stp_trainee_certificate',
  STP_TRAINEE_LESSON_VIEWED: 'stp_trainee_lesson_viewed',
  STP_TRAINEE_REWARDED: 'stp_trainee_rewarded',
  STP_TRAINEE_LEARN_MORE: 'stp_trainee_learn_more',

  // Auth Events
  MS_LOGIN: 'ms_login',
  GOOGLE_LOGIN: 'google_login',
  EMAIL_LOGIN: 'email_login',
  SET_PASSWORD: 'set_password',

  // SnD Teacher Onboarding Events
  ORGANIZATION_SELECTION: 'org_selection',
  ORG_SELECTION_STATE_CHANGE: 'org_selection_state_change',
  ORG_SELECTION_ZIP_CHANGE: 'org_selection_zip_change',
  ADD_SUBJECTS_GRADES: 'add_subjects_grades',
  SKIP_IMPORT_LMS: 'skip_import_lms',
  EXPLORE_QUIZIZZ: 'explore_quizizz',

  // Qfw Pricing Events
  QFW_PRICING_PAGE_SHOWN: 'PricingPageShown',
  QFW_PRICING_PAGE_PLANCARD_UPGRADE: 'PricingPagePlanCardUpgrade',
  QFW_PRICING_PAGE_PLANCARD_CONTACT_US: 'PricingPagePlanCardContactUs',
  QFW_PRICING_PAGE_PLANCARD_TRIAL_CTA: 'PricingPagePlanCardTrialCta',
  QFW_PRICING_PAGE_INTERVAL_TOGGLE: 'PricingPageIntervalToggle',
  QFW_PRICING_PAGE_FAQ_START_TRIAL_BUTTON: 'PricingPageFaqStartTrialBtn',
  QFW_PRICING_PAGE_ENTERPRISE_CONTACT_US: 'PricingPageEnterpriseContactUs',
  QFW_PRICING_PAGE_NON_PROFIT_PLAN_UPGRADE: 'PricingPageNonProfitPlanUpgrade',
  QFW_PRICING_PAGE_HEADER_TRIAL_CTA: 'PricingPageHeaderTrialCta',
  QFW: {
    DEMO_GAME: 'playdemo_button_clicked',
    PAGE_SOURCE: {
      HOME: 'homepage',
      PRICING: 'pricing_page',
    },
  },
  QFW_PRICING_PAGE_RENDER_START: 'qfw_pricing_page_render_start',
  QFW_PRICING_PAGE_WHOLE_CARD_CLICKED: 'qfw_pricing_page_whole_card_clicked',
  QFW_PRICING_PAGE_SERVICE_ERRORS: 'qfw_pricing_page_service_errors',

  // QFW Collaboration Events
  QFW_INVITE_MEMBER_CLICKED: 'qfw_invite_member_clicked',
  QFW_ADD_MEMBER_CLICKED: 'qfw_add_member_clicked',
  QFW_MEMBERS_INVITED: 'qfw_members_invited',
  QFW_PAYMENT_CONFIRM_CLICKED: 'qfw_payment_confirm_clicked',
  QFW_INVITE_PAYMENT_BACK_CLICKED: 'qfw_invite_payment_back_clicked',
  QFW_REMOVE_MEMBER_CLICKED: 'qfw_remove_member_clicked',
  QFW_REMOVE_MEMBER_CONFIRMED: 'qfw_remove_member_confirmed',
  QFW_EMPTY_SEAT_INVITE_CLICKED: 'qfw_empty_seat_invite_clicked',

  // QFW Upsell Events
  QFW_UPGRADE_BUTTON_CLICKED: 'qfw_upgrade_button_clicked',
  QFW_UPGRADE_FROM_STARTER_PLAN_BUTTON_CLICKED: 'qfw_upgrade_from_starter_plan_button_clicked',
  QFW_UPGRADE_FROM_MONTHLY_PLAN_BUTTON_CLICKED: 'qfw_upgrade_from_monthly_plan_button_clicked',
  QFW_PLAN_BUTTON_CLICKED: 'qfw_plan_button_clicked',
  QFW_PLAN_MODAL_CLOSED: 'qfw_plan_modal_closed',

  // Parent report Events
  PARENT_REPORT_PLAYNOW_BTN: 'ParentEmailReportPlayNowBtn',

  // share events
  SHARE_COLLECTION_CLICK: 'share_collection_click',
  SHARE_PROFILE_CLICK: 'share_profile_click',
  SHARE_QUIZ_CLICK: 'quizpage_share_click',
  LIBRARY_SHARE_QUIZ_CLICK: 'librarypage_share_click',
  SHARE_REFERRAL_LINK: 'share_referral_link',
  SHARE: 'share',

  // Copy Link
  COPY_LINK_CLICKED: 'copy_link_clicked',

  // Login Flow
  LOGIN_FLOW: 'login_flow',

  // Signup flow
  SIGNUP_FLOW: 'signup_flow',
  GET_CLASSES: 'get_classes',

  // Session tracking Events
  SESSION_ACTIVE: 'tracking/active-time/events',

  // Match and Reorder
  MATCH_REORDER_CLEANUP: 'MatchReorderCleanup',

  // Slides Bulk import
  BULK_IMPORT_INTENT: 'bulk_import_intent',
  BULK_IMPORT_INIT: 'bulk_import_init',
  BULK_IMPORT_COMPLETED: 'bulk_import_completed',
  BULK_IMPORT_CANCELLED: 'bulk_import_cancelled',

  // Tracking issues
  GOOGLE_ONE_TAP_FAILED: 'google_one_tap_failed',

  // Resend Invitation
  RESEND_INVITE: 'resend_invite',

  // Standard Tagged Event
  STANDARD_TAGGED: 'question_tag_added',
  NO_STANDARD_TAGGED: 'no_question_tag_added',
  // Quiz Recommendations
  QUIZ_PAGE_RECOMMENDATION: 'quiz_page_recommedation',

  // Quiz page
  QUIZ_PAGE_LIVE_GAME_START: 'quizpage_live_quiz_clicked',
  QUIZ_PAGE_HOMEWORK_GAME_START: 'quizpage_homework_clicked',
  QUIZ_PAGE_EDIT_QUIZ_NAME: 'quizpage_edit_quiz_name',
  LIKE_BUTTON_CLICK: 'like_button_click',
  SAVE_BUTTON_CLICK: 'save_button_click',
  QUIZ_SINGLE_CTA_EXP_MULTISTEP_PROCEED: 'quiz:multi-step:proceed',
  QUIZ_SINGLE_CTA_EXP_MULTISTEP_CANCEL: 'quiz:multi-step:cancel',

  // Cancelation Flow
  CANCEL_PLAN_CLICK: 'cancel_plan_click',
  CANCEL_PLAN_DETAILS_CLICK: 'cancel_plan_details_click',
  CANCEL_PLAN_CONFIRM_CLICK: 'cancel_plan_confirm_click',
  UPDATE_ACCOUNT_SETTINGS: 'update_account_settings',
  UPDATE_CARD: 'update_card',
  ADD_BACKUP_PAYMENT: 'add_backup_payment',
  CONTACT_US: 'contact_us',
  GO_BACK: 'go_back',
  RENEW_PLAN: 'renew_plan',
  SND_UPSELL_INTERESTED: 'snd_upsell_interested',
  SND_UPSELL_SKIP: 'snd_upsell_skip',
  SUBSCRIPTION_CANCEL_FEEDBACK: 'subscription_cancel_feedback',

  // Add to cart
  ADD_TO_CART_ONBOARDING_SHOWN: 'add_to_cart_onboarding_shown',
  ADD_TO_CART_ONBOARDING_CLOSED: 'add_to_cart_onboarding_closed',
  SEARCH_EVENT_ADD_QUESTION_TO_CART: 'searchEvent_addQuestionToCart',
  SEARCH_EVENT_ADD_ALL_QUESTIONS_TO_CART: 'searchEvent_addAllQuestionsToCart',
  SEARCH_EVENT_SET_PREVIEW_QUIZ: 'searchEvent_setPreviewQuiz',
  SEARCH_EVENT_HOVERED_QUIZZES_LIST: 'searchEvent_hoveredQuizzesList',

  ADD_TO_CART_OPEN_IN_EDITOR: 'add_to_cart_open_in_editor',
  ADD_TO_CART_SAVE_QUIZ: 'add_to_cart_save_quiz',
  PREVIEW_QUESTIONS_IN_CART: 'preview_questions_in_cart',
  SHOW_CART_ONBOARDING_MODAL: 'show_cart_onboarding_modal',

  // Skip Questions
  FEATURE_DISCOVERY_POPUP_SHOW: 'feature_discovery_popup_show',
  FEATURE_DISCOVERY_POPUP_CLOSED: 'feature_discovery_popup_close',
  FEATURE_DISCOVERY_POPUP_LINK_CLICKED: 'feature_discovery_popup_link_clicked',

  // Standards Collection
  STANDARDS_COLLECTION_SAVE: 'standards_collection_save',
  STANDARDS_COLLECTION_LIKE: 'standards_collection_like',
  STANDARDS_COLLECTION_PAGE_VIEW: 'standards_collection_page_view',
  STANDARDS_COLLECTION_SUBMIT_LINK_BUTTON: 'standards_collection_submit_link_button',
  STANDARDS_COLLECTION_SUBMIT_LINK: 'standards_collection_submit_link',
  STANDARDS_COLLECTION_SHARE_WITH_COLLEAGUE: 'standards_collection_share_with_colleague',
  STANDARDS_COLLECTION_VISIT_FROM_MY_LIB: 'standards_collection_visit_from_my_lib',

  // Shared Folder
  SHARED_FOLDER_CREATE_FOLDER_FROM_NUDGE: 'sharedFolder_create_folder_from_share_quiz_nudge',
  SHARED_FOLDER_OPEN_FOLDER_FROM_NUDGE: 'sharedFolder_open_created_folder_from_share_quiz_nudge',
  SHARED_FOLDER_ADD_TO_FOLDER_FROM_QUIZ_DETAILS: 'sharedFolder_add_to_folder_from_quiz_details',
  SHARED_FOLDER_CREATE_FOLDER_FROM_PUBLIC_LINK: 'sharedFolder_create_folder_from_copy_public_link',
  SHARED_FOLDER_OPEN_FOLDER_FROM_PUBLIC_LINK: 'sharedFolder_open_folder_from_copy_public_link',
  SHARED_FOLDER_ADD_TO_FOLDER_FROM_MY_LIBRARY: 'sharedFolder_add_to_folder_from_my_library',
  SHARED_FOLDER_SHARE_WITH_TEACHER_FROM_MY_LIBRARY: 'sharedFolder_share_with_teacher_from_my_library',
  SHARED_FOLDER_SHARE_WITH_TEACHER_FROM_QUIZ_DETAILS: 'sharedFolder_share_with_teacher_from_quiz_details',
  SHARED_FOLDER_ADD_QUIZ_TO_NEW_FOLDER: 'sharedFolder_add_quiz_to_new_folder',
  SHARED_FOLDER_ADD_QUIZ_TO_EXISTING_FOLDER: 'sharedFolder_add_quiz_to_existing_folder',
  SHARED_FOLDER_ADDED_TO_FULL_FOLDER: 'sharedFolder_added_to_full_folder',
  SHARED_FOLDER_VIEW_FOLDER_CLICKED: 'sharedFolder_view_folder_clicked',
  SHARED_FOLDER_ADD_TO_FOLDER: 'sharedFolder_add_to_folder',

  SHARED_FOLDER_MY_LIB_NEW_SHARED_FOLDER: 'sharedFolder_my_lib_new_shared_folder',
  SHARED_FOLDER_MY_LIB_NEW_SHARED_FOLDER_CLOSED: 'sharedFolder_my_lib_new_shared_folder_closed',
  SHARED_FOLDER_CREATED_SHARED_FOLDER_SUCCESSFULLY: 'sharedFolder_created_shared_folder_successfully',
  SHARED_FOLDER_CLICKED_EDIT_FOLDER: 'sharedFolder_clicked_edit_folder',
  SHARED_FOLDER_CLICKED_DELETE_FOLDER: 'sharedFolder_clicked_delete_folder',
  SHARED_FOLDER_CLICKED_LEAVE_FOLDER: 'sharedFolder_clicked_leave_folder',
  SHARED_FOLDER_CLICKED_MANAGE_FOLDER: 'sharedFolder_clicked_manage_folder',
  SHARED_FOLDER_CLICKED_VIEW_MEMBERS: 'sharedFolder_clicked_view_members',
  SHARED_FOLDER_CLICKED_ADD_COLLABORATORS: 'sharedFolder_clicked_add_collaborators',
  SHARED_FOLDER_CLICKED_ADD_MORE_COLLABORATORS: 'sharedFolder_clicked_add_more_collaborators',
  SHARED_FOLDER_ADDED_MORE_COLLABORATORS: 'sharedFolder_added_more_collaborators',
  SHARED_FOLDER_ADDED_INVALID_EMAIL: 'sharedFolder_added_invalid_email',
  SHARED_FOLDER_USE_SUGGEESTED_TEAM_NAME: 'sharedFolder_use_suggested_team_name',
  SHARED_FOLDER_CREATE_FOLDER_FROM_MY_LIBRARY_NUDGE: 'shared_folder_create_folder_from_my_library_nudge',

  SHARED_FOLDER_CLICKED_QUIZ: 'sharedFolder_clicked_content',
  SHARED_FOLDER_SAVED_QUIZ: 'sharedFolder_clicked_save_btn_on_content',
  SHARED_FOLDER_LIKED_QUIZ: 'sharedFolder_liked_content',
  SHARED_FOLDER_CLONED_QUIZ: 'sharedFolder_cloned_content',
  SHARED_FOLDER_EDITED_QUIZ: 'sharedFolder_edited_content',
  SHARED_FOLDER_CLICKED_LEARN_MORE: 'sharedFolder_clicked_learn_more',
  SHARED_FOLDER_CLICKED_UPGRADE: 'sharedFolder_clicked_upgrade',

  SHARED_FOLDER_ADD_CONTENT_CLICKED: 'shared_folder_add_content_clicked',
  SHARED_FOLDER_QUIZ_BUCKET_SEARCH_SUBMIT: 'shared_folder_quiz_bucket_search_submit',
  SHARED_FOLDER_REMOVED_COLLABORATOR_FROM_TEAM: 'shared_folder_removed_collaborator_from_team',
  SHARED_FOLDER_REMOVED_QUIZ_FROM_TEAM: 'shared_folder_removed_quiz_from_team',

  // Sharable Link | Add Collaborators
  SHARED_FOLDER_COPY_PRIVATE_LINK_CLICKED: 'shared_folder_copy_private_link_clicked',
  SHARED_FOLDER_INVITED_USERS: 'shared_folder_invited_users',
  SHARED_FOLDER_INVITE_USERS_API_FAILED: 'shared_folder_invite_users_api_failed',
  SHARED_FOLDER_CREATE_TEAM_API_FAILED: 'shared_folder_create_team_api_failed',
  SHARED_FOLDER_ADDED_SUGGESTED_USER_TO_COLLABS_FORM: 'shared_folder_added_suggested_user_to_collabs_form',
  SHARED_FOLDER_SUGGESTED_USERS_IN_COLLABS_FORM_SHOWN: 'shared_folder_suggested_users_in_collabs_form_shown',

  // shared folder nudge
  SHARED_FOLDER_CREATE_FOLDER_NUDGE_SHOWN: 'shared_folder_create_folder_nudge_shown',
  SHARED_FOLDER_CREATE_FOLDER_NUDGE_DISMISSED: 'shared_folder_create_folder_nudge_dismissed',
  SHARED_FOLDER_CREATE_FOLDER_NUDGE_CTA_CLICKED: 'shared_folder_create_folder_nudge_cta_clicked',

  // Quiz Bucket
  SEARCH_EVENT_QUIZ_BUCKET_SEARCH_RESPONSE_TIME: 'searchevent_quiz_bucket_search_response_time',

  // Report Abuse
  REPORT_ABUSE: 'reportAbuse',

  // coming soon DnD
  DRAG_N_DROP_COMING_SOON_INTENT: 'DRAG_N_DROP_COMING_SOON_INTENT',

  // Super question experience
  SELECT_QUESTION_TYPE: 'select_question_type',
  UPGRADE_TO_USE_SUPER_Q_NUDGE: 'upgrade_to_use_super_q_nudge',
  SAVE_UNSAVE_QUESTION: 'save_unsave_question',
  DELETE_QUESTION: 'delete_question',
  SAVE_QUIZ: 'save_quiz',
  SUPER_UPSELL_MODAL_TO_USE_SUPER_Q: 'super_upsell_modal_to_use_super_q',
  SUPER_PRICING_PAGE_VIEW: 'super_pricing_page_view',
  PROCEED_TO_CHECKOUT: 'proceed_to_checkout',
  INCOMPLETE_QUIZ: 'incomplete_quiz',
  QUIZ_EDITOR_SAVE_BTN: 'quiz_editor_save_btn',
  EDIT_QUESTION: 'edit_question',
  BANNER_TO_USE_SUPER_QUESTIONS_SHOWN: 'banner_to_use_super_questions_shown',

  // content restriction events
  SIGNUP_PROMPT_RESTRICT_CONTENT: 'signup_prompt_restrict_content',

  // School pricing page
  HOME_PAGE_TO_SCHOOL_PRICING_PAGE: 'home_page_to_school_pricing_page',
  HOME_PAGE_SCHOOL_PRICING_CTA_SHOWN: 'home_page_school_pricing_cta_shown',
  SCHOOL_PRICING_PAGE_TALK_TO_US: 'school_pricing_page_talk_to_us',
  SCHOOL_PRICING_PAGE_SHARE_WITH_AN_ADMIN: 'school_pricing_page_share_with_an_admin',
  SCHOOL_PRICING_PAGE_GO_BACK: 'school_pricing_page_go_back',
  SCHOOL_PRICING_PAGE_NOT_NOW: 'school_pricing_page_not_now',
  SHARE_SCHOOL_PLAN_WITH_ADMIN_MODAL_SEND_EMAIL: 'share_school_plan_with_admin_modal_send_email',
  SHARE_SCHOOL_PLAN_WITH_ADMIN_MODAL_COPY_LINK: 'share_school_plan_with_admin_modal_copy_link',
  SHARE_SCHOOL_PLAN_WITH_ADMIN_MODAL_CLOSE: 'share_school_plan_with_admin_modal_close',

  // SND Lead
  QUOTE_FROM_LOAD: 'quote_form_load',

  // SND Lead Generation from Individual Trial plan
  TRIAL_OPTION_CONFIRM: 'trial_option_confirm',
  LEAD_MODAL_NEXT: 'lead_modal_next',
  LEAD_MODAL_CLOSE: 'lead_modal_close',

  // Plans Page
  PLANS_PAGE_CTA_CLICKED: 'plans_page_cta_clicked',
  PLANS_PAGE_BACK_CLICKED: 'plans_page_back_clicked',
  SHARE_SCHOOL_PLAN_WITH_ADMIN_EMAIL: 'share_school_plan_with_admin_email',
  SHARE_SCHOOL_PLAN_WITH_ADMIN_EMAIL_CLOSE: 'share_school_plan_with_admin_email_close',
  SHOW_SHARE_SCHOOL_PLAN_WITH_ADMIN_MODAL: 'show_share_school_plan_with_admin_modal',
  SUPER_PLANS_PAGE_CTA_CLICKED: 'super_plans_page_cta_clicked',

  // Kurikulum Indonesia
  KURIKULUM_MERDEKA_SRP_BANNER: 'kurikulum_merdeka_srp_banner',

  // LMS events
  NO_CANVAS_LINK_MODAL: 'no_canvas_link_modal',
  INCORRECT_CANVAS_LINK_MODAL: 'incorrect_canvas_link_modal',

  // Google Forms
  IMPORT_GOOGLE_FORMS_BTN: 'import_google_forms_btn',
  IMPORT_GOOGLE_FORMS_SUCCESS: 'import_google_forms_success',

  // other platforms
  IMPORT_OTHER_PLATFORMS: 'import_other_platforms',

  CONTENT_RESTRICTION_BYPASS_CTA: 'content_restriction_bypass_cta',

  SHOW_RELATED_QUIZ_BTN: 'show_related_quiz_btn',

  // No-device mode
  PAPER_MODE_CTA_CLICK: 'paper_mode_cta_click',
  PAPER_MODE_SKIP_UNSUPPORTED: 'paper_mode_skip_unsupported',
  PAPER_MODE_PREVIEW_STARTED: 'paper_mode_preview_started',
  PAPER_MODE_MODAL: 'paper_mode_modal',
  PRINT_QR_CLICKED: 'print_qr_clicked',
  PAPER_MODE_MOBILE_BANNER_CLICK: 'paper_mode_mobile_banner_click',
  PAPER_MODE_OPEN_INTENT_PAGE_CLICK: 'paper_mode_open_intent_page_click',
  PAPER_MODE_WORKSHEET_BANNER_CLICK: 'paper_mode_worksheet_banner_click',

  PAPER_MODE_ROSTER_ASSIGN_CLICK: 'paper_mode_roster_assign_click',
  PAPER_MODE_ROSTER_CREATE_CLICK: 'paper_moder_roster_create_click',
  PAPER_MODE_ROSTER_ASSIGNED: 'paper_mode_roster_assigned',
  PAPER_MODE_DELETE_ROSTER: 'paper_mode_delete_roster',
  PAPER_MODE_UNASSIGN_ROSTER: 'paper_mode_unassign_roster',
  PAPER_MODE_EDIT_ROSTER: 'paper_mode_edit_roster',
  PAPER_MODE_VIEW_ROSTER: 'paper_mode_view_roster',

  PAPER_MODE_OPEN_QR_MODAL: 'paper_mode_open_qr_modal',
  PAPER_MODE_OPEN_GET_DOWNLOAD_LINK_MODAL: 'paper_mode_open_get_download_link_modal',

  SEND_APP_LINK_PHONE_CLICK: 'send_app_link_phone_click',
  SEND_APP_LINK_EMAIL_CLICK: 'send_app_link_email_click',

  PAPER_MODE_CROSS_SELL_CTA_CLICK_WEB: 'paper_mode_cross_sell_cta_click_web',
  PAPER_MODE_CROSS_SELL_CTA_CLICK_MOBILE: 'paper_mode_cross_sell_cta_click_mobile',

  PAPER_MODE_SHOW_RESPONSES_TOGGLE: 'qg_paper_mode_show_responses_toggle',

  // Open Ai Events
  RATE_AUTO_GENERATED_OPTIONS: 'rate_auto_generated_options',
  GENERATE_OPTIONS_BUTTON_SHOWN: 'generate_options_button_shown',
  AUTO_GENERATE_OPTIONS_USED_V3: 'auto_generate_options_used_v3',
  BASIC_USER_AUTO_GENERATE_OPTIONS_USED_V3: 'basic_user_auto_generate_options_used_v3',
  SUGGEST_AUTO_GENERATION_TOOGLE_ON: 'suggest_auto_generation_toogle_on',
  SUGGEST_AUTO_GENERATION_TOOGLE_OFF: 'suggest_auto_generation_toogle_off',
  USED_GENERATED_OPTIONS_V3: 'used_generated_options_v3',
  BASIC_USER_USE_SUGGESTION_CLICKED: 'basic_user_use_suggestion_clicked',
  USED_OPTIONS_GENERATION: 'clicked_auto_generate_options',
  BASIC_USER_CLICKED_GENERATE_OPTION_BUTTON: 'basic_user_clicked_generate_options_button',
  BASIC_USER_CLICKED_GENERATE_ALL_OPTIONS_BUTTON: 'basic_user_clicked_generate_all_options_button',
  CLICKED_ENTER_MANUAL_OPTIONS: 'clicked_enter_manual_options',
  PUBLISHED_VS_GENERATED_OPTIONS: 'published_vs_generated_options',
  ALL_OPTIONS_GENERATION_GENERATE_ALL_OPTIONS: 'all_options_generation_generate_all_options',
  ALL_OPTIONS_GENERATION_ERASE_ALL_OPTIONS: 'all_options_generation_erase_all_options',
  PUBLISHED_VS_GENERATE_ALL_OPTIONS: 'published_vs_generate_all_options',
  CLICKED_CLEAR_OPTIONS: 'clicked_clear_options',
  GENERATE_OPTIONS_API_FAIL: 'generated_options_api_fail',
  GENERATE_ANSWER_EXPLAINATION: 'generate_answer_explaination',
  GENERATED_ANSWER_EXPLAINATION_RESPONSE: 'generated_answer_explaination_response',
  PUBLISHED_VS_GENERATED_EXPLAINATION: 'published_vs_generated_explaination',

  // open Ai Api error events
  INFER_SUBJECT_API_FAIL: 'infer_subject_api_fail',
  OPTION_GENERATION_API_FAIL: 'option_generation_api_fail',
  ALL_OPTION_GENERATION_API_FAIL: 'all_option_generation_api_fail',

  // share flashcards
  SHARE_FLASHCARDS_INIT: 'share_flashcards_init',
  SHARE_FLASHCARDS_PREVIEW: 'share_flashcards_preview',
  SHARE_FLASHCARDS_COPY: 'share_flashcards_copy',
  SHARE_FLASHCARDS_CANCEL: 'share_flashcards_cancel',
  SHARE_FLASHCARDS_SHARE: 'share_flashcards_share',
  SHARE_FLASHCARDS_SHARED: 'share_flashcards_shared',

  // Quiz Generator events
  USE_QUIZ_GENERATOR: 'qc_use_quiz_generator',
  CREATE_QUIZ_FROM_SCRATCH: 'qc_create_quiz_from_scratch',
  CREATE_QUIZ_MOBILE_MODAL: 'create_quiz_mobile_modal',
  QUIZ_GENERATOR_SEARCH_BANNER: 'qc_quiz_generator_search_banner',
  QUIZ_GENERATOR_MOBILE_MODAL: 'qc_quiz_generator_mobile_modal',
  QUIZ_GENERATOR_MOBILE_MODAL_OPEN: 'qc_quiz_generator_mobile_modal_open',
  QUIZ_GENERATOR_MOBILE_MODAL_CLOSE: 'qc_quiz_generator_mobile_modal_close',
  QUIZ_GENERATOR_MOBILE_QUIZ_CREATED_SCREEN: 'qc_quiz_generator_mobile_quiz_created_screen',
  QUIZ_GENERATOR_MOBILE_QUIZ_CREATED_SCREEN_MOBILE_APP: 'qc_quiz_generator_mobile_quiz_created_screen_mobile_app',
  QUIZ_GEN_FILTERS_CHANGED: 'qc_quiz_gen_filters_changed',
  QUIZ_GEN_GENERATE_BTN_CLICKED: 'qc_quiz_gen_generate_btn_clicked',
  QUIZ_GEN_SUGGESTIONS_SELECTED: 'qc_quiz_gen_suggestions_selected',
  QUIZ_GEN_FORM_SUBMITTED: 'qc_quiz_gen_form_submitted',
  QUIZ_GEN_CONTINUE_TO_EDIT: 'qc_quiz_gen_continue_to_edit',
  QUIZ_GEN_ADD_QUESTIONS_AUTOMATICALLY_BTN_CLICKED: 'qc_quiz_gen_add_questions_automatically_btn_clicked',
  QUIZ_GEN_ADD_QUESTIONS_BTN_CLICKED: 'qc_quiz_gen_add_questions_btn_clicked',
  QUIZ_GEN_ZERO_SEARCH_RESULTS: 'qc_quiz_gen_zero_search_results',
  QUIZ_GEN_ADD_MORE_QUESTIONS: 'qc_quiz_gen_add_more_questions',
  QUIZ_GEN_DELETE_QUESTION: 'qc_quiz_gen_delete_question',
  QUIZ_GEN_CREATE_CLICK: 'qc_quiz_gen_create_click',
  CLOSE_QUIZ_GENERATOR: 'qc_close_quiz_generator',
  STOP_QUIZ_GEN: 'stop_quiz_gen',
  QUIZ_GEN_BACK_CLICK: 'quiz_gen_back_click',
  DELETE_QUIZ: 'delete_quiz',

  // Tag All Standards events
  STANDARD_TAG_ALL_EDIT_CLICKED: 'standard_tag_all_edit_clicked',
  STANDARD_TAG_ALL_NUDGE_SHOWN: 'standard_tag_all_nudge_shown',
  STANDARD_TAG_ALL_NUDGE_YES_CLICKED: 'standard_tag_all_nudge_yes_clicked',
  STANDARD_TAG_ALL_NUDGE_NO_CLICKED: 'standard_tag_all_nudge_no_clicked',
  STANDARD_TAG_ALL_NUDGE_TAG_ALL_CLICKED: 'standard_tag_all_nudge_tag_all_clicked',
  STANDARD_TAG_ALL_OTHER_QUESTION_SHOWN: 'standard_tag_all_other_question_shown',
  STANDARD_TAG_ALL_OTHER_QUESTION_TAG_ALL_CLICKED: 'standard_tag_all_other_question_tag_all_clicked',
  STANDARD_TAG_ALL_OTHER_QUESTION_DISMISS_CLICKED: 'standard_tag_all_other_question_dismiss_clicked',
  STANDARD_TAG_ALL_REMINDER_SHOWN: 'standard_tag_all_reminder_shown',
  STANDARD_TAG_ALL_REMINDER_VIEW_SAMPLE_CLICKED: 'standard_tag_all_reminder_view_sample_clicked',
  STANDARD_TAG_ALL_REMINDER_DISMISS_CLICKED: 'standard_tag_all_reminder_dismiss_clicked',

  // Auto Convert Quiz Page
  AUTO_CONVERT_QUIZ_PAGE_PREVIEW_COMPONENT_IN_VIEW: 'auto_convert_quiz_page_preview_component_in_view',
  AUTO_CONVERT_QUIZ_PAGE_PREVIEW_COMPONENT_BUTTON_CLICK: 'auto_convert_quiz_page_preview_component_button_click',
  AUTO_CONVERT_QUIZ_PAGE_QUESTION_CARD_CONVERT_BUTTON_CLICK: 'auto_convert_quiz_page_question_card_convert_button_click',
  AUTO_CONVERT_QUIZ_PAGE_QUESTION_CARD_PARTICIPANTS_VIEW_BUTTON_CLICK: 'auto_convert_quiz_page_question_card_participants_view_button_click',
  AUTO_CONVERT_QUIZ_PAGE_DROPDOWN_CLICK: 'auto_convert_quiz_page_dropdown_click',
  AUTO_CONVERT_QUIZ_PAGE_DROPDOWN_QUESTION_TYPE_SELECTED: 'auto_convert_quiz_page_dropdown_question_type_selected',
  AUTO_CONVERT_QUIZ_PAGE_SAVE_BUTTON_CLICK: 'auto_convert_quiz_page_save_button_click',
  AUTO_CONVERT_QUIZ_PAGE_DISCARD_BUTTON_CLICK: 'auto_convert_quiz_page_discard_button_click',

  // Auto convert modal
  AUTO_CONVERT_V2_BULK_PROMPT_CONVERT_CLICKED: 'auto_convert_v2_bulk_prompt_convert_clicked',
  AUTO_CONVERT_V2_BULK_PROMPT_DISMISS_CLICKED: 'auto_convert_v2_bulk_prompt_dismiss_clicked',
  AUTO_CONVERT_V2_BULK_PROMPT_CLOSE_CLICKED: 'auto_convert_v2_bulk_prompt_close_clicked',
  AUTO_CONVERT_V2_BULK_PROMPT_VIEWED: 'auto_convert_v2_bulk_prompt_viewed',

  AUTO_CONVERT_V2_BULK_POPUP_CLOSE_CLICKED: 'auto_convert_v2_bulk_popup_close_clicked',
  AUTO_CONVERT_V2_BULK_POPUP_DISCARD_CLICKED: 'auto_convert_v2_bulk_popup_discard_clicked',
  AUTO_CONVERT_V2_BULK_POPUP_SAVE_CLICKED: 'auto_convert_v2_bulk_popup_save_clicked',
  AUTO_CONVERT_V2_BULK_POPUP_VIEWED: 'auto_convert_v2_bulk_popup_viewed',

  AUTO_CONVERT_V2_POPUP_CLOSE_CLICKED: 'auto_convert_v2_popup_close_clicked',
  AUTO_CONVERT_V2_POPUP_DISCARD_CLICKED: 'auto_convert_v2_popup_discard_clicked',
  AUTO_CONVERT_V2_POPUP_SAVE_CLICKED: 'auto_convert_v2_popup_save_clicked',
  AUTO_CONVERT_V2_POPUP_VIEWED: 'auto_convert_v2_popup_viewed',

  AUTO_CONVERT_V2_QUIZ_SAVED: 'auto_convert_v2_quiz_saved',

  // Collections in search
  COLLECTIONS_IN_SEARCH_COLLECTION_PREVIEW_SET: 'collections_in_search_collection_preview_set',
  COLLECTIONS_IN_SEARCH_COLLECTION_CLICK: 'collections_in_search_collection_click',
  COLLECTIONS_IN_SEARCH_COLLECTION_COPY_BUTTON_CLICKED: 'collections_in_search_collection_copy_button_clicked',
  COLLECTIONS_IN_SEARCH_COLLECTION_SHARE_BUTTON_CLICKED: 'collections_in_search_collection_share_button_clicked',
  COLLECTIONS_IN_SEARCH_COLLECTION_QUIZ_PREVIEW_CLICKED: 'collections_in_search_collection_quiz_preview_clicked',
  COLLECTIONS_IN_SEARCH_COLLECTION_IN_VIEW: 'collections_in_search_collection_in_view',
  COLLECTIONS_IN_SEARCH_COLLECTION_QUIZ_HOVERED: 'collections_in_search_collection_quiz_hovered',

  // Embed Quiz
  EMBED_QUIZ_CTA_CLICKED: 'embed_quiz_cta_clicked',
  EMBED_QUIZ_COPY_CODE: 'embed_quiz_copy_code',
  EMBED_QUIZ_COPY_LINK: 'embed_quiz_copy_link',

  // gcse
  GCSE_SHARE_PAGE_CLICK: 'gcse_share_page_click',
  GCSE_PAST_PAPERS_PAGEVIEW: 'gcse_past_papers_pageview',
  GCSE_PAST_PAPERS_BANNER_CLICK: 'gcse_past_papers_banner_click',
  GCSE_CONTENT_FILTER_APPLIED: 'gcse_content_filter_applied',
  GCSE_TAB_CLICKED: 'gcse_tab_clicked',

  // Upgrade Nudges CTA
  UPGRADE_TO_SND_CTA: 'upgrade_to_snd_cta',

  // Mastery Mode
  MASTERY_MODE_TOGGLE: 'mastery_mode_toggle',
  MASTERY_MODE_GAME_CREATE: 'mastery_mode_game_create',

  // Async Nudge- Settings
  ASYNC_NUDGE_SEEN: 'async_nudge_seen',
  ASYNC_NUDGE_CLICKED: 'async_nudge_clicked',

  // Mastery Peak Banner
  MASTERY_PEAK_BANNER_SEEN: 'mastery_peak_banner_seen',
  MASTERY_PEAK_DEBUG_LOGGER: 'mastery_peak_debug_logger',

  // Premium question week banner CTA
  HOMEPAGE_PREMIUM_QUESTION_WEEK_BANNER_LEARN_MORE_CTA_CLICKED: 'homepage_premium_question_week_banner_learn_more_cta_clicked',
  HOMEPAGE_PREMIUM_QUESTION_WEEK_BANNER_CTA_CLICKED: 'homepage_premium_question_week_banner_cta_clicked',
  HOMEPAGE_PREMIUM_QUESTION_WEEK_BANNER_NOTIFY_CTA_CLICKED: 'homepage_premium_question_week_banner_notify_cta_clicked',
  CREATE_PREMIUM_QUESTION_QUIZ_CTA_CLICKED: 'create_premium_question_quiz_cta_clicked',
  LIBRARY_PAGE_PREMIUM_QUESTION_WEEK_BANNER_CTA_CLICKED: 'library_page_premium_question_week_banner_cta_clicked',

  // PremiumQuestion Trial confirmation events
  CLOSE_UPGRADE_CONFIRMATION_MODAL: 'close_upgrade_confirmation_modal',
  OPENED_UPGRADE_CONFIRMATION_MODAL: 'opened_upgrade_confirmation_modal',

  // SND upsells
  PROFILE_PAGE_SND_UPSELL: 'profile_page_snd_upsell',
  // QFW Locked Content Modal
  QFW_LOCKED_CONTENT_MODAL_SHOWN: 'qfw_locked_content_modal_shown',
  QFW_LOCKED_CONTENT_MODAL_UPGRADE_CTA_CLICKED: 'qfw_locked_content_modal_upgrade_cta_clicked',
  QFW_LOCKED_CONTENT_MODAL_EXTEND_CTA_CLICKED: 'qfw_locked_content_modal_extend_cta_clicked',

  // QFW PLAN PAGE

  // PRICING PAGE REVAMP - FEB 2023
  SUPER_PRICING_PG_V2_LOOKING_FOR_INDIVIDUAL_PLAN: 'super_pricing_pg_v2_looking_for_individual_plan',
  SUPER_PRICING_PG_V2_USAGE_STATS_VIEW: 'super_pricing_pg_v2_usage_stats_view',
  SUPER_PRICING_PG_V2_BACK_CLICKED: 'super_pricing_pg_v2_back_btn_clicked',
  SUPER_PRICING_PG_V2_TAB_SWITCH: 'super_pricing_pg_v2_tab_switch',
  SUPER_PRICING_PG_V2_LEARN_MORE_CLICKED: 'super_pricing_pg_v2_learn_more_clicked',
  SUPER_PRICING_PG_V2_GO_BACK_TO_SCHOOL_PLAN_CLICKED: 'super_pricing_pg_v2_go_back_to_school_plan_clicked',
  // QFW User Onboarding
  QFW_ONB_TAB_CHANGE: 'qfw_onb_tab_change',
  QFW_ONB_PLAY_QUIZ_CTA_CLICKED: 'qfw_onb_play_quiz_cta_clicked',
  QFW_ONB_HOST_QUIZ_CTA_CLICKED: 'qfw_onb_host_quiz_cta_clicked',

  QFW_HELP_CARD_CLICK: 'qfw_help_card_click',
  QFW_ADMIN_REPORT_CARD_CLICK: 'qfw_admin_report_card_click',
  QFW_ADMIN_LIBRARY_CARD_CLICK: 'qfw_admin_library_card_click',

  // QFW create flow
  QFW_CREATE_MODAL_OPEN: 'qfw_create_modal_open',
  QFW_CREATE_MODAL_CLOSE: 'qfw_create_modal_close',
  QFW_CREATE_: 'qfw_create_',
  QFW_CREATE_IMPORT_MODAL_OPEN: 'qfw_create_import_modal_open',
  QFW_CREATE_IMPORT_MODAL_CLOSE: 'qfw_create_import_modal_close',
  QFW_CREATE_IMPORT_MODAL_GOOGLE_FORMS: 'qfw_create_import_modal_google_forms',
  QFW_CREATE_IMPORT_MODAL_GOOGLE_SLIDES: 'qfw_create_import_modal_google_slides',
  QFW_CREATE_IMPORT_MODAL_GOOGLE_SHEET: 'qfw_create_import_modal_google_sheet',
  QFW_CREATE_USE_TEMPLATE_MODAL_OPEN: 'qfw_create_use_template_modal_open',
  QFW_CREATE_USE_TEMPLATE_MODAL_CLOSE: 'qfw_create_use_template_modal_close',
  QFW_CREATE_USE_TEMPLATE_CLICKED: 'qfw_create_use_template_clicked',
  QFW_EDITOR_ADD_NEW_QUESTION_CLICKED: 'qfw_editor_add_new_question_clicked',
  QFW_EDITOR_QUIZ_LIBRARY_CLICKED: 'qfw_editor_quiz_library_clicked',
  QFW_EDITOR_IMPORT_CLICKED: 'qfw_import_clicked',

  // Mystic Peak
  SKIP_TO_SUMMARY_CLICKED: 'skip_to_summary_clicked',
  SUMMARY_WAITING_TIME: 'summary_waiting_time',
  SUMMARY_GROWTH_PERCENT: 'summary_growth_percent',
  TEACHER_END_GAME: 'teacher_end_game',
  HOVER_LIVE_QUIZ: 'hover_live_quiz',
  MASTERY_PEAK_CLICKED: 'mastery_peak_clicked',
  MASTERY_PEAK_KNOW_MORE_CLICKED: 'mastery_peak_know_more_clicked',
  MASTERY_PEAK_QUES_ICON_HOVERED: 'mastery_peak_ques_icon_hovered',
  MASTERY_PEAK_GOAL_CHANGED: 'mastery_peak_goal_changed',

  // Game Settings Default Selection
  GAME_SETTINGS_DEFAULT_SELECTION: 'game_settings_default_selection',
  // CoTeaching
  CoTeaching,

  // Settings Page Scroll
  GAME_SETTINGS_SCROLL: 'game_settings_scroll',

  // Demo quiz
  DEMO_QUIZ_STARTED: 'demo_quiz_started',
  DEMO_GAME_STARTED_SUCCESSFULLY: 'demo_game_started_successfully',
  DEMO_QUIZ_FINISHED: 'demo_quiz_finished',
  DEMO_QUIZ_ENDED: 'demo_quiz_ended',
  DEMO_QUIZ_CLOSED: 'demo_quiz_closed',
  DEMO_QUIZ_WALKTHROUGH_STARTED: 'demo_quiz_walkthrough_started',
  DEMO_QUIZ_WALKTHROUGH_STARTED_STEP_: 'demo_quiz_walkthrough_started_step_',
  DEMO_QUIZ_WALKTHROUGH_COMPLETED_STEP_: 'demo_quiz_walkthrough_completed_step_',
  DEMO_QUIZ_AFTER_TRIAL_PAGE: 'demo_quiz_after_trial_page',

  // q type visibility
  QTYPE_VISIBILITY_MCQ_BANNER_SHOWN: 'qtype_visibility_mcq_banner_shown',
  QTYPE_VISIBILITY_EXPLORE_EXAMPLES_BTN_CLICKED: 'qtype_visibility_explore_examples_btn_clicked',
  QTYPE_VISIBILITY_USE_TEMPLATE_BTN_CLICKED: 'qtype_visibility_use_template_btn_clicked',
  QTYPE_VISIBILITY_SEARCH_INTENT: 'qtype_visibility_search_intent',

  // New Question Types Banner
  LIBRARY_PAGE_NEW_QTYPE_BANNER_CLICKED: 'library_page_new_qtype_banner_clicked',

  // Editor Auto Convert Events
  EDITOR_AUTO_CONVERT_OPTION_VIEWED: 'qc_editor_auto_convert_option_viewed',
  EDITOR_AUTO_CONVERT_OPTION_CLICKED: 'qc_editor_auto_convert_option_clicked',

  // Badge Events
  BADGE_EXPLORE_CLICK: 'badge_explore_click',

  // Qfw Pricing Upsell
  QFW_PRICING_UPSELL_SHOWN: 'qfw_pricing_upsell_shown',
  QFW_PRICING_UPSELL_COMPARE_PLANS_CLICKED: 'qfw_pricing_upsell_compare_clicked',

  // Qfw host quiz modal
  QFW_HOST_QUIZ_MODAL_OPEN: 'qfw_host_quiz_modal_open',
  QFW_HOST_QUIZ_MODAL_HOST_QUIZ: 'qfw_host_quiz_modal_host_quiz',
  QFW_HOST_QUIZ_MODAL_GO_TO_LIBRARY: 'qfw_host_quiz_modal_go_to_library',
  QFW_HOST_QUIZ_MODAL_CLOSE: 'qfw_host_quiz_modal_close',

  // Set Timer on question
  EDITOR_QUESTION_TIME_CHANGE: 'question_time_change',
  EDITOR_QUESTION_TIME_CHANGE_ALL: 'question_time_change_all',

  QUESTION_TEXT_CHANGED: 'question_text_changed',

  // Labelling Question
  LABELLING_ADD_IMAGE_CLICKED: 'labelling_add_image_clicked',
  LABELLING_ADD_IMAGE_ERROR_TRIGGERED: 'labelling_add_image_error_triggered',
  LABELLING_EDIT_IMAGE_CLICKED: 'labelling_edit_image_clicked',
  LABELLING_ANSWER_OPTION_ADDED: 'labelling_answer_option_added',
  LABELLING_OPTION_INTERACTED: 'labelling_option_interacted',

  // Hotspot Question
  HOTSPOT_ADD_IMAGE_CLICKED: 'hotspot_add_image_clicked',
  HOTSPOT_EDIT_IMAGE_CLICKED: 'hotspot_edit_image_clicked',
  HOTSPOT_OPTION_TYPE_SELECTED: 'hotspot_option_type_selected',
  HOTSPOT_ADDED: 'hotspot_added',

  // FIB Question
  FIB_SETTINGS: 'fib_settings',

  // Image upload modal
  PASTE_BUTTON_CLICKED: 'paste_link_clicked',
  UPLOAD_BUTTON_CLICKED: 'upload_image_clicked',

  // Qfw Pricing modal
  QFW_PRICING_MODAL_SHOWN: 'qfw_pricing_modal_shown',
  QFW_PRICING_MODAL_COMPARE_PLAN_CLICKED: 'qfw_pricing_modal_compare_plan_clicked',
  QFW_PRICING_MODAL_PLANCARD_UPGRADE: 'Pricing_modal_plan_card_upgrade',
  QFW_LIBRARY_NUDGE_UPGRADE: 'Pricing_library_nudge_upgrade',

  // Qfw Quiz Generator
  QUIZ_GEN_MODAL_OPEN: 'quiz_gen_modal_open',
  QUIZ_GEN_CHARACTER_COUNT_FETCHED: 'quiz_gen_character_count_fetched',
  QUIZ_GEN_FILE_UPLOAD_STARTED: 'quiz_gen_file_upload_sstarted',
  QUIZ_GEN_FILE_UPLOADED_SUCCESSFULLY: 'quiz_gen_file_uploaded_successfully',
  QUIZ_GEN_FILE_UPLOAD_FAILED: 'quiz_gen_file_upload_failed',
  QUIZ_GEN_GENERATE_BUTTON_CLICKED: 'quiz_gen_generate_button_clicked',
  QUIZ_GEN_GENERATION_SUCCESSFULL: 'quiz_gen_generation_successfull',
  QUIZ_GEN_GENERATION_FAILED: 'quiz_gen_generation_failed',
  QUIZ_GEN_RETRY: 'quiz_gen_retry',
  QUIZ_GEN_CREATE_MANUAL: 'quiz_gen_create_manual',
  QUIZ_GEN_MODAL_CLOSE: 'quiz_gen_modal_close',

  // Qfw after signup quiz tile
  QFW_AFTER_SIGNUP_QUIZ_TILE_SHOWN: 'qfw_after_signup_quiz_tile_shown',
  QFW_AFTER_SIGNUP_QUIZ_TILE_NOT_INTERESTED_CLICKED: 'qfw_after_signup_quiz_tile_not_interested_clicked',
  QFW_AFTER_SIGNUP_QUIZ_TILE_CLICKED: 'qfw_after_signup_quiz_tile_clicked',

  GAME_QUESTION_BANK_KEYS: 'game_question_bank_keys',
};

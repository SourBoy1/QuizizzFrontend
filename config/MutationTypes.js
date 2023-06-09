export default {
  SET_DEVICE_PROPERTIES: 'SET_DEVICE_PROPERTIES',
  SET_DEVICE_INFO: 'SET_DEVICE_INFO',
  DO_CLIENT_INITIATION: 'DO_CLIENT_INITIATION',
  SET_USER: 'SET_USER',
  SET_GOOGLE_WIDGET_TRANSLATION_STATE: 'SET_GOOGLE_WIDGET_TRANSLATION_STATE',
  SET_GOOGLE_WIDGET_LANGUAGE: 'SET_GOOGLE_WIDGET_LANGUAGE',
  SET_USER_REGION: 'SET_USER_REGION',
  SET_REQUEST_REGION: 'SET_REQUEST_REGION',
  SET_HELP_BUTTON_OFFSET: 'SET_HELP_BUTTON_OFFSET',
  SET_HELP_BUTTON_SHOW: 'SET_HELP_BUTTON_SHOW',
  SET_HELP_BUTTON_THEME: 'SET_HELP_BUTTON_THEME',
  SET_HELP_BUTTON_ZINDEX: 'SET_HELP_BUTTON_ZINDEX',
  SET_GRAPHER: 'SET_GRAPHER',
  SET_FEATURES: 'SET_FEATURES',

  contentEditor: {
    SET_QUIZ: 'SET_QUIZ',
    SET_QUIZ_PREFERENCES: 'SET_QUIZ_PREFERENCES',
    SET_COPY_OF_QUIZ_PREFERENCES: 'SET_COPY_OF_QUIZ_PREFERENCES',
    SET_IS_QUIZ_NAME_CHANGED_USING_HEADER_INPUT: 'SET_IS_QUIZ_NAME_CHANGED_USING_HEADER_INPUT',
    SET_QUIZ_PREFERENCE: 'SET_QUIZ_PREFERENCE',
    RESET_QUIZ: 'RESET_QUIZ',
    ADD_NEW_SLIDE: 'ADD_NEW_SLIDE',
    DELETE_SLIDE_BY_ID: 'DELETE_SLIDE_BY_ID',
    UNDELETE_SLIDE_BY_ID: 'UNDELETE_SLIDE_BY_ID',
    DUPLICATE_SLIDE_BY_ID: 'DUPLICATE_SLIDE_BY_ID',
    SET_SELECTED_SLIDE: 'SET_SELECTED_SLIDE',
    SET_IMAGE: 'SET_IMAGE',
    SET_NAME: 'SET_NAME',
    SET_ALL_SLIDES_DIRTY: 'SET_ALL_SLIDES_DIRTY',
    SET_SUBJECTS: 'SET_SUBJECTS',
    SET_LANGUAGE: 'SET_LANGUAGE',
    SET_GRADE_RANGE: 'SET_GRADE_RANGE',
    SET_VISIBILITY: 'SET_VISIBILITY',
    SET_DIRTY_SLIDE: 'SET_DIRTY_SLIDE',
    SET_CORRECT_MARKS: 'SET_CORRECT_MARKS',
    CLEAR_DIRTY_SLIDES: 'CLEAR_DIRTY_SLIDES',
    PUSH_ONE_INDEX_FROM: 'PUSH_ONE_INDEX_FROM',
    PULL_ONE_INDEX_FROM: 'PULL_ONE_INDEX_FROM',
    SET_INDEX_BY_ID: 'SET_INDEX_BY_ID',
    LOCK: 'LOCK',
    UNLOCK: 'UNLOCK',
    SET_AUTOSAVE_IN_PROGRESS: 'SET_AUTOSAVE_IN_PROGRESS',
    CORRECT_INDICES: 'CORRECT_INDICES',
    SET_THEME: 'SET_THEME',
    SET_THEME_ALL: 'SET_THEME_ALL',
    ADD_TELEPORTED_QUESTIONS: 'ADD_TELEPORTED_QUESTIONS',
    UPDATE_DRAFT_QUESTION: 'UPDATE_DRAFT_QUESTION',
    UPDATE_DRAFT_QUESTIONS: 'UPDATE_DRAFT_QUESTIONS',
    SET_DRAFT_QUESTIONS: 'SET_DRAFT_QUESTIONS',
    PUSH_HISTORY: 'PUSH_HISTORY',
    SET_HISTORY_CURSOR: 'SET_HISTORY_CURSOR',
    REMOVE_SLIDE_BY_ID: 'REMOVE_SLIDE_BY_ID',
    SET_DRAFT_PREFERENCE: 'SET_DRAFT_PREFERENCE',
    TOGGLE_STALE_DRAFT_WARNING: 'TOGGLE_STALE_DRAFT_WARNING',
    SET_CURRICULUM: 'SET_CURRICULUM',
    SET_STANDARD_DATA: 'SET_STANDARD_DATA',
    SET_SHOULD_SHOW_CURRICULUM_SELECTION: 'SET_SHOULD_SHOW_CURRICULUM_SELECTION',
    SET_PREVIOUS_STANDARDS: 'SET_PREVIOUS_STANDARDS',
    SET_PREVIOUS_FILTER: 'SET_PREVIOUS_FILTER',
    SET_STATE_STANDARDS: 'SET_STATE_STANDARDS',
    SET_IMAGE_DROP_UPLOADING: 'SET_IMAGE_DROP_UPLOADING',
    SET_QUIZ_IS_SUPER: 'SET_QUIZ_IS_SUPER',
    CLEAN_ELEMENTS_ARRAY: 'CLEAN_ELEMENTS_ARRAY',
    UPDATE_SELECTED_SLIDE: 'UPDATE_SELECTED_SLIDE',
    SET_SLIDES_TO_REORDER: 'SET_SLIDES_TO_REORDER',
    REORDER_SLIDES: 'REORDER_SLIDES',
    SET_ALL_QUESTION_TIME_CHANGE_LOADER: 'SET_ALL_QUESTION_TIME_CHANGE_LOADER',
    SET_QUIZ_WITHOUT_DRAFTS: 'SET_QUIZ_WITHOUT_DRAFTS',
    SET_ALL_QUESTION_POINTS_CHANGE_LOADER: 'SET_ALL_QUESTION_POINTS_CHANGE_LOADER',
    SET_QUESTION_EDITOR_DIMENSIONS: 'SET_QUESTION_EDITOR_DIMENSIONS',
    SET_ANSWER_EXPLANATION_VIEW: 'SET_ANSWER_EXPLANATION_VIEW',
    SET_PARSED_QUESTION_QUERY: 'SET_PARSED_QUESTION_QUERY',
    SET_TIPTAP_EDITOR_DATA: 'SET_TIPTAP_EDITOR_DATA',
    SET_VIDEO_RENDERED: 'SET_VIDEO_RENDERED',
    SET_HIDE_MEDIA: 'SET_HIDE_MEDIA',
    SET_HIDE_TEXT_CONTAINER: 'SET_HIDE_TEXT_CONTAINER',
    ADD_TIPTAP_REF: 'ADD_TIPTAP_REF',
    SET_FOCUSED_TIPTAP: 'SET_FOCUSED_TIPTAP',
    REMOVE_TIPTAP_REF: 'REMOVE_TIPTAP_REF',
    SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
    SET_VALIDATION_PENDING: 'SET_VALIDATION_PENDING',
    SET_CLIPBOARD_STATE: 'SET_CLIPBOARD_STATE',
    SET_SUBJECT_FOR_GENERATED_OPTIONS: 'SET_SUBJECT_FOR_GENERATED_OPTIONS',
    SET_AI_GENERATED: 'SET_AI_GENERATED',
    RESET_AI_GENERATED: 'RESET_AI_GENERATED',
    SET_QUIZ_GEN_FILTERS: 'SET_QUIZ_GEN_FILTERS',
    SET_QUIZ_GEN_QUESTIONS: 'SET_QUIZ_GEN_QUESTIONS',
    SET_INDEX_TO_ADD_QUIZ_GEN_QUESTIONS: 'SET_INDEX_TO_ADD_QUIZ_GEN_QUESTIONS',
  },

  currentQuiz: {
    SET_QUIZ: 'SET_QUIZ',
    SET_QUIZ_TAGS: 'SET_QUIZ_TAGS',
    SET_PUBLISHED_QUIZ_META: 'SET_PUBLISHED_QUIZ_META',
    SET_DRAFT_QUIZ_META: 'SET_DRAFT_QUIZ_META',
    SET_PERMISSIONS: 'SET_PERMISSIONS',
    SET_COAUTHORS: 'SET_COAUTHORS',
    SET_QUIZ_VISIBILITY: 'SET_QUIZ_VISIBILITY',
    UPDATE_QUESTION: 'UPDATE_QUESTION',
    SET_IS_TAGGED: 'SET_IS_TAGGED',
    RESET_QUIZ: 'RESET_QUIZ',
  },

  currentUser: {
    SET_USER_TAGS: 'SET_USER_TAGS',
    SET_LAST_CREATED_QUIZ: 'SET_LAST_CREATED_QUIZ',
    SET_REFERRAL_CAMPAIGNS: 'SET_REFERRAL_CAMPAIGNS',
    SET_RECOMMENDATION_META: 'SET_RECOMMENDATION_META',
  },

  slideEditor: {
    ADD_ELEMENT: 'ADD_ELEMENT',
    ADD_ELEMENT_COPY: 'ADD_ELEMENT_COPY',
    DELETE_ELEMENT: 'DELETE_ELEMENT',
    SET_SLIDE: 'SET_SLIDE',
    SET_SELECTED_ELEMENT: 'SET_SELECTED_ELEMENT',
    CREATE_MULTISELECT: 'CREATE_MULTISELECT',
    ADD_SELECTED_ELEMENT: 'ADD_SELECTED_ELEMENT',
    REMOVE_SELECTED_ELEMENT: 'REMOVE_SELECTED_ELEMENT',
    CLEAR_SELECTED_ELEMENTS: 'CLEAR_SELECTED_ELEMENTS',
    MULTISELECT_MOVE: 'MULTISELECT_MOVE',
    UPDATE_ELEMENT: 'UPDATE_ELEMENT',
    SET_ELEMENTS: 'SET_ELEMENTS',
    BRING_FORWARD: 'BRING_FORWARD',
    SEND_BACKWARD: 'SEND_BACKWARD',
    BRING_TO_FRONT: 'BRING_TO_FRONT',
    SEND_TO_BACK: 'SEND_TO_BACK',
    SET_THEME: 'SET_THEME',
    SET_CURRENT_THEME: 'SET_CURRENT_THEME',
    SET_CUSTOM_COLORS: 'SET_CUSTOM_COLORS',
    ROTATE: 'ROTATE',
    CENTER: 'CENTER',
    CORRECT_INDICES: 'CORRECT_INDICES',
    SET_TIPTAP_EDITOR_IN_FOCUS: 'SET_TIPTAP_EDITOR_IN_FOCUS',
    UPDATE_QUESTION_ID: 'UPDATE_QUESTION_ID',
    UPDATE_QUESTION: 'UPDATE_QUESTION',
    UPDATE_QUESTION_QUERY: 'UPDATE_QUESTION_QUERY',
    UPDATE_QUESTION_QUERY_TYPE: 'UPDATE_QUESTION_QUERY_TYPE',
    ADD_QUESTION_QUERY_MEDIA: 'ADD_QUESTION_QUERY_MEDIA',
    REMOVE_QUESTION_QUERY_IMAGE_MEDIA: 'REMOVE_QUESTION_QUERY_IMAGE_MEDIA',
    REMOVE_QUESTION_QUERY_AUDIO_MEDIA: 'REMOVE_QUESTION_QUERY_AUDIO_MEDIA',
    UPDATE_QUESTION_OPTION: 'UPDATE_QUESTION_OPTION',
    UPDATE_QUESTION_MATCH_OPTION: 'UPDATE_QUESTION_MATCH_OPTION',
    UPDATE_QUESTION_OPTIONS: 'UPDATE_QUESTION_OPTIONS',
    UPDATE_QUESTION_ANSWER: 'UPDATE_QUESTION_ANSWER',
    UPDATE_QUESTION_MATCHES: 'UPDATE_QUESTION_MATCHES',
    UPDATE_QUESTION_TARGETS: 'UPDATE_QUESTION_TARGETS',
    UPDATE_QUESTION_TARGET_BY_ID: 'UPDATE_QUESTION_TARGET_BY_ID',
    UPDATE_QUESTION_TIME: 'UPDATE_QUESTION_TIME',
    UPDATE_ORDER_OF_OPTIONS: 'UPDATE_ORDER_OF_OPTIONS',
    UPDATE_QUESTION_TOPICS: 'UPDATE_QUESTION_TOPICS',
    UPDATE_QUESTION_SETTINGS: 'UPDATE_QUESTION_SETTINGS',
    UPDATE_QUESTION_CORRECT_MARKS: 'UPDATE_QUESTION_CORRECT_MARKS',
    UPDATE_QUESTION_ANSWER_EXPLANATION: 'UPDATE_QUESTION_ANSWER_EXPLANATION',
    RESET_SLIDE_EDITOR: 'RESET_SLIDE_EDITOR',
    SET_BOX_SELECT_IN_PROGRESS: 'SET_BOX_SELECT_IN_PROGRESS',
    SET_SHOULD_SHOW_ELEMENT_FOCUS: 'SET_SHOULD_SHOW_ELEMENT_FOCUS',
    SET_CAN_SUBMIT_CUSTOM_RESPONSE: 'SET_CAN_SUBMIT_CUSTOM_RESPONSE',
    SET_FIB_VARIANT: 'SET_FIB_VARIANT',
    SET_ENABLE_ACCENT_MARKS: 'SET_ENABLE_ACCENT_MARKS',
    SET_IGNORE_ACCENT_MARKS_FOR_EVALUATION: 'SET_IGNORE_ACCENT_MARKS_FOR_EVALUATION',
    SET_QUESTION_HINTS: 'SET_QUESTION_HINTS',
    SET_ANSWER_LENGTH: 'SET_ANSWER_LENGTH',
    SET_SPECIAL_CHAR_INDICES: 'SET_SPECIAL_CHAR_INDICES',
    CLEANUP: 'CLEANUP',
    SET_SOURCE_PAGE: 'SET_SOURCE_PAGE',
    UPDATE_OPTIONS_AND_ANSWER: 'UPDATE_OPTIONS_AND_ANSWER',
    SET_HAS_MULTIPLE_CORRECT_SETTING: 'SET_HAS_MULTIPLE_CORRECT_SETTING',
    UPDATE_GRAPH_DATA_INTO_QUESTION: 'UPDATE_GRAPH_DATA_INTO_QUESTION',
    UPDATE_GRAPH_DATA_FROM_QUESTION: 'UPDATE_GRAPH_DATA_FROM_QUESTION',
    GRAPH: {
      SET_HOVER_GRAPH_TYPE: 'SET_HOVER_GRAPH_TYPE',
      SET_ANSWER_PLOT_TYPE: 'SET_ANSWER_PLOT_TYPE',
      SET_GRAPH_EDITOR_STATE: 'SET_GRAPH_EDITOR_STATE',
      SET_GRAPH_COMPONENT_READY: 'SET_GRAPH_COMPONENT_READY',
      SET_EDIT_GRAPH_MODAL_OPEN: 'SET_EDIT_GRAPH_MODAL_OPEN',
      SET_NON_INTERACTIVE_PLOTS: 'SET_NON_INTERACTIVE_PLOTS',
      SET_ANSWER_PLOT: 'SET_ANSWER_PLOT',
      SET_GRAPH_SCALE: 'SET_GRAPH_SCALE',
    },
    ANALYTICS: {
      SET_PARAMETER_VERSION: 'SET_PARAMETER_VERSION',
      SET_OPTION_GENERATOR_LOG_PROBS: 'SET_OPTION_GENERATOR_LOG_PROBS',
      SET_OPTION_GENERATOR_TOKENS: 'SET_OPTION_GENERATOR_TOKENS',
    },
    PREVIEW: {
      SET_PREVIEW: 'SET_PREVIEW',
      DISABLE_PREVIEW: 'DISABLE_PREVIEW',
      CONVERT_PREVIEW: 'CONVERT_PREVIEW',
      SET_GRAPH: 'SET_GRAPH',
    },
    QUESTION_TEMPLATE_SELECTED: 'QUESTION_TEMPLATE_SELECTED',
    RESET_SLIDE_QUESTION: 'RESET_SLIDE_QUESTION',
  },

  clipboard: {
    WRITE: 'WRITE',
  },

  classes: {
    SET_CLASSES: 'SET_CLASSES',
    SET_CLASS: 'SET_CLASS',
    REMOVE_CLASS_BY_ID: 'REMOVE_CLASS_BY_ID',
    ADD_CLASS: 'ADD_CLASS',
    ARCHIVE_CLASS: 'ARCHIVE_CLASS',
    SORT_CLASSES: 'SORT_CLASSES',
    ADD_MEMBERS_DATA: 'ADD_MEMBERS_DATA',
    UPDATE_MEMBERS: 'UPDATE_MEMBERS',
    UPDATE_LINK: 'UPDATE_LINK',
  },

  sales: {
    PICK_PLAN_TYPE: 'PICK_PLAN_TYPE',
    SET_NEW_SUB_STEPS_COMPLETED: 'SET_NEW_SUB_STEPS_COMPLETED',
    SET_NEW_SUB_STEPS_INDEX: 'SET_NEW_SUB_STEPS_INDEX',
    SET_ORG_DATA: 'SET_ORG_DATA',
    RESET_NEW_SUB_FLOW: 'RESET_NEW_SUB_FLOW',
    SET_SELECTED_TAB: 'SET_SELECTED_TAB',
  },

  orgDashboard: {
    SET_PREV_STATE: 'SET_PREV_STATE',
    SET_NEXT_STATE: 'SET_NEXT_STATE',
    SET_FINAL_STATE: 'SET_FINAL_STATE',
    SET_CURRENT_STATE: 'SET_CURRENT_STATE',

  },

  game: {
    SET_GAME_SOURCE: 'SET_GAME_SOURCE',
    INITIALIZE_STATE: 'INITIALIZE_STATE',
    RESET_STATE: 'RESET_STATE',
    SET_GAME_LOADING: 'SET_GAME_LOADING',
    SET_GAME_STOPPING: 'SET_GAME_STOPPING',
    SET_GAME_REPLAYING: 'SET_GAME_REPLAYING',
    SET_GAME_STATE: 'SET_GAME_STATE',
    SET_GAME_STARTED_AT: 'SET_GAME_STARTED_AT',

    // timer related mutations
    UPDATE_SET_TIMER_STATUS: 'UPDATE_SET_TIMER_STATUS',
    SET_TEST_TIMER_DURATION: 'SET_TEST_TIMER_DURATION',
    SET_TEST_TIMER_COUNTER: 'SET_TEST_TIMER_COUNTER',
    // Socket related mutations
    SET_SOCKET_CONNECTION: 'SET_SOCKET_CONNECTION',
    SET_GET_GAME_INITIAL_CALL: 'SET_GET_GAME_INITIAL_CALL',
    UPDATE_PLAYERS_LIST: 'UPDATE_PLAYERS_LIST',
    UPDATE_PLAYER_RESPONSE: 'UPDATE_PLAYER_RESPONSE',
    UPDATE_PLAYER_DONE_STATUS: 'UPDATE_PLAYER_DONE_STATUS',
    UPDATE_TEST_GAME_ACTIVITY_FOR_PLAYER: 'UPDATE_TEST_GAME_ACTIVITY_FOR_PLAYER',
    REMOVE_CURRENT_TEST_GAME_ACTIVITY: 'REMOVE_CURRENT_TEST_GAME_ACTIVITY',
    REMOVE_ALL_CURRENT_TEST_GAME_ACTIVITIES: 'REMOVE_ALL_CURRENT_TEST_GAME_ACTIVITIES',

    // paper mode
    SET_CURRENT_QUESTION: 'SET_CURRENT_QUESTION',
    SET_SKIP_UNSUPPORTED_QUESTIONS: 'SET_SKIP_UNSUPPORTED_QUESTIONS',
    SET_SHOW_OFFLINE_REPORTS: 'SET_SHOW_OFFLINE_REPORTS',
    SET_PLAYERS_RESPONSES: 'SET_PLAYERS_RESPONSES',
    SET_GAME_LEADERBOARD: 'SET_GAME_LEADERBOARD',
    SET_GAME_RESPONSES: 'SET_GAME_RESPONSES',
    SET_NEW_PLAYERS: 'SET_NEW_PLAYERS',
    SET_DEVICE_DETAILS: 'SET_DEVICE_DETAILS',
    SET_SCANNED_PLAYERS: 'SET_SCANNED_PLAYERS',
    SET_PAPER_MODE_ROSTER: 'SET_PAPER_MODE_ROSTER',
    SET_PREVIOUS_SCANNED_SET: 'SET_PREVIOUS_SCANNED_SET',
    SET_SHOW_SCANNED_RESPONSES: 'SET_SHOW_SCANNED_RESPONSES',
    SET_SCAN_STARTED: 'SET_SCAN_STARTED',
    RESET_PAPER_MODE_STORE: 'RESET_PAPER_MODE_STORE',

    SET_SHOW_SUMMARY_SCREEN: 'SET_SHOW_SUMMARY_SCREEN',
    TOGGLE_BACKGROUND_MUSIC: 'TOGGLE_BACKGROUND_MUSIC',
  },

  uiManager: {
    TOGGLE_FIB_SETTINGS_MODAL: 'TOGGLE_FIB_SETTINGS_MODAL',
    TOGGLE_FIB_ALTERNATIVE_ANSWER_SETTING: 'TOGGLE_FIB_ALTERNATIVE_ANSWER_SETTING',
    TOGGLE_FIB_BOX_SETTING_DISABLED: 'TOGGLE_FIB_BOX_SETTING_DISABLED',
    TOGGLE_QUESTION_PREVIEW_ON_EDITOR: 'TOGGLE_QUESTION_PREVIEW_ON_EDITOR',
    TOGGLE_CONTENT_CREATION_MODAL: 'TOGGLE_CONTENT_CREATION_MODAL',
    TOGGLE_CONTENT_PUBLISH_MODAL: 'TOGGLE_CONTENT_PUBLISH_MODAL',
    TOGGLE_BULK_IMPORT: 'TOGGLE_BULK_IMPORT',
    TOGGLE_BOTTOM_PROGRESS_POPUP: 'TOGGLE_BOTTOM_PROGRESS_POPUP',
    TOGGLE_LIBRARY_VIEW_PROGRESS_BAR: 'TOGGLE_LIBRARY_VIEW_PROGRESS_BAR',
    EDIT_BOTTOM_PROGRESS_POPUP: 'EDIT_BOTTOM_PROGRESS_POPUP',
    TOGGLE_LOG_ERROR_MODAL: 'TOGGLE_LOG_ERROR_MODAL',
    TOGGLE_QFW_MODAL: 'TOGGLE_QFW_MODAL',
    TOGGLE_QFW_GROUP_MODAL: 'TOGGLE_QFW_GROUP_MODAL',
    QFW_EVENT_TYPE: 'QFW_EVENT_TYPE',
    EDIT_LOG_ERROR_MODAL_CONFIG: 'EDIT_LOG_ERROR_MODAL_CONFIG',
    TOGGLE_VISIBLITY_SEARCH_BAR_QUIZ_PAGE: 'TOGGLE_VISIBLITY_SEARCH_BAR_QUIZ_PAGE',
    EDIT_LIBRARY_VIEW_CONFIG: 'EDIT_LIBRARY_VIEW_CONFIG',
    ADD_QUESTION_TO_CART: 'ADD_QUESTION_TO_CART',
    ADD_ALL_QUESTIONS_TO_CART: 'ADD_ALL_QUESTIONS_TO_CART',
    DELETE_QUESTION_FROM_CART: 'DELETE_QUESTION_FROM_CART',
    RESET_QUESTIONS_FROM_CART: ' RESET_QUESTIONS_FROM_CART',
    HIDE_ADD_TO_CART_HINT: 'HIDE_ADD_TO_CART_HINT',
    SET_QUIZ_EDITOR_DISPLAY_TYPE: 'SET_QUIZ_EDITOR_DISPLAY_TYPE',

    SET_CURRENT_BLANK_VALUE: 'SET_CURRENT_BLANK_VALUE',
    SET_FINAL_OPTIONS_FOR_BLANK_QUESTION: 'SET_FINAL_OPTIONS_FOR_BLANK_QUESTION',
    RESET_BLANK_EDITOR_CONFIG: 'RESET_BLANK_EDITOR_CONFIG',
    DELETE_BLANK_ID_FROM_CONFIG: 'DELETE_BLANK_ID_FROM_CONFIG',
    DELETE_BLANK_ID_FROM_VALUES: 'DELETE_BLANK_ID_FROM_VALUES',
    DELETE_BLANK_ID_FROM_FINAL_OPTIONS: 'DELETE_BLANK_ID_FROM_FINAL_OPTIONS',
    TRIGGER_BLANK_KEYPRESS: 'TRIGGER_BLANK_KEYPRESS',
    SET_EDITOR_VALIDATIONS: 'SET_EDITOR_VALIDATIONS',

    TOGGLE_PDF_IMPORT: 'TOGGLE_PDF_IMPORT',
    TOGGLE_EDIT_AFTER_IMPORT_EVENT: 'TOGGLE_EDIT_AFTER_IMPORT_EVENT',
    TOGGLE_FORMS_IMPORT: 'TOGGLE_FORMS_IMPORT',

    SHOULD_COLLAPSE_SIDEBAR: 'SHOULD_COLLAPSE_SIDEBAR',
    SET_IS_VALID_MATH_EQUATION: 'SET_IS_VALID_MATH_EQUATION',
    SET_HOTSPOT_TYPE: 'SET_HOTSPOT_TYPE',
    SET_HOTSPOT_MARK_AS_DONE_CTA: 'SET_HOTSPOT_MARK_AS_DONE_CTA',
    SET_DND_IMAGE_OPTION_FOCUS: 'SET_DND_IMAGE_OPTION_FOCUS',
    TOGGLE_DND_IMAGE_EDUCATION: 'TOGGLE_DND_IMAGE_EDUCATION',

    SET_NOTIFY_ME_CTA: 'SET_NOTIFY_ME_CTA',
    SET_MCQ_BANNER_VISIBILITY: 'SET_MCQ_BANNER_VISIBILITY',

    SET_QUIZ_GEN_DATA: 'SET_QUIZ_GEN_DATA',
    RESET_QUIZ_GEN_DATA: 'RESET_QUIZ_GEN_DATA',

  },

  teams: {
    SET_TEAMS: 'SET_TEAMS',
    SET_TEAM: 'SET_TEAM',
    SET_MEMBERS: 'SET_MEMBERS',
    DELETE_TEAM: 'DELETE_TEAM',
    DECREMENT_TEAM_CONTENT_COUNT: 'DECREMENT_TEAM_CONTENT_COUNT',
    SET_SHAREABLE_LINK: 'SET_SHAREABLE_LINK',
  },

  searchState: {
    SET_FILTER_TERM: 'SET_FILTER_TERM',
    SET_ALL_FILTERS: 'SET_ALL_FILTERS',
    RESET_FILTERS: 'RESET_FILTERS',
    SET_SORT_KEY: 'SET_SORT_KEY',
    TAG_QUIZ_ID: 'TAG_QUIZ_ID',
    SET_SEARCH_SOURCE: 'SET_SEARCH_SOURCE',
    SET_SEARCH_TERM: 'SET_SEARCH_TERM',
    SET_MATH_STANDARDS: 'SET_MATH_STANDARDS',
  },

  PapperModeRoster: {
    SET_CURRENT_ROSTER: 'SET_CURRENT_ROSTER',
    SET_ROSTERS: 'SET_ROSTERS',
    UPDATE_ROSTERS: 'UPDATE_ROSTERS',
    REMOVE_ROSTER: 'REMOVE_ROSTER',
    UPDATE_ROSTER: 'UPDATE_ROSTER',
  },
};

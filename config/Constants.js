/** WARNING: DO NOT ADD i18n to this file as it causes cyclic dependancies causing some builds to fail.
 * This file is only meant to add Constants and not Copies that require translations.
 * If you need to add a copy that requires translations, add it to DefaultCopies.js
 * */

import themes from '~/config/ThemesForSlidesWithShapes';
import WebEventsConstants from '~/config/WebEvents';

import {
  QuestionTypes, AudioVideoResponseTypes, QuestionDefaultTimes, StableConversionQuestionTypes,
  QuestionOptionLimits,
  DisplayVariantNames,
  EditorQueryParameters,
} from './Constants/EditorConstants';
import { SUPER_GIFTING_EXPIRY_DATE } from './Constants/Referral.constants.js';
import { DEFAULT_DURATION_STRING_FORMAT } from './Constants/DateAndTime.constants.js';
import { deviceDimensionRanges } from './TailwindConstants';
import NodeEnvs from './NodeEnvs';

const defaultTheme = themes.basicThemes[0];
const HourToMiliSecondsConversionFactor = 1000 * 60 * 60;
const MinToMiliSecondsConversionFactor = 1000 * 60;
const DIMENSION_FOR_720P = [1280, 720];
const QuestionDefaultPoints = 1;

const LibraryThresholds = {
  MY_LIBRARY_CONTENT_EXCEED_LIMIT: 20,
  MY_LIBRARY_CONTENT_APPROACHING_LIMIT: 15,
};

const QuestionTypeSections = {
  ASSESSMENT: 'ASSESSMENT',
  HIGHER_ORDER_THINKING: 'HIGHER_ORDER_THINKING',
  OTHER: 'OTHER',
};

const LibrarySections = {
  ALL_QUIZZES: 'allQuizzes',
  CREATED_BY_ME: 'createdByMe',
  HOSTED_QUIZZES: 'hostedQuizzes',
  LIKED_QUIZZES: 'likedQuizzes',
  SHARED_WITH_ME: 'sharedWithMe',
  DRAFT_QUIZZES: 'draftQuizzes',
  IMPORTED: 'imported',
  STANDARD_TAGGING: 'StandardTagging',
  STANDARD_TAGGING_COUNT: 'standardTaggedQuizzes',
};

const EntityTypes = {
  MEME: 'meme',
  IMAGE: 'image',
};

const ImageUploadTypes = {
  MEMES: 'memes',
  QUIZZES: 'quizzes',
};

const allowedPathsForGoogleClientTranslation = [
  /admin\/search\/.+?/, // Search page
  /admin\/quiz\/start_new\/[0-9a-f]+?/, // Classic settings page
  /admin\/quiz\/tp\/[0-9a-f]+?/, // Teacher paced settings page
  /admin\/quiz\/homework\/[0-9a-f]+?/, // Homework settings page
  /admin\/quiz\/[0-9a-f]+?\/.+?/, // Quiz info page
  /admin\/presentation\/[0-9a-f]+?\/.+?/, // Lesson info page
  /quiz\/creator\/[0-9a-f]+?\/edit/, // Quiz edit page (for clone support)
  /print\/quiz/, // Print quiz page
];

const qfwConfig = {
  signUp: {
    sources: [
      'fw_header',
      'fw_hero',
      'fw_footer',
      'fw_pricing',
      'fw_landing_header',
      'fw_landing_header_burger',
      'sol_et_hero',
      'sol_ce_footer',
      'sol_ce_hero',
      'sol_ce_footer',
      'sol_pres_hero',
      'sol_pres_footer',
      'sol_ce_try_brand_link',
      'sol_ce_try_connect_link',
      'sol_et_try_link',
      'sol_pres_try_link',
    ],
    image: 'https://cf.quizizz.com/image/qfwSignUpImage.png',
    copy: {
      testimonialOne: '',
      testimonialTwo: 'Join over 200 million educators and learners on Quizizz',
    },
  },
};

const PlotType = {
  None: 0,
  Points: 1,
  Linear: 2,
  Quadratic: 3,
  Exponential: 4,
};

const AngleMode = {
  DEGREE: 'degree',
  RADIAN: 'radian',
};

const AnswerResponseDescriptors = {
  Answer: 'Answer',
  Upload: 'Upload',
};

/**
 * This is used to show the banner at top section on library page.
 * Make the required changes here if the banner need changes like src, link and analytics event.
*/
const LibraryPageBannerSection = {
  SOURCE: 'https://cf.quizizz.com/img/banners/hotspot_labelling_graphing_Final Gif V1.gif',
  LINK: 'https://quizizz.com/join?gc=67038311',
  ANALYTICS_EVENT: WebEventsConstants.LIBRARY_PAGE_NEW_QTYPE_BANNER_CLICKED,
};

export default {
  ContentNameMaxLength: 64,
  qfwConfig,
  PlotType,
  AngleMode,
  AnswerResponseDescriptors,

  ImageUploadTypes,

  StableConversionQuestionTypes,

  QuestionDefaultPoints,

  EntityTypes,

  NodeEnvs,

  EditorQueryParameters,

  MediaEnvs: {
    DEV: 'dev',
    LOCAL: 'local',
    PROD: 'prod',
    TEST: 'test',
  },

  AccountTypes: {
    ANONYMOUS: 'log-in',
    BASIC: 'basic',
    SUPER: 'super',
    SCHOOL_AND_DISTRICT: 'school-and-district',
    CORPORATE_INTRO: 'corporate-intro',
    CORPORATE_STANDARD: 'corporate-standard',
    CORPORATE_STANDARD_NONPROFIT: 'corporate-standard-nonprofit',
    CORPORATE_PREMIER: 'corporate-premier',
    CORPORATE_STARTER: 'corporate-starter',
  },

  UserOccupation: {
    STUDENT: 'student',
    TEACHER_UNIVERSITY: 'teacher_university',
    TEACHER_SCHOOL: 'teacher_school',
    TEACHER: 'teacher',
    PARENT: 'parent',
    SCHOOL_ADMIN: 'school_admin',
    DISTRICT_ADMIN: 'district_admin',
    OTHER: 'other',
    PERSONAL: 'personal',
    ADMINISTRATOR: 'administrator',
    INSTRUCTIONAL_TECH_COACH: 'instructional_tech_coach',
    DEPARTMENT_HEAD: 'department_head',
    CORPORATE: 'corporate',
    CORPORATE_TEACHER: 'corporate_teacher',
    CORPORATE_LEARNER: 'corporate_learner',
  },

  TeacherOccupations: ['teacher', 'teacher_school', 'teacher_university', 'department_head', 'instructional_tech_coach'],

  UserGradeMap: {
    0: 'primary school',
    1: 'primary school',
    2: 'primary school',
    3: 'primary school',
    4: 'primary school',
    5: 'primary school',
    6: 'middle school',
    7: 'middle school',
    8: 'middle school',
    9: 'high school',
    10: 'high school',
    11: 'high school',
    12: 'high school',
    13: 'university',
    14: 'professional development',
  },

  UnderAgeThreshold: {
    GDRPRCountries: 16,
    NonGDPRCountries: 13,
  },

  UserTypes: {
    UNREGISTERED: 'unregistered',
    BASIC: 'basic',
    QUIZIZZ: 'quizizz',
    PAID: 'paid',
    SND: 'snd',
  },

  EditModes: {
    DEFAULT: 'default',
    IMAGE_MEDIA: 'image-media',
    OTHER_MEDIA: 'other-media',
    MATH: 'math',
    SHAPE: 'shape',
    TEXT: 'text',
    TABLE: 'table',
  },

  QuestionTypes,

  QuestionTypeSections,

  SlideTypes: {
    ...QuestionTypes,
    CONTENT_SLIDE_V1: 'SLIDE',
    CONTENT_SLIDE_V2: 'SLIDEV2',
  },

  ContentType: {
    QUIZ: 'quiz',
    PRESENTATION: 'presentation',
    GCSE: 'gcse',
  },

  SearchResultsType: {
    QUIZ: 'quiz',
    PRESENTATION: 'presentation',
    COLLECTION: 'collection',
  },

  SlideTemplates: {
    DEFAULT_FIRST_SLIDE: 'deafult-first-slide',
    TITLE_SUBTITLE: 'title-subtitle',
    TITLE_TEXT: 'title-text',
    BLANK: 'blank',
    TITLE_TEXT_MEDIA: 'media-text',
    TITLE_BULLETS_MEDIA: 'two-col-media',
    FULLSCREEN_MEDIA: 'fullscreen-media',
    WEBPAGE_LINK: 'webpage-link',
  },

  QuestionStructureTypes: {
    TEXT: 'text',
    IMAGE: 'image',
  },

  LibraryPageSize: 10,

  SlideFontSizes: [8, 10, 12, 14, 18, 24, 32, 36, 48, 60, 72, 96, 144],

  RoleListForAdmin: [
    'teacher',
    'school_admin',
    'district_admin',
    'instructional_tech_coach',
    'department_head',
    'other',
  ],

  TypedQuestionResponseTypes: {
    STRING: 'string',
    NUMBER: 'number',
  },

  DeviceTypes: {
    PHONE: 'mobile',
    TABLET: 'tablet',
    DESKTOP: 'desktop',
  },

  DeviceOrientations: {
    PORTRAIT: 'portrait',
    LANDSCAPE: 'landscape',
  },

  CroppingAllowedForExtensions: ['jpg', 'jpeg', 'png', 'svg', 'webp'],

  DeviceDimensionRanges: deviceDimensionRanges,

  QuestionValidationErrorCodes: {
    EMPTY_QUESTION_QUERY: 'emptyQuestionQuery',
    TOO_FEW_OPTIONS: 'tooFewOptions',
    TOO_MANY_OPTIONS: 'tooManyOptions',
    ANSWER_NOT_MARKED: 'answerNotMarked',
    IMAGE_NOT_ADDED: 'imageNotAdded',
    ANSWER_NOT_VALID_MCQ: 'answerNotValidMCQ',
    ANSWER_NOT_VALID_MSQ: 'answerNotValidMSQ',
    CANNOT_MARK_EMPTY_OPTION_AS_ANSWER: 'cannotMarkEmptyOptionAsAnswer',
    FIB_ANSWER_NOT_MARKED: 'fibAnswerNotMarked',
    OPTIONS_EXCEEDING_5: 'optionsExceeding5',
    INCORRECT_OPTION_DATA: 'incorrectOptionData',
    NON_SUPER_VIDEO_ANSWER: 'nonSuperVideoAnswerSelected',
    ANSWER_TIME_NOT_SELECTED: 'answerTimeNotSelected',
    TOO_FEW_MATCHES: 'tooFewMatches',
    TOO_FEW_BLANKS: 'tooFewBlanks',
    TOO_MANY_CHARACTERS: 'tooManyCharacters',
    MISSING_OPTION_FOR_MATCH: 'missingOptionForMatch',
    EMPTY_CORRECT_ANSWER: 'emptyCorrectAnswer',
    EQUATION_ANSWER_NOT_MARKED: 'equationAnswerNotMarked',
    INVALID_MATH: 'invalidMath',
    GRAPHING_ANSWER_NOT_VALID: 'graphingAnswerNotValid',
    TOO_FEW_OPTION_GROUPS: 'tooFewOptionGroups',
    INVALID_OPTIONS_COUNT_IN_OPTION_GROUP: 'invalidOptionsCountInOptionsGroup',
  },

  PlacePicker: {
    SCHOOL: 'school',
    CORPORATE: 'corporate',
    PERSONAL: 'personal',
  },

  SuperUpsellTypes: {
    THEMES: 'themes',
    BULK_ADD_TELEPORT: 'premiumContent-bulkAddTeleport',
    LESSON_THEME: 'lesson-theme',
    EDIT_PRESENTATION: 'edit-presentation',
    EDIT_QUIZ: 'edit-quiz',
    PRIVATE_CONTENT_QUIZ: 'private-content-quiz',
    PRIVATE_CONTENT_PRESENTATION: 'private-content-presentation',
    PREMIUM_CONTENT: 'premium-content',
    PREMIUM_RECOMMENDED: 'premium-recommended',
    ASYNC_GAMES_UNLIMITED: 'async-game-unlimited',
    GAMES_SCHEDULE_LATER: 'game-schedule-later',
    CUSTOM_TAGS: 'custom-tags',
    HARD_TIMER: 'hard-timer',
    QBANK: 'gameSetting-qbank',
    REOPEN_GAMES: 'reopen-games',
    ADS_FREE: 'ads-free',
    SHARE_REPORT: 'shareReport',
    IMAGE_SEARCH: 'image-search',
    AUDIO: 'content-audioInQuestion',
    VIDEO: 'content-videoInQuestion',
    LMS_CUSTOM_GRADING: 'lms-custom-grading',
    PLAY_QUIZ: 'play-quiz',
    AUDIO_QUESTION: 'audio-questions',
    VIDEO_QUESTION: 'video-questions',
    MATCH_QUESTION: 'match-questions',
    HOTSPOT_QUESTION: 'hotspot-questions',
    DND_IMAGE_QUESTION: 'dndImage-questions',
    REORDER_QUESTION: 'reorder-questions',
    EDIT_RUNNING_QUESTION: 'edit-running-question',
    REFERRAL_UPSELL: 'referral_upsell',
    CLASSES_UPSELLL: 'classes-upsell',
    SIGNUP_UPSELL: 'signup_upsell',
    CAN_SHOW_WORK: 'can_show_work',
    ADVANCED_ANTI_CHEATING: 'advanced_anti_cheating',
    DRAGNDROP_QUESTION: 'drag-n-drop-questions',
    MATH_RESPONSE_QUESTION: 'math-response-questions',
    DROPDOWN_QUESTION: 'dropdown-questions',
    EQUATION_QUESTION: 'equation-questions',
    GRAPHING_QUESTION: 'graphing-questions',
    SKIP_QUESTION: 'skipQuestion',
    SCHEDULE_LATER: 'scheduleLater',
    UPGRADE_TO_PUBLISH_QUIZ_WITH_SUPER_QUESTIONS:
      'upgradeToPublishQuizWithSuperQuestions',
    DEADLINE_NONE: 'gamesettings_deadline_none',
    OPTIONS_GENERATOR_UPSELL: 'options_generator_upsell',
    TOP_CREATOR_UPSELL: 'top_creator_upsell',
    EDIT_PREMIUM_WEEK_QUIZ: 'edit-premium-week-quiz',
    AUTO_CONVERTED_CONTENT: 'auto-converted-content',
  },

  FeatureTypes: {
    ANSWER_EXPLANATION: 'answerExplanation',
    ADS_FREE: 'adsFree',
    ASYNC_GAME_UNLIMITED: 'longGameExpiry',
    TOPIC_TAGS: 'tagQuestionTopics',
    REOPEN_GAMES: 'reopenGames',
    AUDIO: 'audio',
    VIDEO: 'video',
    MATCH: 'match',
    REORDER: 'reorder',
    EDIT_PUBLIC_QUIZ: 'editPublicQuiz',
    EDIT_PUBLIC_PRESENTATION: 'editPublicPresentation',
    PRIVATE_CONTENT_QUIZ: 'privateContentQuiz',
    PRIVATE_CONTENT_PRESENTATION: 'privateContentPresentation',
    THEMES: 'themes',
    QBANK: 'qbank',
    PREMIUM_CONTENT: 'premiumContent',
    PREMIUM_RECOMMENDED: 'premiumRecommended',
    FIB_MATCHERS: 'fibMatchers',
    FREE_TRIAL_14: 'freeTrial14',
    LESSON_THEMES: 'lesson_themes',
    LMS_CUSTOM_GRADING: 'lmsCustomGrading',
    IMAGE_SEARCH: 'imageSearch',
    HARD_TIMER: 'hard-timer',
    BRANDING: 'branding',
    INFINITE_GAME_EXPIRY: 'infiniteGameExpiry',
    PLAY_QUIZ: 'playQuiz',
    CAN_SHOW_WORK: 'canShowWork',
    STUDENT_REPORTS: 'studentReport',
    AUDIO_QUESTION: 'audioQuestion',
    VIDEO_QUESTION: 'videoQuestion',
    MATCH_QUESTION: 'matchQuestion',
    REORDER_QUESTION: 'reorderQuestion',
    DRAGNDROP_QUESTION: 'dragNDropQuestion',
    DROPDOWN_QUESTION: 'dropdownQuestion',
    EQUATION_QUESTION: 'equationQuestion',
    HOTSPOT_QUESTION: 'hotspotQuestion',
    DND_IMAGE_QUESTION: 'dndImageQuestion',
    GRAPHING_QUESTION: 'graphingQuestion',
    DISTRICT_LIBRARY: 'districtLibrary',
    GCL: 'gcl',
    FOCUS_MODE: 'focusMode',
    REVIEW_AND_SUBMIT: 'reviewAndSubmit',
    SKIP_QUESTION: 'skipQuestion',
    SCHEDULE_LATER: 'scheduleLater',
    SUPER_QUESTION_SAVE_MODAL: 'super_question_save_modal',
    EDIT_RUNNING_QUESTION: 'edit-running-question',
    SHARE_REPORT: 'shareReport',
    BULK_ADD_TELEPORT: 'premiumContent-bulkAddTeleport',
    EDIT_PREMIUM_WEEK_QUIZ: 'edit-premium-week-quiz',
    DRAGNDROP_INTENT: 'dndIntent',
    HOTSPOT_INTENT: 'hotspotIntent',
    HAS_REDEMPTION_PASS: 'hasRedemptionPass',
    MATH_RESPONSE_INTENT: 'mathResponseIntent',
    Q_MEDIA: 'qmedia',
    REDEMPTION: 'redemption',
    EXTRA_LIFE: 'extraLife',
    MASTERY_MODE: 'masteryMode',
    TIMER_3: 'timer_3',
    STUDENT_LEADERBOARD: 'studentLeaderboard',
    SHOW_ANSWERS_2: 'showAnswers_2',
    MYSTIC_PEAK: 'mysticPeak',
    AUTO_CONVERTED_CONTENT: 'auto-converted-content',
  },

  SlideTypesV1: {
    TITLE_SUBTITLE: 'TITLE_SUBTITLE',
    TITLE_PARA: 'TITLE_PARA',
    TITLE_BULLETS: 'TITLE_BULLETS',
    MEDIA_SUBTITLE: 'MEDIA_SUBTITLE',
    TITLE_PARA_MEDIA: 'TITLE_PARA_MEDIA',
    TITLE_BULLETS_MEDIA: 'TITLE_BULLETS_MEDIA',
    EMBED_WEBPAGE: 'EMBED_WEBPAGE',
  },

  SlideMediaTypes: {
    YOUTUBE: 'youtube',
    IMAGE: 'image',
    AUDIO: 'audio',
  },

  ContextMenu: {
    WIDTH: 224,
    WIDTH_CLASS: 'w-56',
    ITEM_HEIGHT: 36,
  },

  AllBlankQuestionMatchers: {
    EXACT: 'exact',
    CONTAINS: 'contains',
    EXACT_NUMBER: 'exact_num',
  },

  MathQuestionMatchers: {
    EXACT: 'exact',
    EQUIVALENCE: 'equivalence',
  },

  DefaultShapeProperties: {
    FILL_COLOR: '#E5E5E6',
    TEXT_COLOR: '#070A0E',
    BORDER_COLOR: '#464C53',
    BORDER_WIDTH: 2,
    WIDTH: 160,
    HEIGHT: 160,
    MIN_WIDTH: 32,
    MIN_HEIGHT: 32,
    MIN_HEIGHT_FOR_TEXT: 64,
    MIN_WIDTH_FOR_TEXT: 64,
  },

  AddTimeModalOptions: [
    {
      value: 1,
      label: '+ 1 mins',
    },
    {
      value: 5,
      label: '+ 5 mins',
    },
    {
      value: 15,
      label: '+ 15 mins',
    },
  ],

  HourMinuteSelectorDefaultHours: [
    0,
    HourToMiliSecondsConversionFactor,
    2 * HourToMiliSecondsConversionFactor,
    3 * HourToMiliSecondsConversionFactor,
    4 * HourToMiliSecondsConversionFactor,
    5 * HourToMiliSecondsConversionFactor,
  ],

  HourMinuteSelectorDefaultMins: [
    0,
    5 * MinToMiliSecondsConversionFactor,
    10 * MinToMiliSecondsConversionFactor,
    15 * MinToMiliSecondsConversionFactor,
    30 * MinToMiliSecondsConversionFactor,
    45 * MinToMiliSecondsConversionFactor,
  ],

  QuestionDefaultTimes,

  QuestionDefaultTimesInSecs: [5, 10, 20, 30, 45, 60, 120, 180, 300, 900],

  QuestionTypesForExcel: {
    MULTIPLE_CHOICE: 'Multiple Choice',
    CHECKBOX: 'Checkbox',
    FILL_IN_THE_BLANK: 'Fill-in-the-Blank',
    OPEN_ENDED: 'Open-Ended',
    POLL: 'Poll',
    DRAW: 'Draw',
  },

  AudioVideoResponseTypes,

  AllowedQuestionTimeInSeconds: [
    5, 10, 20, 30, 45, 60, 90, 120, 180, 300, 600, 900,
  ],

  groupColors: [
    '#F44336',
    '#3F51B5',
    '#4CAE50',
    '#FFC108',
    '#9E9E9E',
    '#E91D63',
    '#2096F3',
    '#8BC34A',
    '#FF9802',
    '#607D8B',
    '#9C26B0',
    '#01BCD4',
    '#CDDC39',
    '#FF5721',
    '#34495E',
    '#673AB7',
    '#009588',
    '#FFEB3B',
    '#795548',
    '#1E272E',
  ],

  AudioVideoResponseTypeDetails: [
    {
      icon: 'micRecorder',
      title: AudioVideoResponseTypes.AUDIO,
    },
    {
      icon: 'videoRecorder',
      title: AudioVideoResponseTypes.VIDEO,
    },
  ],

  AudioVideoOptionTimes: [
    5 * 1000,
    10 * 1000,
    30 * 1000,
    60 * 1000,
    2 * 60 * 1000,
  ],

  TypedQuestionAnswerAllowedLength: {
    [QuestionTypes.BLANK]: 160,
    [QuestionTypes.POLL]: 1000,
  },

  EditorDimensions: {
    CONTENT_SLIDE: DIMENSION_FOR_720P,
    INTERACTIVE_SLIDE: DIMENSION_FOR_720P,

    DND_IMAGE_CANVAS: {
      WIDTH: 600,
      HEIGHT: 600,
    },
  },

  HotspotTypes: {
    CIRCLE: 'circle',
    RECTANGLE: 'rectangle',
    FREEFORM: 'polygon',
  },

  ToastTypes: {
    DEFAULT: 'DEFAULT',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
  },

  DefaultSlideTheme: {
    BGCOLOR: defaultTheme.bgColor,
    TEXT_COLOR: defaultTheme.textColor,
    FONT_FAMILY: defaultTheme.fontFamily,
    TITLE_FONT_FAMILY: defaultTheme.titleFontFamily,
    LARGE_SHAPE_COLOR: defaultTheme.largeShapeColor,
    SMALL_SHAPE_COLOR: defaultTheme.smallShapeColor,
    LINK_COLOR: defaultTheme.linkColor,
  },

  BottomNavTabs: {
    EXPLORE: 'EXPLORE',
    LIBRARY: 'LIBRARY',
    CREATE: 'CREATE',
    REPORTS: 'REPORTS',
    CLASSES: 'CLASSES',
  },

  GoogleSearchLimit: 10,

  HistoryOps: {
    ADD_ELEMENT: 'ADD_ELEMENT',
    DELETE_ELEMENT: 'DELETE_ELEMENT',
    UPDATE_ELEMENT: 'UPDATE_ELEMENT',
    ADD_SLIDE: 'ADD_SLIDE',
    DELETE_SLIDE: 'DELETE_SLIDE',
    SELECT_SLIDE: 'SELECT_SLIDE',
    UPDATE_QUESTION: 'UPDATE_QUESTION',
    REORDER_SLIDE: 'REORDER_SLIDE',
  },

  UIConstants: {
    PresentationEditor: {
      SlideCanvasOffsetX: 200,
      SlideCanvasOffsetY: 96,
    },
  },

  HistoryStackProps: {
    WindowSize: 100,
  },

  GameType: {
    LIVE: 'live',
    ASYNC: 'async',
    SOLO: 'solo',
  },

  TypeOfEducator: {
    ELEMENTARY_SCHOOL_EDUCATOR: 'elementary_school_educator',
    MIDDLE_SCHOOL_EDUCATOR: 'middle_school_educator',
    HIGH_SCHOOL_EDUCATOR: 'high_school_educator',
    UNIVERSITY_EDUCATOR: 'university_educator',
    PROFESSIONAL_DEVELOPMENT: 'professional_development',
  },

  SIGNUP_PAGES: {
    SIGNUP_TYPE_SELECT: 'signup_type_select',
    SIGNUP_SELECT_ORG: 'signup_select_org',
    SIGNUP_ACCOUNT_INFO: 'signup_account_info',
    SIGNUP_ROLE_PICKER: 'signup_role_picker',
    SIGNUP_QFW_ROLE_PICKER: 'signup_qfw_role_picker',
    SIGNUP_QFW_ROLE_DESCRIPTION_ORG_PICKER:
      'signup_qfw_roledescription_orgname_picker',
    SIGNUP_DOB_CHECK: 'signup_dob_check',
    SIGNUP_GRADE_PICKER: 'grade-picker',
    CREATE_ORG: 'create_org',
  },

  CancelSubscriptionPages: {
    MANAGE_SUBSCRIPTION: 'ManageSubscriptionDetails',
    CANCELATION_DETAILS: 'ManageSubscriptionCancelationDetails',
    SURVEY: 'ManageSubscriptionCancelationSurvey',
    POST_CANCELATION: 'ManageSubscriptionPostCancelation',
  },

  GameMode: {
    NORMAL: 'normal',
    LIVE: 'live',
    TEAM: 'team',
    TEST: 'test',
    CHALLENGE: 'challenge',
    TEACHER_PACED: 'tp',
    PRESENTATION: 'pres',
    FLASHCARD: 'flashcard',
    MYSTIC_PEAK: 'mystic_peak',
  },

  GameSettingTypes: {
    LIVE: 'live',
    ASYNC: 'async',
    TEAM: 'team',
    TEST: 'test',
    NO_DEVICE: 'no_device',
    CHALLENGE: 'challenge',
    TEACHER_PACED: 'tp',
    PRESENTATION_ASYNC: 'pres_async',
    PRESENTATION_TEACHER_PACED: 'pres_tp',
    TEACHER_PACED_OFFLINE: 'tp_offline',
  },

  GameOptionsValues: {
    Redemption: {
      NO: 'no',
      YES: 'yes',
    },
    HasRedemptionPass: {
      NO: 'no',
      YES: 'yes',
    },
    Powerups: {
      NO: 'no',
      YES: 'yes',
    },
    StudentLiveReactions: {
      YES: true,
      NO: false,
    },
    StudentLeaderboard: {
      YES: true,
      NO: false,
    },
    ShowAnswers: {
      NEVER: 'never',
      ALWAYS: 'always',
      PARTIAL: 'partial',
    },
    StudentQuizReview: {
      YES: 'yes',
      QONLY: 'qonly',
      NO: 'no',
    },
    Timer: {
      OFF: 'off',
      CLASSIC: 'classic',
      STRICT: 'strict',
    },
    ExtraLife: {
      ENABLED: 'ENABLED',
      DISABLED: 'DISABLED',
    },
  },
  GameSettingsUpsellType: {
    SND_UPSELL: 'snd_upsell',
    SUPER_UPSELL: 'super_upsell',
    NORMAL: 'normal',
  },
  SettingPagePopUpTypes: {
    TIMER: 'timer',
    ADAPTIVE_LEARNING: 'adaptive',
    ADVANCED_ANTI_CHEATING: 'advanced-anti-cheating',
    SKIP_QUESTION: 'skipQuestion',
    REVIEW_AND_SUBMIT: 'reviewAndSubmit',
  },

  GameOptions: {
    ADAPTIVE: 'adaptive',
    EXTRA_LIFE: 'extraLife',
    FOCUS_MODE: 'focusMode',
    REVIEW_AND_SUBMIT: 'reviewAndSubmit',
    GROUP_IDS: 'groupIds',
    LOGIN_REQUIRED: 'loginRequired',
    JUMBLE: 'jumble',
    JUMBLE_ANSWERS: 'jumbleAnswers',
    LIMIT_ATTEMPTS: 'limitAttempts',
    MEMES: 'memes',
    MIRROR: 'mirror',
    NICKNAME_GENERATOR: 'nicknameGenerator',
    NUM_OF_TEAMS: 'numOfTeams',
    POWER_UPS: 'powerups',
    QUESTIONS_PER_ATTEMPT: 'questionsPerAttempt',
    REDEMPTION: 'redemption',
    HAS_REDEMPTION_PASS: 'hasRedemptionPass',
    SCHEDULED_AT: 'scheduledAt',
    SCHEDULE_LATER: 'scheduleLater',
    SHOW_ANSWERS: 'showAnswers',
    SHOW_ANSWERS_2: 'showAnswers_2',
    SKIP_QUESTION: 'skipQuestion',
    STUDENT_LIVE_REACTIONS: 'studentLiveReactions',
    STUDENT_QUIZ_REVIEW: 'studentQuizReview',
    STUDENT_QUIZ_REVIEW_2: 'studentQuizReview_2',
    STUDENT_MUSIC: 'studentMusic',
    STUDENT_LEADERBOARD: 'studentLeaderboard',
    TEST_TIMER: 'testTimer',
    TIMER: 'timer',
    TIMER_3: 'timer_3',
    MASTERY_MODE: 'masteryMode',
    MYSTIC_PEAK: 'mysticPeak',
    ALLOW_ISSUES: 'allowIssues',
  },

  GameState: {
    WAITING: 'waiting',
    RUNNING: 'running',
    COMPLETED: 'completed',
    STOPPED: 'stopped',
  },

  MIN_USER_CREATION_DATE_FOR_NEW_EDITOR: '2021-09-27',

  PageNames: {
    SEARCH_PAGE: 'admin-search-term',
    MY_LIBRARY: 'admin-private',
    CORPORATE: 'admin-corporate',
    CLASSES_PAGE: 'admin-classes',
    CLASS_PAGE: 'admin-class',
    ADMIN_ROOT: 'admin',
    ADMIN_DISTRICT: 'admin-district',
    TEACHER_ONBOARDING: 'onboarding-teacher',
    SND_DASHBOARD: 'snd-dashboard',
    SND_SCHOOL_DASHBOARD: 'snd-dashboard-school-schoolId',
    MANAGE_SUBSCRIPTION: 'admin-subscription-manage',
    QUESTION_EDITOR: 'quiz-creator-id-editor-id',
    QUIZ_PAGE: 'admin-sectionName-id',
    SUPER_PRICING_PAGE: 'super-pricing',
    QUESTION_EDITOR_MOBILE: 'quiz-creator-id-editor-id',
    PRICING_PG_V2: 'pricing-page-v2',
  },

  TOOLBAR_HEIGHT: 48,
  QUESTION_EDITOR_MENUS_HEIGHT: 100,

  DrawQuestionLineColors: [
    { name: 'Red', value: '#D92635' },
    { name: 'Orange', value: '#EFA929' },
    { name: 'Yellow', value: '#FFDD33' },
    { name: 'Jade', value: '#6FB24D' },
    { name: 'Green', value: '#1F9350' },
    { name: 'Teal', value: '#2D9DA6' },
    { name: 'Blue', value: '#2D70AE' },
    { name: 'Purple', value: '#9A4292' },
    { name: 'Pink', value: '#D5546D' },
    { name: 'Black', value: '#070A0E' },
    { name: 'White', value: '#FFFFFF' },
  ],

  DrawQuestionTool: {
    PEN: 'PEN',
    HIGHLIGHTER: 'HIGHLIGHTER',
    ERASER: 'ERASER',
  },

  OrderQuestionArrangement: {
    ASC: 'asc',
    DESC: 'desc',
  },

  DrawQuestionBlankImage:
    'https://cf.quizizz.com/img/presentation/v2/blank_canvas.png',

  SliderOrientation: {
    HORIZONTAL: 'HORIZONTAL',
    VERTICAL: 'VERTICAL',
  },

  QuestionOptionLimits,
  DisplayVariantNames,

  SubjectSelectionErrors: {
    LIMIT_EXCEEDED: 'limitExceeded',
    NO_SUBJECT_SELECTED: 'noSubjectSelected',
  },

  GradeSelectionErrors: {
    NO_GRADE_SELECTED: 'noSubjectSelected',
  },

  TeleportPageTypes: {
    QUIZ_EDITOR: 'quiz-editor',
    PRESENTATION_EDITOR: 'presence-editor',
  },

  ApiErrors: {
    CONCURRENT_GAME_LIMIT_EXCEEDED: 'host.CONCURRENT_LIMIT_EXCEEDED',
    RESOURCE_ALREADY_REQUESTED: 'invite.ALREADY_REQUESTED',
  },

  ReferralCampaigns: {
    QUIZIZZ_ENGLISH_CAMPAIGN: '29521',
    QUIZIZZ_INDONESIAN_CAMPAIGN: '29903',
    QUIZIZZ_TEST_CAMPAIGN: '29361',
    QUIZIZZ_SCHOOL_CAMPAIGN: '31747',
    QUIZIZZ_SUPER_TRAINER_CAMPAIGN: '32649',
    QUIZIZZ_SUPER_TRAINEE_CAMPAIGN: '32645',
  },

  ResourcePermissionsTypes: {
    SUPER: 'SUPER',
    SHARE: 'SHARE',
    READ: 'READ',
    WRITE: 'WRITE',
    REVOKE: 'REVOKE',
    GRANT: 'GRANT',
    NO_READ: 'NO-READ',
  },

  MaxQuestionsLimit: 500,

  MobileNumberAuthEnabledCountries: ['IN', 'ID', 'TH', 'MY', 'PH'],

  SearchCacheKeys: {
    FEATURE_PAGE_CACHE: 'featuredPageCache',
    SEARCH_PAGE_CACHE: 'searchPageCache',
  },

  MediaServerImageDimensions: [90, 200, 400, 900],

  MediaMetaAttributes: {
    GOOGLE_DRIVE: 'google-drive',
  },

  GoogleDrivePermissions: {
    Role: {
      WRITER: 'writer',
    },
    Type: {
      ANYONE: 'anyone',
    },
  },

  LibrarySections,

  SearchFilters: {
    type: {
      MY_DISTRICT: 'my-district',
      QUIZIZZ_LIBRARY: 'quizizz-library',
      MY_LIBRARY: 'my-library',
      REPORTS: 'reports',
    },
  },

  OrgTypes: {
    DISTRICT: 'district',
    SCHOOL: 'school',
    DEPARTMENT: 'department',
  },

  SnDTeacherOnboarding: {
    name: 'snd_teacher_onboarding',

    CompletedTill: {
      NOT_STARTED: 'not_started',
      SCHOOL: 'school',
      SUBJECTS: 'subject_tags',
      GRADES: 'grades',
      IMPORT_LMS: 'import_lms',
      COMPLETED: 'completed',
    },
  },

  NotConnectedToASchoolPage: {
    CREATE_ORG: 'create_org',
    SELECT_ORG: 'select_org',
  },

  SignupEvents: {
    SIGNUP_TYPE_NEXT_CLICK: 'signup_type_next_click',
    CREATE_ORG_LINK: 'create_org_link',
    TOS_LINK_CLICK: 'tos_link_click',
    PRIVACY_LINK_CLICK: 'privacy_link_click',
    ENTERED: 'entered',
    ORG_PICKER_LOAD: 'org_picker_load',
    SELECT_ORG_CLICK: 'select_org_click',
    ORG_SEARCH: 'org_search',
    COMPLETE_SIGNUP_CLICK: 'complete_signup_click',
    QFW_ADD_ROLE_CLICK: 'qfw_add_role_click',
    QFW_ADD_ROLE_DESCRIPTION_AND_ORG_CLICK: 'qfw_add_roledescription_org_click',
    COMPLETE_SIGNUP_U13_CLICK: 'complete_signup_u13_click',
    BACK_BUTTON_CLICKED: 'back_button_clicked',
    CHANGE_OCCUPATION_CLICK: 'change_occupation_click',
    NOT_CONNECTED_TO_A_SCHOOL1: 'not_school_click1',
    NOT_CONNECTED_TO_A_SCHOOL2: 'not_school_click2',
    DOB_SELECTED: 'dob_selected',
    SIGNUP_GOOGLE_CLICK: 'signup_google_click',
    SIGNUP_GOOGLE_SELECT_ROLE: 'signup_google_select_role',
    SIGNUP_MS_SELECT_ROLE: 'signup_microsoft_select_role',
    SIGNUP_FB_SELECT_ROLE: 'signup_fb_select_role',
    SIGNUP_APPLE_SELECT_ROLE: 'signup_apple_select_role',
    SIGNUP_CLASSLINK_SELECT_ROLE: 'signup_classlink_select_role',
    SIGNUP_MS_CLICK: 'signup_ms_click',
    ROLEPICK: {
      CORPORATE: 'rolepick_corporate',
      SCHOOL: 'rolepick_school',
      OTHER_CORPORATE: 'rolepick_other_professional',
      OTHER_PERSONAL: 'rolepick_other_friendsandfamily',
      PERSONAL: 'rolepick_personal',
      STUDENT: 'rolepick_student',
      TEACHER: 'rolepick_teacher',
      ADMINISTRATOR: 'rolepick_administrator',
      PARENT: 'rolepick_parent',
    },
  },

  SignupActionRole: {
    OTHER_CORPORATE: 'other_corporate',
    OTHER_PERSONAL: 'other_personal',
  },

  SignupSources: {
    SHOW_ANSWERS: 'prompt-showAnswer',
  },

  CorporateTeachingReasons: {
    EMPLOYEE_TRAINING: 'employeeTraining',
    EMPLOYEE_ENGAGEMENT: 'employeeEngagement',
    CUSTOMER_ENGAGEMENT: 'customerEngagement',
    EVENT_USE_CASE: 'eventUsecase',
    OTHER: 'other',
  },

  LMSTypes: {
    GCL: 'gcl',
    CANVAS: 'canvas',
    SCHOOLOGY: 'schoology',
  },

  ShareOptions: {
    TWITTER: 'twitter',
    MESSENGER: 'messenger',
    WHATSAPP: 'whatsapp',
    TELEGRAM: 'telegram',
    FACEBOOK: 'facebook',
    NATIVE: 'native',
    MAIL: 'mail',
    COPY: 'copy',
  },

  OrgMemberStatus: {
    ACTIVE: 'ACTIVE',
    PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
    PAYMENT_DUE: 'PAYMENT_DUE',
    SUSPENDED: 'SUSPENDED',
  },

  GameSharingLinkTypes: {
    TWITTER: 'twitter',
    REMIND: 'remind',
    FACEBOOK: 'facebook',
    WHATSAPP: 'whatsapp',
  },
  IndonesiaBTSQuizzes: [
    '62e9ee4e726192001df94969',
    '62ebe52f8d4c06001dd879c2',
    '62ebedcdb2fad5001ee6a1f8',
    '62f0c1d8481ff5001f5d478e',
  ],
  WhitelistedSuperResources: [
    '62e9ee4e726192001df94969',
    '62ebe52f8d4c06001dd879c2',
    '62ebedcdb2fad5001ee6a1f8',
    '62f0c1d8481ff5001f5d478e',
    // Indonesia BTS
    '63fc4f4b152f72001e4f7c83',
    '63fc277cb5511b001fd4c752',
    '63fc2fe30bc2ce001e8df9db',
    '63f59dfe20d014001e750acb',
    // Learn about Quizizz
    '62a7259a8d78b2001e85ba96', // Vietnamese
    '62a7256c8d78b2001e85ba77', // Malay
    '622bf85c7dbb75001e10f09c', // Bahasa Indonesia
    '62a725cf8d78b2001e85bab4', // English
    '62a725b48d78b2001e85ba97', // Thai
  ],

  LocalStorageItems: {
    PREMIUM_CONTENT_BLOCKING_MODAL_CLOSED: 'premiumContentBlockingModalClosed',
    GOOGLE_SEARCH_LIMIT: 'googleSearchLimit',
    CHURN_MODAL_CLOSE_TIME: 'churnModalCloseTime',
    ADD_TO_CART_ONBOARDING_MODAL: 'addToCartOnboardingModal',
    QFW_CHURN_MODAL_CLOSE_TIME: 'qfwChurnModalCloseTime',
    HAS_QUESTION_TYPE_INFO_POPUP_SHOWN: 'hasQuestionTypeInfoPopupShown',
    DONT_SHOW_QUESTION_TYPE_INFO_POPUP: 'dontShowQuestionTypeInfoPopup',
    DONT_SHOW_HOTSPOT_NUDGE: 'dontShowHotspotNudge',
    DONT_SHOW_NEW_Q_TYPES_NUDGE: 'dontShowNewQTypesNudge',
    DONT_SHOW_GRAPHING_NUDGE: 'dontShowGraphingQTypesNudge',
    MASTERY_PEAK_BANNER_NOTIFIED: 'mastery_peak_banner_notified',
  },

  WebEvents: {
    ONE_TAP_SSO_DISMISS: 'admin_google_one_tap_dismiss',
    ONE_TAP_SSO_SHOW: 'admin_google_one_tap_show',
    ONE_TAP_SSO_LOGIN: 'admin_google_one_tap_login',
    ONE_TAP_SSO_NOT_SHOWN: 'admin_google_one_tap_not_shown',
  },

  UserSubscriptionStatus: {
    CANCELLED: 'canceled',
  },

  SubscriptionRetryPeriod: 14, // days

  CHURN_NOTIFICATION_RESHOW_TIME: 24, // hours

  PlanGroup: {
    SND: 'snd',
    SND_TRIAL: 'snd_trial',
  },

  allowedPathsForGoogleClientTranslation,

  Modals: {
    ASSIGNMENT_DETAILS: 'assignment-details-modal',
    IMPORT_LMS: 'import-lms-modal',
  },

  BulkImport: {
    POLL_TIME: 10000,
    IN_PROGRESS: 'IN_PROGRESS',
    FAILED: 'FAILED',
    COMPLETED: 'COMPLETED',
    SIZE_LIMIT: 15,
  },

  GameEvents: {
    // share modal events
    GAME_LINK_SHARE_LMS: 'GameLinkShareLMS',

    // waiting screen events
    START_GAME_FAIL: 'StartGameFail',
    START_GAME_SUCCESS: 'StartGameSuccess',
    FIRST_PLAYER_JOIN: 'FirstPlayerJoin',
    SET_TEST_TIMER_ENABLED: 'set_test_timer_enabled',
    SET_TEST_TIMER_DISABLED: 'set_test_timer_disabled',
    ADD_MORE_TIME: 'add_more_time_success',
    SET_TEST_TIME: 'set_test_time',
    // in game events
    ASSIGN_HOMEWORK: 'assign_homework',
    VIEW_EVENTS: 'view_events',
    SEND_EMAIL_TO_ALL_PARENTS: 'send_email_to_all_parents',
    SEND_EMAIL_TO_PARENT: 'send_email_to_parent',
    DOWNLOAD_RESULTS: 'download_results',
  },

  SubscriptionProvider: {
    CHARGEBEE: 'cb',
    SALESFORCE: 'salesforce',
  },

  OrganizationTypes: {
    SCHOOL: 'school',
    DISTRICT: 'district',
    DEPARTMENT: 'department',
  },

  OrganizationRole: {
    ADMIN: 'admin',
    REMOVED: 'removed',
    INSTRUCTOR: 'instructor',
  },

  LessonImport: {
    TOTAL_PROGRESS: 20,
    LESSON_EDITOR_HEIGHT: 720,
    LESSON_EDITOR_WIDTH: 1280,
    SLIDE_ELEMENT_TYPE: {
      MEDIA: 'MEDIA',
      TEXT: 'TEXT',
    },
    THIN_FONT: 'Open Sans Condensed',
    CONVERT_TO_THIN_FONT_THRESHOLD: 0.77,
  },

  LessonImportFileTypes: {
    PDF: 'pdf',
    SLIDE: 'slide',
  },

  TranslatedLanguages: [
    {
      code: 'en',
      title: 'English',
      value: 'English',
      limage: 'https://cf.quizizz.com/img/flag_icons/us.png',
    },
    {
      code: 'es',
      title: 'Español',
      value: 'Español',
      limage: 'https://cf.quizizz.com/img/flag_icons/es.png',
    },
    {
      code: 'fr',
      title: 'Français',
      value: 'Français',
      limage: 'https://cf.quizizz.com/img/flag_icons/fr.png',
    },
    {
      code: 'pl',
      title: 'Polish',
      value: 'Polish',
      limage: 'https://cf.quizizz.com/img/flag_icons/pl.png',
    },
    {
      code: 'ru',
      title: 'Russian',
      value: 'Russian',
      limage: 'https://cf.quizizz.com/img/flag_icons/ru.png',
    },
    {
      code: 'id',
      title: 'Bahasa Indonesia',
      value: 'Bahasa Indonesia',
      limage: 'https://cf.quizizz.com/img/flag_icons/id.png',
    },
    {
      code: 'ms',
      title: 'Malay',
      value: 'Malay',
      limage: 'https://cf.quizizz.com/img/flag_icons/my.png',
    },
    {
      code: 'tl',
      title: 'Filipino',
      value: 'Filipino',
      limage: 'https://cf.quizizz.com/img/flag_icons/ph.png',
    },
    {
      code: 'de',
      title: 'Deutsch',
      value: 'Deutsch',
      limage: 'https://cf.quizizz.com/img/flag_icons/de.png',
    },
    {
      code: 'vi',
      title: 'Vietnamese',
      value: 'Vietnamese',
      limage: 'https://cf.quizizz.com/img/flag_icons/vn.png',
    },
    {
      code: 'th',
      title: 'Thai',
      value: 'Thai',
      limage: 'https://cf.quizizz.com/img/flag_icons/th.png',
    },
    {
      code: 'az',
      title: 'Azerbaijani',
      value: 'Azerbaijani',
      limage: 'https://cf.quizizz.com/img/flag_icons/az.png',
    },
    {
      code: 'pt-br',
      title: 'Português',
      value: 'Português',
      limage: 'https://cf.quizizz.com/img/flag_icons/br.png',
    },
    {
      code: 'zh-CN',
      title: 'Simplified Chinese',
      value: 'Chinese',
      limage: 'https://cf.quizizz.com/img/flag_icons/cn.png',
    },
    {
      code: 'zh-TW',
      title: 'Traditional Chinese',
      value: 'Taiwanese',
      limage: 'https://cf.quizizz.com/img/flag_icons/tw.png',
    },
    {
      code: 'tr',
      title: 'Turkish',
      value: 'Turkish',
      limage: 'https://cf.quizizz.com/img/flag_icons/tr.png',
    },
    {
      code: 'it',
      title: 'Italian',
      value: 'Italian',
      limage: 'https://cf.quizizz.com/img/flag_icons/it.png',
    },
    {
      code: 'ja',
      title: 'Japanese',
      value: 'Japanese',
      limage: 'https://cf.quizizz.com/img/flag_icons/ja.png',
    },
    {
      code: 'kk',
      title: 'Kazakh',
      value: 'Kazakh',
      limage: 'https://cf.quizizz.com/img/flag_icons/kz.png',
    },
  ],

  SEOSubjects: ['mathematics', 'science', 'social studies'],
  SEOTopics: ['physics', 'chemistry', 'biology'],

  EventBus: {
    AUTH_MODAL_SHOW: 'authModal:show',
    AUTH_MODAL_HIDE: 'authModal:hide',
    QUIZ_GEN_MOBILE_MODAL_SHOW: 'qc_quiz_gen_mobile_modal_show',
    QUIZ_GEN_MOBILE_MODAL_HIDE: 'qc_quiz_gen_mobile_modal_hide',

    // embed modal
    EMBED_QUIZ_MODAL_SHOW: 'embedQuizModal:show',
    EMBED_QUIZ_MODAL_HIDE: 'embedQuizModal:hide',
  },

  SupportedLocaleForDayJS: {
    es: () => import('dayjs/locale/es'),
    en: () => import('dayjs/locale/en'),
    fr: () => import('dayjs/locale/fr'),
    pl: () => import('dayjs/locale/pl'),
    ru: () => import('dayjs/locale/ru'),
    id: () => import('dayjs/locale/id'),
    ms: () => import('dayjs/locale/ms'),
    tl: () => import('dayjs/locale/tl-ph'),
    de: () => import('dayjs/locale/de'),
    vi: () => import('dayjs/locale/vi'),
    th: () => import('dayjs/locale/th'),
    az: () => import('dayjs/locale/az'),
    'pt-br': () => import('dayjs/locale/pt-br'),
    'zh-CN': () => import('dayjs/locale/zh-cn'),
    'zh-TW': () => import('dayjs/locale/zh-tw'),
    tr: () => import('dayjs/locale/tr'),
    it: () => import('dayjs/locale/it'),
    ja: () => import('dayjs/locale/ja'),
    kk: () => import('dayjs/locale/kk'),
  },

  AUTH_TYPES: {
    MS: 'microsoft',
    GOOGLE: 'google',
    FB: 'facebook',
    APPLE: 'apple',
    CLASSLINK: 'classlink',
    EMAIL: 'email',
    PHONE: 'phone',
  },

  BrazeConfig: {
    DEV_KEY: 'f6b6d5bd-bec3-4b19-8d6f-d22273276c5e',
    PROD_KEY: 'fda15891-26c0-43f0-aa55-6f8d885d4a4c',
    BASE_URL: 'sdk.iad-05.braze.com',
    SESSION_TIMEOUT_IN_SECONDS: 2 * 60 * 60, // 2 hours
  },

  BrazeExtras: {
    HOME_CAROUSEL: 'home_carousel',
    PLATFORMS: 'platforms',
  },

  FeatureFlagVariants: {
    INDIVIDUAL_PLAN: {
      VARIANT_DEFAULT: 'variant-default',
      VARIANT_LEARN_MORE: 'variant-learn-more',
      VARIANT_START_TRIAL: 'variant-start-trial',
    },
  },

  FeatureFlagsTypes: {
    AI_QUIZ_GENERATOR: 'ai-quiz-generator',
    SINGLE_CTA: 'single-cta',
    SHOW_INDIVIDUAL_PLAN: 'showindividualplan',
    SHOW_GENERATE_REPORT_BUTTON: 'showGenerateReportButton',
    SHOW_TRIAL_PRICING_EXP: 'showtrialpricingexp',
    OPEN_AI_MODAL: 'openaimodel',
    SHOW_EXPLANATION_GENERATOR: 'showexplanationgenerator',
    SHOW_OPTIONS_GENERATOR: 'show-options-generator',
    SHOW_SHARE_WITH_ADMIN_ON_PRICING_PAGE: 'showsharewithadminonpricingpage',
    KURIKULUM_ID: 'kurikulum-indonesia',
    // auto convert question types
    AUTO_CONVERT_QUESTION_TYPES_QUIZ_PAGE: 'auto-convert-question-types-quiz-page',
    SHOW_AUTO_CONVERT_MODAL: 'show-auto-convert-modal',
    SHARED_FOLDER_ACCESS: 'shared-folder-access',
    INFLUENTIAL_TEACHER1: 'influential-teachers-organizations',
    INFLUENTIAL_TEACHER2: 'influential-teachers-organizations-2',
    INFLUENTIAL_TEACHER3: 'influential-teachers-organizations-3',
    US_SUPER: 'us-super-refer-to-basic-user',
    SUPER_REFER_US_V1: 'super-refer-access',
    SUPER_REFER_US_V3: 'gift-super-v3',
    // Paper Mode configs
    PAPER_MODE_SUPPORTED: 'papermode-supported',
    PAPER_MODE_MAIN_CTA: 'papermode-main-cta',
    PAPER_MODE_ONBOARDING: 'show-paper-mode-onboarding',
    // Embed Quiz
    SHOW_EMBED_QUIZ_CTA: 'embedquizcta',
    // Collections in search
    COLLECTIONS_IN_SEARCH: 'collections_in_search',
    // Media Service
    ENABLE_MEDIA_SERVICE_V2: 'enable-media-service-v2',
    // auto quiz generator
    AUTO_QUIZ_GENERATOR: 'auto-quiz-generator',
    AUTO_QUIZ_GENERATOR_V2: 'auto-quiz-generator-v2',
    SHOW_QUIZ_GEN_MOBILE: 'show-quiz-gen-mobile',
    // Referrals
    REFERRALS: 'referrals',
    // gcse
    GCSE: 'gcse',
    // orgPicker
    ORG_PICKER: 'orgpicker',
    // updated rostering flow (importing classes)
    UPDATED_ROSTERING: 'updated-teacher-rostering-orgs',
    // show all question types free for a week
    PREMIUM_QUESTION_WEEK: 'premiumquestionweek',
    // hide password reset option for selected users
    HIDE_PASSWORD_RESET: 'hide-password-reset',

    // pricing page revamp
    INDIVIDUAL_PLAN_VARIANTS: 'individual-plan-variants',
    PRICING_PAGE_V2_SHOW_SCHEDULE_DEMO_BTN: 'pricing-page-v2-show-schedule-demo-btn',
    // flagged qfw users to use new create flow
    QFW_CREATE_FLOW: 'qfwcreateflow',
    CREATION_TO_GAME: 'creation-to-game',
    BRAZE_END_GAME_EVENTS: 'braze-events-end-game',
    // Mastery Mode
    MASTERY_MODE: 'mastery-mode',

    // Async Nudge- Settings
    SETTINGS_ASYNC_VARIATION: 'settings-async-variation',

    // Settings Page Default Selection
    GAME_SETTINGS_DEFAULT: 'game-settings-default',

    PARTICIPANT_VIEW_ON_EDITOR: 'participant-view-editor',

    // alternate CTA for assign homework 2
    ALTERNATE_ASSIGN_CTA_2: 'alternate-assign-cta-2',

    SHOW_CO_TEACHING: 'show-co-teaching',
    LIST_PAID_ORG_MEMBERS: 'list-paid-org-members',

    // qtype visibility
    QTYPE_VISIBILITY: 'q-type-visibilty',

    SHOW_EDITOR_AUTO_CONVERT_UI: 'show-editor-auto-convert-ui',

    TEAM_CREATION_FLOW_V2: 'team-creation-flow-v2',
    SHOW_EDITOR_QUESTION_TEMPLATES: 'show-editor-question-templates',

    // Mastery Peak
    MASTERY_PEAK: 'mastery-peak',
    US_NONQFW: 'mastery-us-nonqfw',

    // Load images in correct dimensions
    IMAGE_DIMENSIONS: 'image-dimensions',
    SCHEDULE_LATER_GAME_SETTING: 'schedule-later-game-setting',

    PARTICIPANT_FEEDBACK: 'participant-feedback',

    WORDCLOUD_QTYPE: 'wordcloud-qtype',

    MATH_STANDARDS_FILTER: 'math-standards-filter',
    BREAK_ON_VALIDATION_ERROR: 'break-on-validation-error',
    DISTRICT_LIB_WIDGET_VARIANT: 'district_lib_widget_variant',
    CLASSIFICATION_QTYPE: 'classification-q-type',

    // show new user experience in signup
    SHOW_NUX: 'show-nux',
    EXCLUDE_FROM_LIBRARY_LIMITS: 'exclude-from-library-limits',

    EXCLUDE_FROM_SND_CHURN_BANNER: 'exclude-from-snd-churn-banner',

    TEAM_CREATION_NUDGE: 'team-creation-nudge',
    // quiz gen add new questions automatically
    AUTO_QUESTIONS_GENERATOR: 'auto-questions-generator',
    // Classlink SSO
    CLASSLINK_SSO: 'classlink-sso',

    ENABLE_NORMAL_YOUTUBE: 'enable-normal-youtube',
    // Lang game settings after signup
    LAND_GAME_SETTINGS: 'land-game-settings',
  },

  MAX_INDI_PLAN_REFER: 3,
  PROFILE_DISPLAY_CIRCLES: 3,
  CAMPAIGN_ID_INDIVIDUAL_PLAN_REFER: '32748',
  CAMPAIGN_ID_SUPER_PLAN_REFER: '32749',

  GTMFeatureVariationsForNonAsync: {
    SHIMMER: 'mastery-with-gtm1-shimmer',
    JIGGLE: 'mastery-with-gtm1-jiggle',
  },

  GTMMasteryModeVariation: {
    WITHOUT_GTM: 'mastery-without-gtm',
  },

  LifecycleEventServices: {
    BRAZE: 'BRAZE',
  },
  QuizTitlesSupportedLanguages: {
    English: 'en',
    Indonesian: 'id',
    Vietnamese: 'vi',
    French: 'fr',
    Filipino: 'tl',
    'Spanish; Castilian': 'es',
  },
  QuizPageTitles: {
    en: '{$1} | {$2} plays | Quizizz',
    id: '{$1} | {$2} memainkan | Quizizz',
    vi: '{$1} | {$2} lần chơi | Quizizz',
    fr: '{$1} | {$2} jouer | Quizizz',
    tl: '{$1} | {$2} paglalaro | Quizizz',
    es: '{$1} | {$2} jugadas | Quizizz',
  },
  QuizPageDescriptions: {
    en: '{$1} quiz for {$2}{$3 students}. Find other quizzes for {$3} and more on Quizizz for free!',
    id: '{$1} kuis untuk {$2}{$3 siswa}. Temukan kuis lain seharga {$3} dan lainnya di Quizizz gratis!',
    vi: '{$1} bài kiểm tra dành cho {$2}{$3 sinh viên}. Tìm các câu đố khác với giá {$3} và hơn thế nữa trên Quizizz miễn phí!',
    fr: "{$1} quiz pour {$2}{$3 étudiants}. Trouvez d'autres quiz pour {$3} et plus sur Quizizz gratuitement!",
    tl: '{$1} na pagsusulit para sa {$2}{$3 na mag-aaral}. Maghanap ng iba pang mga pagsusulit para sa {$3} at higit pa sa Quizizz nang libre!',
    es: 'Prueba de {$1} para {$2}{$3 estudiantes}. ¡Encuentra otros cuestionarios por {$3} y más en Quizizz gratis!',
  },
  TipTap: {
    INITIAL_TIP_TAP_VALUE: '<p></p>',
  },
  GoogleFormsSupportedQuestions: {
    CHOICE_QUESTION: 'choiceQuestion',
    TEXT_QUESTION: 'textQuestion',
    DATE_QUESTION: 'dateQuestion',
    TIME_QUESTION: 'timeQuestion',
    SCALE_QUESTION: 'scaleQuestion',
  },
  GoogleFormsChoiceQuestions: {
    RADIO: 'RADIO',
    CHECKBOX: 'CHECKBOX',
    DROP_DOWN: 'DROP_DOWN',
  },
  MysticPeak: {
    CAVES_INFO: {
      1: {
        position: 0.08,
        rotate: false,
      },
      2: {
        position: 0.19,
        rotate: false,
      },
      3: {
        position: 0.29,
        rotate: true,
      },
      4: {
        position: 0.39,
        rotate: true,
      },
      5: {
        position: 0.49,
        rotate: true,
      },
      6: {
        position: 0.61,
        rotate: false,
      },
      7: {
        position: 0.72,
        rotate: false,
      },
      8: {
        position: 0.8,
        rotate: true,
      },
      9: {
        position: 0.87,
        rotate: true,
      },
    },
    PATHFINDER_POSITION: 0.96,
    ACTIVATED_CAVES: {
      1: [6],
      2: [3, 6],
      3: [2, 5, 7],
      4: [2, 4, 6, 9],
      5: [1, 2, 4, 6, 9],
      6: [2, 3, 4, 5, 7, 9],
      7: [1, 2, 3, 4, 5, 7, 9],
      8: [1, 2, 3, 4, 5, 6, 7, 9],
      9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    REVERSE_AVATARS: [
      {
        position: 0.19,
        reverse: true,
      },
      {
        position: 0.49,
        reverse: false,
      },
      {
        position: 0.72,
        reverse: true,
      },
      {
        position: 0.87,
        reverse: false,
      },
      {
        position: 1,
        reverse: true,
      },
    ],
  },
  NonGTMCopies: {
    0: {
      imgSrc: 'https://cf.quizizz.com/img/GTM/non-gtm-clock.png',
      modalSrc: 'https://cf.quizizz.com/img/GTM/modal-illustartion-0.png',
      bannerText: 'Practice mode has been helping teachers get their time back in the classroom',
      heading: 'Optimize your time by assigning activities as independent practice.',
      videoSrc: 'https://cf.quizizz.com/img/GTM/nonGTM-1.mp4',
    },
    1: {
      imgSrc: 'https://cf.quizizz.com/img/GTM/non-gtm-clock.png',
      modalSrc: 'https://cf.quizizz.com/img/GTM/modal-illustartion-0.png',
      bannerText: 'Students feeling pressured to complete activities in time?',
      heading: 'Remove distractions, increase focus and boost student confidence',
      videoSrc: 'https://cf.quizizz.com/img/GTM/nonGTM-2.mp4',
    },
    2: {
      imgSrc: 'https://cf.quizizz.com/img/GTM/non-gtm-cale.png',
      modalSrc: 'https://cf.quizizz.com/img/GTM/modal-illustartion-0.png',
      bannerText: 'This unit test, help your students score more than 80%',
      heading: 'Improve student accuracy through mindful repetition.',
      videoSrc: 'https://cf.quizizz.com/img/GTM/nonGTM-3.mp4',
    },
  },
  GTMMasteryModeCopies: {
    0: {
      imgSrc: 'https://cf.quizizz.com/img/GTM/gtm-focus-0.gif',
      modalSrc: 'https://cf.quizizz.com/img/GTM/modal-illustartion-0.png',
      bannerText: 'Using mastery mode improves student recall and concept clarity by 20%',
      heading: 'Mastery mode personalizes repetition for students and helps them achieve classroom goals',
      subTexts: [
        'Set classroom goals and personalize repetitions',
        'Students complete at their own pace, in or out of the classroom',
        'Get in depth data to track student growth from first-attempt accuracy to final accuracy',
      ],
    },
    1: {
      imgSrc: 'https://cf.quizizz.com/img/GTM/focus-1.png',
      modalSrc: 'https://cf.quizizz.com/img/GTM/modal-illustartion-1.png',
      bannerText: 'Set accuracy goals & personalize repetitions using Mastery mode',
      heading: 'Assign as practice using the mastery mode and set achievable accuracy goals',
      subTexts: [
        'Set classroom goals & Personalize repetition for students',
        'Students complete at their own pace with lesser time pressures',
        'Get student growth report from first attempt accuracy to final accuracy',
      ],
    },
  },
  GTMMasteryRandomGamesSet: [
    'https://quizizz.com/join?gc=62110919',
    'https://quizizz.com/join?gc=13352135',
    'https://quizizz.com/join?gc=44809415',
    'https://quizizz.com/join?gc=60538055',
    'https://quizizz.com/join?gc=45857991',
    'https://quizizz.com/join?gc=61324487',
    'https://quizizz.com/join?gc=18332871',
    'https://quizizz.com/join?gc=30915783',
    'https://quizizz.com/join?gc=62373063',
    'https://quizizz.com/join?gc=59751623',
  ],
  GameCompletionEventsForBraze: {
    UI_QUIZ_COMPLETED_LIVE: '[UI] Quiz Completed Live',
    UI_QUIZ_COMPLETED_TEAM: '[UI] Quiz Completed Team',
    UI_QUIZ_COMPLETED_TP: '[UI] Quiz Completed TP',
    UI_LESSON_COMPLETED_TP: '[UI] Lesson Completed TP',
    UI_QUIZ_COMPLETED: '[UI] QUIZ COMPLETED',
  },
  QuizizzContactUserId: '54bfb753e4c9406112267056',
  QuizizzContactGcseCollectionIds: [
    '63d77bdc9816d8001e291ba1',
    '63d77c0611a80b00203a4f7c',
    '63d77bd2f358f4001db9df68',
    '63d77bfc6ddef7001dfc60db',
    '63d77c34582e3b001d4efada',
  ],
  UkAccountGcseCollectionIds: [
    '63ea0284626f0f001d3cd564',
    '63ea026dd7667c001d23dbac',
    '63ea029dd7667c001d23e7fd',
    '63ea0253d7667c001d23d5da',
  ],
  PaperModeEnabledCountries: [
    'IN',
    'ID',
    'VN',
    'GB',
    'TH',
    'AE',
    'MY',
    'PH',
    'FR',
    'ES',
    'TR',
    'MX',
    'DE',
    'SA',
    'PT',
    'GF',
  ],
  PaperModeSupportedLocales: [
    'en',
    'es',
    'fr',
    'pl',
    'ru',
    'id',
    'ms',
    'tl',
    'de',
    'vi',
    'th',
    'az',
    'pt-br',
    'zh-CN',
    'zh-TW',
    'tr',
    'it',
    'ja',
  ],
  LibraryPageBannerSection,
  LibraryThresholds,
  TeamsEmailValidationError: {
    INVALID_SYNTAX: 'invalid_syntax',
    ORG_MISMATCH: 'org_mismatch',
  },

  REFERRAL: {
    SUPER_GIFTING_EXPIRY_DATE,
  },
  DATE_AND_TIME: {
    DEFAULT_DURATION_STRING_FORMAT,
  },

  AiQuizGenModes: {
    USING_OPEN_TEXT: 'USING_OPEN_TEXT',
    USING_FILE_UPLOAD: 'USING_FILE_UPLOAD',
  },
};

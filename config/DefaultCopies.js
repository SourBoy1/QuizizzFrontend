import i18n from '~/services/i18n';

export const ProfileSections = {
  LIBRARY: {
    title: i18n('Library'),
    queryParam: 'library',
    count: -1,
  },
  COLLECTIONS: {
    title: i18n('Collections'),
    queryParam: 'collections',
    count: -1,
  },
  MEME_SETS: {
    title: i18n('Meme sets'),
    queryParam: 'meme_sets',
    count: -1,
  },
};

export const ProfileSectionTabs = [
  ProfileSections.LIBRARY,
  ProfileSections.COLLECTIONS,
  ProfileSections.MEME_SETS,
];

export const MemesetSections = {
  CORRECT_MEMES: {
    title: i18n('Correct memes'),
    queryParam: 'correct',
    count: -1,
  },
  INCORRECT_MEMES: {
    title: i18n('Incorrect memes'),
    queryParam: 'incorrect',
    count: -1,
  },
};

export const MemeSetSectionTabs = [
  MemesetSections.CORRECT_MEMES,
  MemesetSections.INCORRECT_MEMES,
];

export const QuestionDefaultQuery = {
  REORDER: i18n('Reorder the following'),
  MATCH: i18n('Match the following'),
};

export const DateFilterRanges = {
  default: {
    TODAY: i18n('Today'),
    YESTERDAY: i18n('Yesterday'),
    LAST_7_DAYS: i18n('Last 7 days'),
    LAST_WEEK: i18n('Last week'),
    THIS_MONTH: i18n('This month'),
    LAST_MONTH: i18n('Last month'),
    THIS_YEAR: i18n('This year'),
    ALL_TIME: i18n('All time'),
  },
  academic: {
    CURRENT_SCHOOL_YEAR: i18n('Current School Year'),
    LAST_30_DAYS: i18n('Last 30 Days'),
    // LAST_3_MONTHS: i18n('Last 3 Months'),
    // PREV_SCHOOL_YEAR: i18n('Prev School Year'),
    // ALL_TIME: i18n('All-Time'),
  },
};

export const ContentDefaultName = {
  QUIZ_NAME: i18n('Untitled Quiz'),
  LESSON_NAME: i18n('Untitled Lesson'),
};

export const BadgeList = {
  'activity-wizard-badge': {
    desc: i18n('Earned for reaching the milestone of Number of activities created last month'),
    image: 'https://cf.quizizz.com/badges/badge-activity-wizard.png',
  },
  'quiz-master-badge': { image: 'https://cf.quizizz.com/badges/badge-quiz-master.png', desc: i18n('Earned for reaching the milestone of Number of activities hosted last month') },
  'engagement-badge': { image: 'https://cf.quizizz.com/badges/badge-engagement.png', desc: i18n('Earned for reaching the milestone of Number of responses received on your questions last month') },
  'mastery-badge': { image: 'https://cf.quizizz.com/badges/badge-mastery.png', desc: i18n('Earned for reaching the milestone of Accuracy achieved by students last month') },
  'efficiency-badge': { image: 'https://cf.quizizz.com/badges/badge-efficiency.png', desc: i18n('Earned for reaching the milestone of hours saved using Quizizz library last month') },
};

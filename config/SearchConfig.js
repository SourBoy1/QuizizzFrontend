import i18n from '~/services/i18n';
import Languages from './Languages.js';
import Grades from './Grades.js';
import { QuestionTypes } from './Constants/EditorConstants.js';

const FILTER_KEY_NAMES_V2 = {
  NumQuestions: 'numberOfQuestions',
  ContentType: 'contentTypes',
  Curriculum: 'Curriculum',
  QuestionType: 'questionTypes',
  Grade: 'grades',
  Subject: 'subjects',
  Language: 'languages',
  States: 'organizationStates',
  SortBy: 'sort',
  MathStandards: 'mathStandards',
};

const questionsRangeList = [
  {
    text: '1-10',
    val: '1-10',
    key: FILTER_KEY_NAMES_V2.NumQuestions,
  },
  {
    text: '11-20',
    val: '11-20',
    key: FILTER_KEY_NAMES_V2.NumQuestions,
  },
  {
    text: '21-30',
    val: '21-30',
    key: FILTER_KEY_NAMES_V2.NumQuestions,
  },
  {
    text: '31-50',
    val: '31-50',
    key: FILTER_KEY_NAMES_V2.NumQuestions,
  },
  {

    text: '51-100',
    val: '51-100',
    key: FILTER_KEY_NAMES_V2.NumQuestions,
  },
  {
    text: '100+',
    val: '100+',
    key: FILTER_KEY_NAMES_V2.NumQuestions,
  },
];

export default {
  QUESTIONS_RANGE_LIST: questionsRangeList,

  FILTER_KEY_NAMES_V2,

  FILTER_KEYS: ['numQuestions', 'subject', 'sortKey', 'langs', 'grade', 'studentQuizzes', 'duplicates', 'type'],
  EXCLUDED_FILTER_VALUES: ['all_quizzes', 'my-library', 'reports', 'quiz', 'presentation', 'all', 'All'],

  QUESTION_TYPES: [
    QuestionTypes.MCQ,
    QuestionTypes.REORDER,
    QuestionTypes.MATCH,
    QuestionTypes.BLANK,
    QuestionTypes.DRAGNDROP,
    QuestionTypes.DROPDOWN,
    QuestionTypes.EQUATION,
    QuestionTypes.DND_IMAGE,
    QuestionTypes.HOTSPOT,
    QuestionTypes.GRAPHING,
    QuestionTypes.DRAW,
    QuestionTypes.OPEN,
    QuestionTypes.VIDEO,
    QuestionTypes.AUDIO,
    QuestionTypes.POLL,
  ],

  ALL_FILTERS: {
    searchIn: [
      {
        text: i18n('Quizizz library'),
        val: 'all_quizzes',
        key: 'searchIn',
      },
      {
        text: i18n('My library'),
        val: 'my-library',
        key: 'searchIn',
      },
      {
        text: i18n('Reports'),
        val: 'reports',
        key: 'searchIn',
      },
    ],

    subjects: [
      // {
      //   val: 'All',
      //   text: i18n('All Subjects'),
      //   key: FILTER_KEY_NAMES_V2.Subject,
      // },
      {
        val: 'Mathematics',
        text: i18n('Mathematics'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'English',
        text: i18n('English'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Physics',
        text: i18n('Physics'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Chemistry',
        text: i18n('Chemistry'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Biology',
        text: i18n('Biology'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Science',
        text: i18n('Science'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Computers',
        text: i18n('Computers'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'World Languages',
        text: i18n('World Languages'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Geography',
        text: i18n('Geography'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'History',
        text: i18n('History'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Social Studies',
        text: i18n('Social Studies'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Professional Development',
        text: i18n('Professional Development'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Physical Ed',
        text: i18n('Physical Ed'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Arts',
        text: i18n('Arts'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Fun',
        text: i18n('Fun'),
        key: FILTER_KEY_NAMES_V2.Subject,
      },
      {
        val: 'Architecture',
        text: i18n('Architecture'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Business',
        text: i18n('Business'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Design',
        text: i18n('Design'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Education',
        text: i18n('Education'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Instructional Technology',
        text: i18n('Instructional Technology'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Journalism',
        text: i18n('Journalism'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Life Skills',
        text: i18n('Life Skills'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Moral Science',
        text: i18n('Moral Science'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Performing Arts',
        text: i18n('Performing Arts'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Philosophy',
        text: i18n('Philosophy'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Religious Studies',
        text: i18n('Religious Studies'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Special Education',
        text: i18n('Special Education'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Specialty',
        text: i18n('Specialty'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      },
      {
        val: 'Other',
        text: i18n('Other'),
        key: FILTER_KEY_NAMES_V2.Subject,
        more: true,
      }],

    languages: Languages.map((lang) => ({ ...lang, key: FILTER_KEY_NAMES_V2.Language })),

    numQuestions: questionsRangeList,

    sortKey: [
      {
        type: 'radio',
        text: i18n('Most Relevant'),
        val: '_score',
        key: FILTER_KEY_NAMES_V2.SortBy,
      },
      {
        type: 'radio',
        text: i18n('Most Played'),
        val: 'played',
        key: FILTER_KEY_NAMES_V2.SortBy,
      },
      {
        type: 'radio',
        text: i18n('Most Recent'),
        val: 'createdAt',
        key: FILTER_KEY_NAMES_V2.SortBy,
      },
    ],

    grades: Grades.map((gradeData) => ({ ...gradeData, key: FILTER_KEY_NAMES_V2.Grade, val: gradeData.val })),

    misc: [
      {
        type: 'checkbox',
        text: i18n('Show Duplicates'),
        val: 'true',
        key: 'duplicates',
        label: i18n('Duplicates'),
      },
      {
        type: 'checkbox',
        text: 'Student Created',
        val: 'true',
        key: 'studentQuizzes',
        label: 'Student Created',
      },
    ],
  },
};

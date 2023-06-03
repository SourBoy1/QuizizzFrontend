import $store from '~/services/StoreService';
import i18n from '~/services/i18n';

import featureFlags from '~/services/FeatureFlagsService.js';
import Constants from '~/config/Constants';

import { getAssessmentTypeQuestions, getHigherOrderThinkingTypeQuestions, getOtherTypeQuestions } from '~/utils/QuizUtils';
import { QuestionTypes } from './Constants/EditorConstants';

/**
 * @param {*} questionTypes Object of QuestionTypes
 * @returns List of questionsTypes. eg: [{type: 'MCQ', title: i18n('MCQ')}]
 */
export function getFilteredQuestionTypes(questionTypes) {
  const filteredQTypes = [];
  const qTypesToExclude = [QuestionTypes.MSQ];

  Object.keys(questionTypes).forEach((qType) => {
    if (qTypesToExclude.includes(qType)) {
      return;
    }

    if (questionTypes[qType].featureFlag && featureFlags().isDisabled(questionTypes[qType].featureFlag)) {
      return;
    }

    filteredQTypes.push(questionTypes[qType]);
  });

  return filteredQTypes;
}

function getQfwOtherQTypes() {
  const qTypesToExclude = [
    Constants.QuestionTypes.MCQ,
    Constants.QuestionTypes.MSQ,
    Constants.QuestionTypes.BLANK,
  ];
  const filteredAssessmentQTypes = getFilteredQuestionTypes(getAssessmentTypeQuestions());

  const filteredOtherQTypes = filteredAssessmentQTypes.filter((question) => !qTypesToExclude.includes(question.type));
  return filteredOtherQTypes;
}

function getNonQfwOtherQTypes() {
  const questionTypes = getOtherTypeQuestions();

  const filteredQTypes = getFilteredQuestionTypes(questionTypes);

  if ($store().getters['root/isDesktop']) {
    filteredQTypes.push({
      type: Constants.SlideTypes.CONTENT_SLIDE_V2,
      title: i18n('Slide'),
    });
  }

  return filteredQTypes;
}

/**
 * @param forCorporate accepts boolean, true -> if user is corporate, else false
 * @returns All Filtered OtherQuestion Types
 */
export function getOtherQuestionTypes(forCorporate) {
  let filteredQTypes = [];
  if (forCorporate) {
    filteredQTypes = getQfwOtherQTypes();
  } else {
    filteredQTypes = getNonQfwOtherQTypes();
  }

  return filteredQTypes;
}

function getQfwAssessmentQTypes() {
  const qTypesToInclude = [
    Constants.QuestionTypes.MCQ,
    Constants.QuestionTypes.BLANK,
  ];
  const qTypesToExclude = [
    Constants.QuestionTypes.MSQ,
  ];

  // Get otherQuestion types for teachers
  const filteredOtherQTypes = getOtherQuestionTypes();
  const filteredAssessmentQTypes = getFilteredQuestionTypes(getAssessmentTypeQuestions())
    .filter((question) => qTypesToInclude.includes(question.type) && !qTypesToExclude.includes(question.type));

  return [...filteredAssessmentQTypes, ...filteredOtherQTypes];
}

function getNonQfwAssessmentQTypes() {
  const qTypesToExclude = [
    Constants.QuestionTypes.MSQ,
  ];

  const filteredAssessmentQTypes = getFilteredQuestionTypes(getAssessmentTypeQuestions())
    .filter((question) => !qTypesToExclude.includes(question.type));

  return filteredAssessmentQTypes;
}

/**
 * @param forCorporate accepts boolean, true -> if user is corporate, else false
 * @returns All Filtered AssessmentQuestion Types
 */
export function getAssessmentQuestionTypes(forCorporate) {
  let filteredQTypes = [];
  if (forCorporate) {
    filteredQTypes = getQfwAssessmentQTypes();
  } else {
    filteredQTypes = getNonQfwAssessmentQTypes();
  }

  return filteredQTypes;
}

/**
 * @returns All Filtered HigherOrderThinkingQuestion Types
 */
export function getHigherOrderThinkingQuestionTypes() {
  const filteredHighOrderQtypes = getFilteredQuestionTypes(getHigherOrderThinkingTypeQuestions());

  return filteredHighOrderQtypes;
}

/**
 * @returns All Filtered Question Types
 */
export default function getAllFilteredQuestionTypes() {
  const assessmentQTypes = getAssessmentTypeQuestions();
  const higherOrderThinkingQTypes = getHigherOrderThinkingTypeQuestions();
  const otherQuestionTypes = getOtherTypeQuestions();
  const allQuestionTypes = { ...assessmentQTypes, ...higherOrderThinkingQTypes, ...otherQuestionTypes };

  const filteredQuestionTypes = getFilteredQuestionTypes(allQuestionTypes);
  return filteredQuestionTypes;
}

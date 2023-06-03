import includes from 'lodash/includes';
import values from 'lodash/values';
import get from 'lodash/get';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import unescape from 'lodash/unescape';
import map from 'lodash/map';
import isNumber from 'lodash/isNumber';
import forEach from 'lodash/forEach';
import filter from 'lodash/filter';
import isPlainObject from 'lodash/isPlainObject';
import isNil from 'lodash/isNil';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import lodashCapitalize from 'lodash/capitalize';
import isArray from 'lodash/isArray';

import dayjs from 'dayjs';

import NewSlideService from '~/services/NewSlideService';
import SlideTemplates from '~/config/SlideTemplates';
import StringUtils from '~/utils/StringUtils';
import Media from '~/models/Media';
import UserService from '~/services/UserService';
import Constants from '../config/Constants';
import Grades from '../config/Grades';
import Languages from '../config/Languages';
import i18n from '../services/i18n';
import QLogger from '../services/QLogger';

import $store from '../services/StoreService';

import { createSpanInsidePTag } from './SlideV1Utils';

const CategoriesBasedOnGrading = {
  ALL: 'all',
  AUTO_GRADED: 'autoGraded',
  UNGRADED: 'ungraded',
  FLEXIBLE_GRADING: 'flexibleGrading',
  FREE: 'free',
};

function getUser() {
  return new UserService($store().getters['root/user'] ?? {});
}

export function isSlideForContent(question) {
  if (!question) {
    return false;
  }
  const { type } = question;
  return includes(
    [
      Constants.SlideTypes.CONTENT_SLIDE_V1,
      Constants.SlideTypes.CONTENT_SLIDE_V2,
    ],
    type,
  );
}

export function getOnlyQuestions(list) {
  return list.filter((q) => !isSlideForContent(q));
}

export function isQuizTypeContent(question) {
  if (!question) {
    return false;
  }
  const { type } = question;
  if (!type) {
    return Constants.ContentType.QUIZ;
  }

  return type === Constants.ContentType.QUIZ;
}

export function isSlideForContentV1(question) {
  if (!question) {
    return false;
  }
  const { type } = question;
  return type === Constants.SlideTypes.CONTENT_SLIDE_V1;
}

export function isSlideForQuestion(question) {
  if (!question) {
    return false;
  }
  const { type } = question;
  return includes(values(Constants.QuestionTypes), type);
}

export function isQuestionForPoll(question) {
  if (!question) {
    return false;
  }

  return (
    question.type === Constants.QuestionTypes.POLL
    || (includes(
      [Constants.QuestionTypes.MCQ, Constants.QuestionTypes.MSQ],
      question.type,
    )
      && get(question, 'structure.settings.hasCorrectAnswer') === false)
  );
}

export function isWordCloudQuestion(question) {
  if (!question) {
    return false;
  }

  return (
    question.type === Constants.QuestionTypes.WORDCLOUD
    || (
      Constants.QuestionTypes.OPEN === question.type
      && get(question, 'structure.settings.questionDisplayVariant') === Constants.DisplayVariantNames[Constants.QuestionTypes.WORDCLOUD]
    )
  );
}

export function isMsqBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.MSQ], question.type)
  );
}

export function isOptionsBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && (includes(
      [Constants.QuestionTypes.MCQ, Constants.QuestionTypes.MSQ],
      question.type,
    )
      || isQuestionForPoll(question))
  );
}

export function isDragDropBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes(
      [Constants.QuestionTypes.MATCH, Constants.QuestionTypes.REORDER],
      question.type,
    )
  );
}

export function isEquationBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && Constants.QuestionTypes.EQUATION === question.type
  );
}

export function isDndImageBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.DND_IMAGE], question.type)
  );
}

export function isHotspotBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.HOTSPOT], question.type)
  );
}

export function isGraphingBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.GRAPHING], question.type)
  );
}

export function isInteractiveBlankBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes(
      [Constants.QuestionTypes.DRAGNDROP, Constants.QuestionTypes.DROPDOWN],
      question.type,
    )
  );
}

export function isOpenEndedBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.OPEN], question.type)
  );
}

export function isFillInTheBlankBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.BLANK], question.type)
  );
}

export function isTypingBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.OPEN, Constants.QuestionTypes.WORDCLOUD, Constants.QuestionTypes.BLANK], question.type)
  );
}

export function isDrawBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.DRAW], question.type)
  );
}

export function isAudioBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.AUDIO], question.type)
  );
}

export function isVideoBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.VIDEO], question.type)
  );
}

export function isAudioVideoBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes(
      [Constants.QuestionTypes.AUDIO, Constants.QuestionTypes.VIDEO],
      question.type,
    )
  );
}

export function isOrderMatchBasedQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes(
      [Constants.QuestionTypes.REORDER, Constants.QuestionTypes.MATCH],
      question.type,
    )
  );
}

export function isClassificationQuestion(question) {
  return (
    isSlideForQuestion(question)
    && includes([Constants.QuestionTypes.CLASSIFICATION], question.type)
  );
}

export function shouldQuestionTypeHaveCorrectAnswer(question) {
  return (
    isSlideForQuestion(question)
    && includes(
      [
        Constants.QuestionTypes.MATCH,
        Constants.QuestionTypes.REORDER,
        Constants.QuestionTypes.MCQ,
        Constants.QuestionTypes.MSQ,
        Constants.QuestionTypes.BLANK,
        Constants.QuestionTypes.DRAGNDROP,
        Constants.QuestionTypes.DROPDOWN,
        Constants.QuestionTypes.EQUATION,
        Constants.QuestionTypes.DND_IMAGE,
        Constants.QuestionTypes.HOTSPOT,
        Constants.QuestionTypes.GRAPHING,
      ],
      question.type,
    )
  );
}

/**
 * Checks the question and tells if the question has a correct answer or not.
 * If its false then for the student the question will not be graded.
 * @param {Object} question
 * @returns {boolean}
 */
export function doesQuestionRequireAnswer(question) {
  const hasCorrectAnswerSetting = get(question, 'structure.settings.hasCorrectAnswer') === true;
  const hasCorrectAnswer = isBoolean(hasCorrectAnswerSetting)
    ? hasCorrectAnswerSetting
    : true;
  return (
    hasCorrectAnswer
    && !isQuestionForPoll(question)
    && !isWordCloudQuestion(question)
    && question.type !== Constants.QuestionTypes.OPEN
  );
}

/**
 * Checks the question and tells if the question answer has been supplied by the user
 * while editing. Some questions are not complete without providing the answer.
 * @param {Object} question
 * @returns {boolean}
 */
export function doesQuestionHaveAnAnswer(question) {
  const { options } = question.structure;
  const { answer } = question.structure;

  if (isTypingBasedQuestion(question)) {
    return Array.isArray(options) && options.length > 0;
  }

  if (isNumber(answer)) {
    return answer >= 0;
  }

  if (Array.isArray(answer)) {
    return !isEmpty(answer);
  }

  return false;
}

/**
 * Checks the question and tells if the question answer has been supplied by the user
 * while editing. Some questions are not complete without providing the answer.
 * @param {Object} question
 * @returns {boolean}
 */
export function doesQuestionHaveMatches(question) {
  const { options } = question.structure;
  const { matches } = question.structure;

  if (isTypingBasedQuestion(question)) {
    return Array.isArray(options) && options.length > 0;
  }

  if (isNumber(matches)) {
    return matches >= 0;
  }

  if (Array.isArray(matches)) {
    return !isEmpty(matches);
  }

  return false;
}

export function isOptionEmpty(option, shouldValidateImage = true) {
  if (!option) {
    return true;
  }

  if (shouldValidateImage && option.media?.length) {
    return false;
  }

  if (option.hasMath) {
    return false;
  }

  if (option.geometry?.shape) {
    return false;
  }

  return StringUtils.extractContentFromHTML(option.text).trim() === '';
}

export function validateQuestionQuery(question) {
  const questionType = question.type;
  const shouldValidateImage = ![Constants.QuestionTypes.DRAW, Constants.QuestionTypes.DND_IMAGE, Constants.QuestionTypes.HOTSPOT].includes(questionType);
  const isQueryEmpty = isOptionEmpty(get(question, 'structure.query', null), shouldValidateImage);
  const questionMedia = get(question, 'structure.query.media', []);
  const questionImage = questionMedia.find(
    (media) => media.type === Constants.SlideMediaTypes.IMAGE,
  );
  const meta = {};
  let isValid = true;
  let errorCode = '';

  if (
    [Constants.QuestionTypes.AUDIO, Constants.QuestionTypes.VIDEO].includes(
      questionType,
    )
  ) {
    if (
      !isNumber(question.structure.query.answerTime)
      || question.structure.query.answerTime <= 0
    ) {
      return {
        isValid: false,
        errorCode:
          Constants.QuestionValidationErrorCodes.ANSWER_TIME_NOT_SELECTED,
        meta: {},
      };
    }
  }

  if (isQueryEmpty && isEmpty(questionMedia)) {
    isValid = false;
    errorCode = Constants.QuestionValidationErrorCodes.EMPTY_QUESTION_QUERY;
  }

  if (!shouldValidateImage && (isQueryEmpty || isEmpty(questionImage))) {
    isValid = false;
    errorCode = Constants.QuestionValidationErrorCodes.EMPTY_QUESTION_QUERY;
  }

  return { isValid, errorCode, meta };
}

export function replaceKatexElementsWithHTML(mathJaxHTML, katex) {
  const mathJaxElements = mathJaxHTML.match(/<katex.*?<\/katex>/g);

  const katexElements = map(mathJaxElements, (mathJaxEle, index) => {
    const latexStr = mathJaxEle.match(/latex.*?=.*?".*?"/)[0];
    const quotedLatex = latexStr.match(/".*"/)[0];

    const latex = unescape(quotedLatex.substring(1, quotedLatex.length - 1));

    let katexEle = '';

    try {
      katexEle = katex.renderToString(latex, {
        displayMode: true,
      });
    } catch (err) {
      QLogger.log(['Error: replaceKatexElementsWithHTML', err], 'warn');
    }

    return ` ${katexEle} `;
  });

  let katexHTML = mathJaxHTML;

  forEach(mathJaxElements, (mathJaxEle, index) => {
    katexHTML = katexHTML.replace(mathJaxEle, katexElements[index]);
  });
  return katexHTML;
}

export function validateQuestionOptions(question) {
  const questionType = question.type;
  const options = get(question, 'structure.options', []);
  const matches = get(question, 'structure.matches', []);
  const answer = get(question, 'structure.answer', []);
  const targets = get(question, 'structure.answer', []);
  const meta = {};
  const emptyOptions = filter(options, (opt) => isEmpty(opt));
  const isOptionValidationRequired = [
    Constants.QuestionTypes.MCQ,
    Constants.QuestionTypes.MSQ,
    Constants.QuestionTypes.MATCH,
    Constants.QuestionTypes.REORDER,
    Constants.QuestionTypes.DRAGNDROP,
    Constants.QuestionTypes.DROPDOWN,
    Constants.QuestionTypes.DND_IMAGE,
    Constants.QuestionTypes.HOTSPOT,
    Constants.QuestionTypes.CLASSIFICATION,
  ].includes(questionType);

  let isValid = true;
  let errorCode = '';

  if (emptyOptions.length > 0) {
    QLogger.logOnSentry(
      [`INCORRECT_OPTIONS: ${question._id}`, emptyOptions],
      'exception',
    );

    return {
      isValid: false,
      errorCode: Constants.QuestionValidationErrorCodes.INCORRECT_OPTION_DATA,
      meta,
    };
  }

  if (!isOptionValidationRequired) {
    return { isValid, errorCode, meta };
  }

  const validOptions = options.filter((option) => !isOptionEmpty(option));

  const minOptionsLimit = Constants.QuestionOptionLimits[questionType].min;
  const maxOptionsLimit = Constants.QuestionOptionLimits[questionType].max;

  if (isClassificationQuestion(question)) {
    isValid = targets.length >= Constants.QuestionOptionLimits[questionType].minOptionGroups;
    errorCode = isValid ? '' : Constants.QuestionValidationErrorCodes.TOO_FEW_OPTION_GROUPS;
    if (!isValid) {
      return { isValid, errorCode, meta };
    }
  }

  if (validOptions.length < minOptionsLimit) {
    isValid = false;
    errorCode = Constants.QuestionValidationErrorCodes.TOO_FEW_OPTIONS;
    meta.minOptionsLimit = minOptionsLimit;
  }

  if (validOptions.length > maxOptionsLimit) {
    isValid = false;
    errorCode = Constants.QuestionValidationErrorCodes.TOO_MANY_OPTIONS;
  }

  // run validations for specific question types
  if (isValid) {
    switch (questionType) {
      case Constants.QuestionTypes.MATCH:
        for (const index in options) {
          const correspondingOptionForMatch = options[answer[index]];
          if (isOptionEmpty(matches[index])) {
            isValid = options.length > minOptionsLimit
              && isOptionEmpty(correspondingOptionForMatch);

            if (!isValid) {
              errorCode = options.length <= minOptionsLimit
                && isOptionEmpty(correspondingOptionForMatch)
                ? Constants.QuestionValidationErrorCodes.TOO_FEW_OPTIONS
                : Constants.QuestionValidationErrorCodes.TOO_FEW_MATCHES;
              meta.minOptionsLimit = minOptionsLimit;
            }
          } else {
            isValid = !isOptionEmpty(correspondingOptionForMatch);

            if (!isValid) {
              errorCode = Constants.QuestionValidationErrorCodes.MISSING_OPTION_FOR_MATCH;
            }
          }

          if (!isValid) {
            break;
          }
        }
        break;

      case Constants.QuestionTypes.REORDER: {
        const validOptions = options.filter((option) => !isOptionEmpty(option));
        isValid = validOptions.length >= minOptionsLimit;

        if (!isValid) {
          errorCode = Constants.QuestionValidationErrorCodes.TOO_FEW_OPTIONS;
          meta.minOptionsLimit = minOptionsLimit;
        }
        break;
      }
      default:
        break;
    }
  }

  return { isValid, errorCode, meta };
}

export async function validateQuestionAnswer(question) {
  const answer = get(question, 'structure.answer', []);
  const options = get(question, 'structure.options', []);
  const matches = get(question, 'structure.matches', []);
  const isAnswerValidationRequired = doesQuestionRequireAnswer(question);
  const isMCQ = question.type === Constants.QuestionTypes.MCQ;
  const isMSQ = question.type === Constants.QuestionTypes.MSQ;
  const isFIB = question.type === Constants.QuestionTypes.BLANK;
  const isMatch = question.type === Constants.QuestionTypes.MATCH;
  const isDndImage = question.type === Constants.QuestionTypes.DND_IMAGE;
  const isEquation = question.type === Constants.QuestionTypes.EQUATION;
  const isHotspotQuestion = question.type === Constants.QuestionTypes.HOTSPOT;
  const isGraphingQuestion = question.type === Constants.QuestionTypes.GRAPHING;
  const isInteractiveBlankType = isInteractiveBlankBasedQuestion({ type: question.type });
  const meta = {};
  let isValid = true;
  let errorCode = '';

  if (!isAnswerValidationRequired) {
    return { isValid, errorCode, meta };
  }

  if (isFIB) {
    if (options.length <= 0 || isEmpty(options[0]?.text)) {
      isValid = false;
      errorCode = Constants.QuestionValidationErrorCodes.FIB_ANSWER_NOT_MARKED;
    }
  }

  if (isEquation) {
    if (options.length <= 0) {
      isValid = false;
      errorCode = Constants.QuestionValidationErrorCodes.EQUATION_ANSWER_NOT_MARKED;
    } else {
      const isValidMath = await import('kas-npm').then((module) => module.parse(options[0]?.math?.latex[0]).parsed).catch((err) => {
        QLogger.error('Error while parsing math equation', err);
        return true;
      });
      if (!isValidMath) {
        isValid = false;
        errorCode = Constants.QuestionValidationErrorCodes.INVALID_MATH;
      }
    }
  }

  if (isMCQ) {
    if (!isNumber(answer) || answer === -1) {
      isValid = false;
      errorCode = Constants.QuestionValidationErrorCodes.ANSWER_NOT_MARKED;
    } else {
      isValid = answer >= 0
        && answer < options.length
        && !isOptionEmpty(options[answer]);

      if (!isValid) {
        errorCode = answer < 0 || answer > options.length
          ? Constants.QuestionValidationErrorCodes.ANSWER_NOT_VALID_MCQ
          : Constants.QuestionValidationErrorCodes.EMPTY_CORRECT_ANSWER;
      }
    }
  }

  if (isMSQ) {
    if (!Array.isArray(answer) || isEmpty(answer)) {
      isValid = false;
      errorCode = Constants.QuestionValidationErrorCodes.ANSWER_NOT_MARKED;
    } else {
      for (const ans of answer) {
        if (
          !isNumber(ans)
          || ans < 0
          || ans > options.length
          || isOptionEmpty(options[ans])
        ) {
          isValid = false;

          if (isOptionEmpty(options[ans])) {
            meta.emptyAnswerOption = ans;
          }
          break;
        }
      }

      if (!isValid) {
        errorCode = isNumber(meta.emptyAnswerOption)
          ? Constants.QuestionValidationErrorCodes.EMPTY_CORRECT_ANSWER
          : Constants.QuestionValidationErrorCodes.ANSWER_NOT_VALID_MSQ;
      }
    }
  }

  if (isMatch) {
    forEach(matches, (match, matchIndex) => {
      isValid = !isEmpty(match.text)
        && match.text !== Constants.TipTap.INITIAL_TIP_TAP_VALUE;

      if (!options[matchIndex]) {
        return;
      }

      if (!isValid) {
        isValid = !options[matchIndex].media.length
          && options[matchIndex].text === Constants.TipTap.INITIAL_TIP_TAP_VALUE;
      }

      return isValid;
    });

    errorCode = isValid
      ? ''
      : Constants.QuestionValidationErrorCodes.TOO_FEW_MATCHES;
  }

  if (isInteractiveBlankType) {
    isValid = answer.length >= Constants.QuestionOptionLimits[question.type].minBlanks;

    errorCode = isValid
      ? ''
      : Constants.QuestionValidationErrorCodes.TOO_FEW_BLANKS;
  }

  if (isDndImage || isHotspotQuestion) {
    isValid = answer.length >= 1;

    errorCode = isValid
      ? ''
      : Constants.QuestionValidationErrorCodes.ANSWER_NOT_MARKED;
  }

  if (isGraphingQuestion) {
    isValid = answer.length === 1;
    errorCode = isValid ? '' : Constants.QuestionValidationErrorCodes.ANSWER_NOT_MARKED;

    if (get(question, 'structure.settings.graphData.type', '') === 'Points') {
      if (get(question, 'structure.settings.graphData.maxPoints', 0) <= 0) {
        isValid = false;
        errorCode = Constants.QuestionValidationErrorCodes.GRAPHING_ANSWER_NOT_VALID;
      }
    }
  }

  if (isClassificationQuestion(question)) {
    isValid = answer.length >= Constants.QuestionOptionLimits[question.type].minOptionGroups;
    errorCode = isValid ? '' : Constants.QuestionValidationErrorCodes.TOO_FEW_OPTION_GROUPS;

    if (answer.some((optionsGroup) => !optionsGroup.optionId.length)) {
      isValid = false;
      errorCode = isValid ? '' : Constants.QuestionValidationErrorCodes.INVALID_OPTIONS_COUNT_IN_OPTION_GROUP;
    }
  }

  return { isValid, errorCode, meta };
}

export function getMediaObj(question, type) {
  let mediaObj = {};

  switch (type) {
    case 'question':
      mediaObj = get(question, 'media[0]', {});
      break;

    case 'explain':
      mediaObj = get(question, 'explain.media[0]', {});
      break;

    case 'slide':
      mediaObj = get(question, 'structure.media[0]', {});
      break;

    default:
  }

  return mediaObj;
}

export function doesQuestionHaveAnswerExplanations(question) {
  const answerExplanation = question.structure.explain;

  if (!isPlainObject(answerExplanation)) {
    return false;
  }

  const hasText = !isEmpty(answerExplanation.text);
  const hasMedia = !isEmpty(answerExplanation.media);

  return hasText || hasMedia;
}

export function doesExplanationHaveAnyMedia(question) {
  let check = false;
  const explanationMediaObjects = getExplanationMediaObjects(question);

  forEach(explanationMediaObjects, (media, type) => {
    if (!isEmpty(explanationMediaObjects[type])) {
      check = true;
    }
  });

  return check;
}

export function getExplanationMediaObjects(question) {
  const answerExplanation = getAnswerExplanation(question);
  const doesQuestionHaveMedia = Array.isArray(answerExplanation.media) && !isEmpty(answerExplanation.media);
  const explanationMediaObjects = {
    image: {},
    audio: {},
    video: {},
  };

  if (doesQuestionHaveMedia) {
    forEach(answerExplanation.media, (media) => {
      explanationMediaObjects[media.type] = media;
    });
  }

  return explanationMediaObjects;
}

export function getAnswerExplanation(question) {
  if (doesQuestionHaveAnswerExplanations(question)) {
    return question.structure.explain;
  }

  return {};
}

export function getQuestionVideoTimesForV1(question, type = 'question') {
  const mediaObj = getMediaObj(question, type);
  const start = Math.floor(Number(get(mediaObj, 'meta.start', -1)));
  const end = Math.floor(Number(get(mediaObj, 'meta.end', -1)));

  return { start, end };
}

export function getQuestionVideoId(question, type = 'question') {
  const mediaObj = getMediaObj(question, type);
  let videoId = get(mediaObj, 'meta.videoId', '');

  if (isEmpty(videoId)) {
    const url = get(mediaObj, 'url', '');

    if (!isEmpty(url)) {
      videoId = url.split('v=')[1];

      if (videoId) {
        const ampersandPosition = videoId.indexOf('&');

        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else {
        videoId = url.split('/');
        videoId = videoId[videoId.length - 1];
      }
    }
  }

  return videoId;
}

export function isQuestionQueryComplete(question) {
  const query = question?.structure.query;

  if (isEmpty(query)) {
    return false;
  }

  const isTextPresent = !isEmpty(query.text);
  const isMediaPresent = Array.isArray(query.media) && !isEmpty(query.media[0]);

  return isTextPresent || isMediaPresent;
}

export function evaluateMathTemplate(text = '') {
  const KATEX_LATEX_ATTRIBUTE_NAME = 'latex';
  const katexRegex = /<katex(.*?)>(.*?)<\/katex>/gi;
  const latex = [];
  let template = '';
  let result = katexRegex.exec(text);
  let index = 0;
  let lastKatexElementEndedAt = 0;

  while (result) {
    const attributeString = result[1].trim();
    const containsLatex = attributeString.substr(0, 5) === KATEX_LATEX_ATTRIBUTE_NAME;

    if (containsLatex) {
      const latexValue = attributeString.substring(
        KATEX_LATEX_ATTRIBUTE_NAME.length + 2,
        attributeString.length - 1,
      );
      const startOfKatex = result.index;
      const endOfKatex = katexRegex.lastIndex - 1;

      latex.push(latexValue);
      template
        += `${text.substring(lastKatexElementEndedAt, startOfKatex)}{$${index}}`;
      lastKatexElementEndedAt = endOfKatex;
      index += 1;
    }

    result = katexRegex.exec(text);
  }

  if (lastKatexElementEndedAt > 0) {
    template += text.substring(lastKatexElementEndedAt);
  }

  const isLatexPresent = !isEmpty(latex);

  return {
    hasMath: isLatexPresent,
    math: {
      latex,
      template: isLatexPresent ? template : null,
    },
  };
}

export function getAssessmentTypeQuestions() {
  return {
    [Constants.QuestionTypes.MCQ]: {
      type: Constants.QuestionTypes.MCQ,
      icon: 'far fa-check-square',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      title: i18n('Multiple-choice'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
        CategoriesBasedOnGrading.FREE,
      ],
      questionCategoryValue: 'chooseOptions',
      orderInTheCategory: 1,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.MSQ]: {
      type: Constants.QuestionTypes.MSQ,
      icon: 'far fa-check-square',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      title: i18n('Multiple-choice'),
    },
    [Constants.QuestionTypes.REORDER]: {
      type: Constants.QuestionTypes.REORDER,
      icon: 'fas fa-signal-alt',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      title: i18n('Reorder'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'fillMatchSort',
      orderInTheCategory: 3,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.MATCH]: {
      type: Constants.QuestionTypes.MATCH,
      icon: 'far fa-layer-plus',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      title: i18n('Match'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'fillMatchSort',
      orderInTheCategory: 2,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.BLANK]: {
      type: Constants.QuestionTypes.BLANK,
      icon: 'far fa-rectangle-wide',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      title: i18n('Fill-in-the-Blank'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
        CategoriesBasedOnGrading.FREE,
      ],
      questionCategoryValue: 'fillMatchSort',
      orderInTheCategory: 1,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.DRAGNDROP]: {
      type: Constants.QuestionTypes.DRAGNDROP,
      icon: 'far fa-hand-paper',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      isSTAARQuestion: true,
      title: i18n('Drag and drop'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'chooseOptions',
      orderInTheCategory: 3,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.DROPDOWN]: {
      type: Constants.QuestionTypes.DROPDOWN,
      icon: 'far fa-caret-square-down',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      isSTAARQuestion: true,
      title: i18n('Drop down'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'chooseOptions',
      orderInTheCategory: 2,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.EQUATION]: {
      type: Constants.QuestionTypes.EQUATION,
      icon: 'far fa-function',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      isSTAARQuestion: true,
      title: i18n('Math Response'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'math',
      orderInTheCategory: 1,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.DND_IMAGE]: {
      type: Constants.QuestionTypes.DND_IMAGE,
      icon: 'fas fa-message-image',
      brandColor: 'b',
      isNew: true,
      section: Constants.QuestionTypeSections.ASSESSMENT,
      title: i18n('Labeling'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'highlight',
      orderInTheCategory: 2,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.HOTSPOT]: {
      type: Constants.QuestionTypes.HOTSPOT,
      icon: 'far fa-bullseye-pointer',
      brandColor: 'b',
      isNew: true,
      section: Constants.QuestionTypeSections.ASSESSMENT,
      title: i18n('Hotspot'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'highlight',
      orderInTheCategory: 1,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.GRAPHING]: {
      type: Constants.QuestionTypes.GRAPHING,
      icon: 'far fa-chart-line',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      sortOrder: 6,
      majorQuickAddOptionOrder: 5,
      isNew: true,
      isSTAARQuestion: true,
      title: i18n('Graphing'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'math',
      orderInTheCategory: 2,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.CLASSIFICATION]: {
      type: Constants.QuestionTypes.CLASSIFICATION,
      icon: 'fal fa-columns-3',
      brandColor: 'b',
      section: Constants.QuestionTypeSections.ASSESSMENT,
      sortOrder: 6,
      majorQuickAddOptionOrder: 5,
      isNew: true,
      isSTAARQuestion: true,
      title: i18n('Classification'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.AUTO_GRADED,
      ],
      questionCategoryValue: 'highlight',
      orderInTheCategory: 3,
      tooltipPosition: 'right',
      featureFlag: Constants.FeatureFlagsTypes.CLASSIFICATION_QTYPE,
    },
  };
}

export function comingSoonAssessmentType() {
  return {};
}

export function getHigherOrderThinkingTypeQuestions() {
  return {
    [Constants.QuestionTypes.DRAW]: {
      type: Constants.QuestionTypes.DRAW,
      icon: 'far pen-swirl',
      brandColor: 'e',
      section: Constants.QuestionTypeSections.HIGHER_ORDER_THINKING,
      title: i18n('Draw'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.FLEXIBLE_GRADING,
        CategoriesBasedOnGrading.FREE,
      ],
      questionCategoryValue: 'openResponse',
      orderInTheCategory: 2,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.OPEN]: {
      type: Constants.QuestionTypes.OPEN,
      icon: 'far fa-align-left',
      brandColor: 'e',
      section: Constants.QuestionTypeSections.HIGHER_ORDER_THINKING,
      title: i18n('Open-ended'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.FLEXIBLE_GRADING,
        CategoriesBasedOnGrading.FREE,
      ],
      questionCategoryValue: 'openResponse',
      orderInTheCategory: 1,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.VIDEO]: {
      type: Constants.QuestionTypes.VIDEO,
      icon: 'fas fa-video',
      brandColor: 'e',
      section: Constants.QuestionTypeSections.HIGHER_ORDER_THINKING,
      title: i18n('Video Response'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.FLEXIBLE_GRADING,
      ],
      questionCategoryValue: 'openResponse',
      orderInTheCategory: 3,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.AUDIO]: {
      type: Constants.QuestionTypes.AUDIO,
      icon: 'fas fa-microphone-alt',
      brandColor: 'e',
      section: Constants.QuestionTypeSections.HIGHER_ORDER_THINKING,
      title: i18n('Audio Response'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.FLEXIBLE_GRADING,
      ],
      questionCategoryValue: 'openResponse',
      orderInTheCategory: 4,
      tooltipPosition: 'right',
    },
  };
}

export function getOtherTypeQuestions() {
  return {
    [Constants.QuestionTypes.POLL]: {
      type: Constants.QuestionTypes.POLL,
      icon: 'far fa-poll',
      brandColor: 'a',
      section: Constants.QuestionTypeSections.OTHER,
      title: i18n('Poll'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.FLEXIBLE_GRADING,
        CategoriesBasedOnGrading.FREE,
        CategoriesBasedOnGrading.UNGRADED,
      ],
      questionCategoryValue: 'opinionPulseCheck',
      orderInTheCategory: 1,
      tooltipPosition: 'right',
    },
    [Constants.QuestionTypes.WORDCLOUD]: {
      type: Constants.QuestionTypes.WORDCLOUD,
      icon: 'far fa-cloud-word',
      brandColor: 'a',
      section: Constants.QuestionTypeSections.OTHER,
      title: i18n('Word Cloud'),
      isNew: true,
      featureFlag: Constants.FeatureFlagsTypes.WORDCLOUD_QTYPE,
    },
  };
}

export function getQuestionTypes() {
  return {
    // Assessment type
    ...getAssessmentTypeQuestions(),
    // Higher Order Thinking
    ...getHigherOrderThinkingTypeQuestions(),
    // Other
    ...getOtherTypeQuestions(),
  };
}

export function getAllContentTypes() {
  return {
    ...getQuestionTypes(),
    [Constants.SlideTypes.CONTENT_SLIDE_V1]: {
      type: Constants.QuestionTypes.CONTENT_SLIDE_V1,
      icon: 'far fa-presentation',
      brandColor: 'f',
      section: Constants.QuestionTypeSections.OTHER,
      questionCategoryBasedOnGrading: [
      ],
      title: i18n('Slide'),
    },
    [Constants.SlideTypes.CONTENT_SLIDE_V2]: {
      type: Constants.SlideTypes.CONTENT_SLIDE_V2,
      icon: 'far fa-presentation',
      brandColor: 'f',
      section: Constants.QuestionTypeSections.OTHER,
      title: i18n('Slide'),
      questionCategoryBasedOnGrading: [
        CategoriesBasedOnGrading.ALL,
        CategoriesBasedOnGrading.UNGRADED,
      ],
      questionCategoryValue: 'presentation',
      orderInTheCategory: 1,
      tooltipPosition: 'top',
    },
  };
}

export function getQuestionTypeExplainerData() {
  return {
    [Constants.QuestionTypes.MCQ]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/mcqmsq.min.mp4',
      title: i18n('Multiple-Choice'),
      description: i18n('Check for retention by asking students to pick one or more correct answers. Use text, images, or math equations to spice things up!'),
      corporateDescription: i18n('Check for retention by asking participants to pick one or more correct answers. Use text, images, or videos to spice things up!'),
      descriptionforQtypeVisibilityThumbnail: i18n('Ask students to pick one or more correct answers.'),
      tag: i18n('Auto-graded'),
    },
    [Constants.QuestionTypes.MSQ]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/mcsmsq.min.mp4',
      title: i18n('Multiple-Choice'),
      description: i18n('Check for retention by asking students to pick one or more correct answers. Use text, images, or math equations to spice things up!'),
      corporateDescription: i18n('Check for retention by asking participants to pick one or more correct answers. Use text, images, or videos to spice things up!'),
      descriptionforQtypeVisibilityThumbnail: i18n('Ask students to pick one or more correct answers.'),
      tag: i18n('Auto-graded'),
    },
    [Constants.QuestionTypes.REORDER]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/reorder.min.mp4',
      title: i18n('Reorder'),
      description: i18n('Arrange words to form a sentence, reorder events in a story or sort countries from largest to smallest—the possibilities are endless!'),
      corporateDescription: i18n('Arrange words to form a sentence, reorder events in a story or sort countries from largest to smallest—the possibilities are endless!'),
      descriptionforQtypeVisibilityThumbnail: i18n('Arrange options in a particular order.'),
      tag: i18n('Auto-graded'),
    },
    [Constants.QuestionTypes.MATCH]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/match.min.mp4',
      title: i18n('Match'),
      description: i18n('Revamp the good ol’ classic & ask students to match anything—from capital cities with states to fractions with their percentages!'),
      corporateDescription: i18n('Revamp the good ol’ classic & ask participants to match anything—from capital cities with states to fractions with their percentages!'),
      descriptionforQtypeVisibilityThumbnail: i18n('Ask students to match anything.'),
      tag: i18n('Auto-graded'),
    },
    [Constants.QuestionTypes.DRAGNDROP]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/dnd.min.mp4',
      title: i18n('Drag and drop'),
      description: i18n('Challenge students to think more critically by using visually interactive drag and drop questions.'),
      corporateDescription: i18n('Challenge participants to think more critically by using visually interactive drag and drop questions.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Visually interactive drag and drop question type.'),
      tag: i18n('Auto-graded'),
      isSTAARQuestion: true,
    },
    [Constants.QuestionTypes.DROPDOWN]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/dd.min.mp4',
      title: i18n('Drop down'),
      description: i18n('Upgrade your fill in the blanks to easy drop down questions so students can select from a list of options.'),
      corporateDescription: i18n('Upgrade your fill in the blanks to easy drop down questions so participants can select from a list of options.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Enhanced fill in the blanks with options'),
      tag: i18n('Auto-graded'),
      isSTAARQuestion: true,
    },
    [Constants.QuestionTypes.GRAPHING]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/graphing.min.mp4',
      title: i18n('Graphing'),
      description: i18n('Test mathematical concepts like slope, y-intercept, vertex and more by asking students to plot points and equations on a graph.'),
      corporateDescription: i18n('Test mathematical concepts like slope, y-intercept, vertex and more by asking participants to plot points and equations on a graph.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Test mathematical concepts by asking students to plot points and equations on a graph.'),
      tag: i18n('Auto-graded'),
      isSTAARQuestion: true,
    },
    [Constants.QuestionTypes.EQUATION]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/equation.min.mp4',
      title: i18n('Math Response'),
      description: i18n('Students can respond to questions with numbers, operators, fractions, exponents, and more!'),
      corporateDescription: i18n('Participants can respond to questions with numbers, operators, fractions, exponents, and more!'),
      descriptionforQtypeVisibilityThumbnail: i18n('Questions with numbers, operators, fractions, exponents, and more!'),
      tag: i18n('Auto-graded'),
      isSTAARQuestion: true,
    },
    [Constants.QuestionTypes.DND_IMAGE]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/dnd_image.min.mp4',
      title: i18n('Labeling'),
      description: i18n('Engage students with media-rich questions where they can drag and drop text labels onto specific parts of an image.'),
      corporateDescription: i18n('Engage participants with media-rich questions where they can drag and drop text labels onto specific parts of an image.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Drag and drop options on an image.'),
      tag: i18n('Auto-graded'),
    },
    [Constants.QuestionTypes.HOTSPOT]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/hotspot.min.mp4',
      title: i18n('Hotspot'),
      description: i18n('Ask students to ‘spot’ what they know; whether it’s identifying cities on a map or identifying organs in human bodies.'),
      corporateDescription: i18n('Ask participants to ‘spot’ what they know; whether it’s identifying cities on a map or identifying organs in human bodies.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Select from multiple specified regions in an image.'),
      tag: i18n('Auto-graded'),
    },
    [Constants.QuestionTypes.BLANK]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/fib.v2.min.mp4',
      title: i18n('Fill-in-the-Blank'),
      description: i18n('Prompt your students for text and check if they remember the correct spelling of acommodate accomodate accommodate.'),
      corporateDescription: i18n('Prompt participants for text to check recall of specific topics and terms.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Ask students to fill the correct option in the blank.'),
      tag: i18n('Auto-graded'),
    },
    [Constants.QuestionTypes.DRAW]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/draw.min.mp4',
      title: i18n('Draw'),
      description: i18n('Ask students to ‘show’ what they know in a more creative way; whether it’s circling cities on a map or solving step-wise equations.'),
      corporateDescription: i18n('Ask participants to ‘show’ what they know in a more creative way; whether it’s circling cities on a map or drawing a flowchart.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Ask students to ‘show’ what they know in a more creative way.'),
      tag: i18n('Flexible grading'),
    },
    [Constants.QuestionTypes.OPEN]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/oeq.min.mp4',
      title: i18n('Open-Ended'),
      description: i18n('Get opinions or provide an essay prompt and grade it later! A longer answer type, students can enter up to 1000 characters.'),
      corporateDescription: i18n('Get opinions or provide an essay prompt! A longer answer type, participants can enter up to 1000 characters.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Ask students to type in long form text answers.'),
      tag: i18n('Flexible grading'),
    },
    [Constants.QuestionTypes.VIDEO]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/video.min.mp4',
      title: i18n('Video Response'),
      description: i18n('Give students the confidence to visually express themselves, personalize their learning, and practice presentation skills.'),
      corporateDescription: i18n('Let participants record and visually express themselves by practice presentation skills or scripts.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Ask students to visually express themselves.'),
      tag: i18n('Flexible grading'),
    },
    [Constants.QuestionTypes.AUDIO]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/audio.min.mp4',
      title: i18n('Audio Response'),
      description: i18n('Enunciate a word, recite a poem, describe an image, or demonstrate reading skills. Amplify the voices of your students.'),
      corporateDescription: i18n('Let participants record themselves speak and hear from everyone, not just the loudest or fastest.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Amplify the voices of your students.'),
      tag: i18n('Flexible grading'),
    },
    [Constants.QuestionTypes.POLL]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/poll.min.mp4',
      title: i18n('Poll'),
      description: i18n('Understand whether the majority of the class understood the topic or find out what they want their next field trip to be.'),
      corporateDescription: i18n('Understand whether the majority of the group understood the training or find out what they want their next offsite to be.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Understand whether the majority of the class understood the topic.'),
      tag: i18n('Ungraded'),
    },
    [Constants.SlideTypes.CONTENT_SLIDE_V1]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/slide.min.mp4',
      title: i18n('Slide'),
      description: i18n('Use Lessons to create an instructor-led experience where slides and multimedia are combined with quiz and poll questions.'),
      corporateDescription: i18n('Use Lessons to create an instructor-led experience where slides and multimedia are combined with quiz and poll questions.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Use Lessons to create an instructor-led experience.'),
    },
    [Constants.SlideTypes.CONTENT_SLIDE_V2]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/slide.min.mp4',
      title: i18n('Slide'),
      description: i18n('Use Lessons to create an instructor-led experience where slides and multimedia are combined with quiz and poll questions.'),
      corporateDescription: i18n('Use Lessons to create an instructor-led experience where slides and multimedia are combined with quiz and poll questions.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Use Lessons to create an instructor-led experience.'),
    },
    [Constants.QuestionTypes.WORDCLOUD]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/wordcloud.min.mp4',
      title: i18n('Word Cloud'),
      description: i18n('Word clouds are great icebreakers and presentation openers. Participants answer this question in a one or two-word answer, and all their submissions gather in a word collage – a “cloud” made of words.'),
      corporateDescription: i18n('Word clouds are great icebreakers and presentation openers. Participants answer this question in a one or two-word answer, and all their submissions gather in a word collage – a “cloud” made of words.'),
      tag: i18n('Ungraded'),
    },
    [Constants.QuestionTypes.CLASSIFICATION]: {
      videoURL: 'https://cf.quizizz.com/videos/qtype/classification.min.mp4',
      title: i18n('Classification'),
      description: i18n('Assess student\'s ability to categorise concepts or items into the appropriate groups. It is an effective way to test students\' knowledge of categorisation and their ability to organise information into meaningful groups.'),
      corporateDescription: i18n('Assess participant\'s ability to categorise concepts or items into the appropriate groups. It is an effective way to test participant\'s knowledge of categorisation and their ability to organise information into meaningful groups.'),
      descriptionforQtypeVisibilityThumbnail: i18n('Assess student\'s ability to categorise concepts or items into the appropriate groups.'),
      tag: i18n('Auto-graded'),
      isSTAARQuestion: true,
    },
  };
}

export function getHtmlWithMathKatexString(mathJaxHTML, katex) {
  const mathJaxElements = mathJaxHTML.match(/<katex.*?<\/katex>/g);
  const katexElements = map(mathJaxElements, (mathJaxEle, index) => {
    const latexStr = mathJaxEle.match(/latex.*?=.*?".*?"/)[0];
    const quotedLatex = latexStr.match(/".*"/)[0];
    const latex = unescape(quotedLatex.substring(1, quotedLatex.length - 1));

    let katexEle = '';

    try {
      katexEle = katex.renderToString(latex, {
        displayMode: true,
      });
    } catch (err) {
      window.console.error(err);
    }

    return ` ${katexEle} `;
  });
  let katexHTML = mathJaxHTML;

  forEach(mathJaxElements, (mathJaxEle, index) => {
    katexHTML = katexHTML.replace(mathJaxEle, katexElements[index]);
  });

  return katexHTML;
}

/**
 * @descriptions creates a map of target id to option id or vice versa to avoid O(N) lookups
 * @param {[{targetId: string, optionId: [string]}]} answer
 * @param {boolean} canOptionHaveMultipleTargets
 * @returns {object} with a key value pairs of option/target to its target/option
 */
export function mapTargetIdToOptionId(
  answer,
  canOptionHaveMultipleTargets = false,
) {
  const answerMap = {};

  if (!isArray(answer)) {
    return;
  }

  if (canOptionHaveMultipleTargets) {
    answer.forEach((ans) => {
      ans.optionId?.forEach((optionId) => {
        if (!answerMap[optionId]) {
          answerMap[optionId] = {};
        }
        if (!answerMap[optionId][ans.targetId]) {
          answerMap[optionId][ans.targetId] = true;
        }
      });
    });
  } else {
    answer.forEach((ans) => {
      ans.optionId?.forEach((optionId) => {
        if (!answerMap[ans.targetId]) {
          answerMap[ans.targetId] = {};
        }
        if (!answerMap[ans.targetId][optionId]) {
          answerMap[ans.targetId][optionId] = true;
        }
      });
    });
  }

  return answerMap;
}

/**
 * @description Replaces custom <blank></blank> tag with span to create a styled blank effect
 * @param {string} queryStringHTML
 * @param {{withStyles: boolean, withRomans: boolean, blankClass: string, content: Object, placeholder: string, click: Function}} config
 * @returns {string} a string with all the blanks replaced by span with styling
 */
export function replaceBlankWithStyledSpan(
  queryStringHTML,
  {
    withStyles = true,
    withRomans = true,
    blankClass = '',
    placeholder = '&nbsp;',
    content = {},
    style = {},
    singleBlankClass = [],
  } = {},
) {
  const blankHTML = queryStringHTML.match(/<blank.*?<\/blank>/g);

  const blankElements = map(blankHTML, (blankEle, index) => {
    const notation = ['(a)', '(b)', '(c)', '(d)', '(e)'];
    const blankId = blankEle.match(/".*"/)[0].replace(/['"]+/g, '');
    let blankStyles = {
      display: 'inline-block',
      width: '61px',
      'border-bottom': '1px solid #222222',
      'line-height': 1,
      ...style,
    };

    if (!withStyles) {
      blankStyles = {};
    }

    const flattenStyles = Object.keys(blankStyles)
      .map((key, index) => `${key}:${blankStyles[key]}`)
      .join(';');
    let replacedBlankElement = `<span class="question-query-blank ${blankClass} ${singleBlankClass[index] ?? ''
    }" id="${blankId}" style="${flattenStyles}">${content[blankId] ?? placeholder
    }</span>`;
    if (withRomans) {
      replacedBlankElement = `${notation[index]} ${replacedBlankElement}`;
    }
    return ` ${replacedBlankElement} `;
  });

  let blankHtmlString = queryStringHTML;

  forEach(blankHTML, (blank, index) => {
    blankHtmlString = blankHtmlString.replace(blank, blankElements[index]);
  });

  return blankHtmlString;
}

/**
 * @description in case we need to know which blank is at which position in query string
 * @param {string} queryStringHTML
 * @returns an object with blankId:blank-order
 */
export function mapBlankIdsToBlankOrder(queryStringHTML) {
  const blankHTML = queryStringHTML.match(/<blank.*?<\/blank>/g);

  const blankIdByIndex = {};

  blankHTML?.forEach((blankElement, blankIndex) => {
    const blankId = blankElement.match(/".*"/)[0].slice(1, -1);
    blankIdByIndex[blankId] = blankIndex;
  });

  return blankIdByIndex;
}

/**
 * @description parses query text with blanks populated with right answer to be rendered into tiptap custom node and maps blank ids to correct text
 * @param {*} question
 * @returns {{queryText: string, optionForBlankId: {blankId: string, option: object}  }} query text with blanks populated with the correct answer and text for each blank
 */
export function pushCorrectOptionsIntoBlanks(question) {
  const queryText = question.structure?.query?.text;

  if (!queryText.includes('<blank')) {
    return {
      queryText,
      optionForBlankId: {},
    };
  }

  const { options = [], answer = [] } = question.structure ?? {};

  if (answer.length === 0 || options.length === 0) {
    return queryText;
  }

  const mapOfOptionIdToOption = {};
  const optionForBlankId = [];

  options.forEach((option) => {
    mapOfOptionIdToOption[option._id] = {
      ...option,
      text: StringUtils.extractContentFromHTML(option.text),
    };
  });

  const blankHTML = queryText.match(/<blank.*?<\/blank>/g);

  const queryChunks = queryText.split('</blank>');

  blankHTML?.forEach((blankElement, blankIndex) => {
    const blankId = blankElement.match(/".*"/)[0].slice(1, -1);
    const { optionId = [] } = answer.find((ans) => ans.targetId === blankId) ?? {};

    if (!optionId[0]) {
      return;
    }

    queryChunks[blankIndex] += mapOfOptionIdToOption[optionId[0]].text;
    optionForBlankId[blankId] = mapOfOptionIdToOption[optionId[0]];
  });

  return {
    queryText: queryChunks.join('</blank>'),
    optionForBlankId,
  };
}

export function getQuestionVideoTimes(media) {
  let endTime = get(media, 'video.meta.endTime', -1);
  let startTime = get(media, 'video.meta.startTime', -1);

  if (endTime < 0) {
    endTime = get(media, 'video.meta.end', -1);
  }

  if (startTime < 0) {
    startTime = get(media, 'video.meta.end', -1);
  }

  return { startTime, endTime };
}

export function isPremiumContent(content) {
  let quiz = content;
  const contentType = quiz.type;

  if (!quiz) {
    return false;
  }

  let questions = quiz.info?.questions ?? [];

  if (content.hasDraftVersion && content.draft) {
    quiz = content.draft;
    if (contentType === Constants.ContentType.PRESENTATION) {
      questions = quiz.questionDrafts || [];
    } else {
      questions = quiz.questions || [];
    }
  }

  if (hasSuperTeleportQuestion(questions)) {
    return true;
  }

  if (hasCustomResponseQuestion(questions)) {
    return true;
  }

  if (contentType === Constants.ContentType.QUIZ) {
    return doesQuizHavePremiumStructureType(questions);
  }
  return doesLessonHavePremiumStructureType(questions);
}

export function hasCustomResponseQuestion(questions) {
  return !!questions.find((draftQuestion) => draftQuestion.structure?.settings?.canSubmitCustomResponse ?? false);
}

export function doesQuizHavePremiumStructureType(questions) {
  let hasStructure = false;

  for (let i = 0; i < questions.length && !hasStructure; i++) {
    const question = questions[i];

    hasStructure = hasContent('explanation', question.structure)
      || hasContent('audio', question.structure)
      || hasContent('video', question.structure)
      || isQuestionTypeSuperType(question.type);
  }

  return hasStructure;
}

export function doesLessonHavePremiumStructureType(questions) {
  let hasStructure = false;

  for (let i = 0; i < questions.length && !hasStructure; i++) {
    const question = questions[i];

    hasStructure = hasContent('audio', question.structure)
      || hasContent('video', question.structure)
      || isQuestionTypeSuperType(question.type);
  }

  return hasStructure;
}

export function hasContent(type, structure) {
  let isContentAvailable = false;

  if (!structure) {
    return false;
  }

  const mediaObj = get(structure, 'query.media', []);

  switch (type) {
    case 'explanation':
      if (structure.explain) {
        // const hasText = !isEmpty(get(structure.explain, 'text', ''));
        const media = structure.explain.media[0];
        // const hasMedia = media ? (media.type === 'audio' || media.type === 'image' || media.type === 'video') : false;
        const hasSuperMedia = media
          ? media.type === 'audio' || media.type === 'video'
          : false;

        // keeping the old logic for reference
        // isContentAvailable = !isEmpty(structure.explain) && (hasText || hasMedia);
        isContentAvailable = !isEmpty(structure.explain) && hasSuperMedia;
      }
      break;
    case 'audio':
      if (!isEmpty(mediaObj)) {
        for (let i = 0; i < mediaObj.length; i++) {
          const item = mediaObj[i];
          if (item.type === 'audio') {
            isContentAvailable = true;
            break;
          }
        }
      }
      break;
    case 'video':
      if (!isEmpty(mediaObj)) {
        for (let i = 0; i < mediaObj.length; i++) {
          const item = mediaObj[i];
          if (item.type === 'video') {
            isContentAvailable = true;
            break;
          }
        }
      }
      break;
    default:
      break;
  }

  return isContentAvailable;
}

export function hasSuperTeleportQuestion(questions) {
  let hassuperTeleportQuestion = false;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    if (question.isSuperParent) {
      hassuperTeleportQuestion = true;
      break;
    }
  }

  return hassuperTeleportQuestion;
}

export function hasTwoOrMoreSlideV1s(quiz) {
  let questions;

  if (get(quiz, 'info.questions.length', 0) !== 0) {
    questions = quiz.info.questions;
  } else if (quiz.draft.questions.length !== 0) {
    questions = quiz.draft.questions;
  }
  let countSLIDEV1s = 0;
  forEach(questions, (question) => {
    if (question.type === Constants.SlideTypes.CONTENT_SLIDE_V1) {
      countSLIDEV1s += 1;
    }
  });

  return countSLIDEV1s > 1;
}

export function validateKind(slide) {
  let isValid = true;
  let errorCode = '';
  const meta = {};
  const slideType = slide.type;
  const kind = get(slide, 'structure.kind', '');

  if (!kind || kind !== slideType) {
    isValid = false;
    errorCode = `invalid_kind:${kind}`;
  }

  return { isValid, errorCode, meta };
}

export async function getSingleSlideValidationErrors(slide) {
  const errorsForThisSlide = [];

  if (!isSlideForQuestion(slide)) {
    return errorsForThisSlide;
  }

  const validateAnswer = await validateQuestionAnswer(slide);

  const validationResults = [
    validateQuestionQuery(slide),
    validateQuestionOptions(slide),
    validateAnswer,
  ];

  forEach(validationResults, (result) => {
    if (!result.isValid) {
      errorsForThisSlide.push(result);
    }
  });

  return errorsForThisSlide;
}

export async function getQuestionValidationErrors(question) {
  const errors = await getSingleSlideValidationErrors(question);
  const kindError = validateKind(question);
  if (!kindError.isValid) {
    errors.push(kindError);
  }
  return errors;
}

export function getAllCoAuthorsForQuiz(quizPermissions) {
  if (!quizPermissions) {
    return [];
  }

  const users = quizPermissions.userPermissions ?? {};

  return Object.values(users);
}
export function isQuizVersionGradeValid(quizVersion) {
  const { grade } = quizVersion;
  const allowedGradeValues = Grades.map((g) => g.val);

  if (!Array.isArray(grade)) {
    return false;
  }

  if (isEmpty(grade)) {
    return true;
  }

  return (
    includes(allowedGradeValues, Number(grade[0]))
    && (isNil(grade[1]) || includes(allowedGradeValues, Number(grade[1])))
  );
}

export function getQuestionDefaultMarks(question) {
  if (
    isNull(get(question, 'structure.marks.correct', null))
    || isUndefined(get(question, 'structure.marks.correct', undefined))
    || get(question, 'structure.marks.correct', -1) < 0
  ) {
    return isQuestionForPoll(question) || isWordCloudQuestion(question) || isSlideForContent(question) ? 0 : 1;
  }

  if (isQuestionForPoll(question) || isSlideForContent(question)) {
    return 0;
  }

  return question.structure.marks.correct;
}

export function isQuizVersionLanguageValid(quizVersion) {
  const { lang } = quizVersion;
  const allowedLanguages = map(Languages, (l) => l.name);

  return allowedLanguages.includes(lang);
}

export function removeKatexEquationFromString(string, { id, latex }) {
  const removalterm = `<katex latex="${latex}" id="${id}"></katex>`;
  const res = string.replace(removalterm, '');

  return res;
}

export function addNewAnswerExplanationSlide(explanation, atIndex = -1) {
  const mathObject = {
    hasMath: explanation.hasMath,
    math: explanation.hasMath
      ? explanation.math
      : {
        latex: [],
        template: null,
      },
  };

  NewSlideService.addNewSlide(
    Constants.SlideTemplates.TITLE_TEXT_MEDIA,
    {
      title: {
        html: '<h1><strong><span style="font-size: 48px;">Explanation Slide...</span></strong></h1>',
      },
      subtitle: {
        html: !isEmpty(explanation.text)
          ? createSpanInsidePTag(explanation.text)
          : SlideTemplates.ShortText.data.html,
        ...mathObject,
      },
      media: explanation.media.length ? explanation.media[0] : Media(),
      atIndex: atIndex + 1,
    },
    true,
  );
}

export function getNewSlideFromExplanation(explanation) {
  const mathObject = {
    hasMath: explanation.hasMath,
    math: {
      latex: [],
      template: null,
    },
  };

  const slide = NewSlideService.createSlide(
    Constants.SlideTemplates.TITLE_TEXT_MEDIA,
    {
      title: {
        html: '<h1><strong><span style="font-size: 48px;">Explanation Slide...</span></strong></h1>',
      },
      subtitle: {
        html: !isEmpty(explanation.text)
          ? createSpanInsidePTag(explanation.text)
          : SlideTemplates.ShortText.data.html,
        ...mathObject,
      },
      media: explanation.media.length ? explanation.media[0] : Media(),
    },
  );

  return slide;
}

function isQuizAIGenerated($store) {
  return $store.getters?.['contentEditor/isAIGenerated'];
}

function isQuizAIGeneratedFromExtraction($store) {
  return $store.getters?.['contentEditor/isAIGeneratedFromExtraction'];
}

export function redirectOnLeavingEditor(
  query,
  defaultUrl,
  $router,
  $store,
  resetQuiz = true,
) {
  if (query.source === 'game') {
    window.location = '/join/activity/created';
    return;
  }

  if (query.mr) {
    query.mr += '&actionType=save';
    window.location = query.mr;
    return;
  }

  if (resetQuiz) {
    $store.dispatch('currentQuiz/resetQuiz');
  }

  let redirectUrl = !defaultUrl.includes('?') ? (`${defaultUrl}?created=true`) : (`${defaultUrl}&created=true`);
  if (isQuizAIGeneratedFromExtraction($store)) {
    redirectUrl += '&aiGenFromExtraction=true';
  } else if (isQuizAIGenerated($store)) {
    redirectUrl += '&aiGen=true';
  }

  /**
   * If user is corporate and this is user's first quiz/presentation
   * (To refresh user's contentMetrics)
   */
  if (
    (defaultUrl.includes('/admin/quiz')
      || defaultUrl.includes('admin/presentation'))
    && getUser().isCorporate
    && !getUser()?.qfwOnboardingStatus?.quizCreated
  ) {
    window.location.href = redirectUrl;
  } else {
    $router.push(redirectUrl);
  }
}

export function getInteractiveQuestions({ questions }) {
  return questions.filter(isSlideForQuestion);
}

export function isQuestionTypeSuperType(questionType) {
  return [
    Constants.QuestionTypes.AUDIO,
    Constants.QuestionTypes.VIDEO,
    Constants.QuestionTypes.MATCH,
    Constants.QuestionTypes.REORDER,
    Constants.QuestionTypes.DRAGNDROP,
    Constants.QuestionTypes.DROPDOWN,
    Constants.QuestionTypes.EQUATION,
    Constants.QuestionTypes.HOTSPOT,
    Constants.QuestionTypes.DND_IMAGE,
    Constants.QuestionTypes.GRAPHING,
    Constants.QuestionTypes.CLASSIFICATION,
  ].includes(questionType);
}

export function getSubjectFromPreferencesOrUserData(user) {
  if (user.contentPreferences?.subjects?.mostRecent) {
    return [user.contentPreferences.subjects.mostRecent];
  }
  if (user.subjectTags?.length > 0) {
    return [user.subjectTags[0]];
  }
  return [];
}

export function getGradeFromPreferencesOrUserData(user) {
  if (user.contentPreferences?.grades?.mostRecent?.length > 0) {
    return [
      user.contentPreferences.grades.mostRecent[0],
      user.contentPreferences.grades.mostRecent[1],
    ];
  }
  if (user.grades?.length > 0) {
    return [
      user.grades[user.grades?.length - 1],
      user.grades[user.grades?.length - 1],
    ];
  }
  return [];
}

export function isResponseRescored(response) {
  return (
    get(response, 'metadata.rescored', []).length > 0
    || get(response, 'metadata.remarked', []).length > 0
  );
}

export function isQuizLessThanDaysOld(quiz, numberOfDays = 10) {
  const today = dayjs();
  const dayCreated = dayjs(quiz.createdAt);
  const durationInDays = today.diff(dayCreated, 'day');
  return durationInDays < numberOfDays;
}
/**
 * [TODO]: instead of `capitalize`, `decoration` can be added with options like 'uppercase' and 'capitalize',
 * based on utility requirenment.
 */
export function getContentTypeText(quiz, user = null, capitalize = false) {
  const contentType = quiz.type;
  let entityText = i18n('quiz');

  if (contentType === Constants.ContentType.PRESENTATION) {
    entityText = user?.isCorporate ? i18n('presentation') : i18n('lesson');
  }

  if (capitalize) {
    entityText = lodashCapitalize(entityText);
  }
  return entityText;
}

export function isAnswerExplanationEmpty(explanation) {
  if (!explanation) {
    return true;
  }

  if (explanation.media.find((media) => !!media.url)) {
    return false;
  }

  return StringUtils.extractContentFromHTML(explanation.text) === '';
}

export function getVariantNameForSuperQuestionsUsed(questionTypesWithCount) {
  let res = '';
  Object.keys(Constants.QuestionTypes).forEach((questionType) => {
    const superQuestionIndex = questionTypesWithCount.findIndex(
      (question) => question.type === questionType,
    );
    if (isQuestionTypeSuperType(questionType)) {
      const superQuestionFound = questionTypesWithCount[superQuestionIndex];
      // res += `${questionType.substring(0, 3)}:${superQuestionFound?.count || 0}_`;
      res += `${superQuestionFound?.count || 0}:`;
    }
  });
  return res;
}

export function getLatexContent(str) {
  const regex = /<katex[^>]*latex="([^"]*)[^>]*>/;
  const match = regex.exec(str);

  if (match) {
    return match[1];
  }
  return null;
}

export function getPointsList(question) {
  // To support upto 20 points
  let value = Array.from(Array(21).keys());
  if (!question?.type) {
    return value;
  }
  const correctAnswer = shouldQuestionTypeHaveCorrectAnswer(question);
  if (correctAnswer) {
    value = value.slice(1);
  }
  return value;
}

export function isVariantQuestionType(type) {
  return !!Constants.DisplayVariantNames[type];
}

export const GradeLocalizations = {
  'en-us': 'grade',
  'id-id': 'class',
  'en-gb': 'year',
  'th-th': 'grade',
  'vi-vn': 'grade',
  'es-es': 'grade',
  'es-419': 'grade',
  'pt-br': 'grade',
  'ru-ru': 'grade',
  'es-us': 'grade',
  'pl-pl': 'grade',
  'en-in': 'class',
  en: 'class',
};

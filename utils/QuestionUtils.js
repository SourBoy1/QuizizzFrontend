import ObjectID from 'bson-objectid';

import Constants from '~/config/Constants';
import { isInteractiveBlankBasedQuestion, isOptionEmpty } from './QuizUtils';

/**
 *
 * @param {string} questionType the question type to convert
 * @param {{options: Array, answer: any}} config the options and answer of the original question
 * @returns the options and answer of the dnd image question
 */
export function convertQuestionTypeToDndImage(questionType, { options = [], answer }) {
  let finalAnswer = [];
  const targets = [];
  let finalOptions = options;
  let hasConversionHappened = false;

  if (questionType === Constants.QuestionTypes.MCQ && !isOptionEmpty(options[answer])) {
    hasConversionHappened = true;
    const correctOption = options[answer];
    const targetId = ObjectID().toHexString();
    finalAnswer.push({
      targetId,
      optionId: [correctOption._id],
    });

    targets.push({
      id: targetId,
      position: {
        x: 10,
        y: 10,
      },
    });
  }

  if (questionType === Constants.QuestionTypes.MSQ && answer.length > 0) {
    hasConversionHappened = true;
    answer.forEach((ans, ansIndex) => {
      const correctOption = options[ans];
      const targetId = ObjectID().toHexString();
      finalAnswer.push({
        targetId,
        optionId: [correctOption._id],
      });

      targets.push({
        id: targetId,
        position: {
          x: 10,
          y: 10 + (ansIndex * 60),
        },
      });
    });
  }

  if (isInteractiveBlankBasedQuestion({ type: questionType })) {
    hasConversionHappened = true;
    finalAnswer = answer;
    answer.forEach((ans, ansIndex) => {
      const { targetId } = ans;
      targets.push({
        id: targetId,
        position: {
          x: 10,
          y: 10 + (ansIndex * 60),
        },
      });
    });
  }

  if (!hasConversionHappened) {
    finalOptions = [];
  }

  return { answer: finalAnswer, options: finalOptions, targets };
}

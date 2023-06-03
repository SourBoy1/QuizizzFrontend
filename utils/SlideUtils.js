import Constants from '../config/Constants';

function isSlideForQuestion(question) {
  if (!question) {
    return false;
  }

  const { type } = question;
  return Object.values(Constants.QuestionTypes).includes(type);
}

export { isSlideForQuestion };

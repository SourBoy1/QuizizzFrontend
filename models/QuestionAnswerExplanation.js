import defaultsDeep from 'lodash/defaultsDeep';

export default function QuestionAnswerExplanation(values) {
  return defaultsDeep(values, {
    math: {
      latex: [],
      template: null,
    },
    type: '',
    hasMath: false,
    media: [],
    text: '',
  });
}

import defaultsDeep from 'lodash/defaultsDeep';
import map from 'lodash/map';

import Media from './Media';

function mediaInitializer(media) {
  if (media) {
    return map(Array.isArray(media) ? media : [media], Media);
  }
  return [];
}

export default function QuestionQuery(values) {
  return defaultsDeep(values, {
    answerTime: -1,
    math: {
      latex: [],
      template: null,
    },
    type: null,
    hasMath: false,
    media: mediaInitializer(values?.media),
    text: '',
  });
}

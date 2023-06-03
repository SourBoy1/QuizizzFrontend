import defaultsDeep from 'lodash/defaultsDeep';
import ObjectId from 'bson-objectid';

export default function QuestionOption(values) {
  return defaultsDeep(values, {
    _id: ObjectId().toHexString(),
    math: {
      latex: [],
      template: null,
    },
    type: 'text',
    hasMath: false,
    media: [],
    text: '',
  });
}

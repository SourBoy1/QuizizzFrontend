import defaultsDeep from 'lodash/defaultsDeep';
import has from 'lodash/has';
import map from 'lodash/map';

import { PointsForQuestionTypes } from '~/config/Constants/EditorConstants';
import QuestionQuery from './QuestionQuery';
import QuestionOption from './QuestionOption';
import QuestionAnswerExplanation from './QuestionAnswerExplanation';
import Theme from './Theme';
import Settings from './Settings';
import GrapherPlot from './GrapherPlot';

export default function Structure(values) {
  return defaultsDeep(
    {
      ...values,
      query: has(values, 'query') ? QuestionQuery(values.query) : QuestionQuery(),
      options: has(values, 'options') ? map(values.options, QuestionOption) : [],
      explain: has(values, 'explain') ? QuestionAnswerExplanation(values.explain) : QuestionAnswerExplanation(),
      theme: has(values, 'theme') ? Theme(values.theme) : Theme(),
      settings: Settings(values?.settings ?? {}),
      graphs: has(values, 'graphs') ? map(values.graphs, GrapherPlot) : [],
    },
    {
      kind: '',
      hasMath: false,
      theme: Theme(values?.theme),
      query: QuestionQuery(values?.query),
      options: [],
      explain: QuestionAnswerExplanation(values?.explain),
      answer: -1,
      marks: {
        correct: PointsForQuestionTypes[values?.kind] ?? 1,
        incorrect: 0,
      },
      media: {},
      elements: [],
    },
  );
}

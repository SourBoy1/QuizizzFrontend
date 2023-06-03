import defaultsDeep from 'lodash/defaultsDeep';
import has from 'lodash/has';
import map from 'lodash/map';
import get from 'lodash/get';

import { isQuizVersionGradeValid, getQuestionDefaultMarks } from '../utils/QuizUtils';

import Question from './Question';

export default function QuizVersion(values = {}) {
  const mapQuestion = (ques, index) => {
    if (has(ques, 'index')) {
      return Question(ques);
    }

    const correctQuestionMarks = getQuestionDefaultMarks(ques);
    const questionNeedsMarksUpdate = correctQuestionMarks !== get(ques, 'structure.marks.correct', null);

    return Question({
      ...ques,
      index,
      marksUpdated: questionNeedsMarksUpdate,
      structure: {
        ...ques.structure,
        marks: {
          correct: questionNeedsMarksUpdate ? correctQuestionMarks : ques.structure.marks.correct,
          incorrect: 0,
        },
      },
    });
  };
  const valuesToDefault = {
    ...values,
    questions: has(values, 'questions') ? map(values.questions, mapQuestion) : [],
    questionDrafts: has(values, 'questionDrafts') ? map(values.questionDrafts, mapQuestion) : [],
    teleportedQuestions: has(values, 'teleportedQuestions') ? map(values.teleportedQuestions, mapQuestion) : [],
  };

  if (isQuizVersionGradeValid(valuesToDefault)) {
    /**
     * Even though the grade like ['1', '6'] is valid grade on the server, we still need to
     * typecast it as a number since on the frontend here we expect it as so.
     */
    valuesToDefault.grade = map(valuesToDefault.grade, (g) => Number(g));
  }

  return defaultsDeep(valuesToDefault, {
    traits: {
      isQuizWithoutCorrectAnswer: false,
      totalSlides: 0,
    },
    pref: {
      time: null,
      marks: null,
    },
    image: '',
    lang: 'English',
    visibility: true,
    questions: [],
    questionDrafts: [],
    teleportedQuestions: [],
    subjects: [],
    topics: [],
    subtopics: [],
    grade: [],
    gradeLevel: null,
    deleted: false,
    standards: [],
    courses: [],
    _id: '',
    name: '',
    createdAt: '',
    updated: '',
    isProfane: '',
    whitelisted: '',
  });
}

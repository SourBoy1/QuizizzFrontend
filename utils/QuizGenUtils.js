import Constants from '~/config/Constants';

function numberOfItems(startIndex, lastIndex) {
  return lastIndex - startIndex + 1;
}

function getRandomIndex(startIndex, lastIndex) {
  const totalItems = numberOfItems(startIndex, lastIndex);
  const random = Math.random();
  return Math.floor(startIndex + random * (totalItems - 1));
}

/**
 *
 * @param {Array} list of elements which we need to shuffle
 * @param {number} startIndex startIndex and last index are indexes between which shuffle should take plave
 * if we need to shuffle whole list then start index will be 0 and last index will be list.length - 1
 * example: if we have [1, 2, 3, 4, 5], and if we pass startIndex 1 and lastIndex 3, then only 2, 3 and 4 will be shuffled among each other.
 * @param {number} lastIndex
 * @returns new shuffled array
 */
export function shuffle(list, startIndex = 0, lastIndex) {
  const shuffledList = [...list];
  let i = lastIndex || list.length - 1;
  for (i; i >= startIndex; --i) {
    const randomIndex = getRandomIndex(startIndex, i);
    const itemAtRandomIndex = shuffledList[randomIndex];
    shuffledList[randomIndex] = shuffledList[i];
    shuffledList[i] = itemAtRandomIndex;
  }
  return shuffledList;
}

export function generateAutomaticQuiz(quizGenPool, numberOfQuestions) {
  const { mcqPool, nonMcqPool, usedQuestionsMap } = quizGenPool;
  const mcqPoolCopy = [...mcqPool];
  const nonMcqPoolCopy = [...nonMcqPool];
  const numberOfNonMcqQuestion = numberOfQuestions / 5;
  const quiz = [];
  let mcqQuestionsInQuiz = 0;
  let nonMcqQuestionsInQuiz = 0;

  for (let questionIndex = 0; quiz.length < numberOfNonMcqQuestion && questionIndex < nonMcqPool.length; ++questionIndex) {
    const currentQuestion = nonMcqPool[questionIndex];
    const isQuestionUsed = usedQuestionsMap[currentQuestion?._id];
    if (currentQuestion && !isQuestionUsed) {
      nonMcqQuestionsInQuiz += 1;
      quiz.push(currentQuestion);
      usedQuestionsMap[currentQuestion._id] = true;
    }
    nonMcqPoolCopy.shift();
  }

  for (let questionIndex = 0; quiz.length < numberOfQuestions && questionIndex < mcqPool.length; ++questionIndex) {
    const currentQuestion = mcqPool[questionIndex];
    const isQuestionUsed = usedQuestionsMap[currentQuestion._id];
    if (currentQuestion && !isQuestionUsed) {
      mcqQuestionsInQuiz += 1;
      quiz.push(currentQuestion);
      usedQuestionsMap[currentQuestion._id] = true;
    }
    mcqPoolCopy.shift();
  }

  return {
    mcqPool: mcqPoolCopy,
    nonMcqPool: nonMcqPoolCopy,
    quiz,
    nonMcqQuestionsInQuiz,
    mcqQuestionsInQuiz,
  };
}

export function segregateQuestions(questionsList) {
  const mcq = [];
  const mcqWithMediaOrExp = [];
  const nonMcq = [];
  const nonMcqWithMediaOrExp = [];
  const slideTypes = [Constants.SlideTypes.CONTENT_SLIDE_V1, Constants.SlideTypes.CONTENT_SLIDE_V2];
  questionsList.forEach((question) => {
    const hasExplanationOrMedia = question.structure?.explain || question.structure?.query?.media?.length;
    if (question.type === Constants.QuestionTypes.MCQ) {
      const targetPool = hasExplanationOrMedia ? mcqWithMediaOrExp : mcq;
      targetPool.push(question);
    } else if (!slideTypes.includes(question.type)) {
      const targetPool = hasExplanationOrMedia ? nonMcqWithMediaOrExp : nonMcq;
      targetPool.push(question);
    }
  });
  return {
    mcq, mcqWithMediaOrExp, nonMcq, nonMcqWithMediaOrExp,
  };
}

export function createQuestionsPool(pool, isSuper) {
  const isCurrentUserSuper = isSuper;
  const questionsPool = pool.reduce((acc, quiz) => {
    const { isSuper: isQuizSuper, info: { questions } = {} } = quiz;
    if (isQuizSuper && !isCurrentUserSuper) {
      return acc;
    }
    const {
      mcq,
      mcqWithMediaOrExp,
      nonMcq,
      nonMcqWithMediaOrExp,
    } = segregateQuestions(questions);
    acc.mcq.push(...mcq);
    acc.mcqWithMediaOrExp.push(...mcqWithMediaOrExp);
    acc.nonMcq.push(...nonMcq);
    acc.nonMcqWithMediaOrExp.push(...nonMcqWithMediaOrExp);
    return acc;
  }, {
    mcq: [], mcqWithMediaOrExp: [], nonMcq: [], nonMcqWithMediaOrExp: [],
  });
  const {
    mcq, mcqWithMediaOrExp, nonMcq, nonMcqWithMediaOrExp,
  } = questionsPool;
  const mcqPool = [...shuffle(mcqWithMediaOrExp), ...shuffle(mcq)];
  const nonMcqPool = [...shuffle(nonMcqWithMediaOrExp), ...shuffle(nonMcq)];
  return { mcqPool, nonMcqPool };
}

export const getSuggestionsBasedOnSubjectAndGrade = (subject, grade) => {
  const _grade = String(grade);
  const staticData = {
    Mathematics: {
      0: ['Counting', 'Addition and Subtraction', '2D Shapes'],
      1: ['Fractions', 'Multiples', 'Math Facts'],
      2: ['Multiples', 'Math Facts', 'Number line'],
      3: ['Math Facts', 'Number line', 'Division and Multiplication'],
      4: ['Number line', 'Division and Multiplication', 'Fractions'],
      5: ['Division and Multiplication', 'Fractions', 'Counting'],
      6: ['Functions', 'Order of operations', 'Integers'],
      7: ['Order of operations', 'Integers', 'Pythagorean theorem'],
      8: ['Integers', 'Pythagorean theorem', 'Ratios'],
      9: ['Slope', 'Congruence', 'Systems of equations'],
      10: ['Congruence', 'Systems of equations', 'Exponent rules'],
      11: ['Systems of equations', 'Exponent rules', 'Factoring'],
      12: ['Exponent rules', 'Factoring', 'Congruence'],
    },
    Science: {
      0: ['Water cycle', 'Force and motion', 'States of matter'],
      1: ['Force and motion', 'States of matter', 'Weather'],
      2: ['States of matter', 'Weather', 'Water cycle'],
      3: ['Weather', 'Water cycle', 'States of matter'],
      4: ['Water cycle', 'Force and motion', 'States of matter'],
      5: ['Force and motion', 'States of matter', 'Atomic structure'],
      6: ['Atomic structure', 'Body systems', 'Photosynthesis'],
      7: ['Body systems', 'Photosynthesis', 'Force and motion'],
      8: ['Photosynthesis', 'Force and motion', 'Periodic table'],
      9: ['Periodic table', 'Scientific method', 'Genetics'],
      10: ['Scientific method', 'Genetics', 'Evolution'],
      11: ['Genetics', 'Evolution', 'Ecology'],
      12: ['Evolution', 'Ecology', 'Ecology'],
    },
    English: {
      0: ['Alphabet', 'Sounds', 'Capital letters'],
      1: ['Adjectives', 'Nouns', 'Homophones'],
      2: ['Nouns', 'Homophones', 'Verbs'],
      3: ['Homophones', 'Verbs', 'Prefixes'],
      4: ['Homophones', 'Verbs', 'Prefixes'],
      5: ['Homophones', 'Verbs', 'Prefixes'],
      6: ['Theme', 'Text structure', 'Subject verb agreement'],
      7: ['Text structure', 'Subject verb agreement', 'Parts of speech'],
      8: ['Subject verb agreement', 'Parts of speech', 'Author\'s purpose'],
      9: ['Figurative language', 'Parts of speech', 'Point of view'],
      10: ['Parts of speech', 'Point of view', 'Comprehension'],
      11: ['Point of view', 'Comprehension', 'Context clues'],
      12: ['Comprehension', 'Context clues', 'Parts of speech'],
    },
    'Social Studies': {
      1: ['History', 'Geography', 'Civics'],
      2: ['History', 'Geography', 'Civics'],
      3: ['History', 'Geography', 'Civics'],
      4: ['History', 'Geography', 'Civics'],
      5: ['History', 'Geography', 'Civics'],
      6: ['Bill of rights', 'Branches of government', 'Ancient history'],
      7: ['Branches of government', 'Ancient history', 'Silk road'],
      8: ['Ancient history', 'Silk road', 'Bill of rights'],
      9: ['World war 1', 'Great Depression', 'Economics'],
      10: ['Great Depression', 'Economics', 'Constitution'],
      11: ['Economics', 'Constitution', 'World history'],
      12: ['Constitution', 'World history', 'World war 1'],
    },
  };
  return staticData?.[subject]?.[_grade] || [];
};

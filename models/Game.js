import defaultsDeep from 'lodash/defaultsDeep';
import has from 'lodash/has';
import filter from 'lodash/filter';

import GroupsInfo from './GroupsInfo';
import Meta from './Meta';
import Question from './Question';
import QuizOptions from './QuizOptions';

export function PlayersWithResponses(players, responses) {
  players?.forEach((player) => {
    player.responses = filter(responses, (response) => response.playerId === player.id);
  });
  return players;
}

export default function Game(values) {
  const mapQuestion = (ques, index) => {
    if (has(ques, 'index')) {
      return Question(ques);
    }

    return Question({ ...ques, index });
  };
  return defaultsDeep(values, {
    groupsInfo: GroupsInfo(values?.groupsInfo),
    quizOptions: QuizOptions(values?.quizOptions),
    questions: has(values, 'questions') ? values.questions?.map(mapQuestion) : [],
    meta: Meta(values?.meta),
    players: PlayersWithResponses(values?.players, values?.responses) || [],
    testGameActivities: {},
    currentTestGameActivities: [],
    responses: [],
    gameLinks: [],
    code: '',
    dataLocation: '',
    _id: '',
    archived: false,
    assignments: null,
    createdAt: '',
    deleted: false,
    duration: '',
    expiry: null,
    gameState: null,
    gameType: null,
    groupIds: [],
    assignedTo: {},
    assignmentTitle: null,
    hostId: '',
    hostSessionId: '',
    canvas: {
      host: false,
      player: false,
    },
    name: null,
    quizId: '',
    quizName: '',
    reopenable: false,
    reopened: false,
    responseLink: '',
    responseVersion: '',
    startedAt: null,
    teams: null,
    totalCorrect: 0,
    totalMarks: 0,
    totalPossibleMarks: 0,
    totalPlayers: 0,
    totalQuestions: 0,
    hostSlideViews: 0,
    hostSlideViewsUnique: 0,
    versionId: '',
    replayOf: null,
    simGame: false,
    metadata: {},
    title: null,
    totalAnswerableQuestions: 0,
    traits: {
      isQuizWithoutCorrectAnswer: false,
      totalSlides: 0,
    },
    demo: null,
    updated: '',
    previousStats: null,
    organization: '',
    isShared: false,
    endedAt: null,
    subscription: {
      trialEndAt: null,
      playerLimit: 0,
      adsFree: true,
      branding: false,
    },
    groups: [],
    users: [],
  });
}

import defaultsDeep from 'lodash/defaultsDeep';

export default function GroupsInfo(values) {
  return defaultsDeep(values, {
    groupIds: null,
    jumble: false,
    jumbleAnswers: false,
    limitAttempts: 1,
    loginRequired: false,
    memes: false,
    showAnswers: false,
    showAnswers_2: '',
    studentLeaderboard: false,
    studentMusic: false,
    studentQuizReview: false,
    studentQuizReview_2: '',
    timer: true,
    timer_3: '',
    redemption: '',
    powerups: '',
    nicknameGenerator: false,
    adaptive: false,
    questionsPerAttempt: 0,
    advancedAntiCheating: false,
    memeset: '',
    skipQuestion: false,
  });
}

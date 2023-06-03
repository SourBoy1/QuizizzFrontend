import defaultsDeep from 'lodash/defaultsDeep';

export default function QuizStats(values) {
  return defaultsDeep(values, {
    played: 0,
    totalPlayers: 0,
    totalCorrect: 0,
    totalQuestions: 0,
  });
}

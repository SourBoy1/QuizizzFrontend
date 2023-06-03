import get from 'lodash/get';
import has from 'lodash/has';

import Game from '~/models/Game';
import Constants from '~/config/Constants';
import WebEvents from '~/config/WebEvents';
import MutationTypes from '~/config/MutationTypes';
import GameAPIService from '~/services/apis/GameAPIService';
import PaperModeGroupAPIService from '~/services/apis/PaperModeGroupAPIService';
import QLogger from '~/services/QLogger';
import i18n from '~/services/i18n';

import {
  mainSocketEventBus,
  connectSocketCall,
  disconnectSocketCall,
  emitChangeHost,
} from '~/services/sockets/SocketEventServices/main';
import { Configuration } from '~/services/sockets/SocketEventServices/main/config';
import { processUserActivationEvent } from '~/utils/AuthUtils';
import ToastService from '~/services/ToastService';
import EventLoggerInstance from '~/services/EventLoggerService';
import getRouter from '~/services/router';
import $axios from '~/services/AxiosService';
import UserService from '~/services/UserService';
import $store from '~/services/StoreService';

export const MODULE_NAME = 'OFFLINE_GAME';

function getOfflineSupportedQuestions(questions) {
  if (!questions || !Array.isArray(questions)) {
    return [];
  }
  const supportedQuestions = [];
  questions.forEach((question) => {
    if (question.type === Constants.QuestionTypes.MCQ && Array.isArray(question.structure.options) && question.structure.options.length <= 4) {
      supportedQuestions.push(question);
    }
  });
  return supportedQuestions;
}

function getCurrentQuestionIndex(questions, questionId) {
  const questionIndex = questions.findIndex((question) => question._id === questionId);
  return questionIndex !== -1 ? questionIndex : 0;
}

function getQuestionReportBarData(question, playersResponses) {
  const baseStructure = Array(question.structure.options.length).fill(0);

  playersResponses.forEach((playerResponse) => {
    if (has(playerResponse, 'data.response.response') && get(playerResponse, 'data.response.response') < question.structure.options.length) {
      baseStructure[playerResponse.data.response.response] += 1;
    }
  });

  return baseStructure;
}

function getPlayersObject(players) {
  const response = {};
  players.forEach((player) => {
    response[player.id] = player;
  });
  return response;
}

function getQuestionsSummary(questions, responses) {
  const baseStructure = {};

  questions.forEach((question) => {
    baseStructure[question._id] = Array(question.structure.options.length).fill(0);
  });

  responses.forEach((response) => {
    if (baseStructure[response.questionId].length > response.response) {
      baseStructure[response.questionId][response.response] += 1;
    }
  });

  return baseStructure;
}

function getPlayersResponseSummary(players, questions) {
  const sortedPlayers = [...players].sort((a, b) => (a.score < b.score ? 1 : -1));
  const questionsArray = Array(questions.length).fill(-1);
  const baseStructure = [];
  sortedPlayers.forEach(() => { baseStructure.push([...questionsArray]); });
  sortedPlayers.forEach((player, playerIndex) => {
    player.responses.forEach((response) => {
      const questionIndex = questions.findIndex((question) => question._id === response.questionId);
      if (questionIndex !== -1) {
        const isPoll = questions[questionIndex].type === Constants.QuestionTypes.MCQ && !get(questions[questionIndex], 'structure.settings.hasCorrectAnswer', true);
        if (response.state === 'attempted') {
          if (isPoll) {
            baseStructure[playerIndex][questionIndex] = 2;
          } else {
            baseStructure[playerIndex][questionIndex] = response.result === 'CORRECT' ? 1 : 0;
          }
        }
      }
    });
  });
  return baseStructure;
}

const initialState = () => ({
  ...Game(),
  isSocketConnected: false,
  isGameStarting: false,
  isGameStopping: false,
  isGameReplaying: false,
  isGetGameInitialCall: true,
  currentQuestion: null,
  skipUnsupportedQuestions: false,
  showReports: false,
  playersResponses: [],
  gameLeaderboard: [],
  inGameAccuracy: 0,
  totalCorrectResponses: 0,
  totalResponses: 0,
  allPlayers: {},
  deviceDetails: {},

  // in game player responses
  scannedPlayersRollNo: [],

  // roster
  roster: [],
  previousScannedSet: [],
  showScannedResponses: true,
  scanStarted: false,
});

const getters = {
  gameState: (state) => state.gameState,
  gameCode: (state) => state.code,
  hostId: (state) => state.hostId,
  roomHash: (state) => state._id,
  isWaiting: (state, getters) => getters.gameState === Constants.GameState.WAITING,
  isRunning: (state, getters) => getters.gameState === Constants.GameState.RUNNING,
  isStopped: (state, getters) => getters.gameState === Constants.GameState.STOPPED,
  isCompleted: (state, getters) => getters.gameState === Constants.GameState.COMPLETED,
  players: (state) => state.players,
  noOfPlayers: (state, getters) => getters.players.length,
  quizName: (state) => state.quizName,
  gameName: (state) => state.name,
  startedAt: (state) => state.startedAt,
  responses: (state) => state.responses,
  questions: (state) => state.questions,
  quizId: (state) => state.quizId,
  currentQuestion: (state) => state.currentQuestion,
  currentQuestionOptions: (state) => state.currentQuestion.structure.options,
  currentQuestionQuery: (state, getters) => (getters.currentQuestion ? getters.currentQuestion.structure.query : null),
  currentQustionAnswerIndex: (state, getters) => (!getters.currentQuestion.structure.settings.hasCorrectAnswer ? '_' : getters.currentQuestion.structure.answer),
  currentQuestionIndex: (state, getters) => getCurrentQuestionIndex(getters.questions, getters.currentQuestion?._id),
  totalQuestions: (state) => state.questions.length,
  skipUnsupportedQuestions: (state) => state.skipUnsupportedQuestions,
  totalGameScreens: (state, getters) => getters.totalQuestions * 2,
  showReports: (state, getters) => state.showReports,
  currentGameScreen: (state, getters) => (getters.showReports ? (getters.currentQuestionIndex * 2) + 1 : getters.currentQuestionIndex * 2),
  gameLeaderboard: (state, getters) => state.gameLeaderboard,
  playersResponses: (state, getters) => state.playersResponses,
  playerResponsesCount: (state, getters) => getters.playersResponses.length,
  questionReportBarData: (state, getters) => getQuestionReportBarData(getters.currentQuestion, getters.playersResponses),
  questionsSummary: (state, getters) => getQuestionsSummary(getters.questions, getters.responses),
  playersResponseSummary: (state, getters) => getPlayersResponseSummary(getters.players, getters.questions),
  createdAt: (state) => state.createdAt,
  deviceDetails: (state) => state.deviceDetails,

  // accuracy calculations
  totalCorrectResponses: (state, getters) => state.totalCorrectResponses,
  totalResponses: (state, getters) => state.totalResponses,
  inGameAccuracy: (state, getters) => {
    if (getters.totalResponses === 0) {
      return 0;
    }
    return Math.round(((getters.totalCorrectResponses / getters.totalResponses) * 100));
  },
  gameAccuracy: (state, getters) => {
    if (!state.totalPossibleMarks) {
      const totalQuestions = getOfflineSupportedQuestions(state.questions).length;
      return Math.round((state.totalCorrect / (totalQuestions * state.totalPlayers)) * 100);
    }
    return Math.round((state.totalMarks / (state.totalPossibleMarks * state.totalPlayers)) * 100) || 0;
  },

  // game related loaders
  // flag for loading when we make the startGame api call
  isGameStarting: (state) => state.isGameStarting,
  // flag for loading when we make the getReport (end game) api call
  isGameStopping: (state) => state.isGameStopping,
  // flag for loading when the teacher restarts the game on summary page
  isGameReplaying: (state) => state.isGameReplaying,
  // socket related getters
  isSocketConnected: (state) => state.isSocketConnected,
  isGetGameInitialCall: (state) => state.isGetGameInitialCall,

  // scanned players
  scannedPlayersRollNo: (state) => state.scannedPlayersRollNo,
  showScannedResponses: (state) => state.showScannedResponses,
  scanStarted: (state) => state.scanStarted,

  // roster
  roster: (state) => state.roster,
  previousScannedSet: (state) => state.previousScannedSet,
};

const mutations = {
  [MutationTypes.game.INITIALIZE_STATE](state, game) {
    Object.assign(state, game);
  },
  [MutationTypes.game.RESET_STATE](state) {
    Object.assign(state, initialState());
  },
  [MutationTypes.game.SET_GAME_STATE](state, gameState) {
    state.gameState = gameState;
  },
  [MutationTypes.game.UPDATE_PLAYERS_LIST](state, players) {
    state.players = players;
  },
  [MutationTypes.game.SET_GAME_STARTED_AT](state, startedAt) {
    state.startedAt = startedAt;
  },
  // game related mutations
  [MutationTypes.game.SET_GAME_LOADING](state, isGameStarting) {
    state.isGameStarting = isGameStarting;
  },
  [MutationTypes.game.SET_GAME_STOPPING](state, isGameStopping) {
    state.isGameStopping = isGameStopping;
  },
  [MutationTypes.game.SET_GAME_REPLAYING](state, isGameReplaying) {
    state.isGameReplaying = isGameReplaying;
  },

  // socket related mutations
  [MutationTypes.game.SET_SOCKET_CONNECTION](state, connected) {
    state.isSocketConnected = connected;
  },

  [MutationTypes.game.SET_GET_GAME_INITIAL_CALL](state, isGetGameInitialCall) {
    state.isGetGameInitialCall = isGetGameInitialCall;
  },

  [MutationTypes.game.SET_CURRENT_QUESTION](state, payload) {
    if (payload && payload?.questionId) {
      state.currentQuestion = state.questions.find((question) => question._id === payload.questionId);
      // state.currentQuestionIndex = payload.questionNum;
    }
  },
  [MutationTypes.game.SET_SKIP_UNSUPPORTED_QUESTIONS](state, support = false) {
    state.skipUnsupportedQuestions = support;
  },

  [MutationTypes.game.SET_SHOW_OFFLINE_REPORTS](state, showReports = false) {
    state.showReports = showReports;
  },

  [MutationTypes.game.SET_PLAYERS_RESPONSES](state, playersResponses) {
    state.playersResponses = playersResponses;
  },

  [MutationTypes.game.SET_GAME_LEADERBOARD](state, gameLeaderboard) {
    let formattedLeadboard = [];
    Object.entries(gameLeaderboard).forEach(([key, value]) => {
      formattedLeadboard.push({
        name: key,
        score: value,
        rank: '',
        playerImageId: get(state.allPlayers, key, { monster: 24 }).monster,
      });
    });
    formattedLeadboard = formattedLeadboard.sort((a, b) => (a.score < b.score ? 1 : -1));
    let initialRank = 0;
    let initialScore = Infinity;
    formattedLeadboard.forEach((player) => {
      if (player.score < initialScore) {
        initialRank += 1;
      }
      player.rank = initialRank;
      initialScore = player.score;
    });

    state.gameLeaderboard = formattedLeadboard;
  },

  [MutationTypes.game.SET_GAME_RESPONSES](state, payload) {
    if (payload) {
      state.totalCorrectResponses = payload.correct;
      state.totalResponses = payload.responses;
    } else {
      if (state.currentQuestion && state.currentQuestion.type === Constants.QuestionTypes.MCQ && !get(state.currentQuestion, 'structure.settings.hasCorrectAnswer', true)) {
        return;
      }
      state.playersResponses.forEach((response) => {
        if (response.data.response.isCorrect) {
          state.totalCorrectResponses += 1;
        }
        state.totalResponses += 1;
      });
    }
  },

  [MutationTypes.game.SET_NEW_PLAYERS](state, players) {
    state.allPlayers = { ...state.allPlayers, ...getPlayersObject(players) };
  },
  [MutationTypes.game.SET_DEVICE_DETAILS](state, deviceDetails) {
    state.deviceDetails = deviceDetails;
  },

  [MutationTypes.game.SET_SCANNED_PLAYERS](state, payload) {
    state.scannedPlayersRollNo = payload?.scannedPlayersRollNo || [];
  },

  [MutationTypes.game.SET_PAPER_MODE_ROSTER](state, payload) {
    state.roster = payload;
  },

  [MutationTypes.game.SET_PREVIOUS_SCANNED_SET](state, payload) {
    state.previousScannedSet = payload;
  },

  [MutationTypes.game.SET_SHOW_SCANNED_RESPONSES](state, payload) {
    state.showScannedResponses = payload;
  },

  [MutationTypes.game.SET_SCAN_STARTED](state, payload) {
    state.scanStarted = payload;
  },

  [MutationTypes.game.RESET_PAPER_MODE_STORE](state) {
    Object.assign(state, {
      ...Game(),
      isSocketConnected: false,
      isGameStarting: false,
      isGameStopping: false,
      isGameReplaying: false,
      isGetGameInitialCall: true,
      currentQuestion: null,
      skipUnsupportedQuestions: false,
      showReports: false,
      playersResponses: [],
      gameLeaderboard: [],
      inGameAccuracy: 0,
      totalCorrectResponses: 0,
      totalResponses: 0,
      allPlayers: {},
      deviceDetails: {},

      // in game player responses
      scannedPlayersRollNo: [],

      // roster
      roster: [],
      previousScannedSet: [],
      showScannedResponses: true,
      scanStarted: false,
    });
  },
};

const actions = {
  async getGame({ dispatch }, gameId) {
    try {
      const response = await GameAPIService.getGame(gameId);

      if (!response) {
        throw new Error(`No game found for the provided gameId: ${gameId}`);
      }

      if (!response?.success) {
        throw new Error('Something went wrong. Please try again!');
      }

      const rosterId = get(response.data, 'paperModeRosterId', null);
      if (rosterId) {
        const rosterReponse = await PaperModeGroupAPIService.getRoster(rosterId);
        if (rosterReponse) {
          dispatch('setRoster', rosterReponse.roster.names);
        }
      }

      const gameType = get(response.data, 'gameType', '');
      if (gameType === Constants.GameSettingTypes.TEACHER_PACED_OFFLINE) {
        const currentQuestionId = get(response.data, 'metadata.qId', null);
        const skipUnsupportedQuestions = get(response.data, 'quizOptions.skipUnsupportedQuestions', false);
        dispatch('setGameStoppingState', false);
        if (skipUnsupportedQuestions) {
          const supportedQuestions = getOfflineSupportedQuestions(response.data.questions);
          dispatch('setGameResponses', { correct: response.data.totalCorrect, responses: response.data.totalQuestions });
          dispatch('setSkipUnsupportedQuestions', true);
          dispatch('initializeState', Game({ ...response.data, questions: supportedQuestions }));
          dispatch('setNewPlayers', response.data.players);
          if (currentQuestionId) {
            dispatch('setCurrentQuestion', { questionId: currentQuestionId });
          } else {
            dispatch('setCurrentQuestion', { questionId: supportedQuestions[0]._id });
          }
        } else {
          dispatch('setSkipUnsupportedQuestions', false);
          dispatch('setGameResponses', { correct: response.data.totalCorrect, responses: response.data.totalQuestions });
          dispatch('initializeState', Game(response.data));
          if (currentQuestionId) {
            dispatch('setCurrentQuestion', { questionId: currentQuestionId });
          } else {
            dispatch('setCurrentQuestion', { questionId: response.data.questions[0]._id });
          }
        }
      } else {
        getRouter().push('/admin');
        throw new Error('Cannot Start the game');
      }
    } catch (err) {
      throw new Error(err);
    }
  },

  async startGame({ dispatch, getters }) {
    const { roomHash } = getters;
    try {
      const response = await GameAPIService.startGame(roomHash);

      // start game fails
      if (!response?.success) {
        ToastService.add({
          type: Constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: i18n('Something went wrong starting the game!'),
        });
        QLogger.error(`Something went wrong starting the game with roomHash: ${roomHash}`);
        EventLoggerInstance.logEvent(Constants.GameEvents.START_GAME_FAIL);
        return;
      }

      const { data } = response;
      // set the game's state based on gameStarted key - don't explicitly set it to running
      if (data.gameStarted) {
        dispatch('setGameState', Constants.GameState.RUNNING);
        dispatch('setGameStartedAt', data.startedAt);
      }
      EventLoggerInstance.logEvent(Constants.GameEvents.START_GAME_SUCCESS);
      return data;
    } catch (err) {
      EventLoggerInstance.logEvent(Constants.GameEvents.START_GAME_FAIL);
      throw new Error(err);
    } finally {
      dispatch('setGameLoadingState', false);
    }
  },

  async getReport({ dispatch, getters }) {
    const { roomHash } = getters;
    const { isSocketConnected } = getters;

    try {
      if (!isSocketConnected) {
        ToastService.add({
          type: Constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: i18n('Something went wrong! Try reloading!'),
        });
        throw new Error(i18n('Socket Disconnected'));
      }

      dispatch('setGameStoppingState', true);
      const { data } = await $axios().post(`/game/${roomHash}/getReport`);
      if (data?.success) {
        // game has ended successfully - fetch the game again to get the updated state
        // this call will update the game to Summary page - no need to manually set it here
        await dispatch('getGame', roomHash);
      }
    } catch (err) {
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong! Try reloading!'),
      });
      QLogger.error(err);
    } finally {
      dispatch('setGameStoppingState', false);
    }
  },

  exitGame({ dispatch }) {
    dispatch('setGameState', Constants.GameState.STOPPED);
  },

  setGameState({ commit }, gameState) {
    commit(MutationTypes.game.SET_GAME_STATE, gameState);
  },

  setGameLoadingState({ commit }, isGameStarting) {
    commit(MutationTypes.game.SET_GAME_LOADING, isGameStarting);
  },

  setGameStoppingState({ commit }, isGameStopping) {
    commit(MutationTypes.game.SET_GAME_STOPPING, isGameStopping);
  },

  setGameStartedAt({ commit }, startedAt) {
    commit(MutationTypes.game.SET_GAME_STARTED_AT, startedAt);
  },

  setGetGameInitialCall({ commit }, isGetGameInitialCall) {
    commit(MutationTypes.game.SET_GET_GAME_INITIAL_CALL, isGetGameInitialCall);
  },

  initializeState({ commit }, game) {
    commit(MutationTypes.game.INITIALIZE_STATE, game);
  },

  setCurrentQuestion({ commit }, payload) {
    commit(MutationTypes.game.SET_CURRENT_QUESTION, payload);
  },

  setSkipUnsupportedQuestions({ commit }, support) {
    commit(MutationTypes.game.SET_SKIP_UNSUPPORTED_QUESTIONS, support);
  },

  setSocketConnectionState({ commit }, isSocketConnected) {
    commit(MutationTypes.game.SET_SOCKET_CONNECTION, isSocketConnected);
  },

  setShowReports({ commit }, showReports) {
    commit(MutationTypes.game.SET_SHOW_OFFLINE_REPORTS, showReports);
  },

  setPlayersReponses({ commit }, playersResponses) {
    commit(MutationTypes.game.SET_PLAYERS_RESPONSES, playersResponses);
  },

  setGameLeaderboard({ commit }, gameLeaderboard) {
    commit(MutationTypes.game.SET_GAME_LEADERBOARD, gameLeaderboard);
  },

  setGameResponses({ commit }, payload) {
    commit(MutationTypes.game.SET_GAME_RESPONSES, payload);
  },

  setNewPlayers({ commit }, players) {
    commit(MutationTypes.game.SET_NEW_PLAYERS, players);
  },

  setDeviceDetails({ commit }, deviceDetails) {
    commit(MutationTypes.game.SET_DEVICE_DETAILS, deviceDetails);
  },

  setScannedPlayers({ commit }, payload) {
    commit(MutationTypes.game.SET_SCANNED_PLAYERS, payload);
  },

  setRoster({ commit }, payload) {
    commit(MutationTypes.game.SET_PAPER_MODE_ROSTER, payload);
  },

  setPreviousScannedSet({ commit }, payload) {
    commit(MutationTypes.game.SET_PREVIOUS_SCANNED_SET, payload);
  },

  setShowScannedResponses({ commit }, payload) {
    commit(MutationTypes.game.SET_SHOW_SCANNED_RESPONSES, payload);
  },

  setScanStarted({ commit }, payload) {
    commit(MutationTypes.game.SET_SCAN_STARTED, payload);
  },

  resetPaperModeStore({ commit }) {
    commit(MutationTypes.game.RESET_PAPER_MODE_STORE);
  },

  async disconnectSocket({ dispatch }) {
    try {
      await disconnectSocketCall();
      dispatch('setSocketConnectionState', false);
    } catch (err) {
      QLogger.error(err);
    }
  },

  async intializeSocketConnection({ dispatch, getters }) {
    const { hostId } = getters;
    const { roomHash } = getters;
    // register the events along with their action Dispatchers or mutations
    mainSocketEventBus
      .registerServerBroadcastedMessage(Configuration.ServerInitiatedMessages.CONNECT, (res) => {
        dispatch('setSocketConnectionState', true);
        // check to refetch game data on reconnection in case new events were missed
        // condition ensures that the game api is not called twice
        if (!getters.isGetGameInitialCall) { // important to use getters instead of storing it in a variable
          dispatch('setGameStoppingState', true);
          emitChangeHost({
            hostId,
            roomHash,
          }).then(() => {
            dispatch('getGame', roomHash).finally(() => {
              dispatch('setGameStoppingState', false);
            });
          })
            .catch((response) => {
              if (!response?.response?.success) {
                QLogger.error(i18n('Something went wrong while setting up this game!'), response);
                dispatch('setSocketConnectionState', false);
              }
            });
        }
      })
      .registerServerBroadcastedMessage(Configuration.ServerInitiatedMessages.DISCONNECT, (res) => {
        dispatch('setSocketConnectionState', false);
      })
      .registerServerBroadcastedMessage(Configuration.ServerInitiatedMessages.RECONNECT, (res) => {
        dispatch('setSocketConnectionState', true);
      })
      .registerServerBroadcastedMessage(Configuration.ServerInitiatedMessages.OFFLINE_RELAY, ({ response }) => {
        const { data } = response.response;
        switch (response.response.event) {
          case 'startGame': {
            dispatch('setCurrentQuestion', { questionId: data?.questionId });
            dispatch('setPreviousScannedSet', []);
            if (get(data, 'startedFromMobileApp', false)) {
              dispatch('setGameState', Constants.GameState.RUNNING);
            } else {
              dispatch('startGame');
            }
            const user = new UserService($store()?.state.root?.user);
            EventLoggerInstance.logEvent(WebEvents.GAME_STARTED, {
              userId: user?.id || '',
              gameId: roomHash,
              quizId: getters?.quizId,
            }, 'immediate');
            processUserActivationEvent(user);
            break;
          }
          case 'nextQuestion':
            if (getters.scannedPlayersRollNo.length > 0) {
              const previousScanned = [...getters.scannedPlayersRollNo].sort();
              dispatch('setPreviousScannedSet', previousScanned);
            }
            dispatch('setShowReports', false);
            dispatch('setCurrentQuestion', { questionId: data?.questionId });
            dispatch('setScanStarted', false);
            dispatch('setScannedPlayers', { scannedPlayersRollNo: [] });
            break;
          case 'endGame':
            if (get(data, 'endedFromMobileApp', false)) {
              dispatch('setGameStoppingState', true);
              dispatch('getGame', roomHash);
            } else {
              dispatch('getReport');
            }
            break;
          case 'showReport':
            if (getters.scannedPlayersRollNo.length > 0) {
              const previousScanned = [...getters.scannedPlayersRollNo].sort();
              dispatch('setPreviousScannedSet', previousScanned);
            }
            dispatch('setNewPlayers', data?.playerJoins.map((players) => players.data) ?? []);
            dispatch('setGameLeaderboard', data.leaderboard);
            dispatch('setPlayersReponses', data.playerAnswers);
            dispatch('setGameResponses');
            dispatch('setShowReports', true);
            dispatch('setScanStarted', false);
            dispatch('setScannedPlayers', { scannedPlayersRollNo: [] });
            break;
          case 'playersStatus':
            dispatch('setScannedPlayers', { scannedPlayersRollNo: data?.playerRollNo || [] });
            break;
          case 'scanStarted':
            dispatch('setScanStarted', true);
            break;
          case 'deviceConnected':
            dispatch('setDeviceDetails', data);
            break;
          default:
            break;
        }
      });
    try {
      await connectSocketCall();
      // first changeHost - wouldn't be fired on subsequent reconnection
      // notice we didn't call the getGame end point here
      // this is to ensure we don't reload the game twice and could call getGame explicitly
      emitChangeHost({
        hostId,
        roomHash,
      })
        .catch((response) => {
          if (!response?.response?.success) {
            QLogger.error(i18n('Something went wrong while setting up this game!'), response);
            dispatch('setSocketConnectionState', false);
          }
        });
      dispatch('setSocketConnectionState', true);
    } catch (err) {
      QLogger.error(err);
      throw err;
    }
  },
};

export default {
  namespaced: true,
  state: initialState(),
  getters,
  mutations,
  actions,
};

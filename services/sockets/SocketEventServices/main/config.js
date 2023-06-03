import Constants from '~/config/Constants.js';

const SUB_DOMAIN = import.meta.env.VITE_NODE_ENV === Constants.NodeEnvs.PROD ? 'socket' : 'dev-socket';

export const Configuration = {
  endPoint: `https://${SUB_DOMAIN}.quizizz.com/`,
  options: {
    path: '/_gsocket/sockUpg',
  },
  ClientInitiatedMessages: {
    CHANGE_HOST: 'changeHost',
    DELETE_PLAYER: 'deletePlayer',
    GET_REPORT: 'getReport',
  },
  ServerInitiatedMessages: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    RECONNECT: 'reconnect',
    PLAYER_JOINED: 'playerJoined',
    PLAYER_RESPONSE: 'playerResponse',
    PLAYER_GAME_OVER: 'playerGameOver',
    TEST_GAME_ACTIVITY: 'testGameActivity',
    OFFLINE_RELAY: 'offlineRelay',
  },
};

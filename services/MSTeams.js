// import { initialize, authentication, executeDeepLink, settings } from '@microsoft/teams-js';

// import QLogger from '~/services/QLogger';
// import LocalStorage from '~/services/LocalStorage';
// import $store from '~/services/StoreService';

// import AuthService from '~/services/apis/AuthService';

// import Constants from '~/config/Constants';
// import UrlUtils from '~/utils/UrlUtils';

const teamsInitialized = false;

// // Private methods
// function isUserLoggedIn () {
//   const user = $store().getters.user;

//   return user.id;
// }

// function getTeamsAppId () {
//   const isProdEnv = import.meta.env.VITE_NODE_ENV === Constants.NodeEnvs.PROD;
//   return isProdEnv ? 'a22fbd93-4ad1-4842-b88d-bef47690f909' : '766e7536-be7a-40f2-afd0-2c716c3ce6bd';
// }

// Public methods

function isTeamApp() {
  return teamsInitialized;
}

function init() {
  // const session = getSession();
  // if (session) {
  //   QLogger.log('MsTeams.init: Initializing Teams sdk...\nEnv: ', import.meta.env.VITE_NODE_ENV);
  //   initialize(() => {
  //     QLogger.log('MsTeams.init: Initialization done.');

  //     teamsInitialized = true;
  //     notifyAuthSuccess();
  //   });
  // }
}

function getSession() {
  // let session = null;
  // try {
  //   session = window?.sessionStorage?.getItem('msftContext');

  //   if (session) {
  //     session = JSON.parse(session);
  //   }
  // } catch (exception) {
  //   QLogger.log('Error while accessing session, ', exception);
  // }

  // return session;
}

function createSession() {
  // try {
  //   const session = { init: true };
  //   window?.sessionStorage?.setItem('msftContext', JSON.stringify(session));
  //   initialize(() => {
  //     QLogger.log('MsTeams.init: Initialization done.');

  //     teamsInitialized = true;
  //   });
  // } catch (exception) {
  //   QLogger.log('Error while creating session, ', exception);
  // }
}

function openStageView(url) {
  // if (!url) { return }

  // let fullUrl = url;
  // if (UrlUtils.isRelativeUrl(url)) {
  //   const a = document.createElement('a');
  //   a.href = url;
  //   fullUrl = a.href; // Returns fully qualified url
  // }

  // QLogger.log('MsTeams.openStageView: Opening app url in teams stage view ', url);
  // const contextPayload = {
  //   contentUrl: fullUrl,
  //   websiteUrl: fullUrl,
  // };

  // const deepLink = `https://teams.microsoft.com/l/stage/${getTeamsAppId()}/0?context=${encodeURIComponent(JSON.stringify(contextPayload))}`;
  // executeDeepLink(deepLink);
}

function initiateAuthFlow(url) {
  // const parsedUrl = UrlUtils.parse(url);

  // const query = parsedUrl.query;
  // const path = parsedUrl.path;
  // const redirect = UrlUtils.toString({
  //   query: {
  //     ...query,
  //     // msftTeamsAuthNotify: true,
  //   },
  //   urlData: { path },
  // });
  // try {
  //   LocalStorage.setItem('shouldNotifyMsft', true);
  // } catch (err) {
  //   QLogger.error('MsTeams.initiateAuthFlow: Error!\n', err);
  // }
  // return new Promise((resolve, reject) => {
  //   authentication.authenticate({
  //     url: redirect,
  //     successCallback: () => {
  //       resolve({ success: true });
  //     },
  //     failureCallback: (reason) => {
  //       reject({ success: false, error: reason });
  //     },
  //     width: 800,
  //     height: 600,
  //   });
  // });
}

async function initiateSSOAuth() {
  // return await new Promise((resolve, reject) => {
  // authentication.getAuthToken({
  //   async successCallback (result) {
  //     const { success, error, message } = await AuthService.authMSUserWithSSOToken(result);

  //     if (success) {
  //       resolve({ success });
  //     } else {
  //       reject({ error, message });
  //     }
  //   },
  //   failureCallback (error) {
  //     // console.info(`MsTeams.initiateSSOAuth: Failed to get auth token.\n ${error}`);
  //     reject({ error });
  //   },
  // });
  // }).catch((error) => error);
}

function updateSettings(config, onSaveDone = () => {}) {
  // settings.registerOnSaveHandler((saveEvent) => {
  //   settings.setSettings(config);
  //   saveEvent.notifySuccess();
  //   onSaveDone();
  // });
}

function activateSaveSettings() {
  // settings.setValidityState(true);
}

// function notifyAuthSuccess () {
//   try {
//     // If auth started from teams app install config page
//     const authFromSettingsPage = LocalStorage.getItem('msftConfigAuthStartedFrom');
//     if (authFromSettingsPage) {
//       const isAuthComplete = isUserLoggedIn();

//       if (isAuthComplete) {
//         QLogger.log('MsTeams.notifyAuthSuccess: Auth started from config page. Redirecting back...');
//         LocalStorage.removeItem('msftConfigAuthStartedFrom');
//         window.location.href = authFromSettingsPage;
//         return;
//       }
//     }

//     const shouldNotifyMsft = LocalStorage.getItem('shouldNotifyMsft');
//     if (shouldNotifyMsft) {
//       QLogger.log('MsTeams.notifyAuthSuccess: notifying auth success!');
//       LocalStorage.removeItem('shouldNotifyMsft');
//       authentication.notifySuccess();
//     }

//     if (document.location.href.includes('msftTeamsAuthNotify')) {
//       QLogger.log('MsTeams.notifyAuthSuccess: notifying auth success!');
//       authentication.notifySuccess();
//     }
//   } catch (err) {
//     QLogger.error('MsTeams.notifyAuthSuccess: Error!\n', err);
//   }
// }

export default {
  isTeamApp, init, openStageView, getSession, createSession, initiateAuthFlow, activateSaveSettings, updateSettings, initiateSSOAuth,
};

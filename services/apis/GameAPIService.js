import dayjs from 'dayjs';
import lodashFilter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

import $axios from '~/services/AxiosService';
import QLogger from '~/services/QLogger';

import i18n from '~/services/i18n';
import Constants from '~/config/Constants';
import ToastService from '~/services/ToastService';
import CookieService from '~/services/CookieService';
import UserService from '~/services/UserService';
import $store from '~/services/StoreService';

export default class GameAPIService {
  static async reopenGame(gameId, expiry) {
    try {
      const data = {
        expiry,
      };
      const response = await $axios().post(`/game/${gameId}/reopen`, data);
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at GameAPIService.reopenGame', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while reopening the game!'),
      });
    }
  }

  static async deleteGame(gameId, gameState) {
    try {
      const gameData = [{
        id: gameId,
        state: gameState,
      }];
      const response = await $axios().delete('/games', { data: { games: gameData } });
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at GameAPIService.deleteGame', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while deleting the game!'),
      });
    }
  }

  static async search({
    pageNumber, startDate, endDate, queryTerm, classIds, filter, size = 10, quizNames = [], gameState = null, mock = false,
  }) {
    try {
      const filterList = {
        gameState: gameState || ['completed', 'running', 'waiting', 'stopped', 'scheduled'],
        quizId: quizNames,
      };

      const user = new UserService($store()?.state.root?.user);

      if (filter === 'mine') {
        filterList.createdBy = user.id;
      } else if (filter === 'shared') {
        filterList.sharedWith = [user.id];
      }

      const response = await $axios().get('/games', {
        params: {
          query: queryTerm,
          from: pageNumber * 10,
          size,
          filterList,
          groupIds: JSON.stringify(classIds),
          rangeFilter: {
            createdAt: {
              from: startDate,
              to: endDate,
            },
          },
          mock,
        },
      });
      const result = response.data;

      if (result.success) {
        result.data.games = lodashFilter(result.data.games, (item) => !!item._id);

        result.data.games.forEach((game) => {
          if ((game.gameType === 'async' || game.gameType === 'pres_async') && game.gameState === 'running') {
            // Checking if (createdAt + expiry) is before current time
            // This is needed to show the correct value
            if (dayjs(game.createdAt).add(game.expiry, 'seconds').isBefore(new Date())) {
              game.gameState = 'completed';
            }
          }
        });

        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at GameAPIService.search', err);
    }
  }

  static async getGame(gameId, queryParams = {}) {
    try {
      if (!gameId || gameId === 'undefined' || gameId === 'null') {
        QLogger.error(i18n('gameId is invalid'));
        throw new Error(i18n('gameId is invalid'));
      }
      const { data } = await $axios().get(`/game/${gameId}`, { params: queryParams });
      return data;
    } catch (err) {
      QLogger.error(err);
    }
  }

  static async startGame(roomHash, expiry) {
    try {
      if (!roomHash) {
        QLogger.error('roomHash is invalid');
      }
      const payload = {
        roomHash,
      };
      if (expiry) {
        payload.expiry = expiry;
      }
      const { data } = await $axios().post('/game/start', payload);
      return data;
    } catch (err) {
      QLogger.error(err);
    }
  }

  static async assignGCLByGroups(gameId, assignedClasses) {
    try {
      if (!gameId) {
        QLogger.error('gameId is invalid');
      }
      const assignedTo = isEmpty(assignedClasses.assignedTo) ? null : assignedClasses.assignedTo;
      const groupIds = map(assignedClasses.classes, (item) => item._id);
      const translatedDescription = i18n('Click on the link below to start the game');
      const data = {
        title: assignedClasses.title,
        description: assignedClasses.desc || translatedDescription,
        startDate: assignedClasses.dateToStart,
        groupIds,
        assignedTo,
        grading: assignedClasses.grading,
      };
      return await $axios().post(`/game/${gameId}/assign-gcl-bygroups`, data);
    } catch (err) {
      QLogger.error(err);
    }
  }

  static async emailReportToParent(gameId, recipients) {
    const CSRFToken = CookieService.get('x-csrf-token');
    const headers = {
      'x-csrf-token': CSRFToken,
    };
    const payload = {
      gameId,
      recipients,
    };
    try {
      const response = await $axios().post('/emails/send', payload, { headers });
      if (!response?.data?.success) {
        throw new Error(i18n('Something went wrong processing this request!'));
      }
      ToastService.add({
        type: Constants.ToastTypes.SUCCESS,
        icon: 'fas fa-times-circle',
        title: i18n('Email sent successfully!'),
      });
    } catch (err) {
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Email cannot be sent. Please try again!'),
      });
      QLogger.error(err);
      throw err;
    }
  }

  static async downloadGame(gameId) {
    const regex = /GMT\+([0-9]+)/;

    const d = new Date();
    const result = regex.exec(d) || [];
    const timezone = `GMT+${result[1] || '000'}`;

    const CSRFToken = CookieService.get('x-csrf-token');
    const headers = {
      'x-csrf-token': CSRFToken,
    };
    const params = {
      offset: timezone,
      _: Math.floor(Math.random() * 90000) + 10000,
    };

    try {
      const response = await $axios().get(`/savexls/${gameId}`, { headers, params });
      return response;
    } catch (err) {
      QLogger.error(err);
      throw err;
    }
  }

  static async submitGameFeedback(params, isDismissed) {
    try {
      const headers = {
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
      };
      const payload = {
        quizizz_uid: CookieService.get('quizizz_uid'),
        slot: CookieService.get('QUIZIZZ_EXP_SLOT') || '0',
        experiment: CookieService.get('QUIZIZZ_EXP_NAME') || 'main',
        isDismissed,
        eventName: 'ft_error_review',
        platform: 'web',
        country: $store()?.getters?.['root/serverData']?.requestCountry || 'IN',
        timezoneOffset: (new Date()).getTimezoneOffset(),
        params,
      };
      return await $axios().post('https://analytics.quizizz.com/feedback2', payload, headers);
    } catch (error) {
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Feedback cannot be submitted. Please try again!'),
      });
      QLogger.error(error);
      throw (error);
    }
  }

  static async updateFocusModeTimer(gameId, totalTimeLeft, delta) {
    try {
      if (!gameId) {
        QLogger.error('roomHash is invalid');
      }
      const CSRFToken = CookieService.get('x-csrf-token');
      const headers = {
        'x-csrf-token': CSRFToken,
      };
      const response = await $axios().put(`/game/${gameId}/updateFocusModeTimer`, {
        totalTimeLeft,
        delta,
      }, { headers });
      if (!response?.data?.success) {
        throw new Error('Something went wrong while updating time. Please try again');
      }
    } catch (err) {
      QLogger.error(err);
      throw err;
    }
  }

  static async replayGame(gameId) {
    try {
      if (!gameId) {
        QLogger.error('roomHash is invalid!');
      }
      const CSRFToken = CookieService.get('x-csrf-token');
      const headers = {
        'x-csrf-token': CSRFToken,
      };
      const response = await $axios().post(`/game/${gameId}/replay`, {}, headers);
      return response;
    } catch (err) {
      QLogger.error(err);
      throw err;
    }
  }

  static async sendMessageToGCL(gameId) {
    try {
      const response = await $axios().post(`/game/${gameId}/assign-gcl-groups`);
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at GameAPIService.sendMessageToGCL', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while sending message to Google classroom'),
      });
    }
  }

  static async getReport(gameId) {
    try {
      const response = await $axios().post(`/game/${gameId}/getReport`);
      const result = response.data;
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at GameAPIService.getReport', err);
      ToastService.add({
        type: Constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: i18n('Something went wrong while ending the game'),
      });
    }
  }
}

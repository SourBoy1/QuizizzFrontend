/* eslint-disable */
import Constants from '~/config/Constants';
import QLogger from './QLogger';
import $store from './StoreService';
import cloneDeep from 'lodash/cloneDeep';

export default class BrazeService {

  static _brazeInstance = null
  static _state = 0
  static _backlogEvent = []
  static #availableContentCards = [];
  static _brazeConfig = null

  static loadBrazeService (user , nonce, store) {
    // load service only for selected occupations
    if (!([
      Constants.UserOccupation.TEACHER,
      Constants.UserOccupation.TEACHER_SCHOOL,
      Constants.UserOccupation.TEACHER_UNIVERSITY,
      Constants.UserOccupation.CORPORATE_TEACHER,
      Constants.UserOccupation.SCHOOL_ADMIN,
      Constants.UserOccupation.DISTRICT_ADMIN,
      Constants.UserOccupation.DEPARTMENT_HEAD,
      Constants.UserOccupation.INSTRUCTIONAL_TECH_COACH,
    ].includes(user?.occupation || ''))) {
      return;
    }

    if (BrazeService._state !== 0) {
      QLogger.error(`BrazeService is being initialized already`);
      return
    }

    BrazeService._state = 1;
    import(/* webpackPrefetch: true */'@braze/web-sdk').then(function (value) {
      BrazeService._brazeInstance = value

      BrazeService._brazeConfig = {
        baseUrl: Constants.BrazeConfig.BASE_URL,
        sessionTimeoutInSeconds: Constants.BrazeConfig.SESSION_TIMEOUT_IN_SECONDS,
        allowUserSuppliedJavascript: true,
        contentSecurityNonce: nonce,
        minimumIntervalBetweenTriggerActionsInSeconds: 5,
        devicePropertyAllowlist: [
          BrazeService._brazeInstance.DeviceProperties.BROWSER,
          BrazeService._brazeInstance.DeviceProperties.BROWSER_VERSION,
          BrazeService._brazeInstance.DeviceProperties.OS,
          BrazeService._brazeInstance.DeviceProperties.RESOLUTION,
          BrazeService._brazeInstance.DeviceProperties.TIME_ZONE,
          BrazeService._brazeInstance.DeviceProperties.USER_AGENT,
        ],
      };

      if (window.location.hostname === 'quizizz.com') {
        BrazeService._brazeInstance.initialize(Constants.BrazeConfig.PROD_KEY, Object.assign({}, BrazeService._brazeConfig, {
          enableLogging: false,
        }));
      } else {
        BrazeService._brazeInstance.initialize(Constants.BrazeConfig.DEV_KEY, Object.assign({}, BrazeService._brazeConfig, {
          enableLogging: true,
        }));
      }

      if (user?.id){
        BrazeService._brazeInstance.changeUser(user.id);
        BrazeService.subscribeToContentCards(store);
        BrazeService._brazeInstance.automaticallyShowInAppMessages();
        BrazeService._brazeInstance.openSession();
        BrazeService.refreshContentCards();
      }

      BrazeService._state = 2;
      BrazeService._backlogEvent.forEach(val => val());
      BrazeService._backlogEvent = []
    });
  }

  static addBrazeEvent (user, eventName, eventData) {

    // allow adding braze events for specific occupations
    if (!([
      Constants.UserOccupation.TEACHER,
      Constants.UserOccupation.TEACHER_SCHOOL,
      Constants.UserOccupation.TEACHER_UNIVERSITY,
      Constants.UserOccupation.CORPORATE_TEACHER,
      Constants.UserOccupation.SCHOOL_ADMIN,
      Constants.UserOccupation.DISTRICT_ADMIN,
      Constants.UserOccupation.DEPARTMENT_HEAD,
      Constants.UserOccupation.INSTRUCTIONAL_TECH_COACH,
    ].includes(user?.occupation || ''))) {
      return;
    }

    if (BrazeService._state === 0) {
      QLogger.error(`Error at ${eventName} (Braze) event trigger as BrazeService is not initialized`);
      return
    } else if (BrazeService._state === 1) {
      BrazeService._backlogEvent.push(() => {
        const capturedEventName = eventName;
        const capturedEventData = eventData;
        BrazeService._logCustomEvent(capturedEventName, capturedEventData);
      })
      return
    }

    BrazeService._logCustomEvent(eventName, eventData)
  }

  static _logCustomEvent(eventName, eventData) {
    try {
      BrazeService._brazeInstance.logCustomEvent(eventName, eventData);
    } catch (err) {
      QLogger.error(`Error at ${eventName} (Braze) event trigger`, err);
    }
  }

  static subscribeToContentCards(store) {
    BrazeService._brazeInstance.subscribeToContentCardsUpdates(updates => {
      BrazeService.#availableContentCards = updates.cards;
      const currLifecycleData = $store(store).getters['lifecycleData'];
      $store(store).dispatch('root/setLifecycleData', {
        ...currLifecycleData,
        contentCards: updates.cards
      });
    });
  }

  static getContentCards() {
    return BrazeService.#availableContentCards;
  }

  static refreshContentCards() {
    BrazeService._brazeInstance?.requestContentCardsRefresh();
  }

  static logContentCardImpressions(cards) {
    const clonedCards = cloneDeep(cards);
    try {
      BrazeService._brazeInstance?.logCardImpressions(clonedCards, true);
    } catch (err) {
      QLogger.error(`Error at (Braze) content card impressions:`, err);
    }
  }

  static logContentCardClick(card) {
    const clonedCard = cloneDeep(card);
    BrazeService._brazeInstance?.logCardClick(clonedCard, true);
  }

  static logContentCardDismiss(card) {
    const clonedCard = cloneDeep(card);
    BrazeService._brazeInstance?.logCardDismissal(clonedCard);
  }
}

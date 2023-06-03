/* eslint class-methods-use-this: off */
import isEmpty from 'lodash/isEmpty';
import clone from 'lodash/clone';
import forEach from 'lodash/forEach';
import findIndex from 'lodash/findIndex';
import defaults from 'lodash/defaults';
import isString from 'lodash/isString';
import pickBy from 'lodash/pickBy';
import includes from 'lodash/includes';
import concat from 'lodash/concat';
import { nextTick } from 'vue';

import store from '~/store/index';

import {
  getInHouseEventTrackingURL,
  getSessionTrackingEventURL,
} from '~/utils/EventLoggerUtils.js';
import Constants from '~/config/Constants.js';
import { getEnvironmentEnv } from '~/utils/EnvUtils';
import WebEvents from '~/config/WebEvents.js';
import PageTitles, {
  getPageTitleForInhouseEvents,
  getSourcePageTitle,
} from '~/config/PageTitles.js';
import featureFlags from '~/services/FeatureFlagsService.js';
import { state } from '@/store/analyticsManager.js';
import CookieService from './CookieService.js';
import LocalStorage from './LocalStorage.js';
import QLogger from './QLogger';
import MiscAPIService from './apis/MiscAPIService.js';

export const DEFAULT_EVENT_PRIORITY = 'immediate';

const logEventDefaultOptions = {
  apiEndpoint: getInHouseEventTrackingURL(),
  sendAsBatched: true,
  attachAdditionalParams: true,
  eventOptions: {},
};

class EventLoggerService {
  constructor() {
    this.expName = '';
    this.expSlot = '';
    this.platform = '';
    this.sessionId = '';

    this.getEventsInBuffer = () => {};
    this.putEventsInBuffer = () => {};
  }

  init(eventModelDetails, getEventsInBuffer, putEventsInBuffer) {
    this.expName = eventModelDetails.expName;
    this.expSlot = eventModelDetails.expSlot;
    this.platform = eventModelDetails.platform;

    this.getEventsInBuffer = getEventsInBuffer;
    this.putEventsInBuffer = putEventsInBuffer;

    this.setSessionId();
  }

  getState() {
    return { ...store.state.root, analyticsManager: store.state.analyticsManager };
  }

  setSessionId(reset = false) {
    let sessionId = CookieService.get('quizizz_uid');

    if (!sessionId) {
      const QuizizzAnalyticsData = LocalStorage.getItem('QuizizzAnalytics');
      sessionId = QuizizzAnalyticsData?.sessionId;
    }

    if (!sessionId || reset) { // Cookies are disabled
      sessionId = `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}-${Date.now()}`;
    }

    LocalStorage.setItem('QuizizzAnalytics', {
      sessionId,
      eventCount: 0,
      expiry: Date.now() + (1000 * 60 * 30), // Used in case sessionId from cookies is unavailable
    });

    this.sessionId = sessionId;
  }

  checkSessionId() {
    const metaData = LocalStorage.getItem('QuizizzAnalytics');
    const currentSessionId = this.sessionId;

    /**
     * If sessionId is available from cookies, compare if the session has changed
     * in this request and expire the analytics session data. If sessionId from Cookies
     * is not avaiable use expiry to manually expire the session data.
     * */

    if ((!isEmpty(currentSessionId) && metaData?.sessionId !== currentSessionId) || metaData?.expiry <= Date.now()) {
      this.setSessionId(true);
    }
  }

  /**
   * logs the event to the server based on different levels of priority
   * 'immediate' - logs the event immediately along with any othe events in the tempEvents buffer
   * 'nextBatch' - will log the event with the next batch, as soon as the next batch goes
   * 'batch' - just puts the event in main bucket
   * @param {String} eventName
   * @param {Object} params
   * @param {Object} state
   * @param {['immediate'|'nextBatch'|'batch']} [priority='immediate']
   * @param {Object} [options]
   * @param {String} [options.apiEndpoint=getInHouseEventTrackingURL()] - The api endpoint that needs to be used for the particular event
   * @param {Boolean} [options.sendAsBatched=true] - Send the events batched in array
   * @param {Boolean} [options.attachAdditionalParams=true] - To control if any additional params will be attached
   * @param {Object} [options.eventOptions={}] - Additional options for the network request
   */
  logEvent(eventName, params, priority = DEFAULT_EVENT_PRIORITY, optionsData = {}) {
    this.checkSessionId();

    const options = defaults(optionsData, logEventDefaultOptions);
    const state = this.getState();
    const eventData = this.returnEventData(eventName, params, state, options);

    if (isEmpty(eventName)) {
      QLogger.error(`Error at logEvent: given eventName(${eventName}) is not valid`, priority, params);

      return;
    }

    QLogger.log('\n EventLoggerService logEvent:', eventName, priority, clone(eventData), '\n\n');

    if (import.meta.env.VITE_NODE_ENV === Constants.NodeEnvs.DEV) {
      return;
    }

    const data = [eventData];

    nextTick(() => {
      store.dispatch('analyticsManager/setAnalyticsData', eventData);
    });

    switch (priority) {
      case 'immediate':
        this.putEventsInBuffer('temp', data);
        this.pushEventsToServer(data);
        break;

      case 'nextBatch':
        this.putEventsInBuffer('temp', [eventData]);
        break;

      case 'batch':
      default:
        this.addToBuffer(eventData);
        break;
    }
  }

  async logImmediateEvent(eventName, params, optionsData = {}) {
    try {
      this.checkSessionId();

      const options = defaults(optionsData, logEventDefaultOptions);
      const state = this.getState();
      const eventData = this.returnEventData(eventName, params, state, options);

      if (isEmpty(eventName)) {
        QLogger.error(`Error at logImmediateEvent: given eventName(${eventName}) is not valid`, params);

        return;
      }

      QLogger.log('\n EventLoggerService logImmediateEvent:', eventName, clone(eventData), '\n\n');
      await this._post(eventData, eventData.forApiEndpoint);
      return {
        success: true,
      };
    } catch (error) {
      QLogger.error('Error at EventLoggerService.logImmediateEvent', error);
      return { success: false, msg: error.msg };
    }
  }

  async logSessionTackingEvent(eventName, params) {
    const state = this.getState();
    const event = this.returnEventData(
      eventName,
      params,
      state,
      { attachAdditionalParams: true, apiEndpoint: getSessionTrackingEventURL() },
    );
    if (event.params.userId) {
      QLogger.log('\n EventLoggerService logSessionTackingEvent:', eventName, clone(event), '\n\n');
      await this._post(event, event.forApiEndpoint);
    }
  }

  /**
   * just adds events to the buffer and if events are more than 10  in the buffer sends the first 10 events to server
   * @param {(Object|Object[])} eventData
   * @memberof EventLoggerService
   */
  addToBuffer(eventData) {
    this.selectAndPushEventsToServer(eventData, 10);
  }

  sendPreviousSessionEvents() {
    const tempEvents = this.getEventsInBuffer('temp');

    if (!isEmpty(tempEvents)) {
      this.pushEventsToServer(tempEvents);
    }
  }

  sendAllEventsInBuffer() {
    QLogger.log('\nEventLoggerService Sending All Events in Buffer\n');

    if (import.meta.env.VITE_NODE_ENV === Constants.NodeEnvs.DEV) {
      return;
    }

    this.selectAndPushEventsToServer(null, -1);
  }

  // Private Functions
  returnEventData(eventName, eventParams, state, options = {}) {
    let additionalParams = {};
    let enrichmentParams = {};

    if (options.attachAdditionalParams) {
      additionalParams = this.getAdditionalParams(state, options);
      enrichmentParams = this.getEnrichmentParams(state);
    }

    const cookedParamsToSend = {};
    const rawParamsToSend = {
      ...additionalParams,
      ...enrichmentParams,
      ...eventParams,
    };

    forEach(rawParamsToSend, (value, key) => {
      cookedParamsToSend[key] = isString(value) ? value : JSON.stringify(value);
    });

    return {
      eventName,
      params: cookedParamsToSend,
      featureFlags: featureFlags() ? featureFlags().getFeatureValues() : undefined,
      platform: this.platform,
      slot: this.expSlot,
      experiment: this.expName,
      time: Date.now(),
      timezoneOffset: new Date().getTimezoneOffset(),
      forApiEndpoint: options.apiEndpoint || getInHouseEventTrackingURL(),
      isBatched: options.sendAsBatched,
      ...options.eventOptions,
    };
  }

  pushEventsToServer(eventsToProcess = []) {
    const eventListsToSend = this.groupBasedOnEndPoint(eventsToProcess);

    forEach(eventListsToSend, (processedEvents, apiEndPoint) => {
      if (!isEmpty(processedEvents.batched)) {
        this._post(processedEvents.batched, apiEndPoint);
      }

      forEach(processedEvents.unBatched, (event, index) => {
        this._post(event, apiEndPoint);
      });
    });
  }

  async _post(processedEvents = null, apiEndpoint) {
    try {
      if (getEnvironmentEnv() === Constants.NodeEnvs.PROD) {
        await MiscAPIService.sendAnalyticsEvent(apiEndpoint, processedEvents);
      }

      this.cleanupTempEventsQueue(processedEvents);
    } catch (error) {
      QLogger.logForSession([`Error at EventLoggerService.pushEventsToServer at sending ${processedEvents.length}`, processedEvents, error], 'error', { numArgsToUseForSessionLog: 1 });
    }
  }

  filterEventsToClean(evInBuffer = [], evAlreadyProcessed = []) {
    const newList = [];
    const processedEvents = clone(evAlreadyProcessed);

    for (let i = 0; i < evInBuffer.length; i++) {
      const isProcessedIndex = findIndex(processedEvents, (ev) => (ev.time === evInBuffer[i].time && ev.eventName === evInBuffer[i].eventName));

      if (isProcessedIndex >= 0) {
        processedEvents.splice(isProcessedIndex, 1);
      } else {
        // i.e. that event has not been processed
        newList.push(evInBuffer[i]);
      }

      if (processedEvents.length === 0) {
        break;
      }
    }

    return newList;
  }

  getUserSubsPlanId(user) {
    if (user && user.subscriptions && user.subscriptions.length) {
      const activeSub = user.subscriptions[0];
      const planId = activeSub.planId || activeSub.id;
      return planId;
    }
    return null;
  }

  getAdditionalParams(state, options) {
    const addParams = {};
    const { user } = state;

    addParams.userId = user?.id;
    addParams.subPlanId = this.getUserSubsPlanId(user);
    addParams.occupation = user?.occupation;
    addParams.country = state.serverData?.requestCountry ? state.serverData.requestCountry : null;
    addParams.sessionId = this.sessionId;
    addParams.media = state.deviceProps.type ? state.deviceProps.type : null;
    addParams.locale = state.deviceInfo.locale ? state.deviceInfo.locale : null;
    addParams.paidOrganization = user?.paidOrganization;
    return addParams;
  }

  getEnrichmentParams(state) {
    const { analyticsManager } = state;
    return analyticsManager.enrichmentData || {};
  }

  cleanupTempEventsQueue(eventsToClean) {
    const newList = this.filterEventsToClean(this.getEventsInBuffer('temp'), eventsToClean);
    this.putEventsInBuffer('temp', newList, true);
  }

  selectAndPushEventsToServer(newEventData, numEventsToSend = 10) {
    let eventsInBuffer = this.getEventsInBuffer('main');
    if (!isEmpty(newEventData)) {
      if (Array.isArray(newEventData)) {
        eventsInBuffer = concat(eventsInBuffer, newEventData);
      } else {
        eventsInBuffer.push(newEventData);
      }
    }

    let allEventsToPush = [];

    if (numEventsToSend < 1) {
      allEventsToPush = eventsInBuffer.splice(0, eventsInBuffer.length);
    } else if (eventsInBuffer.length > numEventsToSend) {
      allEventsToPush = eventsInBuffer.splice(0, numEventsToSend);
    }

    if (!isEmpty(allEventsToPush)) {
      this.putEventsInBuffer('temp', allEventsToPush);
      const allTempEvents = this.getEventsInBuffer('temp');
      this.pushEventsToServer(allTempEvents);
    }

    this.putEventsInBuffer('main', eventsInBuffer, true);
  }

  /**
   * This funciton will process the events before sending them, group them based on the end point which was
   * provided while logging and then group based on the apiEndpoint
   */
  groupBasedOnEndPoint(eventsToProcess = []) {
    const eventsLists = {};

    for (let i = 0; i < eventsToProcess.length; i++) {
      const endpointOfEvent = eventsToProcess[i].forApiEndpoint;
      const isEventToBeBatched = eventsToProcess[i].isBatched;

      if (!eventsLists[endpointOfEvent]) {
        eventsLists[endpointOfEvent] = { batched: [], unBatched: [] };
      }

      if (isEventToBeBatched) {
        eventsLists[endpointOfEvent].batched.push(this.sanitizeEventBeforeSending(eventsToProcess[i]));
      } else {
        eventsLists[endpointOfEvent].unBatched.push(this.sanitizeEventBeforeSending(eventsToProcess[i]));
      }
    }

    return eventsLists;
  }

  sanitizeEventBeforeSending(eventData) {
    return pickBy(eventData, (val, key) => !includes(['isBatched', 'forApiEndpoint'], key));
  }

  processPageViewEvents(currentUrl, previousUrl, gTagInstance, routerInstance, isBrowserLoaded = false, plansAndPricing = {}, customParams = {}) {
    const { query } = routerInstance;
    const pageTitle = PageTitles[currentUrl.name];
    const toPageName = getPageTitleForInhouseEvents(currentUrl.path, query);

    let sourcePageTitle = '';
    if (query && query.source) {
      sourcePageTitle = getSourcePageTitle(query.source);
    }

    if (pageTitle) {
      gTagInstance.pageview({
        page_title: pageTitle,
        page_path: currentUrl.path,
        page_location: currentUrl.fullPath,
      });
    }

    let isReferred = false;
    if (document.referrer !== '') {
      isReferred = true;
    }
    const referrer = isReferred ? document.referrer : isBrowserLoaded && !sourcePageTitle ? 'BrowserLoad' : sourcePageTitle || getPageTitleForInhouseEvents(previousUrl.path, previousUrl.query);

    const fromPageName = isBrowserLoaded && !sourcePageTitle ? 'BrowserLoad' : sourcePageTitle || getPageTitleForInhouseEvents(previousUrl.path, query);

    if (isReferred) {
      Object.defineProperty(document, 'referrer', { get: () => '' });
    }

    let params = {
      page: toPageName,
      source: fromPageName,
      referrer,
      url: currentUrl.path,
      ...customParams,
    };

    if (fromPageName !== 'BrowserLoad') {
      params = {
        ...params,
        ...plansAndPricing,
      };
    }

    this.logEvent(WebEvents.PAGE_VIEW, params);
  }
}

const eventLoggerInstance = new EventLoggerService();

export default eventLoggerInstance;

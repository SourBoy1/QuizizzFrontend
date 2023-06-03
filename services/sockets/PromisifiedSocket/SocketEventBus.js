import isNumber from 'lodash/isNumber';
import forEach from 'lodash/forEach';
import isPlainObject from 'lodash/isPlainObject';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';

import io from 'socket.io-client';

import CookieService from '~/services/CookieService';

import { reduceCallIdentifier, buildCallIdentifier, FIRST_EMIT_NUMBER } from '~/utils/SocketUtils';
import Constants from '~/config/Constants';

import { getEnvironmentEnv } from '~/utils/EnvUtils';
import QLogger from '../../QLogger';

export const CALL_ID_PAYLOAD_KEY = '__cid__';

/**
 * @typedef {Object} CallData
 * @property {string} eventName - name of the event/call being sent
 * @property {Object} payload - payload for the request being sent
 * @property {string} callIdentifier - the identifier being used to identify this call
 * @property {number} [emitsSoFar] - the current count of how many times the event had been emitted
 * @property {number} [timeout] - the timeout for call in millis
 * @property {Function} [onAckCB] - the callback to run when the acknowledgement for a request comes
 * @property {Object} [promiseRefs] - object containing the reference for the resolve and reject functions
 * @param {Function} promiseRefs.resolve
 * @param {Function} promiseRefs.reject
 */

/**
 * @typedef {Object} SocketEventType
 * @property {CallData[]} [retries] - list of retries in pro
 * ress for this call
 *
 * @typedef {CallData & SocketEventType} SocketEvent
 */

/**
 * @typedef {Object} IdentifierParts
 * @property {string} eventName - name of the event for which this id will be used
 * @property {string} baseUniqueId - the unique id to be used with each call as a furthr distinguishing string. Can be blank
 * @property {number} time - the unix timestamp stored when the request is sent
 * @property {number} currentTryNum - the number saying how many tries has happened for this call. Defaults to [FIRST_EMIT_NUMBER]
 */

/**
 * @typedef {Object} ResponseData
 * @property {string} eventName - name of the event for which the response has come
 * @property {any} response - response recieved for the call
 * @property {string} [callIdentifier] - the call id for the response recieved
 * @property {string|Object} [error] - of the call was errored then this key will be present
 */

class SocketEventBus {
  /**
   * Initializes all the class properties
   */
  constructor(endPoint, options = {}) {
    this.bus = {};
    this.socket = null;
    this.endPoint = endPoint;
    this.options = options;
  }

  /**
   * Creates a socket connection and then creates event handlers for each of the configured events
   * @param {CallData} callData - call data for connect call
   */
  connect(callData) {
    let ackTimeout;
    const callParams = { ...this.options, withCredentials: true };
    const { resolve } = callData.promiseRefs;
    if (!this.endPoint) {
      QLogger.invariant(false, 'SocketEventBus: connect call must have a valid endpoint');

      return;
    }

    /**
     * The endpoint for socket call can be something like https://foo.com/bar. So to connect socket url is split into
     * 1. the baseUrl( here 'https://foo.com' ) is the `endpoint` for the connect
     * 2. the path( here '/bar' ) is the path that goes into the option `path` for io
     */

    if (isNumber(callData.timeout)) {
      callParams.timeout = callData.timeout + 500; // extra 500 because we want the our programmatic timeout to getEventData called first, to avoid race conditions between socket.io timeout and the ackTimeout

      ackTimeout = setTimeout(() => {
        resolve({ connected: false });
      }, callParams.timeout);
    }

    // experiment additional params
    callParams.query = {
      experiment: 'authRevamp',
    };

    // if dev, send the auth token in socket connection headers
    // Todo(shradhan) - remove this check once done with development
    if (getEnvironmentEnv() !== Constants.NodeEnvs.PROD) {
      const authCookie = CookieService.get('dev_sid');
      if (authCookie) {
        callParams.query = callParams.query || {};
        callParams.query['x-auth-sessionid'] = authCookie;
      }
    }

    this.socket = io(this.endPoint, callParams);

    // Here we bind the added events for both client and server initiated messages as soon as a connection is made
    forEach(this.clientEmitMessageHandlers, (eventName) => this.registerEvent('clientInitiated', eventName));
    forEach(this.serverInitiatedBroadcastHandlers, (handler) => this.registerEvent('serverInitiatedbroadcast', handler.eventName, handler.callback));

    this.socket.on('connect', (response) => {
      ackTimeout && clearTimeout(ackTimeout);
      resolve({ connected: true });
    });
  }

  /**
   * uses the socket reference to disconnect from the current room
   */
  disconnect(callData) {
    const { resolve } = callData.promiseRefs;
    this.socket.disconnect();
    resolve();
  }

  /**
   * Creates an event handler for a particular event
   * @param {['serverInitiatedbroadcast'|'clientInitiated']} callType - the type of call to register the event for. Broadcast are the calls which are always initiated from the server
   * @param {string} eventName -> event for which the handler needs to be created
   */

  registerEvent(callType, eventName, callback) {
    this.socket.on(eventName, (response) => {
      const responseData = { eventName, response };
      const callIdentifier = (isPlainObject(responseData.response) && responseData.response[CALL_ID_PAYLOAD_KEY]) || '';
      let dataAgainstId = null;
      let identifierParts = null;
      if (!isEmpty(callIdentifier)) {
        identifierParts = this._getIdentifierParts(callIdentifier);
        const searchedData = this.search(identifierParts);
        // TODO(Sarthak): handle the edge case of multiple search results

        dataAgainstId = searchedData[0];
        responseData.callIdentifier = callIdentifier;
      }

      // if there are no errors in the response
      if (this._isValidResponse(responseData.response)) {
        this._handleEventResolution(true, callType, dataAgainstId, callIdentifier, identifierParts, responseData, callback);
      } else if (!isEmpty(identifierParts)) {
        this._handleEventResolution(false, callType, dataAgainstId, callIdentifier, identifierParts, responseData, callback);
      } else {
        // if response is null and there is no callIdentifier then just reject all calls and their retries with that eventName
        const eventNameSearches = this.search({ eventName });

        forEach(eventNameSearches, (callData, index) => {
          this.rejectAllRetries(callData.callIdentifier);
          this._handleTry('reject', callData.callIdentifier, FIRST_EMIT_NUMBER, responseData);
        });
      }
    });
  }

  /**
   * Resolves any main call
   * @param {string} initialCallID - the CallIdentifier for the initial/main/parent call
   * @param {ResponseData} responseData
   */
  resolveCall(initialCallID, responseData) {
    this._handleTry('resolve', initialCallID, FIRST_EMIT_NUMBER, responseData, true);
  }

  /**
   * Rejects any main call
   * @param {string} initialCallID - the CallIdentifier for the initial/main/parent call
   * @param {ResponseData} rejectData
   */
  rejectCall(initialCallID, rejectData) {
    this._handleTry('reject', initialCallID, FIRST_EMIT_NUMBER, rejectData, true);
  }

  /**
   * @param {string} identifier - the identifier for which the call will be sent
   * @param {boolean} isRetry - whether this event being sent is a retry call
   */
  emitEvent(identifier, isRetry) {
    const {
      eventName,
      payload,
      onAckCB,
    } = this.getEventData(identifier, isRetry);

    this.socket.emit(eventName, payload, (response) => {
      // if the cb is defined, execute it with the response
      if (isFunction(onAckCB)) {
        onAckCB(response);
      }
    });
  }

  /**
   * Adds a socket event to the event bus
   * @param {CallData} callData
   */
  add(callData) {
    this.bus[callData.callIdentifier] = {
      ...callData,
      retries: [],
    };
  }

  /**
   * Pushes the information of a "Retry" into the list of retries for a particular event
   * @param {string} parentCallID - callIdentifier of the main/parent call with which to associate the retry.
   * @param {CallData} retryData - All the relevant information about the try
   */
  addRetry(parentCallID, retryData) {
    const parentData = this.getEventData(parentCallID);
    if (!isEmpty(parentData)) {
      parentData.retries.push(retryData);
    }
  }

  /**
   * Removes an event from the event bus
   * @param {String} callID -> Unique identifier for the event
   */
  remove(callID) {
    return (delete this.bus[callID]);
  }

  /**
   * Retrieves an event from the event bus. Can be main event or retry event
   * @param {String} callID - Unique identifier for the event. If isRetry=true, then needs to be callID for the retry event
   * @param {boolean} [isRetry - if the event to retrieve is an retry event
   * @returns {SocketEvent}
   */
  getEventData(callID, isRetry = false) {
    if (!isRetry) {
      return this.bus[this.joinIdentifierParts(callID)];
    }
    const identifierParts = this._getIdentifierParts(callID);
    const retryIndex = identifierParts.currentTryNum - 1 - FIRST_EMIT_NUMBER;
    const initialEventCallID = this.joinIdentifierParts({ ...identifierParts, currentTryNum: FIRST_EMIT_NUMBER });
    const retryData = this.bus[initialEventCallID].retries[retryIndex];

    if (!isEmpty(retryData)) {
      return retryData;
    }
    QLogger.logForSession([`SocketEventBus: unable to retrieve retry call data for ${callID}`, retryData], 'error', { numArgsToUseForSessionLog: 1 });

    return null;
  }

  /**
   * search for callData against a particular identifier or identifier data
   * @param {(IdentifierParts|string)} identifierParts
   * @returns {SocketEvent[]}
   */
  search(identifierParts) {
    const result = [];

    const dataToSearch = this._getIdentifierParts(identifierParts);

    const busKeys = Object.keys(this.bus);
    for (let i = 0; i < busKeys.length; i++) {
      const id = busKeys[i];
      const reducedId = this._getIdentifierParts(id);
      const nameMatch = dataToSearch.eventName === reducedId.eventName;

      if (nameMatch) {
        const uniqueIdMatch = dataToSearch.baseUniqueId ? (dataToSearch.baseUniqueId === reducedId.baseUniqueId) : true;
        const timeMatch = dataToSearch.time ? (dataToSearch.time === reducedId.time) : true;

        if (uniqueIdMatch && timeMatch) {
          result.push(this.getEventData(id));
        }
      }
    }

    return result;
  }

  /**
   * returns the final id from the data
   * @param {IdentifierParts} identifierParts
   * @returns {string}
   */
  joinIdentifierParts(identifierParts) {
    return buildCallIdentifier(identifierParts);
  }

  /**
   * rejects all the retries of a certain callIdentifier
   * @param {string} initialEventCallID - callIdentifier for the main/parent call
   * @param {Object} [rejectData={}]
   * @param {boolean} [clearRetries=false] - if true will initialize the retries to empty array after rejecting
   */
  rejectAllRetries(initialEventCallID, rejectData = {}, clearRetries = false) {
    // let identifierParts = this._getIdentifierParts( initialEventCallID );
    const { retries } = this.getEventData(initialEventCallID);
    for (let i = 0; i < retries.length; i++) {
      // "i + 1 + FIRST_EMIT_NUMBER" - this calculation is because first try happens with number 1 and first retry happens at number 2.
      // So to get the correct index this offsetting happens here and at other places
      this._handleTry('reject', initialEventCallID, i + 1 + FIRST_EMIT_NUMBER, rejectData);
    }

    if (clearRetries) {
      this.getEventData(initialEventCallID).retries = [];
    }
  }

  /**
   * to reject any one retry among all the retries of an event in the bus
   * @param {any} initialEventCallID - the callId for the initial/main/parent call that was made
   * @param {any} tryNum - the nth number of 'try' and NOT the index; can be calculated with `retryIndexInArray + 1 + FIRST_EMIT_NUMBER`
   * @param {any} rejectData
   * @memberof SocketEventBus
   */
  rejectRetry(initialEventCallID, tryNum, rejectData) {
    this._handleTry('reject', initialEventCallID, tryNum, rejectData);
  }

  // Private Functions
  _isValidResponse(response) {
    // the `connect` event has an empty (null) response, but needs to be handled
    return (response ? !response.error : true);
  }

  /**
   * @param {string} identifier
   * @return {IdentifierParts}
   */
  _getIdentifierParts(identifier) {
    return reduceCallIdentifier(identifier);
  }

  /**
   * @param {['resolve'|'reject']} action - whether to resolve or reject that particular try
   * @param {string} identifier
   * @param {number} currentTryNum - number of try
   * @param {(ResponseData|Object)} responseData
   * @param {boolean} [forceResolve=false]
   */
  _handleTry(action, identifier, currentTryNum, responseData, forceResolve = false) {
    const callData = this.getEventData(identifier);

    if (currentTryNum === FIRST_EMIT_NUMBER) {
      if (callData.retries.length === 0 || forceResolve) {
        callData.promiseRefs[action](responseData);
        this.remove(identifier);
        return;
      }

      QLogger.warn(`SocketEventBus: Not taking any action for id ${identifier} for action ${action} as currently retrys are going on. Response - `, responseData);
    } else {
      const isActionForLatestRetry = (currentTryNum - FIRST_EMIT_NUMBER) !== callData.retries.length;

      if (action === 'resolve' && isActionForLatestRetry && !forceResolve) {
        QLogger.warn(`SocketEventBus: Not taking any action for id ${identifier} for action ${action} as this response is NOT for latest retry. Response - `, responseData);
        return;
      }
      const retryData = callData.retries[currentTryNum - 1 - FIRST_EMIT_NUMBER];

      if (!isEmpty(retryData)) {
        retryData.promiseRefs[action](responseData);
        return;
      }

      QLogger.error(`SocketEventBus: Error at _handleTry for identifier(${identifier}) as no retryData available for action(${action})`, responseData);
    }
  }

  _handleEventResolution(isVaildResponse, callType, dataAgainstId, callIdentifier, identifierParts, responseData, callback) {
    const handleTryAction = isVaildResponse ? 'resolve' : 'reject';

    if (!isEmpty(dataAgainstId)) {
      this._handleTry(handleTryAction, dataAgainstId.callIdentifier, identifierParts.currentTryNum, responseData);
    } else if (callType === 'serverInitiatedbroadcast') {
      if (isFunction(callback)) {
        const response = {
          response: responseData,
        };
        callback(response);
        return;
      }
      QLogger.warn(`SocketEventBus: Broadcast event(${responseData.eventName}) [isValid-${isVaildResponse}] - recieved with no Callback present`, responseData);
    } else {
      QLogger.error(`SocketEventBus: unable to resolve id(${callIdentifier}) for event(${responseData.eventName}) [isValid-${isVaildResponse}] - as no data in bus and not a serverInitiatedbroadcast event. Most likely response recieved after call timeout`, responseData);
    }
  }
}
export default class SocketEventBusExtended extends SocketEventBus {
  constructor(endPoint, options = {}) {
    super(endPoint, options);
    // added these to handle client and server messages
    this.serverInitiatedBroadcastHandlers = [];
    this.clientEmitMessageHandlers = [];
  }

  /**
   * attach these listeners before emitting calls
   * @param {String} eventName
   * @returns {instanceOf SocketCall}
   */
  registerClientEmitMessage(eventName) {
    this.clientEmitMessageHandlers.push(eventName);
    return this;
  }

  /**
   * @param {{ eventName: String }[]} eventNames
   * @returns {instanceOf SocketCall}
   */
  registerClientEmitMessages(eventNames) {
    this.clientEmitMessageHandlers = [...this.clientEmitMessageHandlers, ...eventNames];
    return this;
  }

  /**
   * attach these listeners before emitting calls
   * @param {String} eventName
   * @param {function} callback
   * @returns {instanceOf SocketCall}
   */
  registerServerBroadcastedMessage(eventName, callback) {
    this.serverInitiatedBroadcastHandlers.push({
      eventName,
      callback,
    });
    return this;
  }

  /**
   * @param {{ eventName: String, callback: function }[]} messages
   * @returns {instanceOf SocketCall}
   */
  registerServerBroadcastedMessages(messages) {
    this.serverInitiatedBroadcastHandlers = [...this.serverInitiatedBroadcastHandlers, ...messages];
    return this;
  }
}

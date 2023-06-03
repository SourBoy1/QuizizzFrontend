import includes from 'lodash/includes';
import isFunction from 'lodash/isFunction';
import forOwn from 'lodash/forOwn';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';

import QLogger from '../../QLogger';

import SocketEventBus, { CALL_ID_PAYLOAD_KEY } from './SocketEventBus';

/**
 * @typedef RetryData
 * @property {boolean} shouldRetry
 * @property {CallData} callData - the new callData to be used for the call. Only certain properties of the CallData will be taken into account; i.e. - payload, timeout, onAckCB
 */

/**
 * This callback is displayed as part of the SocketEventHandler class.
 * @callback retrierCallBack
 * @param {CallData} callData
 * @return {RetryData}
 */

export default class SocketEventHandler {
  /**
   * ctr
   * @param {String} eventName -> Name of the socket event to be sent/received
   * @param {Object} payload -> Object containing all the data to be used with the socket event
   * @param {String|Function} identifier -> String or function to generate a string used to create a unique identifier for each socket event
   */

  constructor(eventName, payload = {}, identifier = '') {
    this.retryTimeouts = {};
    this.retrier = null; // will be used as a function
    this._hasRetryResolved = false;
    this._baseIdentifier = identifier;
    this._timeComponentForIdentifier = null;
    this.callData = {
      eventName,
      payload,
      emitsSoFar: 0,
      callIdentifier: '',
      timeout: null,
      onAckCB: null,
    };
    this.socketEventBus = null;

    QLogger.invariant(!includes(identifier, '.'), 'SocketEventHandler: the call identifier cannot have character "." in it');
  }

  /**
   * sets up event bus to be used by this SocketCall
   *
   * @param {SocketEventBus} bus - Contains information about the socket event to be added to the bus
   * @returns {instanceof SocketCall}
   */
  setupEventBus(bus) {
    if (!(bus instanceof SocketEventBus)) {
      QLogger.error(`${bus} should be an instance of SocketEventBus`);
      return;
    }
    this.socketEventBus = bus;
    return this;
  }

  /**
   * Adds a socket event to the SocketEventBus.
   * If the socket event is "connect", directly creates and resolves a socket "connect" event.
   *
   * @param {CallData} callData - Contains information about the socket event to be added to the bus
   * @param {boolean} isRetry - Whether this data is meant for a retry attempt or not
   * @param {CallIdentifier} initialCallID - the first identifier with which this call was started
   */
  addToBus(callData, isRetry, initialCallID) {
    if (callData.eventName === 'connect') {
      this.socketEventBus.connect(callData);
      return;
    }

    if (callData.eventName === 'disconnect') {
      this.socketEventBus.disconnect(callData);
      return;
    }

    if (isRetry) {
      this.socketEventBus.addRetry(initialCallID, callData);
    } else {
      this.socketEventBus.add(callData);
    }

    this.socketEventBus.emitEvent(callData.callIdentifier, isRetry);
  }

  /**
   * Finds a socket event in the SocketEventBus and resolves it
   * @param {ResponseData} responseData - Data to resolve the call with
   */
  resolveCall(responseData) {
    if (this._hasRetryResolved) {
      return;
    }

    this._hasRetryResolved = true;
    this.socketEventBus.rejectAllRetries(this.callData.callIdentifier);
    this.socketEventBus.resolveCall(this.callData.callIdentifier, responseData);
  }

  /**
   * Finds a socket event in the SocketEventBus and rejects it
   * @param {ResponseData} rejectData - Data to reject the call with
   */
  rejectCall(rejectData) {
    if (this._hasRetryResolved) {
      return;
    }

    this._hasRetryResolved = true;
    this.socketEventBus.rejectAllRetries(this.callData.callIdentifier);
    this.socketEventBus.rejectCall(this.callData.callIdentifier, rejectData);
  }

  /**
   * @async
   * Calls the _emit function with the current call's eventName and payload
   * @returns {Promise<ResponseData>}
   */
  emit() {
    this.callData.emitsSoFar += 1;
    this._timeComponentForIdentifier = Date.now();
    this.callData.callIdentifier = this._generateIdentifier(this.callData.eventName, this._baseIdentifier, this.callData.emitsSoFar, this._timeComponentForIdentifier);
    this.callData.payload = SocketEventHandler._getCookedPayload(this.callData.payload, this.callData.callIdentifier);

    return this._emit(this.callData, false);
  }

  /**
   * Retrieves all the timeouts running for the current socket event and clears them
   */
  clearAllTimeouts() {
    forOwn(this.retryTimeouts, (value, key) => {
      clearTimeout(value);
    });
    this.retryTimeouts = {};
  }

  /**
   * Creates a function that is executed every time a retry for the current socket call is attempted
   * @param {retrierCallBack} retrier -> Function used to create a retrier
   */
  addRetrier(retrier) {
    this.retrier = retrier;
    return this;
  }

  /**
   * Assigns a timeout which cancels the socket event after a particular amount of time
   * @param {number} timeout -> Time limit for the timeout
   */
  timeoutAfter(timeout) {
    this.callData.timeout = timeout;
    return this;
  }

  // Private Functions

  // this function would first reject the previous retry call and then decide whether to send the next call or not
  async _invokeRetrier(forCid) {
    // if this retrier hasn't been invoked by the main socket call, cancel the previous retry
    if (forCid !== this.callData.callIdentifier) {
      this.socketEventBus.rejectRetry(this.callData.callIdentifier, this.callData.emitsSoFar, SocketEventHandler._getRejectData(true, { type: 'timeout' }, true, forCid));
    }

    if (this.retrier && isFunction(this.retrier)) {
      const retryData = this.retrier(this.callData);
      // if a retry should happen and no previous retries have been successfully resolved
      if (retryData.shouldRetry && !this._hasRetryResolved) {
        this.callData.emitsSoFar += 1;
        const retryCallIdentifier = this._generateIdentifier(this.callData.eventName, this._baseIdentifier, this.callData.emitsSoFar, this._timeComponentForIdentifier);
        const retryCallData = {
          ...retryData.callData,
          payload: SocketEventHandler._getCookedPayload(retryData.callData.payload, retryCallIdentifier),
          eventName: this.callData.eventName,
          callIdentifier: retryCallIdentifier,
        };

        try {
          const responseData = await this._emit(retryCallData, true);
          this.resolveCall(responseData);
        } catch (error) {
          QLogger.logForSession([`SocketEventHandler: error at _invokeRetrier for ${forCid}`, retryCallData, error], 'error', { numArgsToUseForSessionLog: 1 });

          // if the retry attempt is rejected (non-timeout reject), reject the parent event call and delete all the existing retriers
          if (error && error.cancelled && (error.error && error.error.type !== 'timeout')) {
            this.rejectCall({ ...error, callIdentifier: retryCallIdentifier });
          }
        }
      } else {
        // no more retriers to be invoked - reject the socket call
        this.rejectCall(SocketEventHandler._getRejectData(false, { type: 'timeout' }, true, this.callData.callIdentifier));
      }
    } else {
      this.rejectCall(SocketEventHandler._getRejectData(false, { type: 'timeout' }, false, this.callData.callIdentifier));
    }
  }

  /**
   * @async
   * Emits an event and creates a timeout and retrier if they have been defined
   * @param {CallData} callData - call data to push to bus
   * @returns {Promise}
   */
  _emit(callData, isRetry) {
    return new Promise((resolve, reject) => {
      let timeout;
      const { callIdentifier } = callData;
      callData.promiseRefs = { resolve, reject };

      if (isNumber(this.callData.timeout) && callData.eventName !== 'connect') {
        timeout = setTimeout(() => {
          this._invokeRetrier(callIdentifier);
          timeout && clearTimeout(timeout);
        }, callData.timeout);

        this.retryTimeouts[callIdentifier] = timeout;

        callData.promiseRefs = {
          resolve: SocketEventHandler._wrapPromiseRefs(resolve, this.retryTimeouts[callIdentifier]),
          reject: SocketEventHandler._wrapPromiseRefs(reject, this.retryTimeouts[callIdentifier]),
        };
      }

      this.addToBus(callData, isRetry, this.callData.callIdentifier);
    });
  }

  static _getCookedPayload(payload, callIdentifier) {
    QLogger.invariant(isPlainObject(payload), `SocketEventHandler 'payload' needs to be an object for identifier ${callIdentifier}`);

    payload[CALL_ID_PAYLOAD_KEY] = callIdentifier;

    return payload;
  }

  /**
   * If the param is a function, generates an identifier by executing the function and returns it otherwise returns the param in its original state
   * @param {string} eventName
   * @param {string|Function} identifier -> String or function to generate a string used to create a unique identifier for each socket event
   * @param {number} currentTryNum
   * @returns {String}
   */
  _generateIdentifier(eventName, identifier, currentTryNum, time) {
    let baseUniqueId = identifier || '';
    if (identifier && isFunction(identifier)) {
      baseUniqueId = identifier();
    }

    return this.socketEventBus.joinIdentifierParts({
      eventName, baseUniqueId, currentTryNum, time: time || Date.now(),
    });
  }

  static _wrapPromiseRefs(ref, timeout) {
    return function wrappedPromise(...args) {
      timeout && clearTimeout(timeout);
      ref(...args);
    };
  }

  _rejectRetry(retryCid, rejectData) {
    this.socketEventBus.rejectRetry(retryCid, rejectData);
  }

  static _getRejectData(cancelled, error, didRetry = false, callID) {
    return {
      callIdentifier: callID,
      cancelled,
      error: error || { type: 'unknown' },
      didRetry,
    };
  }
}

/* eslint no-console: off */
/**
 * This file contains the QLogger service with which we can log user actions, programmatic actions of any kind to
 * 1. Browser console
 * 2. Quizizz Error analtics servers: - Will send to sentry when enabled.
 *
 * This will help us a lot in storing errors with deeper context for easier bug resolution
 */

import map from 'lodash/map';
import defaults from 'lodash/defaults';
import isFunction from 'lodash/isFunction';
import toUpper from 'lodash/toUpper';

import { isThisIsBrowserEnvironment } from '../utils/EnvironmentHelpers';

import LocalStorage from './LocalStorage';
import { isProd } from '../utils/EnvUtils';

import SessionStorage from './SessionStorage';

class QLogger {
  // This key will be checked on load and if it is true then browser console logging will also happen in production
  constructor() {
    this.Q_CONSOLE_LOGGING_ALLOWED_KEY = 'qgCLAllowed';
    this.isBrowserConsoleLoggingAllowed = this.checkIfBrowserConsoleLoggingAllowed();
    this.isThisBrowserEnvironment = isThisIsBrowserEnvironment();
    this.sentry = null;

    this.warningLog();
  }

  checkIfBrowserConsoleLoggingAllowed() {
    if (!isProd()) {
      return true;
    }

    if (!LocalStorage.isPresent()) {
      return false;
    }

    try {
      const isLoggingAllowedInProd = LocalStorage.getItem(this.Q_CONSOLE_LOGGING_ALLOWED_KEY);
      return (isLoggingAllowedInProd === true);
    } catch (error) {
      if (!isProd()) {
        console.error('Error at QLogger checkIfBrowserConsoleLoggingAllowed', error);
      }

      return false;
    }
  }

  initializeSentryInstance(sentry) {
    this.sentry = sentry;
  }

  checkIfLoggingIsAllowed() {
    return this.isThisBrowserEnvironment && this.isBrowserConsoleLoggingAllowed;
  }

  isVueDevToolsAllowed() {
    return this.checkIfLoggingIsAllowed();
  }

  // eslint-disable-next-line class-methods-use-this
  isSessionLoggingAllowed() {
    return isProd() && SessionStorage.isPresent() && QLogger.IS_SESSION_STORAGE_ALLOWED;
  }

  // eslint-disable-next-line class-methods-use-this
  warningLog() {
    if (!isProd()) {
      return;
    }

    setTimeout(
      console.log.bind(console, '%c%s', 'color: red; background: yellow; font-size: 24px;', 'WARNING!'),
    );
    setTimeout(
      console.log.bind(console, '%c%s', 'font-size: 18px;', "Using this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS.\nDo not enter or paste code that you don't understand."),
    );
  }

  log(...items) {
    this.logOnConsole(items, { logLevel: 'log' });
  }

  info(...items) {
    this.logOnConsole(items, { logLevel: 'info' });
  }

  warn(...items) {
    this.logOnConsole(items, { logLevel: 'warn' });
  }

  error(...items) {
    this.logOnConsole(items, { logLevel: 'error' });
  }

  errorForceLogged(...items) {
    this.logOnConsole(items, { logLevel: 'error', forceLog: true });
  }

  /**
   * @param {Array|String} items
   * @param {Object} [options={}]
   * @param {['log'|'info'|'warn'|'error']} [options.logLevel='info']
   * @param {boolean} [options.forceLog=false]
   */
  logOnConsole(items, { logLevel = 'info', forceLog = false } = {}) {
    if (!this.checkIfLoggingIsAllowed() && !forceLog) {
      return;
    }

    const logArgs = Array.isArray(items) ? items : [items];
    const evaluatedArgs = map(logArgs, (item) => (isFunction(item) ? item() : item));

    console[logLevel](...evaluatedArgs);
  }

  /**
   * It checks the condition and if !true( meaning anything except the boolean true will throw an error ) throws an error with the message provided in dev env and log in prod env
   * @param {boolean} condition
   * @param {string|Array} [messageWhenItFails='']
   * @param {Object} [options={}]
   * @param {boolean} [options.alsoLogOnConsole=false] - Whether the invariant method should log the complete message on the console as well, regardless of environment
   * @memberof QLogger
   */
  invariant(condition, messageWhenItFails = '', options = {}) {
    if (condition === true) {
      return;
    }

    const defaultedOptions = defaults(options, {
      alsoLogOnConsole: false,
    });

    const logArgs = Array.isArray(messageWhenItFails) ? messageWhenItFails : [messageWhenItFails];

    if (isProd()) {
      this.error(['Invariant Violation:', ...logArgs]);

      return;
    }

    const error = new Error(...logArgs);
    error.name = 'Invariant Violation';
    error.framesToPop = 1; // we don't care about invariant's own frame

    if (defaultedOptions.alsoLogOnConsole) {
      console.error(error);
    }

    throw error;
  }

  /**
   * To be used when anything needs to bendirectly logged on to sentry
   * @param {Array|string} items - The items that will be included in the message
   * @param {['exception'|'message']} logOnSentryAs
   * @param {['info'|'warn'|'error']} [logLevel='error']
   * @memberof QLogger
   */
  logOnSentry(items, logOnSentryAs, logLevel = 'error') {
    if (!this.sentry) { return; }
    const itemsArr = Array.isArray(items) ? items : [items];

    switch (logOnSentryAs) {
      case 'exception':
        this.sentry.withScope((scope) => {
          scope.setLevel(logLevel);
          scope.setExtra('forceCapture', true);
          scope.setExtra('params', items);
          this.sentry.captureException(new Error(itemsArr[0]));
        });
        break;
      case 'message':
        this.sentry.withScope((scope) => {
          scope.setLevel(logLevel);
          scope.setExtra('forceCapture', true);
          scope.setExtra('params', items);
          this.sentry.captureMessage(itemsArr[0]);
        });
        break;

      default:
    }
  }

  logForSession(items, logLevel = 'info', options = {}) {
    const updatedOptions = defaults(options, {
      logToBrowserConsole: true,
      numArgsToUseForSessionLog: -1,
    });

    const logArgs = Array.isArray(items) ? items : [items];

    if (updatedOptions.logToBrowserConsole && this.isBrowserConsoleLoggingAllowed) {
      console[logLevel](...logArgs);
    }

    if (this.isSessionLoggingAllowed()) {
      const args = [`[${toUpper(logLevel[0])}]`, ...logArgs];
      this._handleUpdatingSessionStorage(args, Date.now(), updatedOptions);
    }
  }
}

const logger = new QLogger();

export default logger;

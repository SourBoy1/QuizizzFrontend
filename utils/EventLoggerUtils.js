import concat from 'lodash/concat';
import cloneDeep from 'lodash/cloneDeep';
import QLogger from '../services/QLogger';
import CookieService from '../services/CookieService';
import Constants from '../config/Constants';
import LocalStorage from '../services/LocalStorage';
import UrlUtils from './UrlUtils';

export function getLoggerInitDetails() {
  return {
    sessionId: CookieService.get('quizizz_uid'),
    modelDetails: {
      expSlot: CookieService.get('QUIZIZZ_EXP_SLOT'),
      expName: CookieService.get('QUIZIZZ_EXP_NAME'),
      platform: 'web',
    },
  };
}

export function getInHouseEventTrackingURL() {
  if (import.meta.env.VITE_NODE_ENV === Constants.NodeEnvs.PROD) {
    return 'https://analytics.quizizz.com/events';
  }

  return 'http://dev-analytics-733896328.us-east-1.elb.amazonaws.com/events';
}

export function getSessionTrackingEventURL() {
  if (import.meta.env.VITE_NODE_ENV === Constants.NodeEnvs.PROD) {
    return 'https://analytics.quizizz.com/tracking/active-time/events';
  }

  return 'http://dev-analytics-733896328.us-east-1.elb.amazonaws.com/tracking/active-time/events';
}

export function getEventsInBuffer(bucket) {
  const bucketName = bucket === 'main' ? 'QuizizzAnalyticsBucket' : 'QuizizzAnalyticsBucketTemp';

  let eventsInBucket = [];
  if (LocalStorage.isPresent()) {
    const bucketData = LocalStorage.getItem(bucketName);

    if (Array.isArray(bucketData)) {
      eventsInBucket = bucketData;
    } else {
      QLogger.error(`Error at event logger getEventsInBuffer: Data for bucket(${bucketName}) is not an Array`, bucketData);
    }
  }

  return eventsInBucket;
}
/**
 * to put the any list of events in the localstorage
 * @param {['main'|'temp']} bucket
 * @param {Array} [eventsList=[]]
 * @param {boolean} [shouldReplace=false]
 */
export function putEventsInBuffer(bucket, eventsList = [], shouldReplace = false) {
  const bucketName = bucket === 'main' ? 'QuizizzAnalyticsBucket' : 'QuizizzAnalyticsBucketTemp';

  try {
    if (shouldReplace) {
      LocalStorage.isPresent() && LocalStorage.setItem(bucketName, eventsList);
    } else {
      let eventsInBucket = getEventsInBuffer(bucket);

      eventsInBucket = concat(eventsInBucket, eventsList);
      LocalStorage.isPresent() && LocalStorage.setItem(bucketName, eventsInBucket);
    }
  } catch (error) {
    QLogger.error('Error at event logger putEventsInBuffer', error);
  }
}

/**
 * Accepts newValues, oldValues
 * Returns formatted fields with each field containing
 * newValue and oldValue separated by a delimiter ($).
 * (Formats only fields with String or Number)
 * eg: <name> is the updated field (newValue: 'John', oldValue: 'Mark')
 *  returns {name: 'John$Mark'}
 * eg: <name> is the updated field (newValue: 'John', oldValue: '')
 *  returns {name: 'John$NULL'}
 */
export function formatEventParamsWithOldAndNewValues(data, defaultData) {
  const SEPARATION_DELIMITER = '$';
  const CONSTANT_FOR_EMPTY_VALUE = 'NULL';

  const formattedEventParams = cloneDeep(data);
  const clonedDefaultData = cloneDeep(defaultData);
  // fields that need formatting
  const FormattingFieldList = Object.keys(clonedDefaultData);

  FormattingFieldList.forEach((param) => {
    const oldVal = clonedDefaultData[param] || '';
    const newVal = formattedEventParams[param] || '';

    if (['string', 'number'].includes(typeof formattedEventParams[param])) {
      formattedEventParams[param] = [
        newVal || CONSTANT_FOR_EMPTY_VALUE,
        oldVal || CONSTANT_FOR_EMPTY_VALUE,
      ]
        .join(SEPARATION_DELIMITER);
    }
  });

  return formattedEventParams;
}

/**
 * Accepts newValues, oldValues
 * Returns map of updated/non-updated fields with field name as `up_<field_name>`
 * eg: <name> is the updated field
 *  returns { up_name: true }
 */
export function getUpdatedEventParams(data, defaultData) {
  const updatesMap = Object.keys(defaultData).reduce((acc, param) => {
    const updatedParamName = `up_${param}`;
    acc[updatedParamName] = data[param] !== defaultData[param];

    return acc;
  }, {});

  return updatesMap;
}

export function getAnalyticsParams() {
  // Set source and cameFrom feature params
  const cameFrom = { feature: '', variant: '' };
  const { query } = UrlUtils.parse(window.location.href);
  cameFrom.feature = query.feat || '';
  const decodedVariant = decodeURIComponent(query.variant);
  cameFrom.variant = decodedVariant && decodedVariant !== 'undefined' ? decodedVariant : '';
  const source = query.source || cameFrom.feature;
  if (!UrlUtils.isRelativeUrl(decodeURIComponent(query.backto || '/admin'))) {
    query.backto = '/admin';
  }
  return { cameFrom, source };
}

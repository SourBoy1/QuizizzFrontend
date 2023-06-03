import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';

export const CALL_ID_DELIMITER = '.';
export const FIRST_EMIT_NUMBER = 1;

export function buildCallIdentifier(identifierParts) {
  if (isString(identifierParts)) {
    return identifierParts;
  }

  const currentTryNum = isNumber(identifierParts.currentTryNum) ? identifierParts.currentTryNum : FIRST_EMIT_NUMBER;
  return `${identifierParts.eventName}.${identifierParts.baseUniqueId}|${currentTryNum}.${identifierParts.time}`;
}

export function reduceCallIdentifier(identifier) {
  // TODO(sarthak): add validation for a callId, especially for complex cases of `checkIfCallInProgress`
  if (isPlainObject(identifier)) {
    return identifier;
  }

  const idSplits = identifier.split(CALL_ID_DELIMITER);
  let currentTryNum = 0;
  let uniqueIdSplits = [];

  if (idSplits[idSplits.length - 2]) {
    if (idSplits.length >= 3) {
      uniqueIdSplits = idSplits[idSplits.length - 2].split('|');
      currentTryNum = Number(uniqueIdSplits[uniqueIdSplits.length - 1]);
      uniqueIdSplits.splice(uniqueIdSplits.length - 1, 1);
    } else {
      uniqueIdSplits = idSplits.slice(1);
      currentTryNum = 0;
    }
  }

  const baseUniqueId = uniqueIdSplits.join('|');

  return {
    eventName: idSplits[0],
    baseUniqueId,
    currentTryNum,
    time: Number(idSplits[idSplits.length - 1]) || null,
  };
}

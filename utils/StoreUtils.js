import keys from 'lodash/keys';
import includes from 'lodash/includes';
import forEach from 'lodash/forEach';

import Constants from '../config/Constants';
import QLogger from '../services/QLogger';

/**
 * This is a util to help copying the provided state over the current state.
 * Warn - All the keys in the argument `stateToBeAssigned` should be present in the argument `currentState`.To ensure
 * no unwanted value are assigned to the state
 * @export
 * @param {Object} [currentState={}] - The current state over which the values will be assigned
 * @param {Object} [stateToBeAssigned={}] - The state that will be assigned
 */
export function stateAssigner(currentState = {}, stateToBeAssigned = {}) {
  const stateToBeAssignedKeys = keys(stateToBeAssigned);

  for (let i = 0; i < stateToBeAssignedKeys.length; i++) {
    const keyName = stateToBeAssignedKeys[i];

    QLogger.invariant(keyName in currentState, `Error at stateAssigner: The keyName[${keyName}] is present in the stateToBeAssigned but is not present in currentState`);

    currentState[keyName] = stateToBeAssigned[keyName];
  }
}

/**
 * This is a util to help changing the currentState and reinitialize to the initialState of the module
 * Warn - All the keys in the argument `currentState` should be present in the argument `initialState`. To ensure
 * no unwanted value are assigned to the state
 * @export
 * @param {Object} [currentState={}] - The state which will be resetted
 * @param {Object} [initialState={}] - The initialState to which the state will be resetted to
 * @param {Array} [keyNamesToPreserve=[]] - The key names which want to be preserved and not overwritten
 */
export function stateResetter(currentState = {}, initialState = {}, keyNamesToPreserve = []) {
  const stateKeys = keys(currentState);

  if (import.meta.env.VITE_NODE_ENV !== Constants.NodeEnvs.PROD) {
    checkIfKeysToPreserveExistInState(stateKeys, keyNamesToPreserve);
  }

  for (let i = 0; i < stateKeys.length; i++) {
    const keyName = stateKeys[i];
    const isThisKeyNameToBePreserved = keyNamesToPreserve.length > 0 ? includes(keyNamesToPreserve, keyName) : false;
    const isKeyNameInInitialState = keyName in initialState;

    if (!isThisKeyNameToBePreserved) {
      QLogger.invariant(isKeyNameInInitialState, `Error at stateResetter: The keyName[${keyName}] is present in the currentState but is not present in initialState`);

      currentState[keyName] = initialState[keyName];
    }
  }
}

// Helper Function
function checkIfKeysToPreserveExistInState(allStateKeys, keyNamesToPreserve) {
  forEach(keyNamesToPreserve, (keyName) => {
    const keyNameExists = includes(allStateKeys, keyName);

    QLogger.invariant(keyNameExists, `Error at stateResetter: The key name to preserve [${keyName}] does not exist in the state. Only valid state keys will be NOT reset. Keys present - [${allStateKeys.join(',')}]`);
  });
}

import { createLogger } from 'vuex';
import keys from 'lodash/keys';
import isPlainObject from 'lodash/isPlainObject';

import LocalStorage from '~/services/LocalStorage';
import QLogger from '../services/QLogger';

import contentLogger from './contentLogger';
import SentryBreadcrumbsPlugin from './SentryBreadcrumbsPlugin';

/* NOTE: as Vuex evolves use of _modules might become different so this is brittle.
        If you are updating the Vuex library please keep this in mind. You have been Warned */

/**
 * This plugin is supposed to check the whole module tree and figure out of there is any state
 * which has been set as `undefined`. It will throw an error.
 * For now this will only be included in the `dev` build environment
 */
export const undefinedCheckerPlugin = (store) => {
  store.subscribe((mutation, state) => {
    traverseAndCheckModuleTree(store._modules.root, 'root', mutation);
  });
};

const plugins = [SentryBreadcrumbsPlugin, contentLogger];

if (QLogger.isVueDevToolsAllowed()) {
  const vuexLogger = createLogger({
    collapsed: true, // auto-expand logged mutations
    // logger: console, // implementation of the `console` API, default `console`,
    logger: {
      ...console,
      log: (...args) => {
        if (QLogger.checkIfLoggingIsAllowed()) {
          // eslint-disable-next-line no-console
          console.log(...args);
        }
      },
    },

    filter(mutation, stateBefore, stateAfter) {
      return !mutation.type.includes('SET_AUTOSAVE_IN_PROGRESS');
    },

    actionFilter(action, state) {
      return action.type !== 'contentEditor/autoSave';
    },
  });

  const shouldInjectVueLogger = LocalStorage.getItem('qgCLAllowed');

  if (shouldInjectVueLogger) {
    plugins.push(vuexLogger);
  }
  plugins.push(undefinedCheckerPlugin);
}

export default plugins;

// Helper Functions
function traverseAndCheckModuleTree(moduleCollection, moduleName, mutation) {
  const checkResult = checkForUndefined(moduleCollection.state, moduleName);

  // If it is not undefined then invariant will do nothing, but if it is undefined then it will throm an error
  QLogger.invariant(!checkResult.isUndef, `Error after mutation [${mutation.type}] in the module [${moduleName}], state item [${checkResult.key}] was set UNDEFINED.`);

  if (moduleCollection._children) {
    const modules = keys(moduleCollection._children);
    for (let i = 0; i < modules.length; i++) {
      const name = modules[i];
      traverseAndCheckModuleTree(moduleCollection._children[name], name, mutation);
    }
  }
}

function checkForUndefined(state, name) {
  if (!isPlainObject(state)) {
    if (state === undefined) {
      return { isUndef: true, key: name };
    }
  } else {
    const allKeys = keys(state);
    for (let i = 0; i < allKeys.length; i++) {
      if (state[allKeys[i]] === undefined) {
        return { isUndef: true, key: allKeys[i] };
      }
    }
  }

  return { isUndef: false, key: null };
}

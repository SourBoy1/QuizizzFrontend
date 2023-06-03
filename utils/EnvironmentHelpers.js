import { isClient } from './EnvUtils';

function isThisIsBrowserEnvironment() {
  if (!isClient()) {
    return false;
  }

  try {
    const doesWindowExist = Boolean(window);

    return doesWindowExist;
  } catch (error) {
    return false;
  }
}

export { isThisIsBrowserEnvironment };

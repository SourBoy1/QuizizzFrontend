import Constants from '~/config/Constants';
import BrazeService from './BrazeService';

export default class LifecycleEventService {
  static loadService(provider, user, nonce, store) {
    /**
     * Load a service here, like Braze, Moengage
     */
    switch (provider) {
      case Constants.LifecycleEventServices.BRAZE:
        BrazeService.loadBrazeService(user, nonce, store);
        break;
      default:
    }
  }

  static triggerEvent(provider, user, eventType, eventName, eventData = {}) {
    // based on different eventType, trigger different methods

    if (eventType === 'event') {
      this.addEvent(provider, user, eventName, eventData);
    }
  }

  static addEvent(provider, user, eventName, eventData) {
    switch (provider) {
      case Constants.LifecycleEventServices.BRAZE:
        BrazeService.addBrazeEvent(user, eventName, eventData);
        break;
      default:
    }
  }
}

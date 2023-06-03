import { App } from 'vue';
import Constants from '../config/Constants';
import LifecycleEventService from '../services/LifecycleEventService';

const BrazePlugin = {
  install: (app: App, { user, store }: any) => {
    LifecycleEventService.loadService(
      Constants.LifecycleEventServices.BRAZE,
      user ?? {},
      store?.getters['root/serverData'].nonce,
      store,
    );
  },
};

export default BrazePlugin;

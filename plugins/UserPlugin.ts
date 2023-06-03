import { App } from 'vue';

import { isSentryEnabled } from '~/utils/EnvUtils';
import UserService from '../services/UserService';

const UserPlugin = {
  install: (app: App, options: any) => {
    const user = new UserService(options.user ?? {});
    app.config.globalProperties.$user = user;
    if (user && isSentryEnabled() && options.Sentry) {
      options.Sentry.setUser({
        id: user.id,
        occupation: user.occupation,
      });
      options.Sentry.setTag('userOccupation', user.occupation);
    }
  },
};

export default UserPlugin;

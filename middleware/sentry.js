import { isSentryEnabled } from '@/utils/EnvUtils';
import * as Sentry from '@sentry/vue';
import QLogger from '../services/QLogger';

export default function sentry(to, from, next) {
  const route = to;
  const routeName = route?.name;

  if (isSentryEnabled() && Sentry) {
    const deviceInfo = store.getters['root/deviceInfo'];
    const experimentName = deviceInfo?.experimentName || '';
    const experimentSlot = deviceInfo?.experimentSlot || '';

    Sentry.configureScope((scope) => {
      scope.setExtra('CurrentPage', routeName);
      scope.setTag('CurrentPage', routeName);
      scope.setExtra('experimentName', experimentName);
      scope.setExtra('experimentSlot', experimentSlot);
      scope.setTag('experimentName', experimentName);
      scope.setTag('experimentSlot', experimentSlot);
    });

    QLogger.initializeSentryInstance(Sentry);
  }

  next();
}

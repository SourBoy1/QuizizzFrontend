import CookieService from '~/services/CookieService';
import $featureFlags from '~/services/FeatureFlagsService';
import store from '~/store';

export default async function updateFeatureFlags(to, from, next) {
  await $featureFlags().updateFeatureFlags();
  const user = store.getters['root/user'] || {};
  const serverData = store.getters['root/serverData'] || {};
  $featureFlags().setUserAttributes({
    ...user.userStore,
    isSuper: user.isSuper || false,
    requestCountry: serverData.requestCountry || 'US',
    quizizz_uid: CookieService.get('quizizz_uid'),
    slot: CookieService.get('QUIZIZZ_EXP_SLOT') || '0',
    experiment: CookieService.get('QUIZIZZ_EXP_NAME') || 'main',
  });
  next();
}

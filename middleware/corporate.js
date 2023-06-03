import store from '~/store';
import Constants from '~/config/Constants';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import UserService from '~/services/UserService';

export default function corporate(to, from, next) {
  const user = new UserService(store.getters['root/user']);

  function isCorporateAdminOrFreeTrialAccount() {
    return user.userStore.organizationRole === Constants.OrganizationRole.ADMIN;
  }

  if (user.isCorporate) {
    if (
      to.path === '/forwork/dashboard'
      && isCorporateAdminOrFreeTrialAccount()
    ) {
      return null;
    }

    HotjarService.triggerEvent(HotjarEvents.HOTJAR_QFW_COLLAB_FLOW);
    window.location.href = '/admin';
    return null;
  }

  next();
}

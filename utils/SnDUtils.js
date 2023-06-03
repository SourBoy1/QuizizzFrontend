import Constants from '~/config/Constants';
import { eligibleSnDFeaturesCountries } from '~/config/Countries';
import Whitelist from '~/config/Whitelist';
import $store from '~/services/StoreService';
import UserService from '~/services/UserService';

const hasEligibleCountry = (user) => {
  if (import.meta.env.VITE_NODE_ENV === 'dev') {
    return true;
  }

  const country = $store()?.getters['root/serverData']?.requestCountry || user.country;

  return eligibleSnDFeaturesCountries.includes(country);
};

const hasActiveSnDSubscription = (user) => user?.hasActiveSnDPlan;

const isWhiteListedOrg = (user) => {
  if (!user.paidOrganization) {
    return false;
  }

  return Whitelist.SHOW_ADMIN_DASHBOARD_FOR_PAID_ORGS.includes(user.paidOrganization);
};

const getUser = (user) => {
  const storeUser = new UserService($store().getters['root/user'] ?? {});

  // If store exists
  if (storeUser.id) {
    return storeUser;
  }

  return user instanceof UserService ? user : new UserService(user);
};

const showSnDAdminFeatures = (userFromServer) => {
  const user = getUser(userFromServer);

  return user
    && user.isLoggedIn
    && user.paidOrganization
    && user.organizationRole === Constants.OrganizationRole.ADMIN
    && hasActiveSnDSubscription(user)
    && (hasEligibleCountry(user) || isWhiteListedOrg(user));
};

export default showSnDAdminFeatures;

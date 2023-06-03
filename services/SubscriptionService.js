import $store from './StoreService';
import UserService from './UserService';

/**
 *
 * @param {*} feat the feature/priviledge to be accessed
 * @param {*} comparator any comparator function if the priviledge is of type other than boolean
 * @returns boolean depending on if the user is allowed access for the feature
 */
export function hasFeatureAccess(feat, comparator) {
  if (!$store()) { return false; }

  const user = new UserService($store().state.root?.user);
  const { priviledges } = user;

  if (user.isCorporateTrialExpired) {
    return false;
  }

  if (comparator) {
    return comparator(priviledges[feat]);
  }

  if (priviledges[feat]) {
    return true;
  }

  return false;
}

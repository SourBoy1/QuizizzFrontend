import $store from '~/services/StoreService';
import featureFlags from '~/services/FeatureFlagsService';
import Constants from '~/config/Constants';
import UserService from '~/services/UserService';
import { getAccountType, isUserFromPaidOrg } from './UserUtils';

function shouldExposeSFUsingFeatureFlag() {
  return featureFlags().isEnabled(Constants.FeatureFlagsTypes.SHARED_FOLDER_ACCESS);
}

export function shouldExposeCoTeachingUsingFeatureFlag() {
  return featureFlags().isEnabled(Constants.FeatureFlagsTypes.SHOW_CO_TEACHING);
}

export function shouldExposeListMembersInPaidOrgFeatureFlag() {
  return featureFlags().isEnabled(Constants.FeatureFlagsTypes.LIST_PAID_ORG_MEMBERS);
}

export function shouldExcludeFromLibraryLimits() {
  return featureFlags().isEnabled(Constants.FeatureFlagsTypes.EXCLUDE_FROM_LIBRARY_LIMITS);
}

export function shouldExcludeFromSndChurnBanner() {
  return featureFlags().isEnabled(Constants.FeatureFlagsTypes.EXCLUDE_FROM_SND_CHURN_BANNER);
}

export const canAccessSharedFolders = () => {
  const user = $store().getters['root/user'];
  if (!user) {
    return false;
  }

  if (getAccountType(user) === Constants.AccountTypes.CORPORATE_INTRO) {
    return false;
  }

  if (shouldExposeSFUsingFeatureFlag()) {
    return true;
  }

  return false;
};

export const shouldShowTopContentCreator = () => featureFlags().isEnabled(Constants.FeatureFlagsTypes.INFLUENTIAL_TEACHER1) || featureFlags().isEnabled(Constants.FeatureFlagsTypes.INFLUENTIAL_TEACHER2) || featureFlags().isEnabled(Constants.FeatureFlagsTypes.INFLUENTIAL_TEACHER3);

export const shouldShowSharedFolderUpsells = () => {
  const user = new UserService($store().getters['root/user']);

  if (user.isCorporate) {
    return false;
  }

  return !user.isPartOfAnOrganization;
};

export const isCountryUS = () => {
  const serverData = $store().getters['root/serverData'];
  const isUSA = serverData?.requestCountry;

  return isUSA === 'US';
};

export const shouldHideCT = () => {
  if (!shouldExposeCoTeachingUsingFeatureFlag()) {
    return true;
  }

  const user = new UserService($store().getters['root/user']);

  return user.isCorporate;
};

export const shouldLockCT = () => {
  const user = new UserService($store().getters['root/user']);

  return ((user?.paidOrganizations ?? []).length) <= 0 && !shouldHideCT();
};

export const isTeamCreationFlowV2Enabled = () => {
  const user = new UserService($store().getters['root/user']);
  return !user.isCorporate && featureFlags().isEnabled(Constants.FeatureFlagsTypes.TEAM_CREATION_FLOW_V2);
};

export const isDistrictLibWidgetV2Enabled = () => featureFlags().getFeatureValue(Constants.FeatureFlagsTypes.DISTRICT_LIB_WIDGET_VARIANT) === 'v2';

export const showMathStandardsFilter = () => featureFlags().isEnabled(Constants.FeatureFlagsTypes.MATH_STANDARDS_FILTER);

export const isTeamCreationNudgeEnabled = () => {
  const user = $store().getters['root/user'];
  return isUserFromPaidOrg(user) && featureFlags().isEnabled(Constants.FeatureFlagsTypes.TEAM_CREATION_NUDGE);
};

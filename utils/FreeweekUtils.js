import featureFlags from '~/services/FeatureFlagsService';
import Constants from '../config/Constants';

export function isNotPremiumWeek() {
  return featureFlags().isDisabled(Constants.FeatureFlagsTypes.PREMIUM_QUESTION_WEEK);
}

export function isCreatedDuringPremiumWeek(createdDate) {
  // Check on creation date during premium week trial
  const startDate = new Date('2023/02/08 00:00:00');
  const endDate = new Date('2023/02/15 23:59:59');
  return createdDate > startDate && createdDate < endDate;
}

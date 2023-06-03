import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { isTimeUp } from '~/utils/TimeUtils';
import { SUPER_GIFTING_EXPIRY_DATE } from '~/config/Constants/Referral.constants';

dayjs.extend(duration);
export const isReferralPeriodExpired = () => isTimeUp(new Date(), SUPER_GIFTING_EXPIRY_DATE);
export const getReferralDaysLeft = () => {
  const start = dayjs(new Date());
  const end = dayjs(SUPER_GIFTING_EXPIRY_DATE);
  const diff = end.diff(start);
  const duration = dayjs.duration(diff);
  return duration.days();
};

export const getReferralDaysLeftText = () => {
  const referralDaysLeft = getReferralDaysLeft();
  if (referralDaysLeft >= 1) { return `${referralDaysLeft} DAYS LEFT`; }
  if (referralDaysLeft >= 0) { return 'EXPIRING TODAY'; }
  return '';
};

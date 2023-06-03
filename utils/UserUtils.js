import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants';

export function isCorporate({ occupation }) {
  return (
    !isEmpty(occupation)
    && (
      occupation === Constants.Occupations.CORPORATE
      || occupation === Constants.Occupations.CORPORATE_TEACHER
      || occupation === Constants.Occupations.CORPORATE_LEARNER
    )
  );
}

export function getUserName(user) {
  if (!user) {
    return '';
  }

  const {
    title,
    firstName,
    lastName,
    local: {
      email,
      userName,
    } = {},
  } = user;

  if (!firstName && !lastName) {
    return (email || userName || '').trim();
  }
  return `${title?.concat(' ') ?? ''}${firstName?.concat(' ') ?? ''}${lastName ?? ''}`.trim();
}

export function computeUserAccessLevel(user) {
  // TODO
  // figure out the user's access level
  // Possible values -
  // 1. free tier
  // 2. paid-teacher tier
  // 3. paid-district tier

  if (!user) {
    return Constants.UserTypes.UNREGISTERED;
  }

  if (user.paidOrganization) {
    return Constants.UserTypes.SND;
  } if (user.isSuper) {
    return Constants.UserTypes.PAID;
  }
  return Constants.UserTypes.BASIC;
}

export function getAccountType(user) {
  const planName = user.plan;

  if (!user.id) {
    return Constants.AccountTypes.ANONYMOUS;
  }

  if (user.isPartOfAnOrganization && planName !== '') {
    return Constants.AccountTypes.SCHOOL_AND_DISTRICT;
  }

  if (!planName) {
    if (user.isCorporate) {
      return Constants.AccountTypes.CORPORATE_INTRO;
    }

    return Constants.AccountTypes.BASIC;
  }

  if (user.isSuper) {
    return Constants.AccountTypes.SUPER;
  }

  // If none of the above, it must be a corporate account
  switch (planName) {
    case 'Intro':
      return Constants.AccountTypes.CORPORATE_INTRO;
    case 'Standard':
      return Constants.AccountTypes.CORPORATE_STANDARD;
    case 'Standard (Non Profit)':
      return Constants.AccountTypes.CORPORATE_STANDARD_NONPROFIT;
    case 'Premier':
      return Constants.AccountTypes.CORPORATE_PREMIER;
    case 'Starter':
      return Constants.AccountTypes.CORPORATE_STARTER;
    default:
      return Constants.AccountTypes.SUPER;
  }
}

export function getOrgIdsFromUser(user) {
  const paidOrgIds = (user.paidOrganizations ?? []).map((org) => org.organizationId);
  const orgIds = (user.organizationIds ?? []).map((orgId) => orgId);
  return Array.from(new Set([...paidOrgIds, ...orgIds]));
}

export function isUserFromPaidOrg(user) {
  return computeUserAccessLevel(user) === Constants.UserTypes.SND;
}

export function getUsersPaidOrgIds(user) {
  if (!isUserFromPaidOrg(user)) {
    return [];
  }
  if (user.paidOrganizations?.length) {
    return user.paidOrganizations?.map((org) => org.id) ?? [];
  }
  if (user.paidOrganization) { return [user.paidOrganization]; }
  return [];
}

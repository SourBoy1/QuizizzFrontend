import Whitelist from '~/config/Whitelist';

export function isUserInWhitelistedPaidOrganization(user) {
  return Whitelist.SHOW_SND_FEATURES_FOR_PAID_ORGS.includes(user.paidOrganization);
}

export function isUserInWhitelistedCountry(country) {
  return [
    'US',
  ].includes(country);
}

export function isNonProdEnv() {
  return ['dev.quizizz.com', 'localhost'].includes(window.location.hostname);
}

export const pilotOrgs = [
  '632b5c7eb99649d59f40f610', // Ankeny Community School District
];

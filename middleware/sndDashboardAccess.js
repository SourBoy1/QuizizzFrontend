import get from 'lodash/get';
import store from '~/store/index';
import Constants from '~/config/Constants';
import showSnDAdminFeatures from '~/utils/SnDUtils';

function getPaidOrganization(user = {}) {
  const paidOrg = get(user, 'paidOrganizations', [])
    .find((paidOrganization) => paidOrganization.id === user.paidOrganization);
  return paidOrg || {};
}

// Check if user is a PaidOrg admin
function allowAccess(user, serverData) {
  return showSnDAdminFeatures(user);
}

export default function sndDashboardAccess(to, from, next) {
  const user = store.getters['root/user'];
  const serverData = store.getters['root/serverData'];

  if (allowAccess(user, serverData)) {
    const paidOrg = getPaidOrganization(user);

    switch (get(paidOrg, 'organizationType', '')) {
      case Constants.OrganizationTypes.DISTRICT:
        return;
      case Constants.OrganizationTypes.SCHOOL:
      case Constants.OrganizationTypes.DEPARTMENT:
        {
          const orgId = paidOrg.organizationType === 'department'
            ? paidOrg.buyerOrgId
            : paidOrg.organizationId;

          if (to.name === Constants.PageNames.SND_DASHBOARD) {
            window.location.href = `/snd/dashboard/school/${orgId}`;
            return;
          }
          // incase of multi-org switch, check if orgId is correct
          if (
            to.name.startsWith(Constants.PageNames.SND_SCHOOL_DASHBOARD)
            && to.params?.schoolId !== orgId
          ) {
            window.location.href = `/snd/dashboard/school/${orgId}`;
            return;
          }
        }
        break;
      default:
    }
  } else {
    window.location.href = '/admin';
    return;
  }

  next();
}

import UserService from '~/services/UserService';
import * as SLUtils from '~/utils/SharedLibrary';

export const state = () => ({});

export const getters = {
  enableSharedLibrary: (_state, _getters, rootState, rootGetters) => {
    const user = new UserService(rootState.root.user);
    const validByOrgWhitelisting = SLUtils.isUserInWhitelistedPaidOrganization(user);

    const serverData = rootGetters['root/serverData'];
    const { host } = rootGetters['root/deviceInfo'] ?? {};
    const validByCountry = SLUtils.isUserInWhitelistedCountry(serverData?.requestCountry);

    const validByHostname = SLUtils.isNonProdEnv(host);

    return (validByOrgWhitelisting || validByCountry || validByHostname);
  },

  hasSharedLibraryPriviledges: (_state, _getters, rootState) => {
    const user = new UserService(rootState.root.user);
    return !!user?.priviledges?.sharedLibrary;
  },
  pilotOrgs() {
    return SLUtils.pilotOrgs || [];
  },
};

export const mutations = () => ({});

export const actions = () => ({});

const sharedLibrary = {
  state,
  getters,
  mutations,
  actions,
};

export default sharedLibrary;

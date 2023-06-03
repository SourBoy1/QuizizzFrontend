import MSTeamsService from '~/services/MSTeams';
import { getters } from '~/store/index';

export default (to, from, next) => {
  // let newSessionCreated = false;
  let currentTeamsSession = MSTeamsService.getSession();
  const createNewTeamsSession = to.query['ms-teams'];

  if (!currentTeamsSession && createNewTeamsSession) {
    currentTeamsSession = MSTeamsService.createSession();
  }

  if (currentTeamsSession) {
    if (to.query['channel-tab']) {
      window.location.href = '/ms-teams/setup';
      return;
    }

    if (to.route.name === 'admin' && !getters['root/user']?.id) {
      window.location.href = '/login';
    }
  }

  next();
};

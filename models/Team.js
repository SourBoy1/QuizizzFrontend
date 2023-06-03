import defaultsDeep from 'lodash/defaultsDeep';

export default function Teams(values) {
  return defaultsDeep(values, {
    teams: [],
    teamInviteLinksById: {},
  });
}

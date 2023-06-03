import defaultsDeep from 'lodash/defaultsDeep';

export default function TeamMemberModel(values) {
  return defaultsDeep(values, {
    _id: '',
    userId: '',
    teamId: '',
    role: '',
    deleted: false,
  });
}

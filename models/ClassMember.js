import defaultsDeep from 'lodash/defaultsDeep';

export default function ClassMember(values) {
  return defaultsDeep(values, {
    userId: '',
    memberId: '',
    firstName: '',
    lastName: '',
    deactivated: false,
    deleted: false,
    verified: false,
    parent: {
      notify: false,
      email: '',
      verified: 0,
    },
    local: {
      email: '',
      username: '',
      casedUsername: '',
    },
    google: '',
    canvas: '',
    schoology: '',
    isUnderAge: false,
  });
}

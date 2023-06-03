import defaultsDeep from 'lodash/defaultsDeep';

export default function CreatedBy(values) {
  return defaultsDeep(values, {
    local: {
      casedUsername: '',
      username: '',
    },
    google: {
      createdAt: '',
      image: '',
      profileId: '',
      displayName: '',
      email: '',
      firstName: '',
      lastName: '',
    },
    student: null,
    deactivated: false,
    deleted: false,
    _id: '',
    media: '',
    firstName: '',
    lastName: '',
    occupation: '',
    country: '',
    title: '',
    id: '',
  });
}

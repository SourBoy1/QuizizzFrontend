import defaultsDeep from 'lodash/defaultsDeep';
import has from 'lodash/has';
import map from 'lodash/map';

import ClassMember from './ClassMember';

import Meta from './Meta';

export default function ClassModel(values) {
  const mapMember = (value) => ClassMember(value);

  const valuesToDefault = {
    ...values,
    members: has(values, 'members') ? map(values.members, mapMember) : [],
  };

  return defaultsDeep(valuesToDefault, {
    _id: '',
    teacherId: '',
    name: '',
    color: '',
    courses: [],
    google: null,
    isGoogle: false,
    meta: Meta(values?.meta),
    deleted: false,
    requireParentEmail: false,
    stats: {
      totalGames: null,
      totalCorrect: null,
      totalQuestionsAnswered: null,
    },
    link: {
      token: '',
      expiresOn: '',
      fullUrl: '',
      joinCode: '',
    },
    members: [],
    totalMembers: 0,
    createdAt: '',
    users: null,
    lmsType: '',
  });
}

import defaultsDeep from 'lodash/defaultsDeep';

import TeamMemberModel from './TeamMemberModel';

export default function TeamModel(values) {
  const members = values.members?.map((member) => TeamMemberModel(member));

  return defaultsDeep(values, {
    _id: '',
    name: '',
    contentMetrics: {
      sharedQuizzes: 0,
    },
    createdBy: '',
    deleted: false,
    description: '',
    media: '',
    owner: '',
    members: members ?? [],
  });
}

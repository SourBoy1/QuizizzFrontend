import defaultsDeep from 'lodash/defaultsDeep';

export default function GroupsInfo(values) {
  return defaultsDeep(values, {
    mode: null,
    create: {},
    gcl: [],
    assigned: [],
    hasGCL: false,
    assignedTo: {},
    data: {
      title: null,
      description: null,
    },
    grading: {
      isGraded: true,
      maxPoints: 0,
    },
  });
}

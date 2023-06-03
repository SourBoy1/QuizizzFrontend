import has from 'lodash/has';
import map from 'lodash/map';
import defaultsDeep from 'lodash/defaultsDeep';

import ClassModel from './ClassModel';

export default function Classes(values) {
  const mapClass = (value) => ClassModel(value);

  const valuesToDefault = {
    ...values,
    groups: has(values, 'groups') ? map(values.groups, mapClass) : [],
  };

  const archivedCount = values?.groups?.filter((group) => group.archived).length ?? 0;

  return defaultsDeep(valuesToDefault, {
    archived: false,
    archivedCount,
    courses: {},
    groups: [],
  });
}

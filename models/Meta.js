import defaultsDeep from 'lodash/defaultsDeep';

export default function Meta(values) {
  return defaultsDeep(values, {
    slot: '',
    experiment: '',
  });
}

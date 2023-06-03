import defaultsDeep from 'lodash/defaultsDeep';

export default function Settings(values) {
  return defaultsDeep(values, {
    hasCorrectAnswer: true,
    fibDataType: 'string',
    canSubmitCustomResponse: false,
    doesOptionHaveMultipleTargets: false,
  });
}

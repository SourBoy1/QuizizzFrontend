import defaultsDeep from 'lodash/defaultsDeep';

import Constants from '~/config/Constants.js';

export default function FontColor(values) {
  return defaultsDeep({ ...values }, {
    text: Constants.DefaultSlideTheme.TEXT_COLOR,
  });
}

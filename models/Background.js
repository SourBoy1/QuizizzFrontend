import defaultsDeep from 'lodash/defaultsDeep';

import Constants from '~/config/Constants.js';

export default function Background(values) {
  return defaultsDeep({ ...values }, {
    color: Constants.DefaultSlideTheme.BGCOLOR,
    image: '',
    video: '',
  });
}

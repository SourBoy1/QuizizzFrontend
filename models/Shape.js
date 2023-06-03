import defaultsDeep from 'lodash/defaultsDeep';

import Constants from '~/config/Constants';

export default function Shape(values) {
  return defaultsDeep({
    largeShapeColor: Constants.DefaultSlideTheme.LARGE_SHAPE_COLOR,
    smallShapeColor: Constants.DefaultSlideTheme.SMALL_SHAPE_COLOR,
  });
}

import defaultsDeep from 'lodash/defaultsDeep';

import Constants from '~/config/Constants';
import FontColor from './FontColor';
import Background from './Background';
import Shape from './Shape';

export default function Theme(values) {
  return defaultsDeep(
    {
      titleFontFamily: Constants.DefaultSlideTheme.FONT_FAMILY,
      fontFamily: Constants.DefaultSlideTheme.FONT_FAMILY,
      fontColor: FontColor(values?.fontColor),
      background: Background(values?.background),
      shape: Shape(values?.shape),
    },
  );
}

import defaultsDeep from 'lodash/defaultsDeep';

export default function SlideElement(values) {
  return defaultsDeep(values, {
    _id: '',
    type: '',
    placeholder: '',
    placeholderSize: 48,
    transform: {
      position: {
        x: 0,
        y: 0,
      },
      size: {
        width: 0,
        height: 0,
      },
      rotation: 0,
    },
    zIndex: 0,
    data: {
      html: '',
      media: {
        type: '',
        url: '',
        meta: {},
      },
    },
    isBackground: false,
    isAutomatic: true,
  });
}

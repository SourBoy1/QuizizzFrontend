import defaultsDeep from 'lodash/defaultsDeep';

export default function Media(values) {
  return defaultsDeep(values, {
    url: '',
    type: '',
    meta: {
      width: 0,
      height: 0,
      text: '',
      bgColor: '',
      layout: '',
      videoId: '',
      start: 0,
      end: 0,
      duration: 0,
      kind: '',
      embeddable: true,
      title: '',
    },
  });
}

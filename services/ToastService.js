import isNumber from 'lodash/isNumber';
import find from 'lodash/find';

import $store from './StoreService.js';

export default class ToastService {
  static add(options) {
    const timeToastWillBeVisibleFor = isNumber(options.time) ? options.time : 3000;

    const toasts = $store().getters['root/toasts'];

    if (!find(toasts, (item) => item.title === options.title)) {
      $store().dispatch('root/pushToast', options);

      setTimeout(() => {
        $store().dispatch('root/shiftToast');
      }, timeToastWillBeVisibleFor);
    }
  }
}

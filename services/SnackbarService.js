import find from 'lodash/find';

import $store from './StoreService.js';

export default class SnackbarService {
  static add(options) {
    const snackbars = $store().getters['root/snackbars'];
    if (!find(snackbars, (item) => item._id === options._id)) {
      $store().dispatch('root/pushSnackbar', options);
    }
  }

  static remove(_id) {
    const snackbars = $store().getters['root/snackbars'];
    if (snackbars.find((i) => i._id === _id)) {
      $store().dispatch('root/removeSnackbar', _id);
    }
  }

  static update(options) {
    const snackbars = $store().getters['root/snackbars'];
    if (snackbars.find((i) => i._id === options._id)) {
      $store().dispatch('root/updateSnackbar', options);
    }
  }
}

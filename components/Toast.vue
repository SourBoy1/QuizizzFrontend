<template>
  <div
    :class="['shadow-lg px-4 py-3 mx-4 my-3 inline-flex items-center rounded-lg w-max transition-all duration-300 z-on-overlay', !isDesktop ? 'max-w-80' : '', classes]"
  >
    <FA
      :icon="iconToUse"
      :size="12"
      :class="iconClasses"
    />
    <div :class="['ml-4', hasAction ? 'text-xs' : 'text-sm']">
      {{ title }}
    </div>
    <Button
      v-if="hasAction"
      class="ml-3"
      :title="$i18n(action)"
      size="sm"
      type="transparent"
      @click="actionCB"
    />
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import { mapGetters } from 'vuex';

import $constants from '~/config/Constants.js';
import { enumProps } from '~/config/Atoms';

export default {
  props: {
    icon: {
      type: String,
      default: '',
    },
    iconClasses: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: $constants.ToastTypes.DEFAULT,
      validator: (val) => enumProps.Toast.type.includes(val),
    },

    title: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      default: '',
    },
    actionCB: {
      type: Function,
      default: () => {},
    },
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    classes() {
      switch (this.type) {
        case $constants.ToastTypes.ERROR:
          return 'bg-red-dark text-light-3 ';

        case $constants.ToastTypes.SUCCESS:
          return 'bg-green-dark text-light-3 ';

        case $constants.ToastTypes.DEFAULT:
        default:
          return 'bg-dark-2 text-light-3 ';
      }
    },

    actionTitleClasses() {
      switch (this.type) {
        case $constants.ToastTypes.ERROR:
        case $constants.ToastTypes.SUCCESS:
          return 'text-light-3 ';

        case $constants.ToastTypes.DEFAULT:
        default:
          return 'text-lilac-light ';
      }
    },

    hasAction() {
      return !!this.action;
    },

    iconToUse() {
      if (!isEmpty(this.icon)) {
        return this.icon;
      }

      switch (this.type) {
        case $constants.ToastTypes.SUCCESS:
          return 'fas fa-check-circle';

        case $constants.ToastTypes.ERROR:
          return 'fas fa-times-circle';

        case $constants.ToastTypes.DEFAULT:
        default:
          return 'fas fa-exclamation-circle';
      }
    },
  },
};
</script>

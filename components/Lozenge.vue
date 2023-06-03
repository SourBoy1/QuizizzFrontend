<template>
  <div
    translate="no"
    :class="['lozenge items-center', { 'inline-flex': inline, flex: !inline, 'w-fit': !inline }, classes, containerClasses]"
  >
    <span
      v-if="!isIconComponentEmpty"
      :class="['mr-2', isLoading ? 'loading-state' : '']"
    >
      <component
        :is="iconComponent"
        :class="[isLoading ? 'opacity-0' : '']"
      />
    </span>

    <FA
      v-if="!!icon"
      :class="{
        'loading-state': isLoading,
        'mr-1': !!title,
        [iconClasses]: !!iconClasses,
      }"
      :icon="icon"
      :size="iconSize"
    />
    <span :class="[isLoading ? 'loading-state leading-3' : '']">{{ title }}</span>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

import { enumProps } from '~/config/Atoms';

export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'md',
      validator: (val) => enumProps.Lozenge.size.includes(val),
    },

    inline: {
      type: Boolean,
      default: true,
    },

    rounded: {
      type: Boolean,
      default: false,
    },

    isLoading: {
      type: Boolean,
      default: false,
    },

    icon: {
      type: String,
      default: '',
    },
    iconComponent: {
      type: Object,
      default: () => { },
    },
    iconClasses: {
      type: String,
      default: null,
    },
    containerClasses: {
      type: String,
      default: '',
    },

    notRounded: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    isIconComponentEmpty() {
      return isEmpty(this.iconComponent);
    },

    classes() {
      let cls = '';
      switch (this.size) {
        case 'md':
          cls += 'text-sm font-semibold ';
          break;
        case 'sm':
          cls += 'text-xs font-semibold py-0.5 ';
          break;
        case 'xs':
          cls += 'text-tn font-semibold ';
          break;

        default:
      }

      if (this.rounded) {
        cls += 'rounded-full ';

        switch (this.size) {
          case 'md':
            cls += 'px-2.5 ';
            break;
          case 'sm':
            cls += 'px-2 ';
            break;
          case 'xs':
            cls += 'px-1.5 ';
            break;

          default:
        }
      } else {
        if (!this.notRounded) {
          cls += 'rounded ';
        }
        switch (this.size) {
          case 'md':
            cls += 'px-2 ';
            break;
          case 'sm':
            cls += 'px-1.5 ';
            break;
          case 'xs':
            cls += 'px-1 ';
            break;

          default:
        }
      }

      if (this.icon && this.icon.includes('fa-upload')) {
        cls += 'text-dark-4';
      } else {
        cls += '';
      }

      return cls;
    },

    iconSize() {
      switch (this.size) {
        case 'md':
          return 12;
        case 'sm':
          return 11;
        case 'xs':
          return 9;
        default:
          return 12;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.loading-state {
  color: transparent;
  border-radius: 4px;
  background: rgba(9, 9, 9, 0.1);
}
</style>

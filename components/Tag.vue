<template>
  <div
    :class="['tag inline-flex items-center justify-center rounded', containerClasses]"
    :aria-disabled="disabled"
    @click="$emit('click')"
  >
    <span :class="titleClasses">{{ title }}</span>

    <button
      v-if="!hideDelete"
      :aria-label="$i18n(`Delete ${title} tag`)"
      :class="['flex items-center justify-center ', btnClasses]"
      @click="onDeleteBtnClick"
    >
      <FA
        icon="far fa-times"
        :size="iconSize"
      />
    </button>
  </div>
</template>

<script>

import { enumProps } from '~/config/Atoms';

export default {
  props: {
    title: {
      type: String,
      default: 'Tag value',
    },
    size: {
      type: String,
      default: 'md',
    },

    type: {
      type: String,
      default: 'default',
      validator: (val) => enumProps.Tag.type.includes(val),
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    hideDelete: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click', 'delete'],

  computed: {
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

    titleClasses() {
      let cls = 'mr-1 ';

      switch (this.size) {
        case 'md':
          cls += 'text-sm font-semibold ';
          break;
        case 'sm':
          cls += 'text-xs font-semibold ';
          break;
        case 'xs':
          cls += 'text-tn font-semibold ';
          break;

        default:
      }

      return cls;
    },

    containerClasses() {
      let cls = '';

      switch (this.size) {
        case 'md':
          cls += 'pl-3 pr-1 py-1 ';
          break;
        case 'sm':
          cls += 'pl-2 pr-1 py-1 ';
          break;
        case 'xs':
          cls += 'pl-2 pr-0.5 py-0.5 ';
          break;

        default:
      }

      if (this.disabled) {
        cls += 'bg-light-1 text-dark-5 pointer-events-none cursor-not-allowed';

        return cls;
      }

      switch (this.type) {
        case 'primary':
          cls += 'bg-lilac text-light-3 ';
          break;
        case 'secondary':
          cls += 'bg-lilac-faded text-lilac border border-solid border-lilac ';
          break;
        case 'default':
          cls += 'bg-light-1 text-dark-2 border border-solid border-dark-10% ';
          break;
        case 'danger':
          cls += 'bg-red-10% text-red-light border border-solid border-red-light ';
          break;
        case 'green':
          cls += 'bg-green text-light';
          break;

        default:
      }

      return cls;
    },

    btnClasses() {
      let cls = 'rounded-sm ';

      switch (this.size) {
        case 'md':
          cls += 'w-6 h-6 ';
          break;
        case 'sm':
          cls += 'w-4 h-4 ';
          break;
        case 'xs':
          cls += 'w-4 h-4 ';
          break;

        default:
      }

      switch (this.type) {
        case 'primary':
          cls += 'hover:bg-light-5% ';
          break;
        case 'secondary':
          cls += 'hover:bg-lilac-10% ';
          break;
        case 'danger':
          cls += 'hover:bg-red-10% ';
          break;

        case 'green':
        case 'default':
          cls += 'hover:bg-dark-5% ';
          break;

        default:
      }

      return cls;
    },
  },

  methods: {
    onDeleteBtnClick(event) {
      this.$emit('delete', event);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

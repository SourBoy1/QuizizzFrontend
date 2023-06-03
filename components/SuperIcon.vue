<template>
  <span
    v-if="!shouldHideIcon"
    :class="[
      'inline-flex align-center justify-center rounded relative',
      classes,
    ]"
  >
    <FA
      icon="fas fa-bolt-lightning"
      :size="size"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    />
  </span>
</template>

<script>
import { enumProps } from '~/config/Atoms';

export default {
  props: {
    size: {
      type: Number,
      default: 12,
      validator: (val) => enumProps.SuperIcon.size.includes(val),
    },

    color: {
      type: String,
      default: 'super',
      validator: (val) => enumProps.SuperIcon.color.includes(val),
    },

    hasBackground: {
      type: Boolean,
      default: true,
    },

    hasBorder: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    isCorporate() {
      return this.$user.isCorporate;
    },

    isSnDUser() {
      return this.$user.isPartOfAnOrganization;
    },

    shouldHideIcon() {
      return this.isCorporate || this.isSnDUser;
    },

    classes() {
      let classes = this.hasBorder ? 'border border-solid border-super-light ' : '';

      switch (this.size) {
        case 12:
          classes += 'w-6 h-6 ';
          break;
        case 11:
          classes += 'w-5 h-5 ';
          break;
        case 9:
          classes += 'w-4 h-4 ';
          break;
        case 7:
          classes += 'w-3 h-3 rounded-sm ';
          break;

        default:
      }

      switch (this.color) {
        case 'super':
          if (this.hasBackground) {
            classes += 'bg-super-faded ';
          }
          classes += 'text-super ';
          break;
        case 'white':
          if (this.hasBackground) {
            classes += 'bg-super ';
          }
          classes += 'text-light-3 ';
          break;

        default:
      }

      return classes;
    },
  },
};
</script>

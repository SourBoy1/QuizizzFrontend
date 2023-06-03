<template>
  <v-dropdown
    :placement="placement"
    :triggers="popoverTriggers"
    :delay="delay"
    :shown="open"
    :autoHide="autoHide"
    :handleResize="handleResize"
    :distance="offset"
    :disabled="disabled"
    :class="popoverClasses"
    :theme="`${type}-popper`"
  >
    <slot />

    <template #popper>
      <slot name="popover-content" />
    </template>
  </v-dropdown>
</template>

<script>
const PopoverTypes = ['info', 'warn', 'danger'];

export default {

  props: {
    type: {
      type: String,
      default: 'info',
      validator: (val) => PopoverTypes.includes(val),
    },

    /**
     * Either specify the color or the color will be picked depending on the `type`
     *  info - border-lilac
     *  warn - border-yellow
     *  danger - border-red
     */
    topBorderColor: {
      type: String,
      default: '',
    },

    /**
     * Followiing are props for the Popover component.
     * For more refer - https://www.npmjs.com/package/v-tooltip#popover-component-reference
     */
    placement: {
      type: String,
      default: 'auto',
      validator: (val) => (['auto', 'auto-start', 'auto-end', 'top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end']).includes(val),
    },

    trigger: {
      type: String,
      default: 'click',
      validator: (val) => (['hover', 'click', 'focus', 'manual']).includes(val),
    },

    delay: {
      type: [Number, Object],
      default: () => ({ show: 100, hide: 100 }),
    },

    offset: {
      type: Number,
      default: 4,
    },

    open: {
      type: Boolean,
      default: false,
    },
    autoHide: {
      type: Boolean,
      default: true,
    },
    handleResize: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    popoverClasses() {
      const classes = [`p-type-${this.type}`];

      return classes;
    },

    popoverTriggers() {
      if (this.trigger === 'manual') {
        return [];
      }

      return [this.trigger];
    },
  },
};
</script>

<style lang="scss">
</style>

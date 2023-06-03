<template>
  <button
    class="color-tile relative flex justify-center items-center"
    :class="[`hover-${!isStatic && hoverEffect}`, { 'border-2 border-lilac': checked }, { 'pointer-events-none': isStatic }]"
    :style="styles"
    :disabled="isStatic"
    @click="$emit('onColorPick')"
    @mousedown.prevent.stop=""
  >
    <FA
      v-if="checked"
      class="checked-icon absolute text-light-3"
      icon="fas fa-check"
      :size="12"
    />
  </button>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: '',
    },
    checked: {
      type: Boolean,
      default: false,
    },

    width: {
      type: Number,
      default: -1, // -1 means the box will grow to take available space
    },

    height: {
      type: Number,
      default: 24,
    },

    hoverEffect: {
      type: String,
      default: 'scale',
      validator: (val) => (['scale', 'border']).includes(val),
    },

    isStatic: {
      type: Boolean,
      default: false, // if prop received is true, then color tile has no behavior, hover or click
    },
  },
  emits: ['onColorPick'],

  computed: {
    styles() {
      const styles = {
        backgroundColor: this.color,
      };

      if (this.width >= 0) {
        styles.width = `${this.width}px`;
      }

      if (this.height >= 0) {
        styles.height = `${this.height}px`;
      }

      return styles;
    },
  },
};
</script>

<style lang="scss" scoped>
.color-tile{
  &.hover-scale:hover {
      transform: scale(1.25);
    }
}

.color-tile.hover-border {
  &:hover {
    border: 2px solid theme('borderColor.dark.20%');
  }
}

/* For some reason, tailwind's 'hover:' doesn't work in the template above */
.color-tile:hover {
  z-index: 10;
}
.color-tile:focus {
  z-index: 10;
}

.checked-icon {
  text-shadow: 0 0 2px theme('colors.dark.2');
}
</style>

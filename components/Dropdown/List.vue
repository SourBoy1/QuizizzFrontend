<template>
  <div
    ref="listbox"
    v-auto-position
    :aria-labelledby="labelId"
    :tabindex="-1"
    role="listbox"
    :style="dropdownStyles"
    :class="[
      `list bg-light-3 h-fit shadow-soft-high transform rounded transition-transform z-on-overlay`,
      isDesktop ? 'mt-2' : 'mt-0.5',
      open ? 'scale-y-100' : 'scale-y-0',
      horizontalAlignment === 'right' ? 'right-0' : 'left-0',
      listWidth,
      openDirectionClasses,
      dropDownContainerClasses,
    ]"
    @blur="closeDropdown"
  >
    <slot :closeDropdown="closeDropdown" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    targetRef: {
      type: String,
      default: '',
    },

    open: {
      type: Boolean,
      default: false,
    },

    listWidth: {
      type: String,
      default: 'w-full',
    },

    openDirection: {
      type: String,
      default: 'bottom',
    },

    horizontalAlignment: {
      type: String,
      default: 'left',
      validate: (value) => ['left', 'right'].includes(value),
    },

    dropDownContainerClasses: {
      type: String,
      default: '',
    },

    labelId: {
      type: String,
      default: '',
    },

    autoPosition: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],

  data() {
    return {
      dropdownStyles: {
        position: 'absolute',
      },
    };
  },

  computed: {

    ...mapGetters('root', ['isDesktop']),

    openDirectionClasses() {
      if (this.autoPosition) {
        return this.openDirection === 'top' ? 'origin-bottom' : 'origin-top';
      }

      return this.openDirection === 'top' ? 'bottom-full mb-1 origin-bottom' : 'top-full origin-top';
    },
  },

  mounted() {
    if (this.autoPosition) {
      this.autoPositionDropdown();
    }

    document.addEventListener('scroll', this.triggerAutoPosition);
  },

  beforeUnmount() {
    document.removeEventListener('scroll', this.triggerAutoPosition);
  },

  methods: {
    triggerAutoPosition() {
      if (this.autoPosition) {
        this.autoPositionDropdown();
      }
    },

    autoPositionDropdown() {
      const target = this.$parent.$refs[this.targetRef]?.getBoundingClientRect();

      if (!target) {
        return;
      }

      const listbox = this.$refs.listbox?.getBoundingClientRect();

      let direction = {
        top: `${target.y + target.height}px`,
      };

      if (this.openDirection === 'top') {
        direction = {
          bottom: `${window.innerHeight - target.y}px`,
        };
      }

      let left = target.x;

      // * handling collision with screen
      if (listbox) {
        if (left + listbox.width > window.innerWidth) {
          left = left + listbox.width - window.innerWidth;
        }
      }

      this.dropdownStyles = {
        position: 'fixed',
        ...direction,
        left: `${left}px`,
        zIndex: 10000,
      };

      if (this.listWidth === 'w-full') {
        this.dropdownStyles.width = `${target.width}px`;
      }
    },

    closeDropdown() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

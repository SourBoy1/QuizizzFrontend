<template>
  <div
    ref="dropdownContainer"
    class="field relative"
    @keyup.esc="close"
  >
    <div
      :id="labelId"
      class="chromium-scroll-fix-sr-only label sr-only"
    >
      {{ `${ariaLabel} ${titleIfItemSelected}` }}
    </div>

    <div
      v-click-outside="() => close(true)"
      class="dropdown flex relative rounded"
      @keyup.esc="close"
    >
      <button
        v-if="shouldShowToggleButton"
        ref="dropdownBtn"
        v-tooltip="tooltipOptions"
        type="button"
        aria-haspopup="listbox"
        :disabled="dropdownDisabled || dropdownButtonDisabled"
        :aria-labelledby="labelId + ' ' + buttonId"
        :aria-expanded="open"
        :class="[
          classes,
          'w-full flex rounded font-semibold items-center whitespace-nowrap',
        ]"
        @mousedown="(ev) => { ev.preventDefault() }"
        @click.stop="toggleOpen"
      >
        <template v-if="!loading">
          <component
            :is="iconComponent"
            v-if="!isIconComponentEmpty"
            class="mr-2"
          />
          <span
            v-if="!iconOnly"
            :class="titleStyles"
          >
            {{ title }}
          </span>
          <div :class="['w-4 h-4 items-center justify-center flex relative', iconClasses]">
            <div
              v-if="showNumberOfSelectedItems && noOfItemsSelected > 0"
              class="absolute right-7 px-2 text-lilac bg-lilac-faded rounded"
            >
              {{ noOfItemsSelected }}
            </div>
            <FA
              v-if="iconOnly"
              :icon="icon"
              :size="iconSize"
              aria-hidden="true"
            />
            <FA
              v-else
              :icon="open ? 'fas fa-caret-up' : 'fas fa-caret-down'"
              :size="iconSize"
              aria-hidden="true"
            />
          </div>
        </template>
        <span
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center w-4 h-4 m-auto loading-icon animate-spin"
        >
          <FA
            :icon="`far fa-sync`"
            :size="iconSize"
          />
        </span>
      </button>

      <DropdownList
        v-if="open"
        v-bind="dropdownListProps"
        @close="close"
      >
        <slot :closeDropdown="close" />
      </DropdownList>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

import { getUUID } from '~/services/UIDService';

export default {
  props: {
    // gets the position of the parent and attached to it via fixed positioning to avoid content being hidden in overflow
    autoPosition: {
      type: Boolean,
      default: false,
    },

    iconComponent: {
      type: Object,
      default: () => ({}),
    },

    dropdownButtonDisabled: {
      type: Boolean,
      default: false,
    },

    tooltip: {
      type: Object,
      default: () => ({}),
    },

    dropdownDisabled: {
      type: Boolean,
      default: false,
    },

    listWidth: {
      type: String,
      default: 'w-full',
    },

    size: {
      type: String,
      default: 'md',
      validator: (val) => (['xs', 'sm', 'md', 'lg']).includes(val),
    },

    icon: {
      type: String,
      default: '',
    },

    type: {
      type: String,
      default: 'default',
      validator: (val) => (['default', 'toolbar', 'dark', 'white', 'custom']).includes(val),
    },

    customClasses: {
      type: String,
      default: '',
    },

    titleStyles: {
      type: String,
      default: '',
    },

    // This is what is shown on the main dropdown button. The title can be different from the selectedValue
    title: {
      type: String,
      default: 'Dropdown',
    },

    ariaLabel: {
      type: String,
      default: 'Dropdown',
    },

    // This is the selected item from the dropdown which will be needed to be read byt the screen reader. We cannot use title here
    // as the title can be different from the selectedValue
    selectedItem: {
      type: String,
      default: '',
    },

    openDirection: {
      type: String,
      default: 'bottom',
    },

    horizontalAlignment: {
      type: String,
      default: 'left',
    },

    shouldShowToggleButton: {
      type: Boolean,
      default: true,
    },

    dropDownContainerClasses: {
      type: String,
      default: '',
    },

    customCaretDownIconSize: {
      type: Number,
      default: 0,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    centerAligned: {
      type: Boolean,
      default: false,
    },

    lock: {
      type: Boolean,
      default: false,
    },

    iconOnly: {
      type: Boolean,
      default: false,
    },

    iconWithSize: {
      type: String,
      default: '',
    },

    disableCloseOnClickOutside: {
      type: Boolean,
      default: false,
    },

    customIconClasses: {
      type: String,
      default: '',
    },

    showNumberOfSelectedItems: {
      type: Boolean,
      default: false,
    },

    noOfItemsSelected: {
      type: Number,
      default: 0,
    },
  },
  emits: ['click', 'lockedClick', 'open', 'close'],

  data() {
    return {
      open: false,
      optionsIDPrefix: this.getUUID(),
      labelId: this.getUUID(),
      buttonId: this.getUUID(),
      dropdownPosition: { position: 'absolute' },
    };
  },

  computed: {
    titleIfItemSelected() {
      const selectedItemTitle = this.selectedItem;
      return this.selectedItem ? `(with selected value) ${selectedItemTitle}` : '(no selected value)';
    },

    tooltipOptions() {
      let options = {};

      if (this.hasTooltip) {
        options = this.tooltip;
        options.triggers = ['hover'];
      }

      return options;
    },

    dropdownListProps() {
      return {
        open: this.open,
        listWidth: this.listWidth,
        openDirection: this.openDirection,
        dropDownContainerClasses: this.dropDownContainerClasses,
        targetRef: 'dropdownContainer',
        autoPosition: this.autoPosition,
        horizontalAlignment: this.horizontalAlignment,
      };
    },

    hasTooltip() {
      return isEmpty(this.tooltip);
    },

    tooltipTitle() {
      return this.tooltip?.title || '';
    },

    isIconComponentEmpty() {
      return isEmpty(this.iconComponent);
    },

    iconClasses() {
      return this.iconOnly
        ? this.customIconClasses
        : `${this.centerAligned ? 'ml-1' : 'ml-auto'} ${this.customIconClasses}`;
    },

    classes() {
      let cls = '';

      switch (this.size) {
        case 'xs':
          cls += 'py-1 pl-2 pr-1 text-xs h-6 ';
          break;
        case 'sm':
          cls += 'py-2 pl-2 pr-1 text-xs h-8 ';
          break;
        case 'md':
          cls += 'py-2 pl-2 pr-4 text-sm h-10 ';
          break;
        case 'lg':
          cls += 'py-3 pl-2 pr-4 text-sm h-12 ';
          break;
        default:
          break;
      }

      if (this.iconOnly) {
        cls = `${cls.replace(/p[x|y|l|r]-[0-9]/g, '').trim()} `;
        cls = `${cls.replace(/h-[0-9]/g, '').trim()} `;

        cls += this.iconWithSize;
      }

      if (this.dropdownDisabled || this.dropdownButtonDisabled) {
        cls += ' cursor-not-allowed';
      } else {
        cls += ' cursor-pointer';
      }

      if (this.dropdownDisabled) {
        cls += ' bg-dark-6 text-dark-20%';
      } else {
        if (this.type === 'default') {
          cls += ' text-dark-3 border border-dark-6 hover:bg-light-5%';
        }
        if (this.type === 'white') {
          cls += ' bg-light-3 text-dark-3 border border-dark-6 hover:bg-light-5%';
        }
        if (this.type === 'toolbar') {
          cls += ' text-light-3 border border-light-10% hover:bg-light-5%';
        }
        if (this.type === 'dark') {
          cls += ' bg-dark-50% text-light-3 hover:bg-dark-60% active:bg-dark-50%';
        }
        if (this.type === 'custom') {
          cls += ` ${this.customClasses}`;
        }
      }
      return cls;
    },

    iconSize() {
      if (this.customCaretDownIconSize) {
        return this.customCaretDownIconSize;
      }

      switch (this.size) {
        case 'xs':
        case 'sm':
          return 11;
        case 'md':
        case 'lg':
          return 12;
        default:
          return 12;
      }
    },
  },

  methods: {
    getUUID() {
      return getUUID();
    },

    toggleOpen(ev) {
      this.$emit('click', ev);

      if (this.lock) {
        this.$emit('lockedClick');
        return;
      }

      this.open = !this.open;

      if (this.open) {
        this.$emit('open');
        return;
      }

      this.$emit('close');
    },

    close(isCloseFromBlur) {
      if (isCloseFromBlur && this.disableCloseOnClickOutside) {
        return;
      }

      this.open = false;
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
/* TODO : assess and add it with other sr-only instances */
.chromium-scroll-fix-sr-only {
  width: 0;
}</style>

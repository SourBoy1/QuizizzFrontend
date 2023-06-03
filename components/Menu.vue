<template>
  <ul
    v-click-outside="() => $emit('close')"
    class="context-menu rounded-lg select-none"
    :style="containerStyles"
    :class="[
      $constants.ContextMenu.WIDTH_CLASS, !isSubmenu ? '' : 'submenu absolute top-0',
      theme === 'dark' ? 'bg-dark-2 text-light-3' : 'bg-light-3 text-dark-3 border border-dark-6',
      textSize,
    ]"
  >
    <li
      v-for="(item, index) in visibleItems"
      :key="index"
      class="menu-item flex items-center"
      :class="[
        !item.isSeparator ? 'h-9' : 'justify-end', !isSubmenu ? 'relative' : '',
        index === selectedMenuItemIndex ? (item.submenu ? 'bg-lilac-dark' : highlightColor) : '',
        index === 0 ? 'rounded-t-lg' : '',
        index === items.length - 1 ? 'rounded-b-lg' : '',
      ]"
      @mouseup="(ev) => { ev.stopPropagation(); ev.preventDefault(); }"
      @mousedown="(ev) => { ev.stopPropagation(); ev.preventDefault(); }"
      @click="(ev) => { ev.stopPropagation(); ev.preventDefault(); }"
    >
      <button
        v-if="!item.isSeparator"
        type="button"
        class="flex justify-between items-center w-full h-full px-4"
        style="outline: none;"
        :class="[index === 0 ? 'pt-1' : '', index === (items.length - 1) ? 'pb-1' : '']"
        @mouseover="selectedMenuItemIndex = index"
        @mousedown="(ev) => { ev.stopPropagation(); ev.preventDefault(); }"
        @mouseup="(ev) => { ev.stopPropagation(); ev.preventDefault(); }"
        @click="(ev) => { handleItemMouseDown(ev, item.key); }"
      >
        <div class="flex items-center">
          <FA
            v-if="item.icon"
            :icon="item.icon"
            :size="12"
          />
          <div
            v-if="!item.icon"
            class="w-2.5 h-2.5"
          />
          <span
            v-if="item.title"
            class="pl-3"
          >{{ item.title }}</span>
        </div>
        <span
          v-if="item.desc"
          class="text-light-50%"
        >{{ item.desc }}</span>
        <FA
          v-if="item.submenu"
          icon="fas fa-caret-right"
          :size="12"
        />
      </button>
      <Menu
        v-if="item.submenu && selectedMenuItemIndex === index"
        :class="`absolute transform ${translation}`"
        :style="`top: ${submenuTop}px;`"
        :items="item.submenu"
        @menuItemClick="(key) => { $emit('menuItemClick', key) }"
      />
      <div
        v-if="item.isSeparator"
        class="separator relative left-1 h-px w-11/12 bg-light-10% px-4"
      />
    </li>
  </ul>
</template>

<script>
import isBoolean from 'lodash/isBoolean';

export default {
  props: {
    theme: {
      type: String,
      default: 'dark',
    },
    items: {
      type: Array,
      default: null,
    },
    isSubmenu: {
      type: Boolean,
      default: false,
    },
    cascadeDirection: {
      type: String,
      default: 'right',
    },
    textSize: {
      type: String,
      default: 'text-xs',
    },
    containerStyles: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['menuItemClick', 'close'],

  data() {
    return {
      selectedMenuItemIndex: -1,
    };
  },

  computed: {
    submenuTop() {
      if (!this.items || !this.items[this.selectedMenuItemIndex]) {
        return 0;
      }
      const { submenu } = this.items[this.selectedMenuItemIndex];
      const itemHeight = this.$constants.ContextMenu.ITEM_HEIGHT;

      if (submenu) {
        const numItems = this.items.length - this.selectedMenuItemIndex;
        if (numItems > submenu.length) {
          return 0;
        }
        return -(submenu.length - numItems) * itemHeight;
      }

      return 0;
    },

    translation() {
      if (this.cascadeDirection === 'right') {
        return 'translate-x-full ml-2';
      } if (this.cascadeDirection === 'left') {
        return '-translate-x-full -ml-2';
      }

      return '';
    },

    highlightColor() {
      if (this.theme === 'dark') {
        return 'bg-lilac-20%';
      }

      return 'bg-dark-5%';
    },

    visibleItems() {
      return this.items.filter((item) => (isBoolean(item.isVisible) ? item.isVisible : true));
    },
  },

  methods: {
    clearSelection() {
      this.selectedMenuItemIndex = -1;
    },

    handleItemMouseDown(ev, key) {
      this.$emit('menuItemClick', key || 'nokey');
      ev.stopPropagation();
      ev.preventDefault();
    },
  },
};
</script>

<style lang="scss" scoped>
.submenu {
  left: 16.5rem;
}
</style>

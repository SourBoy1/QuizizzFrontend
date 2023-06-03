<template>
  <div
    class="flex flex-col dropdown-container"
    tabindex="-1"
  >
    <div
      v-if="hasSearch"
      class="flex p-4"
    >
      <input
        v-model="filterText"
        type="text"
        class="w-full mr-2 text-xs border-b border-dark-6 placeholder-dark-3"
        :placeholder="$i18n('Search term')"
      />

      <div
        v-if="!hasFilterText"
        class="w-6 h-6 bg-dark-5% rounded text-dark-2 items-center justify-center flex font-black shrink-0"
      >
        <FA
          icon="far fa-search"
          :size="9"
        />
      </div>
      <button
        v-else
        class="w-6 h-6 bg-dark-5% rounded text-dark-2 items-center justify-center flex font-black shrink-0"
        @click="onClearButtonClicked"
      >
        <FA
          icon="far fa-times"
          :size="9"
        />
      </button>
    </div>

    <ul
      v-if="filteredList.length"
      :class="['pb-1 px-4 flex flex-col list-dropdown overflow-y-auto overflow-x-hidden', hasSearch ? '' : 'pt-4']"
    >
      <Checkbox
        v-for="(item, index) in filteredList"
        :key="index"
        :class="[index === 0 ? 'pt-0' : '']"
        :inputId="getUUID()"
        :label="item.text"
        :value="item.val.toString()"
        name="checkboxes"
        size="md"
        class="flex flex-col mb-2 last:mb-0"
        :checked="isItemSelected(item)"
        checkBgColor="lilac"
        :labelStyles="checkboxLabelStyles"
        role="option"
        @input="toggleCheckbox(item)"
      />
    </ul>

    <div
      v-else
      class="pl-6 text-sm font-semibold text-dark-5"
    >
      No matches
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

import { getUUID } from '~/services/UIDService.js';

export default {

  props: {
    selectedOption: {
      type: String,
      default: '',
    },
    selectedValues: {
      type: Array,
      default: () => [], // Source of truth of values is teleport
    },
    list: {
      type: Array,
      default: () => [],
    },
    hasSearch: {
      type: Boolean,
      default: false,
    },
    listWidth: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update'],

  data() {
    return {
      filterText: '',
    };
  },

  computed: {
    hasFilterText() {
      return isEmpty(this.filterText);
    },

    checkboxLabelStyles() {
      return {
        width: `${this.listWidth - 32 - 26}px`,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'inline-block',
        overflow: 'hidden',
      };
    },

    filteredList() {
      if (!this.hasSearch) {
        return this.list;
      }

      const filteredList = this.list.filter((item) => (
        item.text.toLowerCase().includes(this.filterText.toLowerCase())
      ));

      return filteredList;
    },
  },

  methods: {
    onClearButtonClicked() {
      this.filterText = '';
    },

    getUUID() {
      return getUUID();
    },

    clearAllClicked() {
      this.$emit('update', 'clearAll');
    },

    toggleCheckbox(item) {
      this.$emit('update', { ...item, status: !this.isItemSelected(item) });
    },

    isItemSelected(item) {
      return this.selectedValues.includes(item.val);
    },
  },
};
</script>

<style lang="scss" scoped>
.dropdown-container {
  max-height: 320px
}
</style>

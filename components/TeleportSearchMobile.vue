<template>
  <div
    class="main-header-search-bar ml-2 md:ml-0 flex flex-grow rounded-lg border-0 md:border bg-light-1"
    :class="[active ? 'border-lilac-light' : 'border-light-1']"
  >
    <div class="w-full">
      <Input
        ref="autoCompleteRef"
        inputId="search-input"
        :value="currentSearchTerm"
        :inheritBorderRadius="true"
        :type="'header'"
        :placeholder="$i18n('Search')"
        :licon="'fas fa-search text-purple mt-0.5'"
        :liconSize="12"
        :noRing="true"
        :noBorder="true"
        class="flex-grow"
        textColorClass="font-semibold text-xs md:text-sm text-dark-2 placeholder-dark-2 border-none"
        :disabled="isSearchBarDisabled"
        autocomplete="off"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="doSearch"
        @input="onInput"
      />
    </div>
    <div
      v-if="teleportSearchTerm"
      class="divider border-r my-2 border-dark-5"
    />
    <Button
      v-if="teleportSearchTerm"
      :title="$i18n('Filters')"
      size="md"
      class="w-40 h-full self-center"
      type="custom"
      :licon="isSearchFilterApplied ? '' : 'far fa-sliders-h'"
      @click="openFilters"
    >
      <template
        v-if="isSearchFilterApplied"
        #lIcon
      >
        <span class="mr-1.5 w-2 h-2 rounded-full bg-green" />
      </template>
    </Button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Search from '~/config/SearchConfig';

export default {

  props: {
    searchTerm: {
      type: String,
      default: '',
    },

    teleportSearchTerm: {
      type: String,
      default: '',
    },
  },
  emits: ['searchTermSubmit', 'openFilters', 'active', 'input'],

  data() {
    return {
      filterKeys: Search.FILTER_KEYS,
      active: false,
      showDropdown: false,
      isSearchBarDisabled: false,
      currentSearchTerm: '',
      isSearchFilterApplied: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),

  },

  watch: {
    $route(oldVal, newVal) {
      this.checkSearchFilterApplied();
    },
  },

  created() {
    this.setDefaultSearchTerm();
  },

  activated() {
    this.setDefaultSearchTerm();
  },

  methods: {
    doSearch(event) {
      if (event.keyCode === 13) {
        this.$emit('searchTermSubmit');
      }
    },

    setDefaultSearchTerm() {
      this.currentSearchTerm = this.searchTerm;
    },

    openFilters() {
      this.$emit('openFilters');
    },

    handleDisable(status = true) {
      this.isSearchBarDisabled = status;
    },
    onFocus() {
      this.active = true;
      this.$emit('active', true);
    },
    onBlur() {
      this.active = false;
      this.$emit('active', false);
    },
    onInput(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style scoped>

</style>

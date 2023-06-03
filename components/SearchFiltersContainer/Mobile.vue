<template>
  <div class="h-screen fixed bg-dark-50% w-full z-50 top-0">
    <div
      class="flex flex-col h-full mt-6 rounded-t filters-wrapper bg-light"
      :style="filterWrapperStyles"
    >
      <div class="flex items-center justify-between p-3 mb-8 border-b border-light-1">
        <Button
          size="sm"
          :title="$i18n('Close')"
          type="custom"
          licon="fas fa-times"
          customClasses="text-dark-2 font-semibold"
          @click="closeFilters"
        />

        <div class="font-semibold text-purple-dark">
          <i18n>Filters</i18n>
        </div>

        <Button
          size="sm"
          :title="$i18n('Clear all')"
          type="custom"
          customClasses="text-lilac-dark font-semibold"
          @click="onClearAllFilters"
        />
      </div>

      <div class="flex w-full filters-wrapper">
        <div class="flex flex-col overflow-y-auto left-side min-w-39 bg-light-2">
          <button
            v-if="shouldRenderThisFilter('searchIn')"
            :class="['w-full text-sm text-dark-3 px-4', isCurrentTab('searchIn') ? 'bg-light font-semibold' : '']"
            @click="onTabSelected('searchIn')"
          >
            <span class="flex items-center w-full h-full py-4 whitespace-nowrap border-b-1 border-dark-6">
              <i18n>Search in</i18n>
              <span
                v-if="doesTabHaveSelectedFilter('searchIn')"
                class="w-1.5 h-1.5 rounded-full bg-green ml-2"
              />
            </span>
          </button>

          <button
            v-if="shouldShowOtherFilters && shouldRenderThisFilter('sortBy')"
            :class="['w-full text-sm text-dark-3 px-4 cursor-pointer', isCurrentTab('sortBy') ? 'bg-light font-semibold' : '']"
            @click="onTabSelected('sortBy')"
          >
            <span class="flex items-center w-full h-full py-4 whitespace-nowrap border-b-1 border-dark-6">
              <i18n>Sort by</i18n>
              <span
                v-if="doesTabHaveSelectedFilter('sortKey')"
                class="w-1.5 h-1.5 rounded-full bg-green ml-2"
              />
            </span>
          </button>

          <button
            v-if="shouldShowOtherFilters && shouldRenderThisFilter('subjects')"
            :class="['w-full text-sm text-dark-3 px-4 cursor-pointer', isCurrentTab('subjects') ? 'bg-light font-semibold' : '']"
            @click="onTabSelected('subjects')"
          >
            <span class="flex items-center w-full h-full py-4 whitespace-nowrap border-b-1 border-dark-6">
              <i18n>Subjects</i18n>
              <span
                v-if="doesTabHaveSelectedFilter('subjects')"
                class="w-1.5 h-1.5 rounded-full bg-green ml-2"
              />
            </span>
          </button>

          <button
            v-if="shouldShowOtherFilters && shouldRenderThisFilter('grades')"
            :class="['w-full text-sm text-dark-3 px-4 cursor-pointer', isCurrentTab('grades') ? 'bg-light font-semibold' : '']"
            @click="onTabSelected('grades')"
          >
            <span class="flex items-center w-full h-full py-4 whitespace-nowrap border-b-1 border-dark-6">
              <i18n>Grades</i18n>
              <span
                v-if="doesTabHaveSelectedFilter('grades')"
                class="w-1.5 h-1.5 rounded-full bg-green ml-2"
              />
            </span>
          </button>

          <button
            v-if="shouldShowOtherFilters && shouldRenderThisFilter('languages')"
            :class="['w-full text-sm text-dark-3 px-4 cursor-pointer', isCurrentTab('languages') ? 'bg-light font-semibold' : '']"
            @click="onTabSelected('languages')"
          >
            <span class="flex items-center w-full h-full py-4 whitespace-nowrap border-b-1 border-dark-6">
              <i18n>Languages</i18n>
              <span
                v-if="doesTabHaveSelectedFilter('languages')"
                class="w-1.5 h-1.5 rounded-full bg-green ml-2"
              />
            </span>
          </button>

          <button
            v-if="shouldShowOtherFilters && shouldRenderThisFilter('numQuestions')"
            :class="['w-full text-sm text-dark-3 px-4 cursor-pointer', isCurrentTab('numQuestions') ? 'bg-light font-semibold' : '']"
            @click="onTabSelected('numQuestions')"
          >
            <span class="flex items-center w-full h-full py-4 whitespace-nowrap border-b-1 border-dark-6">
              <i18n>No. of questions</i18n>
              <span
                v-if="doesTabHaveSelectedFilter('numQuestions')"
                class="w-1.5 h-1.5 rounded-full bg-green ml-2"
              />
            </span>
          </button>

          <button
            v-if="shouldShowOtherFilters && shouldRenderThisFilter('misc')"
            :class="['w-full text-sm text-dark-3 px-4 cursor-pointer', isCurrentTab('misc') ? 'bg-light font-semibold' : '']"
            @click="onTabSelected('misc')"
          >
            <span class="flex items-center w-full h-full py-4 whitespace-nowrap border-b-1 border-dark-6">
              <i18n>Misc.</i18n>
              <span
                v-if="doesTabHaveSelectedFilter('misc')"
                class="w-1.5 h-1.5 rounded-full bg-green ml-2"
              />
            </span>
          </button>
        </div>

        <div class="relative flex flex-col w-full right-side">
          <div
            v-if="isCurrentTab('languages')"
            class="flex px-4 pb-4"
          >
            <input
              v-model="languageFilterText"
              type="text"
              class="w-full mr-2 text-xs border-b border-dark-6 placeholder-dark-3"
              :placeholder="$i18n('Search languages')"
            />

            <button
              v-if="!hasFilterText"
              class="w-6 h-6 bg-dark-5% rounded text-dark-2 items-center justify-center flex font-black shrink-0"
            >
              <FA
                icon="far fa-search"
                :size="9"
              />
            </button>
            <button
              v-else
              class="w-6 h-6 bg-dark-5% rounded text-dark-2 items-center justify-center flex font-black shrink-0"
              @click="onClearLanguageFilterButtonClicked"
            >
              <FA
                icon="far fa-times"
                :size="9"
              />
            </button>
          </div>

          <div class="filter-list pr-0.5 pb-2 flex flex-col overflow-y-auto">
            <Checkbox
              v-for="(filter, index) in currentFilterValues"
              :key="index"
              :label="filter.label ? filter.label : filter.text"
              :value="_toString(filter.val)"
              name="checkboxes"
              :labelStyles="checkboxLabelStyles"
              size="sm"
              :checked="isCurrentFilterSelected(filter)"
              class="mx-4 mt-4"
              role="option"
              :inputId="getUUID()"
              @input="(status) => toggleFilterCheckbox(status, filter)"
            />
          </div>

          <div class="absolute bottom-0 w-full p-4 border-t border-solid bg-light border-light-1">
            <Button
              class="w-full"
              type="primary"
              size="md"
              :title="$i18n('Apply')"
              @click="onApplyingFilters"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import toString from 'lodash/toString';

import { getUUID } from '~/services/UIDService.js';
import SearchConfig from '~/config/SearchConfig';

export default {
  props: {
    filters: {
      type: Object,
      default: () => SearchConfig.ALL_FILTERS,
    },

    selectedFilters: {
      type: Object,
      default: () => {},
    },

    multiFilters: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['onSearch', 'close', 'toggleFilterCheckbox'],

  data() {
    return {
      currentTab: '',
      languageFilterText: '',
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),

    filterWrapperStyles() {
      return {
        maxHeight: `${this.deviceProps.visibleViewportHeight - 24}px`,
      };
    },

    hasFilterText() {
      return !isEmpty(this.languageFilterText);
    },

    currentFilterValues() {
      if (this.currentTab === 'languages') {
        return this.languageFilteredList;
      }

      return this.filters[this.currentTab];
    },

    languageFilteredList() {
      const filteredList = this.filters?.languages?.filter((item) => (
        item.text.toLowerCase().includes(this.languageFilterText.toLowerCase())
      ));

      return filteredList;
    },

    shouldShowOtherFilters() {
      if (isEmpty(this.selectedFilters.searchIn)) {
        return true;
      }

      return this.selectedFilters.searchIn === 'all_quizzes';
    },

    checkboxLabelStyles() {
      return {
        width: '100%',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'inline-block',
        overflow: 'hidden',
      };
    },

  },

  mounted() {
    this.currentTab = keys(this.filters)[0];
  },

  methods: {
    _toString(val) {
      return toString(val);
    },

    onClearLanguageFilterButtonClicked() {
      this.languageFilterText = '';
    },

    onApplyingFilters() {
      this.$emit('onSearch');
      this.$emit('close');
    },

    doesTabHaveSelectedFilter(tab) {
      const filterValues = this.filters[tab];

      return filterValues.findIndex((filter) => this.isCurrentFilterSelected(filter)) > -1;
    },

    isCurrentFilterSelected(filter) {
      const filterValues = this.selectedFilters[filter.key];
      if (Array.isArray(filterValues)) {
        return filterValues.includes(filter.val);
      }

      return filterValues === filter.val;
    },

    toggleFilterCheckbox(status, filter) {
      this.$emit('toggleFilterCheckbox', status, { key: filter.key, value: filter.val });
    },

    onClearAllFilters() {
      this.$store.dispatch('searchState/resetFilters', {
        [SearchConfig.FILTER_KEY_NAMES_V2.ContentType]: ['quiz', 'presentation'],
      });
    },

    isCurrentTab(filter) {
      return this.currentTab === filter;
    },

    getUUID() {
      return getUUID();
    },

    onTabSelected(tab) {
      this.currentTab = tab;
    },

    closeFilters() {
      this.$emit('close');
    },

    shouldRenderThisFilter(filter) {
      return !isEmpty(this.filters[filter]);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.filters-wrapper {
  height: calc(100% - 24px);
  overflow: hidden;
}
.filters-body {
  height: calc(100% - 24px);
}
.filter-list {
  height: calc(100% - 109px);
  width: calc(100vw - 156px);
}
.filter-list:deep(label) {
  width: 100%;
}
</style>

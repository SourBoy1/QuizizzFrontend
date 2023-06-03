<template>
  <div
    class="main-header-search-bar bg-light-1"
    :class="[active ? 'border-lilac-light' : 'border-light-1']"
  >
    <AutoCompleteSearch
      :showQuizizzLogo="showQuizizzLogo"
      :selected="selected"
      :isSearchBarDisabled="isSearchBarDisabled"
      :active="active"
      @click.stop
      @focus="onFocus"
      @blur="onBlur"
    />
    <div
      v-if="shouldShowDivider && !showQuizizzLogo"
      :class="['divider border-r my-2 border-dark-5']"
    />
    <button
      class="hidden md:block"
      @click.stop="promptUpsell"
    >
      <FA
        v-if="showUpsellLock"
        icon="fas fa-lock-alt"
        class="pl-4 text-dark"
      />
    </button>

    <Button
      v-if="!isDesktop && isCurrentPageSearchPage"
      :title="$i18n('Filters')"
      size="md"
      class="w-40 mt-1"
      type="custom"
      :licon="isSearchFilterApplied ? '' : 'far fa-sliders-h'"
      @click.stop="openFilters"
    >
      <template
        v-if="isSearchFilterApplied"
        #lIcon
      >
        <span class="mr-1.5 w-2 h-2 rounded-full bg-green" />
      </template>
    </Button>

    <client-only>
      <SelectBox
        v-if="isDesktop && !showQuizizzLogo"
        :modelValue="selected"
        autoPosition
        class="selectbox-inner"
        size="md"
        :list="searchSourcesList"
        :type="'default'"
        :noBorder="true"
        @close="showDropdown = false"
        @open="showDropdown = true"
        @input="handleSearchSourceSelection"
      />
    </client-only>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Constants from '~/config/Constants';
import { getSearchFiltersApplied } from '~/utils/Utilities';
import Search from '../config/SearchConfig';

export default {
  props: {
    showQuizizzLogo: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['dropdown:show', 'dropdown:hide', 'active'],

  data() {
    return {
      filterKeys: Search.FILTER_KEYS,
      active: false,
      showDropdown: false,
      selected: Constants.SearchFilters.type.QUIZIZZ_LIBRARY,
      isSearchBarDisabled: false,
      isSearchFilterApplied: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'serverData']),
    ...mapGetters('sharedLibrary', ['enableSharedLibrary', 'hasSharedLibraryPriviledges']),
    ...mapGetters('searchState', ['searchTerm', 'searchSource']),

    hasOrgIds() {
      return !!this.$user.organizationIds?.length;
    },

    isCurrentPageSearchPage() {
      return this.$route.name === this.$constants.PageNames.SEARCH_PAGE;
    },

    isCurrentPageMyLibrary() {
      return this.$route.name === this.$constants.PageNames.MY_LIBRARY;
    },
    isCurrentPageAdminRoot() {
      return this.$route.name === this.$constants.PageNames.ADMIN_ROOT;
    },

    shouldShowDivider() {
      if (!this.isDesktop) {
        return this.isCurrentPageSearchPage;
      }
      return true;
    },

    showUpsellLock() {
      if (!this.enableSharedLibrary) {
        return false;
      }

      const isDistrictFilter = this.selected === Constants.SearchFilters.type.MY_DISTRICT;

      return isDistrictFilter && !this.hasSharedLibraryPriviledges;
    },

    searchSourcesList() {
      const searchSourceList = [
        {
          title: this.$i18n('Quizizz library'),
          value: Constants.SearchFilters.type.QUIZIZZ_LIBRARY,
        },
        {
          title: this.$i18n('My library'),
          value: Constants.SearchFilters.type.MY_LIBRARY,
        },
        {
          title: this.$i18n('My district'),
          value: Constants.SearchFilters.type.MY_DISTRICT,
        },
        {
          title: this.$i18n('Reports'),
          value: 'reports',
        },
      ];

      if (this.enableSharedLibrary && this.hasOrgIds) {
        return searchSourceList;
      }

      return searchSourceList.filter((item) => item.value !== Constants.SearchFilters.type.MY_DISTRICT);
    },
  },

  watch: {
    $route() {
      this.checkSearchFilterApplied();
    },

    showDropdown(value) {
      if (value) {
        this.$emit('dropdown:show');
      } else {
        this.$emit('dropdown:hide');
      }
    },
  },

  created() {
    this.$eventBus.$on('mainHeaderSearchBar:disable', this.handleDisable);
    this.$eventBus.$on('mainHeaderSearchBar:change', this.handleChangeSearchFilter);
    this.$eventBus.$on('mainHeaderSearchBar:sharedLibraryRouteUpdate', this.sharedLibraryRouteUpdate);
    this.setCurrentFilterBasedOnRoute();
  },

  mounted() {
    this.checkSearchFilterApplied();

    /**
     * Persist search source in the header on route change
     * On first mount set the initial search source
     */
    if (this.searchSource) {
      this.selected = this.searchSource;
      return;
    }
    this.$store.dispatch('searchState/setSearchSource', this.$user.isCorporate ? Constants.SearchFilters.type.MY_LIBRARY : Constants.SearchFilters.type.QUIZIZZ_LIBRARY);
  },

  beforeUnmount() {
    this.$eventBus.$off('mainHeaderSearchBar:disable', this.handleDisable);
    this.$eventBus.$off('mainHeaderSearchBar:change', this.handleChangeSearchFilter);
    this.$eventBus.$off('mainHeaderSearchBar:sharedLibraryRouteUpdate', this.sharedLibraryRouteUpdate);
  },

  methods: {
    setCurrentFilterBasedOnRoute() {
      if (this.$route.name === this.$constants.PageNames.MY_LIBRARY) {
        this.selected = Constants.SearchFilters.type.MY_LIBRARY;
      } else {
        this.selected = Constants.SearchFilters.type.QUIZIZZ_LIBRARY;
      }
    },

    handleChangeSearchFilter(newFilter) {
      this.selected = newFilter;
    },

    checkSearchFilterApplied() {
      if (this.isCurrentPageMyLibrary || this.isCurrentPageAdminRoot) {
        this.isSearchFilterApplied = false;
        return;
      }

      const { query } = this.$route;
      const appliedFilters = getSearchFiltersApplied(query);

      this.isSearchFilterApplied = appliedFilters.length > 0;
    },

    openFilters() {
      this.$eventBus.$emit('searchFilter:open');
    },

    handleDisable(status = true) {
      this.isSearchBarDisabled = status;
    },

    onFocus() {
      this.$analytics.logEvent(this.$webEvents.HEADER_SEARCH_BAR_CLICK);
      this.active = true;
      this.$emit('active', true);
    },

    onBlur() {
      this.active = false;
      this.$emit('active', false);
    },

    sharedLibraryRouteUpdate() {
      if (!this.hasOrgIds) {
        return;
      }
      this.updateSelectedFilter(Constants.SearchFilters.type.MY_DISTRICT);
    },

    updateSelectedFilter(filter) {
      this.selected = filter;
    },

    promptUpsell() {
      this.$eventBus.$emit('sndUpsell:open', {
        feat: this.$constants.FeatureTypes.DISTRICT_LIBRARY,
        webEvent: this.$webEvents.UPSELL_MAIN_HEADER_LOCK,
      });
    },

    handleSearchSourceSelection(source) {
      const query = {};
      switch (source) {
        case this.$constants.SearchFilters.type.MY_LIBRARY:
          if (this.searchTerm) {
            query.term = this.searchTerm;
          }
          if (this.$route.query?.teamId) {
            query.teamId = this.$route.query.teamId;
          }
          this.$router.push({
            path: this.$user.isCorporate ? '/admin/corporate' : '/admin/private',
            query,
          });
          return;
        case this.$constants.SearchFilters.type.MY_DISTRICT:
          this.$router.push({
            path: `/admin/search/${this.searchTerm}`,
          });
          break;
        default:
          break;
      }
      this.selected = source;
      this.$store.dispatch('searchState/setSearchSource', source);
    },

  },
};
</script>

<style lang="scss" scoped>
.main-header-search-bar {
  @apply ml-2 md:ml-0 flex flex-grow rounded border-0 md:border;
}
.selectbox-inner:deep(){
  & div[aria-live='assertive']{
    width: max-content;
  }
}
</style>

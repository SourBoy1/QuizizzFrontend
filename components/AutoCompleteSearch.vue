// TODO #Migration Abhishek revisit
<template>
  <div
    class="w-full"
    :class="[quizPageSearchBarStyle && !isShowingSearchBarQuizPage ? 'bg-light-3' : '']"
  >
    <Input
      v-if="isHeader"
      ref="autoCompleteRef"
      inputId="search-input"
      :value="value"
      :inheritBorderRadius="true"
      :type="'header'"
      :placeholder="placeholder"
      customPlaceholder
      :licon="'fas fa-search text-purple mb-0.5'"
      :liconSize="12"
      :noRing="true"
      :noBorder="true"
      class="flex-grow"
      textColorClass="font-semibold text-xs md:text-sm text-dark-2 placeholder-dark-2 border-none"
      :disabled="isSearchBarDisabled"
      autocomplete="off"
      @input="onInputChange"
      @click.stop
      @focus="onFocus"
      @blur="onBlur"
      @keydown="selectResult"
    />
    <Input
      v-else
      ref="autoCompleteRef"
      inputId="search-input"
      :value="value"
      :inheritBorderRadius="true"
      :placeholder="searchForTopicPlaceholder"
      :ticonSize="isDesktop ? 20 : 12"
      :ticonWrapperClasses="'-right-1'"
      :ticon="'far fa-chevron-right text-dark-4 cursor-pointer'"
      :noRing="true"
      :noBorder="true"
      class="flex-grow"
      autocomplete="off"
      textColorClass="font-semibold text-xs md:text-2xl text-dark-2 placeholder-dark-5"
      @input="onInputChange"
      @click.stop
      @focus="onFocus"
      @blur="onBlur"
      @keydown="selectResult"
      @tIconClicked="navigate(escape(value))"
    />
    <div
      v-if="active && autoCompleteResults.length > 0"
      ref="autocomplete"
      v-click-outside="() => closeOverlay()"
      class="fixed z-999 rounded-lg bg-light"
      :class="{
        'shadow-md': isHero, 'left-0': isHero || !isDesktop, 'left-2': isDesktop && isHeader && !showQuizizzLogo, 'mt-1 top-full': !isDesktop, 'w-full': !isHeader && !isDesktop, 'w-49/50 mx-1': isHeader && !isDesktop,
      }"
      :style="autoCompleteSuggestionStyles"
    >
      <ul class="py-2">
        <li
          v-if="autoCompleteHeader"
          class="py-1 pl-1 pr-4 ml-8 text-sm font-semibold truncate cursor-pointer text-dark whitespace-nowrap"
        >
          {{ autoCompleteHeader }}
        </li>
        <hr
          v-if="autoCompleteHeader"
          class="mt-2 mb-2 text-dark-1 text-opacity-10"
        >
        <li
          v-for="(item, index) in autoCompleteResults"
          :key="index"
          class="py-1 pl-1 pr-4 font-normal truncate cursor-pointer text-dark whitespace-nowrap"
          :class="{ 'bg-lilac-faded': index === selectedAutoCompleteIndex, 'text-sm': !isDesktop }"
          @mouseover="selectedAutoCompleteIndex = index"
          @mouseleave="selectedAutoCompleteIndex = null"
          @click.stop="onClickNavigate(item, $event)"
        >
          <span
            class="ml-8 truncate"
            v-html="getHighlightedText(item)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import debounce from 'lodash/debounce';
import escape from 'lodash/escape';
import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants.js';
import { getPageTitleForInhouseEvents } from '~/config/PageTitles';

import SearchService from '~/services/apis/SearchService';
import WebEvents from '~/config/WebEvents';

import { setSearchQueryIdFromUserObject } from '~/utils/Utilities.js';

const MAX_RECENT_SEARCHES = 10;
const MAX_SEARCHES_TO_SHOW = 4;

export default {

  props: {
    selected: {
      type: String,
      default: () => Constants.SearchFilters.type.QUIZIZZ_LIBRARY,
    },
    isSearchBarDisabled: {
      type: Boolean,
      default: false,
    },
    customPlaceholder: {
      type: String,
      default: () => '',
    },
    variant: {
      type: String,
      default: () => 'header',
    },
    subjectFilter: {
      type: Object,
      default: null,
    },
    showQuizizzLogo: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['focus', 'blur', 'active'],

  data() {
    return {
      active: false,
      // text in input
      value: '',
      // text that has been typed
      query: '',
      autoCompleteStyle: {
        width: 0,
        top: 0,
      },
      slugSearchBarStyles: {
        width: '100%',
        marginTop: '4px',
      },
      doAutoSearch: true,
      // value in the list that needs to be highlighted when hovering or using cursor control keys
      selectedAutoCompleteIndex: null,
      autoCompleteResults: [],
      autoCompleteHeader: null,
      inputRef: {},
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'serverData']),
    ...mapGetters('searchSuggestions', ['searchTerms']),
    ...mapGetters('sharedLibrary', ['enableSharedLibrary', 'hasSharedLibraryPriviledges']),
    ...mapGetters('uiManager', ['isShowingSearchBarQuizPage']),

    searchWrapper() {
      return this.isHeader ? this?.$refs?.autoCompleteRef?.$refs?.input : document.getElementById('hero-search-bar');
    },

    autoCompleteSuggestionStyles() {
      if (this.quizPageSearchBarStyle && this.isShowingSearchBarQuizPage) {
        return this.slugSearchBarStyles;
      }

      if (this.isDesktop) {
        return this.autoCompleteStyle;
      }

      return {};
    },

    isHero() {
      return this.variant === 'hero';
    },

    isHeader() {
      return this.variant === 'header';
    },

    isSharedLibrarySearch() {
      return (this.selected === Constants.SearchFilters.type.MY_DISTRICT);
    },

    placeholder() {
      if (this.customPlaceholder) {
        return this.customPlaceholder;
      }

      if (this.isDesktop) {
        switch (this.selected) {
          case 'quizizz-library':
            return this.$i18n('Search in Quizizz library');
          case 'my-district':
            return this.$i18n('Search in my district library');
          case 'my-library':
            return this.$i18n('Search in my library');
          case 'reports':
            return this.$i18n('Search in my reports');
          default:
            return this.$i18n('Search');
        }
      }

      return this.$i18n('Search Quizizz library');
    },

    searchForTopicPlaceholder() {
      if (this.subjectFilter && !this.isDesktop) {
        return this.$i18n('Search for any topic');
      }
      return this.$i18n('Search for quizzes on any topic');
    },

    quizPageSearchBarStyle() {
      return this.isDesktop && !this.$user.isLoggedIn && this.showQuizizzLogo;
    },
  },

  watch: {
    // If auto suggestion is allowed, keep query and value same
    $route() {
      this.updateInputValueToRouteParams();
    },
    value(oldVal) {
      if (this.doAutoSearch) {
        this.query = oldVal;
      }
    },
  },

  created() {
    this.getDebouncedResults = debounce(this.getAutoCompleteResults, 50);
  },

  mounted() {
    this.$nextTick(() => {
      this.assignAutoCompleteWidthAndPosition(this.searchWrapper);
    });
    if (this.isHero && this.active && !this.isDesktop) {
      ref.focus();
    }
    this.updateInputValueToRouteParams();

    window.addEventListener('resize', this.assignAutoCompleteWidthAndPosition);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.assignAutoCompleteWidthAndPosition);
  },

  methods: {
    escape(value) {
      return escape(value);
    },

    updateInputValueToRouteParams() {
      // Check if route has search term in the URL and add it as input value/query value as well on search page
      const { term } = this.$route.params;
      if (term && this.$route.name === 'admin-search-term') {
        this.value = term;
        this.query = term;
      } else {
        const queryTerm = this.$route.query.term;
        if (queryTerm) {
          this.value = queryTerm;
          this.query = queryTerm;
        } else {
          this.value = '';
          this.query = '';
        }
      }
    },

    assignAutoCompleteWidthAndPosition(ref) {
      if (!this.isDesktop || !ref || !ref.getBoundingClientRect) {
        return;
      }

      const { bottom, left, width } = ref.getBoundingClientRect();

      this.autoCompleteStyle.width = `${width}px`;
      this.autoCompleteStyle.left = `${left}px`;

      const gapOffset = 5;

      if (this.isHero) {
        if (this.isDesktop) {
          this.autoCompleteStyle.top = `${bottom + gapOffset}px`;
        } else {
          this.autoCompleteStyle.top = `${bottom + gapOffset}px`;
        }
        return;
      }
      this.autoCompleteStyle.top = `${bottom + gapOffset}px`;
    },

    isAutocompleteAllowed() {
      return !(this.selected === Constants.SearchFilters.type.MY_LIBRARY || this.selected === Constants.SearchFilters.type.REPORTS);
    },

    onFocus() {
      this.active = true;
      this.$emit('focus');

      // disable autocomplete for other search types
      if (!this.isAutocompleteAllowed()) {
        this.autoCompleteResults = [];
      }

      // Showing default suggestions if not populated already
      if (this.autoCompleteResults.length === 0) {
        this.autoCompleteResults = this.getSuggestions();
      }

      // autocomplete only on quizizz library
      if (this.value?.length > 2 && this.selected === Constants.SearchFilters.type.QUIZIZZ_LIBRARY) {
        this.getDebouncedResults();
      }

      this.$nextTick(() => {
        this.assignAutoCompleteWidthAndPosition(this.searchWrapper);
      });
    },

    onBlur() {
      if (!this.autoCompleteResults.length) {
        this.closeOverlay();
      }
    },

    closeOverlay(event) {
      if (event && (event.srcElement.id === 'search-input' || event.srcElement.id === 'search-subject-tag')) {
        return;
      }

      this.$emit('blur');
      this.active = false;
      this.autoCompleteResults = [];
      this.selectedAutoCompleteIndex = null;
      this.doAutoSearch = true;
    },

    onInputChange(value) {
      if (!value) {
        return;
      }
      this.value = value;

      if (value.length > 2 && this.selected === Constants.SearchFilters.type.QUIZIZZ_LIBRARY) {
        this.getDebouncedResults();
      }
    },

    getHighlightedText(text) {
      return this.$stringUtils.getHighlightedText(text, this.query, true);
    },

    async getAutoCompleteResults() {
      const response = await SearchService.getAutoCompleteResults(this.value, this.subjectFilter?.shortName);
      if (response && this.active && this.doAutoSearch) {
        this.autoCompleteResults = response.data.results;
        this.autoCompleteHeader = null;
      }
    },

    onClickNavigate(query, event) {
      event.stopPropagation();
      const path = escape(query);
      this.value = query;
      this.navigate(path);
      this.$analytics.logEvent(
        WebEvents.SEARCH_EVENT_HERO_SEARCH_SUGGESIONS,
        {
          subject: this.subjectFilter?.shortName || '',
          query,
        },
      );
      this.autoCompleteResults = [];
    },

    navigate(query) {
      this.$emit('active', false);
      this.active = false;
      this.$eventBus.$emit('overlay:hide');
      // To avoid current search showing up as recent search
      const isRecentSearch = this.isRecentSearch(query);
      this.saveRecentSearch(query, this.subjectFilter?.shortName.toLowerCase() || '');
      // clear math standards data when base search term is changed
      this.clearRecentStandardData();

      if (!this.value?.trim().length) {
        return;
      }

      // internal routing
      const internalRoutes = [Constants.SearchFilters.type.QUIZIZZ_LIBRARY, Constants.SearchFilters.type.MY_DISTRICT];
      if (internalRoutes.includes(this.selected)) {
        // TODO
        // refactor hard-coded values
        const source = this.variant === 'hero' ? 'HeroSearchBar' : 'MainHeader';
        const searchSource = this.subjectFilter?.shortName === 'GCSE' ? 'GCSE' : 'normal';

        let searchParamOverrides = {};

        if (this.subjectFilter?.shortName === 'GCSE') {
          searchParamOverrides = { grade: '9,10,11', Curriculum: searchSource };
        }

        const routeParams = {
          term: query,
          source,
          libraryType: this.selected === Constants.SearchFilters.type.MY_DISTRICT ? 'district' : null,
        };

        const fromPage = getPageTitleForInhouseEvents(this.$route.path);

        const queryParams = {
          ...this.$route.query, source, page: fromPage, searchSource, ...searchParamOverrides,
        };

        this.$router.push({
          name: Constants.PageNames.SEARCH_PAGE,
          params: routeParams,
          query: queryParams,
        });

        if (this.isHero) {
          const queryId = setSearchQueryIdFromUserObject(this.$user);
          this.$analytics.logEvent(
            WebEvents.SEARCH_EVENT_HERO_SEARCH_TRIGGERED,
            {
              subject: this.subjectFilter?.shortName || '',
              query,
              isRecent: isRecentSearch,
              isSuggested: this.isSuggestedSearch(query),
              queryId,
            },
          );
        }

        this.value = query;
        this.closeOverlay();
        return;
      }

      if (this.selected === Constants.SearchFilters.type.MY_LIBRARY) {
        const name = this.$user.isCorporate ? Constants.PageNames.CORPORATE : Constants.PageNames.MY_LIBRARY;
        this.$router.push({
          name,
          query: {
            term: query,
            sortKey: '_score',
          },
        });
      } else if (this.selected === 'reports') {
        window.location = `/admin/reports?term=${query}`;
      }
    },

    selectResult(event) {
      switch (event.keyCode) {
        case 13: // enter key

          if (this.isSharedLibrarySearch && !this.hasSharedLibraryPriviledges) {
            this.$analytics.logEvent(this.$webEvents.UPSELL_SEARCH);

            this.$eventBus.$emit('sndUpsell:open', {
              feat: this.$constants.FeatureTypes.DISTRICT_LIBRARY,
              webEvent: this.$webEvents.UPSELL_CONTENTS_END_CTA,
            });

            this.$refs.autoCompleteRef?.$refs?.input?.blur();
            break;
          }

          // set value in input to selected text term from autosuggestion list
          if (this.selectedAutoCompleteIndex) {
            this.value = this.autoCompleteResults[this.selectedAutoCompleteIndex];
          }

          // go to search page and fire blur event
          this.navigate(this.value);
          this.$refs.autoCompleteRef?.$refs?.input?.blur();
          break;

        case 38: // up arrow key
          event.preventDefault();

          // when using arrow keys, don't fire network requests for value in input
          this.doAutoSearch = false;

          // check if we have the @autoCompleteResults otherwise setting @selectAutoCompleteIndex would be undefined
          if (this.autoCompleteResults.length) {
            if (!this.selectedAutoCompleteIndex) {
              this.selectedAutoCompleteIndex = this.autoCompleteResults.length - 1;
              this.value = this.autoCompleteResults[this.autoCompleteResults.length - 1];
            } else {
              this.selectedAutoCompleteIndex -= 1;
              this.value = this.autoCompleteResults[this.selectedAutoCompleteIndex];
            }
          }

          break;

        case 40: // down arrow key
          event.preventDefault();

          // when using arrow keys, don't fire network requests for value in input
          this.doAutoSearch = false;

          // check if we have the @autoCompleteResults otherwise setting @selectAutoCompleteIndex would be undefined
          if (this.autoCompleteResults.length) {
            if (this.selectedAutoCompleteIndex === this.autoCompleteResults.length - 1 || this.selectedAutoCompleteIndex === null) {
              this.selectedAutoCompleteIndex = 0;
              this.value = this.autoCompleteResults[0];
            } else {
              this.selectedAutoCompleteIndex += 1;
              this.value = this.autoCompleteResults[this.selectedAutoCompleteIndex];
            }
          }

          break;

        case 9: // Tab key
          if (this.active) {
            this.closeOverlay();
          }
          break;

        default:
          this.doAutoSearch = true;
      }
    },

    clearRecentStandardData() {
      const localStorageKey = 'qz-math-standards-search';
      localStorage.removeItem(localStorageKey);
      this.$store.dispatch('searchState/setMathStandards', { state: false, grade: false, selectedTerm: false });
    },

    saveRecentSearch(search, subject) {
      if (!search) {
        return;
      }

      const localStorageKey = subject ? `qz-${subject}-search` : 'qz-general-search';
      const searches = JSON.parse(localStorage.getItem(localStorageKey)) || [];

      if (!searches.includes(search)) {
        searches.push(search);
      }

      if (searches.length > MAX_RECENT_SEARCHES) {
        searches.shift();
      }

      localStorage.setItem(localStorageKey, JSON.stringify(searches));
    },

    getRecentSearches(subject) {
      const localStorageKey = subject ? `qz-${subject}-search` : 'qz-general-search';
      const searches = localStorage.getItem(localStorageKey);
      return searches != null ? JSON.parse(searches).reverse().slice(0, MAX_SEARCHES_TO_SHOW) : [];
    },

    getFilteredRecentSearches(search, subject) {
      return this.getRecentSearches(subject).filter((val) => val.startsWith(search)).reverse().slice(0, MAX_SEARCHES_TO_SHOW);
    },

    isRecentSearch(query) {
      const isSubjectSearch = !!this.subjectFilter;
      const defaultCategory = this.$user.isCorporate ? 'generalQfw' : 'general';
      const searchType = isSubjectSearch ? this.subjectFilter.shortName.toLowerCase() : defaultCategory;
      const localStorageKey = `qz-${searchType}-search`;
      const storedValue = localStorage.getItem(localStorageKey);
      const searches = storedValue != null ? JSON.parse(storedValue) : [];

      return searches.includes(query);
    },

    isSuggestedSearch(query) {
      const isSubjectSearch = !!this.subjectFilter;
      const defaultCategory = this.$user.isCorporate ? 'generalQfw' : 'general';
      const category = isSubjectSearch ? this.subjectFilter.shortName.toLowerCase() : defaultCategory;

      if (isEmpty(this.searchTerms) || !this.searchTerms[category]) {
        return false;
      }

      return this.searchTerms[category].includes(query);
    },

    getSuggestions() {
      if (!this.isAutocompleteAllowed()) {
        return [];
      }

      const isSubjectSearch = !!this.subjectFilter;
      const defaultCategory = this.$user.isCorporate ? 'generalQfw' : 'general';
      const category = isSubjectSearch ? this.subjectFilter.shortName.toLowerCase() : defaultCategory;

      if (isEmpty(this.searchTerms) || !this.searchTerms[category]) {
        return [];
      }

      const recentSearches = this.getRecentSearches(category);
      const isRecentSearch = recentSearches.length >= 3;

      if (isRecentSearch) {
        this.autoCompleteHeader = this.$i18n('Recent');
      } else {
        this.autoCompleteHeader = isSubjectSearch ? this.$i18n('Suggested Topics') : this.$i18n('Popular Topics');
      }

      return isRecentSearch ? recentSearches : this.searchTerms[category];
    },
  },
};
</script>

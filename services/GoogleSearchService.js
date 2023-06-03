import i18n from '~/services/i18n';

import { SearchSettings } from '~/config/Google';
import EventBus from '~/services/EventBus';

const API_TIMEOUT_DURATION = 5000;

class GoogleCustomSearch {
  constructor(searchType, entityType, errorCb = () => {}) {
    if (!searchType) {
      throw new TypeError('parameter searchType missing');
    }

    this.type = searchType;
    this.entityType = entityType;
    this.searchboxRootNode = null;
    this.resultsRootNode = null;
    this.searchboxAttributes = {};
    this.searchResultsAttributes = {};
    this.gname = `google_${this.type}_search`;
    this.searchResultsReturned = false;
    this.errorCb = errorCb;
  }

  render(searchboxNode, resultsNode) {
    if (!searchboxNode || !resultsNode) {
      throw new TypeError('parameter searchboxNode or resultsNode missing');
    }

    this.searchboxRootNode = searchboxNode;
    this.resultsRootNode = resultsNode;

    this.initConfig();
    this.insertScript();
  }

  initConfig() {
    // Global script configs
    let keyName = 'image';

    if (this.type === 'youtube') {
      keyName = 'web';
    }

    window.__gcse = {
      parsetags: 'explicit',
      initializationCallback: this.onSearchScriptInit.bind(this),
      searchCallbacks: {
        [keyName]: {
          starting: this.onSearchStarted.bind(this),
          ready: this.onSearchResultsFetched.bind(this),
          rendered: this.onSearchResultsRendered.bind(this),
        },
      },
    };

    this.searchboxAttributes = {
      enableHistory: false,
    };
  }

  insertScript() {
    const { searchEngineId } = SearchSettings[this.type];

    if (document.getElementById('q-gcse-script')) {
      return;
    }

    const url = `https://cse.google.com/cse.js?cx=${searchEngineId}`;
    const script = document.createElement('script');
    script.async = true;
    script.src = url;
    script.id = 'q-gcse-script';
    document.head.appendChild(script);
  }

  onSearchScriptInit() {
    try {
      window.google.search.cse.element.render({
        div: this.searchboxRootNode,
        tag: 'searchbox',
        gname: this.gname,
        attributes: this.searchboxAttributes,
      }, {
        div: this.resultsRootNode,
        tag: 'searchresults',
        gname: this.gname,
      });

      setTimeout(() => {
        this.onSearchBoxRendered();
      }, 1);

      if (this.type === 'image') {
        EventBus.$emit('googleImageSearch:searchInit');
      } else if (this.type === 'youtube') {
        EventBus.$emit('youtubeSearch:searchInit');
      }
    } catch (error) {
      this.errorCb();
    }
  }

  doSearch(term) {
    if (!term) {
      return;
    }
    window.google.search.cse.element.getElement(this.gname).execute(term);
  }

  onSearchBoxRendered() {
    this.modifyRenderedSearchBox();
  }

  onSearchStarted(gname, query) {
    // Start a timeout timer if the results don't arrive in time
    // or if google search throws some error
    this.timeoutTimer = setTimeout(() => {
      if (!this.searchResultsReturned) {
        this.emitErrorEvent();
      }
    }, API_TIMEOUT_DURATION);

    this.searchResultsReturned = false;
    if (this.type === 'image') {
      EventBus.$emit('googleImageSearch:searchStarted', { query });
    } else if (this.type === 'youtube') {
      EventBus.$emit('youtubeSearch:searchStarted', { query });

      // We modify the query to only search for results in site:youtube.com/watch
      // to get only videos and filter out the channel and user profile pages
      // from the search

      const queryFilter = 'site:youtube.com/watch';
      return `${query} ${queryFilter}`;
    }
  }

  onSearchResultsFetched(name, query, promos, results, div) {
    this.searchResultsReturned = true;

    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }

    if (this.type === 'image') {
      EventBus.$emit('googleImageSearch:resultsFetched', {
        results,
        container: div,
        query,
      });
    } else if (this.type === 'youtube') {
      // Discard result items without a videoId
      const videoResults = results.filter((item) => item?.richSnippet?.videoobject?.videoid);
      if (!videoResults.length) {
        EventBus.$emit('youtubeSearch:noResults');
        return;
      }
      EventBus.$emit('youtubeSearch:resultsFetched', {
        results: this.formatWebResultsData(videoResults),
        container: div,
        query,
      });
    }

    return true;
  }

  emitErrorEvent() {
    if (this.type === 'image') {
      EventBus.$emit('googleImageSearch:searchFailed');
    } else {
      EventBus.$emit('youtubeSearch:searchFailed');
    }
  }

  formatWebResultsData(results) {
    const isYoutubeSearch = this.type === 'youtube';

    results.forEach((result) => {
      // When thumbnail data is missing try to get it from the richSnippets data
      if (!result.thumbnailImage) {
        let thumbUrl = '';
        let thumbWidth = '';
        let thumbHeight = '';

        try {
          if (result.richSnippet) {
            if (result.richSnippet.imageobject) {
              thumbUrl = result.richSnippet.imageobject.url || '';
              thumbWidth = result.richSnippet.imageobject.width || '';
              thumbHeight = result.richSnippet.imageobject.width || '';
            } else if (result.richSnippet.videoobject) {
              thumbUrl = result.richSnippet.videoobject.thumbnailurl || '';
            } else if (result.richSnippet.metatags) {
              thumbUrl = result.richSnippet.metatags.ogImage || '';
              thumbWidth = result.richSnippet.metatags.ogImageWidth || '';
              thumbHeight = result.richSnippet.metatags.ogImageHeight || '';
            }
          }
        } catch (ex) {
          // Error while accessing property - fail silently
        }

        result.thumbnailImage = {
          url: thumbUrl,
          width: thumbWidth,
          height: thumbHeight,
        };
      }

      // The default url for the result item is a google redirected one, if this
      // is a youtube search, change urls to the actual youtube ones
      if (isYoutubeSearch) {
        if (result.richSnippet.videoobject && result.richSnippet.videoobject.url) {
          result.url = result.richSnippet.videoobject.url;
        }

        if (result.richSnippet.videoobject && result.richSnippet.videoobject.videoid) {
          result.videoId = result.richSnippet.videoobject.videoid;
        }
      }
    });

    return results;
  }

  onSearchResultsRendered(gname, query, promoElements, resultElements) {
    setTimeout(() => {
      this.modifyRenderedSearchResultsView();
    }, 0);

    const pageNumber = this.getCurrentPageCursor();

    if (this.type === 'image') {
      EventBus.$emit('googleImageSearch:resultsRendered', {
        resultElements,
        pageNumber,
        query,
      });
    } else if (this.type === 'youtube') {
      EventBus.$emit('youtubeSearch:resultsRendered', {
        resultElements,
        pageNumber,
        query,
      });
    }
  }

  modifyRenderedSearchBox() {
    const searchBoxDiv = this.searchboxRootNode.getElementsByClassName('gsc-search-box');

    if (searchBoxDiv.length) {
      const searchInputBox = searchBoxDiv[0].getElementsByClassName('gsc-input-box');
      const searchBtn = searchBoxDiv[0].querySelector('button.gsc-search-button');

      if (searchInputBox.length) {
        searchInputBox[0].style.borderRadius = '4px';

        const searchInputElem = searchInputBox[0].querySelector('input[name="search"]');
        if (searchInputElem) {
          let label = '';
          if (this.type === 'image' && this.entityType === 'meme') {
            label = i18n('Search for memes using Google SafeSearch');
          } else if (this.type === 'image') {
            label = i18n('Search images or GIFs using Google SafeSearch');
          }

          if (this.type === 'youtube') {
            label = i18n('Search YouTube for a video or paste the URL');
          }
          searchInputElem.setAttribute('placeholder', label);
        }
      }

      if (searchBtn) {
        searchBtn.style.padding = '10px 29px';
        searchBtn.style.marginLeft = '8px';
        searchBtn.style.borderRadius = '4px';
        searchBtn.ariaLabel = i18n('Search');
      }
    }
  }

  modifyRenderedSearchResultsView() {
    const searchResultsContainer = this.resultsRootNode;
    const resultsRootDiv = searchResultsContainer.getElementsByClassName('gsc-control-cse');
    const resultsDiv = searchResultsContainer.getElementsByClassName('gsc-results');
    const resultDiv = searchResultsContainer.getElementsByClassName('gsc-result');
    const tabs = searchResultsContainer.getElementsByClassName('gsc-tabsArea');
    const headInfoArea = searchResultsContainer.getElementsByClassName('gsc-above-wrapper-area');
    const correctSpellingSuggestion = searchResultsContainer.getElementsByClassName('gs-spelling');
    const paginationDiv = searchResultsContainer.getElementsByClassName('gsc-cursor-box');
    const searchMoreGoogleFooterDiv = searchResultsContainer.getElementsByClassName('gcsc-more-maybe-branding-root');

    if (resultsRootDiv.length) {
      resultsRootDiv[0].style.padding = 0;
    }

    if (resultsDiv.length) {
      resultsDiv[0].style.padding = '10px 0';
    }

    if (resultDiv.length) {
      resultDiv[0].border = 0;
    }

    if (tabs.length) {
      tabs[0].remove();
    }

    if (headInfoArea.length) {
      headInfoArea[0].remove();
    }

    if (correctSpellingSuggestion.length) {
      const parentBox = correctSpellingSuggestion[0].closest('.gsc-result');
      if (parentBox) {
        parentBox.remove();
      }
    }

    if (paginationDiv.length) {
      paginationDiv[0].style.textAlign = 'center';
    }

    if (searchMoreGoogleFooterDiv.length) {
      searchMoreGoogleFooterDiv[0].remove();
    }

    this.hideAdsInRenderedResults();
  }

  hideAdsInRenderedResults() {
    if (this.adCheckTimer) {
      return;
    }

    let retryCount = 3;
    this.adCheckTimer = setInterval(() => {
      if (retryCount === 0) {
        clearInterval(this.adCheckTimer);
        return;
      }

      const adSectionDiv = this.resultsRootNode.getElementsByClassName('gsc-adBlock');
      if (adSectionDiv.length) {
        adSectionDiv[0].remove();
        clearInterval(this.adCheckTimer);
        return;
      }

      retryCount -= 1;
    }, 50);
  }

  setResultsContainerStyles(styles = {}) {
    const resultsDiv = this.resultsRootNode.getElementsByClassName('gsc-results');

    if (resultsDiv.length) {
      for (const [style, value] of Object.entries(styles)) {
        resultsDiv[0].style[style] = value;
      }
    }
  }

  getCurrentPageCursor() {
    const paginationDiv = this.resultsRootNode.getElementsByClassName('gsc-cursor-box');
    const selectedPage = paginationDiv[0]?.querySelector('.gsc-cursor-current-page');
    return parseInt(selectedPage?.innerText, 10);
  }

  clearResults() {
    if (!window.google) { return; }

    const search = window.google.search.cse.element.getElement(`google_${this.type}_search`);

    if (search) {
      search.clearAllResults();
    }
  }

  destroy() {
    this.clearResults();
    document.querySelector('#q-gcse-script').remove();
    window.__gcse = {};

    if (this.adCheckTimer) {
      clearInterval(this.adCheckTimer);
    }
  }
}

export default GoogleCustomSearch;

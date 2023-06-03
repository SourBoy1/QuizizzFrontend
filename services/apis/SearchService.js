import isNumber from 'lodash/isNumber';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import set from 'lodash/set';

import { nanoid } from 'nanoid';

import Analytics from '~/services/EventLoggerService';
import WebEvents from '~/config/WebEvents';
import Constants from '~/config/Constants';
import SearchConfig from '~/config/SearchConfig';
import $axios from '../AxiosService';
import LocalStorage from '../LocalStorage';
import QLogger from '../QLogger';
import SessionStorage from '../SessionStorage';

const PAGE_SIZE = 12;

export default class SearchService {
  static async getTeleportQuizzes(_pageNumber, filters, cancelToken = null) {
    const PAGE_SIZE = 12;
    const pageNumber = isNumber(_pageNumber) ? _pageNumber : 0;

    if (filters.subject && !filters.subject.includes('All')) {
      if (!Array.isArray(filters.subject)) {
        filters.subject = [filters.subject];
      }
    } else {
      filters.subject = [];
    }

    const filterList = {
      'grade_type.aggs': [],
      grades: filters.grades,
      occupation: filters.personal ? [] : ['teacher', 'teacher_school', 'teacher_university', 'other'],
      cloned: filters.cloned ? [true, false] : [false],
      'subjects.aggs': filters.subject,
      'lang.aggs': filters.langs || [],
      type: filters.type || ['quiz'],
    };

    if (!filters.personal) {
      filterList.isProfane = [true, false];
    }

    let params = {
      from: pageNumber * PAGE_SIZE,
      size: PAGE_SIZE,
      sortKey: '_score',
      personal: !!filters.personal,
      filterList: JSON.stringify(filterList),
      rangeList: JSON.stringify({
        numberOfQuestions: filters.numQuestions || [],
      }),
      sessionId: filters.sessionId,
      queryId: filters.queryId,
      source: filters.source,
      page: filters.page,
    };

    if (filters.term) {
      params.query = filters.term.trim();
    }

    if (isEmpty(filters.term) && filters.personal) {
      params = {
        from: pageNumber * PAGE_SIZE,
        size: PAGE_SIZE,
        sortKey: 'createdAt',
        filterList: JSON.stringify({
          createdBy: [filters.createdBy],
        }),
        forProfile: true,
      };
    }

    if (isEmpty(filters.scopeFilterType)) {
      filters.scopeFilterType = 'community';
    }

    let route = '/search/v1/public';
    if (filters.scopeFilterType === 'myLibrary') {
      route = '/search/v1/private';
    } else if (filters.scopeFilterType === 'myDistrict') {
      route = '/search/v1/organization';
      params.organizations = JSON.stringify((filters.organizations || []));
    }

    try {
      const data = { params };

      if (cancelToken !== null) {
        data.cancelToken = cancelToken.token;
      }
      // logging response time for event
      const start = new Date().getTime();
      const response = await $axios().get(route, data);
      const end = new Date().getTime();
      const timeTaken = end - start;
      Analytics.logEvent(
        WebEvents.SEARCH_EVENT_TELEPORT_SEARCH_RESPONSE_TIME,
        {
          queryId: SessionStorage.getItem('queryId'),
          responseTime: timeTaken,
          searchType: 'teleport',
          success: response.data.success,
        },
      );
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      if ($axios().isCancel(err)) {
        QLogger.log('Teleport search request cancelled', err);
      } else {
        QLogger.log('Error at SearchService.getTeleportQuizzes', err);
      }
    }
  }

  static async getQuizBucketQuizzes(_pageNumber, filters, cancelToken = null) {
    const PAGE_SIZE = 12;
    const pageNumber = isNumber(_pageNumber) ? _pageNumber : 0;

    const filterList = {
      'grade_type.aggs': [],
      grades: filters.grades,
      occupation: filters.personal ? [] : ['teacher', 'teacher_school', 'teacher_university', 'other'],
      cloned: filters.cloned ? [true, false] : [false],
      'subjects.aggs': filters.subjects && !filters.subjects.includes('All') ? filters.subjects : [],
      'lang.aggs': filters.langs || [],
      type: filters.type || ['quiz'],
    };

    if (!filters.personal) {
      filterList.isProfane = [true, false];
    }

    let params = {
      from: pageNumber * PAGE_SIZE,
      size: PAGE_SIZE,
      sortKey: 'createdAt',
      order: 'desc',
      personal: !!filters.personal,
      filterList: JSON.stringify(filterList),
      rangeList: JSON.stringify({
        numberOfQuestions: filters.numQuestions || [],
      }),
      sessionId: filters.sessionId,
      queryId: filters.queryId,
      source: filters.source,
      page: filters.page,
      allQuizzes: filters.allQuizzes,
    };

    if (filters.term) {
      params.query = filters.term.trim();
    }

    if (isEmpty(filters.term) && filters.personal) {
      params = {
        from: pageNumber * PAGE_SIZE,
        size: PAGE_SIZE,
        sortKey: 'createdAt',
        filterList: JSON.stringify({ type: filters.type || ['quiz'] }),
      };
    }

    if (isEmpty(filters.scopeFilterType)) {
      filters.scopeFilterType = 'community';
    }

    if (filters.scopeFilterType === 'community') {
      if (filters.term === '') {
        return { hits: [] };
      }
    }

    let route = '/search/v1/public';
    if (filters.scopeFilterType === 'myLibrary') {
      route = '/search/v1/private';
    }

    try {
      const data = { params };

      if (cancelToken !== null) {
        data.cancelToken = cancelToken.token;
      }
      const start = new Date().getTime();
      const response = await $axios().get(route, data);
      const end = new Date().getTime();
      const timeTaken = end - start;
      Analytics.logEvent(
        WebEvents.SEARCH_EVENT_QUIZ_BUCKET_SEARCH_RESPONSE_TIME,
        {
          // what is queryID from localstorage??
          queryId: SessionStorage.getItem('queryId'),
          responseTime: timeTaken,
          searchType: 'quizbucket',
          success: response.data.success,
        },
      );
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      if ($axios().isCancel(err)) {
        QLogger.log('QuizBucket search request cancelled', err);
      } else {
        QLogger.log('Error at SearchService.getQuizBucketQuizzes', err);
      }
    }
  }

  static async getAutoCompleteResults(query = '', subject = '') {
    try {
      const response = await $axios().post(`/getAutoComplete?searchTerm=${query}&subject=${subject}`, { searchTerm: query, subject });
      if (response.data.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at SearchService.getAutoCompleteResults', err);
      return null;
    }
  }

  static async getPublicQuizzes(_pageNumber, filters, page) {
    try {
      const PAGE_SIZE = filters.size || 12;
      const pageNumber = isNumber(_pageNumber) ? _pageNumber : 0;
      const cache = page === 'featured' ? Constants.SearchCacheKeys.FEATURE_PAGE_CACHE : Constants.SearchCacheKeys.SEARCH_PAGE_CACHE;
      const metaData = LocalStorage.getItem('QuizizzAnalytics') || {};

      if (filters.occupation && Array.isArray(filters.occupation) && !filters.occupation.includes('teacher')) {
        filters.occupation.push('teacher');
      }

      filters.gcse = filters?.Curriculum?.toLowerCase() === 'gcse' || filters?.term.toLowerCase().includes('gcse');

      // if (filters?.isGcse || (filters?.type && filters?.type.includes(Constants.ContentType.GCSE)) || filters?.term.toLowerCase().includes('gcse')) {
      //   filters.gcse = true;
      // } else {
      //   filters.gcse = false;
      // }

      /**
       * Prevent sending unnecessary filters
       */

      if (filters.cloned?.length === 2) {
        filters.cloned = [];
      }
      if (filters.type?.length >= 2) {
        filters.type = [];
      }
      if (filters.numQuestions?.[0] === 1 && filters.numQuestions?.[1] > 100) {
        filters.numQuestions = [];
      }

      if (filters.grade && filters.grade === 'all') {
        filters.grade = [];
      } else if (filters.grade && filters.grade !== 'all') {
        filters.grade = filters.grade.map((grade) => parseInt(grade, 10));
      }

      if (filters.subject && !filters.subject.includes('All')) {
        if (!Array.isArray(filters.subject)) {
          filters.subject = [filters.subject];
        }
      } else {
        filters.subject = [];
      }

      const params = {
        from: pageNumber * PAGE_SIZE,
        sortKey: filters.sortKey || '_score',
        filterList: JSON.stringify({
          'grade_type.aggs': [],
          grades: filters?.grades || filters?.grade,
          occupation: filters.occupation || ['teacher', 'teacher_school', 'teacher_university', 'other'],
          cloned: filters.cloned || [false],
          'subjects.aggs': filters.subject,
          'lang.aggs': filters.langs || [],
          isProfane: filters.isProfane || [false],
          type: filters.type || [],
          gcse: filters?.gcse || false,
        }),
        rangeList: JSON.stringify({
          numberOfQuestions: filters.numQuestions || [],
        }),
        order: filters.order || 'desc',
        sessionId: metaData.sessionId,
        queryId: filters.queryId,
        source: filters.source || 'HeroSearchBar',
        page: filters.page || 'FeaturedPage',
        size: PAGE_SIZE,
      };

      if (filters.avoidTranslation) {
        params.avoidTranslation = filters.avoidTranslation;
      }

      if (filters.isStandardTagged) {
        params.createdByMe = filters.createdByMe;
        params.skipStandardTagged = filters.skipStandardTagged;
      }

      let cachedResults = SessionStorage.getItem(cache) || {
        total: 0,
        hits: [],
        pageNumber: 0,
        term: filters.term,
      };

      /** Clearing cache for new search */
      if (filters?.gcse === true || cachedResults.term !== filters.term || filters.isStandardTagged || filters.noCache) {
        SessionStorage.setItem(cache, '');

        cachedResults = {
          total: 0,
          hits: [],
          pageNumber: 0,
          term: filters.term,
        };
      }

      if (filters.term) {
        params.query = filters.term;
      }

      const featuredCacheExpire = SessionStorage.getItem(`${cache}Expire`) || 0;
      const isCacheInvalid = !cachedResults || featuredCacheExpire < Date.now() || cachedResults.hits.length === 0 || cachedResults.pageNumber < pageNumber;

      if (isCacheInvalid) {
        const start = new Date().getTime();
        const response = await $axios().get('/search/v1/public', { params });
        const end = new Date().getTime();
        const timeTaken = end - start;
        Analytics.logEvent(
          WebEvents.SEARCH_EVENT_HERO_SEARCH_RESPONSE_TIME,
          {
            queryId: SessionStorage.getItem('queryId'),
            responseTime: timeTaken,
            searchType: 'public',
            success: response.data.success,
          },
        );

        cachedResults.pageNumber = pageNumber;
        cachedResults.total = response.data.data.total;
        cachedResults.hits = [...cachedResults.hits, ...response.data.data.hits];

        if (response?.data?.data?.queryTranslation) {
          Object.assign(cachedResults, { queryTranslation: get(response, 'data.data.queryTranslation'), queryLanguage: get(response, 'data.data.queryLanguage') });
        }

        SessionStorage.setItem(cache, cachedResults);
        SessionStorage.setItem(`${cache}Expire`, Date.now() + (1000 * 60 * 60 * 24));

        return response.data.data;
      }

      return cachedResults;
    } catch (err) {
      QLogger.log('Error at SearchService.getPublicQuizzes', err);
      const error = get(err, 'response.data.error', '');
      if (error === 'rateLimiter.TOO_MANY_REQUESTS') {
        return error;
      }
      return null;
    }
  }

  static async getPublicQuizzesV2(
    {
      query,
      page = 'internal',
      from = 0,
      size = PAGE_SIZE,
      source = 'internal',
      queryId = 'internal',
      internal = true,
      includeCollections = false,
    },
    filters,
    sortBy,
  ) {
    const userAppliedFilters = {};

    Object.keys(SearchConfig.FILTER_KEY_NAMES_V2).forEach((key) => {
      const filterKeyName = SearchConfig.FILTER_KEY_NAMES_V2[key];
      userAppliedFilters[filterKeyName] = filters[filterKeyName];
    });

    const params = {
      query,
      page,
      from: from * size,
      size,
      source,
      queryId,
      internal,
      filters: userAppliedFilters,
      sortBy,
      includeCollections,
    };

    const start = new Date().getTime();
    const response = await $axios().post(`/search/v2/public?includeCollections=${includeCollections}`, params);
    const end = new Date().getTime();
    Analytics.logEvent(
      WebEvents.SEARCH_EVENT_HERO_SEARCH_RESPONSE_TIME,
      {
        queryId,
        responseTime: end - start,
        searchType: 'public',
        success: response.data?.success,
      },
    );
    return response.data.data;
  }

  static async getPrivateQuizzes(_pageNumber, filters, cancelToken = null, pageSize = null) {
    const PAGE_SIZE = isNumber(pageSize) ? pageSize : Constants.LibraryPageSize;
    const pageNumber = isNumber(_pageNumber) ? _pageNumber : 0;

    const params = {
      personal: true,
      from: pageNumber * PAGE_SIZE,
      size: PAGE_SIZE,
      sortKey: filters.sortKey ? filters.sortKey : 'createdAt',
      order: filters.order || 'desc',
      createdByMe: filters.createdByMe,
      hostedQuizzes: filters.hostedQuizzes,
      draftQuizzes: filters.draftQuizzes,
      sharedWithMe: filters.sharedWithMe,
      standardTagged: filters.StandardTagging,
      allQuizzes: filters.allQuizzes,
      queryId: filters.queryId,
      cloned: filters.cloned,
      filterList: {
        tags: Array.isArray(filters.tags) ? filters.tags : [],
        type: filters.type || [],
      },
      _: nanoid(6),
    };

    if (filters.subjects && filters.subjects.length > 0) {
      params.filterList['subjects.aggs'] = filters.subjects;
    }

    if (filters.grades && filters.grades.length > 0) {
      params.filterList.grades = filters.grades;
    }

    params.filterList = JSON.stringify(params.filterList);
    if (filters.term) {
      params.query = filters.term;
    }

    if (!isEmpty(filters?.tags) && filters.tags[0] === 'liked') {
      params.sortKey = 'updated';
      params.order = 'desc';
      params.filterList = JSON.stringify({
        tags: ['__love__'],
      });
    }

    try {
      const data = { params };

      if (cancelToken !== null) {
        data.cancelToken = cancelToken.token;
      }
      const response = await $axios().get('/search/v1/private', data);
      return response.data.data;
    } catch (err) {
      QLogger.log('Error at SearchService.getPrivateQuizzes', err);

      return null;
    }
  }

  static async getQuizzesCount() {
    try {
      const params = {
        likedQuizzes: true,
        hostedQuizzes: true,
        createdQuizzes: true,
        standardTaggedQuizzes: true,
        draftQuizzes: true,
        sharedQuizzes: true,
      };
      const response = await $axios().get('/search/v1/quizCountsByTag', { params });

      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      if ($axios().isCancel(error)) {
        QLogger.log('My Library request cancelled', error);
      } else {
        QLogger.log('Error at SearchService.getPrivateQuizzes', error);
      }

      return null;
    }
  }

  static async searchSharedLibraryContents(searchModifiers, orgIds, cancelToken = null, searchTerm = '') {
    const { filters } = searchModifiers;
    const PAGE_SIZE = 10;
    const pageNumber = isNumber(searchModifiers.pageNumber) ? searchModifiers.pageNumber : 0;

    const params = {
      from: pageNumber * PAGE_SIZE,
      size: PAGE_SIZE,
      sortKey: filters.sortKey || 'createdAt',
      order: filters.order || 'desc',
      query: searchTerm,
      queryId: filters.queryId,
      filterList: {
        tags: Array.isArray(filters.tags) ? filters.tags : [],
        type: filters.type || [],
      },
      _: nanoid(6),
    };

    params.filterList = JSON.stringify(params.filterList);
    if (filters.term) {
      params.query = filters.term;
    }

    try {
      const data = { params };

      if (cancelToken !== null) {
        data.cancelToken = cancelToken.token;
      }

      const searchForSharedLibraryURL = '/search/v1/organization';

      const response = await $axios().post(searchForSharedLibraryURL, {
        orgIds,
      }, {
        params,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at SearchService.searchSharedLibraryContents', err);

      return null;
    }
  }

  static async getRecommemdedSndQuizzes(_pageNumber = 0, grades, subjects, _pageSize) {
    const PAGE_SIZE = _pageSize ?? 12;
    const FROM = _pageNumber * PAGE_SIZE;
    try {
      const body = {};
      set(body, 'size', PAGE_SIZE);
      set(body, 'grades', grades ?? []);
      set(body, 'subjects', subjects ?? []);
      set(body, 'from', FROM);

      const response = await $axios().post('/v1/recommendation/snd/teachers', body);
      if (response.data.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at SearchService.getRecommemdedSndQuizzes', err);
      return null;
    }
  }

  static async getQuizNames(groupIds, searchKey = 'quizId') {
    try {
      const filterList = {
        gameState: ['completed', 'running', 'waiting', 'stopped'],
      };

      const response = await $axios().get('/v2/aggregates/counts', {
        params: {
          filterList,
          groupIds: JSON.stringify(groupIds),
          key: searchKey,
        },
      });
      const result = response.data;
      if (result.success) {
        return result.data.quizzes;
      }
      return [];
    } catch (err) {
      QLogger.log('Error at SearchService.getQuizNames', err);
    }
  }

  static async getImportedQuizzes(sortKey = 'createdAt', order = 'desc') {
    try {
      const response = await $axios().get(`/quiz/imported?sortKey=${sortKey}&order=${order}`);
      return {
        success: true,
        data: get(response, 'data.data.quizzes', []),
      };
    } catch (error) {
      QLogger.log('Error at SearchService.getQuizNames', error);
    }
  }

  static async getNonStandardTaggedQuizRecommendationsForUser({ from = 0, size = 12 }) {
    try {
      const response = await $axios().get(
        `/v1/recommendation/non-standard-tagged?from=${from}&size=${size}`,
      );
      return response.data.data;
    } catch (error) {
      QLogger.log(
        'Error at SearchService.getNonStandardTaggedQuizRecommendationsForUser',
        error,
      );
    }
  }
}

import defaultsDeep from 'lodash/defaultsDeep';
import has from 'lodash/has';

import store, { storeReady } from '../store/index.js';

import Structure from './Structure.js';

export default function Question(values = {}, check = true) {
  const newQuestion = defaultsDeep(
    {
      ...values,
      structure: has(values, 'structure') ? Structure(values.structure) : Structure(),
    },
    {
      type: 'MCQ',
      structure: Structure(values?.structure),
      index: -1,
      _id: '',
      startedAt: '',
      updated: '',
      createdAt: '',
      time: 30000,
      v: 0,
      clones: [],
      parent: '',
      cloned: false,
      published: false,
      deleted: false,
      isSuperParent: false,
      teleportFrom: '',
      metaData: {},
      topics: [],
      standards: [],
      marksUpdated: false,
    },
  );
  if (check && newQuestion.structure.kind === '') {
    let errorStack = Error('KE').stack;
    if (errorStack?.includes('selectSlideById') && errorStack?.includes('resetSlideEditor')) {
      errorStack = 'resetCall by selectSlideById';
    } else if (errorStack?.includes('createQuizQuestion') && errorStack?.includes('saveQuizQuestion')) {
      errorStack = 'inside CreateQuizQuestions';
    } else if (errorStack) {
      errorStack = errorStack.split(/[ \n]+/).filter((item) => !item.includes('https') && item !== 'at').join('-');
    }
    storeReady && store.dispatch('analyticsManager/addBreadcrumb', `KE:${errorStack}`);
    storeReady && store.dispatch('analyticsManager/addBreadcrumb', `D:${JSON.stringify(newQuestion)}`);
  } else if (!check) {
    storeReady && store.dispatch('analyticsManager/addBreadcrumb', 'Reset or Expected Empty');
  }
  return newQuestion;
}

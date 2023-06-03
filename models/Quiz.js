import defaultsDeep from 'lodash/defaultsDeep';
import has from 'lodash/has';

import QuizStats from './QuizStats.js';
import CreatedBy from './CreatedBy.js';
import QuizVersion from './QuizVersion.js';

export default function Quiz(values) {
  return defaultsDeep({
    ...values,
    stats: has(values, 'stats') ? QuizStats(values.stats) : QuizStats(),
    createdBy: has(values, 'createdBy') ? CreatedBy(values.createdBy) : CreatedBy(),
    draft: has(values, 'draft') ? QuizVersion(values.draft) : QuizVersion(),
    info: has(values, 'info') ? QuizVersion(values.info) : QuizVersion(),
  }, {
    isTagged: false,
    isLoved: false,
    stats: QuizStats(values?.stats),
    love: 0,
    cloned: false,
    parentDetail: null,
    deleted: false,
    draftVersion: '',
    publishedVersion: null,
    isShared: false,
    type: 'quiz',
    _id: '',
    createdBy: CreatedBy(values?.createdBy),
    createdAt: '',
    updated: '',
    hasPublishedVersion: false,
    hasDraftVersion: false,
    stateStandards: [],
    lock: null,
    draft: QuizVersion(values?.draft),
    info: QuizVersion(values?.info),
    isSuper: false,
    tagIds: [],
  });
}

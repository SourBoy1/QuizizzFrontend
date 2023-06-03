import MutationTypes from '~/config/MutationTypes';
import * as Sentry from '@sentry/vue';
import { isSentryEnabled } from './EnvUtils';

/**
 * This plugin sets breadcrumbs that will be added to errors that are logged
 * to sentry.
 */
export default (store) => {
  if (isSentryEnabled()) {
    store.subscribe((mutation, state) => {
      createBreadcrumbs(state, mutation, store);
    });
  }
};

function createBreadcrumbs(state, mutation, context) {
  switch (mutation.type) {
    case MutationTypes.contentEditor.SET_QUIZ:
      const quizId = store.getters['contentEditor/quizId'] || '';
      Sentry.setContext('lesson', {
        id: quizId,
      });

      break;

    case MutationTypes.slideEditor.SET_SLIDE:
      const currentQuestionId = store.getters['slideEditor/currentQuestionId'] || '';
      Sentry.setContext('lesson', {
        currentQuestionId,
      });
      break;
    default:
  }
}

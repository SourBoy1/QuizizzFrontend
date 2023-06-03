import dayjs from 'dayjs';

import EventBus from '~/services/EventBus';
import $store from '~/services/StoreService';
import LocalStorage from './LocalStorage';

const stateName = 'QzFeedback';

export function initializePeekabooState(_store) {
  const randomNumber = generateRandomNumberInRange(100);
  const { user } = $store(_store).getters;
  const isValidRoute = checkRouteForPeekaboo();

  if (randomNumber === 0 && user && user.id && isValidRoute) {
    const userCreatedAt = user.createdAt;

    const daysElapsedSinceAccountCreated = daysSince(userCreatedAt);

    // User should be at least 1 month old to show him this survey
    if (daysElapsedSinceAccountCreated < 30) {
      emitCloseEvent();
      return;
    }

    const storedData = getInfoFromLocalStorage();
    if (!storedData) {
      initInfoInLocalStorage();
    } else {
      const { closed, linkClicked } = getInfoFromLocalStorage();
      if (closed) {
        const daysElapsedSinceClosed = daysSince(closed);

        // User should not see this survey if he had explicitly closed it less than 1 month ago
        if (daysElapsedSinceClosed < 30) {
          emitCloseEvent();
          return;
        }
      }

      if (linkClicked) {
        const daysElapsedSinceLinkClicked = daysSince(linkClicked);

        // User should not see this survey if he had clicked the link less than 3 months ago
        if (daysElapsedSinceLinkClicked < 90) {
          emitCloseEvent();
          return;
        }
      }
    }

    emitOpenEvent();
  } else {
    emitCloseEvent();
  }
}

export function peekabooClose() {
  emitCloseEvent();
  setClosedInLocalStorage();
}

export function peekabooLinkClicked() {
  emitCloseEvent();
  setLinkClickedInLocalStorage();
}

function checkRouteForPeekaboo() {
  const route = window.location.pathname;
  const visibleRoutes = ['/admin/private', '/admin/quiz', '/quiz/creator', '/admin/search', '/admin/presentation', '/presentation', '/admin'];

  return visibleRoutes.map((item) => route.includes(item)).includes(true);
}

function getInfoFromLocalStorage() {
  return LocalStorage.getItem(stateName);
}

function initInfoInLocalStorage() {
  const payload = {
    closed: null,
    linkClicked: null,
  };

  LocalStorage.setItem(stateName, payload);
}

function setClosedInLocalStorage() {
  const data = getInfoFromLocalStorage();
  const payload = {
    ...data,
    closed: Date.now(),
  };
  LocalStorage.setItem(stateName, payload);
}

function setLinkClickedInLocalStorage() {
  const data = getInfoFromLocalStorage();
  const payload = {
    ...data,
    linkClicked: Date.now(),
  };
  LocalStorage.setItem(stateName, payload);
}

function emitCloseEvent() {
  EventBus.$emit('closeFeedbackPeekaboo');
}

function emitOpenEvent() {
  EventBus.$emit('openFeedbackPeekaboo');
}

function daysSince(d) {
  const date = dayjs(d);
  const today = dayjs(new Date());

  return today.diff(date, 'days');
}

function generateRandomNumberInRange(range) {
  return Math.floor(Math.random() * range);
}

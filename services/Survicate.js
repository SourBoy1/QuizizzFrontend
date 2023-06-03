import get from 'lodash/get';

import store from '~/store/index';
import UserService from '~/services/UserService';

export function generateSurvey(w) {
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = 'https://survey.survicate.com/workspaces/2a50f0af5a012d8731a3fc51fa5575bc/web_surveys.js';
  s.setAttribute('defer', '');
  const e = document.getElementsByTagName('script')[0];
  e.parentNode.insertBefore(s, e);
}

export function setVisitorTraits(opts) {
  const user = new UserService(store.getters['root/user']);
  const serverData = store.getters['root/serverData'];

  let plan = 'basic';
  if (user?.subscriptions) {
    plan = user?.subscriptions[0]?.planName;
  }

  const isNewUser = new Date() - new Date(user?.createdAt) <= (24 * 60 * 60 * 1000); // Less than a day

  opts.traits = {
    user_id: user?.id,
    occupation: user?.occupation,
    country: serverData?.requestCountry,
    isSnd: user?.currentPlanStatus?.status === 'snd',
    plan,
    quizCreated: get(user, 'contentMetrics.draft.quiz', 0) + get(user, 'contentMetrics.published.quiz', 0),
    presentationCreated: get(user, 'contentMetrics.draft.presentation', 0) + get(user, 'contentMetrics.published.presentation', 0),
    quizPublished: get(user, 'contentMetrics.published.quiz', 0),
    presentationPublished: get(user, 'contentMetrics.published.presentation', 0),
    hasClasses: get(user, 'groups.length', 0) > 0,
    gamesCreated: get(user, 'stats.gamesCreated', 0),
    gamesStarted: get(user, 'stats.gamesStarted', 0),
  };

  if (isNewUser) {
    opts.traits.newUser = true;
  }
}

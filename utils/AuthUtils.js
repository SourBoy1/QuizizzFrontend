import Constants from '~/config/Constants';
import featureFlags from '~/services/FeatureFlagsService.js';
import UrlUtils from './UrlUtils';

function query() {
  return UrlUtils.parse(window.location.href).query;
}

export function getRedirectionRoute(occupation) {
  const routeMap = {
    teacher: '/admin',
    instructional_tech_coach: '/admin',
    department_head: '/admin',
    school_admin: '/admin',
    district_admin: '/admin',
    other: '/admin',
    teacher_school: '/admin',
    teacher_university: '/admin',
    student: '/join',
    parent: '/admin',
    corporate: '/admin',
    corporate_teacher: '/admin',
    corporate_learner: '/pro/join',
  };

  return routeMap[occupation] || '/admin';
}

const whitelists = {
  teacher: ['/admin', '/profile', '/settings', '/admin/quiz', '/quiz/creator', '/presentation', '/lesson', '/referral', '/join-organization', '/contest', '/super-trainer', '/join/lesson'],
  student: ['/join', '/quiz/creator', '/admin/quiz', '/contest'],
  parent: ['/admin', '/contest'],
  corporate: ['/admin', '/contest'],
};

export function isValidRedirectURLForOccupation(url, occupation) {
  if (typeof whitelists[occupation] === 'undefined') {
    return true;
  }

  const whitelist = whitelists[occupation];
  return url && whitelist.reduce((exist, curr) => exist || url.lastIndexOf(curr, 0) === 0, false);
}

export function showSignupSuccess(redirectUrl, occupation, user) {
  if (user?.id && Constants.TeacherOccupations.includes(occupation)) {
    processRegisterEventForReferrals(user);
  }

  const queryParam = query();
  let validRedirectUrl = true;
  let validQueryParam = true;

  const isMobileRedirectURL = function (url) {
    // Return true if mr is present
    const matchMobileRedirect = /quizizz(game)?:\/\/(open\/)?redirectapp/;
    if (url && !!url.match(matchMobileRedirect)) {
      return true;
    }
    return false;
  };

  if (typeof whitelists[occupation] !== 'undefined') {
    if (redirectUrl && !isValidRedirectURLForOccupation(decodeURIComponent(redirectUrl), occupation)) {
      validRedirectUrl = false;
    }

    if (queryParam.q && !isValidRedirectURLForOccupation(decodeURIComponent(queryParam.q), occupation)) {
      validQueryParam = false;
    }
  }

  if (queryParam.q && validQueryParam && ['game-group-join-link', 'signup-from-header-classes', 'signup-from-class-link-without-code', 'prompt-showAnswer'].includes(queryParam.source)) {
    window.location = decodeURIComponent(queryParam.q);
  } else if (redirectUrl && isMobileRedirectURL(decodeURIComponent(redirectUrl))) {
    window.location = decodeURIComponent(redirectUrl);
  } else if (queryParam.q && validQueryParam) {
    window.location = decodeURIComponent(queryParam.q);
  } else if (redirectUrl && validRedirectUrl) {
    window.location = decodeURIComponent(redirectUrl);
  } else if (occupation === Constants.UserOccupation.CORPORATE_TEACHER) {
    window.location = '/forwork/plans';
  } else if (occupation === Constants.UserOccupation.CORPORATE_LEARNER) {
    window.location = '/pro/join?newUser=true';
  } else if (occupation === Constants.UserOccupation.STUDENT) {
    window.location = '/join?newUser=true';
  } else {
    window.location = '/admin?newUser=true';
  }
}

export function injectInviteReferralsScript(user) {
  return new Promise((resolve, reject) => {
    if (document.getElementById('invtrflfloatbtn') === null) {
      const inviteReferralsDiv = document.createElement('div');
      inviteReferralsDiv.setAttribute('id', 'invtrflfloatbtn');
      document.body.appendChild(inviteReferralsDiv);
    }

    if (!window.ir || !window.invite_referrals) {
      // eslint-disable-next-line func-names
      window.ir = window.ir || function () {
        (window.ir.q = window.ir.q || []).push(arguments);
      };

      window.invite_referrals = window.invite_referrals || {};
      window.invite_referrals.auth = {
        bid_e: '529F9ECECB14E579D0B6CA880B9A9B9C',
        bid: '47836',
        t: '420',
        email: user?.email || '',
        userParams: { fname: user?.firstName || '' },
        userCustomParams: { customValue: user?.email || '' },
      };

      window.invite_referrals.async = true;
      const script = document.createElement('script');
      script.src = 'https://cf.quizizz.com/thirdparty/invite_referrals_lib.js';
      script.onload = () => {
        window.invite_referrals.manual.launch();
        if (resolve) {
          resolve();
        }
      };
      script.onerror = () => { reject && reject(); };
      const entry = document.getElementsByTagName('script')[0];
      entry.parentNode.insertBefore(script, entry);
    } else {
      resolve && resolve();
    }
  });
}

export function processRegisterEventForReferrals(user) {
  const featureFlagHelper = featureFlags();
  if (featureFlagHelper.isDisabled(Constants.FeatureFlagsTypes.REFERRALS) && featureFlagHelper.isDisabled(Constants.FeatureFlagsTypes.US_SUPER)) {
    return;
  }

  const email = user.email || user.local.email || user.phoneNumber || user.local.phoneNumber;
  const name = `${user.firstName} ${user.lastName}`;
  const event = 'register';
  const country = window.requestCountry;
  trackReferral(email, event, name, email, '', country);
}

export function processContestParticipationEvent(user) {
  const email = user.email || user.local.email || user.phoneNumber || user.local.phoneNumber;
  const name = `${user.firstName} ${user.lastName}`;
  const event = 'Participation';
  const country = window.requestCountry;
  trackReferral(email, event, name, email, '', country);
}

export function processUserActivationEvent(user) {
  const featureFlagHelper = featureFlags();
  if (featureFlagHelper.isDisabled(Constants.FeatureFlagsTypes.REFERRALS) && featureFlagHelper.isDisabled(Constants.FeatureFlagsTypes.US_SUPER)) {
    return;
  }

  const email = user.email || user.local.email || user.phoneNumber || user.local.phoneNumber;
  const name = `${user.firstName} ${user.lastName}`;
  const event = 'Activation';
  const country = window.requestCountry;
  trackReferral(email, event, name, email, '', country);
}

export function trackReferral(orderId, event, name, email, mobile, orderCustomVal) {
  const data = {
    orderID: orderId,
    event,
    fname: name,
    email,
    mobile,
    orderCustomVal,
  };

  if (window.ir) {
    window.ir('track', data);
  }
}

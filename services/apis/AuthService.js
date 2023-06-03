import get from 'lodash/get';

import CookieService from '~/services/CookieService';
import MSTeams from '~/services/MSTeams';
import OTPConstants from '~/config/OTP';
import { getNetworkErrorCause, getNetworkErrorType } from '~/utils/Utilities';
import Constants from '~/config/Constants';
import WebEvents from '~/config/WebEvents';
import $axios from '../AxiosService';
import QLogger from '../QLogger';
import URLS from '../../config/BaseURLs';
import getRouter from '../router';

import { getEnvironmentEnv } from '../../utils/EnvUtils';

import EventLoggerService from '../EventLoggerService';

const FACEBOOK_CLIENT_ID = 1589541687945427;
const APPLE_CLIENT_ID = 'com.quizizz.web';

function getAxios(_axios) {
  let axios = null;
  if ($axios()) {
    axios = $axios();
  } else {
    axios = _axios;
  }
  return axios;
}

async function getRequestIdForFacebook(redirectUrl) {
  try {
    const CSRFToken = CookieService.get('x-csrf-token');

    const response = await $axios().get(
      `/facebook/state${redirectUrl}`,
      {
        headers: { 'x-csrf-token': CSRFToken },
      },
    );

    const result = response.data;
    if (result.success) {
      return result;
    }
    return null;
  } catch (err) {
    QLogger.log('Error at AuthService.login', err);
    return err.response;
  }
}

export default class AuthService {
  static async login(username, password, requestId) {
    const data = {
      username,
      password,
      requestId,
    };

    try {
      const CSRFToken = CookieService.get('x-csrf-token');

      const response = await $axios().post(
        '/auth/local',
        data,
        {
          headers: { 'x-csrf-token': CSRFToken },
        },
      );

      const result = response.data;
      if (result.success) {
        return result;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at AuthService.login', err);
      return err.response;
    }
  }

  static async checkEmailAvail(email) {
    try {
      const response = await $axios().get(`/user/checkUserEmailAvail?email=${encodeURIComponent(email)}`);
      const result = response.data;
      if (result.success) {
        return result;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at AuthService.login', err);
      return err.response;
    }
  }

  static async updatePassword(password) {
    try {
      const CSRFToken = CookieService.get('x-csrf-token');

      const response = await $axios().post(
        '/user/updatePassword',
        password,
        {
          headers: { 'x-csrf-token': CSRFToken },
        },
      );

      return { success: true, data: response };
    } catch (err) {
      QLogger.log('Error at AuthService.resetPassword', err);

      return { success: false, data: err.response };
    }
  }

  static async checkUserNameAvail(username) {
    try {
      const response = await $axios().get(`/user/checkUserNameAvail?username=${username}`);
      const result = response.data;
      if (result.success) {
        return result;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at AuthService.login', err);
      return err.response;
    }
  }

  static async handleGoogleLogin(query) {
    await EventLoggerService.logEvent('signup_flow', {
      action_name: 'login_google_click',
      authentication: 'google',
      source: query.source,
      page: 'login_type_select',
    });
    let url = '/auth/google?ref=login';
    const q = get(query, 'q', '');
    const state = get(query, 'state', '');

    if (q) {
      url += (`&q=${q}`);
    } else {
      url += `&q=${window.location.pathname}`;
    }

    if (state) {
      url += (`&requestId=${state}`);
    }

    const baseUrl = URLS.API_SERVER[getEnvironmentEnv()];

    if (MSTeams.isTeamApp()) {
      await MSTeams.initiateAuthFlow(baseUrl + url).catch((error) => {
        QLogger.log('Error at AuthService.handleGoogleLogin', error);
      });
      window.location.reload();
    } else {
      window.location = baseUrl + url;
    }
  }

  static async handleMsLogin(query) {
    await EventLoggerService.logEvent('signup_flow', {
      action_name: 'login_microsoft_click',
      authentication: 'microsoft',
      source: query.source,
      page: 'login_type_select',
    });
    let url = '/auth/microsoft?ref=login';
    const q = get(query, 'q', '');
    const state = get(query, 'state', '');

    if (q) {
      url += (`&q=${q}`);
    } else {
      url += `&q=${window.location.pathname}`;
    }

    if (state) {
      url += (`&requestId=${state}`);
    }

    const baseUrl = URLS.API_SERVER[getEnvironmentEnv()];

    if (MSTeams.isTeamApp()) {
      const { success } = await MSTeams.initiateSSOAuth();

      if (!success) {
        await MSTeams.initiateAuthFlow(baseUrl + url).catch((error) => {
          QLogger.log('Error at AuthService.handleMsLogin', error);
        });
      }

      window.location.reload();
    } else {
      window.location = baseUrl + url;
    }
  }

  static async handleGoogleSignup(isGDPRCountry, isCountryCanada, query, fromMobileApp, isCommsChecked) {
    await EventLoggerService.logEvent('signup_flow', {
      action_name: 'signup_google_click',
      authentication: 'google',
      source: query.source || '',
      previous_source: query.previousSource || '',
      fromPage: query.fromPage || '',
      page: 'signup_type_select',
    });

    this.redirectToGoogle(`${window.location.pathname}${window.location.search}`, query, fromMobileApp, isGDPRCountry, isCountryCanada, isCommsChecked);
  }

  static async handleMSSignup(isGDPRCountry, isCountryCanada, query, fromMobileApp, isCommsChecked) {
    await EventLoggerService.logEvent('signup_flow', {
      action_name: 'signup_ms_click',
      authentication: 'microsoft',
      source: query.source || '',
      previous_source: query.previousSource || '',
      fromPage: query.fromPage || '',
      page: 'signup_type_select',
    });

    this.redirectToMS(`${window.location.pathname}${window.location.search}`, query, fromMobileApp, isGDPRCountry, isCountryCanada, isCommsChecked);
  }

  static async handleFacebookSignup(isGDPRCountry, isCountryCanada, query, fromMobileApp, isCommsChecked) {
    await EventLoggerService.logEvent(WebEvents.SIGNUP_FLOW, {
      action_name: 'signup_fb_click',
      authentication: 'facebook',
      source: query.source || '',
      previous_source: query.previousSource || '',
      fromPage: query.fromPage || '',
      page: getRouter()?.currentRoute?.value?.name,
    });

    await this.redirectToFacebook(`${window.location.pathname}${window.location.search}`, query, fromMobileApp, isGDPRCountry, isCountryCanada, isCommsChecked);
  }

  static async handleAppleSignup(query, fromMobileApp) {
    await EventLoggerService.logEvent(WebEvents.SIGNUP_FLOW, {
      action_name: 'signup_apple_click',
      authentication: 'apple',
      source: query.source || '',
      previous_source: query.previousSource || '',
      fromPage: query.fromPage || '',
      page: getRouter()?.currentRoute?.value?.name,
    });

    await this.redirectToApple(`${window.location.pathname}${window.location.search}`, query, fromMobileApp);
  }

  static async redirectToGoogle(currentPath, query, fromMobileApp, isGDPRCountry, isCountryCanada, isCommsChecked) {
    const params = new URLSearchParams();
    params.set('ref', 'signup');

    if (query.q) {
      params.set('q', query.q);
    } else {
      params.set('q', currentPath);
    }

    if (query.inviter) {
      params.set('inviter', query.inviter);
    }

    if (query.source && query?.source !== Constants.SignupSources.SHOW_ANSWERS) {
      params.set('source', query.source);
    }

    if (fromMobileApp || decodeURIComponent(query.source) === 'share-resource') {
      params.set('requestId', query.state);
    }

    // Send communication preference flag for the GDPR signups
    if (isGDPRCountry || isCountryCanada) {
      params.set('commsPreference', isCommsChecked);
    }

    const baseUrl = URLS.API_SERVER[getEnvironmentEnv()];
    const platformSource = {
      deviceType: window?.navigator?.userAgentData?.mobile ? 'mobile' : 'desktop',
      ctaSource: query.ctaSource,
      OS: window?.navigator?.userAgentData?.platform,
      page: query.fromPage,
      medium: 'google',
    };
    const redirectLink = `${baseUrl}/auth/google?${params.toString()}&platformSource=${encodeURIComponent(JSON.stringify(platformSource))}`;

    if (MSTeams.isTeamApp()) {
      await MSTeams.initiateAuthFlow(redirectLink).catch((error) => {
        QLogger.log('Error at AuthService.redirectToMS', error);
      });
      window.location.reload();
    } else {
      window.location = redirectLink;
    }
  }

  static async redirectToFacebook(currentPath, query, fromMobileApp) {
    if (MSTeams.isTeamApp()) {
      window.location.reload();
    } else {
      const params = new URLSearchParams();
      if (query.q) {
        params.set('q', query.q);
      } else {
        params.set('q', currentPath);
      }
      if (query.source && query?.source !== Constants.SignupSources.SHOW_ANSWERS) {
        params.set('source', query.source);
      }
      if (query.inviter) {
        params.set('inviter', query.inviter);
      }
      if (fromMobileApp || decodeURIComponent(query.source) === 'share-resource') {
        params.set('requestId', query.state);
      }
      const platformSource = {
        deviceType: window?.navigator?.userAgentData?.mobile ? 'mobile' : 'desktop',
        ctaSource: query.ctaSource,
        OS: window?.navigator?.userAgentData?.platform,
        page: query.fromPage,
        medium: 'facebook',
      };

      const savedStateForFacebook = await getRequestIdForFacebook(`?${params.toString()}&platformSource=${encodeURIComponent(JSON.stringify(platformSource))}`);
      let savedRequestId = '';
      let redirectLink = '';
      if (savedStateForFacebook?.data?.stateId) {
        savedRequestId = `&state=${savedStateForFacebook?.data?.stateId}`;
      }
      if (savedStateForFacebook?.data?.redirectLink) {
        redirectLink = savedStateForFacebook?.data?.redirectLink || 'https://quizizz.com';
      }

      window.location = `https://www.facebook.com/v15.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${redirectLink}/auth/facebook&scope=email,public_profile${savedRequestId}`;
    }
  }

  static redirectToClasslink(currentPath, query, fromMobileApp) {
    const params = new URLSearchParams();
    if (query.q) {
      params.set('q', query.q);
    } else {
      params.set('q', currentPath);
    }
    if (query.source && query?.source !== Constants.SignupSources.SHOW_ANSWERS) {
      params.set('source', query.source);
    }
    if (query.inviter) {
      params.set('inviter', query.inviter);
    }
    if (fromMobileApp || decodeURIComponent(query.source) === 'share-resource') {
      params.set('requestId', query.state);
    }
    const platformSource = {
      deviceType: window?.navigator?.userAgentData?.mobile ? 'mobile' : 'desktop',
      ctaSource: query.ctaSource,
      OS: window?.navigator?.userAgentData?.platform,
      page: query.fromPage,
      medium: 'classlink',
    };

    const baseUrl = URLS.API_SERVER[getEnvironmentEnv()];

    const redirectLink = `${baseUrl}/auth/classlink?${params.toString()}&platformSource=${encodeURIComponent(JSON.stringify(platformSource))}`;

    window.location = redirectLink;
  }

  static async redirectToApple(currentPath, query, fromMobileApp) {
    if (MSTeams.isTeamApp()) {
      window.location.reload();
    } else {
      const params = new URLSearchParams();
      if (query.q) {
        params.set('q', query.q);
      } else {
        params.set('q', currentPath);
      }
      if (query.source && query?.source !== Constants.SignupSources.SHOW_ANSWERS) {
        params.set('source', query.source);
      }
      if (query.inviter) {
        params.set('inviter', query.inviter);
      }
      if (fromMobileApp || decodeURIComponent(query.source) === 'share-resource') {
        params.set('requestId', query.state);
      }
      const platformSource = {
        deviceType: window?.navigator?.userAgentData?.mobile ? 'mobile' : 'desktop',
        ctaSource: query.ctaSource,
        OS: window?.navigator?.userAgentData?.platform,
        page: query.fromPage,
        medium: 'apple',
      };

      // using facebook saved state because it does the same thing in backend and save query and return a state number to associate the query when required in backend
      const savedStateForApple = await getRequestIdForFacebook(`?${params.toString()}&platformSource=${encodeURIComponent(JSON.stringify(platformSource))}`);
      let savedRequestId = '';
      if (savedStateForApple?.data?.stateId) {
        savedRequestId = `&state=${savedStateForApple?.data?.stateId}`;
      }

      const baseUrl = URLS.API_SERVER[getEnvironmentEnv()].includes('dev.quizizz.com') ? 'https%3A%2F%2Fdev.quizizz.com' : 'https%3A%2F%2Fquizizz.com';
      window.location = `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${baseUrl}%2F_api%2Fmain%2Fauth%2Fapple%2Fweb&response_type=code%20id_token&scope=name%20email&response_mode=form_post${savedRequestId}`;
    }
  }

  static async redirectToMS(currentPath, query, fromMobileApp, isGDPRCountry, isCountryCanada, isCommsChecked) {
    const params = new URLSearchParams();
    params.set('ref', 'signup');

    if (query.q) {
      params.set('q', query.q);
    } else {
      params.set('q', currentPath);
    }

    if (query.inviter) {
      params.set('inviter', query.inviter);
    }

    if (query.source && query?.source !== Constants.SignupSources.SHOW_ANSWERS) {
      params.set('source', query.source);
    }

    if (fromMobileApp || decodeURIComponent(query.source) === 'share-resource') {
      params.set('requestId', query.state);
    }

    // Send communication preference flag for the GDPR signups
    if (isGDPRCountry || isCountryCanada) {
      params.set('commsPreference', isCommsChecked);
    }

    const platformSource = {
      deviceType: window?.navigator?.userAgentData?.mobile ? 'mobile' : 'desktop',
      ctaSource: query.ctaSource,
      OS: window?.navigator?.userAgentData?.platform,
      page: query.fromPage,
      medium: 'google',
    };

    const baseUrl = URLS.API_SERVER[getEnvironmentEnv()];
    const redirectLink = `${baseUrl}/auth/microsoft?${params.toString()}&platformSource=${encodeURIComponent(JSON.stringify(platformSource))}`;

    if (MSTeams.isTeamApp()) {
      const { success, error } = await MSTeams.initiateSSOAuth();

      if (!success || error) {
        await MSTeams.initiateAuthFlow(redirectLink).catch((err) => {
          QLogger.log('Error at AuthService.handleMsLogin', err);
        });
      }

      window.location.reload();
    } else {
      window.location = redirectLink;
    }
  }

  static async authMSUserWithSSOToken(token) {
    const baseUrl = URLS.API_SERVER[getEnvironmentEnv()];
    const { success, error, message } = await $axios().get(`${baseUrl}/auth/microsoft/from-token?token=${token}`).catch((err) => err.response.data);

    // console.log(response);

    return { success, error, message };
  }

  static async getCurrentUser(_axios) {
    try {
      /**
       * Passing axios from the middleware because $axios isn't available at this point in Nuxt's lifecycle
       * Middlewares are run before plugins
       */
      let axios = null;
      if ($axios()) {
        axios = $axios;
      } else {
        axios = _axios;
      }

      const response = await axios().get('/user?subscriptionData=true');
      const userData = get(response, 'data.data.user', null);
      return userData;
    } catch (err) {
      QLogger.log('Error at AuthService.getCurrentUser', err);
    }
  }

  static async createPasswordReset(email, _axios) {
    const axios = getAxios(_axios);

    try {
      const response = await axios.post('/user/resetPasswordLink', { email });
      return {
        success: true,
        data: { status: 200, ...response.data?.data },
      };
    } catch (err) {
      if (err.response.status === 404) {
        return {
          success: false,
          data: { status: 400 },
        };
      }
      QLogger.log('Error at AuthService.createPasswordReset', err);
      return {
        success: false,
        err,
      };
    }
  }

  static async createPasswordResetTicket(email, _axios) {
    const axios = getAxios(_axios);

    try {
      await axios.post('/auth/forgotPasswordTicket', { email });
      return 'success';
    } catch (err) {
      QLogger.log('Error at AuthService.createPasswordResetTicket', err);
      return 'error';
    }
  }

  static async OTPAction(phoneNumber, type, action, _axios, otp) {
    const axios = getAxios(_axios);

    const isActionInvalid = OTPConstants.ValidOTPActions[action] === undefined || OTPConstants.OTPRequestTypes[type] === undefined;

    QLogger.invariant(!isActionInvalid, 'Invalid OTP action performed');

    try {
      const res = await axios.get(`/auth/${action}/${OTPConstants.OTPRequestTypes[type]}`, {
        params: {
          phoneNumber,
          otp,
        },
      });

      if (type === 'verifyOtpAndRedirect') {
        window.location.replace(res.request.responseURL);
      }

      return {
        success: true,
        data: {
          status: 'success',
        },
      };
    } catch (err) {
      const errorCause = getNetworkErrorCause(err, '');
      QLogger.log('Error at AuthService.OTPAction', err);
      return {
        success: false,
        error: { cause: errorCause },
      };
    }
  }

  static async verifyPasswordResetToken(token, _axios) {
    const axios = getAxios(_axios);
    try {
      await axios.get('/auth/verifyToken', { params: { token } });
      return {
        success: true,
        data: {
          status: 'success',
        },
      };
    } catch (err) {
      QLogger.log('Error at AuthService.verifyPasswordResetToken', err);
      const cause = getNetworkErrorCause(err, '');
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }

  static async resetPassword(password, t, _axios) {
    const axios = getAxios(_axios);
    try {
      await axios.post('/user/resetPassword', { password, t });
      return {
        success: true,
        data: {
          status: 'success',
        },
      };
    } catch (err) {
      QLogger.log('Error at AuthService.resetPassword', err);
      const cause = getNetworkErrorCause(err, '');
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }

  static async requestForDeactivationByEmail(email, _axios) {
    const axios = getAxios(_axios);
    try {
      await axios.post('/send-deactivation-link', { email });
      return {
        success: true,
      };
    } catch (err) {
      const cause = getNetworkErrorCause(err, '');
      QLogger.log('Error at AuthService.requestForDeactivationByEmail', err);
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }

  static async requestForReactivationByEmail(email, _axios) {
    const axios = getAxios(_axios);
    try {
      await axios.post('/send-reactivation-link', { email });
      return {
        success: true,
      };
    } catch (err) {
      const cause = getNetworkErrorCause(err, '');
      QLogger.log('Error at AuthService.requestForReactivationByEmail', err);
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }

  static async checkPhoneNumberAvail(phoneNumber) {
    try {
      const encodedPhoneNumber = encodeURIComponent(phoneNumber);
      const response = await $axios().get(`/user/checkPhoneNumberAvail?phoneNumber=${encodedPhoneNumber}`);
      return response.data;
    } catch (err) {
      QLogger.log('Error at AuthService.checkPhoneNumberAvail', err);
      const cause = getNetworkErrorCause(err, '');
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }

  static async logout() {
    try {
      await $axios().get('/logout');
    } catch (err) {
      QLogger.log('Error at AuthService.logout', err);
      const cause = getNetworkErrorType(err);
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }

  static async saveContext(type, payload) {
    try {
      const response = await $axios().post('/auth/context', { type, payload });
      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
      };
    } catch (err) {
      QLogger.log('Error at AuthService.saveContext', err);
      const cause = getNetworkErrorType(err);
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }

  static async sendSms(phoneNumber, message) {
    try {
      const response = await $axios().post('/auth/sendSms', { phoneNumber, message });
      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
      };
    } catch (err) {
      QLogger.log('Error at AuthService.sendSms', err);
      const cause = getNetworkErrorType(err);
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }

  static async sendAppLinkEmail(email) {
    try {
      const response = await $axios().post('/auth/sendAppLinkEmail', { email });
      if (response.data.success) {
        return response.data;
      }
      return {
        success: false,
      };
    } catch (err) {
      QLogger.log('Error at AuthService.sendAppLinkEmail', err);
      const cause = getNetworkErrorType(err);
      return {
        success: false,
        error: {
          cause,
        },
      };
    }
  }
}

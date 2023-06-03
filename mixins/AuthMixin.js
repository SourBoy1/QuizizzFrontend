import { mapActions, mapGetters } from 'vuex';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

import AuthService from '~/services/apis/AuthService';
import { emailRegexValidation, phoneNumberValidationWithoutCountryCode, usernameRegexValidation } from '~/utils/RegexUtils';
import { GDPRCountry } from '~/utils/GeoUtils';

import WebEvents from '~/config/WebEvents';
import Constants from '~/config/Constants';

const LoginFailures = {
  USER_NOT_FOUND: 'user_not_found',
  INCORRECT_PASSWORD: 'incorrect_password',
  INVALID_INPUT: 'invalid_input',
  DEFAULT: 'default',
};

export default {
  props: {
    imageUrl: {
      type: String,
      default: () => '',
    },
    preFillAuthId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      isAuthCheckInProgress: false,
      isEmailModifiable: true,
      username: '',
      password: '',
      errorGoogleAuth: '',
      email: '' || this.checkAndPreFillEmail(),
      emailFieldState: 'pristine',
      isEmailValid: false,
      isEmailCheckInProgress: false,
      termsAndConditionError: false,
      isGoogleLoginInProcess: false,
      isFBLoginInProcess: false,
      isAppleLoginInProcess: false,
      isClasslinkLoginInProcess: false,
      googleAuthErrorMsg: '',
      shouldShowFormLevelError: false,
      isTosChecked: false,
      isCommsChecked: false,
      tweetReviewRightPosition: '',
      emailErrorMessage: '',
      phoneNumberErrorMessage: '',
      isEmailUnique: false,
      isPhoneNumberUnique: false,
      isMSLoginInProcess: false,
      phoneNumber: '' || this.checkAndPreFillPhoneNumber(),
      phoneNumberFieldState: 'pristine',
      isPhoneNumberValid: false,
      isPhoneNumberCheckInProgress: false,
      stage: 'primary',
      isLoginInProgress: false,
      err: '',
      errMessage: '',
      errType: '',
      doesAccountExist: false,
      alternateAccountMsg: '',
      alternateAccountType: '',
      isLoginEmail: false,
      signUpImage: 'https://cf.quizizz.com/image/classroom-enjoyment.png',
      animationOnToSError: false,
    };
  },

  computed: {
    ...mapGetters('root', ['serverData', 'isNewMobileAuthFlow', 'isDesktop']),

    isLoginState() {
      return this.isLogin || this.$route.path === '/login';
    },
    accountExists() {
      return this.$route.query.email;
    },

    disabledLogin() {
      if (this.username && this.password && !this.isLoginInProgress) {
        return false;
      }

      return true;
    },

    isGDPRCountry() {
      return GDPRCountry(this.serverData.requestCountry);
    },

    showGDPRState() {
      return this.isCountryCanada || this.isGDPRCountry;
    },

    isCountryUS() {
      const isUSA = this?.serverData?.requestCountry;
      return isUSA === 'US';
    },

    isCountryCanada() {
      return this.serverData.requestCountry === 'CA';
    },

    isSignupPage() {
      return this.$route?.name === 'signup';
    },

    query() {
      return this.$route?.query;
    },

    fromMobileApp() {
      return (this.query.source && this.query.source === 'mobile');
    },

    disabled() {
      return !(this.isEmailUnique || this.isPhoneNumberUnique);
    },

    countryCode() {
      const country = this.serverData.requestCountry;
      switch (country) {
        case 'IN': return '+91';
        case 'ID': return '+62';
        case 'TH': return '+66';
        case 'MY': return '+60';
        case 'PH': return '+63';
        default: return '+91';
      }
    },

    getEmailIcon() {
      if (this.isEmailCheckInProgress) {
        return 'fas fa-spinner kr-anim-spin animate-spin';
      }
      if (this.email && emailRegexValidation(this.email) && this.isEmailUnique) {
        return 'fa fa-check text-green';
      }
      return '';
    },

    getAuthIcon() {
      if (this.isAuthCheckInProgress) {
        return 'fas fa-spinner kr-anim-spin animate-spin';
      }
      if (this.doesAccountExist) {
        return 'fa fa-check text-green';
      }
      return '';
    },

    getPhoneNumberIcon() {
      if (this.isPhoneNumberCheckInProgress) {
        return 'fas fa-spinner kr-anim-spin animate-spin';
      }
      if (this.phoneNumber && phoneNumberValidationWithoutCountryCode(this.phoneNumber) && this.isPhoneNumberUnique) {
        return 'fa fa-check text-green';
      }
      return '';
    },
  },

  mounted() {
    if (this.$route.path === '/login') {
      this.$emit('changeAuthType', 'login');
    }
    if (this.$route.query.email) {
      this.setEmailStage();
      this.username = this.$route.query.email;
      this.email = this.$route.query.email;
    } else if (this.$route.query.phone) {
      this.setPhoneStage();
      this.username = this.$route.query.phone;
      this.phoneNumber = this.$route.query.phone;
    } if (this.$route.query.source) {
      this.handleForQFW({ source: this.$route.query.source });
    }
    this.checkForEmailAvailabilityDebounced = debounce(
      this.checkForEmailAvailability,
      2000,
    );
    this.checkForPhoneNumberAvailabilityDebounced = debounce(
      this.checkForPhoneNumberAvailability,
      2000,
    );
    this.onAuthFieldInputDebounced = debounce(
      this.onAuthFieldInput,
      2000,
    );
  },

  watch: {
    termsAndConditionError(value) {
      if (value) {
        this.animationOnToSError = true;
        setTimeout(() => {
          this.animationOnToSError = false;
        }, 1000);
      }
    },
    email(email) {
      this.emailErrorMessage = '';
      this.phoneNumberErrorMessage = '';
      this.emailFieldState = 'pristine';
      this.isEmailUnique = false;
      this.isLoginEmail = false;
      if (email.length < 7 || !emailRegexValidation(email)) {
        this.isEmailValid = false;
        this.isLoginEmail = false;
        this.emailErrorMessage = this.$i18n('Please enter a valid email');
        this.emailFieldState = 'dirty';
      } else {
        // await this.checkForEmailAvailabilityDebounced(email);
        this.isEmailUnique = true;
      }
    },

    async phoneNumber(phone) {
      this.emailErrorMessage = '';
      this.phoneNumberErrorMessage = '';
      this.phoneNumberFieldState = 'pristine';
      this.isPhoneNumberUnique = false;
      await this.checkForPhoneNumberAvailabilityDebounced(phone);
    },

    username(userName) {
      this.doesAccountExist = false;
      this.err = false;
      this.onAuthFieldInputDebounced(userName);
      if (!(this.isUserNotFound || this.isInvalidInput)) {
        this.err = false;
      }
    },

    password() {
      if (!(this.isUserNotFound || this.isInvalidInput)) {
        this.err = false;
      }
    },
  },

  methods: {
    ...mapActions('Auth', ['setAuthEmail', 'setPhoneNumber']),
    checkAndPreFillEmail() {
      return emailRegexValidation(this.preFillAuthId) ? this.preFillAuthId : '';
    },

    handleSubmit(event, params) {
      if (this.isLoginState) {
        this.doLogin(params);
      } else {
        this.handleNextStep(params);
      }
    },

    onFieldChange() {
      this.username = this.$refs.authNameField.getValue();
      this.password = this.$refs.authPassField.getValue();
      if (!(this.isUserNotFound || this.isInvalidInput)) {
        this.err = false;
      }
    },

    async onAuthFieldInput(value) {
      if (this.isNewMobileAuthFlow && phoneNumberValidationWithoutCountryCode(value)) {
        this.isAuthCheckInProgress = true;
        const data = await AuthService.checkPhoneNumberAvail(value);
        this.isAuthCheckInProgress = false;
        if (data && data.data.avail) {
          this.err = true;
          this.errMessage = this.$i18n('Account does not exist');
          this.errType = LoginFailures.USER_NOT_FOUND;
          this.$analytics.logEvent(this.$webEvents.LOGIN_ACCOUNT_DOES_NOT_EXIST);
          if (!this.isModal) {
            this.$router.push({
              path: '/signup',
              query: {
                ...this.query,
                phone: this.username,
              },
            });
          } else {
            this.phone = this.username;
            this.$emit('changeAuthType', 'signup');
          }
        } else if (data && data.data.avail !== undefined && !data.data.avail) {
          this.doesAccountExist = true;
        }
      } else if (emailRegexValidation(value)) {
        this.isAuthCheckInProgress = true;
        const data = await AuthService.checkEmailAvail(value);
        this.isAuthCheckInProgress = false;
        if (data && data.data.avail) {
          this.err = true;
          this.errMessage = this.$i18n('Account does not exist');
          this.errType = LoginFailures.USER_NOT_FOUND;
          this.$analytics.logEvent(this.$webEvents.LOGIN_ACCOUNT_DOES_NOT_EXIST);
          this.email = this.username;
          if (!this.isModal) {
            this.$router.push({
              path: '/signup',
              query: {
                ...this.query,
                email: this.username,
              },
            });
          } else {
            this.$emit('changeAuthType', 'signup');
            this.email = this.username;
          }
        } else if (data && data.data.avail !== undefined && !data.data.avail) {
          this.doesAccountExist = true;
        }
      } else if (usernameRegexValidation(value)) {
        this.doesAccountExist = true;
      } else {
        this.err = true;
        this.errMessage = this.$i18n('Please enter valid input');
        this.errType = LoginFailures.INVALID_INPUT;
      }
    },

    setEmailStage() {
      if (!this.isLoginState) {
        if ((this.isGDPRCountry || this.isCountryCanada) && !this.isTosChecked) {
          this.termsAndConditionError = true;
          this.emailFieldState = 'dirty';
          return;
        }
      }
      this.stage = 'email';
      this.$analytics.logEvent(
        this.isSignupPage ? this.$webEvents.SIGNUP_FLOW : this.$webEvents.LOGIN_FLOW,
        {
          action_name: this.isSignupPage ? 'signup_email_click' : 'login_email_click',
          authentication: 'email',
          source: window.location.href,
          page: this.isSignupPage ? 'signup_type_select' : 'login_type_select',
        },
      );
    },
    setPhoneStage() {
      this.stage = 'phone';
      this.$analytics.logEvent(
        this.isSignupPage ? this.$webEvents.SIGNUP_FLOW : this.$webEvents.LOGIN_FLOW,
        {
          action_name: this.isSignupPage ? 'signup_phone_click' : 'login_phone_click',
          authentication: 'phone',
          source: window.location.href,
          page: this.isSignupPage ? 'signup_type_select' : 'login_type_select',
        },
      );
    },

    resetStage() {
      this.stage = 'primary';
      this.email = '';
      this.phoneNumber = '';
      this.emailFieldState = 'prisitine';
      this.phoneNumberFieldState = 'prisitine';
      this.phoneNumberErrorMessage = '';
      this.emailErrorMessage = '';
      this.username = '';
      this.password = '';
      this.isLoginEmail = false;
      this.alternateAccountMsg = '';
      this.alternateAccountType = '';
      this.isLoginInProgress = false;
    },

    tosClick() {
      this.$analytics.logEvent(this.$webEvents.SIGNUP_FLOW, {
        action_name: this.$constants.SignupEvents.TOS_LINK_CLICK,
        source: this.query.source || '',
        page: this.$constants.SIGNUP_PAGES.SIGNUP_TYPE_SELECT,
        ctaSource: this.query.ctaSource,
        fromPage: this.query.fromPage,
      });
    },

    privacyClick() {
      this.$analytics.logEvent(this.$webEvents.SIGNUP_FLOW, {
        action_name: this.$constants.SignupEvents.PRIVACY_LINK_CLICK,
        source: this.query.source || '',
        page: this.$constants.SIGNUP_PAGES.SIGNUP_TYPE_SELECT,
        ctaSource: this.query.ctaSource,
        fromPage: this.query.fromPage,
      });
    },

    checkAndPreFillPhoneNumber() {
      return phoneNumberValidationWithoutCountryCode(this.preFillAuthId) ? this.preFillAuthId : '';
    },

    handleLogin(e) {
      if (this.isSignupPage) {
        this.$router.push('/login');
        return;
      }
      e?.preventDefault();
      this.$emit('changeAuthType', 'login');
    },

    handleTosChange() {
      this.termsAndConditionError = false;
      this.emailFieldState = 'pristine';
      this.isTosChecked = !this.isTosChecked;
    },

    handleCommsChange() {
      this.isCommsChecked = !this.isCommsChecked;
      this.$nextTick(() => {
        this.$store.dispatch('Auth/setIsCommsOptedIn', this.isCommsChecked);
      });
    },

    async checkForEmailAvailability(email) {
      if (email.length < 7) {
        this.isEmailValid = false;
        this.emailErrorMessage = this.$i18n('Please enter a valid email');
        this.emailFieldState = 'dirty';
        this.isLoginEmail = false;
        return;
      }

      if (emailRegexValidation(this.email)) {
        this.isEmailCheckInProgress = true;
        const data = await AuthService.checkEmailAvail(email);
        this.isEmailCheckInProgress = false;
        this.isEmailValid = data.data.avail;
        const isSsoEmail = data?.data?.externalSource;
        if (!this.isEmailValid) {
          this.$analytics.logEvent(WebEvents.SIGNUP_ACCOUNT_ALREADY_EXISTS);
          // this.emailErrorMessage = this.$i18n('Account already exists, please log in');
          if (isSsoEmail && isSsoEmail !== '') {
            this.stage = 'email';
            if (!this.isModal) {
              this.$router.push({
                path: '/login',
                query: {
                  ...this.query,
                  email,
                },
              });
            } else {
              this.$emit('changeAuthType', 'login');
              this.username = this.email;
            }
          }
          if (isSsoEmail && isSsoEmail === 'google') {
            this.hintAlternateLogin('google');
          } else if (isSsoEmail && isSsoEmail === 'microsoft') {
            this.hintAlternateLogin('microsoft');
          } else if (isSsoEmail && isSsoEmail === 'facebook') {
            this.hintAlternateLogin('facebook');
          }
          this.isLoginEmail = true;
          this.isEmailUnique = true;
        } else {
          this.isEmailUnique = true;
        }
      } else {
        this.emailErrorMessage = this.$i18n('Please enter a valid email');
        this.isEmailValid = false;
        this.isEmailCheckInProgress = false;
        this.emailFieldState = 'dirty';
      }
    },

    redirectToGoogle() {
      AuthService.redirectToGoogle(this.$route.path, this.query, this.fromMobileApp, this.isGDPRCountry, this.isCountryCanada, this.isCommsChecked);
    },

    redirectToMS() {
      AuthService.redirectToMS(this.$route.path, this.query, this.fromMobileApp, this.isGDPRCountry, this.isCountryCanada, this.isCommsChecked);
    },

    redirectUser() {
      const hasRedirect = this.$route?.query?.q;
      const queryString = window.location.search.length > 1 ? window.location.search + (hasRedirect ? '' : `&q=${this.$route.path}`) : `?q=${this.$route.path}`;
      this.$router.push(`/signup/occupation${queryString}`);
    },

    async handleNextStep() {
      this.emailErrorMessage = '';
      this.phoneNumberErrorMessage = '';
      this.emailFieldState = 'pristine';
      this.isEmailUnique = false;
      await this.checkForEmailAvailability(this.email);
      if (this.isLoginEmail) {
        if (!this.isModal) {
          this.$router.push({
            path: '/login',
            query: {
              ...this.query,
              email: this.email,
            },
          });
        } else {
          this.$emit('changeAuthType', 'login');
          this.username = this.email;
        }
      }
      if (this.email.length > 0) {
        if (this.isEmailValid) {
          this.setAuthEmail(this.email.trim());
          if ((this.isGDPRCountry || this.isCountryCanada) && !this.isTosChecked) {
            this.termsAndConditionError = true;
            this.emailFieldState = 'dirty';
            return;
          }
          this.$analytics.logEvent(this.$webEvents.SIGNUP_FLOW, {
            action_name: this.$constants.SignupEvents.SIGNUP_TYPE_NEXT_CLICK,
            authentication: 'email',
            source: this.query.source,
            ctaSource: this.query.ctaSource,
            fromPage: this.query.fromPage,
            page: this.$constants.SIGNUP_PAGES.SIGNUP_TYPE_SELECT,
          });
          this.redirectUser();
        } else {
          this.emailFieldState = 'dirty';
        }
      } else if (this.phoneNumber.length > 0) {
        await this.checkForPhoneNumberAvailability();
        if (this.isPhoneNumberValid) {
          this.setPhoneNumber(this.phoneNumber);
          this.$analytics.logEvent(this.$webEvents.SIGNUP_FLOW, {
            action_name: this.$constants.SignupEvents.SIGNUP_TYPE_NEXT_CLICK,
            authentication: 'phoneNumber',
            source: this.query.source,
            ctaSource: this.query.ctaSource,
            fromPage: this.query.fromPage,
            page: this.$constants.SIGNUP_PAGES.SIGNUP_TYPE_SELECT,
          });

          this.redirectUser();
        } else {
          this.phoneNumberFieldState = 'dirty';
        }
      }
    },

    async handleGoogleSignup() {
      if (!this.isLoginState) {
        if ((this.isGDPRCountry || this.isCountryCanada) && !this.isTosChecked) {
          this.termsAndConditionError = true;
          this.emailFieldState = 'dirty';
          return;
        }
      }

      let queryDetails = this.query;
      if (this.title === 'See answers with a free account') {
        queryDetails = {
          ...this.query,
          source: this.$constants.SignupSources.SHOW_ANSWERS,
          tSource: 'quizPage',
          p: 'quiz',
        };
      }

      this.isGoogleLoginInProcess = true;
      await AuthService.handleGoogleSignup(this.isGDPRCountry, this.isCountryCanada, queryDetails, this.fromMobileApp, this.isCommsChecked);
      this.isGoogleLoginInProcess = false;
    },

    async handleFacebookSignup() {
      this.isFBLoginInProcess = true;
      this.$analytics.logEvent(
        this.isSignupPage ? this.$webEvents.SIGNUP_FLOW : this.$webEvents.LOGIN_FLOW,
        {
          action_name: this.isSignupPage ? 'signup_facebook_click' : 'login_facebook_click',
          authentication: 'facebook',
          source: window.location.href,
          page: this.isSignupPage ? 'signup_type_select' : 'login_type_select',
        },
      );
      this.isFBLoginInProcess = true;
      await AuthService.redirectToFacebook(window.location.pathname, this.query, false, this.isGDPRCountry, this.isCountryCanada, true);
      this.isFBLoginInProcess = false;
    },

    async handleAppleSignup() {
      this.isAppleLoginInProcess = true;
      this.$analytics.logEvent(
        this.isSignupPage ? this.$webEvents.SIGNUP_FLOW : this.$webEvents.LOGIN_FLOW,
        {
          action_name: this.isSignupPage ? 'signup_apple_click' : 'login_apple_click',
          authentication: 'apple',
          source: window.location.href,
          page: this.isSignupPage ? 'signup_type_select' : 'login_type_select',
        },
      );
      this.isAppleLoginInProcess = true;
      await AuthService.redirectToApple(window.location.pathname, this.query, false);
      this.isAppleLoginInProcess = false;
    },

    async handleMSSignup() {
      if (!this.isLoginState) {
        if ((this.isGDPRCountry || this.isCountryCanada) && !this.isTosChecked) {
          this.termsAndConditionError = true;
          this.emailFieldState = 'dirty';
          return;
        }
      }

      let queryDetails = this.query;
      if (this.title === 'See answers with a free account') {
        queryDetails = {
          ...this.query,
          source: this.$constants.SignupSources.SHOW_ANSWERS,
          tSource: 'quizPage',
          p: 'quiz',
          q: this.$route.path,
        };
      }

      this.isMSLoginInProcess = true;
      await AuthService.handleMSSignup(this.isGDPRCountry, this.isCountryCanada, queryDetails, this.fromMobileApp, this.isCommsChecked);
      this.isMSLoginInProcess = false;
    },

    handleClasslinkSignup() {
      this.isClasslinkLoginInProcess = true;
      this.$analytics.logEvent(
        this.isSignupPage ? this.$webEvents.SIGNUP_FLOW : this.$webEvents.LOGIN_FLOW,
        {
          action_name: this.isSignupPage ? 'signup_classlink_click' : 'login_classlink_click',
          authentication: 'classlink',
          source: window.location.href,
          page: this.isSignupPage ? 'signup_type_select' : 'login_type_select',
        },
      );
      this.isClasslinkLoginInProcess = true;
      AuthService.redirectToClasslink(window.location.pathname, this.query, false);
      this.isClasslinkLoginInProcess = false;
    },

    async doLogin(params) {
      if (this.isLoginInProgress || this.isGoogleLoginInProcess || this.isMSLoginInProcess || this.isFBLoginInProcess) {
        return;
      }

      if (this.username === '') {
        this.err = true;
        this.errMessage = 'Username is required.';
        this.errType = LoginFailures.DEFAULT;
        return;
      }

      if (this.password === '') {
        this.err = true;
        this.errMessage = 'Password is required.';
        this.errType = LoginFailures.DEFAULT;
        return;
      }

      this.isLoginInProgress = true;
      const requestId = this.query?.state || '';
      const response = await AuthService.login(this.username.trim(), this.password.trim(), requestId);

      if (response && response.success) {
        this.handleLoginSuccess(response, params);
      } else {
        this.isLoginInProgress = false;
        try {
          this.handleLoginFail(response.status, response.data);
        } catch (e) {
          this.handleLoginFail(0, {});
        }
      }
    },

    async checkForPhoneNumberAvailability() {
      if (phoneNumberValidationWithoutCountryCode(this.phoneNumber)) {
        this.isPhoneNumberCheckInProgress = true;
        this.isPhoneNumberValid = false;

        const response = await AuthService.checkPhoneNumberAvail(this.phoneNumber);
        if (response.success) {
          this.isPhoneNumberCheckInProgress = false;
          this.isPhoneNumberValid = response.data.avail;
          const errMessage = response.data.err;
          this.phoneNumberFieldState = 'dirty';
          if (!this.isPhoneNumberValid) {
            if (errMessage === 'PhoneNumber already exists') {
              this.phoneNumberErrorMessage = this.$i18n('Account already exists, please log in');
              if (!this.isModal) {
                this.$router.push({
                  path: '/login',
                  query: {
                    ...this.query,
                    phone: this.phoneNumber,
                  },
                });
              } else {
                this.username = this.phoneNumber;
              }
              this.$emit('changeAuthType', 'login');
            } else {
              this.phoneNumberErrorMessage = this.$i18n('Please enter a valid phone number');
            }
            this.onInvalidPhoneNumber();
          } else {
            this.isPhoneNumberUnique = true;
          }
        }
      } else {
        this.phoneNumberErrorMessage = this.$i18n('Please enter a valid phone number');
        this.onInvalidPhoneNumber();
      }
    },

    onInvalidPhoneNumber() {
      this.$analytics.logEvent('searchEvent_invalidPhoneNumber', {
        phoneNumber: this.phoneNumber,
      });
      this.isPhoneNumberValid = false;
      this.isPhoneNumberCheckInProgress = false;
      this.phoneNumberFieldState = 'dirty';
    },

    changeCountryCode(code) {
      this.selectedCountryCode = code;
    },

    handleLoginSuccess(response, params) {
      // Send login event
      this.sendLoginSuccessEvent();
      const { data } = response;

      if (data.deactivated) {
        this.$router.push('/reactivate');
        return;
      }

      // If email is associated with google account, hint users to use google signin
      if (data.isGoogle) {
        this.hintAlternateLogin('google');
        return;
      }

      if (data.isMicrosoft) {
        this.hintAlternateLogin('microsoft');
        return;
      }

      if (data.isFacebook) {
        this.hintAlternateLogin('facebook');
        return;
      }

      if (data.isApple) {
        this.hintAlternateLogin('apple');
        return;
      }

      // If redirect is requested via q param
      if (this.query.q) {
        this.redirect = decodeURIComponent(this.query.q);
      }

      if (this.redirect) {
        const redirect = decodeURIComponent(this.redirect);

        // Redirect only if the URL is relative and if not make sure
        // only quizizz.com domain urls are followed
        if (this.$urlUtils.isRelativeUrl(redirect) || this.$urlUtils.isQuizizzUrl(redirect)) {
          window.location = redirect;
          return;
        }
      }

      if (params?.redirectPath) {
        const resolveResponse = this.$router.resolve(params.redirectPath);
        if (resolveResponse.route && resolveResponse.route.name !== 'error' && !params?.reload) {
          this.$router.push(params.redirectPath);
          return;
        }

        window.location = params.redirectPath;
      }

      if (params?.reload) {
        window.location.reload();
        return;
      }

      // Follow server sent redirect
      if (data.redirect) {
        window.location = data.redirect;
        return;
      }

      // Else just reload the current page
      window.location.reload();
    },

    handleLoginFail(status, response) {
      if (status === 401) {
        this.err = true;
        this.errMessage = this.$i18n('Invalid password');
        this.errType = LoginFailures.INCORRECT_PASSWORD;
        return;
      }

      if (status === 404) {
        this.err = true;
        this.errMessage = this.$i18n('Account does not exist');
        this.errType = LoginFailures.USER_NOT_FOUND;
        this.$analytics.logEvent(this.$webEvents.LOGIN_ACCOUNT_DOES_NOT_EXIST);
        return;
      }

      let msg = this.$i18n('Some error occured! Please try again.');
      if (!isEmpty(response)) {
        msg = [response.error || '', response.message || ''].join(' ').trim();
      }

      this.err = true;
      this.errMessage = msg;
      this.errType = LoginFailures.DEFAULT;
    },

    sendLoginSuccessEvent() {
      const eventParams = {
        identification: this.username,
      };
      this.$analytics.logEvent('loginSuccessModal', eventParams);
    },

    hintAlternateLogin(type) {
      let msg = '';

      if (type === 'google') {
        msg = this.$i18n('A Google connected user already exists for this username. Please use the button above to log in with Google');
      }

      if (type === 'microsoft') {
        msg = this.$i18n('A Microsoft connected user already exists for this username. Please use the button above to log in with Microsoft');
      }

      if (type === 'facebook') {
        msg = this.$i18n('A Facebook connected user already exists for this username. Please use the button above to log in with Facebook');
      }

      if (type === 'apple') {
        msg = this.$i18n('An apple connected user already exists for this username. Please use the button above to log in with Apple');
      }
      this.alternateAccountMsg = msg;
      this.alternateAccountType = type;
      this.isLoginInProgress = false;
    },

    async handleGoogleLogin() {
      this.isGoogleLoginInProcess = true;
      await AuthService.handleGoogleLogin(this.query);
      this.isGoogleLoginInProcess = false;
    },

    async handleMsLogin() {
      this.isMSLoginInProcess = true;
      await AuthService.handleMsLogin(this.query);
      this.isMSLoginInProcess = false;
    },

    handleForgotPass() {
      this.$analytics.logEvent(this.$webEvents.FORGOT_PASSWORD_CLICK);
      this.$router.push(`/forgot-password?q=${encodeURIComponent(this.$route.path)}`);
    },

    handleForQFW({ source }) {
      const { sources, image, copy } = Constants.qfwConfig.signUp;
      if (sources.includes(source)) {
        this.signUpImage = image;
        this.testimonialOne = copy.testimonialOne;
        this.testimonialTwo = copy.testimonialTwo;
      }
    },
  },
};

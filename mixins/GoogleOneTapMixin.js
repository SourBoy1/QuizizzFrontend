import { mapGetters } from 'vuex';

import WebEvents from '~/config/WebEvents';

import { getPageTitleForInhouseEvents } from '~/config/PageTitles';

export default {
  computed: {
    ...mapGetters('root', ['serverData']),

    isUserLoggedIn() {
      return !!this.$user.id;
    },
  },

  data() {
    return {
      source: '',
    };
  },

  mounted() {
    this.source = getPageTitleForInhouseEvents(this.$route.path);
    if (!this.isUserLoggedIn) {
      this.initGoogleOneTap();
    }
  },

  methods: {
    handleGoogleOneTapRequest(response) {
      const redirectUrl = 'auth/google/callback';
      this.$analytics.logEvent(this.$constants.WebEvents.ONE_TAP_SSO_LOGIN, {});
      window.location.href = `/${redirectUrl}?jwt=${response.credential}&redirectURL=${window.location.href}`;
    },

    async initGoogleOneTap() {
      try {
        await this.loadGoogleApiScript();
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: this.serverData.googleClientId,
            callback: this.handleGoogleOneTapRequest,
            cancel_on_tap_outside: false,
          });

          window.google.accounts.id.prompt((notification) => {
            if (notification.isDisplayed()) {
              this.$analytics.logEvent(this.$constants.WebEvents.ONE_TAP_SSO_SHOW, {
                source: this.source,
              });
            }

            if (notification.isSkippedMoment()) {
              this.$analytics.logEvent(this.$constants.WebEvents.ONE_TAP_SSO_DISMISS, {
                sourceOfDismissal: 'Google one tap popup',
                source: this.source,
              });
            }

            if (notification.isNotDisplayed()) {
              this.$analytics.logEvent(this.$constants.WebEvents.ONE_TAP_SSO_NOT_SHOWN, {
                reason: notification.getNotDisplayedReason(),
              });
            }
          });
        }
      } catch (error) {
        this.$analytics.logEvent(WebEvents.GOOGLE_ONE_TAP_FAILED);
      }
    },
    loadGoogleApiScript() {
      return new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        const googleApiUrl = 'https://accounts.google.com/gsi/client';

        tag.src = googleApiUrl;
        tag.setAttribute('defer', '');
        tag.onload = () => resolve();
        tag.onerror = () => reject('Error loading google one tap service');
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      });
    },
  },
};

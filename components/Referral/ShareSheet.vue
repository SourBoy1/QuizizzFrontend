<template>
  <div>
    <div
      v-if="isDesktop"
      class="share-wrapper"
    >
      <div
        v-if="isLoading"
        class="absolute w-full h-full bg-dark-50% rounded z-1"
      />
      <div
        v-if="isLoading"
        class="absolute animate-spin flex items-center text-super mr-2 z-1"
      >
        <FA
          icon="far fa-sync"
          :size="20"
        />
      </div>
      <Button
        type="custom"
        class="primary-btn"
        licon="fas fa-copy"
        :customClasses="darkMode ? 'bg-dark-2 text-light-3' : 'bg-light-3 text-dark-2'"
        :customIconSize="16"
        :title="$i18n('Copy and share link')"
        @click="copyLink"
      />
      <div class="secondary-btn-wrapper">
        <Button
          type="custom"
          class="secondary-btn"
          :customClasses="darkMode ? 'bg-dark-50% text-light-3' : 'text-light-3 bg-light-33%'"
          licon="fas fa-envelope"
          :customIconSize="14"
          :title="$i18n('Email')"
          @click="sendMail"
        />
        <Button
          type="custom"
          class="secondary-btn"
          :customClasses="darkMode ? 'bg-dark-50% text-light-3' : 'text-light-3 bg-light-33%'"
          licon="fab fa-facebook-f"
          :customIconSize="14"
          :title="$i18n('Facebook')"
          @click="shareOnFacebook"
        />
        <Button
          type="custom"
          class="secondary-btn"
          :customClasses="darkMode ? 'bg-dark-50% text-light-3' : 'text-light-3 bg-light-33%'"
          licon="fab fa-twitter"
          :customIconSize="14"
          :title="$i18n('Twitter')"
          @click="shareOnTwitter"
        />
      </div>
    </div>
    <div
      v-else
      class="share-wrapper mobile"
    >
      <div
        v-if="isLoading"
        class="absolute w-full h-full bg-dark-50% rounded z-1"
      />
      <div
        v-if="isLoading"
        class="absolute animate-spin flex items-center text-super mr-2 z-1"
      >
        <FA
          icon="far fa-sync"
          :size="20"
        />
      </div>
      <Button
        type="custom"
        class="primary-btn"
        :customClasses="darkMode ? 'bg-dark-2 text-light-3' : 'bg-light-3 text-dark-2'"
        :title="$i18n('Invite via Whatsapp')"
        @click="shareOnWhatsapp"
      >
        <template #lIcon>
          <img
            for="lIcon"
            src="https://cf.quizizz.com/img/social_media/whatsapp.png"
            alt="whatsapp_icon"
            class="mr-2"
          >
        </template>
      </Button>
      <div class="secondary-btn-wrapper">
        <Button
          type="custom"
          class="secondary-btn"
          :customClasses="darkMode ? 'bg-dark-50% text-light-3' : 'text-light-3 bg-light-33%'"
          licon="far fa-link"
          :customIconSize="14"
          :title="$i18n('Copy link')"
          @click="copyLink"
        />
        <Button
          type="custom"
          class="secondary-btn"
          :customClasses="darkMode ? 'bg-dark-50% text-light-3' : 'text-light-3 bg-light-33%'"
          licon="fas fa-arrow-up-from-square"
          :customIconSize="14"
          :title="$i18n('Share via')"
          @click="openNativeShareSheet"
        />
      </div>
    </div>
    <ReferralShareLinkModal :referralLink="referralLink" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';
import QLogger from '~/services/QLogger';

export default {
  mixins: [referralMixin],

  props: {
    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['sendEmail'],

  data() {
    return {
      referralLink: null,
      isLoading: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'serverData']),

    canShareNatively() {
      return !!window.navigator?.share;
    },

    shareText() {
      return this.$i18n('Over 5 million teachers including me use #Quizizz to engage students in the classroom. Host an activity & unlock FREE Super to get unlimited access to teaching content & tools on #Quizizz');
    },

    shareContent() {
      return `${this.shareText}. ${this.$i18n('Join using {$1}', [this.referralLink])}`;
    },
  },

  methods: {
    async getLink() {
      if (!this.referralLink) {
        this.isLoading = true;
        this.referralLink = await this.getReferralLink(this.currentCampaignId);
      }

      this.isLoading = false;
      return this.referralLink;
    },

    async copyLink() {
      if (this.isLoading) { return; }
      await this.getLink();
      this.$clipboard.copy(this.referralLink);

      this.$toasts.add({
        type: this.$constants.ToastTypes.SUCCESS,
        icon: 'fas fa-check-circle',
        title: this.$i18n('Link copied! Share/paste it on your favourite tool.'),
      });

      this.trackEvent(this.$constants.ShareOptions.COPY);
    },

    async sendMail() {
      if (this.isLoading) { return; }
      await this.getLink();
      this.$emit('sendEmail');
      this.$eventBus.$emit('referralShareLinkModal:show');
      this.trackEvent(this.$constants.ShareOptions.MAIL);
    },

    async shareOnFacebook() {
      if (this.isLoading) { return; }
      await this.getLink();
      window.open(
        `https://www.facebook.com/dialog/share?
        app_id=1589541687945427&
        display=popup&
        quote=${encodeURIComponent(this.shareText)}&
        href=${encodeURIComponent(this.referralLink)}&
        redirect_uri=${encodeURIComponent(window.location.href)}`,
      );

      this.trackEvent(this.$constants.ShareOptions.FACEBOOK);
    },

    async shareOnTwitter() {
      if (this.isLoading) { return; }
      await this.getLink();
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareContent)}`);
      this.trackEvent(this.$constants.ShareOptions.TWITTER);
    },

    async shareOnWhatsapp() {
      if (this.isLoading) { return; }
      await this.getLink();
      window.open(`https://wa.me/?text=${encodeURIComponent(this.shareContent)}`);
      this.trackEvent(this.$constants.ShareOptions.WHATSAPP);
    },

    async openNativeShareSheet() {
      if (this.isLoading) { return; }
      await this.getLink();
      if (this.canShareNatively) {
        window.navigator.share({ title: this.shareContent })
          .then(() => {
            this.trackEvent(this.$constants.ShareOptions.NATIVE);
          })
          .catch((error) => {
            QLogger.error('Some error occured while triggering native share', error);
          });
      }
    },

    trackEvent(mode) {
      const eventName = this.$webEvents.SHARE_REFERRAL_LINK;
      this.$analytics.logEvent(eventName, {
        type: mode,
        country: this.serverData.requestCountry,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.share-wrapper {
  @apply flex flex-col w-full items-center justify-center gap-2 relative;

  &.mobile {
    .primary-btn {
      img {
        @apply h-6 w-6 inline-block mr-2;
      }
    }
  }
}

.primary-btn {
  @apply w-full rounded font-semibold h-10 text-base;
}

.secondary-btn-wrapper {
  @apply flex gap-2 justify-between w-full;

  .secondary-btn {
    @apply flex-grow basis-0 rounded h-8 font-semibold text-sm;
  }
}
</style>

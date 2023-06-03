<template>
  <button
    v-if="showReferralStats && !showRefereeRewardCard && shouldCardBeShown"
    type="button"
    class="sidebar-card my-2 bg-super-10% border border-super-faded rounded-lg overflow-hidden cursor-pointer"
    :class="{
      'mx-2': isMiniVariant,
    }"
    @click.stop="onReferBtnClicked"
  >
    <div
      :class="{
        'p-1 text-center': isMiniVariant,
        'px-4 pt-4': !isMiniVariant,
      }"
    >
      <div
        class="text-left text-super-dark mb-4 font-bold z-1"
        :class="{
          'text-xs': isMiniVariant,
          'text-base': !isMiniVariant,
        }"
      >
        {{ getRewardText }}
      </div>
      <div
        v-if="!isMiniVariant"
        class="inline-block ml-5"
      >
        <Button
          size="sm"
          class="rounded-xl z-1"
          ticon="far fa-arrow-right"
          ticonClasses="font-semibold"
          type="super-secondary"
          @click.stop="onReferBtnClicked"
        />
      </div>
    </div>
    <div class="h-20 overflow-hidden">
      <div
        class="z-0 flex items-center justify-center mt-10"
        :class="{
          'h-42 w-42 bg-super-20% rounded-50%': !isMiniVariant,
          'h-fit wi-fit': isMiniVariant,
        }"
      >
        <img
          :src="animateGift ? 'https://cf.quizizz.com/img/super/share-super-anim.gif' : 'https://cf.quizizz.com/img/super/share-super-static.png'"
          :width="giftImageWidth"
          :alt="$i18n('Gift Super')"
          class="z-1"
          :class="giftImageClasses"
          @load="onImgLoad"
        >
      </div>
    </div>
  </button>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

export default {

  mixins: [referralMixin],

  props: {
    isMiniVariant: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      animateGift: false,
      isAnimLoaded: false,
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),

    isCountryUSA() {
      return this.serverData.requestCountry === 'US';
    },

    // eslint-disable-next-line vue/return-in-computed-property
    shouldCardBeShown() {
      if ((this.isCountryUSA && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.US_SUPER)) || !this.isCountryUSA) {
        return true;
      }
    },

    getRewardText() {
      if (this.isCountryUSA) {
        return this.$i18n('Invite & earn free Individual Plan');
      }
      return this.$i18n('Invite & earn free Super');
    },

    giftImageWidth() {
      if (this.isMiniVariant) {
        return '32';
      }

      return this.animateGift && this.isAnimLoaded ? '60' : '48';
    },

    giftImageClasses() {
      if (this.isMiniVariant) {
        return {};
      }

      return { '-mt-32': !this.animateGift || !this.isAnimLoaded, '-mt-40': this.animateGift && this.isAnimLoaded };
    },
  },

  methods: {
    onReferBtnClicked() {
      this.$analytics.logEvent(this.$webEvents.REFERRAL_SIDEBAR_BTN_CLICK, {
        country: this.serverData.requestCountry,
      });
      this.openReferralModal();
    },

    onImgLoad() {
      if (this.animateGift) {
        this.onAnimLoaded();
        return;
      }

      this.onStaticLoaded();
    },

    onAnimLoaded() {
      this.isAnimLoaded = true;
      setTimeout(() => {
        this.animateGift = false;
      }, 2050);
    },

    onStaticLoaded() {
      if (!this.isAnimLoaded) {
        this.animateGift = true;
      }
    },
  },
};
</script>

<style scoped>
  .sidebar-card {
    border: 1px solid rgba(255, 164, 2, 0.2);
    border-top: 3px solid #FFA402;
    max-width: theme('maxWidth.42');
  }
</style>

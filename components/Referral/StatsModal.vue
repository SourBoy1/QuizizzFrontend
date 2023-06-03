<template>
  <Modal
    v-if="shouldShow"
    title=""
    subtitle=""
    :button2="null"
    :button1="null"
    :hideHeader="true"
    :shouldCloseOnMaskClick="true"
    :zeroPadding="true"
    containerClasses="max-w-qmd super-upsell z-10 p-0"
    closeBtnClasses="text-dark-4"
    :stickToBottom="isMobile"
    backgroundColor="bg-light-3"
    :showFooter="false"
    :fixedHeight="false"
    @close="close"
  >
    <div
      class="px-6 py-4"
    >
      <div
        v-if="!hasSomeConverts"
        class="flex flex-col rounded-lg"
      >
        <img
          v-if="!isCountryUSA"
          width="144"
          class="-ml-4"
          src="https://cf.quizizz.com/img/super/super_logo_dark_title.png"
          :alt="$i18n('Super Logo')"
        />
        <div
          v-else
          class="flex mb-4 ml-1"
        >
          <img
            width="55"
            src="https://cf.quizizz.com/img/super/super_image_with_glow.png"
            class="inline-block mr-4"
            :alt="$i18n('Super Image')"
          />
          <p class="mt-1">
            <i18n class="text-base font-semibold">
              Limited time offer
            </i18n>
            <br>
            <i18n class="mt-2 text-xs text-dark-3">
              Graduate from your Basic plan
            </i18n>
          </p>
        </div>
        <div>
          <i18n class="font-bold text-xl md:text-3xl mt-3">
            Get 30 days of free
          </i18n>&nbsp;&nbsp;<em
            class="font-bold text-xl md:text-3xl mt-3 text-super"
          >{{ getText }}</em>&nbsp;&nbsp;<i18n class="font-bold text-xl md:text-3xl mt-3">
            for every teacher you invite
          </i18n>
        </div>
        <ul class="mt-6 mb-4 ml-2">
          <li
            v-for="step in referralSteps"
            :key="step"
            class="ref-step relative m-0 pb-4 pl-5 text-dark-4 text-sm"
          >
            {{ step }}
          </li>
          <li
            v-if="isCountryUSA"
            class="ref-step relative m-0 pb-4 pl-5 text-dark-4 text-sm"
          >
            <i18n>You both earn 30 days of free Individual plan!</i18n>
          </li>
          <li
            v-else
            class="ref-step relative m-0 pb-4 pl-5 text-dark-4 text-sm"
          >
            <i18n>You both earn 30 days of free Super!</i18n>
          </li>
        </ul>
      </div>
      <div v-else>
        <span class="font-bold text-base">{{ userConverts == 1 ? $i18n('You\'ve invited 1 teacher!')
          : $i18n('You\'ve invited {$1} teachers!', [userConverts]) }}
        </span>
        <div
          v-if="hasTrialLeft"
          class="rounded-xl bg-super-10% mt-4 mb-4 h-8 w-max pr-3"
        >
          <img
            class="mr-1 w-8 h-8 inline-block"
            src="https://cf.quizizz.com/img/super/super_image_with_glow.png"
            :alt="$i18n('Super Image')"
          />
          <span class="text-super-light font-semibold h-8 leading-8 text-sm">{{ getTrialDaysLeftText($user.trialDaysLeft) }}</span>
        </div>
        <div class="w-11/12">
          <span class="text-dark-4 text-xs md:text-sm mt-2">{{ getLabelText }}</span>
        </div>
      </div>
      <ReferralShareSheet
        darkMode
        class="my-4"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import referralMixin from '~/mixins/referralMixin';

export default {

  mixins: [referralMixin],
  data() {
    return {
      shouldShow: false,
      referralSteps: [
        this.$i18n('Invite a teacher to Quizizz'),
        this.$i18n('They host their first activity'),
      ],
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),
    ...mapGetters('root', ['serverData']),
    isMobile() {
      return this.deviceProps.type === this.$constants.DeviceTypes.PHONE;
    },

    hasTrialLeft() {
      return this.$user.trialDaysLeft > 1;
    },

    isCountryUSA() {
      return this.serverData.requestCountry === 'US';
    },

    getText() {
      if (this.isCountryUSA) {
        return this.$i18n('INDIVIDUAL PLAN');
      }
      return this.$i18n('SUPER');
    },

    getLabelText() {
      if (this.isCountryUSA) {
        return this.$i18n('You both earn free Individual plan when they host an activity on Quizizz!');
      }
      return this.$i18n('You both earn free Super when they host an activity on Quizizz!');
    },
  },

  mounted() {
    this.$eventBus.$on('referralStatsModal:show', this.show);
  },

  beforeUnmount() {
    this.$eventBus.$off('referralStatsModal:show', this.show);
  },

  methods: {
    onOutsideClicked(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this.close();
    },

    show() {
      this.shouldShow = true;
      this.$analytics.logEvent(this.$webEvents.REFERRAL_STATS_MODAL_SHOWN, {
        country: this.serverData.requestCountry,
      });
    },

    getTrialDaysLeftText(trialDaysLeft) {
      if (trialDaysLeft === 1) {
        if (this.isCountryUSA) {
          return this.$i18n('1 day of free Individual Plan left');
        }
        return this.$i18n('1 day of free Super left');
      } if (this.isCountryUSA) {
        return this.$i18n('{$1} days of free Individual plan left', [trialDaysLeft]);
      }
      return this.$i18n('{$1} days of free Super left', [trialDaysLeft]);
    },

    close() {
      this.shouldShow = false;
    },
  },
};
</script>

<style scoped lang="scss">
.ref-step {
  &:not(:last-child) {
    &::before {
      @apply bg-dark-5;
      width: 1px;
      content: '';
      position: absolute;
      top: 12px;
      height: 40px;
      bottom: 0px;
      left: 4px;
    }
  }

  &::after {
    content: '';
    position: absolute;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' viewBox='0 0 32 32' focusable='false'%3E%3Ccircle stroke='none' fill='%23b6b6b6' cx='16' cy='16' r='10'%3E%3C/circle%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
    left: 0;
    top: 8px;
    width: 9px;
    height: 9px;
  }
}
</style>

<template>
  <portal
    v-if="showBanner"
    to="notification-banner"
  >
    <div
      role="banner"
      class="flex w-full h-12 justify-center items-center"
      :class="[isPastDueSubscription ? 'bg-brand-d' : 'bg-red-faded']"
    >
      <img
        src="https://cf.quizizz.com/image/oops-outlined-2.png"
        alt="card"
        class="h-11 ml-2"
      />
      <h2
        class="font-bold text-sm ml-7"
        :class="[isPastDueSubscription ? 'text-light-3' : 'text-purple-light']"
      >
        {{ outerText() }}
      </h2>
      <span
        class="ml-2 text-sm"
        :class="[isPastDueSubscription ? 'text-light-3' : 'text-purple-light']"
      >
        {{ innerText() }}
      </span>
      <div class="flex justify-center items-center ml-auto">
        <Button
          v-if="isApproachingRenewal"
          class="mr-2 border-1 "
          :title="$i18n('Later')"
          type="custom"
          :customClasses="isPastDueSubscription ? 'border-text-light-3 text-light-3' : 'border-purple-light text-purple-light'"
          @click="close"
        />
        <Button
          v-if="showBanner"
          class="mr-2"
          :title="contactButtonCTA"
          :type="isPastDueSubscription ? 'white' : 'custom'"
          :customClasses="isPastDueSubscription ? '' : 'text-light-3 bg-purple-light'"
          @click="mailto"
        />
      </div>
    </div>
  </portal>
</template>

<script>
import { mapGetters } from 'vuex';

import LocalStorage from '~/services/LocalStorage';
import { getPageTitleForInhouseEvents } from '~/config/PageTitles';
import { shouldExcludeFromSndChurnBanner } from '~/utils/ExperimentUtils';

export default {
  emits: ['show', 'close'],

  data() {
    return {
      showNotification: true,
    };
  },

  computed: {
    ...mapGetters('sharedLibrary', ['pilotOrgs']),
    isPastDueSubscription() {
      let pastDue = this.$user?.isPastDueSubscription;
      const daysLeft = this.$user?.userPlanDaysLeft;
      if (daysLeft <= 0 && daysLeft > -14) {
        pastDue = true;
      }
      return pastDue;
    },

    isApproachingRenewal() {
      return this.$user?.userPlanDaysLeft <= 60 && this.$user?.userPlanDaysLeft > 0;
    },

    isSndTrialPlanUser() {
      return this.$user?.subscription?.planId === this.$constants.PlanGroup.SND_TRIAL;
    },

    isSnDUser() {
      return this.$user?.isPartOfAnOrganization;
    },

    showBanner() {
      // no banner for non-snd-users
      if (!this.isSnDUser) {
        return false;
      }

      if (shouldExcludeFromSndChurnBanner()) {
        return false;
      }

      // check for particular whitelisted district
      const isPilotOrg = this.pilotOrgs.includes(this.$user.paidOrganization);
      const isPilotExpiring = this.$user?.userPlanDaysLeft < 3;

      if (isPilotOrg && !isPilotExpiring) {
        return false;
      }

      const inTimeRange = this.$user?.userPlanDaysLeft <= 60 && this.$user?.userPlanDaysLeft > -14;
      const hasSubscription = !!this.$user.subscription.status;

      if (!hasSubscription) {
        return false;
      }

      const storedAction = this.fetchAction();
      const lastActionAt = storedAction.at || -Infinity;
      const sevenDaysInMS = 7 * 3600 * 24 * 1000;
      const oneWeekBefore = (Date.now() - sevenDaysInMS);

      let enoughTimePassed = false;
      if (lastActionAt < oneWeekBefore) {
        enoughTimePassed = true;
      }

      const toShow = inTimeRange && this.isSnDUser && this.showNotification && enoughTimePassed;
      if (toShow) {
        this.$analytics.logEvent(this.$webEvents.SND_CHURN_BANNER_SHOWN, this.commonEventParams());
      }
      return toShow;
    },

    contactButtonCTA() {
      if (this.$user.isAdmin) {
        return this.$i18n('Contact Quizizz');
      }
      return this.$i18n('Contact Admin');
    },
  },

  methods: {
    show() {
      this.showNotification = true;
      this.$emit('show');
    },

    commonEventParams() {
      return {
        organizationRole: this.$user.organizationRole,
        paidOrganizationId: this.$user.paidOrganization,
        organizationId: this.$user.organization,
        renewalStage: this.isApproachingRenewal ? 'pre' : 'post',
        page: getPageTitleForInhouseEvents(this.$route.path),
        url: this.$route.path,
      };
    },

    close() {
      this.closeBanner('later');
    },

    closeBanner(action) {
      this.showNotification = false;
      this.storeAction(action);
      if (action === 'later') {
        this.$analytics.logEvent(this.$webEvents.SND_CHURN_BANNER_CLOSED, this.commonEventParams());
      } else if (action === 'contact-success') {
        this.$analytics.logEvent(this.$webEvents.SND_CHURN_BANNER_CONTACT_SUCCESS, this.commonEventParams());
      } else if (action === 'contact-failure') {
        this.$analytics.logEvent(this.$webEvents.SND_CHURN_BANNER_CONTACT_FAILURE, this.commonEventParams());
      }
      this.$emit('close');
    },

    storeAction(action) {
      LocalStorage.setItem('sndChurnBannerHidden', {
        at: Date.now(),
        action,
      });
    },

    fetchAction() {
      const found = LocalStorage.getItem('sndChurnBannerHidden', {
        parseFromJSON: true,
      });
      if (found) {
        return found;
      }

      return {};
    },

    getEmailSubject() {
      if (this.isApproachingRenewal) {
        return this.$user.isAdmin
          ? 'Quizizz Renewal - School & District Plan'
          : 'Quizizz Subscription - Renewal Needed Soon!';
      }

      return this.$user.isAdmin
        ? 'Immediate Renewal Required!'
        : 'Renewal Needed ASAP for Quizizz School & District Plan';
    },

    getEmailBody() {
      const orgName = this.$user.organizationName;
      const endAtDate = this.$user.displaySubEndAt;

      if (this.isApproachingRenewal) {
        if (this.$user.isAdmin) {
          return `Hi,

I recently learned that the Quizizz School & District plan for ${orgName} is ready for renewal. Are you able to provide a quote for this? Sharing a few details that might be helpful below:

School Name - ${orgName}

Thank you.
          `;
        }

        return `Hi,

It looks like that our Quizizz School and District plan is up for renewal on ${endAtDate}. Over the last year, Quizizz has been a game-changer in my students' engagement, growth and mastery. The data reports also help better inform my instruction, and save me time on grading.  Our team of teachers loves the unlimited access to every single tool and activity on Quizizz, especially the ability to co-edit and collaborate on lesson plan materials and assignments.

Renewing Quizizz now will be key to continue our class instruction without interruption, so hopefully that will be possible! We appreciate your help on this! Keep me posted if you have any questions.

Thank you!
`;
      }

      if (this.$user.isAdmin) {
        return `Hi,

Our Quizizz School & District plan has expired.

Please share a Renewal Quote with me and let us know the next steps so we can set plans in motion ASAP.

Also, let us know what we can do to ensure the service is uninterrupted in the meantime.

Sharing a few details:
School Name - ${orgName}

Thank you.
`;
      }

      return `Hi,

I see our Quizizz School & District plan expired! On a daily basis, our teachers use Quizizz to promote student engagement, growth and mastery. We also use the platform to deliver formative and summative assessments, gather data to inform instruction and email parents, and collaborate with each other on lesson plans. We really need to keep our unlimited access so our service continues without restrictions or interruptions.

Quizizz offers a 14-day period within which we can still renew our plan This is vital to retain all materials, continue daily assignments, and conduct state test preparation.

Can you please help us out with this ASAP? Thank you so much.
`;
    },

    mailto() {
      try {
        const subject = encodeURIComponent(this.getEmailSubject());
        const body = encodeURIComponent(this.getEmailBody());
        if (this.$user.isAdmin) {
          window.location.href = `mailto:success@quizizz.com?subject=${subject}&body=${body}`;
        } else {
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }
        this.closeBanner('contact-success');
      } catch (ex) {
        this.closeBanner('contact-failure');
      }
    },

    outerText() {
      const displayDays = this.$user?.userPlanDaysLeft > 1 ? 'days' : 'day';

      if (this.isSndTrialPlanUser) {
        if (this.isPastDueSubscription) {
          return this.$i18n('Your School trial has expired.');
        }
        return this.$i18n('Your School trial ends in {$1} {$2}.', [this.$user?.userPlanDaysLeft, displayDays]);
      }

      if (this.isPastDueSubscription) {
        return this.$i18n('Your Organization\'s plan has expired.');
      }
      return this.$i18n('Your Organization\'s plan will expire in {$1} {$2}.', [this.$user?.userPlanDaysLeft, displayDays]);
    },

    innerText() {
      if (this.isPastDueSubscription) {
        if (this.$user?.organizationRole === 'instructor') {
          return this.$i18n('We\'ve applied a grace period for the next 14 days. Please notify an administrator to avoid any interruptions.');
        }
        return this.$i18n('We\'ve applied a grace period for the next 14 days. Please contact our team to avoid any interruptions to teachers and students.');
      }

      if (this.isApproachingRenewal) {
        if (this.$user?.isAdmin) {
          return this.$i18n('Please ensure that you\'re in touch with our team to avoid any interruptions to teacher and student accounts.');
        }
        return this.$i18n('Please notify an administrator to avoid any interruptions.');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import dayjs from 'dayjs';

import featureFlags from '~/services/FeatureFlagsService';
import Constants from '~/config/Constants';

export default class UserService {
  constructor(user) {
    this.userStore = user || {};
  }

  /*
   * Defines all the user object values as getters as well as some common global utility getters
   */
  get id() {
    return this.userStore.id;
  }

  get isLoggedIn() {
    return Boolean(this.userStore.id);
  }

  get username() {
    return this.userStore.username;
  }

  get createdAt() {
    return this.userStore.createdAt;
  }

  get firstName() {
    return this.userStore.firstName;
  }

  get lastName() {
    return this.userStore.lastName;
  }

  get title() {
    return this.userStore.title;
  }

  get fullName() {
    return [this.title, this.firstName, this.lastName].join(' ').trim();
  }

  get designation() {
    return this.userStore.designation;
  }

  get country() {
    return this.userStore.country;
  }

  get city() {
    return this.userStore.city;
  }

  get organization() {
    return this.userStore.organization;
  }

  get organizationIds() {
    return this.userStore.organizationIds;
  }

  get media() {
    return this.userStore.media;
  }

  get subjectTags() {
    return this.userStore.subject_tags;
  }

  get grades() {
    return this.userStore.grades;
  }

  get occupation() {
    return this.userStore.occupation;
  }

  get local() {
    return this.userStore.local;
  }

  get preferences() {
    return this.userStore.preferences;
  }

  get updated() {
    return this.userStore.updated;
  }

  get verified() {
    return this.userStore.verified;
  }

  get profileCompleteness() {
    return this.userStore.profileCompleteness;
  }

  get userCounts() {
    return this.userStore.userCounts;
  }

  get student() {
    return this.userStore.student;
  }

  get parent() {
    return this.userStore.parent;
  }

  get courses() {
    return this.userStore.courses;
  }

  get userTags() {
    return this.userStore?.tags || [];
  }

  get deactivated() {
    return this.userStore.deactivated;
  }

  get deleted() {
    return this.userStore.deleted;
  }

  get paidOrganization() {
    return this.userStore.paidOrganization;
  }

  get paidOrganizations() {
    return this.userStore.paidOrganizations;
  }

  get organizationRole() {
    return this.userStore.organizationRole;
  }

  get organizationType() {
    return this.userStore.organizationType;
  }

  get organizationName() {
    return this.userStore.organizationName;
  }

  get isAdmin() {
    return this.organizationRole === 'admin';
  }

  get subscriptions() {
    return this.userStore.subscriptions;
  }

  get priviledges() {
    return get(this.subscription, 'priviledges', {});
  }

  get lms() {
    return this.userStore.lms;
  }

  get onboardingState() {
    return this.userStore.onboardingState;
  }

  /*
   * Utility getters
   */
  get email() {
    return this.userStore.local ? this.userStore.local.email : '';
  }

  get phoneNumber() {
    return this.userStore.local ? this.userStore.local.phoneNumber : '';
  }

  get hasAccessToSndLMSIntegrations() {
    return !!this.priviledges.lmsIntegrations;
  }

  get subscription() {
    const { subscriptions } = this;
    const userOccupation = this.occupation;

    const matchedSubscriptions = filter(subscriptions, (subscription) => {
      const tags = (subscription || {}).tags || {};
      const planId = subscription ? subscription.planId : '';
      const occupation = tags.occupation || ['none'];

      return occupation.includes(userOccupation) || planId === 'school-plan';
    });

    if (matchedSubscriptions.length === 0) {
      return {};
    }

    const sub = { ...(matchedSubscriptions?.[0] ?? {}) };
    const showIndividualPlan = featureFlags().isEnabled(Constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    if (sub && showIndividualPlan) {
      if (sub.planName) {
        sub.planName = sub.planName.replaceAll('Super', 'Individual');
      }
      if (sub.productName) {
        sub.productName = sub.productName.replaceAll('Super', 'Individual');
      }
    }
    return sub;
  }

  get isCorporate() {
    return (
      this.occupation
      && (this.occupation === 'corporate'
        || this.occupation === 'corporate_teacher'
        || this.occupation === 'corporate_learner')
    );
  }

  get isTeacher() {
    return Constants.TeacherOccupations.includes(this.occupation);
  }

  get isStudent() {
    return this.occupation && this.occupation === 'student';
  }

  get isSuper() {
    const { subscription } = this;

    if (this.isCorporate) {
      return false;
    }

    if (Object.keys(subscription).length === 0) {
      return false;
    }

    if (this.isOnTrialSubscription) {
      return !this.isTrialExpired;
    }

    return true;
  }

  get hasActiveSnDPlan() {
    const sub = this.subscription;
    return sub.group === Constants.PlanGroup.SND;
  }

  get isPartOfAnOrganization() {
    return (
      this
      && this.paidOrganization
      && this.paidOrganization !== ''
      && this.organizationRole !== 'removed'
      && this.organizationType !== 'corporate'
    );
  }

  get isPartOfACorporateOrganization() {
    return this
    && this.paidOrganization
    && this.paidOrganization !== ''
    && this.organizationRole !== 'removed'
    && this.organizationType === 'corporate';
  }

  get isLMSUser() {
    return Boolean(get(this.userStore, 'canvas.profileId'))
      || Boolean(get(this.userStore, 'schoology.profileId'));
  }

  get plan() {
    const { subscription } = this;

    if (!isEmpty(subscription)) {
      return subscription.planName || subscription.productId;
    }

    return '';
  }

  get trialDaysLeft() {
    const today = dayjs();
    const subEndAt = dayjs(this.subscription.endAt);

    if (!this.isOnTrialSubscription && this.subscription.status !== 'trialing') {
      return 0;
    }

    if (today.isAfter(subEndAt) || !this.subscription.endAt) {
      return 0;
    }
    return subEndAt.diff(today, 'day') + 1; // Include today
  }

  get subEndAt() {
    const { subscription } = this;
    const plan = subscription?.status;
    const subEndAt = dayjs(plan === 'cancelling' ? this.subscription.cancelAt : this.subscription.endAt);
    return subEndAt;
  }

  get displaySubEndAt() {
    const date = dayjs(this.subEndAt);
    return date.format('mm/DD/YYYY');
  }

  get userPlanDaysLeft() {
    const today = dayjs();
    const { subEndAt } = this;
    return subEndAt.diff(today, 'day') + 1;
  }

  get isTrialExpired() {
    return this.trialDaysLeft < 1;
  }

  get isUserPlanExpired() {
    return this.userPlanDaysLeft < 1;
  }

  get isCorporateTrialExpired() {
    return this.isTrialExpired && this.isCorporateTrial;
  }

  get isCorporateTrial() {
    return this.isCorporate && this.isOnTrialSubscription;
  }

  get isCorporatePaidOrgAccount() {
    return this.organizationType === 'corporate';
  }

  get isOnTrialSubscription() {
    return !isEmpty(this.subscription) && get(this.subscription, 'action', '') === 'trial';
  }

  get isOnPaidSubscription() {
    return !isEmpty(this.subscription) && get(this.subscription, 'paid', false);
  }

  get isPastDueSubscription() {
    return !isEmpty(this.subscription) && get(this.subscription, 'status', '') === 'past_due';
  }

  get isDiscontinuedSubscription() {
    return !isEmpty(this.subscription) && get(this.subscription, 'amount', 0) === 6000;
  }

  get hasGclLinked() {
    return !isEmpty(this.userStore.lms) && !isEmpty(this.userStore.lms.gcl);
  }

  get hasCanvasLinked() {
    return !isEmpty(this.userStore.lms) && !isEmpty(this.userStore.lms.canvas);
  }

  get hasSchoologyLinked() {
    return !isEmpty(this.userStore.lms) && !isEmpty(this.userStore.lms.schoology);
  }

  get corporateOrgName() {
    return this.userStore.corporateOrgName;
  }

  get currentPlanStatus() {
    return this.userStore.currentPlanStatus;
  }

  get displayWelcomeBackModal22() {
    return this.userStore.displayWelcomeBackModal22;
  }

  get isEligibleForTrial() {
    return !this.trialTaken && !this.subscriptions?.length;
  }

  get role() {
    return this.userStore.role;
  }

  get roleDescription() {
    return this.userStore.roleDescription;
  }

  get contentPreferences() {
    return this.userStore.contentPreferences;
  }

  get teamIds() {
    return this.userStore.teamIds;
  }

  get trialTaken() {
    return this.userStore.trialTaken;
  }

  get studentDeviceAvailability() {
    return this.userStore?.studentDeviceAvailability || '';
  }

  get gameModePreference() {
    return this.userStore?.gameModePreference || '';
  }

  get stats() {
    return this.userStore?.stats;
  }

  get contentMetrics() {
    return this.userStore?.contentMetrics;
  }

  get userData() {
    return this.userStore?.userData;
  }

  get qfwOnboardingStatus() {
    return {
      profileCompleted: true,
      quizCreated: this.contentMetrics?.published.quiz > 0 || this.contentMetrics?.published.presentation > 0,
      gamePlayed: this.userStore?.userData?.qfwDemoQuizPlayed || this.stats?.gamesCreated > 2,
      gameHosted: (this.userStore?.userData?.qfwDemoQuizPlayed && this.stats?.gamesCreated > 1) || (!this.userStore?.userData?.qfwDemoQuizPlayed && this.stats?.gamesCreated > 0),
      gameCreated: this.stats?.gamesCreated,
      qfwDemoQuizPlayed: this.userStore?.userData?.qfwDemoQuizPlayed,
    };
  }

  /*
   * Defines all the setters that can be accessed throught the vue apllication to update any user related keys
   */

  set teamIds(teamIds) {
    this.userStore.teamIds = teamIds;
  }
}

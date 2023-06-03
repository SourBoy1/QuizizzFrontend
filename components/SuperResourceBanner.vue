<template>
  <div
    v-if="!isSuperUser"
    translate="no"
    class="bg-super-faded pt-6 pb-4 px-4 rounded-lg border-super-20% border"
  >
    <div class="flex items-center mb-2">
      <div
        v-if="isPremiumWeekResource"
        class="bg-super rounded h-6 w-6 mr-2 flex justify-center items-center"
      >
        <FA
          icon="fas fa-party-horn text-light-3"
          :size="12"
        />
      </div>
      <SuperIcon
        v-else
        color="white"
        class="mr-2"
        :class="superIconControls.classes"
        :size="superIconControls.size"
      />
      <div class="text-sm font-semibold">
        <span
          v-if="isPremiumWeekResource"
          class="text-dark-4"
        ><i18n>This is a</i18n></span>
        <span
          class="text-super"
          :class="{
            'uppercase italic font-extrabold': isPremiumWeekResource,
          }"
        >
          <i18n v-if="isPremiumWeekResource">Premium Week</i18n>
          <i18n v-else-if="showIndividualPlan">Premium</i18n>
          <i18n v-else>Super</i18n>
        </span>
        <span class="text-dark-4"><i18n>Resource</i18n></span>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div
        v-if="!isSuperUser"
        class="mr-6 text-xs font-semibold text-dark-2"
      >
        <slot>
          {{ bannerText }}
        </slot>
      </div>

      <Button
        v-if="canShowGetSuperBtn"
        class="get-super-button"
        :title="superUpgradeText"
        size="md"
        type="super-secondary"
        ticon="far fa-angle-right"
        @click="getSuperClicked"
      />
    </div>
  </div>
  <div
    v-else
    class="flex items-center p-3 rounded-lg border border-super-20% bg-light-3"
    :class="[{
      'items-center': orientation === 'horizontal',
      'flex-col items-start': orientation === 'vertical',
    }]"
  >
    <div
      v-if="isCountryUSA"
      class="rounded flex flex-col w-full"
    >
      <div class="flex mt-4 items-center font-bold text-sm">
        <SuperIcon
          color="white"
          class="mr-2"
          :class="superIconControls.classes"
          :size="superIconControls.size"
        />
        <div class="flex gap-x-1 items-center">
          <i18n>
            Finding
          </i18n>
          <span
            class="text-super font-bold"
          >
            {{ showIndividualPlan ? $i18n('Premium') : $i18n('Super') }}
          </span>
          <i18n>
            resources helpful?
          </i18n>
        </div>
      </div>
      <div class="w-full flex items-center justify-between text-xs">
        <i18n>
          Every teacher in your school can enjoy 1.8M premium resources on the platform.
        </i18n>
        <Button
          :title="$i18n('Upgrade to School Plan')"
          titleClasses="text-brand-super-dark rounded-md text-sm"
          buttonClasses="px-2"
          type="super-secondary"
          @click="handleClickOnUpgradeToSchool"
        />
      </div>
    </div>
    <div
      v-else
      class="rounded pr-2 pl-1 py-1 flex mr-4 items-center"
    >
      <SuperIcon
        color="white"
        class="mr-2"
        :class="superIconControls.classes"
        :size="superIconControls.size"
      />
      <div class="text-super text-sm font-semibold whitespace-nowrap">
        <i18n v-if="showIndividualPlan">
          Premium resource
        </i18n>
        <i18n v-else>
          Super resource
        </i18n>
        <div
          class="text-xs font-semibold text-dark-4"
          :class="[{
            'mt-2': orientation === 'vertical',
          }]"
        >
          <slot>
            <i18n v-if="showIndividualPlan">
              Thank you for being a Paid User. Get unlimited access to this and over 100,000 Premium resources.
            </i18n>
            <i18n v-else>
              Thank you for being Super. Get unlimited access to this and over 100,000 Super resources.
            </i18n>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import { OpenSnDPlansPage } from '~/utils/Redirection';
import { isCreatedDuringPremiumWeek } from '~/utils/FreeweekUtils';

export default {
  props: {
    superIconControls: {
      type: Object,
      default() {
        return {
          size: 12,
          classes: 'mr-2',
        };
      },
    },

    orientation: {
      type: String,
      default: 'linear',
      validate: (value) => ['linear', 'vertical'].includes(value),
    },

    isDesktop: {
      type: Boolean,
      default: true,
    },

    feat: {
      type: String,
      default: '',
    },

    variant: {
      type: String,
      default: '',
    },

    premiumWeekResource: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters('currentQuiz', ['quizType', 'quizCreatedAt']),
    ...mapGetters('products', ['isEligibleForTrial', 'planPrice']),
    ...mapGetters('root', ['serverData']),

    activityType() {
      return this.quizType === this.$constants.ContentType.QUIZ ? 'quiz' : 'lesson';
    },
    bannerText() {
      let text = this.$i18n('This {$1} uses some Super content. Upgrade to a Super plan to assign this to your students.', [this.activityType]);
      if (this.isPremiumWeekResource) {
        text = this.$i18n('This {$1} contains premium questions made during the \'Premium Question Week\'. You can host this forever, but you need to be on a premium account to edit it.', [this.activityType]);
      } else if (this.showIndividualPlan) {
        text = this.$i18n('This {$1} uses some Premium content. Upgrade to a Paid plan to assign this to your students.', [this.activityType]);
      }
      return text;
    },

    canShowGetSuperBtn() {
      return !this.isMSTeamsAppView || (this.isMSTeamsAppView && this.isDesktop);
    },
    isMSTeamsAppView() {
      return this.$msTeams?.isTeamApp();
    },
    isSuperUser() {
      return this.$user.isSuper;
    },
    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },
    superUpgradeText() {
      if (this.showIndividualPlan) {
        return this.$i18n('Upgrade now');
      }
      if (this.isEligibleForTrial) {
        return this.$i18n('Get free Super trial');
      }
      return this.$i18n('Upgrade your Plan');
    },

    isPremiumWeekResource() {
      return this.premiumWeekResource && isCreatedDuringPremiumWeek(this.quizCreatedAt);
    },

    isCountryUSA() {
      return this.serverData.requestCountry === 'US';
    },
  },

  methods: {
    handleClickOnUpgradeToSchool() {
      this.$analytics.logEvent(this.$webEvents.UPGRADE_TO_SND_CTA, {
        feat: this.feat,
        variant: this.variant,
        component: 'super_resource_banner',
        page: window.location.href,
        trial_shown: this.isEligibleForTrial,
        price: this.planPrice,
      });

      OpenSnDPlansPage(this.feat, this.variant);
    },

    getSuperClicked() {
      this.$analytics.logEvent(this.$webEvents.SuperTrialEvents.SUPER_TRIAL_CTA, {
        page: window.location.href,
        component: 'super_resource_banner',
        feat: this.feat,
        trial_shown: this.isEligibleForTrial,
        price: this.planPrice,
      });

      let url = `/super-pricing?feat=${this.feat}`;

      if (!isEmpty(this.variant)) {
        url += `&variant=${this.variant}`;
      }

      window.open(url);
    },
  },
};
</script>

<style lang="scss" scoped>
.get-super-button {
  min-width: fit-content;
}
</style>

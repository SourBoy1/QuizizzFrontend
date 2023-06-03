<template>
  <div
    v-if="shouldShowSuperQuestionBanner"
    class="w-full flex items-center justify-between py-1.5 px-3.5 bg-yellow-20% rounded-lg border-2 border-yellow-20% absolute -top-51 left-0"
  >
    <div class="flex items-center">
      <SuperIcon
        :size="9"
        class="mr-2 super-icon"
      />
      <h1
        v-if="isQuestionTypeSuperType(questionType)"
        class="text-light-3"
      >
        <i18n :injections="[premiumLabel]">
          This question type is a {$1} feature. Upgrade to save it in your quiz.
        </i18n>
      </h1>
      <h1
        v-else
        class="text-light-3"
      >
        <i18n :injections="[currentSlide.structure?.explain?.type, premiumLabel]">
          {$1} media in answer explanation is a {$2} feature. Upgrade to use it in your quiz.
        </i18n>
      </h1>
    </div>
    <div class="flex items-center">
      <Button
        :title="getSuperUpsellCTAText"
        titleClasses="text-light-3"
        type="super-secondary"
        @click="openUpgradeConfirmationModal"
      />
      <Button
        class="ml-2 -mb-1"
        type="transparent-floating-light"
        size="lg"
        data-cy="modal-close"
        rounded="full"
        ticon="far fa-times"
        :aria-label="$i18n('Close')"
        @click="hideSuperQuestionUpgradeBanner"
      />
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

import { isQuestionTypeSuperType } from '~/utils/QuizUtils';
import { isNotPremiumWeek } from '~/utils/FreeweekUtils';

export default {
  emits: ['redirect_to_pricing_page', 'openUpgradeConfirmationModal'],
  data() {
    return {
      showSuperQuestionUpgradeBanner: true,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('products', ['isEligibleForTrial']),

    isSuperUser() {
      return this.$user.isSuper;
    },

    questionType() {
      return this.currentSlide.type;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    questionQuery() {
      return this.currentSlide.structure.query;
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    getSuperUpsellCTAText() {
      if (this.showIndividualPlan) {
        return this.$i18n('Upgrade now');
      }
      if (this.isEligibleForTrial) {
        return this.$i18n('Get free Super trial');
      }
      return this.$i18n('Upgrade to Super');
    },

    isAudioVideoQuestion() {
      const { media } = this.questionQuery;
      if (media.filter((media) => media.type === 'audio' || media.type === 'video').length) {
        return true;
      }
      return false;
    },

    isAudioVideoExplanationsUsed() {
      const type = this.currentSlide.structure?.explain?.type;
      if (['audio', 'video'].includes(type)) {
        return true;
      }
      return false;
    },

    shouldShowSuperQuestionBanner() {
      return (
        !this.isSuperUser
        && !this.isCorporateUser
        && (isQuestionTypeSuperType(this.questionType) || this.isAudioVideoQuestion || this.isAudioVideoExplanationsUsed)
        && this.showSuperQuestionUpgradeBanner
        && isNotPremiumWeek()
      );
    },

    premiumLabel() {
      return this.showIndividualPlan ? this.$i18n('Premium') : this.$i18n('Super');
    },
  },

  watch: {
    shouldShowSuperQuestionBanner() {
      this.$forceUpdate();
    },
  },

  methods: {
    handleClickOnUpgradeToSuper() {
      const eventName = this.$webEvents.UPGRADE_TO_USE_SUPER_Q_NUDGE;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
        screen: 'questionEditor',
      });
      this.$eventBus.$emit('redirect_to_pricing_page');
      this.$router.push(`/super-pricing?backto=${encodeURIComponent(this.$route.path)}&redirectTo=${encodeURIComponent(this.$route.path)}&variant=${encodeURIComponent(this.$constants.SuperUpsellTypes.UPGRADE_TO_PUBLISH_QUIZ_WITH_SUPER_QUESTIONS)}&source=${encodeURIComponent('questionEditor')}&feat=superQuestionPassiveNudge_questionEditor` + `&variant=${encodeURIComponent(this.questionType)}`);
    },

    hideSuperQuestionUpgradeBanner() {
      this.showSuperQuestionUpgradeBanner = false;
    },

    openUpgradeConfirmationModal() {
      this.$eventBus.$emit('openUpgradeConfirmationModal');
    },

    isQuestionTypeSuperType(question) {
      return isQuestionTypeSuperType(question);
    },
  },
};
</script>

<style lang="scss" scoped>
  .-top-51 {
    top: -51px;
  }
</style>

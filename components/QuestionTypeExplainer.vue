<template>
  <div class="question-type-explainer flex flex-col p-4 gap-4 bg-light-2 border border-dark-6 border-l-0 rounded-r-lg">
    <div class="relative w-full h-38 bg-dark-1">
      <div
        v-if="isVideoLoading"
        class="absolute top-0 left-0 h-full w-full flex items-center justify-center"
      >
        <FA
          icon="fas fa-sync"
          :size="12"
          class="text-light-2 animate-spin"
        />
      </div>
      <video
        class="rounded-sm object-fill"
        :src="explainerData.videoURL"
        loop
        height="152"
        autoplay
        muted
        aria-hidden="true"
        @canplay="isVideoLoading = false"
      />
    </div>

    <div class="flex-1 flex flex-col justify-between mt-4">
      <div>
        <div class="text-dark-2 text-sm font-semibold">
          {{ explainerData.title }}
          <Lozenge
            v-if="isUserInTexas && explainerData.isSTAARQuestion"
            :title="$i18n('STAAR question')"
            class="ml-2"
            size="xs"
            containerClasses="bg-blue-20% text-blue"
          />
        </div>
        <div class="text-dark-4 text-xs font-semibold">
          {{ !isCorporateUser ? explainerData.description : explainerData.corporateDescription }}
        </div>
      </div>
      <div v-if="explainerData.tag">
        <Lozenge
          v-if="isQuestionTypeSuper && !shouldHideSuper && isNotPremiumWeek"
          class="bg-super text-light-3 mr-1"
          size="xs"
          icon="fas fa-bolt-lightning"
          :title="premiumLabeling"
        />
        <Lozenge
          :class="['rounded bg-opacity-20', brandColorClasses]"
          size="xs"
          :title="explainerData.tag"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { isNotPremiumWeek } from '~/utils/FreeweekUtils';

import Constants from '~/config/Constants';
import {
  getQuestionTypeExplainerData, getAllContentTypes, isQuestionTypeSuperType, comingSoonAssessmentType,
} from '../utils/QuizUtils';

export default {
  props: {
    questionType: {
      type: String,
      default: Constants.QuestionTypes.MCQ,
    },
  },

  data() {
    return {
      questionExplainerData: getQuestionTypeExplainerData(),
      allContentTypes: getAllContentTypes(),

      isVideoLoading: true,
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    isUserInTexas() {
      return this.serverData?.region?.includes('TX') ?? false;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isSnDUser() {
      return this.$user.isPartOfAnOrganization;
    },

    shouldHideSuper() {
      return this.isCorporateUser || this.isSnDUser;
    },

    isQuestionTypeSuper() {
      return isQuestionTypeSuperType(this.questionType) || this.comingSoonAssessmentType[this.questionType];
    },

    explainerData() {
      return this.questionExplainerData[this.questionType];
    },

    brandColorClasses() {
      const { brandColor } = this.allContentTypes[this.questionType] ?? this.comingSoonAssessmentType[this.questionType];
      return `bg-brand-${brandColor} text-brand-${brandColor}`;
    },

    comingSoonAssessmentType() {
      return Object.entries(comingSoonAssessmentType()).reduce((questionTypeList, [questionType, questionMetadata]) => {
        if (!this.$user.isSuper && !this.$user.isCorporate && !this.$user.isPartOfAnOrganization) {
          return questionTypeList;
        }

        if (questionMetadata.featureFlag && this.$featureFlags.isEnabled(questionMetadata.featureFlag)) {
          return questionTypeList;
        }

        questionTypeList[questionType] = questionMetadata;
        return questionTypeList;
      }, {});
    },

    premiumLabeling() {
      return this.showIndividualPlan ? this.$i18n('PREMIUM') : this.$i18n('SUPER');
    },

    isNotPremiumWeek() {
      return isNotPremiumWeek();
    },
  },

  watch: {
    questionType() {
      this.isVideoLoading = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.question-type-explainer {
  width: 304px;
}
</style>

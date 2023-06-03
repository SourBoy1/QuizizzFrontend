<template>
  <div class="flex">
    <div
      class="question-types-list px-3 py-4 border md:p-4 bg-light-3 border-dark-6"
      :class="[isQuestionTypeExplainerVisible ? 'rounded-l-lg' : 'rounded-lg', isDesktopOrTablet ? 'question-types-list' : 'question-types-list-mobile']"
    >
      <div
        v-if="!isFlaggedCorporateUser"
        class="mb-2 text-xs font-semibold text-dark-4"
      >
        <i18n>Assessment</i18n>
      </div>
      <div
        v-else
        class="mb-2 text-xs font-semibold text-dark-4"
      >
        <i18n>Most used</i18n>
      </div>
      <div class="grid w-full grid-cols-2 gap-2">
        <ForSuper
          v-for="(question) in values(assessmentTypeList)"
          :key="question.title"
          :shouldNotApplyForSuper="!isQuestionTypeSuperType(question.type) && isNotPremiumWeek"
          :type="getSuperUpsellType(question.type)"
          :feat="getSuperFeat(question.type)"
          :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
          @click:cancel="logEventForSuperQuestionType(question.type)"
          @click="onQuestionTypeSelected(question.type)"
        >
          <button
            :data-cy="`create-question-type-${question.type}`"
            class="flex items-start p-1 rounded-lg w-full text-dark-3 hover:bg-dark-5%"
            @mouseenter="onMouseEnter(question.type)"
          >
            <!-- Question Icon with super badge -->
            <div class="relative w-6 h-6 mr-2 rounded">
              <span class="absolute z-1 flex -top-1/4 -right-1/4">
                <SuperIcon
                  v-if="isQuestionTypeSuperType(question.type) && isNotPremiumWeek"
                  :size="9"
                />
              </span>
              <QuestionTypeIcon
                class="h-full aspect-square"
                :type="question.type"
                :size="11"
              />
            </div>
            <div class="flex items-center justify-between w-full">
              <span
                v-tooltip.bottom="question.title"
                class="flex flex-1 text-sm font-semibold text-left truncate whitespace-normal text-dark-2"
              >
                {{ question.title }}
              </span>
              <span
                v-if="question.isNew && isDesktop"
                class="text-light-3 text-xxs font-semibold bg-red rounded-full px-2"
              >
                <i18n>NEW</i18n>
              </span>
            </div>
          </button>
        </ForSuper>
      </div>

      <div
        v-if="!isEmpty(getComingSoonAssessmentType)"
        class="relative mt-4 coming-soon"
      >
        <div
          class="relative flex items-center mb-1 text-xs font-semibold z-1"
          :class="[!!$user.paidOrganization || $user.isCorporate ? 'text-dark-4' : 'text-super']"
        >
          <i18n>Coming Soon</i18n>
          <SuperIcon
            :size="9"
            class="ml-2"
          />
        </div>

        <div
          class="absolute z-0 border rounded-md emulate-outline -top-2 -left-2"
          :class="{
            'border-super bg-super-faded': !$user.paidOrganization && !$user.isCorporate,
            'border-dark-6 bg-light-2': $user.paidOrganization || $user.isCorporate,
          }"
        />

        <div class="relative grid grid-cols-2 gap-2 z-1">
          <ForSuper
            v-for="(question) in values(getComingSoonAssessmentType)"
            :key="question.title"
            :shouldNotApplyForSuper="!isQuestionTypeSuperType(question.type) && isNotPremiumWeek"
            :type="getSuperUpsellType(question.type)"
            :feat="getSuperFeat(question.type)"
            @click="handleComingSoonPeekaboo(question.type)"
          >
            <button
              type="button"
              :data-cy="`create-question-type-${question.type}`"
              class="flex items-start p-1 rounded-lg w-full text-dark-3 hover:bg-dark-5%"
              @mouseenter="onMouseEnter(question.type)"
            >
              <!-- Question Icon with super badge -->
              <div class="relative w-6 h-6 mr-2 rounded">
                <span class="absolute z-1 flex -top-1/4 -right-1/4">
                  <SuperIcon
                    v-if="isQuestionTypeSuperType(question.type) && isNotPremiumWeek"
                    :size="9"
                  />
                </span>
                <QuestionTypeIcon
                  class="h-full aspect-square"
                  :type="question.type"
                  :size="11"
                />
              </div>
              <div
                v-tooltip.bottom="question.title"
                class="flex flex-1 text-sm font-semibold text-left truncate whitespace-normal text-dark-2"
              >
                {{ question.title }}
              </div>
            </button>
          </ForSuper>
        </div>
      </div>

      <div
        v-if="!isFlaggedCorporateUser"
        class="mt-5 mb-2 text-xs font-semibold text-dark-4"
      >
        <i18n>Higher-order thinking</i18n>
      </div>
      <div
        v-else
        class="mt-5 mb-2 text-xs font-semibold text-dark-4"
      >
        <i18n>
          Gather participant responses
        </i18n>
      </div>

      <div class="grid w-full grid-cols-2 gap-2">
        <ForSuper
          v-for="(question) in values(higherOrderThinkingTypeQuestions)"
          :key="question.title"
          :shouldNotApplyForSuper="!isQuestionTypeSuperType(question.type) && isNotPremiumWeek"
          :type="getSuperUpsellType(question.type)"
          :feat="getSuperFeat(question.type)"
          :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
          @click="onQuestionTypeSelected(question.type)"
        >
          <button
            type="button"
            :data-cy="`create-question-type-${question.type}`"
            class="flex items-start p-1 rounded-lg w-full text-dark-3 hover:bg-dark-5%"
            @mouseenter="onMouseEnter(question.type)"
          >
            <!-- Question Icon with super badge -->
            <div class="relative w-6 h-6 mr-2 rounded">
              <span class="absolute z-1 flex -top-1/4 -right-1/4">
                <SuperIcon
                  v-if="isQuestionTypeSuperType(question.type) && isNotPremiumWeek"
                  :size="9"
                />
              </span>
              <QuestionTypeIcon
                class="h-full aspect-square"
                :type="question.type"
                :size="11"
              />
            </div>
            <div
              v-tooltip.bottom="question.title"
              class="flex flex-1 text-sm font-semibold text-left truncate whitespace-normal text-dark-2"
            >
              {{ question.title }}
            </div>
          </button>
        </ForSuper>
      </div>
      <div class="mt-5 mb-2 text-xs font-semibold text-dark-4">
        <i18n>Other</i18n>
      </div>
      <div class="grid w-full grid-cols-2 gap-2">
        <ForSuper
          v-for="(question) in values(otherTypesList)"
          :key="question.title"
          :shouldNotApplyForSuper="!isQuestionTypeSuperType(question.type)"
          :type="getSuperUpsellType(question.type)"
          :feat="getSuperFeat(question.type)"
          @click="onQuestionTypeSelected(question.type)"
        >
          <button
            type="button"
            :data-cy="`create-question-type-${question.type}`"
            class="flex items-start p-1 rounded-lg w-full text-dark-3 hover:bg-dark-5%"
            @mouseenter="onMouseEnter(question.type)"
          >
            <!-- Question Icon with super badge -->
            <div class="relative w-6 h-6 mr-2 rounded">
              <span class="absolute z-1 flex -top-1/4 -right-1/4">
                <SuperIcon
                  v-if="isQuestionTypeSuperType(question.type)"
                  :size="9"
                />
              </span>
              <QuestionTypeIcon
                class="h-full aspect-square"
                :type="question.type"
                :size="11"
              />
            </div>
            <div
              v-tooltip.bottom="question.title"
              class="flex flex-1 text-sm font-semibold text-left truncate whitespace-normal text-dark-2"
            >
              {{ question.title }}
            </div>
          </button>
        </ForSuper>
      </div>
    </div>

    <QuestionTypeExplainer
      v-if="isQuestionTypeExplainerVisible"
      class="flex-1"
      :questionType="explainerQuestionType"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import values from 'lodash/values';
import debounce from 'lodash/debounce';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';

import { getOtherQuestionTypes, getAssessmentQuestionTypes, getHigherOrderThinkingQuestionTypes } from '~/config/QuestionTypes';
import { isNotPremiumWeek } from '~/utils/FreeweekUtils';

import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import Constants from '~/config/Constants';
import { isQuestionTypeSuperType, comingSoonAssessmentType, getQuestionTypeExplainerData } from '../utils/QuizUtils';

export default {

  props: {
    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },

    source: {
      type: String,
      default: '',
    },
  },
  emits: ['questionTypeSelected'],

  data() {
    return {
      explainerQuestionType: Constants.QuestionTypes.MCQ,
      explainersAnalyticsList: [],
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),
    ...mapGetters('root', ['isDesktop', 'isTablet']),
    ...mapGetters('contentEditor', ['quiz', 'quizId', 'draft']),

    isDesktopOrTablet() {
      return this.isDesktop || this.isTablet;
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isFlaggedCorporateUser() {
      if (this.isCorporateUser) {
        return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.QFW_CREATE_FLOW);
      }
      return false;
    },

    getPeekabooHeading() {
      return (questionType) => {
        let questionTypeInfoText = this.$i18n('Whether it’s marking cities on a map or identifying organs in the human body, let students get it spot on every time.');

        if (questionType === this.$constants.QuestionTypes.GRAPHING) {
          if (this.$user.isCorporate) {
            questionTypeInfoText = this.$i18n('Participants can use a graph to answer questions!');
          } else {
            questionTypeInfoText = this.$i18n('Students can use a graph to answer questions!');
          }
        }

        if (questionType === this.$constants.QuestionTypes.DND_IMAGE) {
          questionTypeInfoText = this.$i18n('A picture is worth a thousand words...but you can sum it up in ten labels!');
        }

        if (this.$user.isPartOfAnOrganization && this.$user.plan !== '') {
          return this.$i18n('{$1} \n\nYou’re on the School and District plan! You will have access to this question type once it’s out.', [questionTypeInfoText]);
        }

        if (this.$user.isCorporate) {
          return this.$i18n('{$1} \n\nYou’re on the Quizizz for Work plan! You will have access to this question type once it’s out.', [questionTypeInfoText]);
        }

        if (this.$user.isSuper) {
          return this.$i18n('{$1} \n\nYou’re on a {$2} plan! You will have access to this question type once it’s out.', [questionTypeInfoText, this.showIndividualPlan ? 'Premium' : 'Super']);
        }

        return this.$i18n('{$1} \n\nUpgrade to {$2} to get access to this new question type when it’s out.', [questionTypeInfoText, this.showIndividualPlan ? 'Premium' : 'Super']);
      };
    },

    isUserInTexas() {
      return this.serverData?.region?.includes('TX') ?? false;
    },

    getComingSoonAssessmentType() {
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

    otherTypesList() {
      return getOtherQuestionTypes(this.isFlaggedCorporateUser);
    },

    assessmentTypeList() {
      return getAssessmentQuestionTypes(this.isFlaggedCorporateUser);
    },

    higherOrderThinkingTypeQuestions() {
      return getHigherOrderThinkingQuestionTypes();
    },

    isQuestionTypeExplainerVisible() {
      return this.isDesktop;
    },

    isNotPremiumWeek() {
      return isNotPremiumWeek();
    },
  },

  created() {
    this.debouncedAnalyticsListUpdate = debounce(this.analyticsListUpdate, 1000);
  },

  methods: {
    isEmpty,
    values,
    isQuestionTypeSuperType(questionType) {
      return isQuestionTypeSuperType(questionType);
    },

    onMouseEnter(type) {
      this.explainerQuestionType = type;

      this.debouncedAnalyticsListUpdate(type);
    },

    analyticsListUpdate(type) {
      if (!includes(this.explainersAnalyticsList, type)) {
        this.explainersAnalyticsList = [...this.explainersAnalyticsList, type];
      }
    },

    onQuestionTypeSelected(questionType) {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'Q:AddQList');
      this.$store.dispatch('analyticsManager/addQuestionInstanceEnrichmentData');
      const eventName = this.$webEvents.getQuizEditorEvent(this.quiz.type, this.$webEvents.EDITOR_QUESTION_CREATE);
      this.analyticsListUpdate(questionType);

      // Prevent duplicate events call from QTypes modal
      if (this.source !== 'select_q_type_modal') {
        this.$analytics.logEvent(
          eventName,
          {
            draftId: this.draft._id,
            quizId: this.quizId,
            questionType,
            isPremium: this.isQuestionTypeSuperType(questionType),
            questionTypesHovered: this.explainersAnalyticsList,
            screen: 'questionEditor',
            source: this.source,
          },
        );
      }

      if (questionType === this.$constants.QuestionTypes.MATCH || questionType === this.$constants.QuestionTypes.REORDER) {
        HotjarService.triggerEvent(HotjarEvents.HOTJAR_MATCH_REORDER_CREATE);
      }

      if (questionType === this.$constants.QuestionTypes.DRAGNDROP || questionType === this.$constants.QuestionTypes.DROPDOWN) {
        HotjarService.triggerEvent(HotjarEvents.HOTJAR_DND_CREATE);
      }

      if (questionType === this.$constants.QuestionTypes.EQUATION) {
        this.$router.push({ query: { question_type: 'math_response' } });
        HotjarService.triggerEvent(HotjarEvents.HOTJAR_MATH_RESPONSE_CREATE);
      }

      this.explainersAnalyticsList = [];
      this.$emit('questionTypeSelected', { type: questionType, source: this.source });
    },

    getSuperUpsellType(questionType) {
      return this.$constants.SuperUpsellTypes[`${questionType}_QUESTION`];
    },

    getSuperFeat(questionType) {
      return this.$constants.FeatureTypes[`${questionType}_QUESTION`];
    },

    handleComingSoonPeekaboo(questionType) {
      const explainerData = getQuestionTypeExplainerData();
      const superUpsellTitle = this.$i18n('Coming Soon - {$1}', [explainerData[questionType].title]);
      this.$eventBus.$emit('questionEditor:toggleQuestionTypeInfoPeekaboo', {
        title: this.isUserInTexas ? this.$i18n('Get your students familar with STAAR questions') : superUpsellTitle,
        description: this.getPeekabooHeading(questionType),
        superFeat: `${this.$constants.FeatureTypes[`${questionType}_QUESTION`]}_INTENT`,
        showPrimaryCTA: false,
        mediaURL: explainerData[questionType].videoURL,
        questionType,
      });
    },

    logEventForSuperQuestionType(questionType) {
      this.$analytics.logEvent(this.$webEvents.QUIZ_EDITOR_SUPER_QUESTION_INTENT, {
        questionType,
        region: window.serverData?.region || 'null',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.question-types-list {
  width: 416px;
}

.question-types-list-mobile {
  width: 100%;
}

.emulate-outline {
  height: calc(100% + 12px);
  width: calc(100% + 12px);
}
</style>

<template>
  <div
    v-if="getQuestions.length"
    class="flex flex-col gap-2"
  >
    <p
      class="text-sm text-dark-2 font-bold"
      :class="{
        'opacity-[0.2]': areAllQuestionsHighlighted,
      }"
    >
      {{ title }}
    </p>
    <div
      class="flex"
      :class="isDesktopOrTablet ? 'flex-col gap-2' : 'grid grid-cols-2'"
    >
      <ForSuper
        v-for="(question) in getQuestions"
        :key="question.title"
        :class="{ 'pointer-events-none select-none': question.highlighted }"
        :shouldNotApplyForSuper="!isQuestionTypeSuperType(question.type)"
        :type="getSuperUpsellType(question.type)"
        :feat="getSuperFeat(question.type)"
        :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
        @click="onQuestionTypeSelected(question.type)"
      >
        <Tooltip
          :showOnHover="isDesktop"
          :position="question.tooltipPosition"
          withToolTipContentAsSlot
          theme="dark"
        >
          <template #tool-tip-content>
            <QtypeExplainerThumbnail
              :questionType="question.type"
            />
          </template>
          <button
            :data-cy="`create-question-type-${question.type}`"
            class="flex items-start p-1 rounded-lg w-full text-dark-3 hover:bg-dark-5%"
            :class="{
              'opacity-[0.2] pointer-events-none': question.highlighted,
            }"
          >
            <!-- Question Icon with super badge -->
            <div class="relative w-6 h-6 mr-2 rounded">
              <span class="absolute z-1 -top-1/5 left-3/4">
                <SuperIcon
                  v-if="isQuestionTypeSuperType(question.type)"
                  :size="7"
                />
              </span>
              <QuestionTypeIcon
                class="flex-1 w-full h-full"
                :type="question.type"
                :size="11"
              />
            </div>
            <div class="flex flex-1 gap-2 items-center text-sm font-semibold text-left truncate whitespace-normal text-dark-2">
              {{ question.title }}
              <span
                v-if="question.isNew"
                class="text-light-3 h-4 w-full flex items-center text-xxs font-semibold bg-red rounded-full px-2"
              >
                <i18n>NEW</i18n>
              </span>
            </div>
          </button>
        </Tooltip>
      </ForSuper>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import QtypeExplainerThumbnail from '~/components/QuestionTypesVisibility/QtypeExplainerThumbnail.vue';

import { isQuestionTypeSuperType } from '~/utils/QuizUtils';
import Constants from '~/config/Constants';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';

export default {

  components: {
    QtypeExplainerThumbnail,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    questionsList: {
      type: Array,
      default: () => [],
    },
    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },
    selectedGradeCategoryTab: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: '',
    },
  },
  emits: ['questionTypeSelected'],

  computed: {
    ...mapGetters('root', ['isDesktop', 'isTablet']),
    ...mapGetters('contentEditor', ['quiz', 'quizId', 'draft']),

    getQuestions() {
      return this.questionsList.filter((question) => question.type !== Constants.QuestionTypes.MSQ).sort((a, b) => a.orderInTheCategory - b.orderInTheCategory);
    },

    areAllQuestionsHighlighted() {
      return this.getQuestions.every((question) => question.highlighted);
    },

    isDesktopOrTablet() {
      return this.isDesktop || this.isTablet;
    },

  },

  methods: {
    isQuestionTypeSuperType(questionType) {
      return isQuestionTypeSuperType(questionType);
    },

    onQuestionTypeSelected(questionType) {
      this.$store.dispatch('analyticsManager/addQuestionInstanceEnrichmentData');
      const eventName = this.$webEvents.getQuizEditorEvent(this.quiz.type, this.$webEvents.EDITOR_QUESTION_CREATE);

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
          selectedGradeCategoryTab: this.selectedGradeCategoryTab,
        },
      );

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
  },
};
</script>

<template>
  <div class="desktop flex flex-col items-center">
    <QuestionEditorLayout
      :containerStyles="containerStyles"
      :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
      :isSaveButtonFocused="isSaveButtonFocused"
      @setGeneratedOptionsForCurrentSlide="setGeneratedOptionsForCurrentSlide"
    />

    <QuestionEditorBottomToolbar
      :isMultipleAnswerWarningTooltipVisible="isMultipleAnswerWarningTooltipVisible"
      :currentQuestionErrors="currentQuestionValidationErrors"
      :questionOptionOrder="questionOptionOrder"
      :isCancelConfirmerVisible="isCancelConfirmerVisible"
      :isSaveBtnInErrorState="isSaveBtnInErrorState"
      :isEditActionInProgress="isEditActionInProgress"
      :generatedOptionsForCurrentSlide="generatedOptionsForCurrentSlide"
      class="z-20 transition-all duration-500"
      @deleteAnswerExplanation="deleteAnswerExplanation"
      @onSaveButtonFocused="onSaveButtonFocused"
      @onQuestionEditAction="onQuestionEditAction"
      @showParticipantView="handleShowParticipantViewClick"
    />

    <Modal
      v-if="showEquationTypeOnboardingModal"
      :title="$i18n('Walkthrough')"
      size="xl"
      fullWidth
      dismissOnOverlayClick
      backgroundColor="bg-dark-2"
      closeBtnClasses="text-light"
      titleCustomClasses="text-light-3"
      @close="showEquationTypeOnboardingModal = false"
    >
      <video
        autoplay="true"
        width="768"
        height="432"
        controls
      >
        <source
          src="https://cf.quizizz.com/videos/AddToCartOnboardingVideo.mp4"
          type="video/mp4"
        >
      </video>
    </Modal>

    <Modal
      v-if="upgradeConfirmationModal"
      :title="$i18n('You may lose your changes if you leave this page')"
      :subtitle="$i18n('Save your changes to this question first as going away will delete the changes you may have made')"
      size="md"
      fullWidth
      dismissOnOverlayClick
      :button1="{ title: $i18n('Cancel'), type: 'other' }"
      :button2="{ title: $i18n('Leave page'), type: 'primary' }"
      @button1-click="closeUpgradeConfirmationModal('cancel')"
      @button2-click="handleClickOnUpgradeToSuper"
      @close="closeUpgradeConfirmationModal('close')"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import QuestionEditorLayout from '~/components/QuestionEditor/Layouts/Desktop/index.vue';

import Constants from '~/config/Constants';
import removeHTMLTags from '~/utils/removeHTMLTags';

import { isOptionsBasedQuestion, isWordCloudQuestion } from '~/utils/QuizUtils';
import { addSurvicateQueryParam } from '~/utils/SurvicateUtils';
import { getAccountType } from '~/utils/UserUtils';

export default {

  components: {
    QuestionEditorLayout,
  },

  props: {

    isCancelConfirmerVisible: {
      type: Boolean,
      default: true,
    },

    isSaveBtnInErrorState: {
      type: Boolean,
      default: true,
    },

    isEditActionInProgress: {
      type: Object,
      default: () => {},
    },

    containerStyles: {
      type: Object,
      default: () => {},
    },

    questionOptionOrder: {
      type: String,
      default: Constants.OrderQuestionArrangement.ASC,
    },

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },

    currentQuestionValidationErrors: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['deleteAnswerExplanation', 'onQuestionEditAction', 'redirect_to_pricing_page'],

  data() {
    return {
      isMultipleAnswerWarningTooltipVisible: false,
      questionMountedOn: Date.now(),
      isSaveButtonFocused: false,
      generatedOptionsForCurrentSlide: null,
      showEquationTypeOnboardingModal: false,
      generatedExplanationForCurrentSlide: null,
      upgradeConfirmationModal: false,
      canShowOptionsGeneratorFeature: false,
      canShowAllOptionsGeneratorFeature: false,
    };
  },

  computed: {
    ...mapGetters({
      currentSlide: 'slideEditor/currentSlide',
      parameterVersion: 'slideEditor/getAnalyticsParameterVersion',
      optionGeneratorTokens: 'slideEditor/getAnalyticsOptionGeneratorTokens',
      optionGeneratorTokensLogProbs: 'slideEditor/getAnalyticsOptionGeneratorTokensLogProbs',
      subjectForGeneratedOptions: 'contentEditor/getSubjectForGeneratedOptions',
      isEditorForPresentationContent: 'contentEditor/isEditorForPresentationContent',
      usedQuestionTemplate: 'slideEditor/usedQuestionTemplate',
    }),

    ...mapGetters('slideEditor', ['currentSlideId', 'checkIfUserEditedSlide']),
    ...mapGetters('contentEditor', ['quizId']),

    isBasicUser() {
      return getAccountType(this.$user) === this.$constants.AccountTypes.BASIC;
    },

    questionType() {
      return this.currentSlide.type;
    },

    showStandardTaggingBtn() {
      return !this.isQuizWithoutDrafts;
    },

    isCurrentQuestionOptionsBased() {
      return isOptionsBasedQuestion(this.currentSlide);
    },

    questionOptions() {
      return this.currentSlide?.structure?.options ?? [];
    },
  },

  mounted() {
    this.resetAnalytics();
    this.$eventBus.$on('generatedExplanation', this.onExplanation);
    this.$eventBus.$on('openUpgradeConfirmationModal', this.openUpgradeConfirmationModal);

    this.questionMountedOn = Date.now();

    switch (this.$featureFlags.getFeatureValue(this.$constants.FeatureFlagsTypes.SHOW_OPTIONS_GENERATOR)) {
      case '1':
        this.canShowOptionsGeneratorFeature = true;
        break;

      case '2':
        this.canShowAllOptionsGeneratorFeature = true;
        break;
      default:
    }
  },

  beforeUnmount() {
    this.fillAnswerNudgeTimeout && clearTimeout(this.fillAnswerNudgeTimeout);

    this.$eventBus.$off('generatedExplanation', this.onExplanation);
    this.$eventBus.$off('openUpgradeConfirmationModal', this.openUpgradeConfirmationModal);
  },

  methods: {
    ...mapActions({
      resetAnalytics: 'slideEditor/resetAnalytics',
      toggleQuestionPreviewOnEditor: 'uiManager/toggleQuestionPreviewOnEditor',
      updateGraphDataIntoQuestion: 'slideEditor/updateGraphDataIntoQuestion',
    }),

    handleShowParticipantViewClick() {
      this.$analytics.logEvent(this.$webEvents.PARTICIPANTS_VIEW_ON_EDITOR_OPENED, {
        questionType: this.questionType,
        quizId: this.quizId,
      });
      if (this.questionType === Constants.QuestionTypes.GRAPHING) {
        this.updateGraphDataIntoQuestion();
      }
      this.toggleQuestionPreviewOnEditor({
        shouldShowQuestionPreview: true,
      });
    },

    onExplanation(explanation) {
      this.generatedExplanationForCurrentSlide = explanation;
      return explanation;
    },

    deleteAnswerExplanation() {
      this.$emit('deleteAnswerExplanation');
    },

    onQuestionEditAction(action, source) {
      let questionType = this.currentSlide.type;
      if (isWordCloudQuestion(this.currentSlide)) {
        questionType = this.$constants.QuestionTypes.WORDCLOUD;
      }

      if (action === 'cancel') {
        const eventName = this.$webEvents.SAVE_UNSAVE_QUESTION;
        this.$analytics.logEvent(eventName, {
          userId: this.$user.id,
          quizId: this.quizId,
          questionType,
          action,
        });
      }
      if (action === 'save') {
        if (this.generatedOptionsForCurrentSlide && this.isCurrentQuestionOptionsBased) {
          let isEditedOptions = false;
          let numberOfOptionsEdited = 0;
          const questionOptionsTextArray = this.questionOptions?.map((ele) => removeHTMLTags(ele.text));

          this.generatedOptionsForCurrentSlide?.forEach((ele, index) => {
            if (ele !== questionOptionsTextArray[index + 1]) {
              numberOfOptionsEdited += 1;
              isEditedOptions = true;
            }
          });

          if (!this.isBasicUser) {
            let correctOptions = 'NOT_SUPPORTED';
            switch (this.currentSlide.type) {
              case this.$constants.QuestionTypes.MCQ:
                correctOptions = removeHTMLTags(this.currentSlide.structure.options[this.currentSlide.structure.answer].text);
                break;
              case this.$constants.QuestionTypes.MSQ:
                correctOptions = this.currentSlide.structure.answer.map((ele) => removeHTMLTags(this.currentSlide.structure.options[ele].text)).join(',');
                break;
              default:
                break;
            }

            if (!this.$route.query.opGenUsed) {
              addSurvicateQueryParam(this.$router, this.$route.query, 'opGenUsed');
            }

            if (this.canShowOptionsGeneratorFeature) {
              this.$analytics.logEvent(
                this.$webEvents.PUBLISHED_VS_GENERATED_OPTIONS,
                {
                  questionId: this.currentSlideId,
                  quizId: this.quizId,
                  questionText: removeHTMLTags(this.currentSlide.structure.query.text),
                  generatedOptions: this.generatedOptionsForCurrentSlide.join(','),
                  finalOptions: questionOptionsTextArray.join(','),
                  correctOption: correctOptions,
                  numberOfOptionsEdited,
                  edited: isEditedOptions,
                  parameterVersion: this.parameterVersion,
                  optionGeneratorTokensLogProbs: this.optionGeneratorTokensLogProbs,
                  optionGeneratorTokens: this.optionGeneratorTokens,
                  subject: this.subjectForGeneratedOptions,
                },
              );
            }
          }
        }

        const questionOptionsTextArray = this.questionOptions?.map((ele) => removeHTMLTags(ele.text));

        if (this.canShowAllOptionsGeneratorFeature) {
          this.$analytics.logEvent(this.$webEvents.PUBLISHED_VS_GENERATE_ALL_OPTIONS, {
            questionId: this.currentSlideId,
            quizId: this.quizId,
            questionText: removeHTMLTags(this.currentSlide.structure.query.text),
            generatedOptions: this.generatedOptionsForCurrentSlide,
            finalOptions: questionOptionsTextArray.join(','),
            parameterVersion: this.parameterVersion,
            optionGeneratorTokensLogProbs: this.optionGeneratorTokensLogProbs,
            optionGeneratorTokens: this.optionGeneratorTokens,
            subject: this.subjectForGeneratedOptions,
          });
        }

        // add survicate for question types
        if (this.currentSlide.type === this.$constants.QuestionTypes.HOTSPOT) {
          addSurvicateQueryParam(this.$router, this.$route.query, 'addedHotspot');
        }

        if (this.currentSlide.type === this.$constants.QuestionTypes.DND_IMAGE) {
          addSurvicateQueryParam(this.$router, this.$route.query, 'addedLabeling');
        }

        if (this.currentSlide.type === this.$constants.QuestionTypes.GRAPHING) {
          addSurvicateQueryParam(this.$router, this.$route.query, 'addedGraphing');
        }

        addSurvicateQueryParam(this.$router, this.$route.query, 'qcSave');

        if (this.usedQuestionTemplate?.isUsed) {
          this.$analytics.logEvent(this.$webEvents.QUESTION_EDITOR_TEMPLATE_SAVED, {
            segmentName: this.usedQuestionTemplate.segmentName,
            description: this.usedQuestionTemplate.description,
            questionType: this.usedQuestionTemplate.questionType,
          });
        }

        if (this.generatedExplanationForCurrentSlide) {
          const isAnswerExplantionGeneratorUsed = true;
          let isGeneratedExplantionEdited = false;
          if (removeHTMLTags(this.currentSlide.structure.explain.text).length !== this.generatedExplanationForCurrentSlide.length) {
            isGeneratedExplantionEdited = true;
          }

          if (this.generatedOptionsForCurrentSlide && !this.$route.query.opAndAnsExpUsed) {
            addSurvicateQueryParam(this.$router, this.$route.query, 'opAndAnsExpUsed');
          }

          if (!this.$route.query.ansExpUsed) {
            addSurvicateQueryParam(this.$router, this.$route.query, 'ansExpUsed');
          }

          this.$analytics.logEvent(
            this.$webEvents.PUBLISHED_VS_GENERATED_EXPLAINATION,
            {
              questionId: this.currentSlideId,
              questionText: removeHTMLTags(this.currentSlide.structure.query.text),
              isAnswerExplantionGeneratorUsed,
              generatedExplanationForCurrentSlide: this.generatedExplanationForCurrentSlide,
              finalAnswerExplanation: removeHTMLTags(this.currentSlide.structure.explain.text),
              isGeneratedExplantionEdited,
            },
          );
        }
      }
      this.$emit('onQuestionEditAction', action, source);
    },

    onSaveButtonFocused(isFocused) {
      this.isSaveButtonFocused = isFocused;
    },

    setGeneratedOptionsForCurrentSlide(options) {
      this.generatedOptionsForCurrentSlide = options;
    },

    setGeneratedExplanationForCurrentSlide(explanation) {
      this.generatedExplanationForCurrentSlide = explanation;
    },

    openUpgradeConfirmationModal() {
      const eventName = this.$webEvents.OPENED_UPGRADE_CONFIRMATION_MODAL;
      this.$analytics.logEvent(eventName);
      this.upgradeConfirmationModal = true;
    },

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

    closeUpgradeConfirmationModal(source) {
      const eventName = this.$webEvents.CLOSE_UPGRADE_CONFIRMATION_MODAL;
      this.$analytics.logEvent(eventName, {
        source,
      });
      this.upgradeConfirmationModal = false;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

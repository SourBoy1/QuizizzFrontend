<template>
  <div
    :key="errorCodeToCheck"
    class="slide-error-string"
  >
    <i18n v-if="isQuestionMissing">
      Please add the question.
    </i18n>

    <i18n
      v-else-if="areOptionsTooFew"
      :injections="[errorMeta.minOptionsLimit ? errorMeta.minOptionsLimit : 2]"
    >
      Please add at least {$1} answer options.
    </i18n>

    <i18n v-else-if="areOptionsTooMany">
      You cannot add more than 5 options
    </i18n>

    <i18n v-else-if="isThereNoCorrectAnswer">
      Please mark the correct answer.
    </i18n>

    <i18n v-else-if="isEmptyOptionsMarkedCorrect">
      Please fill the options marked correct
    </i18n>

    <i18n
      v-else-if="isNonSuperVideoAnswerSelected"
      :injections="[upgradeText]"
    >
      Please unlock {$1} plan to select Video type response.
    </i18n>

    <i18n v-else-if="isAnswerTimeNotSelected">
      Please select a response time.
    </i18n>

    <i18n v-else-if="areTooManyCharacters">
      Too many characters in an option
    </i18n>

    <i18n v-else-if="areTooFewBlanks">
      There should be at least one blank
    </i18n>

    <i18n v-else-if="aretooFewMatches">
      Please add corresponding match for the option
    </i18n>

    <i18n v-else-if="isMissingOptionForMatch">
      Please add corresponding option for the match
    </i18n>

    <i18n v-else-if="isThereNoCorrectAnswerForFIBOrEquation">
      Please add the correct answer
    </i18n>

    <i18n v-else-if="isValidMathExpression">
      Please enter a valid math expression
    </i18n>

    <i18n v-else-if="isImageMissing">
      Please add an image
    </i18n>

    <i18n v-else-if="areOptionGroupsTooFew">
      Please add at least 2 option groups
    </i18n>

    <i18n v-else-if="doesOptionGroupNotHavingEnoughOptions">
      Please add at least 1 option in a group
    </i18n>

    <i18n v-else>
      Please complete editing the question.
    </i18n>
  </div>
</template>

<script>
import Constants from '~/config/Constants';

export default {

  props: {
    errorCodes: {
      type: Array,
      required: true,
    },
  },

  computed: {
    errorCodeToCheck() {
      return this.errorCodes[0]?.errorCode || '';
    },

    errorMeta() {
      return this.errorCodes[0]?.meta || '';
    },

    isQuestionMissing() {
      return ([
        this.$constants.QuestionValidationErrorCodes.EMPTY_QUESTION_QUERY,
      ]).includes(this.errorCodeToCheck);
    },

    areOptionsTooFew() {
      return ([
        this.$constants.QuestionValidationErrorCodes.TOO_FEW_OPTIONS,
      ]).includes(this.errorCodeToCheck);
    },

    isValidMathExpression() {
      return ([
        this.$constants.QuestionValidationErrorCodes.INVALID_MATH,
      ]).includes(this.errorCodeToCheck);
    },

    areOptionsTooFewToDrag() {
      return ([
        this.$constants.QuestionValidationErrorCodes.TOO_FEW_OPTIONS_TO_DRAG,
      ]).includes(this.errorCodeToCheck);
    },

    areTooManyCharacters() {
      return ([
        this.$constants.QuestionValidationErrorCodes.TOO_MANY_CHARACTERS,
      ]).includes(this.errorCodeToCheck);
    },

    areOptionsTooMany() {
      return ([
        this.$constants.QuestionValidationErrorCodes.TOO_MANY_OPTIONS,
      ]).includes(this.errorCodeToCheck);
    },

    isNonSuperVideoAnswerSelected() {
      return ([
        this.$constants.QuestionValidationErrorCodes.NON_SUPER_VIDEO_ANSWER,
      ]).includes(this.errorCodeToCheck);
    },

    isAnswerTimeNotSelected() {
      return ([
        this.$constants.QuestionValidationErrorCodes.ANSWER_TIME_NOT_SELECTED,
      ]).includes(this.errorCodeToCheck);
    },

    aretooFewMatches() {
      return ([
        this.$constants.QuestionValidationErrorCodes.TOO_FEW_MATCHES,
      ]).includes(this.errorCodeToCheck);
    },

    areTooFewBlanks() {
      return ([
        this.$constants.QuestionValidationErrorCodes.TOO_FEW_BLANKS,
      ]).includes(this.errorCodeToCheck);
    },

    isMissingOptionForMatch() {
      return ([
        this.$constants.QuestionValidationErrorCodes.MISSING_OPTION_FOR_MATCH,
      ]).includes(this.errorCodeToCheck);
    },

    isEmptyOptionsMarkedCorrect() {
      return ([
        this.$constants.QuestionValidationErrorCodes.EMPTY_CORRECT_ANSWER,
      ]).includes(this.errorCodeToCheck);
    },

    isThereNoCorrectAnswer() {
      return ([
        this.$constants.QuestionValidationErrorCodes.ANSWER_NOT_MARKED,
        this.$constants.QuestionValidationErrorCodes.ANSWER_NOT_VALID_MCQ,
        this.$constants.QuestionValidationErrorCodes.ANSWER_NOT_VALID_MSQ,
        this.$constants.QuestionValidationErrorCodes.GRAPHING_ANSWER_NOT_VALID,
      ]).includes(this.errorCodeToCheck);
    },

    isThereNoCorrectAnswerForFIBOrEquation() {
      return ([
        this.$constants.QuestionValidationErrorCodes.FIB_ANSWER_NOT_MARKED,
        this.$constants.QuestionValidationErrorCodes.EQUATION_ANSWER_NOT_MARKED,
      ]).includes(this.errorCodeToCheck);
    },

    isImageMissing() {
      return [
        this.$constants.QuestionValidationErrorCodes.IMAGE_NOT_ADDED,
      ].includes(this.errorCodeToCheck);
    },

    areOptionGroupsTooFew() {
      return ([
        Constants.QuestionValidationErrorCodes.TOO_FEW_OPTION_GROUPS,
      ]).includes(this.errorCodeToCheck);
    },

    doesOptionGroupNotHavingEnoughOptions() {
      return ([
        this.$constants.QuestionValidationErrorCodes.INVALID_OPTIONS_COUNT_IN_OPTION_GROUP,
      ]).includes(this.errorCodeToCheck);
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    upgradeText() {
      return this.showIndividualPlan ? 'Individual' : 'Super';
    },
  },
};
</script>

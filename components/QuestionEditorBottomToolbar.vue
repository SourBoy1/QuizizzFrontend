<template>
  <div
    v-if="!isDesktopView"
    class="flex flex-col items-center gap-2"
  >
    <div class="flex w-full">
      <SelectTimerDropdown
        class="flex-1 w-full mr-1 rounded"
        :selectedTime="questionTime"
        :tabindex="160"
        @onTimeSelected="onTimeSelected"
      />

      <div class="relative flex-1 rounded-lg">
        <Button
          v-tooltip.top="{
            html: true,
            content: tagTopicTooltipContent,
          }"
          class="w-full rounded-lg text-light-3"
          type="transluscent-light-bright"
          :title="questionTopicsLength ? $i18n('Tags') + ` (${questionTopicsLength})` : $i18n('Tag')"
          :tabindex="165"
          size="md"
          licon="fas fa-tags"
          @click="openTopicTagModal"
        />

        <span
          v-if="questionTopicsLength"
          class="absolute top-0 flex items-center justify-center w-6 h-4 topics-length-title rounded-2xl text-tn text-light-3 bg-lilac"
        >{{ questionTopicsLength }}</span>
      </div>

      <SelectBox
        v-model="$props.selectedCorrectPoints"
        direction="top"
        customHeight="120"
        :disabled="disableQuestionCorrectPoints"
        class="flex-1 w-full mx-1 rounded"
        :showFixedPositionList="false"
        :list="pointsListText"
        aria-label="Question Correct Points"
        @input="$emit('onCorrectPointsSelected', $props.selectedCorrectPoints)"
        @super-option-selected="$emit('close')"
      >
        <template
          #button="{
            toggleOpen, selectPrevious, selectNext, close, buttonId, ariaexpanded, ariahaspopup, arialabelledby, ...rest
          }"
        >
          <div
            :class="{
              'flex-1 relative rounded-lg': !isDesktopView,
            }"
          >
            <Button
              v-bind="rest"
              :id="buttonId"
              v-tooltip="{ content: $i18n('Set points alloted to answer this question') }"
              :type="isDesktopView ? 'dark' : 'transluscent-light-bright'"
              class="justify-between w-full pl-2 pr-2"
              :class="{
                'rounded-lg': !isDesktopView,
                hidden: isDesktopView,
              }"
              size="md"
              licon="fas fa-check-circle"
              ticon="fas fa-sort-down"
              :title="$i18n(questionCorrectPointsText)"
              :aria-labelledby="arialabelledby"
              :aria-expanded="ariaexpanded"
              :aria-haspopup="ariahaspopup"
              :tabindex="165"
              @click="toggleOpen"
              @keyup.up="selectPrevious"
              @keyup.down="selectNext"
              @blur="close"
              @keyup.esc="close"
            />
          </div>
        </template>
      </SelectBox>
    </div>
  </div>
  <div
    v-else
    class="question-editor-bottom-toolbar fixed bottom-0 flex w-full p-2 bg-dark-2"
    :class="[isEditorForPresentationContent ? 'left-17 desktop-presentation-left-position' : 'left-0']"
  >
    <template v-if="!isAnswerExplanationsInViewStore">
      <MultipleAnswerSelector
        :isMultipleAnswerWarningTooltipVisible="isMultipleAnswerWarningTooltipVisible"
        :canToggleMultipleAnswers="isCurrentQuestionOptionsBased"
        :value="areMultipleAnswersAllowed"
        :currentQuestion="currentSlide"
        :tabindex="170"
        @input="toggleMultipleAnswers"
      />

      <SwitchOrderDropdown
        v-if="isReOrderTypeQuestion && isDesktopView"
        :defaultValue="questionOptionOrder"
        class="w-40 mr-2"
        @onOrderSwitch="onOrderSwitch"
      />

      <div class="flex">
        <SelectTimerDropdown
          class="w-24 mx-2"
          :selectedTime="questionTime"
          :tabindex="165"
          @onTimeSelected="onTimeSelected"
        />
        <div
          v-if="showStandardTaggingBtn"
          class="flex"
        >
          <div
            v-if="isStandardTagged"
            class=" flex  border-r-0 text-xs text-light font-semibold justify-center items-center px-2 rounded-l bg-green-10%"
            :class="[isMobile ? 'flex-1' : '']"
          >
            <i class="mr-1 far fa-check" />
            {{ standardTaggedText }}
          </div>
          <div
            v-else
            class="flex items-center justify-center px-2 text-xs font-semibold border-r-0 rounded-l bg-dark-1 text-dark-5 basis-3/4"
          >
            <i class="mr-2 far fa-times " />
            {{ notStandardTaggedText }}
          </div>
          <Button
            v-tooltip.top="{
              html: true,
              content: tagTopicTooltipContent,
            }"
            class="w-full rounded-none rounded-r basis-1/4"
            type="dark"
            :title="questionTopicsLength ? $i18n('Tags') + ` (${questionTopicsLength})` : $i18n('Tag')"
            :tabindex="160"
            size="md"
            :licon="(isSuperUser || isCorporateUser) ? 'fas fa-tags' : 'fas fa-lock'"
            @click="openTopicTagModal"
          />
        </div>
      </div>
      <QuestionEditorContentButtons
        v-if="isEditorForQuizContent"
        :isCancelConfirmerVisible="isCancelConfirmerVisible"
        :isSaveBtnInErrorState="isSaveBtnInErrorState"
        :isCurrentQuestionValidated="isCurrentQuestionValidated"
        :isEditActionInProgress="isEditActionInProgress"
        :currentQuestionErrors="currentQuestionErrors"
        :generatedOptionsForCurrentSlide="generatedOptionsForCurrentSlide"
        :quizEditorDisplayType="quizEditorDisplayType"
        @onSaveButtonFocused="onSaveButtonFocused"
        @onQuestionEditAction="onQuestionEditAction"
        @showParticipantView="$emit('showParticipantView')"
      />
    </template>

    <div
      v-else
      class="flex justify-end w-full"
    >
      <PopoverConfirmer
        type="danger"
        placement="top"
        :content="{
          title: $i18n('Are you sure?'),
          subTitle: $i18n('The answer explanation cannot be recovered after deleting it.'),
        }"
        :button1="{
          title: $i18n('Cancel'),
        }"
        :button2="{
          title: $i18n('Delete'),
        }"
        :buttonNumsThatAutoClosePopover="[1]"
        @button2Clicked="deleteAnswerExplanation"
      >
        <Button
          type="dark"
          size="md"
          :aria-label="$i18n('Delete explanation')"
          licon="fas fa-trash-alt"
          :title="$i18n('Delete answer explanation')"
        />
      </PopoverConfirmer>

      <Button
        class="ml-2"
        type="white"
        size="md"
        :aria-label="$i18n('Done adding answer explanations')"
        :title="$i18n('Done')"
        @click="toggleExplanationBeingInView"
      />
    </div>
  </div>
</template>

<script>
import { h as hydrate } from 'vue';
import { mapGetters, mapActions } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import {
  isQuestionForPoll, isWordCloudQuestion, isOptionsBasedQuestion, getPointsList,
} from '../utils/QuizUtils';
import Constants from '../config/Constants';

import FA from './FA.vue';

export default {
  props: {

    selectedCorrectPoints: {
      type: Number,
      default: 0,
    },

    isMultipleAnswerWarningTooltipVisible: {
      type: Boolean,
      default: false,
    },

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

    currentQuestionErrors: {
      type: Array,
      default: () => ([]),
    },

    questionOptionOrder: {
      type: String,
      default: Constants.OrderQuestionArrangement.ASC,
    },

    generatedOptionsForCurrentSlide: {
      type: Array,
      default: () => ([]),
    },
  },
  emits: ['onCorrectPointsSelected', 'close', 'showParticipantView', 'onQuestionEditAction', 'onSaveButtonFocused', 'deleteAnswerExplanation'],

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('root', ['serverData']),
    ...mapGetters('contentEditor', ['isEditorForPresentationContent', 'isQuizWithoutDrafts', 'isEditorForQuizContent', 'isAnswerExplanationsInViewStore', 'getDraftPreferences', 'quizId']),
    ...mapGetters('slideEditor', ['currentSlideId', 'currentSlide', 'doesSlideHaveAnswerExplanations', 'checkIfUserEditedSlide', 'getAnswerPlotType', 'getAnswerPlot']),
    ...mapGetters('uiManager', ['quizEditorDisplayType']),

    isDesktopView() {
      return this.isDesktop || this.isEditorForPresentationContent;
    },

    pointsList() {
      return getPointsList(this.currentSlide).reverse();
    },

    showStandardTaggingBtn() {
      return !this.isQuizWithoutDrafts && !this.$user.isCorporate;
    },

    currentQuestionId() {
      return this.currentSlide._id;
    },

    isStandardTagged() {
      return this.currentSlide.standardIds?.length > 0;
    },

    isQuestionForPoll() {
      return isQuestionForPoll(this.currentSlide);
    },

    isWordCloudTypeQuestion() {
      return isWordCloudQuestion(this.currentSlide);
    },

    disableQuestionCorrectPoints() {
      return this.isQuestionForPoll || this.isWordCloudTypeQuestion;
    },

    questionTopics() {
      return this.currentSlide?.topics;
    },

    localeCountry() {
      return this.serverData?.requestCountry;
    },

    standardTaggedText() {
      if (this.localeCountry === 'US') {
        return this.$i18n('Standard Tagged');
      }
      return this.$i18n('Tagged');
    },

    notStandardTaggedText() {
      if (this.localeCountry === 'US') {
        return this.$i18n('Not tagged to a standard');
      }
      return this.$i18n('Not tagged');
    },

    questionTopicsLength() {
      if (isEmpty(this.questionTopics)) {
        return 0;
      }

      return this.questionTopics.length;
    },

    questionCorrectPointsText() {
      if (this.selectedCorrectPoints === 1) {
        return this.selectedCorrectPoints + this.$i18n(' point');
      }

      return this.selectedCorrectPoints + this.$i18n(' points');
    },

    pointsListText() {
      return this.pointsList?.map((points) => ({
        title: points === 1 ? points + this.$i18n(' point') : points + this.$i18n(' points'),
        value: points,
      }));
    },

    tagTopicTooltipContent() {
      const question = this.currentSlide;

      if (!question) {
        return this.$i18n('Add tags');
      }
      const topics = this.questionTopics;

      if (!topics || topics.length === 0) {
        return this.$i18n('Add tags');
      }

      let html = '<ul class="flex flex-col justify-center list-disc list-inside max-w-24">';

      topics.forEach((topic) => {
        html += `<li class="w-24 overflow-hidden text-ellipsis whitespace-nowrap"> ${topic} </li>`;
      });

      html += '</ul>';

      return html;
    },

    getTimeTitle() {
      const inSecs = this.questionTime / 1000;
      const inMinutes = inSecs / 60;

      if (inMinutes >= 1) {
        return `${inMinutes} m`;
      }

      return `${inSecs} s`;
    },

    timerDropdownIcon() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-stopwatch',
            size: 11,
          });
        },
      };
    },

    isSuperUser() {
      return this.$user.isSuper;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isCurrentQuestionValidated() {
      // when is plot valid: either slide is not a graphing question OR if slide is GRAPHING then answer plot is not a point plot OR if it is a point plot then there must be a point plotted
      // why is it added here: the graph updates happen for every interaction. this is the best place to avoid validations on every interaction
      const isPlotValid = this.currentSlide?.type !== Constants.QuestionTypes.GRAPHING || this.getAnswerPlotType !== 1 || this.getAnswerPlot?.data?.points?.length >= 1;
      return isEmpty(this.currentQuestionErrors) && isPlotValid;
    },

    isReOrderTypeQuestion() {
      return this.currentSlide.type === this.$constants.QuestionTypes.REORDER;
    },

    isCurrentQuestionOptionsBased() {
      return isOptionsBasedQuestion(this.currentSlide);
    },

    areMultipleAnswersAllowed() {
      return this.currentSlide.type === this.$constants.QuestionTypes.MSQ;
    },

    questionSettings() {
      return this.currentSlide.structure.settings;
    },

    preferredQuestionTime() {
      return this.getDraftPreferences.time;
    },

    questionTime() {
      /*
        If the user has set a default a default time for all the questions, then we need to consider that time while creating a
        new question (preferred time) otherwise we can use the default time on the current slide.
      */
      return this.preferredQuestionTime || this.currentSlide.time;
    },
  },

  methods: {
    ...mapActions({
      flipOrderOfOptions: 'slideEditor/flipOrderOfOptions',
      updateQuestionTime: 'slideEditor/updateQuestionTime',
    }),

    onTimeSelected(time) {
      const eventName = this.$webEvents.EDITOR_QUESTION_TIME_CHANGE;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
      });
      this.updateQuestionTime({ time });
    },

    onQuestionEditAction(action, source) {
      this.$emit('onQuestionEditAction', action, source);
    },

    toggleMultipleAnswers() {
      const shouldChangeTypeToMCQ = this.areMultipleAnswersAllowed;
      const { hasCorrectAnswer } = this.questionSettings;

      if (shouldChangeTypeToMCQ) {
        this.$eventBus.$emit('questionEditor:currentQuestionTypeChange', { type: this.$constants.QuestionTypes.MCQ, settings: { hasCorrectAnswer } });
      } else {
        this.$eventBus.$emit('questionEditor:currentQuestionTypeChange', { type: this.$constants.QuestionTypes.MSQ, settings: { hasCorrectAnswer } });
      }
    },

    openTopicTagModal() {
      this.$analytics.logEvent('question_editor_tag', {});
      this.$eventBus.$emit('questionToolbar:openTopicTagModal', this.currentSlideId);
    },

    onSaveButtonFocused(isFocused) {
      this.$emit('onSaveButtonFocused', isFocused);
    },

    toggleExplanationBeingInView() {
      this.$store.dispatch('contentEditor/toggleIsAnswerExplanationsInView');
    },

    deleteAnswerExplanation() {
      this.$emit('deleteAnswerExplanation');
    },

    onOrderSwitch(order) {
      this.flipOrderOfOptions({ order });
    },
  },
};
</script>

<style lang="scss" scoped>

$minDesktopWidth: 1025px;

  .question-editor-bottom-toolbar {
    font-family: 'Open Sans', 'sans-serif', 'Helvetica', 'Arial', 'Symbola'
  }

  .topics-length-title {
    left:calc(50% + 56px);
    top: 50%;
    transform: translate( -50%, -50% );
  }

  .desktop-presentation-left-position {
    @media screen and (min-width: $minDesktopWidth) {
        left: 326px;
    }
  }
</style>

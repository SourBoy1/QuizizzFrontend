<template>
  <div class="fixed top-0 left-0 z-30 flex w-full m-2 fixed-editor-toolbar">
    <!-- Editor top header -->
    <ul class="flex w-full editor-top-header">
      <li
        class="w-full question-type-selector-wrapper"
        :class="{
          hidden: !isTopBarExtraItemHidden,
        }"
      >
        <!-- question type dropdown -->
        <Dropdown
          v-slot="scope"
          :iconComponent="questionTypeIconComponent"
          class="w-full bg-light-10%"
          size="sm"
          type="dark"
          ariaLabel="Question types"
          :selectedItem="questionTypes[selectedSlideType]?.title"
          :title="questionTypes[selectedSlideType]?.title"
        >
          <QuestionTypesDropdown
            :types="questionTypesForDropdown"
            @onQuestionTypeSelected="onCurrentQuestionTypeChange"
            @closeDropdown="scope.closeDropdown"
          />
        </Dropdown>
      </li>

      <li
        class="question-timer-selector-wrapper"
        :class="{
          'w-full': !isTopBarExtraItemHidden,
        }"
      >
        <!-- SelectTimerDropdown -->
        <SelectTimerDropdown
          :class="[isDesktop ? 'w-24 mr-2' : 'w-full flex-1 rounded mr-1']"
          :selectedTime="questionTime"
          :tabindex="165"
          dropDownDirection="bottom"
          @onTimeSelected="onTimeSelected"
        />
      </li>

      <li
        class="w-full"
        :class="{ hidden: isTopBarExtraItemHidden }"
      >
        <Button
          v-tooltip.top="{
            html: true,
            content: tagTopicTooltipContent,
          }"
          :class="['w-full', {
            'text-light-3 rounded-lg': !isDesktopView,
          }]"
          :type="isDesktopView ? 'dark' : 'transluscent-light-bright'"
          :title="questionTopicsLength ? $i18n('Tags') + ` (${questionTopicsLength})` : $i18n('Tag')"
          :tabindex="160"
          size="md"
          :licon="isSuperUser ? 'fas fa-tags' : 'fas fa-lock'"
          @click="openTopicTagModal"
        />
      </li>

      <li
        class="w-full"
        :class="{ hidden: isTopBarExtraItemHidden }"
      >
        <QuestionPointsSelector
          :direction="'bottom'"
          :currentQuestion="currentSlide"
          :selectedCorrectPoints="questionCorrectPoints"
          @onCorrectPointsSelected="onPointsSelected"
        />
      </li>
    </ul>
    <div
      class="bg-light-10% px-1 mr-4 flex items-center rounded"
      @click="isTopBarExtraItemHidden = !isTopBarExtraItemHidden"
    >
      <i
        class="px-2.5 text-light"
        :class="{
          'fa fa-arrow-to-right': !isTopBarExtraItemHidden,
          'fa fa-ellipsis-v': isTopBarExtraItemHidden,
        }"
      />
    </div>
    <!-- Editor top header ends -->
  </div>
</template>

<script>
import { h as hydrate } from 'vue';
import { mapGetters, mapActions } from 'vuex';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';

import QuestionTypeIcon from '~/components/QuestionTypeIcon.vue';

import { isQuestionForPoll, isWordCloudQuestion, getQuestionDefaultMarks } from '~/utils/QuizUtils';
import getAllFilteredQuestionTypes from '~/config/QuestionTypes';

export default {
  emits: [],

  data() {
    return {
      isTopBarExtraItemHidden: true,
    };
  },

  computed: {
    ...mapGetters({
      isDesktop: 'root/isDesktop',
      currentSlide: 'slideEditor/currentSlide',
      isEditorForPresentationContent: 'contentEditor/isEditorForPresentationContent',
      getDraftPreferences: 'contentEditor/getDraftPreferences',
    }),

    questionTypes() {
      return getAllFilteredQuestionTypes().reduce((acc, question) => {
        acc[question.type] = question;
        return acc;
      }, {});
    },

    selectedSlideType() {
      let displayType = this.currentSlide.type;

      if (isQuestionForPoll(this.currentSlide)) {
        displayType = this.$constants.SlideTypes.POLL;
      }

      if (isWordCloudQuestion(this.currentSlide)) {
        displayType = this.$constants.SlideTypes.WORDCLOUD;
      }

      return displayType;
    },

    questionTypesForDropdown() {
      return pickBy(this.questionTypes, (_, key) => (key !== this.$constants.QuestionTypes.MSQ));
    },

    questionTypeIconComponent() {
      const selectedQuestionType = this.selectedSlideType;

      return {
        render() {
          return hydrate(QuestionTypeIcon, {
            radius: 'sm',
            classes: 'p-1',
            type: selectedQuestionType,
            size: 10,
            width: 4,
          });
        },
      };
    },

    isDesktopView() {
      return this.isDesktop || this.isEditorForPresentationContent;
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

    questionTopicsLength() {
      if (isEmpty(this.questionTopics)) {
        return 0;
      }

      return this.questionTopics.length;
    },

    questionTopics() {
      return this.currentSlide?.topics;
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
        html += `<li class="w-24 overflow-hidden overflow-ellipsis whitespace-nowrap"> ${topic} </li>`;
      });

      html += '</ul>';

      return html;
    },

    isSuperUser() {
      return this.$user.isSuper;
    },

    questionCorrectPoints() {
      return getQuestionDefaultMarks(this.currentSlide);
    },
  },

  methods: {
    ...mapActions({
      updateQuestionTime: 'slideEditor/updateQuestionTime',
      updateQuestionCorrectPoints: 'slideEditor/updateQuestionCorrectPoints',
    }),
    onCurrentQuestionTypeChange(type) {
      this.$eventBus.$emit('questionEditor:currentQuestionTypeChange', { type });
    },

    onTimeSelected(time) {
      this.updateQuestionTime({ time });
    },

    openTopicTagModal() {
      this.$eventBus.$emit('questionToolbar:openTopicTagModal', this.currentSlideId);
    },

    onPointsSelected(points) {
      this.updateQuestionCorrectPoints({ points });
    },
  },
};
</script>

<style lang="scss" scoped>
$editorMobileTopbarHeight: 48px;

.fixed-editor-toolbar {
  .editor-top-header {
    width: calc(100% - #{$editorMobileTopbarHeight});
    li {
      @apply mr-2 rounded;
    }
    li:last-child {

    }

    .question-timer-selector-wrapper {
      min-width: 95px
    }
  }
}
</style>

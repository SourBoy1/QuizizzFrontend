<template>
  <div
    v-if="!allQuestionsTagged"
    class="border-1 bg-light-2 border-sm border-dark-6 rounded my-4 p-6 w-full"
  >
    <div class="h-5 flex justify-between">
      <div class="bg-lilac-faded px-1 py-2 text-xxs flex justify-between items-center">
        <span class="text-dark-3 font-semibold">
          {{ recommendedCurriculum.name }}
        </span>
        <span class="text-dark-3 font-semibold px-1 -mt-2 text-lg">
          .
        </span>
        <span class="text-dark-3 font-semibold">
          {{ currentTaggingSubject }}
        </span>
        <span
          class="pl-2 underline text-lilac cursor-pointer"
          @click="openStandardTagModal"
        >
          EDIT
        </span>
      </div>
      <span @click="back">
        <FA
          :size="14"
          class="mt-0.5 fa fa-times text-dark-2 cursor-pointer"
        />
      </span>
    </div>
    <div class="text-md mt-3 font-semibold text-dark-2">
      <i18n>Select the standard that that this quiz is aligned to</i18n>
    </div>
    <div class="flex gap-2 mt-3 flex-wrap">
      <div
        v-for="(topic, index) in Object.keys(topicGroupsMap)"
        :key="topic + index"
      >
        <div
          class="hover:bg-lilac-faded hover:border-lilac-light w-full flex justify-between text-xs px-2 py-1.5 rounded border-1 font-semibold gap-1.5 cursor-pointer"
          :class="[topic === currentSelectedTopic ? 'bg-lilac-faded border-lilac-light' : 'bg-light-3 border-dark-6']"
          @click="selectTopic(topic)"
        >
          <span>{{ topic }}</span>
          <span
            class="rounded px-1"
            :class="[topic === currentSelectedTopic ? 'bg-lilac text-light' : 'text-dark-4 bg-dark-6']"
          >{{ topicGroupsMap[topic].length }}</span>
        </div>
      </div>
    </div>

    <div
      class="rounded min-h-26 w-full bg-light-3 mt-4 border-1 border-dark-6 flex items-center p-3"
      :class="[areTagsAvailableForSelectedStandard ? 'justify-start' : 'justify-center']"
    >
      <span
        v-if="!areTagsAvailableForSelectedStandard"
        class="text-xs font-normal text-dark-4"
      ><i18n>Select a standard to get suggestions</i18n></span>
      <div
        v-else
        class="flex flex-col gap-4"
      >
        <div class="flex gap-2 flex-wrap">
          <div
            v-for="(topic, index) in topicGroupsMap[currentSelectedTopic]"
            :key="topic + index"
          >
            <div
              class="hover:bg-lilac-faded w-full flex justify-between text-xs px-2 py-1.5 rounded border-1 hover:border-lilac-light font-semibold gap-1.5 cursor-pointer"
              :class="[topic._id === selectedTopicForTagging?._id ? 'bg-lilac-faded border-lilac-light' : 'bg-light-3 border-dark-6']"
              @click="selectTopicForTagging(topic)"
            >
              <span>{{ topic.short_code }}</span>
              <span
                v-tooltip.top="{ content: topicDesctiptionTooltip(topic), classes: 'max-w-64', distance: 10 }"
              >
                <FA
                  icon="far fa-info-circle"
                  class="text-dark-4 cursor-pointer"
                  :size="12"
                />
              </span>
            </div>
          </div>
        </div>
        <Button
          :title="$i18n('TAG ALL')"
          type="primary"
          class="w-18 h-6 px-3 py-1"
          size="sm"
          :disabled="!selectedTopicForTagging || taggingLoader"
          :loading="taggingLoader"
          @click="tagAllQuestions(selectedTopicForTagging)"
        />
      </div>
    </div>
    <QuestionTagModal
      v-if="showStandardTagModal"
      :tagAllQuestion="true"
      :isAwaitingApiResponse="taggingLoader"
      @close="closeStandardTaggingModal"
      @tagAll="tagAllQuestions"
    />
  </div>
  <div
    v-else
    class="border-1 bg-light-1 border-sm border-dark-6 rounded my-4 p-6 w-full"
  >
    <div class="text-base font-bold">
      All Questions are tagged
    </div>
    <div class="text-sm font-normal text-dark-4 mt-1">
      Play an activity with your students to view their performance aggregated by standards in Reports
    </div>
    <div
      class="text-lilac font-semibold mt-4 cursor-pointer"
      @click="back"
    >
      <i18n>DISMISS</i18n>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

import QuizService from '~/services/apis/QuizService';

export default {
  props: {
    back: {
      type: Function,
      default: () => false,
    },
    curriculum: {
      type: Array,
      default: () => [],
    },
    topics: {
      type: Array,
      default: () => [],
    },
    categorizedTopicsMap: {
      type: Object,
      default: () => {},
    },
    currentTaggingSubject: {
      type: String,
      default: '',
    },
    saveQuestionTopicsById: {
      type: Function,
      default: () => {},
    },
  },

  data() {
    return {
      standards: [],
      tags: [],
      topicGroupsMap: {},
      showStandardTagModal: false,
      currentSelectedTopic: null,
      selectedTopicForTagging: null,
      taggingLoader: false,
      allQuestionsTagged: false,
    };
  },

  computed: {
    ...mapGetters('currentQuiz', ['quizId', 'draftQuestions', 'publishedQuestions']),
    ...mapGetters('contentEditor', ['sortedQuestions', 'quizId', 'draftId']),

    areTagsAvailableForSelectedStandard() {
      return this.currentSelectedTopic;
    },

    recommendedCurriculum() {
      return this.curriculum.length > 0 ? this.curriculum[0] : [];
    },

    topicsGrouping() {
      return true;
    },
  },

  mounted() {
    this.topicGroupsMap = this.categorizedTopicsMap;
  },

  methods: {
    openStandardTagModal() {
      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_EDIT_CLICKED, {
        quizId: this.quizId,
        userId: this.$user.id,
      });
      this.showStandardTagModal = true;
    },

    topicDesctiptionTooltip(topic) {
      const tiltleAsDescription = ['Common Core', 'Texas'];
      if (tiltleAsDescription.includes(this.recommendedCurriculum.name)) {
        return topic.title;
      }
      return topic.description;
    },

    selectTopic(topic) {
      this.currentSelectedTopic = topic;
      this.selectedTopicForTagging = null;
    },

    selectTopicForTagging(topic) {
      this.selectedTopicForTagging = topic;
    },

    tagAllQuestions(topic) {
      this.sortedQuestions?.forEach(async (question) => {
        const topicForTagging = {};
        topicForTagging.id = question._id;
        topicForTagging.topic = topic.short_code;
        this.taggingLoader = true;
        this.allQuestionsTagged = false;

        const standards = {};
        standards[topic.id] = {
          id: topic.id,
          short_code: topic.short_code,
          title: topic.title,
        };
        const endLoading = () => {
          this.taggingLoader = false;
          this.allQuestionsTagged = true;
        };
        await QuizService.update(this.quizId, this.draftId, { stateStandards: standards });
        this.$store.dispatch('contentEditor/setStateStandards', standards);
        this.saveQuestionTopicsById(question._id, [topic.short_code], [topic], endLoading);
      });
      const paidOrgInfo = this.$user.userStore.paidOrganizations[0];

      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_NUDGE_TAG_ALL_CLICKED, {
        userId: this.$user.id,
        quizId: this.quizId,
        short_code: topic.short_code,
        topicId: topic._id,
        questions: this.sortedQuestions?.map((question) => question._id),
        numberOfQuestions: this.sortedQuestions?.length,
        state: paidOrgInfo.state,
        subject: this.currentTaggingSubject,
      });
    },

    closeStandardTaggingModal() {
      this.showStandardTagModal = false;
    },
  },
};
</script>

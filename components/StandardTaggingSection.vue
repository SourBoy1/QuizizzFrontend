<template>
  <div
    v-if="proceedStandardTagging"
    class="w-full"
  >
    <StandardTagContainer
      :back="back"
      :topics="topics"
      :curriculum="curriculum"
      :categorizedTopicsMap="categorizedTopicsMap"
      :currentTaggingSubject="currentTaggingSubject"
      :saveQuestionTopicsById="saveQuestionTopicsById"
    />
  </div>
  <div
    v-else
    class="w-full"
  >
    <div class="border-1 bg-light-3 border-sm border-dark-6 rounded my-4 p-6 w-full">
      <div class="text-xs text-dark-4 flex justify-between">
        <i18n>GET A STANDARDS ALIGNED REPORT</i18n>
        <span @click="closeStandardTaggingNudge">
          <FA
            :size="14"
            class="mt-0.5 fa fa-times text-dark-2 cursor-pointer"
            @click="closeStandardTaggingNudge"
          />
        </span>
      </div>
      <div class="text-lg mt-2 text-dark-2">
        <i18n>Is this quiz aligned to a single standard?</i18n>
      </div>
      <div class="flex mt-2.5">
        <Button
          :title="$i18n('Yes')"
          :fullHeight="true"
          size="md"
          type="other"
          :disabled="loadingRecommendedStandard"
          :loading="loadingRecommendedStandard"
          @click="proceedStandardTaggingflow"
        />
        <Button
          class="ml-3"
          :title="$i18n('No')"
          :fullHeight="true"
          size="md"
          type="other"
          @click="back"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

import CurriculumService from '~/services/apis/CurriculumService';
import { getStandardsSubjectForRecommendation } from '~/utils/StandardsCollection';
import { RecommendedStandards } from '~/utils/RecommendedStandards';
import { StatesInUS, getStateNameInUs } from '~/config/StatesInUS';

export default {

  props: {
    closeStandardTaggingNudge: {
      type: Function,
      default: () => true,
    },
    subjectForCurriculumRecommendation: {
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
      proceedStandardTagging: false,
      loadingRecommendedStandard: false,
      topics: [],
      curriculum: [],
      categorizedTopicsMap: {},
      currentTaggingSubject: '',
    };
  },

  computed: {
    ...mapGetters('currentQuiz', ['quizId', 'currentQuiz', 'quizType', 'quizSubjects', 'quizGrades']),
  },
  methods: {
    async proceedStandardTaggingflow() {
      this.loadingRecommendedStandard = true;
      const paidOrgInfo = this.$user.userStore.paidOrganizations[0];
      const subjects = getStandardsSubjectForRecommendation(this.quizSubjects, paidOrgInfo.state);
      this.currentTaggingSubject = subjects;
      const response = await CurriculumService.getCurriculumRecommendation(this.currentQuiz, subjects, this.quizGrades, paidOrgInfo.state);
      const topicsResponse = response.data.data.topics;
      const curriculumResponse = response.data.data.curriculums;

      this.topics = this.getFilteredTopicsFunction(topicsResponse);
      this.curriculum = curriculumResponse;

      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_NUDGE_YES_CLICKED, {
        userId: this.$user.userStore.id,
        quizId: this.quizId,
        state: getStateNameInUs(paidOrgInfo.state),
        subject: subjects,
      });
      this.proceedStandardTagging = true;
      this.loadingRecommendedStandard = false;
    },

    back() {
      const paidOrgInfo = this.$user.userStore.paidOrganizations[0];
      const subjects = getStandardsSubjectForRecommendation(this.quizSubjects, paidOrgInfo.state);
      this.$analytics.logEvent(this.$webEvents.STANDARD_TAG_ALL_NUDGE_NO_CLICKED, {
        userId: this.$user.userStore.id,
        quizId: this.quizId,
        state: getStateNameInUs(paidOrgInfo.state),
        subject: subjects,
      });
      this.proceedStandardTagging = false;
      this.closeStandardTaggingNudge();
    },

    getFilteredTopics(topicsResponse) {
      return topicsResponse;
    },
    sortTopicsByShortCode(topicsResponse) {
      return Array.from(topicsResponse).sort((currentTopic, nextTopic) => nextTopic.short_code.localeCompare(currentTopic.short_code));
    },

    getRecommendedCategorizationStructure() {
      const paidOrgInfo = this.$user.userStore.paidOrganizations[0];
      const { state } = paidOrgInfo;
      const subject = getStandardsSubjectForRecommendation(this.quizSubjects, paidOrgInfo.state);
      const stateSubjectsMap = {
        CommonCore: ['Mathematics', 'English Language Arts'],
        TX: ['Mathematics', 'English Language Arts and Reading', 'Science'],
        VA: ['Mathematics (2016)', 'English (2017)', 'Science'],
        NY: ['Next Generation Mathematics Learning Standards (K-8) (2017)', 'Science (2016)'],
        CA: ['Mathematics', 'Science'],
        GA: ['Mathematics - Georgia Standards of Excellence', 'English Language Arts - Georgia Standards of Excellence', 'Science - Georgia Standards of Excellence'],
      };
      let stateName = 'Common Core';
      StatesInUS.forEach((stateObject) => {
        if (stateSubjectsMap[state] && stateObject.abbreviation === state) {
          stateName = stateObject.name;
        }
      });
      const filteredRecommendedStandards = RecommendedStandards.filter((standards) => {
        let isGradeMatched = false;
        let isSubjectMatched = false;
        if (standards.curriculum === stateName) {
          this.quizGrades.forEach((grade) => {
            if (String(grade).toLowerCase().includes(standards.grade)) {
              isGradeMatched = true;
            }
          });
          if (subject.includes(standards.subject)) {
            isSubjectMatched = true;
          }
        }
        return isGradeMatched && isSubjectMatched;
      });

      return filteredRecommendedStandards;
    },

    createCategorizedTopicsMap(sortedTopics, keyLength = 2) {
      const categorizeTopics = {};
      sortedTopics.map((topic, index) => {
        const currentCategorizedTopicKeysList = Object.keys(categorizeTopics); // existing keys in the categorizeTopics object

        // if categorizeTopics is empty the add first shortcode and topic as the first key and value
        const currentShortCode = topic.short_code;
        let longestCommonSubstring = '';
        let currentLongestCommonSubstringKey = ''; // keeps track of current longest common substring key

        // iterate the existing keys to compare and get the longest common substring between current short code and key
        currentCategorizedTopicKeysList.forEach((key) => {
          let commonSubstring = '';
          for (let charIndex = 0; charIndex < key.length; charIndex++) {
            if (key[charIndex] === currentShortCode[charIndex]) {
              commonSubstring += key[charIndex];
            } else {
              break;
            }
          }
          if (commonSubstring.length > keyLength && (commonSubstring.length < longestCommonSubstring.length || longestCommonSubstring.length === 0)) {
            longestCommonSubstring = commonSubstring;
            currentLongestCommonSubstringKey = key;
          }
        });

        // Put the topics into right key buckets based on updated longest common substring value
        if (categorizeTopics[longestCommonSubstring]) {
          categorizeTopics[longestCommonSubstring] = [...categorizeTopics[longestCommonSubstring], topic];
        } else if (longestCommonSubstring.length > 4) {
          categorizeTopics[longestCommonSubstring] = [...categorizeTopics[currentLongestCommonSubstringKey], topic];
          delete categorizeTopics[currentLongestCommonSubstringKey];
        } else {
          categorizeTopics[topic.short_code] = [topic];
        }

        return topic;
      });

      // Shift the array of topics having length less than or equal 2 to the "Other" bucket
      const categorizedTopicKeysList = Object.keys(categorizeTopics);
      categorizedTopicKeysList.forEach((key) => {
        if (categorizeTopics[key].length <= 4) {
          if (categorizeTopics.Other) {
            categorizeTopics.Other = [...categorizeTopics.Other, ...categorizeTopics[key]];
          } else {
            categorizeTopics.Other = [...categorizeTopics[key]];
          }
          delete categorizeTopics[key];
        }
      });

      return categorizeTopics;
    },

    getFilteredTopicsFunction(topicsResponse) {
      const sortedTopics = this.sortTopicsByShortCode(topicsResponse);
      const categorizationStructure = this.getRecommendedCategorizationStructure();

      // makes a object of key: value (longestCommonSubstring: [topics]) by finding longest common substring between shortcodes and existing keys
      // This solution put the topics in correct shortCode's common substring bucket
      if (categorizationStructure.length > 0) {
        const recommendedStandardsMap = {};
        categorizationStructure[0].commonShortCodes.forEach((shortcode) => {
          const shortCodeTopics = shortcode.topics;
          sortedTopics.forEach((sortedTopic) => {
            if (shortCodeTopics.includes(sortedTopic.short_code)) {
              if (recommendedStandardsMap[shortcode.title]) {
                recommendedStandardsMap[shortcode.title] = [...recommendedStandardsMap[shortcode.title], sortedTopic];
              } else {
                recommendedStandardsMap[shortcode.title] = [sortedTopic];
              }
            }
          });
        });

        this.categorizedTopicsMap = recommendedStandardsMap;
        return sortedTopics;
      }
      const initalCategorization = this.createCategorizedTopicsMap(sortedTopics);
      const topicKeys = Object.keys(initalCategorization);
      const newCategoriationObject = {};
      if (initalCategorization.Other) {
        newCategoriationObject.PrevOther = initalCategorization.Other;
      }
      topicKeys.forEach((key) => {
        if (key !== 'Other') {
          newCategoriationObject[key] = this.createCategorizedTopicsMap(initalCategorization[key], key.length + 1);
          const newKeys = Object.keys(newCategoriationObject[key]);
          newKeys.forEach((newKey) => {
            newCategoriationObject[newKey] = newCategoriationObject[key][newKey];
          });

          if (newCategoriationObject[key].Other) {
            newCategoriationObject[key] = newCategoriationObject[key].Other;
            delete newCategoriationObject.Other;
          } else {
            delete newCategoriationObject[key];
          }

          if (newCategoriationObject.PrevOther) {
            newCategoriationObject.Other = newCategoriationObject.PrevOther;
            delete newCategoriationObject.PrevOther;
          }
        }
      });
      this.categorizedTopicsMap = newCategoriationObject;

      return sortedTopics;
    },
  },
};
</script>

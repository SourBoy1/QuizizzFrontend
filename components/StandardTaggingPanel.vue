<template>
  <div
    v-if="isCurriculumLoading"
    class="flex justify-center"
  >
    <FA
      icon="fas fa-sync"
      class="animate-spin"
      :size="22"
    />
  </div>
  <div
    v-else
    class="flex flex-col w-full my-2"
  >
    <div
      :key="getCurriculum ? getCurriculum._id : ''"
      class="flex items-start w-full"
    >
      <SelectBox
        :key="subject"
        v-model="subject"
        icon="far fa-books"
        class="w-1/2 mr-1 overflow-hidden text-ellipsis"
        listContainerClasses="max-w-100"
        :label="$i18n('Subject')"
        size="sm"
        :errorMessage="errorForSubject"
        :list="subjects"
        :aria-label="$i18n('Select a subject')"
        :placeholder="$i18n('Subject')"
        :enableSearch="true"
        @input="getGradesForCurriculumAndSubject"
      />
      <SelectBox
        :key="triggerGradeChanges"
        v-model="grade"
        class="w-1/2 mr-1"
        listContainerClasses="max-w-100"
        icon="far fa-backpack"
        :label="$i18n('Grade')"
        :disabled="!subject"
        size="sm"
        :list="grades"
        :errorMessage="errorForGrade"
        :aria-label="$i18n('Select a grade')"
        :placeholder="$i18n('Grade')"
        :enableSearch="true"
      />
    </div>
    <slot name="search-box" />
    <div
      v-if="filteredTopics.length || searchTerm"
      class="text-sm font-semibold text-dark-2"
    >
      <i18n>Browse</i18n> <span class="p-1 text-xs rounded-md bg-lilac text-light-3">{{ filteredTopics.length }}</span> <i18n>standards</i18n>
    </div>
    <div class="relative">
      <div
        v-if="filteredTopics.length || areStandardsLoading || searchTerm"
        class="flex flex-col pb-4 my-2 overflow-y-auto rounded-md min-h-64 max-h-68 border-1 border-dark-6"
      >
        <div
          v-if="areStandardsLoading"
          class="flex items-center justify-center min-h-60"
        >
          <FA
            icon="fas fa-sync"
            class="animate-spin"
            :size="26"
          />
        </div>
        <transition-group
          v-else
          name="fade"
          class="flex flex-col"
        >
          <div
            v-if="suggestions.length && !(searchTerm && filteredTopics.length > 1)"
            :key="suggestions.length"
            class="flex flex-col"
          >
            <div class="bg-dark-5% w-full p-1 text-lilac-light text-xs">
              <FA
                icon="far fa-sparkles"
                class="mx-2"
              />
              <i18n>Previously added</i18n>
            </div>
            <transition-group
              name="fade"
              class="w-full"
            >
              <button
                v-for="(tag, index) in suggestions"
                :key="tag.short_code + index"
                class="w-full border-b-1"
                :class="{
                  'border-dark-6': !existingTags.includes(tag.short_code),
                  'bg-lilac-faded border-lilac-light': existingTags.includes(tag.short_code),
                }"
                @click="toggleStandard(tag)"
              >
                <div class="flex items-start py-2 pr-2">
                  <div class="pl-2">
                    <FA
                      v-if="existingTags.includes(tag.short_code)"
                      icon="far fa-check"
                    />
                  </div>
                  <div
                    class="flex flex-col"
                    :class="existingTags.includes(tag.short_code) ? 'pl-3' : 'pl-6'"
                  >
                    <div class="text-sm font-semibold text-left text-dark-2">
                      {{ tag.short_code }}
                    </div>
                    <div class="text-xs font-semibold text-left text-dark-4">
                      {{ tag.title }}
                    </div>
                  </div>
                </div>
              </button>
            </transition-group>
          </div>
          <div
            v-if="suggestions.length && !(searchTerm && filteredTopics.length > 1)"
            :key="suggestions.length"
            class="bg-dark-5% w-full p-1 text-dark-4 text-xs"
          >
            <FA
              icon="far fa-tags"
              class="mx-2"
            />
            <i18n>All standards</i18n>
          </div>
          <button
            v-for="topic in filteredTopics"
            :key="`${topic._id}${reRenderFlagForHighlight[topic._id]}`"
            class="border-b-1"
            :class="{
              'border-dark-6': !existingTags.includes(topic.short_code),
              'bg-lilac-faded border-lilac-light': existingTags.includes(topic.short_code),
            }"
            @click="toggleStandard(topic)"
          >
            <div class="flex items-start py-2 pr-2">
              <div class="pl-2">
                <FA
                  v-if="existingTags.includes(topic.short_code)"
                  icon="far fa-check"
                />
              </div>
              <div
                class="flex flex-col"
                :class="existingTags.includes(topic.short_code) ? 'pl-3' : 'pl-6'"
              >
                <div
                  class="text-sm font-semibold text-left uppercase"
                  :class="{
                    'text-dark-2': !existingTags.includes(topic.short_code),
                    'text-lilac-dark': existingTags.includes(topic.short_code),
                  }"
                >
                  <span
                    v-for="(text, index) in highlightText(topic.short_code)"
                    :key="text"
                    :class="index === 1 ? 'bg-lilac-faded text-lilac' : ''"
                  >
                    {{ text }}
                  </span>
                </div>
                <div
                  class="text-xs font-semibold text-left"

                  :class="{
                    'text-dark-4': !existingTags.includes(topic.short_code),
                    'text-lilac': existingTags.includes(topic.short_code),
                  }"
                >
                  <span
                    v-for="(text, index) in highlightText(topic.title)"
                    :key="text"
                    :class="index === 1 ? 'bg-lilac-faded text-lilac' : ''"
                  >
                    {{ text }}
                  </span>
                </div>
                <div
                  class="text-xs text-left"
                  :class="{
                    'text-dark-50%': !existingTags.includes(topic.short_code),
                    'text-lilac-light': existingTags.includes(topic.short_code),
                  }"
                >
                  <span
                    v-for="(text, index) in highlightText(topic.description)"
                    :key="text"
                    :class="index === 1 ? 'bg-lilac-faded text-lilac' : ''"
                  >
                    {{ text }}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </transition-group>
      </div>
      <button
        v-if="custom"
        class="absolute bottom-0 w-full px-4 text-sm text-left bg-dark-6 text-dark-4"
        @click="toggleStandard(custom, true)"
      >
        <FA icon="far fa-plus" />
        <span class="px-2">
          <i18n>Create </i18n>
          '{{ custom.short_code }}'
          <i18n> as a custom tag</i18n>
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';

import CurriculumService from '~/services/apis/CurriculumService';

export default {
  props: {
    existingTags: {
      type: Array,
      default: () => [],
    },

    searchTerm: {
      type: String,
      default: null,
    },
  },
  emits: ['resetTags', 'resetSearch', 'delete', 'selected'],

  data() {
    return {
      isCurriculumLoading: true,
      grade: null,
      subject: null,
      topicData: [],
      reRenderFlagForHighlight: {},
      selectedStandards: [],
      isLoading: false,
      areStandardsLoading: false,
      custom: null,
      gradesList: null,
      triggerGradeChanges: new Date().toString(),
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['getCurriculum', 'standards', 'chosenStandards', 'chosenStandardsFilter', 'draft']),

    subjects() {
      const allSubjects = [...(this.getCurriculum?.all_subjects ?? [])];
      return allSubjects.sort().map((subject) => ({
        title: subject,
        value: subject,
      }));
    },

    grades() {
      let grades = [];

      if (this.gradesList) {
        grades = this.gradesList.map((grade) => ({
          title: grade.split(' and ').map((grade) => (grade[0] === '0' ? grade[1] : grade)).join(', '),
          value: grade,
        }));
      } else {
        grades = this.getCurriculum?.all_grades?.map((grade) => ({
          title: grade.split(' and ').join(', '),
          value: grade,
        }));
      }

      if (this.getCurriculum?.applicable_grades?.length) {
        const hashByGrades = {};

        this.getCurriculum.applicable_grades.forEach((item) => {
          const alias = item.alias?.[0]?.split(',') ?? [];
          let smallestGrade = 15;
          for (const grade of alias) {
            smallestGrade = Math.min(parseInt(grade, 10), smallestGrade);
          }

          hashByGrades[item.grade] = smallestGrade;
        });

        grades.sort((gradeA, gradeB) => hashByGrades[gradeB.value] - hashByGrades[gradeA.value]);
      }

      return grades;
    },

    errorForSubject() {
      if ((this.grade && !this.subject) || this.subject === null) {
        return this.$i18n('Choose a subject');
      }

      return null;
    },

    errorForGrade() {
      if (this.subject && !this.grade) {
        return this.$i18n('Choose a grade');
      }

      return null;
    },

    suggestions() {
      const indexed = {};
      return [...Object.values(get(this.$user, 'preferences.curriculum.standards', {})), ...this.chosenStandards].filter((standard) => {
        const shouldSuggest = !indexed[standard._id];
        indexed[standard._id] = true;
        return shouldSuggest && standard.curriculum === this.getCurriculum?._id;
      });
    },

    filteredTopics() {
      if (this.searchTerm) {
        const filteredTopics = this.topicData.filter((topic) =>
          // ! indexOf is much faster for string searching
          // eslint-disable-next-line unicorn/prefer-includes
          topic.short_code.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1 || topic.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1 || topic.description?.toLowerCase()?.indexOf(this.searchTerm.toLowerCase()) > -1);

        return filteredTopics;
      }

      return this.topicData;
    },
  },

  watch: {
    subject(currSubject) {
      if (currSubject && this.grade) {
        this.toggleSearchForTopics();
      }
    },

    grade(currGrade) {
      if (currGrade && this.subject) {
        this.toggleSearchForTopics();
      }
    },

    gradesList: {
      immediate: true,
      handler() {
        this.triggerGradeChanges = new Date().toString();
      },
    },

    grades: {
      immediate: true,
      handler(curr) {
        if (!this.grade) {
          return;
        }

        const gradeOption = curr.find((grade) => grade.value === this.grade);

        if (!gradeOption) {
          this.grade = null;
        }
      },
    },

    existingTags(curr) {
      let standards = [];

      standards = this.topicData.filter((topic) => curr.includes(topic.short_code));

      this.selectedStandards = standards;
    },

    searchTerm(curr) {
      if (curr) {
        this.custom = {
          _id: this.searchTerm,
          short_code: this.searchTerm,
          title: this.$i18n('Custom tag'),
          description: this.$i18n('Click to add the custom tag'),
        };
      } else {
        this.custom = null;
      }
    },

    chosenStandardsFilter: {
      deep: true,
      handler(curr, old) {
        this.grade = curr.grade ?? null;
        this.subject = curr.grade ?? null;
        if (!curr.grade && !curr.subject) {
          this.$emit('resetTags', []);
          this.topicData = [];
        }
      },
    },
  },

  async created() {
    const selectedCurriculum = get(this.$user, 'preferences.curriculum.org', null) ?? get(this.$user, 'preferences.curriculum.default', null);
    if (!this.getCurriculum && selectedCurriculum) {
      const response = await CurriculumService.getCurriculumById(selectedCurriculum);
      if (response.success) {
        const curriculum = get(response, 'data.data.curriculum', null);

        if (curriculum) {
          this.$store.dispatch('contentEditor/setCurriculum', curriculum);
        }
      }
    }

    this.preselectSubjectFromCurriculum();

    this.isCurriculumLoading = false;
  },

  mounted() {
    this.grade = this.chosenStandardsFilter.grade ?? null;
    this.subject = this.chosenStandardsFilter.subject ?? null;
  },

  methods: {
    preselectSubjectFromCurriculum() {
      if (!this.subject && this.getCurriculum?.applicable_subjects) {
        for (const subjectData of this.getCurriculum.applicable_subjects) {
          if (this.draft.subjects.some((subject) => subjectData.alias.includes(subject))) {
            this.subject = subjectData.subject;
            break;
          }
        }
      }
    },

    async toggleSearchForTopics() {
      this.areStandardsLoading = true;
      const payload = {
        curriculum: this.getCurriculum?._id ?? get(this.$user, 'preferences.curriculum.default', null),
        subject: this.subject,
        grade: this.grade,
      };

      const response = await CurriculumService.filterStandards(payload);

      if (response.success) {
        this.topicData = get(response, 'data.data.topics', []);
      }

      this.areStandardsLoading = false;
    },

    highlightText(text) {
      let formattedText = text || '';

      if (text?.[0]) {
        formattedText = text[0].toUpperCase() + text.slice(1);
      }

      // eslint-disable-next-line unicorn/prefer-includes
      if (!this.searchTerm || formattedText.toLowerCase().indexOf(this.searchTerm.toLowerCase()) === -1) {
        return [formattedText];
      }

      const indexOfOccurence = formattedText.toLowerCase().indexOf(this.searchTerm.toLowerCase());

      return [formattedText.slice(0, indexOfOccurence),
        formattedText.slice(indexOfOccurence, indexOfOccurence + this.searchTerm.length),
        formattedText.slice(indexOfOccurence + this.searchTerm.length)];
    },

    toggleStandard(standard, shouldResetSearch = false) {
      if (shouldResetSearch) {
        this.$emit('resetSearch');
      }

      if (this.existingTags.includes(standard.short_code)) {
        this.$emit('delete', standard.short_code);
      } else {
        this.$emit('selected', standard);
      }
    },

    async getGradesForSubject(subject) {
      const response = await CurriculumService.getGradesForSubject(subject);

      if (response.success) {
        const grades = get(response, 'data.data.grades', null);
        this.gradesList = grades;
      }
    },

    async getGradesForCurriculumAndSubject(subject) {
      const response = await CurriculumService.getGradesForCurriculumAndSubject({
        curriculum: this.getCurriculum?._id ?? get(this.$user, 'preferences.curriculum.default', null),
        subject,
      });

      if (response.success) {
        const grades = get(response, 'data.data.grades', null);
        this.gradesList = grades;
      }
    },
  },

};
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

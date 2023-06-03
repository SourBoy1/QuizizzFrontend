<template>
  <div
    v-if="areSubjectsLoading"
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
    class="choose-subjects flex items-center flex-wrap gap-y-2 gap-x-1"
    role="listbox"
    aria-multiselectable="true"
  >
    <Button
      v-for="(subject, index) in subjectsList"
      :key="index"
      :ref="`${index === 15 && 'focusButton'}`"
      :data-cy="`content-subject-select-${index}`"
      role="option"
      :title="subject.text"
      size="xs"
      rounded="full"
      type="selector"
      :isOn="isSelected(subject)"
      :aria-selected="isSelected(subject).toString()"
      @click="toggleSubject(subject)"
    />
    <Button
      v-if="!showMore"
      class="-mr-2"
      :title="`${$i18n('more')}...`"
      size="xs"
      rounded="full"
      type="link"
      @click="onShowMoreClicked()"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import getSubjectsList from '../config/Subjects';

export default {
  props: {
    selectedSubjects: {
      type: Array,
      default: () => [],
    },

  },

  emits: ['toggleSubject'],

  data() {
    return {
      subjects: getSubjectsList(),
      showMore: false,
      areSubjectsLoading: false,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['getCurriculum']),

    subjectsList() {
      if (this.showMore) {
        return this.subjects;
      }

      return this.subjects.slice(0, 15);
    },
  },

  methods: {
    onShowMoreClicked() {
      this.showMore = true;
      this.$nextTick(() => {
        const focusButton = this.$refs.focusButton[0];
        focusButton.$refs.button?.focus();
      });
    },

    getSupportedSubject(subject) {
      if (this.getCurriculum) {
        for (const applicableSubject of this.getCurriculum.applicable_subjects) {
          if (applicableSubject.subject.toLowerCase() === subject.val) {
            return applicableSubject.alias[0];
          }
        }
      }

      return subject;
    },

    toggleSubject(subject) {
      this.$emit('toggleSubject', subject);
    },

    isSelected(subject) {
      return this.selectedSubjects.includes(subject.val) || this.selectedSubjects.includes(subject.actual);
    },
  },
};
</script>

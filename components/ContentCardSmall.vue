<template>
  <button
    class="transition-all duration-200 relative p-2 border-dark-6 border-solid rounded-2xl flex md:mr-0.5 mx-1 md:mt-0 mt-1"
    :class="contentCardSmallContainerClasses"
    @click.prevent="$emit('onContentSelected', content, emptyStateType)"
  >
    <Lozenge
      v-if="!isContentQuizType"
      class="absolute right-2 top-2"
      :class="[isLoading ? 'bg-dark-10% text-transparent' : 'bg-dark-5% text-dark-3']"
      icon="fas fa-presentation"
      size="xs"
      :title="$user.isCorporate ? $i18n('Presentation') : $i18n('Lesson')"
    />

    <div class="relative my-auto">
      <Lozenge
        v-if="isSuperContent && !$user.isCorporate && !isLoading"
        :title="showIndividualPlan ? 'PREMIUM' : 'SUPER'"
        size="xs"
        icon="fas fa-bolt-lightning"
        class="absolute super-lozenge bg-light-3 text-super z-1"
      />

      <MediaTile
        :isLoading="isLoading"
        class="mr-2"
        rounded="semi"
        :src="content.info.image"
        :emptyStateType="emptyStateType"
      />

      <Lozenge
        :title="noOfQuestions"
        size="xs"
        class="absolute bottom-1 right-3"
        :class="[isLoading ? 'bg-dark-10% text-transparent' : 'bg-dark-50% text-light-3']"
      />
    </div>

    <div class="text-left">
      <div :class="[isLoading ? ' loading-state mb-2.5' : 'text-dark-2', 'font-semibold', $user.isCorporate ? 'w-36' : 'w-44', 'text-xs']">
        {{ quizTitle }}
      </div>

      <div
        v-if="hasGrades"
        class="flex"
      >
        <span
          class="flex items-center justify-center mr-1"
          :class="[isLoading ? 'w-3 h-3 loading-state' : 'text-dark-4 w-4 h-4 ']"
        ><FA
          icon="far fa-graduation-cap"
          :size="9"
        />
        </span>

        <div
          translate="no"
          class="text-tn"
          :class="[isLoading ? 'loading-state  mb-1' : 'text-dark-3']"
        >
          {{ gradeLabel }}
        </div>
      </div>

      <div
        v-if="hasSubjects && !$user.isCorporate"
        class="flex"
      >
        <span
          class="flex items-center justify-center mr-1"
          :class="[isLoading ? 'w-3 h-3 loading-state' : 'text-dark-4 w-4 h-4 ']"
        ><FA
          icon="far fa-book"
          :size="9"
        />
        </span>

        <div
          class="text-tn"
          :class="[isLoading ? 'loading-state  mb-1' : 'text-dark-3']"
        >
          {{ content.info.subjects.join(', ') }}
        </div>
      </div>

      <div
        v-if="!isCreatorDeleted"
        class="flex"
      >
        <span
          class="flex items-center justify-center mr-1"
          :class="[isLoading ? 'w-3 h-3 loading-state' : 'text-dark-4 w-4 h-4 ']"
        ><FA
          icon="far fa-user"
          :size="9"
        />
        </span>
        <div
          class="text-tn"
          :class="[isLoading ? 'loading-state  mb-1' : 'text-dark-3']"
        >
          {{ $stringUtils.truncateLongStrings(username, 22) }}
        </div>
      </div>
    </div>
  </button>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import Grades from '../config/Grades';

export default {

  props: {
    content: {
      type: Object,
      default: () => {},
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isSuperContent: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onContentSelected'],

  data() {
    return {
      emptyStateType: '',
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    contentCardSmallContainerClasses() {
      let cls = '';

      if (this.isSelected) {
        if (!this.isDesktop) {
          cls += 'py-3 border-lilac-light border-2 ';
        } else {
          cls += 'border-1 ';
        }
        cls += 'bg-light-1 border-light-1';
      } else {
        cls += 'bg-light border ';

        if (this.isDesktop) {
          cls += 'hover:bg-light-2 ';
        }
      }

      return cls;
    },

    username() {
      return get(this.content, 'createdBy.local.username', '');
    },

    isCreatorDeleted() {
      return get(this.content, 'createdBy.deleted', false);
    },

    quizTitle() {
      const { length } = this.content.info.name;
      let title = '';
      const maxLength = this.isDesktop ? 30 : 22;

      if (length >= maxLength) {
        title = `${this.content.info.name.substring(0, maxLength)}...`;
      } else {
        title = this.content.info.name;
      }

      return title;
    },

    isQuizLocked() {
      return this.isSuperContent && !this.isSuperUser && !this.isCorporateUser;
    },

    noOfQuestions() {
      return `${this.content.info.questions.length} ${this.isContentQuizType ? 'Qs' : this.$i18n('slides')}`;
    },

    contentType() {
      return this.content.type || this.$constants.ContentType.QUIZ;
    },

    isContentQuizType() {
      return this.contentType === this.$constants.ContentType.QUIZ;
    },

    hasSubjects() {
      return !isEmpty(this.content.info.subjects);
    },

    hasGrades() {
      return !isEmpty(this.content.info.grade);
    },

    gradeLabel() {
      const lowerGradeLabel = this.$stringUtils.numberToLabel(this.content.info.grade[0] || 'KG');
      const higherGradeLabel = this.$stringUtils.numberToLabel(this.content.info.grade[1] || Grades[14].text);
      let result = '';

      if (lowerGradeLabel === higherGradeLabel) {
        result = lowerGradeLabel;
      } else {
        result = `${lowerGradeLabel} - ${higherGradeLabel}`;
      }
      return result + (higherGradeLabel === 'KG' || higherGradeLabel === Grades[13].text || higherGradeLabel === Grades[14].text ? '' : ` ${this.$i18n('grade', -1)} `);
    },

    getEmptyState() {
      const items = ['brand-a', 'brand-b', 'brand-c', 'brand-d', 'brand-e', 'deleted'];

      return items[Math.floor(Math.random() * items.length)];
    },
  },

  watch: {
    isLoading(newVal, oldVal) {
      if (!newVal && oldVal) {
        this.emptyStateType = this.getEmptyState;
      }
    },
  },

  mounted() {
    if (!get(this.content, 'info.image', null)) {
      this.emptyStateType = this.getEmptyState;
    }
  },
};
</script>

<style lang="scss" scoped>
.loading-state {
  color: transparent;
  border-radius: 4px;
  background: rgba(9, 9, 9, 0.1);
  line-height: 12px
}

.super-lozenge {
  left: 50%;
  transform: translate(calc(-50% - 4px), 0px);
  top: 0px;
  border-radius: 0px 0px 4px 4px;
}
</style>

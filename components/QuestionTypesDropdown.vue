<template>
  <ul
    class="py-1 overflow-auto"
    :style="{ maxHeight: containerHeight }"
  >
    <ForSuper
      v-for="(questionType, index) in values(types)"
      :key="index"
      class="w-full flex text-dark-3 py-1.5 px-3 hover:bg-dark-5% justify-between relative"
      :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
      :shouldNotApplyForSuper="!isQuestionTypeSuperType(questionType.type)"
      :type="getSuperUpsellType(questionType.type)"
      :feat="getSuperFeat(questionType.type)"
      @click="onQuestionTypeSelected(questionType.type)"
    >
      <button type="button">
        <div class="flex items-center">
          <QuestionTypeIcon
            :type="questionType.type"
            classes="w-6 h-6 mr-2"
          />
          <span
            class="w-40 font-semibold text-left truncate text-dark-3"
            :class="[xsDropdownTextSize ? 'text-xs' : 'text-sm']"
          >
            {{ questionType.title }}
          </span>
        </div>
      </button>

      <span class="absolute transform -translate-y-1/2 right-3 top-1/2">
        <SuperIcon
          v-if="isQuestionTypeSuperType(questionType.type) && isNotPremiumWeek()"
          :size="9"
        />
      </span>
    </ForSuper>
  </ul>
</template>

<script>
import { mapGetters } from 'vuex';
import values from 'lodash/values';

import { isQuestionTypeSuperType } from '~/utils/QuizUtils';
import { isNotPremiumWeek } from '~/utils/FreeweekUtils';

export default {
  props: {
    types: {
      type: Object,
      default: () => {},
    },

    xsDropdownTextSize: {
      type: Boolean,
      default: false,
    },

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onQuestionTypeSelected', 'closeDropdown'],

  data() {
    return {};
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),
    containerHeight() {
      return `${this.deviceProps.height * 0.7}px`;
    },
  },

  methods: {
    values,
    getSuperUpsellType(questionType) {
      return this.$constants.SuperUpsellTypes[`${questionType}_QUESTION`];
    },
    getSuperFeat(questionType) {
      return this.$constants.FeatureTypes[`${questionType}_QUESTION`];
    },
    isQuestionTypeSuperType(questionType) {
      return isQuestionTypeSuperType(questionType);
    },
    onQuestionTypeSelected(type) {
      this.$emit('onQuestionTypeSelected', type);
      this.$emit('closeDropdown');
    },
    isNotPremiumWeek() {
      return isNotPremiumWeek();
    },
  },
};
</script>

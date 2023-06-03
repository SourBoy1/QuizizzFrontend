<template>
  <div :class="{ 'grid grid-cols-2': !shouldShowAnswers }">
    <div v-if="shouldShowAnswers">
      <template
        v-for="(optionGroup, index) in targets"
        :key="index"
      >
        <div class="text-dark-2 py-2">
          ({{ getAlphabetNotationForIndex(index, false) }}) {{ optionGroup.name }}
        </div>
        <div class="grid grid-cols-2 pt-2 pb-4">
          <div
            v-for="(option, index) in groupOptions(optionGroup.id)"
            :key="index"
            class="flex items-start mb-2"
          >
            <OptionCard
              :isLoading="isLoading"
              :option="option"
              :answer="answer"
              :questionIndex="questionIndex"
              :isDarkVariant="isDarkVariant"
            />
          </div>
        </div>
        <hr
          v-if="index < targets.length - 1"
          class="text-dark-6"
        />
      </template>
    </div>
    <div
      v-for="(option, index) in options"
      v-else
      :key="index"
      class="flex items-start mb-2"
    >
      <OptionCard
        :isLoading="isLoading"
        :option="option"
        :answer="answer"
        :questionIndex="questionIndex"
        :isDarkVariant="isDarkVariant"
      />
    </div>
  </div>
</template>

<script>
import OptionCard from './OptionCard.vue';

export default {
  name: 'ClassificationQuestionOptionsContainer',

  components: {
    OptionCard,
  },

  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },

    options: {
      type: Array,
      default: () => [],
    },

    targets: {
      type: Array,
      default: () => [],
    },

    answer: {
      type: Array,
      default: () => [],
    },

    shouldShowAnswers: {
      type: Boolean,
      default: true,
    },

    questionIndex: {
      type: Number,
      required: true,
    },

    isDarkVariant: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    getOptionIds(groupId) {
      if (!groupId) {
        return [];
      }
      let res = [];
      this.answer.forEach((item) => {
        if (item.targetId === groupId) {
          res = item.optionId;
        }
      });
      return res;
    },

    groupOptions(groupId) {
      return this.getOptionIds(groupId)?.map((op) => this.options.find((i) => i._id === op));
    },

    getAlphabetNotationForIndex(index, inCaps = true) {
      const conversionFactor = inCaps ? 65 : 97;
      return String.fromCharCode(conversionFactor + index);
    },
  },
};
</script>

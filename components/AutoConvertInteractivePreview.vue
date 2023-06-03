<template>
  <QuestionDetailsCard
    :question="previewQuestion"
    :shouldShowAnswers="true"
    :isPreviewMode="true"
    forPage="auto-convert-preview"
    class="bg-light"
    @click="$emit('selectQuestion', { questionIndex: autoConvertItemIndex })"
  >
    <template #auto-convert-question-type-selector>
      <ul class="flex gap-2 justify-start">
        <li
          v-for="(autoConvertVersion, index) in autoConvertVersions"
          :key="autoConvertVersion._id"
        >
          <Button
            :title="autoConvertLozengeTitle(autoConvertVersion)"
            :translationOverflowConfig="{
              width: 'max-w-24',
              placement: 'top',
            }"
            class="transition-all duration-300"
            :type="selectedQuestionTypeIndex === index ? 'secondary' : 'white'"
            size="xs"
            :data-testid="autoConvertVersion.type"
            @click.stop="handleSelectQuestionType(index)"
          >
            <template #lIcon>
              <QuestionTypeIcon
                :size="12"
                radius="sm"
                :type="autoConvertVersion.type"
                :withBgBox="false"
                class="mr-2"
                :class="selectedQuestionTypeIndex === index ? '!text-lilac' : ''"
              />
            </template>
          </Button>
        </li>
      </ul>
    </template>
  </QuestionDetailsCard>
</template>

<script>
import { mapGetters } from 'vuex';

import { getQuestionTypes, isQuestionForPoll } from '../utils/QuizUtils';

export default {
  props: {
    autoConvertItem: {
      type: Object,
      required: true,
    },
    quizId: {
      type: String,
      required: true,
    },
    autoConvertItemIndex: {
      type: Number,
      default: 0,
    },
  },
  emits: ['selectQuestionType', 'selectQuestion'],

  data() {
    return {
      questionTypes: getQuestionTypes(),
      selectedQuestionTypeIndex: 0,
      showAnswers: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    autoConvertVersions() {
      return this.autoConvertItem.autoConvertVersions;
    },

    previewQuestion() {
      return this.autoConvertVersions[this.selectedQuestionTypeIndex];
    },
  },

  mounted() {
    this.showAnswersInterval = setInterval(() => {
      this.showAnswers = !this.showAnswers;
    }, 3000);
  },

  beforeUnmount() {
    clearInterval(this.showAnswersInterval);
  },

  methods: {
    autoConvertLozengeTitle(question) {
      const questionType = question.type;
      if (isQuestionForPoll(question)) {
        return this.questionTypes[this.$constants.QuestionTypes.POLL]?.title;
      }

      return this.questionTypes[questionType]?.title;
    },

    handleSelectQuestionType(typeIndex) {
      this.selectedQuestionTypeIndex = typeIndex;
      this.$emit('selectQuestionType', { typeIndex, questionIndex: this.autoConvertItemIndex });
    },
  },
};
</script>

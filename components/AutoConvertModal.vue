<template>
  <Modal
    :icon="modalIcon"
    :title="title"
    :subtitle="subtitle"
    :button1="button1"
    :button2="button2"
    :shouldCloseOnEscape="true"
    :shouldSubmitOnEnter="false"
    :dismissOnOverlayClick="true"
    size="custom"
    @close="handleModalClose"
    @button1-click="handleModalDiscard"
    @button2-click="handleSaveChanges"
  >
    <template v-if="showAutoConvertLoader">
      <transition
        appear
        enter-active-class="animate__animated animate__fadeInUp animation-duration-300"
      >
        <div class="h-[360px] w-[816px] bg-light-3 shadow border-dark-6 flex justify-center items-center">
          <img
            src="https://cf.quizizz.com/gif/magic-wand.gif"
            :alt="$i18n('auto-converting question')"
            class="w-15 h-auto"
          />
        </div>
      </transition>
    </template>
    <template v-else>
      <div
        :class="showConvertMore ? 'flex-col mx-4' : ''"
        class="my-2 flex justify-between items-center w-[816px]"
      >
        <transition
          enter-active-class="animate__animated animate__fadeInUp animation-duration-300"
          leave-active-class="animate__animated animate__fadeOutDown animation-duration-300"
        >
          <ul
            v-if="!showConvertMore"
            class="flex flex-col flex-shrink-0 gap-4 overflow-y-auto w-110 max-h-75 pr-4 pb-4"
          >
            <li
              v-for="(autoConvertItem, index) in autoConvertItemsList"
              :key="autoConvertItem.question.id"
            >
              <AutoConvertInteractivePreview
                :autoConvertItem="autoConvertItem"
                :quizId="quizId"
                :autoConvertItemIndex="index"
                :class="convertedQuestion && index === selectedQuestionData.questionIndex ? 'border-brand-e' : ''"
                @selectQuestionType="handleSelectQuestionType"
                @selectQuestion="handleSelectQuestion"
              />
            </li>
          </ul>
        </transition>
        <section
          class="max-h-75 self-stretch flex flex-col items-center justify-center p-2 rounded mb-4"
          :class="showConvertMore ? '' : 'bg-light-2'"
        >
          <div class="w-90 h-48">
            <div class="preview-container w-180 h-96">
              <QuestionPreviewCard
                class="relative w-full h-full flex flex-1 justify-center items-center overflow-hidden"
                :quizId="quizId"
                :currentQuestion="previewQuestion"
                :currentQuestionIndex="0"
                :showAnswers="showAnswers"
                :questionType="previewQuestion.type"
                :showQuestionExplanation="false"
                :questionsList="[previewQuestion]"
              />
            </div>
          </div>
          <div
            v-if="!showConvertMore"
            class="text-center pt-2"
          >
            <Lozenge
              :title="isCorporateUser ? $i18n('PARTICIPANT VIEW') : $i18n('STUDENT VIEW')"
              icon="fas fa-users"
              size="xs"
            />
          </div>
        </section>

        <transition
          appear
          enter-active-class="animate__animated animate__fadeIn animation-duration-300"
          leave-active-class="animate__animated animate__fadeOut animation-duration-100"
        >
          <section
            v-if="showConvertMore"
            class="text-center flex flex-col items-center gap-2 pt-4"
          >
            <h3 class="text-lg font-bold">
              <I18n :injections="[convertedToTitle]">
                Converted to {$1}!
              </I18n>
            </h3>
            <p class="text-base text-dark-4 font-semibold pb-4">
              <I18n>Make your quiz more interactive by converting multiple questions at once</I18n>
            </p>
            <div>
              <Button
                class="px-4 py-6 rounded-md"
                :type="primary"
                size="lg"
                @click="loadMoreQuestionsToAutoConvert"
              >
                <template #title>
                  <i18n :injections="[autoConvertItems.length]">
                    Convert {$1} more questions
                  </i18n>
                </template>
              </Button>
            </div>
            <div>
              <Button
                :type="'transparent-floating-dark'"
                size="md"
                class="text-dark-4"
                :title="$i18n('Dismiss')"
                @click="$emit('close')"
              />
            </div>
          </section>
        </transition>
      </div>
    </template>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import { getQuestionTypes } from '../utils/QuizUtils';
import QuestionPreviewCard from './QuestionPreview/QuestionPreviewCard.vue';

const SHOW_ANSWERS_TIME_INTERVAL = 3000;

export default {
  components: {
    QuestionPreviewCard,
  },
  props: {
    autoConvertItems: {
      type: Array,
      required: true,
    },

    quizId: {
      type: String,
      required: true,
    },

    convertedQuestion: {
      type: Object,
      default: () => { },
    },
  },
  emits: ['bulkAutoConvert', 'close'],

  data() {
    return {
      selectedQuestionData: { questionIndex: 0, typeIndex: 0 },
      showAnswers: false,
      showAutoConvertLoader: false,
      autoConvertItemsList: [],
      questionTypes: getQuestionTypes(),
      showConvertMore: !!this.convertedQuestion,
      analyticsMap: {},
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    title() {
      if (this.showConvertMore) {
        return '';
      }
      if (this.convertedQuestion) {
        return this.$i18n('{$1} questions converted', [this.autoConvertItems.length]);
      }
      return this.$i18n('Auto-convert into a more interactive question');
    },

    subtitle() {
      if (this.showConvertMore) {
        return '';
      }
      if (this.convertedQuestion) {
        return this.$i18n('Make your quiz more interactive in one click');
      }
      return this.$i18n('Choose the format for your question');
    },

    modalIcon() {
      if (this.showConvertMore) {
        return '';
      }
      return 'fas fa-arrows-retweet';
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    targetAutoConvertType() {
      const { autoConvertVersions = [], targetTypeIndex = 0 } = this.autoConvertItemsList[0];
      return autoConvertVersions[targetTypeIndex]?.type;
    },

    convertedToTitle() {
      return this.questionTypes[this.convertedQuestion?.type]?.title || '';
    },

    previewQuestion() {
      const { questionIndex = 0, typeIndex = 0 } = this.selectedQuestionData;
      const { autoConvertVersions } = this.autoConvertItemsList[questionIndex];

      if (this.showConvertMore && this.convertedQuestion) {
        return this.convertedQuestion;
      }

      return autoConvertVersions[typeIndex];
    },

    isSaveButtonDisabled() {
      return this.autoConvertItemsList.every(({ question, autoConvertVersions, targetTypeIndex }) => question.type === autoConvertVersions[targetTypeIndex].type);
    },

    clickEvents() {
      if (this.showConvertMore) {
        return {
          close: this.$webEvents.AUTO_CONVERT_V2_BULK_PROMPT_CLOSE_CLICKED,
          view: this.$webEvents.AUTO_CONVERT_V2_BULK_PROMPT_VIEWED,
        };
      }
      if (this.convertedQuestion) {
        // Bulk mode
        return {
          close: this.$webEvents.AUTO_CONVERT_V2_BULK_POPUP_CLOSE_CLICKED,
          discard: this.$webEvents.AUTO_CONVERT_V2_BULK_POPUP_DISCARD_CLICKED,
          save: this.$webEvents.AUTO_CONVERT_V2_BULK_POPUP_SAVE_CLICKED,
          view: this.$webEvents.AUTO_CONVERT_V2_BULK_POPUP_VIEWED,
        };
      }
      return {
        close: this.$webEvents.AUTO_CONVERT_V2_POPUP_CLOSE_CLICKED,
        discard: this.$webEvents.AUTO_CONVERT_V2_POPUP_DISCARD_CLICKED,
        save: this.$webEvents.AUTO_CONVERT_V2_POPUP_SAVE_CLICKED,
        view: this.$webEvents.AUTO_CONVERT_V2_POPUP_VIEWED,
      };
    },

    button1() {
      return this.showConvertMore
        ? null
        : {
          title: this.$i18n('Discard'),
          type: 'other',
        };
    },

    button2() {
      return this.showConvertMore
        ? null
        : {
          title: this.$i18n('Save changes'),
          type: 'primary',
          loading: false,
          disabled: this.isSaveButtonDisabled,
        };
    },
  },

  watch: {
    convertedQuestion(newVal) {
      this.showAutoConvertLoader = false;
      this.showConvertMore = !!newVal;
    },

    showConvertMore: {
      handler() {
        this.analyticsMap = this.autoConvertItems.reduce((map, { question, autoConvertVersions }) => {
          const mapId = question.cardId || question._id;
          map[mapId] = {
            questionId: question._id,
            originalType: question.type,
            suggestedTypes: autoConvertVersions.map((version) => version.type),
          };
          return map;
        }, {});

        this.$analytics.logEvent(this.clickEvents.view, {
          quizId: this.quizId,
          questions: Object.values(this.analyticsMap),
          eligible_questions: this.autoConvertItems.length,
        });
      },

      immediate: true,
    },

    autoConvertItems: {
      handler() {
        this.autoConvertItemsList = this.autoConvertItems.map((itemData) => ({ ...itemData, targetTypeIndex: 0 }));
      },
      immediate: true,
    },
  },

  mounted() {
    this.showAnswersInterval = setInterval(() => {
      this.showAnswers = !this.showAnswers;
    }, SHOW_ANSWERS_TIME_INTERVAL);
  },

  beforeUnmount() {
    clearInterval(this.showAnswersInterval);
  },

  methods: {
    updateQuestionSelection() {
      const { questionIndex = 0, typeIndex = 0 } = this.selectedQuestionData;
      this.autoConvertItemsList[questionIndex].targetTypeIndex = typeIndex;
    },

    handleSelectQuestionType({ typeIndex, questionIndex }) {
      this.selectedQuestionData = {
        questionIndex, typeIndex,
      };
      this.updateQuestionSelection();
    },

    handleSelectQuestion({ questionIndex }) {
      const typeIndex = this.autoConvertItemsList[questionIndex].targetTypeIndex ?? 0;
      this.selectedQuestionData = {
        typeIndex, questionIndex,
      };
      this.updateQuestionSelection();
    },

    handleSaveChanges() {
      this.showAutoConvertLoader = true;
      const conversionData = this.autoConvertItemsList.reduce((map, { question, autoConvertVersions, targetTypeIndex }) => {
        const mapId = question.cardId || question._id;
        const convertedQuestion = autoConvertVersions[targetTypeIndex];
        map[mapId] = {
          originalQuestion: question,
          convertedQuestion,
        };
        // Update analytics data
        this.analyticsMap[mapId].selectedType = convertedQuestion.type;
        return map;
      }, {});

      this.$emit('bulkAutoConvert', { autoConvertMap: conversionData });

      this.$analytics.logEvent(this.clickEvents.save, {
        quizId: this.quizId,
        questions_converted: Object.values(this.analyticsMap),
      });
    },

    loadMoreQuestionsToAutoConvert() {
      this.showConvertMore = false;
      this.$analytics.logEvent(this.$webEvents.AUTO_CONVERT_V2_BULK_PROMPT_CONVERT_CLICKED, { quizId: this.quizId });
    },

    dismissConvertMorePrompt() {
      this.$emit('close');
      this.$analytics.logEvent(this.$webEvents.AUTO_CONVERT_V2_BULK_PROMPT_DISMISS_CLICKED, { quizId: this.quizId });
    },

    handleModalClose() {
      this.$emit('close');
      this.$analytics.logEvent(this.clickEvents.close, { quizId: this.quizId });
    },

    handleModalDiscard() {
      this.$emit('close');
      this.$analytics.logEvent(this.clickEvents.discard, { quizId: this.quizId });
    },
  },

};
</script>

<style lang="scss" scoped>
.preview-container {
  transform: scale(0.5);
  transform-origin: top left;
}
</style>

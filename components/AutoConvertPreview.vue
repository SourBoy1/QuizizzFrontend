<template>
  <div
    class="p-4 flex gap-3 overflow-hidden rounded-lg border cursor-default"
    :class="[isAutoConvertMode ? 'bg-lilac-20% border-lilac-20%' : 'bg-green-faded border-green-20%']"
    @click="($event) => $event.stopImmediatePropagation()"
  >
    <div class="w-[360px] h-[192px] relative rounded-lg">
      <div class="preview-container w-[720px] h-[384px]">
        <QuestionPreviewCard
          class="preview-section relative w-full h-full flex flex-1 justify-center items-center overflow-hidden"
          v-bind="propsForQuestionPreviewCardChildren"
        />
      </div>
      <span
        class="student-view-pill absolute top-2 left-3 border border-dark-6 rounded font-bold text-tn px-2 bg-light text-dark-2"
      >
        <template v-if="isCorporateUser">
          <i18n>PARTICIPANT VIEW</i18n>
        </template>
        <template v-else>
          <i18n>STUDENT VIEW</i18n>
        </template>
      </span>
    </div>
    <div
      class="flex-1 text-dark-2 h-[192px] flex flex-col"
      :class="isAutoConvertModalEnabled ? 'justify-between' : ''"
    >
      <div>
        <template v-if="isAutoConvertMode">
          <span class="font-bold text-sm mb-1">
            <i18n>Want to spruce up this quiz?</i18n>
          </span>
          <div class="text-xs font-semibold">
            <template v-if="isAutoConvertModalEnabled">
              <p v-if="isCorporateUser">
                <i18n>Convert this question to a more interactive one for students 🕹️</i18n>
              </p>
              <p v-else>
                <i18n>Convert this question to a more interactive one for participants 🕹️</i18n>
              </p>
            </template>
            <template v-else>
              <p>
                <i18n>This question can automatically be converted to a </i18n>
                <span class="text-lilac italic font-bold">
                  <i18n>PREMIUM</i18n>
                </span>
                <i18n>question type.</i18n>
              </p>
              <br>
              <p>
                <i18n>
                  See what it would look like.
                </i18n>
              </p>
            </template>
          </div>
        </template>
        <template v-if="!isAutoConvertMode">
          <span class="font-bold text-sm mb-1">
            <i18n :injections="[getCurrentQuestionTitle]">Converted to {$1} !</i18n>
          </span>
          <div class="text-xs font-semibold">
            <p>
              <i18n>Go ahead with this question, or try creating your own highly interactive questions.</i18n>
            </p>
          </div>
        </template>
      </div>
      <div v-if="isAutoConvertModalEnabled">
        <Button
          :title="$i18n('Auto-convert')"
          :type="'white'"
          class="w-full"
          size="sm"
          :licon="'fas fa-arrows-retweet'"
          @click="handleOpenAutoConvertModal"
        />
        <Button
          :title="$i18n('Don\'t show again')"
          :type="'transparent-floating-dark'"
          class="w-full"
          size="sm"
          @click.stop="handleDontShowPreview"
        />
      </div>
      <template v-else>
        <Button
          v-if="!isAutoConvertMode"
          v-bind="button1Props"
          :customIconSize="12"
          size="sm"
          class="mt-14 text-sm"
          :loading="button1Loading"
          @click="button1Click"
        />
        <Button
          v-bind="button2Props"
          :customIconSize="12"
          size="sm"
          class="mt-auto text-sm"
          :loading="button2Loading"
          @click="button2Click"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { getQuestionTypeExplainerData } from '~/utils/QuizUtils';
import LocalStorage from '~/services/LocalStorage';

export default {
  emits: ['autoConvertButtonClick', 'saveChanges', 'hideAutoConvertPreview'],
  components: {
    QuestionPreviewCard: defineAsyncComponent(() => import('~/components/QuestionPreview/QuestionPreviewCard.vue')),
  },

  props: {
    quizId: {
      type: String,
      required: true,
    },

    currentQuestion: {
      type: Object,
      required: true,
    },

    isAutoConvertMode: {
      type: Boolean,
      default: false,
    },

    isAutoConvertModalEnabled: {
      type: Boolean,
      default: false,
    },

    showAnswers: {
      type: Boolean,
      required: true,
    },

    questionType: {
      type: String,
      required: true,
    },

    questionsList: {
      type: Array,
      required: true,
    },

    originalType: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      button1Loading: false,
      button2Loading: false,
      timer: null,
    };
  },

  computed: {
    isUserSuper() {
      return this.$user?.isSuper;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    button1Props() {
      if (!this.isAutoConvertMode) {
        return {
          type: 'primary',
          title: this.$i18n('Save changes'),
        };
      }
      return null;
    },

    button2Props() {
      if (this.isAutoConvertMode) {
        return {
          type: 'white',
          licon: 'fas fa-wand-magic-sparkles',
          title: this.$i18n('Auto Convert'),
          ariaLabel: this.$i18n('Auto Convert'),
        };
      }

      return {
        type: 'link',
        licon: 'fas fa-undo',
        title: this.$i18n('Revert'),
        buttonClasses: 'bg-green-faded',
        titleClasses: 'text-dark-2',
        liconClasses: 'text-dark-2',
      };
    },

    propsForQuestionPreviewCardChildren() {
      return {
        currentQuestion: this.currentQuestion,
        showAnswers: this.showAnswers,
        questionType: this.questionType,
        currentQuestionIndex: 0,
        questionsList: this.questionsList,
        showQuestionExplanation: false,
      };
    },

    getCurrentQuestionTitle() {
      const questionTypeExplainerData = getQuestionTypeExplainerData();
      return questionTypeExplainerData[this.currentQuestion.type].title;
    },
  },

  beforeUnmount() {
    clearTimeout(this.timer);
  },

  methods: {
    button2Click() {
      this.$analytics.logEvent(
        this.$webEvents.AUTO_CONVERT_QUIZ_PAGE_PREVIEW_COMPONENT_BUTTON_CLICK,
        {
          quizId: this.quizId,
          buttonMode: this.isAutoConvertMode ? 'autoConvertDefault' : 'revertAutoConversion',
          convertedTo: this.isAutoConvertMode ? this.currentQuestion.type : this.originalType,
          convertedFrom: !this.isAutoConvertMode ? this.currentQuestion.type : this.originalType,
        },
      );

      this.$emit('autoConvertButtonClick');
    },

    button1Click() {
      this.$emit('saveChanges');
    },

    handleDontShowPreview() {
      LocalStorage.setItem('hideAutoConvertPreview', true);
      this.$emit('hideAutoConvertPreview');
    },

    handleOpenAutoConvertModal() {
      LocalStorage.setItem('hideAutoConvertPreview', true);
      this.$emit('openAutoConvertModal', { fromPreview: true });
    },
  },
};
</script>

<style lang="scss" scoped>
.preview-container {
  transform: scale(0.5);
  transform-origin: top left;
}

.student-view-pill {
  font-family: Quicksand, OpenSans, Arial, Helvetica, sans-serif;
}
</style>

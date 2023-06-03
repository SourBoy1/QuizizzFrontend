<template>
  <transition
    appear
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
    :duration="500"
  >
    <div
      v-if="isReadyToShowConversionCTAs"
      class="bg-dark-50% rounded-lg flex flex-col justify-around items-center px-2 py-4 gap-4 font-quicksand"
      :style="editorStyles"
    >
      <div class="text-light text-base flex text-center font-bold">
        <i18n>Explore alternate question formats</i18n>
      </div>
      <div
        v-for="(data, ind) in buttonsData"
        :key="ind"
        :class="{ hidden: !data.shouldShow }"
      >
        <div
          v-if="data.shouldShow"
          class="convert-button"
          @mouseover="() => { setPreview(data.type); }"
          @mouseleave="() => { disablePreview(); }"
        >
          <div class="convert-alternate-button-no-hover">
            <div class="convert-button-icon">
              <QuestionTypeIcon
                :type="data.type"
                :shouldPaintBackground="false"
              />
            </div>
            <div class="convert-button-text">
              {{ questionTypes[data.type]?.title }}
            </div>
          </div>
          <div class="convert-alternate-button-hover">
            <Button
              :title="$i18n('Convert')"
              size="sm"
              type="white"
              ticon="far fa-arrow-right-arrow-left"
              @click="convert(data.type)"
            />
            <div class="convert-button-text">
              {{ questionTypes[data.type]?.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import once from 'lodash/once';
import debounce from 'lodash/debounce';

import { mapGetters, mapActions } from 'vuex';

import QuestionTypeIcon from '~/components/QuestionTypeIcon.vue';
import QLogger from '~/services/QLogger';
import NewSlideService from '~/services/NewSlideService';
import { getQuestionTypes } from '~/utils/QuizUtils';

export default {

  components: {
    QuestionTypeIcon,
  },
  emits: [],

  data() {
    return {
      previewActive: false,
      convertedQuestions: [],
      questionTypes: getQuestionTypes(),
      baseType: '',
    };
  },

  computed: {
    ...mapGetters({
      deviceProps: 'root/deviceProps',
      currentSlide: 'slideEditor/currentSlide',
      getIsPreviewActive: 'slideEditor/getIsPreviewActive',
      getSlideValidationErrors: 'contentEditor/getSlideValidationErrors',
      quizId: 'contentEditor/quizId',
      editorDimensions: 'contentEditor/questionEditorDimensions',
      isQuizWithoutDrafts: 'contentEditor/isQuizWithoutDrafts',
      isEditorForPresentationContent: 'contentEditor/isEditorForPresentationContent',
      isAnswerExplanationsInViewStore: 'contentEditor/isAnswerExplanationsInViewStore',
    }),

    shouldShowConvertor() {
      return !this.isEditorForPresentationContent && !this.isQuizWithoutDrafts && !this.isAnswerExplanationsInViewStore && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_EDITOR_AUTO_CONVERT_UI) && (this.previewActive || (this.$constants.QuestionTypes.MCQ === this.currentSlide.type && this.noQuestionValidationErrorPresent));
    },

    editorStyles() {
      const CONTAINER_SIZE_WIDTH = 168;
      let xTranslate = 0;

      const containerScaledSize = CONTAINER_SIZE_WIDTH * this.editorDimensions.scale;
      const distanceBetweenScreenRightAndQuestionEditorLeft = containerScaledSize + ((this.deviceProps.width - containerScaledSize) / 2);
      const peekAmount = this.editorDimensions.scale * CONTAINER_SIZE_WIDTH;

      xTranslate = (-distanceBetweenScreenRightAndQuestionEditorLeft + peekAmount + 8) / this.editorDimensions.scale;

      return {
        position: 'absolute',
        width: `${CONTAINER_SIZE_WIDTH}px`,
        transform: `scale(${this.editorDimensions.scale}) translateX(${xTranslate}px)`,
      };
    },

    noQuestionValidationErrorPresent() {
      return isEmpty(this.getSlideValidationErrors(this.currentSlide));
    },

    hasConvertedData() {
      return !isEmpty(this.convertedQuestions);
    },

    hasFibData() {
      return this.convertedQuestions.find((val) => val.type === this.$constants.QuestionTypes.BLANK);
    },

    isReadyToShowConversionCTAs() {
      const val = this.shouldShowConvertor && this.hasConvertedData;
      if (val) {
        this.triggerUIShownAnalytics();
      }
      return val;
    },

    buttonsData() {
      return [
        {
          shouldShow: this.hasFibData,
          type: this.$constants.QuestionTypes.BLANK,
        },
        {
          shouldShow: true,
          type: this.$constants.QuestionTypes.DROPDOWN,
        },
        {
          shouldShow: true,
          type: this.$constants.QuestionTypes.DRAGNDROP,
        },
      ];
    },
  },

  mounted() {
    this.triggerUIShownAnalytics = once(() => {
      this.$analytics.logEvent(this.$webEvents.EDITOR_AUTO_CONVERT_OPTION_VIEWED, {
        quizId: this.quizId,
        base_type: this.currentSlide.type,
        possible_converts: this.convertedQuestions.map((val) => val.type),
      });
    });
    this.$eventBus.$on('questionValidation:complete', this.updateConvertQuestion);
  },

  beforeUnmount() {
    this.$eventBus.$off('questionValidation:complete', this.updateConvertQuestion);
  },

  methods: {
    ...mapActions({
      disablePreviewQuestion: 'slideEditor/disablePreviewQuestion',
      setPreviewQuestion: 'slideEditor/setPreviewQuestion',
      convertPreviewQuestion: 'slideEditor/convertPreviewQuestion',
    }),

    setPreview(type) {
      this.previewActive = true;
      let question = NewSlideService.createQuestion(type);
      const convertedQuestionStructure = this.convertedQuestions.find((val) => val.type === type);
      question = {
        ...question,
        ...convertedQuestionStructure,
      };
      this.setPreviewQuestion(question);
    },

    disablePreview() {
      this.previewActive = false;
      this.disablePreviewQuestion();
    },

    convert(type) {
      this.previewActive = false;
      let question = NewSlideService.createQuestion(type);
      const convertedQuestionStructure = this.convertedQuestions.find((val) => val.type === type);
      question = {
        ...question,
        ...convertedQuestionStructure,
      };
      this.convertPreviewQuestion(question);
      // to show the tooltip
      this.$eventBus.$emit('slideEditorToolbar:showQuestionConversionTooltip');
      this.$analytics.logEvent(this.$webEvents.EDITOR_AUTO_CONVERT_OPTION_CLICKED, {
        quizId: this.quizId,
        base_type: this.baseType,
        convert_type: type,
      });
    },

    updateConvertQuestion: debounce(async function update() {
      // only when the convertor is shown, and if the preview is not-active.
      // the validate question event get emitted due to changes in options, but the true options have not changed as the convert button is not executed
      if (!this.shouldShowConvertor || this.getIsPreviewActive) {
        return;
      }

      const body = {
        questions: [this.currentSlide],
      };

      this.baseType = this.currentSlide.type;

      const response = await this.$axios.post('/convert-questions', body);

      if (response.status !== 200 || response.data?.success === false) {
        QLogger.error('Convert Questions API failed : ', response.statusText, ' ', response.data?.message);
      }

      this.convertedQuestions = response.data?.data?.result[0]?.targetQuestions || [];
    }, 500),
  },
};
</script>

<style lang="scss" scoped>
.convert-button {
  @apply flex w-39 h-24 rounded border-2 border-light-20% bg-purple-dark flex-col justify-evenly items-center
}

.convert-button:hover {
  @apply border-purple-faded bg-dark-1
}

.convert-button .convert-alternate-button-no-hover {
  @apply flex
}

.convert-button .convert-alternate-button-hover {
  @apply hidden
}

.convert-button:hover .convert-alternate-button-no-hover {
  @apply hidden
}

.convert-button:hover .convert-alternate-button-hover {
  @apply flex
}

.convert-alternate-button-no-hover {
  @apply flex-1 rounded flex-col justify-evenly items-center
}

.convert-alternate-button-hover {
  @apply flex-1 rounded flex-col justify-evenly items-center
}

.convert-button-icon {
  @apply flex w-6 h-6 bg-light-20% rounded items-center justify-center
}

.convert-button-text {
  @apply text-light text-lg flex text-center font-bold
}

</style>

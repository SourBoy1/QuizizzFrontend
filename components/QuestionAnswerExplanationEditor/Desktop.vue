<template>
  <div
    v-if="isEditorForQuizContent"
    class="absolute transition-transform duration-500 answer-explanations-container"
    :style="answerExplanationEditorStyles"
  >
    <!-- TODO(sarthak): improve -->
    <div
      v-if="!isAnswerExplanationsInViewStore"
      class="absolute top-0 left-0 z-10 w-full h-full cursor-pointer"
      @click="toggleExplanationBeingInView"
    />

    <transition
      appear
      enter-active-class="animate__animated animate__fadeIn animation-duration-300 animation-delay-300"
      leave-active-class="animate__animated animate__fadeOut animation-duration-200 "
    >
      <button
        v-show="!isAnswerExplanationsInViewStore"
        v-tooltip.top-end="$i18n('Add a fun fact or explanation for the correct answer')"
        class="answer-explanation-tab absolute top-7 -left-37 flex flex-col items-center p-4 rounded-l-2xl bg-dark-50% text-light-3 w-37 focus:outline-none"
        :aria-label="$i18n('Add answer explanation to current question')"
        :class="{ 'show-hover-anim': !isAnswerExplanationsInViewStore, 'rounded-b-none': canShowAutoGenerateExplanation }"
        :tabindex="175"
        @click="toggleExplanationBeingInView"
      >
        <FA
          class="bulb-icon"
          :class="{ 'glowing-bulb': !currentQuestionValidationErrors.length }"
          icon="fas fa-lightbulb-on"
          :size="28"
          aria-hidden="true"
        />

        <i18n
          v-if="doesSlideHaveAnswerExplanations"
          :key="1"
          class="mt-2 text-xl"
        >
          View answer explanation
        </i18n>
        <i18n
          v-else
          :key="2"
          class="mt-2 text-xl"
        >
          Add answer explanation
        </i18n>
      </button>
    </transition>

    <transition
      appear
      enter-active-class="animate__animated animate__fadeIn animation-duration-300 animation-delay-300"
      leave-active-class="animate__animated animate__fadeOut animation-duration-200 "
    >
      <button
        v-show="!isAnswerExplanationsInViewStore && canShowAutoGenerateExplanation"
        class="answer-explanation-tab absolute top-[160px] -left-37 flex flex-col items-center p-4 pt-0 rounded-bl-2xl bg-dark-50% text-light-3 w-37 focus:outline-none"
        :aria-label="$i18n('Generate explanation for current question')"
        :class="{ 'show-hover-anim': !isAnswerExplanationsInViewStore, 'rounded-t-none': canShowAutoGenerateExplanation }"
        :tabindex="176"
        :disabled="answerExplanationLoader"
        @click="generateAnswersExplaination"
      >
        <div
          v-if="answerExplanationLoader"
          class="w-full h-9 px-3 py-2 text-xs flex bg-light-33% hover:bg-light-50% rounded gap-1 justify-center items-center"
        >
          <Loader :size="18" />
        </div>
        <div
          v-else-if="canShowAutoGenerateExplanation"
          v-tooltip.bottom="{
            content: getgenerateExplainationTooltip,
            distance: 12,
            classes: 'w-45',
          }"
          :class="[getgenerateExplainationTooltip ? 'cursor-not-allowed' : 'cursor-pointer']"
          class="w-full h-9 px-3 py-2 text-xs flex bg-light-33% hover:bg-light-50% rounded gap-1 justify-center items-center"
        >
          <span><i18n>GENERATE</i18n></span>
          <span class="bg-red px-1 rounded"><i18n>BETA</i18n></span>
        </div>
      </button>
    </transition>

    <div
      class="answer-explanation-editor bg-dark-50% rounded-lg w-full h-full p-16 flex flex-row space-x-10"
      :class="{
        'is-bg-dark': isAnswerExplanationsInViewStore || doesSlideHaveAnswerExplanations,
      }"
    >
      <div class="flex-1 rounded-lg media-editor-container ">
        <div
          v-if="!doesExplanationHaveAnyMedia"
          class="w-full h-full flex flex-col align-center justify-center text-light-50% "
        >
          <h4 class="text-6xl text-center">
            <i18n>Add media</i18n>
          </h4>

          <div class="flex flex-row justify-center mt-6 space-x-4 transition-all duration-300 media-btns">
            <button
              class="media-btn"
              :aria-label="$i18n('Add Image to question')"
              @click="onAddMediaClick('image')"
            >
              <FA
                icon="fas fa-image"
                :size="40"
              />
              <i18n>Image</i18n>
            </button>

            <button
              class="relative media-btn"
              :aria-label="$i18n('Add Audio to question')"
              @click="onAddMediaClick('audio')"
            >
              <FA
                icon="fas fa-microphone-alt"
                :size="40"
              />
              <i18n>Audio</i18n>
              <span
                v-if="!$user.isCorporate && isNotPremiumWeek"
                class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4"
              >
                <SuperIcon :size="12" />
              </span>
            </button>

            <button
              class="relative media-btn"
              :aria-label="$i18n('Add Video to question')"
              @click="onAddMediaClick('video')"
            >
              <FA
                icon="far fa-video"
                :size="40"
              />
              <i18n>Video</i18n>
              <span
                v-if="!$user.isCorporate && isNotPremiumWeek"
                class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4"
              >
                <SuperIcon :size="12" />
              </span>
            </button>
          </div>
        </div>

        <div
          v-else
          class="relative flex items-center justify-center w-full h-full media-wrapper"
        >
          <MediaImage
            v-if="isExplanationMediaPresent('image')"
            class="w-full h-full rounded-md"
            :src="explanationMediaObjects.image.url"
            :objectFit="explanationMediaImageLayout"
          />

          <MediaAudio
            v-if="isExplanationMediaPresent('audio')"
            class="w-full h-full"
            :src="explanationMediaObjects.audio.url"
          />

          <div
            v-if="isExplanationMediaPresent('video')"
            class="flex items-center justify-center w-full h-full"
          >
            <video
              v-if="isExplanationMediaGoogleDriveVideo"
              controls
              playsinline
            >
              <source
                :src="`https://drive.google.com/uc?export=download&id=${explanationMediaGoogleVideoId}`"
                type="video/mp4"
              >
            </video>
            <MediaYoutube
              v-else
              class="w-full h-full"
              :url="explanationMediaObjects.video.url"
              :videoId="explanationMediaObjects.video.meta.videoId"
              :start="explanationMediaObjects.video.meta.startTime"
              :end="explanationMediaObjects.video.meta.endTime"
            />
          </div>

          <Button
            v-if="doesExplanationHaveAnyMedia"
            v-tooltip="{ content: $i18n('Remove explanation media'), placement: 'right' }"
            class="absolute z-10 delete-current-media top-2 right-2 dela"
            size="xl"
            type="secondary"
            ticon="fas fa-trash-alt"
            :aria-label="$i18n('Remove explanation media')"
            @click="deleteCurrentMedia"
          />

          <Button
            v-if="doesExplanationHaveAnyMedia"
            v-tooltip="{ content: $i18n('Edit explanation media'), placement: 'right' }"
            class="absolute z-10 reedit-media top-14 right-2"
            size="xl"
            type="secondary"
            ticon="fas fa-pen"
            :aria-label="$i18n('Edit explanation media')"
            @click="onMediaReedit"
          />
        </div>
      </div>
      <div class="flex-1 text-4xl text-editor-container">
        <TipTapMiniEditor
          ref="tiptap"
          :value="getTiptapValue()"
          :editorId="answerExplainTextEditorId"
          :placeholder="`${$i18n('Type a fun fact or explanation for the correct answer')}...`"
          class="tiptap-editor w-full h-full p-6 text-light-3 text-left rounded-lg border-2 md:border-4 border-light-20% hover:border-lilac-light overflow-auto flex flex-col"
          :class="{
            'in-focus border-lilac-light': isTipTapEditorInFocus,
            'border-transparent': isTipTapEditorInFocus,
          }"
          @input="onTiptapUpdate"
        />
        <button
          v-if="isAnswerExplanationsInViewStore && canShowAutoGenerateExplanation"
          class=" w-full flex flex-col items-center p-3 -mt-18 rounded-l-2xl bg-transparent text-light-3 focus:outline-none"
          :aria-label="$i18n('Generate explanation for current question')"
          :class="{ 'show-hover-anim': !isAnswerExplanationsInViewStore, 'rounded-t-none': canShowAutoGenerateExplanation }"
          :tabindex="176"
          :disabled="answerExplanationLoader"
          @click="generateAnswersExplaination"
        >
          <div
            v-if="answerExplanationLoader"
            class="w-full h-12 px-3 py-4 text-base flex bg-light-20% hover:bg-light-33% rounded gap-1 justify-center items-center"
          >
            <Loader :size="18" />
          </div>
          <div
            v-else-if="canShowAutoGenerateExplanation"
            v-tooltip.bottom="{ content: getgenerateExplainationTooltip, distance: 12 }"
            :class="[getgenerateExplainationTooltip ? 'cursor-not-allowed' : 'cursor-pointer']"
            class="w-full h-12 px-3 py-4 text-lg flex bg-light-20% hover:bg-light-33% rounded gap-2 justify-center items-center"
          >
            <span class="text-dark-5 text-lg"><i18n>Generate an Explanation</i18n></span>
            <span class="bg-red px-1 rounded text-lg"><i18n>BETA</i18n></span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import keys from 'lodash/keys';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import has from 'lodash/has';

import { mapGetters } from 'vuex';

import SuggestionService from '~/services/SuggestionService';
import removeHTMLTags from '~/utils/removeHTMLTags';
import { isNotPremiumWeek } from '~/utils/FreeweekUtils';

export default {

  props: {

    editorDimensions: {
      type: Object,
      required: true,
      validator: (val) => has(val, 'width') && has(val, 'height') && has(val, 'scale'),
    },

    getTiptapValue: {
      type: Function,
      required: true,
    },

    isExplanationMediaPresent: {
      type: Function,
      required: true,
    },

    isExplanationMediaGoogleDriveVideo: {
      type: Boolean,
      default: false,
    },

    explanationMediaGoogleVideoId: {
      type: String,
      default: null,
    },
  },
  emits: ['updateExplantionValue', 'onTiptapUpdate', 'onAddMediaClick', 'setSelectedQuestionElement', 'deleteCurrentMedia', 'onMediaReedit', 'generatedExplanation'],

  data() {
    return {
      tiptapEditor: {
        isEmpty: false,
        isFocused: false,
      },
      tipTapTimeout: null,
      answerExplanationLoader: false,
      canShowExplanationGenerator: true,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),
    ...mapGetters('slideEditor', ['currentSlide', 'doesSlideHaveAnswerExplanations']),
    ...mapGetters('contentEditor', ['isEditorForQuizContent', 'isEditorForPresentationContent', 'getSlideValidationErrors', 'isAnswerExplanationsInViewStore']),

    answerExplanation() {
      if (this.doesSlideHaveAnswerExplanations) {
        return this.currentSlide.structure.explain;
      }

      return {};
    },

    canShowAutoGenerateExplanation() {
      const questionType = this.currentSlide.type;
      if ((questionType !== this.$constants.QuestionTypes.MCQ && questionType !== this.$constants.QuestionTypes.MSQ) || this.isPollTypeQuestion(this.currentSlide)) {
        return false;
      }
      if (this.$featureFlags.getFeatureValue(this.$constants.FeatureFlagsTypes.SHOW_EXPLANATION_GENERATOR) === 1 && this.canShowExplanationGenerator) {
        return true;
      }
      return false;
    },

    answerExplainTextEditorId() {
      return 'questionAnswerExplanation';
    },

    isTipTapEditorInFocus() {
      return this.tiptapEditor.isFocused;
    },

    answerExplanationEditorStyles() {
      const EXPLANATION_PEEK = 40;
      let xTranslate = 0;

      if (!this.isAnswerExplanationsInViewStore) {
        const editorActualWidth = this.editorDimensions.width * this.editorDimensions.scale;
        const distanceBetweenScreenRightAndQuestionEditorLeft = editorActualWidth + ((this.deviceProps.width - editorActualWidth) / 2);
        const peekAmout = this.editorDimensions.scale * EXPLANATION_PEEK;

        xTranslate = (distanceBetweenScreenRightAndQuestionEditorLeft - peekAmout) / this.editorDimensions.scale;
      }

      return {
        width: `${this.editorDimensions.width}px`,
        height: `${this.editorDimensions.height}px`,
        transform: `scale(${this.editorDimensions.scale}) translateX(${xTranslate}px)`,
      };
    },

    doesExplanationHaveAnyMedia() {
      let check = false;

      forEach(this.explanationMediaObjects, (media, type) => {
        if (this.isExplanationMediaPresent(type)) {
          check = true;
        }
      });

      return check;
    },

    explanationMediaObjects() {
      const doesQuestionHaveMedia = (Array.isArray(this.answerExplanation.media) && !isEmpty(this.answerExplanation.media));
      const explanationMediaObjects = {
        image: {},
        audio: {},
        video: {},
      };

      if (doesQuestionHaveMedia) {
        forEach(this.answerExplanation.media, (media) => {
          explanationMediaObjects[media.type] = media;
        });
      }

      return explanationMediaObjects;
    },

    explanationMediaImageLayout() {
      return get(this.explanationMediaObjects, 'image.meta.layout', '');
    },

    currentQuestionValidationErrors() {
      return this.getSlideValidationErrors(this.currentSlide);
    },

    mediaTypeAdded() {
      const allMediaTypes = keys(this.explanationMediaObjects);

      for (let i = 0; i < allMediaTypes.length; i++) {
        if (this.isExplanationMediaPresent(allMediaTypes[i])) {
          return allMediaTypes[i];
        }
      }

      return '';
    },

    getgenerateExplainationTooltip() {
      const questionText = this.currentSlide.structure.query.text;
      const mediaInQuestion = this.currentSlide.structure.query.media;

      let correctOptions = null;
      if (!(this.currentSlide.structure.answer < 0)) {
        switch (this.currentSlide.type) {
          case this.$constants.QuestionTypes.MCQ:
            correctOptions = removeHTMLTags(this.currentSlide?.structure.options[this.currentSlide.structure.answer]?.text);
            break;
          case this.$constants.QuestionTypes.MSQ:
            correctOptions = this.currentSlide.structure.answer.map((ele) => removeHTMLTags(this.currentSlide?.structure.options[ele]?.text)).join(',');
            break;
          default:
            break;
        }
      }

      if (mediaInQuestion.length > 0) {
        const tooltipText = `${this.$i18n(' Sorry, this feature is not available for')}<br/> ${this.$i18n(' questions or answers containing images, videos and audios')}`;
        const tooltipIcon = '<i class="fas fa-warning"></i>';

        return this.tooltipInnerWrapperContainer(tooltipIcon, tooltipText);
      }
      if (questionText.length === 0 && !correctOptions) {
        const tooltipText = this.$i18n('Enter the question and the correct option to generate an answer explanation');
        const tooltipIcon = '';

        return this.tooltipInnerWrapperContainer(tooltipIcon, tooltipText);
      }

      if (questionText.length === 0 && correctOptions) {
        const tooltipText = this.$i18n('Enter the question to generate an answer explanation');
        const tooltipIcon = '';

        return this.tooltipInnerWrapperContainer(tooltipIcon, tooltipText);
      }

      if (!correctOptions) {
        const tooltipText = this.$i18n('Please select the correct option to generate an answer explanation');
        const tooltipIcon = '';

        return this.tooltipInnerWrapperContainer(tooltipIcon, tooltipText);
      }
      return false;
    },

    isNotPremiumWeek() {
      return isNotPremiumWeek();
    },
  },

  watch: {
    isTipTapEditorInFocus(newVal) {
      if (newVal === true) {
        this.setSelectedQuestionElementDebounced(this.answerExplainTextEditorId);
      } else {
        this.setSelectedQuestionElementDebounced('');
      }
    },
  },

  created() {
    this.updateExplantionValueThrottled = throttle(this.updateExplantionValue.bind(this), 200, { trailing: true });
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 100);
  },

  mounted() {
    this.tipTapTimeout = setTimeout(() => {
      const element = this.$refs.tiptap;

      const editor = element?.$refs?.tiptapContainer?.querySelector('.ProseMirror');
      if (!editor) {
        return;
      }
      editor.tabIndex = -1;
    }, 0);
  },

  beforeUnmount() {
    this.tipTapTimeout && clearTimeout(this.tipTapTimeout);
  },

  methods: {
    updateExplantionValue(value) {
      this.$emit('updateExplantionValue', value);
    },

    isPollTypeQuestion(question) {
      return [this.$constants.QuestionTypes.MCQ, this.$constants.QuestionTypes.MSQ].includes(question.type) && !question.structure.settings.hasCorrectAnswer;
    },

    onTiptapUpdate(value) {
      this.$emit('onTiptapUpdate', value);
    },

    toggleExplanationBeingInView() {
      this.$store.dispatch('contentEditor/toggleIsAnswerExplanationsInView');
      this.$refs.tiptap.focus('end');
    },

    onAddMediaClick(mediaType) {
      this.$emit('onAddMediaClick', mediaType);
    },

    setSelectedQuestionElement(elementId = '') {
      this.$emit('setSelectedQuestionElement', elementId);
    },

    deleteCurrentMedia() {
      this.$emit('deleteCurrentMedia');
    },

    onMediaReedit() {
      this.$emit('onMediaReedit');
    },

    async generateAnswersExplaination() {
      const questionText = this.currentSlide.structure.query.text;
      const filteredOptions = [];
      this.currentSlide.structure.options?.forEach((option) => {
        const cleanedOption = removeHTMLTags(option.text);
        if (cleanedOption.length > 0) {
          filteredOptions.push(cleanedOption);
        }
      });

      const correctAnswer = this.currentSlide.structure.answer;
      if (questionText.length === 0 || correctAnswer < 0) {
        this.answerExplanationLoader = false;
        return;
      }

      if (Array.isArray(correctAnswer) && correctAnswer.length === 0) {
        this.answerExplanationLoader = false;
        return;
      }

      this.answerExplanationLoader = true;
      this.$analytics.logEvent(this.$webEvents.GENERATE_ANSWER_EXPLAINATION);
      const correctOptions = this.currentSlide.structure.answer;
      const response = await SuggestionService.getAnswerExplaination(questionText, correctOptions, filteredOptions);
      if (response.explanation) {
        const answerValue = {
          text: `<p>${response.explanation}</p>`,
          isEmpty: false,
          isFocused: true,
          didTextChange: true,
        };
        this.$emit('onTiptapUpdate', answerValue);
        this.$eventBus.$emit('generatedExplanation', response.explanation);
        this.canShowExplanationGenerator = false;
        this.$analytics.logEvent(this.$webEvents.GENERATED_ANSWER_EXPLAINATION_RESPONSE, { question: removeHTMLTags(questionText), response: response.explanation });
        if (!this.isAnswerExplanationsInViewStore) {
          this.toggleExplanationBeingInView();
        }
      }
      this.answerExplanationLoader = false;
    },

    tooltipInnerWrapperContainer(icon, text) {
      const tooltipInnerWrapperContainer = `<div class="flex items-center px-1 gap-4">${icon}<div class="flex justify-center text-center">${text}</div></div>`;
      return tooltipInnerWrapperContainer;
    },
  },
};
</script>

<style lang="scss" scoped>

.media-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 128px;
  width: 128px;
  padding: 24px 8px 16px 8px;
  border-radius: theme('borderRadius.2xl');
  background-color: theme('backgroundColor.light.10%');
  color: theme('textColor.dark.4');
  font-size: theme('fontSize.4xl');
  transition: theme('transitionProperty.all');
  transition-duration: theme('transitionDuration.300');
  flex-shrink: 0;

  &:hover, &:active {
    transition: 0.2s ease all;
    background-color: theme('backgroundColor.light.20%');
    color: theme('textColor.dark.5');
  }

  &:focus {
    outline: none;
  }

  & > *:last-child {
    margin-top: 8px;
    line-height: theme('fontSize.4xl');
  }
}

.answer-explanation-editor {
  &.is-bg-dark {
    background-color: theme('backgroundColor.dark.1');
  }

  .tiptap-editor {
    justify-content: flex-start;
    align-items: flex-start;
    font-size: 36px;
  }
}

.answer-explanation-tab {

  .glowing-bulb {
    position: relative;
    color: theme('textColor.yellow.light');

    &:before {
      position: relative;
      z-index: 1;
    }

    &:after {
      content: '';
      width: 0px;
      height: 0px;
      z-index: 0;
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      animation: glowingBulb 2s ease 500ms infinite;
    }
  }

  &.show-hover-anim:hover {
    .bulb-icon {
      position: relative;
      color: theme('textColor.yellow.light');

      &:before {
        position: relative;
        z-index: 1;
      }

      &:after {
        content: '';
        width: 0px;
        height: 0px;
        z-index: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        animation: animatingIllumination 2s ease infinite;
      }
    }
  }
}

.tiptap-editor {
  border-style: dashed;

  &:hover, &.in-focus {
    border-style: solid;
  }
}

.delete-current-media, .reedit-media {
  position: absolute;
}

@keyframes glowingBulb {
  0% {
    box-shadow: 0 0 32px 14px theme('textColor.yellow.50%');
  }

  25% {
    box-shadow: 0 0 40px 28px theme('textColor.yellow.75%');
  }

  50% {
    box-shadow: 0 0 32px 14px theme('textColor.yellow.50%');
  }

  75% {
    box-shadow: 0 0 40px 28px theme('textColor.yellow.75%');
  }

  100% {
    box-shadow: 0 0 32px 14px theme('textColor.yellow.50%');
  }
}

@keyframes animatingIllumination {
  0% {
    box-shadow: 0 0 32px 14px theme('textColor.yellow.50%');
  }

  50% {
    box-shadow: 0 0 40px 28px theme('textColor.yellow.75%');
  }

  100% {
    box-shadow: 0 0 32px 14px theme('textColor.yellow.50%');
  }
}

.text-editor-container {
  max-width: 556px
}
</style>

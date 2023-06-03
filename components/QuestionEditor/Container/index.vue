<template>
  <PageSelector
    :forceShowDesktop="isEditorForPresentationContent"
    class="h-full"
  >
    <template #mobile>
      <transition
        appear
        enter-active-class="animate__animated animate__fadeIn animation-duration-200"
      >
        <div
          v-if="canSlideEditorBeRendered"
          class="relative flex items-center justify-center flex-grow w-full h-full editor-container"
        >
          <QuestionEditorContainerMobile
            :editorDimensions="editorDimensions"
          />
        </div>
      </transition>
    </template>
    <template #desktop>
      <transition
        appear
        enter-active-class="animate__animated animate__fadeIn animation-duration-200"
      >
        <div
          v-if="canSlideEditorBeRendered"
          class="relative flex flex-1 justify-center my-auto editor-container items-center"
        >
          <QuestionTemplate :questionType="currentSlide.type" />
          <QuestionConvertor />
          <QuestionEditorContainerDesktop
            :editorDimensions="editorDimensions"
            :isEditorForPresentationContent="isEditorForPresentationContent"
            :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
          />
        </div>
      </transition>
    </template>
  </PageSelector>
</template>

<script>
import { mapGetters } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import countBy from 'lodash/countBy';
import isEmpty from 'lodash/isEmpty';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';

import { nanoid } from 'nanoid';

import { convertQuestionTypeToDndImage } from '~/utils/QuestionUtils';
import { QuestionDefaultQuery } from '~/config/DefaultCopies';
import QuestionConvertor from '~/components/QuestionEditor/Container/Widgets/QuestionConvertor.vue';
import QuestionTemplate from '~/components/QuestionEditor/Container/Widgets/QuestionTemplate/index.vue';
import { PointsForQuestionTypes } from '~/config/Constants/EditorConstants';
import Question from '../../../models/Question';
import QuestionOption from '../../../models/QuestionOption';
import Structure from '../../../models/Structure';
import {
  isOptionsBasedQuestion, isTypingBasedQuestion, isDragDropBasedQuestion, isEquationBasedQuestion, shouldQuestionTypeHaveCorrectAnswer, isQuestionForPoll, isInteractiveBlankBasedQuestion, isDndImageBasedQuestion, isHotspotBasedQuestion, getQuestionDefaultMarks, isOptionEmpty, isGraphingBasedQuestion, isVariantQuestionType,
} from '../../../utils/QuizUtils';

import { getScaleFromAspectRatios } from '../../../utils/Utilities';
import { ensureQuestionIsEditorConsumable } from '../../../utils/SlideV1Utils';

export default {
  components: {
    QuestionConvertor,
    QuestionTemplate,
  },

  props: {
    canSlideEditorBeRendered: {
      type: Boolean,
      default: false,
    },

    containerWidth: {
      type: Number,
      required: true,
    },

    containerHeight: {
      type: Number,
      required: true,
    },

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],

  data() {
    return {
      deviceTypeSelected: this.$constants.DeviceTypes.DESKTOP,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),
    ...mapGetters('slideEditor', ['currentSlide', 'currentSlideId']),
    ...mapGetters('contentEditor', ['isEditorForQuizContent', 'isEditorForPresentationContent']),

    editorDimensions() {
      const editorDimensions = this.$constants.EditorDimensions.INTERACTIVE_SLIDE;
      const desktopMaxWidth = editorDimensions[0];
      let availableDims = [this.containerWidth, this.containerHeight];
      let scale = 1;

      if (this.isDesktop) {
        let width = editorDimensions[0];
        const height = editorDimensions[1];

        if (this.containerWidth < desktopMaxWidth) {
          availableDims = [this.containerWidth, height];
          scale = Math.min(getScaleFromAspectRatios(editorDimensions, availableDims).scale, 1);
        } else {
          width = desktopMaxWidth;
        }

        return {
          width,
          height,
          scale,
        };
      }

      // available dimensions as per device width
      availableDims = [this.deviceProps.width - 192, editorDimensions[1]];
      scale = Math.min(getScaleFromAspectRatios(editorDimensions, availableDims).scale, 1);

      return {
        width: editorDimensions[0],
        height: editorDimensions[1],
        scale,
      };
    },
  },

  mounted() {
    this.$store.dispatch('analyticsManager/addBreadcrumb', 'QE:Mount');
    this.optionsCache = {
      optionBased: [],
      typingBased: [],
      equationBased: [],
      graphBased: [],
    };

    this.answerCache = {
      interactiveBlank: [],
    };

    if (this.isEditorForQuizContent) {
      const consumableQuestion = ensureQuestionIsEditorConsumable(cloneDeep(this.currentSlide));

      if (!isEqual(this.currentSlide, consumableQuestion)) {
        this.$store.dispatch('slideEditor/updateQuestion', { question: consumableQuestion });
      }
    }
    this.setEditorDimensions();
    this.$eventBus.$on('questionEditor:currentQuestionTypeChange', this.onCurrentQuestionTypeChange);
    window.addEventListener('resize', this.setEditorDimensions);
  },

  beforeUnmount() {
    this.$store.dispatch('analyticsManager/addBreadcrumb', 'QE:Destroy');
    this.$eventBus.$off('questionEditor:currentQuestionTypeChange', this.onCurrentQuestionTypeChange);
    window.removeEventListener('resize', this.setEditorDimensions);
  },

  methods: {
    onCurrentQuestionTypeChange({ type, settings = {} }) {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'QTChange');
      const questionTypeToChangeTo = type;
      const originalType = this.currentSlide.type;
      this.answerCache.interactiveBlank = [];
      let finalTypeToUpdate = type;
      const meta = {
        blankIdToConfig: [],
      };

      /**
       * * Handle update of question query
       * ! STARTS
       */
      const updatedQuery = cloneDeep(this.currentSlide.structure.query);
      const questionImage = updatedQuery.media.find((media) => media.type === this.$constants.SlideMediaTypes.IMAGE);
      if (isDndImageBasedQuestion({ type: questionTypeToChangeTo }) || isHotspotBasedQuestion({ type: questionTypeToChangeTo })) {
        if (!questionImage) {
          updatedQuery.media.push({
            type: this.$constants.SlideMediaTypes.IMAGE,
            url: this.$constants.DrawQuestionBlankImage,
          });
        }
      }

      if (isDndImageBasedQuestion({ type: originalType }) || isHotspotBasedQuestion({ type: originalType })) {
        if (updatedQuery.media.length > 1) {
          updatedQuery.media = [questionImage];
        }
      }

      if (isInteractiveBlankBasedQuestion({ type: originalType }) && !isInteractiveBlankBasedQuestion({ type: questionTypeToChangeTo })) {
        updatedQuery.text = updatedQuery.text.replace(/<blank\s+id="[\w\d]+">\s*<\/blank>/gi, '');
      }

      if (isDragDropBasedQuestion({ type: questionTypeToChangeTo }) && updatedQuery.text === '') {
        updatedQuery.text = `<p>${QuestionDefaultQuery[type]}</p>`;
      }

      if (isDragDropBasedQuestion({ type: originalType }) && updatedQuery.text.includes(QuestionDefaultQuery[originalType])) {
        updatedQuery.text = '';
      }

      if (!isInteractiveBlankBasedQuestion({ type: originalType }) && isInteractiveBlankBasedQuestion({ type: questionTypeToChangeTo })) {
        const { answer, options, matches = [] } = this.currentSlide.structure;

        if (isTypingBasedQuestion({ type: originalType })) {
          const positionOfBlank = updatedQuery.text.indexOf('_');
          const fibId = nanoid(12);

          if (positionOfBlank === -1) {
            updatedQuery.text = `${updatedQuery.text} <br/> ${options[0] ? `<blank id="${fibId}"></blank>` : ''}`;
          } else {
            updatedQuery.text = `${updatedQuery.text.slice(0, positionOfBlank)} ${options[0] ? `<blank id="${fibId}"></blank>` : ''} ${updatedQuery.text.slice(positionOfBlank)}`;
          }

          if (options[0]) {
            meta.blankIdToConfig.push({
              blankId: fibId,
              value: options[0].text,
              hasMath: options[0].hasMath,
            });
            this.answerCache.interactiveBlank.push({
              targetId: fibId,
              optionId: [options[0]._id],
            });
          }
        }
        updatedQuery.text = updatedQuery.text.replace(/_/g, '');

        updatedQuery.text = `${updatedQuery.text}<br/>`;

        // handle conversion of MCQ
        if (originalType === this.$constants.QuestionTypes.MCQ && answer > -1) {
          if (options[answer].type !== this.$constants.QuestionStructureTypes.IMAGE) {
            const blankId = nanoid(12);
            meta.blankIdToConfig.push({
              blankId,
              value: options[answer].text,
              hasMath: options[answer].hasMath,
            });
            this.answerCache.interactiveBlank.push({
              targetId: blankId,
              optionId: [options[answer]._id],
            });

            updatedQuery.text += `<blank id="${blankId}"></blank>`;
          }
        }

        // handle conversion of questions with array type answer
        if (isInteractiveBlankBasedQuestion({ type: questionTypeToChangeTo }) && Array.isArray(answer)) {
          answer.forEach((ans, order) => {
            if (ans < 0 || !isNumber(ans)) {
              return;
            }

            if (options[ans].type === this.$constants.QuestionStructureTypes.IMAGE) {
              return;
            }

            const blankId = nanoid(12);

            this.answerCache.interactiveBlank.push({
              targetId: blankId,
              optionId: [options[ans]._id],
            });
            meta.blankIdToConfig.push({
              blankId,
              value: options[ans].text,
              hasMath: options[ans].hasMath,
            });

            if (originalType === this.$constants.QuestionTypes.MATCH) {
              const matchText = this.$stringUtils.extractContentFromHTML(matches[order].text, 'p');

              updatedQuery.text += `<p>${matchText} <blank id="${blankId}"></blank></p>`;
              return;
            }

            updatedQuery.text += `<blank id="${blankId}"></blank>`;
          });
        }
      }

      /**
       * * handle question type
       * ! STARTS
       */
      if (type === this.$constants.QuestionTypes.POLL) {
        finalTypeToUpdate = isOptionsBasedQuestion({ type: originalType }) ? originalType : this.$constants.QuestionTypes.MCQ;
      } else if (type === this.$constants.QuestionTypes.WORDCLOUD) {
        finalTypeToUpdate = this.$constants.QuestionTypes.OPEN;
      }

      /**
       * * handle the default time for the updated question
       * ! START
       */
      let updatedTime = this.currentSlide.time;
      if (updatedTime === this.$constants.QuestionDefaultTimes[originalType]) {
        updatedTime = this.$constants.QuestionDefaultTimes[type];
      }

      /**
       * * handle options for the updated question
       * ! STARTS
       */
      let updatedOptions = [];

      if (isTypingBasedQuestion({ type: originalType })) {
        this.optionsCache.typingBased = this.currentSlide.structure.options;
      } else if (isEquationBasedQuestion({ type: originalType })) {
        this.optionsCache.equationBased = this.currentSlide.structure.options;
      } else if (isOptionsBasedQuestion({ type: originalType }) || isDragDropBasedQuestion({ type: originalType }) || isInteractiveBlankBasedQuestion({ type: originalType })) {
        this.optionsCache.optionBased = this.currentSlide.structure.options;
        if (this.$constants.QuestionOptionLimits[questionTypeToChangeTo]) {
          this.optionsCache.optionBased = this.currentSlide.structure.options.slice(0, this.$constants.QuestionOptionLimits[questionTypeToChangeTo]?.max);
        }

        if (originalType === this.$constants.QuestionTypes.MATCH) {
          this.optionsCache.matchBased = this.currentSlide.structure.matches;
        }
      } else if (isGraphingBasedQuestion({ type: originalType })) {
        this.optionsCache.graphBased = this.currentSlide.structure.options;
      }

      if (isDragDropBasedQuestion({ type: questionTypeToChangeTo }) || isOptionsBasedQuestion({ type: questionTypeToChangeTo })) {
        updatedOptions = this.optionsCache.optionBased ?? [];
      }

      if (isTypingBasedQuestion({ type: questionTypeToChangeTo })) {
        updatedOptions = this.optionsCache.typingBased ?? [];
      }

      if (isEquationBasedQuestion({ type: questionTypeToChangeTo })) {
        updatedOptions = this.optionsCache.equationBased ?? [];
      }

      if (isGraphingBasedQuestion({ type: questionTypeToChangeTo })) {
        updatedOptions = this.optionsCache.graphBased ?? [];
      }

      if (isDragDropBasedQuestion({ type: questionTypeToChangeTo })) {
        if (updatedOptions.length > 0 && updatedOptions.length < this.$constants.QuestionOptionLimits[questionTypeToChangeTo].min) {
          updatedOptions = updatedOptions.concat([...Array(this.$constants.QuestionOptionLimits[questionTypeToChangeTo].min - updatedOptions.length)].fill(QuestionOption({})));
        }
      }

      if (isDndImageBasedQuestion({ type: originalType }) && isOptionsBasedQuestion({ type: questionTypeToChangeTo })) {
        updatedOptions = [...this.currentSlide.structure.options].slice(0, 5);
      }

      if (isInteractiveBlankBasedQuestion({ type: questionTypeToChangeTo }) || isDndImageBasedQuestion({ type: questionTypeToChangeTo })) {
        updatedOptions = [];
        const previousOptionContent = {};

        // Add answer first if any are available
        this.answerCache.interactiveBlank.forEach((answer) => {
          answer.optionId.forEach((id) => {
            const options = this.currentSlide.structure.options.find((val) => val._id === id);
            const optionText = options.hasMath ? options.text : this.$stringUtils.extractContentFromHTML(options.text).trim();
            previousOptionContent[optionText] = true;
            updatedOptions.push({
              ...options,
              text: this.$stringUtils.extractContentFromHTML(options.text, 'p'),
            });
          });
        });

        this.currentSlide.structure.options.forEach((option) => {
          const optionText = option.hasMath ? option.text : this.$stringUtils.extractContentFromHTML(option.text).trim();
          if (option.type === this.$constants.QuestionStructureTypes.IMAGE || optionText === '') {
            return;
          }
          // removes options which have duplicate text
          if (previousOptionContent[optionText]) {
            return;
          }
          previousOptionContent[optionText] = true;
          updatedOptions.push({
            ...option,
            text: this.$stringUtils.extractContentFromHTML(option.text, 'p'),
          });
        });

        if (isTypingBasedQuestion({ type: originalType }) && updatedOptions[0]) {
          updatedOptions = [updatedOptions[0]];
        }
      }

      /**
       * ! creating new structure for updated question
       * ! STARTS
       */
      const structure = Structure({
        kind: finalTypeToUpdate,
        options: updatedOptions,
        query: updatedQuery,
      });

      /**
       * ! handling answer explanation
       * ! STARTS
       */

      if (!isEmpty(this.currentSlide.structure.explain)) {
        structure.explain = this.currentSlide.structure.explain;
      }

      /**
       * * Add new values to the structure if needed
       * ! STARTS
       */
      if (questionTypeToChangeTo === this.$constants.QuestionTypes.MATCH) {
        let matches = this.optionsCache.matchBased ?? [];
        if (matches.length < updatedOptions.length) {
          matches = matches.concat([...Array(updatedOptions.length - matches.length)].fill(QuestionOption({})));
        }
        structure.matches = matches;
      }

      if (questionTypeToChangeTo === this.$constants.QuestionTypes.REORDER) {
        structure.order = this.$constants.OrderQuestionArrangement.ASC;
      }

      if (questionTypeToChangeTo === this.$constants.DND_IMAGE) {
        structure.targets = [];
      }

      if (isVariantQuestionType(questionTypeToChangeTo)) {
        const questionDisplayVariant = this.$constants.DisplayVariantNames[questionTypeToChangeTo];
        structure.settings.questionDisplayVariant = questionDisplayVariant;
        if (questionTypeToChangeTo === this.$constants.QuestionTypes.BLANK) {
          structure.settings.questionDisplayVariant = this.$constants.DisplayVariantNames[this.$constants.QuestionTypes.BLANK].BOX;
        }
        structure.marks.correct = PointsForQuestionTypes[questionTypeToChangeTo] ?? 1;
      }

      /**
       * * delete values from structure
       * ! STARTS
       */
      if (isOptionsBasedQuestion({ type: questionTypeToChangeTo })) {
        delete structure.settings.fibDataType;
      } else if (isTypingBasedQuestion({ type: questionTypeToChangeTo })) {
        let updatedFIBDataType = this.$constants.TypedQuestionResponseTypes.STRING;
        if (finalTypeToUpdate === this.$constants.QuestionTypes.BLANK) {
          const { options } = structure;
          const matchersCount = countBy(options, (opt) => opt.matcher);
          const doAllOptionsHaveExactNumberMatcher = matchersCount[this.$constants.AllBlankQuestionMatchers.EXACT_NUMBER] === options.length;
          if (doAllOptionsHaveExactNumberMatcher) {
            updatedFIBDataType = this.$constants.TypedQuestionResponseTypes.NUMBER;
          }
        }
        structure.settings.fibDataType = updatedFIBDataType;
      }

      if (isGraphingBasedQuestion({ type: originalType })) {
        delete structure.graphs;
      }

      /**
       * * Handle answer values
       * ! STARTS
       */
      let hasCorrectAnswer = false;

      if (isBoolean(settings.hasCorrectAnswer)) {
        hasCorrectAnswer = settings.hasCorrectAnswer;
      } else {
        hasCorrectAnswer = shouldQuestionTypeHaveCorrectAnswer({ type: questionTypeToChangeTo });
      }

      if (isQuestionForPoll(this.currentSlide) && questionTypeToChangeTo === this.$constants.QuestionTypes.MSQ) {
        hasCorrectAnswer = false;
      }

      structure.settings.hasCorrectAnswer = hasCorrectAnswer;

      if (originalType === this.$constants.QuestionTypes.MCQ && type === this.$constants.QuestionTypes.MSQ) {
        structure.answer = this.currentSlide.structure.answer < 0 ? [] : [this.currentSlide.structure.answer];
      }

      if (originalType === this.$constants.QuestionTypes.MSQ && type === this.$constants.QuestionTypes.MCQ) {
        structure.answer = this.currentSlide.structure.answer[0] ?? -1;
      }

      if (isDragDropBasedQuestion({ type: questionTypeToChangeTo })) {
        if (!isDragDropBasedQuestion({ type: originalType })) {
          structure.answer = [...Array(updatedOptions.filter((option) => !isOptionEmpty(option)).length).keys()];
        } else {
          structure.answer = this.currentSlide.structure.answer;
        }
      }

      if (isDndImageBasedQuestion({ type: questionTypeToChangeTo })) {
        const { answer, targets, options } = convertQuestionTypeToDndImage(originalType, {
          options: updatedOptions,
          answer: this.currentSlide.structure.answer,
        });
        structure.answer = answer;
        structure.targets = targets;
        structure.options = options;
      }

      if (isDndImageBasedQuestion({ type: originalType })) {
        if (questionTypeToChangeTo === this.$constants.QuestionTypes.MCQ) {
          structure.answer = updatedOptions.findIndex((option) => option._id === this.currentSlide.structure.answer[0]?.optionId[0]);
        }

        if (questionTypeToChangeTo === this.$constants.QuestionTypes.MSQ) {
          structure.answer = [];
          this.currentSlide.structure.answer.forEach((ans) => {
            const index = updatedOptions.findIndex((option) => option._id === ans.optionId[0]);
            if (index !== -1) {
              structure.answer.push(index);
            }
          });
        }
      }

      if (isHotspotBasedQuestion({ type: questionTypeToChangeTo })) {
        structure.answer = [];
      }

      if (originalType === this.$constants.QuestionTypes.DRAW
            && structure.query.media.length && structure.query.media[0].type === 'image'
            && structure.query.media[0].url === this.$constants.DrawQuestionBlankImage) {
        structure.query.media = [];
      }

      if (isInteractiveBlankBasedQuestion({ type: questionTypeToChangeTo })) {
        structure.answer = isInteractiveBlankBasedQuestion({ type: originalType }) ? [...this.currentSlide.structure.answer] : this.answerCache.interactiveBlank;
      }

      if (isTypingBasedQuestion({ type: questionTypeToChangeTo })) {
        structure.answer = [];
      }

      /**
       * ! Updating question data
       * ! STARTS
       */
      const updatedQuestion = new Question({
        ...this.currentSlide,
        time: updatedTime,
        type: finalTypeToUpdate,
        structure,
      });

      /**
       * * set marks for question types
       * ! STARTS
       */
      structure.marks = {
        correct: getQuestionDefaultMarks(updatedQuestion),
        incorrect: 0,
      };

      /**
       * * do miscellaneous actions
       * unrelated to question's changes
       */
      if (isInteractiveBlankBasedQuestion({ type: questionTypeToChangeTo })) {
        this.$store.dispatch('uiManager/setBlankValue', meta.blankIdToConfig);
      }

      this.$store.dispatch('contentEditor/setValidationPending');
      this.$store.dispatch('slideEditor/updateQuestion', { question: updatedQuestion });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    setEditorDimensions() {
      this.$store.dispatch('contentEditor/setQuestionEditorDimensions', this.editorDimensions);
    },
  },
};
</script>

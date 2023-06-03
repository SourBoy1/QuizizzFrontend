<template>
  <div class="question-editor-wrapper desktop flex flex-col items-center">
    <div
      :key="questionDiscriminator"
      class="question-editor-container bg-purple p-2 relative grow-0 shrink-0 rounded-lg flex flex-col transition-transform duration-500"
      :style="{ ...containerStyles, ...questionEditorConfig }"
    >
      <SchoolUpgradeBanner ref="schoolBanner" />
      <SuperUpgradeBanner ref="upgradeBanner" />
      <SlideMetaControl />
      <AnswerExplanation />

      <div
        class="h-full w-full min-h-0 min-w-0"
        :class="[{
          'p-4': !shouldShowGridLayout,
          'grid-layout p-2': shouldShowGridLayout,
          'has-image': hasImageInQuestion,
        }, questionType]"
      >
        <div
          :key="`${questionDiscriminator}_query`"
          class="relative w-full"
          :class="{
            'query-editor-wrapper': !shouldShowGridLayout,
            'grid-layout-query': shouldShowGridLayout,
          }"
        >
          <QuestionQueryEditor
            ref="questionQueryEditor"
            class="bg-purple relative z-10 rounded-2xl shrink-0 w-full"
            :questionType="questionType"
            :forDevice="$constants.DeviceTypes.DESKTOP"
            :graphingSetup="false"
          />
        </div>

        <div
          :key="`${questionDiscriminator}_options`"
          :class="[{
            'grid-layout-options': shouldShowGridLayout,
            'options-editor-wrapper mt-2': !shouldShowGridLayout,
          }]"
        >
          <QuestionOptionsEditor
            v-if="isCurrentQuestionOptionsBased"
            ref="optionEditor"
            :forDevice="$constants.DeviceTypes.DESKTOP"
            :questionType="questionType"
            :questionSettings="questionSettings"
            :currentQuestion="currentSlide"
            :isSaveButtonFocused="isSaveButtonFocused"
            :setGeneratedOptionsForCurrentSlide="setGeneratedOptionsForCurrentSlide"
          />

          <QuestionTypingInputEditor
            v-if="isCurrentQuestionTypingBased"
            ref="optionEditor"
            :questionType="questionType"
            :questionSettings="questionSettings"
          />

          <QuestionAudioVideoEditor
            v-if="isCurrentQuestionAudioVideoBased"
            ref="optionEditor"
            :questionType="questionType"
          />

          <QuestionDragAndDropEditor
            v-if="isCurrentQuestionOrderMatchBased"
            ref="optionEditor"
            :forDevice="$constants.DeviceTypes.DESKTOP"
            :questionType="questionType"
          />

          <OptionsEditorInteractiveBlank
            v-if="isInteractiveBlankBasedQuestion"
            :forDevice="$constants.DeviceTypes.DESKTOP"
            :questionType="questionType"
          />

          <EquationInputEditorContainer
            v-if="isEquationBasedQuestion"
            @toggleEquationTypeOnboardingModal="showEquationTypeOnboardingModal = true"
          />

          <OptionsEditorDndImageEditor
            v-if="isDndOnImageQuestion"
            ref="optionEditor"
          />

          <OptionsEditorHotspotEditorVariantMenu
            v-if="isHotspotQuestion && hasImageInQuestion"
            ref="optionEditor"
          />

          <ClassificationOptionsGroupContainer
            v-if="isClassificationQuestion"
            ref="optionEditor"
            :questionType="questionType"
          />
        </div>
        <div
          v-if="shouldShowMiscellanousContainer"
          class="grid-layout-miscellaneous"
        >
          <DnDImageCanvas v-if="isDndOnImageQuestion" />
          <HotspotCanvas v-if="isHotspotQuestion" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import QueryEditorMixin from '~/mixins/QueryEditorMixin';

import SchoolUpgradeBanner from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SchoolUpgradeBanner.vue';
import SuperUpgradeBanner from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SuperUpgradeBanner.vue';
import SlideMetaControl from '~/components/QuestionEditor/Layouts/Desktop/Widgets/SlideMetaControl.vue';
import AnswerExplanation from '~/components/QuestionEditor/Layouts/Desktop/Widgets/AnswerExplanation.vue';
import HotspotCanvas from '~/components/OptionsEditor/HotspotEditor/Canvas.vue';
import DnDImageCanvas from '~/components/OptionsEditor/DndImageEditor/Canvas.vue';
import ClassificationOptionsGroupContainer from '~/components/OptionsEditor/ClassificationEditor/index.vue';

export default {

  components: {
    SchoolUpgradeBanner,
    SuperUpgradeBanner,
    SlideMetaControl,
    AnswerExplanation,
    HotspotCanvas,
    DnDImageCanvas,
    ClassificationOptionsGroupContainer,
  },

  mixins: [QueryEditorMixin],

  props: {

    containerStyles: {
      type: Object,
      default: () => { },
    },

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },

    isSaveButtonFocused: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['setGeneratedOptionsForCurrentSlide'],

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'serverData']),
    ...mapGetters('slideEditor', ['currentSlide', 'isCurrentSlideForQuestion']),
    ...mapGetters('products', ['isEligibleForTrial']),
    ...mapGetters('contentEditor', ['getQuizType',
      'quizId',
      'isEditorForPresentationContent',
      'getQuestionById',
      'getSlideValidationErrors',
      'isSlideValidated']),

    shouldShrinkQueryEditor() {
      return [
        this.$constants.QuestionTypes.MATCH,
        this.$constants.QuestionTypes.REORDER,
        this.$constants.QuestionTypes.CLASSIFICATION,
      ].includes(this.questionType);
    },

    questionEditorConfig() {
      if (this.isEquationBasedQuestion) {
        return {
          '--queryEditorHeight': '100%',
        };
      }
      return {
        '--queryEditorHeight': this.shouldShrinkQueryEditor ? '30%' : '45%',
      };
    },

    isSuperUser() {
      return this.$user.isSuper;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    shouldShowGridLayout() {
      return this.isDndOnImageQuestion || this.isEquationBasedQuestion || this.isHotspotQuestion;
    },

    shouldShowMiscellanousContainer() {
      return this.isDndOnImageQuestion || this.isHotspotQuestion;
    },

    hasImageInQuestion() {
      return this.isQuestionMediaPresent('image');
    },

  },

  methods: {
    setGeneratedOptionsForCurrentSlide(options) {
      this.$emit('setGeneratedOptionsForCurrentSlide', options);
    },
  },
};
</script>

<style lang="scss" scoped>
$queryEditorHeight: var(--queryEditorHeight);
$optionEditorHeight: calc(100% - $queryEditorHeight);

.query-editor-wrapper {
  height: calc(#{$queryEditorHeight} - (theme('padding.1') / 2));
}

.options-editor-wrapper {
  height: calc(#{$optionEditorHeight} - (theme('padding.1') / 2));
}

.grid-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  min-height: 0px; // makes the component shrink to fit its content

  .grid-layout-query {
    grid-area: query;
  }

  .grid-layout-options {
    grid-area: options;
    overflow: auto;
  }

  .grid-layout-miscellaneous {
    grid-area: misc;
  }

  &.DND_IMAGE {
    grid-template-areas:
      'query misc'
      'options misc';
    grid-auto-rows: 1fr 1fr;

    .grid-layout-query {
      overflow: auto;
    }
  }

  &.EQUATION {
    grid-template-areas:
      'query options'
      'query options';
  }

  &.HOTSPOT {
    grid-template-rows: 1fr;
    grid-template-areas:
      'query misc'
      'query misc';

    .grid-layout-options {
      display: none;
    }

    &.has-image {
      grid-template-areas:
        'query misc'
        'options misc';
      grid-template-rows: 4fr 1fr;

      .grid-layout-options {
        display: block;
      }
    }

    .grid-layout-options {
      overflow: visible;
    }
  }

}
</style>

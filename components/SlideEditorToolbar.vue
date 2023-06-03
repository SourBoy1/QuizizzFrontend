<template>
  <div class="flex items-center w-full h-12 px-2 slide-editor-toolbar md:relative shrink-0 bg-purple-dark text-light-3">
    <!-- <ToolbarButton
      v-if="areUndoRedoBtnsVisible"
      v-tooltip.bottom="`${$i18n('Undo')} (Ctrl+Z)`"
      name="undo"
      :aria-label="$i18n('Undo')"
      icon="fas fa-undo"
      :selected="isFormatButtonSelected('undo')"
      :disabled="!canUndo"
      @clicked="onFormatButtonClicked('undo')"
    />
    <ToolbarButton
      v-if="areUndoRedoBtnsVisible"
      v-tooltip.bottom="`${$i18n('Redo')} (Ctrl+Shift+Z)`"
      name="redo"
      class="ml-1"
      icon="fas fa-redo"
      :selected="isFormatButtonSelected('redo')"
      :aria-label="$i18n('Redo')"
      :disabled="!canRedo"
      @clicked="onFormatButtonClicked('redo')"
    /> -->

    <div
      v-if="!isDefaultMode || showFontStyleToolbar"
      class="placeholder mx-2 border-l border-light-10% h-8"
    />

    <Button
      v-if="areScrollBtnsVisible"
      v-tooltip.bottom="$i18n('Scroll Left')"
      :aria-label="$i18n('Scroll Left')"
      name="Left Scroll"
      type="transparent"
      customDisabledClasses="opacity-25 bg-light-20% text-light-3"
      class="flex-shrink-0 w-8 h-8 mr-2"
      licon="fas fa-caret-right fa-rotate-180"
      :iconSize="16"
      :disabled="isLeftScrollDisabled"
      @click="onLeftScrollButtonClicked"
    />

    <div
      ref="scrollableToolsContainer"
      class="relative flex-1 h-full"
    >
      <div
        class="absolute top-0 left-0 w-full h-screen overflow-x-scroll pointer-events-none hover:pointer-events-auto"
        @scroll="onToolbarScroll"
      >
        <div
          v-if="!shouldHideAllToolbars"
          ref="scrollableTools"
          class="absolute top-0 left-0 flex items-center h-12 transition-all duration-200 ease-in-out pointer-events-auto"
        >
          <ShapeStyleToolbarSection
            v-if="isShapeEditMode"
            :shapeData="selectedElement"
            @shapeFillColorChange="onShapeFillColorChange"
            @shapeBorderColorChange="onShapeBorderColorChange"
            @shapeBorderWidthChange="onShapeBorderWidthChange"
          />

          <div
            v-if="isShapeEditMode"
            class="vertical-divider border border-light-10% rounded-2m mx-2"
          />

          <FontStyleToolbarSection
            v-show="isTextEditMode"
            ref="fontStyleToolbarSection"
            :selectedFormatButtons="selectedFormatButtons"
            :selectedFont="selectedFont"
            :selectedSize="selectedSize"
            :isContentSlideBeingEdited="isContentSlideBeingEdited"
            :isQuestionSlideBeingEdited="isQuestionSlideBeingEdited"
            @onFontSelected="onFontSelected"
            @onFontColorChange="onFontColorChange"
            @onSizeSelected="onSizeSelected"
            @onFormatButtonClicked="onFormatButtonClicked"
          />

          <div
            v-if="!isDefaultMode && isContentSlideBeingEdited"
            class="vertical-divider border border-light-10% rounded-2m ml-2"
          />

          <Dropdown
            v-show="!isDefaultMode && isContentSlideBeingEdited"
            list-width="w-56"
            class="w-20 ml-2"
            size="sm"
            type="toolbar"
            :title="$i18n('Order')"
            :tooltip="{ placement: 'bottom', content: $i18n('Order object') }"
            ariaLabel="Elements Order"
          >
            <LessonOrderDropdown
              @onOrderSelected="onOrderSelected"
            />
          </Dropdown>

          <div
            v-if="isTextEditMode"
            class="vertical-divider border border-light-10% rounded-2m ml-2"
          />

          <Dropdown
            v-show="isTextEditMode && isContentSlideBeingEdited"
            :iconComponent="alignTextIcon(currentAlignmentButton)"
            list-width="w-12"
            class="w-12 ml-2"
            size="sm"
            autoPosition
            type="toolbar"
            title=""
            :tooltip="{ placement: 'bottom', content: $i18n('Align text') }"
            ariaLabel="Elements Order"
          >
            <AlignOptionsToolbarSection
              :selectedFormatButtons="selectedFormatButtons"
              @onFormatButtonClicked="onFormatButtonClicked"
            />
          </Dropdown>

          <div
            v-if="isTextEditMode && isContentSlideBeingEdited && !isMultiSelect"
            class="vertical-divider border border-light-10% rounded-2m ml-2"
          />

          <div
            v-show="isTextEditMode && isContentSlideBeingEdited"
            class="flex items-center h-12"
          >
            <ToolbarButton
              v-if="!isMultiSelect"
              v-tooltip.bottom="`${$i18n('Numbered list')} (Ctrl+Shift+7)`"
              :aria-label="$i18n('Numbered list')"
              name="list-ol"
              class="ml-2"
              icon="fas fa-list-ol"
              :selected="isFormatButtonSelected('list-ol')"
              @clicked="onFormatButtonClicked('list-ol')"
            />
            <ToolbarButton
              v-if="!isMultiSelect"
              v-tooltip.bottom="`${$i18n('Bulleted list')} (Ctrl+Shift+8)`"
              :aria-label="$i18n('Bulleted list')"
              name="list-ul"
              class="ml-2"
              icon="fas fa-list-ul"
              :selected="isFormatButtonSelected('list-ul')"
              @clicked="onFormatButtonClicked('list-ul')"
            />
          </div>

          <MediaOptionsToolbarSection
            v-show="(isImageMediaMode || isOtherMediaMode) && isContentSlideBeingEdited && !isMultiSelect"
            :current-mode="currentMode"
            @replaceMedia="onReplaceMedia"
          />

          <div
            v-if="isEditorForPresentationContent && !isQuestionSlideBeingEdited && (isMathEditMode || isTextEditMode)"
            class="vertical-divider border border-light-10% rounded-2m mx-2"
          />

          <Button
            v-if="!isInteractiveBlankBasedQuestion"
            v-show="isMathEditMode || isTextEditMode"
            type="transparent"
            size="sm"
            licon="fas fa-function"
            :title="$i18n('Equation editor')"
            :class="[
              'bg-purple-dark hover:bg-light-5% border-light-10% border border-solid',
              isContentSlideBeingEdited ? '' : 'ml-2',
            ]"
            @mousedown="onQuestionEquationClick"
          />

          <div
            v-if="isTextEditMode && isContentSlideBeingEdited"
            class="vertical-divider border border-light-10% rounded-2m ml-2"
          />

          <Dropdown
            v-show="isTextEditMode && isContentSlideBeingEdited"
            list-width="w-24"
            class="w-12 ml-2"
            size="sm"
            type="toolbar"
            :iconComponent="lineHeightIcon"
            title=""
            :tooltip="{ placement: 'bottom', content: $i18n('Line height') }"
            :ariaLabel="$i18n('Set line height')"
          >
            <LineHeightDropdown
              @onLineHeightSelected="onLineHeightSelected"
            />
          </Dropdown>
        </div>
      </div>
    </div>

    <Button
      v-if="areScrollBtnsVisible"
      v-tooltip.bottom="$i18n('Scroll Right')"
      :aria-label="$i18n('Scroll Right')"
      name="Right"
      type="transparent"
      customDisabledClasses="opacity-25 bg-light-20% text-light-3"
      class="flex-shrink-0 w-8 h-8 ml-2"
      licon="fas fa-caret-right"
      :iconSize="16"
      :disabled="isRightScrollDisabled"
      @click="onRightScrollButtonClicked"
    />

    <div
      v-if="!isDefaultMode && isContentSlideBeingEdited && !isShapeEditMode"
      class="vertical-divider border border-light-10% rounded-2m ml-2"
    />

    <Button
      v-show="isContentSlideBeingEdited && !hasNoSlides"
      type="transparent"
      :title="$i18n('Themes')"
      size="sm"
      licon="fas fa-brush"
      class="bg-purple-dark hover:bg-light-5% ml-auto"
      @click="toggleThemesPicker"
    />

    <Dropdown
      v-if="showRescoreAndQuestionTypeDropdown"
      v-slot="scope"
      v-tooltip.top="{ content: questionPointsDropdownTooltip }"
      :dropdownDisabled="disableQuestionPointsDropdown"
      :iconComponent="pointsDropdownIconComponent"
      class="ml-auto mr-2 w-42"
      size="sm"
      type="dark"
      ariaLabel="Question Points"
      :xsDropdownTextSize="true"
      :title="getPointsListText(questionCorrectPoints)"
      :selectedItem="getPointsListText(questionCorrectPoints)"
    >
      <ul class="overflow-y-auto list-box">
        <button
          v-for="points in pointsList"
          :key="points"
          class="p-1 pl-2 w-full border-b-1 border-dark-6 hover:bg-dark-10% outline-none text-sm text-left"
          @click="onPointsSelection(points, scope.closeDropdown)"
        >
          <span class="text-dark-3">
            {{ getPointsListText(points) }}
          </span>
        </button>
      </ul>
    </Dropdown>

    <div>
      <Dropdown
        v-if="showRescoreAndQuestionTypeDropdown"
        v-slot="scope"
        ref="questionTypesDropdown"
        v-tooltip.top="{ content: $i18n('Change question type'), distance: 4 }"
        :iconComponent="questionTypeIconComponent"
        class="question-types-dropdown w-55 ml-auto"
        size="sm"
        type="dark"
        :ariaLabel="$i18n('Question types')"
        :tabindex="80"
        :selectedItem="questionTypes[selectedSlideType]?.title"
        :disableCloseOnClickOutside="disableQuestionTypeDropdownCloseOnBlur"
        :title="questionTypes[selectedSlideType]?.title"
      >
        <QuestionTypesDropdown
          :types="questionTypesForDropdown"
          :shouldAllowUsingSuperQuestionTypes="shouldAllowUsingSuperQuestionTypes"
          @onQuestionTypeSelected="onCurrentQuestionTypeChange"
          @closeDropdown="scope.closeDropdown"
        />
      </Dropdown>
      <PopoverInfo
        trigger="manual"
        class="absolute top-[10%]"
        placement="left-start"
        :open="showQuestionConversionTooltipState"
      >
        <template #popover-content>
          <div class="flex flex-row p-4 items-center gap-3">
            <div class="icon flex">
              <FAwoSize class="aspect-square fas fa-arrow-right-arrow-left h-10 rounded-full bg-lilac-faded justify-center text-lilac text-lg" />
            </div>
            <div class="message flex flex-col">
              <div class="text-sm font-semibold text-dark-2">
                <i18n>Converted to </i18n> {{ questionTypeTitle(currentSlide) }}
              </div>
              <div class="text-xs font-normal text-dark-4">
                <i18n>Easily switch between different question formats</i18n>
              </div>
            </div>
          </div>
        </template>
      </PopoverInfo>
    </div>

    <Modal
      v-if="showConversionWarning"
      icon="far fa-exclamation-triangle"
      :title="$i18n('Some data could be changed')"
      subtitle=""
      dismissOnOverlayClick
      :button1="{
        title: $i18n('Cancel'),
        type: 'other',
      }"
      :button2="{
        title: $i18n('Change question type'),
        type: 'primary',
      }"
      @button1-click="showConversionWarning = false"
      @button2-click="() => {
        const eventName = $webEvents.getQuizEditorEvent(quiz.type, $webEvents.EDITOR_QUESTION_CREATE);
        $analytics.logEvent(eventName,
                            {
                              userId: $user.id,
                              quizId: quizId,
                              questionType: questionTypeToChangeTo,
                              isPremium: isQuestionTypeSuperType(questionTypeToChangeTo),
                              screen: 'questionEditor',
                              source: 'select_q_type_dropdown',
                            },
        );
        $eventBus.$emit('questionEditor:currentQuestionTypeChange', { type: questionTypeToChangeTo });
        showConversionWarning = false
      }"
      @close="showConversionWarning = false"
    >
      <div class="text-dark-4 text-sm">
        <i18n>The question type you’re trying to change to has a very different format</i18n>.
      </div>
    </Modal>
  </div>
</template>

<script>
import { h as hydrate } from 'vue';
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { SlideShape } from '~/services/ShapesService';
import { StableConversionQuestionTypes } from '~/config/Constants/EditorConstants';
import QuestionTypeIcon from './QuestionTypeIcon.vue';
import {
  isQuestionForPoll, isWordCloudQuestion, getQuestionTypes, isInteractiveBlankBasedQuestion, isQuestionTypeSuperType, getQuestionDefaultMarks, isEquationBasedQuestion, getPointsList,
} from '../utils/QuizUtils';

import FA from './FA.vue';

/**
 * The toolbar is divided into different sections to make it more modular.
 * - Undo and redo options
 * - Font Styles
 * - Align Options
 * - Lists
 * - Media Options
 * - Math
 * - ShapeOptions
 * - Order option
 * - Theme option
 * - Question editor options
 *
 * There slide being edited can be a content slide or a question slide
 * depending on which the options in the toolbar will change
 *
 */
export default {
  props: {

    shouldAllowUsingSuperQuestionTypes: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onShapeFillColorChange', 'onShapeBorderColorChange', 'onShapeBorderWidthChange', 'onFontSelected', 'onFontColorChange', 'onSizeSelected', 'onFormatButtonClicked', 'onOrderSelected', 'onLineHeightSelected', 'onReplaceMedia'],

  data() {
    return {
      selectedFont: 'Quicksand',
      selectedSize: 48,
      selectedFormatButtons: [],
      currentMode: this.$constants.EditModes.DEFAULT,
      currentAlignmentButton: '',
      showFontStyleToolbar: false,
      areScrollBtnsVisible: false,
      isLeftScrollDisabled: false,
      isRightScrollDisabled: false,
      questionTypes: getQuestionTypes(),
      showQuestionTypeDropdown: false,
      disableQuestionTypeDropdownCloseOnBlur: false,

      // question type conversion warning prop
      showConversionWarning: false,
      questionTypeToChangeTo: null,
      showQuestionConversionTooltipState: false,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide', 'isCurrentSlideForQuestion', 'isCurrentSlideForContent', 'currentlyFocusedTiptapEditor', 'lastFocusedTiptapEditor', 'isFocusedTiptapEditorForQuestion', 'selectedElement', 'isMultiSelect', 'sourcePage']),
    ...mapGetters('contentEditor', ['quiz', 'quizId', 'quizType', 'selectedSlideData', 'canUndo', 'canRedo', 'isEditorForPresentationContent', 'isEditorForQuizContent', 'hasNoSlides']),

    pointsList() {
      return getPointsList(this.currentSlide);
    },

    shapeServiceObject() {
      if (this.selectedElement) {
        const html = get(this.selectedElement, 'data.html', '');
        const shapeObj = SlideShape.fromSVGHTMLContent(html);
        return shapeObj;
      }

      return null;
    },

    isElementLocked() {
      return Boolean(this.selectedElement?.isLocked);
    },

    shouldHideAllToolbars() {
      return this.isElementLocked;
    },

    doesCurrentShapeHaveText() {
      if (!this.shapeServiceObject) {
        return true;
      }

      return this.shapeServiceObject.shouldHaveTextField();
    },

    isCurrentSlideForQuestion() {
      return this.selectedSlideType !== (this.$constants.SlideTypes.CONTENT_SLIDE_V2 || this.$constants.SlideTypes.CONTENT_SLIDE_V1);
    },

    isContentSlideBeingEdited() {
      return this.isCurrentSlideForContent;
    },

    isQuestionSlideBeingEdited() {
      return this.isCurrentSlideForQuestion;
    },

    isImageMediaMode() {
      return this.currentMode === this.$constants.EditModes.IMAGE_MEDIA;
    },

    isOtherMediaMode() {
      return this.currentMode === this.$constants.EditModes.OTHER_MEDIA;
    },

    isMathEditMode() {
      return this.currentMode === this.$constants.EditModes.MATH;
    },

    isShapeEditMode() {
      return this.currentMode === this.$constants.EditModes.SHAPE;
    },

    isTextEditMode() {
      return this.currentMode === this.$constants.EditModes.TEXT || (this.isShapeEditMode && this.doesCurrentShapeHaveText) || this.isTableEditMode || this.showFontStyleToolbar;
    },

    isDefaultMode() {
      return this.currentMode === this.$constants.EditModes.DEFAULT;
    },

    isTableEditMode() {
      return this.currentMode === this.$constants.EditModes.TABLE;
    },

    showTableEditToolbar() {
      return !this.isDefaultMode && this.isContentSlideBeingEdited && this.isTableEditMode;
    },

    areUndoRedoBtnsVisible() {
      return this.isEditorForPresentationContent;
    },

    questionTypesForDropdown() {
      return Object.entries(getQuestionTypes()).reduce((questionTypeList, [questionType, questionMetadata]) => {
        if (questionType === this.$constants.QuestionTypes.MSQ) {
          return questionTypeList;
        }

        if (questionMetadata.featureFlag && this.$featureFlags.isDisabled(questionMetadata.featureFlag)) {
          return questionTypeList;
        }

        questionTypeList[questionType] = questionMetadata;
        return questionTypeList;
      }, {});
    },

    questionCorrectPoints() {
      return getQuestionDefaultMarks(this.currentSlide);
    },

    isQuestionPoll() {
      return isQuestionForPoll(this.currentSlide);
    },

    isWordCloudTypeQuestion() {
      return isWordCloudQuestion(this.currentSlide);
    },

    disableQuestionPointsDropdown() {
      return this.isQuestionPoll || this.isWordCloudTypeQuestion;
    },

    questionPointsDropdownTooltip() {
      if (this.isQuestionPoll) {
        return this.$i18n('Polls cannot have correct answers hence will always remain ungraded');
      }
      if (this.isWordCloudTypeQuestion) {
        return this.$i18n('Word cloud cannot have correct answers hence will always remain ungraded');
      }
      return this.$i18n('Change question points');
    },

    selectedSlideType() {
      let displayType = this.currentSlide.type;

      if (this.isQuestionPoll) {
        displayType = this.$constants.SlideTypes.POLL;
      }

      if (this.isWordCloudTypeQuestion) {
        displayType = this.$constants.SlideTypes.WORDCLOUD;
      }

      return displayType;
    },

    showRescoreAndQuestionTypeDropdown() {
      if (this.isCurrentSlideForQuestion) {
        return (!this.isEditorForPresentationContent || !this.hasNoSlides);
      }

      return false;
    },

    isInteractiveBlankBasedQuestion() {
      return isInteractiveBlankBasedQuestion(this.currentSlide);
    },

    isEquationBasedQuestion() {
      return isEquationBasedQuestion(this.currentSlide);
    },

    questionTypeIconComponent() {
      const selectedQuestionType = this.selectedSlideType;

      return {
        render() {
          return hydrate(QuestionTypeIcon, {
            radius: 'sm',
            classes: 'p-1',
            type: selectedQuestionType,
            size: 10,
            width: 4,
          });
        },
      };
    },

    lineHeightIcon() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-line-height',
            size: 12,
          });
        },
      };
    },

    pointsDropdownIconComponent() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-check-circle',
            size: 11,
          });
        },
      };
    },

    isSuperUser() {
      return this.$user.isSuper;
    },

  },

  created() {
    this.$eventBus.$on('slideEditorToolbar:addSymbol', this.handleAddSymbol);
    this.$eventBus.$on('slideEditorToolbar:toggleFontStyleToolbar', this.toggleShowFontStyleToolbar);
    this.$eventBus.$on('slideEditorToolbar:toggleQuestionTypesDropdown', this.toggleShowQuestionTypesDropdown);
    this.$eventBus.$on('slideEditorToolbar:showQuestionConversionTooltip', this.showQuestionConversionTooltip);
  },

  beforeUnmount() {
    this.$eventBus.$off('slideEditorToolbar:addSymbol', this.handleAddSymbol);
    this.$eventBus.$off('slideEditorToolbar:toggleFontStyleToolbar', this.toggleShowFontStyleToolbar);
    this.$eventBus.$off('slideEditorToolbar:toggleQuestionTypesDropdown', this.toggleShowQuestionTypesDropdown);
    this.$eventBus.$off('slideEditorToolbar:showQuestionConversionTooltip', this.showQuestionConversionTooltip);
  },

  methods: {
    toggleShowFontStyleToolbar({ value }) {
      this.showFontStyleToolbar = value;
    },

    toggleShowQuestionTypesDropdown() {
      if (!this.$refs.questionTypesDropdown) {
        return;
      }
      this.disableQuestionTypeDropdownCloseOnBlur = true;
      this.$refs.questionTypesDropdown.toggleOpen();
    },

    getPointsListText(points) {
      const pointsTitle = this.$i18n('point');
      if (points === 0) {
        return this.$i18n('Ungraded (0 points)');
      }
      return points === 1 ? `${points} ${pointsTitle}` : `${points} ${pointsTitle}s`;
    },

    handleAddSymbol({ code, name }) {
      const elementId = this.currentlyFocusedTiptapEditor.id || this.lastFocusedTiptapEditor.id || '';
      this.$eventBus.$emit('slideElement:addSlideSymbol', { code, name, elementId });
    },
    alignTextIcon(value) {
      return {
        render() {
          return hydrate(FA, {
            icon: `fas fa-${value}`,
            size: 12,
          });
        },
      };
    },

    onShapeFillColorChange(color) {
      this.$emit('onShapeFillColorChange', color);
    },

    onShapeBorderColorChange(color) {
      this.$emit('onShapeBorderColorChange', color);
    },

    onShapeBorderWidthChange(width) {
      this.$emit('onShapeBorderWidthChange', width);
    },

    onFontSelected(font) {
      this.selectedFont = font;
      this.$emit('onFontSelected', font);
    },

    onFontColorChange(color) {
      this.selectedFontColor = color;
      this.$emit('onFontColorChange', color);
    },
    setSelectedFontColor(color) {
      this.selectedFontColor = color;
      this.$refs.fontStyleToolbarSection?.setSelectedFontColor(color);
    },

    setSelectedFont(font) {
      this.selectedFont = font;
      this.$refs.fontStyleToolbarSection?.setSelectedFont(font);
    },

    onSizeSelected(size) {
      this.selectedSize = size;
      this.$emit('onSizeSelected', size);
    },
    setSelectedFontSize(size) {
      this.selectedSize = size;
    },

    onLeftScrollButtonClicked(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      const { scrollableTools, scrollableToolsContainer } = this.$refs;
      const { style, offsetLeft } = scrollableTools;
      const { clientWidth: containerWidth } = scrollableToolsContainer;

      const newLeftPosition = (Math.abs(offsetLeft) > containerWidth) ? Math.abs(offsetLeft) - containerWidth : 0;
      style.left = `-${newLeftPosition}px`;

      this.updateScrollButtonsState(newLeftPosition);
    },

    onRightScrollButtonClicked(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      const { scrollableTools, scrollableToolsContainer } = this.$refs;
      if (!scrollableTools || !scrollableToolsContainer) {
        return;
      }

      const { style, offsetLeft, clientWidth: toolsWidth } = scrollableTools;
      const { clientWidth: containerWidth } = scrollableToolsContainer;

      const newLeftPosition = ((toolsWidth - (Math.abs(offsetLeft) + containerWidth)) <= containerWidth) ? (toolsWidth - containerWidth) : (Math.abs(offsetLeft) + containerWidth);

      if (newLeftPosition !== 0) {
        style.left = `-${newLeftPosition}px`;
      }

      this.updateScrollButtonsState(newLeftPosition);
    },

    onToolbarScroll(ev) {
      this.updateScrollButtonsState(ev.target.scrollLeft);
    },

    onFormatButtonClicked(button) {
      this.$emit('onFormatButtonClicked', button);
    },

    updateScrollButtonsState(newLeftPosition = 0) {
      this.$nextTick(() => {
        const { scrollableTools, scrollableToolsContainer } = this.$refs;
        if (!scrollableTools) {
          return;
        }
        const { clientWidth: toolsWidth } = scrollableTools;
        const { clientWidth: containerWidth } = scrollableToolsContainer;

        this.isLeftScrollDisabled = newLeftPosition === 0;
        this.isRightScrollDisabled = (newLeftPosition + containerWidth) === toolsWidth;
      });
    },

    isFormatButtonSelected(button) {
      return this.selectedFormatButtons.includes(button);
    },
    onOrderSelected(order) {
      this.$emit('onOrderSelected', order);
    },

    onLineHeightSelected(lineHeight) {
      this.$emit('onLineHeightSelected', lineHeight);
    },

    setCurrentMode(mode) {
      this.currentMode = mode;

      if (this.isDefaultMode) {
        this.areScrollBtnsVisible = false;
        return;
      }

      this.$nextTick(() => {
        const { scrollableTools, scrollableToolsContainer } = this.$refs;
        if (!scrollableTools) {
          return;
        }
        const { clientWidth: toolsWidth } = scrollableTools;
        const { clientWidth: containerWidth } = scrollableToolsContainer;

        this.areScrollBtnsVisible = toolsWidth > containerWidth;
        this.updateScrollButtonsState();
      });
    },

    setSelectedFormatButtons(state) {
      this.selectedFormatButtons = state;
      this.currentAlignmentButton = state.find((a) => a.includes('align-'));
    },

    onReplaceMedia() {
      this.$emit('onReplaceMedia');
    },
    toggleThemesPicker() {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_THEMEPICKER_OPEN);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        source: 'themesBtn',
        sourcePage: this.sourcePage,
      });
      this.$eventBus.$emit('presentationEditor:toggleThemesPicker');
    },

    onQuestionEquationClick() {
      const elementToAddTo = this.currentlyFocusedTiptapEditor.id || this.lastFocusedTiptapEditor.id || '';

      if (isEmpty(elementToAddTo)) {
        return;
      }

      this.$eventBus.$emit('presentationEditor:showMathEditor', {
        callback: (latex) => {
          this.$eventBus.$emit('questionEditor:insertMath', {
            elementId: elementToAddTo,
            latex,
          });
        },
        closeCallback: () => {
          this.$eventBus.$emit('questionEditor:closeMathEditor', {
            elementId: elementToAddTo,
          });
        },
      });
    },

    onTableThemeSelected(theme) {
      this.$eventBus.$emit('slideElement:table', theme);
      this.$refs.tableThemeDropdown.close();
    },

    onPointsSelection(points, closeDropdown) {
      this.$analytics.logEvent('question_marks_updated', {
        quizId: this.quizId,
        questionId: this.currentSlide._id,
        sourcePage: this.sourcePage,
      });

      if (this.questionCorrectPoints === points) {
        closeDropdown && closeDropdown();
        return;
      }

      this.$store.dispatch('slideEditor/updateQuestionCorrectPoints', { points });
      closeDropdown && closeDropdown();
    },

    isQuestionTypeSuperType(questionType) {
      return isQuestionTypeSuperType(questionType);
    },

    onCurrentQuestionTypeChange(type) {
      if (!this.isSuperUser) {
        const eventName = this.$webEvents.SELECT_QUESTION_TYPE;
        this.$analytics.logEvent(
          eventName,
          {
            userId: this.$user.id,
            quizId: this.quizId,
            questionType: type,
            isPremium: this.isQuestionTypeSuperType(type),
            screen: 'questionEditor',
            source: 'select_q_type_dropdown',
          },
        );
      }

      this.questionTypeToChangeTo = type;

      if (StableConversionQuestionTypes[this.currentSlide.type]) {
        if (!StableConversionQuestionTypes[this.currentSlide.type].includes(type)) {
          // if the question does not have any data then it safe to convert
          const isSafeToConvert = isEmpty(this.currentSlide?.structure?.answer) && isEmpty(this.currentSlide?.structure?.options);
          this.showConversionWarning = !isSafeToConvert;
          if (!isSafeToConvert) {
            return;
          }
        }
      }

      const eventName = this.$webEvents.getQuizEditorEvent(this.quiz.type, this.$webEvents.EDITOR_QUESTION_CREATE);
      this.$analytics.logEvent(
        eventName,
        {
          userId: this.$user.id,
          quizId: this.quizId,
          questionType: type,
          isPremium: this.isQuestionTypeSuperType(type),
          screen: 'questionEditor',
          source: 'select_q_type_dropdown',
        },
      );

      this.$eventBus.$emit('questionEditor:currentQuestionTypeChange', { type });
    },

    questionTypeTitle(question) {
      let questionType = question.type;

      if (isQuestionForPoll(question)) {
        questionType = this.$constants.QuestionTypes.POLL;
      }

      return this.questionTypes[questionType]?.title;
    },

    showQuestionConversionTooltip() {
      this.showQuestionConversionTooltipState = true;
      setTimeout(() => {
        this.showQuestionConversionTooltipState = false;
      }, 2000);
    },
  },
};
</script>

<style lang="scss" scoped>
.vertical-divider {
  height: calc(100% - 16px);
}
.list-box {
  max-height: 188px;
  overflow-y: auto;
}
</style>

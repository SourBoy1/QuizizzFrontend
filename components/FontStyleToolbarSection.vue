<template>
  <div
    class="flex items-center"
    :class="{
      'h-12': !isMobileMode,
    }"
  >
    <Dropdown
      v-if="isContentSlideBeingEdited && isFontSelectionVisible"
      ref="fontListDropdownHead"
      class="font-family-dropdown-toggler w-40 mr-2"
      size="sm"
      type="toolbar"
      :title="selectedFont || $i18n('Automatic')"
      :selectedItem="selectedFont"
      :tooltip="{ placement: 'bottom', content: $i18n('Font') }"
      ariaLabel="Font"
      listWidth="w-44"
    >
      <FontListDropdown
        ref="fontListDropdown"
        @onFontSelected="onFontSelected"
      />
    </Dropdown>

    <Dropdown
      v-if="isContentSlideBeingEdited && isFontSelectionVisible"
      ref="fontSizeDropdownHead"
      listWidth="w-13"
      class="font-size-dropdown-toggler w-20"
      size="sm"
      type="toolbar"
      :title="`${selectedSize} px`"
      :selectedItem="`${selectedSize} px`"
      :tooltip="{ placement: 'bottom', content: $i18n('Font size') }"
      ariaLabel="Font Size"
    >
      <FontSizeDropdown
        ref="fontSizeDropdown"
        @onSizeSelected="onSizeSelected"
      />
    </Dropdown>

    <div
      v-if="isFontSelectionVisible"
      class="relative"
    >
      <ToolbarButton
        v-tooltip.bottom="$i18n('Text color')"
        v-click-outside="() => closeTextColorPicker()"
        :selected="isFormatButtonSelected('color')"
        :aria-label="$i18n('Text color')"
        name="font"
        :class="['relative', isContentSlideBeingEdited ? 'ml-2' : '']"
        icon="fas fa-font"
        :iconStyles="{ boxShadow: `inset 0px -2px 0px ${pickedColor}` }"
        @clicked="shouldShowTextColorPicker = !shouldShowTextColorPicker"
      />

      <ColorPicker
        v-if="shouldShowTextColorPicker"
        class="top-11"
        :class="{ 'w-80': isContentSlideBeingEdited, 'w-80': isQuestionSlideBeingEdited }"
        :colorGridSpacingClass="isContentSlideBeingEdited ? '' : 'gap-1'"
        :colorBoxSize="isContentSlideBeingEdited ? [30, 24] : [32, 32]"
        :numColumns="isContentSlideBeingEdited ? 10 : pickerColors.length"
        :areColorsSpaced="true"
        :colors="pickerColors"
        :hasAutomaticColor="true"
        :pickedColorReceived="pickedColor"
        @pickColor="onFontColorChange"
        @onAutomaticToggle="onAutomaticToggle"
      />
    </div>

    <div
      v-if="!isMobileMode"
      class="vertical-divider border border-light-10% rounded-2m ml-2"
    />

    <ToolbarButton
      v-tooltip.bottom="`${$i18n('Bold')} (Ctrl+B)`"
      :selected="isFormatButtonSelected('bold')"
      :aria-label="$i18n('Bold')"
      name="bold"
      icon="fas fa-bold"
      @clicked="onFormatButtonClicked('bold')"
    />
    <ToolbarButton
      v-tooltip.bottom="`${$i18n('Italic')} (Ctrl+I)`"
      :selected="isFormatButtonSelected('italic')"
      :aria-label="$i18n('Italic')"
      name="italic"
      class="ml-0.5"
      icon="fas fa-italic"
      @clicked="onFormatButtonClicked('italic')"
    />
    <ToolbarButton
      v-tooltip.bottom="`${$i18n('Underline')} (Ctrl+U)`"
      :selected="isFormatButtonSelected('underline')"
      :aria-label="$i18n('Underline')"
      name="underline"
      class="ml-0.5"
      icon="fas fa-underline"
      @clicked="onFormatButtonClicked('underline')"
    />
    <ToolbarButton
      v-tooltip.bottom="`${$i18n('Strikethrough')} (Ctrl+Shift+X)`"
      :selected="isFormatButtonSelected('strikethrough')"
      :aria-label="$i18n('Strikethrough')"
      name="strikethrough"
      class="ml-0.5"
      icon="fas fa-strikethrough"
      @clicked="onFormatButtonClicked('strikethrough')"
    />
    <ToolbarButton
      v-if="!isMultiSelect"
      v-tooltip.bottom="`${$i18n('Superscript')} (Ctrl+,)`"
      :selected="isFormatButtonSelected('superscript')"
      :aria-label="$i18n('Superscript')"
      name="superscript"
      class="ml-0.5"
      icon="fas fa-superscript"
      @clicked="onFormatButtonClicked('superscript')"
    />
    <ToolbarButton
      v-if="!isMultiSelect"
      v-tooltip.bottom="`${$i18n('Subscript')} (Ctrl+.)`"
      :selected="isFormatButtonSelected('subscript')"
      :aria-label="$i18n('Subscript')"
      name="subscript"
      class="ml-0.5"
      icon="fas fa-subscript"
      @clicked="onFormatButtonClicked('subscript')"
    />
    <ToolbarButton
      v-if="isContentSlideBeingEdited"
      v-tooltip.bottom="$i18n('Insert link')"
      :aria-label="$i18n('Insert link')"
      name="insert link"
      class="'ml-0.5'"
      icon="fas fa-link"
      @clicked="toggleLinkModal"
    />
    <div
      v-if="conditionallyShowSymbolPicker"
      v-click-outside="() => closeSymbolPicker()"
      class="relative"
    >
      <ToolbarButton
        ref="sigma-icon"
        v-tooltip.bottom="`${$i18n('Symbols')}`"
        :aria-label="$i18n('Symbols')"
        :selected="isFormatButtonSelected('symbol')"
        name="sigma"
        class="ml-0.5"
        icon="fas fa-sigma"
        @clicked="openSymbolPicker"
      />
      <SymbolPicker
        v-if="shouldShowSymbolPicker"
        target="sigma-icon"
        class="top-11"
        @closeSymbolPicker="closeSymbolPicker"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { ContentSlideColors, QuestionSlideColors } from '../config/SlideColors';
import { isSlideForQuestion } from '../utils/SlideUtils';

export default {

  props: {
    toolbarMode: {
      type: String,
      default: 'desktop',
      validate: (value) => ['mobile', 'desktop'].includes(value),
    },

    selectedFormatButtons: {
      type: Array,
      default: () => [],
    },
    selectedFont: {
      type: String,
      default: 'Quicksand',
    },
    selectedSize: {
      type: Number,
      default: 48,
    },

    isContentSlideBeingEdited: {
      type: Boolean,
      default: true,
    },
    isQuestionSlideBeingEdited: {
      type: Boolean,
      default: false,
    },
    isForQuestionEditor: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onFontSelected', 'onFontColorChange', 'onSizeSelected', 'onFormatButtonClicked'],

  data() {
    return {
      pickedColor: '',
      lastPickedColor: '',
      shouldShowTextColorPicker: false,
      shouldShowSymbolPicker: false,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['theme', 'isMultiSelect', 'currentSlide']),
    ...mapGetters('root', ['isDesktop']),

    isMobileMode() {
      return this.toolbarMode === 'mobile';
    },

    showSymbolEditor() {
      return isSlideForQuestion(this.currentSlide);
    },

    pickerColors() {
      if (this.isQuestionSlideBeingEdited) {
        return QuestionSlideColors;
      }

      return ContentSlideColors;
    },

    isFontSelectionVisible() {
      return this.toolbarMode === 'desktop';
    },

    conditionallyShowSymbolPicker() {
      return this.isDesktop && (this.isContentSlideBeingEdited || this.showSymbolEditor);
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.$eventBus.$on('slideElement:pickedColorUpdate', this.setColorPicker);
    });
  },

  beforeUnmount() {
    this.$eventBus.$off('slideElement:pickedColorUpdate', this.setColorPicker);
  },

  methods: {
    openSymbolPicker() {
      this.shouldShowSymbolPicker = !this.shouldShowSymbolPicker;
      this.$eventBus.$emit('slideEditorToolbar:toggleFontStyleToolbar', { value: this.shouldShowSymbolPicker });
    },

    onFontSelected(font) {
      this.$emit('onFontSelected', font);
      this.$refs.fontListDropdownHead.close();
    },
    setSelectedFont(font) {
      this.$refs.fontListDropdown?.setSelectedFont(font);
    },
    onFontColorChange(color) {
      this.pickedColor = color;
      this.$emit('onFontColorChange', color);
      this.shouldShowTextColorPicker = false;
    },

    onSizeSelected(size) {
      this.$emit('onSizeSelected', size);
      this.$refs.fontSizeDropdownHead.close();
    },

    onFormatButtonClicked(button) {
      this.$emit('onFormatButtonClicked', button);
    },

    isFormatButtonSelected(button) {
      return this.selectedFormatButtons.includes(button);
    },

    closeTextColorPicker() {
      this.shouldShowTextColorPicker = false;
    },
    onAutomaticToggle(checked) {
      if (checked) {
        this.lastPickedColor = this.pickedColor;
        if (!this.pickedColor) {
          this.lastPickedColor = this.theme.fontColor.text;
        }
        this.pickedColor = '';
        this.onFontColorChange(this.pickedColor);
      } else {
        this.pickedColor = this.lastPickedColor;
        this.lastPickedColor = '';
        this.onFontColorChange(this.pickedColor);
      }
    },

    toggleLinkModal() {
      if (this.isForQuestionEditor || this.isQuestionSlideBeingEdited) {
        return this.$eventBus.$emit('questionEditor:link', { command: 'edit-link' });
      }

      this.$eventBus.$emit('slideElement:link', { command: 'edit-link' });
    },

    closeSymbolPicker() {
      this.shouldShowSymbolPicker = false;

      this.$eventBus.$emit('slideEditorToolbar:toggleFontStyleToolbar', { value: this.shouldShowSymbolPicker });
    },

    setColorPicker(color) {
      this.pickedColor = color;
    },
  },
};
</script>

<style lang="scss" scoped>
.vertical-divider {
  height: calc(100% - 16px);
}
</style>

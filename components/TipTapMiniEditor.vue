<template>
  <div
    ref="tiptapContainer"
    class="tiptap-mini flex flex-col justify-center "
    :class="[theme, { 'when-text-overflows': isTextOverflowing, 'read-only': readOnlyMode }]"
    :style="containerStyles"
    :aria-label="$i18n('Answer Explanation')"
    @mousedown="onMouseDown"
    @click="onContainerClick"
  >
    <editor-content
      :id="editorId"
      :editor="editor"
    />
  </div>
</template>

<!-- eslint-disable import/no-named-as-default -->

<script>
import { mapGetters, mapActions } from 'vuex';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import isEqual from 'lodash/isEqual';

import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';

import { Plugin, PluginKey } from 'prosemirror-state';

import { DOMParser } from 'prosemirror-model';

import FontColor from '../extensions/tiptap-fontcolor';
import Subscript from '../extensions/tiptap-subscript';
import Superscript from '../extensions/tiptap-superscript';
import Katex from '../extensions/tiptap-katex';
import Blank from '../extensions/tiptap-blank';
import { FocusClasses } from '../extensions/tiptap-focus';
import i18n from '../services/i18n';
import { QuestionSlideColors } from '../config/SlideColors';
import { appendUsingMouseClassToBody } from '../services/FocusRingsService';
import { hexToRGB, extractRGBAComponents } from '../services/ColorService';
import { deselectAllText } from '../utils/Utilities';

export const INITIAL_TIP_TAP_VALUE = '<p></p>';
export const DirectionsToResizeAgainst = {
  BOTH: 'both',
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

export default {
  components: {
    EditorContent,
  },
  emits: ['keydown', 'ready', 'focus', 'blur', 'error', 'input'],

  props: {
    charLimit: {
      type: Number,
      default: 0,
    },
    value: {
      type: Object,
      required: true,
      validator: (val) => isString(val.text) && isBoolean(val.isEmpty) && isBoolean(val.isFocused),
    },

    editorId: {
      type: String,
      required: true,
    },

    disableLinks: {
      type: Boolean,
      default: false,
    },

    theme: {
      type: String,
      default: '',
    },

    showErrorForCharLimit: {
      type: Boolean,
      default: false,
    },

    placeholder: {
      type: String,
      default: i18n('Type text here...'),
    },

    autoResizeFontJumps: {
      type: Array,
      default: () => ([]),
    },

    directionToResizeAgainst: {
      type: String,
      default: DirectionsToResizeAgainst.BOTH,
    },

    debounceUpdatesAfterTime: {
      type: Number,
      default: 500,
    },

    readOnlyMode: {
      type: Boolean,
      default: false,
    },

    disableNewLineOnEnter: {
      type: Boolean,
      default: false,
    },

    isBlankEnabled: {
      type: Boolean,
      default: false,
    },

    disableBlankShortcut: {
      type: Boolean,
      default: false,
    },

    shouldEmitEventOnFocus: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      editor: null,
      resizeFontJumpIndex: -1,
      isTextOverflowing: false,
      resizeDimensionValue: 0,

      replaceBlankTimer: null,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentlyFocusedTiptapEditor', 'lastFocusedTiptapEditor', 'isFocusedTiptapEditorForQuestion']),
    ...mapGetters('contentEditor', ['isEditorForQuizContent', 'isEditorForPresentationContent']),
    ...mapGetters('root', ['isDesktop']),

    isDesktopView() {
      return this.isDesktop || this.isEditorForPresentationContent;
    },

    canAutoAdjustFontSize() {
      return !isEmpty(this.autoResizeFontJumps);
    },

    containerStyles() {
      const styles = {};
      const fontSize = this.autoResizeFontJumps[this.resizeFontJumpIndex];

      if (isNumber(fontSize) && fontSize > 0) {
        if (this.isEmpty() && !this.isDesktopView) {
          return;
        }
        styles['font-size'] = `${fontSize}px`;
      }

      return styles;
    },

    textValue() {
      return this.value.text;
    },
  },

  watch: {
    textValue(newVal, oldVal) {
      if (this.getHTML() !== newVal) {
        this.editor.commands.setContent(newVal, false);
      }
    },
  },

  created() {
    this.autoAdjustFontSizeDebounced = debounce(this.recursivelyAutoAdjustFontSize, 200, { leading: true });

    if (this.debounceUpdatesAfterTime > 0) {
      this.onTipTapUpdateDebounced = debounce(this.onTipTapUpdate, this.debounceUpdatesAfterTime, { leading: true, trailing: true });
    }

    if (this.canAutoAdjustFontSize) {
      this.resizeFontJumpIndex = 0;
    }

    this.initializeEditor();

    this.$eventBus.$on('slideElement:toggle', this.handleToggleEvent);
    this.$eventBus.$on('questionEditor:link', this.handleLinkEvents);
    this.$eventBus.$on('questionEditor:insertMath', this.handleInsertMath);
    this.$eventBus.$on('questionEditor:closeMathEditor', this.handleCloseMathEditor);
    this.$eventBus.$on('questionElement:setFontColor', this.handleSetFontColor);
    this.$eventBus.$on('slideElement:addSlideSymbol', this.handleAddSymbol);
  },

  mounted() {
    setTimeout(() => {
      if (!this.isEmpty() && this.canAutoAdjustFontSize) {
        this.recursivelyAutoAdjustFontSize();
      }

      if (this.readOnlyMode) {
        this.editor.setEditable(false);
      }
    }, 100);

    this.addTipTapRef(this);
  },

  beforeUnmount() {
    this.$eventBus.$off('slideElement:toggle', this.handleToggleEvent);
    this.$eventBus.$off('questionEditor:insertMath', this.handleInsertMath);
    this.$eventBus.$off('questionEditor:closeMathEditor', this.handleCloseMathEditor);
    this.$eventBus.$off('questionElement:setFontColor', this.handleSetFontColor);
    this.$eventBus.$off('slideElement:addSlideSymbol', this.handleAddSymbol);
    this.$eventBus.$off('questionEditor:link', this.handleLinkEvents);

    if (this.replaceBlankTimer) {
      clearTimeout(this.replaceBlankTimer);
    }

    this.removeTipTapRef(this);

    this.editor.destroy();
  },

  methods: {

    ...mapActions({
      setFocusedTipTapRef: 'contentEditor/setFocusedTipTapRef',
      addTipTapRef: 'contentEditor/addTipTapRef',
      removeTipTapRef: 'contentEditor/removeTipTapRef',
    }),

    stopMouseDownPropagation(event) {
      event.stopPropagation();
      appendUsingMouseClassToBody(window);
    },

    initializeEditor() {
      const extensions = [
        StarterKit,
        Underline,
        Placeholder.configure({
          placeholder: this.placeholder,
        }),
        FontColor,
        Subscript,
        Superscript,
        Katex,
        TextStyle,
        Extension.create({
          name: 'eventHandler',

          addProseMirrorPlugins: () => [
            new Plugin({
              key: new PluginKey('eventHandler'),
              props: {
                handleKeyDown: (_, event) => {
                  this.$emit('keydown', event);

                  if (this.disableNewLineOnEnter) {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      return true;
                    }
                    return false;
                  }
                },
                handleClick(view, pos, event) { /* … */ },
                handleDoubleClick(view, pos, event) { /* … */ },
                transformPastedHTML: (text) =>
                // removes all formatting from pasted text

                  text.replace(/style="[^"]*"/g, '')
                ,
              },
            }),
          ],
        }),
      ];

      if (this.isBlankEnabled) {
        extensions.push(FocusClasses);
        extensions.push(Blank.extend({
          addProseMirrorPlugins: () => [
            new Plugin({
              key: new PluginKey('blank-interactions-handler'),
              props: {
                transformPastedHTML: (html, view) => html.replace(/<blank.*?<\/blank>/g, ''),
                handleKeyDown: debounce((view, event) => {
                  if (this.disableBlankShortcut) {
                    return;
                  }

                  // handles inserting blank when consecutive underscores are added
                  if (event.key !== '_') {
                    return;
                  }

                  const activeNodeHead = view.state.selection.$head;

                  if (activeNodeHead.parent.type.name === 'blank') {
                    return;
                  }

                  if (activeNodeHead.nodeBefore?.textContent?.slice(-1) === '_' && event.key === '_') {
                    this.replaceBlankTimer = setTimeout(() => {
                      const lengthOfUnderscores = activeNodeHead.nodeBefore.textContent.length - activeNodeHead.nodeBefore.textContent.indexOf('_');
                      if (lengthOfUnderscores <= 1) {
                        return;
                      }
                      this.editor.commands.setTextSelection({ from: view.state.selection.$anchor.pos - lengthOfUnderscores, to: view.state.selection.$anchor.pos });
                      this.insertBlank(true);
                    }, 50);
                  }
                }, 200),
              },
            }),
          ],
        }));
      }

      if (this.charLimit) {
        extensions.push(CharacterCount.configure({
          limit: this.charLimit || null,
        }));
      }

      if (!this.disableLinks) {
        extensions.push(Link.configure({
          autolink: true,
          openOnClick: false,
          HTMLAttributes: {
            class: 'link-style',
          },
        }));
      }

      this.editor = new Editor({
        content: this.value.text,
        extensions,

        onFocus: this.onTipTapFocus.bind(this),
        onBlur: this.onTipTapBlur.bind(this),
        onUpdate: this.onTipTapUpdateDebounced.bind(this),
        onSelectionUpdate: this.onTipTapSelectionUpdate.bind(this),

        parseOptions: {
          preserveWhitespace: 'full',
        },
      });

      this.updateValue();
      this.$emit('ready');
    },

    isActive(item, value) {
      return this.editor.isActive(item, value);
    },

    isEmpty() {
      if (isBoolean(this.editor.isEmpty)) {
        return this.editor.isEmpty;
      }

      return isFunction(this.editor.isEmpty) ? this.editor.isEmpty() : false;
    },

    isFocused() {
      if (isBoolean(this.editor.isFocused)) {
        return this.editor.isFocused;
      }

      return isFunction(this.editor.isFocused) ? this.editor.isFocused() : false;
    },

    insertContent(value) {
      this.editor.commands.insertContent(value);
    },
    toggleBold() {
      this.editor.chain().focus().toggleBold().run();
    },
    toggleItalic() {
      this.editor.chain().focus().toggleItalic().run();
    },
    toggleUnderline() {
      this.editor.chain().focus().toggleUnderline().run();
    },
    toggleStrike() {
      this.editor.chain().focus().toggleStrike().run();
    },
    setFontColor(color) {
      this.editor.chain().focus().setFontColor(color).run();
    },
    toggleSubscript() {
      this.editor.chain().focus().toggleSubscript().run();
    },
    toggleSuperscript() {
      this.editor.chain().focus().toggleSuperscript().run();
    },
    unsetSuperscript() {
      this.editor.chain().focus().unsetSuperscript().run();
    },
    unsetSubscript() {
      this.editor.chain().focus().unsetSubscript().run();
    },

    setTextAlign(align) {
      this.editor.chain().focus().setTextAlign(align).run();
    },

    getHTML() {
      return this.editor.getHTML();
    },

    focus() {
      this.setFocusedTipTapRef(this);
      this.editor.commands.focus('end');
    },

    blur() {
      this.editor.commands.blur();
    },

    deselect() {
      deselectAllText();
    },

    onMouseDown(event) {
      this.stopMouseDownPropagation(event);
    },

    onContainerClick() {
      if (this.isFocused()) {
        return;
      }

      this.focus();
    },

    onTipTapFocus() {
      this.$emit('focus', this);
      this.onTipTapSelectionUpdate();

      if (this.shouldEmitEventOnFocus) {
        this.updateValue();
      }
      this.focus();
    },

    onTipTapBlur() {
      /**
       * Need to set scroll back on top as when the keypad on mobile and tablet open, they push the content up
       */
      if (!this.isDesktopView) {
        const body = document.querySelector('body');
        this.$scrollTo(body, 0);
      }

      this.$emit('blur', this);
      this.updateValue();
      this.deselect();
    },

    onTipTapUpdate() {
      this.updateValue(true);

      this.$nextTick(() => {
        this.autoAdjustFontSizeDebounced();
      });
    },

    updateValue(didTextChange = false) {
      if (this.showErrorForCharLimit && this.charLimit) {
        const chars = this.editor.storage.characterCount.characters();
        this.$emit('error', {
          charLimit: this.hasCharLimitErrorReached = chars === this.charLimit,
        });
      }
      this.$emit('input', {
        ...this.value,
        text: this.getHTML(),
        isEmpty: this.isEmpty(),
        isFocused: this.isFocused(),
        didTextChange,
      });
    },

    autoAdjustFontSize(isInRecursion = false) {
      const result = this.evaluateTextOverflowAbility();
      const isTextOverflowingNow = result.isOverflowing;
      const canTextShrinkMore = this.resizeFontJumpIndex < (this.autoResizeFontJumps.length - 1);
      const canTextGrowMore = this.resizeFontJumpIndex > 0;

      const doesFontSizeNeedToGrow = (
        (result.dimensionValue < this.resizeDimensionValue)
        && !isTextOverflowingNow
        && canTextGrowMore
        && !isInRecursion
      );

      const doesFontSizeNeedToShrink = (
        isTextOverflowingNow && canTextShrinkMore
      );

      this.resizeDimensionValue = result.dimensionValue;
      this.isTextOverflowing = isTextOverflowingNow;

      if (!doesFontSizeNeedToGrow && !doesFontSizeNeedToShrink) {
        return false;
      }

      if (doesFontSizeNeedToGrow) {
        this.resizeFontJumpIndex = 0;

        return true;
      }

      this.resizeFontJumpIndex += 1;

      return true;
    },

    recursivelyAutoAdjustFontSize(isInRecursion = false) {
      const didAdjust = this.autoAdjustFontSize(isInRecursion);

      if (didAdjust === false) {
        return;
      }

      setTimeout(this.recursivelyAutoAdjustFontSize.bind(this, true));
    },

    evaluateTextOverflowAbility() {
      const element = this.$refs.tiptapContainer;

      if (!element) {
        return { isOverflowing: false, dimensionValue: 0 };
      }

      const editorContentElement = element.querySelector('.ProseMirror');

      if (!editorContentElement) {
        return { isOverflowing: false, dimensionValue: 0 };
      }

      if (this.directionToResizeAgainst === DirectionsToResizeAgainst.VERTICAL) {
        return {
          isOverflowing: editorContentElement.scrollHeight > element.clientHeight,
          dimensionValue: editorContentElement.scrollHeight,
        };
      }

      if (this.directionToResizeAgainst === DirectionsToResizeAgainst.HORIZONTAL) {
        return {
          isOverflowing: editorContentElement.scrollWidth > element.clientWidth,
          dimensionValue: editorContentElement.scrollWidth,
        };
      }

      const dimensionValue = editorContentElement.scrollHeight * editorContentElement.scrollWidth;
      const isOverflowing = (
        editorContentElement.scrollHeight > element.clientHeight
        || editorContentElement.scrollWidth > element.clientWidth
      );

      return { isOverflowing, dimensionValue };
    },

    handleToggleEvent(command) {
      if (!this.isFocusedTiptapEditorForQuestion(this.currentlyFocusedTiptapEditor) && !this.isFocusedTiptapEditorForQuestion(this.lastFocusedTiptapEditor)) {
        return;
      }

      const elementInFocus = this.currentlyFocusedTiptapEditor.id || this.lastFocusedTiptapEditor.id || '';

      if (elementInFocus !== this.editorId) {
        return;
      }

      switch (command) {
        case 'bold':
          this.toggleBold();
          break;
        case 'italic':
          this.toggleItalic();
          break;
        case 'underline':
          this.toggleUnderline();
          break;
        case 'strike':
          this.toggleStrike();
          break;
        case 'subscript':
          this.toggleSubscript();
          this.unsetSuperscript();
          break;
        case 'superscript':
          this.toggleSuperscript();
          this.unsetSubscript();
          break;
        default:
      }

      this.onTipTapSelectionUpdate();
    },

    handleInsertMath({ elementId, latex }) {
      if (elementId === this.editorId) {
        this.insertContent(`<Katex latex="${latex}"></Katex>`);
        this.focus();
      }
    },

    handleCloseMathEditor({ elementId }) {
      if (elementId === this.editorId) {
        this.focus();
      }
    },

    handleSetFontColor({ elementId, color }) {
      if (elementId === this.editorId) {
        const colorComponents = extractRGBAComponents(color);
        const isColorWhite = isEqual(colorComponents, {
          r: 255, g: 255, b: 255, opacity: 1,
        });

        if (isColorWhite) {
          this.setFontColor(null);
        } else {
          this.setFontColor(color);
        }

        this.onTipTapSelectionUpdate();
      }
    },

    onTipTapSelectionUpdate() {
      const state = [];

      if (this.isActive('bold')) {
        state.push('bold');
      }
      if (this.isActive('italic')) {
        state.push('italic');
      }
      if (this.isActive('underline')) {
        state.push('underline');
      }
      if (this.isActive('strike')) {
        state.push('strikethrough');
      }
      if (this.isActive('subscript')) {
        state.push('subscript');
      }
      if (this.isActive('superscript')) {
        state.push('superscript');
      }

      const whiteSlideColor = QuestionSlideColors.find((val) => val.name === 'White');
      let activeFontColor = !isEmpty(whiteSlideColor) ? whiteSlideColor.value : '';

      for (const color of QuestionSlideColors) {
        if (this.isActive('textStyle', { fontColor: hexToRGB(color.value) })) {
          activeFontColor = color.value;
        }
      }

      this.$eventBus.$emit('slideElement:pickedColorUpdate', activeFontColor || '');

      this.$eventBus.$emit('slideElement:selectionUpdate', state);
    },

    handleLinkEvents({ command, link }) {
      if (!this.isFocusedTiptapEditorForQuestion(this.currentlyFocusedTiptapEditor) && !this.isFocusedTiptapEditorForQuestion(this.lastFocusedTiptapEditor)) {
        return;
      }

      const elementInFocus = this.currentlyFocusedTiptapEditor.id || this.lastFocusedTiptapEditor.id || '';

      if (elementInFocus !== this.editorId) {
        return;
      }

      switch (command) {
        case 'edit-link':
          this.$eventBus.$emit('makeLinkModal:toggle', this.editor.getAttributes('link').href);
          break;
        case 'set-link':
          this.setLink(link);
          break;
        case 'unset-link':
          this.editor.commands.unsetLink();
          break;
        default:
          break;
      }
    },

    setLink(link) {
      const fromRange = get(this.editor, 'view.state.selection.ranges[0].$from.pos', null);
      let toRange = get(this.editor, 'view.state.selection.ranges[0].$to.pos', null);

      // Breaks the URL on spaces
      if (fromRange === toRange) {
        const transaction = this.editor.state.tr.insertText(link);
        this.editor.view.dispatch(transaction);
        this.editor.commands.setTextSelection({ from: toRange, to: link.length + toRange });
        this.editor.commands.toggleLink({ href: link, target: '_blank' });
        toRange += link.length;
      } else {
        this.editor.commands.toggleLink({ href: link, target: '_blank' });
      }
      if (toRange !== null) {
        this.editor.commands.setTextSelection(toRange);
        this.editor.commands.unsetLink();
      }
    },

    elementFromString(value) {
      const element = document.createElement('div');
      element.innerHTML = value.trim();

      return element;
    },

    insertBlank(viaShortcut = false) {
      const currentNode = this.editor.view.state.selection.$head.parent.type.name;

      if (currentNode === 'blank') {
        this.editor.commands.deleteNode();
      }

      const { selection } = this.editor.state;
      const { $from, $to, empty } = selection;

      const activeNodeHead = selection.$head;

      // move the cursor to the end when blank is added inside a blank
      if (activeNodeHead.parent.type.name === 'blank') {
        this.editor.commands.focus('end');
      }

      const text = this.editor.state.doc.textBetween($from.pos, $to.pos, '&ZeroWidthSpace;');

      if (empty || viaShortcut || !text?.trim()) {
        this.editor.chain().focus().addBlank().run();
        return;
      }

      this.editor.chain().focus().addBlank(text).run();
    },

    /*
      insertHTML is a polyfill for inserting HTML in tipTapEditor.
      This is used for inserting emojis in the editor.
    */
    insertHTML(value) {
      const { selection } = this.editor.state;
      const element = this.elementFromString(value);
      const slice = DOMParser.fromSchema(this.editor.state.schema).parseSlice(element);
      const transaction = this.editor.state.tr.insert(selection.anchor, slice.content);

      this.editor.view.dispatch(transaction);
    },

    handleAddSymbol({ elementId, code }) {
      if (elementId === this.editorId) {
        const regex = /&amp;#x/g;
        const replacedCode = code.replace(regex, '&#x');
        this.insertHTML(replacedCode);
      }
    },
  },
};
</script>

<style lang="scss">
// The below line is needed for safari let editing inside content editable elements
[contenteditable] {
  -webkit-user-select: text;
  user-select: text;
}

.tiptap-mini {
  max-width: 1138px;
  cursor: text;

  .ProseMirror {
    outline: none;
    u {
      text-decoration-line: underline;
      * {
        text-decoration-line: underline;
      }
    }

    /* Placeholder (at the top) */
    > .is-editor-empty {
      &:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: rgba(#FFF, 0.5);
        pointer-events: none;
        height: 0;
        font-size: inherit;
        text-align: inherit;
        width: 100%;
      }
    }

    &.ProseMirror-focused {
      box-shadow: none !important;
      [data-node-view-wrapper] {
        &:not(&.katex-wrapper) {
          border: 1px solid black;
        }
      }

      .katex-el {
        padding: 0.5rem;
        border: 1px dashed transparent;
        border-radius: 8px;
        position: relative;
        border-color: rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);

        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  &.read-only {
    pointer-events: none;
  }

  &.light-theme {
    .ProseMirror {
      > .is-editor-empty {
        &:first-child::before {
            color: #B6B6B6;
        }
      }
    }
  }

  &.when-text-overflows {
    justify-content: flex-start;
  }

  .mathquill-wrapper {
    .mathquill {
      border: none;
      font-size: 20px;

      &.mq-focused {
        box-shadow: none;
      }
    }
  }
}
</style>

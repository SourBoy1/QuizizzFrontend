<template>
  <div>
    <section
      class="flex flex-col justify-start mb-6"
      @click="editorInputClickHandler"
    >
      <h2 class="mb-1 text-xs text-dark-4">
        <i18n> Preview </i18n>
      </h2>

      <!-- Custom class so that we can override mathquill styles !-->
      <div class="flex items-center w-full py-8 pl-3 pr-2 border border-solid rounded-md border-dark-6 mathquill-wrapper">
        <div
          ref="MQWrapper"
          class="w-11/12 mathquill"
          @keydown.stop="onInputKeydown"
        />
      </div>
    </section>

    <section
      class="flex flex-col"
      @click="editorInputClickHandler"
    >
      <ul
        class="flex flex-row list-none"
        role="tablist"
      >
        <li
          v-for="section in keypadSections"
          ref="section-tabs"
          :key="section.key"
          :aria-selected="selectedKeypadSection === section.key ? 'true' : 'false'"
          role="tab"
          :class="['capitalize w-fit mr-10 py-2 justify-center flex font-semibold cursor-pointer text-dark-4', { 'text-lilac': isKeypadSectionSelected(section.key) }]"
          @click="navigateToKeypadSection(section.key)"
        >
          {{ section.text }}
        </li>
      </ul>
      <div
        ref="slider"
        :class="['list-item-underline h-1 bg-lilac', selectedKeypadSection]"
      />

      <section
        ref="keypadContainer"
        class="flex flex-row h-64 my-2 overflow-y-auto keypad-container"
      >
        <div
          ref="keypadGroups"
          class="flex flex-row w-full h-full p-3 pr-12 overflow-auto bg-light-2 rounded-2xl"
          @scroll="onKeypadGroupsScroll"
        >
          <section
            v-for="(keypadGroup, groupName) in LatexSymbols"
            :ref="groupName"
            :key="groupName"
            class="flex shrink-0"
          >
            <div
              v-for="(subGroup, subGroupName) in keypadGroup"
              :key="subGroupName"
              :class="['grid', `grid-cols-${subGroup.gridCols}`, 'mr-8 shrink-0 gap-1 items-center']"
            >
              <Button
                v-for="(symbol, index) in subGroup.keys"
                :key="`${groupName}-${subGroupName}-${index}`"
                type="other"
                :title="symbol.label"
                :style="(symbol.fontSize ? { 'font-size': `${symbol.fontSize}px` } : '')"
                class="flex items-center justify-center w-8 h-8 key shrink-0"
                @click="handleKeyClick(symbol)"
              />
            </div>
          </section>
        </div>
      </section>
    </section>

    <template
      v-if="shouldShowTip"
      slot="footer-text"
    >
      <div class="flex items-center gap-x-2 mr-auto text-xxs">
        <FA
          icon="far fa-question-circle"
          :size="11"
        />
        <span class="inline font-semibold"><i18n>Tip</i18n>:</span>
        <!-- Using v-html here on predefined strings !-->
        <div
          class="inline-flex items-center"
          v-html="MQTips[tipIndex]"
        />
      </div>
    </template>
  </div>
</template>

<script>

/**
 * !!IMPORTANT!!
 *
 * This component can ONLY be used in a <client-only> tag which disables ssr for the component
 * This is because MathQuill depends on jQuery which only works in a browser environment due to
 * dependencies on `window` and `document` objects and browser APIs.
 *
 * Nuxt will still throw warnings (in the NodeJS console) for this (if the component is **directly**
 * included, instead of being triggered through a modal ) even after including it in a <no-client>
 * component, since it still executes the component and only skips the rendering on the server side.
 *
 * To avoid this, always load this component asynchronously through  loading (either this component or its parent should be lazy loaded)
 */
import isNumber from 'lodash/isNumber';

import MathQuillService, { LatexSymbols, MathQuillTips } from '~/services/MathQuillService';
import i18n from '~/services/i18n';

import QLogger from '~/services/QLogger';

export default {

  props: {
    initialLatex: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['mounted', 'done', 'close'],

  data() {
    return {
      mathQuillPackage: null,
      latex: '',
      MQTips: MathQuillTips,

      /** @type {MathQuillService()} */
      MQ: null,

      insertButton: {
        type: 'primary',
        title: i18n('Insert'),
      },
      i18n,
      keypadSections: {
        BASIC: {
          key: 'basic',
          text: i18n('Basic'),
          scrollLeft: 400,
        },

        GREEK: {
          key: 'greek',
          text: i18n('Greek'),
          scrollLeft: 800,
        },

        ADVANCED: {
          key: 'advanced',
          text: i18n('Advanced'),
          scrollLeft: 1200,
        },
      },

      LatexSymbols,
      selectedKeypadSection: null,
      showTip: false,
      tipIndex: -1,
      focusTimer: null,
    };
  },

  computed: {
    shouldShowTip() {
      return (this.tipIndex !== -1);
    },

    basicSectionLeftEdge() {
      if (!this.MQ) {
        return 0;
      }

      const basicSection = this.$refs[this.keypadSections.BASIC.key];
      // TODO: Remove the hardcoded padding value, calculate it automatically
      return basicSection[0].offsetLeft - 36;
    },

    greekSectionLeftEdge() {
      if (!this.MQ) {
        return 0;
      }

      const greekSection = this.$refs[this.keypadSections.GREEK.key];
      const leftSectionsWithSpaces = Object.keys(this.LatexSymbols[this.keypadSections.BASIC.key]).length;

      // we subtract the total padding between the grids from the left offset of the current section to get the true scroll from the left edge
      return (greekSection[0].offsetLeft - (36 * (leftSectionsWithSpaces - 1)));
    },

    advancedSectionLeftEdge() {
      if (!this.MQ) {
        return 0;
      }

      const advancedSection = this.$refs[this.keypadSections.ADVANCED.key];
      const leftSectionsWithSpaces = Object.keys(this.LatexSymbols[this.keypadSections.BASIC.key]).length + Object.keys(this.LatexSymbols[this.keypadSections.GREEK.key]).length;

      // we subtract the total padding between the grids from the left offset of the current section to get the true scroll from the left edge
      return (advancedSection[0].offsetLeft - (36 * (leftSectionsWithSpaces - 1)));
    },
  },

  watch: {
    selectedKeypadSection(newVal) {
      // store all three tabs in section-tabs ref
      const sectionTabsRef = this.$refs['section-tabs'];
      let tranformVal = 0;
      const basicTabWidth = sectionTabsRef[0]?.clientWidth;
      const greekTabWidth = sectionTabsRef[1]?.clientWidth;
      const advancedTabWidth = sectionTabsRef[2]?.clientWidth;
      if (!this.$refs?.slider) {
        return;
      }
      if (newVal === this.keypadSections.BASIC.key) {
        this.$refs.slider.style.width = `${basicTabWidth}px`;
        this.$refs.slider.style.transform = `translateX(${tranformVal}px)`;
      } else if (newVal === this.keypadSections.GREEK.key) {
        // calculate the width of the tab and transform the slider to the right with the width of the tab + margin
        this.$refs.slider.style.width = `${greekTabWidth}px`;
        tranformVal = basicTabWidth + 40;
        this.$refs.slider.style.transform = `translateX(${tranformVal}px)`;
      } else {
        this.$refs.slider.style.width = `${advancedTabWidth}px`;
        tranformVal = basicTabWidth + greekTabWidth + 80;
        this.$refs.slider.style.transform = `translateX(${tranformVal}px)`;
      }
    },
  },

  async mounted() {
    this.mathQuillPackage = (await import('mathquill')).default;
    this.$nextTick().then(() => {
      this.mathQuillPackage && this.checkAndInitMathQuill();
    });

    this.selectedKeypadSection = this.keypadSections.BASIC.key;
    this.$eventBus.$on('mathQuill:submitLatex', this.handleLatexSubmit);
    this.$eventBus.$on('mathEditorModal:insertButtonClicked', this.handleInsertBtnClick);
    this.$emit('mounted');
  },

  beforeUnmount() {
    this.$eventBus.$off('mathQuill:submitLatex', this.handleLatexSubmit);
    this.$eventBus.$off('mathEditorModal:insertButtonClicked', this.handleInsertBtnClick);
    this.focusTimer && clearTimeout(this.focusTimer);
  },

  methods: {
    handleLatexSubmit(latex) {
      this.$emit('done', latex);
      this.$emit('close');
    },

    handleInsertBtnClick() {
      this.MQ?.done();
    },

    onInputKeydown(ev) {
      // disable direct keyboard inputs
      ev.preventDefault();
      ev.stopImmediatePropagation();
      switch (ev.key) {
        case 'Backspace':
          this.MQ.triggerKeystroke('Backspace');
          return;
        case 'ArrowLeft':
          this.MQ.triggerKeystroke('Left');
          return;
        case 'ArrowRight':
          this.MQ.triggerKeystroke('Right');
          return;
        case 'ArrowUp':
          this.MQ.triggerKeystroke('Up');
          return;
        case 'ArrowDown':
          this.MQ.triggerKeystroke('Down');
          return;
        default:
          break;
      }
      // check if any alphanumeric key or operator is pressed
      this.handleAlphaNumericOrOperatorKeypress(ev);

      this.MQ.onInputKeydown(ev);
      if (ev.which === 13) {
        ev.preventDefault();
      }
      this.MQ.focus();
    },

    handleAlphaNumericOrOperatorKeypress(ev) {
      // ignore meta/other keys which do not add any character input
      const specialKeys = ['Shift', 'Meta', 'Alt', 'Tab', 'Control', 'CapsLock', 'Enter', 'Dead'];
      if (!(specialKeys.includes(ev.key))) {
        const keyCode = ev.key.charCodeAt(0);
        // following operators do not have special latex, text works as direct latex handle
        // operators                     [!   @   +   -   .   \   `   :  ;   <   =   >   ?   @]
        const operatorsWithDirectLatex = [33, 35, 43, 45, 46, 92, 96, 58, 59, 60, 61, 62, 63, 64];
        const specialOperatorCharacters = {
          42: '\\times', // *
          126: '\\sim', // ~
        };
        // typed text operands
        const specialCharactersTypedText = {
          32: { typedText: ' ' }, // [ ]
          40: { typedText: '(' }, // [(]
          41: { typedText: ')' }, // [)]
          47: { typedText: '/', tip: 2 }, // [/]
          91: { typedText: '[' }, // [[]
          93: { typedText: ']' }, // []]
          94: { typedText: '^', tip: 0 }, // [^]
          95: { typedText: '_', tip: 1 }, // [_]
          123: { typedText: '{' }, // [{]
          125: { typedText: '}' }, // [}]
        };

        // characters
        if ((keyCode >= 65 && keyCode <= 90) // [A-Z]
          || (keyCode >= 97 && keyCode <= 122) // [a-z]
          || (keyCode >= 48 && keyCode <= 57) // [0-9]
          || operatorsWithDirectLatex.includes(keyCode)
        ) {
          this.MQ.writeLatex(String.fromCharCode(keyCode))?.focus();
        }

        if (specialOperatorCharacters[keyCode]) {
          this.MQ.writeLatex(specialOperatorCharacters[keyCode])?.focus();
        }

        // operators which work with typedText
        if (specialCharactersTypedText[keyCode]) {
          const handler = specialCharactersTypedText[keyCode];
          this.MQ.typeText(handler?.typedText).focus();
          this.tipIndex = handler?.tip ?? 0;
        }
      }
    },

    onKeypadGroupsScroll(ev) {
      const { scrollLeft } = ev.target;

      if (scrollLeft < this.greekSectionLeftEdge) {
        this.selectedKeypadSection = this.keypadSections.BASIC.key;
      } else if (scrollLeft + 20 < this.advancedSectionLeftEdge) {
        this.selectedKeypadSection = this.keypadSections.GREEK.key;
      } else {
        this.selectedKeypadSection = this.keypadSections.ADVANCED.key;
      }
    },

    isKeypadSectionSelected(sectionName) {
      const { keypadGroups } = this.$refs;

      if (!keypadGroups) {
        if (sectionName === this.keypadSections.BASIC.key) {
          return true;
        }

        return false;
      }

      return (this.selectedKeypadSection === sectionName);
    },

    navigateToKeypadSection(sectionName) {
      const { keypadGroups } = this.$refs;
      if (!keypadGroups) {
        return;
      }

      let scroll = 0;
      const currentScroll = keypadGroups.scrollLeft;

      // hardcoding the scroll values here for better accuracy when clicking the nav tabs
      switch (sectionName) {
        case this.keypadSections.BASIC.key:
          scroll = 0;
          break;
        case this.keypadSections.GREEK.key:
          scroll = 440;
          break;
        case this.keypadSections.ADVANCED.key:
          scroll = 1120;
          break;
        default:
      }

      // don't need to do anything when we're already at the required scroll
      if (scroll === currentScroll) {
        return;
      }

      if (currentScroll > scroll) {
        // go backwards, if we are scrolled to the right of the required section
        scroll -= currentScroll;
      }

      keypadGroups.scrollBy({
        left: scroll,
        behavior: 'smooth',
      });

      this.MQ.focus();
    },

    checkAndInitMathQuill() {
      if (!this.MQ && this.$refs.MQWrapper) {
        this.initMathQuill();
      }
    },

    initMathQuill() {
      if (!this.mathQuillPackage) {
        return;
      }

      if (!this.$refs.MQWrapper) {
        QLogger.error('MQWrapper $ref not found');
        return;
      }

      const { MQWrapper } = this.$refs;

      this.MQ = new MathQuillService(this.mathQuillPackage);
      this.MQ
        .initEditableMathField(MQWrapper, {
          substituteTextArea: () => document.createElement('textarea'),
        })
        .focus();

      if (this.initialLatex) {
        this.latex = this.initialLatex;
      }

      if (this.latex) {
        this.MQ.writeLatex(this.latex).focus();
      }

      setTimeout(() => {
        this.initKeypads();
      });

      // Bring the cursor inside editable field after init
      this.focusTimer = setTimeout(() => {
        this.MQ.focus();
      }, 500);
    },

    initKeypads() {
      const keyButtons = this.$el.querySelectorAll('.key');

      keyButtons.forEach((key) => {
        this.MQ.parseAndDisplayMath(key);
      });
    },

    handleKeyClick(symbol) {
      if (isNumber(symbol.tip)) {
        this.tipIndex = symbol.tip;
      } else {
        this.tipIndex = -1;
      }
      if (symbol.typedText) {
        const typedText = symbol.typedText.split(',');
        typedText.forEach((text) => {
          if (['Right', 'Left'].includes(text)) {
            this.MQ.triggerKeystroke(text);
          } else {
            this.MQ.typeText(text)
              .focus();
          }
        });

        if (symbol.keystrokeAfterText) {
          this.MQ.triggerKeystroke(symbol.keystrokeAfterText);
        }
      } else {
        this.MQ
          .writeLatex(symbol.latex)
          .focus();

        if (symbol.keystrokeAfterText) {
          this.MQ.triggerKeystroke(symbol.keystrokeAfterText);
        }
      }
      this.MQ.focus();
    },

    editorInputClickHandler() {
      this.MQ.focus();
    },
  },
};
</script>

<style lang="scss" scoped>
  .mathquill-wrapper {
    .mathquill {
      border: none;
      font-size: 20px;

      &.mq-focused {
        box-shadow: none;
      }
    }
  }

  .list-item-underline {
    transition: all .2s;

    &.basic {
      transform: translateX(0);
    }

    &.greek {
      transform: translateX(96px);
    }

    &.advanced {
      transform: translateX(calc(96px * 2));
    }
  }

  /** Custom classes to override MathQuill's specificity */
  .keypad-container {
    .key {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 0.875rem;
      line-height: 1em;
      padding: 0;
    }
  }
</style>

<style lang="scss">
  .keypad-container {
    .key {
      .mq-root-block {
        padding: 0;
        flex-shrink: 0;
      }
    }
  }

  .mathquill-wrapper {
    .mq-math-mode {
      sup.mq-nthroot {
        line-height: 1.5;
      }
    }
  }
</style>

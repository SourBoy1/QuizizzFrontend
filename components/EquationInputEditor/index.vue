<template>
  <div
    class="relative"
    :class="[forPreview ? 'pointer-events-none' : '', isDesktop ? 'equation-input' : 'equation-input-mobile', isDesktop && !forPreview ? 'top-12' : '']"
  >
    <!-- Custom class so that we can override mathquill styles !-->
    <template v-if="showPreview">
      <div
        class="showPreview flex items-center pl-3 pr-2 rounded border-light-20% bg-dark-20% text-green-dark text-3xl border-solid border w-full overflow-auto mathquill-wrapper-equation cursor-text pointer-events-none"
        :class="[isDesktop ? 'h-32 mb-3' : 'h-18 mb-1', 'bg-green-faded border-4 border-green-dark']"
      >
        <div
          ref="MQWrapperForEquationType"
          class="mathquill"
        />
      </div>
    </template>
    <template v-else>
      <DegreeRadianToggle
        v-if="shouldShowDegreeRadianToggle"
        :selectedAngleMode="angleMode"
        :toggleAngleMode="toggleAngleMode"
        :forPreview="forPreview"
      />
      <div
        class="flex items-center pl-3 pr-2 rounded border-light-20% bg-dark-20% text-light-2 text-3xl border-solid border w-full overflow-auto mathquill-wrapper-equation cursor-text"
        :class="[isDesktop ? 'h-32 mb-3' : 'h-18 mb-1', forPreview ? 'pointer-events-none' : '']"
        @click="editorInputClickHandler"
      >
        <div
          ref="MQWrapperForEquationType"
          class="mathquill"
          @keydown="onInputKeydown"
          @keyup="onInputKeyup"
        />
        <span
          v-if="isLatexValueEmpty || forPreview"
          :tabindex="forPreview ? -1 : 140"
          class="absolute pl-2 text-light-33% font-bold text-xl md:text-2xl"
        >
          {{ $i18n('Enter your answer here...') }}
        </span>
      </div>

      <!-- Command Buttons -->
      <section
        ref="keypadContainer"
        class="flex flex-row keypad-container"
        :class="[isDesktop ? 'h-14' : 'h-12']"
      >
        <div
          ref="keypadGroups"
          class="flex h-full w-full gap-1"
        >
          <div
            v-for="(group, groupName) in Commands"
            :key="groupName"
            class="grid gap-x-1 flex-1"
            :class="[`grid-cols-${group.gridCols}`]"
          >
            <template
              v-for="(symbol) in group.keys"
              :key="symbol.key"
            >
              <button
                type="button"
                class="editor-button bg-light-20% rounded text-light-3 h-10 key flex items-center justify-center cursor-pointer"
                :class="[symbol.class, {
                  active: (keydownKeyData.command && keydownKeyData.command === symbol.command),
                  'opacity-10': shouldButtonsBeShownInactive,
                }]"
                @mouseenter="handleMouseEnter(symbol)"
                @mouseleave="handleMouseLeave(symbol)"
                @click="handleCommandKeyClick(symbol.command)"
              >
                <FA
                  :icon="`fas fa-${symbol.icon}`"
                  class="text-lg"
                  :class="{ desktop: isDesktop }"
                />
              </button>
            </template>
          </div>
        </div>
      </section>

      <!-- Keypad and Operator Buttons -->
      <section
        ref="keypadContainer"
        class="flex keypad-container"
      >
        <div
          ref="keypadGroups"
          class="flex flex-row h-full w-full justify-between"
        >
          <div
            v-for="(group, groupName) in LatexSymbols"
            :key="groupName"
            class="grid gap-x-1"
            :class="[`grid-cols-${group.gridCols}`]"
          >
            <template
              v-for="(symbol) in group.keys"
              :key="symbol.key"
            >
              <button
                v-if="symbol.customCommand"
                type="button"
                class="editor-button bg-light-20% rounded text-light-3 key flex items-center justify-center cursor-pointer mb-2"
                :class="[
                  symbol.class,
                  isDesktop ? 'h-12 w-12' : 'w-10 h-9', {
                    active: (keydownKeyData.latex && keydownKeyData.latex === symbol.latex) || (keydownKeyData.typedText && keydownKeyData.typedText === symbol.typedText),
                    'opacity-10': isCommandButtonInactive(symbol.customCommand),
                  }]"
                @mouseenter="handleMouseEnter(symbol)"
                @mouseleave="handleMouseLeave(symbol)"
                @click.stop="handleCustomCommandKeyClick(symbol.customCommand)"
              >
                <span v-if="symbol.btnText">{{ symbol.btnText }}</span>
                <FA
                  v-if="symbol.icon"
                  :icon="`fas fa-${symbol.icon}`"
                  :class="{ desktop: isDesktop }"
                />
              </button>
              <button
                v-else
                :key="symbol.key"
                type="button"
                class="editor-button bg-light-20% rounded text-light-3 key flex items-center justify-center cursor-pointer mb-2"
                :class="[
                  symbol.class,
                  isDesktop ? 'h-12 w-12' : 'w-10 h-9', {
                    active: (keydownKeyData.latex && keydownKeyData.latex === symbol.latex) || (keydownKeyData.typedText && keydownKeyData.typedText === symbol.typedText),
                    'opacity-10': shouldButtonsBeShownInactive,
                  },
                ]"
                @mouseenter="handleMouseEnter(symbol)"
                @mouseleave="handleMouseLeave(symbol)"
                @click="handleKeyClick(symbol)"
              >
                <span v-if="symbol.btnText">{{ symbol.btnText }}</span>
                <FA
                  v-if="symbol.icon"
                  :icon="`fas fa-${symbol.icon}`"
                  :class="{ desktop: isDesktop }"
                />
              </button>
            </template>
          </div>
        </div>
      </section>

      <!-- Custom Variables & Trigonometric functions -->
      <TooltipPanel
        v-if="showCustomVariables || showTrigonometricSymbols"
        v-click-outside="() => closeTooltip()"
        :classes="['bottom-0']"
        :arrowPos="showTrigonometricSymbols ? '80%' : '35%'"
      >
        <div class="bg-light-33% rounded-lg keypad-container p-2 md:p-4 border-2 border-r border-light-3 backdrop-blur-xl">
          <section
            ref="customVariablesContainer"
            class="flex"
          >
            <div
              ref="keypadGroups"
              class="flex flex-row h-full w-full justify-between"
            >
              <div
                :key="showCustomVariables ? 'CustomVariables' : 'TrigonometricSymbols'"
                :class="[
                  `grid-cols-${showCustomVariables ? CustomVariables.gridCols : ''}`,
                  {
                    'flex flex-wrap max-w-48 gap-2': showTrigonometricSymbols,
                    'grid gap-2': showCustomVariables,
                  }]"
              >
                <template
                  v-for="(symbol) in (showCustomVariables ? CustomVariables.keys : TrigonometricSymbols.keys)"
                  :key="symbol.key"
                >
                  <button
                    type="button"
                    class="editor-button bg-purple-20% rounded text-light-3 key flex items-center justify-center cursor-pointer mb-2 custom-variable-key"
                    :class="[
                      symbol.class,
                      isDesktop ? 'h-12' : 'h-9', {
                        active: (keydownKeyData.latex && keydownKeyData.latex === symbol.latex) || (keydownKeyData.typedText && keydownKeyData.typedText === symbol.typedText),
                        'w-14': !symbol.widthContent && !symbol.fitContent && showTrigonometricSymbols,
                        'w-12': !symbol.widthContent && !symbol.fitContent && showCustomVariables,
                        'w-22': symbol.widthContent,
                        'w-10': symbol.fitContent,
                        'w-9': !isDesktop && !symbol.widthContent && !symbol.fitContent && showCustomVariables,
                      },
                    ]"
                    @mouseenter="handleMouseEnter(symbol)"
                    @mouseleave="handleMouseLeave(symbol)"
                    @click.stop="handleKeyClick(symbol, true)"
                  >
                    <span v-if="symbol.btnText">{{ symbol.btnText }}</span>
                    <span
                      v-if="symbol.btnLatex"
                      class="text-light-3"
                      :class="[
                        isDesktop ? 'text-2xl' : 'text-base',
                      ]"
                    >
                      <KatexRenderer
                        :ref="`katex-${index}`"
                        class="text-light-3"
                        :type="'transparent'"
                        isReadOnly
                        :latex="symbol.btnLatex"
                      />
                    </span>
                    <FA
                      v-if="symbol.icon"
                      :icon="`fas fa-${symbol.icon}`"
                      :class="{ desktop: isDesktop }"
                    />
                  </button>
                </template>
              </div>
            </div>
          </section>
        </div>
      </TooltipPanel>

      <!-- Square root and cube root functions -->
      <TooltipPanel
        v-if="showRootFunctions"
        v-click-outside="() => closeTooltip()"
        :classes="['bottom-24']"
        :arrowPos="'40%'"
        :arrowDirection="'left'"
      >
        <div class="bg-light-33% rounded-lg keypad-container p-2 md:p-4 border-2 border-r border-light-3 backdrop-blur-xl">
          <section
            ref="rootFunctionsContainer"
            class="flex"
          >
            <div
              ref="keypadGroups"
              class="flex flex-row h-full w-full justify-between"
            >
              <div
                :key="'RootFunctions'"
                :class="[
                  `grid-cols-${RootFunctions.gridCols}`,
                  {
                    'grid gap-2': showRootFunctions,
                  }]"
              >
                <template
                  v-for="(symbol) in RootFunctions.keys"
                  :key="symbol.key"
                >
                  <button
                    type="button"
                    class="editor-button bg-purple-20% rounded text-light-3 key flex items-center justify-center cursor-pointer mb-2 custom-variable-key h-12 w-12"
                    :class="[
                      symbol.class,
                      {
                        active: (keydownKeyData.latex && keydownKeyData.latex === symbol.latex) || (keydownKeyData.typedText && keydownKeyData.typedText === symbol.typedText),
                      },
                    ]"
                    @mouseenter="handleMouseEnter(symbol)"
                    @mouseleave="handleMouseLeave(symbol)"
                    @click.stop="handleKeyClick(symbol, true)"
                  >
                    <span v-if="symbol.btnText">{{ symbol.btnText }}</span>
                    <FA
                      v-if="symbol.icon"
                      :icon="`fas fa-${symbol.icon}`"
                      :class="{ desktop: isDesktop }"
                    />
                  </button>
                </template>
              </div>
            </div>
          </section>
        </div>
      </TooltipPanel>

      <!-- Logarithmic functions -->
      <TooltipPanel
        v-if="showLogFunctions"
        v-click-outside="() => closeTooltip()"
        :classes="['bottom-38']"
        :arrowPos="'40%'"
        :arrowDirection="'left'"
      >
        <div class="bg-light-33% rounded-lg keypad-container p-2 md:p-4 border-2 border-r border-light-3 backdrop-blur-xl">
          <section
            ref="rootFunctionsContainer"
            class="flex"
          >
            <div
              ref="keypadGroups"
              class="flex flex-row h-full w-full justify-between"
            >
              <div
                :key="'LogFunctions'"
                :class="[
                  `grid-cols-${LogFunctions.gridCols}`,
                  {
                    'grid gap-2': showLogFunctions,
                  }]"
              >
                <template
                  v-for="(symbol) in LogFunctions.keys"
                  :key="symbol.key"
                >
                  <button
                    type="button"
                    class="editor-button bg-purple-20% rounded text-light-3 key flex items-center justify-center cursor-pointer mb-2 custom-variable-key h-12 w-12"
                    :class="[
                      symbol.class,
                      {
                        active: (keydownKeyData.latex && keydownKeyData.latex === symbol.latex) || (keydownKeyData.typedText && keydownKeyData.typedText === symbol.typedText),
                      },
                    ]"
                    @mouseenter="handleMouseEnter(symbol)"
                    @mouseleave="handleMouseLeave(symbol)"
                    @click.stop="handleKeyClick(symbol, true)"
                  >
                    <span v-if="symbol.btnText">{{ symbol.btnText }}</span>
                    <FA
                      v-if="symbol.icon"
                      :icon="`fas fa-${symbol.icon}`"
                      :class="{ desktop: isDesktop }"
                    />
                  </button>
                </template>
              </div>
            </div>
          </section>
        </div>
      </TooltipPanel>
    </template>
    <div
      v-if="isDesktop && showKeyboardShortcuts"
      class="absolute -bottom-13 w-full flex justify-center"
    >
      <div class="p-2 bg-light-10% text-light font-bold flex gap-2 justify-center rounded-lg mx-auto">
        {{ $i18n('Keyboard shortcut:') }}
        <span
          v-for="(key, index) in keyShortcuts"
          :key="key"
          class="flex gap-1"
        >
          <span class="bg-dark-1 text-light rounded-sm font-bold py-0.5 px-2 keyboard-shortcut-key">{{ key }}</span>
          <span v-if="index !== keyShortcuts.length - 1">+</span>
        </span>
      </div>
    </div>
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

import MathQuillService, {
  EquationEditorLatexSymbols, Commands, KeysAllowed, KeysWithMetaKeyAllowed, KeysToTypedTextMapping, CommandsEnum, AdditionalLatexSymbols, CustomKeysToHandle,
} from '~/services/MathQuillService';
import QLogger from '~/services/QLogger';
import TooltipPanel from './TooltipPanel.vue';
import DegreeRadianToggle from './DegreeRadianToggle.vue';

export default {

  components: {
    TooltipPanel,
    DegreeRadianToggle,
  },

  props: {
    latexValue: {
      type: [String, Number],
      default: '',
    },

    isDesktop: {
      type: Boolean,
      default: true,
    },

    showPreview: {
      type: Boolean,
      default: false,
    },

    forPreview: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:latexValue', 'update:angleMode'],

  data() {
    return {
      mathQuillPackage: null,
      latex: '',

      /** @type {MathQuillService()} */
      MQ: null,

      // logger: null,
      insertButton: {
        type: 'primary',
        title: this.$i18n('Insert'),
      },

      LatexSymbols: EquationEditorLatexSymbols,
      keysToTypedTextMapping: KeysToTypedTextMapping,
      keydownKeyData: {},
      Commands,
      showTip: false,
      showKeyboardShortcuts: false,
      keyShortcuts: [],
      tipIndex: -1,
      CustomVariables: AdditionalLatexSymbols.customVariables,
      TrigonometricSymbols: AdditionalLatexSymbols.trigonometry,
      RootFunctions: AdditionalLatexSymbols.root,
      LogFunctions: AdditionalLatexSymbols.log,
      showCustomVariables: false,
      showTrigonometricSymbols: false,
      showRootFunctions: false,
      showLogFunctions: false,
      angleMode: 'degree',
      trigonometrySymbolsUsed: false,
    };
  },

  computed: {
    shouldShowTip() {
      return (this.tipIndex !== -1);
    },

    isLatexValueEmpty() {
      return !this.latexValue;
    },

    shouldButtonsBeShownInactive() {
      return this.showCustomVariables || this.showRootFunctions || this.showTrigonometricSymbols || this.showLogFunctions;
    },

    shouldShowDegreeRadianToggle() {
      return this.showTrigonometricSymbols || this.MQ?.isTrigonometryUsed() || this.forPreview;
    },
  },

  watch: {
    showPreview(newVal) {
      if (newVal && this.forPreview) {
        this.MQ.writeLatex(this.latexValue);
      } else if (!newVal && this.forPreview) {
        this.MQ.clearLatex();
      }
    },
  },

  async mounted() {
    this.mathQuillPackage = (await import('mathquill')).default;
    this.$nextTick().then(() => {
      this.mathQuillPackage && this.checkAndInitMathQuill();
    });

    this.$eventBus.$on('mathQuill:updateLatex', this.handleUpdateLatex);
  },

  beforeUnmount() {
    this.$eventBus.$off('mathQuill:updateLatex', this.handleUpdateLatex);
  },

  methods: {
    handleUpdateLatex({ latex }) {
      this.$emit('update:latexValue', latex, this.MQ?.isTrigonometryUsed() ? this.angleMode : false);
    },

    handleTrigKeyboardShortcuts(key) {
      this.keydownKeyData = { latex: this.TrigonometricSymbols.keys[key - 1].latex };
      this.handleKeyClick({ latex: this.TrigonometricSymbols.keys[key - 1].latex }, true);
    },

    handleRootKeyboardShortcuts(key) {
      this.keydownKeyData = { latex: this.RootFunctions.keys[key - 1].latex };
      this.handleKeyClick({ latex: this.RootFunctions.keys[key - 1].latex }, true);
      this.MQ.triggerKeystroke(this.RootFunctions.keys[key - 1].keystrokeAfterText);
    },

    handleLogKeyboardShortcuts(key) {
      this.keydownKeyData = { latex: this.LogFunctions.keys[key - 1].latex };
      this.handleKeyClick({ latex: this.LogFunctions.keys[key - 1].latex }, true);
      this.MQ.triggerKeystroke(this.LogFunctions.keys[key - 1].keystrokeAfterText);
    },

    onInputKeydown(ev) {
      ev.preventDefault();
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') {
        return;
      }
      ev.stopImmediatePropagation();

      if (this.TrigonometricSymbols.keys[ev.key - 1] && this.showTrigonometricSymbols) {
        this.handleTrigKeyboardShortcuts(ev.key);
        return;
      }

      if (this.RootFunctions.keys[ev.key - 1] && this.showRootFunctions) {
        this.handleRootKeyboardShortcuts(ev.key);
        return;
      }

      if (this.LogFunctions.keys[ev.key - 1] && this.showLogFunctions) {
        this.handleLogKeyboardShortcuts(ev.key);
        return;
      }

      if (ev.key === 'Enter' && document.querySelector('.mq-numerator.mq-hasCursor')) {
        this.MQ.triggerKeystroke('Down');
        return;
      }

      if (ev.key === 'Enter' && (document.querySelector('.mq-denominator.mq-hasCursor')
        || document.querySelector('.mq-non-leaf.mq-hasCursor')
        || document.querySelector('.mq-non-leaf.mq-sqrt-stem.mq-hasCursor'))) {
        this.MQ.triggerKeystroke('Right');
        return;
      }

      if (ev.key === 'Enter' && (document.querySelector('.mq-sub.mq-hasCursor') || document.querySelector('.mq-sup.mq-hasCursor'))) {
        this.MQ.triggerKeystroke('Right Right');
        return;
      }

      if (!KeysAllowed.includes(ev.key) && !((ev.ctrlKey || ev.metaKey) && KeysWithMetaKeyAllowed.includes(ev.key))) {
        return;
      }

      this.MQ.focus();
      if ((ev.ctrlKey || ev.metaKey) && KeysWithMetaKeyAllowed.includes(ev.key)) {
        switch (ev.key) {
          case 'z':
            if (ev.shiftKey) {
              this.keydownKeyData = { command: CommandsEnum.REDO };
            } else {
              this.keydownKeyData = { command: CommandsEnum.UNDO };
            }
            this.MQ.onInputKeydown(ev);
            break;
          case '/':
            this.keydownKeyData = { latex: '\\div' };
            this.handleKeyClick({ latex: '\\div' });
            break;
          case 'Backspace':
            // Clear all
            this.keydownKeyData = KeysToTypedTextMapping[ev.key];
            this.MQ.onInputKeydown(ev);
            break;
          case 'l':
            if (this.LogFunctions.keys[ev.key - 1] && this.showLogFunctions) {
              this.handleLogKeyboardShortcuts(ev.key);
              return;
            }
            this.handleCustomCommandKeyClick(CustomKeysToHandle.LOG);
            break;
          case 'r':
            if (this.RootFunctions.keys[ev.key - 1] && this.showRootFunctions) {
              this.handleRootKeyboardShortcuts(ev.key);
              return;
            }
            this.handleCustomCommandKeyClick(CustomKeysToHandle.ROOT);
            break;
          case 'x':
            this.handleCustomCommandKeyClick(CustomKeysToHandle.CUSTOM);
            break;
          case 'o':
            if (this.TrigonometricSymbols.keys[ev.key - 1] && this.showTrigonometricSymbols) {
              this.handleTrigKeyboardShortcuts(ev.key);
              return;
            }
            this.handleCustomCommandKeyClick(CustomKeysToHandle.TRIGONOMETRY);
            break;
          case 'p':
            this.keydownKeyData = { latex: '\\pi' };
            this.handleKeyClick({ latex: '\\pi' });
            break;
          default:
        }
        return;
      }
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
        this.MQ.triggerKeystroke(ev.key === 'ArrowUp' ? 'Up' : 'Down');
        return;
      }
      if (KeysToTypedTextMapping[ev.key]) {
        this.keydownKeyData = KeysToTypedTextMapping[ev.key];
        this.handleKeyClick(KeysToTypedTextMapping[ev.key]);
      }
    },

    onInputKeyup() {
      this.keydownKeyData = {};
    },

    checkAndInitMathQuill() {
      if (!this.MQ && this.$refs.MQWrapperForEquationType) {
        this.initMathQuill();
      }
    },

    editorInputClickHandler() {
      this.MQ.focus();
    },

    initMathQuill() {
      // this.logger( 'Initializing MQ input' );
      if (!this.mathQuillPackage) {
        return;
      }

      if (!this.$refs.MQWrapperForEquationType) {
        QLogger.error('MQWrapperForEquationType $ref not found');
        return;
      }

      const { MQWrapperForEquationType } = this.$refs;
      const forEquationEditor = true;
      this.MQ = new MathQuillService(this.mathQuillPackage, forEquationEditor, this.forPreview);
      this.MQ
        .initEditableMathField(MQWrapperForEquationType, {
          substituteTextArea: () => document.createElement('textarea'),
        });

      this.$nextTick(() => {
        this.$el?.getElementsByTagName('textarea')[0]?.setAttribute('inputmode', !this.isDesktop ? 'none' : '');
      });

      if (!this.forPreview) {
        this.MQ.focus();
      }

      if (this.latexValue) {
        this.MQ.writeLatex(this.latexValue);
      }
    },

    handleKeyClick(symbol, prevent = false) {
      // close the tooltip
      if ((this.showCustomVariables || this.showTrigonometricSymbols || this.showRootFunctions || this.showLogFunctions) && !prevent) {
        this.closeTooltip();
        return;
      }
      if (symbol.command) {
        this.handleCommandKeyClick(symbol.command);
      }

      if (symbol.typedText) {
        const typedText = symbol.typedText.split(',');
        typedText.forEach((text) => {
          if (['Right', 'Left'].includes(text)) {
            this.MQ.triggerKeystroke(text);
          } else if (['('].includes(text)) {
            this.MQ.typeText(text);
          } else {
            this.MQ.typeText(text)
              .focus();
          }
        });
      }

      if (symbol.latex) {
        this.MQ
          .writeLatex(symbol.latex)
          .focus();
      }
      if (symbol.keystrokeAfterText) {
        this.MQ.triggerKeystroke(symbol.keystrokeAfterText);
      }
      this.MQ.undoHistory = [];
      this.MQ.focus();
      this.toggleCustomVariables(true);
      this.toggleTrigonometrySymbols(true);
      this.toggleRootFunctions(true);
      this.toggleLogFunctions(true);
    },

    handleCommandKeyClick(command) {
      // close the tooltip
      if ((this.showCustomVariables || this.showTrigonometricSymbols || this.showRootFunctions || this.showLogFunctions)) {
        this.closeTooltip();
        return;
      }
      // Command
      switch (command) {
        case CommandsEnum.LEFT:
          this.MQ.triggerKeystroke('Left');
          break;
        case CommandsEnum.RIGHT:
          this.MQ.triggerKeystroke('Right');
          break;
        case CommandsEnum.UNDO:
          this.MQ.undo();
          break;
        case CommandsEnum.REDO:
          this.MQ.redo();
          break;
        case CommandsEnum.DELETE:
          this.MQ.triggerKeystroke('Backspace');
          break;
        default:
          break;
      }
      this.MQ.focus();
      this.closeTooltip();
    },

    handleMouseEnter(symbol) {
      if (!symbol.keyboardShortcuts) {
        return;
      }
      this.keyShortcuts = symbol.keyboardShortcuts;
      this.showKeyboardShortcuts = true;
    },

    handleMouseLeave() {
      this.showKeyboardShortcuts = false;
      this.keyShortcuts = [];
    },

    toggleCustomVariables(off) {
      if (off) {
        this.showCustomVariables = false;
      } else {
        this.showCustomVariables = !this.showCustomVariables;
        if (this.showCustomVariables) {
          this.MQ.focus();
        }
      }
    },

    toggleTrigonometrySymbols(off) {
      if (off) {
        this.showTrigonometricSymbols = false;
      } else {
        this.showTrigonometricSymbols = !this.showTrigonometricSymbols;
        if (this.showTrigonometricSymbols) {
          this.MQ.focus();
        }
      }
    },

    toggleRootFunctions(off) {
      if (off) {
        this.showRootFunctions = false;
      } else {
        this.showRootFunctions = !this.showRootFunctions;
        if (this.showRootFunctions) {
          this.MQ.focus();
        }
      }
    },

    toggleLogFunctions(off) {
      if (off) {
        this.showLogFunctions = false;
      } else {
        this.showLogFunctions = !this.showLogFunctions;
        if (this.showLogFunctions) {
          this.MQ.focus();
        }
      }
    },

    handleCustomCommandKeyClick(input) {
      switch (input) {
        case CustomKeysToHandle.CUSTOM:
          this.toggleCustomVariables();
          this.toggleTrigonometrySymbols(true);
          this.toggleRootFunctions(true);
          this.toggleLogFunctions(true);
          break;
        case CustomKeysToHandle.TRIGONOMETRY:
          this.toggleCustomVariables(true);
          this.toggleTrigonometrySymbols();
          this.toggleRootFunctions(true);
          this.toggleLogFunctions(true);
          break;
        case CustomKeysToHandle.ROOT:
          this.toggleCustomVariables(true);
          this.toggleTrigonometrySymbols(true);
          this.toggleRootFunctions();
          this.toggleLogFunctions(true);
          break;
        case CustomKeysToHandle.LOG:
          this.toggleCustomVariables(true);
          this.toggleTrigonometrySymbols(true);
          this.toggleRootFunctions(true);
          this.toggleLogFunctions();
          break;
        default:
          break;
      }
    },

    isCommandButtonInactive(command) {
      if (command === CustomKeysToHandle.CUSTOM && this.showCustomVariables) {
        return false;
      } if (command === CustomKeysToHandle.TRIGONOMETRY && this.showTrigonometricSymbols) {
        return false;
      } if (command === CustomKeysToHandle.ROOT && this.showRootFunctions) {
        return false;
      } if (command === CustomKeysToHandle.LOG && this.showLogFunctions) {
        return false;
      } if (!this.showCustomVariables && !this.showTrigonometricSymbols && !this.showRootFunctions && !this.showLogFunctions) {
        return false;
      }
      return true;
    },

    toggleAngleMode(mode) {
      this.angleMode = mode;
      this.$emit('update:angleMode', this.MQ?.parseCurrentLatex(), mode);
    },

    closeTooltip() {
      this.toggleCustomVariables(true);
      this.toggleTrigonometrySymbols(true);
      this.toggleRootFunctions(true);
      this.toggleLogFunctions(true);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
.equation-input {
  width: 379px;
}
  .equation-input-mobile {
    width: 90%
  }

  .mathquill-wrapper-equation {
    .mathquill {
      width: 100%;
      border: none;
      font-size: 1.5rem;
      @media screen and (max-width: $minTabletWidth) {
        font-size: 1.25rem;
      }
      &.mq-focused {
        box-shadow: none;
      }
    }

    &.show-answer .mathquill {
      border: none;
      font-size: 1.5rem;
      @media screen and (max-width: $minTabletWidth) {
        font-size: 1.25rem;
      }
      &.mq-focused {
        box-shadow: none;
      }
    }
  }

  /** Custom classes to override MathQuill's specificity */
  .keypad-container {
    .key {
      font-size: 0.875rem;
      line-height: 1em;
      padding: 0;
      box-shadow: 0px 4px 0px rgba(255, 255, 255, 0.1);

      span{
        font-family: 'Playfair Display', 'Times New Roman';
        font-style: italic;
        font-size: 1.5rem;
      }

      i {
        &.desktop::before {
          font-size: 1.125rem;
        }
        &::before {
          font-size: 0.875rem;
        }
      }

      /* Custom Icons */
      &.exp, &.frac, &.cbrt, &.trig {
        i {
          &.desktop::before {
            font-size: 2.5rem;
          }
          &::before {
            font-size: 1.875rem;
          }
        }
      }

      &.keypad {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.33);
        box-shadow: 0px 4px 0px rgba(255, 255, 255, 0.2);
      }

      &.keypad:active, &.keypad.active {
        box-shadow: none !important;
        transform: translateY(4px);
        background: rgba(255, 255, 255, 0.15);
        text-shadow: 0px 0px 4px rgba(255, 255, 255, 0.5);
      }

      &.operator:active, &.operator.active {
        box-shadow: none !important;
        transform: translateY(4px);
        background: rgba(255, 255, 255, 0.05);
        text-shadow: 0px 0px 4px rgba(255, 255, 255, 0.5);
      }

      &.keypad:hover:not(:active) {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.66) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.5);
        box-shadow: 0px 4px 0px rgba(255, 255, 255, 0.33);
      }

      &.operator:hover:not(:active) {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.33);
        box-shadow: 0px 4px 0px rgba(255, 255, 255, 0.2);
      }

      &.custom-variable-key {
        span{
          font-family: 'Times New Roman';
          font-style: italic;
        }
        background: linear-gradient(0deg, #583A55, #583A55), rgba(255, 255, 255, 0.33);
        box-shadow: 0px 4px 0px #4E2F4B;

        &:hover {
          background: linear-gradient(128.48deg, rgba(255, 255, 255, 0.16) 3.32%, rgba(255, 255, 255, 0) 98.77%), linear-gradient(0deg, rgba(88, 58, 85, 0.9), rgba(88, 58, 85, 0.9)), rgba(255, 255, 255, 0.33) !important;
          box-shadow: 0px 4px 0px #4E2F4B !important;
        }
      }
    }
  }
  .keyboard-shortcut-key {
    font-family: 'Courier New', Courier, monospace;
    box-shadow: 0px 2px 0px #424242;
  }

  .custom-fa {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
  }

  .invert-colors  {
    filter: grayscale(1) invert(1);
    --webkit-filter: grayscale(1) invert(1);
  }

  @mixin backgroundImage($img) {
    background-image: url('#{$img}');
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  };

  .fa-exp {
      background-image: url('https://cf.quizizz.com/img/icons/exp.svg');
      @extend .custom-fa;
      @extend .invert-colors;
    }

  .fa-frac {
      background-image: url('https://cf.quizizz.com/img/icons/frac.svg');
      @extend .custom-fa;
      @extend .invert-colors;
    }

  .fa-cbrt {
      background-image: url('https://cf.quizizz.com/img/icons/cbrt.svg');
      @extend .custom-fa;
      @extend .invert-colors;
    }

  .fa-trig {
    @include backgroundImage('https://cf.quizizz.com/img/icons/trig.svg');
  }

  .fa-root {
    background-size: contain;
    @include backgroundImage('https://cf.quizizz.com/img/icons/root.svg');
  }

  .fa-logxy {
    @include backgroundImage('https://cf.quizizz.com/img/icons/logxy.svg');
  }

  .fa-logey {
    @include backgroundImage('https://cf.quizizz.com/img/icons/logey.svg');
  }

  .fa-expo {
    @include backgroundImage('https://cf.quizizz.com/img/icons/exponent.svg');
    @extend .custom-fa;
  }

  .fa-variable {
    background-size: contain;
    @include backgroundImage('https://cf.quizizz.com/img/icons/variable.svg');
    @extend .invert-colors;
  }

  .fa-alpha {
    background-size: contain;
    @include backgroundImage('https://cf.quizizz.com/img/icons/alpha.svg');
  }

  .fa-beta {
    background-size: contain;
    @include backgroundImage('https://cf.quizizz.com/img/icons/beta.svg');
  }
  .fa-gamma {
    background-size: contain;
    @include backgroundImage('https://cf.quizizz.com/img/icons/gamma.svg');
  }
  .fa-mu {
    background-size: contain;
    @include backgroundImage('https://cf.quizizz.com/img/icons/mu.svg');
  }
  .fa-thetaIcon {
    @include backgroundImage('https://cf.quizizz.com/img/icons/theta.svg');
  }

  .fa-degree {
    @include backgroundImage('https://cf.quizizz.com/img/icons/degree.svg');
  }

  .fa-phi {
    background-size: contain;
    @include backgroundImage('https://cf.quizizz.com/img/icons/phi.svg');
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

.mathquill-wrapper-equation {
  .mq-editable-field .mq-cursor {
    border-left: 2px solid white !important;
    border-radius: 1px;
    margin: 0 2px;
  }
}

  .mathquill-wrapper-equation {
    .mq-math-mode {
      sup.mq-nthroot {
        line-height: 1.75;
      }
    }
  }

</style>

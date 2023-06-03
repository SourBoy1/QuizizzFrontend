import defaultsDeep from 'lodash/defaultsDeep';
import 'mathquill/dist/bundle.css';

import { browserOS } from '~/utils/Utilities';
import EventBus from './EventBus';
import i18n from './i18n';

/**
 * !!IMPORTANT!!
 *
 * This service can ONLY be used in components that are wrapped in a <client-only> tag
 * which disables ssr for the component.
 * This is because MathQuill depends on jQuery which only works in a browser environment due to
 * dependencies on `window` and `document` objects and browser APIs.
 *
 * Nuxt is still throwing warnings (in the NodeJS console) for this even after
 * including it in a <no-client> component. This service would need to be included in a client-only context
 * to avoid these errors.
 */

/**
 * Keys to ignore while populating an "input" history so that we can support
 * undo and redo
 */
const KeysToIgnore = [
  'Shift',
  'Meta',
  'Control',
  'Alt',
  'AltGraph',
  'CapsLock',
  'Escape',
  'Fn',
  'FnLock',
  'Hyper',
  'NumLock',
  'ScrollLock',
  'Super',
  'Symbol',
  'SymbolLock',
  'End',
  'Home',
  'PageDown',
  'PageUp',
];

/**
 * Keys that are to be consumed as if they were keystrokes
 */
const KeysAsKeystrokes = [
  'Tab',
];

export const CommandsEnum = {
  LEFT: 'left',
  RIGHT: 'right',
  UNDO: 'undo',
  REDO: 'redo',
  DELETE: 'delete',
};

export const KeysAllowed = [
  'x',
  'y',
  'z',
  't',
  'a',
  'b',
  'c',
  'l',
  '+',
  '-',
  '*',
  '/',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '<',
  '=',
  '>',
  '^',
  '.',
  '(',
  ')',
  'Backspace',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
];

export const KeysToTypedTextMapping = {
  x: { latex: 'x' },
  y: { latex: 'y' },
  z: { latex: 'z' },
  t: { latex: 't' },
  a: { latex: 'a' },
  b: { latex: 'b' },
  c: { latex: 'c' },
  l: { latex: 'l' },
  '+': { latex: '+' },
  '-': { latex: '-' },
  '*': { latex: '\\times' },
  '/': { typedText: '/' },
  0: { latex: '0' },
  1: { latex: '1' },
  2: { latex: '2' },
  3: { latex: '3' },
  4: { latex: '4' },
  5: { latex: '5' },
  6: { latex: '6' },
  7: { latex: '7' },
  8: { latex: '8' },
  9: { latex: '9' },
  '<': { latex: '<' },
  '=': { latex: '=' },
  '>': { latex: '>' },
  '^': { typedText: '^' },
  '.': { typedText: '.' },
  '(': { typedText: '(' },
  ')': { typedText: ')' },
  ArrowLeft: { command: CommandsEnum.LEFT },
  ArrowRight: { command: CommandsEnum.RIGHT },
  Backspace: { command: CommandsEnum.DELETE },
};

export const KeysWithMetaKeyAllowed = [
  'z',
  '/',
  'Backspace',
  'l',
  'r',
  'x',
  'o',
  'p',
];

/* Keys with custom tooltips */
export const CustomKeysToHandle = {
  CUSTOM: 'custom',
  TRIGONOMETRY: 'trigonometry',
  ROOT: 'root',
  LOG: 'log',
};

/**
 * Specially handled keys
 */
const KeysToHandle = {
  ENTER: 'Enter',
  z: 'z',
  Z: 'Z',
  Backspace: 'Backspace',
};
export default class MathQuillService {
  /**
   * Initializes a new MathQuill interface
   */
  constructor(MathQuill, forEquationEditor = false, forPreview = false) {
    this.MQ = MathQuill.getInterface(2);
    this.MQEditableField = null;
    this.inputHistory = [];
    this.undoHistory = [];
    this.forEquationEditor = forEquationEditor;
    this.forPreview = forPreview;
  }

  /**
   * Parses an element's content, and renders valid latex as math expressions
   *
   * @param {HTMLElement} element Element whose content is to be parsed and displayed
   * @returns {MathQuill.StaticMath}
   */
  parseAndDisplayMath(element) {
    return this.MQ.StaticMath(element);
  }

  /**
   * Turns the given element into an editable math field for MQ
   *
   * @param {HTMLInputElement} element Element to hook MQ onto
   * @param {MQ.Config} conf Config for the math field
   * @returns {this} Current MQ service instance
   */
  initEditableMathField(element, conf = {}) {
    const config = defaultsDeep(conf, {
      charsThatBreakOutOfSupSub: '+-=<>',
      supSubsRequireOperand: true,
      restrictMismatchedBrackets: true,
      leftRightIntoCmdGoes: 'up',
    });

    this.MQEditableField = this.MQ.MathField(element, config);
    return this;
  }

  /**
   * Simulates keystrokes (key combinations) on the editable MQ field
   *
   * @param {String} keys Whitespace delimited list of key inputs to trigger on the MQ field
   * @param {Boolean} addToHistory Whether this input should be added to the input history
   * @returns {this} Current MQ service instance
   */
  triggerKeystroke(keys, addToHistory = true) {
    this.MQEditableField.keystroke(keys);
    if (addToHistory) {
      this.addToInputHistory('key', keys);
    }

    return this;
  }

  /**
   * Types the given string into the MQ field at the current cursor position
   *
   * @param {String} text Text to type into the field
   * * @param {Boolean} addToHistory Whether this input should be added to the input history
   * @returns {this} Current MQ service instance
   */
  typeText(text, addToHistory = true) {
    this.MQEditableField.typedText(text);
    if (addToHistory) {
      this.addToInputHistory('text', text);
    }

    return this;
  }

  /**
   * Writes the given LaTeX at the current cursor position
   *
   * @param {String} latex LaTeX to write to the field
   * * @param {Boolean} addToHistory Whether this input should be added to the input history
   * @returns {this} Current MQ service instance
   */
  writeLatex(latex, addToHistory = true) {
    try {
      this.MQEditableField.write(latex);
    } catch (err) {
      window.console.error(err);
    }

    if (addToHistory) {
      this.addToInputHistory('latex', latex);
    }

    return this;
  }

  /**
   * Focuses the editable MQ field
   * @returns {this} Current MQ service instance
   */
  focus() {
    this.MQEditableField.focus();

    return this;
  }

  /**
   * Focuses the editable MQ field
   * @returns {this} Current MQ service instance
   */
  blur() {
    this.MQEditableField.blur();

    return this;
  }

  /**
   * Uses the current input in the MQ field and parses it as LaTeX
   *
   * @returns {String} Returns the parsed LaTeX
   */
  parseCurrentLatex() {
    return this.MQEditableField.latex();
  }

  /**
   * Replaces the current latex content with the given input
   *
   * @param {String} content LaTeX content to replace the current LaTeX
   * @returns {this}
   */
  setCurrentLatex(content) {
    this.MQEditableField.latex(content);

    return this;
  }

  /**
   * Pushes an interaction with the input field to the input history
   *
   * @param {'text' | 'key' | 'latex'} type Type of interaction with the input field
   * @param {String} value Content of the interaction with the input field
   */
  addToInputHistory(type, value) {
    this.inputHistory.push({
      type,
      value,
    });
    if (this.forEquationEditor && !this.forPreview) { EventBus.$emit('mathQuill:updateLatex', { latex: this.parseCurrentLatex() }); }
  }

  /**
   * Checks if the current input in the field results in valid LaTeX.
   * If so, emits an event on the EventBus to notify the component using the service
   */
  done() {
    const latex = this.parseCurrentLatex();
    if (!latex) {
      return;
    }
    EventBus.$emit('mathQuill:submitLatex', latex);
  }

  /**
   * Applies all the available actions in the current input history
   */
  reApplyAllInputHistory() {
    this.inputHistory.forEach((input) => {
      this.applyInputToField(input);
    });
    if (this.forEquationEditor && !this.forPreview) { EventBus.$emit('mathQuill:updateLatex', { latex: this.parseCurrentLatex() }); }
  }

  undo() {
    // if ctrl + z is pressed -> we try to undo the last action the user did
    // we do this by popping the last input activity of the user
    // and then replaying all the actions

    if (this.inputHistory.length === 0) {
      return;
    }

    const poppedAction = this.inputHistory.pop();
    this.undoHistory.push(poppedAction);

    // empty the current field
    this.setCurrentLatex('');

    // re-apply all the input history we have so far
    this.reApplyAllInputHistory();
  }

  redo() {
    if (this.undoHistory.length === 0) {
      return;
    }

    // we pop the last "undone" action, and push it onto the input history
    // then we re-apply the entire input history

    const poppedItem = this.undoHistory.pop();
    this.inputHistory.push(poppedItem);

    // empty the current field
    this.setCurrentLatex('');

    this.reApplyAllInputHistory();
  }

  clearLatex() {
    this.setCurrentLatex('');
    this.addToInputHistory({
      type: 'latex',
      value: '',
    });
  }

  /**
   * Applies (enters into the field) the given input to the current MQ editable field
   *
   * @param {Object} input Record containing the type and key of the input to apply
   *  @param {'text' | 'key' | 'latex'} input.type Type of the input
   *  @param {String} input.value
   */
  applyInputToField(input) {
    const { type, value } = input;
    switch (type) {
      case 'key':
        this.triggerKeystroke(value, false);
        break;
      case 'text':
        this.typeText(value, false);
        break;
      case 'latex':
        this.writeLatex(value, false);
        break;
      default:
    }
  }

  /**
   * Event handler for keydown on the MQ editable field
   *
   * @param {KeyboardEvent} ev
   */
  onInputKeydown(ev) {
    if (this.forEquationEditor) { ev.preventDefault(); }

    const keyPressed = ev.key;

    /**
     * We can't support more sophisticated undo/redo (based on user cursor location, backspace etc) because
     * MathQuill doesn't actually write to the input field (textarea in our case). It takes the input
     * from the textarea and then renders it in separate divs as LaTeX.
     *
     * Due to this, we don't have access to caret positions using `.selectionStart` and `.selectionEnd`
     * They always return `0` since there is no content in the textarea
     */

    // if ctrl + shift + z is pressed -> we try to redo the last action the user "un-did"
    if ([KeysToHandle.Z, KeysToHandle.z].includes(keyPressed) && (ev.ctrlKey || ev.metaKey) && ev.shiftKey) {
      this.redo();
      return;
    } if ([KeysToHandle.Z, KeysToHandle.z].includes(keyPressed) && (ev.ctrlKey || ev.metaKey)) {
      // if ctrl + z is pressed -> we try to undo the last action taken by the user
      this.undo();
      return;
    } if (KeysToHandle.Backspace === keyPressed && (ev.ctrlKey || ev.metaKey)) {
      // if ctrl + backspace is pressed -> we try to clear latex
      this.clearLatex();
      return;
    }
    if (KeysToIgnore.includes(ev.key) && !this.forEquationEditor) {
      return;
    }

    // we reset the undo history if the user inputs anything
    this.undoHistory = [];

    if (KeysAsKeystrokes.includes(ev.key)) {
      this.addToInputHistory('key', ev.key);
    } else {
      this.addToInputHistory('text', ev.key);
    }
  }

  /**
   * Check if any of the trignometric function is used in latex
   *
   */
  isTrigonometryUsed() {
    const latex = this.parseCurrentLatex();
    if (!latex) {
      return false;
    }
    return latex.match(/(sin)|(cos)|(tan)|(arcsin)|(arccos)|(arctan)/gi);
  }
}

const isMac = browserOS()?.isMac;

/**
 * Storing these here to keep all data about MathQuill encapsulated in this service instead of putting this in the `Constants` file
 * Can move this later if needed
 */

export const EquationEditorLatexSymbols = {
  conditions: {
    gridCols: 2,
    keys: [
      {
        icon: 'logxy', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'l'], customCommand: CustomKeysToHandle.LOG,
      },
      {
        latex: '<', icon: 'less-than', class: 'operator', keyboardShortcuts: ['<'],
      },
      {
        icon: 'root', class: 'operator cbrt', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'r'], customCommand: CustomKeysToHandle.ROOT,
      },
      { latex: '\\leq', icon: 'less-than-equal', class: 'operator' },
      {
        typedText: '(', icon: 'brackets-round', class: 'operator', keyboardShortcuts: ['('],
      },
      {
        latex: '>', icon: 'greater-than', class: 'operator', keyboardShortcuts: ['>'],
      },
      {
        latex: '\\pi', icon: 'pi', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'p'],
      },
      { latex: '\\geq', icon: 'greater-than-equal', class: 'operator' },
    ],
  },
  numpad: {
    gridCols: 3,
    keys: [
      {
        latex: '7', icon: '7', class: 'keypad', keyboardShortcuts: ['7'],
      },
      {
        latex: '8', icon: '8', class: 'keypad', keyboardShortcuts: ['8'],
      },
      {
        latex: '9', icon: '9', class: 'keypad', keyboardShortcuts: ['9'],
      },
      {
        latex: '4', icon: '4', class: 'keypad', keyboardShortcuts: ['4'],
      },
      {
        latex: '5', icon: '5', class: 'keypad', keyboardShortcuts: ['5'],
      },
      {
        latex: '6', icon: '6', class: 'keypad', keyboardShortcuts: ['6'],
      },
      {
        latex: '1', icon: '1', class: 'keypad', keyboardShortcuts: ['1'],
      },
      {
        latex: '2', icon: '2', class: 'keypad', keyboardShortcuts: ['2'],
      },
      {
        latex: '3', icon: '3', class: 'keypad', keyboardShortcuts: ['3'],
      },
      {
        typedText: '.', icon: 'period', class: 'keypad', keyboardShortcuts: ['.'],
      },
      {
        latex: '0', icon: '0', class: 'keypad', keyboardShortcuts: ['0'],
      },
      {
        latex: '=', icon: 'equals', class: 'keypad', keyboardShortcuts: ['='],
      },
    ],
  },
  operators: {
    gridCols: 2,
    keys: [
      {
        latex: '\\div', icon: 'divide', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, '/'],
      },
      {
        typedText: '^', icon: 'expo', class: 'operator exp', keyboardShortcuts: ['^'],
      },
      {
        latex: '\\times', icon: 'times', class: 'operator', keyboardShortcuts: ['*'],
      },
      {
        latex: '\\frac{}{}', keystrokeAfterText: 'Left', icon: 'frac', class: 'operator frac', keyboardShortcuts: ['/'],
      },
      {
        latex: '-', icon: 'minus', class: 'operator', keyboardShortcuts: ['-'],
      },
      {
        icon: 'variable', class: 'operator', customCommand: CustomKeysToHandle.CUSTOM, keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'x'],
      },
      {
        latex: '+', icon: 'plus', class: 'operator', keyboardShortcuts: ['+'],
      },
      {
        icon: 'trig', class: 'operator trig', customCommand: CustomKeysToHandle.TRIGONOMETRY, keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o'],
      },
    ],
  },
};

export const Commands = {
  cursorShift: {
    gridCols: 2,
    keys: [
      {
        icon: 'arrow-left', class: 'operator', command: CommandsEnum.LEFT, keyboardShortcuts: ['←'],
      },
      {
        icon: 'arrow-right', class: 'operator', command: CommandsEnum.RIGHT, keyboardShortcuts: ['➔'],
      },
    ],
  },
  undoRedo: {
    gridCols: 2,
    keys: [
      {
        icon: 'arrow-rotate-left', class: 'operator', command: CommandsEnum.UNDO, keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'z'],
      },
      {
        icon: 'arrow-rotate-right', class: 'operator', command: CommandsEnum.REDO, keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'Shift', 'z'],
      },
    ],
  },
  delete: {
    gridCols: 1,
    keys: [
      {
        icon: 'delete-left', class: 'operator', command: CommandsEnum.DELETE, keyboardShortcuts: [`${isMac ? 'delete' : 'backspace'}`],
      },
    ],
  },
};

/**
 * Tips to show the user to inform them about keyboard shortcuts for MathQuill
 * The index of the tip in this array corresponds to the `tip` field in the LatexSymbol object
 */
const MathQuillTipsTranslationsInjection = [' <span class="bg-light-1 rounded p-0.5 m-1">^</span> ', '<span class="bg-light-1 rounded p-0.5 m-1">(Shift+6)</span>', '<span class="bg-light-1 rounded p-0.5 m-1">_</span>', '<span class="bg-light-1 rounded p-0.5 m-1">(Shift+minus)</span>', '<span class="bg-light-1 rounded p-0.5 m-1">/</span>'];
export const MathQuillTips = [
  i18n('You can type the {$1} key {$2} for superscript', [MathQuillTipsTranslationsInjection[0], MathQuillTipsTranslationsInjection[1]]),
  i18n('You can type the {$1} key {$2} for subscript', [MathQuillTipsTranslationsInjection[2], MathQuillTipsTranslationsInjection[3]]),
  i18n('Type {$1} to convert the selected equation to a fraction', [MathQuillTipsTranslationsInjection[4]]),
];

/**
 * Storing these here to keep all data about MathQuill encapsulated in this service instead of putting this in the `Constants` file
 * Can move this later if needed
 */
export const LatexSymbols = {
  basic: {
    numpad: {
      gridCols: 4,
      keys: [
        {
          label: 'a^2', typedText: '^2', color: 'gray', keystrokeAfterText: 'Right', tip: 0,
        },
        {
          label: 'a^x', typedText: '^', color: 'gray', tip: 0,
        },
        {
          label: 'a_x', typedText: '_', color: 'gray', tip: 1,
        },
        {
          label: '\\nthroot{x}{a}', latex: '\\sqrt[]{}', keystrokeAfterText: 'Left Left', color: 'gray',
        },
        {
          label: '\\frac{a}{x}', typedText: '/', color: 'gray', tip: 2,
        },
        {
          label: '\\left|x\\right|', latex: '\\left|\\right|', keystrokeAfterText: 'Left', color: 'gray',
        },
        { label: '\\lceil{x}\\rceil', latex: '\\lceil{x}\\rceil', color: 'gray' },
        { label: '\\lfloor{x}\\rfloor', latex: '\\lfloor{x}\\rfloor', color: 'gray' },
        {
          label: '\\frac{\\text{d}x}{\\text{d}y}', latex: '\\frac{\\text{d}x}{\\text{d}y}', color: 'gray', tip: 2,
        },
        {
          label: '\\frac{\\partial x}{\\partial y}', latex: '\\frac{\\partial x}{\\partial y}', color: 'gray', tip: 2,
        },
        { label: '\\int_{x}^{y} ', latex: '\\int_{x}^{y} ', color: 'gray' },
        { label: '\\oint_{x}^{y}', latex: '\\oint_{x}^{y}', color: 'gray' },
        { label: '\\log_xy', latex: '\\log_xy', color: 'gray' },
        {
          label: '\\lim_{x \\rightarrow y}', latex: '\\lim_{x \\rightarrow y}', color: 'gray', fontSize: 11,
        },
        {
          label: '\\sum_x^y', latex: '\\sum_x^y', color: 'gray', fontSize: 13,
        },
        {
          label: '\\prod_x^y', latex: '\\prod_x^y', color: 'gray', fontSize: 13,
        },
        { label: '\\overleftarrow{xy}', latex: '\\overleftarrow{xy}', color: 'gray' },
        { label: '\\overline{xy}', latex: '\\overline{xy}', color: 'gray' },
        { label: '\\overrightarrow{xy}', latex: '\\overrightarrow{xy}', color: 'gray' },
        { label: '\\cdot', latex: '\\cdot', color: 'gray' },
      ],
    },
    arithmetic: {
      gridCols: 3,
      keys: [
        { label: '+', latex: '+', color: 'orange' },
        { label: '-', latex: '-', color: 'orange' },
        { label: '\\pm', latex: '\\pm', color: 'orange' },
        { label: '\\times', latex: '\\times', color: 'orange' },
        {
          label: '\\div', latex: '\\div', color: 'orange', tip: 2,
        },
        { label: '=', latex: '=', color: 'orange' },
        { label: '<', latex: '<', color: 'orange' },
        { label: '>', latex: '>', color: 'orange' },
        { label: '\\neq', latex: '\\neq', color: 'orange' },
        { label: '\\leq', latex: '\\leq', color: 'orange' },
        { label: '\\geq', latex: '\\geq', color: 'orange' },
        { label: '\\equiv', latex: '\\equiv', color: 'orange' },
        { label: '\\sim', latex: '\\sim', color: 'orange' },
        { label: '\\approx', latex: '\\approx', color: 'orange' },
        { label: '\\cong', latex: '\\cong', color: 'orange' },
      ],
    },
    commands: {
      gridCols: 3,
      keys: [
        { label: '\\pi', latex: '\\pi', color: 'purple' },
        { label: '\\theta', latex: '\\theta', color: 'purple' },
        { label: '\\Delta', latex: '\\Delta', color: 'purple' },
        { label: '\\alpha', latex: '\\alpha', color: 'purple' },
        { label: '\\beta', latex: '\\beta', color: 'purple' },
        { label: '\\nabla', latex: '\\nabla', color: 'purple' },
        { label: '\\parallel', latex: '\\parallel', color: 'purple' },
        { label: '\\perpendicular', latex: '\\perpendicular', color: 'purple' },
        { label: '\\angle', latex: '\\angle', color: 'purple' },
        { label: '\\degree', latex: '\\degree', color: 'purple' },
        { label: '\\infty', latex: '\\infty', color: 'purple' },
        { label: '\\propto', latex: '\\propto', color: 'purple' },
        { label: '\\leftarrow', latex: '\\leftarrow', color: 'purple' },
        { label: '\\rightarrow', latex: '\\rightarrow', color: 'purple' },
        { label: '\\leftrightarrow', latex: '\\leftrightarrow', color: 'purple' },
      ],
    },
  },
  greek: {
    small: {
      gridCols: 5,
      keys: [
        { label: '\\alpha', latex: '\\alpha', color: 'orange' },
        { label: '\\beta', latex: '\\beta', color: 'orange' },
        { label: '\\gamma', latex: '\\gamma', color: 'orange' },
        { label: '\\delta', latex: '\\delta', color: 'orange' },
        { label: '\\epsilon', latex: '\\epsilon', color: 'orange' },
        { label: '\\zeta', latex: '\\zeta', color: 'orange' },
        { label: '\\eta', latex: '\\eta', color: 'orange' },
        { label: '\\theta', latex: '\\theta', color: 'orange' },
        { label: '\\iota', latex: '\\iota', color: 'orange' },
        { label: '\\kappa', latex: '\\kappa', color: 'orange' },
        { label: '\\lambda', latex: '\\lambda', color: 'orange' },
        { label: '\\mu', latex: '\\mu', color: 'orange' },
        { label: '\\nu', latex: '\\nu', color: 'orange' },
        { label: '\\xi', latex: '\\xi', color: 'orange' },
        { label: 'o', latex: 'o', color: 'orange' },
        { label: '\\pi', latex: '\\pi', color: 'orange' },
        { label: '\\rho', latex: '\\rho', color: 'orange' },
        { label: '\\sigma', latex: '\\sigma', color: 'orange' },
        { label: '\\tau', latex: '\\tau', color: 'orange' },
        { label: '\\upsilon', latex: '\\upsilon', color: 'orange' },
        { label: '\\phi', latex: '\\phi', color: 'orange' },
        { label: '\\chi', latex: '\\chi', color: 'orange' },
        { label: '\\psi', latex: '\\psi', color: 'orange' },
        { label: '\\omega', latex: '\\omega', color: 'orange' },
      ],
    },
    capital: {
      gridCols: 5,
      keys: [
        { label: 'A', latex: 'A', color: 'purple' },
        { label: 'B', latex: 'B', color: 'purple' },
        { label: '\\Gamma', latex: '\\Gamma', color: 'purple' },
        { label: '\\Delta', latex: '\\Delta', color: 'purple' },
        { label: 'E', latex: 'E', color: 'purple' },
        { label: 'Z', latex: 'Z', color: 'purple' },
        { label: 'H', latex: 'H', color: 'purple' },
        { label: '\\Theta', latex: '\\Theta', color: 'purple' },
        { label: 'I', latex: 'I', color: 'purple' },
        { label: 'K', latex: 'K', color: 'purple' },
        { label: '\\Lambda', latex: '\\Lambda', color: 'purple' },
        { label: 'M', latex: 'M', color: 'purple' },
        { label: 'N', latex: 'N', color: 'purple' },
        { label: '\\Xi', latex: '\\Xi', color: 'purple' },
        { label: 'O', latex: 'O', color: 'purple' },
        { label: '\\Pi', latex: '\\Pi', color: 'purple' },
        { label: 'P', latex: 'P', color: 'purple' },
        { label: '\\Sigma', latex: '\\Sigma', color: 'purple' },
        { label: 'T', latex: 'T', color: 'purple' },
        { label: '\\Upsilon', latex: '\\Upsilon', color: 'purple' },
        { label: '\\Phi', latex: '\\Phi', color: 'purple' },
        { label: 'X', latex: 'X', color: 'purple' },
        { label: '\\Psi', latex: '\\Psi', color: 'purple' },
        { label: '\\Omega', latex: '\\Omega', color: 'purple' },
      ],
    },
  },
  advanced: {
    commands1: {
      gridCols: 4,
      keys: [
        { label: '\\subset', latex: '\\subset', color: 'orange' },
        { label: '\\subseteq', latex: '\\subseteq', color: 'orange' },
        { label: '\\notsubset', latex: '\\notsubset', color: 'orange' },
        { label: '\\notsubseteq', latex: '\\notsubseteq', color: 'orange' },

        { label: '\\supset', latex: '\\supset', color: 'orange' },
        { label: '\\supseteq', latex: '\\supseteq', color: 'orange' },
        { label: '\\notsupset', latex: '\\notsupset', color: 'orange' },
        { label: '\\notsupseteq', latex: '\\notsupseteq', color: 'orange' },
        { label: '\\in', latex: '\\in', color: 'orange' },
        { label: '\\ni', latex: '\\ni', color: 'orange' },
        { label: '\\notin', latex: '\\notin', color: 'orange' },
        { label: '\\notni', latex: '\\notni', color: 'orange' },
        { label: '\\cup', latex: '\\cup', color: 'orange' },
        { label: '\\cap', latex: '\\cap', color: 'orange' },
        { label: '\\forall', latex: '\\forall', color: 'orange' },
        { label: '\\exists', latex: '\\exists', color: 'orange' },
        { label: '\\vee', latex: '\\vee', color: 'orange' },
        { label: '\\wedge', latex: '\\wedge', color: 'orange' },
        { label: '\\because', latex: '\\because', color: 'orange' },
        { label: '\\therefore', latex: '\\therefore', color: 'orange' },
      ],
    },
    commands2: {
      gridCols: 3,
      keys: [
        { label: '\\longleftarrow', latex: '\\longleftarrow', color: 'purple' },
        { label: '\\longrightarrow', latex: '\\longrightarrow', color: 'purple' },
        { label: '\\longleftrightarrow', latex: '\\longleftrightarrow', color: 'purple' },
        { label: '\\Longleftarrow', latex: '\\Longleftarrow', color: 'purple' },
        { label: '\\Longrightarrow', latex: '\\Longrightarrow', color: 'purple' },
        { label: '\\Longleftrightarrow', latex: '\\Longleftrightarrow', color: 'purple' },
        { label: '\\uparrow', latex: '\\uparrow', color: 'purple' },
        { label: '\\Uparrow', latex: '\\Uparrow', color: 'purple' },
        { label: '\\updownarrow', latex: '\\updownarrow', color: 'purple' },
        { label: '\\downarrow', latex: '\\downarrow', color: 'purple' },
        { label: '\\Downarrow', latex: '\\Downarrow', color: 'purple' },
        { label: '\\Updownarrow', latex: '\\Updownarrow', color: 'purple' },
        { label: '\\ldots', latex: '\\ldots', color: 'purple' },
        { label: '\\cdots', latex: '\\cdots', color: 'purple' },
        { label: '\\circ', latex: '\\circ', color: 'purple' },
      ],
    },
  },

};

/** Symbols/functions to handle variables, trigonometric functions, square and cube roots */
export const AdditionalLatexSymbols = {
  customVariables: {
    gridCols: 4,
    keys: [
      {
        latex: 'x', btnText: 'x', class: 'operator', keyboardShortcuts: ['x'],
      },
      {
        latex: 'y', btnText: 'y', class: 'operator', keyboardShortcuts: ['y'],
      },
      {
        latex: 'z', btnText: 'z', class: 'operator', keyboardShortcuts: ['z'],
      },
      {
        latex: 't', btnText: 't', class: 'operator', keyboardShortcuts: ['t'],
      },
      {
        latex: 'a', btnText: 'a', class: 'operator', keyboardShortcuts: ['a'],
      },
      {
        latex: 'b', btnText: 'b', class: 'operator', keyboardShortcuts: ['b'],
      },
      {
        latex: 'c', btnText: 'c', class: 'operator', keyboardShortcuts: ['c'],
      },
      {
        latex: 'l', btnText: 'l', class: 'operator', keyboardShortcuts: ['l'],
      },
    ],
  },
  trigonometry: {
    gridCols: 4,
    keys: [
      {
        latex: '\\sin', btnText: 'sin', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o', '1'],
      },
      {
        latex: '\\cos', btnText: 'cos', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o', '2'],
      },
      {
        latex: '\\tan', btnText: 'tan', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o', '3'],
      },
      {
        latex: '\\arcsin', btnText: 'arcsin', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o', '4'], widthContent: 24,
      },
      {
        latex: '\\arccos', btnText: 'arccos', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o', '5'], widthContent: 24,
      },
      {
        latex: '\\arctan', btnText: 'arctan', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o', '6'], widthContent: 24,
      },
      {
        latex: '\\theta', icon: 'thetaIcon', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o', '7'], fitContent: 10,
      },
      {
        latex: '\\phi', icon: 'phi', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'o', '8'], fitContent: 10,
      },
    ],
  },
  root: {
    gridCols: 3,
    keys: [
      {
        latex: '\\sqrt{}', keystrokeAfterText: 'Left', icon: 'square-root', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'r', '1'],
      },
      {
        latex: '\\sqrt[3]{}', keystrokeAfterText: 'Left', icon: 'cbrt', class: 'operator cbrt', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'r', '2'],
      },
      {
        latex: '\\sqrt[]{}', keystrokeAfterText: 'Left Left', icon: 'root', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'r', '3'],
      },
    ],
  },
  log: {
    gridCols: 2,
    keys: [
      {
        latex: '\\log_{} \\left({}\\right)', keystrokeAfterText: 'Left Left Left', icon: 'logxy', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'l', '1'],
      },
      {
        latex: '\\ln {}', icon: 'logey', class: 'operator', keyboardShortcuts: [`${isMac ? '⌘' : 'Ctrl'}`, 'l', '2'],
      },
    ],
  },
};

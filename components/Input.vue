// TODO: use v-model
<template>
  <div
    :class="[
      'relative w-full',
      disabled ? 'pointer-events-none cursor-not-allowed' : '',
      inheritBorderRadius ? 'border-radius-inherit' : '',
    ]"
  >
    <label
      v-if="hasLabel"
      :class="[
        'font-semibold text-xs mb-1 ml-1',
        type === 'special'
          ? 'absolute text-dark-5 bg-light px-1 left-2.5 -top-1.5 z-10'
          : 'text-dark-4',
      ]"
      :for="inputId"
    >
      {{ label }}
    </label>

    <div
      :class="['relative', inheritBorderRadius ? 'border-radius-inherit' : '']"
    >
      <div
        v-if="hasLIcon"
        :class="[
          'w-6 h-6 flex items-center justify-center absolute left-2 top-2 pt-0.5',
          disabled ? 'text-dark-5' : 'text-dark-4',
        ]"
      >
        <FA
          :icon="licon"
          :class="[
            liconClasses,
            customPlaceholder ? 'custom-placeholder-icon' : '',
          ]"
          :size="liconSize"
        />
      </div>

      <input
        :id="inputId"
        ref="input"
        v-model="inputValue"
        aria-describedby="input-error-message"
        :aria-invalid="!!errorMessage"
        :aria-required="required"
        :type="isInputTypePassword ? passwordInputType : inputType"
        :name="label"
        :class="[
          'focus:outline-none h-10 w-full py-2 text-sm placeholder-sm',
          inputClasses,
          inheritBorderRadius ? 'border-radius-inherit' : '',
          removeNumberSelectors ? 'remove-number-selector' : '',
          customPlaceholder ? 'custom-placeholder' : '',
          hasLIcon ? 'pl-9' : 'pl-3',
          internalInputClasses,
          hasTIcon || isClearable ? 'pr-9' : 'pr-3',
          inputRightPadding,
        ]"
        :autofocus="autofocus"
        :placeholder="placeholder"
        :disabled="disabled ? disabled : undefined"
        :autocomplete="autocomplete ? autocomplete : undefined"
        :lang="inputLang"
        :maxlength="maxlength"
        :tabindex="tabindex"
        :readonly="readonly"
        @click.stop="(event) => { stopPropagation ? event.stopPropagation() : undefined }"
        @focus="$emit('focus')"
        @change="$emit('change')"
        @blur="onBlur"
        @input="onInput"
        @keydown="$emit('keydown', $event)"
        @keyup="$emit('keyup', $event)"
        @paste="$emit('paste', $event)"
      />

      <div
        v-if="hasTIcon || (isClearable && !isInputValueEmpty)"
        ref="tiIcon"
        :class="[
          'w-6 h-6 flex items-center justify-center absolute right-2 top-2 pt-0.5',
          disabled ? 'text-dark-5' : null,
          ticonWrapperClasses,
        ]"
        @click.stop="(event) => onTiIconClick(event)"
      >
        <FA
          :icon="isClearable ? 'fas fa-xmark' : ticon"
          :class="[ticonClasses, isClearable ? 'cursor-pointer' : null]"
          :size="ticonSize"
        />
      </div>

      <div
        v-if="isInputTypePassword && !isInputValueEmpty"
        :class="[
          'w-6 h-6 flex items-center justify-center absolute right-2 top-2',
          disabled ? 'text-dark-5' : '',
          ticonWrapperClasses,
        ]"
        @click="onTiIconClick"
      >
        <FA
          :icon="isPasswordVisible ? 'far fa-eye-slash' : 'far fa-eye' "
          :class="`text-lilac cursor-pointer`"
          :size="ticonSize"
        />
      </div>

      <div
        v-if="hasOptions"
        class="absolute w-24 top-1 right-1"
      >
        <SelectBox
          class="w-full"
          size="sm"
          type="other"
          :disabled="disabled"
          :list="options"
          :value="selectedOption"
          @input="$emit('optionSelected', $event)"
        />
      </div>

      <div
        v-if="showCharLimit"
        class="absolute flex items-center justify-center w-6 h-6 text-xs font-semibold top-2 text-dark-5"
        :class="{
          'right-10': hasTIcon,
          'right-28': hasOptions,
          'right-2': hasButton || !hasOptions,
        }"
      >
        {{ finalValue ? finalValue.length : 0 }}/{{ maxlength }}
      </div>

      <div
        v-if="hasButton"
        class="absolute inline-table top-1 right-1"
        :class="btnContainerClasses"
      >
        <Button
          :class="btnClasses"
          v-bind="buttonProps"
          @click="$emit('buttonClicked')"
        />
      </div>
    </div>

    <div
      v-show="errorMessage || hasLimitError"
      class="flex pt-1 text-xs font-semibold text-red"
      aria-live="assertive"
    >
      <span class="w-4 h-4 flex items-center justify-center mr-0.5">
        <FA
          :size="11"
          icon="far fa-exclamation-circle"
        />
      </span>
      <span id="input-error-message">
        {{ errorMessage || limitErrorMessage }}
      </span>
    </div>

    <div
      v-for="(errorMsg, ind) in multipleErrorMessage"
      v-show="multipleErrorMessage"
      :key="ind"
      class="flex pt-1 text-xs font-semibold text-red"
      aria-live="assertive"
    >
      <span class="w-4 h-4 flex items-center justify-center mr-0.5">
        <FA
          :size="11"
          icon="far fa-exclamation-circle"
        />
      </span>
      <span id="input-error-message">
        {{ errorMsg }}
      </span>
    </div>
    <div
      v-if="showTypeahead"
      class="absolute z-10 w-full h-20 mt-2 overflow-y-auto rounded-lg shadow-md bg-light"
    >
      <slot name="results" />
    </div>
  </div>
</template>

<script>
// focus:border-lilac  rounded placeholder-dark-5
/**
 * @see https://www.figma.com/file/xI2rscFgakPKI7M4WqUBr4/Educators?node-id=642%3A1056 Referece to input types
 * TODO: use descriptive prop names (labelPostion: inset, default)
 * @param {String} type special, default -> Special is with the label positioned on the input border
 * @param {String} label Label text
 * @param {String} placeholder Placeholder fot input
 * TODO: let's stick to native attribute names to avoid confusion
 * @param {String} inputType - Type of input
 * @param {Array} options - If a list is to be shown, pass options object with a title and value
 * @param {String} selectedOption - If a list is to be show, pass selectedOption value as the default option to be selected
 * @param {Button} button - If a button is to be shown in the input, pass a button object props. See Button component for schema
 * @param {Number} liconSize - Set left icon size
 * @param {Number} ticonSize - Set right icon size
 *
 */
import isEmpty from 'lodash/isEmpty';

import { enumProps } from '~/config/Atoms';

export default {
  props: {
    inputId: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Placeholder',
    },
    inputType: {
      type: String,
      default: 'text',
      validator: (val) => enumProps.Input.inputType.includes(val),
    },

    type: {
      type: String,
      default: 'default',
      validator: (val) => enumProps.Input.type.includes(val),
    },

    theme: {
      type: String,
      default: 'light',
      validator: (val) => enumProps.Input.theme.includes(val),
    },

    licon: {
      type: String,
      default: '',
    },
    liconClasses: {
      type: String,
      default: '',
    },
    ticon: {
      type: String,
      default: '',
    },
    ticonWrapperClasses: {
      type: String,
      default: '',
    },
    ticonClasses: {
      type: String,
      default: '',
    },
    inputClasses: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    selectedOption: {
      type: String,
      default: '',
    },
    button: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    autocomplete: {
      type: String,
      default: '',
      validator: (val) => enumProps.Input.autocomplete.includes(val),
    },

    noRing: {
      type: Boolean,
      default: false,
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
    inheritBorderRadius: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    multipleErrorMessage: {
      type: Array,
      default: () => [],
    },
    value: {
      type: String,
      default: '',
    },
    modelValue: {
      type: String,
      default: null,
    },
    inputLang: {
      type: String,
      default: '',
    },
    removeNumberSelectors: {
      type: Boolean,
      default: true,
    },

    textColorClass: {
      type: String,
      default: '',
    },

    maxlength: {
      type: Number,
      default: -1,
    },

    showCharLimit: {
      type: Boolean,
      default: false,
    },
    liconSize: {
      type: Number,
      default: 12,
    },
    ticonSize: {
      type: Number,
      default: 12,
    },
    customPlaceholder: {
      type: Boolean,
      default: false,
    },
    tabindex: {
      type: Number,
      default: 0,
    },
    showTypeahead: {
      type: Boolean,
      default: false,
    },
    disableButtonWidth: {
      type: Boolean,
      default: false,
    },
    ringInset: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    stopPropagation: {
      type: Boolean,
      default: true,
    },
    isClearable: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['focus', 'change', 'keydown', 'keyup', 'paste', 'optionSelected', 'buttonClicked', 'blur', 'input', 'tIconClicked', 'update:modelValue'],

  data() {
    return {
      inputValue: this.modelValue ?? this.value,
      passwordInputType: 'password',
    };
  },

  computed: {
    finalValue() {
      return this.modelValue ?? this.value;
    },

    inputRightPadding() {
      if (this.hasTIcon && this.hasCharLimit) { return 'pr-20'; }
      if (this.hasOptions && this.hasCharLimit) { return 'pr-38'; }
      if (this.hasTIcon) { return 'pr-10'; }
      if (this.hasOptions) { return 'pr-26'; }
      if (this.hasCharLimit || this.doesBtnHaveOnlyIcon) { return 'pr-12'; }
      if (!this.hasButton) { return 'pr-2'; }

      return 'pr-2';
    },

    isInputTypePassword() {
      return this.inputType === 'password';
    },

    isInputValueEmpty() {
      return this.inputValue.length === 0;
    },

    limitErrorMessage() {
      return (this.finalValue?.length > this.maxlength) && this.hasCharLimit ? this.$i18n(`Please enter a name with ${this.maxlength} or fewer characters`) : '';
    },
    hasLabel() {
      return !isEmpty(this.label);
    },
    hasLIcon() {
      return !isEmpty(this.licon);
    },
    hasTIcon() {
      return !isEmpty(this.ticon);
    },
    hasOptions() {
      return !isEmpty(this.options);
    },
    hasButton() {
      const btnTitle = this.buttonProps?.title;
      const btnIcon = this.buttonProps?.licon || this.buttonProps?.ticon;

      return Boolean(btnTitle || btnIcon);
    },

    hasCharLimit() {
      return this.maxlength > 0 && this.showCharLimit;
    },

    hasLimitError() {
      return !isEmpty(this.limitErrorMessage);
    },

    doesBtnHaveOnlyIcon() {
      if (!this.hasButton) {
        return false;
      }

      return Boolean(this.buttonProps.title) === false;
    },

    internalInputClasses() {
      let cls = '';

      if (this.theme === 'light') {
        if (this.type === 'header') {
          return 'rounded-tl-lg rounded-bl-lg bg-transparent text-dark-2 border-light-3 placeholder-dark-2 font-semibold';
        }

        if (!this.noBorder) {
          cls = 'border border-solid border-dark-6 rounded ';
        }

        if (!this.noRing) {
          cls += 'focus:ring-2 focus:ring-lilac focus:ring-offset-0 ';
        }

        if (this.ringInset) {
          cls += 'focus:ring-inset ';
        }

        if (this.disabled) {
          cls += 'bg-light-1 text-dark-5 ';
        } else if (this.textColorClass) {
          cls += ` ${this.textColorClass}`;
        } else { cls += 'bg-light-3 text-dark-2 '; }

        cls += ' border-dark-4 placeholder-dark-5';

        return cls;
      }

      if (this.theme === 'dark' || this.theme === 'semi-dark') {
        // if (this.type === 'header') {
        //   return 'rounded-tl-lg rounded-bl-lg bg-transparent text-light-3 border-light-3 placeholder-light-3 font-semibold';
        // }

        let cls = '';

        if (!this.noBorder) {
          cls = 'border border-solid rounded ';
        }

        if (!this.noRing) {
          cls += 'focus:ring-2 focus:ring-lilac ';
        }

        if (this.ringInset) {
          cls += 'focus:ring-inset ';
        }

        if (this.disabled) {
          cls += 'bg-dark-20% text-light-20% ';
        } else if (this.theme === 'dark') {
          cls += 'bg-dark-50% text-light-3 ';
        } else if (this.theme === 'semi-dark') {
          cls += 'bg-dark-20% text-light-3 ';
        } else if (this.textColorClass) {
          cls += ` ${this.textColorClass}`;
        }

        cls += ' border-dark-20% placeholder-light-50%';

        return cls;
      }

      return cls;
    },

    buttonProps() {
      return {
        // Default button props
        title: '',
        licon: '',
        type: 'other',
        size: 'md',

        // button props passed from parent
        ...this.button,
      };
    },

    btnContainerClasses() {
      const classes = [];

      if (!this.hasButton || this.doesBtnHaveOnlyIcon) {
        return classes;
      }

      if (!this.disableButtonWidth) {
        classes.push('w-20');
      }

      return classes;
    },

    btnClasses() {
      const classes = [];

      if (!this.hasButton || this.doesBtnHaveOnlyIcon) {
        return classes;
      }

      classes.push('w-full');

      return classes;
    },

    isPasswordVisible() {
      return this.passwordInputType === 'text';
    },
  },

  watch: {
    finalValue(newValue) {
      this.inputValue = newValue;
    },
  },

  methods: {
    onBlur(ev) {
      if (this.isMobile) {
        if (window) {
          const body = document.querySelector('body');
          this.$scrollTo(body, 0);
        }
      }

      if (this.isClearable) {
        return;
      }

      this.$emit('blur');
    },

    clear() {
      this.inputValue = '';
    },

    getValue() {
      return this.inputValue;
    },

    setValue(value) {
      this.inputValue = value;
    },

    onInput(event) {
      this.inputValue = event.target.value;
      this.$emit('update:modelValue', event.target.value);
      this.$emit('input', event.target.value, event);
    },

    onTiIconClick(event) {
      if (this.isClearable) {
        this.inputValue = '';
        this.$emit('update:modelValue', '');
        this.$emit('input', event.target.value, event);
        const { input } = this.$refs;
        input.focus();
        return;
      }

      if (this.isInputTypePassword) {
        this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
      } else {
        this.$emit('tIconClicked');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.border-radius-inherit {
  border-radius: inherit;
}

.remove-number-selector {
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type=number] {
    -moz-appearance: textfield;
  }
}

.custom-placeholder {
  &::placeholder {
    color: #B6B6B6;
    font-weight: 600;
  }
}

.custom-placeholder-icon {
  font-weight: 600 !important;
}
</style>

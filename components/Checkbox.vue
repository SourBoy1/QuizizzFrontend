// TODO: use v-model

<template>
  <div
    class="relative inline-flex checkbox"
    :class="[size]"
    :style="getStyles"
  >
    <input
      :id="inputId"
      :class="['checkbox__input absolute mr-2 w-px h-px overflow-hidden cursor-pointer', { showFocusOutline: showFocusOutline }]"
      type="checkbox"
      :aria-checked="checked"
      :checked="checked"
      :disabled="disabled"
      :name="label"
      :value="value"
      :aria-label="label"
      @keyup.enter="onChange"
      @change="onChange"
      @input="onInput"
    />

    <label
      class="relative flex items-center select-none checkbox__label whitespace-nowrap"
      :class="[
        !disabled ? 'cursor-pointer' : '',
        label ? 'has-label' : '',
        isLabelLeading ? 'leading-label flex-row-reverse' : '',
        checkBgColor,
        isFullWidth ? 'w-full' : '',
        hasWhiteBorder ? 'white-border' : '',
      ]"
      :data-cy="`checkbox:${cypressIdentifier}`"
      :for="inputId"
      @mousedown="beforeToggle"
    >
      <span :style="labelStyles">{{ label }}</span>
    </label>
  </div>
</template>

<script>
import get from 'lodash/get';

import selectText from '~/utils/TextSelectionUtil';
import { enumProps } from '~/config/Atoms';
import tailwindConfig from '../../tailwind.config';

let textNode = null;
let anchorOffset = -1;
let focusOffset = -1;
export default {
  props: {
    inputId: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    isLabelLeading: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'md',
      validator: (val) => enumProps.Checkbox.size.includes(val),
    },

    name: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    checked: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    checkBgColor: {
      type: String,
      default: '',
    },

    hasWhiteBorder: {
      type: Boolean,
      default: false,
    },

    labelStyles: {
      type: Object,
      default: () => {},
    },

    showFocusOutline: {
      type: Boolean,
      default: true,
    },

    buttonColorBefore: { // eg: border-<red> -> input[type=checkbox]:before {...}
      type: String,
      default: 'border-dark-10%',
    },

    cypressIdentifier: {
      type: String,
      default: '',
    },

    isFullWidth: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['statusChanged', 'change', 'input'],

  computed: {
    getCheckboxColorBefore() {
      const color = (this.buttonColorBefore).split('-');
      color[0] = 'colors';
      if (color.length === 2) {
        color[2] = 'DEFAULT';
      }
      const sanitizedColor = color.join('.');
      return get(tailwindConfig.theme, sanitizedColor || 'colors.dark.10%');
    },

    getStyles() {
      let styles = '';
      styles += `--buttonColorBefore: ${this.getCheckboxColorBefore} `;
      return styles;
    },
  },

  methods: {
    getID() {
      return self.id;
    },

    triggerCheckboxChanged(ev) {
      const checkedStatus = ev.originalTarget.checked;
      this.$emit('statusChanged', { checkedStatus, inputId: this.inputId });
    },

    onChange(event) {
      selectText(textNode, anchorOffset, focusOffset);
      this.$emit('change', event.target.checked);
    },

    onInput(event) {
      selectText(textNode, anchorOffset, focusOffset);
      this.$emit('input', event.target.checked);
    },

    beforeToggle() {
      const selection = window.getSelection();
      if (!selection.anchorNode) {
        return;
      }
      textNode = selection.anchorNode;
      anchorOffset = selection.anchorOffset;
      focusOffset = selection.focusOffset;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/extends.scss';
/* label::before is the custom input box */
/* label::after is the custom check mark */
.checkbox__input {
  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
  clip: rect(1px, 1px, 1px, 1px);
  &:hover + label {
    color: #6d6d6d;
  }
  &:disabled + label {
    color: #424242;
    &::before {
      background: #e5e5e5;
    }
  }
  &:checked + label {
    &.lilac {
      &::before {
        background: #8854C0;
        border: 1px solid #8854C0;
      }
    }

    &::before {
      background: #00a06a;
      border: 1px solid #00a06a;
    }

    &.white-border {
      &::before {
        border: 1px solid #FFFFFF;
      }
    }
    &::after {
      content: '';
      position: absolute;
      border-left: 2px solid white;
      border-bottom: 2px solid white;
      height: 4px;
      width: 7.8px;
      transform: rotate(-45deg);
    }
  }
  &:checked:disabled + label {
    &::before {
      background: #e5e5e5;
      border: 1px solid rgba(9, 9, 9, 0.2);
    }
    &::after {
      border-left: 2px solid rgba(9, 9, 9, 0.2);
      border-bottom: 2px solid rgba(9, 9, 9, 0.2);
    }
  }
    &.showFocusOutline:focus + label {
    &::before {
      @extend %default-focus;
    }
  }
}

.checkbox__label {
  &::before {
    flex-shrink:0;
    content: '';
    position: relative;
    display: inline-block;
    margin-right: 10px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid var(--buttonColorBefore);
  }
  &.leading-label {
    &::before {
      margin-left: 10px;
      margin-right: 0;
    }
  }
}

/* md */
.checkbox.md .checkbox__label {
  font-size: 14px;
}
.checkbox.md .checkbox__label::before {
  width: 16px;
  height: 16px;
}
.checkbox.md .checkbox__label::after {
  left: 4px;
}
.checkbox.md .checkbox__label.has-label::after {
  left: 4px;
  bottom: 9px;
  top: unset;
}
.checkbox.md .checkbox__label.has-label.leading-label::after {
  right: 4px;
  bottom: 9px;
  left: unset;
  top: unset;
}

/* sm */
.checkbox.sm .checkbox__label {
  font-size: 12px;
}
.checkbox.sm .checkbox__label::before {
  width: 12px;
  height: 12px;
}
.checkbox.sm .checkbox__label::after {
  top: 3px;
  left: 2px;
}
.checkbox.sm .checkbox__label.has-label::after {
  top: 6px;
  left: 2px;
}
.checkbox.sm .checkbox__label.has-label.leading-label::after {
  top: 6px;
  right: 2px;
  left: unset;
}

/* xs */
.checkbox.xs .checkbox__label {
  font-size: 11px;
}
.checkbox.xs .checkbox__label::before {
  width: 12px;
  height: 12px;
}
.checkbox.xs .checkbox__label::after {
  top: 3px;
  left: 2px;
}
.checkbox.xs .checkbox__label.has-label::after {
  top: 5px;
  left: 2px;
}
.checkbox.xs .checkbox__label.has-label.leading-label::after {
  top: 5px;
  right: 2px;
  left: unset;
}
</style>

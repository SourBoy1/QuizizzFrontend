<template>
  <div
    v-tooltip.auto="wrapWithTooltip ? tooltipData : {}"
    class="radiobox inline-flex relative"
    :class="[size]"
  >
    <input
      :id="inputId"
      class="radiobox__input absolute mr-2 w-px h-px overflow-hidden cursor-pointer"
      type="radio"
      :checked="finalValue"
      :disabled="disabled"
      :tabindex="tabIndex"
      :name="name"
      :aria-label="label"
      :aria-checked="finalValue"
      @change="handleChange"
    />
    <label
      class="radiobox__label flex flex-row items-center whitespace-nowrap relative select-none"
      :class="[
        !disabled ? 'cursor-pointer' : '',
        label ? 'has-label' : '',
        checkBgColor,
        isFullWidth ? 'w-full' : '',
        isLabelLeading ? 'leading-label flex-row-reverse' : '',
        checkerToRight ? 'w-full' : '',
      ]"
      :data-cy="`radio:${cypressIdentifier}`"
      :for="inputId"
    >
      <div
        v-if="!checkerToRight"
        :class="['radiobox__circle', buttonColorBefore || 'border-dark-10%']"
      />
      <FA
        v-if="hasLIcon"
        :icon="licon"
        :size="iconSize"
        :class="[lIconClasses]"
      />
      <span
        :class="[
          titleClasses,
          { 'flex-1': checkerToRight },
        ]"
      >
        {{ label }}
      </span>
      <div
        v-if="checkerToRight"
        :class="['radiobox__circle', buttonColorBefore || 'border-dark-10%']"
      />
    </label>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

import { enumProps } from '~/config/Atoms';

export default {
  props: {
    checkBgColor: {
      type: String,
      default: '',
    },
    customIconSize: {
      type: Number,
      default: -1,
    },
    inputId: {
      type: String,
      default: '',
    },
    isLabelLeading: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    licon: {
      type: String,
      default: '',
    },
    liconClasses: {
      type: String,
      default: '',
    },
    titleClasses: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'md', // xs, sm, md, lg
      validator: (val) => enumProps.Radio.size.includes(val),
    },

    name: {
      type: String,
      default: '',
    },
    modelValue: {
      type: Boolean,
      default: null,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    tabIndex: {
      type: Number,
      default: 0,
    },
    buttonColorBefore: { // eg: border-<red> -> input[type=radio]:before {...}
      type: String,
      default: '',
    },
    cypressIdentifier: {
      type: String,
      default: '',
    },
    isFullWidth: {
      type: Boolean,
      default: false,
    },
    checkerToRight: {
      type: Boolean,
      default: false,
    },
    wrapWithTooltip: {
      type: Boolean,
      default: false,
    },
    tooltipText: {
      type: String,
      default: '',
    },
    tooltipPosition: {
      type: String,
      default: 'bottom-right',
    },
  },

  emits: ['change', 'update:modelValue'],

  computed: {
    finalValue() {
      return this.modelValue ?? this.checked;
    },

    hasLIcon() {
      return !isEmpty(this.licon);
    },

    hasLabel() {
      return !isEmpty(this.label);
    },

    lIconClasses() {
      let cls = '';
      if (this.hasLabel) {
        if (this.isLabelLeading) {
          cls += 'ml-1';
        } else {
          cls += 'mr-1';
        }
      }

      if (this.liconClasses) {
        cls += ` ${this.liconClasses}`;
      }

      return cls;
    },

    iconSize() {
      if (this.customIconSize !== -1) {
        return this.customIconSize;
      }
      switch (this.size) {
        case 'xs':
          return 11;
        case 'sm':
          return 11;
        case 'md':
          return 12;
        case 'lg':
          return 14;
        default:
      }
      return 12;
    },

    tooltipData() {
      const text = this.tooltipText;
      return {
        content: this.$i18n(text),
        theme: 'tooltip',
        container: 'body',
      };
    },
  },

  methods: {
    getID() {
      return self.id;
    },

    handleChange($event) {
      this.$emit('update:modelValue', $event);
      this.$emit('change', $event);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/extends.scss';
/* label::before is the custom input box */
/* label::after is the custom check mark */

//TODO: Don't use :before and :after so we can do away with css
.radiobox__circle::before {
  content: '';
  position: absolute;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.radiobox__input {
  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
  clip: rect(1px, 1px, 1px, 1px);
  &:hover + label {
    color: #6d6d6d;
  }
  &:disabled + label {
    color: #424242;
    .radiobox__circle {
      background: #e5e5e5;
    }
  }
  &:not(:checked) + label::before {
    border-width: 1px !important;
  }

  &:checked + label {
    &.lilac {
      .radiobox__circle {
        border-color: #8854C0;
        &::before {
          background: #8854C0;
        }
      }
    }

    &.yellow {
      .radiobox__circle {
        border-color: #EFA929;
        &::before {
          background: #EFA929;
        }
      }
    }

    .radiobox__circle {
      border-color: #00a06a;
      &::before {
        background: #00a06a;
      }
    }

  }
  &:checked:disabled + label {
    .radiobox__circle {
      background: #e5e5e5;
      border-color: rgba(9, 9, 9, 0.2);
      &::before {
        background: rgba(9, 9, 9, 0.2);
      }
    }

  }
  &:focus + label {
    .radiobox__circle {
      /* @extend %default-focus; */
    }
  }
}

.radiobox__label {
  .radiobox__circle {
    content: '';
    position: relative;
    display: inline-block;
    margin-right: 10px;
    background: #ffffff;
    border-radius: 2px;
    border-style: solid;
    border-radius: 50%;
  }

  &.leading-label {
    .radiobox__circle {
      margin-left: 10px;
      margin-right: 0;
    }
  }
}

/* lg */
.radiobox.lg .radiobox__label {
  font-size: 16px;
}
.radiobox.lg .radiobox__label .radiobox__circle {
  width: 20px;
  height: 20px;
  border-width: 2px;
}
.radiobox.lg .radiobox__label .radiobox__circle::before {
  height: 10px;
  width: 10px;

}

/* md */
.radiobox.md .radiobox__label {
  font-size: 14px;
}
.radiobox.md .radiobox__label .radiobox__circle {
  width: 16px;
  height: 16px;
  border-width: 2px;
}
.radiobox.md .radiobox__label .radiobox__circle::before {
  height: 8px;
  width: 8px;
}

/* sm */
.radiobox.sm .radiobox__label {
  font-size: 12px;
}
.radiobox.sm .radiobox__label .radiobox__circle {
  width: 12px;
  height: 12px;
  border-width: 1px;
}
.radiobox.sm .radiobox__label .radiobox__circle::before {
  height: 6px;
  width: 6px;
}

/* xs */
.radiobox.xs .radiobox__label {
  font-size: 11px;
}
.radiobox.xs .radiobox__label .radiobox__circle {
  width: 12px;
  height: 12px;
  border-width: 1px;
}
.radiobox.xs .radiobox__label .radiobox__circle::before {
  height: 6px;
  width: 6px;
}

</style>

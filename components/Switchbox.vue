<template>
  <div
    class="switch block relative"
    :class="[size]"
  >
    <input
      :id="inputId"
      ref="switchInput"
      :aria-label="ariaLabel"
      role="checkbox"
      class="switch__input absolute mr-2 w-px h-px overflow-hidden cursor-pointer"
      type="checkbox"
      :checked="value"
      :value="value"
      :data-cy="`${cypressTriggerIdentifier}:switch-box`"
      :disabled="disabled"
      :name="name"
      @input="onInput"
      @change="$emit('change', $event.target.checked)"
    />

    <label
      class="switch__label flex items-center whitespace-nowrap relative select-none"
      :class="[
        theme,
        !disabled ? 'cursor-pointer' : '',
        `label-bg-${backgroundColor}`,
        checkBgColor,
      ]"
      :style="{ '--bgColor': isTranslucentTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(9, 9, 9, 0.1)' }"
      :for="inputId"
    >
      <div class="sr-only">
        {{ ariaLabel }}
      </div>
    </label>
  </div>
</template>

<script>
import { enumProps } from '~/config/Atoms';

import QLogger from '~/services/QLogger';

export default {
  props: {
    inputId: {
      type: String,
      default: '',
    },

    ariaLabel: {
      type: String,
      default: '',
    },

    size: {
      type: String,
      default: 'md',
      validator: (val) => enumProps.Switchbox.size.includes(val),
    },

    name: {
      type: String,
      default: '',
    },

    value: {
      type: Boolean,
      default: false,
    },

    modelValue: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    // should be something unqiue
    cypressTriggerIdentifier: {
      type: String,
      default: '',
    },

    backgroundColor: {
      type: String,
      default: 'dark',
    },

    theme: {
      type: String,
      default: 'default',
      validator: (val) => enumProps.Switchbox.theme.includes(val),

    },

    checkBgColor: {
      type: String,
      default: '',
    },
  },

  emits: ['change', 'input', 'update:modelValue'],

  data() {
    return {
      isLaserPointerEnabled: false,
    };
  },

  computed: {
    isTranslucentTheme() {
      return this.theme === 'translucent';
    },

    iconSize() {
      switch (this.size) {
        case 'md':
          return 12;
        case 'sm':
          return 9;
        case 'xs':
          return 9;

        default:
      }
      return 12;
    },

    labelClasses() {
      let cls = 'font-semibold text-dark-3 cursor-pointer ';
      switch (this.size) {
        case 'md':
          cls += 'text-sm';
          break;
        case 'sm':
          cls += 'text-xs';
          break;
        case 'xs':
          cls += 'text-xxs';
          break;

        default:
      }
      return cls;
    },
  },

  methods: {
    getID() {
      return self.id;
    },

    uncheck() {
      this.$refs.switchInput.checked = false;
    },

    onInput(event) {
      this.$emit('update:modelValue', event.target.checked);
      this.$emit('input', event.target.checked);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/extends.scss';
/* label::before is the custom switch box */
/* label::after is the custom switch handle */
.switch__input {
  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
  clip: rect(1px, 1px, 1px, 1px);
  &:disabled + label {
    &::before {
      background: --bgColor;
    }
    &::after {
      background: --bgColor;
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
      background: #00c9a5;
    }
  }
  &:checked:disabled + label {
    &::before {
      background: --bgColor;
    }
    &::after {
      background: --bgColor;
    }
  }
  &:focus + label {
    &::before {
      @extend %default-focus;

      box-shadow: none;
    }
  }
}

.switch__label {
  &::before {
    content: '';
    position: relative;
    display: inline-block;
    background: var(--bgColor);
    border-radius: 20px;
    transition: all 0.15s ease-in-out;
  }

  &.label-bg-light {
    &::before {
      background: rgba(255,255,255, 0.1);
    }
  }

  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: white;
    transition: all 0.15s ease-in-out;
  }
}

/* md */
.switch.md .switch__label::before {
  width: 40px;
  height: 20px;
}
.switch.md .switch__label::after {
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
}
.switch.md .switch__input:checked + .switch__label::after {
  top: 2px;
  left: 22px;
}

/* sm */
.switch.sm .switch__label::before {
  width: 32px;
  height: 16px;
}
.switch.sm .switch__label::after {
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
}
.switch.sm .switch__input:checked + .switch__label::after {
  top: 2px;
  left: 18px;
}
</style>

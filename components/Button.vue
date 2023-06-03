<template>
  <button
    ref="button"
    :class="[
      classes,
      type,
      'transition-colors duration-200 ease-in-out flex',
      absolutePositioning ? 'absolute' : 'relative',
      minContentWidth ? '' : 'min-w-max',
    ]"
    :aria-label="ariaLabel ? ariaLabel : title"
    :disabled="(disabled && applyDisabled) ? true : undefined"
    :type="buttonType"
    translate="no"
    v-bind="$attrs"
  >
    <FA
      v-if="hasLIcon && !loading"
      :icon="licon"
      :size="iconSize"
      :class="[lIconClasses]"
    />

    <SuperIcon
      v-if="isSuperIcon && !hasLIcon"
      :class="lIconClasses"
      :size="superIconSize"
    />

    <slot name="lIcon" />

    <slot name="title">
      <span
        v-if="!subtitle"
        v-tooltip="isTranslationOverflowHandled ? { content: title, placement: translationOverflowConfig.placement } : false"
        class="title"
        :class="[
          titleClasses,
          loading ? 'invisible' : '',
          textOverflow ? 'overflow-hidden' : '',
          overflowEllipsis ? 'overflow-ellipsis' : '',
          isTranslationOverflowHandled ? translationOverflowConfig.width + ' overflow-hidden whitespace-nowrap overflow-ellipsis' : '',
        ]"
      >
        {{ title }}
      </span>

      <div
        v-if="subtitle"
        class="flex flex-col"
        :class="[type === 'special' || type === 'super-special' ? 'items-start' : '']"
      >
        <span
          class="title"
          :class="[titleClasses, loading ? 'invisible' : '', getTitleWithSubtitleClasses]"
        >
          {{ title }}
        </span>

        <span
          class="subtitle"
          :class="[titleClasses, loading ? 'invisible' : '']"
        >
          {{ subtitle }}
        </span>
      </div>
    </slot>

    <FA
      v-if="!isSuperIcon && hasTIcon && !loading"
      :icon="ticon"
      :size="iconSize"
      :class="tIconClasses"
    />

    <SuperIcon
      v-if="isSuperIcon && hasTIcon"
      :class="tIconClasses"
      :size="superIconSize"
    />

    <SuperIcon
      v-if="isSuperIcon && !hasTIcon && hasLIcon"
      class="ml-2"
      :size="superIconSize"
    />

    <LockIcon
      v-if="isLocked"
      class="ml-2"
    />

    <span
      v-if="!!loading"
      class="absolute inset-0 flex items-center justify-center w-4 h-4 m-auto loading-icon animate-spin"
    >
      <FA
        :icon="`far fa-sync`"
        :size="iconSize"
      />
    </span>
    <slot name="badge" />
  </button>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import pick from 'lodash/pick';

import { enumProps } from '~/config/Atoms';
/**
 * @see https://www.figma.com/file/xI2rscFgakPKI7M4WqUBr4/Educators?node-id=1369%3A9915 Referece to all the button types can be found here
 * @param {String} rounded full, semi, default, none
 * @param {String} size xs, sm, md, lg, xl
 * @param {String} isSuperIcon There is a separate component for super icon with the bold in the white background container.
 *                             Set this to tru, to apply it.
 * @param {String} ticon - Trailing Icon
 * @param {String} licon - Leading Icon
 *
 */

export const AllButtonEvents = ['click', 'focus', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'keydown', 'blur', 'keyup'];
// TODO: Separate style types from behavioral types
// TODO: Use descriptive names instead of 'other', 'selector', 'custom'
/**
 * This is a test.
 */
export default {
  props: {
    title: {
      type: String,
      default: '',
    },

    variant: {
      type: String,
      default: 'default',
      validate: (val) => enumProps.Button.variant.includes(val),
    },

    ariaLabel: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'primary',
      validator: (val) => enumProps.Button.type.includes(val),
    },

    buttonType: {
      type: String,
      default: 'button',
      validator: (val) => enumProps.Button.buttonType.includes(val),
    },

    isOn: {
      type: Boolean,
      default: false,
    },

    rounded: {
      type: String,
      default: 'default',
      validator: (val) => enumProps.Button.rounded.includes(val),
    },

    size: {
      type: String,
      default: 'md',
      validator: (val) => enumProps.Button.size.includes(val),
    },

    loading: {
      type: Boolean,
      default: false,
    },
    ticon: {
      type: String,
      default: '',
    },
    licon: {
      type: String,
      default: '',
    },
    isSuperIcon: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    fullHeight: {
      type: Boolean,
      default: false,
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    liconClasses: {
      type: String,
      default: '',
    },
    ticonClasses: {
      type: String,
      default: '',
    },
    titleClasses: {
      type: String,
      default: '',
    },
    buttonClasses: {
      type: String,
      default: '',
    },
    customClasses: {
      type: String,
      default: '',
    },
    customDisabledClasses: {
      type: String,
      default: '',
    },
    customIconSize: {
      type: Number,
      default: -1,
    },

    minContentWidth: {
      type: Boolean,
      default: false,
    },

    textOverflow: {
      type: Boolean,
      default: false,
    },

    overflowEllipsis: {
      type: Boolean,
      default: false,
    },

    /**
     * width
     * placement
     */
    translationOverflowConfig: {
      type: Object,
      default: () => ({}),
    },

    notCenterJustified: {
      type: Boolean,
      default: false,
    },
    // TODO: Rename to something like tooltipProps
    placeholder: {
      /**
       * This prop will contain all props to be passed to the ToolTip component. `text` is mandatory
       */
      type: Object,
      default: () => ({}),
      validator: (val) => isEmpty(val) || has(val, 'text'),
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    showDisabledStyle: {
      type: Boolean,
      default: false,
    },

    applyDisabled: {
      /**
       * This prop will determine if the disabled attribute
       * will actually get applied to the button or only the disabled
       * styling will get applied
       */
      type: Boolean,
      default: true,
    },

    useCustomClassesOnly: {
      type: Boolean,
      default: false,
    },

    zeroPadding: {
      type: Boolean,
      default: false,
    },

    absolutePositioning: {
      type: Boolean,
      default: false,
    },

    isDarkThemed: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    hasTIcon() {
      return !isEmpty(this.ticon);
    },

    hasLIcon() {
      return !isEmpty(this.licon);
    },

    tIconClasses() {
      if (!this.hasTitle) {
        return '';
      }

      let cls = '';

      if (this.ticonClasses) {
        cls += `${this.ticonClasses} `;
      }

      if (this.type === 'special' || this.type === 'super-special') {
        return `${cls}ml-auto`;
      }

      return `${cls}ml-2`;
    },

    lIconClasses() {
      let cls = '';
      if (this.hasTitle) {
        cls += 'mr-2';
      }

      if (this.liconClasses) {
        cls += ` ${this.liconClasses}`;
      }

      return cls;
    },

    isTranslationOverflowHandled() {
      return !isEmpty(this.translationOverflowConfig);
    },

    hasTitle() {
      return !isEmpty(this.title);
    },
    hasSubtitle() {
      return !isEmpty(this.subtitle);
    },

    getTitleWithSubtitleClasses() {
      switch (this.type) {
        case 'super':
          return 'text-sm font-medium text-light-66%';
        case 'special':
          return 'text-light-66% text-xxs font-semibold';
        case 'super-special':
          return 'text-light-66% text-xxs font-semibold';
        default:
          return 'text-sm font-medium text-dark-5';
      }
    },

    getRoundedClass() {
      switch (this.rounded) {
        case 'full':
          return 'rounded-full';

        case 'semi':
          return 'rounded-2xl';

        case 'md':
          return 'rounded-lg';

        case 'sm':
          return 'rounded';

        case 'default':
          if (['xs', 'sm', 'md'].includes(this.size)) {
            return 'rounded';
          }
          return 'rounded-lg';

        case 'none':
          return '';

        default:
          return '';
      }
    },

    classes() {
      let cls = !this.useCustomClassesOnly ? 'flex items-center ' : '';

      if (!this.useCustomClassesOnly) {
        if (!this.notCenterJustified && this.type !== 'special' && this.type !== 'super-special') {
          cls += 'justify-center ';
        }

        if (!this.hasTitle) {
          switch (this.size) {
            case 'xxs':
              cls += 'w-4 h-4 ';
              break;
            case 'xs':
              cls += 'w-6 h-6 ';
              break;
            case 'sm':
              cls += 'w-7 h-7 ';
              break;
            case 'md':
              cls += 'w-8 h-8 ';
              break;
            case 'lg':
              cls += 'w-9 h-9 ';
              break;
            case 'xl':
              cls += 'w-10 h-10 ';
              break;

            default:
          }
        } else {
          switch (this.size) {
            case 'xxs':
              if (!this.zeroPadding) {
                cls += 'px-3 py-1 ';
              }
              cls += 'text-xs font-semibold ';
              break;
            case 'xs':
              if (!this.zeroPadding) {
                cls += 'px-3 py-1 ';
              }
              cls += 'text-xs font-semibold ';
              break;
            case 'sm':
              if (!this.zeroPadding) {
                cls += 'px-4 py-1.5 ';
              }
              cls += 'text-xs font-semibold ';
              break;
            case 'md':
              if (!this.zeroPadding) {
                cls += 'px-4 py-1 ';
              }
              cls += 'text-sm font-semibold ';
              break;
            case 'lg':
              if (!this.zeroPadding) {
                cls += 'px-6 py-2 ';
              }
              cls += 'text-lg font-semibold ';

              if (this.variant === 'shadow') {
                cls += 'q-shadow mb-1 ';
              }
              break;
            case 'xl':
              if (this.type === 'special') {
                if (!this.zeroPadding) {
                  cls += 'px-4 py-2.5 ';
                }
                cls += 'text-lg font-semibold q-shadow mb-1 ';
              } else {
                if (!this.zeroPadding) {
                  cls += 'px-7.5 py-2.5 ';
                }
                cls += 'text-lg font-semibold q-shadow mb-1 ';
              }
              break;

            default:
          }

          if (!this.fullHeight) {
            if (this.hasSubtitle) {
              cls += 'h-14 ';
            } else {
              switch (this.size) {
                case 'xxs':
                  cls += 'h-6 ';
                  break;
                case 'xs':
                  cls += 'h-6 ';
                  break;
                case 'sm':
                  cls += 'h-8 ';
                  break;
                case 'md':
                  cls += 'h-8 ';
                  break;
                case 'lg':
                  cls += 'h-9 ';
                  break;
                case 'xl':
                  cls += 'h-10 ';
                  break;

                default:
              }
            }
          } else {
            cls += 'h-full ';
          }
        }

        if (this.fullWidth) {
          cls += 'w-full ';
        }
      }

      if (this.disabled || this.showDisabledStyle) {
        if (this.isDarkThemed) {
          cls += ' bg-light-5% text-light-20% cursor-not-allowed';
        } else {
          cls += 'bg-dark-6 text-dark-20% cursor-not-allowed';
        }
      } else {
        switch (this.type) {
          case 'cta':
            cls
              += 'base bg-green text-light-3 hover:bg-green-light active:bg-green-dark';
            break;
          case 'primary':
            cls
              += 'base bg-lilac text-light-3 hover:bg-lilac-light active:bg-lilac-dark';
            break;
          case 'special':
            cls
              += 'base bg-lilac text-light-3 hover:bg-lilac-light active:bg-lilac-dark';
            break;
          case 'secondary':
            cls
              += 'base bg-lilac-faded text-lilac hover:text-lilac-light active:text-lilac-dark';
            break;
          case 'transparent':
            cls
              += 'transparent bg-light-20% text-light-3 hover:bg-light-33% active:bg-light-10%';
            break;
          case 'other':
            cls += 'bg-dark-5% active:bg-dark-10% text-dark-2 hover:text-dark-3 ';
            break;
          case 'super':
            cls
              += 'bg-super text-light-3 hover:bg-super-light active:bg-super-dark';
            break;
          case 'super-special':
            cls
              += 'bg-super text-light-3 hover:bg-super-light active:bg-super-dark';
            break;
          case 'super-secondary':
            cls
              += 'bg-super-20% text-super-dark hover:text-super-light active:text-super-dark';
            break;
          case 'super-faded':
            cls
              += 'bg-super-10% text-super-dark hover:text-super-light active:text-super-dark';
            break;
          case 'white':
            cls
              += 'bg-light-3 border border-solid border-dark-6 text-dark-2 hover:bg-light-2 active:bg-light-1';
            break;
          case 'link':
            cls += 'text-lilac hover:text-lilac-light active:text-lilac-dark bg-light-3';
            break;
          case 'link-underline-blue':
            cls += 'text-blue hover:text-blue-light active:text-blue-dark bg-light-3 underline';
            break;
          case 'link-no-bg':
            cls += 'text-lilac hover:text-lilac-light active:text-lilac-dark';
            break;
          case 'danger':
            cls
              += 'bg-red-faded text-red hover:text-red-light active:text-red-dark';
            break;
          case 'danger-transparent':
            cls
              += 'bg-red-20% text-light-3 hover:text-red-light';
            break;
          case 'danger-dark':
            cls += 'bg-red text-light-3 hover:bg-red-light';
            break;
          case 'selector':
            cls
              += !this.isOn ? 'bg-light-1 text-dark-2 hover:text-dark-4' : 'bg-lilac text-light-3 hover:bg-lilac-light';
            break;
          case 'dark':
            cls
              += 'bg-dark-50% text-light hover:bg-dark-60% active:bg-dark-50%';
            break;

          case 'deep-dark':
            cls
              += 'bg-dark text-light hover:bg-dark-60% active:bg-dark-50%';
            break;

          case 'transparent-floating-dark':
            cls
              += 'bg-transparent text-dark-4 hover:bg-dark-10% active:bg-dark-5%';
            break;

          case 'transparent-floating-light':
            cls
              += 'bg-transparent text-light hover:bg-light-10% active:bg-light-5%';
            break;
          case 'deep-transluscent-light':
            cls
              += 'bg-light-20% text-light-3 hover:bg-light-33% active:bg-light-10%';
            break;
          case 'light-link':
            cls
              += 'text-light-3 hover:text-light-75% active:text-light-50%';
            break;
          case 'transluscent-light':
            cls
              += 'bg-light-5% text-light-50% hover:bg-light-10% active:bg-light-10%';
            break;
          case 'floater':
            cls
              += 'bg-lilac-faded text-lilac px-3 hover:text-lilac-light active:text-lilac-dark border-2 border-lilac';
            break;

          case 'transluscent-light-bright':
            cls
              += 'bg-light-5% text-light-3 hover:bg-light-10% active:bg-light-10%';
            break;
          case 'custom':
            cls += this.customClasses;
            break;
          default:
        }
      }

      cls += ` ${this.getRoundedClass} ${this.buttonClasses}`;

      return cls;
    },

    superIconSize() {
      switch (this.size) {
        case 'xxs':
          return 8;
        case 'xs':
          return 9;
        case 'sm':
          return 9;
        case 'md':
          return 9;
        case 'lg':
          return 11;
        case 'xl':
          return 12;

        default:
      }

      return 12;
    },

    isFullRoundedButton() {
      return !this.hasTitle && this.rounded === 'full';
    },

    iconSize() {
      if (this.customIconSize !== -1) {
        return this.customIconSize;
      }
      if (this.isFullRoundedButton) {
        switch (this.size) {
          case 'xxs':
            return 8;
          case 'xs':
            return 9;
          case 'sm':
            return 11;
          case 'md':
            return 12;
          case 'lg':
            return 14;
          case 'xl':
            return 16;

          default:
        }
      }
      switch (this.size) {
        case 'xxs':
          return 10;
        case 'xs':
          return 11;
        case 'sm':
          return 11;
        case 'md':
          return 12;
        case 'lg':
          return 14;
        case 'xl':
          return 16;

        default:
      }
      return 12;
    },

    allButtonEvents() {
      return pick(this.$attrs, AllButtonEvents);
    },
  },

  // mounted () {
  //   const button = this.$refs.button;
  //   if (!this.isAbsolute(button)) {
  //     button.className = 'relative ' + button.className;
  //   }
  // },

  methods: {
    onClick(ev) {
      this.$emit('click', ev);
    },
  },
};
</script>

<style lang="scss" scoped>
button {
  &.q-shadow {
    &.base {
      box-shadow: 0px 4px 0px 0px #6c4298;
    }

    &.white {
      box-shadow: 0px 4px 0px 0px #b6b6b6;
    }

    &.super {
      box-shadow: 0px 4px 0px #CE8400;
    }

    &.super-special {
      box-shadow: 0px 4px 0px #CE8400;
    }
  }
}
</style>

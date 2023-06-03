<template>
  <v-dropdown
    :placement="placement"
    :trigger="popperTriggers"
    :delay="delay"
    :shown="open"
    :autoHide="autoHide"
    :handleResize="handleResize"
    :distance="offset"
    :disabled="disabled"
    :class="popoverClasses"
    :type="`${type}-popper`"
  >
    <slot />

    <template #popper>
      <div :class="['flex flex-row items-center p-4 body', bodyClasses]">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-full icon-container shrink-0 flex-"
          :class="iconContainerClasses"
        >
          <FA
            :icon="initializedContent.icon"
            :size="16"
          />
        </div>

        <div class="flex-auto ml-3 text-content">
          <h4 :class="['text-dark-2 text-sm', titleClasses]">
            {{ initializedContent.title }}
          </h4>

          <h6 class="text-xs text-dark-4">
            {{ initializedContent.subTitle }}
          </h6>
        </div>
      </div>

      <div class="flex flex-row items-center justify-end p-2 rounded-b btns-container bg-light-2">
        <Button
          v-close-popper="canClosePopoverFromBtn1"
          v-bind="button1Props"
          @click="onButton1Click"
        />

        <Button
          v-close-popper="canClosePopoverFromBtn2"
          class="ml-2"
          v-bind="button2Props"
          @click="onButton2Click"
        />
      </div>
    </template>
  </v-dropdown>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import i18n from '../services/i18n';

const PopoverTypes = ['info', 'warn', 'danger'];

const PopoverContent = {
  validator: (val) => !isEmpty(val.title),
  model: ({
    title, subTitle = '', icon = '', iconColor = '', iconBGColor = '',
  }, popoverType = 'info') => {
    let iconToUse = icon;
    let iconColorToUse = iconColor;
    let iconBGColorToUse = iconBGColor;

    if (isEmpty(iconToUse)) {
      iconToUse = ({
        info: 'far fa-info-circle',
        warn: 'far fa-exclamation-triangle',
        danger: 'far fa-trash-alt',
      })[popoverType];
    }

    if (isEmpty(iconColorToUse)) {
      iconColorToUse = ({
        info: 'text-lilac',
        warn: 'text-yellow',
        danger: 'text-red',
      })[popoverType];
    }

    if (isEmpty(iconBGColorToUse)) {
      iconBGColorToUse = ({
        info: 'bg-lilac-faded',
        warn: 'bg-yellow-faded',
        danger: 'bg-red-faded',
      })[popoverType];
    }

    return {
      title,
      subTitle,
      icon: iconToUse,
      iconColor: iconColorToUse,
      iconBGColor: iconBGColorToUse,
    };
  },
};

const Button1 = {
  validator: (val) => !isEmpty(val.title) || !isEmpty(val.licon) || !isEmpty(val.ticon),
  model: (val = {}) => ({
    title: i18n('Cancel'),
    type: 'other',
    size: 'xs',
    ...val,
  }),
};

const Button2 = {
  validator: (val) => !isEmpty(val.title) || !isEmpty(val.licon) || !isEmpty(val.ticon),
  model: (val = {}, popoverType = 'info') => {
    let typeToUse = val.type || '';

    if (isEmpty(typeToUse)) {
      typeToUse = ({
        info: 'primary',
        warn: 'super-secondary',
        danger: 'danger',
      })[popoverType];
    }

    return {
      type: typeToUse,
      size: 'xs',
      ...val,
    };
  },
};

export default {

  props: {
    type: {
      type: String,
      default: 'info',
      validator: (val) => PopoverTypes.includes(val),
    },

    content: {
      type: Object,
      required: true,
      validator: PopoverContent.validator,
    },

    // These button objects contains the props for the Button component
    button1: {
      type: Object,
      default: Button1.model,
    },

    button2: {
      type: Object,
      required: true,
      validator: Button2.validator,
    },

    buttonNumsThatAutoClosePopover: {
      type: Array,
      default: () => ([1, 2]),
    },

    /**
     * Followiing are props for the Popover component.
     * For more refer - https://www.npmjs.com/package/v-tooltip#popover-component-reference
     */
    placement: {
      type: String,
      default: 'auto',
      validator: (val) => (['auto',
        'auto-start',
        'auto-end',
        'top',
        'top-start',
        'top-end',
        'right',
        'right-start',
        'right-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end']).includes(val),
    },

    trigger: {
      type: String,
      default: 'click',
      validator: (val) => (['hover', 'click', 'focus', 'manual']).includes(val),
    },

    delay: {
      type: [Number, Object],
      default: () => ({ show: 100, hide: 100 }),
    },

    offset: {
      type: Number,
      default: 4,
    },

    open: {
      type: Boolean,
      default: false,
    },

    autoHide: {
      type: Boolean,
      default: true,
    },

    handleResize: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    styles: {
      type: Object,
      default: () => { },
    },

    titleClasses: {
      type: String,
      default: '',
    },

    bodyClasses: {
      type: String,
      default: '',
    },
  },
  emits: ['button1Clicked', 'button2Clicked'],

  computed: {
    popoverClasses() {
      const classes = [`p-type-${this.type}`];

      return classes;
    },

    initializedContent() {
      return PopoverContent.model(this.content, this.type);
    },

    initializedButton1() {
      return Button1.model(this.button1, this.type);
    },

    initializedButton2() {
      return Button2.model(this.button2, this.type);
    },

    iconContainerClasses() {
      return [this.initializedContent.iconColor, this.initializedContent.iconBGColor];
    },

    button1Props() {
      return this.initializedButton1;
    },

    button2Props() {
      return this.initializedButton2;
    },

    canClosePopoverFromBtn1() {
      return this.buttonNumsThatAutoClosePopover.includes(1);
    },

    canClosePopoverFromBtn2() {
      return this.buttonNumsThatAutoClosePopover.includes(2);
    },

    popperTriggers() {
      if (this.trigger === 'manual') {
        return [];
      }

      return [this.trigger];
    },
  },

  methods: {
    onButton1Click() {
      this.$emit('button1Clicked');
    },

    onButton2Click() {
      this.$emit('button2Clicked');
    },
  },
};
</script>

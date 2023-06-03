<template>
  <div
    class="relative modal-header"
    :class="[headerContentClasses, `px-${headerPadding}`]"
  >
    <div class="flex items-center">
      <div
        v-if="hasModalLabel"
        class="flex items-center justify-center mr-3 rounded-full modal-label min-w-10 min-h-10 max-h-10 max-w-10 bg-lilac-faded text-lilac"
      >
        <FA
          v-if="hasIcon"
          :icon="icon"
          :size="16"
        />
        <img
          v-else-if="!!img"
          class="flex-grow-0 w-10 h-10 rounded-full"
          :src="img"
          alt=""
        />
      </div>

      <div
        v-if="hasTitle || hasSubTitle"
        class="flex flex-col"
      >
        <slot name="modal-title">
          <h2
            v-if="hasTitle"
            :class="['title font-semibold transition-all', titleClasses]"
          >
            <slot name="title" />
          </h2>
        </slot>
        <slot name="modal-subtitle">
          <h2
            v-if="hasSubTitle"
            :class="['subtitle text-xs', subtitleClasses]"
          >
            <slot name="subtitle" />
          </h2>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';

export default {

  props: {
    showCloseModalBtn: {
      type: Boolean,
      default: true,
    },

    isBlockerModal: {
      type: Boolean,
      default: false,
    },

    closeBtnClasses: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },

    size: {
      type: String,
      default: 'md',
      validator(size) {
        return ['sm', 'md', 'lg', 'xl', 'custom'].includes(size);
      },
    },

    icon: {
      type: String,
      default: '',
    },

    img: {
      type: String,
      default: '',
    },

    headerCustomClasses: {
      type: String,
      default: '',
    },

    titleCustomClasses: {
      type: String,
      default: '',
    },

    subtitleCustomClasses: {
      type: String,
      default: '',
    },

    iconCustomClasses: {
      type: String,
      default: '',
    },
    zeroPadding: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: 'default',
      validator: (val) => ['default', 'error', 'yellow', 'brand-c', 'dark'].includes(val),
    },
  },

  computed: {
    hasTitle() {
      return !isEmpty(this.title);
    },

    hasSubTitle() {
      return !isEmpty(this.subtitle);
    },

    headerPadding() {
      if (this.zeroPadding) {
        return 0;
      }
      switch (this.size) {
        case 'sm':
        case 'md':
          return 4;

        case 'lg':
        case 'xl':
          return 6;

        default:
          return 4;
      }
    },

    headerContentClasses() {
      if (!isEmpty(this.headerCustomClasses)) {
        return this.headerCustomClasses;
      }
      let classes = '';
      switch (this.size) {
        case 'sm':
        case 'md':
          classes += 'mb-4';
          break;
        case 'lg':
        case 'xl':
          classes += 'mb-6';
          break;
        default:
      }
      return classes;
    },

    titleClasses() {
      if (this.titleCustomClasses) {
        return this.titleCustomClasses;
      }
      let cls = '';

      switch (this.size) {
        case 'sm':
          cls += 'text-sm';
          break;
        case 'md':
          cls += 'text-base';
          break;
        case 'lg':
        case 'xl':
          cls += 'text-lg';
          break;

        default:
      }

      switch (this.theme) {
        case 'dark':
          cls += ' text-light';
          break;
        default:
          cls += ' text-dark-2';
      }

      return cls;
    },

    subtitleClasses() {
      let cls = '';

      if (this.subtitleCustomClasses) {
        return this.subtitleCustomClasses;
      }

      switch (this.theme) {
        case 'dark':
          cls += 'text-light';
          break;
        default:
          cls += 'text-dark-50%';
      }

      return cls;
    },

    iconClasses() {
      let customIconClasses = '';
      switch (this.theme) {
        case 'error':
          customIconClasses = 'bg-red-faded text-red-dark';
          break;

        case 'yellow':
        case 'brand-c':
          customIconClasses = 'bg-yellow-faded text-yellow';
          break;

        case 'default':
        default:
          customIconClasses = 'bg-lilac-faded text-lilac';
      }

      return `${customIconClasses} ${this.iconCustomClasses}`;
    },

    hasModalLabel() {
      return Boolean(this.icon) || Boolean(this.img);
    },

    hasIcon() {
      return Boolean(this.icon);
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-header {
  max-height: 10%;
}
</style>

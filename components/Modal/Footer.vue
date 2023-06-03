<template>
  <div
    v-if="shouldShowFooter || $slots.default"
    class="relative flex items-center justify-end w-full mt-4 modal-footer"
    :class="[`px-${footerPadding}`, {
               'h-14 border-t border-dark-6': stickToBottom,
               'bottom-4': !isDesktop,
             },
             footerClasses,
    ]"
  >
    <div
      v-if="doesFooterTextExist"
      :class="{
        'mr-auto': doModalActionButtonsExist,
        'w-full': !doModalActionButtonsExist,
      }"
    >
      <slot />
    </div>

    <div
      :class="[{
        'flex justify-end w-fit': !stickToBottom,
        'grid w-full': stickToBottom,
        'pl-2': doesFooterTextExist,
        '!w-full': fullWidthFooter,
      }, (stickToBottom && (!button1 || !button2)) ? 'grid-cols-1' : 'grid-cols-2']"
    >
      <Button
        v-if="isButton1Visible"
        ref="button1"
        :size="button1.size"
        :title="button1.title"
        :type="button1.type"
        :disabled="button1.disabled"
        :loading="button1.loading"
        :licon="button1.licon"
        :liconClasses="button1.liconClasses"
        :rounded="button1.rounded"
        :data-cy="button1.dataCy ? button1.dataCy : 'secondary-modal-cta'"
        class="mr-2"
        :class="{
          'w-full': button1.layout === 'full',
        }"
        :buttonClasses="button1.buttonClasses"
        :aria-label="button1.ariaLabel"
        :aria-describedby="button1.ariaDescribedBy"
        @click.stop.prevent="$emit('button1Click')"
      />
      <Button
        v-if="isButton2Visible"
        :size="button2.size"
        :title="button2.title"
        :type="button2.type"
        :disabled="button2.disabled"
        :ticon="button2.ticon"
        :ticonClasses="button2.ticonClasses"
        :loading="button2.loading"
        :aria-label="button2.ariaLabel"
        :aria-describedby="button2.ariaDescribedBy"
        :data-cy="button2.dataCy ? button2.dataCy : 'primary-modal-cta'"
        :licon="button2.licon"
        :rounded="button2.rounded"
        :class="{
          'w-full': button2.layout === 'full',
        }"
        :buttonClasses="button2.buttonClasses"
        :customDisabledClasses="button2.customDisabledClasses"
        :titleClasses="button2.titleClasses"
        @click.stop.prevent="$emit('button2Click')"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

export default {

  props: {
    button1: {
      type: Object,
      default() {
        /* return {
          isVisible: true,
          title: 'Button 1',
          type: 'other',
          size: 'md',
          disabled: false,
          loading: false,
          layout: 'default',
          ariaLabel: '',
          rounded: '',
          ariaDescribedBy: '',
          button1Classes: '',
        }; */
        return null;
      },
    },

    button2: {
      type: Object,
      default() {
        /* return {
          isVisible: true,
          title: 'Button 2',
          type: 'base',
          size: 'md',
          disabled: false,
          loading: false,
          layout: 'default',
          ariaLabel: '',
          ariaDescribedBy: '',
          licon: '',
          rounded: '',
          button2Classes: '',
        }; */
        return null;
      },
    },

    size: {
      type: String,
      default: 'md',
    },

    stickToBottom: {
      type: Boolean,
      default: false,
    },

    footerClasses: {
      type: String,
      default: '',
    },

    fullWidthFooter: {
      type: Boolean,
      default: false,
    },

    zeroPadding: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['button1Click', 'button2Click'],

  computed: {
    ...mapGetters('root', ['isDesktop']),
    footerPadding() {
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

    doesFooterTextExist() {
      return this.$slots.default;
    },

    shouldShowFooter() {
      return this.isButton1Visible || this.isButton2Visible;
    },

    doModalActionButtonsExist() {
      return this.isButton1Visible || this.isButton2Visible;
    },

    isButton1Visible() {
      if (isEmpty(this.button1)) {
        return false;
      }

      return this.button1.isVisible !== false;
    },

    isButton2Visible() {
      if (isEmpty(this.button2)) {
        return false;
      }

      return this.button2.isVisible !== false;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

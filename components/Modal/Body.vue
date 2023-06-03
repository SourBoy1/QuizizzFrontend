<template>
  <div
    class="modal-body relative rounded-lg"
    :class="[backgroundColor, bodyClasses, stickToBottom ? `px-${bodyPaddingNumber} pt-${bodyPaddingNumber}` : `py-${bodyPaddingNumber}`]"
  >
    <div class="close-btn z-10 absolute top-4 right-3">
      <Button
        v-if="showCloseModalBtn && !isBlockerModal"
        :class="[closeBtnClasses]"
        type="transparent-floating-dark"
        size="sm"
        data-cy="modal-close"
        rounded="full"
        ticon="far fa-times"
        :aria-label="$i18n('Close')"
        @click.stop.prevent="$emit('close')"
      />
      <Button
        v-else-if="showCustomCloseModalBtn && !isBlockerModal"
        :class="[customCloseBtnClasses]"
        type="transparent-floating-dark"
        size="sm"
        data-cy="modal-close"
        rounded="full"
        :aria-label="$i18n('Custom Close')"
        @click.stop.prevent="customCloseBtnClick"
      />
    </div>
    <slot />
  </div>
</template>

<script>
export default {

  props: {
    backgroundColor: {
      type: String,
      default: 'bg-light-3',
    },
    bodyClasses: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'md',
    },
    showCloseModalBtn: {
      type: Boolean,
      default: true,
    },
    stickToBottom: {
      type: Boolean,
      default: true,
    },

    zeroPadding: {
      type: Boolean,
      default: false,
    },

    isBlockerModal: {
      type: Boolean,
      default: false,
    },

    closeBtnClasses: {
      type: String,
      default: '',
    },

    showCustomCloseModalBtn: {
      type: Boolean,
      default: false,
    },

    customCloseBtnClasses: {
      type: String,
      default: '',
    },

    customCloseBtnClick: {
      type: Function,
      default: () => {},
    },
  },
  emits: ['close'],

  computed: {
    bodyPaddingNumber() {
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
  },
};
</script>

<style lang="scss" scoped>
.modal-body {
  z-index: 10002;
}
</style>

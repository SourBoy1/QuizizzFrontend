<template>
  <Modal
    v-if="isModalShowing"
    icon=""
    :title="$i18n('Editor is out of sync')"
    subtitle=""
    dismissOnOverlayClick
    :button1="{
      title: $i18n('Exit'),
      type: 'primary',
    }"
    :button2="null"
    @button1-click="$emit('exit')"
    @close="toggleModal"
  >
    <div class="text-dark-4 text-xs">
      <i18n>Please exit the editor and edit the quiz/lesson again to get back in sync.</i18n>
    </div>
  </Modal>
</template>

<script>
export default {
  emits: ['exit', 'close'],
  data() {
    return {
      isModalShowing: false,
    };
  },

  created() {
    this.$eventBus.$on('quizVersion:staleDraft', this.toggleModal);
  },
  beforeUnmount() {
    this.$eventBus.$off('quizVersion:staleDraft', this.toggleModal);
    this.$store.dispatch('contentEditor/setStaleVersionWarningVisibility', false);
  },

  methods: {
    toggleModal(isOpened = false) {
      this.isModalShowing = isOpened;
      if (!isOpened) {
        this.$emit('close');
      }
    },
  },
};
</script>

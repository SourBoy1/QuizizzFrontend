<template>
  <Modal
    :title="$i18n('Equation editor')"
    :subtitle="$i18n('Use the buttons below or type in the equations using LaTeX')"
    :button1="cancelButton"
    :button2="insertButton"
    :icon="'fas fa-function'"
    :shouldCloseOnEscape="true"
    dismissOnOverlayClick
    :stickToBottom="isStuckToBottom"
    @button1-click="close"
    @button2-click="handleInsertBtnClick"
    @close="close"
  >
    <div
      v-if="isMounting"
      class="absolute inset-0 bg-dark-50% flex justify-center items-center z-50"
    >
      <FA
        icon="far fa-sync"
        :size="40"
        class="text-light-3 animate-spin"
      />
    </div>
    <MathEditor
      :initialLatex="latex"
      @mounted="handleEditorMounted"
      @done="handleDone"
    />
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

  props: {
    latex: {
      type: String,
      default: '',
    },

    showMobileLayout: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['save', 'close'],

  data() {
    return {
      insertButton: {
        type: 'primary',
        title: this.$i18n('Insert'),
      },
      cancelButton: {
        type: 'other',
        title: this.$i18n('Cancel'),
      },
      isMounting: true,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['mostRecentlyCreatedElement', 'shouldShowElementFocus']),
    ...mapGetters('root', ['isDesktop']),

    isStuckToBottom() {
      return this.showMobileLayout && !this.isDesktop;
    },
  },

  methods: {
    handleEditorMounted() {
      this.isMounting = false;
    },
    handleInsertBtnClick() {
      this.$eventBus.$emit('mathEditorModal:insertButtonClicked');
      this.setElementFocus();
    },

    handleDone(latex) {
      this.$emit('save', latex);
    },

    close() {
      this.$emit('close');
      this.$store.dispatch('slideEditor/setShouldShowElementFocus', false);
    },

    setElementFocus() {
      if (!this.shouldShowElementFocus) {
        return;
      }
      setTimeout(() => {
        this.$eventBus.$emit('slideElement:focus', this.mostRecentlyCreatedElement._id);
      }, 0);
    },
  },
};
</script>

<style>
</style>

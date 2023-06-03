<template>
  <div
    class="flex justify-center items-center pl-4  bg-lilac pr-4 fixed bottom-0 w-full z-40"
    :class="containerClasses"
  >
    <button
      class="text-light-2 w-4 h-4 items-center justify-center flex mr-2"
    >
      <FA
        icon="fas fa-exclamation-triangle"
        :size="16"
      />
    </button>
    <h1 class="text-light-2 text-sm font-semibold ml-1 mr-2">
      <i18n>Quizizz does not support more than 500 questions per quiz.</i18n>
    </h1>
    <div @click="toggleQuestionLimitModal">
      <h1 class="text-light-2 text-sm font-semibold underline cursor-pointer">
        <i18n>Why?</i18n>
      </h1>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    containerClasses: {
      type: Array,
      default: () => [],
    },

    isDesktop: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['toggleQuestionLimitModal'],

  methods: {
    toggleQuestionLimitModal() {
      this.$emit('toggleQuestionLimitModal');
    },
  },
};
</script>

<template>
  <div class="w-full h-full flex flex-col justify-center items-center relative">
    <div class="text-dark-5">
      <FA
        v-if="isError"
        icon="far fa-exclamation-square"
        :size="90"
      />
      <FA
        v-if="isLoading"
        icon="far fa-sync animate-spin"
        :size="40"
      />
    </div>

    <div
      v-if="isError"
      class="mt-4 text-dark-5 font-semibold text-lg px-6 text-center"
    >
      <span>{{ title }}</span>
    </div>

    <span
      v-if="shouldShowExitButton"
      class="absolute top-0 right-0 z-10 w-8 h-8 inline-flex justify-center items-center rounded-sm bg-light-50% hover:bg-light-66% cursor-pointer"
      @click="$emit('exit')"
    >
      <FA
        icon="far fa-times"
        :size="18"
      />
    </span>
  </div>
</template>

<script>

export default {
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    isError: {
      type: Boolean,
      default: false,
    },
    shouldShowExitButton: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['exit'],

};
</script>

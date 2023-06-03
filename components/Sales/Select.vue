<template>
  <div class="overflow-auto relative">
    <label
      class="font-semibold text-xs mb-1 text-dark-4"
      for="sales-select"
    >{{ label }}</label>
    <div class="flex justify-around items-center relative">
      <select
        id="sales-select"
        v-model="selectedOption"
        class="block
      h-10
      overflow-y-scroll
        appearance-none
        w-full
        bg-white
        border
        border-dark-6
        hover:border-gray-500
        px-4
        py-2
        pr-8
        rounded
leading-tight focus:outline-none focus:shadow-outline text-sm"
        aria-label="Select"
        @input="event => { $emit('input', event.target.value) }"
      >
        <option value="">
          {{ firstOption }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.title }}
        </option>
      </select>
      <div class="pointer-events-none absolute top-1/2 bottom-1/2 inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          class="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        ><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
      </div>
    </div>
    <div
      v-show="errorMessage || hasLimitError"
      class="flex pt-1 text-xs font-semibold text-red"
      aria-live="assertive"
    >
      <span class="w-4 h-4 flex items-center justify-center mr-0.5">
        <FA
          :size="11"
          icon="far fa-exclamation-circle"
        />
      </span>
      <span id="input-error-message">
        {{ errorMessage || limitErrorMessage }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    firstOption: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    hasLimitError: {
      type: Boolean,
      default: false,
    },
    limitErrorMessage: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['input'],

  data() {
    return {
      selectedOption: null,
    };
  },

  watch: {
    value(newValue) {
      this.selectedOption = newValue;
    },
  },

  mounted() {
    this.selectedOption = this.value;
  },
};
</script>

<style scoped>

</style>

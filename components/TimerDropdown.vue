<template>
  <ul class="py-1 overflow-hidden">
    <button
      v-for="(time, index) in options"
      :ref="time === selectedTime ? 'selected' : null"
      :key="index"
      class="cursor-pointer active:bg-dark-10% py-2 pl-2 w-full text-sm flex items-center overflow-hidden text-dark-3 max-h-80 font-semibold hover:bg-dark-5%"
      :class="{ 'bg-dark-6': time === selectedTime }"
      @click="onTimeSelected(time)"
    >
      {{ getTimeTitle(time) }}
    </button>
  </ul>
</template>

<script>
import Constants from '~/config/Constants';

export default {
  props: {
    selectedTime: {
      type: Number,
      default: 0,
    },
  },
  emits: ['onTimeSelected', 'closeDropdown'],

  data() {
    return {
      options: Constants.AllowedQuestionTimeInSeconds.map((secs) => secs * 1000),
    };
  },

  mounted() {
    this.$refs.selected?.[0]?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  },

  methods: {
    getTimeTitle(time) {
      const inSecs = time / 1000;
      const inMinutes = inSecs / 60;

      if (inMinutes >= 1) {
        const min = inMinutes === 1 ? this.$i18n('minute') : this.$i18n('minutes');
        return `${inMinutes} ${min}`;
      }

      return this.$i18n('{$1} seconds', [inSecs]);
    },

    onTimeSelected(time) {
      this.$emit('onTimeSelected', time);
      this.$emit('closeDropdown');
    },
  },
};
</script>

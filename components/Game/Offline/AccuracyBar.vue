<template>
  <div class="report-accuracy-container w-full p-3 bg-dark-80% rounded-2xl">
    <div class="flex justify-between w-full h-10 bg-red-light rounded">
      <div class="correct-section flex min-w-21 items-center p-1 bg-green rounded-l">
        <div class="mr-auto pts-container bg-dark-10% flex items-center justify-center px-2 rounded">
          <p class="text-light-3 text-xl">
            {{ totalCorrect }} pts
          </p>
        </div>
      </div>
      <div class="w-7 bg-green" />
      <div class="accurary-slider relative flex flex-1">
        <div
          class="bg-green"
          :style="{ width: `${accuracy}%` }"
        />
        <div
          class="accuracy flex flex-col items-center justify-center absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-20 h-20 bg-light-3 rounded-full border-dark-10% border-2"
          :style="{ left: `${accuracy}%` }"
        >
          <h3 class="text-dark-1 text-2xl font-bold">
            {{ accuracy }}%
          </h3>
          <span class="text-dark-1 font-bold text-xs"><i18n>Accuracy</i18n></span>
        </div>
        <div class="flex-1" />
      </div>
      <div class="w-7" />
      <div class="correct-section min-w-21 flex items-center p-1 rounded-l">
        <div class="ml-auto pts-container bg-dark-10% flex items-center justify-center px-2 rounded">
          <p class="text-light-3 text-xl">
            {{ totalIncorrect }} pts
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    accuracy: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
  },

  computed: {
    totalIncorrect() {
      return this.totalQuestions - this.totalCorrect;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

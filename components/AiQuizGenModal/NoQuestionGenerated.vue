<template>
  <div>
    <div class="icon flex justify-center">
      <img
        src="https://cf.quizizz.com/img/QuizizzBot/crashed.png"
        class="w-40 object-contain"
      />
    </div>
    <div class="description text-center mt-10">
      <div class="title font-bold text-2xl text-dark-2">
        <i18n>No Questions generated!</i18n>
      </div>
      <div class="subtitle mt-2 text-dark-3">
        {{ errorSubtitle }}
      </div>
    </div>
    <Button
      type="primary"
      size="lg"
      class="mt-8 mx-auto"
      :title="$i18n('TRY AGAIN')"
      @click="$emit('tryAgain')"
    />
  </div>
</template>
<script>

export default {
  props: {
    quizGenView: {
      type: String,
      default: null,
    },
  },

  computed: {
    isUsingOpenText() {
      return this.quizGenView === this.$constants.AiQuizGenModes.USING_OPEN_TEXT;
    },
    errorSubtitle() {
      return this.isUsingOpenText
        ? this.$i18n('Choose a different text and try again.')
        : this.$i18n('Choose a different file and try again.');
    },
  },
};
</script>

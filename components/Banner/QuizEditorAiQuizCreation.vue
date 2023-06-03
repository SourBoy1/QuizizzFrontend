<template>
  <div
    class="ai-quiz-creation-banner w-full flex justify-between items-center p-4 rounded-lg shadow-sm cursor-pointer"
    @click="$emit('quizGenViaAI')"
  >
    <div class="flex justify-center items-center gap-4">
      <div class="rounded-full p-2 bg-lilac-faded w-12 h-12 flex justify-center items-center">
        <FA
          icon="fa-light fa-wand-magic-sparkles"
          size="20"
          class="text-dark-2"
        />
      </div>
      <div>
        <div class="title flex items-center text-dark-2 font-bold text-base">
          <i18n>Have questions ready with you?</i18n>
        </div>
        <div class="subtitle text-dark-3 text-sm">
          <i18n>Use AI to import questions from any text/document with a single click</i18n>
        </div>
      </div>
    </div>
    <Button
      type="link"
      size="lg"
      licon="fas fa-chevron-right"
      liconClasses="!text-lg !leading-8"
      buttonClasses="rounded-4xl w-min h-10 px-3.5 py-2"
    />
  </div>
</template>

<script>
export default {

};
</script>

<style lang="scss" scoped>.ai-quiz-creation-banner {
  background: linear-gradient(180deg, #F7F0FF 0%, #FFFFFF 100%);
}</style>

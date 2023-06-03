<template>
  <div
    v-if="isEditorForPresentationContent"
    key="btnContainerRow"
    class="question-editor-top-toolbar absolute -top-12 flex flex-row items-center pb-2 w-full z-20 transition-all duration-500"
    :style="{ transform: 'scale(1.5) translateX(16.33%) translateY(-50%)' }"
  >
    <Button
      v-tooltip.top="{ content: $i18n('Duplicate') }"
      class="mr-2"
      type="dark"
      size="md"
      ticon="fas fa-copy"
      :aria-label="$i18n('Duplicate question')"
      @click="copyCurrentQuestion"
    />

    <Button
      v-tooltip.top="{ content: $i18n('Delete') }"
      class="mr-2"
      type="dark"
      size="md"
      ticon="fas fa-trash-alt"
      :aria-label="$i18n('Delete question')"
      @click="deleteCurrentQuestion"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('contentEditor', ['isEditorForPresentationContent', 'quizType', 'quizId', 'quiz']),
    ...mapGetters('slideEditor', ['sourcePage', 'currentSlide']),
  },
  methods: {
    copyCurrentQuestion() {
      this.$store.dispatch('contentEditor/duplicateSlideById', { id: this.currentSlide._id });
    },

    deleteCurrentQuestion() {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_QUESTION_DELETE);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        questionType: this.quiz.type,
        sourcePage: this.sourcePage,
      });

      this.$store.dispatch('contentEditor/deleteSlideById', this.currentSlide._id);
    },
  },
};
</script>

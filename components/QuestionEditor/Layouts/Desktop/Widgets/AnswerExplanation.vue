<template>
  <div>
    <div
      v-if="isAnswerExplanationsInViewStore"
      class="question-view-toggler-bg absolute top-0 left-0 w-full h-full cursor-pointer z-50"
      @click="toggleExplanationBeingInView"
    />

    <transition
      appear
      enter-active-class="animate__animated animate__fadeIn animation-duration-300 animation-delay-300"
      leave-active-class="animate__animated animate__fadeOut animation-duration-200 "
    >
      <button
        v-show="isAnswerExplanationsInViewStore"
        class="question-tab absolute flex flex-col items-center p-4 rounded-r-2xl bg-dark-1 text-light-3 w-36 top-7 -right-36 focus:outline-none"
        :aria-label="$i18n('View current question')"
        tabindex="0"
        @click="toggleExplanationBeingInView"
      >
        <FA
          icon="fas fas fa-arrow-left"
          :size="28"
          aria-hidden="true"
        />

        <i18n class="text-xl mt-2">
          Back to the question
        </i18n>
      </button>
    </transition>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {

  computed: {
    ...mapGetters('contentEditor', ['isEditorForPresentationContent', 'isAnswerExplanationsInViewStore']),
  },

  methods: {
    toggleExplanationBeingInView() {
      this.$store.dispatch('contentEditor/toggleIsAnswerExplanationsInView');
    },
  },
};
</script>

<style lang="scss" scoped>
.question-view-toggler-bg {
  height: calc(100% + 104px);
  width: calc(100% + 58px);
  top: -50px;
}
</style>

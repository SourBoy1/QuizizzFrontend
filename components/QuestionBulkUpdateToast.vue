<template>
  <div
    class="shadow-lg px-4 py-3 md:mx-4 bg-dark-2 my-3 items-center rounded-lg flex transition-all duration-300 text-light-3
     justify-between h-full text-xs md:text-sm w-full"
    @mouseenter="hoverOnToast = true"
    @mouseleave="hoverOnToast = false"
  >
    <div>
      <FA icon="far fa-exclamation-circle mr-3.5" />
    </div>
    <div class="flex w-full h-full justify-between items-center mr-5">
      <div class="">
        {{ isPointsUpdate ? data.changedPointsTitle : data.changedTimeTitle }}
      </div>
      <Button
        size="sm"
        :fullHeight="true"
        type="white"
        buttonClasses="text-black border-light-10% border-l-1 changeforall"
        :title="loadingState === 'done' ? `${$i18n('DONE')}!` : $i18n('CHANGE FOR ALL')"
        :loading="loadingState === 'loading'"
        @click="bulkUpdateFuncion"
      />
    </div>
    <div>
      <button
        class="w-fit h-full justify-center items-center"
        @click="removeSnackbar"
      >
        <FA icon="far fa-times" />
      </button>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {

  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      loadingState: 'waiting',
      snackBarRemovalTimeout: null,
      hoverOnToast: false,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['questions', 'getQuestionById', 'quizId']),

    isPointsUpdate() {
      return this.data.pointsUpdate ?? false;
    },
  },

  watch: {
    hoverOnToast(val) {
      if (val) { clearTimeout(this.snackBarRemovalTimeout); } else {
        this.snackBarRemovalTimeout = setTimeout(this.removeSnackbar, 1000);
      }
    },
  },

  mounted() {
    const delayTime = this.data?.timeout ?? 6000;

    this.snackBarRemovalTimeout = setTimeout(() => {
      this.removeSnackbar();
    }, delayTime);
  },

  beforeUnmount() {
    this.snackBarRemovalTimeout && clearInterval(this.snackBarRemovalTimeout);
  },

  methods: {
    async bulkUpdateFuncion() {
      await this.isPointsUpdate ? this.applyPointsToAllQuestions() : this.applyTimingToAllQuestions();
    },

    async applyTimingToAllQuestions() {
      const question = this.getQuestionById(this.data._id);

      if (!question || !question.time) {
        return;
      }
      this.loadingState = 'loading';
      const eventName = this.$webEvents.EDITOR_QUESTION_TIME_CHANGE_ALL;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
      });

      await this.$store.dispatch('contentEditor/updateAllQuestionTimesInQuiz', question);
      this.loadingState = 'done';
      setTimeout(() => {
        this.$snackbars.remove(this.data._id);
      }, 300);
    },

    removeSnackbar() {
      this.$snackbars.remove(this.data._id);
    },

    async applyPointsToAllQuestions() {
      this.loadingState = 'loading';

      await this.$store.dispatch('contentEditor/updateMultipleQuestionPoints', {
        points: this.data.points,
      });
      this.loadingState = 'done';
      setTimeout(() => {
        this.$snackbars.remove(this.data._id);
      }, 300);
    },
  },

};
</script>

<style lang="scss">
  .time-toast {
    @apply w-full;
    @apply p-3;
    @apply bg-dark-2;
    @apply min-h-full;
  }
  .Vue-Toastification__icon {
    @apply hidden;
  }
  .bg-inherit {
    background: inherit !important;
  }
  .changeforall {
    min-width: inherit !important;
  }
</style>

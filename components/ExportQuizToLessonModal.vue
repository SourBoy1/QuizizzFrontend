<template>
  <Modal
    title=""
    :showCloseModalBtn="false"
    subtitle=""
    :button1="{
      type: 'other',
      title: $i18n('Cancel'),
    }"
    :button2="{
      type: 'primary',
      title: $i18n('Create'),
      licon: 'far fa-file-export',
      loading: isExportInProgress,
    }"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="onExportQuizToLesson"
  >
    <div class="mb-6 flex flex-col items-center">
      <img
        src="https://cf.quizizz.com/img/editor/lessons1.png"
        alt="Import quiz to lesson"
        class="w-72"
      >

      <h1 class="text-dark-2 font-semibold mb-2 text-center">
        <i18n>
          We’ll export this quiz to a new lesson.
          You can then add slides to it.
        </i18n>
      </h1>

      <p class="text-dark-4 text-xs text-center">
        <i18n>
          Don’t worry, this quiz will also be available in your library.
        </i18n>
      </p>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import QuizService from '../services/apis/QuizService.js';

export default {

  props: {
    isBulkImportTriggered: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],

  data() {
    return {
      isExportInProgress: false,
      timeoutToRedirect: null,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'versionId']),
  },

  beforeUnmount() {
    if (this.timeoutToRedirect) {
      clearTimeout(this.timeoutToRedirect);
    }
  },

  methods: {
    async onExportQuizToLesson() {
      this.isExportInProgress = true;

      const response = await QuizService.exportAsPresentation({ asDraft: true, quizId: this.quizId, versionId: this.versionId });

      if (response.success && response.data) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.SUCCESS,
          icon: 'fas fa-check-circle',
          title: this.$i18n('Quiz exported, reloading editor...'),
        });

        this.timeoutToRedirect = setTimeout(() => {
          window.location.href = `/presentation/${response.data.quiz._id}/edit?source=exportQuizFromEditor${this.isBulkImportTriggered && '&bulkImport=true'}`;
        }, 500);
      } else {
        this.$toasts.add({
          icon: 'fas fa-times-circle',
          type: this.$constants.ToastTypes.ERROR,
          title: this.$i18n('Something went wrong while exporting!'),
        });
      }
    },
  },
};
</script>

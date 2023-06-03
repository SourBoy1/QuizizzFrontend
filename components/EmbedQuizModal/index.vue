<template>
  <Modal
    v-if="displayEmbedModal"
    :title="$i18n('Embed Quiz')"
    :subtitle="$i18n('Use this quiz anywhere on the web')"
    icon="fa-regular fa-code"
    dismissOnOverlayClick
    shouldCloseOnEscape
    size="md"
    @close="toggleModal"
  >
    <div class="embed-quiz-container flex flex-col">
      <div class="preview-container">
        <p class="font-semibold text-xs text-dark-4">
          <i18n>
            Preview
          </i18n>
        </p>
        <div class="p-2 mt-2 rounded-lg border-1 border-dark-6 w-full">
          <div class="embed-preview w-full pointer-events-none flex flex-col items-center justify-center p-8">
            <img
              src="https://cf.quizizz.com/img/quizizz_logos/white-brandmark-600x164.png"
              class="w-12"
              alt="quizizz"
            >
            <h1 class="text-light-2 font-semibold text-base text-center leading-10 mt-4">
              {{ quizName }}
            </h1>
            <div class="creator-details mt-2 flex items-center justify-center space-x-1 text-tn">
              <p class="text-dark-6">
                <i18n>Created by</i18n>
              </p>
              <span class="w-1 h-1 rounded-full bg-dark-6" />
              <p class="text-light-2 font-semibold text-tn inline-block align-middle break-all">
                {{ $stringUtils.truncateLongStrings(authorName, 30) }}
              </p>
            </div>
            <p class="mt-2 text-dark-5 font-semibold text-tn">
              <i18n :injections="[totalQuestions]">
                {$1} questions
              </i18n>
            </p>
            <Button
              type="primary"
              buttonClasses="w-10/12 mt-4 py-4"
              size="xs"
              :title="$i18n('Play now')"
            />
          </div>
        </div>
      </div>
      <p class="mt-4 font-semibold text-xs text-dark-4">
        <i18n>Embed Link</i18n>
      </p>
      <div class="rounded border-1 border-dark-6 w-full p-2 pl-3 mt-1 flex items-center space-x-2">
        <p class="flex-1 text-dark-3 text-sm font-semibold whitespace-nowrap overflow-ellipsis overflow-hidden">
          {{ embedLink }}
        </p>
        <Button
          size="sm"
          type="custom"
          customClasses="bg-dark-5% text-dark-2 hover:bg-dark-10%"
          :title="$i18n('Copy')"
          @click="() => handleCopyText(embedLink, $webEvents.EMBED_QUIZ_COPY_LINK)"
        />
      </div>
      <p class="mt-4 font-semibold text-xs text-dark-4">
        <i18n>Embed Code</i18n>
      </p>
      <div class="rounded border-1 border-dark-6 w-full p-2 pl-3 mt-1 flex items-start space-x-2">
        <p class="flex-1 text-dark-3 text-sm font-semibold break-all">
          {{ iframeCode }}
        </p>
        <Button
          size="sm"
          type="custom"
          customClasses="bg-dark-5% text-dark-2 hover:bg-dark-10%"
          :title="$i18n('Copy')"
          @click="() => handleCopyText(iframeCode, $webEvents.EMBED_QUIZ_COPY_CODE)"
        />
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

  data() {
    return {
      displayEmbedModal: false,
    };
  },

  computed: {
    ...mapGetters('currentQuiz', ['quizName', 'currentQuiz', 'publishedQuestions']),

    authorName() {
      const { createdBy } = this.currentQuiz;
      return `${createdBy.firstName} ${createdBy.lastName} `;
    },

    totalQuestions() {
      return this.publishedQuestions?.length || 0;
    },

    embedLink() {
      return `https://${window.location.host}/embed/${this.$route.params.quizType}/${this.$route.params.id}`;
    },

    iframeCode() {
      return `<div style="width:100%;display:flex;flex-direction:column;gap:8px;min-height:635px;"><iframe src="${this.embedLink}" title="${this.quizName} - Quizizz" style="flex:1;" frameBorder="0" allowfullscreen></iframe><a href="https://quizizz.com/admin?source=embedFrame" target="_blank">Explore more at Quizizz.</a></div>`;
    },
  },

  mounted() {
    this.$eventBus.$on(this.$constants.EventBus.EMBED_QUIZ_MODAL_SHOW, this.showEmbedQuizModal);
    this.$eventBus.$on(this.$constants.EventBus.EMBED_QUIZ_MODAL_HIDE, this.hideEmbedQuizModal);
  },

  beforeUnmount() {
    this.$eventBus.$off(this.$constants.EventBus.EMBED_QUIZ_MODAL_SHOW, this.showEmbedQuizModal);
    this.$eventBus.$off(this.$constants.EventBus.EMBED_QUIZ_MODAL_HIDE, this.hideEmbedQuizModal);
  },

  methods: {

    showEmbedQuizModal() {
      this.displayEmbedModal = true;
    },

    hideEmbedQuizModal() {
      this.displayEmbedModal = false;
    },

    toggleModal() {
      this.displayEmbedModal = !this.displayEmbedModal;
    },

    handleCopyText(text, eventName) {
      this.$analytics.logEvent(eventName, {
        quizId: this.$route.params.id,
      });
      this.$clipboard.copy(text);
      this.$toasts.add({
        type: this.$constants.ToastTypes.SUCCESS,
        icon: 'fas fa-check',
        title: this.$i18n('Copied to clipboard'),
      });
    },
  },

};
</script>

<style lang="scss" scoped>
.embed-preview {
  @apply bg-cover bg-center;
  background-image: url('https://cf.quizizz.com/image/darkBG.png');

  & > * {
    @apply pointer-events-none;
  }
}
</style>

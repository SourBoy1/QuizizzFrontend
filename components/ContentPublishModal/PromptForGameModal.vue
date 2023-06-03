<template>
  <Modal
    size="lg"
    bgImage="https://cf.quizizz.com/image/host-modal-pattern.png"
    backgroundColor="bg-transparent"
    @close="takeToQuizPage"
  >
    <div class="px-4">
      <div class="mb-6 flex justify-center">
        <div class="overflow-hidden flex flex-col w-70 gap-y-3 border-2 border-dark-6 rounded-lg bg-light-3">
          <VImage
            :imgObj="{
              src: quizImage || errorImg,
              error: errorImg,
            }"
            aria-hidden="true"
            :options="{
              alt: 'Quiz image',
              fitClass: quizImage ? 'object-cover' : 'object-contain',
            }"
            :containerClasses="['w-full h-50 ', !quizImage && placeholderImageBg]"
          />

          <div class="flex justify-between px-4">
            <Lozenge
              class="bg-light-1 text-dark-3"
              size="xs"
              :title="$i18n('QUIZ')"
              rounded
            />
            <Lozenge
              v-if="isQuizSuper && !$user.isCorporate"
              class="bg-super-10% text-super ml-auto"
              size="xs"
              icon="fas fa-bolt-lightning"
              :title="showIndividualPlan ? 'PREMIUM' : 'SUPER'"
              rounded
            />
          </div>

          <div class="px-4">
            {{ quizName }}
          </div>

          <div
            class="flex items-center mx-4 mb-2"
          >
            <span class="text-xs text-dark-3">{{ subjectLabels }}</span>

            <div class="flex items-center mx-2">
              <div class="w-1 h-1 rounded-full bg-dark-5" />
            </div>

            <span class="text-xs text-dark-3">{{ numOfQuestions }} <i18n :injections="[numOfQuestions === 1 ? '' : 's']">Question{$1}</i18n></span>
          </div>
        </div>
      </div>

      <h1 class="text-xl text-center font-semibold">
        <i18n>Great work with the quiz!</i18n>
      </h1>
      <h2 class="text-dark-3 text-center">
        <i18n v-if="$user.isCorporate">
          Your quiz is saved and ready to play with participants
        </i18n>
        <i18n v-else>
          Your quiz is saved and ready to play with students
        </i18n>
      </h2>

      <div class="flex gap-x-2 mt-4">
        <Button
          class="w-full"
          type="special"
          size="lg"
          variant="shadow"
          fullHeight
          licon="fas fa-chalkboard-teacher"
          :subtitle="$i18n('Start a live quiz')"
          :title="$i18n('INSTRUCTOR-LED SESSION')"
          @click="takeToGameSettings('live')"
        />
        <Button
          class="w-full"
          type="special"
          size="lg"
          variant="shadow"
          fullHeight
          licon="fas fa-chalkboard-teacher"
          :subtitle="$user.isCorporate ? $i18n('Assign activity') : $i18n('Assign homework')"
          :title="$i18n('ASYNCHRONOUS LEARNING')"
          @click="takeToGameSettings('async')"
        />
      </div>

      <div class="flex justify-center">
        <Button
          class="mt-6"
          :title="$i18n('Not now')"
          type="link-no-bg"
          size="md"
          @click="takeToQuizPage"
        />
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from '~/components/Modal/index.vue';

export default {

  components: {
    Modal,
  },

  props: {
    quizId: {
      type: String,
      default: '',
    },

    quizName: {
      type: String,
      default: '',
    },

    quizImage: {
      type: String,
      default: '',
    },

    isQuizSuper: {
      type: Boolean,
      default: false,
    },

    subjects: {
      type: Array,
      default: () => [],
    },

    numOfQuestions: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      errorImg: 'https://cf.quizizz.com/image/quizizz-color-logo.png',
    };
  },

  computed: {
    subjectLabels() {
      return this.subjects.join(', ');
    },

    placeholderImageBg() {
      const colors = [
        'bg-brand-a',
        'bg-brand-b',
        'bg-brand-c',
        'bg-brand-d',
      ];

      return colors[Math.floor(Math.random() * colors.length)];
    },
  },

  methods: {
    takeToGameSettings(gameType) {
      if (gameType === 'live') {
        this.$analytics.logEvent(this.$webEvents.PROMPT_GAME_MODAL_USED, {
          game: 'live',
          quizId: this.quizId,
        });
        this.$router.push(`/admin/quiz/start_new/${this.quizId}`);
        return;
      }

      this.$analytics.logEvent(this.$webEvents.PROMPT_GAME_MODAL_USED, {
        game: 'async',
        quizId: this.quizId,
      });
      this.$router.push(`/admin/quiz/homework/${this.quizId}`);
    },

    takeToQuizPage() {
      this.$analytics.logEvent(this.$webEvents.PROMPT_GAME_MODAL_USED, {
        game: 'quiz_page',
        quizId: this.quizId,
      });
      this.$router.push(`/admin/quiz/${this.quizId}?qcPublish=true`);
    },
  },
};
</script>

<style lang="scss"></style>

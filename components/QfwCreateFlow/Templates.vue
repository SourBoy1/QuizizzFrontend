<template>
  <div
    class="mt-6 flex flex-row flex-wrap gap-2 md:gap-0"
    :class="isMobile ? 'justify-center' : null"
  >
    <QuizizzLink
      v-for="(quiz, index) in quizList"
      :key="quiz._id"
      :title="quiz.info.name"
      :aria-label="$i18n(`${quiz.info.name}`)"
      class="quiz-card rounded-xl bg-light-3 mr-1 md:mr-5 text-left ring-1 ring-dark-10% flex-shrink-0 mb-4 md:mb-8 cursor-pointer hover:shadow-lg h-72 w-72 relative"
      :to="quiz.url"
      :isExternal="quiz.isExternal"
      :disableRedirection="disableRedirection"
      @click="(to) => {
        templateClicked(to, quiz._id)
      }
      "
    >
      <div
        class="w-full h-full absolute hidden md:flex justify-center items-center rounded"
        :class="[currentHoverId === quiz._id && 'z-5 template-card']"
        @mouseover="setCurrentHoverId(quiz._id)"
        @mouseleave="setCurrentHoverId(null)"
      >
        <div
          class="bg-lilac rounded text-light-1 px-3 py-2 "
          @mouseover="setCurrentHoverId(quiz._id)"
        >
          <i18n>USE THIS TEMPLATE</i18n>
        </div>
      </div>
      <div
        class="overflow-hidden rounded-t-xl h-full"
        @click="handleEvent(index)"
        @mouseover="setCurrentHoverId(quiz._id)"
      >
        <div>
          <VImage
            v-if="shouldShowQuizImage(quiz)"
            :imgObj="{ src: quiz.info.image }"
            aria-hidden="true"
            :options="{
              alt: 'Quiz image',
            }"

            containerClasses="w-full h-48"
          />
          <div
            v-else
            aria-hidden="true"
            :class="[
              'w-full h-48 flex justify-center items-center',
              [
                'bg-brand-a',
                'bg-brand-b',
                'bg-brand-c',
                'bg-brand-d',
                'bg-brand-e',
              ][index % 5],
            ]"
          >
            <img
              aria-hidden="true"
              src="https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png"
              class="w-10 h-10 opacity-50"
              :alt="quiz.info.name"
            />
          </div>
        </div>
        <div
          aria-hidden="true"
          class="px-2.5 pt-2.5 pb-3.5 flex flex-col h-30"
        >
          <div class="flex items-center">
            <Lozenge
              :class="showCustomLozenge ? quiz.lozenge?.customClasses : 'bg-light-1 text-dark-3'"
              size="xs"
              :title="getLozengeTitle(index)"
              rounded
            />
          </div>
          <div
            class="mt-2 mb-4 text-sm md:text-base text-dark-2 font-semibold"
            :title="quiz.info.name"
          >
            {{ truncate(quiz.info.name) }}
          </div>
        </div>
      </div>
    </QuizizzLink>
    <div
      v-if="seeMore"
      class="see-more flex flex-col justify-center items-center p-5 text-center rounded-xl bg-light-3 mr-2 md:mr-5 text-left flex-shrink-0 mb-4 md:mb-8 cursor-pointer hover:shadow-lg h-60 md:h-72 w-40 md:w-72"
      @click="onSeeMoreClick"
    >
      <div class="icon-wrapper bg-dark-5% rounded-full w-17 h-17 flex justify-center items-center">
        <FA
          :icon="seeMore.icon"
          class="text-dark-4"
          :size="32"
        />
      </div>
      <div class="mt-4 text-dark-2 text-sm">
        {{ seeMore.title }}
      </div>
      <Button
        :title="seeMore.buttonText"
        type="other"
        class="mt-4"
      />
    </div>
  </div>
</template>

<route lang="yaml">
  meta:
    layout: globalDashboard
</route>

<script>
import { mapGetters } from 'vuex';

export default {

  props: {
    quizList: {
      type: Array,
      default: () => [],
    },

    seeMore: {
      type: Object,
      default: () => null,
      // {
      //   icon: 'fa-solid fa-clipboard-list-check',
      //   title: this.$i18n('View all your reports in once place'),
      //   buttonText: this.$i18n('Go to Reports'),
      //   url: '/admin/reports',
      //   lozenge: { -> for showCustomLozenge = true
      //    title: '',
      //    customClasses: '',
      //   }
      // }
    },

    showCustomLozenge: {
      type: Boolean,
      default: false,
    },
    disableRedirection: {
      type: Boolean,
      default: false,
    },

    selectedTab: {
      type: String,
      default: '',
    },

    source: {
      type: String,
      default: '',
    },
  },
  emits: ['seeMore'],

  data() {
    return {
      currentHoverId: '',
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'isMobile']),
  },

  methods: {
    setCurrentHoverId(id) {
      this.currentHoverId = id;
    },

    templateClicked(url, quizId) {
      this.$analytics.logEvent(this.$webEvents.QFW_CREATE_USE_TEMPLATE_CLICKED, { url, quizId, tab: this.selectedTab });
      window.location.href = url;
    },

    getLozengeTitle(index) {
      const quiz = this.quizList[index];

      if (this.showCustomLozenge) {
        return quiz.lozenge.title;
      }

      if (this.$constants.ContentType.QUIZ) {
        return this.$i18n('QUIZ');
      }
      return this.$user.isCorporate ? this.$i18n('PRESENTATION') : this.$i18n('LESSON');
    },

    truncate(string) {
      return this.$i18n(this.$stringUtils.truncateLongStrings(string));
    },

    handleEvent(index) {
      if (this.disableRedirection) {
        return;
      }
      const quiz = this.quizList[index];
      this.$analytics.logEvent(this.$webEvents.QFW_CONTENT_CLICK, { name: quiz.info.name, to: quiz?.url });
    },

    shouldShowQuizImage(quiz) {
      return !!quiz.info.image;
    },

    onSeeMoreClick() {
      this.$emit('seeMore');
    },
  },
};
</script>

<style lang="scss" scoped>
.template-card {
  transition: 0.2s;
  &:hover {
    background: rgba(250, 245, 255, 0.20) !important;
    backdrop-filter: blur(1px) !important;
  }
}
</style>

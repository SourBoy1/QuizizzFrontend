<template>
  <div
    ref="teleportHorizontalQuestionList"
    class="teleportHorizontalList flex flex-col justify-center w-screen"
  >
    <Carousel
      v-if="canShowQuizList"
      ref="carousel"
      slideRef="content-card-small"
      :numberOfSlides="list.length"
      @swipe="onSwipe"
    >
      <ContentCardSmall
        v-for="quiz, index in list"
        :key="quiz._id"
        :isSelected="index === currentSlide"
        :content="quiz"
        class="content-card-small mb-3"
        :isSuperContent="isSuperContent(quiz)"
        :isLoading="isLoadingState"
        @onContentSelected="onContentSelected(index)"
      />
    </Carousel>
    <Carousel
      v-if="!canShowQuizList && isLoadingState"
      slideRef="content-card-small"
      :numberOfSlides="loadingCardsData.length"
      @swipe="onSwipe"
    >
      <div
        v-for="quiz, index in loadingCardsData"
        :key="quiz._id + index"
      >
        <ContentCardSmall
          :key="quiz._id"
          :isSelected="currentSlide === index"
          :content="quiz"
          class="content-card-small mb-3"
          :isSuperContent="isSuperContent(quiz)"
          :isLoading="isLoadingState"
        />
      </div>
    </Carousel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { handleFocusRings, stopHandlingFocusRings } from '~/services/FocusRingsService.js';

export default {

  props: {
    list: {
      type: Array,
      default: () => [],
    },
    selectedCard: {
      type: Object,
      default: () => {},
    },
    showLoader: {
      type: Boolean,
      default: false,
    },
    searchSubmitCallInProgress: {
      type: Boolean,
      default: false,
    },
    isLoadingState: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['loadMoreQuiz', 'onContentSelected'],

  data() {
    return {
      currentSlide: -1,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['isTeleportContentSuper']),

    canShowQuizList() {
      return this.list.length > 0;
    },

    loadingCardsData() {
      const dummyData = {
        _id: 'dummyID',
        createdBy: {
          local: {
            username: 'dummyText',
          },
        },

        deleted: false,
        info: {
          name: 'dummyText',
          questions: [],
          image: '',
          subjects: ['dummyText'],
          grades: ['dummyText'],
        },
      };
      const dummyCardArray = [];
      for (let idx = 0; idx < 5; idx++) {
        dummyData._id = idx.toString();
        dummyCardArray.push(dummyData);
      }
      return dummyCardArray;
    },

    getEmptyState() {
      const items = ['brand-a', 'brand-b', 'brand-c', 'brand-d', 'brand-e', 'deleted'];

      return items[Math.floor(Math.random() * items.length)];
    },
  },

  watch: {
    currentSlide() {
      if (this.list && this.list.length > 5 && this.currentSlide >= this.list.length - 5) {
        this.$emit('loadMoreQuiz');
      }
    },
  },

  mounted() {
    handleFocusRings(window);
  },

  beforeUnmount() {
    stopHandlingFocusRings();

    this.$emit('onContentSelected', {}, '');
  },

  methods: {
    isSuperContent(content) {
      return this.isTeleportContentSuper(content);
    },

    onSwipe(currentSlide) {
      this.currentSlide = currentSlide;
      const selectedContent = this.list[currentSlide];
      this.$emit('onContentSelected', selectedContent, '');
    },

    onContentSelected(index) {
      this.currentSlide = index;
      this.$refs.carousel?.scrollToSlide(index);
      this.$emit('onContentSelected', this.list[index], this.getEmptyState);
    },
  },

};
</script>

<style lang="scss" scoped>
  .teleportHorizontalList {
    height: 90px;
  }
</style>

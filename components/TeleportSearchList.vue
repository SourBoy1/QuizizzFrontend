<template>
  <div
    ref="teleportSearchList"
    class="overflow-y-auto"
    @scroll.passive="handleScroll"
  >
    <div class="flex flex-col">
      <ContentCardSmall
        v-for="quiz, index in list"
        :key="`${index}_${getUUID()}`"
        :isSelected="isSelectedCard(quiz)"
        :content="quiz"
        class="mb-3"
        :isSuperContent="isSuperContent(quiz)"
        :isLoading="isLoadingState"
        @onContentSelected="onContentSelected"
      />
    </div>

    <div
      v-if="showLoader"
      class="relative h-16"
    >
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10">
        <Loader :size="40" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import { getUUID } from '~/services/UIDService.js';

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

  computed: {
    ...mapGetters('contentEditor', ['isTeleportContentSuper']),
  },

  watch: {
    searchSubmitCallInProgress(newVal, oldVal) {
      if (!newVal && oldVal) {
        if (!isEmpty(this.$refs.teleportSearchList)) {
          this.$refs.teleportSearchList.scrollTop = 0;
        }
      }
    },
  },

  methods: {
    getUUID() {
      return getUUID();
    },

    handleScroll(e) {
      if (this.isLoadingState) { return; }

      if ((e.target.scrollTop + e.target.clientHeight) >= (e.target.scrollHeight - 100)) {
        this.$emit('loadMoreQuiz');
      }
    },

    onContentSelected(content, emptyStateType) {
      if (this.isLoadingState) { return; }

      this.$emit('onContentSelected', content, emptyStateType);
    },

    isSelectedCard(card) {
      return this.selectedCard._id === card._id;
    },

    isSuperContent(content) {
      return this.isTeleportContentSuper(content);
    },
  },
};
</script>

<style lang="scss" scoped></style>

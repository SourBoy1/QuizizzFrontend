<template>
  <div class="w-full min-h-full h-auto bg-dark-50%">
    <div class="flex flex-col w-11/12 h-full items-center mx-auto md:px-5">
      <GameOfflineAccuracyBar
        v-bind="accuracyBarProps"
        class="mt-14"
      />
      <div class="flex-1 my-12 flex space-x-6 w-full h-full">
        <GameOfflineQuestionPreview
          :question="currentQuestion"
          :responses="questionReportBarData"
          :questionNum="currentQuestionIndex"
        />
        <GameOfflineLeaderboard :leaderboard="gameLeaderboard" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { MODULE_NAME } from '~/dynamic-store/offline-mode';

export default {
  computed: {
    ...mapGetters(MODULE_NAME, [
      'gameLeaderboard',
      'inGameAccuracy',
      'totalCorrectResponses',
      'totalResponses',
      'currentQuestion',
      'questionReportBarData',
      'currentQuestionIndex',
      'questionReportBarData',
    ]),

    accuracyBarProps() {
      return {
        accuracy: this.inGameAccuracy,
        totalCorrect: this.totalCorrectResponses,
        totalQuestions: this.totalResponses,

      };
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

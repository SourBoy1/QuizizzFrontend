<template>
  <div
    ref="leaderboardRef"
    class="h-full flex-1 md:flex-initial md:min-w-100"
  >
    <div
      class="leaderboard-container flex flex-col bg-dark-50% rounded-lg overflow-hidden"
      :style="{ maxHeight: `${containerMaxHeight}px` }"
    >
      <div
        class="leaderboard-table flex-1 text-light-3 overflow-y-scroll"
        @scroll="handleScroll"
      >
        <div :class="['flex items-center justify-between pl-4 pr-9 py-3 space-x-1 sticky top-0 z-10 transition-colors', scrollActive ? 'bg-dark' : 'bg-transparent']">
          <h3 class="text-base w-15">
            <i18n>Rank</i18n>
          </h3>
          <h3 class="text-base flex-1 pl-3">
            <i18n>Name</i18n>
          </h3>
          <h3 class="text-base self-end">
            <i18n>Points</i18n>
          </h3>
        </div>
        <div class="players-list flex flex-col space-y-1 text-light-3 px-3 pb-3">
          <div
            v-for="(player, idx) in leaderboard"
            :key="idx"
            class="player flex items-center justify-between rounded-lg bg-dark-80% pl-4 pr-9 py-2 space-x-1"
          >
            <p class="text-base w-15">
              {{ player.rank }}
            </p>
            <div class="text-base flex items-center space-x-6 flex-2">
              <p>{{ player.name }}</p>
            </div>
            <p class="text-base">
              {{ player.score }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    leaderboard: {
      type: Array,
      default: () => ([]),
    },
  },

  data() {
    return {
      containerMaxHeight: 448,
      scrollActive: false,
    };
  },

  computed: {
    totalPlayers() {
      return this.leaderboard.length;
    },
  },

  mounted() {
    const { leaderboardRef } = this.$refs;
    if (leaderboardRef) {
      this.containerMaxHeight = leaderboardRef.clientHeight;
    }
  },

  methods: {
    handleScroll(e) {
      if (e.target.scrollTop >= 20) {
        this.scrollActive = true;
      } else {
        this.scrollActive = false;
      }
    },

  },

};
</script>

<style lang="scss" scoped>

</style>

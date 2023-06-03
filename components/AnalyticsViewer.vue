<template>
  <div
    class="fixed rounded shadow-lg p-4 z-overlay bg-light-3 w-6/12 md:w-4/12 max-h-100 m-4 overflow-y-auto"
    :class="[getPlacementClass]"
  >
    <div class="flex justify-between px-4">
      <h1 class="text-sm md:text-lg font-semibold">
        Events
      </h1>
      <div class="flex">
        <Button
          :title="expandAll ? 'Collapse All' : 'Expand All'"
          :size="'xs'"
          class="mr-2"
          @click="expandAllEvents"
        />
        <Button
          title="Clear All"
          :size="'xs'"
          class="mr-2"
          @click="clearAll"
        />
        <Button
          title="Close"
          :size="'xs'"
          @click="$emit('close')"
        />
      </div>
    </div>
    <div class="text-dark-4 px-4 text-tn md:text-sm semibold">
      Placement
    </div>
    <div class="flex px-4 space-x-2 my-2">
      <Button
        title="Top Left"
        :size="'xs'"
        @click="placement = 'tl'"
      />
      <Button
        title="Top Right"
        :size="'xs'"
        @click="placement = 'tr'"
      />
      <Button
        title="Bottom Left"
        :size="'xs'"
        @click="placement = 'bl'"
      />
      <Button
        title="Bottom Right"
        :size="'xs'"
        @click="placement = 'br'"
      />
    </div>
    <transition-group
      name="list"
      tag="ul"
      class="flex flex-col px-4"
    >
      <li
        v-for="(event, index) in events"
        :key="event.time"
        class="pb-2 pt-2"
      >
        <h3 class="text-dark-4 text-tn md:text-sm font-semibold">
          {{ getTableName(event.eventName) }}
        </h3>
        <div class="flex justify-between items-center">
          <h1 class="font-semibold text-tn md:text-sm">
            {{ event.eventName }}
          </h1>
          <div class="flex space-x-4 items-center">
            <div @click="copyEvent(event.eventName)">
              <FA
                icon="far fa-clipboard"
                size="14"
                class="text-lilac cursor-pointer"
              />
            </div>
            <div @click="selectIndex(Number(index))">
              <FA
                icon="fas fa-chevron-down"
                size="14"
                class="text-lilac cursor-pointer"
              />
            </div>
          </div>
        </div>
        <Transition
          v-if="event.eventName === 'pageview3'"
          name="slide-fade"
        >
          <table
            v-if="Number(index) === selectedIndex || expandAll"
            class="mt-2"
          >
            <tr>
              <td class="font-semibold text-gray-500 text-tn md:text-base">
                Params
              </td>
            </tr>
            <tr>
              <td>
                <ul class="flex flex-col space-y-2">
                  <li
                    v-for="(value, key) in event"
                    :key="key"
                    class="text-tn md:text-base"
                  >
                    <template v-if="String(key) !== 'eventName'">
                      <span class="font-semibold">{{ key }}: </span>
                      <div
                        v-if="String(key) === 'referrer' || String(key) === 'featureFlags' || String(key) === 'location'"
                        class="ml-4"
                      >
                        <ul class="flex flex-col space-y-2">
                          <li
                            v-for="(value2, key2) in value"
                            :key="key2"
                          >
                            <span class="font-semibold">{{ key2 }}: </span>
                            <span>{{ value2 }}</span>
                          </li>
                        </ul>
                      </div>
                      <span v-else>{{ value }}</span>
                    </template>
                  </li>
                </ul>
              </td>
            </tr>
          </table>
        </Transition>
        <Transition
          v-else
          name="slide-fade"
        >
          <table
            v-if="Number(index) === selectedIndex || expandAll"
            class="mt-2"
          >
            <tr>
              <td class="font-semibold text-gray-500 text-tn md:text-base">
                Params
              </td>
            </tr>
            <tr>
              <td>
                <ul class="flex flex-col space-y-2 text-tn md:text-base">
                  <li
                    v-for="(value, key) in event.params"
                    :key="key"
                  >
                    <span class="font-semibold">{{ key }}: </span>
                    <span>{{ value }}</span>
                  </li>
                </ul>
              </td>
            </tr>
          </table>
        </Transition>
      </li>
    </transition-group>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  emits: ['close'],

  data() {
    return {
      selectedIndex: null,
      expandAll: false,
      placement: 'br',
    };
  },

  computed: {
    ...mapGetters({
      events: 'analyticsManager/read',
    }),
    getPlacementClass() {
      if (this.placement === 'tl') { return 'top-0 left-0'; }
      if (this.placement === 'tr') { return 'top-0 right-0'; }
      if (this.placement === 'bl') { return 'bottom-0 left-0'; }
      if (this.placement === 'br') { return 'bottom-0 right-0'; }
      return 'top-0 left-0';
    },
  },

  methods: {
    copyEvent(event) {
      navigator.clipboard.writeText(event);
    },
    clearAll() {
      this.$store.dispatch('analyticsManager/clearAnalyticsData');
    },
    selectIndex(index) {
      if (this.selectedIndex === index) {
        this.selectedIndex = null;
        return;
      }
      this.selectedIndex = index;
    },

    expandAllEvents() {
      this.expandAll = !this.expandAll;
    },
    getTableName(event) {
      if (!event) {
        return 'unknown';
      }
      if (event === 'pageview3') {
        return 'event.pageview3';
      } if (event === 'pageview') {
        return 'event.pageview2';
      } if (event.startsWith('qg_app_loading')) {
        return 'event.game_load2';
      } if (event.startsWith('qg_pw')) {
        return 'event.powerupEvents';
      } if (event.startsWith('qc_')) {
        return 'event.editor2';
      } if (event.startsWith('qg_')) {
        return 'event.game2';
      } if (event.startsWith('fc_')) {
        return 'event.flashCard';
      } if (event.startsWith('ft_')) {
        return 'event.feature2';
      } if (event.startsWith('nh_')) {
        return 'event.networkHealth2';
      } if (event.startsWith('searchEvent_')) {
        return 'event.searchEvents2';
      } if (event.startsWith('ReportAbuse')) {
        return 'event.reportAbuse';
      } if (event.startsWith('app_screen_view')) {
        return 'event.app_screen_view';
      } if (event.startsWith('auth_app_')) {
        return 'event.app_auth';
      } if (event.startsWith('app_')) {
        return 'event.app';
      } if (event.startsWith('rdq_')) {
        return 'event.redemptionQuiz';
      } if (event.startsWith('super_')) {
        return 'event.super2';
      } if (event.startsWith('campaign_')) {
        return 'event.campaigns';
      }
      return 'event.others2';
    },
  },
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.list-enter-active {
  animation: fade-in 0.5s ease-in-out;
}

.list-leave-active {
  animation: fade-in 0.5s ease-in-out reverse;
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    transform: translateX(0px);
  }
}
</style>

<template>
  <dashboard v-if="!isMobile">
    <RouterView v-slot="{ Component }">
      <Transition
        name="fade"
        mode="out-in"
        appear
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </dashboard>
  <dashboard-mobile v-else>
    <RouterView v-slot="{ Component }">
      <Transition
        name="fade"
        mode="out-in"
        appear
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </dashboard-mobile>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import DashboardMobile from '~/layouts/dashboardMobile.vue';
import Dashboard from '~/layouts/dashboard.vue';

const store = useStore();
const isMobile = computed(() => store.getters['root/isMobile']);
</script>

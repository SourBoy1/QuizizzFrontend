<template>
  <div class="internal-dashboard-layout h-screen flex flex-col">
    <nav class="top-nav-bar bg-purple flex py-2 px-4">
      <ul class="w-full flex justify-between">
        <li class="w-50 min-w-50 flex items-center">
          <a
            href="/aid/user"
            class="font-semibold text-3xl text-light"
          >
            <img
              data-v-09dc8658=""
              src="https://cf.quizizz.com/img/quizizz_logos/white-brandmark-600x164.png"
              alt="Quizizz"
              class="max-w-22 xs:max-w-28"
            />
          </a>
        </li>
      </ul>
    </nav>
    <div class="flex grow">
      <aside class="bg-purple w-50 min-w-50">
        <AidSidebar />
      </aside>
      <main class="w-full bg-light-1">
        <RouterView v-slot="{ Component }">
          <Transition
            name="fade"
            mode="out-in"
            appear
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
    <ToastManager />
  </div>
</template>

<script>
import ToastManager from '~/components/ToastManager.vue';

import Sidebar from '~/components/Aid/Sidebar.vue';

export default {
  components: { AidSidebar: Sidebar, ToastManager },
  data() {
    return {

    };
  },

  mounted() {

  },
  methods: {

  },
};
</script>

<style lang="scss" scoped>

</style>

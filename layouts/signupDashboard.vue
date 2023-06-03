<template>
  <div class="absolute inset-0 overflow-auto font-sans bg-purple">
    <ToastManager />
    <SignupNavbar />
    <RouterView v-slot="{ Component }">
      <Transition
        name="fade"
        mode="out-in"
        appear
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<script>
import $axios from '~/services/AxiosService';

import $store from '~/services/StoreService.js';

import PageTitles from '~/config/PageTitles';
import ToastManager from '../components/ToastManager.vue';

export default {
  components: { ToastManager },

  head() {
    return {
      title: PageTitles[this.$route.name] ? PageTitles[this.$route.name] : 'Quizizz',
      link: [
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400;1,800&display=swap',
        },
      ],
    };
  },

  watch: {
    $route(to, from) {
      this.$analytics.processPageViewEvents(to, from, this.$gtag, this.$router);
    },
  },

  created() {
    $axios(this.$axios);
    $store(this.$store);
  },
};
</script>

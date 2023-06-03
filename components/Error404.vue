<template>
  <div
    v-if="error.statusCode === 404"
    data-cy="not-found-page"
    class="error-page flex flex-col items-center justify-center"
  >
    <img
      src="https://cf.quizizz.com/img/misc/404/locker_optim_900.gif"
      class="mb-10"
    />

    <div class="flex flex-col">
      <h1 class="text-dark-2 font-semibold text-xl md:text-2xl text-center">
        <i18n>Sorry, we can't find the page you're looking for.</i18n>
      </h1>

      <div class="flex flex-col items-center md:flex-row mt-6 md:justify-center">
        <Button
          type="white"
          :title="$i18n('Contact us')"
          :ariaLabel="$i18n('Contact us')"
          size="xl"
          licon="fas fa-envelope"
          class="button-shadow w-64"
          @click="redirectToContactUs"
        />

        <Button
          type="primary"
          :title="$i18n('Go home')"
          :ariaLabel="$i18n('Go home')"
          size="xl"
          licon="fas fa-house-chimney"
          class="button-shadow mt-3 md:ml-6 md:mt-0 w-64"
          @click="redirectToHome"
        />
      </div>
    </div>
  </div>
  <div v-else>
    <h1>An error occurred</h1>
    <router-link to="/">
      Home Page
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      required: true,
    },
  },

  methods: {
    redirectToContactUs() {
      window.location.href = 'https://support.quizizz.com/hc/en-us/articles/213118929-How-can-I-contact-Quizizz';
    },

    redirectToHome() {
      window.location.href = '/admin';
    },
  },
};
</script>

<style scoped lang="scss">
  .error-page {
    height: 100vh;
    width: 100vw;
    background: #DBDBDB;
  }

  .button-shadow {
    box-shadow: 0px 4px 0px #B6B6B6;
    transition: all .2s;

    &:active {
      box-shadow: none;
      transform: translateY(4px);
    }
  }
</style>

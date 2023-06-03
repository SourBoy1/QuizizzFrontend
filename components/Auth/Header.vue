<template>
  <nav class="flex p-2">
    <router-link
      to="/admin"
      class="mr-auto"
    >
      <img
        class="object-contain w-24 h-8 p-1 md:h-10 md:w-30"
        src="https://cf.quizizz.com/img/quizizz_logos/purple-brandmark-600x164.png"
        alt="logo"
      />
    </router-link>
    <div
      v-if="!$user.id"
      class="flex"
    >
      <Button
        class="mr-2"
        :title="$i18n('Enter code')"
        :fullHeight="true"
        size="md"
        type="secondary"
        @click="redirectToJoin"
      />
      <Button
        :title="$i18n('Login')"
        :fullHeight="true"
        size="md"
        type="primary"
        @click="showLoginModal"
      />
    </div>
  </nav>
</template>
<script>
export default {
  emits: [],

  methods: {
    showLoginModal() {
      this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW, { type: 'login' });
    },

    redirectToJoin() {
      let url = '/join';
      if (this.$user?.isCorporate) {
        url = '/pro/join';
      }
      window.open(url);
    },
  },
};
</script>

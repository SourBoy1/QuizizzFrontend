<template>
  <Modal
    type="blocker"
    :button1="null"
    :button2="{
      title: $i18n('Go back'),
      ariaLabel: $i18n('Go back to the home page'),
    }"
    icon="fas fa-eye-slash"
    @button2-click="handleGoBack"
  >
    <section class="flex justify-center flex-col items-center">
      <h1 class="text-dark-2 text-2xl mb-2 font-semibold">
        <i18n>You need access</i18n>
      </h1>

      <p class="text-sm font-semibold text-dark-4 text-center">
        <i18n>This is a private resource. You can’t view this without permission from the owner</i18n>
      </p>
    </section>
  </Modal>
</template>

<script>
export default {

  methods: {
    handleGoBack() {
      window.location.href = '/admin';
    },
  },
};
</script>

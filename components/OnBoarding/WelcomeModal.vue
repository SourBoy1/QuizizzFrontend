<template>
  <Modal
    v-if="shouldShow"
    :title="$i18n('Welcome back to Quizizz 🎉 ')"
    :subtitle="$i18n('Please confirm that your account details are accurate')"
    :button1="{
      title: $i18n('Continue'),
      type: 'primary',
    }"
    size="md"
    titleCustomClasses="text-dark-3 text-xl font-bold mb-2"
    subtitleCustomClasses="text-dark-50% text-sm font-semibold"
    headerCustomClasses="m-auto w-max text-center"
    footerClasses="justify-center mt-12"
    containerClasses="p-4"
    closeBtnClasses="hidden"
    @button1-click="onContinue"
  />
</template>

<script>
export default {
  props: {

  },

  data() {
    return {
      shouldShow: false,
    };
  },

  mounted() {
    this.$eventBus.$on('onboardingWelcomeModal:show', this.show);
  },

  beforeUnmount() {
    this.$eventBus.$off('onboardingWelcomeModal:show', this.show);
  },

  methods: {
    show() {
      this.shouldShow = true;
    },

    onContinue() {
      this.$router.push('/onboarding/teacher');
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

<template>
  <div class="flex flex-col h-screen overflow-hidden font-sans">
    <AuthHeader />
    <main class="flex flex-grow overflow-auto bg-light-1">
      <div class="mx-auto rounded-lg shadow-hard auth-container mt-19 md:mt-18 bg-light-3">
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
    </main>
    <AuthModal />
  </div>
</template>
<script>
import layoutMixin from '~/mixins/layoutMixin';
import GoogleOneTapMixin from '~/mixins/GoogleOneTapMixin';

export default {
  mixins: [layoutMixin, GoogleOneTapMixin],
};
</script>

<style lang="scss" scoped>
.skip-link {
  @apply bg-light-3 border border-dark-6 text-tn font-semibold p-2 rounded-sm absolute;
  transform: translateY(-100%);
  left: 50%;
  transition: transform 0.3s;
  z-index: 100;
  &:focus {
    transform: translateY(0%);
  }
}
.auth-container {
  width: 100%;
  height: auto;
  @screen md {
    width: 480px;
    height: fit-content;
  }
}
</style>

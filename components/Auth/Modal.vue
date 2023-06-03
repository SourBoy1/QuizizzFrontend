<template>
  <transition
    v-if="displayAuthModal"
    name="modal"
  >
    <div class="modal-mask">
      <div class="modal-wrapper">
        <AuthForm
          :preFillAuthId="preFillAuthId"
          :isModal="true"
          :isLogin="isLogin"
          :title="title"
          :authParams="authParams"
          @changeAuthType="changeAuthType"
        />
        <div
          v-if="isDesktop"
          data-cy="auth-modal-close-button"
          class="close-button close-button-bg"
          @click="hideAuthModal"
        >
          <FA
            :size="12"
            class="mt-0.5 fa fa-times text-light-3"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

  data() {
    return {
      displayAuthModal: false,
      preFillAuthId: '',
      isLogin: false,
      title: '',
      authParams: null,
      redirectTo: null,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
  },

  watch: {
    displayAuthModal(value) {
      if (!value) {
        if (this.redirectTo) {
          this.$router.push({
            path: this.redirectTo.path,
            query: this.redirectTo.query,
          });
          this.redirectTo = null;
        }
      }
    },
  },

  created() {
    this.$eventBus.$on(this.$constants.EventBus.AUTH_MODAL_SHOW, this.showAuthModal);
    this.$eventBus.$on(this.$constants.EventBus.AUTH_MODAL_HIDE, this.hideAuthModal);
  },

  beforeUnmount() {
    this.$eventBus.$off(this.$constants.EventBus.AUTH_MODAL_SHOW, this.showAuthModal);
    this.$eventBus.$off(this.$constants.EventBus.AUTH_MODAL_HIDE, this.hideAuthModal);
  },

  methods: {
    showAuthModal(payload = {}) {
      this.preFillAuthId = payload.preFillAuthId;
      this.displayAuthModal = true;
      if (payload.type === 'login') {
        this.isLogin = true;
      } else {
        this.isLogin = false;
      }
      if (payload.authParams) {
        this.authParams = payload.authParams;
      }
      if (payload.title) {
        this.title = payload.title;
      } else {
        this.title = this.$i18n('Welcome to Quizizz');
      }
      this.redirectTo = payload.redirectTo;
    },

    changeAuthType(type) {
      if (type === 'login') {
        this.isLogin = true;
      } else {
        this.isLogin = false;
      }
    },

    hideAuthModal() {
      this.preFillAuthId = '';
      this.deleteSignupEventParams();
      this.displayAuthModal = false;
    },

    deleteSignupEventParams() {
      const query = { ...this.$route.query };
      delete query.ctaSource;
      delete query.fromPage;
      if (this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.LAND_GAME_SETTINGS)) {
        delete query.q;
      }
      this.$router.push({
        path: this.$route.path,
        query,
      });
    },
  },
};
</script>

<style lang="scss" scoped>

.modal-mask {
  @apply fixed z-overlay top-0 left-0 w-full h-full bg-dark-80% flex justify-center items-center;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  @apply flex justify-center items-center relative;

  .close-button {
    @apply absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full cursor-pointer;
  }
}

.close-button-bg {
  background: rgba(9, 9, 9, 0.5);
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  transform: scale(1.1);
}

</style>

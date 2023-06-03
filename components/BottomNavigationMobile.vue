<template>
  <section
    v-if="shouldShow"
    translate="no"
    class="bottom-nav-wrapper flex"
  >
    <div
      v-if="quizGenShowing"
      class="py-3 px-4 rounded-t-2xl bg-light flex items-center justify-start border-b-1 border-dark-6"
      @click="handleQuizGenBannerClick"
    >
      <div class="flex items-center justify-center object-contain">
        <CircularDonutChart
          v-if="quizGenLoading"
          :percent="quizGenLoaderStatus"
          :label="`${quizGenLoaderStatus}%`"
          :labelFontSize="12"
          :labelFontWeight="500"
          :dynamic="true"
          :radius="21"
          :padding="6"
          :strokeWidth="4"
        />
        <FA
          v-else-if="quizGenGenerated"
          icon="fa-solid fa-circle-check"
          size="42"
          class="text-green"
        />
      </div>
      <div class="flex flex-col items-start space-y-2 ml-4">
        <p class="text-dark-2 text-base font-semibold">
          <span v-if="quizGenLoading">Generating quiz</span>
          <span v-else-if="quizGenGenerated">Your quiz is ready!</span>
        </p>
        <p class="text-dark-4 text-xs font-semibold">
          {{ quizGenMeta?.topic }}
        </p>
      </div>
      <div class="ml-auto">
        <FA icon="fa-solid fa-chevron-right" />
      </div>
    </div>
    <div class="flex items-center justify-around px-4 bg-light">
      <div
        v-for="tab in bottomTabs"
        :key="tab.name"
      >
        <div>
          <router-link
            v-if="tab.type === 'link'"
            :to="tab.to"
            :class="[$route.name === tab.route ? 'text-purple font-semibold border-t-2 border-purple' : '']"
            class="flex flex-col items-center py-2 space-y-1"
          >
            <img
              v-if="tab.kind === 'image' "
              :src="$route.name === tab.route ? tab.imageActive : tab.imageInactive"
              class="w-4 h-4"
            />
            <FA
              v-else
              :icon="[$route.name === tab.route || tab.fill ? 'fas' : 'fal', tab.icon].join(' ')"
              :size="16"
            />
            <div class="capitalize">
              {{ tab.name }}
            </div>
          </router-link>
          <div
            v-else
            :class="[$route.name.startsWith(tab.route) ? 'text-purple font-semibold border-t-2 border-purple' : '']"
            class="flex flex-col items-center py-2 space-y-1"
            @click="handleTabAction(tab.actionType)"
          >
            <img
              v-if="tab.kind === 'image' "
              :src="$route.name === tab.route ? tab.imageActive : tab.imageInactive"
              class="w-4 h-4"
            />
            <FA
              v-else
              :icon="[$route.name === tab.route || tab.fill ? 'fas' : 'fal', tab.icon].join(' ')"
              :size="16"
              :class="[tab.additionalClasses ? tab.additionalClasses : '']"
            />
            <div class="capitalize">
              {{ tab.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';

import QuizService from '~/services/apis/QuizService';

export default {
  emits: ['handleCreateContent'],
  data() {
    return {
      shouldShow: true,
      tabs: [
        {
          imageActive: 'https://cf.quizizz.com/game/img/misc/bottom_nav_explore_icon.png',
          imageInactive: 'https://cf.quizizz.com/image/q_explore_deselected.png',
          kind: 'image',
          name: this.$i18n('explore'),
          type: 'link',
          to: '/admin',
          route: 'admin',
          hide: this.$user.isCorporate,
        },
        {
          icon: 'fa-books',
          kind: 'icon',
          name: this.$i18n('library'),
          type: 'action',
          to: '/admin/private',
          route: 'admin-private',
          actionType: 'redirect-library',
        },
        {
          icon: 'fa-plus-circle',
          kind: 'icon',
          fill: true,
          name: this.$i18n('create'),
          type: 'action',
          actionType: 'create-lesson',
          additionalClasses: 'create-icon',
        },
        {
          icon: 'fa-analytics',
          kind: 'icon',
          name: this.$i18n('reports'),
          type: 'action',
          actionType: 'redirect-reports',
        },
        {
          icon: 'fa-users-class',
          kind: 'icon',
          name: this.$i18n('classes'),
          type: 'action',
          route: 'admin-classes',
          actionType: 'redirect-classes',
          hide: this.$user.occupation === this.$constants.UserOccupation.STUDENT || this.$user.isCorporate,
        }],
    };
  },

  computed: {
    ...mapGetters('root', ['serverData']),
    ...mapGetters('root', ['deviceProps', 'isDesktop']),
    ...mapGetters('uiManager', ['quizGenShowing', 'quizGenLoading', 'quizGenGenerated', 'quizGenMeta', 'quizGenLoaderStatus', 'quizGenError']),
    isUserLoggedIn() {
      return Boolean(this.$user.id);
    },
    bottomTabs() {
      return this.tabs?.filter((tab) => !tab.hide);
    },
  },

  watch: {
    quizGenError(newVal) {
      if (newVal) {
        const quizId = this.quizGenMeta?.quizId;
        if (quizId) {
          QuizService.deleteQuiz(quizId);
        }
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Failed to generate the Quiz!'),
        });
        this.$store.dispatch('uiManager/resetQuizGenData');
      }
    },
  },

  created() {
    this.$eventBus.$on('bottomNavigationMobile:toggle', this.toggleBottomBar);
  },

  beforeUnmount() {
    this.$eventBus.$off('bottomNavigationMobile:toggle', this.toggleBottomBar);
  },

  methods: {
    toggleBottomBar() {
      this.shouldShow = !this.shouldShow;
    },

    userFlowEventLogger(eventName, popupName, prevSource) {
      this.$analytics.logEvent(
        eventName,
        {
          popup_name: popupName,
          previous_source: prevSource,
          ctaSource: prevSource,
          fromPage: this.$route.name,
        },
      );
    },

    handleTabAction(action) {
      switch (action) {
        case 'create-lesson':
          if (this.isUserLoggedIn) {
            if (!this.isDesktop && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_QUIZ_GEN_MOBILE)) {
              this.$eventBus.$emit(this.$constants.EventBus.QUIZ_GEN_MOBILE_MODAL_SHOW);
            } else {
              this.$emit('handleCreateContent', { forContentType: this.$constants.ContentType.QUIZ });
            }
          } else {
            this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'signup_pop_up', 'create_btn');
            this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW);
          }
          break;
        case 'redirect-library':
          if (this.isUserLoggedIn) {
            this.$router.push('/admin/private');
          } else {
            this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'intermediate_pop_up', 'my_library_btn');
            this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW);
          }

          break;
        case 'redirect-classes':
          if (this.isUserLoggedIn) {
            this.$router.push('/admin/classes');
          } else {
            this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'intermediate_pop_up', 'classes_btn');
            this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW);
          }
          break;
        case 'redirect-reports':
          if (this.isUserLoggedIn) {
            window.location = '/admin/reports';
          } else {
            this.userFlowEventLogger(this.$webEvents.SIGNUP_FLOW, 'intermediate_pop_up', 'reports_btn');
            this.$eventBus.$emit(this.$constants.EventBus.AUTH_MODAL_SHOW);
          }
          break;
        default:
          window.location = '/admin';
      }
    },

    handleQuizGenBannerClick() {
      if (this.quizGenGenerated) {
        this.$router.push({ path: `/quiz/creator/${this.quizGenMeta.quizId}/edit` });
        this.$store.dispatch('uiManager/resetQuizGenData');
      } else if (this.quizGenLoading) {
        this.$router.push({ path: `/quiz/creator/${this.quizGenMeta.quizId}/edit?source=quizGenMobile` });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .bottom-nav-wrapper {
    z-index: 5;
    @apply fixed left-0 text-tn text-dark-4 right-0 bottom-0 shadow-inner flex-col;
  }
  .create-icon:before {
    background: -webkit-gradient(linear, left top, right bottom, from(#B165AA), to(#A25AF0));
    background: linear-gradient(to right bottom, #B165AA, #A25AF0);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    display: initial;
  }
</style>

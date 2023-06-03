<template>
  <button
    v-if="emitClick"
    :class="optionItemClasses"
    @click="handleOptionClick"
  >
    <div class="flex items-center justify-center w-6">
      <FA
        :icon="`${isActive ? 'fas' : 'fal'} ${licon}`"
        :size="12"
      />
    </div>
    <transition
      appear
      enter-active-class="animate__animated animate__fadeIn animation-duration-300"
      leave-active-class="animate__animated animate__fadeOut animation-duration-300"
    >
      <span
        v-if="!shouldSidebarOptionsBeCollapsed"
        class="text-sm whitespace-nowrap pl-1"
      >
        {{ title }}
      </span>
    </transition>
    <Lozenge
      v-if="isNewOption"
      :title="$i18n('NEW')"
      rounded
      size="xs"
      class="bg-lilac text-light-1 ml-2"
    />
  </button>
  <router-link
    v-else-if="!isExternalRoute"
    exactPath
    :to="to"
    :class="optionItemClasses"
  >
    <div
      class="flex items-center w-full"
      @click="handleOptionClick"
    >
      <div class="flex items-center justify-center w-6">
        <FA
          :icon="`${isActive ? 'fas' : 'fal'} ${licon}`"
          :size="12"
        />
      </div>
      <transition
        appear
        enter-active-class="animate__animated animate__fadeIn animation-duration-300"
        leave-active-class="animate__animated animate__fadeOut animation-duration-200"
      >
        <span
          v-if="!shouldSidebarOptionsBeCollapsed"
          class="text-sm whitespace-nowrap pl-1"
        >
          {{ title }}
        </span>
      </transition>
      <Lozenge
        v-if="isNewOption"
        :title="$i18n('NEW')"
        rounded
        size="xs"
        class="bg-lilac text-light-1 ml-2"
      />
      <slot />
    </div>
  </router-link>
  <a
    v-else
    :href="to"
    :class="optionItemClasses"
  >
    <div
      class="flex items-center w-full"
      @click="handleOptionClick"
    >
      <div class="flex items-center justify-center w-6">
        <FA
          :icon="`${isActive ? 'fas' : 'fal'} ${licon}`"
          :size="12"
        />
      </div>
      <transition
        appear
        enter-active-class="animate__animated animate__fadeIn animation-delay-400 animation-duration-400"
        leave-active-class="animate__animated animate__fadeOut animation-delay-400 animation-duration-400"
      >
        <span
          v-if="!shouldSidebarOptionsBeCollapsed"
          class="text-sm whitespace-nowrap pl-1"
        >
          {{ title }}
        </span>
      </transition>
      <Lozenge
        v-if="isNewOption"
        :title="$i18n('NEW')"
        rounded
        size="xs"
        class="bg-lilac text-light-1 ml-2"
      />
    </div>
  </a>
</template>

<script>
import { mapGetters } from 'vuex';

import { getPageTitleForInhouseEvents } from '~/config/PageTitles';

export default {
  props: {
    isExternalRoute: {
      type: Boolean,
      default: false,
    },

    to: {
      type: String,
      default: '/',
      require: true,
    },

    title: {
      type: String,
      default: 'sidebar-route',
    },

    licon: {
      type: String,
      default: '',
    },

    exactPath: {
      type: Boolean,
      default: false,
    },

    emitClick: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      default: '',
    },

    isNewOption: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],

  data() {
    return {
      shouldUpdateSidebarUI: false,
    };
  },

  computed: {
    ...mapGetters('uiManager', ['isSidebarCollapsed', 'isSidebarExpandedOnContent']),

    isActive() {
      return this.$route.fullPath === this.to || this.$route.path === this.to;
    },

    shouldSidebarOptionsBeCollapsed() {
      return this.isSidebarCollapsed && !this.isSidebarExpandedOnContent;
    },

    optionItemClasses() {
      return [
        'link flex items-center pl-4 whitespace-nowrap w-full font-semibold hover:bg-light-1 cursor-pointer',
        {
          'text-center gap-y-1 py-4': this.shouldSidebarOptionsBeCollapsed,
          'py-2': !this.shouldSidebarOptionsBeCollapsed,
          'active text-lilac font-semibold bg-light-1': this.isActive,
          'text-dark-4': !this.isActive,
        },
      ];
    },
  },

  methods: {
    handleOptionClick() {
      const fromPage = getPageTitleForInhouseEvents(this.$route.path);

      this.$analytics.logEvent(this.$webEvents.SIDEBAR_OPTION_CLICKED, {
        option: this.title,
        page: fromPage,
      });

      this.$emit('click', this.name);
    },
  },
};
</script>

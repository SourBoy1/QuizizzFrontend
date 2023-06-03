<template>
  <div translate="no">
    <div
      class="flex w-full p-4 border border-1 rounded-b-lg border-dark-6 bg-light-3 max-w-180 md:w-180"
    >
      <div class="flex flex-1 gap-4 items-center">
        <Button
          class="flex-1"
          type="other"
          :title="getSearchBtnTitle"
          licon="far fa-search"
          size="md"
          @click="onSearchFocus"
        />
        <ImportFromOtherPlatformsCTA
          class="flex-1"
          :isDesktop="isDesktop"
          :isTablet="isTablet"
          @handleOtherPlatformsImport="handleOtherPlatformsImport"
        />
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';

import ImportFromOtherPlatformsCTA from '~/components/QuestionTypesVisibility/ImportFromOtherPlatformsCTA.vue';

import HotjarService, { HotjarEvents } from '~/services/HotjarService';

export default {

  components: {
    ImportFromOtherPlatformsCTA,
  },
  emits: ['handleOtherPlatformsImport', 'onSearchTeleport'],

  data() {
    return {
      teleportSearchTerm: '',
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'isTablet', 'serverData']),
    isDesktop() {
      return this.deviceProps.type === this.$constants.DeviceTypes.DESKTOP;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isFlaggedCorporateUser() {
      if (this.isCorporateUser) {
        return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.QFW_CREATE_FLOW);
      }
      return false;
    },

    getSearchBtnTitle() {
      return this.isDesktop ? this.$i18n('Search pre-made questions from library') : this.$i18n('Search questions');
    },
  },

  methods: {
    handleOtherPlatformsImport(platform) {
      this.$emit('handleOtherPlatformsImport', platform);
    },

    logTeleportSearchEvent(source) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.$constants.ContentType.QUIZ, this.$webEvents.EDITOR_TELEPORT_SEARCH);
      this.$analytics.logEvent(eventName, {
        term: this.teleportSearchTerm,
        quizId: this.quizId,
        previous_source: source,
      });
    },

    onSearchFocus() {
      if (this.$user.occupation === 'corporate_teacher') {
        HotjarService.triggerEvent(HotjarEvents.TELEPORT_SEARCH);
      }
      this.logTeleportSearchEvent('search_bar');
      this.$emit('onSearchTeleport', this.teleportSearchTerm);
    },

  },
};
</script>

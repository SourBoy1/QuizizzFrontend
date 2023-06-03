<template>
  <div
    v-if="shouldShowSchoolBanner"
    class="flex items-center justify-between py-1.5 px-3.5 mb-1.5 bg-yellow-20% rounded-lg border-2 border-yellow-20% absolute -top-51 left-0 right-0"
  >
    <div class="flex items-center">
      <SuperIcon
        :size="9"
        class="mr-2 super-icon"
      />
      <h1 class="text-light-3">
        <i18n>
          Find it helpful to add media to your content? Bet other teachers in your school would too!
        </i18n>
      </h1>
    </div>
    <div class="flex items-center">
      <Button
        :title="$i18n('Upgrade to School Plan')"
        titleClasses="text-light-3"
        type="super-secondary"
        @click="handleUpgradeTosSchoolCTA"
      />
      <Button
        class="ml-2 -mb-1"
        type="transparent-floating-light"
        size="lg"
        data-cy="modal-close"
        rounded="full"
        ticon="far fa-times"
        :aria-label="$i18n('Close')"
        @click="hideSchoolUpsellBanner"
      />
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

import { OpenSnDPlansPage } from '~/utils/Redirection';

export default {
  data() {
    return {
      showSchoolUpsellBanner: true,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),

    isSnDUser() {
      return this.$user.isPartOfAnOrganization;
    },

    isSuperUser() {
      return this.$user.isSuper;
    },

    questionQuery() {
      return this.currentSlide.structure.query;
    },

    shouldShowSchoolBanner() {
      if (this.isSnDUser) {
        return false;
      }

      if (!this.isSuperUser) {
        return false;
      }

      const media = this.questionQuery?.media?.filter((cur) => ['audio', 'video'].includes(cur.type));
      if (this.showSchoolUpsellBanner && media?.length) {
        return true;
      }
      return false;
    },
  },

  methods: {
    handleUpgradeTosSchoolCTA() {
      const media = this.questionQuery?.media?.filter((cur) => ['audio', 'video'].includes(cur.type));
      OpenSnDPlansPage(this.$constants.FeatureTypes.Q_MEDIA, media[0].type);
    },

    hideSchoolUpsellBanner() {
      this.showSchoolUpsellBanner = false;
    },
  },
};
</script>

<style lang="scss" scoped>
  .-top-51 {
    top: -51px;
  }
</style>

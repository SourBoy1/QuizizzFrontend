<template>
  <Peekaboo
    :heading="title"
    :subheading="description"
    :buttonText="upgradeBtnText"
    theme="dark"
    backgroundColor="bg-dark-2"
    buttonLink="https://feedback.quizizz.com/"
    :videoURL="mediaURL"
    @peekabooClose="closePeekaboo"
  >
    <template #cta>
      <Button
        v-if="shouldShowSuperCTA"
        type="super"
        :title="upgradeBtnText"
        class="my-2"
        ticon="fas fa-bolt-lightning"
        @click="redirectToSuperPricing"
      />
      <Button
        v-else
        type="primary"
        class="my-2"
        :title="primaryCTATitle"
        @click="closePeekaboo(false)"
      />
    </template>
    <template
      v-if="showActionCenter"
      #action-center
    >
      <Button
        :title="$i18n('Don\'t show this again')"
        type="transparent-floating-dark"
        size="xs"
        @click="closePeekaboo(true)"
      />
    </template>
  </Peekaboo>
</template>

<script>

import LocalStorage from '~/services/LocalStorage';
import Constants from '~/config/Constants';

export default {

  props: {
    superFeat: {
      type: String,
      default: '',
    },

    title: {
      type: String,
      default: 'Check peekaboo title',
    },

    description: {
      type: String,
      default: 'Check peekaboo description',
    },

    mediaURL: {
      type: String,
      default: 'https://cf.quizizz.com/videos/qtype/dnd.min.mp4',
    },

    showPrimaryCTA: {
      type: Boolean,
      default: false,
    },

    primaryCTATitle: {
      type: String,
      default: 'Got it!',
    },

    primaryCTAAction: {
      type: Function,
      default: () => {},
    },

    showActionCenter: {
      type: Boolean,
      default: false,
    },

    questionType: {
      type: String,
      default: Constants.QuestionTypes.MCQ,
    },

    showOnce: {
      type: Boolean,
      default: false,
    },

    showOnceAfterPrimary: {
      type: Boolean,
      default: false,
    },

    // If this is set, the peekaboo will not be shown again
    closureFlag: {
      type: String,
      default: Constants.LocalStorageItems.DONT_SHOW_QUESTION_TYPE_INFO_POPUP,
    },
  },
  emits: ['close'],

  computed: {
    shouldShowSuperCTA() {
      if (this.showPrimaryCTA) {
        return false;
      }

      return !this.$user.isSuper && !this.$user.isCorporate && !this.$user.isPartOfAnOrganization;
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    upgradeBtnText() {
      return this.showIndividualPlan ? this.$i18n('Upgrade now') : this.$i18n('Get Super');
    },
  },

  methods: {
    closePeekaboo(shouldNotShowAgain = this.showOnce) {
      if (!shouldNotShowAgain && this.primaryCTAAction) {
        this.primaryCTAAction();
      }

      LocalStorage.setItem(Constants.LocalStorageItems.HAS_QUESTION_TYPE_INFO_POPUP_SHOWN, true);

      if (shouldNotShowAgain || this.showOnceAfterPrimary) {
        LocalStorage.setItem(this.closureFlag, true);
      }

      this.$analytics.logEvent(this.$webEvents.QUESTION_TYPE_PEEKABOO_CTA_CLICKED, {
        cta_type: shouldNotShowAgain ? 'do_not_show' : 'got_it',
        region: window.serverData?.region || 'null',
        questionType: this.questionType,
      });

      this.$emit('close');
    },

    redirectToSuperPricing() {
      location = (`/super-pricing?backto=${encodeURIComponent(window.location.pathname)}&feat=${this.superFeat}`);
    },
  },
};
</script>

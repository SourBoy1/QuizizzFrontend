<template>
  <div
    ref="slideDetailsCard"
    class="p-4 slide-details-card h-inherit"
    :class="[noShadow ? '' : 'shadow-md']"
    @mouseleave="setAddButtonType('other')"
    @mouseenter="setAddButtonType('primary')"
    @click.stop="$emit('click', question)"
  >
    <div class="flex pb-4 justify-between">
      <span :class="['min-w-max rounded inline-flex items-center']">
        <Lozenge
          icon="far fa-presentation"
          :title="showSlideTitle"
          size="sm"
          :isLoading="isLoading"
        />
      </span>

      <span
        v-if="!isPreviewMode || ($user.isLoggedIn && isCurrentPageSearch)"
        :class="[isLoading ? 'teleport-loading-state' : '']"
      >
        <Button
          :ref="`add-button-${question._id}`"
          :class="isLoading ? 'opacity-0' : ''"
          size="xs"
          :title="addButtonTitle"
          :type="!isQuizLocked ? addButtonType : 'super-secondary'"
          licon="far fa-plus-circle"
          :disabled="isAddingTeleportInProgress"
          @click="addQuestion"
        />
      </span>

      <div
        v-if="showOnHover"
        :class="['transform transition-transform origin-top', addButtonType === 'primary' ? 'opacity-100' : 'opacity-0']"
      >
        <slot />
      </div>

      <div
        v-if="isCurrentPagePreview"
        class="ml-auto"
      >
        <Button
          v-tooltip.top="{ content: $i18n('Delete this question') }"
          size="md"
          type="danger"
          licon="far fa-trash-alt"
          :aria-label="$i18n('Delete this question')"
          :fullHeight="true"
          @click=" onDeleteQuestionClick"
        />
      </div>
    </div>

    <div
      :class="['slide-preview-wrapper rounded overflow-hidden relative', isPreviewMode ? 'slide-preview-wrapper-preview-mode' : '']"
      :style="slidePreviewStyles"
    >
      <div
        v-if="isLoading"
        class="bg-dark-10% w-full h-full"
      />

      <SlidePreview
        v-else
        isInteractable
        :question="question"
        :hasParent="hasParent"
        :parentDimensions="{ width: slideContainerStyles.width, height: slideContainerStyles.height }"
        class="bg-dark-1"
        :supersedingTheme="question.structure.theme"
      />
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';

import FontService from '~/services/FontService.js';
import Fonts from '~/config/Fonts.js';

import Question from '~/models/Question.js';
import { ensureSlideV2 } from '../utils/SlideV1Utils';

export default {
  props: {
    question: {
      type: Object,
      default() {
        return Question();
      },
    },

    isLoading: {
      type: Boolean,
      default: false,
    },

    showOnHover: {
      type: Boolean,
      default: false,
    },

    isSuperContent: {
      type: Boolean,
      default: false,
    },

    isAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },

    isPreviewMode: {
      type: Boolean,
      default: false,
    },

    showIndexWithType: {
      type: Boolean,
      default: false,
    },

    forPage: {
      type: String,
      default: '',
    },

    slideIndex: {
      type: Number,
      default: 0,
    },

    hasParent: {
      type: Boolean,
      default: false,
    },

    noShadow: {
      type: Boolean,
      default: false,
    },

    slideContainerMaxHeight: {
      type: Number,
      default: 432,
    },
  },
  emits: ['click', 'deleteQuestion', 'addQuestion'],

  data() {
    return {
      addButtonType: 'other',
      slideContainerStyles: {},
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),
    ...mapGetters('contentEditor', ['teleportedQuestions']),
    addButtonTitle() {
      return includes(this.teleportedQuestions, this.question._id) ? this.$i18n('Add again') : this.$i18n('Add slide');
    },

    showSlideTitle() {
      return this.showIndexWithType ? this.$i18n('{$1}. Slide', [this.slideIndex]) : this.$i18n('Slide');
    },

    isQuizLocked() {
      return this.isSuperContent && !this.isSuperUser && !this.isCorporateUser;
    },

    isSuperUser() {
      return this.$user.isSuper;
    },
    isCorporateUser() {
      return this.$user.isCorporate;
    },
    isMobile() {
      return this.deviceProps.type === this.$constants.DeviceTypes.PHONE;
    },

    isCurrentPagePreview() {
      return this.forPage === 'preview-questions';
    },

    isCurrentPageSearch() {
      return this.forPage === 'search';
    },

    slidePreviewStyles() {
      return {
        width: this.slideContainerStyles.width,
        height: this.slideContainerStyles.height,
        maxHeight: `${this.slideContainerMaxHeight}px`,
      };
    },
  },

  watch: {
    deviceProps(newVal, oldVal) {
      if (newVal.height !== oldVal.height || newVal.width !== oldVal.width) {
        this.setSlideContainerStyles();
      }
    },
  },

  mounted() {
    this.setSlideContainerStyles();
    if (this.isMobile) {
      this.setAddButtonType('secondary');
    }
    this.$nextTick(() => {
      // New font families should go on this list
      if (this.question.type === this.$constants.SlideTypes.CONTENT_SLIDE_V2) {
        for (const element of this.question.structure.elements) {
          if (element.type === 'TEXT') {
            const fontFamilyRegExp = /font-family\s*:\s*(Lobster|Bebas Neue|Playfair Display|Patrick Hand|Cookie|Permanent Marker|EB Garamond|Merriweather|Libre Baskerville|Open Sans|Roboto|Space Grotesk|Courier New|Space mono|Inconsolata|Open Sans Condensed);/g;
            const fontFamily = fontFamilyRegExp.exec(element.data.html);
            if (fontFamily) {
              FontService.loadFont(Fonts[fontFamily[1]]);
            }
          }
        }
      }
    });
  },

  methods: {
    setAddButtonType(type) {
      this.addButtonType = type;
    },

    setSlideContainerStyles() {
      const slideDetailsCardElem = this.$refs.slideDetailsCard;

      if (isEmpty(slideDetailsCardElem)) {
        return;
      }
      const dimensions = slideDetailsCardElem.getBoundingClientRect();

      /**
       * The parent has a padding of 16px
       * Cutting off 16px on the parent container size
       */
      const width = `${dimensions.width - 32}px`;
      const height = `${(dimensions.width - 32) * 9 / 16}px`;

      this.slideContainerStyles = { width, height };
    },

    onDeleteQuestionClick() {
      this.$emit('deleteQuestion', this.slideIndex);
    },

    addQuestion(el) {
      if (this.isLoading) { return; }

      if (this.isQuizLocked) {
        this.$eventBus.$emit('superUpsell:show', { type: this.$constants.SuperUpsellTypes.PREMIUM_CONTENT, options: { feat: 'premiumContent-teleport', variant: 'teleport' } });
        return;
      }

      const copy = cloneDeep(this.question);
      ensureSlideV2(copy);

      this.$emit('addQuestion', { question: copy, addButtonRef: el.target });
    },
  },
};
</script>

<style scoped lang="scss">
.slide-preview-wrapper {
  max-width: 480px;
  width: 480px;
  height: auto;
  border: 1px solid #E5E5E5;
}

.slide-preview-wrapper-preview-mode {
  max-width: 100%;
  width: 100%;
}
</style>

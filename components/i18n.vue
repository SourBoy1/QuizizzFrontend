<template>
  <span
    ref="i18nContainer"
    translate="no"
    class="_i18n-container"
    :class="lang"
  >{{ translatedValue }}</span>
</template>

<script>

/**
 * We rename it as i18nService specifically so that the parser responsible for getting all string to be translated
 * does not also add the instance where this is being called
 */
import { mapGetters } from 'vuex';

import { default as i18nService } from '../services/i18n';

export default {
  props: {
    maxLength: {
      type: Number,
      default: -1,
    },
    injections: {
      type: Array,
      default: () => ([]),
    },
  },

  computed: {
    ...mapGetters('root', ['currentLanguage', 'isGoogleWidgetTranslated']),
    lang() {
      return `LANG_${this.currentLanguage}`;
    },

    translatedValue() {
      const stringComponents = Object.keys(this.$slots)
        .map((slotName = {}) => this.getSlotTextContent(slotName))
        .map((str) => str.trim());
      const stringToTranslate = stringComponents
        .join(stringComponents, '')
        .replace(/\s\s+/g, ' ');

      return i18nService(stringToTranslate, this.injections, this.maxLength);
    },
  },

  methods: {
    getSlotTextContent(slotName) {
      const slotContent = this.$slots[slotName];

      if (!slotContent) {
        return '';
      }

      return typeof slotContent === 'function' ? slotContent()[0].children : '';
    },
  },

};
</script>

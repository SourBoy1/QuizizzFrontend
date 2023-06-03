<template>
  <i18n
    :injections="injections"
    :maxLenght="maxLength"
  >
    {{ stringToTranslate }}
  </i18n>
</template>

<script>
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
    stringToTranslate() {
      const stringComponents = Object.keys(this.$slots)
        .map((slotName = {}) => this.getSlotTextContent(slotName))
        .map((str) => str.trim());
      return stringComponents
        .join(stringComponents, '')
        .replace(/\s\s+/g, ' ');
    },
  },

  methods: {
    getSlotTextContent(slotName) {
      const slotContent = this.$slots[slotName];

      if (!slotContent) {
        return '';
      }

      return slotContent()[0].children;
    },
  },

};
</script>

<template>
  <ul class="py-1">
    <li
      v-for="alignOption in alignToolbarOptions"
      :key="alignOption.id"
      v-tooltip.bottom="alignOption.tooltip"
      class="w-full flex hover:bg-dark-5% active:bg-dark-10% justify-center items-center text-dark-3"
      :class="isFormatButtonSelected(alignOption.id) && 'bg-purple-faded text-purple-dark'"
    >
      <ToolbarButton
        class="text-dark-3"
        :name="alignOption.name"
        :icon="alignOption.icon"
        :aria-label="alignOption.tooltip"
        @clicked="onFormatButtonClicked(alignOption.name)"
      />
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    selectedFormatButtons: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['onFontSelected', 'onSizeSelected', 'onFormatButtonClicked'],

  data() {
    return {
      alignToolbarOptions: [
        {
          id: 'align-left',
          tooltip: this.$i18n('Left align (Ctrl+Shift+L or ⌘+Shift+L)'),
          name: 'align-left',
          icon: 'fas fa-align-left',
        },
        {
          id: 'align-center',
          tooltip: this.$i18n('Center align (Ctrl+Shift+E)'),
          name: 'align-center',
          icon: 'fas fa-align-center',
        },
        {
          id: 'align-right',
          tooltip: this.$i18n('Right align (Ctrl+Shift+R)'),
          name: 'align-right',
          icon: 'fas fa-align-right',
        },
        {
          id: 'align-justify',
          tooltip: this.$i18n('Justify (Ctrl+Shift+J)'),
          name: 'align-justify',
          icon: 'fas fa-align-justify',
        },
      ],
    };
  },

  methods: {
    onFontSelected(font) {
      this.$emit('onFontSelected', font);
    },
    onSizeSelected(size) {
      this.$emit('onSizeSelected', size);
    },
    onFormatButtonClicked(button) {
      this.$emit('onFormatButtonClicked', button);
    },
    isFormatButtonSelected(button) {
      return this.selectedFormatButtons.includes(button);
    },
  },
};
</script>

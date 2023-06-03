<template>
  <button
    type="button"
    class="toolbar-button w-8 h-8 rounded text-light-3 flex items-center justify-center focus:outline-none focus:ring-lilac focus:ring-2"
    :class="classes"
    @mousedown.prevent
    @click.stop="onButtonClick"
  >
    <div
      class="toolbar w-6 h-6 flex items-center justify-center"
      :style="iconStyles"
    >
      <FA
        :icon="icon"
        :size="12"
      />
    </div>
  </button>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    iconStyles: {
      type: Object,
      default: () => {},
    },
    name: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'fas fa-empty-set',
    },
    selected: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['clicked'],

  computed: {
    ...mapGetters('root', ['isDesktop']),

    classes() {
      if (this.disabled) {
        return 'bg-transparent text-light-33%';
      }

      if (this.selected) {
        return this.isDesktop ? 'bg-purple-faded text-purple-dark' : 'bg-light-20% text-light-3';
      }

      return this.isDesktop ? 'hover:bg-light-5%' : '';
    },
  },

  methods: {
    onButtonClick() {
      this.$emit('clicked', this.name);
    },
  },
};
</script>

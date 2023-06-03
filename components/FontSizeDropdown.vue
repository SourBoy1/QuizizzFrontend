<template>
  <ul class="px-2 py-3">
    <button
      v-for="(size, index) in sizes"
      :key="index"
      class="cursor-pointer w-9 h-6 text-sm flex items-center justify-center text-dark-3 mb-2 last:mb-0 hover:bg-dark-5%"
      @click="onSizeSelected(size)"
      @mousedown="(ev) => { ev.preventDefault() }"
    >
      {{ size }}
    </button>
  </ul>
</template>

<script>
export default {
  emits: ['onSizeSelected'],
  data() {
    return {
      sizes: this.$constants.SlideFontSizes,
    };
  },

  methods: {
    onSizeSelected(size) {
      this.$emit('onSizeSelected', size);
    },
  },
};
</script>

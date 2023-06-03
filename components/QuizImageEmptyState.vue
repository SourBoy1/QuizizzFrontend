<template>
  <div class="w-full h-full flex items-center justify-center shrink-0">
    <img
      :src="getImageSrc"
      alt=""
      class="src"
    >
  </div>
</template>

<script>
/**
 * @param type include brand-a, brand-b, brand-c, brand-d, brand-e and deleted
 * */
export default {
  props: {
    type: {
      type: String,
      default: 'random',
    },
  },

  computed: {
    getImageSrc() {
      return `https://cf.quizizz.com/img/empty-state/quiz-image-${this.emptyStateType}.png`;
    },

    emptyStateType() {
      const items = ['brand-a', 'brand-b', 'brand-c', 'brand-d', 'brand-e', 'deleted'];

      if (this.type === 'random') {
        return items[Math.floor(Math.random() * items.length)];
      }

      return this.type;
    },
  },
};
</script>

<template>
  <ClientOnly>
    <div :class="containerClasses">
      <img
        v-lazy="imgObj"
        :class="['lazy-img rounded-inherit', imageFitClass, imageClasses]"
        :alt="altTitle"
      />
    </div>
    <template #placeholder>
      <div :class="containerClasses">
        <!-- Added default image in case of ssr, because in ssr it's not known what size of image to load. Once page is loaded on browser then only one required image will be fetched -->
        <img
          src="https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png"
          class="w-full h-full lazy-img rounded-inherit"
          :alt="altTitle"
          :class="[imageFitClass]"
        />
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  imgObj: {
    type: Object,
    default: () => ({
      src: '',
      error: '',
      loading: '',
    }),
  },

  options: {
    type: Object,
    default: () => ({}),
  },

  imageClasses: {
    type: String,
    default: 'w-full h-full',
  },
  containerClasses: {
    type: [Array, String, Object],
    default: 'w-full h-full',
  },
});

const imageFitClass = computed(() => props.options.fitClass || '');
const altTitle = computed(() => props.options.alt || 'Image');
</script>

<style lang="scss" scoped>
  .rounded-inherit {
    border-radius: inherit;
  }
  .lazy-img[lazy=loaded] {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-name: fadeIn;
    animation-name: fadeIn;
  }
</style>

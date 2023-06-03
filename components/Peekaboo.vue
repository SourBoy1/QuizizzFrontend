<template>
  <div
    class="peekaboo-container w-80 h-fit fixed right-4 bottom-16 md:right-5 md:bottom-4 bg-light-3 flex flex-col rounded-lg shadow-elevation-hard overflow-hidden z-on-overlay"
  >
    <div class="close-btn absolute top-2 right-2 w-6 h-6 z-overlay">
      <button
        class="w-full h-full rounded-full flex justify-center items-center"
        :class="[theme === 'light' ? 'bg-dark-20% hover:bg-dark-10%' : 'bg-light-5% hover:bg-light-10%']"
        @click="$emit('peekabooClose')"
      >
        <FA class="far fa-times text-light" />
      </button>
    </div>
    <div
      class="peekaboo-image-container w-full h-1/2"
      :class="[theme === 'light' ? 'bg-green-10%' : 'bg-dark-2']"
    >
      <video
        v-if="videoURL !== ''"
        :src="videoURL"
        loop
        autoplay
        muted
        aria-hidden="true"
      />
      <img
        v-else
        class="w-full h-full object-contain"
        :src="imgUrl"
        :alt="buttonText"
      >
    </div>
    <div class="content-container p-4 flex flex-col justify-between gap-4">
      <div class="content-meta flex flex-col justify-start items-start gap-1">
        <slot name="heading">
          <p class="text-base text-dark-2 font-bold">
            {{ heading }}
          </p>
        </slot>
        <p class="text-sm text-dark-4 leading-5 whitespace-pre-line">
          {{ subheading }}
        </p>
      </div>
      <div class="flex flex-col">
        <slot name="cta">
          <a
            v-if="ctaType === 'anchor'"
            :href="buttonLink"
            target="_blank"
            class="cta-button bg-lilac py-1 text-light-3 rounded-t rounded-b text-sm hover:bg-lilac-light flex w-full my-2 justify-center items-center"
            @click="$emit('peekabooLinkClicked')"
          >
            <i18n>{{ buttonText }}</i18n>
            <FA class="far fa-angle-right ml-2" />
          </a>
          <button
            v-else-if="ctaType === 'button'"
            class="bg-lilac py-1 text-light-3 rounded-t rounded-b text-sm hover:bg-lilac-light flex w-full my-2 justify-center items-center"
            @click="$emit('peekabooLinkClicked')"
          >
            <i18n>{{ buttonText }}</i18n>
          </button>
        </slot>
        <slot name="action-center">
          <div />
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    heading: {
      type: String,
      default: '',
    },
    ctaType: {
      type: String,
      default: 'anchor',
      validator: (val) => (['button', 'anchor']).includes(val),
    },

    subheading: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: '',
    },
    buttonLink: {
      type: String,
      default: '',
    },
    imgUrl: {
      type: String,
      default: 'https://cf.quizizz.com/img/logos/new/logo_placeholder_sm.png',
    },
    videoURL: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      default: 'light',
      validator: (val) => (['light', 'dark']).includes(val),
    },
  },

  emits: ['peekabooClose', 'peekabooLinkClicked'],

  methods: {
    btnClicked() {

    },
  },
};
</script>

<style lang="scss" scoped>
.peekaboo-container {
  z-index: 999999;
  animation: slide-in 300ms ease-in;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0%);
  }
}
</style>

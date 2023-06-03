<template>
  <div
    v-if="showRateLimitError"
    class="relative flex h-full justify-center items-center"
  >
    <img
      v-if="isDesktop"
      src="https://cf.quizizz.com/image/Rate-Limit-YouTube.png"
      class="absolute h-80 top-0 right-0"
      alt="No Images Found"
    />
    <div class="absolute md:top-20 md:left-12 w-64 md:w-72">
      <div class="font-bold text-base md:text-xl text-dark-2">
        <i18n>Oops, too many requests</i18n>
      </div>
      <p class="mt-2 text-dark-2 text-xs md:text-sm">
        <i18n>YouTube limits how often you can search for videos. Please wait for a few minutes to try again or upload a video from your device.</i18n>
      </p>
      <div class="mt-7">
        <div class="w-52 h-8 flex justify-center items-center relative p-1 bg-lilac-faded rounded">
          <div class=" cursor-pointer absolute text-center text-lilac text-xs md:text-sm z-0">
            <FA
              icon="far fa-upload"
              class="mr-2"
              :size="12"
            />
            <i18n :injections="[isMobile ? 'Device' : 'Computer']">
              Upload from {$1}
            </i18n>
          </div>
          <input
            ref="upload-input"
            class="cursor-pointer absolute left-0 top-0 h-full w-full z-5 opacity-0"
            type="file"
            accept="video/mp4"
            @input="$emit('handleFileUpload', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    showRateLimitError: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['handleFileUpload'],

  computed: {
    ...mapGetters('root', ['isDesktop', 'isMobile']),
  },
};

</script>

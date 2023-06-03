<template>
  <div
    v-if="showRateLimitError"
    class="relative flex h-full justify-center items-center"
  >
    <img
      v-if="isDesktop"
      src="https://cf.quizizz.com/image/Rate-Limit-Images.png"
      class="absolute h-80 top-0 right-0"
      alt="No Images Found"
    />
    <div class="absolute md:top-20 md:left-12 w-64 md:w-72">
      <div class="font-bold text-base md:text-xl text-dark-2">
        <i18n>Oops, too many requests</i18n>
      </div>
      <p class="mt-2 text-dark-2 text-xs md:text-sm">
        <i18n>Google limits how often you can search for images. Please wait for a few minutes to try again or upload an image an image from your device.</i18n>
      </p>
      <div class="mt-7 cursor-pointer">
        <div class="w-40 relative">
          <div class="h-8 flex justify-center items-center p-1 bg-lilac-faded rounded">
            <div class="absolute text-center text-lilac text-xs md:text-sm z-0">
              <FA
                icon="far fa-upload"
                class="mr-2"
                :size="12"
              />
              <i18n>Upload an image</i18n>
            </div>
            <input
              ref="fileInput"
              class="absolute inset-0 opacity-0 z-20 cursor-pointer w-full h-full"
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/gif"
              @input="$emit('handleFileUpload', $event)"
            />
          </div>
          <div
            v-if="isDesktop"
            class="mt-1 italic text-tn text-dark-3 cursor-pointer flex justify-center items-center"
          >
            <i18n>or drag and drop the image here</i18n>
          </div>
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

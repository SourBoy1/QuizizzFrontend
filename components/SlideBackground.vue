<template>
  <div class="slide-background-container">
    <template v-if="isVideoMedia">
      <img
        v-if="isImageMedia"
        ref="image"
        alt="Slide background"
        :src="mediaSrc"
        class="background-image"
      />

      <QVideo
        v-if="false"
        class="background-video"
        autoplay
        playsinline
        loop
        :videoSrc="mediaSrc"
      />
    </template>

    <img
      v-else-if="isImageMedia"
      ref="image"
      alt="Slide background"
      :src="mediaSrc"
      class="background-image"
    />
  </div>
</template>

<script>
export default {

  props: {
    mediaSrc: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      default: 'image',
    },
  },

  computed: {
    isImageMedia() {
      return this.mediaType === 'image';
    },
    isVideoMedia() {
      return this.mediaType === 'video';
    },
  },
};
</script>

<style lang="scss" scoped>

.slide-background-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  height: 100%;
  width: 100%;
  z-index: -1;
}

.background-video, .background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>

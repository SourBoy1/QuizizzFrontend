// Only Image and Youtube Video media support as of now.

<template>
  <div class="media-preview-container h-screen w-screen flex justify-center items-center bg-dark-50% fixed z-9999 px-10 top-0 left-0">
    <button
      class="close-btn absolute z-9999 p-1 leading-none w-8 h-8 inline-flex justify-center items-center cursor-pointer text-light-1 hover:bg-dark-5% rounded-full"
      :class="[size === 'sm' ? 'top-1 right-1' : 'top-5 right-5']"
      :aria-label="$i18n('Close')"
      @click="$emit('close')"
    >
      <FA
        icon="far fa-times"
        :size="14"
      />
    </button>

    <MediaImage
      v-if="queryMediaObjects.image.url"
      class="w-full h-full rounded-md"
      :src="queryMediaObjects.image.url"
    />

    <div class="h-2/5">
      <MediaYoutube
        v-if="queryMediaObjects.video.url"
        class="w-full h-full"
        :url="queryMediaObjects.video.url"
        :videoId="videoId"
        :start="videoStartTime"
        :end="videoEndTime"
      />
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';

export default {

  props: {
    size: {
      type: String,
      default: 'sm',
    },
    queryMediaObjects: {
      type: Object,
      required: true,
      validator: (val) => (val.image.url || val.video.url),
    },
  },
  emits: ['close'],

  data() {
    return {
      isMediaTypeImage: false,
      isMediaTypeYoutubeVideo: false,
      isUnknownMediaType: false,
    };
  },

  computed: {
    videoId() {
      return get(this.queryMediaObjects, 'video.meta.videoId', '');
    },
    videoStartTime() {
      return get(this.queryMediaObjects, 'video.meta.startTime', '');
    },
    videoEndTime() {
      return get(this.queryMediaObjects, 'video.meta.endTime', '');
    },
  },

  methods: { },
};
</script>

<style scoped>

</style>

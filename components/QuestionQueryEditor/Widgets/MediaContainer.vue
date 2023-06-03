<template>
  <div ref="holder">
    <transition
      appear
      enter-active-class="animate__animated animate__fadeIn"
      leave-active-class="animate__animated animate__fadeOut"
      :duration="300"
    >
      <div
        v-if="doesQuestionHaveAnyMedia"
        class="flex flex-1 flex-wrap justify-center items-center min-w-0"
      >
        <MediaImage
          v-if="isQuestionMediaPresent('image')"
          class="w-full h-full rounded-md"
          :src="queryMediaObjects.image.url"
          :objectFit="questionMediaImageLayout"
        />

        <MediaAudio
          v-if="isQuestionMediaPresent('audio')"
          class="w-full h-full"
          :src="queryMediaObjects.audio.url"
        />

        <div
          v-if="canVideoBeDisplayed"
          class="w-full h-full overflow-hidden"
        >
          <video
            v-if="isGoogleDriveSrcForVideo"
            ref="video_container"
            controls
            playsinline
            class="drive-video"
          >
            <source
              :src="`https://drive.google.com/uc?export=download&id=${googleDriveVideoId}`"
              type="video/mp4"
            >
          </video>
          <MediaYoutube
            v-else
            ref="video_container"
            :url="queryMediaObjects.video.url"
            :videoId="youtubeVideoId"
            :start="videoStartTime"
            :end="videoEndTime"
          />
        </div>

        <transition
          appear
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
          :duration="300"
        >
          <Button
            v-if="doesQuestionHaveAnyMedia"
            v-tooltip="{ content: $i18n('Remove question media'), placement: 'right' }"
            class="z-10 top-2 right-2"
            :absolutePositioning="true"
            size="xl"
            type="secondary"
            ticon="fas fa-trash-alt"
            :aria-label="$i18n('Remove question media')"
            @click="deleteCurrentMedia"
          />
        </transition>

        <transition
          appear
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
          :duration="300"
        >
          <Button
            v-if="doesQuestionHaveAnyMedia"
            v-tooltip="{ content: $i18n('Edit question media'), placement: 'right' }"
            class="z-10 top-14 right-2"
            :absolutePositioning="true"
            size="xl"
            type="secondary"
            ticon="fas fa-pen"
            :aria-label="$i18n('Edit question media')"
            @click="onMediaReEdit"
          />
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>

import QueryEditorMixin from '~/mixins/QueryEditorMixin';

export default {
  mixins: [QueryEditorMixin],
  data() {
    return {
      ro: null,
    };
  },

  mounted() {
    if (this.canVideoBeDisplayed && !this.isGoogleDriveSrcForVideo) {
      this.ro = new ResizeObserver(this.onResize);
      this.ro.observe(this.$refs.holder);
    }
  },

  beforeUnmount() {
    this.ro?.unobserve(this.$refs.holder);
  },

  methods: {
    onResize() {
      this.$refs.video_container?.updateSize?.();
    },
  },

};
</script>

<style lang="scss" scoped>
.drive-video {
  height: 100% !important;
  width: 100% !important;
}
</style>

<!-- eslint-disable vuejs-accessibility/media-has-caption -->
<template>
  <div class="query-text-container relative flex items-center h-14">
    <div
      class="w-full h-full flex justify-between rounded-lg border-2 border-transparent bg-purple-dark p-2 overflow-hidden"
    >
      <div class="flex flex-1">
        <div
          v-if="doesQuestionHaveAnyMedia"
          class="w-14 shrink-0"
        >
          <MediaImage
            v-if="isQuestionMediaPresent('image')"
            class="w-full h-full rounded-lg media-container"
            :src="queryMediaObjects.image.url"
            :objectFit="questionMediaImageLayout"
            @click="openPreview"
          />

          <MediaAudio
            v-if="isQuestionMediaPresent('audio')"
            class="w-full h-full media-container"
            :size="32"
            :src="queryMediaObjects.audio.url"
          />

          <div
            v-if="isQuestionMediaPresent('video')"
            class="relative w-full rounded-md cursor-pointer media-container shrink"
            @click="openMediaPreview"
          >
            <video
              v-if="isGoogleDriveSrcForVideo"
              controls
              playsinline
              class="w-full h-full"
            >
              <source
                :src="`https://drive.google.com/uc?export=download&id=${googleDriveVideoId}`"
                type="video/mp4"
              >
            </video>
            <img
              v-if="!isGoogleDriveSrcForVideo"
              class="object-contain w-full h-full"
              :src="`https://img.youtube.com/vi/${queryMediaObjects.video.meta.videoId}/0.jpg`"
              alt="youtube video cover"
            />
            <div
              v-if="!isGoogleDriveSrcForVideo"
              class="absolute transform -translate-x-1/2 -translate-y-1/2 top-2/4 left-2/4"
            >
              <div class="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 top-2/4 left-2/4 bg-light" />
              <FA
                icon="fab fa-youtube"
                class="relative text-red"
                :size="40"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="text-light-50% uppercase text-xs">
            <i18n>Question</i18n>
          </div>
          <!-- question container -->
          <div class="text-light-3">
            <span v-html="getHtmlToRender(questionQuery.text)" />
          </div>
        </div>
      </div>

      <!-- media container -->
      <button
        v-tooltip="{ content: $i18n('Edit'), triggers: ['click'] }"
        type="button"
        class="bg-transparent text-light-3 w-8 h-8"
        @click.stop="$emit('edit')"
      >
        <FA
          icon="fas fa-pencil"
          class="text-light-50%"
          :size="14"
        />
      </button>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import QueryEditorLayoutMixin from '~/mixins/QueryEditorLayoutMixin';
import QueryEditorMobileLayoutMixin from '~/mixins/QueryEditorMobileLayoutMixin';
import katex from 'katex';

import { getHtmlWithMathKatexString } from '~/utils/QuizUtils';

export default {
  mixins: [QueryEditorLayoutMixin, QueryEditorMobileLayoutMixin],
  emits: ['edit'],

  data() {
    return {
      katex: null,
    };
  },

  computed: {
    questionMedia() {
      const media = get(this.question, 'structure.query.media', []);
      if (media.length === 0) {
        return [];
      }

      if ([
        this.$constants.QuestionTypes.DRAW,
        this.$constants.QuestionTypes.DND_IMAGE,
        this.$constants.QuestionTypes.HOTSPOT,
      ].includes(this.question.type)) {
        return media.find((item) => item.type === 'audio');
      }
      return media[0];
    },
  },

  async created() {
    this.katex = katex;
  },

  methods: {
    hasMath(text) {
      return (text.toLowerCase().includes('<katex'));
    },

    getHtmlToRender(text) {
      const parsedText = text;

      if (this.hasMath(parsedText)) {
        return this.katex ? getHtmlWithMathKatexString(parsedText, this.katex) : '';
      }

      /** In case white text color is applied it wont be seen on the tile */
      const regex = /color: white/g;
      const html = parsedText.replace(regex, 'color: #222');

      return html;
    },
  },
};
</script>

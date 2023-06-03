<template>
  <div class="flex flex-col items-center justify-center font-bold text-light-1">
    <div class="mb-2">
      <i18n>Answer Explanation</i18n>
    </div>
    <div class="answer-explanation-container bg-light-10% p-6 rounded flex justify-center items-center">
      <div
        v-if="!isEmpty(answerExplanationMedia)"
        class="flex items-center justify-center mr-8 w-100 h-90"
      >
        <MediaImage
          v-if="isQuestionMediaPresent('image')"
          class="w-full h-full rounded-md"
          :src="answerExplanationMedia[0].url"
          objectFit="contain"
        />
        <MediaAudio
          v-if="isQuestionMediaPresent('audio')"
          :size="160"
          :src="answerExplanationMedia[0].url"
        />
        <MediaYoutube
          v-if="isQuestionMediaPresent('video')"
          :url="answerExplanationMedia[0].url"
          :videoId="answerExplanationMedia[0].meta.videoId"
        />
      </div>
      <ResizableText
        v-if="answerExplanationText"
        :class="[!isEmpty(answerExplanationMedia) ? 'w-100' : 'w-full text-center']"
        :canScrollIfOverflowAfterMinSize="true"
        :text="answerExplanationText"
        :fontSizeJumpsList="optionResizeFontJumps"
        dirToResizeAgainst="both"
      />
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import { getFontSizeRange } from '../../utils/TypographyUtils';

export default {
  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },
  },

  computed: {
    answerExplanationText() {
      return get(this.currentQuestion, 'structure.explain.text', '');
    },

    answerExplanationMedia() {
      return get(this.currentQuestion, 'structure.explain.media', []);
    },

    optionResizeFontJumps() {
      return getFontSizeRange(16, 16);
    },

  },

  methods: {
    isEmpty,
    isQuestionMediaPresent(type) {
      return !isEmpty(this.answerExplanationMedia) && this.answerExplanationMedia[0].type === type;
    },
  },
};
</script>

<style scoped>
.answer-explanation-container {
  width: 848px;
  min-height: 296px;
  max-height: 408px;
}
</style>

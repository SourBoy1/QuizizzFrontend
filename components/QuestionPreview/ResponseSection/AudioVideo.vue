<template>
  <div class="bg-dark-20% flex justify-center items-center p-2">
    <div class="recorder-container flex h-full flex-col justify-center items-center rounded-lg bg-dark-20%">
      <div class="w-60 h-34 rounded-lg bg-light-5% flex justify-center items-center border-1 border-light-10%">
        <img
          :src="`https://cf.quizizz.com/join/img/misc/${responseType.icon}.png`"
          alt="media icon"
          class="w-12"
        >
      </div>
      <Button
        class="mt-6 w-60 h-12 flex justify-center"
        size="xl"
        type="special"
        :aria-label="getButtonText"
        :title="getButtonText"
      />
    </div>
  </div>
</template>

<script>
import { isAudioBasedQuestion } from '~/utils/QuizUtils';

export default {
  props: {
    currentQuestion: {
      type: Object,
      required: true,
    },

    questionType: {
      type: String,
      required: true,
    },
  },

  computed: {
    responseType() {
      const selectedResp = this.$constants.AudioVideoResponseTypeDetails.find(({ title }) => title === this.questionType);
      if (selectedResp) { return selectedResp; }

      return this.$constants.AudioVideoResponseTypeDetails[0];
    },

    getButtonText() {
      if (isAudioBasedQuestion(this.currentQuestion)) {
        return this.$i18n('Open Audio Recorder');
      }

      return this.$i18n('Open Video Recorder');
    },
  },
};
</script>

<style scoped>
.recorder-container {
  width: 512px;
}
</style>

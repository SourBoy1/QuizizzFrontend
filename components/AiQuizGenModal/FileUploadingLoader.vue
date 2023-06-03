<template>
  <div class="text-center">
    <div class="lottie-container relative flex justify-center">
      <div class="w-60 h-60">
        <Lottie
          v-bind="loaderAnimation"
          class="w-60 h-60"
        />
      </div>
      <div class="document-icon absolute flex flex-col items-center">
        <FA
          :icon="documentIconDetails.icon"
          :size="52"
          :style="`color: ${documentIconDetails.color}`"
        />
        <div class="icon-shadow w-16 h-2 bg-[#D9D9D9] opacity-50 mt-1" />
      </div>
    </div>
    <div
      v-if="progressPercentage < 100 && canShowPercentange"
      class="font-bold text-5xl text-lilac mt-12"
    >
      {{ progressPercentage }}%
    </div>
    <div class="description mt-8">
      <div class="title font-bold text-2xl text-dark-2">
        {{ loadingDescription.title }}
      </div>
      <div class="subtitle mt-2 text-dark-3">
        {{ loadingDescription.subtitle }}
      </div>
    </div>
  </div>
</template>

<script>
import { enumProps } from '~/config/Atoms';

export default {
  props: {
    documentType: {
      type: String,
      default: 'ppt',
      validator: (val) => enumProps.FileUploadingLoader.documentType.includes(val),
    },

    percent: {
      type: Number,
      default: 50,
    },
  },

  data() {
    return {
      animationLoadingPercent: 0,
      progressPercentage: 0,
      progressInProcess: false,
    };
  },

  computed: {
    canShowPercentange() {
      return this.documentType !== this.$constants.AiQuizGenModes.USING_OPEN_TEXT;
    },

    documentIconDetails() {
      switch (this.documentType) {
        case 'pdf': return {
          icon: 'fas fa-file-lines',
          color: '#CB0606',
        };
        case 'word': return {
          icon: 'fas fa-file-word',
          color: '#7D3AB5',
        };
        case 'ppt': return {
          icon: 'fas fa-file-powerpoint',
          color: '#F5B912',
        };
        case this.$constants.AiQuizGenModes.USING_OPEN_TEXT: return {
          icon: 'fas fa-comment-lines',
          color: '#8854C0',
        };
        default: return {};
      }
    },

    loaderAnimation() {
      if (this.documentType === this.$constants.AiQuizGenModes.USING_OPEN_TEXT) {
        return {
          src: 'https://cf.quizizz.com/animations/lottie/generating_quiz.json',
          percent: this.progressPercentage,
          autoplay: true,
          loop: true,
          key: 'generation_quiz',
        };
      }
      if (this.progressPercentage < 100) {
        return {
          src: 'https://cf.quizizz.com/animations/lottie/file_uploading_loader.json',
          percent: this.progressPercentage,
          autoplay: false,
          key: 'file_uploading',
        };
      }
      return {
        src: 'https://cf.quizizz.com/animations/lottie/generating_quiz.json',
        percent: this.progressPercentage,
        autoplay: true,
        loop: true,
        key: 'generation_quiz',
      };
    },

    loadingDescription() {
      if (this.documentType === this.$constants.AiQuizGenModes.USING_OPEN_TEXT) {
        return {
          title: this.$i18n('Generating Questions from your text...'),
          subtitle: this.$i18n('This might take several seconds'),
        };
      }

      if (this.progressPercentage < 100) {
        return {
          title: this.$i18n('Uploading your file...'),
          subtitle: this.$i18n('This might take upto a minute based on the size of your file'),
        };
      }

      return {
        title: this.$i18n('Generating Questions from your file'),
        subtitle: this.$i18n('This might take upto a minute based on the size of your file'),
      };
    },
  },

  watch: {
    percent() {
      if (!this.progressInProces && this.documentType !== this.$constants.AiQuizGenModes.USING_OPEN_TEXT) {
        this.smoothProgress();
      }
    },
  },

  methods: {
    smoothProgress() {
      this.progressInProcess = true;

      const smoothProgressInterval = setInterval(() => {
        if (this.percent - this.progressPercentage > 5) {
          this.progressPercentage += 5;
        } else {
          this.progressPercentage = ~~this.percent;
          this.progressInProcess = false;

          clearInterval(smoothProgressInterval);
        }
      }, 100);
    },
  },
};
</script>

<style lang="scss" scoped>
.document-icon {
  top: calc(50% - 32px);
  left: calc(50% - 32px);

  .icon-shadow {
    filter: blur(4px);
  }
}
</style>

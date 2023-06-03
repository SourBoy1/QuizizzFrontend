<template>
  <div class="w-full min-h-46 rounded-lg bg-dark-1 flex flex-col gap-2">
    <video
      class="rounded-sm object-fill"
      :src="getExplainerData.videoURL"
      loop
      autoplay
      muted
      aria-hidden="true"
      @canplay="isVideoLoading = false"
    />
    <div class="flex gap-3">
      <Lozenge
        v-if="isQuestionTypeSuper"
        class="bg-super text-light-3"
        size="xs"
        icon="fas fa-bolt-lightning"
        :title="showIndividualPlan ? $i18n('Premium') : $i18n('Super')"
      />
      <Lozenge
        class="bg-teal-faded text-brand-b"
        size="xs"
        :title="getExplainerData?.tag"
      />
    </div>
    <p class="text-xs text-start font-semibold text-light-3">
      {{ getExplainerData?.descriptionforQtypeVisibilityThumbnail }}
    </p>
  </div>
</template>

<script>
import { getQuestionTypeExplainerData, isQuestionTypeSuperType } from '~/utils/QuizUtils';

export default {

  props: {
    questionType: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      questionExplainerData: getQuestionTypeExplainerData(),
    };
  },

  computed: {
    getExplainerData() {
      return this.questionExplainerData[this.questionType];
    },

    isQuestionTypeSuper() {
      return isQuestionTypeSuperType(this.questionType);
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },
  },

};
</script>

<style scoped>

</style>

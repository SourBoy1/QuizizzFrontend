<template>
  <div
    v-if="isWaitingForSolutionSelection"
    class="flex flex-1 flex-col gap-2 pt-2 text-light"
    :class="isDesktop ? 'text-2xl' : 'text-base'"
  >
    <div class="flex flex-1 flex-row gap-2">
      <div
        class="selectionState"
        :class="graphingButtonData['Linear'].bgColor"
        @click="() => { onPlotSelection(getLinearPlotType()) }"
        @mouseover="() => { setHoverGraphType(getLinearPlotType()); }"
        @mouseleave="() => { setHoverGraphType(getNonePlotType()); }"
      >
        <FAwoSize
          class="selectionStateIcon fas"
          :class="[graphingButtonData['Linear'].icon, graphingButtonData['Linear'].bgColor, isDesktop ? 'selectionStateIconLgSize' : 'selectionStateIconSize']"
        />
        <span class="flex flex-wrap content-center mt-4"><i18n>Linear</i18n></span>
      </div>
      <div
        class="selectionState"
        :class="graphingButtonData['Quadratic'].bgColor"
        @click="() => { onPlotSelection(getQuadraticPlotType()) }"
        @mouseover="() => { setHoverGraphType(getQuadraticPlotType()); }"
        @mouseleave="() => { setHoverGraphType(getNonePlotType()); }"
      >
        <FAwoSize
          class="selectionStateIcon fas"
          :class="[graphingButtonData['Quadratic'].icon, graphingButtonData['Quadratic'].bgColor, isDesktop ? 'selectionStateIconLgSize' : 'selectionStateIconSize']"
        />
        <span class="flex flex-wrap content-center mt-4"><i18n>Quadratic</i18n></span>
      </div>
    </div>
    <div
      v-if="isDesktop"
      class="flex text-3xl text-light-50% justify-center font-bold"
    >
      <i18n>Select the type of equation</i18n>
    </div>
    <div class="flex flex-1 flex-row gap-2">
      <div
        class="selectionState"
        :class="graphingButtonData['Exponential'].bgColor"
        @click="() => { onPlotSelection(getExponentialPlotType()) }"
        @mouseover="() => { setHoverGraphType(getExponentialPlotType()); }"
        @mouseleave="() => { setHoverGraphType(getNonePlotType()); }"
      >
        <FAwoSize
          class="selectionStateIcon fas"
          :class="[graphingButtonData['Exponential'].icon, graphingButtonData['Exponential'].bgColor, isDesktop ? 'selectionStateIconLgSize' : 'selectionStateIconSize']"
        />
        <span class="flex flex-wrap content-center mt-4"><i18n>Exponential</i18n></span>
      </div>
      <div
        class="selectionState"
        :class="graphingButtonData['Points'].bgColor"
        @click="() => { onPlotSelection(getPointsPlotType()) }"
        @mouseover="() => { setHoverGraphType(getPointsPlotType()); }"
        @mouseleave="() => { setHoverGraphType(getNonePlotType()); }"
      >
        <FAwoSize
          class="selectionStateIcon fas"
          :class="[graphingButtonData['Points'].icon, graphingButtonData['Points'].bgColor, isDesktop ? 'selectionStateIconLgSize' : 'selectionStateIconSize']"
        />
        <span class="flex flex-wrap content-center mt-4"><i18n>Points</i18n></span>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex';

import QuestionEditorGraphMixin from '~/mixins/questionEditorGraphMixin';

export default {
  mixins: [QuestionEditorGraphMixin],

  methods: {
    ...mapActions({
      setHoverGraphType: 'slideEditor/setHoverGraphType',
    }),
  },
};
</script>

<style lang="scss" scoped>
.selectionState {
  @apply bg-opacity-40 hover:bg-opacity-100 hover:border-light justify-center items-center flex-col font-semibold cursor-pointer flex flex-wrap flex-1 rounded-lg border-light-10% border-2;
}

.selectionStateIcon {
  @apply bg-opacity-40 hover:bg-opacity-100 justify-center border-2 rounded-full;
}

.selectionStateIconLgSize {
  @apply w-14 h-14 text-xl
}

.selectionStateIconSize {
  @apply w-12 h-12
}
</style>

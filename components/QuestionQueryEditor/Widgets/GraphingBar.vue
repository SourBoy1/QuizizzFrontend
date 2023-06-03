<template>
  <div
    class="flex flex-row w-full"
    :class="isDesktop ? 'text-xl' : 'text-xs'"
  >
    <div :class="isDesktop ? 'w-[36%]' : 'w-2/3'">
      <Dropdown
        v-slot="dropdown"
        type="custom"
        :customClasses="'hover:bg-opacity-50 text-light ' + graphingButtonData[currentGraph].bgColor + (isDesktop ? ' text-xl ' : ' test-xs ')"
        :title="isWaitingForSolutionSelection ? $i18n('Select type...') : graphingButtonData[currentGraph].title"
        :titleStyles="isDesktop ? '' : '-ml-2'"
        :iconComponent="plotIcon"
        :dropdownButtonDisabled="isWaitingForSolutionSelection"
        :class="isDesktop ? 'text-xl' : 'text-xs'"
        :size="isDesktop ? 'md' : 'xs'"
        :autoPosition="!isDesktop"
      >
        <div
          :class="[isDesktop ? 'dropdownItem' : 'dropdownItemSm', 'rounded-t']"
          @click="() => { onPlotSelectionInternal('Points', getPointsPlotType()); dropdown.closeDropdown() }"
        >
          <FAwoSize :class="'justify-center w-6 text-xs fas ' + graphingButtonData['Points'].icon" />
          <span class="flex flex-wrap content-center"><i18n>Points</i18n></span>
        </div>
        <div
          :class="[isDesktop ? 'dropdownItem' : 'dropdownItemSm']"
          @click="() => { onPlotSelectionInternal('Linear', getLinearPlotType()); dropdown.closeDropdown() }"
        >
          <FAwoSize :class="'justify-center pr-1 text-xs w-6 fas ' + graphingButtonData['Linear'].icon" />
          <span class="flex flex-wrap content-center"><i18n>Linear</i18n></span>
        </div>
        <div
          :class="[isDesktop ? 'dropdownItem' : 'dropdownItemSm']"
          @click="() => { onPlotSelectionInternal('Quadratic', getQuadraticPlotType()); dropdown.closeDropdown() }"
        >
          <FAwoSize :class="'justify-center pr-1 text-xs w-6 fas ' + graphingButtonData['Quadratic'].icon" />
          <span class="flex flex-wrap content-center"><i18n>Quadratic</i18n></span>
        </div>
        <div
          :class="[isDesktop ? 'dropdownItem' : 'dropdownItemSm', 'rounded-b']"
          @click="() => { onPlotSelectionInternal('Exponential', getExponentialPlotType()); dropdown.closeDropdown() }"
        >
          <FAwoSize :class="'justify-center pr-1 text-xs w-6 fas ' + graphingButtonData['Exponential'].icon" />
          <span class="flex flex-wrap content-center"><i18n>Exponential</i18n></span>
        </div>
      </Dropdown>
    </div>

    <div class="flex flex-1">
      <transition
        enter-active-class="animate__animated animate__fadeIn"
        leave-active-class="animate__animated animate__fadeOut"
        :duration="300"
      >
        <div
          v-if="!doesQuestionHaveAnyMedia"
          class="flex flex-1 flex-row gap-2 pr-2 pl-2"
        >
          <button
            :aria-label="$i18n('Add Image to question')"
            :tabindex="85"
            class="hover:bg-light-10% relative flex-auto rounded w-1/3"
            :class="isWaitingForSolutionSelection ? `bg-light-10% text-light-20%` : `bg-light-20% text-light`"
            :disabled="isWaitingForSolutionSelection"
            :size="isDesktop ? 'md' : 'xs'"
            @click="onAddMediaClick('image')"
          >
            <FAwoSize :class="`fas fa-image`" />
          </button>

          <button
            :aria-label="$i18n('Add Audio to question')"
            :tabindex="90"
            class="hover:bg-light-10% relative flex-auto rounded w-1/3"
            :class="isWaitingForSolutionSelection ? `bg-light-10% text-light-20%` : `bg-light-20% text-light`"
            :disabled="isWaitingForSolutionSelection"
            :size="isDesktop ? 'md' : 'xs'"
            @click="onAddMediaClick('audio')"
          >
            <FAwoSize :class="`fas fa-microphone-alt`" />
            <span
              v-if="shouldShowSuperBranding"
              class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4"
            >
              <SuperIcon :size="isDesktop ? 12 : 7" />
            </span>
          </button>

          <button
            :aria-label="$i18n('Add Video to question')"
            :tabindex="95"
            class="hover:bg-light-10% relative flex-auto rounded w-1/3"
            :class="isWaitingForSolutionSelection ? `bg-light-10% text-light-20%` : `bg-light-20% text-light`"
            :disabled="isWaitingForSolutionSelection"
            :size="isDesktop ? 'md' : 'xs'"
            @click="onAddMediaClick('video')"
          >
            <FAwoSize :class="`fas fa-video`" />
            <span
              v-if="shouldShowSuperBranding"
              class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4"
            >
              <SuperIcon :size="isDesktop ? 12 : 7" />
            </span>
          </button>
        </div>
      </transition>
    </div>

    <div
      v-if="isDesktop"
      class="w-[36%]"
    >
      <button
        :aria-label="$i18n('Add an equation to question')"
        :tabindex="80"
        class="hover:bg-light-10% w-full h-full items-center justify-center rounded"
        :class="isWaitingForSolutionSelection ? `bg-light-10% text-light-20%` : `bg-light-20% text-light`"
        :disabled="isWaitingForSolutionSelection"
        @click="openMathEditor"
      >
        <FAwoSize :class="`fas fa-function`" />
        <span><i18n>Insert equation</i18n></span>
      </button>
    </div>
  </div>
</template>
<script>
import { h as hydrate } from 'vue';
import { mapGetters } from 'vuex';

import QuestionEditorGraphMixin from '~/mixins/questionEditorGraphMixin';
import QueryEditorMixin from '~/mixins/QueryEditorMixin';
import FAwoSize from '~/components/FAwoSize.vue';

export default {

  mixins: [QueryEditorMixin, QuestionEditorGraphMixin],

  data() {
    return {
      currentGraph: 'Disabled',
    };
  },

  computed: {
    ...mapGetters({
      getAnswerPlotType: 'slideEditor/getAnswerPlotType',
    }),

    plotIcon() {
      const self = this;
      return {
        render() {
          return hydrate(FAwoSize, {
            class: `justify-center w-8 fas ${self.graphingButtonData[self.currentGraph].icon}`,
          });
        },
      };
    },

    shouldShowSuperBranding() {
      return !this.$user.isCorporate && !this.$user.isPartOfAnOrganization && !this.$user.isSuper;
    },
  },

  watch: {
    getAnswerPlotType(newVal) {
      if (newVal !== 0) {
        this.currentGraph = this.convertToPlotString(newVal);
      }
    },
  },

  mounted() {
    if (this.getAnswerPlotType !== 0) {
      this.currentGraph = this.convertToPlotString(this.getAnswerPlotType);
    }
  },

  methods: {
    onPlotSelectionInternal(value, graphType) {
      this.currentGraph = value;
      this.onPlotSelection(graphType);
    },
  },
};
</script>

<style lang="scss" scoped>
.dropdownItem {
  @apply pl-2 font-semibold cursor-pointer flex flex-wrap w-full h-10 text-dark-2 bg-light-3 justify-start text-sm border-b-1 border-dark-6 p-1 hover:bg-dark-6;
}

.dropdownItemSm {
  @apply cursor-pointer flex flex-wrap w-full h-6 text-dark-2 justify-start text-xs border-b-1 border-dark-6 bg-light-3;
}
</style>

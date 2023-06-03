<template>
  <div
    class="w-full"
    :class="[isForMobile ? 'option-editor-classification' : 'h-full']"
  >
    <Tabs
      v-if="isForMobile"
      ref="tabContainerRef"
      v-model="selectedTabIndex"
      :tabMinWidth="50"
      class="rounded-b-lg bg-transparent"
      :tabList="tabList"
      :activeTabClasses="'text-light text-lg'"
      :inactiveTabClasses="'text-light-33% text-lg'"
      :sliderClasses="'text-light bg-light'"
      :addTopMargin="false"
      @update:modelValue="handleTabClick"
    />
    <div
      class="grid gap-4 h-full"
      :class="{
        'grid-cols-4 mt-4': !isForMobile,
        'snap-x snap-mandatory snap-always grid-flow-col overflow-x-auto px-11 py-8': isForMobile,
      }"
    >
      <OptionsGroup
        v-for="(group, index) in optionGroupsToShow"
        ref="groupRefs"
        :key="group?.id"
        :group="group"
        :optionIds="getOptionIds(group?.id)"
        :options="groupOptions(group?.id)"
        :groupIndex="index"
        :questionType="questionType"
        :isForMobile="isForMobile"
        :data="group"
        @createdGroup="handleNewGroupCreation"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { isOptionEmpty } from '~/utils/QuizUtils';
import difference from 'lodash/difference';
import isNumber from 'lodash/isNumber';

import OptionsGroup from './OptionsGroup.vue';

const OPTION_GROUP_LENGTH_LIMIT = 4;

export default {

  components: {
    OptionsGroup,
  },

  props: {
    questionType: {
      type: String,
      required: true,
    },
    isForMobile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedTabIndex: 0,
      scrollIntoViewFlag: false,
      scrollSelectedGroupIndex: 0,
      groupObservers: [],
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('contentEditor', ['questionEditorDimensions', 'quizType']),
    ...mapGetters('uiManager', ['focussedOptionInDndImage', 'editorSaveValidations']),

    questionAnswer() {
      return isNumber(this.currentSlide.structure.answer) ? [] : this.currentSlide.structure.answer ?? [];
    },

    questionOptions() {
      return this.currentSlide.structure.options ?? [];
    },

    questionTargets() {
      return this.currentSlide.structure.targets ?? [];
    },

    questionOptionGroups() {
      return this.currentSlide.structure.targets ?? [];
    },

    emptyTargetsCount() {
      return OPTION_GROUP_LENGTH_LIMIT - (this.questionOptionGroups?.length ?? 0);
    },

    optionGroupsToShow() {
      return this.questionOptionGroups?.length === OPTION_GROUP_LENGTH_LIMIT
        ? this.questionOptionGroups : [...this.questionOptionGroups, ...Array(this.emptyTargetsCount).fill({})];
    },

    targetIdForOptionId() {
      const targetIdMap = {};

      this.questionAnswer.forEach((answer) => {
        answer?.optionId?.forEach((answerId) => {
          targetIdMap[answerId] = answer.targetId;
        });
      });

      return targetIdMap;
    },

    optionsMappedById() {
      const optionMap = {};

      this.currentSlide.structure.options.forEach((option) => {
        optionMap[option._id] = option;
      });

      return optionMap;
    },

    targetsMappedById() {
      const targetData = {};

      this.currentSlide.structure.targets.forEach((target) => {
        targetData[target.id] = target;
      });

      return targetData;
    },

    tabList() {
      const tabsList = [];
      this.optionGroupsToShow.forEach((og, index) => {
        if (og.id) {
          tabsList.push({ ...og, title: og.name, count: this.getOptionIds(og?.id)?.length || 0 });
        } else {
          tabsList.push({
            name: `group ${index + 1}`,
            title: this.$i18n('group {$1}', [index + 1]),
            count: -1,
          });
        }
      });
      return tabsList;
    },
  },

  watch: {
    optionGroupsToShow: {
      handler() {
        this.$nextTick(() => {
          this.attachIntersectionObserver();
        });
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.$eventBus.$on('questionEditor:triggerPreSaveActions', this.preSaveHook);
    this.validateQuestion();
    this.$nextTick(() => {
      this.attachIntersectionObserver();
    });
  },

  beforeUnmount() {
    this.$eventBus.$off('questionEditor:triggerPreSaveActions', this.preSaveHook);
  },

  methods: {
    preSaveHook() {
      // validate and sanitize
      const invalidTargetIds = [];
      const invalidOptionIds = [];
      const allValidOptionIds = [];
      const validTargetIds = new Set();
      const options = this.questionOptions.filter((option) => {
        const isEmptyOption = isOptionEmpty(option);
        if (isEmptyOption) {
          invalidTargetIds.push(this.targetIdForOptionId[option._id]);
          invalidOptionIds.push(option._id);
        } else {
          allValidOptionIds.push(option._id);
          validTargetIds.add(this.targetIdForOptionId[option._id]);
        }
        return !isEmptyOption;
      });
      // sanitise question answer
      const updatedAnswer = [];
      this.currentSlide.structure.answer?.forEach((answer) => {
        if (difference(answer.optionId, allValidOptionIds).length) {
          if (!answer.optionId.filter((el) => allValidOptionIds.includes(el)).length) {
            invalidTargetIds.push(answer.targetId);
            return false;
          }
          updatedAnswer.push({ ...answer, optionId: answer.optionId.filter((el) => allValidOptionIds.includes(el)) });
        } else {
          updatedAnswer.push(answer);
        }
      });
      let targets = this.questionTargets.filter((target) => !invalidTargetIds.includes(target.id));
      targets = this.questionTargets.filter((target) => validTargetIds.has(target.id));

      this.$store.dispatch('slideEditor/updateMultipleQuestionProperties', { options, answer: updatedAnswer, targets });
    },

    validateQuestion() {
      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    getOptionIds(groupId) {
      if (!groupId) {
        return [];
      }
      let res = [];
      this.currentSlide.structure.answer.forEach((item) => {
        if (item.targetId === groupId) {
          res = item.optionId;
        }
      });
      return res;
    },

    groupOptions(groupId) {
      return this.getOptionIds(groupId)?.map((op) => this.currentSlide.structure.options.find((i) => i._id === op));
    },

    attachIntersectionObserver() {
      if (!this.isForMobile) { return; }
      const { groupRefs } = this.$refs;
      const tabRefs = this.$refs?.tabContainerRef?.$refs;

      groupRefs?.forEach((group) => {
        const observer = new IntersectionObserver(
          ([e]) => {
            if (e.intersectionRatio >= 0.95 && !this.scrollIntoViewFlag) {
              const { groupIndex } = group;
              this.scrollSelectedGroupIndex = groupIndex;
              this.selectedTabIndex = groupIndex;
              tabRefs[`tab-${groupIndex}`][0]?.scrollIntoView({ block: 'nearest' });
            }
          },
          { threshold: [1] }, // the entire group should be in view
        );
        observer.observe(group.$el);
        this.groupObservers.push(observer);
      });
    },

    handleTabClick(index) {
      const { groupRefs } = this.$refs;
      this.scrollIntoViewFlag = true;
      this.scrollSelectedGroupIndex = index;
      groupRefs[index].$el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => {
        this.scrollIntoViewFlag = false;
      }, 1000);
    },

    handleNewGroupCreation() {
      const groupIndex = this.questionOptionGroups.length - 1;
      this.scrollSelectedGroupIndex = groupIndex;
      this.selectedTabIndex = groupIndex;
      const { groupRefs } = this.$refs;
      const tabRefs = this.$refs?.tabContainerRef?.$refs;
      if (groupRefs && groupRefs?.length) {
        groupRefs[groupIndex]?.$el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (tabRefs) {
        tabRefs[`tab-${groupIndex}`][0]?.scrollIntoView({ block: 'nearest' });
      }
      this.validateQuestion();
    },
  },
};
</script>

<style lang="scss" scoped>
.option-editor-classification {
  height: calc(100% - 48px);
}
</style>

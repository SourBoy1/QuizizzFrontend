<template>
  <SelectBox
    :direction="direction"
    :customHeight="customHeight"
    :disabled="disableQuestionCorrectPoints"
    class="flex-1 w-full rounded"
    :showFixedPositionList="false"
    :list="pointsListText"
    aria-label="Question Correct Points"
    @input="$emit('onCorrectPointsSelected', $event)"
    @super-option-selected="$emit('close')"
  >
    <template
      #button="{
        toggleOpen, selectPrevious, selectNext, close, buttonId, ariaexpanded, ariahaspopup, arialabelledby, ...rest
      }"
    >
      <div
        :class="{
          'flex-1 relative rounded-lg': !isDesktopView,
        }"
      >
        <Button
          v-bind="rest"
          :id="buttonId"
          v-tooltip="{ content: $i18n('Set points alloted to answer this question') }"
          :type="isDesktopView ? 'dark' : 'transluscent-light-bright'"
          class="justify-center w-full pl-2 pr-2"
          :class="{
            'rounded-lg': !isDesktopView,
            hidden: isDesktopView,
          }"
          size="md"
          licon="fas fa-check-circle"
          ticon="fas fa-sort-down"
          :title="$i18n(questionCorrectPointsText)"
          :aria-labelledby="arialabelledby"
          :aria-expanded="ariaexpanded"
          :aria-haspopup="ariahaspopup"
          :tabindex="165"
          @click="toggleOpen"
          @keyup.up="selectPrevious"
          @keyup.down="selectNext"
          @blur="close"
          @keyup.esc="close"
        />
      </div>
    </template>
  </SelectBox>
</template>

<script>

import { mapGetters } from 'vuex';
import { isQuestionForPoll, isWordCloudQuestion, getPointsList } from '../utils/QuizUtils';

export default {

  props: {
    direction: {
      type: String,
      default: 'top',
    },
    customHeight: {
      type: String,
      default: '120',
    },
    currentQuestion: {
      type: Object,
      required: true,
      // validator: validateWithModelFactory(Question),
    },

    selectedCorrectPoints: {
      type: Number,
      default: 0,
    },
  },
  emits: ['onCorrectPointsSelected', 'close'],

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('contentEditor', ['isEditorForPresentationContent']),

    isWordCloudTypeQuestion() {
      return isWordCloudQuestion(this.currentQuestion);
    },

    disableQuestionCorrectPoints() {
      return isQuestionForPoll(this.currentQuestion) || this.isWordCloudTypeQuestion;
    },

    pointsList() {
      return getPointsList(this.currentQuestion).reverse();
    },

    pointsListText() {
      return this.pointsList?.map((points) => ({
        title: points === 1 ? points + this.$i18n(' point') : points + this.$i18n(' points'),
        value: points,
      }));
    },

    isDesktopView() {
      return this.isDesktop || this.isEditorForPresentationContent;
    },

    questionCorrectPointsText() {
      if (this.selectedCorrectPoints === 1) {
        return this.selectedCorrectPoints + this.$i18n(' point');
      }

      return this.selectedCorrectPoints + this.$i18n(' points');
    },
  },

  methods: {
    oninput(val) {
      this.$emit('onCorrectPointsSelected', val);
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

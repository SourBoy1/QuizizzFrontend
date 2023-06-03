<template>
  <div
    ref="interactive-blank-options-editor"
    class="interactive-blank-options-editor flex flex-col items-center justify-between relative"
    :class="{
      'h-full justify-center mx-2 p-4 bg-dark-20% rounded-lg': !isForMobile,
      'min-h-60 pt-4 px-2 bg-purple-dark': isForMobile,
    }"
  >
    <section
      v-if="areThereNoOptions"
      class="flex items-center justify-center h-full no-options-view"
    >
      <div
        class="text-light-50% font-bold"
        :class="{
          'text-base': isForMobile,
          'text-3xl': !isForMobile,
        }"
      >
        <i18n>Add upto 10 options here</i18n>...
      </div>
    </section>

    <!-- Options rendering section -->

    <section
      v-else
      class="flex flex-wrap items-center justify-center tiles-container h-fit"
      :class="{
        'gap-y-6': isForMobile,
        'gap-y-3': !isForMobile,
      }"
    >
      <div
        v-for="(option, index) in optionsOnTheUI"
        ref="blank-tiles-container"
        :key="option._id"
        :class="tileContainerClass(index)"
        :tabindex="tabIndexForTile(index)"
        @focus="setFocusToOption(index)"
      >
        <div
          v-if="!option.isInEditState"
          class="py-2 font-bold rounded-lg option-tile bg-light-3 text-dark-2"
          :class="{
            'text-2xl px-4': !isForMobile,
            'text-base px-2': isForMobile,
          }"
        >
          <KatexRenderer
            v-if="option.hasMath"
            :ref="`katex-${index}`"
            :latex="option.math.latex[0]"
            @click="setFocusToOption(index)"
            @change="handleOptionInput(index, {
              value: $event,
              hasMath: true,
            })"
          />
          <span v-else>{{ option.text }}</span>
        </div>
        <OptionsEditorBlankTileEditor
          v-else
          :value="!option.hasMath ? option.text : option.math.latex"
          :hasMath="option.hasMath"
          :parentTabIndex="tabIndexForTile(index)"
          :disallowContent="contentInOtherBlanks(index)"
          :isForMobile="isForMobile"
          @input="handleOptionInput(index, $event)"
          @blur="handleOptionBlur(index)"
          @delete="handleOptionDeletion(option)"
        />
      </div>
    </section>

    <section
      v-if="questionOptions.length > 0"
      class="user-education w-full text-center text-3xl text-light-50%"
    >
      {{ userEducation }}
    </section>

    <!-- Action center -->

    <div
      v-if="!isForMobile"
      :class="{
        'absolute top-2 right-2': !isForMobile,
        'w-full flex justify-center': isForMobile,
      }"
    >
      <Button
        v-tooltip.top-end="addOptionTooltip"
        :tabindex="addOptionButtonTabIndex"
        :aria-label="$i18n('Add an option')"
        :disabled="isAddOptionButtonDisabled"
        :applyDisabled="false"
        rounded="sm"
        :fullWidth="isForMobile"
        :size="isForMobile ? 'md' : 'xl'"
        licon="fas fa-plus-square"
        type="transparent"
        :title="$i18n('Add option')"
        @click="handleAlternativeOptionAddition"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';

import QuestionOption from '~/models/QuestionOption';
import { mapBlankIdsToBlankOrder, mapTargetIdToOptionId } from '~/utils/QuizUtils';

const QUESTION_OPTIONS_LIMIT = 10;
const INITIAL_TAB_INDEX = 101;

export default {

  props: {
    forDevice: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      focussedOption: -1,
      tabIndicesConsumedByChildren: 2,

      optionsOnTheUI: [],
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('uiManager', ['finalOptionsForBlankQuestion']),

    isForMobile() {
      return this.forDevice === this.$constants.DeviceTypes.PHONE;
    },

    questionQuery() {
      return this.currentSlide?.structure?.query;
    },

    questionOptions() {
      return this.currentSlide?.structure?.options ?? [];
    },

    questionAnswer() {
      return this.currentSlide?.structure?.answer ?? [];
    },

    userEducation() {
      if (this.questionOptions.length > 1) {
        if (this.$user.isCorporate) {
          return this.$i18n('Answer options will be shuffled for participants');
        }
        return this.$i18n('Answer options will be shuffled for students');
      }

      return this.$i18n('Add at least one more option');
    },

    blankIdsForOptionId() {
      return mapTargetIdToOptionId(this.questionAnswer, true);
    },

    hasOptionLimitReachedWithoutAnyBlank() {
      return !this.questionAnswer.length && this.questionOptions.length === QUESTION_OPTIONS_LIMIT - 1;
    },

    isAddOptionButtonDisabled() {
      if (this.hasOptionLimitReachedWithoutAnyBlank) {
        return true;
      }

      return this.questionOptions.length >= QUESTION_OPTIONS_LIMIT;
    },

    areThereNoOptions() {
      return this.optionsOnTheUI.length === 0;
    },

    addOptionButtonTabIndex() {
      return INITIAL_TAB_INDEX + 3 + this.optionsOnTheUI.length * 2;
    },

    addOptionTooltip() {
      const config = {
        triggers: ['hover'],
        theme: 'error-tooltip',
      };

      if (!this.isAddOptionButtonDisabled) {
        return {};
      }

      if (this.hasOptionLimitReachedWithoutAnyBlank) {
        config.content = this.$i18n('Please add a blank first');
      }

      if (this.questionOptions.length >= QUESTION_OPTIONS_LIMIT) {
        config.content = this.$i18n('There can be maximum {$1} options', [QUESTION_OPTIONS_LIMIT]);
      }

      return config;
    },

    isAnOptionAnswerForMultipleBlanks() {
      if (typeof this.questionAnswer !== 'object') {
        return false;
      }

      for (const option of this.optionsOnTheUI) {
        if (Object.values(this.blankIdsForOptionId[option._id] ?? {}).length > 1) {
          return true;
        }
      }

      return false;
    },
  },

  watch: {
    finalOptionsForBlankQuestion(optionsConnectedToBlanks) {
      this.syncBlanksWithOptions(optionsConnectedToBlanks);
    },

    isAnOptionAnswerForMultipleBlanks(doesOptionHaveMultipleTargetsSettingEnabled) {
      this.updatedoesOptionHaveMultipleTargetsSetting(doesOptionHaveMultipleTargetsSettingEnabled);
    },
  },

  mounted() {
    this.$eventBus.$on('interactiveBlankOptionEditor:addOption', this.handleAlternativeOptionAddition);
    this.optionsOnTheUI = [...this.questionOptions].map((option) => {
      const optionData = {
        ...option,
        isInEditState: false,
      };

      return optionData;
    });
  },

  beforeUnmount() {
    this.$store.dispatch('uiManager/resetBlankOptionEditorConfig');

    this.$eventBus.$off('interactiveBlankOptionEditor:addOption', this.handleAlternativeOptionAddition);
  },

  methods: {
    tabIndexForTile(index) {
      // tabIndicesConsumedByChildren tab indices will be taken by the action center of a tile
      if (index === 0) {
        return INITIAL_TAB_INDEX;
      }

      const tabIndicesConsumed = INITIAL_TAB_INDEX + index * 2;
      return tabIndicesConsumed + this.tabIndicesConsumedByChildren;
    },

    tileContainerClass(optionIndex) {
      const optionId = this.optionsOnTheUI[optionIndex]._id;
      if (!this.blankIdsForOptionId || !this.blankIdsForOptionId[optionId]) {
        return 'tile-container-option mx-3';
      }

      return `tile-container-for-blank-${optionIndex + 1}`;
    },

    setFocusToOption(optionIndex = -1) {
      if (optionIndex === -1) {
        this.focussedOption = -1;
        this.optionsOnTheUI[this.focussedOption].isInEditState = false;
        return;
      }

      this.focussedOption = optionIndex;

      if (this.optionsOnTheUI[optionIndex].hasMath) {
        return;
      }

      this.optionsOnTheUI[optionIndex].isInEditState = true;
    },

    /**
     * @param {object} optionsConnectedToBlanks a map of blank ids and option associated with it
     * @description processes all the new blanks creates and updates answer and options accordingly
     */
    syncBlanksWithOptions(optionsConnectedToBlanks) {
      if (this.optionsOnTheUI.length > this.questionOptions.length) {
        return;
      }

      let options = [];
      const answer = [];

      const optionOrderByBlankId = mapBlankIdsToBlankOrder(this.questionQuery.text);
      const isOptionAssociatedToBlankId = {};
      const isOptionAdded = {};

      Object.keys(optionsConnectedToBlanks).forEach((blankId) => {
        const optionData = cloneDeep(optionsConnectedToBlanks[blankId]);

        if (!optionData) {
          return;
        }

        if (!isOptionAdded[optionData._id] && !isOptionAssociatedToBlankId[optionData]) {
          options[optionOrderByBlankId[blankId]] = optionData;
          isOptionAdded[optionData._id] = true;
        }

        isOptionAssociatedToBlankId[optionData._id] = blankId;

        answer.push({
          targetId: blankId,
          optionId: [optionData._id],
        });
      });

      // creates a map of options to blanks
      // to delete options if the connected blank is removed
      const getBlankIdsForOptionId = { ...this.blankIdsForOptionId };
      Object.assign(getBlankIdsForOptionId, mapTargetIdToOptionId(answer, true));

      // pushing remaining options after correct options
      const alternativeOptions = [];

      this.questionOptions.forEach((option) => {
        if (!getBlankIdsForOptionId[option._id]) {
          alternativeOptions.push(option);
        }
      });

      options = options.concat(alternativeOptions).filter((option) => !!option);
      // update options on the UI and in store
      this.optionsOnTheUI = options.map((option, optionIndex) => ({ ...option, isInEditState: this.focussedOption === optionIndex }));
      this.updateOptionsAndAnswerValue(options, answer);
    },

    // extracts text/math from other blanks to show warning if a duplicate option is added
    contentInOtherBlanks(optionIndex) {
      const content = [];

      this.optionsOnTheUI.forEach((option, index) => {
        if (index === optionIndex) {
          return;
        }

        if (option.hasMath) {
          content.push(option.math.latex[0]);
        }

        content.push(option.text);
      });

      return content;
    },

    handleOptionBlur(optionIdentifier) {
      this.focussedOption = -1;
      this.optionsOnTheUI[optionIdentifier].isInEditState = false;
    },

    handleOptionInput(optionIdentifier, { value, hasMath = false }) {
      this.focussedOption = -1;

      this.handleOptionBlur(optionIdentifier);

      if (!value || value.trim() === '') {
        this.handleOptionDeletion(this.optionsOnTheUI[optionIdentifier]);
        return;
      }

      if (hasMath) {
        this.optionsOnTheUI[optionIdentifier].hasMath = true;
        this.optionsOnTheUI[optionIdentifier].math = {
          latex: [value],
          template: null,
        };
        this.optionsOnTheUI[optionIdentifier].text = `<p><katex latex="${value}"></katex>&nbsp;</p>`;
      } else {
        this.optionsOnTheUI[optionIdentifier].text = value;
      }

      const option = { ...this.optionsOnTheUI[optionIdentifier] };
      delete option.isInEditState;

      // insert new option to store
      if (option.isSyncedToStore === false) {
        delete option.isSyncedToStore;
        this.updateOptionsForQuestion([...this.questionOptions, option]);

        if (!this.isAddOptionButtonDisabled) {
          this.handleAlternativeOptionAddition();
        }
        return;
      }

      // update the corresponding blank in the query with the new text
      const blankAssociatedToOptionId = Object.keys(this.blankIdsForOptionId[option._id] ?? {});
      if (blankAssociatedToOptionId.length >= 0) {
        const valuesToBlankId = [];
        blankAssociatedToOptionId.forEach((blankId) => {
          valuesToBlankId.push({
            blankId,
            hasMath: option.hasMath,
            value: option.hasMath ? option.math.latex[0] : option.text,
          });
        });

        this.$store.dispatch('uiManager/setBlankValue', valuesToBlankId);
      }

      this.updateSingleQuestionOption(option, optionIdentifier);
    },

    handleAlternativeOptionAddition() {
      if (this.isAddOptionButtonDisabled) {
        return;
      }

      const newOption = QuestionOption();
      this.optionsOnTheUI.push({
        ...newOption,
        isInEditState: true,
        isSyncedToStore: false,
      });
    },

    handleOptionDeletion(option) {
      // handle deletion on the UI
      this.optionsOnTheUI = this.optionsOnTheUI.filter((uiOption) => uiOption._id !== option._id);

      // handle removal from the store
      let optionsToSyncToStore = [...this.questionOptions];
      if (option.isSyncedToStore !== false) {
        optionsToSyncToStore = optionsToSyncToStore.filter((storeOption) => storeOption._id !== option._id);
      }

      /**
       * if option belongs to a blank
       * delete it from answer
       * remove it from blank values in ui manager
       */
      let finalAnswer = [...this.questionAnswer];
      if (this.blankIdsForOptionId[option._id]) {
        finalAnswer = finalAnswer.filter((ans) => ans.optionId[0] !== option._id);
        this.$store.dispatch('uiManager/deleteBlankIdsFromValues', Object.keys(this.blankIdsForOptionId[option._id]));
      }

      this.updateOptionsAndAnswerValue(optionsToSyncToStore, finalAnswer);

      // remove blank id and option mapping from ui manager store
      // final options is to be mutated post answer updation since mapping might fail if blank exists in query but not in answer
      if (this.blankIdsForOptionId[option._id]) {
        finalAnswer = finalAnswer.filter((ans) => ans.optionId[0] !== option._id);
        this.$store.dispatch('uiManager/deleteBlankIdsFromFinalOptions', Object.keys(this.blankIdsForOptionId[option._id]));
      }
    },

    // ! store actions
    updateSingleQuestionOption(option, index) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', { option, index });

      this.validateQuestion();
    },

    updateOptionsForQuestion(options) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options });

      this.validateQuestion();
    },

    updateOptionsAndAnswerValue(options, answer) {
      this.$store.dispatch('slideEditor/updateQuestionOptionsAndAnswer', { options, answer });

      this.validateQuestion();
    },

    updatedoesOptionHaveMultipleTargetsSetting(isEnabled) {
      this.$store.dispatch('slideEditor/setdoesOptionHaveMultipleTargetsSetting', isEnabled);
    },

    validateQuestion() {
      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
$tile-container-outline-colors: (
  1: theme('colors.brand.a.DEFAULT'),
  2: theme('colors.brand.b.DEFAULT'),
  3: theme('colors.brand.c.DEFAULT'),
  4: theme('colors.brand.d.DEFAULT'),
  5: theme('colors.brand.e.DEFAULT'),
);

@mixin outlineSet($optionIndex) {
  box-shadow: 0 0 0 6px map-get($tile-container-outline-colors, $optionIndex);
  border-radius: 8px;
  outline-offset: 3px;
}

@for $optionIndex from 1 to 6 {
  .tile-container-for-blank-#{$optionIndex} {
    @include outlineSet($optionIndex);
    margin: 0 12px;
  }
}

.tiles-container {
  height: calc(100% - 40px);
  max-width: 93%;
}

.error-tooltip {
  .tooltip-inner {
    background: theme('backgroundColor.red.dark');
    color: theme('colors.light.3');
    font-weight: theme('fontWeight.bold') !important;
    font-size: theme('fontSize.base') !important;
  }

  .tooltip-arrow {
    border-color: theme('colors.red.dark');
  }
}
</style>

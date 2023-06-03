<template>
  <div class="select-timer-dropdown">
    <SelectBox
      v-model="selectedQuestionDuration"
      :direction="dropDownDirection"
      class="w-full"
      tall
      :list="options"
      :showFixedPositionList="false"
      :ariaLabel="'Question Durations'"
      @input="$emit('onTimeSelected', selectedQuestionDuration)"
      @super-option-selected="$emit('close')"
    >
      <template
        #button="{
          toggleOpen, selectPrevious, selectNext, close, buttonId, ariaexpanded, ariahaspopup, arialabelledby, ...rest
        }"
      >
        <Button
          v-bind="rest"
          :id="buttonId"
          v-tooltip="{ content: $i18n('Set time alloted to answer this question') }"
          :type="isDesktopView ? 'dark' : 'transluscent-light-bright'"
          class="justify-between w-full pl-2 pr-2"
          :class="{
            'rounded-lg': !isDesktopView,
            rounded: isDesktopView,
          }"
          size="md"
          licon="fas fa-stopwatch"
          ticon="fas fa-sort-down"
          :title="$i18n(getTimeTitle)"
          :aria-labelledby="arialabelledby"
          :aria-expanded="ariaexpanded"
          :aria-haspopup="ariahaspopup"
          :tabindex="tabindex"
          @click="toggleOpen"
          @keyup.up="selectPrevious"
          @keyup.down="selectNext"
          @blur="close"
          @keyup.esc="close"
        />
      </template>
    </SelectBox>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Constants from '~/config/Constants';

export default {
  props: {
    selectedTime: {
      type: Number,
      default: 30 * 1000,
    },

    tabindex: {
      type: Number,
      default: 0,
    },

    dropDownDirection: {
      type: String,
      default: 'top',
    },
  },
  emits: ['onTimeSelected', 'close'],

  data() {
    return {
      selectedQuestionDuration: this.$props.selectedTime,
      options: Constants.AllowedQuestionTimeInSeconds.map((secs) => {
        let title = '';
        const inMinutes = secs / 60;

        if (inMinutes >= 1) {
          const min = inMinutes === 1 ? this.$i18n('minute') : this.$i18n('minutes');
          title = this.$i18n('{$1} {$2}', [inMinutes, min]);
        } else {
          title = this.$i18n('{$1} seconds', [secs]);
        }

        return {
          title,
          value: secs * 1000,
        };
      }),
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('contentEditor', ['isEditorForPresentationContent']),

    isDesktopView() {
      return this.isDesktop || this.isEditorForPresentationContent;
    },

    getTimeTitle() {
      const inSecs = this.selectedQuestionDuration / 1000;
      const inMinutes = inSecs / 60;

      if (inMinutes >= 1) {
        return `${inMinutes} ${this.$i18n('min')}`;
      }

      return `${inSecs} ${this.$i18n('sec')}`;
    },
  },
};
</script>

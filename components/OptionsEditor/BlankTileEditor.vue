<template>
  <div
    v-tooltip.top-end="errorTooltip"
    class="tile-editor relative flex items-center border-3 border-light-3 rounded-lg pr-1 transition-all duration-200"
    :class="{
      'justify-between': hasMath,
      'border-light-3': !errorTooltip.shown,
      'border-red-dark': errorTooltip.shown,
      'py-2 pl-4': !isForMobile,
      'py-1 pl-2': isForMobile,
      'w-64': newOptionText.length < 14 && !isForMobile,
      'w-40': newOptionText.length < 14 && isForMobile,
    }"
    @blur="submitOptionChange"
  >
    <KatexRenderer
      v-if="hasMath"
      ref="katexRenderer"
      :latex="value[0]"
      isInEditState
    />
    <span
      v-else
      class="relative h-full w-full"
    >
      <span
        class="width-increaser inline-block w-full font-bold opacity-0 whitespace-nowrap"
        :class="{
          'text-xl': !isForMobile,
          'text-sm': isForMobile,
        }"
        aria-hidden="true"
      >{{ newOptionText === '' ? '&nbsp;' : newOptionText }}</span>
      <input
        ref="tile-editor-input"
        v-model="newOptionText"
        :tabindex="parentTabIndex + 1"
        type="text"
        maxlength="50"
        class="absolute left-0 top-0 w-full bg-transparent text-light-3 font-bold"
        :class="{
          'text-xl': !isForMobile,
          'text-sm': isForMobile,
        }"
        @keydown.enter="submitOptionChange"
        @keydown.delete="handleBackspaceInInput"
        @blur="decideWhetherToEmitInput"
      />
    </span>
    <div class="tile-action-center flex justify-end">
      <span
        v-if="newOptionText.length > 0"
        class="flex items-center gap-x-2"
      >
        <Button
          :tabindex="-1"
          type="transparent"
          class="transform rotate-90"
          licon="fas fa-level-down"
          size="sm"
          :aria-label="$i18n('Save with {$1}', [value])"
          @mousedown="submitOptionChange"
          @blur="decideWhetherToEmitInput"
        />
        <Button
          :tabindex="parentTabIndex + 2"
          type="transparent"
          licon="fas fa-trash-alt"
          size="sm"
          :aria-label="$i18n('Delete value {$1}', [value])"
          @mousedown="$emit('delete')"
          @keydown.enter="$emit('delete')"
          @blur="decideWhetherToEmitInput"
        />
      </span>
      <Button
        v-else
        :tabindex="parentTabIndex + 2"
        type="transparent"
        :aria-label="$i18n('Change option to math with value, {$1}', [value])"
        licon="fas fa-function"
        size="sm"
        @mousedown="handleMathInputIntent"
        @blur="decideWhetherToEmitInput"
      />
    </div>

    <div
      v-if="newOptionText.length >= 45"
      class="absolute right-0 top-15 font-bold text-light-3 text-xs"
    >
      {{ newOptionText.length }}/<i18n>50 characters</i18n>
    </div>
  </div>
</template>

<script>
export default {

  props: {
    parentTabIndex: {
      type: Number,
      require: true,
      default: 0,
    },

    value: {
      type: String,
      default: '',
    },

    hasMath: {
      type: Boolean,
      default: false,
    },

    disallowContent: {
      type: Array,
      default: () => [],
    },

    isForMobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['delete', 'input', 'blur'],

  data() {
    return {
      newOptionText: '',
      isMathEditInProgress: false,
    };
  },

  computed: {
    finalFormattedValue() {
      return this.$stringUtils.escapeHTML(this.newOptionText);
    },

    errorTooltip() {
      const tooltip = {
        shown: this.newOptionText.length >= 45,
        container: 'body',
        triggers: [],
        content: this.$i18n('You have reached the character limit'),
        theme: 'error-tooltip',
      };

      if (this.disallowContent.includes(this.finalFormattedValue)) {
        tooltip.shown = true;
        tooltip.content = this.$i18n('Option already exists');
      }

      return tooltip;
    },
  },

  mounted() {
    this.newOptionText = this.value;
    this.$refs['tile-editor-input']?.focus();

    if (this.hasMath) {
      this.$refs.katexRenderer?.handleMathEditIntent();
    }
  },

  methods: {
    submitOptionChange() {
      if (this.finalFormattedValue.trim() === '' || this.disallowContent.includes(this.finalFormattedValue)) {
        this.$emit('delete');
        return;
      }

      this.$emit('input', {
        value: this.finalFormattedValue,
        hasMath: false,
      });
    },

    // deletes the alternative if backspace is captured without text
    handleBackspaceInInput() {
      if (this.finalFormattedValue.trim() === '') {
        this.$emit('delete');
      }
    },

    /**
     * Handles focus and tabs on elements
     * If, the parent tab index is 101 the tile editor takes 102, 103 tabindex
     * Actve tab index should be something which is inside in the tile editor to resemble focus
     * We emit blur/input only when the focus is out of the tile editor
     */
    decideWhetherToEmitInput() {
      const { parentTabIndex } = this;
      setTimeout(() => {
        const activeTabIndex = document.activeElement.tabIndex;

        if (this.isMathEditInProgress) {
          return;
        }

        // checks if focus is within the tile editor and decides which event to emit
        if (activeTabIndex <= parentTabIndex || activeTabIndex > parentTabIndex + 2) {
          if (this.value === this.newOptionText) {
            if (this.value.trim() === '') {
              return this.$emit('delete');
            }

            if (activeTabIndex === parentTabIndex) {
              const previousElement = document.querySelector(`[tabIndex="${activeTabIndex - 1}"]`);
              previousElement?.focus();
            }
            this.$emit('blur');
            return;
          }

          this.submitOptionChange();
        }
      });
    },

    handleMathInputIntent() {
      this.isMathEditInProgress = true;
      this.$eventBus.$emit('presentationEditor:showMathEditor', {
        callback: (latex) => {
          this.isMathEditInProgress = false;
          this.$emit('input', {
            value: latex,
            hasMath: true,
          });
        },
      });
    },
  },
};
</script>

<style lang="scss">
$tile-action-center-width: 72px;

.tile-editor {
  .tile-action-center {
    width: $tile-action-center-width;
    max-width: $tile-action-center-width;
  }

  input {
    outline: 2px solid transparent !important;
    box-shadow: none !important;
  }
}
</style>

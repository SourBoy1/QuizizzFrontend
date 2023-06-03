<template>
  <node-view-wrapper
    :id="`blank-node-${blankId}`"
    ref="blank"
    v-tooltip="{
      placement: lengthOfContent > 49 ? 'top-end' : 'right',
      shown: isInFocus && (lengthOfContent > 49 || shouldShowEducationTooltip),
      content: lengthOfContent > 49 ? $i18n('You have reached the character limit') : ``,
      classes: lengthOfContent > 49 ? 'error-tooltip' : 'info-tooltip',
      distance: 6,
      triggers: [],
      container: 'body',
    }"
    class="blank-node"
    :class="[`blank-order-${indexOfBlank}`, {
      'has-math': hasMath,
      error: lengthOfContent >= 50,
      'min-w-40 justify-between': isInFocus && lengthOfContent < 15,
    }]"
  >
    <node-view-content
      v-show="!hasMath"
      :id="blankId"
      class="blank-content"
      :class="{
        'is-empty': lengthOfContent === 0 && !hasMath,
      }"
    />

    <KatexRenderer
      v-if="hasMath"
      contenteditable="false"
      :latex="valueInStore"
      @change="onChange($event, true)"
    />

    <div
      v-if="isInFocus && !hasMath"
      contenteditable="false"
      class="action-center"
    >
      <span
        v-if="doesBlankHaveContent"
        class="flex items-center gap-x-2"
      >
        <Button
          type="transparent"
          class="transform rotate-90"
          licon="fas fa-level-down"
          size="sm"
          :aria-label="$i18n('Press enter to save')"
        />
        <Button
          type="transparent"
          licon="fas fa-trash-alt"
          size="sm"
          :aria-label="$i18n('Delete blank {$1}', [value])"
          @mousedown="handleDeleteButtonIntent"
        />
      </span>
      <Button
        v-else
        type="transparent"
        licon="fas fa-function"
        size="sm"
        :aria-label="$i18n('Add math to blank')"
        @mousedown="handleAdditionOfMath"
      />
    </div>

    <div
      v-if="isInFocus && lengthOfContent > 45"
      class="char-count absolute right-0 top-15 font-bold text-light-3 text-xs"
    >
      {{ lengthOfContent }}/<i18n>50 characters</i18n>
    </div>
  </node-view-wrapper>
</template>

<script>
import { mapGetters } from 'vuex';
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import { Plugin, PluginKey } from 'prosemirror-state';

import debounce from 'lodash/debounce';

let observer = null;
let submissionTimer = null;
export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,
  emits: [],

  data() {
    return {
      value: '',
      isAddingMathInProgress: false,
      mathOnMount: false,

      focusTimer: null,
      isInFocus: false,

      syncBlanksPostUpdate: false,
    };
  },

  computed: {
    ...mapGetters('uiManager', ['currentBlankValues', 'finalOptionsForBlankQuestion', 'previousBlankValues']),
    ...mapGetters('slideEditor', ['currentSlide']),

    blankId() {
      return this.node.attrs.id;
    },

    hasMath() {
      return !!this.currentBlankValues[this.blankId]?.hasMath;
    },

    valueInStore() {
      return this.currentBlankValues[this.blankId]?.value ?? '';
    },

    doesBlankHaveContent() {
      return this.value?.length > 0;
    },

    indexOfBlank() {
      const options = this.currentSlide?.structure.options ?? [];

      if (!this.finalOptionsForBlankQuestion[this.blankId]) {
        return 7;
      }

      const indexOfConnectedOption = options.findIndex((option) => option._id === this.finalOptionsForBlankQuestion[this.blankId]._id);

      return indexOfConnectedOption > -1 ? indexOfConnectedOption + 1 : 7;
    },

    shouldShowEducationTooltip() {
      return (this.getPos() + 1 === this.editor.view.state.selection.anchor || this.getPos() + 2 === this.editor.view.state.selection.anchor) && !this.doesBlankHaveContent;
    },

    lengthOfContent() {
      return this.value?.length ?? 0;
    },

    previousState() {
      return this.previousBlankValues[this.blankId];
    },
  },

  watch: {
    value(curr) {
      // update the value in the store if value is changed from the blank in tiptap
      if (this.valueInStore !== curr) {
        this.onChange(curr);
      }
    },

    valueInStore(curr) {
      // update value of node on the UI if the value is changed from the tile editor
      if (curr !== this.value) {
        this.setNodeValue(curr);
      }
    },

    isInFocus(isBlankInFocus) {
      if (isBlankInFocus) {
        this.editor.registerPlugin(new Plugin({
          key: new PluginKey(`blank-input-handler-${this.blankId}`),
          props: {
            handleKeyDown: this.handleKeydown,
          },
        }));
      } else {
        this.editor.unregisterPlugin(`blank-input-handler-${this.blankId}`);
      }

      // delete blank in case value inside is empty
      if (!isBlankInFocus && !this.isAddingMathInProgress && !this.hasMath) {
        if (!this.value || this.value.trim() === '') {
          this.deleteNode();
          return;
        }

        this.$eventBus.$emit('queryEditor:syncBlanksToOptions');
      }
    },
  },

  mounted() {
    this.editor.on('update', () => {
      this.$nextTick(() => {
        this.captureUpdate();
      });
    });

    // initialise local value with value in store
    if (this.valueInStore && !this.value) {
      this.value = this.valueInStore;
    }

    // to show blank with math post undo
    if (this.previousState?.hasMath) {
      this.mathOnMount = true;
    }

    observer = new MutationObserver(this.checkIfBlankIsFocussed);
    observer.observe(this.$refs.blank.$el, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class'],
    });

    if (this.indexOfBlank === 7 && !this.isInFocus) {
      this.$nextTick(() => {
        this.captureUpdate();
        this.syncBlanksPostUpdate = true;
      });
    }

    setTimeout(() => {
      // brings the cursor inside of the blank when a new one is added
      if (!this.valueInStore && this.valueInStore === '') {
        this.setCursorPosition();
      }
    }, 100);
  },

  beforeUnmount() {
    // cleaning up listeners
    this.editor.off('update', this.captureUpdate);
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
    }
    if (submissionTimer) {
      clearTimeout(submissionTimer);
    }
    if (observer) {
      observer.disconnect();
    }

    // removing blank value from store when unmounted
    this.$store.dispatch('uiManager/deleteBlankIdsFromValues', [this.blankId]);
  },

  methods: {
    captureUpdate() {
      // deletes the node if zero width white space is also deleted
      if (this.hasMath) {
        return;
      }

      if (!this.node.content?.content?.[0]?.text) {
        this.deleteNode();
        return;
      }

      this.value = this.node.content?.content?.[0]?.text?.replace(/\u200B/g, '')?.trim() ?? null;
    },

    setCursorPosition(pos = this.getPos() + 2) {
      if (this.value === '' && this.editor.view.state.selection.anchor !== pos) {
        this.editor.commands.focus(pos);
      }
    },

    checkIfBlankIsFocussed(mutations) {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          this.isInFocus = mutation.target.classList.contains('_rawValue');
        }
      });
    },

    // set blank value explictly
    setNodeValue(value) {
      if (this.isAddingMathInProgress) {
        return;
      }

      if (!value || value.trim() === '') {
        this.deleteNode();
        return;
      }

      const schema = this.editor.getJSON();

      schema.content[0].content.forEach((element, eleIndex) => {
        if (element.type === 'blank') {
          if (element.attrs?.id === this.blankId) {
            schema.content[0].content[eleIndex].content[0].text = value;
          }
        }
      });

      this.editor.commands.setContent(schema);
    },

    // register input from inside the blank
    onChange: debounce(function handleChange(value, hasMath = this.mathOnMount) {
      if (this.isAddingMathInProgress) {
        return;
      }

      if (this.mathOnMount) {
        this.mathOnMount = false;
      }

      if (hasMath) {
        this.editor.chain().focus().run();
      }

      this.$store.dispatch('uiManager/setBlankValue', [{
        blankId: this.blankId,
        value: value?.slice(0, 50) ?? '',
        hasMath,
      }]);

      if (this.syncBlanksPostUpdate) {
        this.syncBlanksPostUpdate = false;
        this.$eventBus.$emit('queryEditor:syncBlanksToOptions');
      }
    }, 400, { leading: true, trailing: true }),

    handleAdditionOfMath() {
      this.isAddingMathInProgress = true;
      this.$eventBus.$emit('presentationEditor:showMathEditor', { callback: this.handleMathAdditionSuccess, closeCallback: this.handleMathIntentCancel });
    },

    handleMathAdditionSuccess(latex) {
      this.isAddingMathInProgress = false;
      this.editor.chain().focus().run();
      this.onChange(latex, true);
      this.$nextTick(() => {
        this.$eventBus.$emit('queryEditor:syncBlanksToOptions');
      });
    },

    handleMathIntentCancel() {
      if (this.value?.trim() === '') {
        this.deleteNode();
      }
    },

    handleDeleteButtonIntent() {
      this.deleteNode();

      this.focusTimer = setTimeout(() => {
        this.editor.chain().focus().run();
      }, 250);
    },

    handleKeydown(view, event) {
      if (!this.isInFocus) {
        return false;
      }

      const keytype = event.key;

      switch (keytype) {
        case 'Enter':
          this.$eventBus.$emit('queryEditor:syncBlanksToOptions');
          submissionTimer = setTimeout(() => {
            const posAfterNode = this.getPos() + this.node.nodeSize;
            this.editor.commands.focus(posAfterNode + 1);
          }, 250);
          return true;
        case 'Backspace':
        case 'ArrowLeft':
        case 'ArrowRight':
          return false;
        default:
          return this.lengthOfContent === 50;
      }
    },
  },
};
</script>

<style lang="scss">
$tile-container-outline-colors: (
  1: theme('colors.brand.a.DEFAULT'),
  2: theme('colors.brand.b.DEFAULT'),
  3: theme('colors.brand.c.DEFAULT'),
  4: theme('colors.brand.d.DEFAULT'),
  5: theme('colors.brand.e.DEFAULT'),
);

.blank-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 3px solid theme('colors.light.3') !important;
  border-radius: theme('borderRadius.lg');
  max-width: fit-content;
  background: theme('colors.light.3');
  padding: theme('padding.1') theme('padding.4');
  margin-top: theme('margin.4');

  .blank-content {
    white-space: inherit !important;
    font-weight: theme('fontWeight.bold');
    color: theme('colors.dark.2');
  }

  .action-center {
    display: flex !important;
  }

  .char-count {
    display: hidden;
  }

  &._rawValue {
    .char-count {
      display: inline-block;
    }

    &.error {
      border-color: theme('colors.red.dark') !important;
    }
  }

  &._rawValue:not(&.has-math) {
    background: transparent;
    padding-right: 12px;

    .blank-content {
      color: theme('colors.light.2');
      margin-right: 8px;

    }

    .is-empty {
      &::after {
        content: 'Type the answer...';
        color: theme('colors.light.50%');
      }
    }

    .action-center {
      max-width: 'fit-content';
      padding-left: 8px;
    }
  }
}

@media only screen and (max-width: 991px) {
  .blank-node {
    padding: theme('padding.1') theme('padding.2');
  }
}

@mixin outlineSet($optionIndex) {
  box-shadow: 0 0 0 6px map-get($tile-container-outline-colors, $optionIndex);
  border-radius: 8px;
  outline-offset: 3px;
}

@for $optionIndex from 1 to 6 {
  .blank-order-#{$optionIndex}:not(._rawValue) {
    @include outlineSet($optionIndex);
    margin: theme('margin.4') theme('margin.2');
  }

  @media only screen and (max-width: 991px){
    .blank-order-#{$optionIndex}:not(._rawValue) {
      margin: theme('margin.3') theme('margin.1');
    }
  }
}
</style>

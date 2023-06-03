<template>
  <node-view-wrapper class="katex-wrapper">
    <div class="delete-container">
      <div
        class="inline-block katex-el"
        @click="update"
        v-html="katexHTML"
      />
      <button
        :aria-label="$i18n('Delete the equation')"
        class="rounded-full delete-equation absolute -top-5 -right-3 h-8 w-8"
        type="button"
        @click.stop="deleteMath"
      >
        <FA
          icon="fas fa-times-circle"
          :size="32"
        />
      </button>
    </div>
  </node-view-wrapper>
</template>

<script>
import { nanoid } from 'nanoid';
import { NodeViewWrapper } from '@tiptap/vue-3';
import katex from 'katex';

export default {
  components: {
    NodeViewWrapper,
  },

  props: {
    node: {
      type: Object,
      required: true,
    },
    updateAttributes: {
      type: Function,
      required: true,
    },
    deleteNode: {
      type: Function,
      default: () => {},
    },
  },
  emits: [],

  data() {
    return {
      katex: null,
    };
  },

  computed: {
    katexHTML() {
      let { latex } = this.node.attrs;
      if (typeof latex !== 'string') {
        latex = `${latex}`;
      }
      let katexEle = '';
      try {
        katexEle = this.katex
          ? this.katex.renderToString(latex, {
            displayMode: true,
          })
          : '';
      } catch (err) {
        window.console.error(err);
      }
      return katexEle;
    },
  },

  watch: {
    katexHTML() {
      // trigger an `update` event every time the latex updates, for auto-sizing the parent container
      this.$nextTick(() => {
        this.updateAttributes({});
      });
    },
  },

  async created() {
    this.katex = katex;
  },

  mounted() {
    /**
     * Creating a nanoid for each Katex instance so that we can track and perform updates through the global event bus
     *
     * This is done because Katex is rendered through the `v-html` tag, and so we are unable to add event listeners or directly mutate the component
     * without digging into the $parent/$child node hierarchy in vue.
     *
     * Having a unique id for each component and managing updates through the event bus is a simpler way to do this
     */
    this.id = nanoid(6);
    this.$eventBus.$on('slideElement:updateMath', this.updateMath);
    // trigger an `update` event after the first time the latex is rendered, for auto-sizing the parent container
    this.$nextTick(() => {
      this.updateAttributes({});
    });
  },

  beforeUnmount() {
    this.$eventBus.$off('slideElement:updateMath');
  },

  methods: {
    update() {
      this.$eventBus.$emit('mathRenderEle:clicked', { id: this.id, latex: this.node.attrs.latex });
    },

    deleteMath() {
      this.updateMath(this.id, '');
      this.deleteNode();
    },

    updateMath({ id, latex }) {
      if (id === this.id) {
        this.updateAttributes({
          latex,
        });
      }
    },
  },
};
</script>

<style lang="scss">
.katex-wrapper {
  display: inline-flex;
  box-sizing: border-box;
  border: none;
  outline: none;
  position: relative;

}
.katex-el {
  padding: 0.5rem;
  border: 1px dashed transparent;
  border-radius: 8px;

  &:hover {
    cursor: pointer;
    padding: 0.5rem;
    border: 1px dashed transparent;
    border-radius: 8px;
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
  }
}

.delete-container:hover {
    .delete-equation {
      display: inline;
    }
}

.delete-equation {
  cursor: pointer;
  display: none;
}
</style>

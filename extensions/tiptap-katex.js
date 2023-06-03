import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

import Katex from '../components/Katex.vue';

export default Node.create({
  name: 'Katex',

  group: 'inline',

  inline: true,

  atom: true,

  marks: '',

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'Katex',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['Katex', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Katex);
  },
});

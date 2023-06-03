import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import { nanoid } from 'nanoid';

import Blank from '../components/Blank.vue';

export default Node.create({
  name: 'blank',
  group: 'inline',
  content: 'text*',
  inline: true,
  marks: '',

  addAttributes() {
    return {
      id: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'blank',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['blank', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Blank);
  },

  addCommands() {
    return {
      addBlank: (text = '&ZeroWidthSpace;') => ({ commands }) => {
        commands.insertContent(`&ZeroWidthSpace; <blank id=${nanoid(12)}} class="has-focus">${text}</blank> `);
      },
    };
  },
});

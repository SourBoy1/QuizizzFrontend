import { Mark, mergeAttributes } from '@tiptap/core';

export default Mark.create({
  name: 'superscript',
  addOptions: {
    HTMLAttributes: {},
  },
  parseHTML() {
    return [
      {
        tag: 'sup',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'sup',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addCommands() {
    return {
      setSuperscript: () => ({ commands }) => commands.setMark('superscript'),
      toggleSuperscript: () => ({ commands }) => commands.toggleMark('superscript'),
      unsetSuperscript: () => ({ commands }) => commands.unsetMark('superscript'),
    };
  },
  addKeyboardShortcuts() {
    return {
      'Mod-=': () => this.editor.commands.toggleSuperscript(),
    };
  },
});

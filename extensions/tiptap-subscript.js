import { Mark, mergeAttributes } from '@tiptap/core';

export default Mark.create({
  name: 'subscript',
  addOptions: {
    HTMLAttributes: {},
  },
  parseHTML() {
    return [
      {
        tag: 'sub',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'sub',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addCommands() {
    return {
      setSubscript: () => ({ commands }) => commands.setMark('subscript'),
      toggleSubscript: () => ({ commands }) => commands.toggleMark('subscript'),
      unsetSubscript: () => ({ commands }) => commands.unsetMark('subscript'),
    };
  },
  addKeyboardShortcuts() {
    return {
      'Mod-=': () => this.editor.commands.toggleSubscript(),
    };
  },
});

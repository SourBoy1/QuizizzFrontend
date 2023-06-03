import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

export default Extension.create({
  name: 'fontColor',
  addOptions: {
    types: ['textStyle'],
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontColor: {
            default: null,
            renderHTML: (attributes) => {
              if (!attributes.fontColor) {
                return {};
              }
              return {
                style: `color: ${attributes.fontColor}; text-decoration-color: ${attributes.fontColor}`,
              };
            },
            parseHTML: (element) => element.style.color
                && element.style.color.replace(/['"]+/g, ''),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontColor: (fontColor) => ({ chain }) => chain().setMark('textStyle', { fontColor }).run(),
      unsetColor: () => ({ chain }) => chain()
        .setMark('textStyle', { fontColor: null })
        .removeEmptyTextStyle()
        .run(),
    };
  },
});

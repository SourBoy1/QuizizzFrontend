import QLogger from '~/services/QLogger';

// Select (Highlight) a portion of a text node
// ex: <p ref="textElement">Text Text Text</p>
// Don't pass this.$refs.textElement, but instead this.$refs.textElement.firstChild
export default (text, lowerIndex, upperIndex) => {
  try {
    if (window.getSelection) {
      const selection = window.getSelection();
      const range = document.createRange();
      if (range.startOffset === range.endOffset) {
        return;
      }
      range.setStart(text, lowerIndex);
      range.setEnd(text, upperIndex);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      QLogger.warn('Could not select text in node: Unsupported browser.');
    }
  } catch (e) {
    QLogger.warn('Something went wrong when selecting the text node', e);
  }
};

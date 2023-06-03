import QLogger from './QLogger';
import $store from './StoreService';

// Private methods

async function writeTextToSystemClipboard(text) {
  const error = await navigator.clipboard.writeText(text);

  if (error) {
    QLogger.error('Clipboard.writeText: Could not copy text: ', error);
    return false;
  }

  QLogger.log('Clipboard.writeText: Copying to clipboard was successful!');
  return true;
}

function clearStoreClipboard() {
  $store().dispatch('clipboard/clear');
}

function clearSystemClipboard() {
  navigator.clipboard.writeText('');
}

export default class ClipboardService {
  /**
   * To write data to either system clipboard or app's global storage depending
   * on the data type of the content copied. For plain text we use system clipboard.
   * Also handles syncing between two, for example if copied to system's clipboard we
   * clear the store's clipboard to avoid two clipboard states.
   * @param {*} dataType Data type of the content to be copied. e.g text/plain, application/json etc
   * @param {*} content The copied content itself
   * @returns {Boolean} Weather the copy was successful
   */
  static async writeData(dataType, content) {
    if (dataType === 'text/plain') {
      const result = await writeTextToSystemClipboard(content);

      if (result) {
        clearStoreClipboard();
      }

      return result;
    }

    $store().dispatch('clipboard/write', { dataType, content });
    clearSystemClipboard();
    return true;
  }

  static readData() {
    return $store().getters['clipboard/read'];
  }

  static copy(text) {
    this.writeData('text/plain', text);
  }
}

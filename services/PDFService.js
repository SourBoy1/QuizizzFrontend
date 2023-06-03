import { isClient } from '~/utils/EnvUtils';
import QLogger from '~/services/QLogger';

/**
 * Parses a file's content as an array buffer and returns a Uint8 array
 *
 * @param {File} file File to parse as a Uint8 array
 *
 * @returns {Promise<Uint8Array>} The file's contents as a Uint8Array
 */
function readFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const fileContent = new Uint8Array(fileReader.result);
      resolve(fileContent);
    };

    fileReader.onerror = (err) => {
      reject(err);
    };

    fileReader.readAsArrayBuffer(file);
  });
}

/**
 * Service to allow parsing and manipulation of PDF files
 */
export default class PDFService {
  constructor() {
    this.pdf = null;
  }

  /**
   * Parses and loads a given pdf file
   *
   * @param {File} file
   */
  async loadPdf(file) {
    if (isClient()) {
      try {
        const PDFJSWorker = await import(/* webpackPrefetch: true */'pdfjs-dist/legacy/build/pdf.worker.min');
        (typeof window !== 'undefined'
          ? window
          : {}
        ).pdfjsWorker = PDFJSWorker;
        const fileContents = await readFile(file);
        const pdfjs = await import(/* webpackPrefetch: true */'pdfjs-dist/legacy/build/pdf.min');
        this.pdf = await pdfjs.getDocument(fileContents).promise;
      } catch (err) {
        QLogge('Unable to parse pdf file. Err - %o', err);
      }
    }
  }

  /**
   * Returns the number of pages in the parsed PDF
   *
   * @returns {Number} The number of pages in the PDF
   */
  getNumPages() {
    return this.pdf?.numPages || 0;
  }

  /**
   * Fetches and returns the given PDF page
   *
   * @param {Number} pageNum Number of page to fetch
   * @returns {Promise<import('pdfjs-dist/types/display/api').PDFPageProxy>}
   */
  getPage(pageNum) {
    return new Promise((resolve, reject) => {
      if ((pageNum) > this.getNumPages()) {
        reject('Page number out of bounds');
        return;
      }

      this.pdf.getPage(pageNum).then((page) => {
        resolve(page);
      }).catch((err) => {
        QLogger.error('Unable to get PDF page. Err - %o', err);
        reject(err);
      });
    });
  }

  /**
   * Renders the given PDF page to the desired context
   *
   * @param {import('pdfjs-dist/types/display/api').PDFPageProxy} page
   * @param {import('pdfjs-dist/types/display/api').RenderParameters} renderOptions
   */
  renderPage(page, renderOptions) {
    return new Promise((resolve, reject) => {
      QLogger.info('Rendering page with options - %o', renderOptions);
      page.render(renderOptions)
        .promise
        .then(resolve)
        .catch((err) => {
          QLogger.error('Error while rendering the page. Err - %o', err);
          reject(err);
        });
    });
  }

  /**
   * Gets the viewport of the page
   *
   * @param {import('pdfjs-dist/types/display/api').PDFPageProxy} page
   * @param {import('pdfjs-dist/types/display/api').GetViewportParameters} options
   */
  getViewport(page, options) {
    QLogger.info('Fetching page viewport with options - %o', options);
    return page.getViewport(options);
  }
}

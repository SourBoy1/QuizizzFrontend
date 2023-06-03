const createWorker = (response) => {
  if (typeof window !== 'undefined') {
    window.URL = window.URL || window.webkitURL;
    let blob;
    try {
      blob = new Blob([response], { type: 'application/javascript' });
    } catch (e) { // Backwards-compatibility
      window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
      blob = new window.BlobBuilder();
      blob.append(response);
      blob = blob.getBlob();
    }
    return new Worker(window.URL.createObjectURL(blob));
  }
};

export default createWorker;

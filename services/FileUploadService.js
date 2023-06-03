import axios from 'axios';
import { nanoid } from 'nanoid';

import Constants from '~/config/Constants.js';
import $axios from './AxiosService.js';

export default class FileUploadService {
  static doesFileExceed5MB(file) {
    return file.size / 1024 / 1024 > 5;
  }

  static readFileAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        resolve(ev.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  static async getUploadURL(destination, folder, metadata, shouldAppendRandomNumber = false) {
    const url = `${$axios().defaults.mediaServiceURL}/getUploadURL?destination=${destination}${
      folder ? `&folder=${folder}` : ''
    }${metadata ? `&metadata=${JSON.stringify(metadata)}` : ''}${shouldAppendRandomNumber ? `&_=${nanoid(6)}` : ''}`;

    try {
      const response = await axios.post(url);
      return response.data.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async uploadFileToS3(file, {
    destination, folder, metadata, appendRandomizedQueryParam, validateUpload = false, config = {},
  }, bypassResize) {
    const shouldAppendRandomNumber = appendRandomizedQueryParam || false;
    try {
      const { finalUrl, signedUrl } = await FileUploadService.getUploadURL(destination, folder, metadata, shouldAppendRandomNumber);
      const uploadURL = signedUrl;
      if (metadata && metadata['Content-Type']) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['Content-Type'] = metadata['Content-Type'];
      }
      await axios.put(uploadURL, file, config);
      return finalUrl;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async uploadURLToS3(url, { destination = Constants.ImageUploadTypes.QUIZZES }) {
    try {
      const params = {
        url, destination,
      };
      const response = await axios.post(`${$axios().defaults.mediaServiceURL}/uploadLink`, params);
      return {
        result: response.data.data.imageUrl || {},
      };
    } catch (error) {
      return {
        error,
      };
    }
  }

  static convertDataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const fileMimeType = arr[0].match(/:(.*?);/)[1];
    const byteString = atob(arr[1]);
    const stringLength = byteString.length;
    const unsigned8BitArray = new Uint8Array(stringLength);

    for (let lengthCounter = 0; lengthCounter < stringLength; lengthCounter++) {
      unsigned8BitArray[lengthCounter] = byteString.charCodeAt(lengthCounter);
    }
    return new Blob([unsigned8BitArray], { type: fileMimeType });
  }
}

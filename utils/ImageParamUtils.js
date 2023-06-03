import forEach from 'lodash/forEach';

import Constants from '~/config/Constants';

/**
 * @export
 * Adds or Replaces the list of params in the url
 * @param {string} url - url to add params in
 * @param {string[]} paramsArr - List of params to add or replace
 * @param {any[]} valuesArr - List of values for corresponding params
 * @returns {string} - Url with the specified params
 */
export function addOrReplaceParams(src, paramsArr, valuesArr) {
  let url = src;
  const urlSplits = url.split('?');

  if (urlSplits.length > 1) {
    forEach(paramsArr, (param, index) => {
      const regex = new RegExp(`[\\?&]${param}=([^&#]*)`);

      const match = regex.exec(url);
      if (match === null) {
        url += `&${param}=${valuesArr[index]}`;
      } else {
        const delimiter = match[0].charAt(0);
        url = url.replace(regex, `${delimiter + param}=${valuesArr[index]}`);
      }
    });
  } else {
    let paramStrs = '?';

    forEach(paramsArr, (param, index) => {
      paramStrs += `${index !== 0 ? '&' : ''}${param}=${valuesArr[index]}`;
    });

    url += paramStrs;
  }

  return url;
}

/**
 * @export
 * Attaches dimension params for all kinds of images based on type sent. If paramVal is present in options, it ignores type
 * @param {string} url - Url the params will be attached to
 * @param {Object} options - Options object
 * @param {['mobile'|'tablet'|'desktop']} options.deviceType
 * @param {Number} options.dimToCheckAgainst
 * @returns {string} Url with attached params
 */
export function attachParamForImage(url, options = {}) {
  return attachParamsForMisc(url, options.dimToCheckAgainst, options.deviceType);
}

// Private Function
function returnUrlWithParams(url, dimension) {
  return addOrReplaceParams(url, ['w', 'h'], [`${dimension}`, `${dimension}`]);
}

function attachFallbackParams(url, deviceType) {
  switch (deviceType) {
    case Constants.DeviceTypes.PHONE:
      return returnUrlWithParams(url, 400);

    case Constants.DeviceTypes.TABLET:
      return returnUrlWithParams(url, 900);

    case Constants.DeviceTypes.DESKTOP:
      return returnUrlWithParams(url, 900);

    default:
      return returnUrlWithParams(url, 900);
  }
}

/**
 * @export
 * To get best possible width and height params against a dimensions.
 * @param {number} dimToCheckAgainst - The dimension which will be compared to find the best params
 * @returns {Object} - Object with 'w' and 'h' keys for width and height
 */
export function getBestSuitableDimParam(dimToCheckAgainst) {
  const serverConstraints = [...Constants.MediaServerImageDimensions];
  const params = {
    w: serverConstraints[serverConstraints.length - 1],
    h: serverConstraints[serverConstraints.length - 1],
  };

  for (let i = 0; i < serverConstraints.length; i++) {
    const val = serverConstraints[i];
    if (dimToCheckAgainst <= val) {
      params.w = val;
      params.h = val;
      break;
    }
  }

  return params;
}

function attachParamsForMisc(url, dimToCheckAgainst, deviceType) {
  if (dimToCheckAgainst) {
    const params = getBestSuitableDimParam(dimToCheckAgainst);

    return returnUrlWithParams(url, params.w);
  } if (deviceType) {
    return attachFallbackParams(url, deviceType);
  }
  return returnUrlWithParams(
    url,
    Constants.MediaServerImageDimensions[Constants.MediaServerImageDimensions.length - 1],
  );
}

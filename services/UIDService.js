import QLogger from './QLogger';

function UUIDGenerator() {
  let uuid = 0;
  QLogger.log('creating UUID generator');

  function generate() {
    uuid += 1;
    return `${uuid}`;
  }
  return generate;
}

let generateUUID = null;
/* note if you're using the UIDService,
always call destoryUUIDGenerator inside mounted() of your page's index.js

find example in inventory/index.js for destoryUUIDGenerator
find example in inventory/checkboxes.js for getUUID
*/
export function getUUID() {
  if (!generateUUID) {
    generateUUID = UUIDGenerator();
  }
  return generateUUID();
}

export function destoryUUIDGenerator() {
  if (generateUUID) {
    generateUUID = null;
  }
}

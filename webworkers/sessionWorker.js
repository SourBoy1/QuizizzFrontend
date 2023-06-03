import createWorker from './createWorker';

const sessionWorkerCode = `
let timer;
self.onmessage = function (event) {
  switch (event.data) {
    case 'start':
      timer = setInterval(() => {
        self.postMessage('tick');
      }, 1000 * 60);
      break;
    case 'stop':
      clearInterval(timer);
      break;
    default:
  }
};
`;

const sessionWorker = createWorker(sessionWorkerCode);

export default sessionWorker;

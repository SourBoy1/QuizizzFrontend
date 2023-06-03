import createWorker from './createWorker';

const timer = `
  let timer;
  self.onmessage = function (event) {
    switch (event.data) {
      case 'start':
        timer = setInterval(() => {
          self.postMessage('tick');
        }, 1000 );
        break;
      case 'stop':
        clearInterval(timer);
        break;
      default:
    }
  };
`;

const timerWorker = createWorker(timer);

export default timerWorker;

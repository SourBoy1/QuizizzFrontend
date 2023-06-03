import mitt from 'mitt';

const emitter = mitt();

const eventBus = {
  $on: emitter.on,
  $off: emitter.off,
  $emit: emitter.emit,
  $clearAll: emitter.all.clear,
};

export default eventBus;

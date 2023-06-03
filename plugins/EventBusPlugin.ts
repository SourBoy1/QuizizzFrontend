import eventBus from '../services/EventBus';

const EventBusPlugin = {
  install: (app: any) => {
    app.config.globalProperties.$eventBus = eventBus;
  },
};

export default EventBusPlugin;

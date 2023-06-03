/**
 * * Use IdleQueueService service to make sure these resources are loaded during idle time or at the earliest when they are needed
 * Ref: https://philipwalton.com/articles/idle-until-urgent/
 */
import { IdleQueue } from 'idlize/IdleQueue.mjs';

export default class IdleQueueService {
  constructor() {
    this.queue = null;

    this.init();
  }

  init() {
    this.queue = new IdleQueue({ ensureTasksRun: true });
  }

  addTask(task) {
    this.queue.pushTask(() => {
      task();
    });
  }
}

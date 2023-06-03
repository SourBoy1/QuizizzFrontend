/* eslint no-unused-expressions: off */
import isNumber from 'lodash/isNumber';

export const PausableTimersStatuses = {
  IDLE: -1,
  PAUSED: 0,
  RUNNING: 1,
  CLEARED: -2,
  STOPPED: -1,
};

/**
 * Creates a timeout which can be paused and resumed(with the remaining time)
 * and also flushed(clear timeout by executing the callback)
 * @export
 * @class PausableTimeout
 */
export class PausableTimeout {
  /**
   * Creates an instance of PausableTimeout.
   * @param {Function} callback
   * @param {Number} timeout
   * @param {boolean} [startOnInit=true] - if true the timeout will start on initialization, else would wait for the 'start' method to be called
   * @memberof PausableTimeout
   */
  constructor(callback, timeout, startOnInit = true) {
    this._cycleStartTime = 0;
    this._remainingTime = 0;
    this.status = PausableTimersStatuses.IDLE;

    this.callback = callback;
    this.timeoutTime = timeout;

    if (startOnInit) {
      this.start();
    }
  }

  start() {
    if (this.status === PausableTimersStatuses.IDLE || this.status === PausableTimersStatuses.CLEARED) {
      this.status = PausableTimersStatuses.RUNNING;

      this._setTimeout();
    }
  }

  reStart() {
    this.clear();
    this.start();
  }

  pause() {
    this._resumeTimeout && clearTimeout(this._resumeTimeout);

    if (this.status === PausableTimersStatuses.RUNNING) {
      this.currentTimeout && clearTimeout(this.currentTimeout);

      if (this._remainingTime === 0) {
        this._remainingTime = this.timeoutTime - (Date.now() - this._cycleStartTime);
      } else {
        this._remainingTime -= (Date.now() - this._cycleStartTime);
      }

      this.status = PausableTimersStatuses.PAUSED;
    }
  }

  /**
   * Resumes the paused timeout with the remaining time
   * @param {any} resumeTime - if present then timeout will be resumed using this time instead of the remaining time when paused
   * @memberof PausableTimeout
   */
  resume(resumeTime) {
    if (this.status === PausableTimersStatuses.PAUSED) {
      const remainingTime = isNumber(resumeTime) ? resumeTime : this._remainingTime;

      this.status = PausableTimersStatuses.RUNNING;
      this._cycleStartTime = Date.now();

      this._resumeTimeout = setTimeout(() => {
        this._remainingTime = 0;
        this._cycleStartTime = Date.now();
        this.callback && this.callback();

        this._setTimeout();
      }, remainingTime);
    }
  }

  /**
   * Flushes i.e. clears timeout with executing the callback
   * @memberof PausableTimeout
   */
  flush() {
    this.clear();
    this.callback && this.callback();
  }

  /**
   * Clears the timeout without executing the callback
   * @memberof PausableTimeout
   */
  clear() {
    this.currentTimeout && clearTimeout(this.currentTimeout);
    this._resumeTimeout && clearTimeout(this._resumeTimeout);
    this.status = PausableTimersStatuses.CLEARED;
  }

  /**
   * Call to change the timer of the timeout. If timer is running this pauses and resumes to apply the changed timer effect
   * @param {Number} timeToBe
   * @memberof PausableTimeout
   */
  changeTimer(timeToBe) {
    this.timeoutTime = timeToBe;
    if (this.status === PausableTimersStatuses.RUNNING) {
      this.pause();
      this.resume();
    }
  }

  _setTimeout() {
    this._cycleStartTime = Date.now();
    this.currentTimeout = setTimeout(() => {
      this.callback && this.callback();
    }, this.timeoutTime);
  }
}

export class PausableInterval {
  /**
   * Creates an instance of PausableInterval.
   * @param {any} callback
   * @param {any} interval
   * @param {any} resumeDuration - If present then whenever interval is resumed instead of the remaining time(calculated when paused) the time will be used as the delay before starting
   * @param {boolean} [execOnLeading=false] - if true the callback func will be called on start otherwise first execution of the callback will be on first cycle end
   * @param {boolean} [startOnInit=false] - if true the timeout will start on initialization, else would wait for the 'start' method to be called
   * @memberof PausableInterval
   */
  constructor(callback, interval, resumeDuration, execOnLeading = false, startOnInit = false) {
    this._init();

    this.callback = callback;
    this.intervalTime = interval;
    this.execOnLeading = execOnLeading;
    if (isNumber(resumeDuration)) {
      this._resumeTime = resumeDuration;
    }

    if (startOnInit) {
      this.start();
    }
  }

  _init() {
    this.status = PausableTimersStatuses.IDLE;
    this._remainingTime = 0;
    this._cycleStartTime = 0;
  }

  start() {
    this.status = PausableTimersStatuses.RUNNING;
    this._cycleStartTime = Date.now();

    if (this.execOnLeading) {
      this.callback && setTimeout(this.callback);
    }
    this._setInterval();
  }

  pause() {
    this._resumeTimeout && clearTimeout(this._resumeTimeout);

    if (this.status === PausableTimersStatuses.RUNNING) {
      this.currentInterval && clearInterval(this.currentInterval);

      if (this._remainingTime === 0) {
        this._remainingTime = this.intervalTime - (Date.now() - this._cycleStartTime);
      } else {
        this._remainingTime -= (Date.now() - this._cycleStartTime);
      }

      this.status = PausableTimersStatuses.PAUSED;
    }
  }

  /**
   * Resumes the paused Interval with the remaining time
   * @param {any} resumeTime - if present then interval will be resumed using this time or the resumeInterval provided at init or the remaining time when paused
   * @memberof PausableTimeout
   */
  resume(resumeTime) {
    const _remainingTime = resumeTime || this._resumeTime || this._remainingTime;
    if (this.status === PausableTimersStatuses.PAUSED) {
      this.status = PausableTimersStatuses.RUNNING;
      this._cycleStartTime = Date.now();

      this._resumeTimeout = setTimeout(() => {
        this._remainingTime = 0;
        this._cycleStartTime = Date.now();
        this.callback && this.callback();

        this._setInterval();
      }, _remainingTime);
    }
  }

  /**
   * Basically stops the interval and initializes everything
   * @memberof PausableInterval
   */
  stop() {
    this.clear();
    this._init();
    this.status = PausableTimersStatuses.STOPPED;
  }

  changeInterval(timeToBe) {
    this.intervalTime = timeToBe;
    if (this.status === PausableTimersStatuses.RUNNING) {
      this.pause();
      this.resume();
    }
  }

  /**
   * First stops the interval and then executes the interval callback function
   * @memberof PausableInterval
   */
  flush() {
    this.stop();
    this.callback && this.callback();
  }

  clear() {
    this.currentInterval && clearInterval(this.currentInterval);
    this._resumeTimeout && clearTimeout(this._resumeTimeout);
    this.status = PausableTimersStatuses.CLEARED;
  }

  _setInterval() {
    this.currentInterval = setInterval(() => {
      this._cycleStartTime = Date.now();
      this.callback && this.callback();
    }, this.intervalTime);
  }
}

export function asyncDelay(delayTime) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delayTime);
  });
}

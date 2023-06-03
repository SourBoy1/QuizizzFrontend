import dayjs from 'dayjs';

import { DEFAULT_DURATION_STRING_FORMAT } from '~/config/Constants/DateAndTime.constants';

export const convertMiliSecondsToHrs = (ms) => ms / (1000 * 60 * 60);

export const convertMiliSecondsToMins = (ms) => ms / (1000 * 60);

export const convertMilliSecsToSecs = (ms) => ms / 1000;

export const convertHrsToMiliSecs = (hrs) => hrs * 60 * 60 * 1000;

export const convertMinsToMiliSecs = (mins) => mins * 60 * 1000;

export const getFormattedTime = (timeInMillis) => {
  const mins = Math.floor(dayjs.duration(timeInMillis).asMinutes());
  const secs = Math.floor(dayjs.duration(timeInMillis).asSeconds() - mins * 60);
  if (mins > 0) {
    if (mins === 1) {
      return 'a minute';
    }
    return `${mins} minutes`;
  } if (secs === 0) {
    return 'a few seconds';
  } if (secs === 1) {
    return 'a second';
  }
  return `${secs} seconds`;
};

export const getFormattedTimeInMinAndSec = (millis) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);

  if (minutes === 0) {
    if (seconds === 0) {
      return '0';
    }
    return `${seconds}s`;
  }
  return `${minutes}m` + `${seconds < 10 ? '0' : ''}${seconds}s`;
};

/**
 * function converts the date-time object to
 * the nearest rounded-off minutes date-time object
 * @param {*} dateToRoundOff dayjs object
 * @returns rounded-off dayjs object with either of the minute value [0, 15, 30, 45]
 */
export const getRoundedTimeForDateTimeSelector = (dateToRoundOff) => {
  if (!dateToRoundOff) {
    return null;
  }
  const date = dateToRoundOff;
  const roundedOffMinutes = [...Array(5)].map((item, index) => index * 15);
  const l = roundedOffMinutes.length;

  const minute = date.minute();

  for (let i = 0; i < l - 1; i++) {
    if (minute === roundedOffMinutes[i]) {
      return date.second(0);
    }

    const previousRoundOffMinute = roundedOffMinutes[i];
    const nextRoundOffMinute = roundedOffMinutes[i + 1];

    if (minute > previousRoundOffMinute && minute < nextRoundOffMinute) {
      const previousRoundOffDiff = minute - previousRoundOffMinute;
      const nextRoundOffDiff = nextRoundOffMinute - minute;

      if (previousRoundOffDiff < nextRoundOffDiff) {
        return date.minute(previousRoundOffMinute).second(0);
      }
      return date.minute(nextRoundOffMinute).second(0);
    }
  }
};

export const getDefaultScheduleLaterTime = () => {
  const nextHour = dayjs().add(1, 'hour');
  const startOfNextHour = nextHour.startOf('hour');
  return startOfNextHour;
};

export const getDurationString = (startDate, endDate, format = DEFAULT_DURATION_STRING_FORMAT) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const diff = end.diff(start);
  const duration = dayjs.duration(diff);
  return duration.format(format);
};

export const getDurationFromNowAsString = (endDate, format) => getDurationString(new Date(), endDate, format);

export const isTimeUp = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const diff = end.diff(start);
  return diff <= 0;
};

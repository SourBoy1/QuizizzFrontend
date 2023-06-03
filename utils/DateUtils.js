import dayjs from 'dayjs';

import i18n from '~/services/i18n';

export default class DateUtils {
  static humanizeDateDifference(endDate, startDate = new Date()) {
    let unitOfTime = '';
    let unitOfTimeText = '';

    if (dayjs(startDate).diff(endDate, 'year') > 0) {
      unitOfTimeText = i18n('year');
      unitOfTime = 'year';
      if (dayjs(startDate).diff(endDate, 'year') > 1) {
        unitOfTimeText = i18n('years');
      }
    } else if (dayjs(startDate).diff(endDate, 'month') > 0) {
      unitOfTimeText = i18n('month');
      unitOfTime = 'month';
      if (dayjs(startDate).diff(endDate, 'month') > 1) {
        unitOfTimeText = i18n('months');
      }
    } else if (dayjs(startDate).diff(endDate, 'day') > 0) {
      unitOfTimeText = i18n('day');
      unitOfTime = 'day';
      if (dayjs(startDate).diff(endDate, 'day') > 1) {
        unitOfTimeText = i18n('days');
      }
    } else if (dayjs(startDate).diff(endDate, 'hour') > 0) {
      unitOfTimeText = i18n('hour');
      unitOfTime = 'hour';
      if (dayjs(startDate).diff(endDate, 'hour') > 1) {
        unitOfTimeText = i18n('hours');
      }
    } else if (dayjs(startDate).diff(endDate, 'minute') > 0) {
      unitOfTimeText = i18n('minute');
      unitOfTime = 'minute';
      if (dayjs(startDate).diff(endDate, 'minute') > 1) {
        unitOfTimeText = i18n('minutes');
      }
    } else if (dayjs(startDate).diff(endDate, 'second') > 0) {
      unitOfTimeText = i18n('second');
      unitOfTime = 'second';
      if (dayjs(startDate).diff(endDate, 'second') > 1) {
        unitOfTimeText = i18n('seconds');
      }
    }

    return `${dayjs(startDate).diff(endDate, unitOfTime)} ${unitOfTimeText}`;
  }

  static getMonthName(idx) {
    if (idx > 11) {
      return '-';
    }
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[idx];
  }
}

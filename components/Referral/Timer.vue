<template>
  <div
    v-if="showTimer"
    :class="`font-normal flex items-center text-sm text-${color}-3`"
  >
    <span :class="['relative flex h-2.5 w-2.5 mr-2', { 'ml-4': addLeftMargin }]">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-light opacity-75" />
      <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-light" />
    </span>
    {{ timerPrefix }}{{ durationString }}
  </div>
</template>

<script>

import dayjs from 'dayjs';

import i18n from '~/services/i18n';
import { getDurationFromNowAsString } from '~/utils/TimeUtils';
import { DEFAULT_DURATION_STRING_FORMAT } from '~/config/Constants/DateAndTime.constants';

export default {
  props: {
    color: {
      type: String,
      default: 'dark',
      validator(value) {
        return ['dark', 'light'].includes(value);
      },
    },

    timerPrefix: {
      type: String,
      default: i18n('Expires in '),
    },
    addLeftMargin: {
      type: Boolean,
      default: false,
    },
    endDate: {
      type: [String, Date],
      required: true,
    },
    durationStringFormat: {
      type: String,
      default: DEFAULT_DURATION_STRING_FORMAT,
    },
    showTimerAfterEndDate: {
      type: Boolean,
      default: true,
    },
    timeUpDurationStringFormat: {
      type: String,
      default: DEFAULT_DURATION_STRING_FORMAT,
    },
  },

  data() {
    const start = dayjs();
    const end = dayjs(this.endDate);
    const diff = end.diff(start);
    return {
      durationString: getDurationFromNowAsString(this.endDate, this.durationStringFormat),
      isTimeUp: diff <= 0,
      endDateObj: end,
    };
  },

  computed: {
    showTimer() {
      return !this.isTimeUp || this.showTimerAfterEndDate;
    },
  },

  mounted() {
    if (!this.isTimeUp) {
      this.timeoutReference = setInterval(() => {
        const start = dayjs();
        const end = this.endDateObj;
        const diff = end.diff(start);
        const isTimeUp = diff <= 0;
        if (isTimeUp) {
          this.isTimeUp = isTimeUp;
          this.durationString = dayjs.duration(0).format(this.timeUpDurationStringFormat);
          this.clearTimerInterval();
        }
        this.setDurationString();
      }, 1000);
    }
  },

  unmounted() {
    if (this.timeoutReference) {
      this.clearTimerInterval();
    }
  },

  methods: {
    clearTimerInterval() {
      clearInterval(this.timeoutReference);
    },

    setDurationString() {
      this.durationString = getDurationFromNowAsString(this.endDate, this.durationStringFormat);
    },
  },
};
</script>

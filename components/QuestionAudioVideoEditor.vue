<template>
  <div
    class="question-audio-video-editor-container bg-dark-20% font-bold flex flex-col items-center justify-center relative h-full w-full"
    :class="{
      'rounded-2xl py-10': isContainingDeviceDesktop,
      'rounded-lg px-5 py-4': !isContainingDeviceDesktop,
    }"
  >
    <div
      class="h-full flex flex-col"
      :class="{
        'w-100': isContainingDeviceDesktop,
        'w-75': !isContainingDeviceDesktop,
      }"
    >
      <div
        class="w-full h-3/5 flex justify-center mb-2 items-center bg-purple text-light-50% border-1 border-light-10%"
        :class="{
          'text-lg p-4 rounded-2xl flex-col ': isContainingDeviceDesktop,
          'text-sm p-2 rounded-lg': !isContainingDeviceDesktop,
        }"
      >
        <img
          :src="`https://cf.quizizz.com/join/img/misc/${selectedResponseType.icon}.png`"
          alt="media icon"
          class="w-10"
          :class="{
            'text-center mb-3': isContainingDeviceDesktop,
          }"
        >
        <span
          :class="{
            'text-center': isContainingDeviceDesktop,
            'max-w-42': !isContainingDeviceDesktop,
          }"
        >
          <i18n>
            Participants will record their response here
          </i18n>
        </span>
      </div>
      <div
        class="flex w-full h-auto"
      >
        <div
          v-if="audVidTimes.length"
          class="h-full flex flex-col items-center bg-purple text-light-50% border-1 border-light-10% w-full"
          :class="{
            'w-full': isSuperUser || isCorporateUser || selectedResponseType.title === $constants.AudioVideoResponseTypes.VIDEO,
            'p-4 rounded-2xl': isContainingDeviceDesktop,
            'p-2 rounded-lg': !isContainingDeviceDesktop,
          }"
        >
          <div
            class="flex items-center mb-3"
            :class="{
              'text-lg': isContainingDeviceDesktop,
              'text-sm': !isContainingDeviceDesktop,
            }"
          >
            <FA
              icon="fas fa-clock"
              :size="isContainingDeviceDesktop ? 16 : 12"
              class="mr-2"
            />
            {{ !isSuperUser && !isCorporateUser ? $i18n('Time limit') : $i18n('How long can a response be?') }}
          </div>

          <div class="tab-group-container w-full flex">
            <button
              v-for="(responseTime, index) in audVidTimes"
              :key="responseTime"
              class="flex justify-center items-center flex-1 bg-light-5% text-light-20% font-bold hover:bg-light-10% focus:bg-light-10%"
              :class="{
                active: selectedTimeLimit === responseTime,
                'mr-1': index !== audVidTimes.length - 1,
                'text-xl p-2 rounded-lg': isContainingDeviceDesktop,
                'text-sm p-1 rounded': !isContainingDeviceDesktop,
              }"
              :data-cy="`media-recording-time-limit-${responseTime}`"
              :aria-label="getAriaLabel(responseTime)"
              :tabindex="100 + index"
              @click="updateQuestionSetting(responseTime)"
            >
              {{ getTimeTitle(responseTime) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import QuestionQuery from '../models/QuestionQuery';

import Constants from '../config/Constants';

export default {
  props: {
    questionType: {
      type: String,
      required: true,
    },
    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },
  },
  emits: [],

  data() {
    return {
      selectedResponseType: this.$constants.AudioVideoResponseTypeDetails[0],
      selectedTimeLimit: 30 * 1000,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['questionQuery', 'currentSlide']),
    ...mapGetters('root', ['isDesktop']),

    isContainingDeviceDesktop() {
      return this.forDevice === this.$constants.DeviceTypes.DESKTOP;
    },

    isSuperUser() {
      return this.$user.isSuper;
    },
    isCorporateUser() {
      return this.$user.isCorporate;
    },

    // CHANGE NEEDED
    getResponseType() {
      const selectedResp = this.$constants.AudioVideoResponseTypeDetails.find(({ title }) => title === this.questionType);
      if (selectedResp) { return selectedResp; }

      return this.$constants.AudioVideoResponseTypeDetails[0];
    },

    audVidTimes() {
      return this.$constants.AudioVideoOptionTimes;
    },
  },

  mounted() {
    this.selectedResponseType = this.getResponseType;

    if (this.questionQuery.answerTime !== -1) {
      this.selectedTimeLimit = this.questionQuery.answerTime;
    } else {
      this.selectedTimeLimit = 30 * 1000;
    }

    this.updateValue({ answerTime: this.selectedTimeLimit });
  },

  methods: {
    updateValue(value = {}) {
      // const updatedQuery = QuestionQuery({
      //   ...this.questionQuery,
      //   ...value,
      // });

      this.$store.dispatch('slideEditor/updateQuestionQuery', { query: null, rawData: value });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    updateQuestionSetting(responseTime) {
      if (responseTime) { this.selectedTimeLimit = responseTime; }

      this.updateValue({ answerTime: this.selectedTimeLimit });
    },

    getTimeTitle(time) {
      const inSecs = time / 1000;
      const inMinutes = inSecs / 60;

      if (inMinutes >= 1) {
        return `${inMinutes}m`;
      }

      return `${inSecs}s`;
    },

    getAriaLabel(time) {
      const inSecs = time / 1000;
      const inMinutes = inSecs / 60;

      if (inMinutes >= 1) {
        if (inMinutes === 1) {
          return `${inMinutes} ${this.$i18n('minute')}`;
        }
        return `${inMinutes} ${this.$i18n('minutes')}`;
      }

      return `${inSecs} ${this.$i18n('seconds')}`;
    },
  },
};
</script>

<style lang="scss" scoped>

.tab-group-container {
  .active {
    color: #461A42;
    background-color: #FFFFFF;
    font-weight: 700;
  }
}
</style>

<template>
  <!-- <div
    v-if="showForBanner"
    :data-index="index"
    :data-id="notification.id"
    :data-viewed="notification.viewed"
    class="flex items-center w-full cursor-pointer group relative"
    :class="notification.viewed ? 'bg-light-3' : 'bg-banner'"
    @click="handleCardClick"
  >
    <img :src="notification.imageUrl" class="w-full object-cover flex-grow-1" aria-hidden="true" />
    <button v-if="notification.dismissible" class="absolute top-2 right-2 cursor-pointer text-dark-3 invisible group-hover:visible group-hover:bg-light-1 rounded-full flex items-center justify-center w-4 h-4" @click="handleDismiss">
      <FA :size="13" icon="far fa-times" />
    </button>
  </div> -->
  <div
    v-if="showForCaptionedImage"
    ref="root"
    :data-index="index"
    :data-id="notification.id"
    :data-viewed="notification.viewed"
    class="flex items-center group relative p-5 border-b-width border-dark-10% border-b-dark-10% bg-dark-2%"
  >
    <div
      class="flex items-center  group relative flex-col border border-dark-6 rounded w-full"
      :class="notification.viewed ? 'bg-light-3' : 'bg-banner'"
    >
      <div>
        <img
          :src="notification.imageUrl"
          class="h-26 objet-cover flex-grow-1 rounded-tl rounded-tr"
          aria-hidden="true"
        />
      </div>
      <div class="flex w-full p-4">
        <div
          id="notification-message"
          class="text-dark text-xs basis-10/12"
        >
          <div class="text-sm font-semibold">
            {{ notification.title }}
          </div>
          <div class="text-dark-4 text-xs mt-1">
            {{ notification.description }}
          </div>
          <div
            v-if="notification.linkText"
            class="text-xs text-lilac mt-2 font-semibold"
            @click="handleCardClick"
          >
            <span class="cursor-pointer"><i18n>Learn more</i18n></span>
          </div>
        </div>
        <div class="basis-2/12  text-dark-3 basis">
          <div class="text-xxs font-normal text-dark-4 text-right">
            {{ getTime }}
          </div>
          <div
            v-if="notification.dismissible"
            class="float-right mt-3"
          >
            <button
              class="cursor-pointer text-dark-3 invisible group-hover:visible  rounded-full flex items-center justify-center w-4 h-4"
              :class="notification.viewed ? 'bg-light-1' : 'bg-lilac-10%'"
              @click="handleDismiss"
            >
              <FA
                :size="13"
                icon="far fa-times"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    ref="root"
    :data-index="index"
    :data-id="notification.id"
    :data-viewed="notification.viewed"
    class="flex items-center w-full px-4 pb-4 group border-b-width border-dark-10% border-b-dark-10%"
    :class="notification.viewed ? 'bg-dark-2%' : 'bg-banner'"
  >
    <div class="basis-2/12">
      <img
        :src="notification.imageUrl"
        class="w-10 h-10 rounded-full objet-cover flex-grow-1"
        aria-hidden="true"
      />
    </div>
    <div
      id="notification-message"
      class="text-dark text-xs ml-4 mt-4 basis-8/12"
    >
      <div class="text-sm font-semibold">
        {{ notification.title }}
      </div>
      <div class="text-dark-4 text-xs mt-1">
        {{ notification.description }}
      </div>
      <div
        v-if="notification.linkText"
        class="text-xs text-lilac mt-2 font-semibold"
        @click="handleCardClick"
      >
        <span class="cursor-pointer"><i18n>Learn more</i18n></span>
      </div>
    </div>
    <div class="basis-2/12 cursor-pointer text-dark-3">
      <div class="text-xxs font-normal text-dark-4 text-right">
        {{ getTime }}
      </div>
      <div
        v-if="notification.dismissible"
        class="float-right mt-3"
      >
        <button
          class="cursor-pointer text-dark-3 invisible group-hover:visible  rounded-full flex items-center justify-center w-4 h-4"
          :class="notification.viewed ? 'bg-light-1' : 'bg-lilac-10%'"
          @click="handleDismiss"
        >
          <FA
            :size="13"
            icon="far fa-times"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

export default {
  props: {
    notification: {
      type: Object,
      require: true,
      default: () => {},
    },

    notificationGroup: {
      type: String,
      default: '',
    },
    index: {
      type: Number,
      default: 0,
    },

    observer: {
      type: typeof window === 'undefined' ? Object : IntersectionObserver,
      default: () => null,
    },
  },
  emits: ['markOneNotificationAsRead', 'handleDeleteNotification'],

  computed: {
    showForBanner() {
      return this.notification.Y === 'ab-banner';
    },

    showForCaptionedImage() {
      return this.notification.Y === 'ab-captioned-image';
    },

    getTime() {
      const timeText = this.$dayjs(this.notification.updated).fromNow(true);
      if (timeText.includes('a few seconds')) {
        return this.$i18n('now');
      } if (timeText.includes('a minute')) {
        return this.$i18n('1m');
      } if (timeText.includes('minutes')) {
        return timeText.replace('minutes', 'm');
      } if (timeText.includes('an hour')) {
        return this.$i18n('1h');
      } if (timeText.includes('hours')) {
        return timeText.replace('hours', 'h');
      } if (timeText.includes('a day')) {
        return this.$i18n('1d');
      } if (timeText.includes('days')) {
        return timeText.replace('days', 'd');
      } if (timeText.includes('a month')) {
        return this.$i18n('1mon');
      } if (timeText.includes('months')) {
        return timeText.replace('months', 'mon');
      }

      return timeText;
    },
  },

  mounted() {
    if (this.observer) {
      this.observer.observe(this.$refs.root);
    }
  },

  methods: {
    getPrimaryNotificationImage(notification) {
      if (notification.category === 'user') {
        return notification.images.primary;
      } if (notification.category === 'marketing') {
        return 'https://cf.quizizz.com/img/notification/mktg.png';
      } if (notification.category === 'system') {
        switch (notification.kind) {
          case 'game-expired':
            return 'https://cf.quizizz.com/img/notification/homework-game.png';
          case 'quiz-played':
            return 'https://cf.quizizz.com/img/notification/players.png';
          default:
            return 'https://cf.quizizz.com/img/notification/team-quizizz.png';
        }
      }
      return 'https://cf.quizizz.com/img/notification/team-quizizz.png';
    },

    handleCardClick() {
      this.$emit('markOneNotificationAsRead', this.notification, this.index);
    },

    handleDismiss() {
      this.$emit('handleDeleteNotification', this.notification);
    },
  },
};
</script>

<style lang="scss">
  #notification-message {
      strong {
      font-weight: 600;
    }
  }

  .border-b-width {
    border-bottom-width: 0.5px;
  }

  .bg-banner{
    background-color: #F4F0F8;
;
  }
</style>

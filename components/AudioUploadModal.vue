<template>
  <Modal
    icon="fas fa-microphone-alt"
    :title="$i18n('Insert an audio clip')"
    :subtitle="$i18n('You can upload an MP3 file or record yourself')"
    :shouldCloseOnMaskClick="true"
    dismissOnOverlayClick
    :button1="{
      type: 'other',
      title: $i18n('Cancel'),
    }"
    :button2="{
      type: 'primary',
      title: $i18n('Insert'),
      disabled: (!hasUploaded && !hasRecorded) || isUploading,
    }"
    :stickToBottom="isStuckToBottom"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="handleSaveBtn"
  >
    <AudioUpload
      ref="audioUpload"
      :media="media"
      @uploaded="handleUploaded"
      @recorded="handleRecorded"
      @clear="handleClear"
    />
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    media: {
      type: Object,
      default() {
        return {
          url: '',
          meta: {
            width: 0,
            height: 0,
            layout: '',
          },
        };
      },
    },

    showMobileLayout: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'save'],

  data() {
    return {
      hasRecorded: false,
      hasUploaded: !!this.media.url,
      mediaObj: this.media,
      settingFocusElementTimeout: null,
      isUploading: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    isStuckToBottom() {
      return this.showMobileLayout && !this.isDesktop;
    },
  },

  beforeUnmount() {
    this.settingFocusElementTimeout && clearTimeout(this.settingFocusElementTimeout);
  },

  methods: {
    handleRecorded() {
      this.hasRecorded = true;
    },

    handleUploaded(media) {
      this.hasUploaded = true;
      this.mediaObj = media;
    },

    async handleSaveBtn() {
      if (this.hasRecorded) {
        this.isUploading = true;
        await this.$refs.audioUpload.upload();
        this.isUploading = false;
        this.$emit('save', this.mediaObj);
      }
    },

    handleClear() {
      this.hasRecorded = false;
      this.hasUploaded = false;
      this.mediaObj = {
        url: '',
        meta: {
          width: 0,
          height: 0,
          layout: '',
        },
      };
    },
  },
};
</script>

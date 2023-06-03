<template>
  <div>
    <div
      class="bg-light-2 border border-dashed border-dark-10% relative h-50 flex justify-center items-center"
      @drop="handleInput($event, true)"
      @dragover.prevent
      @drop.prevent
    >
      <div
        v-if="!hasRecorded"
        class="flex flex-col justify-center items-center"
      >
        <Button
          v-if="!isRecording"
          ref="start-record-button"
          type="primary"
          size="lg"
          licon="far fa-microphone-alt"
          :title="$i18n('Record')"
          @click="startRecording"
        />

        <Button
          v-if="isRecording"
          type="primary"
          size="lg"
          licon="far fa-stop-circle"
          :title="$i18n('Stop Recording')"
          @click="stopRecording"
        />
        <div
          v-if="!isRecording"
          class="text-xs text-dark-4 mt-4 text-center"
        >
          <i18n>Click here to record audio</i18n>
          <br />
          <i18n>(up to 3 minutes)</i18n>
        </div>
        <div
          v-else
          class="text-xs text-dark-4 mt-4 text-center"
        >
          {{ secDisplay }}/3:00
        </div>
        <div class="absolute bottom-0 w-full flex justify-end p-2">
          <div class="relative">
            <input
              ref="fileInput"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              type="file"
              accept=".mp3"
              @input="handleInput"
            />
            <Button
              v-if="!isRecording"
              class="z-11"
              type="white"
              size="sm"
              :title="$i18n('Upload MP3')"
              licon="far fa-file-upload"
              @click="$refs.fileInput.click()"
            />
          </div>
        </div>
      </div>
      <div
        v-else-if="!hasUploaded"
        class="w-full h-full"
      >
        <div class="absolute right-1 top-1 z-100">
          <button
            class="bg-light-3 w-8 h-8 rounded border border-dark-10% mr-1"
            @click="handlePlay"
          >
            <FA
              class="text-dark-1"
              :icon="`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`"
              :size="12"
            />
          </button>
          <button
            class="bg-red-faded w-8 h-8 rounded-sm"
            @click="handleDelete"
          >
            <FA
              class="text-red-dark"
              icon="fas fa-trash-alt"
              :size="14"
            />
          </button>
        </div>
        <AudioSurfer
          ref="audioSurfer"
          :blob="audioBlob"
        />
      </div>
      <div
        v-else
        class="bg-dark-1 w-full h-full flex justify-center items-center"
      >
        <MediaAudio
          :src="url"
          class="transform scale-75"
        />
        <div class="absolute right-1 top-1 z-100">
          <button
            class="bg-red-faded w-8 h-8 rounded-sm"
            @click="handleDelete"
          >
            <FA
              class="text-red-dark"
              icon="fas fa-trash-alt"
              :size="14"
            />
          </button>
        </div>
      </div>
      <div
        v-if="isUploading"
        class="absolute inset-0 bg-dark-50% flex justify-center items-center z-50"
      >
        <FA
          icon="far fa-sync"
          :size="40"
          class="text-light-3 animate-spin"
        />
      </div>
    </div>
    <div
      v-if="microphoneNotFound"
      class="text-xs text-red-light font-semibold m-1"
      aria-live="assertive"
    >
      <FA
        class="mr-1"
        icon="far fa-exclamation-circle"
        :size="11"
      />
      <i18n>Cannot detect a microphone.</i18n>
      <a
        class="underline cursor-pointer"
        tabindex="0"
        :aria-label="$i18n('Click here to retry giving permissions')"
        @click.prevent="checkMicrophone"
        @keydown.enter.space="checkMicrophone"
      >
        <i18n>Click here</i18n>
      </a>
      <i18n>to retry giving permissions.</i18n>
    </div>
    <div
      v-else-if="!!error"
      class="text-xs text-red-light font-semibold m-1"
    >
      <FA
        class="mr-1"
        icon="far fa-exclamation-circle"
        :size="11"
      />
      {{ error }}
    </div>
  </div>
</template>

<script>
import AudioRecordingService, { setup } from '~/services/AudioRecordingService.js';

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
  },
  emits: ['recorded', 'clear', 'uploaded'],

  data() {
    return {
      isRecording: false,
      hasRecorded: !!this.media.url,
      hasUploaded: !!this.media.url,
      recordingTimer: null,
      secs: 0,
      audioBlob: null,
      isPlaying: false,
      isUploading: false,
      url: this.media.url,
      error: '',
      microphoneNotFound: false,
      audioRecorder: null,
    };
  },

  computed: {
    secDisplay() {
      return this.$stringUtils.humanizeSeconds(this.secs);
    },
  },

  async mounted() {
    await setup();
  },
  methods: {
    async startRecording() {
      this.error = '';
      try {
        if (!this.audioRecorder) {
          this.audioRecorder = new AudioRecordingService();
        }
        await this.audioRecorder.startRecording();
        this.microphoneNotFound = false;
        this.isRecording = true;
        this.startTimer();
      } catch (err) {
        this.microphoneNotFound = true;
      }
    },

    stopRecordingCallback(blob) {
      this.audioBlob = blob;
      this.isRecording = false;
      this.hasRecorded = true;
      this.$emit('recorded');
      this.stopTimer();
    },

    stopRecording() {
      if (this.isRecording) {
        this.audioRecorder.stopRecording(this.stopRecordingCallback);
      }
    },

    async checkMicrophone() {
      this.microphoneNotFound = false;
      try {
        if (!this.audioRecorder) {
          this.audioRecorder = new AudioRecordingService();
        }
        await this.audioRecorder.tryToDetectMicrophone();
      } catch (err) {
        this.microphoneNotFound = true;
      }
    },

    startTimer() {
      this.recordingTimer = setInterval(() => {
        this.secs += 1;
        if (this.secs === 180) {
          this.stopRecording();
        }
      }, 1000);
    },

    stopTimer() {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    },
    handleDelete() {
      this.isRecording = false;
      this.hasRecorded = false;
      this.hasUploaded = false;
      this.url = '';
      this.recordingTimer = null;
      this.secs = 0;
      this.audioBlob = null;
      this.isPlaying = false;
      if (this.$refs.audioSurfer) { this.$refs.audioSurfer.stop(); }

      this.$emit('clear');
    },

    handlePlay() {
      this.isPlaying = !this.isPlaying;
      this.$refs.audioSurfer.togglePlayPause();
    },
    async upload() {
      if (this.audioBlob) {
        try {
          this.isUploading = true;
          this.url = await this.$fileUpload.uploadFileToS3(this.audioBlob, {
            destination: 'audioQuestions',
            folder: '_audio',
            metadata: {
              'Content-Type': 'audio/mpeg',
            },
          });
          this.isUploading = false;
          this.$emit('uploaded', {
            type: 'audio',
            url: this.url,
          });
          this.hasUploaded = true;
        } catch (err) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Something went wrong while uploading the audio!'),
          });
        }
      } else {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('No audio recorded!'),
        });
      }
    },

    handleInput(ev, isDragDrop) {
      this.error = '';
      this.audioBlob = isDragDrop ? ev.dataTransfer.files[0] : ev.target.files[0];
      if (!this.audioBlob.name.includes('.mp3')) {
        return;
      }
      if (this.$fileUpload.doesFileExceed5MB(this.audioBlob)) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('File size should not exceed 5MB'),
        });
        this.error = 'File size should not exceed 5MB!';
        this.$refs.fileInput.value = '';
        return;
      }

      this.hasRecorded = true;
      this.$emit('recorded');
    },
  },
};
</script>

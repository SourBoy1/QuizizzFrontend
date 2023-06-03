<template>
  <div class="google-drive-video-manager mb-2">
    <div
      v-show="shouldShowGoogleDriveActions"
      class="grid grid-cols-2 gap-2"
    >
      <GoogleDrivePicker
        ref="drivePicker"
        accept="video/mp4,video/webm,video/ogg"
        :exportToPdf="false"
        size="xs"
        :quizId="quizId"
        :scopes="scopes"
        checkIfPublic
        :fileSizeLimit="100"
        @visibility="setFileVisibility"
        @picked="handleGoogleDriveSelection"
        @pickerFailed="handlePickerFailure"
      />
      <div class="w-full flex justify-center items-center relative p-1 border-1 border-dark-6 rounded-md">
        <div class="absolute text-center text-xs font-semibold z-0">
          <FA
            icon="far fa-cloud-upload"
            class="mr-2"
            :size="14"
          />
          <i18n>Upload to Google Drive</i18n>
        </div>
        <input
          ref="upload-input"
          class="cursor-pointer absolute left-0 top-0 h-full w-full z-5 opacity-0"
          type="file"
          accept="video/mp4"
          @input="handleFileUpload"
        />
        <div
          class="absolute left-0 h-full w-full cursor-pointer z-10"
          @click="triggerInput"
        />
        <div class="absolute right-0 h-full w-fit flex items-center">
          <FA
            v-tooltip.right="$i18n('Files will be uploaded to your <br/> Google Drive and imported from <br/> there')"
            class="pr-2 z-11 text-dark-5"
            icon="far fa-info-circle"
            :size="16"
          />
        </div>
      </div>
    </div>
    <div
      v-if="fileId || isUploadInProgress"
      class="relative flex flex-col items-center w-full h-60 mt-2 justify-center bg-light-2 border border-dark-6 rounded-lg text-dark-4 text-xs"
    >
      <button
        v-if="!isUploadInProgress && isFilePublic && isDesktop"
        class="absolute rounded right-2 top-2 bg-red-faded h-8 w-8 z-10"
        @click="deleteCurrentVideo"
      >
        <FA
          icon="far fa-trash-alt"
          class="text-red"
          :size="16"
        />
      </button>
      <div
        v-if="fileId"
        :key="isFilePublic + fileVisibility"
        class="relative flex justify-center w-full h-60 text-center text-dark-2 text-sm overflow-hidden"
      >
        <video
          v-if="isFilePublic"
          ref="video"
          controls
          playsinline
          @blur="pauseVideo"
        >
          <source
            :src="`https://drive.google.com/uc?export=download&id=${fileId}`"
            :type="fileMimeType"
          >
        </video>
        <div
          v-else
          class="h-full w-full px-14 py-6 relative"
        >
          <div
            class="flex flex-col relative z-5 h-full w-full md:w-2/5"
            :class="{
              'justify-evenly': fileVisibility === 'private',
              'justify-center': fileVisibility === 'error',
            }"
          >
            <div class="text-dark-2 text-left font-bold mb-2">
              <i18n v-if="fileVisibility === 'private'">
                This video is restricted
              </i18n>
              <i18n v-else-if="fileVisibility === 'error'">
                We cannot access this video
              </i18n>
            </div>
            <div class="text-xs text-left text-dark-2 tracking-tight font-normal mb-2">
              <i18n v-if="fileVisibility === 'private'">
                Make it publicly accessible so we can insert it to this quiz/lesson for you.
              </i18n>
              <i18n v-if="fileVisibility === 'error'">
                You'll have to reach out to the owner and ask them to make the video public
              </i18n>
            </div>
            <Button
              v-if="fileVisibility === 'private'"
              v-tooltip.bottom="$i18n('Anyone with link will be able to access the video')"
              :title="$i18n('Make publicly accessible')"
              type="secondary"
              licon="far fa-globe-americas"
              :loading="fileVisibilityChangeInProgress"
              class="my-2"
              @click="makeFilePublic"
            />
            <Button
              v-else-if="fileVisibility === 'error'"
              :title="$i18n('Open in drive')"
              type="secondary"
              licon="far fa-external-link"
              :loading="fileVisibilityChangeInProgress"
              class="my-2"
              @click="redirectToUsersDrive"
            />
            <div
              v-if="fileVisibility === 'private'"
              class="text-xxs text-dark-3 font-normal italic"
            >
              <i18n>Anyone with the link can see the video, even if your quiz is private.</i18n>
            </div>
          </div>

          <div class="absolute z-0 right-0 bottom-0 hidden md:block">
            <img
              class="w-55 h-55"
              src="https://cf.quizizz.com/img/editor/driveError.png"
              alt="man-waving"
            />
          </div>
        </div>
      </div>
      <div
        v-if="isUploadInProgress"
        class="flex flex-col items-center w-90"
      >
        <ProgressBar
          class="my-2"
          :currentValue="current"
          :maxValue="maxValue"
        />
        <div><i18n>Uploading to Google drive</i18n></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import GoogleDriveService from '~/services/apis/GoogleDriveService';

const GOOGLE_CLIENT_ID = '58172892053-hh2k290hilpi3edodu8lrv3cag3pop0f.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyD0xyjgp01kEzXr4aSfvQh5ikHMyfyUbyg';
export default {
  props: {
    quizId: {
      type: String,
      default: null,
    },
    media: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['input', 'visibility', 'delete', 'progress'],

  data() {
    return {
      oauthToken: null,
      file: null,
      scopes: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
      maxValue: null,
      current: null,
      isUploadingToDrive: false,
      isUploadInProgress: false,
      isUploadedToGoogleDrive: false,
      fileId: null,
      fileVisibility: null,
      fileVisibilityChangeInProgress: false,
      fileMimeType: 'video/mp4',
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    clientId() {
      return GOOGLE_CLIENT_ID;
    },

    apiKey() {
      return GOOGLE_API_KEY;
    },

    isEditMode() {
      return this.media?.meta?.src === 'google-drive';
    },

    isFilePublic() {
      return this.fileVisibility === 'public' || this.fileVisibility === null;
    },

    shouldShowGoogleDriveActions() {
      if (this.fileId || this.file) {
        return false;
      }

      return true;
    },
  },

  mounted() {
    if (this.isEditMode) {
      this.fileId = this.media.video;
    }
  },

  methods: {
    async handleGoogleDriveSelection(fileId, mimeType = 'video/mp4', isUploaded) {
      const mediaObj = {
        type: 'video',
        video: fileId,
        meta: {
          src: 'google-drive',
          type: this.file?.type ?? mimeType,
        },
      };

      this.fileId = fileId;
      this.fileMimeType = mimeType;

      if (isUploaded) {
        await this.$refs?.drivePicker?.makeFilePublic(fileId);
      }

      this.$analytics.logEvent(this.$webEvents.DRIVE_VIDEO_SAVE, {
        quizId: this.quizId,
        type: isUploaded ? 'upload' : 'import',
        error: null,
      });

      this.$emit('input', mediaObj);
    },

    setAuthToken(token) {
      this?.$refs?.drivePicker?.setToken(token);
      this.oauthToken = token;
    },

    handleFileUpload(event) {
      this.$analytics.logEvent(this.$webEvents.DRIVE_VIDEO_INIT, {
        quizId: this.quizId,
        type: 'upload',
      });

      this.file = event.target.files[0];

      if (this.file && this.file.size > 100 * 1000000) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: `${this.$i18n('Only files under ')}100${this.$i18n('MB are allowed')}`,
        });
        this.file = null;
        return;
      }

      if (!window.gapi) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Please enable popups or refresh the page'),
        });
        return;
      }

      window.gapi.load('auth2', this.onAuthLoad);
    },

    onAuthLoad() {
      window.gapi.auth2.authorize(
        {
          client_id: this.clientId,
          scope: this.scopes,
          immediate: false,
        },
        this.handleAuthResult,
      );
    },

    setFileVisibility(visiblity) {
      this.$emit('visibility', visiblity);
      this.fileVisibility = visiblity;
    },

    pauseVideo() {
      this.$nextTick(() => {
        this.$refs.video?.pause();
      });
    },

    deleteCurrentVideo() {
      this.$emit('delete');
      this.fileId = null;
      this.file = null;
    },

    triggerInput() {
      this.$refs?.['upload-input']?.click();
    },

    redirectToUsersDrive() {
      window.open('https://drive.google.com/drive/my-drive', '_blank');
    },

    async handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        this.setAuthToken(authResult.access_token);
        await this.initiateUpload();
      }
    },

    async makeFilePublic() {
      this.fileVisibilityChangeInProgress = true;
      await this.$refs.drivePicker.makeFilePublic(this.fileId);
      this.fileVisibilityChangeInProgress = false;
    },

    async initiateUpload() {
      this.fileVisibility = null;
      this.isUploadingToDrive = true;
      this.$emit('progress', true);

      const response = await GoogleDriveService.uploadFile({
        file: this.file,
        config: {
          headers: {
            Authorization: `Bearer ${this.oauthToken}`,
          },
          onUploadProgress: (event) => {
            this.maxValue = event.total;
            this.current = event.loaded;
            this.isUploadInProgress = true;
          },
        },
      });

      this.isUploadInProgress = false;
      this.isUploadingToDrive = false;

      if (response.success) {
        this.isUploadedToGoogleDrive = true;
        this.$toasts.add({
          type: this.$constants.ToastTypes.SUCCESS,
          icon: 'fas fa-check-circle',
          title: this.$i18n('Upload successful! Click on insert to continue'),
        });
      } else {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Upload failed'),
        });
      }

      this.handleGoogleDriveSelection(response.data.id, this.file?.mimeType, true);
      this.$emit('progress', false);
    },

    handlePickerFailure() {
      this.fileId = null;
      this.file = null;
    },
  },
};
</script>

<style lang="scss" scoped>
#file-upload-button {
  cursor: pointer !important;
}
</style>

<template>
  <button
    class="flex items-center justify-center p-3 border rounded-lg border-dark-6 text-dark-2"
    @click="loadPicker"
  >
    <img
      v-if="!loading"
      :class="imgStyles"
      src="https://cf.quizizz.com/img/logos/googleDrive.png"
      alt="google drive icon"
    />
    <FA
      v-else
      :size="16"
      icon="far fa-sync"
      class="animate-spin"
    />
    <span :class="textStyles">
      <i18n>Import from Google Drive</i18n>
    </span>
  </button>
</template>

<script lang="ts">
import GoogleDriveService from '~/services/apis/GoogleDriveService';
import { browserOS } from '~/utils/Utilities';

const GOOGLE_CLIENT_ID = '58172892053-hh2k290hilpi3edodu8lrv3cag3pop0f.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyD0xyjgp01kEzXr4aSfvQh5ikHMyfyUbyg';
export default {
  props: {
    accept: {
      type: String,
      default: 'application/vnd.ms-powerpoint,application/vnd.google-apps.presentation,application/pdf',
    },

    multiselect: {
      type: Boolean,
      default: false,
    },

    exportToPdf: {
      type: Boolean,
      default: true,
    },

    size: {
      type: String,
      default: 'md',
    },

    scopes: {
      type: String,
      default: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
    },

    checkIfPublic: {
      type: Boolean,
      default: false,
    },

    quizId: {
      type: String,
      default: null,
    },

    // ! in mb
    fileSizeLimit: {
      type: Number,
      default: null,
    },
  },
  emits: ['click', 'token', 'pickerFailed', 'visibility', 'chosen', 'picked', 'input'],

  data() {
    return {
      loading: false,
      pickerLoaded: false,
      oauthToken: null,
      isPickerActivated: false,
      gisInited: false,
      tokenClient: null,
    };
  },

  head: {
    script: [
      {
        src: 'https://apis.google.com/js/api.js',
      },
      {
        src: 'https://accounts.google.com/gsi/client',
      },
    ],
  },

  computed: {
    textStyles() {
      let classes = 'font-semibold text-dark-2 mx-2 ';

      switch (this.size) {
        case 'xs':
          classes += 'text-sm ';
          break;
        case 'sm':
          classes += 'text-sm ';
          break;
        case 'md':
          classes += 'text-base ';
          break;
        default: break;
      }

      return classes;
    },

    imgStyles() {
      switch (this.size) {
        case 'xs':
          return 'h-4 w-4';
        case 'sm':
          return 'h-5 w-5';
        case 'md':
          return 'h-6 w-6';
        default: break;
      }

      return '';
    },

    isOSMac() {
      return browserOS().isMac;
    },

    shortcutMetaKey() {
      return this.isOSMac ? '\u2318' : 'ctrl';
    },

    isUserGoogleAuth() {
      return this.$user && this.$user.google;
    },

    query() {
      return this.$urlUtils.parse(window.location.href).query;
    },

    appId() {
      if (import.meta.env.VITE_NODE_ENV === this.$constants.NodeEnvs.DEV) {
        return 'quizizz-dev';
      }

      return 'quizizz';
    },

    clientId() {
      return GOOGLE_CLIENT_ID;
    },

    apiKey() {
      return GOOGLE_API_KEY;
    },
  },

  methods: {
    loadPicker() {
      if (this.isPickerActivated) {
        return;
      }
      this.isPickerActivated = true;

      this.$analytics.logEvent(this.$webEvents.DRIVE_VIDEO_INIT, {
        quizId: this.quizId,
        type: 'import',
      });

      this.$emit('click');

      if (!window.gapi || !window.google) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Please refresh the page to enable google drive'),
        });
        return;
      }

      this.isPickerActivated = false;
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes,
        callback: this.handleAuthResult, // defined later
      });
      if (!this.oauthToken) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
      this.gisInited = true;
    },

    async handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        this.oauthToken = authResult.access_token;
        this.$emit('token', authResult.access_token);
        window.gapi.load('picker', {
          callback: this.handlePickerLoad,
          onerror: () => {
            this.$toasts.add({
              type: this.$constants.ToastTypes.ERROR,
              icon: 'fas fa-times-circle',
              title: this.$i18n('Please enable pop ups for Quizizz.com'),
              time: 5000,
            });
            this.$emit('pickerFailed');
          },
        });
        this.createPicker();
      }
    },

    setToken(token) {
      this.oauthToken = token;
    },

    handlePickerLoad() {
      this.pickerLoaded = true;
    },

    createPicker() {
      if (this.pickerLoaded) {
        const { google } = window;
        const view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes(this.accept);
        let picker;

        if (this.multiselect) {
          picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setAppId(this.appId)
            .setOAuthToken(this.oauthToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setTitle(`${this.$i18n('Hold')} ${this.shortcutMetaKey} ${this.$i18n('and click, to select multiple files')}`)
            .setDeveloperKey(this.apiKey)
            .setCallback(this.afterFilePick)
            .build();
        } else {
          picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .setAppId(this.appId)
            .setOAuthToken(this.oauthToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setDeveloperKey(this.apiKey)
            .setCallback(this.afterFilePick)
            .build();
        }

        picker.setVisible(true);
      }
    },

    async isFilePublic(fileId) {
      const permissions = await GoogleDriveService.listPermissions(fileId, this.oauthToken, this.apiKey);

      if (!permissions.success || !permissions.data?.permissions) {
        this.$emit('visibility', 'error');
        return;
      }

      for (const permission of permissions.data.permissions) {
        if (permission.type === 'anyone' || permission.id === 'anyoneWithLink') {
          this.$emit('visibility', 'public');
          return;
        }
      }

      this.$emit('visibility', 'private');
    },

    async makeFilePublic(fileId) {
      const response = await GoogleDriveService.createPermission(fileId, this.oauthToken, this.apiKey, {
        role: this.$constants.GoogleDrivePermissions.Role.WRITER,
        type: this.$constants.GoogleDrivePermissions.Type.ANYONE,
      });

      if (response.success) {
        this.$emit('visibility', 'public');
        return;
      }
      this.$emit('visibility', 'error');
    },

    async afterFilePick(data) {
      if (data.action === window.google.picker.Action.PICKED) {
        this.loading = true;

        if (this.multiselect) {
          this.$emit('chosen', data.docs);
          this.loading = false;
          return;
        }

        const fileId = data.docs[0].id;
        const { mimeType } = data.docs[0];
        const byteSize = data.docs[0].sizeBytes;

        if (this.fileSizeLimit && byteSize && byteSize > this.fileSizeLimit * 1000000) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: `${this.$i18n('Only files under')} ${this.fileSizeLimit}${this.$i18n('MB are allowed')}`,
          });
          this.loading = false;
          return;
        }

        if (this.checkIfPublic) {
          await this.isFilePublic(fileId);
        }

        this.$emit('picked', fileId, mimeType);

        if (!this.exportToPdf) {
          this.loading = false;
          return;
        }

        let response = {};
        if (mimeType === 'application/pdf') {
          response = await GoogleDriveService.getFile({
            token: this.oauthToken,
            fileId,
            apiKey: this.apiKey,
          });

          if (!response.success) {
            this.loading = false;
            this.$toasts.add({
              type: this.$constants.ToastTypes.ERROR,
              icon: 'fas fa-times-circle',
              title: this.$i18n('Unable to access the file'),
            });
            return;
          }
        } else {
          response = await GoogleDriveService.exportFile({
            token: this.oauthToken,
            fileId,
            apiKey: this.apiKey,
          });
        }

        if (response.success) {
          const filename = 'slides.pdf';
          const { data } = response;

          const blob = new Blob([data], { type: 'application/pdf' });
          const file = new File([blob], filename, { type: 'application/pdf' });

          this.$emit('input', file);
          this.loading = false;

          return;
        }
        this.loading = false;
        let errorCopy = this.$i18n('Something went wrong while uploading the file!');
        if (response.error.status === 404) {
          errorCopy = this.$i18n('Please make sure to give public access to the slide');
        } else if (response.error.status === 403) {
          errorCopy = this.$i18n('File is too large to import');
        }

        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: errorCopy,
        });
      }
    },
  },
};
</script>

<style lang="scss">
.picker-dialog-bg {
    z-index: 20000 !important;
}

.picker-dialog {
    z-index: 20001 !important;
}
</style>

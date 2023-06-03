import GoogleDriveService from '~/services/apis/GoogleDriveService';

const GOOGLE_CLIENT_ID = '58172892053-hh2k290hilpi3edodu8lrv3cag3pop0f.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyD0xyjgp01kEzXr4aSfvQh5ikHMyfyUbyg';

const SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';

export default {
  data() {
    return {
      googleOAuthToken: null,
      isFileUploadInProgress: false,

      // total file progress tracking
      filesUploaded: 0,
      totalFilesToUpload: 0,
    };
  },

  head: {
    script: [
      {
        src: 'https://apis.google.com/js/api.js',
      },
    ],
  },

  computed: {
    clientId() {
      return GOOGLE_CLIENT_ID;
    },

    apiKey() {
      return GOOGLE_API_KEY;
    },

    scopes() {
      return SCOPES;
    },
  },

  methods: {
    googleDriveAuthInit() {
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

    async handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        this.googleOAuthToken = authResult.access_token;
        await this.uploadFilesToDrive(this.filesToUploadToDrive);
      }
    },

    async uploadFilesToDrive(fileList = []) {
      this.isFileUploadInProgress = true;
      this.totalFilesToUpload = fileList.length;
      const files = Array.from(fileList);
      const postUploadFileData = [];
      const postFailureFiles = [];
      for (const file of files) {
        const response = await GoogleDriveService.uploadFile({
          file,
          config: {
            headers: {
              Authorization: `Bearer ${this.googleOAuthToken}`,
            },
          },
        });

        if (response.success) {
          this.filesUploaded += 1;
          postUploadFileData.push({ ...response.data, name: file.name });
        } else {
          postFailureFiles.push(file);
        }
      }

      // define this function to process upload
      await this.postDriveFileUpload(postUploadFileData, postFailureFiles);
      this.isFileUploadInProgress = false;
    },
  },
};

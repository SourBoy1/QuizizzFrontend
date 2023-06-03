<template>
  <div
    v-if="isDesktop"
    class="flex flex-col"
  >
    <div class="image-container relative  gap-3 flex flex-col w-60 bg-light-2 items-center justify-center rounded-lg">
      <div
        v-if="!isMediaImageVisible"
        class="w-52 flex flex-col gap-4"
      >
        <button
          :aria-label="$i18n('Image icon')"
          class="w-52 h-52 flex flex-col gap-3 bg-light-3 border-dashed border-1 border-dark-5 items-center justify-center rounded"
          :class="isUploading ? 'pointer-events-none' : ''"
          @click="$emit('toggleImageModal')"
        >
          <FA
            icon="fas fa-image"
            :size="24"
            class="text-dark-5"
          />
          <span class="text-xs text-dark-5"><i18n>Add a cover image</i18n></span>
        </button>
        <div class="flex gap-2">
          <Button
            buttonClasses="flex-1"
            size="xs"
            type="other"
            licon="fas fa-search"
            :title="$i18n('Search')"
            :disabled="isUploading"
            @click="$emit('toggleImageModal')"
          />
          <Button
            buttonClasses="flex-1"
            size="xs"
            type="other"
            :licon="isUploading ? 'fas fa-spinner' : 'fas fa-upload'"
            :title="$i18n('Upload')"
            :loading="isUploading"
            @click="handleImgUpload"
          />
        </div>
      </div>
      <button
        v-if="isMediaImageVisible"
        :aria-label="$i18n('Delete')"
        class="bg-red-faded flex items-center justify-center z-20 w-6 h-6 rounded-sm absolute right-4 bottom-4"
        @click="$emit('imageDelete')"
      >
        <FA
          class="text-red-dark"
          icon="fas fa-trash-alt"
          :size="11"
        />
      </button>

      <button
        v-if="isMediaImageVisible"
        :aria-label="$i18n('Crop')"
        class="absolute flex gap-1.5 items-center justify-center w-17 h-6 rounded bg-dark-50% z-10 top-4 right-4"
        @click="$emit('toggleCropModeOnImgModal')"
      >
        <FA
          icon="far fa-crop"
          class="text-light-3"
          :size="11"
        />
        <span class="text-light-3 text-xs"><i18n>Crop</i18n></span>
      </button>
      <div
        v-if="isMediaImageVisible"
        class="h-52 max-w-52 w-52 relative rounded cursor-pointer"
        @click="$emit('toggleImageModal')"
      >
        <img
          :src="mediaObj.url"
          class="object-contain w-full h-full"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col gap-2"
  >
    <span class="text-xs font-semibold text-dark-4"><i18n>Cover image</i18n></span>
    <div
      v-if="!isMediaImageVisible"
      class="flex w-full max-w-100 mt-0.5"
    >
      <button
        :aria-label="$i18n('Image icon')"
        class="h-38 mr-2 w-full flex flex-col gap-3 bg-light-3 border-dashed border-1 border-dark-5 items-center justify-center rounded"
        @click="$emit('googleSearch')"
      >
        <FA
          icon="fas fa-image"
          :size="28"
          class="text-dark-5"
        />
      </button>
    </div>
    <div
      v-if="!isMediaImageVisible"
      class="flex gap-2 mt-1"
    >
      <Button
        type="other"
        class="w-1/2"
        :aria-label="$i18n('Search using Google')"
        :title="$i18n('Search using Google')"
        licon="fas fa-search"
        @click="$emit('googleSearch')"
      />
      <Button
        type="other"
        class="w-1/2"
        :aria-label="$i18n('Upload')"
        :title="$i18n('Upload')"
        licon="fas fa-upload"
        :loading="isUploading"
        @click="handleImgUpload"
      />
    </div>
    <div class="flex gap-2">
      <img
        v-if="isMediaImageVisible"
        :src="mediaObj.url"
        class="uploaded-image object-contain rounded"
      />
      <button
        v-if="isMediaImageVisible"
        :aria-label="$i18n('Delete')"
        class="bg-red-faded flex items-center justify-center items-start w-6 h-6 rounded-sm"
        @click="$emit('imageDelete')"
      >
        <FA
          class="text-red-dark"
          icon="fas fa-trash-alt"
          :size="11"
        />
      </button>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    mediaObj: {
      type: Object,
      default: () => ({}),
    },
    isMediaImageVisible: {
      type: Boolean,
      default: false,
    },
    isQuizNameChangedUsingHeaderInput: {
      type: Boolean,
      default: false,
    },
    isDesktop: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['toggleImageModal', 'imageDelete', 'toggleCropModeOnImgModal', 'googleSearch', 'uploadFailed', 'manualImageUpload'],

  data() {
    return {
      isUploading: false,
    };
  },

  mounted() {
    if (this.isQuizNameChangedUsingHeaderInput) {
      this.$store.dispatch('contentEditor/setIsQuizNameChangedUsingHeaderInput', false);
    }
  },

  methods: {

    handleImgUpload() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg, image/jpg';
      input.onchange = async (ev) => {
        const file = ev.target.files[0];
        if (ev.target.files.length === 0) { return; }

        if (!file.type.includes('image')) {
          this.uploadError = 'This is not a valid image!';
          return;
        }

        if (ev.target.value !== undefined && ev.target.value !== '') {
          if (this.$fileUpload.doesFileExceed5MB(file)) {
            this.$toasts.add({
              type: this.$constants.ToastTypes.ERROR,
              icon: 'fas fa-times-circle',
              title: this.$i18n('File size should not exceed 5MB'),
            });
            this.uploadError = 'File size should not exceed 5MB!';
            this.$refs.fileInput.value = '';
            return;
          }
        }

        this.isUploading = true;
        let url = '';
        try {
          const response = await this.$fileUpload.uploadFileToS3(file, {
            destination: this.$constants.ImageUploadTypes.QUIZZES,
            validateUpload: true,
          });
          url = response;
          input.value = '';
        } catch (err) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Something went wrong while uploading the image!'),
          });
          this.$emit('uploadFailed');
        }
        this.isUploading = false;
        this.$emit('manualImageUpload', url);
      };
      input.click();
    },

  },

};

</script>

<style lang="scss">

.list-enter-active, .list-leave-active {
  transition: opacity .5s ease-in-out 2s;
}
.list-enter, .list-leave-to  {
  opacity: 0;
}

.btn-animation {
    animation: btn .5s ease-in;
}
.mobile-btn-animation {
    animation: mobile-btn .5s ease-in;
}

.uploaded-image {
  width: 216px;
  max-width: 216px;
}

.thumbnail-preview {
  animation: pop-preview .1s ease-in;
}

@keyframes pop-preview {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes btn {
    from {
        width: 100%;
    }
    to {
        width: 40px;
    }
}

@keyframes mobile-btn {
    from {
        width: 100%;
    }
    to {
        width: 75%;
    }
}

</style>

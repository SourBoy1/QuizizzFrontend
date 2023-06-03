<template>
  <section
    ref="dragDropContainer"
    class="border-dashed border-dark-10% border rounded flex
    items-center justify-center cursor-pointer bg-light-2"
  >
    <input
      :id="inputId"
      ref="inputFile"
      class="invisible w-0 h-0"
      type="file"
      accept=".pdf"
      tabindex="0"
      @change.prevent.stop="onFileChange"
    />

    <!--
      Need to preventDefault and stopPropagation on drop events to ensure
      that the browser doesn't open the file being dropped in the area
     -->
    <label
      class="w-full h-full cursor-pointer"
      :for="inputId"
      @drop.prevent.stop="onDropFile"
      @drag.prevent.stop
      @dragenter.prevent.stop
      @dragleave.prevent.stop
      @dragover.prevent.stop
    >
      <div
        ref="dragAndDropArea"
        class="flex flex-col items-center justify-center w-full h-full"
        role="button"
        :aria-controls="inputId"
        tabindex="0"
        @keydown="handleInputKeyDown"
      >
        <img
          v-if="image"
          :src="image"
          class="max-h-44"
        />

        <div class="mt-2 text-xs font-semibold text-center text-dark-3">
          <slot name="image-subtext" />
        </div>
      </div>
    </label>
  </section>
</template>

<script>
import get from 'lodash/get';

export default {

  props: {
    image: {
      type: String,
      default: '',
    },

    inputId: {
      type: String,
      default: 'fileInput',
    },

    shouldFocusInputOnMount: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['fileUploaded'],

  data() {
    return {
      file: null,
    };
  },

  mounted() {
    if (this.shouldFocusInputOnMount) {
      this.$refs.inputFile.focus();
    }
  },

  methods: {

    handleInputKeyDown(ev) {
      const { key } = ev;
      if (key === 'Enter' || key === ' ') {
        this.$refs.inputFile.click();
      }
    },

    onFileChange(ev) {
      const uploadedFiles = get(ev.target, 'files', []);

      if (uploadedFiles.length === 0) {
        return;
      }

      this.$emit('fileUploaded', uploadedFiles);
    },

    onDropFile(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      const uploadedFiles = get(ev.dataTransfer, 'files', []);

      if (uploadedFiles.length === 0) {
        return;
      }

      this.handleFileUpload(uploadedFiles);
    },

    handleFileUpload(uploadedFiles) {
      this.$emit('fileUploaded', uploadedFiles);
    },

  },
};
</script>

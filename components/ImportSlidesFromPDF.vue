<template>
  <section class="flex flex-col h-full">
    <FileDragDrop
      v-if="!pdfReader"
      class="h-71"
      :shouldFocusInputOnMount="true"
      inputId="pdfUpload"
      @fileUploaded="handleFileUploaded"
    >
      <template #image-subtext>
        <div class="text-dark-4">
          <i18n>or drop PDF files here...</i18n>
        </div>
      </template>
    </FileDragDrop>

    <template v-else>
      <div class="flex flex-row justify-between mb-1">
        <div class="text-dark-2 text-xs font-semibold ">
          <i18n :injections="[selectedSlides.length, totalSlides]">
            {$1}/{$2} slides selected
          </i18n>
        </div>
        <div
          class="text-xs font-semibold text-lilac cursor-pointer"
          tabindex="0"
          :aria-label="selectSlidesAriaLabel"
          aria-role="button"
          @click.prevent="handleSelectSlidesClick"
          @keyup.prevent="handleSelectSlidesKeyup"
        >
          {{ selectSlidesText }}
        </div>
      </div>
      <div
        class="w-full p-2 border-dashed border-dark-10% border rounded bg-light-2 h-full overflow-y-auto overflow-x-hidden"
      >
        <ul
          class="slide-grid gap-2 list-none flex flex-wrap"
        >
          <li
            v-for="key in numSlides"
            :key="`slide-${key}`"
            class="slide h-18 w-32 m-2 cursor-pointer relative"
            @click="toggleSelectedSlide(key)"
          >
            <img
              v-if="imageDataUrl[key]"
              :src="imageDataUrl[key]"
              class="w-full h-full rounded-md object-contain bg-dark-3"
            />
            <div
              v-else
              class="bg-dark text-light flex flex-col h-full w-full justify-center items-center"
            >
              <i18n>Loading</i18n>
              <FA
                icon="far fa-sync"
                :size="14"
                class="text-light animate-spin"
              />
            </div>
            <div class="absolute top-0.5 right-1 z-20">
              <Checkbox
                :checked="isSlideSelected(key)"
                :inputId="`slide-check-${key}`"
                :name="`Slide ${key}`"
                :hasWhiteBorder="true"
                @change="(status) => handleCheckboxStatusChange(status, key)"
              />
            </div>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script>
import QuizService from '~/services/apis/QuizService';
import PDFService from '~/services/PDFService';

export default {

  props: {
    emitFiles: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['noSlideSelected', 'mounted', 'input', 'startRender', 'finishRender'],

  data() {
    return {
      selectedSlides: [],
      totalSlides: 0,
      imageDataUrl: {},

      /** @type {PDFService()} */
      pdfReader: null,
      file: null,
      progressBarInterval: null,
    };
  },

  computed: {
    numSlides() {
      if (this.pdfReader) {
        return this.pdfReader.getNumPages() || 0;
      }

      return 0;
    },

    areAllSlidesSelected() {
      return (this.selectedSlides.length === this.totalSlides);
    },

    selectSlidesAriaLabel() {
      if (!this.areAllSlidesSelected) {
        return this.$i18n('Select all slides');
      }

      return this.$i18n('Deselect all slides');
    },

    selectSlidesText() {
      if (!this.areAllSlidesSelected) {
        return this.$i18n('Select all');
      }

      return this.$i18n('Select none');
    },
  },

  watch: {
    selectedSlides(newVal) {
      this.$emit('noSlideSelected', newVal.length === 0);
    },
  },

  mounted() {
    this.$eventBus.$on('importSlide:beginImport', this.startSlideImportProcess);
    this.$emit('mounted');
  },

  beforeUnmount() {
    if (this.progressBarTimeout) {
      clearInterval(this.progressBarTimeout);
    }
    this.$eventBus.$off('importSlide:beginImport', this.startSlideImportProcess);
  },

  methods: {
    handleSelectSlidesClick() {
      if (!this.areAllSlidesSelected) {
        this.selectAllSlides();
      } else {
        this.deselectAllSlides();
      }
    },

    handleSelectSlidesKeyup(ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        this.handleSelectSlidesClick();
      }
    },

    selectAllSlides() {
      this.selectedSlides = [];
      for (let i = 1; i <= this.totalSlides; i++) {
        this.selectedSlides.push(i);
      }
    },

    deselectAllSlides() {
      this.selectedSlides.splice(0, this.selectedSlides.length);
    },

    async startSlideImportProcess(isEditableImport) {
      this.$eventBus.$emit('importSlide:importStarted', {
        totalSlides: this.selectedSlides.length,
        isEditableImport,
      });
      try {
        // For now showing a fake progress bar that increments 5% every 500 milliseconds
        // TO-DO - show actual progress
        let progressRemaining = 0;
        this.progressBarInterval = setInterval(() => {
          progressRemaining += 1;
          this.$eventBus.$emit('importSlide:updateProgress', { progress: progressRemaining });
          if (progressRemaining === this.$constants.LessonImport.TOTAL_PROGRESS) {
            clearInterval(this.progressBarInterval);
          }
        }, 500);
        const fileURL = await this.handlePDFUpload();
        const key = fileURL.substring(fileURL.indexOf('_video/'));
        const pdfResp = await QuizService.processPDF(key, this.selectedSlides, isEditableImport);
        this.$eventBus.$emit('importSlide:allSlidesImported', {
          slides: null, pdfData: pdfResp.extracted.data, key, isEditableImport,
        });
        clearInterval(this.progressBarInterval);
      } catch (err) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Could not upload. File size should not exceed 5MB.'),
        });
        this.$eventBus.$emit('importSlide:failedUpload');
        this.$eventBus.$emit('importSlide:closeModal');
      }
    },

    loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          resolve(img);
        };

        img.onerror = (err) => {
          reject(err);
        };

        img.src = url;
      });
    },

    handleCheckboxStatusChange(checkedStatus, slideId) {
      if (!checkedStatus && !this.selectedSlides.includes(slideId)) {
        this.selectedSlides.push(slideId);
      }

      if (checkedStatus && this.selectedSlides.includes(slideId)) {
        this.selectedSlides = this.selectedSlides.filter((id) => id !== slideId);
      }
    },

    toggleSelectedSlide(id) {
      const slideId = parseInt(id, 10);
      const selectedSlideIdx = this.selectedSlides.indexOf(slideId);

      if (selectedSlideIdx === -1) {
        this.selectedSlides.push(slideId);
      } else {
        this.selectedSlides.splice(selectedSlideIdx, 1);
      }
    },

    isSlideSelected(id) {
      return (this.selectedSlides.includes(parseInt(id, 10)));
    },

    handleFileUploaded(files) {
      if (this.emitFiles) {
        return this.$emit('input', files);
      }
      this.file = files[0];
      if (this.file.type !== 'application/pdf') {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-exclamation-triangle',
          title: this.$i18n('Please upload a PDF file'),
        });
        return;
      }

      this.parseAndRenderPDF(this.file);
    },

    async handlePDFUpload() {
      const fileURL = await this.$fileUpload.uploadFileToS3(this.file, {
        destination: 'videoResponses/unprocessed',
        folder: '_video',
        metadata: {
          'Content-Type': this.file.type,
        },
      });
      return fileURL;
    },

    async parseAndRenderPDF(file) {
      this.pdfReader = new PDFService();
      await this.pdfReader.loadPdf(file);

      for (let i = 1; i <= this.pdfReader.getNumPages(); i++) {
        this.selectedSlides.push(i);
      }

      this.totalSlides = this.pdfReader.getNumPages();

      this.renderAllPages();
    },

    async renderAllPages() {
      this.$emit('startRender', { totalPages: this.pdfReader.getNumPages() });

      for (let i = 1; i <= this.pdfReader.getNumPages(); i++) {
        const page = await this.pdfReader.getPage(i);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const viewport = this.pdfReader.getViewport(page, {
          scale: 1.5,
          dontFlip: false,
        });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await this.pdfReader.renderPage(page, {
          canvasContext: ctx,
          viewport,
        });

        const dataURL = canvas.toDataURL();
        this.imageDataUrl[i] = dataURL;
        this.$emit('finishRender', { pagesDone: i });
      }

      this.$nextTick(() => {
        const el = document.querySelector('#slide-check-0');
        if (el) {
          el.focus();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>

.slide {
  transition: transform .2s ease-in-out;
  filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.16));

  &:hover {
    transform: scale(1.2) translate3d(0, 0, 0);
    backface-visibility: hidden;
  }
}

.slide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
}
</style>

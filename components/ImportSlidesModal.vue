<template>
  <Modal
    v-bind="modalProps"
    class="import-pdf-modal"
    :type="isFileUploadInProgress ? 'blocker' : 'default'"
    @close="close"
    @button1-click="close"
    @button2-click="handleImportBtnClick"
  >
    <div
      v-if="isFileUploadInProgress"
      class="w-full"
    >
      <ProgressBar
        :currentValue="filesUploaded"
        :maxValue="totalFilesToUpload"
      />
    </div>
    <div v-else>
      <transition name="fade">
        <div
          v-if="shouldShowImportActions"
          class="grid grid-cols-2 mb-4 gap-x-2"
        >
          <GoogleDrivePicker
            class="mr-2 bg-light-2"
            size="xs"
            :multiselect="isForBulkImport"
            @input="handleGoogleDriveInput"
            @token="setGoogleOAuthToken"
            @chosen="handleGDriveInput"
            @click="onImportTypeClick('g-drive')"
          />
          <button
            class="relative flex items-center justify-center p-3 text-base font-semibold border border-transparent rounded-lg bg-light-2 text-dark-2 border-dark-6"
            @click="onImportTypeClick('pdf')"
          >
            <input
              type="file"
              accept="application/pdf"
              class="pdf-input cursor-pointer absolute left-0 z-5 w-full h-full opacity-0"
              :multiple="isForBulkImport"
              :aria-label="$i18n('Upload a PDF file')"
              @change="handleInputFileChange"
            />
            <div class="absolute left-0 z-0 flex items-center justify-center w-full text-sm cursor-pointer">
              <img
                src="https://cf.quizizz.com/img/icons/pdf.png"
                alt="pdf-icon"
                class="w-4 h-4 mr-1"
              />
              <i18n>Upload a PDF file</i18n>
            </div>
          </button>
        </div>
      </transition>

      <template v-if="!isUploadingSlides">
        <div class="h-71">
          <div
            v-if="!slidesComponentMounted"
            class="h-full bg-light-2"
          />
          <ImportSlidesFromPDF
            ref="importSlidesFromPdf"
            :emitFiles="isForBulkImport"
            :totalProgress="totalProgress"
            @startRender="handleStartRender"
            @mounted="slidesComponentMounted = true"
            @finishRender="handleFinishRender"
            @noSlideSelected="noSlidesSelected = $event"
            @input="handleImportBtnClick"
          />
        </div>
      </template>

      <template
        v-if="!isUploadingSlides && !isImportFinished && totalPages === -1"
        slot="footer-text"
      >
        <button
          v-tooltip="powerPointInfoTooltip"
          class="flex items-center pr-2 mr-auto text-xs font-semibold rounded-lg text-dark-2"
        >
          <img
            class="w-6 h-6 mr-1"
            src="https://cf.quizizz.com/img/icons/ppt.png"
            alt="powerpoint-logo"
          />
          <i18n>How to import from PowerPoint?</i18n>
        </button>
      </template>

      <template
        v-if="!isUploadingSlides && !isImportFinished"
        slot="footer-text"
      >
        <div
          v-if="totalPages !== -1"
          class="flex flex-col my-auto mr-auto w-75"
        >
          <ProgressBar
            :maxValue="totalPages"
            :currentValue="finishedPages"
          />
          <div class="mt-2 font-semibold text-dark-3 text-xxs">
            <i18n :injections="[finishedPages, totalPages]">
              {$1}/{$2} slides converted
            </i18n>!
          </div>
        </div>
      </template>

      <div
        v-else-if="isUploadingSlides && isImportFinished"
        class="flex flex-col items-center justify-center mx-auto my-4 h-14"
      >
        <div class="mb-4 text-base font-semibold text-center text-dark-2">
          <i18n>Saving your imported slides</i18n>...
        </div>
        <ProgressBar
          ref="render-progress-bar"
          :maxValue="totalProgress"
          :currentValue="progressRemaining"
          class="h-4"
        />
      </div>
    </div>
    <div v-if="showImportPDFOptions">
      <import-option-modal
        @close="closeImportOptionModal"
        @startImport="startImport"
      />
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import ObjectId from 'bson-objectid';
import get from 'lodash/get';

import NewSlideService from '~/services/NewSlideService';
import QuizService from '~/services/apis/QuizService';
import Constants from '~/config/Constants.js';
import GoogleDriveMixin from '~/mixins/googleDriveMixin';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';

import { state as uiManagerState } from '~/store/uiManager';

export default {

  mixins: [GoogleDriveMixin],

  props: {
    isForBulkImport: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],

  data() {
    return {
      totalSlidesInPDF: -1,
      totalPages: -1,
      finishedPages: 0,
      isUploadingSlides: false,
      currentModalView: 'g-drive',
      totalSlidesBeingUploaded: -1,
      totalSlidesImported: 0,
      importedSlides: [],
      slidesComponentMounted: false,
      isImportFinished: false,
      isFileUploadedFromDrive: false,
      noSlidesSelected: false,
      googleOAuthToken: null,
      uploadTypeButtons: [
        {
          label: 'Upload a PDF',
          text: 'Upload a PDF file',
          viewType: 'pdf',
          img: 'https://cf.quizizz.com/img/icons/pdf.png',
        },
      ],

      filesToUploadToDrive: [],
      rejectedFiles: [],
      progressRemaining: 0,
      totalProgress: this.$constants.LessonImport.TOTAL_PROGRESS,
      fileType: this.$constants.LessonImportFileTypes.PDF,
      showImportPDFOptions: false,
      isEditableImport: false,
      files: null,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['selectedSlide', 'quizId', 'quizType', 'sortedQuestions']),
    ...mapGetters('uiManager', ['bottomProgressState']),

    isImportDisabled() {
      return this.noSlidesSelected || (this.finishedPages !== this.totalPages);
    },

    powerPointInfoTooltip() {
      return {
        placement: 'right',
        content: `
        <video autoplay="true" loop muted height="300" width="300">
          <source src="https://cf.quizizz.com/videos/powerpoint.mp4" type="video/mp4">
        </video>`,
      };
    },

    shouldShowImportActions() {
      if (this.finishedPages > 0) {
        return false;
      }

      return !this.isUploadingSlides || !this.isImportFinished;
    },

    modalProps() {
      const props = {};

      if (this.isFileUploadInProgress) {
        return {
          button1: null,
          button2: null,
          size: 'sm',
          title: this.$i18n('Processing files for import'),
          subtitle: this.$i18n('We will upload the files to your drive for import'),
        };
      }

      if (this.isUploadingSlides) {
        Object.assign(props, {
          button1: null,
          button2: null,
          subtitle: '',
          title: '',
          icon: '',
          size: 'sm',
          showCloseModalBtn: false,
        });
      } else {
        Object.assign(props, {
          button1: {
            type: 'other',
            title: this.$i18n('Cancel'),
            ariaLabel: this.$i18n('Cancel import'),
          },
          button2: {
            type: 'primary',
            title: this.$i18n('Import'),
            disabled: this.isImportDisabled,
            ariaLabel: this.$i18n('Import selected slides'),
          },

          size: 'lg',
          icon: 'far fa-file-pdf',
          title: this.$i18n('Import slides'),
        });
      }

      return props;
    },

    isLibraryPage() {
      return ['admin-private', 'admin-corporate'].includes(this.$route.name);
    },
  },

  mounted() {
    this.$eventBus.$on('importSlide:importStarted', this.importStarted);
    this.$eventBus.$on('importSlide:singleSlideImported', this.importedSlide);
    this.$eventBus.$on('importSlide:allSlidesImported', this.allSlidesImported);
    this.$eventBus.$on('importSlide:updateProgress', this.uploadProgressStep);
    this.$eventBus.$on('importSlide:closeModal', this.close);
    this.$eventBus.$on('importSlide:failedUpload', this.failedUpload);

    if (this.isForBulkImport || this.$route.query.bulkImport) {
      let source = this.$route?.fullPath?.includes('/private') ? 'library' : 'content';
      if (this.$route.query.bulkImport) {
        source = 'qfwFlowQuizEditor';
      }
      this.$analytics.logEvent(this.$webEvents.BULK_IMPORT_INTENT, {
        source,
      });

      HotjarService.triggerEvent(HotjarEvents.HOTJAR_BULK_IMPORT_INTENT);
    }
  },

  beforeUnmount() {
    this.$eventBus.$off('importSlide:singleSlideImported', this.importedSlide);
    this.$eventBus.$off('importSlide:importStarted', this.importStarted);
    this.$eventBus.$off('importSlide:allSlidesImported', this.allSlidesImported);
    this.$eventBus.$off('importSlide:updateProgress', this.uploadProgressStep);
    this.$eventBus.$off('importSlide:closeModal', this.close);
    this.$eventBus.$off('importSlide:failedUpload', this.failedUpload);
  },

  methods: {
    onImportTypeClick(view) {
      const viewType = view;

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMPORT_FILETYPE);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          type: viewType,
        },
      );

      this.currentModalView = viewType;
    },

    isOnView(view) {
      return (this.currentModalView === view);
    },

    importStarted(data, isEditableImport) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMPORT_UPLOAD_START);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          numSlides: data.totalSlides,
          numSlidesUploaded: this.totalSlidesImported,
          fileType: this.fileType,
          isEditableImport,
        },
      );

      this.totalSlidesBeingUploaded = data.totalSlides;
    },

    handleImportBtnClick(files) {
      this.showImportPDFOptions = true;
      this.files = files;
    },
    closeImportOptionModal() {
      this.showImportPDFOptions = false;
    },
    startImport(isEditableImport) {
      this.isEditableImport = isEditableImport;
      this.showImportPDFOptions = false;
      if (this.isForBulkImport) {
        if (this.fileType === 'g-drive') {
          this.handleMultipleSlidesImport(this.files);
          return;
        }
        this.processFilesForUpload(this.files);
        return;
      }
      this.isUploadingSlides = true;
      this.finishedPages = 0;
      this.totalPages = -1;
      this.$eventBus.$emit('importSlide:beginImport', isEditableImport);
    },

    handleStartRender({ totalPages }) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMPORT_PREP_START);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          numSlides: totalPages,
        },
      );

      this.totalPages = totalPages;
      this.totalSlidesInPDF = totalPages;
    },

    handleGoogleDriveInput(file) {
      this.fileType = 'g-drive';
      this.$refs.importSlidesFromPdf.handleFileUploaded([file]);
      this.isFileUploadedFromDrive = true;
    },

    handleInputFileChange(event) {
      const files = get(event, 'target.files', []);

      if (this.isForBulkImport) {
        this.files = files;
        this.showImportPDFOptions = true;
        return;
      }

      this.$refs.importSlidesFromPdf.handleFileUploaded(files);
      this.isFileUploadedFromDrive = true;
    },

    processFilesForUpload(files) {
      this.filesToUploadToDrive = files;
      this.googleDriveAuthInit();
    },

    handleFinishRender({ pagesDone }) {
      this.finishedPages = pagesDone;

      if (this.finishedPages === this.totalPages) {
        // 500ms delay just to show the user that all the slides are uploaded, then remove the progress bar

        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMPORT_PREP_FINISH);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
            numSlides: this.totalPages,
          },
        );
        setTimeout(() => {
          this.isImportFinished = true;
        }, 500);
      }
    },

    uploadProgressStep({ progress }) {
      this.progressRemaining = progress;
    },

    importedSlide() {
      this.totalSlidesImported += 1;
    },

    allSlidesImported({ pdfData, key, isEditableImport }) {
      if (isEditableImport) {
        this.$store.dispatch('uiManager/togglePdfImport', { isPdfImported: true });
      }
      this.insertImportedSlidesIntoPresentation(pdfData);
      this.isUploadingSlides = false;
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.EDITOR_IMPORT_UPLOAD_FINISH);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          numSlides: this.totalSlidesInPDF,
          numSlidesUploaded: this.totalSlidesBeingUploaded,
          fileType: this.fileType,
          key,
          isEditableImport,
        },
      );
      this.close();
    },

    getTextWidth(canvas, inputText, font) {
      const context = canvas.getContext('2d');
      context.font = font;
      const { width } = context.measureText(inputText);
      const formattedWidth = Math.ceil(width);
      return formattedWidth;
    },

    constructSlideElement({
      type, zIndex, x, y, width, height, content,
    }) {
      const slideElement = {};
      if (type === this.$constants.LessonImport.SLIDE_ELEMENT_TYPE.MEDIA) {
        slideElement.data = {
          media: {
            type: 'image',
            video: '',
            url: content,
          },
        };
      } else {
        slideElement.data = {
          html: content,
        };
      }
      return {
        ...slideElement,
        _id: (new ObjectId()).toString(),
        type,
        transform: {
          position: {
            x,
            y,
          },
          size: {
            width,
            height,
          },
          rotation: 0,
        },

        isLocked: true,
        zIndex,
      };
    },

    addPDFTextToSlide(pdfData) {
      const canvas = document.createElement('canvas');

      // scaling ratio is to preserve the aspect ratio and fit the content inside the editor dimensions
      const scalingRatio = Math.min(this.$constants.LessonImport.LESSON_EDITOR_WIDTH / (pdfData.width), this.$constants.LessonImport.LESSON_EDITOR_HEIGHT / (pdfData.height));
      let xOffset = 0;
      if (pdfData.width * scalingRatio < this.$constants.LessonImport.LESSON_EDITOR_WIDTH) {
        xOffset = (this.$constants.LessonImport.LESSON_EDITOR_WIDTH - pdfData.width * scalingRatio) / 2;
      }
      pdfData.slides.forEach((slide, slideIndex) => {
        const slideElements = [];
        // create full slide sized image as background element
        slideElements.push(this.constructSlideElement({
          type: this.$constants.LessonImport.SLIDE_ELEMENT_TYPE.MEDIA,
          x: 0,
          y: 0,
          width: this.$constants.LessonImport.LESSON_EDITOR_WIDTH,
          height: this.$constants.LessonImport.LESSON_EDITOR_HEIGHT,
          content: slide.background,
          zIndex: slideElements.length,
        }));
        slide.paragraphs.forEach((para) => {
          if (!para.length) {
            return;
          }
          const textParagraph = document.createElement('p');
          let textParaWidth = 0;
          let currentLineText = '';
          let currentLineWidth = 0;
          para.forEach((block, index) => {
            if (block.type === 'Image') {
              slideElements.push(this.constructSlideElement({
                type: this.$constants.LessonImport.SLIDE_ELEMENT_TYPE.MEDIA,
                x: block.x * scalingRatio + xOffset,
                y: block.y * scalingRatio,
                width: block.width * scalingRatio,
                height: block.height * scalingRatio,
                content: block.content,
                zIndex: slideElements.length,
              }));
            } else if (block.type === 'Text') {
              if (block.content === '<br>') {
                currentLineText = '';
                currentLineWidth = 0;
                // do not add an extra breakline if last element of the paragraph
                if (index !== para.length - 1) {
                  textParagraph.appendChild(document.createElement('br'));
                }
                return;
              }
              if (block.styles.text.trim().length === 0) {
                return;
              }
              // set styles for each block in the paragraph
              const spanBlock = document.createElement('span');
              spanBlock.textContent = block.styles.text;
              spanBlock.style.fontSize = `${block.styles.fontSize * scalingRatio}px`;
              spanBlock.style.lineHeight = `${block.styles.fontSize * scalingRatio}px`;
              spanBlock.style.color = block.styles.color;
              spanBlock.style.fontWeight = block.styles.fontWeight;
              spanBlock.style.fontFamily = block.styles.font;
              if (block.styles.italic === 'true') {
                spanBlock.style.fontStyle = 'italic';
              }
              // calculate the width of the paragraph
              currentLineText = block.styles.text;
              // get occupied block width with current font
              let blockWidth = this.getTextWidth(canvas, currentLineText, `${spanBlock.style.fontSize} ${block.styles.font}`);
              // if calculated width is way greater than the actual width it is supposed to occupy, then convert to a thinner font
              if (block.width * scalingRatio / blockWidth < this.$constants.LessonImport.CONVERT_TO_THIN_FONT_THRESHOLD) {
                spanBlock.style.fontFamily = this.$constants.LessonImport.THIN_FONT;
                blockWidth = this.getTextWidth(canvas, currentLineText, `${spanBlock.style.fontSize} ${spanBlock.style.fontFamily}`);
              }
              // reduce font size to fit text inside the width it is supposed to occupy
              if (block.width * scalingRatio < blockWidth) {
                spanBlock.style.fontSize = `${block.styles.fontSize * scalingRatio * (block.width * scalingRatio / blockWidth)}px`;
                blockWidth = this.getTextWidth(canvas, currentLineText, `${spanBlock.style.fontSize} ${spanBlock.style.fontFamily}`);
              }
              currentLineWidth += blockWidth;
              if (textParaWidth < currentLineWidth) {
                textParaWidth = currentLineWidth;
              }
              if (textParaWidth < currentLineWidth) {
                textParaWidth = currentLineWidth;
              }
              textParagraph.appendChild(spanBlock);
            }
          });
          // add some extra width to account for margin and extra spacing due to change in font
          textParaWidth = (textParaWidth + 25) * 1.15;
          if (textParagraph.hasChildNodes()) {
            slideElements.push(this.constructSlideElement({
              type: this.$constants.LessonImport.SLIDE_ELEMENT_TYPE.TEXT,
              x: para[0].x * scalingRatio - 12 + xOffset,
              y: para[0].y * scalingRatio - 12,
              width: textParaWidth,
              height: 0,
              content: textParagraph.outerHTML,
              zIndex: slideElements.length,
            }));
          }
        });
        // Mutation - Add a new slide along with the slide elements
        NewSlideService.addNewSlide(Constants.SlideTemplates.BLANK, {
          slideElements,
        }, false);
      });
      if (this.isEditableImport) {
        const url = new URL(window.location);
        url.searchParams.set('pdfImportUploaded', 'true');
        window.history.pushState(null, '', url.toString());
      }
    },

    insertImportedSlidesIntoPresentation(pdfData) {
      const selectedSlideIndex = this.sortedQuestions.findIndex((question) => question._id === this.selectedSlide);
      this.addPDFTextToSlide(pdfData);
      this.$store.dispatch('contentEditor/selectSlideById', this.sortedQuestions[selectedSlideIndex + 1]._id);
    },

    close() {
      if (this.isForBulkImport) {
        this.$store.dispatch('uiManager/toggleBulkImport');
        return;
      }

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.IMPORT_MODAL_CLOSED);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          fileType: this.fileType,
        },
      );
      this.$emit('close');
    },

    failedUpload() {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.IMPORT_PDF_ERROR);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          fileType: this.fileType,
        },
      );
    },

    handleGDriveInput(files) {
      this.fileType = 'g-drive';
      this.handleImportBtnClick(files);
    },

    setGoogleOAuthToken(token) {
      this.googleOAuthToken = token;
    },

    async postDriveFileUpload(files, failedFiles) {
      await this.handleMultipleSlidesImport(files, [...this.rejectedFiles, ...failedFiles]);
    },

    async handleMultipleSlidesImport(files, rejectedFiles = []) {
      const numOfPdfs = files.filter((file) => file.mimeType === 'application/pdf').length;
      this.$analytics.logEvent(this.$webEvents.BULK_IMPORT_INIT, {
        total: files.length,
        pdf: numOfPdfs,
        isEditable: this.isEditableImport,
      });

      HotjarService.triggerEvent(HotjarEvents.HOTJAR_BULK_IMPORT_INIT);

      const response = await QuizService.initializeBulkSlidesImport({
        googleOAuthToken: this.googleOAuthToken,
        files: files.map((file) => ({
          name: file.name,
          fileId: file.id,
          type: file.mimeType === 'application/pdf' ? this.$constants.LessonImportFileTypes.PDF : this.$constants.LessonImportFileTypes.SLIDE,
        })),
        rejectedFiles,
        isEditableImport: this.isEditableImport,
      });

      if (response.success) {
        if (this.isLibraryPage) {
          this.$store.dispatch('uiManager/toggleLibraryProgress');
          this.close();
          return;
        }

        this.$store.dispatch('uiManager/setBottomProgressPopUpConfig', {
          ...uiManagerState().bottomProgressPopUp,
          isShowing: true,
          isInProgress: true,
          title: `0/${files.length} ${this.$i18n('files imported')}`,
          subtitle: this.$i18n('We will inform you post completion'),
          maxValue: files.length * 15 * 60,

          pollOn: async () => {
            const { data, success } = await QuizService.getCurrentSlideImportStatus();

            if (success) {
              const fileStats = get(data, 'status.fileStats', { total: 0, imported: 0 });
              const status = get(data, 'status.status', this.$constants.BulkImport.IN_PROGRESS);
              const fileLogs = get(data, 'status.files', []);

              if (fileStats.total === 0) {
                return;
              }
              const current = Math.max(fileStats.imported * 15 * 60, this.bottomProgressState.current + this.$constants.BulkImport.POLL_TIME / 1000);

              const isInProgress = status === this.$constants.BulkImport.IN_PROGRESS;
              const hasErrored = status === this.$constants.BulkImport.FAILED || (status === this.$constants.BulkImport.COMPLETED && !!fileLogs.find((file) => file.status === this.$constants.BulkImport.FAILED));

              const progressConfig = {
                current,
                isInProgress,
                hasErrored,
                title: this.$i18n('{$1}/{$2} files imported', [fileStats.imported, fileStats.total]),
                subtitle: this.$i18n('We will notify you when the import has completed'),
              };

              if (isInProgress) {
                progressConfig.onClose = () => this.$toasts.add({
                  icon: 'fas fa-info-circle',
                  title: this.$i18n('You may go to the imported section of my library to see the progress'),
                  time: 8000,
                });
              }

              if (hasErrored) {
                this.$analytics.logEvent(this.$webEvents.BULK_IMPORT_COMPLETED, {
                  isSuccess: false,
                });
                progressConfig.title = `${fileStats.total - fileStats.imported}/${fileStats.total} ${this.$i18n('files could not be imported')}`;
                progressConfig.subtitle = this.$i18n('You may check the logs for what went wrong');

                progressConfig.errorBtnConfig = {
                  title: this.$i18n('View import log'),
                  click: () => {
                    this.$store.dispatch('uiManager/setLogErrorModalConfig', {
                      isShowing: true,
                      errors: fileLogs.map((file) => ({
                        hasFailed: !!file.error,
                        title: file.slideName,
                        description: file.error,
                      })),

                      title: this.$i18n('Few slides failed to import'),
                      subtitle: this.$i18n('You can check the error by hovering on the error symbol'),
                    });
                  },
                };

                progressConfig.cancelPolling = true;
              }

              if (!isInProgress && !hasErrored) {
                this.$analytics.logEvent(this.$webEvents.BULK_IMPORT_COMPLETED, {
                  isSuccess: true,
                });

                progressConfig.title = this.$i18n('Import complete');
                progressConfig.subtitle = this.$i18n('All {$1}/{$2} file{$3} have been imported', [fileStats.total, fileStats.total, fileStats.total === 1 ? '' : 's']);

                progressConfig.successBtnConfig = {
                  title: this.$i18n('View'),
                  click: () => this.$router.push(`/admin/${this.$user.isCorporate ? 'corporate' : 'private'}?imported=true`),
                };

                progressConfig.cancelPolling = true;
              }

              this.$store.dispatch('uiManager/setBottomProgressPopUpConfig', progressConfig);
            }
          },

          onCancel: async () => {
            this.$analytics.logEvent(this.$webEvents.BULK_IMPORT_CANCELLED);
            const response = await QuizService.cancelBulkSlideImport();

            if (!response.success) {
              this.$toasts.add({
                type: this.$constants.ToastTypes.ERROR,
                icon: 'fas fa-times-circle',
                title: this.$i18n('Unable to cancel'),
              });
              return;
            }

            this.$toasts.add({
              type: this.$constants.ToastTypes.SUCCESS,
              icon: 'fas fa-check-circle',
              title: this.$i18n('Slide import cancelled successfully'),
            });
            this.$store.dispatch('uiManager/toggleBottomProgressPopUp');
          },
        });

        this.close();
        return;
      }

      this.$toasts.add({
        type: this.$constants.ToastTypes.ERROR,
        icon: 'fas fa-times-circle',
        title: response.errMsg ? response.errMsg : this.$i18n('Unable to start the sync, please try again!'),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .import-info-title  {
    box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
    border-radius: 4px;
  }

  .import-pdf-modal {
    .modal-container {
      padding: 2rem;
    }

    .footer {
      margin-top: 1.5rem;
    }
  }

  .fade-enter-active, .fade-leave-active {
      transition: opacity .3s;
    }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  .pdf-input {
    &::-webkit-file-upload-button {
      cursor: pointer;
    }
    font-size: 0px;
  }
</style>

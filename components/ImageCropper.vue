<template>
  <div
    ref="cropperContainer"
    class="absolute top-0 left-0 w-full h-full cropper-container"
    @mousedown.stop="onDragStart($event)"
    @mouseup.stop="onDragEnd($event)"
    @mousemove.stop="onDragging($event)"
    @touchstart.stop="onDragStart($event, true)"
    @touchmove.stop="onDragging($event, true)"
    @touchend.stop="onDragEnd($event)"
  >
    <div
      v-if="hasImageLoaded"
      id="cropper"
      :style="cropperStyle"
      class="absolute border-2 border-solid cropper border-lilac-light"
    >
      <span
        class="absolute flex items-center justify-center w-6 h-6 top-left z-1"
        @mousedown.stop="onCropperSizeAdjusterClicked($event, 'top-left')"
        @touchstart.stop="onCropperSizeAdjusterClicked($event, 'top-left', true)"
      >
        <span class="absolute w-3 h-1 rounded top bg-light-3" />
        <span class="absolute w-3 h-1 rounded bottom bg-light-3" />
      </span>
      <span
        class="absolute flex items-center justify-center w-6 h-6 top-right z-1"
        @mousedown.stop="onCropperSizeAdjusterClicked($event, 'top-right')"
        @touchstart.stop="onCropperSizeAdjusterClicked($event, 'top-right', true)"
      >
        <span class="absolute w-3 h-1 rounded top bg-light-3" />
        <span class="absolute w-3 h-1 rounded bottom bg-light-3" />
      </span>
      <span
        class="absolute flex items-center justify-center w-6 h-6 bottom-left z-1"
        @mousedown.stop="onCropperSizeAdjusterClicked($event, 'bottom-left')"
        @touchstart.stop="onCropperSizeAdjusterClicked($event, 'bottom-left', true)"
      >
        <span class="absolute w-3 h-1 rounded top bg-light-3" />
        <span class="absolute w-3 h-1 rounded bottom bg-light-3" />
      </span>
      <span
        class="absolute flex items-center justify-center w-6 h-6 bottom-right z-1"
        @mousedown.stop="onCropperSizeAdjusterClicked($event, 'bottom-right')"
        @touchstart.stop="onCropperSizeAdjusterClicked($event, 'bottom-right', true)"
      >
        <span class="absolute w-3 h-1 rounded shadow-sm top bg-light-3" />
        <span class="absolute w-3 h-1 rounded shadow-sm bottom bg-light-3" />
      </span>

      <span
        class="absolute flex items-center justify-center w-6 h-6 top-bar z-1"
        @mousedown.stop="onCropperSizeAdjusterClicked($event, 'top-bar')"
        @touchstart.stop="onCropperSizeAdjusterClicked($event, 'top-bar', true)"
      >
        <span
          class="w-3 h-1 rounded handle bg-light-3 z-1"
        />
      </span>
      <span
        class="absolute flex items-center justify-center w-6 h-6 bottom-bar z-1"
        @mousedown.stop="onCropperSizeAdjusterClicked($event, 'bottom-bar')"
        @touchstart.stop="onCropperSizeAdjusterClicked($event, 'bottom-bar', true)"
      >
        <span
          class="w-3 h-1 rounded handle bg-light-3 z-1"
        />
      </span>
      <span
        class="absolute flex items-center justify-center w-6 h-6 right-bar z-1"
        @mousedown.stop="onCropperSizeAdjusterClicked($event, 'right-bar')"
        @touchstart.stop="onCropperSizeAdjusterClicked($event, 'right-bar', true)"
      >
        <span
          class="w-3 h-1 rounded handle bg-light-3 z-1"
        />
      </span>
      <span
        class="absolute flex items-center justify-center w-6 h-6 left-bar z-1"
        @mousedown.stop="onCropperSizeAdjusterClicked($event, 'left-bar')"
        @touchstart.stop="onCropperSizeAdjusterClicked($event, 'left-bar', true)"
      >
        <span
          class="w-3 h-1 rounded handle bg-light-3 z-1"
        />
      </span>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import { isServer } from '~/utils/EnvUtils';
import Constants from '~/config/Constants';

export default {
  props: {
    hasImageLoaded: Boolean,
    img: {
      type: isServer() ? Object : HTMLImageElement,
      required: true,
    },
    destination: {
      type: String,
      default: Constants.ImageUploadTypes.QUIZZES,
    },
    scaleFactor: {
      type: Number,
      default: 1,
    },
    forPage: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      isDragging: false,
      mouseStart: { x: -1, y: -1 },
      isAdjustingCropperSize: false,
      currentHandleTypeDragged: '',
      isUploading: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isMobile']),

    isForGoogleImageSearch() {
      return this.forPage === 'google-image';
    },

    cropperStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        top: `${this.top}px`,
        left: `${this.left}px`,
      };
    },

    getContainerDimensions() {
      const { cropperContainer } = this.$refs;

      if (isEmpty(cropperContainer) || !this.hasImageLoaded) { return { width: 0, height: 0 }; }

      const containerHeight = cropperContainer.getBoundingClientRect().height;
      const containerWidth = cropperContainer.getBoundingClientRect().width;

      return { width: containerWidth * this.scaleFactor, height: containerHeight * this.scaleFactor };
    },
  },

  watch: {
    hasImageLoaded(newVal, oldVal) {
      if (newVal) {
        this.setCropperStyles();
      }
    },
  },

  mounted() {
    if (this.hasImageLoaded) {
      this.setCropperStyles();
    }

    document.addEventListener('mouseup', this.onDragEnd);
    document.addEventListener('mousemove', () => this.onDragging(this.$event));

    document.addEventListener('touchmove', () => this.onDragging(this.$event, true));
    document.addEventListener('touchend', this.onDragEnd);
  },

  beforeUnmount() {
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('mousemove', () => this.onDragging(this.$event));

    document.removeEventListener('touchmove', () => this.onDragging(this.$event, true));
    document.removeEventListener('touchend', this.onDragEnd);
  },

  methods: {
    handleCropImage() {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let uploadedUrl = this.img.src;

        if (this.isForGoogleImageSearch) {
          uploadedUrl = await this.uploadImageToServer(this.img.src);
        }

        const img = new Image();
        img.src = uploadedUrl;
        img.crossOrigin = 'Anonymous';

        img.onload = async () => {
          const containerWidth = this.getContainerDimensions.width;
          const containerHeight = this.getContainerDimensions.height;

          const dy = this.top * (img.naturalHeight / containerHeight);
          const dx = this.left * (img.naturalWidth / containerWidth);
          const canvasWidth = this.width * (img.naturalWidth / containerWidth);
          const canvasHeight = this.height * (img.naturalHeight / containerHeight);
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          ctx.drawImage(img, dx, dy, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

          const dataURL = canvas.toDataURL();

          try {
            this.isUploading = true;
            const blob = this.$fileUpload.convertDataURLToBlob(dataURL);
            const uploadedFileURL = await this.$fileUpload.uploadFileToS3(blob, { destination: this.destination, appendRandomizedQueryParam: true });
            this.isUploading = false;

            resolve(uploadedFileURL);
          } catch (err) {
            this.$toasts.add({
              type: this.$constants.ToastTypes.ERROR,
              icon: 'fas fa-times-circle',
              title: this.$i18n('Something went wrong while uploading the image!'),
            });

            this.isUploading = false;
            resolve(null);
          }
        };
      });
    },

    uploadImageToServer(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = async () => {
          const { result, error } = await this.$fileUpload.uploadURLToS3(url, { destination: this.$constants.ImageUploadTypes.QUIZZES });

          if (error) {
            this.$toasts.add({
              type: this.$constants.ToastTypes.ERROR,
              icon: 'fas fa-times-circle',
              title: this.$i18n('This image could not be uploaded. Please try a different image.'),
            });

            return;
          }

          resolve(result);
        };

        img.onerror = () => {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Image type not supported, try another one'),
          });
        };

        img.ontimeout = () => {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Request timed out!'),
          });
        };

        img.src = url;
      });
    },

    onCropperSizeAdjusterClicked(e, handle, isTouch = false) {
      if (this.isUploading) { return; }

      this.isAdjustingCropperSize = true;
      this.currentHandleTypeDragged = handle;

      this.mouseStart.x = this.getPageValuesFromEvent(e).pageX;
      this.mouseStart.y = this.getPageValuesFromEvent(e).pageY;
    },

    setCropperStyles() {
      const containerHeight = this.getContainerDimensions.height;
      const containerWidth = this.getContainerDimensions.width;

      this.width = containerWidth;
      this.height = containerHeight;
      this.top = 0;
      this.left = 0;
    },

    getPageValuesFromEvent(e, isTouch = false) {
      let pageX; let
        pageY;

      if (isTouch) {
        const touch = e.changedTouches[0];

        pageX = touch.pageX;
        pageY = touch.pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }

      return { pageX: pageX * this.scaleFactor, pageY: pageY * this.scaleFactor };
    },

    adjustCropperSize(e, isTouch = false) {
      const containerHeight = this.getContainerDimensions.height;
      const containerWidth = this.getContainerDimensions.width;
      const { pageX } = this.getPageValuesFromEvent(e, isTouch);
      const { pageY } = this.getPageValuesFromEvent(e, isTouch);
      const MINIUM_CROPPER_LENGTH = 75;

      const offsetTop = pageY - this.mouseStart.y;
      const offsetLeft = pageX - this.mouseStart.x;

      let { top } = this;
      let { left } = this;
      let { width } = this;
      let { height } = this;

      switch (this.currentHandleTypeDragged) {
        case 'top-left':
          top = this.getFinalBoundingValue(this.top + offsetTop, containerHeight);
          left = this.getFinalBoundingValue(this.left + offsetLeft, containerWidth);

          if (top !== this.top) {
            const heightChange = top - this.top;

            height = this.getFinalBoundingValue(this.height - heightChange, containerHeight);
          }
          /** Only update when left updates and up by the amount left updated */
          if (left !== this.left) {
            const widthChange = left - this.left;

            width = this.getFinalBoundingValue(this.width - widthChange, containerWidth);
          }
          break;
        case 'top-right':
          top = this.getFinalBoundingValue(this.top + offsetTop, containerHeight);
          width = this.getFinalBoundingValue(this.width + offsetLeft, containerWidth - this.left);

          if (top !== this.top) {
            const heightChange = top - this.top;

            height = this.getFinalBoundingValue(this.height - heightChange, containerHeight);
          }
          break;
        case 'bottom-left':
          left = this.getFinalBoundingValue(this.left + offsetLeft, containerWidth);

          /** Only update when left updates and up by the amount left updated */
          if (left !== this.left) {
            const widthChange = left - this.left;

            width = this.getFinalBoundingValue(this.width - widthChange, containerWidth);
          }

          height = this.getFinalBoundingValue(this.height + offsetTop, containerHeight - this.top);
          break;
        case 'bottom-right':
          width = this.getFinalBoundingValue(this.width + offsetLeft, containerWidth - this.left);
          height = this.getFinalBoundingValue(this.height + offsetTop, containerHeight - this.top);
          break;
        case 'top-bar':
          top = this.getFinalBoundingValue(this.top + offsetTop, containerHeight);

          /** Only update when top updates and up by the amount top updated */
          if (top !== this.top) {
            const heightChange = top - this.top;

            height = this.getFinalBoundingValue(this.height - heightChange, containerHeight);
          }
          break;
        case 'bottom-bar':
          height = this.getFinalBoundingValue(this.height + offsetTop, containerHeight - this.top);
          break;
        case 'left-bar':
          left = this.getFinalBoundingValue(this.left + offsetLeft, containerWidth);

          /** Only update when left updates and up by the amount left updated */
          if (left !== this.left) {
            const widthChange = left - this.left;

            width = this.getFinalBoundingValue(this.width - widthChange, containerWidth);
          }
          break;
        case 'right-bar':
          width = this.getFinalBoundingValue(this.width + offsetLeft, containerWidth - this.left);
          break;
        default:
      }

      if (width > MINIUM_CROPPER_LENGTH) {
        this.width = width;
        this.left = left;
      }

      if (height > MINIUM_CROPPER_LENGTH) {
        this.height = height;
        this.top = top;
      }

      this.mouseStart = { x: pageX, y: pageY };
    },

    getFinalBoundingValue(value, containerLength) {
      if (value < 0) {
        return 0;
      }

      if (value > containerLength) {
        return containerLength;
      }

      return value;
    },

    onDragStart(e, isTouch = false) {
      if (!e || this.isUploading) { return; }

      e.stopPropagation();
      e.preventDefault();

      if (e.target.id !== 'cropper') { return; }

      this.isDragging = true;
      const { pageX } = this.getPageValuesFromEvent(e, isTouch);
      const { pageY } = this.getPageValuesFromEvent(e, isTouch);

      this.mouseStart.x = pageX;
      this.mouseStart.y = pageY;
    },

    onDragging(e, isTouch = false) {
      if (!e || this.isUploading) { return; }

      e.stopPropagation();
      e.preventDefault();

      if (this.isAdjustingCropperSize) {
        this.adjustCropperSize(e, isTouch);
        return;
      }

      if (!this.isDragging) { return; }

      const containerHeight = this.getContainerDimensions.height;
      const containerWidth = this.getContainerDimensions.width;
      const { pageX } = this.getPageValuesFromEvent(e, isTouch);
      const { pageY } = this.getPageValuesFromEvent(e, isTouch);

      const offsetTop = pageY - this.mouseStart.y;
      const offsetLeft = pageX - this.mouseStart.x;

      this.top = this.getFinalBoundingValue(this.top + offsetTop, containerHeight - this.height);
      this.left = this.getFinalBoundingValue(this.left + offsetLeft, containerWidth - this.width);

      this.mouseStart = { x: pageX, y: pageY };
    },

    onDragEnd() {
      if (this.isUploading) { return; }

      this.isDragging = false;
      this.isAdjustingCropperSize = false;
      this.mouseStart = { x: -1, y: -1 };
    },
  },
};
</script>

<style lang="scss" scoped>
  .top, .bottom, .handle {
    box-shadow: 0px 1px 1px theme('colors.dark.4');
  }

  .top-left {
    top: -1px;
    left: 3px;
    transform: translate(-50%, -50%);
    cursor: nwse-resize;
  }

  .top-right {
    left: calc(100% + 1px);
    top: 3px;
    transform: rotate(90deg) translate(-50%, 50%);
    cursor: nesw-resize;
  }

  .bottom-left {
    top: calc(100% - 3px);
    transform: rotate(-90deg) translate(50%, -50%);
    left: -1px;
    cursor: nesw-resize;
  }

  .bottom-right {
    left: calc(100% - 3px);
    top: calc(100% + 1px);
    transform: rotate(180deg) translate(50%, 50%);
    cursor: nwse-resize;
  }

  .top-bar {
    left: 50%;
    transform: translate(-50%, -50%);
    top: -1px;
    cursor: ns-resize;
  }
  .bottom-bar {
    left: 50%;
    transform: translate(-50%, -50%);
    top: calc(100% + 1px);
    cursor: ns-resize;
  }
  .left-bar {
    top: 50%;
    transform: rotate(90deg) translate(-50%, -50%);
    left: -25px;
    cursor: ew-resize;
  }

  .right-bar {
    left: calc(100% + 1px);
    top: 50%;
    transform: rotate(90deg) translate(-50%, 50%);
    cursor: ew-resize;
  }

  .bottom {
    transform: rotate(90deg) translate(4px, 4px);
  }

  .cropper {
    box-shadow: rgb(9 9 9 / 60%) -25px 25px 2670px 1270px;
    cursor: move;
  }
</style>

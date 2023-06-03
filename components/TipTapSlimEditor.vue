<template>
  <div class="tip-tap-slim-editor-wrapper">
    <!-- show edit tools -->
    <div
      class="titap-slim-editor-tools flex justify-between overflow-x-auto mt-1"
      :class="{
        'opacity-0 pointer-events-none': !isTipTapEditorInFocus,
      }"
    >
      <div
        class="flex"
      >
        <FontStyleToolbarSection
          ref="fontStyleToolbarSection"
          toolbarMode="mobile"
          isForQuestionEditor
          :selectedFormatButtons="selectedTextFormatStyles"
          :selectedFont="selectedFont"
          :selectedSize="selectedSize"
          :isContentSlideBeingEdited="isContentSlideBeingEdited"
          :isQuestionSlideBeingEdited="isQuestionSlideBeingEdited"
          @onFormatButtonClicked="onToolbarButtonClick"
        />
      </div>
      <!-- delete button -->
      <ToolbarButton
        v-if="isTipTapEditorInFocus && showDeleteButton"
        :aria-label="$i18n('Delete')"
        name="Delete"
        icon="fas fa-trash-alt"
        class="bg-light-20%"
        @clicked="onDeleteButtonClicked"
      />

      <Button
        v-if="canAddBlank"
        :disabled="isAddBlankDisabled"
        licon="fas fa-plus-square"
        :title="$i18n('Add a blank')"
        :aria-label="$i18n('Add a blank')"
        rounded="sm"
        size="xs"
        type="transparent"
        @mousedown="onToolbarButtonClick('add-blank')"
      />
    </div>
    <!-- show mini editor -->
    <div
      class="tip-tap-slim-editor flex items-center h-full"
      :class="[tipTapMiniEditorWrapperClasses]"
    >
      <TipTapMiniEditor
        v-show="!isTextContainerHidden"
        :id="editorId"
        :ref="`${refValue}`"
        :value="value()"
        :editorId="editorId"
        :placeholder="placeholder"
        class="w-full h-full overflow-auto text-base text-center text-light-3"
        :autoResizeFontJumps="autoResizeFontJumps"
        :isBlankEnabled="canAddBlank"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
      <div
        v-if="doesQuestionHaveAnyMedia"
        class="media-wrapper"
        :class="{
          'mx-auto': isTextContainerHidden,
          'ml-2': !isTextContainerHidden,
        }"
      >
        <!-- media container here -->
        <MediaImage
          v-if="isQuestionMediaPresent('image')"
          class="w-full h-full rounded-lg media-container"
          :src="queryMediaObjects.image.url"
          :objectFit="questionMediaImageLayout"
          @click="openPreview"
        />

        <MediaAudio
          v-if="isQuestionMediaPresent('audio')"
          class="w-full h-full media-container"
          :size="90"
          :src="queryMediaObjects.audio.url"
        />

        <div
          v-if="isQuestionMediaPresent('video')"
          class="relative w-full rounded-md cursor-pointer media-container"
          @click="openMediaPreview"
        >
          <video
            v-if="isGoogleDriveSrcForVideo"
            controls
            playsinline
            class="w-full h-full"
          >
            <source
              :src="`https://drive.google.com/uc?export=download&id=${googleDriveVideoId}`"
              type="video/mp4"
            >
          </video>
          <img
            v-if="!isGoogleDriveSrcForVideo"
            class="object-contain w-full h-full"
            :src="`https://img.youtube.com/vi/${queryMediaObjects.video.meta.videoId}/0.jpg`"
            alt="youtube video cover"
          />
          <div
            v-if="!isGoogleDriveSrcForVideo"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 top-2/4 left-2/4"
          >
            <div class="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 top-2/4 left-2/4 bg-light" />
            <FA
              icon="fab fa-youtube"
              class="relative text-red"
              :size="40"
            />
          </div>
        </div>
        <!-- Edit and delete button -->
        <div class="relative flex items-baseline justify-between mt-2">
          <PopoverConfirmer
            type="danger"
            placement="top"
            class="w-1/2"
            :content="{
              title: $i18n('Are you sure you want to delete this image?'),
            }"
            :button2="{
              title: $i18n('Delete'),
            }"
            @button2Clicked="deleteCurrentMedia"
          >
            <ToolbarButton
              v-if="doesQuestionHaveAnyMedia"
              class="media-action-btn bg-light-20% w-full"
              icon="fas fa-trash-alt"
              :aria-label="$i18n('Remove question media')"
            />
          </PopoverConfirmer>

          <ToolbarButton
            v-if="doesQuestionHaveAnyMedia"
            class="media-action-btn bg-light-20%"
            icon="fas fa-pen"
            @clicked="onMediaReEdit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';

export default {

  props: {
    isTipTapEditorInFocus: {
      type: Boolean,
      required: true,
    },

    value: {
      type: Function,
      required: true,
    },

    editorId: {
      type: String,
      required: true,
    },

    autoResizeFontJumps: {
      type: Array,
      default: () => ([]),
      required: false,
    },

    placeholder: {
      type: String,
      default: '',
    },

    isTextContainerHidden: {
      type: Boolean,
      default: false,
      required: false,
    },

    refValue: {
      type: String,
      default: 'tiptap',
    },

    showDeleteButton: {
      type: Boolean,
      default: false,
    },

    doesQuestionHaveAnyMedia: {
      type: Boolean,
      default: false,
      required: false,
    },

    isQuestionMediaPresent: {
      type: Function,
      default: () => () => false,
      required: false,
    },

    queryMediaObjects: {
      type: Object,
      default: () => ({}),
      required: false,
    },

    questionMediaImageLayout: {
      type: String,
      default: 'contain',
    },

    tipTapMiniEditorWrapperClasses: {
      type: String,
      default: '',
    },

    canAddBlank: {
      type: Boolean,
      default: false,
    },

    isAddBlankDisabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['blur', 'input', 'deleteButtonClicked', 'deleteCurrentMedia', 'onMediaReEdit'],

  data() {
    return {
      selectedFont: 'Quicksand',
      selectedSize: 48,
      selectedTextFormatStyles: [],
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['isCurrentSlideForContent', 'isCurrentSlideForQuestion']),

    isContentSlideBeingEdited() {
      return this.isCurrentSlideForContent;
    },

    isQuestionSlideBeingEdited() {
      return this.isCurrentSlideForQuestion;
    },

    isGoogleDriveSrcForVideo() {
      return get(this.queryMediaObjects, 'video.meta.src', null) === 'google-drive';
    },

    googleDriveVideoId() {
      return get(this.queryMediaObjects, 'video.video', '');
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.$eventBus.$on('slideElement:selectionUpdate', this.setSelectedFormatbuttons);
    });
  },

  beforeUnmount() {
    this.$eventBus.$off('slideElement:selectionUpdate', this.setSelectedFormatbuttons);
  },

  methods: {
    onBlur(ref) {
      this.$emit('blur', ref);
    },
    focusInput: (refElement) => refElement.focus(),

    onInput(value) {
      this.$emit('input', value);
    },

    onFocus() {
    },

    onToolbarButtonClick(button) {
      switch (button) {
        case 'bold':
          this.$eventBus.$emit('slideElement:toggle', 'bold');
          break;
        case 'italic':
          this.$eventBus.$emit('slideElement:toggle', 'italic');
          break;
        case 'underline':
          this.$eventBus.$emit('slideElement:toggle', 'underline');
          break;
        case 'strikethrough':
          this.$eventBus.$emit('slideElement:toggle', 'strike');
          break;
        case 'subscript':
          this.$eventBus.$emit('slideElement:toggle', 'subscript');
          break;
        case 'superscript':
          this.$eventBus.$emit('slideElement:toggle', 'superscript');
          break;
        case 'add-blank':
          this.$refs.tiptap.insertBlank();
          break;
        default:
      }
    },

    setSelectedFormatbuttons(state) {
      this.selectedTextFormatStyles = state;
    },

    onDeleteButtonClicked() {
      this.$emit('deleteButtonClicked');
    },

    openMediaPreview() {
      this.$eventBus.$emit('mediaPreview:show', this.queryMediaObjects);
    },

    deleteCurrentMedia() {
      this.$emit('deleteCurrentMedia');
    },

    onMediaReEdit() {
      this.$emit('onMediaReEdit');
    },
    openPreview() {
      this.$eventBus.$emit('mediaPreview:show', this.queryMediaObjects);
    },
  },
};
</script>

<style lang="scss" scoped>
  .tip-tap-slim-editor-wrapper {

    .tip-tap-slim-editor {
      height: calc(100% - 36px);
    }

    .media-wrapper {
      .media-container {
        width: 100px !important;
        height: 100px;
        @apply bg-dark-50%;
      }

      .media-action-btn {
        min-width: 46px;
      }
    }
  }
</style>

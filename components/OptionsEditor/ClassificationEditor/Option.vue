<template>
  <transition name="fade">
    <!-- option toolbar -->
    <div
      :class="{
        'border-2 border-light rounded-lg': editMode,
      }"
    >
      <div
        v-if="editMode"
        class="relative"
      >
        <Input
          v-model="optionText"
          :inputId="`name-${optionIndex}`"
          name="name"
          inputType="text"
          class="p-2"
          :placeholder="$i18n('type option name ...')"
          :inputClasses="'bg-transparent focus:bg-transparent !w-2/3'"
          :noBorder="true"
          :noRing="true"
          :maxlength="captionCharLimit"
          autocomplete="off"
          textColorClass="font-semibold text-lg md:text-lg text-light placeholder-light-50%"
          @keydown.enter="() => handleOptionTextChange()"
        />

        <div class="h-14 absolute top-3 right-2 z-10">
          <OptionEditorToolbar
            :props="getOptionToolbarProps"
            :isEditingOptionText="true"
            :forDevice="forDevice"
          />
        </div>
      </div>
      <div
        v-else-if="!editMode"
        class="px-2 py-3 bg-light rounded-lg relative"
        @mouseover="showControls = true"
        @mouseleave="showControls = false"
        @click.stop="isForMobile ? showEditOptionModal = true : null"
      >
        <FA
          v-if="!isForMobile"
          icon="fas fa-grip-dots-vertical"
          class="text-dark-4 p-2 absolute top-3 z-10 bg-light"
          :size="18"
        />
        <!-- show image, will be hidden when option is text type -->
        <div
          v-if="isOptionForImage"
          :class="['option-image-container h-full flex-auto relative w-full']"
        >
          <MediaImage
            class="option-image w-full h-36 overflow-hidden"
            :src="getOptionMedia ? getOptionMedia?.url : ''"
            :objectFit="getOptionMedia?.meta?.layout"
          />
        </div>
        <!-- Image caption tiptap -->
        <div
          v-if="isOptionForImage && (doesOptionForImageHaveCaption || enableCaption)"
          class="option-caption-container relative bottom-0 m-1 bg-transparent left-0"
          :class="[forDevice, {
            'w-full': isContainingDevicePhone,
          }]"
        >
          <Tooltip
            class="w-full h-full"
            v-bind="optionTooltips.captionCharacterLimitErrorTooltip"
          >
            <TipTapMiniEditor
              ref="tiptap"
              :value="getTiptapValueForCaption()"
              theme="light-theme"
              disableLinks
              disableNewLineOnEnter
              class="tiptap-editor w-full h-full text-center overflow-hidden rounded-sm"
              :charLimit="captionCharLimit"
              showErrorForCharLimit
              :editorId="getOptionCaptionEditorId"
              :placeholder="`${$i18n('Caption')}`"
              :class="[forDevice, isContainingDevicePhone ? 'max-h-12 p-1' : 'max-h-15 p-2', {
                'border-lilac-light bg-dark-5% text-dark border': isTipTapEditorForCaptionInFocus,
                'text-dark-5 bg-light': getTiptapValueForCaption()?.isEmpty && !isTipTapEditorForCaptionInFocus,
                'text-dark-4': !getTiptapValueForCaption().isEmpty && !isTipTapEditorForCaptionInFocus,
              }]"
              :autoResizeFontJumps="captionResizeFontJumps"
              @input="onTipTapInputForCaption"
            />
          </Tooltip>
        </div>
        <KatexRenderer
          v-if="doesOptionHaveMath"
          ref="katexRenderer"
          :class="[isForMobile ? 'ml-2' : 'ml-8']"
          :latex="option.math.latex[0]"
          @change="handleMathLatex"
        />
        <!-- show option text -->

        <span
          v-else-if="isOptionForText"
          class="text-dark-2 text-xl font-bold"
          :class="[{
            'text-dark-50% font-normal': !option.text,
            'line-clamp-2 break-all': optionText?.length > 16,
          }, isForMobile ? 'ml-2' : 'ml-8']"
          v-html="getHTMLToRender(option)"
        />

        <div
          v-if="showControls && !isForMobile"
          class="h-14 absolute top-3 right-2 z-10"
        >
          <OptionEditorToolbar
            :props="getOptionToolbarProps"
            :isEditingOptionText="false"
            :forDevice="forDevice"
          />
        </div>
      </div>
      <EditOptionModal
        v-if="showEditOptionModal"
        :editorProps="getOptionToolbarProps"
        @close="showEditOptionModal = false"
      />
    </div>
  </transition>
</template>

<script>
import { nanoid } from 'nanoid';

import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import isBoolean from 'lodash/isBoolean';
import has from 'lodash/has';
import katex from 'katex';

import Constants from '~/config/Constants';

import ClassificationOptionMixin from '~/mixins/ClassificationOptionMixin';

import { getFontSizeRange } from '~/utils/TypographyUtils';
import { isOptionEmpty } from '~/utils/QuizUtils';
import EditOptionModal from '@/components/Classification/EditOptionModal.vue';
import OptionEditorToolbar from './OptionEditorToolbar.vue';

export default {
  components: {
    OptionEditorToolbar,
    EditOptionModal,
  },

  mixins: [ClassificationOptionMixin],

  props: {
    option: {
      type: Object,
      default: () => ({}),
    },

    optionIndex: {
      type: Number,
      required: true,
    },

    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },

    deleteOption: {
      type: Function,
      default: () => { },
    },

    questionType: {
      type: String,
      required: true,
    },

    isOnlyOptionInGroup: {
      type: Boolean,
      default: false,
    },

    handleTargetGroupDeletion: {
      type: Function,
      default: () => { },
    },

    isForMobile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      optionText: this.option.text || '',
      enableCaption: false,
      showControls: false,
      captionCharLimit: 96,
      katex: null,
      isEditing: (!this.isForMobile && isOptionEmpty(this.option)) ?? false,
      showEditOptionModal: false,
    };
  },

  async fetch() {
    this.katex = katex;
  },

  computed: {
    isContainingDeviceDesktop() {
      return this.forDevice === Constants.DeviceTypes.DESKTOP;
    },

    isContainingDeviceTablet() {
      return this.forDevice === Constants.DeviceTypes.TABLET;
    },

    captionResizeFontJumps() {
      if (this.isContainingDeviceDesktop) {
        return getFontSizeRange(20, 14);
      }

      return getFontSizeRange(14, 10);
    },

    editMode() {
      return this.isEditing;
    },

    getOptionCaptionEditorId() {
      return `option-caption-${this.option._id}`;
    },

    isTipTapEditorInFocus() {
      return this.getOptionData().isFocused;
    },

    isTipTapEditorForCaptionInFocus() {
      return this.getOptionData().isCaptionFocused;
    },

    isOptionAboutToExceedCaptionCharLimit() {
      const { text = '' } = this.getTiptapValue();

      return this.$stringUtils.extractContentFromHTML(text).length >= this.captionCharLimit;
    },

    isEmptyOption() {
      return isOptionEmpty(this.option);
    },

    getOptionToolbarProps() {
      return {
        option: this.option,
        optionText: this.optionText,
        handleOptionTextChange: this.handleOptionTextChange,
        deleteOption: this.deleteOption,
        changeOptionToImage: this.changeOptionToImage,
        openMathEditor: this.openMathEditor,
        toggleEditMode: this.toggleEditMode,
        captionCharLimit: this.captionCharLimit,
        toggleOptionCaption: this.toggleOptionCaption,
        isOptionAboutToExceedCaptionCharLimit: this.isOptionAboutToExceedCaptionCharLimit,
        editMath: this.editMath,
        onOptionImageReEdit: this.onOptionImageReEdit,
        questionType: this.questionType,
        isOnlyOptionInGroup: this.isOnlyOptionInGroup,
        handleTargetGroupDeletion: this.handleTargetGroupDeletion,
        onTipTapInputForCaption: this.onTipTapInputForCaption,
        getTiptapValueForCaption: this.getTiptapValueForCaption,
        changeOptionToText: this.changeOptionToText,
        updateOption: this.updateOption,
      };
    },
  },

  watch: {
    option(value) {
      this.optionText = value.text;
    },
  },

  methods: {
    toggleEditMode(off) {
      if (off) {
        this.isEditing = false;
      } else {
        this.isEditing = !this.isEditing;
      }
    },

    getOptionEditorId() {
      return `option-${this.option._id}`;
    },

    getHTMLToRender(option = {}) {
      const { hasMath = false } = option;

      if (hasMath) {
        return this.katexHTML(option.math.latex[0]);
      }

      return option.text ? option.text : this.$i18n('add option here ...');
    },

    katexHTML(content) {
      let latex = content;
      if (typeof latex !== 'string') {
        latex = `${latex}`;
      }
      let katexEle = '';
      try {
        katexEle = this.katex
          ? this.katex.renderToString(latex, {
            displayMode: true,
          })
          : '';
      } catch (err) {
        window.console.error(err);
      }
      return katexEle;
    },

    editMath() {
      this.$refs.katexRenderer?.handleMathEditIntent();
    },

    getTiptapValue() {
      const optionData = this.getOptionData();
      const text = this.getOptionText;

      return {
        text: isEmpty(text) ? this.$constants.TipTap.INITIAL_TIP_TAP_VALUE : text,
        isEmpty: optionData.isTextEmpty,
        isFocused: optionData.isFocused,
      };
    },

    getTiptapValueForCaption() {
      const optionData = this.getOptionData();
      const text = this.getOptionCaptionText;

      return {
        text: isEmpty(text) ? this.$constants.TipTap.INITIAL_TIP_TAP_VALUE : text,
        isEmpty: optionData.isCaptionEmpty,
        isFocused: optionData.isCaptionFocused,
      };
    },

    getOptionData({
      key, isTextEmpty, isMediaEmpty, isCaptionEmpty, isCaptionVisible, isCaptionFocused, isFocused, type,
    } = {}) {
      const { option } = this;
      const isOptTextEmpty = isBoolean(isTextEmpty) ? isTextEmpty : (isEmpty(option.text)
      || option.text === this.$constants.TipTap.INITIAL_TIP_TAP_VALUE);
      const isOptMediaEmpty = isBoolean(isMediaEmpty) ? isMediaEmpty : (this.getOptionMedia === null);

      let isOptCaptionEmpty;
      let isOptCaptionVisibile;

      if (!isOptMediaEmpty) {
        const optionCaptionText = this.getOptionCaptionText;

        isOptCaptionEmpty = isBoolean(isCaptionEmpty) ? isCaptionEmpty : (isEmpty(optionCaptionText));

        isOptCaptionVisibile = isBoolean(isCaptionVisible) ? isCaptionVisible : (!isEmpty(optionCaptionText));
      } else {
        isOptCaptionEmpty = true;
        isOptCaptionVisibile = false;
      }

      const isOptEmpty = isOptTextEmpty && isOptMediaEmpty;
      let typeToUse = 'text';

      if (!isEmpty(type)) {
        typeToUse = type;
      } else if (!isOptMediaEmpty) {
        typeToUse = 'image';
      }

      return {
        key: !isEmpty(key) ? key : nanoid(6),
        type: typeToUse,
        isTextEmpty: isOptTextEmpty,
        isMediaEmpty: isOptMediaEmpty,
        isCaptionEmpty: isOptCaptionEmpty,
        isCaptionVisible: isOptCaptionVisibile,
        isEmpty: isOptEmpty,
        isFocused: isBoolean(isFocused) ? isFocused : false,
        isCaptionFocused: isBoolean(isCaptionFocused) ? isCaptionFocused : false,
      };
    },

    changeOptionToText() {
      const previousOptionData = cloneDeep(this.option);
      const text = this.$stringUtils.extractContentFromHTML(previousOptionData.media[0]?.meta?.text);
      this.updateSingleOptionValue({
        ...this.option, text, media: [], type: 'text',
      }, this.optionIndex);
      this.toggleEditMode(true);
    },

    onOptionImageReEdit() {
      const optionImage = this.getOptionMedia;

      this.$eventBus.$emit('presentationEditor:showImageUpload', { callback: this.onImageUploadComplete.bind(this, true), media: optionImage });
    },

    changeOptionToImage() {
      this.$eventBus.$emit('presentationEditor:showImageUpload', { callback: this.onImageUploadComplete.bind(this, false), media: null });
    },

    onImageUploadComplete(isOnReEdit, media) {
      // TODO: isOnReEdit existing image
      const previousOptionData = cloneDeep(this.option);
      const mediaObj = { ...media };
      if (previousOptionData.type === this.$constants.QuestionStructureTypes.TEXT || !this.doesOptionForImageHaveCaption) {
        const { text } = previousOptionData;
        const { text: captionText = '' } = this.getTiptapValueForCaption();
        if (this.$stringUtils.extractContentFromHTML(text).length <= this.captionCharLimit
          || this.$stringUtils.extractContentFromHTML(captionText).length > 0) {
          mediaObj.meta.text = this.$stringUtils.extractContentFromHTML(text) === '' ? captionText : text;
        }
      }

      if (isOnReEdit) {
        if (isEmpty(mediaObj)) {
          // revert option back to text
          this.changeOptionToText();
          return;
        }
      }

      this.updateSingleOptionValue({
        ...this.option, text: '', media: [mediaObj], type: 'image',
      }, this.optionIndex);
      this.toggleEditMode(true);
    },

    onTipTapInputForCaption(updatedValue) {
      const mediaObj = this.getOptionMedia;
      const media = cloneDeep(mediaObj);

      if (!updatedValue.isEmpty) {
        if (has(media, 'meta')) {
          media.meta.text = updatedValue.text;
        } else {
          media.meta = {
            text: updatedValue.text,
          };
        }
      } else if (has(media, 'meta')) {
        delete media.meta.text;
      }
      this.updateSingleOptionValue({
        ...this.option, text: '', media: [media], type: 'image',
      }, this.optionIndex);
      this.toggleEditMode(true);
    },

    updateSingleOptionValue(option, indexInStoreOptions) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', {
        option,
        index: indexInStoreOptions,
      });

      // validate question after option add/update
    },

    toggleOptionCaption() {
      this.enableCaption = !this.enableCaption;
    },

    getTipTapRef() {
      return this.$refs?.tiptap?.find((tiptap) => tiptap.editorId === this.getOptionEditorId()) || null;
    },

    openMathEditor() {
      this.$eventBus.$emit('presentationEditor:showMathEditor', {
        callback: (latex) => {
          this.handleMathLatex(latex);
          this.toggleEditMode(true);
        },
      });
    },

    handleMathLatex(latex) {
      const updatedOptionData = cloneDeep(this.option);
      updatedOptionData.hasMath = true;
      updatedOptionData.math = {
        latex: [latex],
        template: null,
      };
      updatedOptionData.text = `<p><katex latex="${latex}"></katex>&nbsp;</p>`;
      this.updateSingleOptionValue({ ...this.option, ...updatedOptionData }, this.optionIndex);
    },

    handleOptionTextChange(textFromModal = '') {
      if (textFromModal) {
        // value updated from edit modal
        this.updateSingleOptionValue({ ...this.option, text: textFromModal }, this.optionIndex);
        this.showEditOptionModal = false;
        return;
      }
      if (this.allOptionNames(this.optionIndex).indexOf(this.optionText) !== -1) {
        this.$toasts.add({
          type: Constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Option with this name already exists!'),
        });
        return;
      }
      this.toggleEditMode(true);
      if (this.optionText) {
        if (this.option._id && this.option.text !== this.optionText) {
          this.updateSingleOptionValue({ ...this.option, text: this.optionText }, this.optionIndex);
        }
      }
    },

    updateOption(data) {
      const { media, text } = data;
      if (this.allOptionNames(this.optionIndex).indexOf(text) !== -1) {
        this.$toasts.add({
          type: Constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Option with this name already exists!'),
        });
        return;
      }
      if (isEmpty(media)) {
        this.updateSingleOptionValue({
          ...this.option, text, media: [], type: 'text',
        }, this.optionIndex);
      } else {
        this.updateSingleOptionValue({
          ...this.option, text: '', media: [{ ...media, 'meta.text': text }], type: 'image',
        }, this.optionIndex);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.edit-media {
  position: absolute;
}
</style>

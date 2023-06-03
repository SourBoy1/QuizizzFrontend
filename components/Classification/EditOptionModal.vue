<template>
  <Modal
    size="lg"
    containerClasses="h-full overflow-auto"
    :title="isOptionEmpty ? $i18n('Add Option') : $i18n('Edit Option')"
    :stickToBottom="true"
    :overflowY="false"
    :button1="getButton1Config"
    :button2="getButton2Config"
    :customCloseBtnClasses="'fas fa-trash text-red !bg-red-faded !rounded'"
    :showCloseModalBtn="isOptionEmpty"
    :showCustomCloseModalBtn="!isOptionEmpty"
    dismissOnOverlayClick
    :customCloseBtnClick="handleOptionDeletion"
    @button1-click="handleButton1Click"
    @button2-click="handleButton2Click"
    @close="$emit('close')"
  >
    <div>
      <label>
        <div class="font-semibold text-xs mb-2 ml-1 text-dark-4">
          <i18n>Option Name (optional)</i18n>
        </div>
      </label>
      <Input
        v-model="optionText"
        class="w-full mr-2 rounded"
        :placeholder="$i18n('type option name ...')"
        :maxlength="editorProps.captionCharLimit ?? 96"
        @update:modalValue="(val) => optionText = val"
      />
      <div
        :class="{ 'flex justify-between py-4': showAddImage }"
      >
        <label>
          <div class="font-semibold text-xs my-2 ml-1 text-dark-4">
            <i18n>Image (optional)</i18n>
          </div>
        </label>
        <Button
          v-if="showAddImage"
          :title="$i18n('Add image')"
          type="secondary"
          licon="fas fa-image"
          @click="handleAddImage"
        />
        <div
          v-else
          :class="['border border-dark-6 rounded h-full flex-auto relative w-full']"
        >
          <MediaImage
            class="option-image w-full h-36 overflow-hidden"
            :src="getOptionMedia ? getOptionMedia?.url : ''"
            :objectFit="getOptionMedia?.meta?.layout"
          />
          <Button
            :size="'sm'"
            ticon="fas fa-trash"
            :type="'danger'"
            :class="{
              'tooltip-target': !option.isEmpty,
              'mb-1': isContainingDevicePhone,
              '!absolute top-2 right-2': isOptionForImage,
            }"
            :aria-label="$i18n('Delete option')"
            @click="handleOptionImageDeletion"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { isOptionEmpty } from '@/utils/QuizUtils';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import Constants from '~/config/Constants';
import ClassificationOptionMixin from '~/mixins/ClassificationOptionMixin';

export default {

  mixins: [ClassificationOptionMixin],

  props: {
    editorProps: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['close'],
  data() {
    return {
      option: this.editorProps.option,
      optionText: '',
      imageDeleted: false,
      media: null,
    };
  },
  computed: {
    isOptionEmpty() {
      return isOptionEmpty(this.option);
    },

    getButton1Config() {
      if (!this.isOptionEmpty) {
        return {
          type: 'other',
          title: this.$i18n('Cancel'),
        };
      }
      return null;
    },

    getButton2Config() {
      if (this.isOptionEmpty) {
        return {
          title: this.$i18n('Add'),
          type: 'primary',
          layout: 'full',
        };
      }

      return {
        title: this.$i18n('Save'),
        type: 'primary',
      };
    },

    getOptionText() {
      if (this.doesOptionForImageHaveCaption) {
        const { text: captionText = '' } = this.editorProps.getTiptapValueForCaption();
        return this.$stringUtils.extractContentFromHTML(captionText) ?? '';
      }
      return this.editorProps.optionText;
    },

    showAddImage() {
      return !this.isOptionForImage || this.isOptionEmpty || this.imageDeleted;
    },

    getOption() {
      return this.editorProps.option;
    },
  },

  watch: {
    getOption(newVal) {
      this.option = newVal;
    },
  },

  mounted() {
    this.option = { ...this.getOption };
    this.optionText = this.getOptionText;
    this.media = this.getOptionMedia;
  },

  methods: {
    handleButton1Click() {
      this.$emit('close');
    },

    handleButton2Click() {
      if (this.editorProps.isNewOptionCreation) {
        this.editorProps.createNewOptionFromMobile({
          text: this.optionText,
          media: this.media,
        });
      } else if (this.imageDeleted) {
        this.editorProps.changeOptionToText();
      } else {
        this.editorProps.updateOption({
          text: this.optionText,
          media: this.media,
        });
      }
      this.$emit('close');
    },

    handleOptionDeletion() {
      if (this.isMinNumOptions) {
        return;
      }
      if (this.editorProps.isOnlyOptionInGroup) {
        // delete group
        this.editorProps.handleTargetGroupDeletion();
        return;
      }
      this.editorProps.deleteOption(this.option?._id);
    },

    handleOptionTextUpdation(value) {
      if (this.doesOptionForImageHaveCaption) {
        const updated = {
          text: isEmpty(value) ? Constants.TipTap.INITIAL_TIP_TAP_VALUE : value,
          isEmpty: isEmpty(value),
        };
        return this.editorProps.onTipTapInputForCaption(updated);
      }
      return this.editorProps.handleOptionTextChange(this.optionText);
    },

    handleOptionImageDeletion() {
      this.imageDeleted = true;
    },

    onImageUploadComplete(isOnReEdit, media) {
      if (isEmpty(media)) {
        // revert option back to text
        const previousOptionData = cloneDeep(this.option);
        this.optionText = this.$stringUtils.extractContentFromHTML(previousOptionData.media[0]?.meta?.text);
        this.media = null;
      } else {
        const mediaObj = { ...media };
        mediaObj.meta.text = this.optionText;
        this.media = media;
        this.option.media = [mediaObj];
        this.option.type = 'image';
      }
    },

    onOptionImageReEdit() {
      const optionImage = this.getOptionMedia;

      this.$eventBus.$emit('presentationEditor:showImageUpload', { callback: this.onImageUploadComplete.bind(this, true), media: optionImage });
    },

    changeOptionToImage() {
      this.$eventBus.$emit('presentationEditor:showImageUpload', { callback: this.onImageUploadComplete.bind(this, false), media: null });
    },

    handleAddImage() {
      if (this.isOptionForImage) {
        this.onOptionImageReEdit();
      } else {
        this.changeOptionToImage();
      }
    },
  },
};
</script>

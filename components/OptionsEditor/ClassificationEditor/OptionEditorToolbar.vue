<template>
  <div class="flex gap-1">
    <Button
      v-if="shouldShowSaveButton"
      class="edit-btn relative z-10"
      type="deep-transluscent-light"
      size="lg"
      licon="fas fa-arrow-turn-down-left"
      :aria-label="$i18n('Save')"
      @click.stop="handleSave"
    />

    <Button
      v-if="shouldShowEditButton"
      class="edit-btn relative z-10"
      type="deep-dark"
      size="lg"
      licon="fas fa-pencil"
      :aria-label="$i18n('Edit option text')"
      @click.stop="handleEditBtnAction"
    />

    <Button
      v-if="shouldShowMathButton"
      class="add-math-btn relative z-10"
      :type="isEditingOptionText ? 'deep-transluscent-light' : 'deep-dark'"
      size="lg"
      licon="fas fa-function"
      :aria-label="$i18n('Add an equation to option')"
      @click="props.openMathEditor()"
    />

    <Button
      v-if="shouldShowImageCaptionButton"
      class="tooltip-target"
      :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
      licon="fas fa-comment-alt-lines"
      :aria-label="$i18n('Add caption to image')"
      :type="'deep-dark'"
      @click.stop="props.toggleOptionCaption()"
    />

    <Button
      v-if="shouldShowImageButton"
      :type="isEditingOptionText ? 'deep-transluscent-light' : 'deep-dark'"
      :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
      licon="far fa-image"
      :class="{ 'tooltip-target': !props.option.isEmpty }"
      :aria-label="$i18n('Change option from text to image')"
      @click.stop="handleImageUpload"
    />

    <Button
      v-if="shouldShowDelete"
      v-tooltip="deleteButtonTooltip"
      class="delete-option-btn"
      :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
      ticon="fas fa-trash"
      :type="'deep-dark'"
      :class="{
        'tooltip-target': !props.option.isEmpty,
        'mb-1': isContainingDevicePhone,
      }"
      :aria-label="$i18n('Delete option')"
      @click.stop="handleOptionDeletion"
    />
  </div>
</template>

<script>
import Constants from '~/config/Constants';
import ClassificationOptionMixin from '~/mixins/ClassificationOptionMixin';
import { isOptionEmpty } from '~/utils/QuizUtils';

export default {
  mixins: [ClassificationOptionMixin],
  props: {
    props: {
      type: Object,
      default: () => ({}),
    },
    isEditingOptionText: {
      type: Boolean,
      default: false,
    },
    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },
  },

  data() {
    return {
      option: this.props.option,
      optionText: this.props.optionText,
      focusedDeleteButton: false,
      questionType: this.props.questionType,
    };
  },

  computed: {
    getOption() {
      return this.props.option;
    },

    shouldShowEditButton() {
      return !this.isEditingOptionText && !this.isOptionForImage;
    },

    shouldShowMathButton() {
      return this.isContainingDeviceDesktop && (!this.props.optionText?.length > 0 && !this.isOptionForImage);
    },

    shouldShowImageCaptionButton() {
      return this.isOptionForImage;
    },

    shouldShowImageButton() {
      return (!isOptionEmpty(this.props.option)
      || (this.isEditingOptionText && !this.props.optionText?.length > 0)) && !this.doesOptionHaveMath;
    },

    shouldShowDelete() {
      return !isOptionEmpty(this.props.option) && !this.isEditingOptionText;
    },

    shouldShowSaveButton() {
      return this.isEditingOptionText && this.props.optionText?.length > 0;
    },

    deleteButtonTooltip() {
      let deleteBtn = {
        triggers: ['hover'],
        placement: 'top',
        content: this.$i18n('Delete option'),
      };
      if (this.isMinNumOptions) {
        deleteBtn = {
          content: this.$i18n('You cannot have less than 2 options'),
          theme: 'error-tooltip',
          showOnHover: true,
          placement: 'bottom',
          fallbackPosition: 'left',
          tooltipSize: 'sm',
          triggers: ['hover'],
        };
      } else if (this.props.isOnlyOptionInGroup) {
        deleteBtn = {
          content: this.$i18n('If you delete this option, the group will be removed'),
          theme: 'error-tooltip',
          showOnHover: true,
          placement: 'bottom',
          fallbackPosition: 'left',
          tooltipSize: 'sm',
          triggers: ['hover'],
        };
      }
      return deleteBtn;
    },

    isMinNumOptions() {
      return this.questionOptions.length <= this.$constants.QuestionOptionLimits[this.$constants.SlideTypes.CLASSIFICATION].min;
    },
  },

  watch: {
    getOption(value) {
      this.option = value;
    },
  },

  methods: {
    handleSave() {
      this.props.handleOptionTextChange();
    },
    handleOptionDeletion() {
      if (this.isMinNumOptions) {
        return;
      }
      if (this.props.isOnlyOptionInGroup) {
        // delete group
        this.props.handleTargetGroupDeletion();
        return;
      }
      this.props.deleteOption(this.option?._id);
    },

    handleEditBtnAction() {
      if (this.doesOptionHaveMath) {
        this.props.editMath();
      } else {
        this.props.toggleEditMode();
      }
    },

    handleImageUpload() {
      if (this.isOptionForImage) {
        this.props.onOptionImageReEdit();
      } else {
        this.props.changeOptionToImage('toTextBtn');
      }
    },
  },
};
</script>

import { mapGetters } from 'vuex';

import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

export default {
  data() {
    return {
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentlyFocusedTiptapEditor', 'lastFocusedTiptapEditor', 'currentSlide']),
    ...mapGetters('contentEditor', ['questionEditorDimensions', 'quizType']),
    ...mapGetters('uiManager', ['focussedOptionInDndImage', 'editorSaveValidations']),

    questionAnswer() {
      return this.currentSlide.structure.answer;
    },

    questionOptions() {
      return this.currentSlide.structure.options ?? [];
    },

    questionTargets() {
      return this.currentSlide.structure.targets ?? [];
    },

    isOptionForImage() {
      return this.option?.type === 'image';
    },

    isOptionForText() {
      return !this.isOptionForImage;
    },

    isContainingDeviceDesktop() {
      return this.forDevice === this.$constants.DeviceTypes.DESKTOP;
    },

    isContainingDevicePhone() {
      return this.forDevice === this.$constants.DeviceTypes.PHONE;
    },

    isContainingDeviceTablet() {
      return this.forDevice === this.$constants.DeviceTypes.TABLET;
    },

    getOptionMedia() {
      const mediaObj = this.option?.media && this.option?.media[0];

      return !isEmpty(mediaObj) ? mediaObj : null;
    },

    getOptionText() {
      return this.option?.text || '';
    },

    getOptionCaptionText() {
      return get(this.getOptionMedia, 'meta.text', '');
    },

    doesOptionForImageHaveCaption() {
      return this.getOptionCaptionText?.length > 0 ?? false;
    },

    doesOptionHaveMath() {
      return this.option?.hasMath ?? false;
    },

    shortcutMetaKey() {
      return this.isOSMac ? '\u2318' : 'ctrl';
    },

    optionTooltips() {
      return {
        addEquationBtn: {
          text: this.$i18n('Add equation ({$1} {$2})', [this.shortcutMetaKey, '+ e']), position: this.isContainingDeviceDesktop ? 'top' : 'top-left', showOnHover: true, theme: 'dark',
        },
        optToImageBtn: {
          text: this.$i18n('Change option to image ({$1} + i)', [this.shortcutMetaKey]), theme: 'dark', showOnHover: true, position: 'top-right', fallbackPosition: 'top-left',
        },
        optToTextBtn: {
          text: this.$i18n('Change option to text'), theme: 'dark', showOnHover: true, position: 'top-right', fallbackPosition: 'top-left',
        },
        optImageCaptionBtn: {
          text: this.$i18n('This just in! You can now add a caption to images 🎉'), theme: 'dark', showOnHover: true, position: 'top-right', fallbackPosition: 'top-left',
        },
        deleteBtn: {
          text: this.$i18n('Delete option ({$1} + d)', [this.shortcutMetaKey]), theme: 'dark', showOnHover: true, position: 'top-right', fallbackPosition: 'top-left',
        },
        captionCharacterLimitErrorTooltip: {
          text: this.$i18n('You’ve exceeded the character limit'),
          theme: 'error',
          isVisible: false,
          position: 'top',
          fallbackPosition: 'top',
        },
      };
    },
  },

  methods: {
    allOptionNames(optionIndex) {
      const options = [];
      this.questionOptions.forEach((option, index) => {
        if (index === optionIndex) {
          return;
        }
        options.push(option.text);
      });
      return options;
    },
  },

};

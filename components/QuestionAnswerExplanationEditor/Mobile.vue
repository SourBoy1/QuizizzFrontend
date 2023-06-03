<template>
  <div
    v-if="isEditorForQuizContent"
    class="h-full answer-explanations-container"
  >
    <div
      class="answer-explanation-editor bg-dark-50% rounded-xl w-full h-full flex flex-col overflow-hidden px-2 pb-2"
      :class="{
        'is-bg-dark': isAnswerExplanationsInViewStore || doesSlideHaveAnswerExplanations,
      }"
    >
      <div class="flex flex-col w-full h-full content-wrapper">
        <div
          class="text-editor-container p-2 pt-0 flex-1 rounded-lg border-2 border-light-50%"
          :class="{
            'h-1/2': doesExplanationHaveAnyMedia,
            'h-full': !doesExplanationHaveAnyMedia,
            'border-2 border-light-50% bg-dark-1': isTipTapEditorInFocus,
            'border-dashed': !isTipTapEditorInFocus,
          }"
        >
          <TipTapSlimEditor
            ref="tiptap"
            class="tiptap-editor"
            :showDeleteButton="true"
            :isTipTapEditorInFocus="isTipTapEditorInFocus"
            :value="getTiptapValue"
            :editorId="answerExplainTextEditorId"
            :placeholder="`${$i18n('Type a fun fact or explanation for the correct answer')}...`"
            :doesQuestionHaveAnyMedia="doesExplanationHaveAnyMedia"
            :isQuestionMediaPresent="isExplanationMediaPresent"
            :queryMediaObjects="explanationMediaObjects"
            @input="onTiptapUpdate"
            @deleteButtonClicked="deleteAnswerExplanation"
            @openMathEditor="openMathEditor"
            @deleteCurrentMedia="deleteCurrentMedia"
            @onMediaReEdit="onMediaReEdit"
          />
          <!-- Media addition button -->
          <div
            v-if="!doesExplanationHaveAnyMedia"
            class="w-full flex flex-col align-center text-light-50%"
          >
            <div class="flex mt-3 transition-all duration-300 media-btns">
              <button
                class="flex-1 media-btn"
                :aria-label="$i18n('Add Image to answer explanation')"
                @click="onAddMediaClick('image')"
              >
                <FA
                  icon="fas fa-image"
                  :size="12"
                />
                <i18n>Add image</i18n>
              </button>

              <button
                class="relative flex-1 mx-1 media-btn"
                :aria-label="$i18n('Add Audio to answer explanation')"
                @click="onAddMediaClick('audio')"
              >
                <FA
                  icon="fas fa-microphone-alt mr-1"
                  :size="12"
                />
                <i18n>Audio</i18n>
                <SuperIcon
                  v-if="!$user.isCorporate"
                  :size="9"
                  class="super-icon"
                />
              </button>

              <button
                class="relative flex-1 media-btn"
                :aria-label="$i18n('Add Video to answer explanation')"
                @click="onAddMediaClick('video')"
              >
                <FA
                  icon="far fa-video mr-1"
                  :size="12"
                />
                <i18n>Video</i18n>
                <SuperIcon
                  v-if="!$user.isCorporate"
                  :size="9"
                  class="super-icon"
                />
              </button>
            </div>
          </div>
          <!-- media addition button ends here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import keys from 'lodash/keys';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

export default {

  props: {

    getTiptapValue: {
      type: Function,
      required: true,
    },

    isExplanationMediaPresent: {
      type: Function,
      required: true,
    },

    isExplanationMediaGoogleDriveVideo: {
      type: Boolean,
      default: false,
    },

    explanationMediaGoogleVideoId: {
      type: String,
      default: null,
    },

    isTipTapEditorInFocus: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['updateExplantionValue', 'onTiptapUpdate', 'deleteAnswerExplanation', 'onAddMediaClick', 'setSelectedQuestionElement', 'deleteCurrentMedia', 'onMediaReEdit', 'openMathEditor'],

  data() {
    return {
      tiptapEditor: {
        isEmpty: false,
        isFocused: false,
      },
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps']),
    ...mapGetters('slideEditor', ['currentSlide', 'doesSlideHaveAnswerExplanations']),
    ...mapGetters('contentEditor', ['isEditorForQuizContent', 'isEditorForPresentationContent', 'isAnswerExplanationsInViewStore']),

    answerExplanation() {
      if (this.doesSlideHaveAnswerExplanations) {
        return this.currentSlide.structure.explain;
      }

      return {};
    },

    answerExplainTextEditorId() {
      return 'questionAnswerExplanation';
    },

    doesExplanationHaveAnyMedia() {
      let check = false;

      forEach(this.explanationMediaObjects, (media, type) => {
        if (this.isExplanationMediaPresent(type)) {
          check = true;
        }
      });

      return check;
    },

    explanationMediaObjects() {
      const doesQuestionHaveMedia = (Array.isArray(this.answerExplanation.media) && !isEmpty(this.answerExplanation.media));
      const explanationMediaObjects = {
        image: {},
        audio: {},
        video: {},
      };

      if (doesQuestionHaveMedia) {
        forEach(this.answerExplanation.media, (media) => {
          explanationMediaObjects[media.type] = media;
        });
      }

      return explanationMediaObjects;
    },

    explanationMediaImageLayout() {
      return get(this.explanationMediaObjects, 'image.meta.layout', '');
    },

    mediaTypeAdded() {
      const allMediaTypes = keys(this.explanationMediaObjects);

      for (let i = 0; i < allMediaTypes.length; i++) {
        if (this.isExplanationMediaPresent(allMediaTypes[i])) {
          return allMediaTypes[i];
        }
      }

      return '';
    },
  },

  created() {
    this.updateExplantionValueThrottled = throttle(this.updateExplantionValue.bind(this), 200, { trailing: true });
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 100);
  },

  methods: {
    updateExplantionValue(value) {
      this.$emit('updateExplantionValue', value);
    },

    onTiptapUpdate(value) {
      this.$emit('onTiptapUpdate', value);
    },

    deleteAnswerExplanation() {
      this.$emit('deleteAnswerExplanation');
    },

    toggleExplanationBeingInView() {
      this.$store.dispatch('contentEditor/toggleIsAnswerExplanationsInView');
    },

    onAddMediaClick(mediaType) {
      this.$emit('onAddMediaClick', mediaType);
    },

    setSelectedQuestionElement(elementId = '') {
      this.$emit('setSelectedQuestionElement', elementId);
    },

    deleteCurrentMedia() {
      this.$emit('deleteCurrentMedia');
    },

    onMediaReEdit() {
      this.$emit('onMediaReEdit');
    },

    openMathEditor() {
      this.$eventBus.$emit('openMathEditor');
    },
  },
};
</script>

<style lang="scss" scoped>

.media-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  border-radius: theme('borderRadius.DEFAULT');
  background-color: theme('backgroundColor.light.10%');
  color: theme('textColor.dark.4');
  font-size: theme('fontSize.xs');
  transition: theme('transitionProperty.all');
  transition-duration: theme('transitionDuration.300');
  white-space: nowrap;
  flex-shrink: 0;

  &:hover, &:active {
    transition: 0.2s ease all;
    background-color: theme('backgroundColor.light.20%');
    color: theme('textColor.dark.5');
  }

  &:focus {
    outline: none;
  }

  & > *:last-child {
    line-height: theme('fontSize.sm');
    margin-left: 6px;
  }
  .super-icon {
    @apply absolute right-1;
  }
}

.answer-explanation-editor {
  &.is-bg-dark {
    background-color: theme('backgroundColor.dark.1');
  }

  .tiptap-editor {
    font-size: 16px;
    height: calc(100% - 42px);
  }
}

.tiptap-editor {
  border-style: dashed;

  &:hover, &.in-focus {
    border-style: solid;
  }
}

.delete-current-media, .reedit-media {
  position: absolute;
}

.content-wrapper {
  height: calc(100%);
}
</style>

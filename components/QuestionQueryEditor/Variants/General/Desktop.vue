<template>
  <div
    class="question-query-editor-container relative flex"
    :class="[
      isMediaContainerHidden ? 'when-media-container-hidden' : '',
      isTextContainerHidden ? 'when-text-container-hidden' : '',
      isEquationBasedQuestion ? 'flex-col gap-4' : 'flex-row',
      {
        'flex-row bg-dark-20% rounded-lg p-4': isClassificationQuestion,
      },
    ]"
  >
    <div
      :class="[{
        'query-media-container-equation': isEquationBasedQuestion,
        'query-media-container mr-4': !isEquationBasedQuestion && !isClassificationQuestion,
        'query-media-container-classification mr-6': isClassificationQuestion,
      }]"
      class="flex flex-col justify-center relative transition-all duration-300"
    >
      <div
        v-if="isMediaEditorVisible"
        class="text-light-50% rounded-2xl transition-all duration-300"
        :class="{
          'when-empty-media flex flex-col align-center justify-center bg-light-5%': !isEquationBasedQuestion,
        }"
      >
        <h4 class="m-0 text-2xl text-center empty-media-header">
          <i18n>Add media</i18n>
        </h4>

        <div
          :style="dimensionsForMediaButtons"
          :class="[
            isEquationBasedQuestion ? 'media-btns-equation' : 'media-btns flex flex-row justify-center',
            !isClassificationQuestion ? 'mt-4' : '',
          ]"
          class="transition-all duration-300"
        >
          <button
            class="media-btn"
            :aria-label="$i18n('Add Image to question')"
            :tabindex="85"
            @click="onAddMediaClick('image')"
          >
            <FA
              icon="fas fa-image"
              :size="fontSizeForIcons"
            />
            <i18n v-if="!isClassificationQuestion">
              Image
            </i18n>
          </button>

          <button
            class="relative media-btn"
            :aria-label="$i18n('Add Audio to question')"
            :tabindex="90"
            @click="onAddMediaClick('audio')"
          >
            <FA
              icon="fas fa-microphone-alt"
              :size="fontSizeForIcons"
            />
            <i18n v-if="!isClassificationQuestion">
              Audio
            </i18n>
            <span
              v-if="shouldShowSuperBranding"
              class="absolute -top-2 -right-6"
            >
              <SuperIcon :size="12" />
            </span>
          </button>

          <button
            class="relative media-btn"
            :aria-label="$i18n('Add Video to question')"
            :tabindex="95"
            @click="onAddMediaClick('video')"
          >
            <FA
              icon="far fa-video"
              :size="fontSizeForIcons"
            />
            <i18n v-if="!isClassificationQuestion">
              Video
            </i18n>
            <span
              v-if="shouldShowSuperBranding"
              class="absolute -top-2 -right-6"
            >
              <SuperIcon :size="12" />
            </span>
          </button>
        </div>

        <Button
          v-show="!isTextContainerHidden"
          class="media-hide-btn top-2 right-2"
          :aria-label="$i18n('Hide question media selector')"
          size="lg"
          type="transluscent-light"
          ticon="far fa-chevron-double-left"
          @click="onHideMediaClick"
        />
      </div>

      <div
        v-else-if="doesQuestionHaveAnyMedia"
        :class="[(isTextContainerHidden && isEquationBasedQuestion) ? 'media-wrapper-equation' : 'media-wrapper', isEquationBasedQuestion ? 'ml-15' : '']"
        class="relative w-full h-full flex items-center justify-center"
      >
        <MediaImage
          v-if="isQuestionMediaPresent('image')"
          class="w-full rounded-md"
          :class="isEquationBasedQuestion ? 'h-80' : 'h-full'"
          :src="queryMediaObjects.image.url"
          :objectFit="questionMediaImageLayout"
        />

        <MediaAudio
          v-if="isQuestionMediaPresent('audio')"
          class="w-full h-full"
          :size="getAudioIconSize"
          :src="queryMediaObjects.audio.url"
        />

        <div
          v-if="canVideoBeDisplayed"
          ref="video-container"
          class="w-full"
          :class="isEquationBasedQuestion ? 'h-80' : 'h-full overflow-hidden'"
        >
          <video
            v-if="isGoogleDriveSrcForVideo"
            controls
            playsinline
            class="drive-video"
          >
            <source
              :src="`https://drive.google.com/uc?export=download&id=${googleDriveVideoId}`"
              type="video/mp4"
            >
          </video>
          <MediaYoutube
            v-else
            class="w-full h-full"
            :url="queryMediaObjects.video.url"
            :videoId="youtubeVideoId"
            :start="videoStartTime"
            :end="videoEndTime"
          />
        </div>

        <Button
          v-if="doesQuestionHaveAnyMedia"
          v-tooltip="{ content: $i18n('Remove question media'), placement: 'right' }"
          class="absolute z-10 delete-current-media top-2 right-2 dela"
          size="xl"
          type="secondary"
          ticon="fas fa-trash-alt"
          :aria-label="$i18n('Remove question media')"
          @click="deleteCurrentMedia"
        />

        <Button
          v-if="doesQuestionHaveAnyMedia"
          v-tooltip="{ content: $i18n('Edit question media'), placement: 'right' }"
          class="absolute z-10 reedit-media top-14 right-2"
          size="xl"
          type="secondary"
          ticon="fas fa-pen"
          :aria-label="$i18n('Edit question media')"
          @click="onMediaReEdit"
        />
      </div>
    </div>

    <div
      :class="[isEquationBasedQuestion ? 'query-text-container-equation' : 'query-text-container', isEquationBasedQuestion ? doesQuestionHaveAnyMedia ? 'max-h-82' : 'query-text-height' : '']"
      class="relative flex items-center transition-all duration-300"
    >
      <button
        v-if="isTextContainerHidden"
        class="media-btn z-10"
        :class="isEquationBasedQuestion ? 'ml-55' : '-ml-13'"
        :aria-label="$i18n('Add text to question')"
        @click="onAddTextClick"
      >
        <FA
          icon="fas fa-text"
          :size="36"
        />
        <i18n>Add Text</i18n>
      </button>

      <transition enter-active-class="animate__animated animate__fadeIn anim-300-delay">
        <Button
          v-if="!isTextContainerHidden"
          class="add-math-btn z-10 top-2 right-2 hover:bg-light-33% backdrop-blur-md"
          licon="fas fa-function"
          :aria-label="$i18n('Add an equation to question')"
          :title="$i18n('Insert equation')"
          :tabindex="80"
          rounded="sm"
          customClasses="bg-light-20% text-light-3"
          size="xl"
          type="custom"
          @click="openMathEditor"
        />
      </transition>

      <transition leave-active-class="animate__animated animate__fadeOut">
        <TipTapMiniEditor
          v-show="!isTextContainerHidden"
          ref="tiptap"
          :key="queryEditorId"
          data-cy="question-text"
          :value="getTiptapValue()"
          :editorId="queryEditorId"
          :disableBlankShortcut="isAddBlankDisabled"
          :placeholder="`${$i18n('Type your question here')}...`"
          class="w-full h-full max-w-full px-4 pb-4 overflow-auto text-center border-4 text-light-3 rounded-2xl hover:border-lilac-light"
          :class="{
            'border-transparent': !isTipTapEditorInFocus,
            'border-lilac-light bg-dark-50%': isTipTapEditorInFocus,
            // above 300 characters, text gets hidden behind top CTAs
            'pt-16': getTiptapValue().text.length >= 300,
            'pt-4': getTiptapValue().text.length < 300,
          }"
          :autoResizeFontJumps="queryResizeFontJumps"
          :isBlankEnabled="isInteractiveBlankBasedQuestion"
          @input="onTiptapUpdate"
          @blur="$emit('blur')"
          @undo="$emit('undo')"
        />
      </transition>
    </div>
    <TiptapMakeLinkModal isForQuizEditor />

    <section
      v-if="shouldShowBottomRightActionCenter"
      class="bottom-right-action-center absolute bottom-2 right-4"
    >
      <Button
        v-if="isInteractiveBlankBasedQuestion"
        v-tooltip="addBlankTooltip"
        :disabled="isAddBlankDisabled"
        :applyDisabled="false"
        licon="fas fa-plus-square"
        :title="$i18n('Add a blank')"
        :aria-label="$i18n('Add a blank')"
        rounded="sm"
        size="xl"
        type="transparent"
        @click="handleAdditionOfBlank"
      />
    </section>
  </div>
</template>

<script>
import get from 'lodash/get';
import debounce from 'lodash/debounce';

import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants';
import QueryEditorLayoutMixin from '~/mixins/QueryEditorLayoutMixin';
import {
  isInteractiveBlankBasedQuestion, isDragDropBasedQuestion, isOptionsBasedQuestion, isClassificationQuestion,
} from '~/utils/QuizUtils';
import { isNotPremiumWeek } from '~/utils/FreeweekUtils';

export default {
  mixins: [QueryEditorLayoutMixin],
  emits: ['blur', 'undo', 'updateValue', 'deleteCurrentMedia', 'onMediaReEdit', 'setSelectedQuestionElement', 'onHideMediaClick', 'onAddTextClick', 'focusTipTap', 'evaluateQueryContentVisibility', 'action', 'onAddMediaClick', 'onTiptapUpdate', 'openMathEditor'],

  data() {
    return {
      tipTapFocusTimeout: null,
    };
  },

  computed: {
    googleDriveVideoId() {
      return get(this.queryMediaObjects, 'video.video', '');
    },

    shouldShowSuperBranding() {
      return !this.$user.isCorporate && !this.$user.isPartOfAnOrganization && isNotPremiumWeek();
    },

    isGoogleDriveSrcForVideo() {
      return get(this.queryMediaObjects, 'video.meta.src', null) === 'google-drive';
    },

    shouldShowBottomRightActionCenter() {
      return this.isInteractiveBlankBasedQuestion;
    },

    youtubeVideoId() {
      return get(this.queryMediaObjects, 'video.meta.videoId', null);
    },

    shouldShrinkTheQueryEditor() {
      return [Constants.QuestionTypes.REORDER, Constants.QuestionTypes.MATCH, Constants.QuestionTypes.CLASSIFICATION].includes(this.questionType);
    },

    fontSizeForIcons() {
      if (this.shouldShrinkTheQueryEditor) {
        return 20;
      }

      if (this.isEquationBasedQuestion) {
        return 28;
      }

      return 36;
    },

    addBlankTooltip() {
      const tooltip = {
        triggers: ['hover'],
        placement: 'top-end',
        content: `${this.$i18n('You can also use 2 underscores `__`')} <br/> ${this.$i18n('(Shift + Minus key) to add a blank.')}`,
        theme: 'info-tooltip',
        html: true,
      };

      if (this.isAddBlankDisabled) {
        tooltip.content = this.$i18n('You cannot add more than {$1} blanks', [this.$constants.QuestionOptionLimits[this.questionType].maxBlanks]);
        tooltip.theme = 'error-tooltip';
      }

      return tooltip;
    },

    isEquationBasedQuestion() {
      return this.questionType === this.$constants.QuestionTypes.EQUATION;
    },

    isClassificationQuestion() {
      return isClassificationQuestion({ type: this.questionType });
    },

    isInteractiveBlankBasedQuestion() {
      return isInteractiveBlankBasedQuestion({ type: this.questionType });
    },

    isDragDropBasedQuestion() {
      return isDragDropBasedQuestion({ type: this.questionType });
    },

    dimensionsForMediaButtons() {
      const styleConfig = {
        '--mediaBtnHeight': this.shouldShrinkTheQueryEditor ? '62.4px' : '116px',
        '--mediaBtnWidth': this.shouldShrinkTheQueryEditor ? '128px' : '102px',
        '--mediaBtnContainerHeight': this.shouldShrinkTheQueryEditor ? '50%' : 'auto',
        '--justifyAlignment': this.shouldShrinkTheQueryEditor ? 'space-evenly' : 'center',
        '--flexDirection': this.shouldShrinkTheQueryEditor ? 'row' : 'column',
      };

      if (this.isEquationBasedQuestion) {
        styleConfig['--mediaBtnHeight'] = '80px';
        styleConfig['--mediaBtnWidth'] = 'auto';
      }

      if (this.isClassificationQuestion) {
        styleConfig['--mediaBtnHeight'] = '50px';
        styleConfig['--mediaBtnWidth'] = '50px';
      }

      return styleConfig;
    },

    isAddBlankDisabled() {
      return this.questionQuery?.text?.split('<blank').length - 1 >= this.$constants.QuestionOptionLimits[this.questionType]?.maxBlanks;
    },

    isDndOnImageQuestionType() {
      return this.questionType === Constants.QuestionTypes.DND_IMAGE;
    },

    getAudioIconSize() {
      if (this.isDragDropBasedQuestion) {
        return 180;
      }

      if (this.isClassificationQuestion) {
        return 140;
      }
      return 200;
    },
  },

  mounted() {
    this.tipTapFocusTimeout = setTimeout(() => {
      const tiptapContainer = get(this, '$refs.tiptap.$refs.tiptapContainer', {});
      tiptapContainer.querySelector('.ProseMirror').tabIndex = 100;
      this.$refs.tiptap.focus('end');
    }, 0);
  },

  beforeUnmount() {
    this.tipTapFocusTimeout && clearTimeout(this.tipTapFocusTimeout);
  },

  methods: {
    updateValue(value) {
      this.$emit('updateValue', value);
    },

    deleteCurrentMedia() {
      this.$emit('deleteCurrentMedia');
    },

    onMediaReEdit() {
      this.$emit('onMediaReEdit');
    },

    setSelectedQuestionElement(elementId = '') {
      this.$emit('setSelectedQuestionElement', elementId);
    },

    onHideMediaClick() {
      this.$emit('onHideMediaClick');
    },

    onAddTextClick() {
      this.$emit('onAddTextClick');
    },

    focusTipTap() {
      this.$emit('focusTipTap');
    },

    evaluateQueryContentVisibility(forceShowMediaContainer = false) {
      this.$emit('evaluateQueryContentVisibility', forceShowMediaContainer);
    },

    handleAdditionOfBlank: debounce(function addBlank() {
      if (this.isAddBlankDisabled) {
        return;
      }

      this.$emit('action', 'add-blank');
    }, 250),
  },
};
</script>

<style lang="scss" scoped>
$mediaBtnWidthWhenHidden: 94px;
$mediaBtnWidthForEquation: 197.33px;
$mediaBtnsContainerHeight: 340px;
$mediaBtnsMargin: 8px;
$mediaBtnScaleWhenContainerHidden: 0.8;
.question-query-editor-container {
  width: 100%;
  height: 100%;
}
.query-media-container {
  width: 40%;
  .media-btns {
    width: 486px;
  }
  .media-btn {
    margin: $mediaBtnsMargin;
  }
}
.query-text-container-equation {
  flex: 1 0;
  margin-top: 16px;
}
.query-text-height {
  max-height: 592px;
}
.query-text-container {
  flex: 1 0;
}
.drive-video {
  height: 100% !important;
  width: 100% !important;
}
.query-media-container-equation {
  .empty-media-header {
    display: none;
  }
  .when-empty-media {
    background: transparent;
    padding: 0;
  }
  .media-btns-equation {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .media-hide-btn {
    display: none;
  }
}

.query-media-container-classification {
  .empty-media-header {
    display: none;
  }
  .when-empty-media {
    background: transparent;
    padding: 0;
  }
  .media-btns {
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    gap: 12px;
  }
  .media-hide-btn {
    display: none;
  }
  .media-btn {
    background-color: theme('backgroundColor.light.20%');
  }
}

.when-media-container-hidden .query-media-container {
  width: $mediaBtnWidthWhenHidden;
  .empty-media-header {
    display: none;
  }
  .when-empty-media {
    background: transparent;
    padding: 0;
    width: $mediaBtnWidthWhenHidden;
  }
  .media-btns {
    margin-top: 0;
    width: $mediaBtnWidthWhenHidden;
    height: var(--mediaBtnContainerHeight);
  }
  .media-btn {
    transform: scale($mediaBtnScaleWhenContainerHidden);
    &:first-child {
      transform: translate(calc(100% + #{2 * $mediaBtnsMargin}), calc(-100% + #{$mediaBtnsMargin + 4px})) scale($mediaBtnScaleWhenContainerHidden);
    }
    &:last-child {
      transform: translate(calc(-100% - #{2 * $mediaBtnsMargin}), calc(100% - #{$mediaBtnsMargin + 4px})) scale($mediaBtnScaleWhenContainerHidden);
    }
  }
  .media-hide-btn {
    display: none;
  }
}
.when-text-container-hidden .query-media-container {
  width: 100%;
  margin-right: -$mediaBtnWidthWhenHidden;
}
.when-text-container-hidden .query-text-container {
  flex: initial;
  width: $mediaBtnWidthWhenHidden;
}
.when-empty-media {
  width: 100%;
  height: 100%;
  max-width: 502px;
}
.media-wrapper {
  max-width: 502px;
}
.media-wrapper-equation {
  max-width: 502px;
  height: 592px;
}
.media-btn {
  display: flex;
  flex-direction: var(--flexDirection);
  align-items: center;
  justify-content: var(--justifyAlignment);
  min-height: var(--mediaBtnHeight);
  width: var(--mediaBtnWidth);
  padding: 8px;
  border-radius: theme('borderRadius.xl');
  background-color: theme('backgroundColor.light.5%');
  color: theme('textColor.light.50%');
  font-size: theme('fontSize.xl');
  transition: theme('transitionProperty.all');
  transition-duration: theme('transitionDuration.300');
  flex-shrink: 0;
  &:hover, &:active {
    transition: 0.2s ease all;
    background-color: rgba(#FFF, 0.1);
  }
  &:focus {
    outline: none;
  }
  & > *:last-child {
    line-height: theme('fontSize.2xl');
  }
  span {
    margin: 0 8px ;
  }
}
.add-math-btn {
  position: absolute;
}
.media-hide-btn {
  position: absolute;
}
.cancel-media-redit, .delete-current-media, .reedit-media {
  position: absolute;
}
.anim-300-delay {
  animation-delay: 0.3s;
}
.anim-100-dur {
  animation-duration: 0.1s;
}
.error-tooltip {
  .tooltip-inner {
    background: theme('backgroundColor.red.dark');
    color: theme('colors.light.3');
    font-weight: theme('fontWeight.bold') !important;
    font-size: theme('fontSize.lg') !important;
  }
  .tooltip-arrow {
    border-color: theme('colors.red.dark');
  }
}
</style>

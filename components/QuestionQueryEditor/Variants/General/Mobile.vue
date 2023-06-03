<template>
  <div
    v-if="!isDrawQuestion"
    class="query-text-container relative flex items-center"
  >
    <div
      class="w-full h-full flex flex-col justify-between rounded-lg border-2 border-transparent"
      :class="{
        'border-2 border-transparent border-lilac-light bg-dark-50%': isTipTapEditorInFocus,
      }"
    >
      <TipTapSlimEditor
        ref="tiptap_slim_editor"
        class="editor-height"
        :isTextContainerHidden="isTextContainerHidden"
        :isTipTapEditorInFocus="isTipTapEditorInFocus"
        :value="() => getTiptapValue()"
        :editorId="queryEditorId"
        :autoResizeFontJumps="queryResizeFontJumps"
        :placeholder="`${$i18n('Type your question here')}...`"
        :doesQuestionHaveAnyMedia="doesQuestionHaveAnyMedia"
        :isQuestionMediaPresent="isQuestionMediaPresent"
        :queryMediaObjects="queryMediaObjects"
        :canAddBlank="isInteractiveBlankBasedQuestion"
        :isAddBlankDisabled="isAddBlankDisabled"
        @input="onTiptapUpdate"
        @openMathEditor="openMathEditor"
        @deleteCurrentMedia="deleteCurrentMedia"
        @onMediaReEdit="onMediaReEdit"
        @blur="$emit('blur')"
        @action="$emit('action', $event)"
      />
      <!-- show media buttons -->
      <div
        v-if="!isDrawQuestion"
        class="flex mb-2"
      >
        <div
          v-if="isMediaEditorVisible"
          class="flex w-full"
        >
          <div class="flex w-full">
            <button
              type="button"
              class="media-btn flex-1"
              :aria-label="$i18n('Add Image to question')"
              @click.stop="onAddMediaClick('image')"
            >
              <FA
                class="mr-2"
                icon="fas fa-image"
                :size="16"
              />
              <i18n>Add image</i18n>
            </button>

            <div class="mx-2 border-r-1 border-r-light-20%" />

            <button
              type="button"
              class="media-btn flex-1 mr-1 relative"
              :aria-label="$i18n('Add Audio to question')"
              @click.stop="onAddMediaClick('audio')"
            >
              <FA
                class="mr-2"
                icon="fas fa-microphone-alt"
                :size="16"
              />
              <i18n>Audio</i18n>
              <SuperIcon
                v-if="!$user.isCorporate"
                :size="9"
                class="ml-1 super-icon"
              />
            </button>

            <button
              type="button"
              class="media-btn flex-1 relative"
              :aria-label="$i18n('Add Video to question')"
              @click="onAddMediaClick('video')"
            >
              <FA
                class="mr-2"
                icon="far fa-video"
                :size="16"
              />
              <i18n>Video</i18n>
              <SuperIcon
                v-if="!$user.isCorporate"
                :size="9"
                class="ml-1 super-icon"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QueryEditorLayoutMixin from '~/mixins/QueryEditorLayoutMixin';
import QueryEditorMobileLayoutMixin from '~/mixins/QueryEditorMobileLayoutMixin';

export default {
  mixins: [QueryEditorLayoutMixin, QueryEditorMobileLayoutMixin],
  emits: ['blur', 'action', 'onAddMediaClick', 'onTiptapUpdate', 'openMathEditor', 'updateValue', 'deleteCurrentMedia', 'onMediaReEdit', 'setSelectedQuestionElement', 'onHideMediaClick', 'onAddTextClick', 'focusTipTap', 'evaluateQueryContentVisibility'],
};
</script>

<style lang="scss" scoped>
$mediaBtnWidth: 30%;
$mediaBtnWidthWhenHidden: 94px;
$mediaBtnScaleWhenContainerHidden: 0.8;

.fixed-editor-toolbar {
  -webkit-transform:translateZ(1px);
  -moz-transform:translateZ(1px);
  -o-transform:translateZ(1px);
  transform:translateZ(1px);
}

.question-query-editor-container {
  width: 100%;
  height: 100%;
}

.media-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  white-space: nowrap;
  min-width: fit-content;
  width: $mediaBtnWidth;
  padding: 4px;
  border-radius: theme('borderRadius.DEFAULT');
  background-color: theme('backgroundColor.light.5%');
  color: theme('textColor.light.3');
  font-size: theme('fontSize.xs');
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

  .super-icon {
    @apply absolute right-1;
  }
}

.query-media-container{
  width:100%;
  .media-wrapper{
    max-height: 96px;
    max-width: 128px;
  }
}

.editor-height {
  min-height: 90px;
  height: 196px;
}

.cancel-media-redit, .delete-current-media, .reedit-media {
  position: absolute;
}

</style>

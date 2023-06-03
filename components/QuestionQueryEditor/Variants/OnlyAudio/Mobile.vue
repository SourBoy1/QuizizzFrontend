<template>
  <div class="only-audio-mobile-query-editor">
    <div
      v-if="isQuestionMediaPresent('audio')"
      class="flex justify-center mb-2"
    >
      <MediaAudio
        :size="92"
        :src="queryMediaObjects.audio.url"
      />
    </div>
    <div
      class="tiptap-slim-editor w-full flex flex-col justify-between rounded-lg border-2 border-transparent"
      :class="{
        'border-lilac-light bg-dark-50%': isTipTapEditorInFocus,
        'h-44': !isQuestionMediaPresent('audio'),
        'min-h-17': isQuestionMediaPresent('audio'),
      }"
    >
      <TipTapSlimEditor
        ref="tiptap_slim_editor"
        class="flex flex-col h-full justify-center"
        :isTextContainerHidden="isTextContainerHidden"
        :isTipTapEditorInFocus="isTipTapEditorInFocus"
        :value="() => getTiptapValue()"
        :editorId="queryEditorId"
        :autoResizeFontJumps="queryResizeFontJumps"
        :placeholder="`${$i18n('Type your question here')}...`"
        :canAddBlank="isInteractiveBlankBasedQuestion"
        :isAddBlankDisabled="isAddBlankDisabled"
        @input="onTiptapUpdate"
        @openMathEditor="openMathEditor"
        @deleteCurrentMedia="deleteCurrentMedia"
        @onMediaReEdit="onMediaReEdit"
        @blur="$emit('blur')"
        @action="$emit('action', $event)"
      />

      <div
        class="flex justify-center py-2"
        :class="{
          'flex justify-center': !isQuestionMediaPresent('image'),
          'grid grid-cols-2 gap-2': isQuestionMediaPresent('image') && !isQuestionMediaPresent('audio'),
        }"
      >
        <Button
          v-if="!isQuestionMediaPresent('audio')"
          :title="$i18n('Audio')"
          type="transparent"
          :class="{
            'w-fit': !isQuestionMediaPresent('image'),
          }"
          size="xs"
          licon="fal fa-microphone-alt"
          @click="onAddMediaClick('audio', true)"
        >
          <template #badge>
            <SuperIcon
              :size="9"
              class="ml-2"
            />
          </template>
        </Button>
        <Button
          v-if="isQuestionMediaPresent('image')"
          :title="$i18n('Edit image')"
          type="transparent"
          :class="{
            'w-fit': isQuestionMediaPresent('audio'),
          }"
          size="xs"
          licon="fal fa-edit"
          @click="onAddMediaClick('image', true)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import QueryEditorLayoutMixin from '~/mixins/QueryEditorLayoutMixin';
import QueryEditorMobileLayoutMixin from '~/mixins/QueryEditorMobileLayoutMixin';

export default {
  mixins: [QueryEditorLayoutMixin, QueryEditorMobileLayoutMixin],
  emits: ['blur', 'action', 'onAddMediaClick', 'onTiptapUpdate', 'openMathEditor', 'updateValue', 'deleteCurrentMedia', 'onMediaReEdit', 'setSelectedQuestionElement', 'onHideMediaClick', 'onAddTextClick', 'focusTipTap', 'evaluateQueryContentVisibility'],

  computed: {
    ...mapGetters('contentEditor', ['questionEditorDimensions']),
  },
};
</script>

<style lang="scss">
</style>

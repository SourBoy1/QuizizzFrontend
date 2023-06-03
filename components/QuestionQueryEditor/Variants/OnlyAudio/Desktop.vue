<template>
  <div class="only-audio-query-editor h-full flex flex-col">
    <div class="flex justify-between mb-2">
      <Button
        v-if="!isQuestionMediaPresent('audio')"
        :title="$i18n('Audio')"
        :ariaLabel="$i18n('Audio')"
        licon="fas fa-microphone-lines"
        type="transparent"
        size="xl"
        :tabIndex="85"
        @click="onAddMediaClick('audio', true)"
      >
        <template #badge>
          <SuperIcon class="ml-2" />
        </template>
      </Button>
      <Button
        class="ml-auto"
        :title="$i18n('Insert equation')"
        :ariaLabel="$i18n('Insert equation')"
        licon="fas fa-function"
        type="transparent"
        size="xl"
        :tabIndex="90"
        @click="openMathEditor"
      />
    </div>
    <div
      v-if="isQuestionMediaPresent('audio')"
      class="flex justify-center p-2"
    >
      <MediaAudio
        :tabIndex="85"
        :size="92"
        :src="queryMediaObjects.audio.url"
        canDelete
        @delete="$emit('deleteCurrentMedia', 'audio')"
      />
    </div>
    <transition leave-active-class="animate__animated animate__fadeOut">
      <TipTapMiniEditor
        ref="tiptap"
        data-cy="question-text"
        :value="getTiptapValue()"
        :editorId="queryEditorId"
        :placeholder="`${$i18n('Type your question here')}...`"
        class="w-full h-full overflow-y-auto max-w-full p-4 overflow-auto text-center border-4 text-light-3 rounded-2xl hover:border-lilac-light"
        :class="{
          'border-transparent': !isTipTapEditorInFocus,
          'border-lilac-light bg-dark-50%': isTipTapEditorInFocus,
          'max-h-100': isDndQuestionType,
        }"
        :autoResizeFontJumps="queryResizeFontJumps"
        @input="onTiptapUpdate"
      />
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';

import QueryEditorLayoutMixin from '~/mixins/QueryEditorLayoutMixin';

export default {
  mixins: [QueryEditorLayoutMixin],
  emits: ['deleteCurrentMedia', 'onAddMediaClick', 'onTiptapUpdate', 'openMathEditor'],

  computed: {
    ...mapGetters('contentEditor', ['questionEditorDimensions']),

    isDndQuestionType() {
      return this.questionType === this.$constants.QuestionTypes.DND_IMAGE;
    },
  },

  mounted() {
    this.tipTapFocusTimeout = setTimeout(() => {
      const tiptapContainer = get(this, '$refs.tiptap.$refs.tiptapContainer', {});
      tiptapContainer.querySelector('.ProseMirror').tabIndex = 100;
      this.$refs.tiptap.focus('end');
    }, 0);
  },
};
</script>

<style lang="scss">
</style>

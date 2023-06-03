<template>
  <div class="query-text-container relative flex items-center">
    <div
      class="w-full h-full flex flex-col justify-between rounded-lg border-2 border-transparent"
      :class="{
        'border-2 border-transparent border-lilac-light bg-dark-50%': isTipTapEditorInFocus,
      }"
    >
      <TipTapSlimEditor
        v-show="isSolutionSelected"
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
        @blur="handleTiptapBlur"
      />
      <GraphingBar />
      <GraphSelector />
    </div>
  </div>
</template>

<script>
import GraphingBar from '~/components/QuestionQueryEditor/Widgets/GraphingBar.vue';

import GraphSelector from '~/components/QuestionQueryEditor/Widgets/GraphSelector.vue';

import QueryEditorMixin from '~/mixins/QueryEditorMixin';
import QuestionEditorGraphMixin from '~/mixins/questionEditorGraphMixin';

export default {
  components: {
    GraphingBar,
    GraphSelector,
  },
  mixins: [QueryEditorMixin, QuestionEditorGraphMixin],
};
</script>

<style lang="scss" scoped>

.editor-height {
  min-height: 90px;
  height: 196px;
}

</style>

<template>
  <div class="flex flex-1">
    <div
      v-if="!getGraphComponentReady"
      class="absolute flex flex-1 z-5"
    >
      Getting Ready
    </div>
    <div class="flex flex-col flex-1 min-w-0">
      <MediaContainer
        class="flex transition-all duration-300"
        :class="doesQuestionHaveAnyMedia ? 'h-auto flex-1 pb-2 max-h-1/2 min-w-0' : 'h-0'"
      />

      <GraphingBar />
      <GraphSelector />

      <div
        v-show="isSolutionSelected"
        class="flex flex-1 pt-2 min-h-0"
      >
        <transition leave-active-class="animate__animated animate__fadeOut">
          <TipTapMiniEditor
            ref="tiptap"
            data-cy="question-text"
            :value="getTiptapValue()"
            :editorId="queryEditorId"
            :disableBlankShortcut="isAddBlankDisabled"
            :placeholder="`${$i18n('Type your question here')}...`"
            class="w-full h-full max-w-full p-4 overflow-auto text-center border-4 text-light-3 rounded-lg hover:border-lilac-light"
            :class="{
              'border-lilac-light bg-dark-50%': isTipTapEditorInFocus,
              'border-transparent': !isTipTapEditorInFocus,
            }"
            :autoResizeFontJumps="queryResizeFontJumps"
            @input="onTiptapUpdate"
            @blur="handleTiptapBlur"
            @undo="handleTiptapUndo"
          />
        </transition>
        <TiptapMakeLinkModal isForQuizEditor />
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { mapGetters, mapActions } from 'vuex';

import debounce from 'lodash/debounce';

import QuestionEditorGraphMixin from '~/mixins/questionEditorGraphMixin';
import { isInteractiveBlankBasedQuestion, pushCorrectOptionsIntoBlanks } from '~/utils/QuizUtils';
import QueryEditorMixin from '~/mixins/QueryEditorMixin';
import GraphSelector from '~/components/QuestionQueryEditor/Widgets/GraphSelector.vue';
import GraphingBar from '~/components/QuestionQueryEditor/Widgets/GraphingBar.vue';

import MediaContainer from '~/components/QuestionQueryEditor/Widgets/MediaContainer.vue';

export default {

  components: {
    MediaContainer,
    GraphSelector,
    GraphingBar,
  },

  mixins: [QueryEditorMixin, QuestionEditorGraphMixin],

  data() {
    return {
      tipTapFocusTimeout: null,
    };
  },

  computed: {
    ...mapGetters({
      getGraphComponentReady: 'slideEditor/getGraphComponentReady',
    }),
  },

  watch: {
    numberOfBlanks(curr, prev) {
      // delete option from options editor if deleted in query
      // not waiting for blur
      if (curr < prev) {
        this.syncOptionsWithQueryForBlanks();
      }
    },

    isTipTapEditorInFocus(newVal) {
      if (newVal === true) {
        this.setSelectedQuestionElementDebounced(this.queryEditorId);
      } else {
        // this.setSelectedQuestionElementDebounced('');
      }
    },
  },

  mounted() {
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 100);

    this.$eventBus.$on('queryEditor:syncBlanksToOptions', this.syncOptionsWithQueryForBlanks);
    this.tipTapFocusTimeout = setTimeout(() => {
      const tiptapContainer = get(this, '$refs.tiptap.$refs.tiptapContainer', {});
      tiptapContainer.querySelector('.ProseMirror').tabIndex = 100;
      this.$refs.tiptap.focus('end');
    }, 0);

    this.evaluateQueryContentVisibility();

    if (isInteractiveBlankBasedQuestion({ type: this.questionType })) {
      /**
       * syncs blank ids vs text to store to handle mutations
       * syncs blank ids vs option to store
       */
      const { queryText = '', optionForBlankId = {} } = pushCorrectOptionsIntoBlanks(this.currentSlide);

      const configForBlank = [];
      Object.keys(optionForBlankId).forEach((blankId) => {
        configForBlank.push({
          blankId,
          hasMath: Boolean(optionForBlankId[blankId]?.hasMath),
          value: optionForBlankId[blankId]?.hasMath ? optionForBlankId[blankId].math.latex[0] : optionForBlankId[blankId]?.text ?? '',
        });
      });

      this.setBlankValue(configForBlank);
      this.setFinalBlankOptions(optionForBlankId);

      this.setParsedQuestionQuery({
        ...cloneDeep(this.currentSlide.structure.query),
        text: queryText,
      });
    }
  },

  beforeUnmount() {
    if (this.tipTapFocusTimeout) {
      clearTimeout(this.tipTapFocusTimeout);
    }
    this.$eventBus.$off('queryEditor:syncBlanksToOptions', this.syncOptionsWithQueryForBlanks);
  },

  methods: {
    ...mapActions({
      setParsedQuestionQuery: 'contentEditor/setParsedQuestionQuery',
      setBlankValue: 'uiManager/setBlankValue',
      setFinalBlankOptions: 'uiManager/setFinalBlankOptions',
    }),
  },
};
</script>

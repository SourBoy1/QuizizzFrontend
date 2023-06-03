<template>
  <span class="w-4 h-4 rounded-full my-1 mr-2 relative shrink-0 bg-dark-6" />

  <span
    v-if="doesOptionHaveText(option)"
    :class="['text-sm', isLoading ? 'teleport-loading-state' : '',
             isDarkVariant ? 'text-light' : 'text-dark-2',
             {
               'line-clamp-2 break-all overflow-hidden text-ellipsis': option?.text?.length > 16,
             },
    ]"
    :observe-mutation="'quiz_question_option_' + questionIndex + '_' + index"
    v-html="getParsedOptionText(option)"
  />

  <MediaTile
    v-if="doesOptionHaveMedia(option)"
    class="mr-4"
    size="sm"
    :src="getOptionMedia(option).url"
    :media="getOptionMedia(option)"
    :isLoading="isLoading"
  />

  <span
    v-if="doesOptionHaveMediaImageCaption(option)"
    class="my-auto text-xs text-dark-4"
    v-html="optionMediaImageCaption(option)"
  />
</template>

<script>
import { getHtmlWithMathKatexString } from '~/utils/QuizUtils';

import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import katex from 'katex';

export default {
  name: 'OptionCard',

  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },

    option: {
      type: Object,
      default: () => { },
    },

    answer: {
      type: Array,
      default: () => [],
    },

    shouldShowAnswerOption: {
      type: Boolean,
      default: true,
    },

    questionIndex: {
      type: Number,
      required: true,
    },

    isDarkVariant: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      katex: null,
    };
  },

  async created() {
    this.katex = katex;
  },

  methods: {
    getOptionMedia(option) {
      return get(option, 'media[0]', {});
    },

    doesOptionHaveText(option) {
      return option && (option.text !== '' || option.hasMath);
    },

    doesOptionHaveMedia(option) {
      return !isEmpty(this.getOptionMedia(option));
    },

    doesOptionHaveMediaImageCaption(option) {
      const media = this.getOptionMedia(option);

      return media?.type === 'image' && !isEmpty(this.optionMediaImageCaption(option));
    },

    optionMediaImageCaption(option) {
      const media = this.getOptionMedia(option);
      const caption = get(media, 'meta.text', '');

      return caption;
    },

    getParsedOptionText(option) {
      return this.getHtmlToRender(option.text, false);
    },

    hasMath(text) {
      return (text.toLowerCase().includes('<katex'));
    },

    getHtmlToRender(text) {
      const parsedString = text;

      if (this.hasMath(parsedString)) {
        return this.katex && typeof this.katex.renderToString === 'function' ? getHtmlWithMathKatexString(parsedString, this.katex) : '';
      }

      /** In case white text color is applied it wont be seen on the tile */
      const regex = /color: white/g;
      const html = parsedString.replace(regex, 'color: #222');
      return html;
    },

    getOptionIds(groupId) {
      if (!groupId) {
        return [];
      }
      let res = [];
      this.answer.forEach((item) => {
        if (item.targetId === groupId) {
          res = item.optionId;
        }
      });
      return res;
    },

    groupOptions(groupId) {
      return this.getOptionIds(groupId)?.map((op) => this.options.find((i) => i._id === op));
    },
  },
};
</script>

<style lang="scss" scoped>
.teleport-loading-state {
  color: transparent;
  border-radius: 4px;
  background: #f0efef;
  line-height: 12px;

  >* {
    color: transparent !important;

    >* {
      color: transparent !important;
    }
  }
}
</style>

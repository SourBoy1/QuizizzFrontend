<template>
  <div class="flex flex-col items-center w-full h-full">
    <div
      class="flex question-header"
      :class="{
        'is-desktop': isDesktopView,
        'flex-col': !isDesktopView,
      }"
    >
      <div
        :class="[{
          'w-full': !isDesktopView && !audioMedia,
          'items-center flex-col': !isDesktopView,
          'mr-3': isDesktopView,
        }]"
      >
        <button
          v-if="!audioMedia && isDesktopView"
          :tabindex="95"
          class="flex flex-col text-light-50% items-center justify-center w-18 h-18 rounded-lg bg-light-5% hover:bg-light-10% relative"
          @click="handleAddAudio"
        >
          <FA
            class="mb-2"
            icon="fas fa-microphone-alt"
            :size="24"
          />
          <span class="text-lg"><i18n>Audio</i18n></span>
          <span
            v-if="!$user.isCorporate && isNotPremiumWeek"
            class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4"
          >
            <SuperIcon :size="12" />
          </span>
        </button>

        <Button
          v-if="!audioMedia && !isDesktopView"
          type="transluscent-light-bright"
          :title="$i18n('Insert Audio')"
          size="sm"
          fullWidth
          licon="fas fa-microphone-alt"
          class="mb-1"
          @click="handleAddAudio"
        />

        <div
          v-if="!!audioMedia"
          class="relative audio-play-container w-min"
          :class="[{
            'w-min m-auto': !isDesktopView,
            isDesktop: isDesktopView,
          }]"
        >
          <button
            class="rounded-full bg-light-3 text-dark-2 hover:bg-light-2 active:bg-light-1"
            :class="[{
              'w-14 h-14 mb-1': !isDesktopView,
              'w-18 h-18': isDesktopView,
            }]"
            @click="handleEditAudio"
          >
            <FA
              icon="fas fa-play"
              :size="isDesktopView ? 24 : 18"
            />
          </button>

          <button
            class="absolute flex items-center justify-center rounded-full shadow-md remove -top-1 -right-1 bg-light-3 text-dark-2 "
            :class="[{
              'w-8 h-8 text-red-dark bg-red-faded': !isDesktopView,
              'w-6 h-6 hover:text-red-dark hover:bg-red-faded': isDesktopView,
            }]"
            @click="handleRemoveAudio"
          >
            <FA
              icon="fas fa-times"
              :size="isDesktopView ? 12 : 9"
            />
          </button>
        </div>
      </div>

      <div
        class="query-box bg-purple"
        :class="[{
          'h-18 is-desktop': isDesktopView,
        }]"
      >
        <TipTapMiniEditor
          ref="tiptap"
          :value="getTiptapValue()"
          :editorId="queryEditorId"
          :placeholder="`${$i18n('Type your question here')}...`"
          data-cy="draw-type-question-input"
          class="w-full  text-light-3 text-center rounded-lg md:border-4 border-2 hover:border-lilac-light overflow-auto"
          :class="{
            'border-transparent': isTipTapEditorInFocus,
            'border-lilac-light bg-dark-50%': isTipTapEditorInFocus,
            'p-1 text-base': !isDesktopView,
            'p-2 text-3xl bg-light-5%': isDesktopView,
            'h-full': isDesktopView,
            'h-50': !isDesktopView,
          }"
          @input="onTiptapUpdate"
        />
      </div>
    </div>
    <div
      class="rounded-lg question-body"
      :class="[{
        'bg-dark-20% mt-1': !isDesktopView,
        'bg-light-5% mt-3 is-desktop': isDesktopView,
      }]"
      @mouseenter="mouseInside = true"
      @mouseleave="mouseInside = false"
    >
      <div
        v-if="!hasChoiceBeenMade && !hasImageMedia"
        class="flex flex-col items-center justify-center w-full h-full make-choice"
      >
        <div
          class="msg text-light-50% text-center "
          :class="[{
            'text-base mb-2 ': !isDesktopView,
            'text-3xl w-90 mb-6': isDesktopView,
          }]"
        >
          <i18n>Select the background that participants will draw on</i18n>
        </div>
        <div class="flex buttons">
          <button
            class="flex flex-col text-light-50% items-center justify-center rounded-lg bg-light-5% mr-3 hover:bg-light-10%"
            :class="[{
              'w-24 h-24': !isDesktopView,
              'w-32 h-30': isDesktopView,
            }]"
            data-cy="draw-type-blank-option"
            :tabindex="140"
            @click="chooseBlank()"
          >
            <FA
              class="mb-2"
              icon="far fa-square"
              :size="isDesktopView ? 32 : 24"
            />
            <span class="text-2xl"><i18n>Blank</i18n></span>
          </button>
          <button
            class="flex flex-col text-light-50% items-center justify-center rounded-lg bg-light-5% hover:bg-light-10%"
            :class="[{
              'w-24 h-24': !isDesktopView,
              'w-32 h-30': isDesktopView,
            }]"
            :tabindex="145"
            @click="handleAddImage"
          >
            <FA
              class="mb-2"
              icon="fas fa-image"
              :size="isDesktopView ? 32 : 24"
            />
            <span class="text-2xl"><i18n>Image</i18n></span>
          </button>
        </div>
      </div>
      <div
        v-if="hasChoiceBeenMade || hasImageMedia"
        class="relative w-full h-full bg-center bg-no-repeat bg-contain rounded-lg fake-canvas bg-light-3"
        :style="`background-image: url(${imageMediaURL})`"
      >
        <div
          v-if="mouseInside || !isDesktopView"
          :class="['overlay absolute text-light-3 bg-dark-50% w-full h-full flex justify-center items-center cursor-pointer']"
          @click="showDrawCanvasEditor"
        >
          <div class="flex flex-col items-center justify-center p-20 text-2xl text-center msg">
            <i18n :injections="[isCorporateUser ? 'Participants' : 'Students']">
              {$1} will draw their responses here
            </i18n>
            <Button
              v-if="isDesktopView"
              class="h-10 mt-2 rounded"
              :title="$i18n('Try it out')"
              size="lg"
              type="white"
            />
          </div>
        </div>
        <div class="flex justify-end p-3 buttons-header">
          <div v-if="imageIsBlank">
            <Button
              :title="$i18n('Add image')"
              type="secondary"
              licon="fas fa-image"
              @click="handleAddImage"
            />
          </div>
          <div
            v-else
            class="flex"
          >
            <Button
              class="mr-3"
              :title="$i18n('Replace')"
              type="secondary"
              licon="far fa-edit"
              @click="handleReplaceImage"
            />
            <Button
              :title="$i18n('Remove')"
              type="danger"
              licon="far fa-trash-alt"
              @click="handleRemoveImage"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import debounce from 'lodash/debounce';

import { isNotPremiumWeek } from '~/utils/FreeweekUtils';
import { evaluateMathTemplate } from '../utils/QuizUtils';

import QuestionQuery from '../models/QuestionQuery';

export default {
  emits: [],
  data() {
    return {
      tiptapEditor: {
        isEmpty: true,
        isFocused: false,
      },
      hasChoiceBeenMade: false,
      mouseInside: false,
      tipTapTimeout: null,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlideId', 'currentSlide', 'questionQuery', 'questionQueryMedia']),
    ...mapGetters('contentEditor', ['isEditorForPresentationContent']),
    ...mapGetters('root', ['isDesktop']),

    isDesktopView() {
      return this.isEditorForPresentationContent || this.isDesktop;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    hasImageMedia() {
      return !!this.questionQueryMedia.find((item) => item.type === 'image');
    },

    imageMedia() {
      return this.questionQueryMedia.find((item) => item.type === 'image');
    },

    imageIsBlank() {
      const img = this.questionQueryMedia.find((item) => item.type === 'image');
      return !img || img.url === this.$constants.DrawQuestionBlankImage;
    },

    audioMedia() {
      return this.questionQueryMedia.find((item) => item.type === 'audio');
    },

    imageMediaURL() {
      return this.questionQueryMedia.find((item) => item.type === 'image')?.url || '';
    },

    isTipTapEditorInFocus() {
      return this.tiptapEditor.isFocused;
    },

    queryEditorId() {
      return 'drawQuestionQuery';
    },

    isNotPremiumWeek() {
      return isNotPremiumWeek();
    },
  },

  watch: {
    isTipTapEditorInFocus(newVal) {
      if (newVal === true) {
        this.setSelectedQuestionElementDebounced(this.queryEditorId);
      } else {
        // this.setSelectedQuestionElementDebounced('');
      }
    },
  },

  created() {
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 100);
  },

  mounted() {
    this.tipTapTimeout = setTimeout(() => {
      const tiptapContainer = get(this, '$refs.tiptap.$refs.tiptapContainer', {});
      tiptapContainer.querySelector('.ProseMirror').tabIndex = 100;
      this.$refs.tiptap.focus('end');
    }, 0);
  },

  beforeUnmount() {
    this.tipTapTimeout && clearTimeout(this.tipTapTimeout);
  },

  methods: {
    getTiptapValue() {
      return {
        text: isEmpty(this.questionQuery.text) ? this.$constants.TipTap.INITIAL_TIP_TAP_VALUE : this.questionQuery.text,
        isEmpty: this.tiptapEditor.isEmpty,
        isFocused: this.tiptapEditor.isFocused,
      };
    },

    onTiptapUpdate(value) {
      const { text } = value;
      const { hasMath, math } = evaluateMathTemplate(value.text);

      this.tiptapEditor = {
        isEmpty: value.isEmpty,
        isFocused: value.isFocused,
      };

      if (value.didTextChange) {
        this.updateValue({
          math,
          hasMath,
          text: this.tiptapEditor.isEmpty ? '' : text,
        });
      }
    },

    setSelectedQuestionElement(elementId = '') {
      this.$store.dispatch('slideEditor/setTiptapEditorInFocus', { id: elementId, slideType: this.$constants.QuestionTypes.DRAW });
    },

    updateValue(value = {}) {
      // const updatedQuery = QuestionQuery({
      //   ...this.questionQuery,
      //   ...value,
      // });
      // const allMediaTypesPresent = updatedQuery.media.map((media) => media.type);
      // const isTextEmpty = ;

      // if (!isTextEmpty) {
      //   updatedQuery.type = 'text';
      // }

      // uniq(allMediaTypesPresent).forEach((type) => {
      //   updatedQuery.type += `${isEmpty(updatedQuery.type) ? '' : '_'}${type}`;
      // });

      this.$store.dispatch('slideEditor/updateQuestionQuery', { query: null, rawData: value, isTextEmpty: this.tiptapEditor.isEmpty });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    chooseBlank() {
      const media = {
        type: 'image',
        url: this.$constants.DrawQuestionBlankImage,
        meta: {
          width: 640,
          height: 640,
        },
      };
      this.$store.dispatch('slideEditor/addQuestionQueryMedia', { media });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    handleAddImage() {
      this.$eventBus.$emit('presentationEditor:showImageUpload', {
        callback: (media) => {
          this.$store.dispatch('slideEditor/addQuestionQueryMedia', { media });
        },
      });
    },

    handleRemoveImage() {
      this.$store.dispatch('slideEditor/removeQuestionQueryImageMedia');

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    handleReplaceImage() {
      this.$eventBus.$emit('presentationEditor:showImageUpload', {
        callback: (media) => {
          this.$store.dispatch('slideEditor/addQuestionQueryMedia', { media });
        },
        media: this.imageMedia,
      });
    },

    handleAddAudio() {
      this.$eventBus.$emit('presentationEditor:showAudioUpload', {
        callback: (media) => {
          this.$store.dispatch('slideEditor/addQuestionQueryMedia', { media });
        },
      });
    },

    handleRemoveAudio() {
      this.$store.dispatch('slideEditor/removeQuestionQueryAudioMedia');
    },

    handleEditAudio() {
      this.$eventBus.$emit('presentationEditor:showAudioUpload', {
        callback: (media) => {
          this.$store.dispatch('slideEditor/addQuestionQueryMedia', { media });
          this.$nextTick(() => {
            this.$eventBus.$emit('editor:validateQuestion');
          });
        },
        media: this.audioMedia,
      });
    },

    showDrawCanvasEditor() {
      if (this.isDesktopView) {
        this.$eventBus.$emit('presentationEditor:showDrawCanvasEditor', this.imageMediaURL);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.audio-play-container {
  button.remove {
    &.is-desktop {
      display: none;
    }

  }

  &:hover {
    button.remove {
      display: flex;
    }
  }
}

.query-box {
  width: 100%;

  &.is-desktop {
    min-width: 502px;
    max-width: 1148px;
    width: initial;
  }
}

.question-body {
  max-width: 588px;
  height: 364px;
  width: 100%;

  &.is-desktop {
    width: 588px;
    height: 588px;
  }
}

.question-header {
  width: 100%;

  &.is-desktop {
    width: initial;
  }
}
</style>

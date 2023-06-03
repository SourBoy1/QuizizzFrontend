<template>
  <div class="order-match-editor relative h-full">
    <div
      class="options-container"
      :class="{
        'h-fit md:h-1/2': isForOrderType,
        'h-full': isForMatchType,
        'h-full grid grid-cols-2': !isContainingDeviceDesktop,
      }"
    >
      <draggable
        class="h-full w-full"
        :class="{
          'option-height-for-order': isForOrderType,
          'option-height-for-match': isForMatchType,
          flex: isContainingDeviceDesktop,
          'flex-col mr-0.5': !isContainingDeviceDesktop,
        }"
        v-bind="{
          handle: '.grab-handle',
        }"
        :model-value="options"
        item-key="_id"
        tag="div"
        :force-fallback="true"
        @update:modelValue="handleOptionReorderEnd"
      >
        <template
          #item="{ element, index }"
        >
          <div
            :key="element._id"
            class="w-full"
            :class="{
              'mx-1': isContainingDeviceDesktop,
              'h-22 mt-1 mr-1': !isContainingDeviceDesktop,
              'drop-out': optionBeingDeleted === index,
            }"
            :style="styleForOption"
          >
            <div
              class="option rounded-lg w-full h-full p-1"
              :class="[!isOptionForMedia(element) ? element.bgColor : 'bg-light-3', {
                flex: !isContainingDeviceDesktop,
              }]"
            >
              <div
                class="option-actions-container flex"
                :class="{
                  'h-1/5': isForOrderType && isContainingDeviceDesktop,
                  'h-1/6': isForMatchType && isContainingDeviceDesktop,
                  'flex-col gap-2 mr-1': !isContainingDeviceDesktop,
                }"
              >
                <Button
                  v-if="!isOptionForMedia(element) && isContainingDeviceDesktop"
                  v-tooltip.top="$i18n('Add equation ({$1} + f)', [shortcutMetaKey])"
                  :aria-label="`${$i18n('Add math to')} option ${index + 1}`"
                  licon="far fa-function"
                  type="transparent"
                  :size="isContainingDeviceDesktop ? 'md' : 'xs'"
                  @click="openMathEditor(index)"
                />
                <Button
                  v-else-if="isOptionForMedia(element)"
                  v-tooltip.top="$i18n('Convert option to text')"
                  licon="far fa-text"
                  :aria-label="`${$i18n('Change to text')} option ${index + 1}`"
                  type="other"
                  :size="isContainingDeviceDesktop ? 'md' : 'xs'"
                  class="text-dark-2"
                  @click="convertOptionToText(index)"
                />

                <Button
                  v-if="!isOptionForMedia(element)"
                  v-tooltip.top="$i18n('Change option to image ({$1} + p)', [shortcutMetaKey])"
                  :class="{
                    'ml-1': isContainingDeviceDesktop,
                    'mt-1': !isContainingDeviceDesktop,
                  }"
                  licon="far fa-image"
                  :aria-label="`${$i18n('Change to image')} option ${index + 1}`"
                  :size="isContainingDeviceDesktop ? 'md' : 'xs'"
                  type="transparent"
                  @click="changeOptionToImage(index, 'addImage')"
                />

                <Button
                  class="grab-handle ml-auto cursor-grabbing"
                  :class="{
                    'ml-auto': isContainingDeviceDesktop,
                  }"
                  :size="isContainingDeviceDesktop ? 'md' : 'xs'"
                  :licon="isContainingDeviceDesktop ? 'far fa-grip-horizontal' : 'far fa-grip-vertical'"
                  liconClasses="font-bold"
                  :aria-label="`${$i18n('Drag option')} ${index + 1}`"
                  :type="!isOptionForMedia(element) ? 'transparent' : 'dark'"
                />
              </div>

              <div
                :class="{
                  'h-full w-full': !isContainingDeviceDesktop,
                  'h-4/5': isForOrderType && isContainingDeviceDesktop,
                  'h-5/6': isForMatchType && isContainingDeviceDesktop,
                }"
              >
                <TipTapMiniEditor
                  v-if="!isOptionForMedia(element)"
                  :ref="setTiptapRefs"
                  :data-cy="`m-a-o-answer-${index}`"
                  :value="getTiptapValue(index)"
                  class="tiptap-editor h-full p-2 text-light-3 text-center md:border-4 border-2 overflow-hidden"
                  :editorId="getOptionEditorId(index)"
                  :placeholder="`${$i18n('Answer')} ${index + 1}`"
                  :class="[forDevice, isContainingDevicePhone ? 'rounded text-sm' : 'rounded-lg', {
                    'border-transparent': !isTipTapEditorInFocus(index),
                    'border-lilac-light bg-dark-50%': isTipTapEditorInFocus(index),
                    'bg-dark-10%': !isTipTapEditorInFocus(index),
                    'w-full': isContainingDeviceDesktop,
                    'border-lilac-light': isTipTapEditorInFocus(index),
                    'border-red-light': questionOptionTooltip(element).shown,
                  }]"
                  disableLinks
                  :debounceUpdatesAfterTime="400"
                  :autoResizeFontJumps="optionResizeFontJumps"
                  @blur="handleOptionBlur(index, questionOptionTooltip(element).shown)"
                  @input="onTipTapInput(index, $event)"
                  @keydown="handleKeyDownEvent($event, index)"
                />

                <div
                  v-else
                  :class="['option-image-container relative h-full w-full', forDevice]"
                >
                  <MediaImage
                    class="option-image h-full rounded-lg border-2 border-dark-20% overflow-hidden"
                    :src="getOptionMedia(element).url"
                    :objectFit="getOptionMedia(element).meta.layout"
                  />

                  <div class="absolute top-2 right-2">
                    <Button
                      class="z-10 border-2 border-light-50%"
                      :size="isContainingDeviceDesktop ? 'md' : 'xs'"
                      type="dark"
                      ticon="fas fa-pen"
                      :aria-label="`Change image for option number ${index + 1}`"
                      @click="onEditMediaForOption(index)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </draggable>

      <div
        v-if="isForOrderType"
        class="flex"
        :class="{
          'flex-row': isContainingDeviceDesktop,
          'flex-col': !isContainingDeviceDesktop,
        }"
      >
        <div
          v-for="(option, index) in options"
          :key="index"
          :class="[`option-${index} w-full flex`, {
            'pt-2 mx-1': isContainingDeviceDesktop,
            'h-22 mt-1 ml-1': !isContainingDeviceDesktop,
            'drop-out-order-index': optionBeingDeleted === index,
          }]"
        >
          <div
            v-if="isForOrderType"
            :class="[option.bgColor, {
              'order-index': isContainingDeviceDesktop,
              'order-index-mob': !isContainingDeviceDesktop,
            }]"
            class="relative w-full bg-opacity-70 shadow-inner flex items-center justify-center rounded-lg"
          >
            <div class="delete-button absolute top-2 right-1">
              <Button
                v-tooltip.top="optionTooltips.deleteBtn"
                :aria-label="$i18n('Delete option ') + (index + 1)"
                licon="far fa-trash-alt"
                type="dark"
                :size="isContainingDeviceDesktop ? 'md' : 'xs'"
                :showDisabledStyle="isMinimumOptionLimitReached"
                @click="deleteOption(index)"
              />
            </div>
            <div
              class="text-light-3 font-bold"
              :class="{
                'text-3xl': isContainingDeviceDesktop,
                'text-xl': !isContainingDeviceDesktop,
              }"
            >
              {{ isAscendingOrder ? index + 1 : options.length - index }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isForMatchType && isContainingDeviceDesktop"
        class="flex my-3 justify-center items-center font-bold text-light-33%"
        :class="{
          'h-10 text-3xl': isContainingDeviceDesktop,
        }"
      >
        <i18n>Participants will see shuffled answer options on Match questions</i18n>
      </div>

      <div
        v-if="isForMatchType"
        class="flex w-full"
        :class="{
          'flex-row option-height-for-match': isContainingDeviceDesktop,
          'flex-col ml-0.5': !isContainingDeviceDesktop,
        }"
      >
        <div
          v-for="(match, index) in matches"
          :key="index"
          :class="[`match-${index} w-full flex`, {
            'mx-1': isContainingDeviceDesktop,
            'mt-1 h-22 ml-1': !isContainingDeviceDesktop,
            'drop-out': optionBeingDeleted === index,
          }]"
          :style="styleForOption"
        >
          <div
            class="h-full w-full p-1 flex rounded-lg bg-opacity-70"
            :class="[!options[index] ? '' : options[index].bgColor, {
              'flex-col': isContainingDeviceDesktop,
              'flex-row-reverse': !isContainingDeviceDesktop,
            }]"
          >
            <div
              :class="{
                'h-1/6': isContainingDeviceDesktop,
                'w-7 flex justify-center': !isContainingDeviceDesktop,
              }"
            >
              <Button
                v-tooltip.top="optionTooltips.deleteBtn"
                class="ml-auto"
                type="dark"
                licon="far fa-trash-alt"
                :aria-label="$i18n('Delete option {$1}', [index + 1])"
                :size="isContainingDeviceDesktop ? 'md' : 'xs'"
                :showDisabledStyle="isMinimumOptionLimitReached"
                @click="deleteOption(index)"
              />
            </div>
            <div
              :class="{
                'h-5/6': isContainingDeviceDesktop,
                'mobile-tiptap-editor': !isContainingDeviceDesktop,
              }"
            >
              <TipTapMiniEditor
                :ref="setMatchTiptapRefs"
                v-tooltip="matchTooltip(index)"
                :data-cy="`m-a-o-match-${index}`"
                :value="getTiptapValueForMatches(index)"
                class="tiptap-editor w-full h-full p-2 text-light-3 text-center md:border-4 border-2 overflow-hidden"
                :editorId="getMatchEditorId(index)"
                :placeholder="`${$i18n('Match')} ${index + 1}`"
                :class="[forDevice, isContainingDevicePhone ? 'rounded text-sm' : 'rounded-lg', {
                  'border-red-light': matchTooltip(index).shown && isTipTapEditorInFocus(index, true),
                  'border-lilac-light': !matchTooltip(index).shown && isTipTapEditorInFocus(index, true),
                  'border-lilac-light bg-dark-50%': isTipTapEditorInFocus(index, true),
                  'border-transparent': !isTipTapEditorInFocus(index, true),
                }]"
                disableLinks
                :debounceUpdatesAfterTime="400"
                showErrorForCharLimit
                :charLimit="100"
                :autoResizeFontJumps="optionResizeFontJumps"
                @input="onMatchTipTapInput(index, $event)"
                @blur="handleMatchBlur(index, matchTooltip(index).isForDuplicates)"
                @error="triggerCharLimitForMatch($event, index)"
                @keydown="handleKeyDownEvent($event, index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Button
      v-tooltip.top="addOptionTooltip"
      :size="isContainingDeviceDesktop ? 'xl' : 'md'"
      :fullWidth="!isContainingDeviceDesktop"
      :type="isContainingDeviceDesktop ? 'white' : 'transluscent-light-bright'"
      :title="addOptionCTATitle"
      :rounded="isContainingDeviceDesktop ? 'full' : 'default'"
      licon="fas fa-plus"
      :class="[forDevice, {
        'add-option-btn top-1/2 -right-14 mt-2': isContainingDeviceDesktop,
        'mt-2': !isContainingDeviceDesktop,
      }]"
      :aria-label="$i18n('Add an option')"
      :tabindex="145"
      :disabled="isMaxOptionsCountReached"
      :applyDisabled="false"
      @click="onAddOptionClick"
    />

    <div
      v-if="isForOrderType || !isContainingDeviceDesktop"
      class="flex justify-center items-center font-bold text-light-33%"
      :class="{
        'h-1/2 text-3xl': isContainingDeviceDesktop,
        'text-center text-xl my-2': !isContainingDeviceDesktop,
      }"
    >
      <i18n :injections="[isForMatchType ? 'Match' : 'Reorder']">
        Participants will see shuffled answer options on {$1} questions
      </i18n>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';

import draggable from 'vuedraggable';

import QuestionOption from '~/models/QuestionOption';
import { getFontSizeRange } from '~/utils/TypographyUtils';
import { evaluateMathTemplate, isOptionEmpty } from '~/utils/QuizUtils';
import { browserOS } from '~/utils/Utilities';
import Constants from '~/config/Constants';

const DEFAULT_STARTING_OPTION_NUMS = 5;
export const MINIMUM_OPTIONS_ALLOWED = 3;
export const MAXIMUM_OPTIONS_ALLOWED = 5;

export default {

  components: {
    draggable,
  },

  props: {
    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },
  },
  emits: [],

  data() {
    return {
      options: [],
      matches: [],
      futureIndex: 0,
      movingIndex: 0,
      optionBeingDeleted: -1,
      deleteOptionAnimationTimeout: null,
      editorTabIndexTimeout: null,
      charLimitError: [],

      tiptapRefs: [],
      matchTiptapRefs: [],
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentlyFocusedTiptapEditor', 'lastFocusedTiptapEditor', 'currentSlide', 'sourcePage']),
    questionType() {
      return this.currentSlide.type;
    },

    isForOrderType() {
      return this.questionType === Constants.QuestionTypes.REORDER;
    },

    isForMatchType() {
      return this.questionType === Constants.QuestionTypes.MATCH;
    },

    questionOptions() {
      return this.currentSlide.structure.options ?? [];
    },

    questionAnswer() {
      return get(this.currentSlide, 'structure.answer', []);
    },

    questionMatches() {
      return this.currentSlide.structure.matches;
    },

    totalOptionsVisible() {
      return this.questionOptions.length;
    },

    addOptionCTATitle() {
      if (!this.isContainingDeviceDesktop) {
        return this.isForMatchType ? this.$i18n('Add a matching pair') : this.$i18n('Add an option');
      }

      return '';
    },

    textInOptions() {
      return this.questionOptions.reduce((acc, option) => {
        const text = this.$stringUtils.extractContentFromHTML(option.text).trim();
        if (!text) {
          return acc;
        }
        if (!acc[text]) {
          acc[text] = 0;
        }
        if (text) {
          acc[text] += 1;
        }

        return acc;
      }, {});
    },

    textInMatches() {
      return this.questionMatches.reduce((acc, option) => {
        const text = this.$stringUtils.extractContentFromHTML(option.text).trim();
        if (!text) {
          return acc;
        }
        if (!acc[text]) {
          acc[text] = 0;
        }
        if (text) {
          acc[text] += 1;
        }

        return acc;
      }, {});
    },

    optionTooltips() {
      return {
        deleteBtn: {
          triggers: ['hover'],
          theme: this.isMinimumOptionLimitReached ? 'error-tooltip' : 'tooltip',
          content: this.isMinimumOptionLimitReached
            ? this.$i18n('You can\'t have less than 3 options') : this.$i18n('Delete option ({$1} + d)', [this.shortcutMetaKey]),
        },
      };
    },

    isMaxOptionsCountReached() {
      return this.options.length === MAXIMUM_OPTIONS_ALLOWED;
    },

    styleForOption() {
      if (!this.isContainingDeviceDesktop) {
        return { maxWidth: '100%' };
      }

      return { maxWidth: `calc(${100 / this.options.length}% - 6px)` };
    },

    addOptionTooltip() {
      if (this.isMaxOptionsCountReached) {
        return { triggers: ['hover'], content: this.$i18n('You cannot add more than 5 options'), theme: 'error-tooltip' };
      }

      return { triggers: ['hover'], content: this.$i18n('Add an option') };
    },

    isAscendingOrder() {
      if (this.isForMatchType) {
        return true;
      }

      return this.currentSlide.structure.order === Constants.OrderQuestionArrangement.ASC;
    },

    isContainingDeviceDesktop() {
      return this.forDevice === this.$constants.DeviceTypes.DESKTOP;
    },

    isContainingDeviceTablet() {
      return this.forDevice === this.$constants.DeviceTypes.TABLET;
    },

    isContainingDevicePhone() {
      return this.forDevice === this.$constants.DeviceTypes.PHONE;
    },

    isMinimumOptionLimitReached() {
      return this.options.length === MINIMUM_OPTIONS_ALLOWED;
    },

    isOSMac() {
      return browserOS().isMac;
    },

    shortcutMetaKey() {
      return this.isOSMac ? '\u2318' : 'ctrl';
    },

    optionResizeFontJumps() {
      if (this.isContainingDeviceDesktop) {
        if (this.totalOptionsVisible >= 5) {
          return getFontSizeRange(24, 16);
        }

        return getFontSizeRange(28, 16);
      }

      if (this.isContainingDeviceTablet) {
        if (this.totalOptionsVisible >= 5) {
          return getFontSizeRange(20, 14);
        }

        return getFontSizeRange(20, 14);
      }

      return getFontSizeRange(16, 12);
    },
  },

  created() {
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 250);
    this.initializeOptions();
    this.$eventBus.$on('questionEditor:triggerPreSaveActions', this.preSaveHook);
  },

  mounted() {
    this.updateEditorTabIndex();
  },

  beforeUnmount() {
    if (this.deleteOptionAnimationTimeout) {
      clearTimeout(this.deleteOptionAnimationTimeout);
    }

    if (this.editorTabIndexTimeout) {
      clearTimeout(this.editorTabIndexTimeout);
    }

    // console.info('saved', this.questionAnswer, this.questionOptions.map((q) => q.text), this.questionMatches.map((q) => q.text));

    this.$eventBus.$off('questionEditor:triggerPreSaveActions', this.preSaveHook);
  },

  methods: {
    initializeOptions() {
      const minOptions = this.$constants.QuestionOptionLimits[this.questionType].min;
      const numberOfOptions = this.questionOptions.length < minOptions ? DEFAULT_STARTING_OPTION_NUMS : this.questionOptions.length;
      const options = [];
      const matches = [];

      let optionIndex = 0;

      while (true) {
        const questionIndexForCorrectOrder = this.questionAnswer[optionIndex];
        const optionData = this.questionOptions[questionIndexForCorrectOrder] ?? {};

        options.push({
          ...optionData,
          isEmpty: isEmpty(optionData.text),
          isFocused: false,
          isMediaPresent: !!this.getOptionMedia(optionData),
          indexInStore: this.questionOptions[questionIndexForCorrectOrder] ? questionIndexForCorrectOrder : -1,
          orderedIndex: options.length,
          bgColor: this.getClassesForOption(optionIndex),
        });

        if (this.isForMatchType) {
          const matchesData = this.questionMatches?.[optionIndex] ?? this.cleanupTiptapContextForStore({});

          matches.push({
            ...matchesData,
            isEmpty: isEmpty(matchesData.text),
            isFocused: false,
            indexInStore: this.questionOptions[questionIndexForCorrectOrder] ? optionIndex : -1,
          });
        }

        optionIndex += 1;

        if (optionIndex >= numberOfOptions) {
          break;
        }
      }

      if (this.isForMatchType) {
        this.matches = matches;
      }

      this.options = options;
    },

    setTiptapRefs(el) {
      if (el) {
        this.tiptapRefs.push(el);
      }
    },

    setMatchTiptapRefs(el) {
      if (el) {
        this.matchTiptapRefs.push(el);
      }
    },

    updateEditorTabIndex() {
      this.editorTabIndexTimeout = setTimeout(() => {
        const editors = this.tiptapRefs ?? [];
        const matchEditors = this.matchTiptapRefs ?? [];

        let tabIndex = 101;
        let optionIndex = 0;
        let matchIndex = 0;

        for (const option of this.options) {
          if (!this.isOptionForMedia(option)) {
            const tiptapEditor = editors[optionIndex]?.$refs.tiptapContainer.querySelector('.ProseMirror');
            tiptapEditor.tabIndex = tabIndex;
            optionIndex += 1;
          }
          tabIndex += 1;

          if (this.isForMatchType) {
            const matchEditor = matchEditors[matchIndex]?.$refs.tiptapContainer.querySelector('.ProseMirror');
            matchEditor.tabIndex = tabIndex;
            matchIndex += 1;
            tabIndex += 1;
          }
        }
      }, 0);
    },

    // for keyboard shortcuts
    handleKeyDownEvent(event, visibleOptionIndex) {
      if ((!this.isOSMac && event.ctrlKey) || (this.isOSMac && event.metaKey)) {
        switch (event.key) {
          case 'd':
            event.preventDefault();
            this.deleteOption(visibleOptionIndex);
            break;
          case 'p':
            event.preventDefault();
            this.changeOptionToImage(visibleOptionIndex);
            break;
          case 'f':
            event.preventDefault();
            this.openMathEditor(visibleOptionIndex);
            break;
          default:
            break;
        }
      }
    },

    getClassesForOption(optionIndex) {
      switch (optionIndex) {
        case 0:
          return 'bg-blue';
        case 1:
          return 'bg-brand-b';
        case 2:
          return 'bg-brand-c';
        case 3:
          return 'bg-brand-d';
        case 4:
          return 'bg-brand-e';
        default: return '';
      }
    },

    characterLimitTooltip(matchIndex) {
      const match = this.matches[matchIndex];
      return {
        triggers: [],
        shown: match.isFocused && this.textInOptions[this.$stringUtils.extractContentFromHTML(match.text).trim()] > 1,
        content: this.$i18n('Duplicate option not allowed'),
        theme: 'error-tooltip',
        placement: 'top',
      };
    },

    questionOptionTooltip(option) {
      return {
        triggers: [],
        shown: option.isFocused && this.textInOptions[this.$stringUtils.extractContentFromHTML(option.text).trim()] > 1,
        content: this.$i18n('Duplicate option not allowed'),
        theme: 'error-tooltip',
        placement: 'top',
      };
    },

    matchTooltip(matchIndex) {
      const tooltip = {
        triggers: [],
        theme: 'error-tooltip',
        placement: 'top',
        shown: this.isTipTapEditorInFocus(matchIndex, true),
      };

      const match = this.matches[matchIndex];
      if (this.textInMatches[this.$stringUtils.extractContentFromHTML(match.text).trim()] > 1) {
        return {
          ...tooltip,
          content: this.$i18n('Duplicate matches not allowed'),
          isForDuplicates: true,
        };
      }
      return {
        ...tooltip,
        shown: tooltip.shown && this.charLimitError[matchIndex],
        content: this.$i18n('You\'ve reached the character limit'),
      };
    },

    getTiptapValue(optionIndex) {
      const option = this.options[optionIndex];
      const text = option.text ?? Constants.TipTap.INITIAL_TIP_TAP_VALUE;

      return {
        text,
        isEmpty: !!option.isEmpty,
        isFocused: !!option.isFocused,
      };
    },

    getTiptapValueForMatches(optionIndex) {
      const matchOption = this.matches[optionIndex];
      const text = matchOption.text ?? Constants.TipTap.INITIAL_TIP_TAP_VALUE;

      return {
        text,
        isEmpty: !!matchOption.isEmpty,
        isFocused: !!matchOption.isFocused,
      };
    },

    getOptionEditorId(optionIndex) {
      return `option-${optionIndex}`;
    },

    getMatchEditorId(optionIndex) {
      return `match-${optionIndex}`;
    },

    isTipTapEditorInFocus(optionIndex, isForMatch) {
      if (isForMatch) {
        return this.matches[optionIndex].isFocused;
      }

      return this.options[optionIndex].isFocused;
    },

    getOptionMedia(option) {
      const mediaObj = option.media && option.media[0];

      return !isEmpty(mediaObj) ? mediaObj : null;
    },

    getTipTapRef(index) {
      return this.$refs.tiptap?.find((tiptap) => tiptap.editorId === this.getOptionEditorId(index)) || null;
    },

    cleanupTiptapContextForStore(option) {
      const isTextPresent = !isEmpty(option.text);
      const { isMediaPresent } = option;
      const updatedOption = QuestionOption();

      if (!isTextPresent && !isMediaPresent) {
        return QuestionOption();
      }

      if (isMediaPresent) {
        updatedOption.type = 'image';
        updatedOption.media = [this.getOptionMedia(option)];
      }

      if (isTextPresent) {
        const { hasMath, math } = evaluateMathTemplate(option.text);

        updatedOption.type = 'text';
        updatedOption.text = option.text;
        updatedOption.hasMath = hasMath;
        updatedOption.math = math;
      }

      return updatedOption;
    },

    handleMatchBlur(index, clearMatch) {
      if (clearMatch) {
        this.onMatchTipTapInput(index, {
          text: Constants.TipTap.INITIAL_TIP_TAP_VALUE,
          isEmpty: true,
          isFocused: true,
          didTextChange: true,
        });
      }
      this.setSelectedQuestionElementDebounced('');
    },

    // * input events
    onMatchTipTapInput(index, updatedValue) {
      if (!this.matches[index]) {
        return;
      }

      const { hasMath } = evaluateMathTemplate(updatedValue.text);
      const updatedMatch = {
        ...(this.matches[index] ?? {}),
        hasMath,
        isEmpty: updatedValue.isEmpty,
        isFocused: updatedValue.isFocused,
      };

      if (updatedValue.didTextChange || hasMath) {
        updatedMatch.text = updatedValue.text;
      }

      if (updatedMatch.isFocused) {
        this.setSelectedQuestionElementDebounced(this.getMatchEditorId(index));
      }

      this.matches[index] = updatedMatch;

      const optionToSave = updatedMatch;

      if (!(updatedValue.didTextChange || hasMath)) {
        return;
      }

      if (updatedMatch.indexInStore !== -1) {
        this.updateSingleMatchOptionValue(optionToSave, updatedMatch.indexInStore);
      }
    },

    handleOptionBlur(index, clearOption) {
      if (clearOption) {
        this.onTipTapInput(index, {
          didTextChange: true,
          text: Constants.TipTap.INITIAL_TIP_TAP_VALUE,
          isFocused: true,
        });
      }
      this.setSelectedQuestionElementDebounced('');
    },

    onTipTapInput(index, updatedValue) {
      if (!this.options[index]) {
        return;
      }

      const previousOptionData = this.options[index] ?? {};
      const { hasMath } = evaluateMathTemplate(updatedValue.text);
      const updatedOption = {
        ...previousOptionData,
        hasMath,
        isEmpty: isEmpty(updatedValue.text) || updatedValue.text === Constants.TipTap.INITIAL_TIP_TAP_VALUE,
        isFocused: updatedValue.isFocused,
      };

      if (updatedOption.isFocused) {
        this.setSelectedQuestionElement(index);
      }

      if (updatedOption.isFocused) {
        this.setSelectedQuestionElementDebounced(this.getOptionEditorId(index));
      }

      if (updatedValue.didTextChange || hasMath) {
        updatedOption.text = updatedValue.text;
      }

      this.options[index] = updatedOption;

      if (updatedValue.didTextChange || hasMath) {
        this.checkAndUpdateOptions(index);
      }
    },

    // * input events end

    openMathEditor(index) {
      /**
       * We refocus the editor because we want the math to always be inserted at the end of text as refocussing puts the
       * cursor at the end of the text
       * We do NOT refocus when questionTextEditor is(or was last element) already focused because we do not want the
       * user to loose the place they are on.
       */

      const optionEditorId = this.getOptionEditorId(index);
      const shouldRefocusBeforeInsertion = (
        this.currentlyFocusedTiptapEditor.id !== optionEditorId
        && this.lastFocusedTiptapEditor.id !== optionEditorId
      );

      this.$eventBus.$emit('presentationEditor:showMathEditor', {
        callback: (latex) => {
          const ref = this.getTipTapRef(index);

          if (shouldRefocusBeforeInsertion && ref) {
            ref.focus();
          }
          this.$eventBus.$emit('questionEditor:insertMath', {
            elementId: optionEditorId,
            latex,
          });
          this.checkAndUpdateOptions(index);
        },
        closeCallback: () => {
          this.$eventBus.$emit('questionEditor:closeMathEditor', {
            elementId: optionEditorId,
          });
        },
      });
    },

    isOptionForMedia(option) {
      return option.isMediaPresent;
    },

    changeOptionToImage(index) {
      const previousOptionData = this.options[index];
      const updatedOptionData = {
        indexInStore: previousOptionData.indexInStore,
        bgColor: previousOptionData.bgColor,
      };

      const optionImage = this.getOptionMedia(this.options[index]);

      this.$eventBus.$emit('presentationEditor:showImageUpload', { callback: this.onImageUploadComplete.bind(this, index, updatedOptionData), media: optionImage });
    },

    onImageUploadComplete(visibleOptionIndex, updatedOptionData, media) {
      const optionToAddMediaTo = updatedOptionData;
      const hasImageBeenDeleted = isEmpty(media?.url);

      if (hasImageBeenDeleted) {
        this.convertOptionToText(visibleOptionIndex);
        return;
      }

      const updatedOption = {
        ...optionToAddMediaTo,
        media: [media],
        type: 'image',
        isMediaPresent: !!media,
      };

      this.options[visibleOptionIndex] = updatedOption;

      this.checkAndUpdateOptions(visibleOptionIndex);
    },

    convertOptionToText(optionIndex) {
      const previousOptionData = this.options[optionIndex];
      let updatedOptionData = {
        isMediaPresent: false,
        indexInStore: previousOptionData.indexInStore,
        bgColor: this.getClassesForOption(optionIndex),
      };

      const storeConsumableOption = this.cleanupTiptapContextForStore(updatedOptionData);

      updatedOptionData = { ...storeConsumableOption, ...updatedOptionData };

      this.options[optionIndex] = updatedOptionData;

      this.checkAndUpdateOptions(optionIndex);
    },

    setSelectedQuestionElement(elementId = '') {
      this.$store.dispatch('slideEditor/setTiptapEditorInFocus', { id: elementId, slideType: this.questionType });
    },

    handleOptionMove(e) {
      const { index, futureIndex } = e.draggedContext;
      this.movingIndex = index;
      this.futureIndex = futureIndex;
      return false; // disable sort
    },

    handleOptionReorderEnd(reorderedOptions) {
      this.options = reorderedOptions;
      const answer = [];
      reorderedOptions.forEach((option) => {
        if (option.indexInStore === -1) {
          return;
        }

        answer.push(option.indexInStore);
      });

      this.updateAnswerValue(answer);

      if (this.isForMatchType) {
        const matches = [...this.matches];
        const matchesToSaveInStore = [];

        reorderedOptions.forEach((option, index) => {
          matches[index].indexInStore = option.indexInStore;

          if (option.indexInStore > -1) {
            matchesToSaveInStore.push(this.cleanupTiptapContextForStore(matches[index]));
          }
        });

        this.matches = matches;
        this.updateMatchesForQuestion(matchesToSaveInStore);
      }
    },

    shiftFocusToEditorByIndex(index) {
      this.$refs.tiptap?.[index]?.focus('end');
    },

    onAddOptionClick() {
      if (this.isMaxOptionsCountReached) {
        return;
      }

      const freshOption = QuestionOption();
      this.options.push({
        ...freshOption,
        indexInStore: -1,
        bgColor: this.getClassesForOption(this.options.length),
        isEmpty: true,
        isFocused: true,
        addressInStore: -1,
      });

      if (this.isForMatchType) {
        this.matches.push({
          ...freshOption,
          isEmpty: true,
          isFocused: false,
          addressInStore: -1,
        });
      }

      this.$nextTick(() => {
        this.shiftFocusToEditorByIndex(this.options.length - 1);
      });
    },

    deleteOption(optionIndex) {
      const indexInStoreOfOptionBeingDeleted = this.options[optionIndex].indexInStore;
      if (this.isMinimumOptionLimitReached) {
        return;
      }

      // update the corresponding data properties
      const options = [...this.options];

      this.optionBeingDeleted = optionIndex;
      const matches = cloneDeep(this.matches);

      if (indexInStoreOfOptionBeingDeleted !== -1) {
        for (let index = 0; index < options.length; index++) {
          options[index].indexInStore -= options[index].indexInStore === -1 || options[index].indexInStore < indexInStoreOfOptionBeingDeleted ? 0 : 1;
          options[index].bgColor = this.getClassesForOption(index < optionIndex ? index : index - 1);

          if (this.isForMatchType) {
            matches[index].indexInStore = options[index].indexInStore;
          }
        }
      }

      options.splice(optionIndex, 1);
      matches.splice(optionIndex, 1);

      this.deleteOptionAnimationTimeout = setTimeout(() => {
        this.optionBeingDeleted = -1;
        this.options = options;
        this.matches = matches;

        // updating options, matches and answer in the store if option is saved
        if (indexInStoreOfOptionBeingDeleted !== -1) {
          const optionsInStore = [...this.questionOptions];
          optionsInStore.splice(indexInStoreOfOptionBeingDeleted, 1);

          let matchesInStore = [];
          if (this.isForMatchType) {
            matchesInStore = [...this.questionMatches];
            matchesInStore.splice(indexInStoreOfOptionBeingDeleted, 1);
          }

          const answer = [];
          options.forEach((option) => {
            if (option.indexInStore === -1) {
              return;
            }

            answer.push(option.indexInStore);
          });

          this.$store.dispatch('slideEditor/updateMultipleQuestionProperties', { options: optionsInStore, matches: matchesInStore, answer });

          this.validateQuestion();
        }

        this.$nextTick(() => {
          this.shiftFocusToEditorByIndex(options.length - 1);
        });
      }, 500); // delay for the delete animation to pan out
    },

    onEditMediaForOption(optionIndex) {
      this.changeOptionToImage(optionIndex);
    },

    checkAndUpdateOptions(optionIndex) {
      const optionToSync = { ...this.options[optionIndex] };
      const optionToSave = this.cleanupTiptapContextForStore(optionToSync);

      if (optionToSync.indexInStore === -1) {
        const optionsSynced = [...this.questionOptions];
        optionsSynced.push(optionToSave);

        optionToSync.indexInStore = optionsSynced.length - 1;

        this.options[optionIndex] = optionToSync;

        if (this.isForMatchType) {
          const matchToUpdate = { ...this.matches[optionIndex] };
          const currentMatches = [...this.questionMatches];

          matchToUpdate.indexInStore = optionToSync.indexInStore;
          currentMatches.splice(optionToSync.indexInStore, 0, this.cleanupTiptapContextForStore(matchToUpdate));

          this.matches[optionIndex] = matchToUpdate;

          this.updateMatchesForQuestion(currentMatches);
        }

        const answer = [...this.questionAnswer];
        answer.push(optionToSync.indexInStore);
        this.updateAnswerValue(answer);

        this.updateOptionsForQuestion(optionsSynced);
        return;
      }
      this.updateSingleOptionValue(optionToSave, optionToSync.indexInStore);
    },

    triggerCharLimitForMatch(errorContext, matchIndex) {
      this.charLimitError[matchIndex] = errorContext.charLimit;
    },

    // * removing invalid options in pre save hook
    preSaveHook() {
      const finalOptions = [];
      const finalMatches = [];
      const answer = [];
      for (const index in this.questionOptions) {
        let match = {};
        if (this.isForMatchType) {
          match = { ...this.questionMatches[index] };
        }
        const correspondingOption = { ...this.questionOptions[this.questionAnswer[index]] };

        if (isOptionEmpty(correspondingOption)) {
          continue;
        }

        finalOptions.push(correspondingOption);

        if (this.isForMatchType) {
          finalMatches.push(match);
        }
        answer.push(finalOptions.length - 1);
      }

      if (finalOptions.length !== this.questionOptions.length) {
        this.$store.dispatch('slideEditor/updateMultipleQuestionProperties', { options: finalOptions, matches: finalMatches, answer });
      }
    },

    // ! store actions
    updateSingleOptionValue(option, indexInStore) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', {
        option,
        index: indexInStore,
      });

      this.validateQuestion();
    },

    updateSingleMatchOptionValue(match, indexInStore) {
      this.$store.dispatch('slideEditor/updateSingleMatchOption', {
        match,
        index: indexInStore,
      });

      this.validateQuestion();
    },

    updateAnswerValue(answer) {
      this.$store.dispatch('slideEditor/updateQuestionAnswer', { answer });

      this.validateQuestion();
    },

    updateMatchesForQuestion(matches) {
      this.$store.dispatch('slideEditor/updateQuestionMatches', { matches });
    },

    updateOptionsForQuestion(options) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options });

      this.validateQuestion();
    },

    validateQuestion() {
      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },
  },
};
</script>

<style lang="scss">
</style>

<style lang="scss" scoped>
$orderIndexHeight: 50px;
$matchInfoHeight: 64px;
$orderOptionHeight: calc(100% - $orderIndexHeight);
$matchOptionHeight: calc(50% - $matchInfoHeight / 2);

.option-height-for-order {
  height: $orderOptionHeight;
}

.option-height-for-match {
  height: $matchOptionHeight;
}

.order-index {
  height: $orderIndexHeight;
}

.add-option-btn {
  position: absolute;
}

.option-chosen-class {
  transition: transform 0.2s ease-in-out;
  transform: scale(1) translateY(-16px);
  opacity: 1;
  z-index: 999;
}

.option-drag-class {
  transition: transform 0.2s ease-in-out;
  transform: scale(1);
  opacity: 1;
  z-index: 999;
}

.drop-out {
  animation: drop-out-opacity 500ms ease-out infinite;
}

.drop-out-order-index {
  animation: drop-out-opacity-order 500ms ease-out infinite;
}

.mobile-tiptap-editor {
  width: calc(100% - 28px);
}

@media screen and ( max-width: 1025px ) {
  .option-chosen-class {
    transform: scale(1);
  }
}

@keyframes drop-out-opacity {
  from {
    transform: translateY(0);
    opacity: 1;
  }

  to {
    transform: translateY(110%);
    opacity: 0;
  }
}

@keyframes drop-out-opacity-order {
  from {
    transform: translateY(0);
    opacity: 1;
  }

  to {
    transform: translateY(400%);
    opacity: 0;
  }
}

</style>

<template>
  <div
    ref="optionsContainer"
    :class="['question-options-editor-container relative h-full w-full flex flex-col', forDevice]"
  >
    <!-- Clear the suggestons will only be displayed after the suggestions are generated using auto generator functionality  -->

    <div
      v-if="canShowOptionsGeneratorSwitch && !isBasicUser"
      class="text-light-66% text-lg w-full h-12 flex justify-end items-center gap-3 -ml-2 mb-5 absolute"
    >
      <div
        class="text-lg font-bold h-12 generate-btn flex justify-center items-center rounded-md absolute -top-16 z-10 px-1 cursor-pointer"
      >
        <div
          class="flex items-center px-2 gap-3"
          @click="setOptionsGenerator(!showAutoFillDistractors)"
        >
          <Switchbox
            inputId="showAutoFillDistractors"
            :aria-label="$i18n('Allow the usage of options generator')"
            size="md"
            :value="showAutoFillDistractors"
            backgroundColor="light"
            :disabled="true"
          />
          <span
            class="text-center"
          ><i18n>Suggest Incorrect Options</i18n></span>
          <FA
            v-tooltip.top="{ content: $i18n('Quizizz will automatically suggest incorrect options whenever possible'), classes: 'w-32' }"
            icon="fas fa-info-circle"
            :size="20"
            class="text-light-50%"
          />
        </div>
      </div>
    </div>

    <div
      v-if="canShowOptionsGenerator && isBasicUser"
      class="text-light-66% text-lg w-full h-12 flex justify-end items-center gap-3 -ml-2 mb-5 absolute"
    >
      <transition
        appear
        enter-active-class="animate__animated animate__fadeInUp animation-duration-200"
        leave-active-class="animate__animated animate__fadeOutDown animation-duration-200"
      >
        <div
          class="text-lg font-bold h-12 generate-btn flex justify-center hover:bg-light-50% items-center rounded absolute -top-16 z-10 px-1"
          :class="[getOptionsGeneratorTooltip ? 'cursor-not-allowed' : 'cursor-pointer']"
          @click="getAutoFillOptions"
        >
          <div
            class="flex items-center px-2"
          >
            <FA
              icon="fas fa-wand-magic-sparkles"
              class="text-light-66% font-bold mr-3"
              :size="24"
            />
            <span class="text-center"><i18n>Generate Incorrect Options</i18n></span>
            <span
              v-if="isBasicUser"
              class="border-1 border-yellow rounded-md flex justify-center items-center bg-light px-2 py-2 ml-2"
            >
              <FA
                icon="fas fa-bolt-lightning"
                :size="16"
                class="text-yellow"
              />
            </span>
          </div>
        </div>
      </transition>
    </div>

    <transition-group
      mode="in-out"
      tag="ul"
      class="options-container flex h-full w-full"
      :style="optionsContainerStyles"
      enter-active-class="animate__animated animate__fadeInRight"
      :leave-active-class="animationForLeaveClass"
    >
      <li
        v-for="(option, index) in optionsData"
        ref="optionContainer"
        :key="option.key"
        class="option-container relative p-1"
        :style="optionStyles"
        :class="[
          `opt-num-${index + 1}`, forDevice, {
            'when-poll-question': isQuestionTypePoll,
            'when-image-option': isOptionForImage(index),
            'w-full': !shouldShowDesktopView,
          },
        ]"
      >
        <div
          class="option-inner relative w-full h-full flex"
          :class="[forDevice, {
            'rounded-tr-3xl': isQuestionTypeMCQ && isContainingDeviceDesktop,
            'rounded-br-2xl': isQuestionTypeMCQ && !isContainingDeviceDesktop,
            'flex-col rounded-xl': shouldShowDesktopView,
            'flex-row rounded': !shouldShowDesktopView,
          }]"
        >
          <div
            v-if="!isMobile"
            :class="['option-toolbar flex', forDevice, {
              'space-x-2': shouldShowDesktopView,

            }] "
          >
            <PopoverConfirmer
              :ref="`DeleteButtonOption${index + 1}`"
              class="relative z-10"
              type="danger"
              placement="top"
              trigger="manual"
              :content="{
                title: $i18n('Are you sure you want to delete this answer option?'),
              }"
              :button2="{
                title: $i18n('Delete (\u23CE)'),
              }"
              :open="focusedDeleteButton === `DeleteButtonOption${index + 1}`"
              :disabled="option.isEmpty"
              :autoHide="false"
              @button1Clicked="focusedDeleteButton = null"
              @button2Clicked="deleteOption(index, 'popoverBtn')"
            >
              <ButtonWithTooltip
                class="delete-option-btn"
                :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
                ticon="fas fa-trash-alt"
                :type="isOptionForImage(index) ? 'dark' : 'transparent'"
                :class="{
                  'tooltip-target': !option.isEmpty,
                  'mb-1': isContainingDevicePhone,
                }"
                :aria-label="$i18n('Delete option number {$1}', index + 1)"
                :disabled="isMinNumOptions || autoFillingAllOptionsLoader"
                :tooltip="optionTooltips[index].deleteBtn"
                @click="deleteOption(index, 'deleteBtn')"
              />
            </PopoverConfirmer>

            <PopoverConfirmer
              v-if="isOptionForText(index)"
              class="relative z-10"
              type="danger"
              placement="top"
              :content="{
                title: $i18n('The entered text will be removed'),
                subTitle: $i18n('You can then add a smaller image caption under {$1} characters.', [captionCharLimit]),
              }"
              :button2="{
                title: $i18n('Change to image'),
              }"
              :disabled="!isOptionAboutToExceedCaptionCharLimit(index)"
              @button2Clicked="changeOptionToImage(index, 'popoverBtn')"
            >
              <ButtonWithTooltip
                type="transparent"
                :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
                licon="far fa-image"
                :class="{ 'tooltip-target': !option.isEmpty }"
                :tooltip="optionTooltips[index].optToImageBtn"
                :disabled="autoFillingAllOptionsLoader"
                :aria-label="$i18n('Change option number {$1} from text to image', index + 1)"
                @click="changeOptionToImage(index, 'toTextBtn')"
              />
            </PopoverConfirmer>

            <PopoverConfirmer
              v-if="isOptionForImage(index)"
              class="relative z-10"
              type="danger"
              placement="top"
              :content="{
                title: $i18n('Are you sure?'),
                subTitle: $i18n('You will lose the image and will have to re-upload it'),
              }"
              :button2="{
                title: $i18n('Change to text'),
              }"
              @button2Clicked="changeOptionToText(index)"
            >
              <ButtonWithTooltip
                class="tooltip-target"
                :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
                licon="fas fa-text"
                :aria-label="$i18n('Change option number {$1} from image to text', index + 1)"
                :type="isOptionForImage(index) ? 'dark' : 'transparent'"
                :disabled="autoFillingAllOptionsLoader"
                :tooltip="optionTooltips[index].optToTextBtn"
              />
            </PopoverConfirmer>

            <ButtonWithTooltip
              v-if="isOptionForImage(index)"
              class="tooltip-target"
              :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
              licon="fas fa-comment-alt-lines"
              :disabled="autoFillingAllOptionsLoader"
              :aria-label="$i18n('This just in! You can now add a caption to images 🎉')"
              :type="doesOptionForImageHaveCaption(index) ? 'primary' : 'dark'"
              :tooltip="optionTooltips[index].optImageCaptionBtn"
              @click="toggleOptionCaption(index)"
            />

            <ButtonWithTooltip
              v-if="shouldShowMathButton(index)"
              class="add-math-btn relative z-10"
              type="transparent"
              size="lg"
              licon="fas fa-function"
              :disabled="autoFillingAllOptionsLoader"
              :tooltip="optionTooltips[index].addEquationBtn"
              :aria-label="$i18n('Add an equation to option number {$1}', index + 1)"
              @click="openMathEditor(index)"
            />

            <Tooltip
              v-if="!isQuestionTypePoll && shouldShowDesktopView"
              v-bind="optionTooltips[index].markAnswerBtn"
              class="mark-option-as-correct-tooltip relative z-10"
            >
              <button
                :data-cy="`mark-option-as-correct-button-${index}`"
                class="mark-option-as-correct border-light bg-dark-50% rounded-full flex items-center justify-center hover:text-light"
                :class="[isOptionMarkedAsCorrect(index) ? 'bg-green text-light' : 'text-light-50%', {
                  'is-for-msq': isQuestionTypeMSQ,
                  'border-dark-50%': isOptionForImage(index),
                  'mark-answer-nudge': nudgeForMarkingAnswer && isDesktop,
                  'w-9 h-9 border-3': isContainingDeviceDesktop,
                  'w-6 h-6 border-2': !isContainingDeviceDesktop,
                }]"
                :disabled="autoFillingAllOptionsLoader"
                @click="toggleOptionCorrectness(index)"
              >
                <FA
                  icon="fas fa-check"
                  :size="isContainingDeviceDesktop ? 18 : 10"
                />
              </button>
            </Tooltip>
          </div>

          <div
            class="option-content-container relative flex flex-col h-auto"
            :class="[forDevice, [canShowGeneratedOptionsResult ? 'mx-0' : 'mx-1'], {
              'has-text pb-1': doesOptionForImageHaveCaption(index),
              'show-generated-options': canShowGeneratedOptionsResult,
            }]"
          >
            <!-- show tiptap editor, will be hidden when option is image type -->
            <div
              v-if="isOptionForText(index)"
              class="option-text-container h-full flex-auto"
              :class="[forDevice, {
                'pt-2': shouldShowDesktopView && !isOptionsGeneratorUsed,
                'w-full': isContainingDevicePhone,
              }]"
            >
              <div
                v-if="isDesktop"
                class="w-full h-full flex flex-col relative"
              >
                <template v-if="!autoFillingAllOptionsLoader">
                  <TipTapMiniEditor
                    ref="tiptap"
                    :data-cy="`question-option-${index}`"
                    disableLinks
                    :value="getTiptapValue(index)"
                    class="tiptap-editor w-full h-full p-2 text-light-3 text-center border-2 md:border-4 overflow-hidden"
                    :editorId="getOptionEditorId(index)"
                    :placeholder="getPlaceHolderValue"
                    :class="[forDevice, isContainingDevicePhone ? 'rounded text-sm' : 'rounded-2xl', {
                      'border-transparent': !isTipTapEditorInFocus(index),
                      'border-lilac-light bg-dark-50%': isTipTapEditorInFocus(index),
                    }, (canShowGeneratedOptionsResult && getOptionTextFromIndex(index).length === 0) && generatedOptionsMap[index] && '!h-[50%]']"
                    :autoResizeFontJumps="optionResizeFontJumps"
                    @input="onTipTapInput(index, $event)"
                    @blur="onTiptapBlur($event, index)"
                    @focus="onFocusTipTap(index)"
                    @keydown.tab="$event => onTipTabBlurUsingTab($event, index)"
                  />
                  <transition
                    appear
                    enter-active-class="animate__animated animate__fadeInUp animation-duration-600"
                    leave-active-class="animate__animated animate__fadeOutDown animation-duration-600"
                  >
                    <div
                      v-if="canShowGeneratedOptionsResult && getOptionTextFromIndex(index).length === 0 && generatedOptionsMap[index]"
                      class="tiptap-editor w-[105%] h-[50%] absolute bottom-0 -ml-[7px] -mb-[7px] p-4 bg-light-33% rounded-b-xl text-light-3 flex flex-col gap-[20px] justify-start items-center cursor-pointer overflow-hidden hover:bg-light-20%"
                      @click="useGeneratedOption(index, 'button')"
                    >
                      <div
                        v-if="isBasicUser"
                        class="flex items-center p-2 rounded bg-dark-5% border-1 border-dark-10%"
                      >
                        <span class="text-center font-bold"><i18n>Use Suggestion</i18n></span>
                        <span
                          v-if="isBasicUser"
                          class="border-1 border-yellow rounded-md flex justify-center items-center bg-light px-1 py-1 ml-2 hover:bg-light-75%"
                        >
                          <FA
                            icon="fas fa-bolt-lightning"
                            :size="14"
                            class="text-yellow"
                          />
                        </span>
                      </div>
                      <div
                        v-else
                        class="flex gap-1 justify-center items-center text-sm font-bold text-light-50%"
                      >
                        <FA
                          icon="fas fa-hand-pointer"
                          size="11"
                        />
                        <i18n> to use suggestion </i18n>
                      </div>
                      <transition
                        appear
                        enter-active-class="animate__animated animate__fadeInUp animation-duration-600"
                        leave-active-class="animate__animated animate__fadeOutDown animation-duration-600"
                      >
                        <TipTapMiniEditor
                          disableLinks
                          class="text-2xl font-bold overflow-scroll generated-option text-center !cursor-pointer"
                          :class="generatedOptionsMap[index].length > 35 && '!text-base'"
                          :value="getTiptapGeneratedOptionsValue(generatedOptionsMap[index])"
                          :editorId="getOptionEditorId(index)"
                          :autoResizeFontJumps="optionResizeFontJumps"
                          :readOnlyMode="isGeneratedOptionKatex(getTiptapGeneratedOptionsValue(generatedOptionsMap[index]))"
                        />
                      </transition>
                    </div>
                  </transition>
                  <div
                    v-if="isAutoGenerateAllOptionsVisible && index === 0"
                    ref="autoGenerateAllOptionsContainer"
                    class="w-full absolute bottom-4 flex px-3"
                    :class="[showMinifiedAllOptionsGeneratorBtn ? 'justify-end' : 'justify-center']"
                  >
                    <Button
                      v-tooltip.top="showMinifiedAllOptionsGeneratorBtn ? $i18n('Auto-generate all options [BETA]') : ''"
                      class="relative"
                      :class="{ 'bounce-button': showBounceForGenerateAllOptionsButton && !showMinifiedAllOptionsGeneratorBtn }"
                      :aria-label="$i18n('Auto-generate all options')"
                      :title="showMinifiedAllOptionsGeneratorBtn ? '' : $i18n('Auto-generate all options')"
                      licon="far fa-wand-magic-sparkles"
                      type="transparent"
                      size="md"
                      @click="getAutoFillAllOptions"
                    >
                      <template #badge>
                        <span
                          v-if="!showMinifiedAllOptionsGeneratorBtn"
                          class="absolute -top-2 -right-1 bg-light-1 text-dark-3 rounded px-2 text-tn"
                        >
                          {{ $i18n('BETA') }}
                        </span>
                      </template>
                    </Button>
                  </div>
                </template>

                <div
                  v-else
                  class="w-full h-full flex flex-col gap-8 justify-center items-center"
                >
                  <FA
                    icon="fas fa-wand-magic-sparkles"
                    class="text-light-3 options-gen-loading-icon-animation"
                    :size="24"
                  />

                  <span class="text-light-50%">
                    <i18n>Generating options</i18n>
                  </span>
                </div>
              </div>
              <TipTapSlimEditor
                v-else
                ref="tiptap"
                :refValue="`tiptap_option_${index}`"
                class="h-full border-1 border-transparent rounded"
                :class="{
                  'border-light-50% bg-dark-80%': isTipTapEditorInFocus(index),
                }"
                :isTipTapEditorInFocus="isTipTapEditorInFocus(index)"
                :value="() => getTiptapValue(index)"
                :editorId="getOptionEditorId(index)"
                :placeholder="getPlaceHolderValue"
                :autoResizeFontJumps="optionResizeFontJumps"
                @input="onTipTapInput(index, $event)"
                @openMathEditor="openMathEditor(index)"
              />
            </div>

            <!-- show image, will be hidden when option is text type -->
            <div
              v-if="isOptionForImage(index)"
              :class="['option-image-container h-full flex-auto relative w-full pt-2', forDevice, {
                'pt-2': shouldShowDesktopView,
              }]"
            >
              <MediaImage
                class="option-image w-full h-full rounded-xl border-2 border-dark-20% overflow-hidden"
                :src="getOptionMediaFromIndex(index) ? getOptionMediaFromIndex(index).url : ''"
                :objectFit="getOptionMediaFromIndex(index) ? getOptionMediaFromIndex(index).meta.layout : 'contain'"
              />

              <Button
                class="reedit-media z-10 top-4 right-2 border-2 border-light-50%"
                :size="isContainingDeviceDesktop ? 'xl' : 'md'"
                type="dark"
                ticon="fas fa-pen"
                :aria-label="$i18n('Change image for option number {$1}', index + 1)"
                @click="onOptionImageReedit(index)"
              />
            </div>
          </div>

          <!-- Image caption tiptap -->
          <div
            v-if="isOptionForImage(index) && doesOptionForImageHaveCaption(index) "
            class="option-caption-container absolute bottom-0 m-1 bg-light left-0"
            :class="[forDevice, {
              'w-full': isContainingDevicePhone,
            }]"
          >
            <Tooltip
              class="w-full h-full"
              v-bind="optionTooltips[index].captionCharacterLimitErrorTooltip"
            >
              <TipTapMiniEditor
                ref="tiptap"
                :value="getTiptapValueForCaption(index)"
                theme="light-theme"
                disableLinks
                disableNewLineOnEnter
                class="tiptap-editor w-full h-full text-center overflow-hidden rounded-sm"
                :charLimit="captionCharLimit"
                :editorId="getOptionCaptionEditorId(index)"
                :placeholder="`${$i18n('Caption')}`"
                :class="[forDevice, isContainingDevicePhone ? 'max-h-12 p-1' : 'max-h-15 p-2', {
                  'border-lilac-light bg-dark-5% text-dark border': isTipTapEditorForCaptionInFocus(index),
                  'text-dark-5 bg-light': getTiptapValueForCaption(index).isEmpty && !isTipTapEditorForCaptionInFocus(index),
                  'text-dark': !getTiptapValueForCaption(index).isEmpty && !isTipTapEditorForCaptionInFocus(index),
                }]"
                :autoResizeFontJumps="captionResizeFontJumps"
                @input="onTipTapInputForCaption(index, $event)"
              />
            </Tooltip>
          </div>

          <div class="flex flex-col justify-end ">
            <!-- buttons for mobile display -->
            <div v-if="isMobile && (focusedOptionIndex === index || isOptionForImage(index))">
              <ButtonWithTooltip
                v-if="isOptionForImage(index)"
                class="tooltip-target mb-1 z-10"
                :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
                licon="fas fa-comment-alt-lines"
                :aria-label="$i18n('This just in! You can now add a caption to images 🎉')"
                :type="doesOptionForImageHaveCaption(index) ? 'primary' : 'dark'"
                :tooltip="optionTooltips[index].optImageCaptionBtn"
                @click="toggleOptionCaption(index)"
              />

              <!-- change option from image to text -->
              <PopoverConfirmer
                v-if="isOptionForImage(index)"
                class="relative z-10"
                type="danger"
                placement="top"
                :content="{
                  title: $i18n('Are you sure?'),
                  subTitle: $i18n('You will lose the image and will have to re-upload it'),
                }"
                :button2="{
                  title: $i18n('Change to text'),
                }"
                @button2Clicked="changeOptionToText(index)"
              >
                <ButtonWithTooltip
                  class="tooltip-target"
                  :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
                  licon="fas fa-text"
                  :aria-label="$i18n('Change option number {$1} from image to text', index + 1)"
                  :type="isOptionForImage(index) ? 'dark' : 'transparent'"
                  :tooltip="optionTooltips[index].optToTextBtn"
                />
              </PopoverConfirmer>
              <!-- delete option button -->
              <PopoverConfirmer
                :ref="`DeleteButtonOption${index + 1}`"
                class="relative z-10"
                type="danger"
                placement="top"
                trigger="manual"
                :content="{
                  title: $i18n('Are you sure you want to delete this answer option?'),
                }"
                :button2="{
                  title: $i18n('Delete (\u23CE)'),
                }"
                :open="focusedDeleteButton === `DeleteButtonOption${index + 1}`"
                :disabled="option.isEmpty"
                :autoHide="false"
                @button1Clicked="focusedDeleteButton = null"
                @button2Clicked="deleteOption(index, 'popoverBtn')"
              >
                <ButtonWithTooltip
                  class="delete-option-btn"
                  :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
                  ticon="fas fa-trash-alt"
                  :type="isOptionForImage(index) ? 'dark' : 'transparent'"
                  :class="{
                    'tooltip-target': !option.isEmpty,
                    'mb-1': isContainingDevicePhone,
                  }"
                  :aria-label="$i18n('Delete option number {$1}', index + 1)"
                  :disabled="isMinNumOptions"
                  :tooltip="optionTooltips[index].deleteBtn"
                  @click="deleteOption(index, 'deleteBtn')"
                />
              </PopoverConfirmer>
              <!-- Change to image option -->
              <PopoverConfirmer
                v-if="isOptionForText(index)"
                class="relative z-10"
                type="danger"
                placement="top"
                :content="{
                  title: $i18n('The entered text will be removed'),
                  subTitle: $i18n('You can then add a smaller image caption under {$1} characters.', [captionCharLimit]),
                }"
                :button2="{
                  title: $i18n('Change to image'),
                }"
                :disabled="!isOptionAboutToExceedCaptionCharLimit(index)"
                @button2Clicked="changeOptionToImage(index, 'popoverBtn')"
              >
                <ButtonWithTooltip
                  type="transparent"
                  :size="isContainingDeviceDesktop ? 'lg' : 'xs'"
                  licon="far fa-image"
                  :class="{ 'tooltip-target': !option.isEmpty }"
                  :tooltip="optionTooltips[index].optToImageBtn"
                  :aria-label="$i18n('Change option number {$1} from text to image', index + 1)"
                  @click="changeOptionToImage(index, 'toTextBtn')"
                />
              </PopoverConfirmer>
            </div>
            <Tooltip
              v-if="!isQuestionTypePoll && !shouldShowDesktopView"
              v-bind="optionTooltips[index].markAnswerBtn"
              class="mark-option-as-correct-tooltip relative z-10"
            >
              <button
                class="mark-option-as-correct border-light bg-dark-50% rounded-full flex items-center justify-center hover:text-light mt-1"
                :class="[isOptionMarkedAsCorrect(index) ? 'bg-green text-light' : 'text-light-50%', {
                  'is-for-msq': isQuestionTypeMSQ,
                  'border-dark-50%': isOptionForImage(index),
                  'mark-answer-nudge': nudgeForMarkingAnswer && isDesktop,
                  'w-9 h-9 border-3': isContainingDeviceDesktop,
                  'w-6 h-6 border-2': !isContainingDeviceDesktop,
                }]"
                @click="toggleOptionCorrectness(index)"
              >
                <FA
                  icon="fas fa-check"
                  :size="isContainingDeviceDesktop ? 18 : 10"
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </li>
    </transition-group>

    <div
      class="flex"
    >
      <slot />
      <Button
        v-tooltip.top="addOptionTooltip"
        :size="isContainingDeviceDesktop ? 'xl' : 'md'"
        :type="isContainingDeviceDesktop ? 'white' : 'transparent'"
        :title="!isContainingDeviceDesktop ? $i18n('Add option') : ''"
        :rounded="isContainingDeviceDesktop ? 'full' : 'default'"
        :fullWidth="false"
        licon="fas fa-plus"
        data-cy="add-more-options-button"
        :class="['add-option-btn mt-2', forDevice]"
        :aria-label="$i18n('Add an option')"
        :tabindex="145"
        :disabled="isMaxNumOptions"
        :applyDisabled="false"
        @click="onAddOptionClick"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import { nanoid } from 'nanoid';

import has from 'lodash/has';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import remove from 'lodash/remove';
import get from 'lodash/get';
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import includes from 'lodash/includes';

import removeHTMLTags, { handleGeneratedOptionsKatex } from '~/utils/removeHTMLTags';

import { browserOS } from '~/utils/Utilities';

import SuggestionService from '~/services/SuggestionService';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import { getAccountType } from '~/utils/UserUtils';
import LocalStorage from '~/services/LocalStorage';
import { isServer } from '~/utils/EnvUtils';
import { asyncDelay } from '../services/PausableTimers';
import { getFontSizeRange } from '../utils/TypographyUtils';
import { evaluateMathTemplate, doesQuestionHaveAnAnswer, isOptionEmpty } from '../utils/QuizUtils';
import QuestionOption from '../models/QuestionOption';
import Constants from '../config/Constants';

export const DEFAULT_STARTING_OPTION_NUMS = 4;
const MINIMUM_OPTIONS_ALLOWED = 2;

export default {
  emits: ['deleteOption', 'addOption'],
  props: {

    questionType: {
      type: String,
      required: true,
    },

    questionSettings: {
      type: Object,
      required: true,
    },

    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },

    questionEditorModalRef: {
      type: isServer() ? Object : HTMLDivElement,
      default: () => {},
    },

    isSaveButtonFocused: {
      type: Boolean,
      default: false,
    },

    currentQuestion: {
      type: Object,
      default: () => ({}),
      required: true,
    },

    setGeneratedOptionsForCurrentSlide: {
      type: Function,
      default: () => {},
    },
  },

  data() {
    return {
      optionsData: [],
      optionsDataForAutofill: [],
      optionValidationErrors: {},
      addOptionBtnErrors: [],
      nudgeForMarkingAnswer: false,
      focusedDeleteButton: null,
      editorTabIndexTimeout: null,
      addOptionsClickTimeout: null,
      focusedOptionIndex: null,
      imageUploadedForOptionIndex: null,
      imageUploadedForOptionTimeout: null,
      captionCharLimit: 40,
      imageCaptionCharLimitOptionIndex: -1,
      imageCaptionCharLimitOptionIndexTimeout: null,
      allOptionsGeneratorObserver: null,
      canShowOptionsGeneratorFeature: false,
      canShowAllOptionsGeneratorFeature: false,
      showMinifiedAllOptionsGeneratorBtn: false,
      showBounceForGenerateAllOptionsButton: false,
      showBounceForGenerateAllOptionsTimer: false,
      hasViewedAutoGenerateAllOptionsButtonYet: false,
      hideAutoGenerateAllOptionsButtonDueToError: false,
      showAutoFillDistractors: false,
      isOptionsGeneratorUsed: false,
      autoFillingDistractors: false,
      autoFillingAllOptionsLoader: false,
      correctOptionsText: '',
      rateTheSuggestionDone: false,
      clearSuggestionDone: false,
      generatedOptionsIndexesInStore: [],
      generatedOptionsIndexesUsed: [],
      isOptionsGenInfoHovered: false,
      generatedOptionsMap: {},
      isOptionGeneratorShown: false,
      resizeOptionFont: false,
      subjectForGeneratedOptions: null,
      isOptionsApiCallInProgress: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop', 'isMobile']),
    ...mapGetters('uiManager', ['editorSaveValidations']),
    ...mapGetters('slideEditor', ['currentlyFocusedTiptapEditor', 'lastFocusedTiptapEditor', 'currentSlide']),
    ...mapGetters('contentEditor', ['quizId', 'getSubjectForGeneratedOptions']),

    canShowOptionsGeneratorSwitch() {
      if (!this.isDesktop || !this.canShowOptionsGeneratorFeature) {
        return false;
      }
      const mediaInQuestion = this.currentQuestion.structure.query.media;
      const mediaInOptions = this.optionsData[0]?.isMediaEmpty;

      if (!mediaInOptions || mediaInQuestion.length > 0) {
        return false;
      }
      return this.isQuestionTypeMCQ && !this.isQuestionTypePoll;
    },

    isAutoGenerateAllOptionsVisible() {
      return this.isDesktop && this.isQuestionTypeMCQ && this.canShowAllOptionsGeneratorFeature && this.areAllOptionsEmpty && !this.isQuestionTextEmpty && !this.hideAutoGenerateAllOptionsButtonDueToError;
    },

    areAllOptionsEmpty() {
      return !this.optionsData.some((optionData) => !optionData.isEmpty);
    },

    isQuestionTextEmpty() {
      return removeHTMLTags(this.currentQuestion?.structure?.query?.text).length === 0;
    },

    canShowGeneratedOptionsResult() {
      return this.showAutoFillDistractors && this.isOptionsGeneratorUsed;
    },

    canShowOptionsGenerator() {
      if (!this.isQuestionTypeMCQ || this.isQuestionTypePoll || !this.isDesktop || !this.canShowOptionsGeneratorFeature) {
        return false;
      }
      if (this.showAutoFillDistractors && this.isQuestionTypeMCQ && !this.isOptionsGeneratorUsed && this.isDesktop) {
        HotjarService.triggerEvent(HotjarEvents.GENERATE_INCORRECT_OPTIONS);
      }

      const questionText = this.currentQuestion.structure.query.text;
      const mediaInQuestion = this.currentQuestion.structure.query.media;
      const mediaInOptions = this.optionsData[0]?.isMediaEmpty;

      if (!mediaInOptions || mediaInQuestion.length > 0) {
        return false;
      }
      if (questionText.length === 0) {
        return false;
      }

      let hasTypedAnOption = false;
      let isAnyOptionEmpty = false;
      this.optionsData.forEach((option) => {
        if (!option.isEmpty) {
          hasTypedAnOption = true;
        } else {
          isAnyOptionEmpty = true;
        }
      });

      if (!hasTypedAnOption || !isAnyOptionEmpty) {
        return false;
      }

      return this.isQuestionTypeMCQ && !this.isOptionsGeneratorUsed && this.isDesktop;
    },

    getOptionsGeneratorTooltip() {
      const questionText = this.currentQuestion.structure.query.text;
      let tooltipText = '';
      let tooltipIcon = '';

      const mediaInQuestion = this.currentQuestion.structure.query.media;
      const mediaInOptions = this.optionsData[0].isMediaEmpty;

      if (!mediaInOptions || mediaInQuestion.length > 0) {
        tooltipText = `${this.$i18n(' Sorry, this feature is not available for')}<br/> ${this.$i18n(' questions or answers containing images, videos and audios')}`;
        tooltipIcon = '<i class="fas fa-warning"></i>';

        return this.tooltipInnerWrapperContainer(tooltipIcon, tooltipText);
      }
      if (questionText.length === 0) {
        tooltipText = `${this.$i18n('Type the question to')}<br/> ${this.$i18n('generate incorrect options')}`;
        tooltipIcon = '<i class="fas fa-warning"></i>';

        return this.tooltipInnerWrapperContainer(tooltipIcon, tooltipText);
      }

      return false;
    },

    isBasicUser() {
      return getAccountType(this.$user) === this.$constants.AccountTypes.BASIC;
    },

    isQuestionTextOverlapping() {
      const questionText = this.currentQuestion.structure.query.text;
      if (this.isOptionsGenInfoHovered) {
        return false;
      }
      return removeHTMLTags(questionText).length > 420;
    },

    animationForLeaveClass() {
      let cls = 'animate__animated ';

      if (this.isContainingDeviceDesktop) {
        cls += 'animate__fadeOutDown';
      } else {
        cls += 'animate__fadeOutRight';
      }

      return cls;
    },

    doOptionsHaveImage() {
      return this.optionsData?.findIndex((o) => !o.isMediaEmpty) > -1;
    },

    questionOptions() {
      return this.currentSlide.structure.options;
    },

    questionAnswer() {
      const { answer } = this.currentSlide.structure;

      if (answer === '' || answer === -1) {
        return [];
      }

      return isArray(answer) ? answer : [answer];
    },

    totalOptionsVisible() {
      return this.optionsData.length;
    },

    shouldShowDesktopView() {
      return this.isContainingDeviceDesktop || this.isContainingDeviceTablet;
    },

    isOSMac() {
      return browserOS().isMac;
    },

    shortcutMetaKey() {
      return this.isOSMac ? '\u2318' : 'ctrl';
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

    isQuestionTypeMCQ() {
      return this.questionType === this.$constants.QuestionTypes.MCQ;
    },
    isQuestionTypeMSQ() {
      return this.questionType === this.$constants.QuestionTypes.MSQ;
    },
    isQuestionTypePoll() {
      return this.questionSettings.hasCorrectAnswer === false;
    },

    isMaxNumOptions() {
      const maxNumOfOptions = this.$constants.QuestionOptionLimits[this.questionType].max;
      return this.totalOptionsVisible >= maxNumOfOptions || this.questionOptions.length >= maxNumOfOptions;
    },

    isMinNumOptions() {
      return this.totalOptionsVisible <= this.$constants.QuestionOptionLimits[this.questionType].min;
    },

    hasEmptyOptionsInStore() {
      for (const option of this.questionOptions) {
        if (isOptionEmpty(option)) {
          return true;
        }
      }

      return false;
    },

    optionResizeFontJumps() {
      if (this.isContainingDeviceDesktop) {
        if (this.resizeOptionFont) {
          return getFontSizeRange(24, 16);
        }

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

    captionResizeFontJumps() {
      if (this.isContainingDeviceDesktop) {
        return getFontSizeRange(20, 14);
      }

      return getFontSizeRange(14, 10);
    },

    autoFillOptionStyles() {
      return { minWidth: '30%' };
    },

    optionStyles() {
      const styles = {};

      if (!this.shouldShowDesktopView) {
        if (this.doOptionsHaveImage) {
          if (this.totalOptionsVisible > 2) {
            styles.height = '166px';
          } else {
            styles['min-height'] = '100%';
          }

          styles['max-width'] = '50%';
        } else {
          styles.flex = 1;
        }
      } else {
        styles['max-width'] = `${100 / this.totalOptionsVisible}%`;
        styles.flex = 1;
      }

      return styles;
    },

    optionsContainerStyles() {
      const styles = {};

      if (!this.shouldShowDesktopView) {
        styles['flex-direction'] = 'column';

        if (this.doOptionsHaveImage) {
          styles['flex-direction'] = 'row';
          styles['flex-wrap'] = 'wrap';
          styles['justify-content'] = 'center';
        }
      } else {
        styles['flex-direction'] = 'row';
        styles['flex-wrap'] = 'no-wrap';
      }

      return styles;
    },

    defaultTooltips() {
      const position = this.isContainingDeviceDesktop ? 'top' : 'top-left';
      const fallbackPosition = 'bottom-left';
      let deleteBtn = {
        text: this.$i18n('Delete option ({$1} + d)', [this.shortcutMetaKey]), theme: 'dark', showOnHover: true, position, fallbackPosition,
      };
      const markAnswerBtn = {
        text: (this.isQuestionTypeMCQ ? this.$i18n('Mark this as the correct answer ({$1} + m)', [this.shortcutMetaKey]) : this.$i18n('Mark this as one of the correct answers')),
        theme: 'dark',
        showOnHover: true,
        position,
        fallbackPosition,
      };

      if (this.isMinNumOptions) {
        const deleteBtnPosition = this.isContainingDeviceDesktop ? position : 'top-right';

        deleteBtn = {
          text: this.$i18n('You cannot have less than 2 options'), theme: 'error', showOnHover: true, position: deleteBtnPosition, fallbackPosition: deleteBtnPosition,
        };
      }

      return {
        deleteBtn,
        markAnswerBtn,
        addEquationBtn: {
          text: this.$i18n('Add equation ({$1} {$2})', [this.shortcutMetaKey, '+ e']), position: this.isContainingDeviceDesktop ? 'top' : 'top-left', showOnHover: true, theme: 'dark',
        },
        optToImageBtn: {
          text: this.$i18n('Change option to image ({$1} + i)', [this.shortcutMetaKey]), theme: 'dark', showOnHover: true, position, fallbackPosition,
        },
        optToTextBtn: {
          text: this.$i18n('Change option to text'), theme: 'dark', showOnHover: true, position, fallbackPosition,
        },
        optImageCaptionBtn: {
          text: this.$i18n('This just in! You can now add a caption to images 🎉'), theme: 'dark', showOnHover: true, position, fallbackPosition,
        },
        captionCharacterLimitErrorTooltip: {
          text: this.$i18n('You’ve exceeded the character limit'),
          theme: 'error',
          isVisible: false,
          position: 'top',
          fallbackPosition: 'top',
        },
      };
    },

    optionTooltips() {
      const allTooltips = [];

      this.optionsData?.forEach((opt, index) => {
        const position = this.isContainingDeviceDesktop ? 'bottom' : 'bottom-left';

        const doesOptionHaveError = !isEmpty(this.optionValidationErrors[index]);
        const tooltips = {};

        if (doesOptionHaveError) {
          const errorCode = this.optionValidationErrors[index][0].code;

          if (errorCode === this.$constants.QuestionValidationErrorCodes.CANNOT_MARK_EMPTY_OPTION_AS_ANSWER) {
            tooltips.markAnswerBtn = {
              text: this.$i18n('Please add text or image to an option before marking it correct'),
              theme: 'error',
              isVisible: true,
              position,
              fallbackPosition: 'top-left',
            };
          }

          if (errorCode === 'fillAnswerNudge') {
            tooltips.markAnswerBtn = {
              text: this.$i18n('Select the correct answer to this question'),
              theme: 'green',
              isVisible: true,
              position,
              fallbackPosition: 'top-left',
            };
          }
        }

        if (this.imageUploadedForOptionIndex === index) {
          tooltips.optImageCaptionBtn = {
            text: this.$i18n('This just in! You can now add a caption to images 🎉'),
            theme: 'dark',
            isVisible: true,
            position,
            forceShowTooltip: true,
            fallbackPosition: 'top-left',
            tooltipSize: this.isDesktop ? 'md' : 'sm',
          };
        }

        if (this.imageCaptionCharLimitOptionIndex === index) {
          tooltips.captionCharacterLimitErrorTooltip = {
            text: this.$i18n('You’ve exceeded the character limit'),
            theme: 'error',
            isVisible: true,
            position: 'top',
            fallbackPosition: 'top',
            tooltipSize: this.isDesktop ? 'md' : 'sm',
          };
        }

        allTooltips.push({
          ...this.defaultTooltips,
          ...tooltips,
        });

        if (!this.isContainingDeviceDesktop && allTooltips.deleteBtn) {
          allTooltips.deleteBtn.position = 'top-right';
        }
      });

      return allTooltips;
    },

    addOptionTooltip() {
      if (this.isMaxNumOptions) {
        return { content: this.$i18n('You cannot add more than 5 options'), classes: 'error-tooltip' };
      }

      return { content: this.$i18n('Add an option') };
    },

    areSomeOptionsMarkedAsCorrect() {
      return doesQuestionHaveAnAnswer(this.currentSlide);
    },

    getPlaceHolderValue() {
      const placeholder = !this.isContainingDevicePhone ? `${this.$i18n('Type an answer option here')}...` : this.$i18n('Type an answer option');
      return placeholder;
    },
  },

  watch: {
    editorSaveValidations: {
      immediate: true,
      handler() {
        this.checkAndToggleMarkAnswerNudge();
      },
    },

    isAutoGenerateAllOptionsVisible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.allOptionsGeneratorObserver = this.attachIntersectionObserver();
        });
      }
    },

    showAutoFillDistractors(newVal) {
      if (newVal && !this.isOptionsGeneratorUsed && !this.isOptionsApiCallInProgress && !this.isBasicUser) {
        this.getAutoFillOptions();
      }
    },

    canShowOptionsGenerator(newVal) {
      if (newVal) {
        if (!this.isOptionGeneratorShown && this.isBasicUser) {
          this.$analytics.logEvent(this.$webEvents.GENERATE_OPTIONS_BUTTON_SHOWN, { slideId: this.currentSlide._id, subject: this.subjectForGeneratedOptions });
          this.isOptionGeneratorShown = true;
        }
      }
    },
  },

  created() {
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 100);
    this.validationErrorTimeout = [];

    this.initializeOptionsData();
  },

  mounted() {
    this.setSelectedQuestionElementDebounced = debounce(this.setSelectedQuestionElement, 100);
    this.validationErrorTimeout = [];
    this.initializeOptionsData();

    if (this.isDesktop) {
      this.$nextTick(() => {
        this.updateEditorTabIndex();
      });
    }
    const optionGeneratorValue = LocalStorage.getItem('optionsGenerator');
    this.showAutoFillDistractors = Boolean(optionGeneratorValue);
    if (this.isBasicUser) {
      this.showAutoFillDistractors = true;
    }
    switch (this.$featureFlags.getFeatureValue(this.$constants.FeatureFlagsTypes.SHOW_OPTIONS_GENERATOR)) {
      case '1':
        this.canShowOptionsGeneratorFeature = true;
        break;

      case '2':
        this.canShowAllOptionsGeneratorFeature = true;
        break;
      default:
    }

    if (LocalStorage.getItem('allOptionsGeneratorViewCount')) {
      this.showMinifiedAllOptionsGeneratorBtn = parseInt(LocalStorage.getItem('allOptionsGeneratorViewCount'), 10) === 3;
    }

    this.$eventBus.$on('questionEditor:triggerPreSaveActions', this.preSaveHook);
    window.addEventListener('keydown', this.onKeydownEvent);
    window.addEventListener('click', this.onClickEvent);
  },

  beforeUnmount() {
    if (this.fillAnswerNudgeOffTimer) {
      clearTimeout(this.fillAnswerNudgeOffTimer);
    }
    if (this.validationErrorTimeout) {
      this.validationErrorTimeout.forEach((timeout) => timeout && clearTimeout(timeout));
    }

    if (this.editorTabIndexTimeout) {
      clearTimeout(this.editorTabIndexTimeout);
    }

    if (this.addOptionsClickTimeout) {
      clearTimeout(this.addOptionsClickTimeout);
    }

    if (this.imageUploadedForOptionTimeout) {
      clearTimeout(this.imageUploadedForOptionTimeout);
    }

    if (this.imageCaptionCharLimitOptionIndexTimeout) {
      clearTimeout(this.imageCaptionCharLimitOptionIndexTimeout);
    }

    if (this.showBounceForGenerateAllOptionsTimer) {
      clearTimeout(this.showBounceForGenerateAllOptionsTimer);
    }

    this.allOptionsGeneratorObserver?.disconnect();
    this.hideAutoGenerateAllOptionsButtonDueToError = false;

    this.$eventBus.$off('questionEditor:triggerPreSaveActions', this.preSaveHook);
    window.removeEventListener('keydown', this.onKeydownEvent);
    window.removeEventListener('click', this.onClickEvent);
  },

  methods: {

    ...mapActions({
      setParameterVersion: 'slideEditor/setAnalyticsParameterVersion',
      setAnalyticsOptionGeneratorTokens: 'slideEditor/setAnalyticsOptionGeneratorTokens',
      setAnalyticsOptionGeneratorTokensLogProbs: 'slideEditor/setAnalyticsOptionGeneratorTokensLogProbs',
      setSubjectForGeneratedOptions: 'contentEditor/setSubjectForGeneratedOptions',
    }),

    async onFocusTipTap(index) {
      if (this.canShowAllOptionsGeneratorFeature && index === 0 && this.isAutoGenerateAllOptionsVisible) {
        this.showBounceForGenerateAllOptionsButton = true;

        this.showBounceForGenerateAllOptionsTimer = setTimeout(() => {
          this.showBounceForGenerateAllOptionsButton = false;
        }, 2100);
      }

      let isFirstFocusedTipTap = true;
      this.optionsData.forEach((option) => {
        if (!option.isTextEmpty) {
          isFirstFocusedTipTap = false;
        }
      });

      await asyncDelay(500);

      if (isFirstFocusedTipTap && !this.isBasicUser && this.canShowOptionsGeneratorFeature) {
        const questionText = removeHTMLTags(this.currentQuestion.structure.query.text);
        if (this.getSubjectForGeneratedOptions || this.isOptionsApiCallInProgress || questionText.length === 0) {
          return;
        }
        const response = await SuggestionService.getInferSubject(questionText);
        if (response?.data?.subject) {
          this.subjectForGeneratedOptions = response.data.subject;
          this.setSubjectForGeneratedOptions(response.data.subject);
        } else {
          this.setSubjectForGeneratedOptions(null);
        }
      }
    },

    attachIntersectionObserver() {
      const { autoGenerateAllOptionsContainer } = this.$refs;

      if (autoGenerateAllOptionsContainer && autoGenerateAllOptionsContainer[0]) {
        const observer = new IntersectionObserver(
          ([e]) => {
            if (e.intersectionRatio === 1 && !this.hasViewedAutoGenerateAllOptionsButtonYet) {
              if (!LocalStorage.getItem('allOptionsGeneratorViewCount')) {
                LocalStorage.setItem('allOptionsGeneratorViewCount', 1);
              } else {
                const allOptionsGeneratorViewCount = parseInt(LocalStorage.getItem('allOptionsGeneratorViewCount'));

                if (allOptionsGeneratorViewCount < 3) {
                  LocalStorage.setItem('allOptionsGeneratorViewCount', allOptionsGeneratorViewCount + 1);
                }
              }

              this.hasViewedAutoGenerateAllOptionsButtonYet = true;

              this.allOptionsGeneratorObserver?.disconnect();
            }
          },
          { threshold: [1] }, // the entire preview component should be in view
        );

        if (autoGenerateAllOptionsContainer) {
          observer.observe(autoGenerateAllOptionsContainer[0]);
        }
        return observer;
      }
    },

    async getAutoFillOptions() {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'QT:OptGen');
      if (!this.showAutoFillDistractors || this.isOptionsGeneratorUsed || !this.canShowOptionsGeneratorFeature) {
        return;
      }

      this.autoFillingDistractors = true;
      const questionText = this.currentQuestion.structure.query.text;
      let correctOption = removeHTMLTags(String(this.correctOptionsText));
      let numberOfOptionsToGenerate = 3;

      if (removeHTMLTags(questionText).length === 0) {
        return;
      }

      if (this.isBasicUser) {
        this.$analytics.logEvent(this.$webEvents.BASIC_USER_CLICKED_GENERATE_OPTION_BUTTON, {
          questionText: removeHTMLTags(questionText), correctOption, questionId: this.currentSlide._id, quizId: this.quizId,
        });
        const type = this.$constants.SuperUpsellTypes.OPTIONS_GENERATOR_UPSELL;
        this.$eventBus.$emit('superUpsell:show', {
          type,
          options: {
            feat: 'optionsGenerator',
          },
        });
        if (!this.getSubjectForGeneratedOptions) {
          const response = await SuggestionService.getInferSubject(questionText);

          if (response?.success && response?.data?.subject) {
            this.subjectForGeneratedOptions = response.data.subject;
            this.setSubjectForGeneratedOptions(response.data.subject);
          } else {
            this.setSubjectForGeneratedOptions(null);
          }
        }
      }
      let totalEmptyOptions = 0;
      let firstOptionsText = '';
      this.optionsData.forEach((option, index) => {
        if (option.isTextEmpty) {
          totalEmptyOptions += 1;
        } else {
          if (removeHTMLTags(this.getOptionTextFromIndex(index)).toLowerCase() === 'true') {
            correctOption = 'true';
          }
          if (removeHTMLTags(this.getOptionTextFromIndex(index)).toLowerCase() === 'false') {
            correctOption = 'false';
          }
          this.generatedOptionsIndexesUsed = [...this.generatedOptionsIndexesUsed, index];
        }
        if (firstOptionsText.length === 0) {
          firstOptionsText = removeHTMLTags(this.getOptionTextFromIndex(index));
        }
        if (this.isOptionMarkedAsCorrect(index)) {
          correctOption = removeHTMLTags(this.getOptionTextFromIndex(index));
        }
      });
      if (correctOption.length === 0) {
        correctOption = firstOptionsText;
      }
      if (correctOption.length === 0) {
        return;
      }
      numberOfOptionsToGenerate = totalEmptyOptions;

      const useDistractorApi = true;
      let distractorOptions = [
        'Option 2',
        'Option 3',
        'Option 4',
      ];

      if (correctOption.toLowerCase() === 'true') {
        distractorOptions = ['False'];
      } else if (correctOption.toLowerCase() === 'false') {
        distractorOptions = ['True'];
      } else if (useDistractorApi) {
        this.isOptionsApiCallInProgress = true;
        const response = await SuggestionService.getDistractorsForMCQs(questionText, numberOfOptionsToGenerate, correctOption, this.getSubjectForGeneratedOptions || this.subjectForGeneratedOptions);
        this.isOptionsApiCallInProgress = false;

        if (!response?.success || response?.data?.options?.length === 0) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Something went wrong!'),
          });
          this.autoFillingDistractors = false;
          return;
        }

        distractorOptions = response?.data?.options;
        if (distractorOptions.length > numberOfOptionsToGenerate) {
          distractorOptions = distractorOptions.slice(0, 3);
        }
        if (response?.data?.subject) {
          this.subjectForGeneratedOptions = response.data.subject;
        }
        this.optionsDataForAutofill = distractorOptions;
        this.setGeneratedOptionsForCurrentSlide(distractorOptions);
        this.setParameterVersion(response?.data.parameterVersion);
        this.setAnalyticsOptionGeneratorTokens(response?.data?.tokens);
        this.setAnalyticsOptionGeneratorTokensLogProbs(response?.data?.token_logprobs);
      }
      this.isOptionsGeneratorUsed = true;
      const optionsData = [...this.optionsData];

      this.optionsData = optionsData;
      let index = 0;
      const generatedOptionsIndexes = [];
      this.optionsData.forEach((option, optionIndex) => {
        if (option.isTextEmpty) {
          if (distractorOptions[index]) {
            this.generatedOptionsMap[option.indexInStoreOptions] = handleGeneratedOptionsKatex(distractorOptions[index]);
            index += 1;
            generatedOptionsIndexes.push(option.indexInStoreOptions);
          } else {
            this.deleteOption(option.indexInStoreOptions, 'deleteBtn');
          }
        }
      });
      this.generatedOptionsIndexesInStore = generatedOptionsIndexes;
      this.correctOptionsText = removeHTMLTags(handleGeneratedOptionsKatex(correctOption));
      if (this.isBasicUser) {
        this.$analytics.logEvent(this.$webEvents.BASIC_USER_AUTO_GENERATE_OPTIONS_USED_V3, {
          generatedOptions: distractorOptions.join(','), questionText: removeHTMLTags(questionText), correctOption, questionId: this.currentSlide._id, quizId: this.quizId, subject: this.subjectForGeneratedOptions,
        });
      } else {
        this.$analytics.logEvent(this.$webEvents.AUTO_GENERATE_OPTIONS_USED_V3, {
          generatedOptions: distractorOptions.join(','), questionText: removeHTMLTags(questionText), correctOption, questionId: this.currentSlide._id, quizId: this.quizId, subject: this.subjectForGeneratedOptions,
        });
      }

      this.autoFillingDistractors = false;
    },

    async getAutoFillAllOptions() {
      const questionText = this.currentQuestion.structure.query.text;
      let numberOfOptionsToGenerate = 4;

      if (removeHTMLTags(questionText).length === 0) {
        return;
      }

      numberOfOptionsToGenerate = this.optionsData.length;

      this.autoFillingAllOptionsLoader = true;

      const response = await SuggestionService.getAllOptionsForMCQs(questionText, numberOfOptionsToGenerate);
      this.autoFillingAllOptionsLoader = false;

      if (!response?.success || response?.data?.options?.length === 0) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Sorry, couldn\'t generate options. Please try later.'),
        });

        this.autoFillingAllOptionsLoader = false;
        this.hideAutoGenerateAllOptionsButtonDueToError = true;
        return;
      }

      const distractorOptions = response?.data?.options;

      const hasError = distractorOptions.some((option) => !('isCorrect' in option) || !('text' in option));

      if (distractorOptions.length !== this.optionsData.length || hasError) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Sorry, couldn\'t generate options. Please try later.'),
        });
        this.autoFillingAllOptionsLoader = false;

        this.hideAutoGenerateAllOptionsButtonDueToError = true;
        return;
      }

      this.optionsDataForAutofill = distractorOptions;
      let correctOptionIndex = 0;

      const generatedOptionsIndexes = [];
      this.optionsData.forEach((option, optionIndex) => {
        if (distractorOptions[optionIndex].isCorrect) {
          correctOptionIndex = optionIndex;
        }

        this.generatedOptionsMap[option.indexInStoreOptions] = handleGeneratedOptionsKatex(distractorOptions[optionIndex].text);
        generatedOptionsIndexes.push(option.indexInStoreOptions);
      });

      this.generatedOptionsIndexesInStore = generatedOptionsIndexes;

      this.autoFillingAllOptionsLoader = false;

      this.$nextTick(() => {
        this.setGeneratedOptionsInTiptap();
        this.toggleOptionCorrectness(correctOptionIndex);
      });

      this.$toasts.add({
        type: this.$constants.ToastTypes.DEFAULT,
        icon: 'fas fa-times-circle',
        title: this.$i18n('Options have been auto-generated'),
        action: this.$i18n('ERASE ALL'),
        actionCB: () => {
          this.eraseAllOptions();
        },
      });

      this.setGeneratedOptionsForCurrentSlide(distractorOptions);

      this.$analytics.logEvent(this.$webEvents.ALL_OPTIONS_GENERATION_GENERATE_ALL_OPTIONS, {
        questionText: removeHTMLTags(questionText),
        generatedOptions: distractorOptions,
        isButtonMinified: this.showMinifiedAllOptionsGeneratorBtn,
        questionId: this.currentSlide._id,
        quizId: this.quizId,
      });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    eraseAllOptions() {
      const questionText = this.currentQuestion?.structure?.query?.text;

      this.$analytics.logEvent(this.$webEvents.ALL_OPTIONS_GENERATION_ERASE_ALL_OPTIONS, {
        questionText: removeHTMLTags(questionText),
        optionsData: this.optionsDataForAutofill,
        questionId: this.currentSlide._id,
        quizId: this.quizId,
      });

      this.optionsData.forEach((option, optionIndex) => {
        this.generatedOptionsMap[option.indexInStoreOptions] = '';
      });

      this.generatedOptionsIndexesInStore = [];

      this.setGeneratedOptionsInTiptap();
    },

    useGeneratedOption(index, source) {
      if (!this.generatedOptionsMap[index]) {
        return;
      }

      const correctOption = removeHTMLTags(String(this.correctOptionsText));
      const questionText = this.currentQuestion.structure.query.text;

      if (this.isBasicUser && source === 'button') {
        const type = this.$constants.SuperUpsellTypes.OPTIONS_GENERATOR_UPSELL;
        this.$eventBus.$emit('superUpsell:show', {
          type,
          options: {
            feat: 'generatedOptionsUsed',
          },
        });

        this.$analytics.logEvent(this.$webEvents.BASIC_USER_USE_SUGGESTION_CLICKED, {
          questionText: removeHTMLTags(questionText), usedOption: removeHTMLTags(handleGeneratedOptionsKatex(this.generatedOptionsMap[index])), source, questionId: this.currentSlide._id, quizId: this.quizId, subject: this.subjectForGeneratedOptions,
        });
        return;
      }

      this.$analytics.logEvent(this.$webEvents.USED_GENERATED_OPTIONS_V3, {
        questionText: removeHTMLTags(questionText), usedOption: removeHTMLTags(handleGeneratedOptionsKatex(this.generatedOptionsMap[index])), source, correctOption, questionId: this.currentSlide._id, quizId: this.quizId, subject: this.subjectForGeneratedOptions,
      });

      this.onTipTapInput(index, {
        text: `<p>${handleGeneratedOptionsKatex(this.generatedOptionsMap[index])}</p>`,
        isEmpty: false,
        isFocused: true,
        didTextChange: true,
        generatedOption: true,
      });
      this.generatedOptionsIndexesUsed = [...this.generatedOptionsIndexesUsed, index];
      this.$refs.tiptap[index].focus();
      if (this.generatedOptionsMap[index].length > 100) {
        this.resizeOptionFont = true;
      } else {
        this.resizeOptionFont = false;
      }
    },

    setGeneratedOptionsInTiptap() {
      for (const index in this.generatedOptionsMap) {
        this.onTipTapInput(index, {
          text: `<p>${handleGeneratedOptionsKatex(this.generatedOptionsMap[index])}</p>`,
          isEmpty: false,
          isFocused: true,
          didTextChange: true,
          generatedOption: true,
        });
        this.generatedOptionsIndexesUsed = [...this.generatedOptionsIndexesUsed, index];
        this.$refs.tiptap[index].focus();
        if (this.generatedOptionsMap[index].length > 100) {
          this.resizeOptionFont = true;
        } else {
          this.resizeOptionFont = false;
        }
      }
    },

    setOptionsGenerator(value) {
      LocalStorage.setItem('optionsGenerator', value);
      const questionText = this.currentQuestion.structure.query.text;
      const correctOption = removeHTMLTags(String(this.correctOptionsText));
      if (value) {
        this.$analytics.logEvent(this.$webEvents.SUGGEST_AUTO_GENERATION_TOOGLE_ON, { userId: this.$user.id, questionText: removeHTMLTags(questionText), correctOption });
      } else {
        this.$analytics.logEvent(this.$webEvents.SUGGEST_AUTO_GENERATION_TOOGLE_OFF, { userId: this.$user.id, questionText: removeHTMLTags(questionText), correctOption });
      }
      this.showAutoFillDistractors = value;
    },

    clearSuggestions() {
      const generatedOptions = [];
      const questionText = removeHTMLTags(this.currentQuestion.structure.query.text);
      this.optionsData.forEach((option, index) => {
        if (!this.isOptionMarkedAsCorrect(index) && this.generatedOptionsIndexesInStore.includes(index)) {
          generatedOptions.push(removeHTMLTags(this.getOptionTextFromIndex(option.indexInStoreOptions)));
          this.onTipTapInput(option.indexInStoreOptions, {
            text: '',
            isEmpty: false,
            isFocused: false,
            didTextChange: true,
          });
        }
      });
      this.$analytics.logEvent(this.$webEvents.CLICKED_CLEAR_OPTIONS, { generatedOptions: generatedOptions.join(','), questionText, correctOption: this.correctOptionsText });
      this.clearSuggestionDone = true;
    },

    setOptionGenHoverInfo() {
      if (this.isQuestionTextOverlapping) {
        this.isOptionsGenInfoHovered = !this.isOptionsGenInfoHovered;
      }
    },

    rateAutoGenratedSuggestion(value) {
      this.$analytics.logEvent(this.$webEvents.RATE_AUTO_GENERATED_OPTIONS, {
        rating: value,
        question: removeHTMLTags(this.currentQuestion.structure.query.text),
        correctOption: removeHTMLTags(this.correctOptionsText),
        generatedOptions: this.optionsDataForAutofill.join(','),
      });
      this.rateTheSuggestionDone = true;
    },

    tooltipInnerWrapperContainer(icon, text) {
      const tooltipInnerWrapperContainer = `<div class="flex items-center px-3 gap-4">${icon}<div class="flex justify-center text-center">${text}</div></div>`;
      return tooltipInnerWrapperContainer;
    },

    enterMcqsOptionsManually() {
      this.showAutoFillDistractors = false;
      this.$analytics.logEvent(this.$webEvents.CLICKED_ENTER_MANUAL_OPTIONS);
    },

    onClickEvent(event) {
      let isMatchedIdx = null;
      (this.$refs.optionContainer || []).forEach((container, index) => {
        if (container === event.target || container.contains(event.target)) {
          isMatchedIdx = index;
        }
      });

      this.focusedOptionIndex = isMatchedIdx;
    },

    onKeydownEvent(event) {
      // find focused one
      let index = -1;
      let focusedOption = null;
      this.optionsData?.forEach((optionData, i) => {
        if (!this.isOptionForImage(i) && this.isTipTapEditorInFocus(i)) {
          index = i;
          focusedOption = optionData;
        }
      });

      if ((event.code === 'Enter') && this.focusedDeleteButton) {
        const optionPosition = Number(this.focusedDeleteButton.substr(this.focusedDeleteButton.length - 1));
        this.deleteOption(optionPosition - 1, 'popoverBtn');
        return;
      }

      this.focusedDeleteButton = null;

      if (focusedOption && ((!this.isOSMac && event.ctrlKey) || (this.isOSMac && event.metaKey)) && index >= 0) {
        if (event.code === 'KeyD' && this.optionsData.length > 2) {
          event.preventDefault();
          if (focusedOption.isEmpty) {
            this.deleteOption(index, 'deleteBtn');
          } else {
            this.focusedDeleteButton = `DeleteButtonOption${index + 1}`;
            this.$refs.tiptap[index].blur();
          }
        } else if (event.shiftKey && event.code === 'KeyI') {
          event.preventDefault();
          if (focusedOption.isEmpty) {
            this.changeOptionToImage(index, 'toTextBtn');
          } else {
            this.changeOptionToImage(index, 'popoverBtn');
          }
        } else if (event.code === 'KeyM') {
          event.preventDefault();
          this.toggleOptionCorrectness(index);
        } else if (event.code === 'KeyE') {
          event.preventDefault();
          this.openMathEditor(index);
        }
      }

      if (this.isSaveButtonFocused) {
        if (event.code === 'Digit1') {
          this.toggleOptionCorrectness(0);
        } else if (event.code === 'Digit2') {
          this.toggleOptionCorrectness(1);
        } else if (event.code === 'Digit3' && this.optionsData.length >= 3) {
          this.toggleOptionCorrectness(2);
        } else if (event.code === 'Digit4' && this.optionsData.length >= 4) {
          this.toggleOptionCorrectness(3);
        } else if (event.code === 'Digit5' && this.optionsData.length >= 5) {
          this.toggleOptionCorrectness(4);
        }
      }
    },

    shouldShowMathButton(index) {
      return this.isOptionForText(index) && this.isContainingDeviceDesktop;
    },

    updateEditorTabIndex() {
      this.editorTabIndexTimeout = setTimeout(() => {
        const editors = this.$refs.tiptap;

        editors?.forEach((element, index) => {
          const editor = element.$refs.tiptapContainer.querySelector('.ProseMirror');
          editor.tabIndex = 100 + index + 1;
        });
      }, 0);
    },

    shiftFocusBeforeDelete(index) {
      if (index === this.optionsData.length) {
        if (!this.isOptionForImage(index - 1)) {
          if (this.isDesktop) {
            this.$refs.tiptap[index - 1].focus('end');
          } else {
            const tiptapOptionRef = this.$refs.tiptap[index - 1].$refs[`tiptap_option_${index - 1}`];

            if (isEmpty(tiptapOptionRef)) { return; }

            this.$refs.tiptap[index - 1].$refs[`tiptap_option_${index - 1}`].focus();
          }
        }
      } else if (!this.isOptionForImage(index + 1)) {
        if (this.isDesktop) {
          this.$refs.tiptap[index + 1].focus('end');
        } else {
          const tiptapOptionRef = this.$refs.tiptap[index + 1].$refs[`tiptap_option_${index + 1}`];

          if (isEmpty(tiptapOptionRef)) { return; }

          this.$refs.tiptap[index + 1].$refs[`tiptap_option_${index + 1}`].focus('end');
        }
      }
    },

    initializeOptionsData() {
      const optionsData = [...this.optionsData];
      let numOptionsToShow = DEFAULT_STARTING_OPTION_NUMS;

      if (!isEmpty(this.questionOptions)) {
        numOptionsToShow = Math.max(this.questionOptions.length, MINIMUM_OPTIONS_ALLOWED);
      }

      for (let i = 0; i < numOptionsToShow; i++) {
        const optionExistsInStore = !isEmpty(this.questionOptions[i]);
        let initialOptionData = optionsData[i] || {};

        if (optionExistsInStore) {
          initialOptionData = {
            ...initialOptionData,
            indexInStoreOptions: i,
            type: this.questionOptions[i].type,
          };
        }

        optionsData[i] = this.getOptionData(initialOptionData);
      }

      this.optionsData = optionsData;
    },

    doesOptionForImageHaveCaption(index) {
      return this.optionsData[index].isCaptionVisible;
    },

    getOptionData({
      key, isTextEmpty, isMediaEmpty, isCaptionEmpty, isCaptionVisible, isCaptionFocused, isFocused, /* isMarkedCorrect, */ indexInStoreOptions = -1, type,
    } = {}) {
      const option = indexInStoreOptions >= 0 ? this.questionOptions[indexInStoreOptions] : {};
      const isOptTextEmpty = isBoolean(isTextEmpty) ? isTextEmpty : (isEmpty(option.text) || option.text === Constants.TipTap.INITIAL_TIP_TAP_VALUE);
      const isOptMediaEmpty = isBoolean(isMediaEmpty) ? isMediaEmpty : (this.getOptionMedia(option) === null);

      let isOptCaptionEmpty;
      let isOptCaptionVisibile;

      if (!isOptMediaEmpty) {
        const optionCaptionText = this.getOptionCaptionText(option);

        isOptCaptionEmpty = isBoolean(isCaptionEmpty) ? isCaptionEmpty : (isEmpty(optionCaptionText));

        isOptCaptionVisibile = isBoolean(isCaptionVisible) ? isCaptionVisible : (!isEmpty(optionCaptionText));
      } else {
        isOptCaptionEmpty = true;
        isOptCaptionVisibile = false;
      }

      const isOptEmpty = isOptTextEmpty && isOptMediaEmpty;
      let typeToUse = 'text';

      if (!isEmpty(type)) {
        typeToUse = type;
      } else if (!isOptMediaEmpty) {
        typeToUse = 'image';
      }

      return {
        key: !isEmpty(key) ? key : nanoid(6),
        type: typeToUse,
        isTextEmpty: isOptTextEmpty,
        isMediaEmpty: isOptMediaEmpty,
        isCaptionEmpty: isOptCaptionEmpty,
        isCaptionVisible: isOptCaptionVisibile,
        isEmpty: isOptEmpty,
        isFocused: isBoolean(isFocused) ? isFocused : false,
        isCaptionFocused: isBoolean(isCaptionFocused) ? isCaptionFocused : false,
        indexInStoreOptions,
      };
    },

    getUpdatedAnswerValue(answer) {
      let answerValueToUpdate = this.questionAnswer;

      if (this.isQuestionTypeMCQ) {
        if (isArray(answer)) {
          answerValueToUpdate = isEmpty(answer) ? -1 : answer[0];
        } else if (isNumber(answer)) {
          answerValueToUpdate = answer;
        }
      }

      if (this.isQuestionTypeMSQ) {
        if (isArray(answer)) {
          answerValueToUpdate = answer;
        } else if (isNumber(answer)) {
          answerValueToUpdate = answer === -1 ? [] : [answer];
        }
      }

      if (isArray(answerValueToUpdate)) {
        answerValueToUpdate = sortBy(answerValueToUpdate.filter((value) => value >= 0));
      }

      return answerValueToUpdate;
    },

    isTipTapEditorInFocus(index) {
      return this.optionsData[index].isFocused;
    },

    isTipTapEditorForCaptionInFocus(index) {
      return this.optionsData[index].isCaptionFocused;
    },

    addOption(atIndex = this.totalOptionsVisible) {
      if (this.isMaxNumOptions) {
        return;
      }

      this.optionsData = this.addInBetweenArray(this.optionsData, this.getOptionData(), atIndex);
      if (this.isDesktop) {
        this.updateEditorTabIndex();
      }
    },

    deleteOption(index, source) {
      this.$store.dispatch('analyticsManager/addBreadcrumb', `OtpDel:${index}`);
      if (source !== 'popoverBtn' && !this.isOptionsGeneratorUsed) {
        this.focusedDeleteButton = `DeleteButtonOption${index + 1}`;
      }

      if (source === 'deleteBtn' && !this.optionsData[index]?.isEmpty && !this.isOptionsGeneratorUsed) {
        return;
      }

      if (this.isMinNumOptions) {
        return;
      }

      this.handleAddingRemovingFromStore(index, 'removal');

      const updatedOptions = [...this.optionsData];
      updatedOptions.splice(index, 1);
      this.optionsData = updatedOptions;

      this.focusedDeleteButton = null;
      if (this.isDesktop) {
        this.shiftFocusBeforeDelete(index);
      }
      this.$emit('deleteOption');
    },

    handleAddingRemovingFromStore(visibleIndexBeingToggled, action, updatedOptionEntities) {
      const isOptionBeingRemovedFromStore = action === 'removal';
      const isOptionBeingAddedInStore = action === 'addition';
      const previousOptionData = this.optionsData[visibleIndexBeingToggled];
      const indexInStoreOfOptionBeingToggled = this.optionsData[visibleIndexBeingToggled].indexInStoreOptions;
      const updatedAnswers = [...this.questionAnswer];
      const updatedOptionData = this.getOptionData(previousOptionData);
      const changeInSuccedingOptionIndices = isOptionBeingAddedInStore ? 1 : -1;
      const answerUpdationMap = {};
      let updatedOptions = [];

      if (isOptionBeingRemovedFromStore && this.isOptionMarkedAsCorrect(visibleIndexBeingToggled)) {
        /**
         * Since option is being removed we need to mark it incorrect if it was marked correct
         */

        const index = updatedAnswers?.findIndex((indexInStoreOptions) => indexInStoreOptions === indexInStoreOfOptionBeingToggled);
        answerUpdationMap[index] = null;
      }

      if (isOptionBeingRemovedFromStore) {
        updatedOptions = [...this.questionOptions];

        updatedOptionData.indexInStoreOptions = -1;
        updatedOptions.splice(previousOptionData.indexInStoreOptions, 1);
      } else if (isOptionBeingAddedInStore) {
        const option = this.getStoreConsumableOption({}, updatedOptionEntities, updatedOptionData);
        let indexOfPreceedingOptionInStore = -1;

        for (let i = visibleIndexBeingToggled - 1; i >= 0; i--) {
          if (this.isOptionLinkedToStore(i)) {
            indexOfPreceedingOptionInStore = this.optionsData[i].indexInStoreOptions;
            break;
          }
        }

        updatedOptionData.indexInStoreOptions = indexOfPreceedingOptionInStore + 1;
        updatedOptions = this.addInBetweenArray(this.questionOptions, option, updatedOptionData.indexInStoreOptions);
      }

      this.optionsData[visibleIndexBeingToggled] = updatedOptionData;

      for (let i = visibleIndexBeingToggled + 1; i < this.optionsData.length; i++) {
        if (this.isOptionLinkedToStore(i)) {
          const indexInStoreOfThisOption = this.optionsData[i].indexInStoreOptions;
          const updatedStoreIndex = indexInStoreOfThisOption + changeInSuccedingOptionIndices;
          const foundIndex = this.questionAnswer?.findIndex((indexInStoreOptions) => indexInStoreOptions === indexInStoreOfThisOption);

          if (foundIndex >= 0) {
            answerUpdationMap[foundIndex] = updatedAnswers[foundIndex] + changeInSuccedingOptionIndices;
          }

          this.optionsData[i].indexInStoreOptions = updatedStoreIndex;
        }
      }

      Object.entries(answerUpdationMap).forEach(([position, updatedAnswer]) => {
        /**
         * A separate map has been kept to know which answer has been updated because
         * we do not want the change of one answer affect the how the next one is being changed.
         * So we only commit the changes once we know all the updations to the answer array.
         */
        if (!isNumber(updatedAnswers[position])) {
          return;
        }

        if (!isNumber(updatedAnswer)) {
          const olderLengthOfUpdatedAnswers = updatedAnswers.length;
          updatedAnswers.splice(position, 1);
          // repositioning if any option which earlier a selected answer got deleted
          for (let i = Number(position); i < updatedAnswers.length; i++) {
            updatedAnswers[i] -= olderLengthOfUpdatedAnswers - updatedAnswers.length;
          }
        } else {
          // updatedAnswers[position] = updatedAnswer;
        }
      });

      if (!isEqual(updatedAnswers, this.questionAnswer)) {
        this.updateQuestionOptionsAndAnswer(updatedOptions, updatedAnswers);
      } else {
        this.updateQuestionOptions(updatedOptions);
      }
    },

    isOptionMarkedAsCorrect(index) {
      const optionData = this.optionsData[index];
      if (this.isOptionLinkedToStore(index) && includes(this.questionAnswer, optionData.indexInStoreOptions)) {
        this.correctOptionsText = this.getOptionTextFromIndex(optionData.indexInStoreOptions);
      }
      return this.isOptionLinkedToStore(index) && includes(this.questionAnswer, optionData.indexInStoreOptions);
    },

    toggleOptionCorrectness(optionVisibleIndex) {
      this.$store.dispatch('analyticsManager/addBreadcrumb', `OptAns:${optionVisibleIndex}`);
      const optionIndexInStore = this.optionsData[optionVisibleIndex].indexInStoreOptions;
      const isOptionBeingToggledAlreadyMarkedCorrect = includes(this.questionAnswer, optionIndexInStore);

      if (!isOptionBeingToggledAlreadyMarkedCorrect && this.optionsData[optionVisibleIndex].isEmpty && !this.canShowOptionsGenerator) {
        this.addToOptionErrors('option', optionVisibleIndex, { code: this.$constants.QuestionValidationErrorCodes.CANNOT_MARK_EMPTY_OPTION_AS_ANSWER });
        return;
      }

      if (this.isQuestionTypeMCQ && this.areSomeOptionsMarkedAsCorrect && !isOptionBeingToggledAlreadyMarkedCorrect) {
        this.$eventBus.$emit('questionEditor:highlightMSQToggler');
      }

      if (this.isQuestionTypeMCQ) {
        const updatedAnswer = isOptionBeingToggledAlreadyMarkedCorrect ? -1 : optionIndexInStore;
        this.updateAnswerValue(updatedAnswer);

        return;
      }

      let answers = [...this.questionAnswer];

      if (isOptionBeingToggledAlreadyMarkedCorrect) {
        answers = answers.filter((index) => index !== optionIndexInStore);
      } else {
        answers.push(optionIndexInStore);
      }

      this.updateAnswerValue(answers);
    },

    addInBetweenArray(array, value, atIndex) {
      return [
        ...array?.slice(0, atIndex),
        value,
        ...array?.slice(atIndex),
      ];
    },

    onAddOptionClick() {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'OptAdd');
      this.addOption(this.totalOptionsVisible);
      this.$emit('addOption');
      this.addOptionsClickTimeout = setTimeout(() => {
        const editors = [...this.$refs.tiptap];
        const refsKey = `tiptap_option_${editors.length - 1}`;
        this.isDesktop ? editors[editors.length - 1]?.focus() : editors[editors.length - 1].$refs[refsKey]?.focus();
        this.focusedOptionIndex = editors.length - 1;
      }, 300);
    },

    isOptionAboutToExceedCaptionCharLimit(visibleOptionIndex) {
      const { text = '' } = this.getTiptapValue(visibleOptionIndex);

      return this.$stringUtils.extractContentFromHTML(text).length >= this.captionCharLimit;
    },

    isOptionForImage(index) {
      return this.optionsData[index]?.type === 'image';
    },

    isOptionForText(index) {
      return !this.isOptionForImage(index);
    },

    changeOptionToText(index) {
      const previousOptionData = this.optionsData[index];
      const updatedOptionData = this.getOptionData({
        key: previousOptionData.key,
        isTextEmpty: true,
        isMediaEmpty: true,
        type: 'text',
        indexInStoreOptions: previousOptionData.indexInStoreOptions,
      });

      this.optionsData[index] = updatedOptionData;

      if (this.isOptionLinkedToStore(index)) {
        const optionToSave = this.getStoreConsumableOption(this.questionOptions[previousOptionData.indexInStoreOptions], {}, updatedOptionData);

        this.updateSingleOptionValue(optionToSave, updatedOptionData.indexInStoreOptions);
      }
    },

    changeOptionToImage(index, source) {
      if (source === 'toTextBtn' && this.isOptionAboutToExceedCaptionCharLimit(index)) {
        return;
      }

      this.$eventBus.$emit('presentationEditor:showImageUpload', { callback: this.onImageUploadComplete.bind(this, index, false), media: null });
    },

    onImageUploadComplete(visibleOptionIndex, isOnReedit, media) {
      const previousOptionData = this.optionsData[visibleOptionIndex];

      // converts option text to image caption
      // also persists previous caption on media change
      if (previousOptionData.type === this.$constants.QuestionStructureTypes.TEXT || !previousOptionData.isCaptionEmpty) {
        const { text = '' } = this.getTiptapValue(visibleOptionIndex);
        const { text: captionText = '' } = this.getTiptapValueForCaption(visibleOptionIndex);
        if (this.$stringUtils.extractContentFromHTML(text).length <= this.captionCharLimit || this.$stringUtils.extractContentFromHTML(captionText).length > 0) {
          media.meta.text = this.$stringUtils.extractContentFromHTML(text) === '' ? captionText : text;
        }
      }
      const updatedOptionData = this.getOptionData({
        key: previousOptionData.key,
        isMediaEmpty: false,
        type: 'image',
      });

      updatedOptionData.isCaptionVisible = this.$stringUtils.extractContentFromHTML(media?.meta?.text).trim().length > 0;
      updatedOptionData.isCaptionEmpty = this.$stringUtils.extractContentFromHTML(media?.meta?.text).trim().length === 0;

      if (isOnReedit) {
        const previousOption = this.questionOptions[previousOptionData.indexInStoreOptions];
        const updatedOption = this.getStoreConsumableOption(previousOption, { image: media }, updatedOptionData);

        updatedOptionData.indexInStoreOptions = previousOptionData.indexInStoreOptions;
        this.optionsData[visibleOptionIndex] = updatedOptionData;

        this.updateSingleOptionValue(updatedOption, previousOptionData.indexInStoreOptions);
        return;
      }

      if (this.imageUploadedForOptionIndex === null) {
        this.imageUploadedForOptionIndex = visibleOptionIndex;

        this.imageUploadedForOptionTimeout = setTimeout(() => {
          this.imageUploadedForOptionIndex = -1;
        }, 6000);
      }

      updatedOptionData.media = media;
      const updatedOption = this.getStoreConsumableOption(this.questionOptions[visibleOptionIndex], { image: media }, updatedOptionData);

      if (previousOptionData.indexInStoreOptions === -1) {
        const options = [...this.questionOptions];
        options.splice(visibleOptionIndex, 0, updatedOption);
        this.updateQuestionOptions(options);

        for (let opIdx = visibleOptionIndex + 1; opIdx < this.optionsData.length; opIdx++) {
          if (this.optionsData[opIdx].indexInStoreOptions > -1) {
            this.optionsData[opIdx].indexInStoreOptions = this.optionsData[opIdx].indexInStoreOptions + 1;
          }
        }
        updatedOptionData.indexInStoreOptions = visibleOptionIndex;
      } else {
        updatedOptionData.indexInStoreOptions = previousOptionData.indexInStoreOptions;
        this.updateSingleOptionValue(updatedOption, previousOptionData.indexInStoreOptions);
      }
      this.optionsData[visibleOptionIndex] = updatedOptionData;
    },

    toggleCaptionCharLimitError(index, updatedValue) {
      if (updatedValue.text.length === this.captionCharLimit + 7) {
        this.imageCaptionCharLimitOptionIndexTimeout && clearTimeout(this.imageCaptionCharLimitOptionIndexTimeout);

        this.imageCaptionCharLimitOptionIndex = index;

        this.imageCaptionCharLimitOptionIndexTimeout = setTimeout(() => {
          this.imageCaptionCharLimitOptionIndex = -1;
        }, 2000);
      } else {
        this.imageCaptionCharLimitOptionIndex = -1;
        this.imageCaptionCharLimitOptionIndexTimeout && clearTimeout(this.imageCaptionCharLimitOptionIndexTimeout);
      }
    },

    toggleOptionCaption(index) {
      this.imageUploadedForOptionIndex = -1;
      const previousOptionData = this.optionsData[index];

      const updatedOptionData = this.getOptionData({
        ...previousOptionData,
        key: previousOptionData.key,
        isCaptionVisible: !previousOptionData.isCaptionVisible,
      });

      if (!updatedOptionData.isCaptionVisible) {
        const previousOption = this.questionOptions[previousOptionData.indexInStoreOptions];
        const mediaObj = this.getOptionMedia(previousOption);
        const media = cloneDeep(mediaObj);

        delete media.meta.text;

        const updatedOption = this.getStoreConsumableOption(previousOption, { image: media }, updatedOptionData);
        updatedOptionData.indexInStoreOptions = previousOptionData.indexInStoreOptions;
        this.updateSingleOptionValue(updatedOption, previousOptionData.indexInStoreOptions);
      }

      this.optionsData[index] = updatedOptionData;

      this.$nextTick(() => {
        const ref = this.getOptionCaptionTipTapRef(index);

        if (ref) {
          ref.focus();
        }
      });
    },

    addToOptionErrors(target = 'option', index, { code }, shouldToggle = true, toggleTimeout = 4000) {
      if (isEmpty(code)) {
        return;
      }

      if (target === 'addBtn') {
        this.addOptionBtnErrors.push({ code });

        if (shouldToggle) {
          const method = () => {
            const errs = [...this.addOptionBtnErrors];

            remove(errs, (err) => err.code === code);
            this.addOptionBtnErrors = errs;
          };
          const timeout = setTimeout(method, toggleTimeout);

          this.validationErrorTimeout.push(timeout);

          // TODO(Sarthak): Cleanup
          return { timeout, method };
        }

        return;
      }

      const validationErrors = { ...this.optionValidationErrors };
      validationErrors[index] = isArray(validationErrors[index]) ? validationErrors[index] : [];
      validationErrors[index].push({ code });

      this.optionValidationErrors = validationErrors;

      if (shouldToggle) {
        const method = () => {
          const errs = { ...this.optionValidationErrors };

          remove(errs[index], (err) => err.code === code);
          this.optionValidationErrors = errs;
        };
        const timeout = setTimeout(method, toggleTimeout);

        this.validationErrorTimeout.push(timeout);

        // TODO(Sarthak): Cleanup
        return { timeout, method };
      }
    },

    getOptionEditorId(index) {
      return `option-${index}`;
    },

    getOptionCaptionEditorId(index) {
      return `option-caption-${index}`;
    },

    setSelectedQuestionElement(elementId = '') {
      this.$store.dispatch('slideEditor/setTiptapEditorInFocus', { id: elementId, slideType: this.questionType });
    },

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
        },
        closeCallback: () => {
          this.$eventBus.$emit('questionEditor:closeMathEditor', {
            elementId: optionEditorId,
          });
        },
      });
    },

    getTiptapValue(optionVisibleIndex) {
      const optionData = this.optionsData[optionVisibleIndex];
      const text = this.getOptionTextFromIndex(optionVisibleIndex);
      return {
        text: isEmpty(text) ? Constants.TipTap.INITIAL_TIP_TAP_VALUE : text,
        isEmpty: optionData.isTextEmpty,
        isFocused: optionData.isFocused,
      };
    },

    isGeneratedOptionKatex(generatedOption) {
      if (generatedOption?.text) {
        return generatedOption.text.includes('latex=');
      }
      return false;
    },

    getTiptapGeneratedOptionsValue(generatedOptionsText) {
      return {
        text: generatedOptionsText,
        isEmpty: true,
        isFocused: false,
      };
    },

    getTiptapValueForCaption(optionVisibleIndex) {
      const optionData = this.optionsData[optionVisibleIndex];
      const text = this.getOptionCaptionTextFromIndex(optionVisibleIndex);

      return {
        text: isEmpty(text) ? Constants.TipTap.INITIAL_TIP_TAP_VALUE : text,
        isEmpty: optionData.isCaptionEmpty,
        isFocused: optionData.isCaptionFocused,
      };
    },

    checkAndToggleMarkAnswerNudge() {
      if (this.editorSaveValidations.length > 1 || this.questionOptions.length !== this.optionsData.length || this.hasEmptyOptionsInStore) {
        this.nudgeForMarkingAnswer = false;
        return;
      }

      const markAnswerValidation = this.editorSaveValidations[0]?.errorCode === this.$constants.QuestionValidationErrorCodes.ANSWER_NOT_MARKED;

      this.nudgeForMarkingAnswer = markAnswerValidation;
    },

    onOptionImageReedit(index) {
      const optionImage = this.getOptionMediaFromIndex(index);

      this.$eventBus.$emit('presentationEditor:showImageUpload', { callback: this.onImageUploadComplete.bind(this, index, true), media: optionImage });
    },

    getTipTapRef(index) {
      return this.$refs?.tiptap?.find((tiptap) => tiptap.editorId === this.getOptionEditorId(index)) || null;
    },

    getOptionCaptionTipTapRef(index) {
      const editorId = this.getOptionCaptionEditorId(index);

      const ref = this.$refs?.tiptap?.find((tiptap) => tiptap.editorId === editorId);

      return ref || null;
    },

    getOptionMedia(option) {
      const mediaObj = option.media && option.media[0];

      return !isEmpty(mediaObj) ? mediaObj : null;
    },

    getOptionText(option) {
      return option?.text || '';
    },

    getOptionCaptionText(option) {
      const optionMedia = this.getOptionMedia(option);

      return get(optionMedia, 'meta.text', '');
    },

    getOptionMediaFromIndex(index) {
      const optionData = this.optionsData[index];

      if (!this.isOptionLinkedToStore(index)) {
        return null;
      }

      return this.getOptionMedia(this.questionOptions[optionData.indexInStoreOptions]);
    },

    getOptionTextFromIndex(index) {
      const optionData = this.optionsData[index];

      if (!this.isOptionLinkedToStore(index)) {
        return '';
      }

      return this.getOptionText(this.questionOptions[optionData.indexInStoreOptions]);
    },

    getOptionCaptionTextFromIndex(index) {
      const optionData = this.optionsData[index];

      if (!this.isOptionLinkedToStore(index)) {
        return '';
      }

      return this.getOptionCaptionText(this.questionOptions[optionData.indexInStoreOptions]);
    },

    /**
     * Outputs an object that can updated in store.
     * @param {Object} - current option in store
     * @param {Object} - updated entities of the option. Currently only text or image can be updated by user
     * @param {Object} - optionData object corresponding this option
     */
    getStoreConsumableOption(currentOption = {}, { text, image } = {}, { isTextEmpty = true, isMediaEmpty = true } = {}) {
      const isTextPresent = !isTextEmpty;
      const isMediaPresent = !isMediaEmpty;
      const updatedOption = QuestionOption();

      if (isTextEmpty && isMediaEmpty) {
        return QuestionOption({ _id: currentOption._id });
      }

      if (isMediaPresent) {
        updatedOption.type = 'image';
        updatedOption.media = [image];
      }

      if (isTextPresent) {
        const { hasMath, math } = evaluateMathTemplate(text);

        updatedOption.type = 'text';
        updatedOption.text = text;
        updatedOption.hasMath = hasMath;
        updatedOption.math = math;
      }

      return updatedOption;
    },

    /**
     * @param {Number} - index of the option on the UI
     * @returns {Boolean} - If the option in added to the store
     */
    isOptionLinkedToStore(visibleOptionIndex) {
      const optionData = this.optionsData[visibleOptionIndex];

      return (
        Boolean(optionData)
        && optionData.indexInStoreOptions >= 0
        && !isEmpty(this.questionOptions[optionData.indexInStoreOptions])
      );
    },

    // ! tiptap input handlers
    onTipTapInput(index, updatedValue) {
      const updatedOptionData = this.getOptionData({
        ...this.optionsData[index],
        isTextEmpty: updatedValue.isEmpty,
        isFocused: updatedValue.isFocused,
      });

      if (updatedValue.isFocused) {
        this.setSelectedQuestionElement(this.getOptionEditorId(index));
      }

      this.optionsData[index] = updatedOptionData;

      if (this.isOptionLinkedToStore(index)) {
        const updatedOption = this.getStoreConsumableOption(this.questionOptions[this.optionsData[index].indexInStoreOptions], updatedValue, updatedOptionData);

        this.updateSingleOptionValue(updatedOption, updatedOptionData.indexInStoreOptions);
        return;
      }

      this.handleAddingRemovingFromStore(index, 'addition', updatedValue);
    },

    onTipTapInputForCaption(index, updatedValue) {
      this.toggleCaptionCharLimitError(index, updatedValue);

      const previousOptionData = this.optionsData[index];
      const updatedOptionData = this.getOptionData({
        ...this.optionsData[index],
        isCaptionEmpty: updatedValue.isEmpty,
        isCaptionFocused: updatedValue.isFocused,
      });

      const previousOption = this.questionOptions[previousOptionData.indexInStoreOptions];
      const mediaObj = this.getOptionMedia(previousOption);

      const media = cloneDeep(mediaObj);

      if (!updatedValue.isEmpty) {
        if (has(media, 'meta')) {
          media.meta.text = updatedValue.text;
        } else {
          media.meta = {
            text: updatedValue.text,
          };
        }
      } else if (has(media, 'meta')) {
        delete media.meta.text;
      }

      const updatedOption = this.getStoreConsumableOption(previousOption, { image: media }, updatedOptionData);
      updatedOptionData.indexInStoreOptions = previousOptionData.indexInStoreOptions;
      this.optionsData[index] = updatedOptionData;

      this.updateSingleOptionValue(updatedOption, previousOptionData.indexInStoreOptions);
    },

    // ! presave hook
    preSaveHook() {
      // TODO Rohit : check this flow, for waiting before saving to api
      const finalOptions = this.questionOptions.filter((option) => !isOptionEmpty(option));
      let shouldSetOptions = false;
      if (finalOptions.length !== this.questionOptions.length) {
        shouldSetOptions = true;
      }

      if (this.isQuestionTypeMCQ) {
        // finding the index of the answer in the initial options, and then finding the index of that option in the final options
        const optionIdForAnswerBeforeSave = this.questionOptions[this.questionAnswer[0]]?._id;
        const finalAnswerIndexAfterSave = finalOptions.findIndex((option) => option._id === optionIdForAnswerBeforeSave);
        this.updateQuestionOptionsAndAnswer(finalOptions, finalAnswerIndexAfterSave);
        return;
      }

      // if any answer index is greater than the length of options, remove it
      if (this.isQuestionTypeMSQ) {
        const optionIdsForAnswerBeforeSave = this.questionAnswer.map((index) => this.questionOptions[index]?._id);
        const finalAnswerIndicesAfterSave = optionIdsForAnswerBeforeSave.map((optionId) => finalOptions.findIndex((option) => option?._id === optionId));

        this.updateQuestionOptionsAndAnswer(finalOptions, finalAnswerIndicesAfterSave);
        return;
      }
      if (shouldSetOptions) {
        this.updateQuestionOptions(finalOptions);
      }
    },

    // ! store actions
    updateSingleOptionValue(option, indexInStoreOptions) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', {
        option,
        index: indexInStoreOptions,
      });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    updateQuestionOptions(options) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    updateQuestionOptionsAndAnswer(options, answer) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options, answer: this.getUpdatedAnswerValue(answer) });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    updateAnswerValue(answer) {
      this.$store.dispatch('slideEditor/updateQuestionAnswer', { answer: this.getUpdatedAnswerValue(answer) });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    onTipTapBlurForOptionsGenerator(index) {
      try {
        if (this.isOptionsApiCallInProgress) {
          return;
        }
        if (!this.isOptionsGeneratorUsed && this.canShowOptionsGenerator && !this.isBasicUser) {
          this.getAutoFillOptions();
        }
      } catch (err) {
        return err;
      }
    },

    onTipTabBlurUsingTab(event, index) {
      if (this.getOptionTextFromIndex(index).length !== 0) {
        return;
      }
      if (this.isOptionsGeneratorUsed && !this.isBasicUser && !this.generatedOptionsIndexesUsed.includes(index)) {
        event.preventDefault();
        this.useGeneratedOption(index, 'tab');
      }
    },

    onTiptapBlur(editor, index) {
      if (!this.isOptionsGeneratorUsed || this.canShowGeneratedOptionsResult) {
        this.onTipTapBlurForOptionsGenerator(index);
      }
      const text = editor.getHTML();

      // remove option from answer if it is empty
      if (isOptionEmpty(this.questionOptions[this.optionsData[index].indexInStoreOptions]) && this.isOptionMarkedAsCorrect(index)) {
        this.toggleOptionCorrectness(index);
      }

      // Detach bounce animation from generate all options btn
      if (this.showBounceForGenerateAllOptionsButton) {
        this.showBounceForGenerateAllOptionsButton = false;
      }
    },
  },
};
</script>

<style lang="scss">
  .option-toolbar {
    >.v-popover {
      >.trigger {
        display: flex !important
      }
    }
  }

</style>

<style lang="scss" scoped>
// TODO(sarthak): figure out how to use the tailwind config variables here as well
$option1BgColor: #2D70AE;
$option2BgColor: #2D9DA6;
$option3BgColor: #EFA929;
$option4BgColor: #D5546D;
$option5BgColor: #9A4292;
$optionAutoFillBgColor: #2D9DA6;
$pollOptionBGColor: #2D70AE;
$imageOptionBGColor: #FFFFFF;
$optionColorDarkenPercentage: 12.5%;
$optionShadowHeightUnPressed: 8px;
$optionShadowMobileHeightUnPressed: 4px;
$optionShadowHeightPressed: 4px;

.question-options-editor-container {
  &.tablet {
    max-height: calc(100% - 68px);
    min-height: 100%;
  }
}

.options-container {
  &.tablet {
    max-height: calc(100% - 48px);
  }
}

.generate-btn {
  background-color: #6B4868;

  &:hover {
    background-color: #6c576b;
  }
}

@mixin optionBgColor($color) {
  .option-inner {
    background-color: $color;
    box-shadow: 0px $optionShadowMobileHeightUnPressed 0px 0px darken($color, $optionColorDarkenPercentage);

    &.desktop {
      padding: 8px;
      box-shadow: 0px $optionShadowHeightUnPressed 0px 0px darken($color, $optionColorDarkenPercentage);
    }

    &.tablet, &.mobile {
      padding: 4px;
    }
  }

  &.pressed .option-inner {
    box-shadow: 0px $optionShadowHeightPressed 0px 0px darken($color, $optionColorDarkenPercentage);
  }

  &.when-image-option .option-inner {
    background-color: $imageOptionBGColor;
    box-shadow: 0px $optionShadowMobileHeightUnPressed 0px 0px darken($imageOptionBGColor, $optionColorDarkenPercentage);

    &.desktop {
      box-shadow: 0px $optionShadowHeightUnPressed 0px 0px darken($imageOptionBGColor, $optionColorDarkenPercentage);
    }
  }

  &.when-poll-question .option-inner {
    background-color: $pollOptionBGColor;
    box-shadow: 0px $optionShadowMobileHeightUnPressed 0px 0px darken($pollOptionBGColor, $optionColorDarkenPercentage);

    &.desktop {
      box-shadow: 0px $optionShadowHeightUnPressed 0px 0px darken($pollOptionBGColor, $optionColorDarkenPercentage);
    }
  }
}

.option-container {
  &.opt-num-1 {
    @include optionBgColor($option1BgColor);
  }

  &.opt-num-2 {
    @include optionBgColor($option2BgColor);
  }

  &.opt-num-3 {
    @include optionBgColor($option3BgColor);
  }

  &.opt-num-4 {
    @include optionBgColor($option4BgColor);
  }

  &.opt-num-5 {
    @include optionBgColor($option5BgColor);
  }

  &.opt-num-autofill {
    @include optionBgColor($optionAutoFillBgColor);
  }

  &.pressed .option-inner {
    transform: translateY($optionShadowMobileHeightUnPressed - $optionShadowHeightPressed);

    &.desktop {
      transform: translateY($optionShadowHeightUnPressed - $optionShadowHeightPressed);
    }
  }

  &.tablet {
    max-height: 100%;
  }
}

.option-inner {
  width: 100%;
  height: calc(100% - #{$optionShadowMobileHeightUnPressed});
  transition: all 0.4s ease;
  min-height: 60px;

  &.desktop {
    height: calc(100% - #{$optionShadowHeightUnPressed});
  }
}

.add-option-btn {

  &.desktop {
    $addOptionSize: 52px;

    top: calc(50% - calc($addOptionSize / 2));

    &:active, &:focus {
      outline: none;
    }

    position: absolute;
    width: $addOptionSize;
    height: $addOptionSize;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    right: calc(-1 * (theme('gap.16') + 16px));
  }
}

.mark-option-as-correct {
  &:focus {
    outline: none;
  }

  &.is-for-msq {
    border-radius: theme('borderRadius.DEFAULT');
  }
}

.mark-option-as-correct-tooltip {
  margin-left: auto !important;
}

.option-content-container {
  &.desktop {
    width: calc(100% - theme('width.3'));
    height: calc(100% - theme('height.9')); // `height.9` accounts for the height of the option-toolbar
  }

  &.tablet {
    width: calc(100% - theme('width.2'));
    height: calc(100% - theme('height.6')); // `height.6` accounts for the height of the option-toolbar
  }

  &.mobile {
    width: calc(100% - 32px);
    max-width: 100%;

    img {
      margin: auto;
      max-width: calc(100% - 60px);
    }
  }

  &.show-generated-options {
    width: theme('width.full');
    width: theme('height.full');
  }
}

.option-caption-container {
  &.desktop {
    height: theme('height.15');
    width: calc(100% - theme('width.2'));
  }

  &.tablet {
    height: theme('height.12');
    width: calc(100% - theme('width.2'));
  }

  &.mobile {
    max-width: calc(100% - 36px);
    max-height: 48px;
  }
}

.option-image {
  &.tablet {
    > img {
      max-width: fit-content;
      margin: auto;
    }
  }
}

.reedit-media {
  position: absolute;
}

.option-toolbar {
  &.desktop {
    flex-direction: row;
    height: 36px;
  }

  &.tablet {
    flex-direction: row;
    height: 24px;
    display: flex;
    align-items: flex-end;
  }

  &.mobile {
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
    display: flex;
    align-items: flex-end;
  }
}

.tiptap-editor {
  &.light-theme {
    &.desktop, &.tablet {
      :deep() &:not(.when-text-overflows) .ProseMirror {
        > p:first-child {
          margin-top: 0px
        }
      }
    }
  }

  &.desktop, &.tablet {
    :deep() &:not(.when-text-overflows) .ProseMirror {
      > p:first-child {
        margin-top: -24px
      }
      u {
        text-decoration-line: underline;
        * {
          text-decoration-line: underline;
        }
      }
    }
  }
}

.generated-option::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.generated-option {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.mark-answer-nudge {
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    background-color: theme('backgroundColor.light.33%');
    border-radius: inherit;

    animation: strobingNudge 2s ease 200ms 5;
  }
}

@keyframes strobingNudge {
  0% {
    transform: scale(1.15);
  }

  25% {
    transform: scale(1.8);
  }

  50% {
    transform: scale(1.35);
  }

  75% {
    transform: scale(1.8);
  }

  100% {
    transform: scale(1.15);
  }
}

.options-gen-loading-icon-animation {
  animation: strobingNudgeWithFading 2s ease-in-out 200ms 5;
}

@keyframes strobingNudgeWithFading {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.33);
    opacity: 0.5;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.bounce-button {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    -moz-transform: translateY(0);
    -ms-transform: translateY(0);
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
  40% {
    -moz-transform: translateY(-10px);
    -ms-transform: translateY(-10px);
    -webkit-transform: translateY(-10px);
    transform: translateY(-10px);
  }
  60% {
    -moz-transform: translateY(-5px);
    -ms-transform: translateY(-5px);
    -webkit-transform: translateY(-5px);
    transform: translateY(-5px);
  }
}
</style>

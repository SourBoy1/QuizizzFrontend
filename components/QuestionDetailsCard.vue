<template>
  <div
    ref="questionDetailCardRef"
    :class="[
      'question-details-card flex flex-col',
      !isForTeleportPage ? 'border border-solid border-dark-6 rounded-lg shadow-sm' : '',
      shouldShowSuperBorder ? '!border-[2px] border-yellow' : '',
      responseWrapperClasses,
    ]"
  >
    <template v-if="showAutoConvertLoader">
      <div class="h-100 w-full bg-light-3 shadow border-dark-6 flex justify-center items-center">
        <img
          src="https://cf.quizizz.com/gif/magic-wand.gif"
          :alt="$i18n('auto-converting question')"
          class="w-15 h-auto"
        />
      </div>
    </template>
    <template v-else>
      <template v-if="showAutoConvertNudge">
        <transition
          appear
          enter-active-class="animate__animated animate__fadeInDown animation-duration-600"
          leave-active-class="animate__animated animate__fadeOutUp animation-duration-300"
        >
          <div class="w-full bg-lilac-faded flex items-center justify-between py-3 px-4">
            <div class="flex items-center text-sm text-lilac">
              <I18n>Want to convert this question to a more interactive format? Try</I18n><span class="font-bold ml-1">
                <I18n>Auto-convert!</I18n>
              </span>
            </div>
            <Button
              class="text-dark-4"
              :type="'link-no-bg'"
              size="sm"
              :licon="'fas fa-close'"
              @click.stop="hideAutoConvertNudge"
            />
          </div>
        </transition>
      </template>
      <div
        v-if="shouldShowReorderToolbar"
        class="flex items-center justify-between p-2 bg-light-2"
        :class="[{ 'rounded-t-lg': !isForTeleportPage }]"
      >
        <div class="relative flex items-center gap-x-2">
          <div
            v-if="!isDesktop"
            class="absolute w-11 h-11 -left-2 z-1"
            :class="[!isDesktop ? handleClass : '']"
          />
          <Button
            v-tooltip="tooltipOptions"
            class="w-8 h-8 drag-button text-dark-4 hover:bg-dark-5% rounded"
            :class="[isCurrentStateReorder ? 'reorder' : '', { 'z-0': !isDesktop }]"
            :licon="`fas fa-${isCurrentStateReorder ? 'grip-horizontal' : 'sort-alt'}`"
            type="other"
            :aria-label="isCurrentStateReorder ? $i18n('Drag to reorder') : $i18n('Toggle reorder')"
            @click="onDragButtonClicked"
          />

          <QuestionTypeIcon
            :size="12"
            radius="sm"
            classes="w-6 h-6"
            :type="selectedQuestionType"
          />

          <h2
            class="text-sm"
            :class="isDarkVariant ? 'text-light' : 'text-dark-2'"
          >
            <template v-if="isCurrentStateReorder && currentIndex !== questionIndex">
              <i18n :injections="[currentIndex + 1, questionIndex + 1]">
                Question {$1} (was Question {$2})
              </i18n>
              <Lozenge
                v-if="shouldShowSuperBorder"
                class="bg-super text-light-1"
                :title="$i18n('SUPER')"
                icon="fas fa-bolt-lightning"
                size="sm"
              />
            </template>
            <template v-else>
              <i18n :injections="[questionIndex + 1]">
                Question {$1}
              </i18n>
              <Lozenge
                v-if="shouldShowSuperBorder"
                class="bg-super text-light-1 ml-2"
                :title="showIndividualPlan ? $i18n('Premium') : $i18n('SUPER')"
                icon="fas fa-bolt-lightning"
              />
            </template>
          </h2>
        </div>

        <div
          v-if="!isCurrentStateReorder && !isProfilePage"
          class="flex"
        >
          <Button
            v-tooltip.top="{ content: $i18n('Edit this question') }"
            :title="isDesktop ? $i18n('Edit') : ''"
            :fullHeight="true"
            class="mr-2"
            size="md"
            type="white"
            licon="far fa-pen"
            :aria-label="$i18n('Edit this question')"
            @click="onEditQuestionClick"
          />

          <div
            v-if="!isBasicUser && questionAutoConvertVersions.length > 0"
            class="relative"
          >
            <FA
              v-if="showAutoConvertNudge"
              icon="fas fa-triangle"
              class="absolute left-3 bottom-8 text-lilac-faded rotate-180"
              :size="12"
            />
            <Button
              v-tooltip.top="$i18n('Auto-convert this question')"
              class="mr-2"
              :type="showAutoConvertNudge ? 'secondary' : 'white'"
              size="md"
              :licon="'fas fa-arrows-retweet'"
              @click.stop="openAutoConvertModal"
            />
          </div>
          <Button
            v-tooltip.top="{ content: $i18n('Duplicate this question') }"
            class="mr-2"
            size="md"
            type="white"
            licon="far fa-copy"
            :aria-label="$i18n('Duplicate this question')"
            :fullHeight="true"
            :loading="isDuplicationInProgress"
            :disabled="isQuestionLimitReached"
            :applyDisabled="false"
            @click="onDuplicateQuestionClick"
          />

          <PopoverConfirmer
            type="danger"
            class="relative z-10"
            placement="top"
            :content="{
              title: $i18n('Are you sure you want to delete this question?'),
            }"
            :button2="{
              title: $i18n('Delete'),
            }"
            @button2Clicked="onDeleteQuestionClick"
          >
            <Button
              v-tooltip.top="{ content: $i18n('Delete this question') }"
              class="mr-2"
              size="md"
              type="white"
              licon="far fa-trash-alt"
              :aria-label="$i18n('Delete this question')"
              :fullHeight="true"
              :loading="isDeletionInProgress"
            />
          </PopoverConfirmer>
        </div>
      </div>

      <div
        v-if="isCurrentPageShowingResponses"
        class="flex w-full text-dark-1 font-medium text-sm justify-between p-4 border-b-1 border-dark-20%"
        @click.stop="$emit('click', question)"
        @mouseenter.stop="$emit('mouseenter')"
        @mouseleave.stop="$emit('mouseleave')"
      >
        <i18n :injections="[questionIndex + 1]">
          Question {$1}
        </i18n>
        <div>
          <FA
            :icon="['fas', responseIconClass].join(' ')"
            :class="responseIconColorClass"
          />
          <span class="ml-1">{{ responseStatusText }}</span>
        </div>
      </div>

      <div
        :class="['p-4', shadowClass, 'rounded-lg']"
        @click.stop="$emit('click', question)"
        @mouseenter.stop="$emit('mouseenter')"
        @mouseleave.stop="$emit('mouseleave')"
      >
        <div
          v-if="isCurrentPageAutoConvertPreview"
          class="pb-4"
        >
          <slot name="auto-convert-question-type-selector" />
        </div>
        <!-- ['teleport', 'quiz-editor', 'quiz-page', 'see-more', 'recommended-for-you', 'preview-questions-in-cart', 'search', 'responses', 'preview'] -->
        <div
          v-else-if="isForTeleportPage
            || isCurrentPageForPreview
            || isCurrentPageQuizPage
            || isCurrentPageSeeMoreOrRecommendedForYou
            || isCurrentPageSearch
            || isCurrentPageCartPreview"
          class="flex justify-between pb-4"
        >
          <div
            v-if="isAutoConvertQuestionTypesEnabled && questionAutoConvertVersions.length > 0"
            ref="autoConvertDropdownAndButton"
            class="flex"
          >
            <div
              v-if="isAutoConvertModalEnabled"
              class="flex"
            >
              <span class="inline-flex items-center min-w-max">
                <Lozenge
                  :iconComponent="questionTypeIconComponent"
                  :title="lozengeTitle"
                  size="sm"
                  :containerClasses="isCurrentPageSearch ? 'text-dark-4' : ''"
                  :isLoading="isLoading"
                />
              </span>
            </div>

            <Dropdown
              v-else
              v-slot="scope"
              v-tooltip.top="{ content: $i18n('Change question type'), distance: 4 }"
              customClasses="flex justify-center items-center bg-light-3 text-dark-3 border border-dark-6 hover:bg-light-1"
              :iconComponent="autoConvertQuestionTypeIconComponent(question)"
              class="question-types-dropdown ml-auto"
              dropDownContainerClasses="w-auto"
              size="xs"
              type="custom"
              :ariaLabel="$i18n('Question types')"
              :tabindex="80"
              :selectedItem="question.type"
              :title="autoConvertLozengeTitle(question.type)"
              @click="handleDropdownClick"
            >
              <ul class="text-dark w-full text-sm overflow-hidden">
                <li
                  v-for="autoConvertVersion in questionAutoConvertVersions"
                  :key="autoConvertVersion._id"
                  class="w-full"
                >
                  <button
                    v-if="question.type !== autoConvertVersion.type"
                    type="button"
                    class="flex items-center h-8 hover:bg-dark-5% w-full"
                    @click="autoConvertDropdownOptionClick(autoConvertVersion, scope.closeDropdown)"
                  >
                    <Lozenge
                      containerClasses="w-full"
                      :iconComponent="autoConvertQuestionTypeIconComponent(autoConvertVersion)"
                      :title="autoConvertLozengeTitle(autoConvertVersion.type, true)"
                      size="sm"
                      :isLoading="isLoading"
                    />
                    <span
                      v-if="isUserNonSndAndNonQfw"
                      class="w-4 h-4 border border-solid border-super text-super inline-flex align-center justify-center rounded mr-2"
                    >
                      <FA
                        icon="fas fa-bolt-lightning"
                        :size="9"
                      />
                    </span>
                  </button>
                </li>
              </ul>
            </Dropdown>

            <Button
              v-if="!isAutoConvertModalEnabled"
              v-tooltip.top="autoConvertTooltipTitle"
              class="ml-2 transition-all duration-300"
              :type="isAutoConversionDone ? 'white' : 'secondary'"
              :title="atleastOneQuestionConverted ? isAutoConversionDone ? $i18n('Revert') : $i18n('Auto Convert') : ''"
              size="xs"
              :licon="isAutoConversionDone ? 'fas fa-undo' : 'fas fa-wand-magic-sparkles'"
              :aria-label="autoConvertTooltipTitle"
              @click="handleAutoConvertButtonClick"
            />

            <Button
              v-if="!isAutoConversionDone && isAutoConvertModalEnabled"
              :title="$i18n('Auto-convert')"
              class="show-on-hover ml-2 transition-all duration-300"
              :type="isBasicUser ? 'super-secondary' : 'secondary'"
              size="xs"
              :licon="'fas fa-arrows-retweet'"
              @click.stop="openAutoConvertModal"
            />

            <Button
              v-if="isAutoConversionDone && !isAutoConvertModalEnabled"
              v-tooltip.top="$i18n('Participant\'s View')"
              class="ml-2 transition-all duration-300"
              type="white"
              size="xs"
              licon="fas fa-play"
              :aria-label="$i18n('Participant\'s View')"
              @click="participantsViewClick"
            />
          </div>

          <div
            v-else
            class="flex"
          >
            <span class="inline-flex items-center min-w-max">
              <Lozenge
                :iconComponent="questionTypeIconComponent"
                :title="lozengeTitle"
                size="sm"
                :containerClasses="isCurrentPageSearch ? 'text-dark-4' : ''"
                :isLoading="isLoading"
              />
            </span>
            <span
              v-if="isCustomResponseAllowed"
              :class="['ml-1 border border-solid border-dark-6 rounded inline-flex items-center min-w-max']"
            >
              <Lozenge
                :title="$i18n('Upload answer type')"
                size="sm"
                :isLoading="isLoading"
              />
            </span>
          </div>

          <span
            class="ml-auto"
            :class="['flex', isLoading ? 'teleport-loading-state' : '']"
            @click.stop
          >
            <div
              v-if="isCurrentPageQuizPage && !isPreviewMode"
              class="show-on-hover transform transition-transform origin-top flex"
            >
              <slot name="showOnHover" />
            </div>
            <slot v-if="!isPreviewMode || isCurrentPageSearch">
              <div ref="addQuestionTooltipButton">
                <Button
                  :ref="`add-button-${question._id}`"
                  :class="isLoading ? 'opacity-0' : ''"
                  size="xs"
                  :title="addButtonTitle"
                  :type="!isQuizLocked ? addButtonType : 'super-secondary'"
                  licon="far fa-plus-circle"
                  :disabled="isAddingTeleportInProgress"
                  @mouseover="setAddButtonType('primary')"
                  @mouseout="setAddButtonType(!isDesktop ? 'secondary' : 'white')"
                  @click="addQuestion"
                />
              </div>
            </slot>
          </span>
          <div
            v-if="isCurrentPageCartPreview"
            class="ml-auto"
          >
            <Button
              v-tooltip.top="{ content: $i18n('Delete this question') }"
              size="md"
              type="danger"
              licon="far fa-trash-alt"
              :aria-label="$i18n('Delete this question')"
              :fullHeight="true"
              @click="onDeleteQuestionClick"
            />
          </div>
        </div>

        <div
          class="flex"
          :class="[shouldShowMediaPreviewForVideos ? 'flex-col-reverse' : 'items-center', isCurrentStateReorder || isAudioVideoTypeQuestion ? '' : 'mb-4']"
        >
          <MediaTile
            v-if="doesQuestionHaveMedia"
            :key="question._id"
            class="mr-4"
            :size="isCurrentStateReorder ? 'sm' : 'md'"
            :type="questionMedia.type"
            :src="questionMedia.url"
            :media="questionMedia"
            :isLoading="isLoading"
            :shouldShowMediaPreview="shouldShowMediaPreviewForVideos"
          />
          <div
            v-if="!!questionTitle"
            class="question-wrapper text-sm flex overflow-hidden"
            :class="[isLoading ? 'teleport-loading-state' : '', shouldShowMediaPreviewForVideos ? 'mb-3' : '', isDarkVariant ? 'text-light' : 'text-dark-2', isClassificationQuestion ? 'flex-col items-start' : 'items-center']"
          >
            <span
              :observe-mutation="'quiz_question_' + questionIndex"
              v-html="getParsedQuestionTitle(questionTitle)"
            />
            <div v-if="isClassificationQuestion">
              <i18n>Groups:</i18n>&nbsp;
              <template
                v-for="(optionGroup, optionGroupIndex) in questionOptionGroups"
                :key="optionGroup.id"
              >
                <span>
                  {{ questionOptionsGroupTitle(optionGroupIndex, optionGroup) }}
                </span>
              </template>
            </div>
          </div>
        </div>

        <div
          v-if="shouldShowTopAnswerTitle"
          class="relative h-px mb-4 bg-light-1"
        >
          <span
            :class="['absolute px-2 text-tn left-4 -translate-y-1/2 transform', isLoading
              ? 'teleport-loading-state' : 'text-dark-4', addButtonType === 'primary' ? 'bg-light-2' : 'bg-light', isDarkVariant ? 'text-light' : '']"
            translate="no"
          >
            {{ isBlankOrEquationTypeQuestion || isGraphingQuestion || isClassificationQuestion ? $i18n('answer')
              : $i18n('answer choices') }}
          </span>
        </div>

        <div
          v-if="isDrawQuestion && !!questionImageMedia && shouldShowAnswerOption"
          class="relative h-px mb-4 bg-light-1"
        >
          <span
            translate="no"
            :class="['absolute px-2 text-tn left-4 -translate-y-1/2 transform', isLoading ? 'teleport-loading-state' : 'text-dark-4 bg-light', { 'text-light bg-dark': isDarkVariant }]"
          >
            <i18n>Background image</i18n>
          </span>
        </div>

        <div
          v-if="isAudioVideoTypeQuestion && shouldShowAnswerOption"
          class="relative h-px my-4 bg-light-1"
        >
          <div
            translate="no"
            :class="['absolute px-2 text-tn left-4 -translate-y-1/2 transform', isLoading ? 'teleport-loading-state' : 'text-dark-4 bg-light']"
          >
            <i18n>Participants record a response</i18n>
          </div>
        </div>

        <div
          v-if="isAudioVideoTypeQuestion && shouldShowAnswerOption"
          class="flex flex-col items-center justify-center w-40 rounded h-26 bg-light-2 border-1 border-dark-6"
        >
          <LoadSVG
            v-if="question.type === $constants.QuestionTypes.AUDIO"
            class="text-dark-10%"
            name="micEmpty"
          />
          <LoadSVG
            v-else
            class="text-dark-10%"
            name="vidEmpty"
          />

          <div class="text-xs italic text-dark-4">
            <span>{{ getMediumTimeTitle(questionAudioVideoAnswerTime) }} {{ question.type
              === $constants.QuestionTypes.AUDIO ? $i18n('audio') : $i18n('video') }}</span>
          </div>
        </div>

        <div
          v-if="shouldShowLargeMediaTileForImage"
          :class="{
            'flex justify-center border border-dark-10% rounded bg-dark-10% mb-4': isDndOnImageQuestion || isHotspotQuestion,
          }"
        >
          <MediaTile
            v-if="isDrawQuestion"
            customContainerClasses="w-64 h-64 border border-dark-10% rounded object-contain"
            type="image"
            :src="questionImageMedia.url"
            :isLoading="isLoading"
          />
          <div
            v-else
            class="w-64 h-64 object-contain bg-light-2"
          >
            <DnDImageCanvas
              v-if="isDndOnImageQuestion"
              :forDisplay="dndQuestionDisplayProps"
            />
            <HotspotCanvas
              v-if="isHotspotQuestion"
              :forDisplay="hotspotQuestionDisplayProps"
            />
          </div>
        </div>

        <div
          v-if="isDndOnImageQuestion"
          class="relative h-px mb-4 bg-light-1"
        >
          <span
            :class="['absolute px-2 text-tn left-4 -translate-y-1/2 transform', isLoading ? 'teleport-loading-state' : 'text-dark-4']"
            translate="no"
          >
            <i18n>answer choices</i18n>
          </span>
        </div>

        <div
          v-if="isMatchTypeQuestion && shouldShowAnswerOption"
          class="flex flex-wrap"
        >
          <table class="overflow-hidden">
            <tr
              v-for="(option, index) in answerOptions"
              :key="option._id"
              class="mb-2"
            >
              <td>
                <div class="w-4 h-4 mr-3 rounded-full bg-dark-6" />
              </td>

              <td v-if="doesOptionHaveText(matches[answer.indexOf(index)])">
                <span
                  :observe-mutation="'quiz_question_option_' + questionIndex + '_' + index"
                  :class="['text-sm', isLoading ? 'teleport-loading-state' : '', isDarkVariant ? 'text-light' : 'text-dark-2']"
                  v-html="shouldShowAnswersForBlankTypeQuestion ? getParsedOptionText(matches[answer.indexOf(index)]) : ''"
                />
              </td>

              <td class="text-dark-1">
                <FA
                  icon="far fa-long-arrow-right"
                  class="mx-3.5"
                  :size="12"
                />
              </td>

              <td
                v-if="doesOptionHaveText(option)"
                class="option-cell"
              >
                <span
                  :class="['text-sm', isLoading ? 'teleport-loading-state' : '', isDarkVariant ? 'text-light' : 'text-dark-2']"
                  :observe-mutation="'quiz_question_option_' + questionIndex + '_' + index"
                  v-html="shouldShowAnswersForBlankTypeQuestion ? getParsedOptionText(option) : ''"
                />
              </td>

              <td v-if="doesOptionHaveMedia(option)">
                <MediaTile
                  size="sm"
                  :src="getOptionMedia(option).url"
                  :media="getOptionMedia(option)"
                  :isLoading="isLoading"
                />
              </td>
            </tr>
          </table>
        </div>

        <div v-else-if="isReorderTypeQuestion && shouldShowAnswerOption">
          <div
            v-for="(option, index) in answerOptions"
            :key="option._id"
            class="flex items-start w-full mb-2"
          >
            <div class="flex items-start h-full pt-1">
              <span class="flex items-center justify-center w-4 h-4 mr-3 rounded-full bg-dark-6">
                <span
                  v-if="shouldShowAnswers"
                  class="text-dark-4 text-xxs"
                >{{ optionOrder(index) }}</span>
              </span>
            </div>

            <span
              v-if="doesOptionHaveText(option)"
              :class="['text-sm', isLoading ? 'teleport-loading-state' : '', isDarkVariant ? 'text-light' : 'text-dark-2']"
              :observe-mutation="'quiz_question_option_' + questionIndex + '_' + index"
              v-html="shouldShowAnswersForBlankTypeQuestion ? getParsedOptionText(option) : ''"
            />

            <MediaTile
              v-if="doesOptionHaveMedia(option)"
              size="sm"
              :src="getOptionMedia(option).url"
              :media="getOptionMedia(option)"
              :isLoading="isLoading"
            />
          </div>
        </div>

        <div
          v-else-if="isGraphingQuestion"
          class="flex max-h-64 max-w-64"
        >
          <NonInteractiveGraphWidget
            :plots="getPlotData"
            :scale="getScale"
          />
        </div>

        <div v-else-if="isClassificationQuestion">
          <ClassificationQuestionOptionsContainer
            :isLoading="isLoading"
            :options="options"
            :answer="answer"
            :targets="question.structure.targets"
            :shouldShowAnswers="shouldShowAnswers"
          />
        </div>

        <div
          v-else-if="!isOpenEndedTypeQuestion && !isHotspotQuestion && shouldShowAnswerOption"
          class="flex flex-wrap"
        >
          <div
            v-for="(option, index) in answerOptions"
            :key="index"
            class="flex items-start mb-2"
            :class="verticallyAlignOptions ? 'w-full' : 'w-1/2'"
          >
            <span
              v-if="isEquationTypeQuestion"
              class="w-4 h-4 rounded-full my-1 mr-2 relative shrink-0 bg-green"
            />
            <span
              v-if="shouldShowAnswersForBlankTypeQuestion && !isEquationTypeQuestion"
              :class="['w-4 h-4 rounded-full my-1 mr-2 relative shrink-0',
                       {
                         'flex items-center justify-center': isInteractiveBlankTypeQuestion || isDndOnImageQuestion,
                       },
                       optionBgColorClass(index, option._id),
              ]"
            >
              <FA
                v-if="isBlankTypeQuestion"
                class="absolute transform -translate-x-1/2 -translate-y-1/2 text-dark-4 top-2/4 left-2/4"
                icon="far fa-chevron-right"
                :size="9"
              />
              <span
                v-if="isInteractiveBlankTypeQuestion && shouldShowAnswers"
                class="text-light-3 text-tn font-bold"
              >
                {{ notationForBlank(option._id, index) }}
              </span>
              <span
                v-if="isDndOnImageQuestion && shouldShowAnswers"
                class="text-light-3 text-tn font-bold"
              >
                {{ String.fromCharCode(97 + index) }}
              </span>
            </span>

            <span
              v-if="doesOptionHaveText(option)"
              :class="['text-sm', isLoading ? 'teleport-loading-state' : '', isDarkVariant ? 'text-light' : 'text-dark-2', {
                'no-style-katex': isInteractiveBlankTypeQuestion,
              }]"
              :observe-mutation="'quiz_question_option_' + questionIndex + '_' + index"
              v-html="shouldShowAnswersForBlankTypeQuestion ? getParsedOptionText(option) : ''"
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
          </div>
        </div>

        <div
          v-if="isEquationTypeQuestion && shouldShowAnswers"
          class="relative text-sm flex gap-1"
          :class="{ 'mb-6': isCustomUploadTypeQuestion }"
        >
          <MathEquivalencePopover
            iconClasses="text-sm text-dark-4 hover:cursor-pointer"
            placement="right"
          />
          <span class="text-dark-4 text-sm">
            <i18n>Mathematical Equivalence</i18n>
          </span>
          <span class="text-dark-4 text-sm font-bold">{{ showEquivalenceStatus }}</span>
        </div>

        <div
          v-if="shouldShowAlternatives && alternateOptions.length && shouldShowAnswerOption"
          class="relative h-px mt-4 mb-4 bg-light-1"
        >
          <span
            :class="['absolute px-2 text-tn left-4 -translate-y-1/2 transform', isLoading ? 'teleport-loading-state' : 'text-dark-4 bg-light', addButtonType === 'primary' ? 'bg-light-2' : 'bg-light']"
          >
            <i18n>alternatives</i18n>
          </span>
        </div>

        <div
          v-if="shouldShowAlternatives && showAnswerOptions"
          class="flex flex-wrap"
        >
          <div
            v-for="(option, index) in alternateOptions"
            :key="index"
            class="flex items-center w-6/12 mb-2"
          >
            <span :class="['w-4 h-4 rounded-full mr-2 relative', optionBgColorClass(index, option._id)]">
              <FA
                class="absolute transform -translate-x-1/2 -translate-y-1/2 text-dark-4 top-2/4 left-2/4"
                icon="far fa-chevron-right"
                :size="9"
              />
            </span>

            <span
              v-if="doesOptionHaveText(option)"
              :class="['text-sm', isLoading ? 'teleport-loading-state' : '', isDarkVariant ? 'text-light' : 'text-dark-2']"
              v-html="option.text"
            />

            <MediaTile
              v-if="doesOptionHaveMedia(option)"
              class="mr-4"
              size="sm"
              :src="getOptionMedia(option).url"
              :media="getOptionMedia(option)"
              :isLoading="isLoading"
              :shouldShowMediaPreview="shouldShowMediaPreviewForVideos"
            />
          </div>
        </div>

        <div
          v-if="shouldShowAnswers && doesQuestionHaveAnswerExplanation && shouldShowAnswerOption"
          class="relative h-px mt-4 mb-4 bg-light-1"
        >
          <span
            :class="['absolute px-2 text-tn left-4 -translate-y-1/2 transform', isLoading ? 'teleport-loading-state' : 'text-dark-4 bg-light']"
          >
            <i18n>answer explanation</i18n>
          </span>
        </div>

        <div
          v-if="shouldShowAnswers && doesQuestionHaveAnswerExplanation && shouldShowAnswerOption"
          class="flex"
          :class="shouldShowMediaPreviewForVideosForAlternatives ? 'flex-col-reverse' : 'items-center'"
        >
          <MediaTile
            v-if="doesAnswerExplanationHaveMedia"
            class="mr-4 shrink-0"
            size="md"
            :type="answerExplanationMedia[0].type"
            :src="answerExplanationMedia[0].url"
            :media="answerExplanationMedia[0]"
            :isLoading="isLoading"
            :shouldShowMediaPreview="shouldShowMediaPreviewForVideosForAlternatives"
          />

          <div
            :class="['answer-explanation-text text-sm', isLoading ? 'teleport-loading-state' : '', isDarkVariant ? 'text-light' : 'text-dark-2', shouldShowMediaPreviewForVideosForAlternatives ? 'mb-3' : '']"
            v-html="answerExplanationText"
          />
        </div>

        <!-- Custom Response -->
        <div
          v-if="isCustomUploadTypeQuestion"
          class="relative h-px mt-3 mb-4 bg-light-1"
        >
          <span
            :class="['absolute px-2 text-tn left-4 -translate-y-1/2 transform', isLoading
              ? 'teleport-loading-state' : 'text-dark-4', addButtonType === 'primary' ? 'bg-light-2' : 'bg-light']"
          >
            <i18n>Upload answer</i18n>
          </span>
        </div>
        <div
          v-if="isCustomUploadTypeQuestion"
          class="w-full"
        >
          <div class="bg-light-2 rounded border-1 border-dark-6 py-1 px-1.5 flex justify-start items-center gap-2">
            <span>
              <i class="fa fa-check-circle text-green" />
            </span>
            <span class="text-xs text-dark-3">
              <i18n>Allowed</i18n>
            </span>
          </div>
        </div>

        <!-- Topics -->
        <div
          v-if="hasTopics && isCurrentPageQuizPage"
          class="relative h-px mt-4 mb-4 bg-light-1"
        >
          <span
            :class="['absolute px-2 text-tn left-4 -translate-y-1/2 transform', isLoading ? 'teleport-loading-state' : 'text-dark-4 bg-light']"
          >
            <i18n>tags</i18n>
          </span>
        </div>

        <div
          v-if="hasTopics && isCurrentPageQuizPage"
          class="flex"
        >
          <div
            v-for="(topic, topicIdx) of topics.slice(0, 2)"
            :key="topic + topicIdx"
            v-tooltip.bottom="{ content: stateStandards[topic], enabled: !!stateStandards[topic] }"
            class="px-2 mx-2 text-sm rounded bg-light-2 border-1 border-dark-6 w-fit text-dark-3"
          >
            {{ topic }}
          </div>

          <div
            v-if="topics.length > 2"
            class="px-2 mx-2 text-sm rounded bg-light-2 border-1 border-dark-6 w-fit text-dark-3 max-w-"
          >
            <i18n>and 2 more</i18n>...
          </div>
        </div>

        <div v-if="questionAutoConvertVersions.length > 0 && shouldShowAutoConvertPreview">
          <AutoConvertPreview
            ref="autoConvertPreview"
            :quizId="quizId"
            :isAutoConvertMode="isAutoConvertModalEnabled ? true : !isAutoConversionDone"
            :currentQuestion="getAutoConvertQuestion"
            :showAnswers="showAutoConvertAnswers"
            :questionType="getAutoConvertQuestion.type"
            :questionsList="[getAutoConvertQuestion]"
            :originalType="isAutoConversionDone ? autoConvertTypesHistory.originalQuestion.type : question.type"
            :isAutoConvertModalEnabled="isAutoConvertModalEnabled"
            @autoConvertDefault="$emit('autoConvertDefault', getAutoConvertQuestion)"
            @saveChanges="$emit('saveChanges')"
            @autoConvertButtonClick="$emit('autoConvertButtonClick', { isAutoConversionDone: isAutoConversionDone, getAutoConvertQuestion: getAutoConvertQuestion })"
            @revertAutoConversion="$emit('revertAutoConversion')"
            @openAutoConvertModal="openAutoConvertModal"
            @hideAutoConvertPreview="hideAutoConvertPreview"
          />
        </div>
      </div>

      <button
        v-if="shouldToggleAnswerOptions && hasAnswerOptions"
        class="flex items-center justify-end mb-6 ml-auto mr-6 text-tn text-dark-4 w-max"
        translate="no"
        type="button"
        @click="showAnswerOptions = !showAnswerOptions"
      >
        {{ showAnswerOptions ? $i18n("Hide") : $i18n('Show') }} {{ isDrawQuestion ? $i18n("background image")
          : $i18n('answer choices') }}
        <FA
          :icon="answerOptionsToggleIcon"
          class="ml-1"
          :size="9"
        />
      </button>

      <div
        v-if="!!questionTopics && questionTopics.length"
        class="flex items-center w-full bg-dark-5%"
      >
        <p class="m-2 text-xs font-semibold text-dark-3">
          <i18n>Tags</i18n>:
        </p>

        <QuestionDetailsTag
          :topics="questionTopics"
          @ontagsclicked="openTopicTagModal"
        />
      </div>
      <div
        v-if="shouldShowBottomToolbar"
        :class="['p-2 bg-light-2 flex rounded-b-lg flex-wrap', isDesktop ? 'gap-2 justify-initial' : 'gap-1 justify-center']"
      >
        <Dropdown
          v-slot="scope"
          :tooltip="{ content: $i18n('Set time allotted to answer this question'), placement: 'bottom' }"
          icon="fas fa-stopwatch"
          class="w-48-percent md:w-32"
          autoPosition
          size="sm"
          openDirection="top"
          ariaLabel="Timer"
          type="white"
          :iconComponent="timerDropdownIcon"
          :title="getTimeTitle"
          :selectedItem="getTimeTitle"
          :loading="isUpdateTimeInProgress"
        >
          <TimerDropdown
            class="overflow-y-auto h-[16.7rem]"
            :selectedTime="selectedTime"
            @onTimeSelected="onTimeSelected"
            @closeDropdown="scope.closeDropdown"
          />
        </Dropdown>
        <Dropdown
          v-if="!(isForTeleportPage || changeTimeForAllQuestionsBtn.isLoading || changeTimeForAllQuestionsBtn.isDone)"
          v-slot="scope"
          v-tooltip.bottom="{ content: (isPollTypeQuestion ? $i18n('Polls cannot have correct answers <br/> hence will always remain ungraded') : $i18n('Change question points')), distance: 4 }"
          openDirection="top"
          autoPosition
          :class="`${isDesktop ? 'w-38' : 'w-28-percent'}`"
          size="sm"
          type="white"
          ariaLabel="Question Points"
          :loading="isUpdatePointsInProgress"
          :dropdownDisabled="disableGradingDropdown"
          :iconComponent="pointsDropdownIconComponent"
          :xsDropdownTextSize="true"
          :title="getCorrectPointsTitle"
          :selectedItem="getCorrectPointsTitle"
        >
          <PointsDropdown
            :pointsList="pointsList"
            :selectedCorrectPoints="selectedCorrectPoints"
            @pointSelected="(points) => onPointsSelection(points, scope.closeDropdown)"
          />
        </Dropdown>

        <div
          v-if="shouldShowStandardTag"
          class="flex flex-grow-0 ml-auto "
          :class="[isMobile ? 'w-full' : 'w-fit']"
        >
          <div
            v-if="isStandardTagged"
            class="flex items-center justify-center px-2 text-xs font-semibold border border-r-0 rounded-l border-dark-6 bg-green-faded"
            :class="[isMobile ? 'flex-1' : null]"
          >
            <i class="mr-1 far fa-check" />
            {{ standardTaggedText }}
          </div>
          <div
            v-else
            class="flex items-center justify-center px-2 text-xs font-semibold border border-r-0 rounded-l border-dark-6 bg-dark-6"
          >
            <i class="mr-2 far fa-times" />
            {{ notStandardTaggedText }}
          </div>
          <Button
            :fullHeight="true"
            type="white"
            :title="$i18n('Tag')"
            :buttonClasses="` ${isDesktop ? 'ml-auto w-fit flex-grow-0 rounded-none rounded-r' : 'w-48-percent flex-grow flex-1'}`"
            size="sm"
            :licon="(isSuperUser || isCorporateUser) ? 'fas fa-tags' : 'fas fa-lock'"
            @click="openTopicTagModal"
          />
        </div>
        <div
          v-if="!currentIndex && showPopUp"
          class="rounded text-xxs h-26 p-4 ml-1 bg-lilac-faded font-bold w-90 absolute left-160 top-52 z-1 border border-lilac-20%"
        >
          <StandardTagModal @onCloseClick="onCloseClick" />
        </div>
      </div>
      <div
        v-if="(isSuperUser || isCorporateUser) && isCurrentPageQuizEditor && questionQuickTags.length"
        class="w-full bg-dark-5%"
      >
        <div class="flex items-center">
          <p class="m-2 font-semibold text-dark-4 text-xxs w-17">
            <i18n>Quick Tag</i18n>:
          </p>

          <QuestionQuickTag
            :topics="questionQuickTags"
            :isAwaitingApiResponse="loading"
            @ontagsclicked="onQuickTagClick"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { h as hydrate } from 'vue';
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import includes from 'lodash/includes';

import NonInteractiveGraphWidget from '~/components/GraphingPlot/NonInteractiveGraphWidget.vue';

import Question from '~/models/Question';
import QuestionOption from '~/models/QuestionOption';

import { getUUID } from '~/services/UIDService';

import HotspotCanvas from '~/components/OptionsEditor/HotspotEditor/Canvas.vue';
import DnDImageCanvas from '~/components/OptionsEditor/DndImageEditor/Canvas.vue';
import LocalStorage from '~/services/LocalStorage';
import { hasFeatureAccess } from '~/services/SubscriptionService';

import { isNotPremiumWeek } from '~/utils/FreeweekUtils';
import referralMixin from '~/mixins/referralMixin';
import ClassificationQuestionOptionsContainer from '~/components/Classification/QuestionOptionsContainer.vue';
import { getAccountType } from '~/utils/UserUtils';
import katex from 'katex';
import PointsDropdown from './PointsDropdown.vue';
import FA from './FA.vue';
import QuestionTypeIcon from './QuestionTypeIcon.vue';
import { asyncDelay } from '../services/PausableTimers';
import {
  getQuestionTypes,
  isWordCloudQuestion,
  getHtmlWithMathKatexString,
  isQuestionTypeSuperType,
  replaceBlankWithStyledSpan,
  mapBlankIdsToBlankOrder,
  mapTargetIdToOptionId,
  getPointsList,
  isClassificationQuestion,
} from '../utils/QuizUtils';
import Constants from '../config/Constants';
import { ensureSlideV2 } from '../utils/SlideV1Utils';

const autoConvertPreferencesMap = {
  MCQ: ['EQUATION'],
};

const AUTO_CONVERT_NUDGE_DELAY = 1000;

export default {
  components: {
    HotspotCanvas,
    DnDImageCanvas,
    NonInteractiveGraphWidget,
    PointsDropdown,
    ClassificationQuestionOptionsContainer,
  },

  mixins: [referralMixin],

  props: {
    variant: {
      type: String,
      default: 'light',
      validator: (val) => ['light', 'dark'].includes(val),
    },

    questionIndex: {
      type: Number,
      default: 0,
    },

    // BETA response render support. Only MCQ, MSQ, Graphing etc., are supported fully. Only correct/incorrect shown for unsupported types
    response: {
      type: Object,
      default: null,
    },

    selectedTime: {
      type: Number,
      default: Constants.QuestionDefaultTimes[Constants.QuestionTypes.MCQ],
    },

    question: {
      type: Object,
      default() {
        return Question();
      },
    },

    shouldToggleAnswerOptions: {
      type: Boolean,
      default: false,
    },

    hasViewedAutoConvertPreviewYet: {
      type: Boolean,
      default: false,
    },

    atleastOneQuestionConverted: {
      type: Boolean,
      default: false,
    },

    questionTopics: {
      type: Array,
      default: () => [],
    },

    questionQuickTags: {
      type: Array,
      default: () => [],
    },

    showAutoConvertLoader: {
      type: Boolean,
      default: false,
    },

    questionAutoConvertVersions: {
      type: Array,
      default: () => [],
    },

    showAutoConvertPreview: {
      type: Boolean,
      default: false,
    },

    isAutoConversionDone: {
      type: Boolean,
      default: false,
    },

    autoConvertTypesHistory: {
      type: Object,
      default: () => ({
        originalQuestion: {
          type: 'MCQ',
        },
      }),
    },

    selectedCorrectPoints: {
      type: Number,
      default: 0,
    },

    isLoading: {
      type: Boolean,
      default: false,
    },

    isSuperContent: {
      type: Boolean,
      default: false,
    },

    isAddingTeleportInProgress: {
      type: Boolean,
      default: false,
    },

    shouldShowAnswers: {
      type: Boolean,
      default: true,
    },

    stateStandards: {
      type: Object,
      default: () => ({}),
    },

    isPreviewMode: {
      type: Boolean,
      default: false,
    },

    isVerticalList: {
      type: Boolean,
      default: false,
    },

    forPage: {
      type: String,
      validator: (val) => (['teleport', 'quiz-editor', 'quiz-page', 'see-more', 'recommended-for-you', 'preview-questions-in-cart', 'search', 'responses', 'preview', 'auto-convert-preview']).includes(val),
      default: 'teleport',
    },

    noShadow: {
      type: Boolean,
      default: false,
    },

    showOptions: {
      type: Boolean,
      default: true,
    },

    currentState: {
      type: String,
      default: 'edit',
      validator: (val) => ['edit', 'reorder'].includes(val),
    },

    showIndexWithType: {
      type: Boolean,
      default: false,
    },

    isQuestionLimitReached: {
      type: Boolean,
      default: false,
    },

    quizHasAllMCQs: {
      type: Boolean,
      default: false,
    },

    autoConvertNudgeQuestionId: {
      type: [String, Number],
      default: -1,
    },

    currentIndex: {
      type: Number,
      default: 0,
    },
    handleClass: {
      type: String,
      default: '',
    },
  },
  emits: ['click', 'mouseenter', 'mouseleave', 'autoConvertDefault', 'saveChanges', 'autoConvertButtonClick', 'revertAutoConversion', 'hasViewedAutoConvertPreview', 'autoConvertVariantUpdated', 'questionMarksUpdated', 'openTopicTagModal', 'changeCurrentState', 'questionTimeUpdated', 'addQuestion', 'questionEdited', 'questionDuplicated', 'deleteQuestion', 'questionDeleted', 'applyTimeToAllQuestions', 'toggleQuestionLimitModal'],

  data() {
    return {
      addButtonType: 'white',
      addButtonTooltipName: 'add-button-tooltip',
      questionTypes: getQuestionTypes(),
      clickedAddButtonIndex: -1,
      showPopUp: false,
      loading: false,

      showAutoConvertAnswers: false,

      isDuplicationInProgress: false,
      isDeletionInProgress: false,
      isUpdateTimeInProgress: false,
      isUpdatePointsInProgress: false,

      changeTimeForAllQuestionsBtn: {
        isVisible: false,
        isLoading: false,
        isDone: false,
      },

      changePointsForAllQuestionsBtn: {
        isVisible: false,
        isLoading: false,
        isDone: false,
      },

      showAnswerOptions: true,
      shouldShowMediaPreview: false,
      correctPoints: 1,
      katex: null,
      autoConvertPreviewObserver: null,
      autoConvertTimer: null,
      showAutoConvertNudge: false,
      dontShowAutoConvertPreview: false,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['teleportedQuestions', 'quizId', 'quiz']),
    ...mapGetters('root', ['serverData']),
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'isMobile']),
    ...mapGetters('uiManager', ['questionsInCart', 'shouldShowAddToCartHint']),

    isDarkVariant() {
      return this.variant === 'dark';
    },

    shouldShowReorderToolbar() {
      return !this.isCurrentPageForPreview
      && !this.isForTeleportPage
      && !this.isCurrentPageSeeMoreOrRecommendedForYou
      && !this.isCurrentPageSearch
      && !this.isCurrentPageQuizPage
      && !this.isCurrentPageCartPreview
      && !this.isCurrentPageShowingResponses
      && !this.isCurrentPageAutoConvertPreview;
    },

    shouldShowBottomToolbar() {
      return !this.isCurrentPageForPreview
      && !this.isForTeleportPage
      && !this.isCurrentStateReorder
      && !this.isCurrentPageSeeMoreOrRecommendedForYou
      && !this.isCurrentPageSearch
      && !this.isCurrentPageQuizPage
      && !this.isCurrentPageCartPreview
      && !this.isCurrentPageShowingResponses
      && !this.isCurrentPageAutoConvertPreview;
    },

    isProfilePage() {
      return this.$route.path.includes('/profile/');
    },

    responseWrapperClasses() {
      if (!this.isCurrentPageShowingResponses) {
        return '';
      }

      let borderColor;
      if (!this.response) {
        borderColor = 'border-l-dark-50%';
      }

      if (this.isPollTypeQuestion) {
        borderColor = 'border-l-blue';
      } else {
        borderColor = this.isCorrectResponse || this.isPartiallyCorrectResponse ? 'border-l-green' : 'border-l-red';
      }

      return ['border-l-4', borderColor].join(' ');
    },

    responseIconClass() {
      if (!this.response) {
        return 'fa-question-circle';
      }

      if (this.isPollTypeQuestion) {
        return 'fa-poll';
      }

      if (this.isWordCloudTypeQuestion) {
        return 'fa-cloud-word';
      }

      return this.isCorrectResponse || this.isPartiallyCorrectResponse ? 'fa-check' : 'fa-xmark';
    },

    responseIconColorClass() {
      if (!this.response) {
        return 'text-dark-50%';
      }

      if (this.isPollTypeQuestion || this.isWordCloudTypeQuestion) {
        return 'text-blue';
      }

      return this.isCorrectResponse || this.isPartiallyCorrectResponse ? 'text-green' : 'text-red';
    },

    responseStatusText() {
      if (!this.response) {
        return this.$i18n('Not answered');
      }

      if (this.isPollTypeQuestion) {
        return this.$i18n('Poll');
      }

      if (this.isWordCloudTypeQuestion) {
        return this.$i18n('Words');
      }

      if (this.isCorrectResponse) {
        return this.$i18n('Correct');
      }

      return this.isPartiallyCorrectResponse ? this.$i18n('Partially correct') : this.$i18n('Incorrect');
    },

    dndQuestionDisplayProps() {
      const props = {
        image: this.questionImageMedia.url,
        answer: this.answer,
        options: this.options,
        targets: this.question.structure.targets,
      };

      if (this.response?.answer) {
        props.attempts = this.response.answer;
      }

      return props;
    },

    hotspotQuestionDisplayProps() {
      const props = {
        image: this.questionImageMedia.url,
        answer: this.answer,
        options: this.options,
        showAnswers: this.shouldShowAnswers,
      };

      if (this.response) {
        props.response = this.response;
        props.showResponses = true;
      }

      return props;
    },

    pointsList() {
      return getPointsList(this.question);
    },

    shouldShowSuperBorder() {
      return this.forPage === 'quiz-editor' && (this.isAudioOrVideoQuestion() || this.isQuestionTypeSuperType(this.selectedQuestionType) || this.isAudioVideoExplanationsUsed()) && !this.$user.isSuper && !this.$user.isCorporate && isNotPremiumWeek();
    },

    doAtleastOneOptionHaveMediaCaption() {
      for (let i = 0; i < this.answerOptions.length; i++) {
        if (this.doesOptionHaveMediaImageCaption(this.answerOptions[i])) {
          return true;
        }
      }

      return false;
    },

    isCorrectResponse() {
      return this.response && (this.response.result === 'CORRECT');
    },

    isPartiallyCorrectResponse() {
      return this.response && (this.response.result === 'PARTIALLY_CORRECT');
    },

    isIncorrectResponse() {
      return this.response && (this.response.result === 'INCORRECT');
    },

    noQuestionHasBeenAdded() {
      return this.questionsInCart.length === 0;
    },

    showEquivalenceStatus() {
      if (this.question?.structure?.options[0]?.matcher === 'equivalence') {
        return this.$i18n('ON');
      }
      return this.$i18n('OFF');
    },

    shouldShowToolTipForCart() {
      return !!(this.questionIndex === 1 && this.noQuestionHasBeenAdded);
    },

    showYourwork() {
      return get(this.question, 'structure.settings.canSubmitCustomResponse');
    },

    doesUserHaveAccessToSuper() {
      return this.$user.isCorporate || this.$user.isSuper;
    },

    shouldShowLargeMediaTileForImage() {
      if (this.isDrawQuestion) {
        return !!this.questionImageMedia && this.shouldShowAnswerOption;
      }

      return this.isDndOnImageQuestion || this.isHotspotQuestion;
    },

    shouldShowQuestionMediaTile() {
      if (this.isCurrentStateReorder && this.isQuestionMediaVideoType) {
        return false;
      }

      return this.doesQuestionHaveMedia;
    },

    shouldShowAnswersForBlankTypeQuestion() {
      if (this.isBlankTypeQuestion) {
        if (this.shouldShowAnswers) {
          return true;
        }
        return false;
      }
      return true;
    },

    shouldShowTopAnswerTitle() {
      if (this.isDndOnImageQuestion) {
        return false;
      }

      return this.shouldShowAnswers
      && this.shouldShowAnswersForBlankTypeQuestion
      && !this.isOpenEndedTypeQuestion
      && !this.isCurrentStateReorder
      && !this.isDrawQuestion
      && this.showAnswerOptions
      && !this.isAudioVideoTypeQuestion;
    },

    shouldShowAnswersForEquationTypeQuestion() {
      if (this.isEquationTypeQuestion) {
        if (this.shouldShowAnswers) {
          return true;
        }
        return false;
      }
      return true;
    },

    shouldShowAnswerTitle() {
      if (this.isCurrentPageSearch) {
        return false;
      }
      return (this.shouldShowAnswersForBlankTypeQuestion
      && this.shouldShowAnswersForEquationTypeQuestion
      && !this.isOpenEndedTypeQuestion
      && !this.isCurrentStateReorder
      && !this.isDrawQuestion
      && this.showAnswerOptions
      && !this.isAudioVideoTypeQuestion);
    },

    hasAnswerOptions() {
      return !this.isOpenEndedTypeQuestion;
    },

    answerOptionsToggleIcon() {
      return this.showAnswerOptions ? 'fas fa-angle-up' : 'fas fa-angle-down';
    },

    shadowClass() {
      if (this.noShadow) {
        return '';
      }

      return this.isForTeleportPage && !this.isPreviewMode ? 'shadow-md' : 'shadow-sm';
    },

    getCorrectPointsTitle() {
      const singlePointTitle = this.$i18n('point');
      const multiPointsTitle = this.$i18n('points');
      if (this.selectedCorrectPoints === 0) {
        return this.$i18n('Ungraded (0 points)');
      }
      return `${this.selectedCorrectPoints} ${this.selectedCorrectPoints === 1 ? singlePointTitle : multiPointsTitle}`;
    },

    hasTopics() {
      const numOfTopics = get(this.question, 'topics.length', 0);
      return numOfTopics > 0;
    },

    topics() {
      return this.question?.topics ? this.question.topics : [];
    },

    verticallyAlignOptions() {
      return (this.isVerticalList || this.doAtleastOneOptionHaveMediaCaption) && !this.isDesktop;
    },

    questionTopicsToShow() {
      return this.questionTopics.slice(0, 1);
    },

    extraTopicsTitle() {
      return `+ ${this.questionTopics.length - this.questionTopicsToShow.length} more`;
    },

    tooltipOptions() {
      const options = {};

      if (!this.isCurrentStateReorder) {
        options.content = this.$i18n('Click to reorder');
        options.triggers = ['hover'];
        options.placement = 'top';
      }

      return options;
    },

    shouldShowAnswerOption() {
      return !this.isCurrentStateReorder && this.showAnswerOptions;
    },

    isCurrentStateReorder() {
      return this.currentState === 'reorder';
    },

    isCurrentPageSeeMoreOrRecommendedForYou() {
      return this.forPage === 'see-more' || this.forPage === 'recommended-for-you';
    },

    isCurrentPageSearch() {
      return this.forPage === 'search';
    },

    isCurrentPageForPreview() {
      return this.forPage === 'preview';
    },

    isCurrentPageCartPreview() {
      return this.forPage === 'preview-questions-in-cart';
    },

    isCurrentPageQuizEditor() {
      return this.forPage === 'quiz-editor';
    },

    isCurrentPageAutoConvertPreview() {
      return this.forPage === 'auto-convert-preview';
    },

    isCurrentPageQuizPage() {
      return this.forPage === 'quiz-page';
    },

    isCurrentPageShowingResponses() {
      return this.forPage === 'responses';
    },

    timerDropdownIcon() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-stopwatch',
            size: 11,
          });
        },
      };
    },

    showIndividualPlan() {
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    },

    isAutoConvertQuestionTypesEnabled() {
      if (!this.$user.isLoggedIn) {
        return false;
      }
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.AUTO_CONVERT_QUESTION_TYPES_QUIZ_PAGE);
    },

    getTimeTitle() {
      const inSecs = this.selectedTime / 1000;
      const inMinutes = inSecs / 60;

      if (inMinutes >= 1) {
        return (inMinutes === 1) ? this.$i18n('{$1} minute', [inMinutes]) : this.$i18n('{$1} minutes', [inMinutes]);
      }

      return this.$i18n('{$1} seconds', [inSecs]);
    },

    isForTeleportPage() {
      return this.forPage === 'teleport';
    },

    isCustomResponseAllowed() {
      return this.question?.structure?.settings?.canSubmitCustomResponse;
    },

    addButtonTitle() {
      if (this.isCurrentPageSearch) {
        return includes(this.questionsInCart.map((question) => question._id), this.question._id) ? this.$i18n('Add again') : this.$i18n('Add');
      }
      return includes(this.teleportedQuestions, this.question._id) ? this.$i18n('Add again') : this.$i18n('Add question');
    },

    isQuizLocked() {
      return this.isSuperContent && !this.isSuperUser && !this.isCorporateUser;
    },

    isUserNonSndAndNonQfw() {
      // Non SND and QFW
      return !(this.$user.isCorporate || this.$user.isPartOfAnOrganization);
    },

    isSuperUser() {
      return this.$user.isSuper;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    answerOptions() {
      if (this.isBlankOrEquationTypeQuestion) {
        if (this.shouldShowAnswers) {
          if (this.options.length > 0) {
            return [this.options[0]];
          }
        }
        return [];
      }

      if (this.isInteractiveBlankTypeQuestion) {
        if (!this.shouldShowAnswers) {
          return this.options;
        }

        let options = [];
        const targetIdForOptionId = mapTargetIdToOptionId(this.question?.structure?.answer, true);

        this.options.forEach((option) => {
          if (!targetIdForOptionId[option._id]) {
            options.push(option);
            return;
          }

          options = options.concat([...Array(Object.keys(targetIdForOptionId[option._id]).length)].fill(option));
        });

        return options;
      }

      if (this.isDescendingOrder) {
        const options = [...this.options];
        return options.reverse();
      }

      return this.options;
    },

    alternateOptions() {
      return this.options.slice(1);
    },

    isMCQTypeQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.MCQ;
    },

    shouldShowStandardTag() {
      return !this.$user.isCorporate;
    },

    isStandardTagged() {
      if (!this.$user.isPartOfAnOrganization && (this.isSuperUser || this.isCorporateUser)) {
        return this.question?.topics?.length > 0;
      }
      return this.question?.standardIds?.length > 0;
    },

    localeCountry() {
      return this.serverData?.requestCountry;
    },

    standardTaggedText() {
      if (this.localeCountry === 'US' || this.$user.isPartOfAnOrganization) {
        return this.$i18n('Standard Tagged');
      }
      return this.$i18n('Tagged');
    },

    notStandardTaggedText() {
      if (this.localeCountry === 'US' || this.$user.isPartOfAnOrganization) {
        return this.$i18n('Not tagged to a standard');
      }
      return this.$i18n('Not tagged');
    },

    isTagged() {
      return this.question?.topics.length > 0;
    },

    isMatchTypeQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.MATCH;
    },

    isReorderTypeQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.REORDER;
    },

    isInteractiveBlankTypeQuestion() {
      return [this.$constants.QuestionTypes.DRAGNDROP, this.$constants.QuestionTypes.DROPDOWN].includes(this.question?.type);
    },

    isDescendingOrder() {
      return this.isReorderTypeQuestion && this.question?.structure?.order === 'desc';
    },

    isMSQTypeQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.MSQ;
    },

    isOpenEndedTypeQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.OPEN;
    },

    isDrawQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.DRAW;
    },

    isDndOnImageQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.DND_IMAGE;
    },

    isHotspotQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.HOTSPOT;
    },

    isBlankTypeQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.BLANK;
    },

    isEquationTypeQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.EQUATION;
    },

    isBlankOrEquationTypeQuestion() {
      return this.isBlankTypeQuestion || this.isEquationTypeQuestion;
    },

    isGraphingQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.GRAPHING;
    },

    isAudioVideoTypeQuestion() {
      return this.question?.type === this.$constants.QuestionTypes.AUDIO || this.question?.type === this.$constants.QuestionTypes.VIDEO;
    },

    isPollTypeQuestion() {
      return !get(this.question, 'structure.settings.hasCorrectAnswer', false) && (this.isMCQTypeQuestion || this.isMSQTypeQuestion);
    },

    isWordCloudTypeQuestion() {
      return isWordCloudQuestion(this.question);
    },

    isClassificationQuestion() {
      return isClassificationQuestion(this.question);
    },

    disableGradingDropdown() {
      return this.isPollTypeQuestion || this.isWordCloudTypeQuestion;
    },

    gradingDropdownTooltip() {
      if (this.isPollTypeQuestion) {
        return this.$i18n('Polls cannot have correct answers <br/> hence will always remain ungraded');
      }
      if (this.isWordCloudTypeQuestion) {
        return this.$i18n('Word Clouds cannot have correct answers <br/> hence will always remain ungraded');
      }
      return this.$i18n('Change question points');
    },

    options() {
      let val = this.question?.structure?.options;
      if (val == null) {
        val = [];
      }
      return val.map(QuestionOption);
    },

    matches() {
      const matches = [...get(this.question, 'structure.matches', [])];

      if (!this.shouldShowAnswers && this.isCurrentPageQuizPage) {
        matches.sort(() => 0.5 - Math.random());
      }

      return matches;
    },

    answer() {
      if (this.isMSQTypeQuestion || this.isReorderTypeQuestion || this.isMatchTypeQuestion || this.isDndOnImageQuestion) {
        return get(this.question, 'structure.answer', []);
      }

      if (this.isInteractiveBlankTypeQuestion) {
        return mapTargetIdToOptionId(this.question?.structure?.answer ?? [], true);
      }

      return get(this.question, 'structure.answer', null);
    },

    questionMedia() {
      const media = get(this.question, 'structure.query.media', []);
      if (media.length === 0) {
        return [];
      }

      if ([
        this.$constants.QuestionTypes.DRAW,
        this.$constants.QuestionTypes.DND_IMAGE,
        this.$constants.QuestionTypes.HOTSPOT,
      ].includes(this.question.type)) {
        return media.find((item) => item.type === 'audio');
      }
      return media[0];
    },

    questionAudioVideoResponseType() {
      return this.$constants.AudioVideoResponseTypeDetails.find((resp) => resp.title === this.question?.type);
    },

    questionAudioVideoAnswerTime() {
      return get(this.question, 'structure.query.answerTime', 10000);
    },

    shouldShowMediaPreviewForVideos() {
      return this.isQuestionMediaVideoType;
    },

    isQuestionMediaVideoType() {
      return this.questionMedia?.type === 'video';
    },

    shouldShowMediaPreviewForVideosForAlternatives() {
      return this.answerExplanationMedia?.[0]?.type === 'video';
    },

    shouldShowAlternatives() {
      return this.isBlankTypeQuestion && this.shouldShowAnswers;
    },

    questionImageMedia() {
      const media = get(this.question, 'structure.query.media', []);
      return media.find((item) => item.type === 'image');
    },

    doesQuestionHaveMedia() {
      return !isEmpty(this.questionMedia);
    },

    doesQuestionHaveAnswerExplanation() {
      const hasText = !isEmpty(this.answerExplanationText);
      const hasMedia = !isEmpty(this.answerExplanationMedia);

      return !isEmpty(get(this.question, 'structure.explain', {})) && (hasText || hasMedia);
    },

    answerExplanationText() {
      return this.getHtmlToRender(get(this.question, 'structure.explain.text', '') ?? '');
    },

    answerExplanationMedia() {
      return get(this.question, 'structure.explain.media', []);
    },

    doesAnswerExplanationHaveMedia() {
      return !isEmpty(this.answerExplanationMedia);
    },

    questionTitle() {
      return get(this.question, 'structure.query.text', '');
    },

    lozengeTitle() {
      let questionType = this.question?.type;

      if (this.isPollTypeQuestion) {
        questionType = this.$constants.QuestionTypes.POLL;
      }
      if (this.isWordCloudTypeQuestion) {
        questionType = this.$constants.QuestionTypes.WORDCLOUD;
      }
      if (this.showIndexWithType) {
        return `${this.questionIndex + 1}. ${this.questionTypes[questionType]?.title}`;
      }
      return this.questionTypes[questionType]?.title;
    },

    autoConvertTooltipTitle() {
      let questionType = this.isAutoConversionDone ? this.autoConvertTypesHistory.originalQuestion.type : this.getAutoConvertQuestion.type;

      if (this.isPollTypeQuestion) {
        questionType = this.$constants.QuestionTypes.POLL;
      }

      // If auto conversion is done, show original question type to revert back
      if (this.isAutoConversionDone) {
        return this.$i18n('Revert to {$1}', [this.questionTypes[questionType]?.title]);
      }

      return this.$i18n('Auto-convert to {$1}', [this.questionTypes[questionType]?.title]);
    },

    selectedQuestionType() {
      let selectedQuestionType = get(this.question, 'type');

      if (isEmpty(selectedQuestionType)) {
        selectedQuestionType = this.$constants.QuestionTypes.MCQ;
      }

      if (this.isPollTypeQuestion) {
        selectedQuestionType = this.$constants.QuestionTypes.POLL;
      }

      if (this.isWordCloudTypeQuestion) {
        selectedQuestionType = this.$constants.QuestionTypes.WORDCLOUD;
      }

      return selectedQuestionType;
    },

    questionTypeIconComponent() {
      const questionType = this.selectedQuestionType;

      if (this.isCurrentPageSearch) {
        return {};
      }

      return {
        render() {
          return hydrate(QuestionTypeIcon, {
            radius: 'sm',
            type: questionType,
            size: 11,
            withBgBox: false,
          });
        },
      };
    },

    pointsDropdownIconComponent() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-check-circle',
            size: 11,
          });
        },
      };
    },

    orderOfBlankId() {
      return mapBlankIdsToBlankOrder(this.questionTitle);
    },

    getPlotData() {
      if (!this.isGraphingQuestion) { return {}; }
      const answerPlotId = this.question.structure.answer[0];
      let answerPlot = {};
      const plots = [];
      for (let index = 0; index < this.question.structure.graphs.length; index++) {
        const plot = this.question.structure.graphs[index];
        if (plot.plotId === answerPlotId) {
          answerPlot = plot;
        } else {
          plots.push({
            plotData: plot,
            color: '#424242',
          });
        }
      }
      if (this.shouldShowAnswers) {
        plots.push({
          plotData: answerPlot,
          color: '#00C985',
        });
      }
      if (this.response?.answer && !this.isCorrectResponse) {
        plots.push({
          plotData: this.response.answer[0].value[0],
          color: '#EC0B43',
        });
      }
      return plots;
    },

    getScale() {
      return this.question.structure.settings?.graphData?.sizer || 1;
    },

    getAutoConvertQuestion() {
      if (this.isAutoConvertModalEnabled) {
        // pick any version from the first 2 as we only show (2 converted versions + 1 original) in the auto convert modal
        const randomIndex = Math.floor(Math.random() * Math.min(this.questionAutoConvertVersions.length, 2));
        return this.questionAutoConvertVersions[randomIndex];
      }

      if (this.isAutoConversionDone) {
        return this.question;
      }

      let preferedQuestionIndex = -1;

      // There is a preference for this question type
      if (autoConvertPreferencesMap[this.question.type]) {
        for (let i = 0; i < autoConvertPreferencesMap[this.question.type].length; i++) {
          const preferenceType = autoConvertPreferencesMap[this.question.type][i];

          preferedQuestionIndex = this.questionAutoConvertVersions.findIndex(({ type }) => type === preferenceType);
          if (preferedQuestionIndex !== -1) {
            break;
          }
        }

        if (preferedQuestionIndex !== -1) {
          return this.questionAutoConvertVersions[preferedQuestionIndex];
        }
      }

      // if no preferred question type is available for conversion, randomize conversion
      let randomIndex = Math.floor(Math.random() * this.questionAutoConvertVersions.length);

      // Exclude original question type from random selection
      do {
        randomIndex = Math.floor(Math.random() * this.questionAutoConvertVersions.length);
      } while (this.questionAutoConvertVersions[randomIndex].type === this.question.type);

      // return random quesiton
      return this.questionAutoConvertVersions[randomIndex];
    },

    isCustomUploadTypeQuestion() {
      return (this.isOpenEndedTypeQuestion
      || this.isBlankTypeQuestion
      || this.isEquationTypeQuestion)
      && this.isCustomResponseAllowed
      && this.isCurrentPageQuizEditor;
    },

    questionOptionGroups() {
      return this.question.structure.targets ?? [];
    },

    isAutoConvertModalEnabled() {
      return this.isAutoConvertQuestionTypesEnabled
        && this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.SHOW_AUTO_CONVERT_MODAL);
    },

    shouldShowAutoConvertPreview() {
      if (this.isAutoConvertModalEnabled) {
        return this.showAutoConvertPreview
          && this.quizHasAllMCQs
          && !this.dontShowAutoConvertPreview
          && !LocalStorage.getItem('hideAutoConvertPreview');
      }
      return this.showAutoConvertPreview;
    },

    isBasicUser() {
      return getAccountType(this.$user) === this.$constants.AccountTypes.BASIC;
    },
  },

  watch: {
    autoConvertNudgeQuestionId() {
      this.setShowAutoConvertNudge();
    },
  },

  async created() {
    this.katex = katex;
    if (this.shouldToggleAnswerOptions) {
      this.showAnswerOptions = false;
    }

    this.correctPoints = this.selectedCorrectPoints;
    this.showAutoConvertAnswersInterval = setInterval(() => {
      this.showAutoConvertAnswers = !this.showAutoConvertAnswers;
    }, 3000);
  },

  mounted() {
    if (!this.isDesktop) {
      this.setAddButtonType('secondary');
    }
    if (LocalStorage.getItem('isStandardTagButton')) {
      this.showPopUp = true;
    }

    if (this.shouldShowAutoConvertPreview) {
      this.autoConvertPreviewObserver = this.attachIntersectionObserver();
    }

    this.setShowAutoConvertNudge();
  },

  beforeUnmount() {
    if (this.toggleChangeTimeForAllQuestionsTimer) {
      clearTimeout(this.toggleChangeTimeForAllQuestionsTimer);
    }
    LocalStorage.removeItem('isStandardTagButton');
    clearInterval(this.showAutoConvertAnswersInterval);

    if (this.shouldShowAutoConvertPreview) {
      this.autoConvertPreviewObserver?.disconnect();
    }
    this.questionCardIntersectionObserver?.disconnect();
    clearTimeout(this.autoConvertTimer);
  },

  methods: {
    attachIntersectionObserver() {
      const { autoConvertPreview } = this.$refs;

      if (autoConvertPreview?.$el) {
        const observer = new IntersectionObserver(
          ([e]) => {
            if (e.intersectionRatio === 1 && !this.hasViewedAutoConvertPreviewYet && !this.isAutoConversionDone) {
              this.$emit('hasViewedAutoConvertPreview');

              this.$analytics.logEvent(
                this.$webEvents.AUTO_CONVERT_QUIZ_PAGE_PREVIEW_COMPONENT_IN_VIEW,
                {
                  quizId: this.quizId,
                  questionIndex: this.questionIndex,
                },
              );

              this.autoConvertPreviewObserver?.disconnect();
            }
          },
          { threshold: [1] }, // the entire preview component should be in view
        );

        observer.observe(autoConvertPreview?.$el);
        return observer;
      }
    },

    handleAutoConvertButtonClick(event) {
      event.stopPropagation();
      this.$analytics.logEvent(
        this.$webEvents.AUTO_CONVERT_QUIZ_PAGE_QUESTION_CARD_CONVERT_BUTTON_CLICK,
        {
          quizId: this.quizId,
          buttonMode: !this.isAutoConversionDone ? 'autoConvertDefault' : 'revertAutoConversion',
          convertedTo: !this.isAutoConversionDone ? this.getAutoConvertQuestion.type : this.autoConvertTypesHistory.originalQuestion.type,
          convertedFrom: this.isAutoConversionDone ? this.getAutoConvertQuestion.type : this.autoConvertTypesHistory.originalQuestion.type,
        },
      );
      this.$emit('autoConvertButtonClick', { isAutoConversionDone: this.isAutoConversionDone, getAutoConvertQuestion: this.getAutoConvertQuestion });
    },

    hideAutoConvertNudge() {
      this.showAutoConvertNudge = false;
      LocalStorage.setItem('hideAutoConvertNudge', true);
    },

    setShowAutoConvertNudge() {
      this.questionCardIntersectionObserver?.disconnect();

      if (LocalStorage.getItem('hideAutoConvertNudge')) {
        return;
      }

      if (
        this.isAutoConvertModalEnabled
        && !this.isBasicUser
        && this.question._id === this.autoConvertNudgeQuestionId
        && this.quizHasAllMCQs
      ) {
        const { questionDetailCardRef } = this.$refs;
        this.questionCardIntersectionObserver = new IntersectionObserver(([e]) => {
          if (e.isIntersecting && !this.showAutoConvertNudge) {
            clearTimeout(this.showAutoConvertNudgeTimeout);
            this.showAutoConvertNudgeTimeout = setTimeout(() => {
              this.showAutoConvertNudge = true;
            }, AUTO_CONVERT_NUDGE_DELAY);

            this.$analytics.logEvent('auto_convert_v2_question_nudge_viewed', {
              quizId: this.quizId,
              questionId: this.question._id,
            });
          } else {
            clearTimeout(this.showAutoConvertNudgeTimeout);
          }
        }, { threshold: 0.5 });
        this.questionCardIntersectionObserver.observe(questionDetailCardRef);
      }
    },

    participantsViewClick() {
      this.$analytics.logEvent(this.$webEvents.AUTO_CONVERT_QUIZ_PAGE_QUESTION_CARD_PARTICIPANTS_VIEW_BUTTON_CLICK, {
        quizId: this.quizId,
      });

      // Click event will propagate as card click and participant's view modal will open
    },

    async updateQuestion(id, updates) {
      try {
        const previousQuestion = { ...JSON.parse(JSON.stringify(this.question)) };
        const question = Question({ ...previousQuestion });

        updates?.forEach((value, key) => {
          question[key] = value;
        });

        const { success } = await this.$store.dispatch('contentEditor/updateQuestion', { id, question });
        if (!success) {
          throw new Error('Cannot update question. Please try again.');
        }
      } catch (error) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while updating question!'),
        });
      }
    },

    async onShowYourWorkClick(newVal) {
      const structure = { ...JSON.parse(JSON.stringify(this.question.structure)) };
      structure.settings.canSubmitCustomResponse = newVal;
      await this.updateQuestion(this.question._id, { structure });
    },

    getUUID() {
      return getUUID();
    },

    notationForBlank(optionId, optionIndex) {
      const numerals = ['a', 'b', 'c', 'd', 'e'];
      const answerForOptionId = Object.keys(this.answer[optionId] ?? {});

      if (answerForOptionId.length === 0) {
        return '';
      }

      const orderOfCorrectBlank = this.orderOfBlankId[answerForOptionId[optionIndex] ?? answerForOptionId[0]];

      return numerals[orderOfCorrectBlank];
    },

    onCloseClick() {
      this.showPopUp = false;
      LocalStorage.removeItem('isStandardTagButton');
    },

    showSnackbar() {
      this.$snackbars.add({
        ...this.question,
        changedTimeTitle: this.$i18n('Timer changed to {$1} for this question', [this.getTimeTitle]),
      });
    },

    showPointsSnackbar() {
      this.$snackbars.add({
        ...this.question,
        changedPointsTitle: this.$i18n('Points changed to {$1} for this question', [this.getCorrectPointsTitle]),
        pointsUpdate: true,
        points: this.correctPoints,
      });
    },

    getBgImageUrl(url) {
      return `${url}?w=4000&h=400`;
    },

    selectedAutoConvertQuestionType(question) {
      let selectedQuestionType = get(question, 'type');

      if (isEmpty(selectedQuestionType)) {
        selectedQuestionType = this.$constants.QuestionTypes.MCQ;
      }

      if (this.isPollTypeQuestion) {
        selectedQuestionType = this.$constants.QuestionTypes.POLL;
      }

      return selectedQuestionType;
    },

    autoConvertQuestionTypeIconComponent(question) {
      const questionType = this.selectedAutoConvertQuestionType(question);
      return {
        render() {
          return hydrate(QuestionTypeIcon, {
            radius: 'sm',
            type: questionType,
            size: 12,
            withBgBox: false,
          });
        },
      };
    },

    autoConvertDropdownOptionClick(autoConvertVariant, callback) {
      this.$analytics.logEvent(this.$webEvents.AUTO_CONVERT_QUIZ_PAGE_DROPDOWN_QUESTION_TYPE_SELECTED, {
        quizId: this.quizId,
        convertedTo: autoConvertVariant.type,
        convertedFrom: this.question.type,
      });

      this.$emit('autoConvertVariantUpdated', autoConvertVariant);

      callback();
    },

    autoConvertLozengeTitle(questionType, noIndex = false) {
      if (this.isPollTypeQuestion) {
        return this.questionTypes[this.$constants.QuestionTypes.POLL]?.title;
      }
      if (this.showIndexWithType) {
        if (noIndex) {
          return `${this.questionTypes[questionType]?.title}`;
        }
        return `${this.questionIndex + 1}. ${this.questionTypes[questionType]?.title}`;
      }
      return this.questionTypes[questionType]?.title;
    },

    handleDropdownClick(event) {
      this.$analytics.logEvent(this.$webEvents.AUTO_CONVERT_QUIZ_PAGE_DROPDOWN_CLICK, {
        quizId: this.quizId,
      });

      event?.stopPropagation();
    },

    optionOrder(optionIndex) {
      if (!this.answer) {
        return optionIndex;
      }
      return this.answer.indexOf(optionIndex) + 1;
    },

    getPointsListText(points) {
      // Could have defined in a single variable but code is more readable this way
      const singlePointTitle = this.$i18n('point');
      const multiPointsTitle = this.$i18n('points');
      if (points === 0) {
        return this.$i18n('Ungraded (0 points)');
      }
      return `${points} ${points === 1 ? singlePointTitle : multiPointsTitle}`;
    },

    onPointsSelection(points, closeDropdown) {
      this.$analytics.logEvent('question_marks_updated', {
        quizId: this.quizId,
        questionId: this.question._id,
      });

      if (this.selectedCorrectPoints === points) {
        if (closeDropdown) {
          closeDropdown();
        }
        return;
      }

      this.correctPoints = points;
      this.isUpdatePointsInProgress = true;

      // const doneCallback = () => {
      //   this.toggleChangePointsForAllQuestionsBtn();
      // };

      const endProgress = () => {
        this.isUpdatePointsInProgress = false;
      };

      // this.changePointsForAllQuestionsBtn.isDone = false;
      // this.toggleChangePointsForAllQuestionsTimer && clearTimeout(this.toggleChangePointsForAllQuestionsTimer);

      this.$emit('questionMarksUpdated', this.question._id, this.correctPoints, endProgress);
      if (closeDropdown) {
        closeDropdown();
      }
    },

    openTopicTagModal() {
      if (!hasFeatureAccess(this.$constants.FeatureTypes.TOPIC_TAGS) && !this.isCorporateUser) {
        this.$eventBus.$emit('sndUpsell:open', {
          feat: this.$constants.FeatureTypes.TOPIC_TAGS,
          media: {
            img: 'https://cf.quizizz.com/img/presentation/standards_overview.gif',
          },
        });
        return;
      }

      this.$analytics.logEvent('question_Tag_Button', { questionId: this.question._id });

      // this.$emit('openTopicTagModal', this.question._id);
      this.$eventBus.$emit('questionToolbar:openTopicTagModal', this.question._id);
    },

    onQuickTagClick(standardTag) {
      // eslint-disable-next-line no-param-reassign
      standardTag.id = this.question._id;
      this.loading = true;
      const endLoading = () => {
        this.loading = false;
      };
      this.$eventBus.$emit('questionToolbar:onQuickTagClick', standardTag, endLoading);
    },

    onDragButtonClicked() {
      if (!this.isCurrentStateReorder) {
        this.$emit('changeCurrentState', 'reorder');
      }
    },

    onTimeSelected(time) {
      this.isUpdateTimeInProgress = true;
      if (time === this.selectedTime) {
        this.isUpdateTimeInProgress = false;
        return;
      }

      const doneCallback = () => {
        this.toggleChangeTimeForAllQuestionsBtn();
      };

      const endProgress = () => {
        this.isUpdateTimeInProgress = false;
      };

      if (this.toggleChangeTimeForAllQuestionsTimer) {
        clearTimeout(this.toggleChangeTimeForAllQuestionsTimer);
      }
      this.changeTimeForAllQuestionsBtn.isDone = false;

      const eventName = this.$webEvents.EDITOR_QUESTION_TIME_CHANGE;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
        questionId: this.question._id,
        questionType: this.selectedQuestionType,
        isQuestionPremium: this.isQuestionTypeSuperType(this.selectedQuestionType),
      });
      this.$emit('questionTimeUpdated', this.question._id, time, doneCallback, endProgress);
    },

    hasMath(text) {
      return (text.toLowerCase().includes('<katex'));
    },

    getMediumTimeTitle(time) {
      const inSecs = time / 1000;
      const inMinutes = inSecs / 60;

      if (inMinutes >= 1) {
        return `${inMinutes} ${this.$i18n('min')}`;
      }

      return `${inSecs} ${this.$i18n('sec')}`;
    },

    getHtmlToRender(text) {
      let parsedString = text;

      if (parsedString.includes('<blank')) {
        parsedString = replaceBlankWithStyledSpan(text);
      }

      if (this.hasMath(parsedString)) {
        return this.katex && typeof this.katex.renderToString === 'function' ? getHtmlWithMathKatexString(parsedString, this.katex) : '';
      }

      /** In case white text color is applied it wont be seen on the tile */
      const regex = /color: white/g;
      const html = parsedString.replace(regex, 'color: #222');
      return html;
    },

    getParsedQuestionTitle(text) {
      return this.getHtmlToRender(text, true);
    },

    getParsedOptionText(option) {
      return this.getHtmlToRender(option.text, false);
    },

    setAddButtonType(type) {
      this.addButtonType = type;
    },

    addQuestion(el) {
      if (this.$refs.addQuestionTooltipButton && this.questionIndex === 1) {
        this.$refs.addQuestionTooltipButton.style.width = 'auto';
      }
      if (this.isLoading || this.isAddingTeleportInProgress) { return; }

      if (this.isQuizLocked) {
        const upsellParams = { type: this.$constants.SuperUpsellTypes.PREMIUM_CONTENT, options: { feat: 'premiumContent-teleport', variant: 'teleport' } };
        if (this.canPromoteReferral) {
          return this.$eventBus.$emit('superUpsellReferral:show', upsellParams);
        }
        return this.$eventBus.$emit('superUpsell:show', upsellParams);
      }

      const copy = cloneDeep(this.question);
      ensureSlideV2(copy);
      this.$emit('addQuestion', { question: copy, addButtonRef: el.target });
    },

    getOptionMedia(option) {
      return get(option, 'media[0]', {});
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

    optionBgColorClass(index, optionId = '') {
      if (this.shouldShowAnswers) {
        if (this.isPollTypeQuestion) {
          return this.isLoading ? 'bg-blue-faded' : 'bg-blue';
        }

        if (this.isMCQTypeQuestion || this.isMSQTypeQuestion || this.isInteractiveBlankTypeQuestion || this.isDndOnImageQuestion) {
          if (this.isCorrectOption(index, optionId)) {
            return this.isLoading ? 'bg-green-faded' : 'bg-green';
          }

          if (this.isCurrentPageShowingResponses) {
            return this.response?.response === index ? 'bg-red' : 'bg-dark-4';
          }

          return this.isLoading ? 'bg-red-faded' : 'bg-red';
        }
      }

      return 'bg-dark-6';
    },

    isCorrectOption(optionIndex, optionId = '') {
      if (this.isInteractiveBlankTypeQuestion) {
        return Object.keys(this.answer[optionId] ?? {}).length > 0;
      }

      if (this.isDndOnImageQuestion) {
        return !!this.answer.find((answer) => answer.optionId[0] === optionId);
      }

      if (Array.isArray(this.answer)) {
        return includes(this.answer, Number(optionIndex));
      }

      return Number(this.answer) === Number(optionIndex);
    },

    doesOptionHaveText(option) {
      return option && (option.text !== '' || option.hasMath);
    },

    onEditQuestionClick() {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'QC:Edit');
      this.$emit('questionEdited');
    },

    onDuplicateQuestionClick() {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'QC:Copy');
      if (this.isQuestionLimitReached) {
        this.toggleQuestionLimitModal();
        return;
      }
      const doneCallback = () => {
        this.isDuplicationInProgress = false;
      };

      this.isDuplicationInProgress = true;
      this.$emit('questionDuplicated', this.question._id, doneCallback);
    },

    onDeleteQuestionClick() {
      this.$store.dispatch('analyticsManager/addBreadcrumb', 'QC:Del');
      if (this.isCurrentPageCartPreview) {
        this.$emit('deleteQuestion', this.questionIndex);
        return;
      }
      const doneCallback = () => {
        this.$nextTick(() => {
          this.isDeletionInProgress = false;
        });
      };

      this.isDeletionInProgress = true;
      const eventName = this.$webEvents.DELETE_QUESTION;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
        questionId: this.question._id,
        questionType: this.selectedQuestionType,
        isQuestionPremium: this.isQuestionTypeSuperType(this.selectedQuestionType),
        action: 'user',
      });
      this.$emit('questionDeleted', this.question._id, doneCallback);
    },

    toggleChangeTimeForAllQuestionsBtn() {
      this.changeTimeForAllQuestionsBtn.isVisible = true;
      this.showSnackbar();
      this.toggleChangeTimeForAllQuestionsTimer = setTimeout(() => {
        this.changeTimeForAllQuestionsBtn.isVisible = false;
      }, 4000);
    },

    toggleChangePointsForAllQuestionsBtn() {
      this.changePointsForAllQuestionsBtn.isVisible = true;
      this.showPointsSnackbar();
      this.toggleChangePointsForAllQuestionsTimer = setTimeout(() => {
        this.changePointsForAllQuestionsBtn.isVisible = false;
      }, 4000);
    },

    applyTimingToAllQuestions() {
      if (!this.changeTimeForAllQuestionsBtn.isVisible
      || this.changeTimeForAllQuestionsBtn.isLoading
      || this.changeTimeForAllQuestionsBtn.isDone) {
        return;
      }

      const doneCallback = async () => {
        if (!this.changeTimeForAllQuestionsBtn.isVisible) {
          return;
        }

        this.changeTimeForAllQuestionsBtn.isDone = true;
        this.changeTimeForAllQuestionsBtn.isLoading = false;

        await asyncDelay(3000);

        this.changeTimeForAllQuestionsBtn.isVisible = false;
        this.changeTimeForAllQuestionsBtn.isDone = false;
      };

      this.changeTimeForAllQuestionsBtn.isLoading = true;
      if (this.toggleChangeTimeForAllQuestionsTimer) {
        clearTimeout(this.toggleChangeTimeForAllQuestionsTimer);
      }

      const eventName = this.$webEvents.EDITOR_QUESTION_TIME_CHANGE_ALL;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
      });
      this.$emit('applyTimeToAllQuestions', this.question._id, doneCallback);
    },

    toggleQuestionLimitModal() {
      this.$emit('toggleQuestionLimitModal');
    },

    isQuestionTypeSuperType(questionType) {
      return isQuestionTypeSuperType(questionType);
    },

    isAudioOrVideoQuestion() {
      const { media } = this.question.structure.query;
      if (media.filter((m) => m.type === 'audio' || m.type === 'video').length) {
        return true;
      }
      return false;
    },

    isAudioVideoExplanationsUsed() {
      const type = this.question.structure?.explain?.type;
      if (['audio', 'video'].includes(type)) {
        return true;
      }
      return false;
    },

    getAlphabetNotationForIndex(index, inCaps = true) {
      const conversionFactor = inCaps ? 65 : 97;
      return String.fromCharCode(conversionFactor + index);
    },

    questionOptionsGroupTitle(optionGroupIndex, optionGroup) {
      return `(${this.getAlphabetNotationForIndex(optionGroupIndex, false)}) ${optionGroup.name} ${(optionGroupIndex < this.questionOptionGroups.length - 1) ? ', ' : ''}`;
    },

    openAutoConvertModal({ fromPreview = false } = {}) {
      const buttonSource = fromPreview ? 'quiz_details_card' : 'quiz_details';

      this.$analytics.logEvent('auto_convert_v2_button_clicked', {
        quizId: this.quizId,
        questionId: this.question._id,
        is_paid_user: this.isBasicUser,
        is_new_to_auto_convert: fromPreview,
        button_source: this.shouldShowReorderToolbar ? 'quiz_editor' : buttonSource,
      });

      if (this.isBasicUser) {
        // trigger save to show the upsell
        this.$emit('saveChanges');
        return;
      }

      this.$eventBus.$emit('autoConvertModal:show', this.question, fromPreview);
    },

    hideAutoConvertPreview() {
      this.$analytics.logEvent('auto_convert_v2_donot_show_again_clicked', {
        quizId: this.quizId,
        questionId: this.question._id,
        is_paid_user: true,
        is_new_to_auto_convert: 1,
      });

      this.dontShowAutoConvertPreview = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.question-details-card {
  .show-on-hover {
    opacity: 0;
  }

  &:hover {
    .show-on-hover {
      opacity: 100;
    }
  }
}

.drag-button {
  &.reorder {
    cursor: grab;
  }
}

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

.answer-explanation-text {
  @apply break-words;
  word-break: break-word;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }

  10% {
    transform: rotate(16deg);
  }

  20% {
    transform: rotate(-6deg);
  }

  30% {
    transform: rotate(16deg);
  }

  40% {
    transform: rotate(-4deg);
  }

  50% {
    transform: rotate(16deg);
  }

  60% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

.waving-hand {
  animation: wave 2.1s 0.6s infinite;
  transform-origin: 75% 75%;
}

.no-style-katex {
  .katex-html {
    padding: 0 !important;
  }
}

.option-cell {
  .katex-display {
    max-width: 300px;
  }
}

.learn-more-btn {
  bottom: -20px;
  right: -192px
}

.question-wrapper {
  p:first-of-type {
    &::before {
      content: "Q. ";
    }
  }
}
</style>
